import {useEffect,useId,useRef,useState} from 'react'
import {createPortal} from 'react-dom'
import {useTranslation} from 'react-i18next'
import {Check,Sparkles,X} from 'lucide-react'
import {Button,LoadingIndicator} from '@/design'
import {api,ApiError,type QuestionRecord} from '@/lib/api'
import {generationInputSchema,generationQuoteSchema,proposedZoneSchema,type GenerationInput,type GenerationQuote} from '@/shared/generation'
import {imageZoneSchema,parsePayload} from '@/shared/questions'
import {ZoneOutline} from './HotspotCanvas'
import type {z} from 'zod'
import styles from './HotspotCanvas.module.css'
type Proposal=z.infer<typeof proposedZoneSchema>
type Job={id:number;state:string;imageKey:string|null;result:{candidates:Proposal[];appliedIndexes:number[];nextRevision:number}|null}
type Recovery={request:GenerationInput;jobId:number|null}
function readRecovery(key:string):Recovery|null{try{const value=JSON.parse(sessionStorage.getItem(key)??'null');return value?{request:generationInputSchema.parse(value.request),jobId:typeof value.jobId==='number'?value.jobId:null}:null}catch{return null}}

export function ZoneSuggestions({activityId,question,imageUrl,onPrepare,onApplied,onClose}:{activityId:number;question:QuestionRecord;imageUrl:string|null;onPrepare:()=>Promise<QuestionRecord>;onApplied:()=>Promise<void>;onClose:()=>void}){
 const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),t=(a:string,e:string)=>ar?a:e,title=useId(),dialog=useRef<HTMLDialogElement>(null)
 const storageKey=`asasera:zone-suggestions:${activityId}:${question.id}`,[saved,setSaved]=useState(()=>readRecovery(storageKey))
 const [request,setRequest]=useState<GenerationInput|null>(saved?.request??null),[jobId,setJobId]=useState<number|null>(saved?.jobId??null),[job,setJob]=useState<Job|null>(null),[quote,setQuote]=useState<GenerationQuote|null>(null)
 const [selected,setSelected]=useState<number[]>([]),[pending,setPending]=useState(!saved?'quote':''),[error,setError]=useState(''),[retry,setRetry]=useState(0)
 const gate=useRef(false),active=useRef(true),[revisionConflict,setRevisionConflict]=useState(false)
 const preparing=!!jobId&&(!job||['queued','running'].includes(job.state))
 const remember=(r:GenerationInput,id:number|null)=>{try{sessionStorage.setItem(storageKey,JSON.stringify({request:r,jobId:id}))}catch{}}
 const describe=(e:unknown)=>e instanceof ApiError&&e.code==='revision_conflict'?t('تغيّر السؤال. أغلق هذه النافذة وراجع أحدث نسخة.','The question changed. Close this panel and review the latest version.'):e instanceof ApiError&&['quote_changed','quote_already_used'].includes(e.code)?t('انتهى عرض التكلفة. أغلق النافذة وافتحها من جديد.','The estimate changed. Close and reopen this panel for a fresh estimate.'):t('تعذّر إكمال الطلب. يمكنك المحاولة مرة أخرى دون إنشاء طلب مكرر.','The request could not be completed. Retry safely without creating a duplicate request.')
 useEffect(()=>{active.current=true;const d=dialog.current,prior=document.activeElement;d?.showModal();return()=>{active.current=false;d?.close();if(prior instanceof HTMLElement&&prior.isConnected)prior.focus()}},[])
 useEffect(()=>{
  if(saved)return
  const controller=new AbortController();setPending('quote');setError('')
  void onPrepare().then(async current=>{
   if(controller.signal.aborted)return
   const input=generationInputSchema.parse({activityId,questionId:current.id,expectedRevision:current.revision,task:'zones',objective:current.prompt.slice(0,1000),language:ar?'ar':'en',maxAuthorizedMillicents:1,idempotencyKey:crypto.randomUUID()})
   const priced=generationQuoteSchema.parse(await api.post('/api/v1/activity-generation/quote',input,{signal:controller.signal}))
   if(controller.signal.aborted)return;setQuote(priced);setRequest({...input,quoteId:priced.quoteId,maxAuthorizedMillicents:priced.maxAuthorizedMillicents})
  }).catch(e=>{if(!controller.signal.aborted)setError(describe(e))}).finally(()=>{if(!controller.signal.aborted)setPending('')})
  return()=>controller.abort()
 },[retry,saved])
 useEffect(()=>{
  if(!jobId)return
  const controller=new AbortController();let timer:ReturnType<typeof setTimeout>
  async function poll(){try{const result=await api.get<{job:Job}>(`/api/v1/activity-generation/jobs/${jobId}`,{signal:controller.signal});if(controller.signal.aborted)return;setJob(result.job);setError('');if(['queued','running'].includes(result.job.state))timer=setTimeout(()=>void poll(),1500)}catch(e){if(!controller.signal.aborted){setError(describe(e));timer=setTimeout(()=>void poll(),3000)}}}
  void poll();return()=>{controller.abort();clearTimeout(timer)}
 },[jobId])
 async function submit(){if(!request||gate.current)return;gate.current=true;remember(request,null);setPending('submit');setError('');try{const result=await api.post<{job:Job}>('/api/v1/activity-generation/jobs',request);remember(request,result.job.id);if(active.current){setJobId(result.job.id);setJob(result.job)}}catch(e){if(active.current){setError(describe(e));if(e instanceof ApiError&&['quote_changed','quote_already_used'].includes(e.code)){sessionStorage.removeItem(storageKey);setSaved(null);setRequest(null)}}}finally{gate.current=false;if(active.current)setPending('')}}
 const parsed=parsePayload('hotspot',question.payload),capacity=parsed.success&&'zones'in parsed.data?Math.min(12-parsed.data.zones.length,'cards'in parsed.data?12-parsed.data.cards.length:12):0
 const completed=!!job&&['succeeded','failed','cancelled'].includes(job.state)
 const imageKey=parsed.success&&'zones'in parsed.data?parsed.data.imageKey:null
 const stale=!!job?.result&&(revisionConflict||job.imageKey!==imageKey||job.result.nextRevision!==question.revision)
 const proposals=(stale?[]:job?.result?.candidates??[]).map((p,index)=>({proposal:p,index})).filter(({proposal,index})=>{const {label:_label,points,...zone}=proposal;return !job?.result?.appliedIndexes.includes(index)&&imageZoneSchema.safeParse({...zone,...(points?{points}:{}),shape:zone.shape??'rect'}).success})
 async function apply(){if(!job?.result||stale||gate.current||!selected.length||selected.length>capacity)return;gate.current=true;setPending('apply');setError('');try{const current=await onPrepare();if(current.revision!==job.result.nextRevision)throw new ApiError(409,'revision_conflict','Question changed');await api.post(`/api/v1/activity-generation/jobs/${job.id}/apply`,{selected,expectedRevision:current.revision});sessionStorage.removeItem(storageKey);await onApplied();onClose()}catch(e){if(e instanceof ApiError&&e.code==='revision_conflict'){setRevisionConflict(true);setSelected([])}setError(describe(e))}finally{gate.current=false;if(active.current)setPending('')}}
 function freshEstimate(){
  if(!completed||gate.current)return
  sessionStorage.removeItem(storageKey);setSaved(null);setRequest(null);setJobId(null);setJob(null);setSelected([]);setQuote(null);setError('');setRevisionConflict(false);setPending('quote');setRetry(v=>v+1)
 }
 return createPortal(<dialog ref={dialog} className={`asas ${styles.suggestionsDialog}`} dir={ar?'rtl':'ltr'} aria-labelledby={title} onCancel={e=>{e.preventDefault();if(pending!=='apply')onClose()}} onKeyDown={e=>e.stopPropagation()}>
  <header className={styles.dialogHeader}><div><h2 id={title}>{t('اقترح مناطق الإجابة','Suggest answer areas')}</h2><p>{t('يقترح الذكاء الاصطناعي المناطق وتسمياتها. اختر ما تريد إضافته ثم راجعه على الصورة.','AI suggests areas and answer labels. Choose what to add, then review it on the image.')}</p></div><Button variant="quiet" aria-label={t('إغلاق','Close')} disabled={pending==='apply'} onClick={onClose}><X size={20}/></Button></header>
  <div className={styles.suggestionsBody} inert={pending==='quote'||pending==='apply'}>
   {imageUrl&&<div className={styles.proposalImage} dir="ltr"><img src={imageUrl} alt={t('الصورة قيد المراجعة','Image under review')}/><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">{proposals.map(({proposal,index})=><g key={index} className={selected.includes(index)?styles.activeZone:styles.zone}><ZoneOutline zone={{...proposal,points:proposal.points??undefined}}/><text className={styles.zoneNumber} x={(proposal.x+proposal.w/2)*100} y={(proposal.y+proposal.h/2)*100}>{index+1}</text></g>)}</svg></div>}
   {preparing&&<p role="status">{t('جارٍ تحديد الأجزاء المرئية وتسمياتها… يمكنك إغلاق النافذة والعودة إلى الطلب نفسه.','Finding visible parts and their labels… You can close this panel and return to the same request.')}</p>}
   {completed&&stale&&<p role="status">{t('تغيّرت الصورة أو السؤال منذ هذه الاقتراحات. أخفينا المناطق القديمة. احصل على تقدير جديد لاقتراحات تناسب النسخة الحالية.','The image or question changed since these suggestions. Old areas are hidden. Get a fresh estimate for suggestions based on the current version.')}</p>}
   {completed&&!stale&&!proposals.length&&<p role="status">{t('لا توجد مناطق جديدة قابلة للإضافة من هذا الطلب. يمكنك رسمها يدويًا أو الحصول على تقدير لطلب جديد.','There are no new usable areas in this result. Draw areas manually or get an estimate for a new request.')}</p>}
   {job?.result&&!stale&&!!proposals.length&&<div><p>{t('اختر الاقتراحات لإضافتها. لن تُستبدل المناطق الموجودة.','Choose suggestions to add. Existing areas will not be replaced.')} <bdi>{selected.length}/{capacity}</bdi></p><div className={styles.proposalList}>{proposals.map(({proposal,index})=><label key={index}><input type="checkbox" checked={selected.includes(index)} disabled={!selected.includes(index)&&selected.length>=capacity} onChange={e=>setSelected(e.target.checked?[...selected,index]:selected.filter(i=>i!==index))}/><span className={styles.answerNumber}>{index+1}</span><span dir="auto">{proposal.label||t('تحتاج إلى تسمية','Needs a label')}</span></label>)}</div></div>}
   {job&&['failed','cancelled','needs_review'].includes(job.state)&&<p role="status">{job.state==='needs_review'?t('تحتاج نتيجة الطلب إلى مراجعة. لم نُعِد تشغيله أو نكرر التكلفة.','This request needs review. It has not been retried or charged again.'):t('لم يُنتج هذا الطلب اقتراحات قابلة للاستخدام. صورتك وإجاباتك لم تتغير.','This request produced no usable suggestions. Your image and answers are unchanged.')}</p>}
   {error&&<p role="alert" className={styles.error}>{error}</p>}
  </div>
  <footer className={styles.dialogFooter} inert={pending==='quote'||pending==='apply'}>
   {!jobId?<><p>{quote?t(`التقدير: ${quote.estimateAiCredits} · الحد الأقصى: ${quote.maxAuthorizedAiCredits} · المتاح: ${quote.usableAiCredits} رصيد ذكاء اصطناعي`,`Estimate: ${quote.estimateAiCredits} · Maximum: ${quote.maxAuthorizedAiCredits} · Available: ${quote.usableAiCredits} AI Credits`):saved?t('استئناف الطلب نفسه دون تكراره.','Resume the same request without duplicating it.'):''}{quote&&!quote.generationAvailable&&<span>{t('التوليد غير متاح حاليًا.','Generation is currently unavailable.')}</span>}</p>{!request&&error?<Button onClick={()=>setRetry(v=>v+1)}>{t('أعد المحاولة','Retry estimate')}</Button>:<Button variant="primary" loading={pending==='submit'} disabled={!request||!!pending||(!saved&&(!quote?.affordable||!quote.generationAvailable))} icon={<Sparkles size={18}/>} onClick={()=>void submit()}>{saved?t('استئناف الطلب','Resume request'):t('اقترح بالذكاء الاصطناعي','Suggest with AI')}</Button>}</>:job?.result&&!stale&&!!proposals.length?<><Button disabled={!!pending} onClick={freshEstimate}>{t('تقدير جديد','Fresh estimate')}</Button><Button variant="primary" disabled={!selected.length||!!pending} icon={<Check size={18}/>} onClick={()=>void apply()}>{t('أضف المناطق والتسميات المحددة','Add selected areas and labels')}</Button></>:completed?<Button variant="primary" disabled={!!pending} onClick={freshEstimate}>{t('احصل على تقدير جديد','Get a fresh estimate')}</Button>:<Button onClick={onClose}>{t('تابع التحرير','Continue editing')}</Button>}
  </footer>
  {(pending==='quote'||pending==='apply')&&<div className={styles.blocking}><LoadingIndicator label={pending==='quote'?t('جارٍ حساب التكلفة…','Estimating cost…'):t('جارٍ إضافة الإجابات…','Adding answers…')}/></div>}
 </dialog>,document.body)
}
