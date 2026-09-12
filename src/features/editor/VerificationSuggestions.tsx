import {useEffect,useRef,useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Check,Sparkles,PenLine} from 'lucide-react'
import {Button,LoadingIndicator} from '@/design'
import {api,ApiError} from '@/lib/api'
import {generationInputSchema,generationQuoteSchema,type GenerationInput,type GenerationQuote} from '@/shared/generation'
import styles from './VerificationDialog.module.css'

/**
 * AI as a drafting hand, never as the author.
 *
 * A verification link is a teaching judgement: which mistake matters, what is
 * probably behind it, and which other question would prove the learner has got
 * past it. A model can draft all three faster than a teacher can type them, and
 * it can read a catalogue of their approved questions that nobody wants to
 * scroll. What it cannot do is decide — so nothing here writes anything on its
 * own.
 *
 * TWO WAYS TO ACCEPT, and they are different acts:
 *
 *   Edit   fills the three steps below so the teacher fixes the wording and
 *          saves it themselves. Reach for this when the reason is nearly
 *          right: their words end up in front of the class, not a model's.
 *   Add    applies the ticked suggestions as they stand, through the job's own
 *          apply endpoint, which writes the reason and the link in ONE
 *          transaction. A link without its reason can never fire in class;
 *          that is not a mistake worth making twice.
 */

export interface Suggestion {elementKey:string;wrongTargetKey:string|null;reason:string;versionId:number;questionId:number;rationale:string}
type Job={id:number;state:string;result:{candidates:Suggestion[];appliedIndexes:number[];nextRevision:number}|null}

export function VerificationSuggestions({activityId,questionId,revision,labelFor,promptFor,onUse,onApplied}:{
 activityId:number
 questionId:number
 revision:number
 labelFor:(s:Suggestion)=>string
 promptFor:(s:Suggestion)=>string
 onUse:(s:Suggestion)=>void
 onApplied:()=>Promise<void>|void
}){
 const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),t=(a:string,e:string)=>ar?a:e
 const [request,setRequest]=useState<GenerationInput|null>(null),[quote,setQuote]=useState<GenerationQuote|null>(null)
 const [jobId,setJobId]=useState<number|null>(null),[job,setJob]=useState<Job|null>(null)
 const [selected,setSelected]=useState<number[]>([]),[pending,setPending]=useState(''),[error,setError]=useState(''),[open,setOpen]=useState(false)
 const gate=useRef(false),alive=useRef(true)
 useEffect(()=>{alive.current=true;return()=>{alive.current=false}},[])

 /*
  * A 422 from this endpoint is a reason, not a failure: the question is not
  * approved yet, it has no wrong answers to link, there is no second question
  * to verify with. The server writes those in words a teacher can act on, so
  * they are shown as written — a generic "could not be completed" turned a
  * clear answer into a dead end and sent the teacher hunting.
  */
 const describe=(e:unknown)=>e instanceof ApiError&&e.code==='revision_conflict'
  ?t('تغيّر السؤال. أغلق هذه النافذة وافتحها من جديد.','The question changed. Close this panel and open it again.')
  :e instanceof ApiError&&['quote_changed','quote_already_used'].includes(e.code)
   ?t('انتهى عرض التكلفة. أغلق النافذة وافتحها من جديد.','The estimate expired. Close and reopen this panel.')
   :e instanceof ApiError&&e.status===422&&e.message
    ?e.message
    :t('تعذّر إكمال الطلب. يمكنك المحاولة مرة أخرى.','The request could not be completed. You can try again.')

 /* Priced before it is offered: the estimate is only fetched once the teacher
    asks for suggestions, and they see the cost before anything is spent. */
 useEffect(()=>{
  if(!open||request||jobId)return
  const controller=new AbortController();setPending('quote');setError('')
  const input=generationInputSchema.parse({activityId,questionId,expectedRevision:revision,task:'verification',
   language:ar?'ar':'en',maxAuthorizedMillicents:1,idempotencyKey:crypto.randomUUID()})
  void api.post('/api/v1/activity-generation/quote',input,{signal:controller.signal})
   .then(priced=>{if(controller.signal.aborted)return
    const q=generationQuoteSchema.parse(priced);setQuote(q);setRequest({...input,quoteId:q.quoteId,maxAuthorizedMillicents:q.maxAuthorizedMillicents})})
   .catch(e=>{if(!controller.signal.aborted)setError(describe(e))})
   .finally(()=>{if(!controller.signal.aborted)setPending('')})
  return()=>controller.abort()
 },[open,request,jobId])

 useEffect(()=>{
  if(!jobId)return
  const controller=new AbortController();let timer:ReturnType<typeof setTimeout>
  async function poll(){
   try{
    const result=await api.get<{job:Job}>(`/api/v1/activity-generation/jobs/${jobId}`,{signal:controller.signal})
    if(controller.signal.aborted)return
    setJob(result.job);setError('')
    if(['queued','running'].includes(result.job.state))timer=setTimeout(()=>void poll(),1500)
   }catch(e){if(!controller.signal.aborted){setError(describe(e));timer=setTimeout(()=>void poll(),3000)}}
  }
  void poll();return()=>{controller.abort();clearTimeout(timer)}
 },[jobId])

 async function submit(){
  if(!request||gate.current)return
  gate.current=true;setPending('submit');setError('')
  try{const result=await api.post<{job:Job}>('/api/v1/activity-generation/jobs',request);if(alive.current){setJobId(result.job.id);setJob(result.job)}}
  catch(e){if(alive.current)setError(describe(e))}
  finally{gate.current=false;if(alive.current)setPending('')}
 }

 async function add(){
  if(!job?.result||!selected.length||gate.current)return
  gate.current=true;setPending('apply');setError('')
  try{
   await api.post(`/api/v1/activity-generation/jobs/${job.id}/apply`,{selected,expectedRevision:revision})
   await onApplied()
   if(alive.current)setSelected([])
  }catch(e){if(alive.current)setError(describe(e))}
  finally{gate.current=false;if(alive.current)setPending('')}
 }

 const waiting=!!jobId&&(!job||['queued','running'].includes(job.state))
 const stale=!!job?.result&&job.result.nextRevision!==revision
 const suggestions=(stale?[]:job?.result?.candidates??[]).map((s,index)=>({s,index}))
  .filter(({index})=>!job?.result?.appliedIndexes.includes(index))

 if(!open)return <div className={styles.aiInvite}>
  <p>{t('يمكن للذكاء الاصطناعي أن يقترح الخطأ وسببه وسؤال التحقق المناسب، وتبقى لك الكلمة الأخيرة.','AI can draft which mistake, why it happens, and which question proves it. You still decide.')}</p>
  <Button icon={<Sparkles size={18}/>} onClick={()=>setOpen(true)}>{t('اقترح بالذكاء الاصطناعي','Suggest with AI')}</Button>
 </div>

 return <section className={styles.ai} aria-label={t('اقتراحات الذكاء الاصطناعي','AI suggestions')}>
  {pending==='quote'&&<LoadingIndicator label={t('جارٍ حساب التكلفة…','Estimating cost…')}/>}
  {!jobId&&request&&quote&&<div className={styles.aiInvite}>
   <p><bdi>{t(`التقدير: ${quote.estimateAiCredits} · الحد الأقصى: ${quote.maxAuthorizedAiCredits} · المتاح: ${quote.usableAiCredits} رصيد ذكاء اصطناعي`,`Estimate: ${quote.estimateAiCredits} · Maximum: ${quote.maxAuthorizedAiCredits} · Available: ${quote.usableAiCredits} AI Credits`)}</bdi></p>
   <Button variant="primary" loading={pending==='submit'} disabled={!!pending||!quote.affordable||!quote.generationAvailable}
    icon={<Sparkles size={18}/>} onClick={()=>void submit()}>{t('اقترح روابط التحقق','Draft verification links')}</Button>
  </div>}
  {waiting&&<p role="status">{t('جارٍ قراءة أسئلتك المعتمدة واقتراح الروابط…','Reading your approved questions and drafting links…')}</p>}
  {stale&&<p role="status">{t('تغيّر السؤال منذ هذه الاقتراحات، فأخفيناها.','The question changed since these suggestions, so they are hidden.')}</p>}
  {job&&['failed','cancelled','needs_review'].includes(job.state)&&<p role="status">
   {t('لم يُنتج هذا الطلب اقتراحات قابلة للاستخدام. لم يتغيّر سؤالك.','This request produced no usable suggestions. Your question is unchanged.')}</p>}
  {!!suggestions.length&&<>
   <ul className={styles.aiList}>{suggestions.map(({s,index})=><li key={index}>
    <label>
     <input type="checkbox" checked={selected.includes(index)}
      onChange={e=>setSelected(e.target.checked?[...selected,index]:selected.filter(i=>i!==index))}/>
     <span className={styles.aiSlot}>{labelFor(s)}</span>
    </label>
    <p className={styles.aiReason} dir="auto">{s.reason}</p>
    <p className={styles.aiTarget} dir="auto"><strong>{t('يثبته:','Proved by:')}</strong> {promptFor(s)}</p>
    <p className={styles.aiWhy} dir="auto">{s.rationale}</p>
    <Button variant="quiet" icon={<PenLine size={16}/>} onClick={()=>onUse(s)}>{t('حرّره ثم احفظه','Edit, then save')}</Button>
   </li>)}</ul>
   <div className={styles.aiActions}>
    <Button variant="primary" loading={pending==='apply'} disabled={!selected.length||!!pending} icon={<Check size={18}/>}
     onClick={()=>void add()}>{t('أضف المحدد كما هو','Add selected as written')}</Button>
   </div>
  </>}
  {error&&<p role="alert" className={styles.error}>{error}</p>}
 </section>
}
