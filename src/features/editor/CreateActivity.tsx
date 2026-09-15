import {Link} from 'react-router-dom'
import creationStyles from './GenerationPanel.module.css'
import {AudienceCategoryField,AudienceCountriesField,AudienceLoadFailure,AudienceStagesField} from '@/features/audience/AudienceFields'
import {useAudienceForm} from '@/features/audience/useAudienceForm'
import { useRef, useState, type FormEvent } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { activities, taxonomy } from '@/lib/api'
import { defaultActivityTheme } from '@/features/activity-themes/catalog'
import { ActivityGameChoice } from './ActivityGameChoice'
import type { PresentationId } from '@/shared/presentation'
import { Button, FailureState, LoadingState, Select } from '@/design'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useAuth } from '@/hooks/useAuth'
import { useSessionDraft } from './useSessionDraft'
import { creationDraftSchema, draftKey, encodeGenerationDraft } from './session-drafts'
/* The launch screen's furniture, reused rather than redrawn: numbered step
   headings, the activity header with its count chip, and the ready bar. The
   two screens a teacher meets on the way to a lesson should be one design. */
import setup from '@/features/delivery/Delivery.module.css'
import {ActivityLanguageField} from './ActivityLanguageField'
import {contentLanguageSchema,defaultContentLanguage} from '@/shared/content-language'

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
  const [initialLanguage]=useState(()=>defaultContentLanguage(i18n.language))
  const draft=useSessionDraft(draftKey(user?.id,'new'),{title:'',purpose:'',audience:null,contentLanguage:initialLanguage},creationDraftSchema)
  const {title,purpose}=draft.value
  /* The interface language is the default, and stays the default until the
     teacher says otherwise — see `contentLanguageChosen` in session-drafts. */
  const contentLanguage=(draft.value.contentLanguageChosen&&draft.value.contentLanguage)||initialLanguage
  const languageValid=contentLanguageSchema.safeParse(contentLanguage).success
  const setTitle=(title:string)=>draft.update(current=>({...current,title}))
  const setPurpose=(purpose:string)=>draft.update(current=>({...current,purpose}))
  const presentationIds=(draft.value.presentationIds??[]) as PresentationId[]
  const setPresentationIds=(presentationIds:PresentationId[])=>draft.update(current=>({...current,presentationIds}))
  const audience=useAudienceForm(draft.value.audience??undefined,value=>draft.update(current=>({...current,audience:value})))
  const [error, setError] = useState(''), [busy, setBusy] = useState(false), submitting = useRef(false)
  const refs = useQuery({ queryKey: ['activity-creation-reference'], queryFn: async () => {
    return taxonomy.purposes()
  } })
  useDocumentTitle(ar ? 'إنشاء نشاط' : 'Create activity')
  async function create(event: FormEvent) {
    event.preventDefault()
    if(submitting.current||!title.trim()||!languageValid)return
    if(!audience.optionalReady){setError(ar?'أكمل الفئة والمرحلة أو امسح الاختيار الاختياري.':'Complete the category and stage, or clear the optional audience selection.');return}
    submitting.current = true; setBusy(true); setError('')
    try {
      /* Send the audience only when it is complete; an absent audience lets the
         server infer one from the profile or file the activity as general. */
      const chosen = audience.ready ? {...audience.value, categoryId: audience.value.categoryId!} : {}
      const { activity } = await activities.create({ title: title.trim() || (ar?'نشاط جديد':'Untitled quiz'), contentLanguage:contentLanguageSchema.parse(contentLanguage), ...chosen, purposeId: purpose ? Number(purpose) : null, theme: defaultActivityTheme(), ...(presentationIds.length?{presentationIds}:{}) })
      draft.clear(draft.value)
      void client.invalidateQueries({ queryKey: ['owned-activities'] })
      const generate = `?generate=1&choose=1${materialRevisionId?`&draft=${encodeGenerationDraft({origin:'file',task:'questions',materialRevisionId})}`:''}`
      navigate(`/teacher/activities/${activity.id}${generate}`)
    } catch (e) { setError(e instanceof Error ? e.message : (ar ? 'تعذّر إنشاء النشاط. حاول مرة أخرى.' : 'Your activity couldn’t be created. Please try again.')) }
    finally { submitting.current = false; setBusy(false) }
  }
  const steps=[1,2,3] as const
  const ready=!!title.trim()&&audience.optionalReady&&languageValid
  return <section className={`asas ${setup.setup}`} dir={ar?'rtl':'ltr'}>
    <Link className={setup.backLink} to="/teacher/activities">← {ar?'أنشطتي':'My activities'}</Link>
    <header className={setup.activityHeader}>
      <div>
        <h1>{ar?'أنشئ نشاطًا جديدًا':'Create a new activity'}</h1>
        <p>{ar?'سمِّ نشاطك وحدد جمهوره، ثم اختر الألعاب التي سيُكتب لها — والأسئلة تأتي بعد ذلك.':'Name your activity and choose who it is for, then pick the games it is written for — the questions come next.'}</p>
      </div>
      <div className={setup.questionCount} aria-label={ar?`${steps.length} خطوات`:`${steps.length} steps`}>
        <strong>{steps.length}</strong><span>{ar?'خطوات':'Steps'}</span>
      </div>
    </header>

    {materialId&&materialRevisionId&&<p role="status" className={creationStyles.sourceNotice}>{ar?'سيُفتح المحرّر جاهزًا لتوليد الأسئلة من المادة التي اخترتها.':'The editor will open ready to generate questions from the material you chose.'}</p>}
    {draft.storageError&&<p role="alert" className={creationStyles.sourceNotice}>{ar?'تعذّر حفظ نسخة الاسترداد في هذا المتصفح. أبقِ الصفحة مفتوحة حتى يكتمل الحفظ.':'This browser could not keep a recovery copy. Keep the page open until saving finishes.'}</p>}

    {refs.isPending ? <LoadingState variant="form" rows={3} label={ar ? 'جارٍ التحميل' : 'Loading activity settings'} />
     : refs.error ? <FailureState title={ar ? 'تعذّر تحميل المواد والمراحل' : 'Activity settings couldn’t load'} body={ar ? 'حاول مرة أخرى للبدء.' : 'Try again to get started.'} actions={<Button onClick={() => void refs.refetch()}>{ar ? 'إعادة المحاولة' : 'Try again'}</Button>} />
     : <form onSubmit={event=>void create(event)} aria-busy={busy}>

      <div className={setup.sectionHeading}><span aria-hidden="true">1</span><div>
        <h2>{ar?'اسم النشاط وتصنيفه':'Name and category'}</h2>
      </div></div>
      <fieldset className={creationStyles.stepFields} disabled={busy}>
        <AudienceLoadFailure form={audience}/>
        <div className={creationStyles.fieldRow} data-cols="3">
          <div className={creationStyles.textField}>
            <label htmlFor="activity-name">{ar ? 'اسم النشاط' : 'Activity name'}</label>
            <input id="activity-name" className={creationStyles.textInput} autoFocus required maxLength={200} value={title} onChange={e => setTitle(e.target.value)} placeholder={ar ? 'مثلًا: مغامرة الكسور' : 'For example: The fractions adventure'} />
          </div>
          <AudienceCategoryField form={audience} disabled={busy} optional/>
          {/* One setting is not a settings drawer: hiding a single dropdown
              behind "More settings" cost a click and told the teacher nothing
              about what was inside. */}
          <div className={creationStyles.textField}>
            <label htmlFor="activity-purpose">{ar ? 'الغرض التعليمي (اختياري)' : 'Teaching purpose (optional)'}</label>
            <Select id="activity-purpose" value={purpose} onValueChange={e => setPurpose(e)} disabled={busy}><option value="">{ar ? 'بلا غرض محدد' : 'No purpose chosen'}</option>{refs.data.purposes.map(p => <option key={p.id} value={p.id}>{ar ? p.nameAr : p.nameEn}</option>)}</Select>
          </div>
        </div>
      </fieldset>

      <div className={setup.sectionHeading}><span aria-hidden="true">2</span><div>
        <h2>{ar?'لمن هذا النشاط؟':'Who is it for?'}</h2>
      </div></div>
      <fieldset className={creationStyles.stepFields} disabled={busy}>
        <div className={creationStyles.fieldRow} data-cols="3">
          {/* No standing hints under these three: the step description above
              already says they are optional, and three paragraphs of small type
              buried the fields themselves. The half-filled-audience warning
              still appears, because that one is actionable. */}
          <AudienceStagesField form={audience} disabled={busy} optional hints={false}/>
          <AudienceCountriesField form={audience} disabled={busy} hints={false}/>
          <ActivityLanguageField value={contentLanguage} onChange={contentLanguage=>draft.update(current=>({...current,contentLanguage,contentLanguageChosen:true}))} disabled={busy} hint={false}/>
        </div>
      </fieldset>

      <div className={`${setup.sectionHeading} ${creationStyles.stepGames}`}><span aria-hidden="true">3</span><div>
        <h2>{ar?'أي لعبة سيُكتب لها؟':'Which games is it written for?'}</h2>
        <p>{ar?'اختياري، ويمكنك اختيار أكثر من لعبة. كل بطاقة تقول نوع الأسئلة التي تحتاجها، وسيقبل النشاط ما تقبله الألعاب المختارة.':'Optional, and you can choose more than one. Each card says which question types it needs, and the activity accepts what the chosen games play.'}</p>
      </div></div>
      <ActivityGameChoice value={presentationIds} onChange={setPresentationIds} disabled={busy}/>

      {error&&<p role="alert" className={creationStyles.stepError}>{error}</p>}

      <footer className={setup.launchBar}>
        <div>
          <span>{ar?'جاهز للإنشاء':'Ready to create'}</span>
          <strong>{title.trim()||(ar?'نشاط بلا اسم بعد':'Not named yet')}{presentationIds.length?` · ${presentationIds.length} ${ar?(presentationIds.length===1?'لعبة':'ألعاب'):(presentationIds.length===1?'game':'games')}`:''}</strong>
          <small>{ar?'ستنتقل إلى المحرّر لكتابة الأسئلة أو توليدها من مادتك.':'You will go to the editor to write the questions or generate them from your material.'}</small>
        </div>
        <span className={creationStyles.stepActions}>
          <Button variant="quiet" disabled={busy} onClick={() => {draft.clear(); navigate('/teacher/activities')}}>{ar ? 'حذف المسودة' : 'Discard draft'}</Button>
          <Button type="submit" variant="primary" loading={busy} disabled={!ready}>{ar ? 'التالي' : 'Next'}</Button>
        </span>
      </footer>
    </form>}
  </section>

}
