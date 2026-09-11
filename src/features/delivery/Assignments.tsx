import {useState} from 'react'
import {Link} from 'react-router-dom'
import {useQuery} from '@tanstack/react-query'
import {useTranslation} from 'react-i18next'
import {api} from '@/lib/api'
import {Button,LoadingState,FailureState,Dialog} from '@/design'
import {assignmentUrl} from './DeliverySetup'
import styles from './Delivery.module.css'
/* v5.1 C2: the list shows the window the SERVER computed — its state, its zone, and the opening time
   when there is one — so a teacher never has to work out what "17:00" meant on someone else's clock. */
type Assignment={id:string;mode:string;title:string;deadline:string;opensAt:string|null;deadlineTz:string;maxAttempts:number;windowState:'scheduled'|'open'|'closed';closedAt:string|null;runId:number;attempts:number;submitted:number;versionId:number}
export default function Assignments(){
 const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),t=(a:string,e:string)=>ar?a:e
 const [error,setError]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false),[closing,setClosing]=useState<Assignment|null>(null),[manual,setManual]=useState('')
 const data=useQuery({queryKey:['assignments'],queryFn:()=>api.get<{assignments:Assignment[]}>('/api/v1/delivery/assignments'),refetchInterval:15000})
 const work=async(fn:()=>Promise<void>)=>{setBusy(true);setError('');setNotice('');try{await fn()}catch(e){setError(e instanceof Error?e.message:t('تعذّر تنفيذ الطلب','Request failed'))}finally{setBusy(false)}}
 const locale=ar?'ar':'en'
 const inZone=(instant:string,tz:string)=>new Intl.DateTimeFormat(locale,{timeZone:tz,dateStyle:'medium',timeStyle:'short'}).format(new Date(instant))
 const state=(a:Assignment)=>a.windowState==='closed'?t('مغلق','Closed'):a.windowState==='scheduled'?t('لم يفتح بعد','Not open yet'):t('متاح','Open')
 return <section className={`asas ${styles.setup}`}><header><h1>{t('الواجبات والتعلّم الذاتي','Homework and self-study')}</h1><p>{t('تابع التسليمات، وشارك الرابط أو أغلق النشاط لعرض تقريره.','Track submissions, share a link, or close an assignment to view its report.')}</p><Link to="/teacher/activities">{t('اختر نشاطًا','Choose an activity')}</Link></header>
  {error&&<p role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}{manual&&<input aria-label={t('رابط المشاركة','Share link')} value={manual} readOnly dir="ltr" onFocus={e=>e.target.select()}/>}
  {data.isPending?<LoadingState/>:data.error?<FailureState title={t('تعذّر تحميل الواجبات','Assignments unavailable')} body={data.error.message} actions={<Button onClick={()=>void data.refetch()}>{t('أعد المحاولة','Retry')}</Button>}/>:data.data.assignments.length?data.data.assignments.map(a=><article className={styles.assignment} key={a.id}><h2>{a.title}</h2><p data-window="">{a.mode==='study'?t('تعلّم ذاتي','Self-study'):t('واجب','Homework')} · {state(a)}{a.opensAt?<> · {t('يفتح','Opens')} <bdi>{inZone(a.opensAt,a.deadlineTz)}</bdi></>:null} · {t('ينتهي','Closes')} <bdi>{inZone(a.deadline,a.deadlineTz)}</bdi> · <bdi dir="ltr">{a.deadlineTz.replace(/_/g,' ')}</bdi>{a.maxAttempts>1?` · ${t(`${a.maxAttempts} محاولات`,`${a.maxAttempts} attempts`)}`:''}</p><p>{t(`${a.submitted} تسليمات من ${a.attempts} مشاركين`,`${a.submitted} submitted of ${a.attempts} participants`)}</p><div className={styles.actions}>{a.closedAt?<Link to={`/teacher/reports/runs/${a.runId}`}>{t('عرض التقرير','View report')}</Link>:<><Link to={`/teacher/reports/runs/${a.runId}`}>{t('عرض التقدّم','View progress')}</Link><Button disabled={busy} onClick={()=>void work(async()=>{const r=await api.get<{id:string;accessToken:string}>(`/api/v1/delivery/assignments/${a.id}/link`),url=assignmentUrl(r.id,r.accessToken);try{await navigator.clipboard.writeText(url);setNotice(t('تم نسخ الرابط','Link copied'))}catch{setManual(url)}})}>{t('انسخ الرابط','Copy link')}</Button><Button disabled={busy} onClick={()=>setClosing(a)}>{t('أغلق النشاط','Close assignment')}</Button></>}</div></article>):<p>{t('ابدأ من نشاط معتمد، ثم اختر واجبًا أو تعلّمًا ذاتيًا.','Open an approved activity, then choose homework or self-study.')}</p>}
  <Dialog open={!!closing} onClose={()=>setClosing(null)} title={t('إغلاق النشاط الآن؟','Close this assignment now?')}><p>{t('يتوقف استقبال الإجابات وتظهر التغذية الراجعة للمشاركين.','New answers will stop and feedback will become available to participants.')}</p><Button variant="primary" loading={busy} onClick={()=>void work(async()=>{await api.post(`/api/v1/delivery/assignments/${closing!.id}/close`);setClosing(null);await data.refetch()})}>{t('أغلق واعرض النتائج','Close and release feedback')}</Button></Dialog>
 </section>
}
