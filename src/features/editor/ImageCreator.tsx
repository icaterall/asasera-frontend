import {useEffect,useId,useRef,useState} from 'react'
import {createPortal} from 'react-dom'
import {Link} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {Check,ImagePlus,Sparkles,Upload,X} from 'lucide-react'
import {Button,LoadingIndicator} from '@/design'
import {api,ApiError} from '@/lib/api'
import {ImageUpload,UploadBar,useUploadProgress,mediaUrl} from './ImageUpload'
import styles from './HotspotCanvas.module.css'

/*
 * The teacher chooses a picture, not a vendor. No model name reaches this
 * component, and the price of each tier is expressed in output tokens: it is
 * the unit the provider actually meters, it does not move when a credit rate
 * or a currency does, and "a fifth of the tokens" is a comparison a teacher can
 * act on without being handed their employer's invoice.
 */
type Quality='low'|'medium'|'high'
type QualityChoice={quality:Quality;outputTokens:number;amountMillicents:number;allowed:boolean}
type Preferences={imageQuality:Quality;effectiveImageQuality:Quality;ceiling:Quality|null;choices:QualityChoice[];qualitySelectable:boolean}
type Quote={quoteToken:string;imageQuality:Quality|null;outputTokens:number|null;estimateAiCredits:number;maxAiCredits:number;affordable:boolean;expiresAt:string}
type Job={id:string;state:string;imageQuality:Quality|null;outputTokens:number|null;errorCode:string|null;reservedAiCredits:number;settledAiCredits:number|null;imageKey?:string;imageUrl?:string}
type Request={activityId:number;questionId:number;prompt:string;quoteToken:string;idempotencyKey:string}
type Recovery={request:Request;jobId:string|null}
function recover(key:string):Recovery|null{try{const v=JSON.parse(sessionStorage.getItem(key)??'null');return v&&typeof v.request?.prompt==='string'&&typeof v.request?.idempotencyKey==='string'&&typeof v.request?.quoteToken==='string'?v:null}catch{return null}}
export function ImageCreator({activityId,questionId,onPrepare,onImage,onClose}:{activityId:number;questionId:number;onPrepare:()=>Promise<unknown>;onImage:(key:string)=>void;onClose:()=>void}){
 const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),t=(a:string,e:string)=>ar?a:e,title=useId(),dialog=useRef<HTMLDialogElement>(null)
 const storageKey=`asasera:image-creation:${activityId}:${questionId}`,[saved,setSaved]=useState(()=>recover(storageKey))
 const [prompt,setPrompt]=useState(saved?.request.prompt??''),[quote,setQuote]=useState<Quote|null>(null),[job,setJob]=useState<Job|null>(null),[jobId,setJobId]=useState(saved?.jobId??null)
 const [busy,setBusy]=useState(''),[error,setError]=useState(''),[reviewed,setReviewed]=useState(false),[imageReady,setImageReady]=useState(false),[quoteVersion,setQuoteVersion]=useState(0)
 const [prefs,setPrefs]=useState<Preferences|null>(null)
 const quality=(value:Quality|null|undefined)=>value==='high'?t('عالية','High'):value==='medium'?t('متوسطة','Medium'):t('منخفضة','Low')
 const count=(value:number)=>value.toLocaleString(i18n.language)
 const gate=useRef(false),alive=useRef(true),request=useRef<Request|null>(saved?.request??null)
 const pending=!!jobId&&(!job||['queued','running','checking'].includes(job.state))
 const locked=!!saved||!!jobId||!!busy
 function remember(r:Request,id:string|null){const next={request:r,jobId:id};try{sessionStorage.setItem(storageKey,JSON.stringify(next))}catch{};if(alive.current)setSaved(next)}
 const message=(e:unknown)=>e instanceof ApiError?e.message:t('تعذّر الاتصال. أعد المحاولة للطلب نفسه دون تكراره.','Connection interrupted. Retry the same request without duplicating it.')
 useEffect(()=>{alive.current=true;const d=dialog.current,prior=document.activeElement;d?.showModal();return()=>{alive.current=false;d?.close();if(prior instanceof HTMLElement&&prior.isConnected)prior.focus()}},[])
 useEffect(()=>{
  const controller=new AbortController()
  void api.get<Preferences>('/api/v1/activity-media/preferences',{signal:controller.signal})
   .then(value=>{if(!controller.signal.aborted)setPrefs(value)})
   .catch(()=>{/* The picker simply stays hidden; the saved choice still applies server-side. */})
  return()=>controller.abort()
 },[])
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
 /* Saved before re-pricing, never after: the estimate a teacher reads must be
    the one their next request is held against. */
 async function chooseQuality(next:Quality){
  if(!prefs||next===prefs.imageQuality||locked)return
  const previous=prefs
  setPrefs({...prefs,imageQuality:next,effectiveImageQuality:next});setError('')
  try{
   const saved=await api.put<Preferences>('/api/v1/activity-media/preferences',{imageQuality:next})
   if(alive.current){setPrefs(saved);setQuote(null);request.current=null;setQuoteVersion(v=>v+1)}
  }catch(e){if(alive.current){setPrefs(previous);setError(message(e))}}
 }
 const choices=(prefs?.choices??[]).filter(choice=>choice.allowed)
 function newImage(){sessionStorage.removeItem(storageKey);request.current=null;setSaved(null);setJobId(null);setJob(null);setReviewed(false);setImageReady(false);setError('');setQuoteVersion(v=>v+1)}
 return createPortal(<dialog ref={dialog} className={`asas ${styles.creatorDialog}`} dir={ar?'rtl':'ltr'} aria-labelledby={title} onCancel={e=>{e.preventDefault();onClose()}} onKeyDown={e=>e.stopPropagation()}>
  <header className={styles.dialogHeader}><div><h2 id={title}>{t('أنشئ صورة للسؤال','Create a question image')}</h2><p>{t('صورة تعليمية واضحة دون تسميات. ستضيف الإجابات بنفسك أو باقتراح الذكاء الاصطناعي.','Create a clear, unlabelled educational image. Add answer areas manually or with AI suggestions afterwards.')}</p></div><Button variant="quiet" aria-label={t('إغلاق','Close')} onClick={onClose}><X size={20}/></Button></header>
  <div className={styles.creatorBody}>
   <label>{t('ماذا تريد في الصورة؟','What should the image show?')}<textarea className={styles.creatorPrompt} value={prompt} maxLength={1000} disabled={locked&&busy!=='quote'} dir="auto" placeholder={t('مثال: رسم واضح لأجزاء الزهرة، دون كتابة أو تسميات، على خلفية فاتحة.','For example: a clear diagram of the parts of a flower, without text or labels, on a light background.')} onChange={e=>{setPrompt(e.target.value);setQuote(null);request.current=null}}/></label>
   {choices.length>1&&<fieldset className={styles.qualityChoice} disabled={locked&&busy!=='quote'}>
    <legend>{t('جودة الصورة','Image quality')}</legend>
    <div>{choices.map(choice=><label key={choice.quality}>
     <input type="radio" name="asasera-image-quality" value={choice.quality} checked={prefs?.imageQuality===choice.quality} onChange={()=>void chooseQuality(choice.quality)}/>
     <span>{quality(choice.quality)}</span>
     <small dir="auto">{t(`≈ ${count(choice.outputTokens)} رمز`,`≈ ${count(choice.outputTokens)} tokens`)}</small>
    </label>)}</div>
    <p>{t('الجودة الأولى تكفي معظم الرسوم التعليمية. يُحفظ اختيارك للصور القادمة.','The first tier suits most teaching diagrams. Your choice is remembered for future images.')}</p>
   </fieldset>}
   {busy==='quote'&&<p role="status">{t('جارٍ حساب التكلفة…','Estimating cost…')}</p>}
   {pending&&<LoadingIndicator label={job?.state==='checking'?t('جارٍ فحص الصورة…','Checking the image…'):t('جارٍ إنشاء الصورة… يمكنك إغلاق النافذة والعودة إلى الطلب نفسه.','Creating the image… You can close this window and return to the same request.')}/>}
   {job?.state==='succeeded'&&job.imageUrl&&<><img src={mediaUrl(job.imageUrl)} alt={t('صورة أنشأها الذكاء الاصطناعي للمراجعة','AI-created image for review')} onLoad={()=>setImageReady(true)} onError={()=>{setImageReady(false);setError(t('تعذّر تحميل الصورة. أغلق النافذة وافتحها لتحديث الرابط.','Could not load the image. Close and reopen this window to refresh its link.'))}}/><label className={styles.reviewCheck}><input type="checkbox" checked={reviewed} onChange={e=>setReviewed(e.target.checked)}/>{t('راجعت دقة الصورة وملاءمتها للدرس وتوافقها مع سياسة الوسائط.','I checked the image for accuracy, suitability, and compliance with the media policy.')}</label><p>{t('صور تعليمية بلا أشخاص؛ لا يُسمح بتصوير النساء أو الفتيات وفق سياسة المنصة.','Use people-free educational images. Depictions of women or girls are not allowed by the platform media policy.')}</p></>}
   {job?.state==='needs_review'&&<p role="alert">{t('تعذّر التأكد من نتيجة المزوّد أو تكلفتها. الرصيد محجوز للمراجعة، ولم نكرر الطلب. تواصل مع المسؤول مع رقم الطلب:','The provider outcome or cost needs review. Credits remain reserved; the request has not been repeated. Contact your administrator with request ID:')} <bdi>{job.id}</bdi></p>}
   {job&&['failed','cancelled'].includes(job.state)&&<p role="alert">{t('لم نتمكن من تجهيز صورة معتمدة. لم تُخصم تكلفة من رصيدك لهذا الطلب.','We could not prepare an approved image. You were not charged for this request.')}</p>}
   {error&&<p className={styles.error} role="alert">{error}</p>}
  </div>
  <footer className={styles.dialogFooter}>
   <p>{quote&&!job?t(`${quality(quote.imageQuality)}${quote.outputTokens===null?'':` · ≈ ${count(quote.outputTokens)} رمز إخراج`} لهذه الصورة. لا يُحتسب شيء إن لم تُجهَّز الصورة.`,`${quality(quote.imageQuality)}${quote.outputTokens===null?'':` · ≈ ${count(quote.outputTokens)} output tokens`} for this image. Nothing is counted if no image is delivered.`):job?.outputTokens!=null&&job.settledAiCredits!=null?t(`استُهلك ${count(job.outputTokens)} رمز إخراج.`,`Used ${count(job.outputTokens)} output tokens.`):''}{quote&&!quote.affordable&&<span> {t('الرصيد غير كافٍ.','Not enough credit.')} <Link to="/teacher/billing" className={styles.creatorUpgrade}>{t('أضف رصيدًا','Add credit')}</Link></span>}</p>
   {!jobId?<Button variant="primary" icon={<Sparkles size={18}/>} loading={busy==='submit'} disabled={!!busy||(!request.current&&(!quote?.affordable||Date.parse(quote.expiresAt)<=Date.now()))} onClick={()=>void generate()}>{saved?t('استئناف الطلب','Resume request'):t('أنشئ الصورة','Generate image')}</Button>:job?.state==='succeeded'?<><Button onClick={newImage}>{t('أنشئ صورة أخرى','Create another')}</Button><Button variant="primary" icon={<Check size={18}/>} disabled={!reviewed||!imageReady||!job.imageKey} onClick={()=>{if(job.imageKey){onImage(job.imageKey);sessionStorage.removeItem(storageKey);onClose()}}}>{t('استخدم هذه الصورة','Use this image')}</Button></>:job&&['failed','cancelled'].includes(job.state)?<Button onClick={newImage}>{t('طلب جديد','New request')}</Button>:<Button onClick={onClose}>{t('تابع التحرير','Continue editing')}</Button>}
   {error&&!saved&&!jobId&&<Button onClick={()=>setQuoteVersion(v=>v+1)}>{t('حدّث التقدير','Refresh estimate')}</Button>}
  </footer>
 </dialog>,document.body)
}

export function ImageQuestionEntry({activityId,questionId,onImage,onPrepare}:{activityId:number;questionId:number;onImage:(key:string)=>void;onPrepare:()=>Promise<unknown>}){
 const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),uploader=useRef<HTMLDivElement>(null),upload=useUploadProgress(),[create,setCreate]=useState(false)
 return <section className={styles.imageEntry} aria-label={ar?'صورة السؤال':'Question image'}><ImagePlus size={40}/><h2>{ar?'ابدأ بصورة':'Start with an image'}</h2><p>{ar?'ارفع صورة أو أنشئ واحدة بالذكاء الاصطناعي. بعدها غطِّ النصوص، وحدّد مناطق الإجابات، وأضف التسميات التي يسحبها الطالب.':'Upload a picture or create one with AI. Then cover existing text, place answer areas, and add the labels learners will drag.'}</p><div className={styles.entryActions}><Button variant="primary" icon={<Upload size={18}/>} disabled={upload.busy} onClick={()=>uploader.current?.querySelector('input')?.click()}>{ar?'ارفع صورة':'Upload image'}</Button><Button icon={<Sparkles size={18}/>} disabled={upload.busy} onClick={()=>setCreate(true)}>{ar?'أنشئ بالذكاء الاصطناعي':'Create with AI'}</Button></div><p>PNG, JPG, WebP · {ar?'حتى 5 ميجابايت':'Up to 5 MB'}</p><div ref={uploader}><ImageUpload imageKey={null} compact showPreview={false} onImage={onImage} onProgress={upload.onProgress}/></div><UploadBar state={upload.state} label={ar?'تجهيز الصورة':'Preparing image'}/>{create&&<ImageCreator activityId={activityId} questionId={questionId} onPrepare={onPrepare} onImage={onImage} onClose={()=>setCreate(false)}/>}</section>
}
