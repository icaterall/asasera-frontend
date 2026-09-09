import {AudienceFields} from '@/features/audience/AudienceFields'
import {useAudienceForm} from '@/features/audience/useAudienceForm'
import { useRef, useState, type FormEvent } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { activities, taxonomy } from '@/lib/api'
import { Button, FailureState, LoadingState, Select } from '@/design'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useAuth } from '@/hooks/useAuth'
import { useSessionDraft } from './useSessionDraft'
import { creationDraftSchema, draftKey } from './session-drafts'
import styles from '@/features/teacher-home/TeacherHome.module.css'

export default function CreateActivity() {
  const { i18n } = useTranslation(), ar = i18n.language.startsWith('ar'), navigate = useNavigate(), client = useQueryClient()
  const { user } = useAuth()
  const draft=useSessionDraft(draftKey(user?.id,'new'),{title:'',purpose:'2',audience:null},creationDraftSchema)
  const {title,purpose}=draft.value
  const setTitle=(title:string)=>draft.update(current=>({...current,title}))
  const setPurpose=(purpose:string)=>draft.update(current=>({...current,purpose}))
  const audience=useAudienceForm(draft.value.audience??undefined,value=>draft.update(current=>({...current,audience:value})))
  const [error, setError] = useState(''), [busy, setBusy] = useState(false), submitting = useRef(false)
  const refs = useQuery({ queryKey: ['activity-creation-reference'], queryFn: async () => {
    return taxonomy.purposes()
  } })
  useDocumentTitle(ar ? 'إنشاء نشاط' : 'Create activity')
  async function create(event: FormEvent) {
    event.preventDefault()
    if (submitting.current || !title.trim() || !audience.ready) return
    submitting.current = true; setBusy(true); setError('')
    try {
      const { activity } = await activities.create({ title: title.trim(), ...audience.value,categoryId:audience.value.categoryId!, purposeId: Number(purpose) })
      draft.clear(draft.value)
      void client.invalidateQueries({ queryKey: ['owned-activities'] })
      navigate(`/teacher/activities/${activity.id}`)
    } catch (e) { setError(e instanceof Error ? e.message : (ar ? 'تعذّر إنشاء النشاط. حاول مرة أخرى.' : 'Your activity couldn’t be created. Please try again.')) }
    finally { submitting.current = false; setBusy(false) }
  }
  return <div className={`asas ${styles.page} ${styles.formPage}`}>
    <Link className={styles.backLink} to="/teacher/activities">{ar ? 'العودة إلى أنشطتي' : 'Back to my activities'}</Link>
    <header className={styles.welcome}><div><h1>{ar ? 'لنبدأ بفكرتك' : 'Start with your idea'}</h1><p>{ar ? 'سمِّ نشاطك وحدّد جمهوره. ستضيف الأسئلة وتختار طريقة اللعب بعد ذلك.' : 'Give your activity a name and choose who it’s for. You’ll add questions and choose how to play next.'}</p></div></header>
    {draft.restored&&<p role="status">{ar?'استعدنا تفاصيل نشاطك غير المحفوظة.':'Your unfinished activity details have been restored.'}</p>}
    {draft.storageError&&<p role="alert">{ar?'تعذّر حفظ نسخة الاسترداد في هذا المتصفح. أبقِ الصفحة مفتوحة حتى يكتمل الحفظ.':'This browser could not keep a recovery copy. Keep the page open until saving finishes.'}</p>}
    {refs.isPending ? <LoadingState variant="form" rows={3} label={ar ? 'جارٍ التحميل' : 'Loading activity settings'} /> : refs.error ? <FailureState title={ar ? 'تعذّر تحميل المواد والمراحل' : 'Activity settings couldn’t load'} body={ar ? 'حاول مرة أخرى للبدء.' : 'Try again to get started.'} actions={<Button onClick={() => void refs.refetch()}>{ar ? 'إعادة المحاولة' : 'Try again'}</Button>} /> : <form className={styles.createForm} onSubmit={create} aria-busy={busy}>
      <label className={styles.field}>{ar ? 'اسم النشاط' : 'Activity name'}<input autoFocus required maxLength={200} value={title} onChange={e => setTitle(e.target.value)} placeholder={ar ? 'مثلًا: مغامرة الكسور' : 'For example: The fractions adventure'} disabled={busy} /></label>
      <AudienceFields form={audience} disabled={busy}/>
      <details><summary>{ar ? 'المزيد من الإعدادات' : 'More settings'}</summary><label className={styles.field}>{ar ? 'الغرض التعليمي' : 'Teaching purpose'}<Select value={purpose} onValueChange={e => setPurpose(e)} disabled={busy}>{refs.data.purposes.map(p => <option key={p.id} value={p.id}>{ar ? p.nameAr : p.nameEn}</option>)}</Select></label></details>
      {error && <p role="alert">{error}</p>}
      <div className={styles.formActions}><Button type="submit" variant="primary" loading={busy} disabled={!title.trim() || !audience.ready}>{ar ? 'متابعة إلى الأسئلة' : 'Continue to questions'}</Button><Button variant="quiet" disabled={busy} onClick={() => {draft.clear(); navigate('/teacher/activities')}}>{ar ? 'حذف المسودة' : 'Discard draft'}</Button></div>
    </form>}
  </div>
}
