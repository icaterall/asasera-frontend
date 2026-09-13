import {useMemo,useState} from 'react'
import {useQuery} from '@tanstack/react-query'
import {useTranslation} from 'react-i18next'
import {CircleAlert,X} from 'lucide-react'

import {Button,FailureState,LoadingState} from '@/design'
import {useAuth} from '@/hooks/useAuth'
import {adminAiUsage} from './api'
import styles from './Admin.module.css'

/**
 * Where the AI money went.
 *
 * Four questions, in the order an operator actually asks them: how much, who,
 * on what, and with which model. The tables are the answer; the day series is
 * there only to say WHEN, which a table of thirty rows cannot show at a glance.
 *
 * TWO AMOUNTS, NEVER MERGED. `cost` is what the provider billed us — it is
 * recorded even for a job that delivered nothing, because that money left
 * regardless. `settled` is what the teacher was charged, which is nothing when
 * a job fails. Showing one number would answer "did we spend" or "did we earn"
 * but never "are we charging enough", so both are present and the day chart
 * plots cost, the figure that is true whatever happened.
 *
 * CHOOSING A TEACHER IS A CLICK ON THEIR ROW. A separate search box would be a
 * second way to name someone the page is already listing, and the operator
 * arrives wanting to know who spent most — not already knowing whom to look up.
 */

type Range={key:string;from?:string;to?:string}
const iso=(d:Date)=>d.toISOString().slice(0,10)
const daysAgo=(n:number)=>{const d=new Date();d.setDate(d.getDate()-n);return iso(d)}

export default function AdminAiUsage(){
 const {i18n}=useTranslation(),{user}=useAuth(),ar=i18n.language.startsWith('ar')
 const t=(arabic:string,english:string)=>ar?arabic:english
 const [range,setRange]=useState<Range>({key:'all'})
 const [teacher,setTeacher]=useState<{id:number;label:string}|null>(null)

 const params=useMemo(()=>({...(range.from?{from:range.from}:{}),...(range.to?{to:range.to}:{}),...(teacher?{userId:teacher.id}:{})}),[range,teacher])
 const query=useQuery({queryKey:['admin-ai-usage',params],queryFn:({signal})=>adminAiUsage.load(params,signal),retry:1,enabled:user?.role==='admin'})

 const money=(millicents:number)=>new Intl.NumberFormat(i18n.language,{style:'currency',currency:'USD',minimumFractionDigits:2,maximumFractionDigits:5}).format(millicents/100000)
 const number=(value:number)=>new Intl.NumberFormat(i18n.language).format(value)
 const when=(value:string|null)=>value?new Intl.DateTimeFormat(i18n.language,{dateStyle:'short',timeStyle:'short'}).format(new Date(value)):'—'
 const taskName=(task:string)=>({questions:t('توليد الأسئلة','Question generation'),reasons:t('أسباب الأخطاء','Wrong-answer reasons'),zones:t('مناطق الصور','Image areas'),image:t('توليد الصور','Image creation'),merges:t('دمج التصنيفات','Label merges'),lesson:t('دروس (متقاعد)','Lessons (retired)')} as Record<string,string>)[task]??task

 const ranges:Range[]=[{key:'all'},{key:'today',from:iso(new Date())},{key:'7',from:daysAgo(6)},{key:'30',from:daysAgo(29)},{key:'90',from:daysAgo(89)}]
 const rangeLabel=(key:string)=>({all:t('كل الوقت','All time'),today:t('اليوم','Today'),'7':t('٧ أيام','7 days'),'30':t('٣٠ يومًا','30 days'),'90':t('٩٠ يومًا','90 days')} as Record<string,string>)[key]??key

 if(user?.role!=='admin')return null

 const data=query.data
 /* One scale for every proportional bar on the page, so a row in the model
    table and a row in the teacher table mean the same width. */
 const peak=(rows:{costMillicents:number}[])=>Math.max(1,...rows.map(r=>r.costMillicents))

 return <>
  <header className={styles.pageHead}>
   <div>
    <h1>{t('استهلاك الذكاء الاصطناعي','AI usage')}</h1>
    <p>{t('من أنفق، على ماذا، وبأي نموذج.','Who spent, on what, and with which model.')}</p>
   </div>
  </header>

  <div className={styles.filterBar} role="group" aria-label={t('نطاق التحليل','Analysis scope')}>
   {ranges.map(option=><button key={option.key} type="button" aria-pressed={range.key===option.key}
     className={styles.filterChip} onClick={()=>setRange(option)}>{rangeLabel(option.key)}</button>)}
   <label className={styles.filterDate}>{t('من','From')}
    <input type="date" value={range.from??''} max={range.to??iso(new Date())}
      onChange={event=>setRange(current=>({key:'custom',...(event.target.value?{from:event.target.value}:{}),...(current.to?{to:current.to}:{})}))}/>
   </label>
   <label className={styles.filterDate}>{t('إلى','To')}
    <input type="date" value={range.to??''} min={range.from??''} max={iso(new Date())}
      onChange={event=>setRange(current=>({key:'custom',...(current.from?{from:current.from}:{}),...(event.target.value?{to:event.target.value}:{})}))}/>
   </label>
   {teacher&&<button type="button" className={styles.filterActive} onClick={()=>setTeacher(null)}>
     {teacher.label}<X size={15} aria-hidden="true"/><span className={styles.srOnly}>{t('أزل تصفية المدرّس','Clear teacher filter')}</span>
   </button>}
  </div>

  {query.isPending&&<LoadingState label={t('جارٍ تحميل الاستهلاك','Loading usage')} variant="form" rows={5}/>}
  {query.error&&<FailureState title={t('تعذّر تحميل الاستهلاك','Usage could not load')} actions={<Button onClick={()=>void query.refetch()}>{t('إعادة المحاولة','Try again')}</Button>}/>}

  {data&&<>
   <dl className={styles.metricGrid}>
    <Metric label={t('تكلفة المزوّد','Provider cost')} value={money(data.totals.costMillicents)} detail={t('ما دفعناه فعلًا، بما في ذلك المهام الفاشلة.','What we actually paid, failed jobs included.')}/>
    <Metric label={t('المحتسب على المدرّسين','Charged to teachers')} value={money(data.totals.settledMillicents)} detail={t('لا يُحتسب شيء على مهمة فاشلة.','A failed job charges nothing.')}/>
    <Metric label={t('المهام','Jobs')} value={number(data.totals.jobs)} detail={t(`${number(data.totals.failed)} فشلت · ${number(data.totals.teachers)} مدرّسًا`,`${number(data.totals.failed)} failed · ${number(data.totals.teachers)} teachers`)}/>
    <Metric label={t('الرموز','Tokens')} value={number(data.totals.inputTokens+data.totals.outputTokens)} detail={t(`${number(data.totals.inputTokens)} دخل · ${number(data.totals.outputTokens)} خرج`,`${number(data.totals.inputTokens)} in · ${number(data.totals.outputTokens)} out`)}/>
   </dl>

   {data.totals.needsReview>0&&<p className={styles.warning}><CircleAlert size={18} aria-hidden="true"/>
    {t(`${number(data.totals.needsReview)} مهمة محجوزة بانتظار قرار تشغيلي — ${money(data.totals.heldMillicents)} ما زالت محجوزة.`,`${number(data.totals.needsReview)} jobs are held awaiting an operator decision — ${money(data.totals.heldMillicents)} is still reserved.`)}</p>}

   {data.daily.length>1&&(()=>{
    const peakDay=Math.max(...data.daily.map(d=>d.costMillicents),1)
    const labelStride=Math.max(1,Math.ceil(data.daily.length/12))
    return <section className={styles.chartCard} aria-label={t('التكلفة اليومية','Daily cost')}>
    <h2>{t('تكلفة المزوّد يوميًا','Provider cost by day')}</h2>
    {/* One series, one hue: a magnitude over time needs no legend and no second
        colour, and the exact figures live in the table below rather than as a
        number printed on every bar. */}
    <ol className={styles.dayChart}>{data.daily.map((day,i)=>
      /* Selective labels. A ninety-day range has ninety slots about fourteen
         pixels wide and a date needs thirty, so labelling every bar produces an
         unreadable smear. Roughly twelve labels, with the last day always one
         of them, keeps the axis legible at any range length. */
      <li key={day.date}>
       <span className={styles.dayBar} style={{blockSize:`${Math.max(2,Math.round((day.costMillicents/peakDay)*100))}%`}}
         title={`${day.date} · ${money(day.costMillicents)} · ${number(day.jobs)}`}/>
       <small>{(data.daily.length-1-i)%labelStride===0?day.date.slice(5):'\u00a0'}</small>
      </li>
    )}</ol>
   </section>
   })()}

   <Panel title={t('من أنفق','Who spent')} empty={!data.byTeacher.length} emptyText={t('لا استهلاك في هذا النطاق.','No usage in this range.')}>
    <table className={styles.table}><thead><tr>
     <th>{t('المدرّس','Teacher')}</th><th>{t('المهام','Jobs')}</th><th>{t('تكلفة المزوّد','Provider cost')}</th><th>{t('المحتسب','Charged')}</th><th>{t('آخر استخدام','Last used')}</th>
    </tr></thead><tbody>{data.byTeacher.map(row=>{
     const scale=peak(data.byTeacher)
     return <tr key={row.userId} className={styles.clickRow} onClick={()=>setTeacher({id:row.userId,label:row.name??row.email??`#${row.userId}`})}>
      <td><strong>{row.name??t('بلا اسم','No name')}</strong><span>{row.email??`#${row.userId}`}</span></td>
      <td>{number(row.jobs)}{row.failed>0&&<span>{t(`${number(row.failed)} فشلت`,`${number(row.failed)} failed`)}</span>}</td>
      <td><strong>{money(row.costMillicents)}</strong><i className={styles.rowBar} style={{inlineSize:`${Math.round((row.costMillicents/scale)*100)}%`}} aria-hidden="true"/></td>
      <td>{money(row.settledMillicents)}</td>
      <td>{when(row.lastAt)}</td>
     </tr>
    })}</tbody></table>
   </Panel>

   <Panel title={t('على ماذا أنفق','What it was spent on')} empty={!data.byTask.length} emptyText={t('لا استهلاك في هذا النطاق.','No usage in this range.')}>
    <table className={styles.table}><thead><tr>
     <th>{t('المهمة','Task')}</th><th>{t('العدد','Jobs')}</th><th>{t('تكلفة المزوّد','Provider cost')}</th><th>{t('المحتسب','Charged')}</th>
    </tr></thead><tbody>{data.byTask.map(row=>{
     const scale=peak(data.byTask)
     return <tr key={row.task}>
      <td><strong>{taskName(row.task)}</strong></td>
      <td>{number(row.jobs)}{row.failed>0&&<span>{t(`${number(row.failed)} فشلت`,`${number(row.failed)} failed`)}</span>}</td>
      <td><strong>{money(row.costMillicents)}</strong><i className={styles.rowBar} style={{inlineSize:`${Math.round((row.costMillicents/scale)*100)}%`}} aria-hidden="true"/></td>
      <td>{money(row.settledMillicents)}</td>
     </tr>
    })}</tbody></table>
   </Panel>

   <Panel title={t('النماذج المستخدمة','Models used')} empty={!data.byModel.length} emptyText={t('لا استهلاك في هذا النطاق.','No usage in this range.')}>
    <table className={styles.table}><thead><tr>
     <th>{t('النموذج','Model')}</th><th>{t('المهام','Jobs')}</th><th>{t('تكلفة المزوّد','Provider cost')}</th><th>{t('الرموز','Tokens')}</th><th>{t('متوسط الزمن','Avg latency')}</th>
    </tr></thead><tbody>{data.byModel.map(row=>{
     const scale=peak(data.byModel)
     return <tr key={`${row.provider}:${row.model}`}>
      <td><strong>{row.model}</strong><span>{row.provider}</span></td>
      <td>{number(row.jobs)}{row.failed>0&&<span>{t(`${number(row.failed)} فشلت`,`${number(row.failed)} failed`)}</span>}</td>
      <td><strong>{money(row.costMillicents)}</strong><i className={styles.rowBar} style={{inlineSize:`${Math.round((row.costMillicents/scale)*100)}%`}} aria-hidden="true"/></td>
      <td>{number(row.inputTokens+row.outputTokens)}<span>{t(`${number(row.inputTokens)} دخل · ${number(row.outputTokens)} خرج`,`${number(row.inputTokens)} in · ${number(row.outputTokens)} out`)}</span></td>
      <td>{row.latencyMs?`${number(Math.round(row.latencyMs/100)/10)}s`:'—'}</td>
     </tr>
    })}</tbody></table>
   </Panel>

   <Panel title={t('أحدث المهام','Most recent jobs')} empty={!data.recent.length} emptyText={t('لا استهلاك في هذا النطاق.','No usage in this range.')}>
    <table className={styles.table}><thead><tr>
     <th>{t('الوقت','When')}</th><th>{t('المدرّس','Teacher')}</th><th>{t('المهمة','Task')}</th><th>{t('النموذج','Model')}</th><th>{t('الحالة','State')}</th><th>{t('التكلفة','Cost')}</th>
    </tr></thead><tbody>{data.recent.map((row,index)=><tr key={`${row.createdAt}:${index}`}>
      <td>{when(row.createdAt)}</td>
      <td><strong>{row.name??row.email??`#${row.userId}`}</strong></td>
      <td>{taskName(row.task)}</td>
      <td>{row.model}<span>{row.provider}</span></td>
      <td>{row.state}{row.errorCode&&<span>{row.errorCode}</span>}</td>
      <td>{money(row.costMillicents)}</td>
     </tr>)}</tbody></table>
   </Panel>
  </>}
 </>
}

function Metric({label,value,detail}:{label:string;value:string;detail?:string}){
 return <div className={styles.metric}><dt>{label}</dt><dd>{value}</dd>{detail&&<small>{detail}</small>}</div>
}
function Panel({title,children,empty,emptyText}:{title:string;children:React.ReactNode;empty:boolean;emptyText:string}){
 return <section className={styles.usagePanel}>
  <h2>{title}</h2>
  {empty?<p className={styles.muted}>{emptyText}</p>:<div className={styles.tableWrap}>{children}</div>}
 </section>
}
