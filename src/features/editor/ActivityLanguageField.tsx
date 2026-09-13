import {useId,useRef} from 'react'
import {useTranslation} from 'react-i18next'
import {Select} from '@/design'
import styles from './ActivityLanguageField.module.css'

export function ActivityLanguageField({value,onChange,disabled=false}:{value:string;onChange:(value:string)=>void;disabled?:boolean}){
 const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),id=useId()
 const preset=value==='ar'||value==='en',custom=useRef(preset?'':value)
 return <div className={styles.field}>
  <label htmlFor={id}>{ar?'لغة النشاط':'Activity language'}</label>
  <Select id={id} value={preset?value:'other'} disabled={disabled} aria-describedby={`${id}-hint`} onValueChange={next=>onChange(next==='other'?custom.current:next)}>
   <option value="ar">{ar?'العربية':'Arabic'}</option><option value="en">{ar?'الإنجليزية':'English'}</option><option value="other">{ar?'لغة أخرى':'Other language'}</option>
  </Select>
  {!preset&&<><label htmlFor={`${id}-custom`}>{ar?'اسم اللغة':'Language name'}</label><input id={`${id}-custom`} required maxLength={80} dir="auto" value={value} disabled={disabled} placeholder={ar?'مثال: الفرنسية أو الأردية':'For example: French or Urdu'} aria-describedby={`${id}-hint`} onChange={event=>{custom.current=event.target.value;onChange(event.target.value)}}/></>}
  <p id={`${id}-hint`}>{ar?'تُحفظ مع النشاط وتُستخدم لتوليد المحتوى بالذكاء الاصطناعي. تغيير لغة الواجهة لا يغيّرها.':'Saved with this activity and used for AI-generated content. Changing the interface language won’t change this choice.'}</p>
 </div>
}
