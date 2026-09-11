import {useState} from 'react'
import {useAuth} from '@/hooks/useAuth'
import {useSessionDraft} from '@/features/editor/useSessionDraft'
import {audienceDraftSchema,draftKey,readDraft} from '@/features/editor/session-drafts'
import {Pencil,Users} from 'lucide-react'
import {useTranslation} from 'react-i18next'
import {Button} from '@/design'
import type {ActivityRecord,AudienceSelection} from '@/lib/api'
import {AudienceFields} from './AudienceFields'
import {AudienceSummary} from './AudienceSummary'
import {useAudienceForm} from './useAudienceForm'
import styles from './Audience.module.css'

export function ActivityAudience({activity,onSave}:{activity:ActivityRecord;onSave:(value:AudienceSelection)=>Promise<void>}) {
  const {user}=useAuth()
  const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),[open,setOpen]=useState(()=>!!readDraft(draftKey(user?.id,`activity:${activity.id}:audience`),audienceDraftSchema))
  return <details open={open} className={styles.editor} onToggle={event=>setOpen(event.currentTarget.open)}>
    <summary>
      <Users size={16} aria-hidden="true"/>
      <span className={styles.summaryTitle}>{ar?'التصنيف والجمهور':'Category & audience'}</span>
      {!open&&<AudienceSummary activity={activity}/>}
      <span className={styles.summaryEdit}><Pencil size={15} aria-hidden="true"/>{open?(ar?'إغلاق':'Close'):(ar?'تعديل':'Edit')}</span>
    </summary>
    {open&&<AudienceEditForm activity={activity} onSave={onSave}/>}
  </details>
}
function AudienceEditForm({activity,onSave}:{activity:ActivityRecord;onSave:(value:AudienceSelection)=>Promise<void>}) {
  const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar')
  const {user}=useAuth()
  const draft=useSessionDraft(draftKey(user?.id,`activity:${activity.id}:audience`),{categoryId:activity.categoryId,educationStageIds:activity.educationStageIds??[],countryIds:activity.countryIds??[]},audienceDraftSchema)
  const form=useAudienceForm(draft.value,draft.update)
  const [busy,setBusy]=useState(false),[savedValue,setSavedValue]=useState(''),[error,setError]=useState('')
  return <form aria-busy={busy} onSubmit={async event=>{
    event.preventDefault();if(busy||!form.ready)return
    setBusy(true);setError('');setSavedValue('')
    try{await onSave(form.value);draft.clear(form.value);setSavedValue(JSON.stringify(form.value))}catch(cause){setError(cause instanceof Error?cause.message:(ar?'تعذّر الحفظ. حاول مرة أخرى.':'Couldn’t save. Try again.'))}finally{setBusy(false)}
  }}>
    {draft.restored&&<p role="status">{ar?'استعدنا اختيارات الجمهور غير المحفوظة.':'Your unsaved audience selections have been restored.'}</p>}
    {draft.storageError&&<p role="alert">{ar?'تعذّر الاحتفاظ بنسخة الاسترداد. أبقِ هذه الصفحة مفتوحة حتى الحفظ.':'This browser could not keep a recovery copy. Keep this page open until saving finishes.'}</p>}
    <AudienceFields form={form} disabled={busy}/>
    {activity.currentVersionId&&<p>{ar?'أعد نشر النشاط لتطبيق هذه التغييرات على النسخة المشتركة.':'Republish the activity to update the shared version.'}</p>}
    {error&&<p role="alert">{error}</p>}
    <div className={styles.actions}><Button type="submit" variant="primary" loading={busy} disabled={!form.ready}>{ar?'حفظ الجمهور':'Save audience'}</Button><span role="status">{savedValue===JSON.stringify(form.value)?(ar?'تم حفظ الجمهور.':'Audience saved.'):''}</span></div>
  </form>
}
