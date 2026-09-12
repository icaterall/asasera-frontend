import {useEffect,useId,useRef,useState} from 'react'
import {createPortal} from 'react-dom'
import {useTranslation} from 'react-i18next'
import {Check,ImagePlus,Sparkles,Upload,X} from 'lucide-react'
import {Button,LoadingIndicator} from '@/design'
import {api,ApiError} from '@/lib/api'
import {ImageUpload,UploadBar,useUploadProgress,mediaUrl} from './ImageUpload'
import styles from './HotspotCanvas.module.css'

type Quote={quoteToken:string;model:string;estimateAiCredits:number;maxAiCredits:number;affordable:boolean;expiresAt:string}
type Job={id:string;state:string;model:string;errorCode:string|null;reservedAiCredits:number;settledAiCredits:number|null;imageKey?:string;imageUrl?:string}
type Request={activityId:number;questionId:number;prompt:string;quoteToken:string;idempotencyKey:string}
type Recovery={request:Request;jobId:string|null}
function recover(key:string):Recovery|null{try{const v=JSON.parse(sessionStorage.getItem(key)??'null');return v&&typeof v.request?.prompt==='string'&&typeof v.request?.idempotencyKey==='string'&&typeof v.request?.quoteToken==='string'?v:null}catch{return null}}
export function ImageCreator({activityId,questionId,onPrepare,onImage,onClose}:{activityId:number;questionId:number;onPrepare:()=>Promise<unknown>;onImage:(key:string)=>void;onClose:()=>void}){
 const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),t=(a:string,e:string)=>ar?a:e,title=useId(),dialog=useRef<HTMLDialogElement>(null)
 const storageKey=`asasera:image-creation:${activityId}:${questionId}`,[saved,setSaved]=useState(()=>recover(storageKey))
 const [prompt,setPrompt]=useState(saved?.request.prompt??''),[quote,setQuote]=useState<Quote|null>(null),[job,setJob]=useState<Job|null>(null),[jobId,setJobId]=useState(saved?.jobId??null)
 const [busy,setBusy]=useState(''),[error,setError]=useState(''),[reviewed,setReviewed]=useState(false),[imageReady,setImageReady]=useState(false),[quoteVersion,setQuoteVersion]=useState(0)
 const gate=useRef(false),alive=useRef(true),request=useRef<Request|null>(saved?.request??null)
 const pending=!!jobId&&(!job||['queued','running','checking'].includes(job.state))
 const locked=!!saved||!!jobId||!!busy
 function remember(r:Request,id:string|null){const next={request:r,jobId:id};try{sessionStorage.setItem(storageKey,JSON.stringify(next))}catch{};if(alive.current)setSaved(next)}
 const message=(e:unknown)=>e instanceof ApiError?e.message:t('تعذّر الاتصال. أعد المحاولة للطلب نفسه دون تكراره.','Connection interrupted. Retry the same request without duplicating it.')
 useEffect(()=>{alive.current=true;const d=dialog.current,prior=document.activeElement;d?.showModal();return()=>{alive.current=false;d?.close();if(prior instanceof HTMLElement&&prior.isConnected)prior.focus()}},[])
 useEffect(()=>{
  if(saved||jobId||prompt.trim().length<5){setQuote(null);setBusy(current=>current==='quote'?'':current);return}
  const controller=new AbortController();setQuote(null);setError('');setBusy('quote')
  const timer=setTimeout(()=>{void onPrepare().then(()=>api.post<Quote>('/api/v1/activity-media/creation/quote',{activityId,questionId,prompt:prompt.trim()},{signal:controller.signal})).then(value=>{if(!controller.signal.aborted)setQuote(value)}).catch(e=>{if(!controller.signal.aborted)setError(message(e))}).finally(()=>{if(!controller.signal.aborted)setBusy('')})},350)
  return()=>{controller.abort();clearTimeout(timer)}
 },[prompt,saved,jobId,quoteVersion])
 useEffect(()=>{
  if(!jobId)return
  const controller=new AbortController();let timer:ReturnType<typeof setTimeout>
  async function poll(){try{const result=await api.get<Job>(`/api/v1/activity-media/creation/jobs/${jobId}`,{signal:controller.signal});if(controller.signal.aborted)return;setJob(result);setError('');if(['queued','running','checking'].includes(result.state))timer=setTimeout(()=>void poll(),1600)}catch(e){if(!controller.signal.aborted){setError(message(e));timer=setTimeout(()=>void poll(),3000)}}}
  void poll();return()=>{controller.abort();clearTimeout(timer)}
 },[jobId])
 async function generate(){
  if(gate.current||(!request.current&&!quote))return
  gate.current=true;setBusy('submit');setError('')
  const input=request.current??{activityId,questionId,prompt:prompt.trim(),quoteToken:quote!.quoteToken,idempotencyKey:crypto.randomUUID()}
  request.current=input;remember(input,null)
  try{const result=await api.post<Job>('/api/v1/activity-media/creation/jobs',input);remember(input,result.id);if(alive.current){setJobId(result.id);setJob(result)}}catch(e){if(alive.current){setError(message(e));if(e instanceof ApiError&&['image_quote_expired','image_quote_changed','insufficient_credit','image_creation_unavailable'].includes(e.code)){request.current=null;sessionStorage.removeItem(storageKey);setSaved(null);setQuote(null)}}}finally{gate.current=false;if(alive.current)setBusy('')}
 }
 function newImage(){sessionStorage.removeItem(storageKey);request.current=null;setSaved(null);setJobId(null);setJob(null);setReviewed(false);setImageReady(false);setError('');setQuoteVersion(v=>v+1)}
 return createPortal(<dialog ref={dialog} className={`asas ${styles.creatorDialog}`} dir={ar?'rtl':'ltr'} aria-labelledby={title} onCancel={e=>{e.preventDefault();onClose()}} onKeyDown={e=>e.stopPropagation()}>
  <header className={styles.dialogHeader}><div><h2 id={title}>{t('أنشئ صورة للسؤال','Create a question image')}</h2><p>{t('صورة تعليمية واضحة دون تسميات. ستضيف الإجابات بنفسك أو باقتراح الذكاء الاصطناعي.','Create a clear, unlabelled educational image. Add answer areas manually or with AI suggestions afterwards.')}</p></div><Button variant="quiet" aria-label={t('إغلاق','Close')} onClick={onClose}><X size={20}/></Button></header>
  <div className={styles.creatorBody}>
   <label>{t('ماذا تريد في الصورة؟','What should the image show?')}<textarea className={styles.creatorPrompt} value={prompt} maxLength={1000} disabled={locked&&busy!=='quote'} dir="auto" placeholder={t('مثال: رسم واضح لأجزاء الزهرة، دون كتابة أو تسميات، على خلفية فاتحة.','For example: a clear diagram of the parts of a flower, without text or labels, on a light background.')} onChange={e=>{setPrompt(e.target.value);setQuote(null);request.current=null}}/></label>
   {busy==='quote'&&<p role="status">{t('جارٍ حساب التكلفة…','Estimating cost…')}</p>}
   {pending&&<LoadingIndicator label={job?.state==='checking'?t('جارٍ فحص الصورة…','Checking the image…'):t('جارٍ إنشاء الصورة… يمكنك إغلاق النافذة والعودة إلى الطلب نفسه.','Creating the image… You can close this window and return to the same request.')}/>}
   {job?.state==='succeeded'&&job.imageUrl&&<><img src={mediaUrl(job.imageUrl)} alt={t('صورة أنشأها الذكاء الاصطناعي للمراجعة','AI-created image for review')} onLoad={()=>setImageReady(true)} onError={()=>{setImageReady(false);setError(t('تعذّر تحميل الصورة. أغلق النافذة وافتحها لتحديث الرابط.','Could not load the image. Close and reopen this window to refresh its link.'))}}/><label className={styles.reviewCheck}><input type="checkbox" checked={reviewed} onChange={e=>setReviewed(e.target.checked)}/>{t('راجعت دقة الصورة وملاءمتها للدرس وتوافقها مع سياسة الوسائط.','I checked the image for accuracy, suitability, and compliance with the media policy.')}</label><p>{t('صور تعليمية بلا أشخاص؛ لا يُسمح بتصوير النساء أو الفتيات وفق سياسة المنصة.','Use people-free educational images. Depictions of women or girls are not allowed by the platform media policy.')}</p></>}
   {job?.state==='needs_review'&&<p role="alert">{t('تعذّر التأكد من نتيجة المزوّد أو تكلفتها. الرصيد محجوز للمراجعة، ولم نكرر الطلب. تواصل مع المسؤول مع رقم الطلب:','The provider outcome or cost needs review. Credits remain reserved; the request has not been repeated. Contact your administrator with request ID:')} <bdi>{job.id}</bdi></p>}
   {job&&['failed','cancelled'].includes(job.state)&&<p role="alert">{t('لم نتمكن من تجهيز صورة معتمدة. لم تُخصم تكلفة من رصيدك لهذا الطلب.','We could not prepare an approved image. You were not charged for this request.')}</p>}
   {error&&<p className={styles.error} role="alert">{error}</p>}
  </div>
  <footer className={styles.dialogFooter}>
   <p>{quote&&!job?t(`النموذج: ${quote.model} · التقدير: ${quote.estimateAiCredits} · حجز بحد أقصى ${quote.maxAiCredits} رصيد ذكاء اصطناعي. تُخصم التكلفة الفعلية فقط عند تجهيز الصورة.`,`Model: ${quote.model} · Estimate: ${quote.estimateAiCredits} · Reserve up to ${quote.maxAiCredits} AI Credits. Only the actual cost is charged when the image is ready.`):job?.settledAiCredits!=null?t(`التكلفة: ${job.settledAiCredits} رصيد ذكاء اصطناعي`,`Cost: ${job.settledAiCredits} AI Credits`):''}{quote&&!quote.affordable&&<span>{t(' الرصيد المتاح غير كافٍ.',' Your available balance is insufficient.')}</span>}</p>
   {!jobId?<Button variant="primary" icon={<Sparkles size={18}/>} loading={busy==='submit'} disabled={!!busy||(!request.current&&(!quote?.affordable||Date.parse(quote.expiresAt)<=Date.now()))} onClick={()=>void generate()}>{saved?t('استئناف الطلب','Resume request'):t('أنشئ الصورة','Generate image')}</Button>:job?.state==='succeeded'?<><Button onClick={newImage}>{t('أنشئ صورة أخرى','Create another')}</Button><Button variant="primary" icon={<Check size={18}/>} disabled={!reviewed||!imageReady||!job.imageKey} onClick={()=>{if(job.imageKey){onImage(job.imageKey);sessionStorage.removeItem(storageKey);onClose()}}}>{t('استخدم هذه الصورة','Use this image')}</Button></>:job&&['failed','cancelled'].includes(job.state)?<Button onClick={newImage}>{t('طلب جديد','New request')}</Button>:<Button onClick={onClose}>{t('تابع التحرير','Continue editing')}</Button>}
   {error&&!saved&&!jobId&&<Button onClick={()=>setQuoteVersion(v=>v+1)}>{t('حدّث التقدير','Refresh estimate')}</Button>}
  </footer>
 </dialog>,document.body)
}

export function ImageQuestionEntry({activityId,questionId,onImage,onPrepare}:{activityId:number;questionId:number;onImage:(key:string)=>void;onPrepare:()=>Promise<unknown>}){
 const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),uploader=useRef<HTMLDivElement>(null),upload=useUploadProgress(),[create,setCreate]=useState(false)
 return <section className={styles.imageEntry} aria-label={ar?'صورة السؤال':'Question image'}><ImagePlus size={40}/><h2>{ar?'ابدأ بصورة':'Start with an image'}</h2><p>{ar?'ارفع صورة أو أنشئ واحدة بالذكاء الاصطناعي. بعدها غطِّ النصوص، وحدّد مناطق الإجابات، وأضف التسميات التي يسحبها الطالب.':'Upload a picture or create one with AI. Then cover existing text, place answer areas, and add the labels learners will drag.'}</p><div className={styles.entryActions}><Button variant="primary" icon={<Upload size={18}/>} disabled={upload.busy} onClick={()=>uploader.current?.querySelector('input')?.click()}>{ar?'ارفع صورة':'Upload image'}</Button><Button icon={<Sparkles size={18}/>} disabled={upload.busy} onClick={()=>setCreate(true)}>{ar?'أنشئ بالذكاء الاصطناعي':'Create with AI'}</Button></div><p>PNG, JPG, WebP · {ar?'حتى 5 ميجابايت':'Up to 5 MB'}</p><div ref={uploader}><ImageUpload imageKey={null} compact showPreview={false} onImage={onImage} onProgress={upload.onProgress}/></div><UploadBar state={upload.state} label={ar?'تجهيز الصورة':'Preparing image'}/>{create&&<ImageCreator activityId={activityId} questionId={questionId} onPrepare={onPrepare} onImage={onImage} onClose={()=>setCreate(false)}/>}</section>
}
