import {LabelReview} from './LabelReview'
import {useEffect,useId,useRef,useState} from 'react'
import {useQuery} from '@tanstack/react-query'
import {useTranslation} from 'react-i18next'
import {X,Sparkles,FileText,Check} from 'lucide-react'
import {api,teaching,type ActivityRecord,type QuestionRecord} from '@/lib/api'
import {Button, Select } from '@/design'
import {type GenerationTask} from '@/shared/generation'
import {useImage} from './ImageUpload'
import styles from './GenerationPanel.module.css'

type Candidate={prompt?:string;kind?:string;payloadJson?:string;reasons?:{elementKey:string;reason:string}[];sourceSegments?:number[];key?:string;x?:number;y?:number;w?:number;h?:number;elementKey?:string;wrongTargetKey?:string|null;reason?:string;sourceId?:number;targetId?:number}
type Job={id:number;activityId:number;task:GenerationTask;state:string;imageKey:string|null;questionId:number|null;settlementComplete:boolean;origin:string;maxAuthorizedMillicents:number;settledMillicents:number;errorCode:string|null;result:{candidates:Candidate[];appliedIndexes:number[];rejected:number;nextRevision:number}|null}
type Quote={maxAuthorizedMillicents:number;spendableMillicents:number;affordable:boolean;pricingAvailable:boolean;providerConfigured:boolean}
const usd=(value:number)=>`$${(value/100000).toFixed(3)}`
export function GenerationPanel({activity,question,onClose,onApplied}:{activity:ActivityRecord;question:QuestionRecord|null;onClose:()=>void;onApplied:()=>Promise<void>}){
 const dialogTitleId=useId()
 const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),t=(a:string,e:string)=>ar?a:e
 const dialog=useRef<HTMLDialogElement>(null)
 const [task,setTask]=useState<GenerationTask>('questions'),[origin,setOrigin]=useState<'topic'|'file'>('topic'),[objective,setObjective]=useState(''),[count,setCount]=useState(3),[replace,setReplace]=useState(false)
 const [kinds,setKinds]=useState(['mcq','tf']),[revisionId,setRevisionId]=useState<number|null>(null),[segments,setSegments]=useState<number[]>([])
 const [jobId,setJobId]=useState<number|null>(null),[selected,setSelected]=useState<number[]>([]),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[source,setSource]=useState<{index:number;text:string}|null>(null)
 const [requestKey,setRequestKey]=useState(()=>crypto.randomUUID()),[quoted,setQuoted]=useState<{input:string;value:Quote}|null>(null)
 useEffect(()=>{dialog.current?.showModal();return()=>dialog.current?.close()},[])
 const target=(task==='reasons'||task==='zones'||replace)?question:null
 const request={activityId:activity.id,task,origin:task==='questions'?origin:'topic',objective,language:ar?'ar':'en',count:task!=='questions'||replace?1:count,kinds,questionId:target?.id??null,expectedRevision:target?.revision??activity.revision,materialRevisionId:task==='questions'&&origin==='file'?revisionId:null,segments:task==='questions'&&origin==='file'?segments:[]}
 const requestText=JSON.stringify(request)
 useEffect(()=>{setQuoted(null);setRequestKey(crypto.randomUUID())},[requestText])
 const materials=useQuery({queryKey:['generation-materials'],queryFn:()=>teaching.materials(),enabled:origin==='file'&&task==='questions'})
 const pages=useQuery({queryKey:['generation-segments',revisionId],queryFn:()=>teaching.segments(revisionId!),enabled:!!revisionId&&origin==='file'})
 const jobs=useQuery({queryKey:['activity-generation',activity.id],queryFn:()=>api.get<{jobs:Job[]}>(`/api/v1/activity-generation/activities/${activity.id}`)})
 const active=useQuery({queryKey:['activity-generation-job',jobId],queryFn:()=>api.get<{job:Job}>(`/api/v1/activity-generation/jobs/${jobId}`),enabled:!!jobId,refetchInterval:q=>['queued','running'].includes(q.state.data?.job.state??'queued')?1500:false})
 const job=active.data?.job,result=job?.result
 const jobImage=useImage(job?.imageKey??null)
 const taskLabel=(value:string)=>({questions:t('أسئلة','Questions'),reasons:t('أسباب','Reasons'),zones:t('مناطق الصورة','Image regions'),merges:t('مراجعة التسميات','Label review')}[value]??value)
 const stateLabel=(value:string)=>({queued:t('في الانتظار','Queued'),running:t('قيد التحضير','Preparing'),succeeded:t('جاهز للمراجعة','Ready for review'),failed:t('لم يكتمل','Failed'),needs_review:t('يحتاج تحققًا','Needs review'),cancelled:t('أُلغي','Cancelled')}[value]??value)
 const act=async(work:()=>Promise<void>)=>{setBusy(true);setError('');setNotice('');try{await work()}catch(e){setError(e instanceof Error?e.message:t('تعذّر تنفيذ الطلب','The request failed'))}finally{setBusy(false)}}
 const toggle=(index:number)=>setSelected(current=>current.includes(index)?current.filter(x=>x!==index):[...current,index])
 return <dialog aria-labelledby={dialogTitleId} ref={dialog} className={`asas ${styles.dialog}`} onCancel={onClose}>
  <header><div><Sparkles/><h2 id={dialogTitleId}>{t('حضّر أسئلة بمساعدة الذكاء الاصطناعي','Prepare with AI')}</h2></div><button aria-label={t('إغلاق','Close')} onClick={onClose}><X/></button></header>
  <div className={styles.body}>
   <p>{t('راجع صحة المحتوى قبل إضافته. تبقى المقترحات مسودات حتى تختارها وتنشر النشاط.','Review accuracy before adding anything. Candidates remain drafts until you select them and publish the activity.')}</p>
   <div className={styles.form}>
    <label>{t('المهمة','Task')}<Select value={task} onValueChange={e=>{setTask(e as GenerationTask);setJobId(null);setSelected([])}}>
     <option value="questions">{t('توليد أسئلة','Generate questions')}</option><option value="reasons" disabled={!question}>{t('اقتراح أسباب الإجابات الخاطئة','Suggest distractor reasons')}</option><option value="zones" disabled={question?.kind!=='hotspot'}>{t('اقتراح مناطق الصورة','Suggest image regions')}</option><option value="merges">{t('مراجعة تسميات التصورات المتشابهة','Review similar misconception labels')}</option>
    </Select></label>
    {task==='questions'&&<><label>{t('من أين نبدأ؟','Starting point')}<Select value={origin} onValueChange={e=>setOrigin(e as 'topic'|'file')}><option value="topic">{t('موضوع ضمن مادة النشاط ومستواه','Topic within this subject and level')}</option><option value="file">{t('صفحات أو فقرات من ملفاتي','Pages or paragraphs from my sources')}</option></Select></label>
     {question&&<label className={styles.check}><input type="checkbox" checked={replace} onChange={e=>setReplace(e.target.checked)}/>{t('أعد توليد السؤال الحالي وحده؛ الاستبدال بعد اختياري','Regenerate this question only; replace after I accept')}</label>}
     {!replace&&<label>{t('عدد الأسئلة','Question count')}<input type="number" min={1} max={10} value={count} onChange={e=>setCount(Number(e.target.value))}/></label>}
     <fieldset><legend>{t('الأنواع','Types')}</legend>{[['mcq','اختيار من متعدد','Multiple choice'],['tf','صح / خطأ','True / false'],['order','ترتيب','Ordering'],['match','مطابقة','Matching']].map(([kind,a,e])=><label className={styles.check} key={kind}><input type="checkbox" checked={kinds.includes(kind!)} onChange={()=>setKinds(k=>k.includes(kind!)?k.filter(x=>x!==kind):[...k,kind!])}/>{t(a!,e!)}</label>)}</fieldset>
    </>}
    {task==='questions'&&origin==='file'&&<section className={styles.sources}><label>{t('المصدر','Source')}<Select value={revisionId??''} onValueChange={e=>{setRevisionId(Number(e)||null);setSegments([])}}><option value="">{t('اختر مصدرًا مقروءًا','Choose a readable source')}</option>{materials.data?.materials.map(m=><option value={m.revisionId??`unavailable:${m.id}`} disabled={!m.revisionId} key={m.id}>{m.title}</option>)}</Select></label>
     <a href="/teacher/materials" target="_blank" rel="noreferrer">{t('افتح ملفاتي لرفع PDF أو إضافة نص','Open my sources to upload a PDF or add text')}</a>
     <div className={styles.segmentList}>{pages.data?.segments.map(s=><label key={s.segmentIndex} className={styles.check}><input type="checkbox" checked={segments.includes(s.segmentIndex)} onChange={()=>setSegments(current=>current.includes(s.segmentIndex)?current.filter(n=>n!==s.segmentIndex):[...current,s.segmentIndex])}/><span>{s.pageIndex!==null?t(`صفحة ${s.pageIndex}`,`Page ${s.pageIndex}`):t(`فقرة ${s.segmentIndex}`,`Paragraph ${s.segmentIndex}`)} — {s.text.slice(0,180)}</span></label>)}</div>
    </section>}
    <label>{t('ما الذي تريد مراجعته أو تعليمه؟','What should learners practice?')}<textarea value={objective} onChange={e=>setObjective(e.target.value)} maxLength={1000} rows={3} placeholder={t('مثال: مقارنة الكسور ذات المقامات المتساوية','Example: compare fractions with the same denominator')}/></label>
   </div>
   {error&&<p role="alert" className={styles.error}>{error}</p>}{notice&&<p role="status" className={styles.notice}>{notice}</p>}
   <LabelReview activityId={activity.id} question={question} onChanged={onApplied} weeklyCap={task==='merges'&&quoted?.input===requestText&&quoted.value.pricingAvailable&&quoted.value.providerConfigured&&quoted.value.affordable?quoted.value.maxAuthorizedMillicents:undefined}/>
   <div className={styles.cost}>
    <Button disabled={busy||objective.trim().length<3||!kinds.length} onClick={()=>void act(async()=>{const value=await api.post<Quote>('/api/v1/activity-generation/quote',request);setQuoted({input:requestText,value})})}>{t('اعرض الحد الأقصى للتكلفة','Show the cost cap')}</Button>
    {quoted?.input===requestText&&<><p>{t('الحد الأقصى','Maximum')}: <strong dir="ltr">{usd(quoted.value.maxAuthorizedMillicents)}</strong> · {t('الرصيد المتاح','Available credit')}: <span dir="ltr">{usd(quoted.value.spendableMillicents)}</span></p>
     <small>{t('لا رسوم عند الفشل. النتيجة الجزئية تُحسب بنسبة عدد المقترحات الصالحة المستلمة، حتى قبل إضافتها.','No charge on failure. Partial delivery is charged by the proportion of valid candidates received, before insertion.')}</small>
     {!quoted.value.providerConfigured&&<p>{t('خدمة التوليد غير مهيأة في هذه البيئة. يمكنك متابعة التأليف يدويًا.','Generation is not configured here. You can continue editing manually.')}</p>}
     {!quoted.value.pricingAvailable&&<p>{t('لم تُعتمد أسعار التوليد في هذه البيئة بعد.','Generation pricing is not approved for this environment.')}</p>}
     {!quoted.value.affordable&&<a href="/teacher/tools">{t('افتح المحفظة للتحقق من الرصيد والترحيب','Open your wallet to check credit eligibility')}</a>}
     <Button variant="primary" disabled={busy||!quoted.value.affordable||!quoted.value.providerConfigured} onClick={()=>void act(async()=>{const r=await api.post<{job:Job}>('/api/v1/activity-generation/jobs',{...request,maxAuthorizedMillicents:quoted.value.maxAuthorizedMillicents,idempotencyKey:requestKey});setJobId(r.job.id);setSelected([]);await jobs.refetch()})}>{t('ابدأ ضمن هذا الحد','Generate within this cap')}</Button>
    </>}
   </div>
   {jobs.data?.jobs.length!==0&&<label>{t('العمليات السابقة','Previous jobs')}<Select value={jobId??''} onValueChange={e=>{setJobId(Number(e)||null);setSelected([]);setSource(null)}}><option value="">{t('اختر عملية لعرضها','Choose a job')}</option>{jobs.data?.jobs.map(j=><option key={j.id} value={j.id}>#{j.id} · {taskLabel(j.task)} · {stateLabel(j.id===job?.id?job.state:j.state)}</option>)}</Select></label>}
   {job&&<section className={styles.results} aria-live="polite"><h3>{t('المقترحات','Candidates')}</h3>
    {!!result?.rejected&&<p role="status">{t(`استُبعد ${result.rejected} من المقترحات لعدم اجتياز التحقق. راجع المقترحات المتاحة؛ تُحسب التكلفة على النتائج الصالحة فقط.`,`${result.rejected} candidate(s) did not pass validation. Review the available candidates; you are charged only for valid results.`)}</p>}

    {['queued','running'].includes(job.state)&&<><p>{t('جارٍ التحضير. يمكنك إغلاق النافذة والعودة للعملية لاحقًا.','Preparing. You can close this panel and return to the job later.')}</p><Button disabled={busy} onClick={()=>void act(async()=>{await api.post(`/api/v1/activity-generation/jobs/${job.id}/cancel`);await active.refetch()})}>{t('إلغاء وإعادة الرصيد','Cancel and release credit')}</Button></>}
    {['failed','needs_review','cancelled'].includes(job.state)&&<p role="status">{job.settlementComplete?t('لم تُسلَّم مقترحات. أُعيد الرصيد المحجوز.','No candidates were delivered. Reserved credit was released.'):t('لم تُسلَّم مقترحات. إعادة الرصيد قيد المعالجة.','No candidates were delivered. Credit release is being processed.')} {job.state==='needs_review'&&t('حالة طلب المزوّد غير مؤكدة؛ لن نكرره تلقائيًا.','The provider outcome is uncertain; it will not be retried automatically.')}</p>}
    {job.task==='zones'&&jobImage&&result&&<div className={styles.zonePreview}><img src={jobImage??undefined} alt={t('معاينة المناطق المقترحة','Proposed image regions')}/><svg viewBox="0 0 1 1" preserveAspectRatio="none">{result.candidates.filter((_,i)=>selected.includes(i)).map((c,i)=><rect key={i} x={c.x} y={c.y} width={c.w} height={c.h}/>)}</svg></div>}
    {result?.candidates.map((c,index)=>{const added=result.appliedIndexes.includes(index);let payload:Record<string,unknown>={};try{payload=JSON.parse(c.payloadJson??'{}') as Record<string,unknown>}catch{/* Rejected by the server before delivery. */}
     const choices=(payload.options??payload.items??payload.cards??[]) as {key:string;text:string}[]
     return <article key={index} className={styles.candidate} data-added={added}><label className={styles.check}><input type="checkbox" checked={selected.includes(index)} disabled={added} onChange={()=>toggle(index)}/><strong dir="auto">{c.prompt??c.reason??t(`منطقة ${index+1}`,`Region ${index+1}`)}</strong><span>{added?t('أُضيف','Added'):''}</span></label>
      {choices.length>0&&<ol>{choices.map(o=><li key={o.key} dir="auto">{o.text} {payload.correct===o.key&&<Check size={16} aria-label={t('إجابة صحيحة','Correct answer')} style={{display:'inline'}}/>}</li>)}</ol>}
      {c.kind==='order'&&Array.isArray(payload.correct)&&<p>{t('الترتيب الصحيح','Correct order')}: {(payload.correct as string[]).map(key=>(payload.items as {key:string;text:string}[]).find(i=>i.key===key)?.text??key).join(' → ')}</p>}
      {c.kind==='match'&&Boolean(payload.map)&&<ul>{Object.entries(payload.map as Record<string,string>).map(([card,target])=><li key={card}>{(payload.cards as {key:string;text:string}[]).find(c=>c.key===card)?.text} → {(payload.targets as {key:string;text:string}[]).find(t=>t.key===target)?.text}</li>)}</ul>}
      {c.kind==='tf'&&<p>{t('الإجابة المقترحة','Proposed answer')}: {payload.correct?t('صح','True'):t('خطأ','False')}</p>}
      {c.reasons?.map((r,i)=><p key={i} dir="auto"><strong>{r.elementKey}</strong>: {r.reason}</p>)}
      {c.key&&<p>{c.key} · {t('راجع حدود المنطقة على الصورة','Review the region on the image')}</p>}
      {c.sourceId&&<p>{c.sourceId} → {c.targetId}</p>}
      {c.sourceSegments?.map(segment=><Button key={segment} variant="quiet" onClick={()=>void act(async()=>{setSource(await api.get(`/api/v1/activity-generation/jobs/${job.id}/source/${segment}`))})}><FileText size={16}/>{t(`افتح المصدر ${segment}`,`Open source ${segment}`)}</Button>)}
      {job.origin==='topic'&&c.prompt&&<small>{t('من موضوع · يحتاج مراجعتك · بلا مراجع ملف مُختلقة','Topic based · teacher review required · no file citations')}</small>}
     </article>
    })}
    {source&&<section className={styles.sourceText}><h4>{t(`المصدر ${source.index}`,`Source ${source.index}`)}</h4><p>{source.text}</p><Button onClick={()=>setSource(null)}>{t('أغلق المصدر','Close source')}</Button></section>}
    {result&&<><p>{t(`${result.candidates.length-result.appliedIndexes.length} مقترحات متبقية`,`${result.candidates.length-result.appliedIndexes.length} candidates remaining`)} · {t('التكلفة النهائية','Final charge')} <span dir="ltr">{usd(job.settledMillicents)}</span></p>
     {job.task==='zones'&&<p>{t('تُضاف المناطق دون تأكيد. راجعها وحدّد الإجابة الصحيحة ثم أكّدها في المحرر.','Regions are added unconfirmed. Review them, set the correct answer, then confirm in the editor.')}</p>}
     <Button variant="primary" disabled={busy||selected.length===0} onClick={()=>void act(async()=>{const r=await api.post<{added:number;remaining:number}>(`/api/v1/activity-generation/jobs/${job.id}/apply`,{selected,expectedRevision:result.nextRevision});setSelected([]);setNotice(t(`أُضيف ${r.added}، وبقي ${r.remaining}.`,`Added ${r.added}; ${r.remaining} remain.`));await onApplied();await active.refetch()})}>{t('أضف المختار فقط','Add selected only')}</Button>
    </>}
   </section>}
  </div>
 </dialog>
}
