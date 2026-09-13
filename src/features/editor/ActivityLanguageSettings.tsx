import {useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Button} from '@/design'
import type {ActivityRecord} from '@/lib/api'
import {contentLanguageSchema,defaultContentLanguage} from '@/shared/content-language'
import {ActivityLanguageField} from './ActivityLanguageField'

export function ActivityLanguageSettings({activity,onSave}:{activity:ActivityRecord;onSave:(language:string)=>Promise<void>}){
 const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar')
 const [value,setValue]=useState(()=>activity.contentLanguage??defaultContentLanguage(i18n.language))
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[saved,setSaved]=useState(false)
 const valid=contentLanguageSchema.safeParse(value).success
 return <form aria-label={ar?'إعداد لغة النشاط':'Activity language settings'} aria-busy={busy} onSubmit={async event=>{
  event.preventDefault();if(!valid||busy)return
  setBusy(true);setError('');setSaved(false)
  try{await onSave(contentLanguageSchema.parse(value));setSaved(true)}catch(cause){setError(cause instanceof Error?cause.message:(ar?'تعذّر حفظ اللغة. حاول مرة أخرى.':'Couldn’t save the language. Try again.'))}finally{setBusy(false)}
 }}>
  <ActivityLanguageField value={value} onChange={next=>{setValue(next);setSaved(false)}} disabled={busy}/>
  <p>{ar?'يؤثر التغيير على التوليد القادم فقط، ولا يترجم الأسئلة الموجودة. عند استخراج أسئلة من ملف تبقى صياغتها الأصلية.':'Changes apply to future generation, not existing questions. Extracting questions from a file preserves their original wording.'}</p>
  {error&&<p role="alert">{error}</p>}
  <div><Button type="submit" variant="primary" loading={busy} disabled={!valid}>{ar?'حفظ اللغة':'Save language'}</Button></div>
  {saved&&<p role="status">{ar?'تم حفظ لغة النشاط.':'Activity language saved.'}</p>}
 </form>
}
