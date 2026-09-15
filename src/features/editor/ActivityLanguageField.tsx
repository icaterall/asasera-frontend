import {useId} from 'react'
import {useTranslation} from 'react-i18next'
import {Select} from '@/design'
import {CONTENT_LANGUAGES,contentLanguageName} from '@/shared/content-language'
import styles from './ActivityLanguageField.module.css'

/** The language used for future generated content.
 *
 * Common languages are quick, canonical choices. "Other" remains intentionally
 * open because instructors may teach in any language; the shared schema and
 * prompt boundary validate and quote that name as data. Existing custom values
 * therefore remain editable instead of being silently replaced.
 */
export function ActivityLanguageField({value,onChange,disabled=false}:{value:string;onChange:(value:string)=>void;disabled?:boolean}){
 const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),id=useId(),customId=`${id}-custom`
 const known=(CONTENT_LANGUAGES as readonly string[]).includes(value)
 const customValue=!known&&value.trim()?value:'__other__'
 return <div className={styles.field}>
  <label htmlFor={id}>{ar?'لغة النشاط':'Activity language'}</label>
  <Select id={id} value={known?value:customValue} disabled={disabled} aria-describedby={`${id}-hint`} onValueChange={next=>onChange(next==='__other__'?'':next)}>
   {CONTENT_LANGUAGES.map(code=><option key={code} value={code}>{contentLanguageName(code,i18n.language)}</option>)}
   {!known&&customValue!=='__other__'&&<option value={customValue}>{value}</option>}
   <option value="__other__">{ar?'لغة أخرى…':'Other language…'}</option>
  </Select>
  {!known&&<label className={styles.custom} htmlFor={customId}>
   <span>{ar?'اسم اللغة':'Language name'}</span>
   <input id={customId} value={value} disabled={disabled} required maxLength={80} autoComplete="off"
    placeholder={ar?'مثال: السواحيلية':'For example: Swahili'} onChange={event=>onChange(event.target.value)}/>
  </label>}
  <p id={`${id}-hint`}>{ar?'تُحفظ مع النشاط وتُستخدم لتوليد المحتوى بالذكاء الاصطناعي. تغيير لغة الواجهة لا يغيّرها.':'Saved with this activity and used for AI-generated content. Changing the interface language won’t change this choice.'}</p>
 </div>
}
