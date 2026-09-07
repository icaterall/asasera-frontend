import {useEffect,useState} from 'react'
import {useTranslation} from 'react-i18next'
import {api,getAccessToken} from '@/lib/api'
import {Button} from '@/design'
import styles from './Editor.module.css'
export const mediaUrl=(path:string)=>(path.startsWith('/api/')?(import.meta.env.VITE_API_URL??'').replace(/\/$/,''):'')+path
export function useImage(key:string|null){
  const [url,setUrl]=useState<string|null>(null)
  useEffect(()=>{let alive=true;setUrl(null);if(key)void api.post<{url:string}>('/api/v1/activity-media/resolve',{key}).then(r=>{if(alive)setUrl(mediaUrl(r.url))}).catch(()=>{});return()=>{alive=false}},[key])
  return url
}
export function ImageUpload({imageKey,onImage,onRemove,showPreview=true}:{imageKey:string|null;onImage:(key:string)=>void;onRemove?:()=>void;showPreview?:boolean}){
  const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),url=useImage(imageKey)
  const [busy,setBusy]=useState(false),[error,setError]=useState('')
  async function upload(file:File){
    setBusy(true);setError('')
    try{
      if(!['image/png','image/jpeg'].includes(file.type)||file.size>5*1024*1024)throw Error(ar?'اختر PNG أو JPEG بحجم أقصى 5 MB.':'Choose a PNG or JPEG up to 5 MB.')
      const grant=await api.post<{assetId:number;uploadUrl:string;local:boolean}>('/api/v1/activity-media/uploads',{contentType:file.type,byteSize:file.size,filename:file.name})
      const response=await fetch(mediaUrl(grant.uploadUrl),{method:'PUT',headers:{'Content-Type':file.type,...(grant.local?{Authorization:`Bearer ${getAccessToken()}`}:{})},body:file})
      if(!response.ok)throw Error(ar?'لم يكتمل رفع الصورة. أعد المحاولة.':'Image upload failed. Retry.')
      const confirmed=await api.post<{objectKey:string}>(`/api/v1/activity-media/uploads/${grant.assetId}/confirm`)
      onImage(confirmed.objectKey)
    }catch(e){setError(e instanceof Error?e.message:'Image upload failed')}finally{setBusy(false)}
  }
  return <section className={styles.imageUpload}>
    {showPreview&&url&&<img src={url} alt={ar?'صورة السؤال':'Question image'} className={styles.editorImage}/>}
    <label className={styles.uploadLabel}>{busy?(ar?'جارٍ التحقق من الصورة…':'Checking image…'):imageKey?(ar?'استبدل الصورة':'Replace image'):(ar?'أضف صورة':'Add an image')}<input type="file" accept="image/png,image/jpeg" disabled={busy} onChange={e=>{const file=e.target.files?.[0];if(file)void upload(file);e.target.value=''}}/></label>
    <span className={styles.propHint}>PNG / JPEG · 5 MB</span>
    {imageKey&&onRemove&&<Button variant="quiet" onClick={onRemove}>{ar?'إزالة الصورة':'Remove image'}</Button>}
    {error&&<p role="alert">{error}</p>}
  </section>
}
