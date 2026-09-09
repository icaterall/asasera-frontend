import {AccountControl} from '@/components/layout/AccountControl'
import {LanguageToggle} from '@/components/ui/LanguageToggle'
import {Logo} from '@/components/ui/Logo'
import {useAuth} from '@/hooks/useAuth'
import {ActivityFeedbackModal} from '@/features/community/ActivityFeedbackModal'
import {acknowledgeQuestion, acknowledgeTitle, draftKey, editorDraftSchema, emptyEditorDraft, hasEditorChanges, readDraft, storeEditorDraft, type EditorDraft} from './session-drafts'
import {ActivityAudience} from '@/features/audience/ActivityAudience'
import {Menu,Settings,TriangleAlert,Check,Palette,Share2,MessageSquare,Sparkles} from 'lucide-react'
import {useTranslation} from 'react-i18next'
import {useEditorText} from './useEditorText'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { Button, EmptyState, FailureState, LoadingState, Select } from '@/design'
import {
  activities,
  type ActivityRecord,
  type ErrorPairRecord,
  type PublicationProblem,
  type QuestionRecord,
} from '@/lib/api'
import {errorPairSlots} from '@/shared/error-pairs'
import {AdvancedCanvas,defaultPayload} from './AdvancedCanvas'
import {GenerationPanel} from './GenerationPanel'
import {ImageUpload} from './ImageUpload'
import type {QuestionKindWire} from '@/lib/api'
import styles from './Editor.module.css'
import { McqCanvas, TfCanvas, type McqOption } from './McqCanvas'
import { useAutosave } from './useAutosave'
import { ThemePicker } from '../activity-themes/ThemePicker'
import { ActivityStage, ThemeThumbnail } from '../activity-themes/ActivityStage'
import { getActivityTheme } from '../activity-themes/catalog'

/**
 * The four-region editor — plan §12 (p20), W03.
 *
 *   1 top bar      title · settings · save state in place · exit · publish
 *   2 question rail ordered thumbnails, duplicate/delete, Add and Generate
 *   3 canvas        prompt → media → options, as the pupil sees them
 *   4 properties    defaults already filled; advanced only if you want it
 *
 * The acceptance criterion is that a teacher can author and publish five
 * questions WITHOUT opening region 4. Everything region 4 holds is already
 * populated — multiple choice, twenty seconds — so it is a place to change a
 * default, not a place to supply one.
 */

const DEFAULT_MCQ = () => ({
  options: [
    { key: 'opt_a', text: '' },
    { key: 'opt_b', text: '' },
    { key: 'opt_c', text: '' },
    { key: 'opt_d', text: '' },
  ],
  correct: 'opt_a',
})

type Loaded = {
  activity: ActivityRecord
  questions: QuestionRecord[]
  errorPairs: ErrorPairRecord[]
}

function SaveIndicator({ state }: { state: ReturnType<typeof useAutosave>['state'] }) {
  const t=useEditorText()
  /*
   * One place, always in the same place (§12). `aria-live="polite"` so a
   * screen-reader user hears "saved" without being interrupted mid-sentence,
   * and `role="alert"` only for the failure, which does need interrupting.
   */
  switch (state.status) {
    case 'idle':
      return <span className={styles.saveState} aria-live="polite" />
    case 'dirty':
      return <span className={`${styles.saveState} ${styles.saveDirty}`} aria-live="polite">{t("تغييرات غير محفوظة")}</span>
    case 'saving':
      return <span className={`${styles.saveState} ${styles.saveSaving}`} aria-live="polite">{t("جارٍ الحفظ…")}</span>
    case 'saved':
      return <span className={`${styles.saveState} ${styles.saveSaved}`} aria-live="polite"><Check size={18} aria-hidden="true"/>{t("محفوظ")}</span>
    case 'failed':
      return (
        <span className={`${styles.saveState} ${styles.saveFailed}`} role="alert">
          {t("تعذّر الحفظ — تعديلك لم يُفقد")}
          <Button variant="quiet" onClick={state.retry} style={{ minHeight: 32, padding: '0 8px' }}>
            {t("أعد المحاولة")}
          </Button>
        </span>
      )
  }
}

export default function ActivityEditor() {
  const {id} = useParams<{id: string}>(), {user} = useAuth()
  return <ActivityEditorWorkspace key={`${user?.id}:${id}`}/>
}

function ActivityEditorWorkspace() {
  const t=useEditorText(),{i18n}=useTranslation(),ar=i18n.language.startsWith('ar')
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const activityId = Number(id)
  const [searchParams, setSearchParams] = useSearchParams()
  const {user} = useAuth()
  const recoveryKey = draftKey(user?.id, `activity:${activityId}`)
  const journal = useRef<EditorDraft>(emptyEditorDraft())
  const [recovered, setRecovered] = useState(false)
  const [recoveryConflict, setRecoveryConflict] = useState(false)
  const [storageError, setStorageError] = useState(false)
  const persist = useCallback((next: EditorDraft) => {
    journal.current = next
    setStorageError(!storeEditorDraft(recoveryKey, next))
  }, [recoveryKey])
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const requestedQuestion = Number(searchParams.get('question'))

  const [data, setData] = useState<Loaded | null>(null)
  /*
   * A mirror of `data` that is always current.
   *
   * `patchActive` used to close over the `active` memo, and React had not
   * necessarily re-rendered between two fast edits — so the second edit was
   * computed from a stale question and wrote the FIRST one's text back over
   * the new one. The visible symptom was a prompt that vanished after typing
   * an option, which looks like a save bug and is not one.
   *
   * A ref is read at call time, so there is no window in which it is behind.
   */
  const dataRef = useRef<Loaded | null>(null)
  const baseTitle=useRef('')
  const changeData=(update:(current:Loaded|null)=>Loaded|null)=>{const next=update(dataRef.current);dataRef.current=next;setData(next)}
  const [loadError, setLoadError] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<number | null>(null)
  const [problems, setProblems] = useState<PublicationProblem[]>([])
  const [generationOpen,setGenerationOpen]=useState(false)
  const [generationOpening,setGenerationOpening]=useState(false)
  const [themesOpen,setThemesOpen]=useState(false)
  const [publishing, setPublishing] = useState(false)
  /*
   * Editor actions that failed.
   *
   * Every one of these used to be a bare `await` inside an onClick. When
   * "add a question" started failing server-side, the click did nothing at all
   * — no message, no spinner, no console error the teacher would ever see —
   * and the only symptom was a button that appeared not to work. An action
   * that fails has to say so.
   */
  const [actionBusy,setActionBusy]=useState(false)
  const actionInFlight=useRef(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [railOpen, setRailOpen] = useState(false)
  const [chooseHotspot,setChooseHotspot]=useState(false)
  const [propsOpen, setPropsOpen] = useState(false)
  const promptRef = useRef<HTMLTextAreaElement>(null)
  useEffect(()=>{
    if((!railOpen&&!propsOpen)||!matchMedia('(max-width:1024px)').matches)return
    const previous=document.activeElement as HTMLElement|null
    const drawer=document.querySelector<HTMLElement>('[data-editor-drawer="open"]')
    const focusable=()=>Array.from(drawer?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href]')??[])
    focusable()[0]?.focus()
    const key=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){setRailOpen(false);setPropsOpen(false)}
      if(event.key==='Tab'){const items=focusable(),first=items[0],last=items.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}}
    }
    document.addEventListener('keydown',key)
    return()=>{document.removeEventListener('keydown',key);previous?.focus()}
  },[railOpen,propsOpen])


  const reload = useCallback(async () => {
    try {
      const loaded = await activities.load(activityId)
      baseTitle.current = loaded.activity.title
      const draft = readDraft(recoveryKey, editorDraftSchema) ?? emptyEditorDraft()
      journal.current = draft
      const needsReview = hasEditorChanges(draft)
      setRecovered(needsReview)
      setRecoveryConflict(!!(draft.title && draft.title.base !== loaded.activity.title) || Object.entries(draft.questions).some(([id, entry]) => loaded.questions.find(q => q.id === Number(id))?.revision !== entry.baseRevision))
      if (draft.title) loaded.activity = {...loaded.activity, title: draft.title.value}
      loaded.questions = loaded.questions.map(question => {
        const entry = draft.questions[question.id]
        if (!entry) return question
        const {errorPairs, confirmZones: _confirmZones, ...fields} = entry.patch
        loaded.errorPairs = [...loaded.errorPairs.filter(pair => pair.questionId !== question.id), ...errorPairs.map(pair => ({...pair, questionId: question.id}))]
        return {...question, ...fields}
      })
      if (needsReview && loaded.questions.some(q => q.id === draft.activeQuestionId)) setActiveId(draft.activeQuestionId)
      dataRef.current = loaded
      setData(loaded)
      setLoadError(null)
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : '')
    }
  }, [activityId,recoveryKey])

  useEffect(() => { void reload() }, [reload])

  useEffect(() => {
    if (data && activeId === null && data.questions.length > 0) setActiveId(data.questions.find(q => q.id === requestedQuestion)?.id ?? data.questions[0]!.id)
  }, [data, activeId, requestedQuestion])

  const activeIdRef = useRef<number | null>(null)
  useLayoutEffect(()=>{dataRef.current=data;activeIdRef.current=activeId},[data,activeId])

  const active = useMemo(
    () => data?.questions.find((q) => q.id === activeId) ?? null,
    [data, activeId],
  )

  /* ---- autosave ---------------------------------------------------------
   * The whole active question is the unit. Field-level saves would multiply
   * the out-of-order problem by the number of fields for no benefit — the
   * request is small either way. */
  const questionSave = useAutosave<{ id: number; patch: Record<string, unknown> }>({
    save: async ({ id: questionId, patch }) => {
      const current=dataRef.current?.questions.find(q=>q.id===questionId)
      const { question } = await activities.updateQuestion(questionId, {...patch,expectedRevision:current?.revision})
      changeData((current) => current && ({
        ...current,
        questions: current.questions.map((q) => (q.id === question.id ? {...q,revision:question.revision} : q)),
      }))
      persist(acknowledgeQuestion(readDraft(recoveryKey, editorDraftSchema) ?? journal.current, questionId, patch, question.revision))
    },
  })

  const titleSave = useAutosave<string>({
    save: async (title) => {
      const { activity } = await activities.update(activityId, { title,expectedTitle:baseTitle.current })
      baseTitle.current=activity.title
      persist(acknowledgeTitle(readDraft(recoveryKey, editorDraftSchema) ?? journal.current, title))
      changeData((current) => current && { ...current, activity:{...activity,title:current.activity.title} })
    },
  })

  /**
   * Applies an edit locally and queues the WHOLE question for saving.
   *
   * Not the changed field alone. `useAutosave` keeps one pending value and a
   * later `change()` replaces it, so a per-field patch meant that typing a
   * prompt and then an option text sent only the option — the prompt was
   * silently dropped on the floor, and the teacher saw «محفوظ» while the
   * server held the old text. Sending the full editable state makes each save
   * idempotent and complete, and the request is a few hundred bytes either
   * way.
   */
  const patchActive = useCallback((patch: Record<string, unknown>) => {
    /* Read through the refs, never the render-time closure — see dataRef. */
    const currentId = activeIdRef.current
    const current = dataRef.current?.questions.find((q) => q.id === currentId)
    if (!current) return
    const next = { ...current, ...patch } as QuestionRecord
    const slots=errorPairSlots(next.kind,next.payload)
    changeData(current=>current&&({...current,errorPairs:current.errorPairs.filter(pair=>pair.questionId!==next.id||slots.some(s=>s.elementKey===pair.elementKey&&s.wrongTargetKey===pair.wrongTargetKey))}))
    /* Local state moves immediately so typing is not gated on the network;
       `saved` still waits for the server (see useAutosave). */
    changeData((current) => current && ({
      ...current,
      questions: current.questions.map((q) => (q.id === next.id ? next : q)),
    }))
    const edit = {
      id: next.id,
      patch: {
        kind: next.kind,
        prompt: next.prompt,
        payload: next.payload as Record<string, unknown>,
        timeLimitS: next.timeLimitS,
        mediaKey:next.mediaKey,
        confirmZones:patch.confirmZones===true,
        errorPairs:(dataRef.current?.errorPairs??[]).filter(p=>p.questionId===next.id).map(({elementKey,wrongTargetKey,reason})=>({elementKey,wrongTargetKey,reason})),
      },
    }
    persist({...journal.current, activeQuestionId: next.id, questions: {...journal.current.questions, [next.id]: {baseRevision: journal.current.questions[next.id]?.baseRevision ?? current.revision, patch: edit.patch}}})
    if (!recovered) questionSave.change(edit)
  }, [questionSave, persist, recovered])

  /**
   * Changing the active question FLUSHES the pending save first.
   *
   * `useAutosave` holds one pending value and a later `change()` replaces it,
   * so editing question 1 and clicking question 2 inside the debounce window
   * silently discarded question 1's edit — the rail still showed the text,
   * because that is local state, while the server had never received it. It
   * surfaced as four questions publishing as «بلا نص» after they had visibly
   * been typed.
   *
   * Awaiting the flush also means the switch is ordered: question 1's save is
   * in flight before question 2's first keystroke can queue anything.
   */
  const selectQuestion = useCallback(async (nextId: number | null) => {
    if (!recovered) await questionSave.flushNow()
    setActiveId(nextId)
    activeIdRef.current = nextId
    persist({...journal.current, activeQuestionId: nextId})
    setSearchParams(previous => { const params = new URLSearchParams(previous); if (nextId) params.set('question', String(nextId)); else params.delete('question'); return params }, {replace: true})
    setRailOpen(false)
  }, [questionSave, recovered, persist, setSearchParams])

  const payload = (active?.payload ?? {}) as { options?: McqOption[]; correct?: string | boolean }

  const setReasonPair = useCallback((elementKey: string, wrongTargetKey:string|null,reason: string) => {
    if (!active) return
    changeData((current) => {
      if (!current) return current
      const others = current.errorPairs.filter(
        (p) => !(p.questionId === active.id && p.elementKey === elementKey && p.wrongTargetKey === wrongTargetKey),
      )
      return {
        ...current,
        errorPairs: reason.trim().length > 0
          ? [...others, { questionId: active.id, elementKey, wrongTargetKey, reason }]
          : others,
      }
    })
    patchActive({})
  }, [active,patchActive])

  /** Wraps an editor action so a failure is reported rather than swallowed. */
  const run = useCallback(async (what: string, action: () => Promise<void>) => {
    if(actionInFlight.current)return
    actionInFlight.current=true;setActionBusy(true);setActionError(null)
    try {
      if (recovered) throw new Error(ar ? 'راجع التعديلات المستعادة واحفظها أولًا.' : 'Review and save your recovered edits first.')
      await questionSave.flushNow();await titleSave.flushNow()
      await action()
    } catch (error) {
      setActionError(`${what}: ${error instanceof Error ? error.message : t("خطأ غير معروف")}`)
    }finally{actionInFlight.current=false;setActionBusy(false)}
  }, [questionSave,titleSave,t,recovered,ar])

  const openGeneration = async () => {
    if (actionInFlight.current) return
    setGenerationOpening(true)
    try {
      await run(t("تعذّر حفظ التعديلات"), async () => {await reload();setGenerationOpen(true)})
    } finally {setGenerationOpening(false)}
  }

  const addQuestion = useCallback((kind: 'mcq' | 'tf') => run(t("تعذّرت إضافة السؤال"), async () => {
    /* The question being left may have an unsaved edit queued. */
    await questionSave.flushNow()
    const { question } = await activities.addQuestion(activityId, {
      kind,
      prompt: '',
      payload: kind === 'mcq' ? DEFAULT_MCQ() : { correct: true },
    })
    changeData((current) => current && { ...current, questions: [...current.questions, question] })
    await selectQuestion(question.id)
    setRailOpen(false)
    /* Focus lands on the prompt, because that is the next thing to type. */
    requestAnimationFrame(() => promptRef.current?.focus())
  }), [activityId, run, questionSave,selectQuestion,t])

  const publish = useCallback(async () => {
    if (recovered) {setActionError(ar ? 'راجع التعديلات المستعادة واحفظها قبل النشر.' : 'Review and save your recovered edits before publishing.'); return}
    setPublishing(true)
    setProblems([])
    try {
      /* Anything still in the debounce window goes first — publishing text the
         server has not seen would validate the wrong content. */
      await questionSave.flushNow()
      await titleSave.flushNow()
      const result = await activities.publish(activityId)
      changeData((current) => current && { ...current, activity: result.activity })
    } catch (error) {
      /* The project's one error envelope: ApiError carries `details`. */
      const detail = (error as { details?: { problems?: PublicationProblem[] } })?.details
      if (detail?.problems) {
        setProblems(detail.problems)
        const first = detail.problems.find((p) => p.questionId != null)
        if (first?.questionId != null) setActiveId(first.questionId)
      } else {
        setProblems([{
          code: 'unknown',
          message: 'Publishing failed.',
          messageAr: error instanceof Error ? error.message : t("تعذّر النشر."),
        }])
      }
    } finally {
      setPublishing(false)
    }
  }, [activityId, questionSave, titleSave,t,recovered,ar])

  async function saveRecovered() {
    if (actionInFlight.current) return
    actionInFlight.current = true; setActionBusy(true); setActionError(null)
    try {
      // A save started before this editor remounted can still acknowledge its
      // older snapshot. Read the journal again to pick up that confirmed base.
      const stored = readDraft(recoveryKey, editorDraftSchema)
      if (stored) {
        if (stored.title && journal.current.title?.base === baseTitle.current) baseTitle.current = stored.title.base
        journal.current = stored
      }
      for (const [id, entry] of Object.entries(journal.current.questions)) {
        const questionId = Number(id), current = dataRef.current?.questions.find(q => q.id === questionId)
        if (!current) throw new Error(ar ? 'حُذف أحد الأسئلة المستعادة. استخدم النسخة المحفوظة لإزالة هذه المسودة.' : 'A recovered question was deleted. Use the saved version to discard this draft.')
        const {question} = await activities.updateQuestion(questionId, {...entry.patch, expectedRevision: Math.max(current.revision, entry.baseRevision)})
        changeData(value => value && ({...value, questions: value.questions.map(q => q.id === questionId ? {...q, revision: question.revision} : q)}))
        persist(acknowledgeQuestion(readDraft(recoveryKey, editorDraftSchema) ?? journal.current, questionId, entry.patch, question.revision))
      }
      const title = journal.current.title?.value
      if (title !== undefined) {
        const {activity} = await activities.update(activityId, {title, expectedTitle: baseTitle.current})
        baseTitle.current = activity.title
        persist(acknowledgeTitle(readDraft(recoveryKey, editorDraftSchema) ?? journal.current, title))
      }
      setRecovered(false)
    } catch (error) {setActionError(error instanceof Error ? error.message : (ar ? 'تعذّر الحفظ. مسودتك محفوظة في هذه الجلسة.' : 'Saving failed. Your draft is kept in this session.'))}
    finally {actionInFlight.current = false; setActionBusy(false)}
  }

  if (loadError !== null) {
    return (
      <div className="asas" style={{ padding: 'var(--s-6)' }}>
        <FailureState title={t("تعذّر فتح النشاط")} body={loadError || t("تعذّر تحميل النشاط")}
          actions={<Button variant="primary" onClick={() => void reload()}>{t("أعد المحاولة")}</Button>} />
      </div>
    )
  }
  if (!data) {
    return <LoadingState variant="editor" layout="page" label={ar ? 'جارٍ تحميل نشاطك…' : 'Loading your activity…'} />
  }

  const incompleteIds = new Set(problems.map((p) => p.questionId).filter((x): x is number => x != null))

  return (
    <div className={`asas ${styles.shell}`} dir={ar ? 'rtl' : 'ltr'}>
      {feedbackOpen && <ActivityFeedbackModal activityId={activityId} title={data.activity.title} onClose={() => setFeedbackOpen(false)} onReview={async questionId => {
        if (questionId && !data.questions.some(q => q.id === questionId)) throw new Error(ar ? 'هذا السؤال غير موجود في المسودة الحالية.' : 'This question is no longer in the current draft.')
        if (questionId) await selectQuestion(questionId)
        setFeedbackOpen(false)
      }}/>}
      {themesOpen&&<ThemePicker value={data.activity.theme} published={!!data.activity.currentVersionId} onClose={()=>setThemesOpen(false)} onApply={async(theme)=>{
        await questionSave.flushNow();await titleSave.flushNow()
        const latest=await activities.load(activityId)
        const result=await activities.update(activityId,{theme,expectedRevision:latest.activity.revision})
        baseTitle.current=result.activity.title
        changeData(current=>current&&({...current,activity:result.activity}))
      }}/>}
      {generationOpen&&<GenerationPanel activity={data.activity} question={active} onClose={()=>setGenerationOpen(false)} onApplied={reload}/>}
      {/* ---- 1. top bar ---- */}
      <header className={styles.top}>
        <Link to="/teacher/dashboard" className={styles.brand} aria-label={ar ? 'أساسيرا — لوحة التحكم' : 'Asasera — dashboard'}>
          <Logo />
        </Link>
        <div className={styles.activityIdentity}>
        <input
          className={styles.titleInput}
          value={data.activity.title}
          disabled={actionBusy}
          aria-label={t("عنوان النشاط")}
          onChange={(event) => {
            const title = event.target.value
            changeData((current) => current && { ...current, activity: { ...current.activity, title } })
            persist({...journal.current, title: {value: title, base: journal.current.title?.base ?? baseTitle.current}, activeQuestionId: activeIdRef.current})
            if (!recovered) titleSave.change(title)
          }}
        />

        <SaveIndicator state={['failed','saving','dirty'].includes(questionSave.state.status)?questionSave.state:titleSave.state.status==='idle'?questionSave.state:titleSave.state} />

        </div>
        <div className={styles.accountControls}>
          <LanguageToggle className={styles.languageToggle} />
          <AccountControl />
        </div>
        <div className={styles.editorActions} role="group" aria-label={ar ? 'أدوات النشاط' : 'Activity actions'}>
        <Button variant="quiet" className={styles.drawerToggle} onClick={() => setRailOpen((v) => !v)}
          aria-expanded={railOpen} aria-label={t("الأسئلة")}><Menu size={22} aria-hidden="true"/></Button>
        <Button variant="quiet" className={styles.drawerToggle} onClick={() => setPropsOpen((v) => !v)}
          aria-expanded={propsOpen} aria-label={t("الخصائص")}><Settings size={22} aria-hidden="true"/></Button>

        <Button variant="secondary" disabled={actionBusy||publishing||recovered} onClick={()=>setThemesOpen(true)}><Palette size={18} aria-hidden="true"/>{ar?'المظاهر':'Themes'}</Button>
        <Button variant="secondary" onClick={() => recovered ? navigate('/teacher/dashboard') : void run(t("تعذّر حفظ التعديلات"),async()=>navigate('/teacher/dashboard'))}>{t("خروج")}</Button>
        <Button variant="quiet" onClick={() => setFeedbackOpen(true)}><MessageSquare size={18} aria-hidden="true" />{ar?'الملاحظات':'Feedback'}</Button>
        {data.activity.visibility === 'published' && <Button variant="secondary" onClick={() => void run(t("تعذّر حفظ التعديلات"),async()=>navigate(`/activities/${activityId}`))}><Share2 size={18} aria-hidden="true" />{ar?'مشاركة':'Share'}</Button>}
        {data.activity.currentVersionId && <Button variant="secondary" onClick={() => navigate(`/teacher/activities/${activityId}/play`)}>{t("شغّل الحصة")}</Button>}
        <Button variant="primary" loading={publishing} onClick={() => void publish()}>
          {data.activity.visibility === 'published' ? t("إعادة النشر") : t("انشر")}
        </Button>
        </div>
      </header>

      <ActivityAudience activity={data.activity} onSave={async value=>{
        await questionSave.flushNow();await titleSave.flushNow()
        const latest=await activities.load(activityId)
        if(JSON.stringify([latest.activity.categoryId,latest.activity.educationStageIds,latest.activity.countryIds])!==JSON.stringify([data.activity.categoryId,data.activity.educationStageIds,data.activity.countryIds]))throw new Error(ar?'تغيّر الجمهور في جلسة أخرى. أعد فتح النشاط قبل الحفظ.':'The audience changed in another session. Reopen the activity before saving.')
        const result=await activities.update(activityId,{...value,expectedRevision:latest.activity.revision})
        changeData(current=>current&&({...current,activity:{...result.activity,title:current.activity.title}}))
      }}/>

      {/* ---- 2. question rail ---- */}
      {(railOpen || propsOpen) && <div className={styles.backdrop}
        onClick={() => { setRailOpen(false); setPropsOpen(false) }} />}

      <nav inert={actionBusy} className={styles.rail} data-editor-drawer={railOpen?"open":"closed"} aria-label={t("أسئلة النشاط")}>
        <Button className={styles.drawerToggle} onClick={()=>setRailOpen(false)}>{t("أغلق قائمة الأسئلة")}</Button>
        {data.questions.map((question) => (
          <button
            key={question.id}
            type="button"
            data-question-thumb=""
            className={[
              styles.thumb,
              question.id === activeId ? styles.thumbActive : '',
              incompleteIds.has(question.id) ? styles.thumbIncomplete : '',
            ].filter(Boolean).join(' ')}
            aria-current={question.id === activeId ? 'true' : undefined}
            onClick={() => { void selectQuestion(question.id).catch(error => setActionError(error instanceof Error ? error.message : t("تعذّر حفظ السؤال"))) }}
          >
            {incompleteIds.has(question.id) && <span className={styles.thumbFlag} aria-label={t("يحتاج إكمالًا")}><TriangleAlert size={18} aria-hidden="true"/></span>}
            <span className={styles.thumbOrdinal} dir="ltr">{question.ordinal}</span>
            <span className={styles.thumbPrompt}>{question.prompt || t("سؤال بلا نص")}</span>
          </button>
        ))}

        <div className={styles.railActions}>
          <Button variant="primary" full onClick={() => { void addQuestion('mcq') }}>{t("أضف سؤالًا")}</Button>
          <Button variant="secondary" full className={styles.generateButton} loading={generationOpening} disabled={actionBusy||publishing} icon={<Sparkles size={18} aria-hidden="true"/>} aria-describedby="activity-ai-generation-hint" onClick={()=>void openGeneration()}>{t("توليد بالذكاء الاصطناعي")}</Button>
          <p id="activity-ai-generation-hint" className={styles.generateHint}>{ar?'من موضوع أو من مصادرك المرفوعة.':'From a topic or your uploaded sources.'}</p>
        </div>
      </nav>

      {/* ---- 3. canvas ---- */}
      <ActivityStage as="main" theme={data.activity.theme} variant="editor" inert={actionBusy} className={styles.canvas}>
        <div className={styles.canvasInner}>
          {recovered && <section className={styles.recovery} aria-label={ar ? 'استرداد التعديلات' : 'Recovered edits'}>
            <p role="status">{recoveryConflict ? (ar ? 'استعدنا تعديلاتك، لكن النسخة المحفوظة تغيّرت. راجع المسودة قبل استبدالها.' : 'Your edits were restored, but the saved version has changed. Review your draft before replacing it.') : (ar ? 'استعدنا تعديلاتك غير المحفوظة. أكمل من حيث توقفت.' : 'Your unsaved edits were restored. Continue where you left off.')}</p>
            <div><Button variant="primary" loading={actionBusy} onClick={() => void saveRecovered()}>{ar ? 'حفظ التعديلات المستعادة' : 'Save recovered edits'}</Button><Button disabled={actionBusy} onClick={() => {setActionBusy(true); persist(emptyEditorDraft()); void reload().finally(() => setActionBusy(false))}}>{ar ? 'استخدام النسخة المحفوظة' : 'Use saved version'}</Button></div>
          </section>}
          {storageError && <p role="alert" className={styles.recovery}>{ar ? 'تعذّر الاحتفاظ بنسخة استرداد. أبقِ الصفحة مفتوحة حتى يكتمل الحفظ.' : 'This browser could not keep a recovery copy. Keep this page open until saving finishes.'}</p>}
          {actionError && (
            <div className={styles.problems} role="alert">
              <h2 className={styles.problemsTitle}>{actionError}</h2>
            </div>
          )}

          {problems.length > 0 && (
            <div className={styles.problems} role="alert">
              <h2 className={styles.problemsTitle}>{ar?'النشر متوقّف':'Publication blocked'} — {problems.length}</h2>
              <ul className={styles.problemList}>
                {problems.map((problem, index) => (
                  <li key={index} className={styles.problemItem}>
                    {problem.questionId != null ? (
                      <button type="button" className={styles.problemJump}
                        onClick={() => { void run(t("تعذّر حفظ السؤال"),()=>selectQuestion(problem.questionId!)) }}>
                        {ar?problem.messageAr:problem.message}
                      </button>
                    ) : (ar?problem.messageAr:problem.message)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!active ? (
            <EmptyState
              title={t("لا أسئلة بعد")}
              body={t("أضف سؤالًا لتبدأ. النوع والمؤقّت مضبوطان مسبقًا.")}
              actions={<Button variant="primary" onClick={() => { void addQuestion('mcq') }}>{t("أضف سؤالًا")}</Button>}
            />
          ) : (
            <>
              <textarea
                ref={promptRef}
                className={styles.promptInput}
                value={active.prompt}
                placeholder={t("اكتب السؤال هنا")}
                aria-label={t("نص السؤال")}
                onChange={(event) => patchActive({ prompt: event.target.value })}
              />

              {active.kind!=='hotspot'&&active.kind!=='mcq'&&<ImageUpload label={ar?'صورة السؤال (اختياري)':'Question image (optional)'} imageKey={active.mediaKey} onImage={mediaKey=>patchActive({mediaKey})} onRemove={()=>patchActive({mediaKey:null})}/>}
              {['order','match','hotspot'].includes(active.kind)&&<AdvancedCanvas key={active.id} question={active} pairs={data.errorPairs.filter(p=>p.questionId===active.id)} onPatch={patchActive} onPair={setReasonPair}/>}
              {active.kind === 'mcq' && (
                <McqCanvas
                  key={active.id}
                  mediaKey={active.mediaKey}
                  onMediaChange={mediaKey=>patchActive({mediaKey})}
                  options={(payload.options ?? []) as McqOption[]}
                  correct={String(payload.correct ?? '')}
                  onOptionImage={(key,image)=>patchActive({payload:{...payload,options:(payload.options??[]).map(o=>o.key===key?{...o,image}:o)}})}
                  onOptionText={(key, text) => patchActive({
                    payload: {
                      ...payload,
                      options: (payload.options ?? []).map((o) => (o.key === key ? { ...o, text } : o)),
                    },
                  })}
                  onCorrect={(key) => patchActive({ payload: { ...payload, correct: key } })}
                />
              )}

              {active.kind === 'tf' && (
                <TfCanvas
                  correct={Boolean(payload.correct)}
                  onCorrect={(value) => patchActive({ payload: { correct: value } })}
                />
              )}
            </>
          )}
        </div>
      </ActivityStage>

      {/* ---- 4. properties ---- */}
      <aside inert={actionBusy} className={styles.props} data-editor-drawer={propsOpen?"open":"closed"} aria-label={t("خصائص السؤال")}>
        <Button className={styles.drawerToggle} onClick={()=>setPropsOpen(false)}>{t("أغلق الخصائص")}</Button>
        <div className={styles.propGroup}>
          <label htmlFor="question-kind" className={styles.propLabel}>{t("نوع السؤال")}</label>
          <Select id="question-kind"
            className={styles.select}
            value={active?.kind ?? 'mcq'}
            disabled={!active}
            onValueChange={(event) => {
              const kind = event as QuestionKindWire
              if(kind==='hotspot'&&!active?.mediaKey){setChooseHotspot(true);return}
              setChooseHotspot(false);patchActive({ kind, payload:defaultPayload(kind,active?.mediaKey??'') })
            }}
          >
            <option value="mcq">{t("اختيار من متعدد")}</option>
            <option value="tf">{t("صح / خطأ")}</option>
            <option value="order">{t("ترتيب العناصر")}</option>
            <option value="match">{t("مطابقة البطاقات")}</option>
            <option value="hotspot">{t("مناطق الصورة")}</option>
          </Select>
          {chooseHotspot&&<><p>{t("أضف الصورة أولًا لرسم مناطق الإجابة.")}</p><ImageUpload imageKey={null} onImage={mediaKey=>{patchActive({kind:'hotspot',mediaKey,payload:defaultPayload('hotspot',mediaKey)});setChooseHotspot(false)}}/></>}
          <span className={styles.propHint}>
            {t("الافتراضي اختيار من متعدد. لا تحتاج فتح هذه اللوحة لتأليف نشاط ونشره.")}
          </span>
        </div>

        <div className={styles.propGroup}>
          <span className={styles.propLabel}>{t("المؤقّت")}</span>
          <div className={styles.duration}>
            <input
              className={styles.select}
              type="number"
              min={5}
              max={300}
              dir="ltr"
              value={active?.timeLimitS ?? 20}
              disabled={!active}
              aria-label={t("مدة السؤال بالثواني")}
              onChange={(event) => patchActive({ timeLimitS: Number(event.target.value) })}
            />
            <span className={styles.propHint}>{t("ثانية")}</span>
          </div>
          {/* §12: «طبّق على الكل» directly under the duration. */}
          <Button
            variant="quiet"
            className={styles.applyAll}
            disabled={!active}
            onClick={() => void run(t("تعذّر تطبيق المدة على الكل"), async () => {
              if (!active || !data) return
              const seconds = active.timeLimitS
              await Promise.all(
                data.questions.filter((q) => q.id !== active.id)
                  .map((q) => activities.updateQuestion(q.id, { timeLimitS: seconds,expectedRevision:q.revision })),
              )
              await reload()
            })}
          >
            {t("طبّق على الكل")}
          </Button>
        </div>

        <div className={styles.propGroup}>
          <span className={styles.propLabel}>{t("مظهر الحصة")}</span>
          <button type="button" className={styles.themeTrigger} disabled={recovered} onClick={()=>{setPropsOpen(false);setThemesOpen(true)}}><ThemeThumbnail key={data.activity.theme} theme={data.activity.theme}/><span>{ar?getActivityTheme(data.activity.theme).ar:getActivityTheme(data.activity.theme).en}<Palette size={18} aria-hidden="true"/></span></button>
        </div>
        <div className={styles.propsFooter}>
          {data.activity.currentVersionId&&<Button onClick={()=>void run(t("تعذّر الحفظ"),async()=>navigate(`/teacher/verification?question=${active?.id??0}`))}>{t("اربط سؤال تحقق")}</Button>}
          <div className={styles.thumbActions}><Button disabled={!active||active.ordinal===1} onClick={()=>void run(t("تعذّر ترتيب الأسئلة"),async()=>{if(!active)return;const order=data.questions.map(q=>q.id),index=order.indexOf(active.id);[order[index-1],order[index]]=[order[index]!,order[index-1]!];await activities.reorder(activityId,order);await reload()})}>{t("للأعلى")}</Button><Button disabled={!active||active.ordinal===data.questions.length} onClick={()=>void run(t("تعذّر ترتيب الأسئلة"),async()=>{if(!active)return;const order=data.questions.map(q=>q.id),index=order.indexOf(active.id);[order[index+1],order[index]]=[order[index]!,order[index+1]!];await activities.reorder(activityId,order);await reload()})}>{t("للأسفل")}</Button></div>
          <Button
            variant="secondary"
            full
            disabled={!active}
            onClick={() => void run(t("تعذّر تكرار السؤال"), async () => {
              if (!active) return
              const { question } = await activities.duplicateQuestion(active.id)
              await reload()
              await selectQuestion(question.id)
            })}
          >
            {t("تكرار السؤال")}
          </Button>
          <Button
            variant="danger"
            full
            disabled={!active}
            onClick={() => void run(t("تعذّر حذف السؤال"), async () => {
              if (!active) return
              await activities.deleteQuestion(active.id)
              const questions = {...journal.current.questions}; delete questions[active.id]
              persist({...journal.current, questions, activeQuestionId: null})
              setActiveId(null)
              await reload()
            })}
          >
            {t("حذف السؤال")}
          </Button>
        </div>
      </aside>
    </div>
  )
}
