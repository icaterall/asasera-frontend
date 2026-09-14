import {useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Button} from '@/design'
import styles from './PresentationImage.module.css'

/** Retry the same approved media URL only after an explicit learner action. */
export function PresentationImage({src,alt,className}:{src:string;alt:string;className?:string}){
 const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar')
 const [failedSource,setFailedSource]=useState<string|null>(null)
 const [attempt,setAttempt]=useState(0)
 if(failedSource===src)return <div className={styles.fallback} dir={ar?'rtl':'ltr'} lang={i18n.language}>
  <p role="status">{ar?'الصورة غير متاحة.':'Image unavailable.'} <bdi>{alt}</bdi></p>
  <Button aria-label={`${ar?'إعادة تحميل الصورة':'Retry image'}: ${alt}`} onClick={()=>{setFailedSource(null);setAttempt(value=>value+1)}}>{ar?'إعادة تحميل الصورة':'Retry image'}</Button>
 </div>
 return <img key={`${src}:${attempt}`} className={className} src={src} alt={alt} onError={()=>setFailedSource(src)}/>
}
