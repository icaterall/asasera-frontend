import {useState} from 'react'
import {ChevronDown,Users} from 'lucide-react'
import {useTranslation} from 'react-i18next'
import {Button} from '@/design'
import type {ActivityRecord,AudienceSelection} from '@/lib/api'
import {AudienceFields} from './AudienceFields'
import {useAudienceForm} from './useAudienceForm'
import styles from './Audience.module.css'

export function ActivityAudience({activity,onSave}:{activity:ActivityRecord;onSave:(value:AudienceSelection)=>Promise<void>}) {
  const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),[open,setOpen]=useState(false)
  return <details className={styles.editor} onToggle={event=>setOpen(event.currentTarget.open)}>
    <summary><Users size={18} aria-hidden="true"/>{ar?'التصنيف والجمهور':'Category & audience'}<ChevronDown size={16} aria-hidden="true"/></summary>
    {open&&<AudienceEditForm activity={activity} onSave={onSave}/>}
  </details>
}
function AudienceEditForm({activity,onSave}:{activity:ActivityRecord;onSave:(value:AudienceSelection)=>Promise<void>}) {
  const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar')
  const form=useAudienceForm({categoryId:activity.categoryId,educationStageIds:activity.educationStageIds??[],countryIds:activity.countryIds??[]})
  const [busy,setBusy]=useState(false),[savedValue,setSavedValue]=useState(''),[error,setError]=useState('')
  return <form aria-busy={busy} onSubmit={async event=>{
    event.preventDefault();if(busy||!form.ready)return
    setBusy(true);setError('');setSavedValue('')
    try{await onSave(form.value);setSavedValue(JSON.stringify(form.value))}catch(cause){setError(cause instanceof Error?cause.message:(ar?'تعذّر الحفظ. حاول مرة أخرى.':'Couldn’t save. Try again.'))}finally{setBusy(false)}
  }}>
    <AudienceFields form={form} disabled={busy}/>
    {activity.currentVersionId&&<p>{ar?'أعد نشر النشاط لتطبيق هذه التغييرات على النسخة المشتركة.':'Republish the activity to update the shared version.'}</p>}
    {error&&<p role="alert">{error}</p>}
    <div className={styles.actions}><Button type="submit" variant="primary" loading={busy} disabled={!form.ready}>{ar?'حفظ الجمهور':'Save audience'}</Button><span role="status">{savedValue===JSON.stringify(form.value)?(ar?'تم حفظ الجمهور.':'Audience saved.'):''}</span></div>
  </form>
}
