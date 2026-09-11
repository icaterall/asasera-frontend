import {useEffect,useId,useRef,useState} from 'react'
import {useTranslation} from 'react-i18next'
import {api,getAccessToken} from '@/lib/api'
import {Button} from '@/design'
import {ButtonSpinner} from '@/design/ButtonSpinner'
import {Check,ShieldCheck,ImageUp,TriangleAlert,Images,Plus} from 'lucide-react'
import ui from './ImageUpload.module.css'
import styles from './Editor.module.css'
export const mediaUrl=(path:string)=>(path.startsWith('/api/')?(import.meta.env.VITE_API_URL??'').replace(/\/$/,''):'')+path
export function useImage(key:string|null){
  const [url,setUrl]=useState<string|null>(null)
  useEffect(()=>{let alive=true;setUrl(null);if(key)void api.post<{url:string}>('/api/v1/activity-media/resolve',{key}).then(r=>{if(alive)setUrl(mediaUrl(r.url))}).catch(()=>{});return()=>{alive=false}},[key])
  return url
}
type UploadStatus={status:'UPLOADING'|'PROCESSING'|'APPROVED'|'REJECTED'|'REVIEW_REQUIRED'|'FAILED';stage:string;objectKey?:string;errorCode?:string}
export function ImageUpload({imageKey,onImage,onRemove,showPreview=true,label,onBusyChange,compact=false,question=false}:{imageKey:string|null;onImage:(key:string)=>void;onRemove?:()=>void;showPreview?:boolean;label?:string;onBusyChange?:(busy:boolean)=>void;compact?:boolean;question?:boolean}){
  const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),url=useImage(imageKey),labelId=useId(),input=useRef<HTMLInputElement>(null)
  const [phase,setPhase]=useState<'idle'|'uploading'|'checking'|'ready'|'error'>('idle'),[progress,setProgress]=useState(0),[error,setError]=useState(''),[filename,setFilename]=useState(''),[pending,setPending]=useState<number|null>(null)
  const [maxBytes,setMaxBytes]=useState(5*1024*1024),[dragging,setDragging]=useState(false)
  const controller=useRef<AbortController|null>(null),busy=phase==='uploading'||phase==='checking',busyCallback=useRef(onBusyChange);busyCallback.current=onBusyChange
  useEffect(()=>()=>{controller.current?.abort();busyCallback.current?.(false)},[])
  function uploadBytes(file:File,grant:{uploadUrl:string;local:boolean},signal:AbortSignal){return new Promise<void>((resolve,reject)=>{
    const xhr=new XMLHttpRequest(),abort=()=>xhr.abort();xhr.open('PUT',mediaUrl(grant.uploadUrl));xhr.timeout=90000;xhr.setRequestHeader('Content-Type',file.type)
    if(grant.local)xhr.setRequestHeader('Authorization',`Bearer ${getAccessToken()}`)
    xhr.upload.onprogress=e=>{if(e.lengthComputable)setProgress(Math.round(e.loaded/e.total*100))}
    xhr.onload=()=>xhr.status>=200&&xhr.status<300?resolve():reject(Error('upload_failed'))
    xhr.onerror=()=>reject(Error('upload_failed'));xhr.ontimeout=()=>reject(Error('upload_failed'));xhr.onabort=()=>reject(Error('cancelled'))
    xhr.onloadend=()=>signal.removeEventListener('abort',abort);signal.addEventListener('abort',abort,{once:true});xhr.send(file)
  })}
  async function check(id:number,signal:AbortSignal){
    setPhase('checking');setPending(id)
    let result=await api.post<UploadStatus>(`/api/v1/activity-media/uploads/${id}/confirm`,undefined,{signal})
    const started=Date.now()
    while(result.status==='PROCESSING'||result.status==='UPLOADING'){
      if(Date.now()-started>120000)throw Error('checking_delayed')
      await new Promise<void>((resolve,reject)=>{const abort=()=>{clearTimeout(timer);reject(Error('cancelled'))},timer=setTimeout(()=>{signal.removeEventListener('abort',abort);resolve()},1200);signal.addEventListener('abort',abort,{once:true});if(signal.aborted)abort()})
      result=await api.get<UploadStatus>(`/api/v1/activity-media/uploads/${id}/status`,{signal})
    }
    if(signal.aborted)throw Error('cancelled')
    if(result.status==='APPROVED'&&result.objectKey){setPending(null);onImage(result.objectKey);setPhase('ready');return}
    setPending(null)
    throw Error(result.status==='REVIEW_REQUIRED'?'review':result.status==='REJECTED'?'rejected':result.errorCode==='invalid_image'?'invalid_image':'check_failed')
  }
  async function run(file?:File){
    if(controller.current)return
    let limitBytes=maxBytes
    const control=new AbortController();controller.current=control;onBusyChange?.(true);setError('')
    try{
      if(file){
        if(!['image/png','image/jpeg','image/webp'].includes(file.type)||!file.size)throw Error('invalid_image')
        setPhase('uploading');setProgress(0);setFilename(file.name);setPending(null)
        let limits:{pipelineVersion:number;maxBytes:number;contentTypes:string[]}
        try{limits=await api.get('/api/v1/activity-media/limits',{signal:control.signal})}catch{throw Error('pipeline_unavailable')}
        limitBytes=limits.maxBytes;setMaxBytes(limitBytes)
        if(limits.pipelineVersion!==1)throw Error('pipeline_unavailable')
        if(!limits.contentTypes.includes(file.type)||file.size>limits.maxBytes)throw Error('invalid_image')
        const grant=await api.post<{assetId:number;uploadUrl:string;local:boolean}>('/api/v1/activity-media/uploads',{contentType:file.type,byteSize:file.size,filename:file.name}, {signal:control.signal})
        await uploadBytes(file,grant,control.signal);await check(grant.assetId,control.signal)
      }else if(pending)await check(pending,control.signal)
    }catch(e){if(control.signal.aborted)return;const code=e instanceof Error?e.message:'';setPhase('error');setError(code==='pipeline_unavailable'?(ar?'رفع الصور غير متاح مؤقتًا. يرجى المحاولة بعد تحديث الخدمة.':'Image uploads are temporarily unavailable while the service is being updated.'):code==='invalid_image'?(ar?`اختر صورة PNG أو JPEG أو WebP سليمة بحجم أقصى ${limitBytes/1024/1024} MB.`:`Choose a valid PNG, JPEG or WebP image up to ${limitBytes/1024/1024} MB.`):code==='rejected'?(ar?'هذه الصورة غير مناسبة للاستخدام التعليمي. اختر صورة أخرى.':'This image is not suitable for classroom use. Choose another image.'):code==='review'?(ar?'تحتاج هذه الصورة إلى مراجعة، ولا يمكن استخدامها حاليًا. اختر صورة أخرى.':'This image needs review and cannot be used yet. Choose another image.'):code==='upload_failed'?(ar?'تعذّر رفع الصورة. تحقق من الاتصال ثم أعد المحاولة.':'Upload interrupted. Check your connection and choose the image again.'):code==='check_failed'?(ar?'تعذّر إكمال فحص الصورة. حاول مرة أخرى لاحقًا.':'We could not complete the image check. Please try again later.'):(ar?'لم يكتمل التحقق بعد. يمكنك المتابعة والتحقق مرة أخرى.':'Checking has not finished. You can keep editing and check again.'))
    }finally{controller.current=null;onBusyChange?.(false)}
  }
  const heading=phase==='uploading'?(ar?'جارٍ رفع الصورة…':'Uploading image…'):phase==='checking'?(ar?'جارٍ التحقق من الصورة…':'Checking your image…'):phase==='ready'?(ar?'الصورة جاهزة':'Image ready'):(ar?'الصورة غير جاهزة':'Image not ready')
  return <section className={compact?ui.compact:question?`${ui.question} ${dragging?ui.dragging:''}`:styles.imageUpload}
    onDragOver={question?e=>{e.preventDefault();if(!busy)setDragging(true)}:undefined}
    onDragLeave={question?e=>{if(!e.currentTarget.contains(e.relatedTarget as Node|null))setDragging(false)}:undefined}
    onDrop={question?e=>{e.preventDefault();setDragging(false);if(busy)return;if(e.dataTransfer.files.length>1){setPhase('error');setError(ar?'اختر صورة واحدة فقط.':'Choose one image at a time.');return}const file=e.dataTransfer.files[0];if(file)void run(file)}:undefined}
    aria-busy={busy} aria-labelledby={label&&!question?labelId:undefined} aria-label={label&&question?label:undefined} data-image-upload="">
    {question&&!imageKey&&!busy&&<div className={ui.invitation}><Images size={58} strokeWidth={1.5} aria-hidden="true"/><button type="button" className={ui.plus} aria-label={ar?'أضف صورة للسؤال':'Add question image'} onClick={()=>input.current?.click()}><Plus size={32}/></button><strong>{ar?'أضف صورة للسؤال':'Find and insert an image'}</strong></div>}
    {/* In the question editor the tile already says "Find and insert an image",
        so the caption would be the same instruction twice; the section keeps the
        label as its accessible name instead. The review card has no such tile,
        so there the caption is still the only thing naming the control. */}
    {label&&!question&&<span id={labelId} className={styles.imageUploadCaption}>{label}</span>}
    {showPreview&&url&&<img src={url} alt={ar?'الصورة المرفقة':'Attached image'} className={styles.editorImage}/>}
    {phase!=='idle'&&<div className={`${ui.status} ${phase==='checking'?ui.checking:''} ${phase==='error'?ui.error:''} ${phase==='ready'?ui.ready:''}`}>
      <span className={ui.icon}>{busy?<ButtonSpinner/>:phase==='ready'?<Check/>:<TriangleAlert/>}</span>
      <div className={ui.copy}><strong role="status" aria-live="polite">{heading}{phase==='uploading'&&<bdi> {progress}%</bdi>}</strong><span className={ui.filename} dir="auto">{filename}</span>
      {busy&&<><small>{phase==='uploading'?(ar?'سيتم التحقق منها بعد اكتمال الرفع.':'We’ll check it once the upload finishes.'):(ar?'يمكنك متابعة تحرير بقية السؤال.':'You can keep editing the rest of your question.')}</small><div className={ui.track} role="progressbar" aria-label={heading} aria-valuemin={0} aria-valuemax={100} aria-valuenow={phase==='uploading'?progress:undefined}><div className={ui.fill} style={phase==='uploading'?{width:`${progress}%`}:undefined}/></div></>}
      {error&&<small role="alert">{error}</small>}</div>
    </div>}
    <div className={ui.actions}>
      {question&&!imageKey&&!busy&&<div className={ui.dropCopy}><button type="button" onClick={()=>input.current?.click()}>{ar?'رفع ملف':'Upload file'}</button> {ar?'أو اسحب الصورة هنا':'or drag here to upload'}</div>}
      {!compact&&(!question||!!imageKey||busy)&&<Button disabled={busy} loading={busy} icon={<ImageUp size={18}/>} onClick={()=>input.current?.click()}>{busy?heading:imageKey?(ar?'استبدل الصورة':'Replace image'):(ar?'أضف صورة':'Add an image')}</Button>}
      <input ref={input} className={ui.input} type="file" aria-label={ar?'اختر صورة':'Choose image'} accept="image/png,image/jpeg,image/webp" disabled={busy} tabIndex={-1} onChange={e=>{const file=e.target.files?.[0];if(file)void run(file);e.target.value=''}}/>
      {pending&&phase==='error'&&<Button icon={<ShieldCheck size={18}/>} onClick={()=>void run()}>{ar?'تحقق مرة أخرى':'Check again'}</Button>}
      {imageKey&&onRemove&&<Button disabled={busy} variant="quiet" onClick={()=>{onRemove();setPhase('idle')}}>{ar?'إزالة الصورة':'Remove image'}</Button>}
    </div>
  </section>
}
