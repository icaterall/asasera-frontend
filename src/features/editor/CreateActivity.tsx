import {BackLink,TitleRow} from '@/design/BackLink'
import choiceStyles from './CreationChoices.module.css'
import creationStyles from './GenerationPanel.module.css'
import {AudienceFields} from '@/features/audience/AudienceFields'
import {useAudienceForm} from '@/features/audience/useAudienceForm'
import { useRef, useState, type FormEvent } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { activities, taxonomy } from '@/lib/api'
import { Button, FailureState, LoadingState, Select } from '@/design'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useAuth } from '@/hooks/useAuth'
import { useSessionDraft } from './useSessionDraft'
import { creationDraftSchema, draftKey, encodeGenerationDraft } from './session-drafts'
import styles from '@/features/teacher-home/TeacherHome.module.css'

/**
 * v5 §08: a title is enough to start. Audience and purpose stay optional —
 * they help organise the library later and are never a gate before the first
 * question. Arriving from a material (`?materialId=&revisionId=`) carries that
 * source straight into the editor's generation panel.
 */
export default function CreateActivity() {
  const { i18n } = useTranslation(), ar = i18n.language.startsWith('ar'), navigate = useNavigate(), client = useQueryClient()
  const { user } = useAuth()
  const [params] = useSearchParams()
  const materialRevisionId = Number(params.get('revisionId')) || null, materialId = Number(params.get('materialId')) || null
  const draft=useSessionDraft(draftKey(user?.id,'new'),{title:'',purpose:'',audience:null},creationDraftSchema)
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
    if(submitting.current||!title.trim())return
    if(!audience.optionalReady){setError(ar?'أكمل الفئة والمرحلة أو امسح الاختيار الاختياري.':'Complete the category and stage, or clear the optional audience selection.');return}
    submitting.current = true; setBusy(true); setError('')
    try {
      /* Send the audience only when it is complete; an absent audience lets the
         server infer one from the profile or file the activity as general. */
      const chosen = audience.ready ? {...audience.value, categoryId: audience.value.categoryId!} : {}
      const { activity } = await activities.create({ title: title.trim() || (ar?'نشاط جديد':'Untitled quiz'), ...chosen, purposeId: purpose ? Number(purpose) : null })
      draft.clear(draft.value)
      void client.invalidateQueries({ queryKey: ['owned-activities'] })
      const generate = `?generate=1&choose=1${materialRevisionId?`&draft=${encodeGenerationDraft({origin:'file',task:'questions',materialRevisionId})}`:''}`
      navigate(`/teacher/activities/${activity.id}${generate}`)
    } catch (e) { setError(e instanceof Error ? e.message : (ar ? 'تعذّر إنشاء النشاط. حاول مرة أخرى.' : 'Your activity couldn’t be created. Please try again.')) }
    finally { submitting.current = false; setBusy(false) }
  }
  return <div className={`asas ${styles.page} ${creationStyles.entryPage}`}>
    <header className={`${styles.welcome} ${choiceStyles.hero}`}><div style={{width:'100%'}}><TitleRow><h1>{ar?'أنشئ اختبارًا جديدًا':'Create a new quiz'}</h1><BackLink to="/teacher/activities">{ar?'العودة إلى أنشطتي':'Back to my activities'}</BackLink></TitleRow><p>{ar?'سمِّ اختبارك وحدد جمهوره، ثم اختر كيف تنشئ الأسئلة.':'Name your quiz and choose its audience, then choose how to create questions.'}</p></div></header>
    <details open className={creationStyles.optionalDetails}><summary>{ar?'تفاصيل الاختبار':'Quiz details'}</summary>
    {materialId&&materialRevisionId&&<p role="status">{ar?'سيُفتح المحرّر جاهزًا لتوليد الأسئلة من المادة التي اخترتها.':'The editor will open ready to generate questions from the material you chose.'}</p>}
    {draft.restored&&<p role="status">{ar?'استعدنا تفاصيل نشاطك غير المحفوظة.':'Your unfinished activity details have been restored.'}</p>}
    {draft.storageError&&<p role="alert">{ar?'تعذّر حفظ نسخة الاسترداد في هذا المتصفح. أبقِ الصفحة مفتوحة حتى يكتمل الحفظ.':'This browser could not keep a recovery copy. Keep the page open until saving finishes.'}</p>}
    {refs.isPending ? <LoadingState variant="form" rows={3} label={ar ? 'جارٍ التحميل' : 'Loading activity settings'} /> : refs.error ? <FailureState title={ar ? 'تعذّر تحميل المواد والمراحل' : 'Activity settings couldn’t load'} body={ar ? 'حاول مرة أخرى للبدء.' : 'Try again to get started.'} actions={<Button onClick={() => void refs.refetch()}>{ar ? 'إعادة المحاولة' : 'Try again'}</Button>} /> : <form className={styles.createForm} onSubmit={event=>void create(event)} aria-busy={busy}>
      <label className={styles.field}>{ar ? 'اسم النشاط' : 'Activity name'}<input autoFocus required maxLength={200} value={title} onChange={e => setTitle(e.target.value)} placeholder={ar ? 'مثلًا: مغامرة الكسور' : 'For example: The fractions adventure'} disabled={busy} /></label>
      <AudienceFields form={audience} disabled={busy} optional/>
      <details><summary>{ar ? 'المزيد من الإعدادات' : 'More settings'}</summary><label className={styles.field}>{ar ? 'الغرض التعليمي (اختياري)' : 'Teaching purpose (optional)'}<Select value={purpose} onValueChange={e => setPurpose(e)} disabled={busy}><option value="">{ar ? 'بلا غرض محدد' : 'No purpose chosen'}</option>{refs.data.purposes.map(p => <option key={p.id} value={p.id}>{ar ? p.nameAr : p.nameEn}</option>)}</Select><span className={styles.field} style={{fontWeight:400,color:'var(--muted)'}}>{ar ? 'يلزم غرض أو وحدة منهجية فقط عند مشاركة النشاط في المكتبة.' : 'A purpose or curriculum unit is only needed when you share the activity to the library.'}</span></label></details>
      {error&&<p role="alert">{error}</p>}
      <div className={styles.formActions}><Button type="submit" variant="primary" loading={busy} disabled={!title.trim() || !audience.optionalReady}>{ar ? 'التالي' : 'Next'}</Button><Button variant="quiet" disabled={busy} onClick={() => {draft.clear(); navigate('/teacher/activities')}}>{ar ? 'حذف المسودة' : 'Discard draft'}</Button></div>
    </form>}
    </details>
  </div>
}
