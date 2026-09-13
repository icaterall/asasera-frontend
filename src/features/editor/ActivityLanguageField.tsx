import {useId} from 'react'
import {useTranslation} from 'react-i18next'
import {Select} from '@/design'
import {CONTENT_LANGUAGES,contentLanguageName} from '@/shared/content-language'
import styles from './ActivityLanguageField.module.css'

/**
 * The language an activity's generated content is written in.
 *
 * A LIST, NEVER A TEXT BOX. This field used to offer "Other language" beside a
 * free-text name, and typing a language is a worse job than choosing one: it
 * collects misspellings and synonyms — French, Francais, français, FR — that
 * all mean one thing to a teacher and four to a generator. The value travels
 * into a model prompt, so the set of things it can be is worth fixing.
 *
 * The list itself lives in packages/shared, mirrored into both apps, so the
 * languages offered here and the languages the server will act on cannot drift
 * apart.
 *
 * An activity saved before this change may still hold a typed name. It is kept
 * as an option of its own rather than snapped to the nearest language: showing
 * a teacher something they did not choose is worse than one odd list entry.
 */
export function ActivityLanguageField({value,onChange,disabled=false}:{value:string;onChange:(value:string)=>void;disabled?:boolean}){
 const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),id=useId()
 const known=(CONTENT_LANGUAGES as readonly string[]).includes(value)
 return <div className={styles.field}>
  <label htmlFor={id}>{ar?'لغة النشاط':'Activity language'}</label>
  <Select id={id} value={value} disabled={disabled} aria-describedby={`${id}-hint`} onValueChange={onChange}>
   {CONTENT_LANGUAGES.map(code=><option key={code} value={code}>{contentLanguageName(code,i18n.language)}</option>)}
   {!known&&value&&<option value={value}>{value}</option>}
  </Select>
  <p id={`${id}-hint`}>{ar?'تُحفظ مع النشاط وتُستخدم لتوليد المحتوى بالذكاء الاصطناعي. تغيير لغة الواجهة لا يغيّرها.':'Saved with this activity and used for AI-generated content. Changing the interface language won’t change this choice.'}</p>
 </div>
}
