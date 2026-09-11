import {FormattedText} from '@/components/formatted-text/FormattedText'
import {FormattedInput} from './FormattedInput'
import {QuestionTypePicker} from './QuestionTypePicker'
import {AccountControl} from '@/components/layout/AccountControl'
import {LanguageToggle} from '@/components/ui/LanguageToggle'
import {Logo} from '@/components/ui/Logo'
import {useAuth} from '@/hooks/useAuth'
import {ActivityFeedbackModal} from '@/features/community/ActivityFeedbackModal'
import {acknowledgeQuestion, acknowledgeTitle, decodeGenerationDraft, draftKey, editorDraftSchema, emptyEditorDraft, hasEditorChanges, readDraft, storeEditorDraft, type EditorDraft, type GenerationDraft} from './session-drafts'
import {ActivityAudience} from '@/features/audience/ActivityAudience'
import {Menu,Settings,TriangleAlert,Check,Palette,Share2,MessageSquare,Sparkles,Radio,Clock,Library,X,MessageCircleQuestion,Timer,Medal,SlidersHorizontal,Plus,ArrowUp,ArrowDown,Copy,Trash2} from 'lucide-react'
import {useTranslation} from 'react-i18next'
import {useEditorText} from './useEditorText'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { Button, Select, EmptyState, FailureState, LoadingState } from '@/design'
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
import {QuestionSource,SourceMarker,readProvenance} from './SourceChip'
import {ImageUpload} from './ImageUpload'
import {MediaField} from './MediaPicker'
import styles from './Editor.module.css'
import { McqCanvas, TfCanvas, MIN_OPTIONS, MAX_OPTIONS, type McqOption } from './McqCanvas'
import { useAutosave } from './useAutosave'
import { ThemePicker } from '../activity-themes/ThemePicker'
import { ActivityStage, ThemeThumbnail } from '../activity-themes/ActivityStage'
import { getActivityTheme } from '../activity-themes/catalog'

/**
 * The four-region editor — plan §12 (p20), W03.
 *
 *   1 top bar      title · settings · save state in place · exit · approve version
 *   2 question rail ordered thumbnails, duplicate/delete, Add and Generate
 *   3 canvas        prompt → media → options → explanation, as the pupil sees them
 *   4 properties    defaults already filled; advanced only if you want it
 *
 * v5 §18: "Approve version" fixes a runnable snapshot without making anything
 * public; "Share to library" is a separate, quiet act. After approval the two
 * primary paths are "Start live" and "Assign as homework".
 *
 * The acceptance criterion is that a teacher can author and approve five
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
  const [generationReplacement,setGenerationReplacement]=useState(false)
  const generationOpener=useRef<HTMLElement|null>(null)
  const generationDrawers=useRef({rail:false,props:false})
  const [generationOpening,setGenerationOpening]=useState(false)
  /* `?generate=1&draft=…` (from the materials page) pre-fills the AI panel; consumed once. */
  const [generationDraft,setGenerationDraft]=useState<GenerationDraft|null>(null)
  const chooseOnMount=useRef(searchParams.get('choose')==='1')
  const generateOnMount=useRef(searchParams.get('generate')==='1'?(decodeGenerationDraft(searchParams.get('draft'))??{}):null)
  const [themesOpen,setThemesOpen]=useState(false)
  // The rail shows one of two faces; question properties is the working default.
  const [asideTab,setAsideTab]=useState<'properties'|'themes'>('properties')
  const [publishing, setPublishing] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [shareNotice, setShareNotice] = useState<string | null>(null)
  /* Questions whose prompt or answer changed while they carry an explanation (v5 §18): a soft reminder, never a block. */
  const [explanationCheck, setExplanationCheck] = useState<number[]>([])
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
  const [propsOpen, setPropsOpen] = useState(()=>matchMedia('(min-width:1025px)').matches)
  useEffect(()=>{const media=matchMedia('(min-width:1025px)'),change=()=>setPropsOpen(media.matches);media.addEventListener('change',change);return()=>media.removeEventListener('change',change)},[])
  const promptRef = useRef<HTMLDivElement>(null)
  useEffect(()=>{
    if((!railOpen&&!propsOpen)||!matchMedia('(max-width:1024px)').matches)return
    const previous=document.activeElement as HTMLElement|null
    const drawer=document.querySelector<HTMLElement>('[data-editor-drawer="open"]')
    const focusable=()=>Array.from(drawer?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href]')??[])
    focusable()[0]?.focus()
    const key=(event:KeyboardEvent)=>{
      if(event.target instanceof Element&&event.target.closest('dialog[open]'))return
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

  useEffect(() => {
    if (!data || !generateOnMount.current) return
    const draft = generateOnMount.current; generateOnMount.current = null
    setGenerationDraft(draft); setGenerationOpen(true)
    setSearchParams(previous => { const params = new URLSearchParams(previous); params.delete('generate'); params.delete('draft'); params.delete('choose'); return params }, {replace: true})
  }, [data, setSearchParams])

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
    // Changing answer content/type must retain the teacher's scoring choice.
    if(patch.payload&&typeof patch.payload==='object')patch={...patch,payload:{pointsMultiplier:(current.payload as {pointsMultiplier?:number}).pointsMultiplier,...patch.payload}}
    const next = { ...current, ...patch } as QuestionRecord
    if (('prompt' in patch || 'payload' in patch) && (next.explanation ?? '').trim()) setExplanationCheck(ids => ids.includes(next.id) ? ids : [...ids, next.id])
    if ('explanation' in patch) setExplanationCheck(ids => ids.filter(id => id !== next.id))
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
        /* Same key order as questionPatchSchema: the journal compares serialized patches after a zod round-trip. */
        explanation:next.explanation??null,
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

  const payload = (active?.payload ?? {}) as { options?: McqOption[]; correct?: string | boolean; pointsMultiplier?:0|1|2 }

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

  const openGeneration = async (replacement = false) => {
    if (actionInFlight.current) return
    generationOpener.current=document.activeElement instanceof HTMLElement?document.activeElement:null
    generationDrawers.current={rail:railOpen,props:propsOpen}
    setGenerationOpening(true)
    try {
      await run(t("تعذّر حفظ التعديلات"), async () => {await reload();setGenerationReplacement(replacement);setGenerationOpen(true)})
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
    if (recovered) {setActionError(ar ? 'راجع التعديلات المستعادة واحفظها قبل الاعتماد.' : 'Review and save your recovered edits before approving.'); return}
    setPublishing(true)
    setProblems([])
    setShareNotice(null)
    try {
      /* Anything still in the debounce window goes first — approving text the
         server has not seen would validate the wrong content. */
      await questionSave.flushNow()
      await titleSave.flushNow()
      const result = await activities.publish(activityId)
      changeData((current) => current && { ...current, activity: result.activity })
      setExplanationCheck([])
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
          message: error instanceof Error ? error.message : 'Approval failed.',
          messageAr: error instanceof Error ? error.message : t("تعذّر النشر."),
        }])
      }
    } finally {
      setPublishing(false)
    }
  }, [activityId, questionSave, titleSave,t,recovered,ar])

  /* v5 §18: sharing to the library is separate from approval and needs a shelf (purpose or curriculum unit). */
  const shareable = !!data && (data.activity.purposeId !== null || data.activity.curriculumNodeId !== null)
  const toggleShare = useCallback(async () => {
    if (!data) return
    setSharing(true); setShareNotice(null); setActionError(null)
    try {
      const result = data.activity.visibility === 'published' ? await activities.unpublish(activityId) : await activities.share(activityId)
      changeData(current => current && { ...current, activity: { ...result.activity, title: current.activity.title } })
      setShareNotice(result.activity.visibility === 'published' ? (ar ? 'النشاط الآن في المكتبة العامة. النسخة المعتمدة ما زالت قابلة للتشغيل.' : 'The activity is now in the public library. The approved version still runs as before.') : (ar ? 'سُحب النشاط من المكتبة. النسخة المعتمدة محفوظة وما زالت قابلة للتشغيل.' : 'Withdrawn from the library. The approved version is kept and still runs.'))
    } catch (error) {
      setActionError(`${ar ? 'تعذّرت مشاركة النشاط' : 'Could not update sharing'}: ${error instanceof Error ? error.message : t("خطأ غير معروف")}`)
    } finally { setSharing(false) }
  }, [data, activityId, ar, t])

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
    <div className={`asas ${styles.shell}`} data-props-open={propsOpen} dir={ar ? 'rtl' : 'ltr'}>
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
      {generationOpen&&<GenerationPanel startWithChoices={chooseOnMount.current} activity={data.activity} question={active} replacement={generationReplacement} provenance={readProvenance(active)??(!generationReplacement?data.questions.map(readProvenance).find(p=>p?.origin==='file'):null)??null} initialDraft={generationDraft} onClose={()=>{chooseOnMount.current=false;setGenerationOpen(false);setGenerationDraft(null);requestAnimationFrame(()=>{setRailOpen(generationDrawers.current.rail);setPropsOpen(generationDrawers.current.props);requestAnimationFrame(()=>{const trigger=document.querySelector<HTMLElement>(`[data-generation-trigger="${generationReplacement?'replacement':'batch'}"]`);(trigger??generationOpener.current)?.focus()})})}} onApplied={reload}/>}
      {/* ---- 1. top bar ---- */}
      <header className={styles.top}>
        <Link to="/teacher/dashboard" className={styles.brand} aria-label={ar ? 'أساسيرا — لوحة التحكم' : 'Asasera — dashboard'}>
          <Logo />
        </Link>
        <div className={styles.activityIdentity}>
        {/* The page's only heading: the title beside it is an editable control,
            so without this the editor exposed no headings at all. Same text, no
            new copy, hidden from sight only. */}
        <h1 className={styles.srOnly}>{data.activity.title}</h1>
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
        <Button variant="quiet" className={styles.propertiesToggle} data-properties-toggle="" onClick={() => setPropsOpen((v) => !v)}
          aria-expanded={propsOpen} aria-label={t("الخصائص")}><Settings size={22} aria-hidden="true"/></Button>

        <Button variant="secondary" disabled={actionBusy||publishing||recovered} onClick={()=>setThemesOpen(true)}><Palette size={18} aria-hidden="true"/>{ar?'المظاهر':'Themes'}</Button>
        <Button variant="secondary" onClick={() => recovered ? navigate('/teacher/dashboard') : void run(t("تعذّر حفظ التعديلات"),async()=>navigate('/teacher/dashboard'))}>{t("خروج")}</Button>
        <Button variant="quiet" onClick={() => setFeedbackOpen(true)}><MessageSquare size={18} aria-hidden="true" />{ar?'الملاحظات':'Feedback'}</Button>
        {data.activity.currentVersionId && <Button variant="quiet" loading={sharing} disabled={actionBusy||publishing||recovered||(!shareable&&data.activity.visibility!=='published')} title={!shareable&&data.activity.visibility!=='published'?t("للمشاركة في المكتبة، أضف غرضًا تعليميًا أو وحدة منهجية من إعدادات النشاط."):undefined} onClick={() => void toggleShare()}>{data.activity.visibility === 'published' ? <><Share2 size={18} aria-hidden="true" />{t("سحب من المكتبة")}</> : <><Library size={18} aria-hidden="true" />{t("مشاركة في المكتبة")}</>}</Button>}
        {data.activity.currentVersionId && <Button variant="primary" className={styles.deliveryAction} disabled={publishing} onClick={() => void run(t("تعذّر حفظ التعديلات"),async()=>navigate(`/teacher/activities/${activityId}/play?mode=live`))}><Radio size={18} aria-hidden="true"/>{t("ابدأ حصة مباشرة")}</Button>}
        {data.activity.currentVersionId && <Button variant="primary" className={styles.deliveryAction} disabled={publishing} onClick={() => void run(t("تعذّر حفظ التعديلات"),async()=>navigate(`/teacher/activities/${activityId}/play?mode=homework`))}><Clock size={18} aria-hidden="true"/>{t("كلّف كواجب")}</Button>}
        <Button variant={data.activity.currentVersionId ? 'secondary' : 'primary'} loading={publishing} onClick={() => void publish()}>
          {data.activity.currentVersionId ? t("اعتماد التغييرات") : t("اعتماد النسخة")}
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
        {data.questions.map((question) => {
          const isActive = question.id === activeId
          const answers = (question.payload as {options?:{key:string}[];correct?:string}|null) ?? {}
          const slots = answers.options?.length ? answers.options : [{key:'a'},{key:'b'},{key:'c'},{key:'d'}]
          return (
          <div key={question.id} className={styles.thumbRow} data-active={isActive||undefined}>
            <div className={styles.thumbSide}>
              {isActive&&<>
                <button type="button" aria-label={t("تكرار السؤال")} title={t("تكرار السؤال")} disabled={actionBusy}
                  onClick={() => void run(t("تعذّر تكرار السؤال"), async () => {
                    if (!active) return
                    const { question: made } = await activities.duplicateQuestion(active.id)
                    await reload(); await selectQuestion(made.id)
                  })}><Copy size={18} aria-hidden="true"/></button>
                <button type="button" aria-label={t("حذف السؤال")} title={t("حذف السؤال")} disabled={actionBusy}
                  onClick={() => void run(t("تعذّر حذف السؤال"), async () => {
                    if (!active) return
                    await activities.deleteQuestion(active.id)
                    const questions = {...journal.current.questions}; delete questions[active.id]
                    persist({...journal.current, questions, activeQuestionId: null})
                    setActiveId(null); await reload()
                  })}><Trash2 size={18} aria-hidden="true"/></button>
              </>}
            </div>
            <div className={styles.thumbMain}>
              <p className={styles.thumbHead}>
                <span>{ar?`سؤال رقم ${question.ordinal}`:`Question ${question.ordinal}`}</span>
                {incompleteIds.has(question.id) && <span className={styles.thumbFlag} title={t("يحتاج إكمالًا")}><TriangleAlert size={15} aria-hidden="true"/></span>}
              </p>
              <button
                type="button"
                data-question-thumb=""
                className={[styles.thumb, isActive ? styles.thumbActive : '', incompleteIds.has(question.id) ? styles.thumbIncomplete : ''].filter(Boolean).join(' ')}
                aria-current={isActive ? 'true' : undefined}
                onClick={() => { void selectQuestion(question.id).catch(error => setActionError(error instanceof Error ? error.message : t("تعذّر حفظ السؤال"))) }}
              >
                <span className={styles.thumbPrompt}><FormattedText text={question.prompt || t("سؤال بلا نص")}/></span>
                <span className={styles.thumbBars} aria-hidden="true">
                  {slots.map(o=><span key={o.key} data-correct={answers.correct&&o.key===answers.correct?'':undefined}/>)}
                </span>
                <SourceMarker provenance={readProvenance(question)}/>
              </button>
            </div>
          </div>
        )})}

        <div className={styles.railActions}>
          <Button variant="primary" full onClick={() => { void addQuestion('mcq') }}>{t("أضف سؤالًا")}</Button>
          <Button variant="secondary" full data-generation-trigger="batch" className={styles.generateButton} loading={generationOpening} disabled={actionBusy||publishing} icon={<Sparkles size={18} aria-hidden="true"/>} aria-describedby="activity-ai-generation-hint" onClick={()=>void openGeneration()}>{t("توليد بالذكاء الاصطناعي")}</Button>
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
          {shareNotice && <p role="status" className={styles.approvalNote}>{shareNotice}</p>}
          {data.activity.currentVersionId && !shareable && data.activity.visibility !== 'published' && <p className={styles.approvalNote}>{t("النسخة معتمدة وخاصة بك: شغّلها مباشرة أو كلّف بها كواجب. للمشاركة في المكتبة، أضف غرضًا تعليميًا أو وحدة منهجية من إعدادات النشاط.")}</p>}

          {problems.length > 0 && (
            <div className={styles.problems} role="alert">
              <h2 className={styles.problemsTitle}>{ar?'الاعتماد متوقّف':'Approval blocked'} — {problems.length}</h2>
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
              {/* Where this question came from (v5.1 C4). Above the prompt and always
                  in the same place, so its absence ("Manual") reads as plainly as a
                  citation. Keyed by the question so switching questions closes the
                  viewer instead of showing the previous question's text. */}
              {readProvenance(active)&&<div className={styles.sourceRow}><QuestionSource key={active.id} provenance={readProvenance(active)}/></div>}
              <FormattedInput key={`prompt:${active.id}`} inputRef={promptRef} className={styles.promptInput} value={active.prompt} placeholder={t("اكتب السؤال هنا")} label={t("نص السؤال")} onChange={prompt=>patchActive({prompt})}/>


              {active.kind!=='hotspot'&&active.kind!=='mcq'&&<MediaField key={active.id} label={ar?'صورة السؤال (اختياري)':'Question image (optional)'} imageKey={active.mediaKey} onImage={mediaKey=>patchActive({mediaKey})} onRemove={()=>patchActive({mediaKey:null})}/>}
              {['order','match','hotspot'].includes(active.kind)&&<AdvancedCanvas key={`advanced:${active.id}`} question={active} pairs={data.errorPairs.filter(p=>p.questionId===active.id)} onPatch={patchActive} onPair={setReasonPair}/>}
              {active.kind === 'mcq' && (
                <McqCanvas
                  key={`mcq:${active.id}`}
                  mediaKey={active.mediaKey}
                  onMediaChange={mediaKey=>patchActive({mediaKey})}
                  options={(payload.options ?? []) as McqOption[]}
                  correct={String(payload.correct ?? '')}
                  onOptionImage={(key,image)=>{if(activeIdRef.current!==active.id)return;const latest=dataRef.current?.questions.find(q=>q.id===active.id)?.payload as typeof payload;patchActive({payload:{...latest,options:(latest?.options??[]).map(o=>o.key===key?{...o,image}:o)}})}}
                  onOptionText={(key, text) => patchActive({
                    payload: {
                      ...payload,
                      options: (payload.options ?? []).map((o) => (o.key === key ? { ...o, text } : o)),
                    },
                  })}
                  onCorrect={(key) => patchActive({ payload: { ...payload, correct: key } })}
                  onAddOption={()=>{
                    const options=(payload.options??[]) as McqOption[]
                    if(options.length>=MAX_OPTIONS)return
                    patchActive({payload:{...payload,options:[...options,{key:`opt_${crypto.randomUUID().replace(/-/g,'').slice(0,12)}`,text:''}]}})
                  }}
                  onRemoveOption={(key)=>{
                    const options=(payload.options??[]) as McqOption[]
                    if(options.length<=MIN_OPTIONS)return
                    const left=options.filter(o=>o.key!==key)
                    // Removing the marked answer would leave the question with no key, so it moves
                    // to the first remaining answer that actually has something in it.
                    const correct=payload.correct===key?(left.find(o=>o.text.trim()||o.image)?.key??''):payload.correct
                    patchActive({payload:{...payload,options:left,correct}})
                  }}
                />
              )}

              {active.kind === 'tf' && (
                <TfCanvas
                  correct={Boolean(payload.correct)}
                  onCorrect={(value) => patchActive({ payload: { correct: value } })}
                />
              )}

              {/* v5 §14/§18: why the key is correct. Shown to learners only after the answer window closes. */}
              <label className={styles.explanationField}>
                <span className={styles.propLabel}>{t("التفسير (اختياري)")}</span>
                <textarea
                  key={`explanation:${active.id}`}
                  className={styles.explanationInput}
                  value={active.explanation ?? ''}
                  maxLength={1000}
                  rows={2}
                  /* An empty field shows the placeholder, and `auto` has no value
                     to read, so an Arabic placeholder was laid out left to right.
                     Empty follows the interface language; as soon as there is text,
                     `auto` takes over so an English explanation typed into the
                     Arabic editor still reads correctly. */
                  dir={active.explanation ? 'auto' : ar ? 'rtl' : 'ltr'}
                  placeholder={t("لماذا هذه الإجابة صحيحة؟ يظهر للطلاب بعد انتهاء وقت الإجابة.")}
                  onChange={(event) => patchActive({ explanation: event.target.value })}
                />
                {explanationCheck.includes(active.id) && <span role="status" className={styles.explanationWarning}><TriangleAlert size={16} aria-hidden="true"/>{t("تحقّق من أن التفسير ما زال يطابق السؤال والإجابة.")}</span>}
              </label>
            </>
          )}
        </div>
      </ActivityStage>

      {/* ---- 4. properties ---- */}
      <aside inert={actionBusy} className={styles.props} data-editor-drawer={propsOpen?"open":"closed"} aria-label={t("خصائص السؤال")}>
        <header className={styles.propsHeader}><h2>{asideTab==='themes'?(ar?'المظاهر':'Themes'):t("خصائص السؤال")}</h2><button type="button" aria-label={t("أغلق الخصائص")} onClick={()=>{setPropsOpen(false);document.querySelector<HTMLButtonElement>(`[data-properties-toggle]`)?.focus()}}><X size={26}/></button></header>
        <div className={styles.asideTabs} role="tablist" aria-label={ar?'لوحة الجانب':'Sidebar panel'}>
          {([['properties',t("خصائص السؤال"),<SlidersHorizontal size={20} aria-hidden="true"/>],['themes',ar?'المظاهر':'Themes',<Palette size={20} aria-hidden="true"/>]] as const).map(([id,label,icon])=>
            <button key={id} type="button" role="tab" aria-selected={asideTab===id} onClick={()=>setAsideTab(id)}>{icon}<span>{label}</span></button>)}
        </div>
        {asideTab==='themes'
          ? <ThemesPanel activity={data.activity} disabled={recovered} onOpenPicker={()=>setThemesOpen(true)}/>
          : <>
        <div className={styles.propGroup}>
          <label htmlFor="question-kind" className={styles.propLabel}><MessageCircleQuestion size={22}/>{t("نوع السؤال")}</label>
          <QuestionTypePicker value={active?.kind??'mcq'} disabled={!active} onChange={kind=>{
            if(kind==='hotspot'&&!active?.mediaKey){setChooseHotspot(true);return}
            setChooseHotspot(false);patchActive({kind,payload:defaultPayload(kind,active?.mediaKey??'')})
          }}/>
          {chooseHotspot&&<><p>{t("أضف الصورة أولًا لرسم مناطق الإجابة.")}</p><ImageUpload imageKey={null} onImage={mediaKey=>{patchActive({kind:'hotspot',mediaKey,payload:defaultPayload('hotspot',mediaKey)});setChooseHotspot(false)}}/></>}

        </div>

        <div className={styles.propGroup}>
          <label htmlFor="question-duration" className={styles.propLabel}><Timer size={22}/>{ar?'الوقت المحدد':'Time limit'}</label>
          <Select id="question-duration" className={styles.propertySelect} aria-label={t("مدة السؤال بالثواني")} searchable={false} value={active?.timeLimitS??20} disabled={!active} onValueChange={value=>patchActive({timeLimitS:Number(value)})}>
            {Array.from(new Set([5,10,20,30,60,90,120,180,240,300,active?.timeLimitS??20])).sort((a,b)=>a-b).map(seconds=><option key={seconds} value={seconds}>{ar?`${seconds} ثانية`:`${seconds} seconds`}</option>)}
          </Select>
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
            {ar?'تطبيق على جميع الأسئلة':'Apply to all questions'}
          </Button>
        </div>

        <div className={styles.propGroup}>
          <label htmlFor="question-points" className={styles.propLabel}><Medal size={22}/>{ar?'النقاط':'Points'}</label>
          <Select id="question-points" className={styles.propertySelect} aria-label={ar?'النقاط':'Points'} value={payload.pointsMultiplier??1} disabled={!active} onValueChange={value=>patchActive({payload:{...active!.payload as object,pointsMultiplier:Number(value)}})} optionDescriptions={{
            '1':ar?'امنح الإجابات الصحيحة العدد المعتاد من النقاط.':'Award correct answers with the normal amount of points.',
            '2':ar?'امنح ضعف النقاط للإجابات الصحيحة.':'Give twice as many points for correct answers.',
            '0':ar?'خفف المنافسة في هذا السؤال دون احتساب نقاط.':'Lower the stakes of the question and remove points.',
          }}><option value="1">{ar?'قياسي':'Standard'}</option><option value="2">{ar?'نقاط مضاعفة':'Double points'}</option><option value="0">{ar?'بدون نقاط':'No points'}</option></Select>
        </div>

        <div className={styles.propsFooter}>
          {data.activity.currentVersionId&&<Button onClick={()=>void run(t("تعذّر الحفظ"),async()=>navigate(`/teacher/verification?question=${active?.id??0}`))}>{t("اربط سؤال تحقق")}</Button>}
          {(!!active&&data.questions.length>1)&&<div className={styles.thumbActions}>{active.ordinal>1&&<Button icon={<ArrowUp size={17}/>} onClick={()=>void run(t("تعذّر ترتيب الأسئلة"),async()=>{if(!active)return;const order=data.questions.map(q=>q.id),index=order.indexOf(active.id);[order[index-1],order[index]]=[order[index]!,order[index-1]!];await activities.reorder(activityId,order);await reload()})}>{t("للأعلى")}</Button>}{active.ordinal<data.questions.length&&<Button icon={<ArrowDown size={17}/>} onClick={()=>void run(t("تعذّر ترتيب الأسئلة"),async()=>{if(!active)return;const order=data.questions.map(q=>q.id),index=order.indexOf(active.id);[order[index+1],order[index]]=[order[index]!,order[index+1]!];await activities.reorder(activityId,order);await reload()})}>{t("للأسفل")}</Button>}</div>}
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
        </>}
      </aside>
    </div>
  )
}

/* The themes face of the properties rail: the teacher's own themes first, then the catalogue. */
function ThemesPanel({activity,disabled,onOpenPicker}:{activity:ActivityRecord;disabled:boolean;onOpenPicker:()=>void}){
  const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),t=(a:string,e:string)=>ar?a:e
  const current=getActivityTheme(activity.theme)
  return <div className={styles.themesPanel}>
    <section>
      <h3>{t('مظاهرك','Your themes')}</h3>
      <button type="button" className={styles.themeSlot} disabled title={t('غير متاح بعد','Not available yet')}>
        <Plus size={22} aria-hidden="true"/><span>{t('ارفع مظهرك','Upload your theme')}</span>
      </button>
      <p className={styles.themesNote}>{t('رفع مظهر خاص بك قيد الإعداد.','Uploading your own theme is being set up.')}</p>
    </section>
    <section>
      <h3>{t('مظاهر أساسيرا','Asasera themes')}</h3>
      <button type="button" className={styles.themeCurrent} disabled={disabled} onClick={onOpenPicker}>
        <ThemeThumbnail key={activity.theme} theme={activity.theme}/>
        <span>{ar?current.ar:current.en}<Palette size={17} aria-hidden="true"/></span>
      </button>
      {disabled&&<p className={styles.themesNote}>{t('احفظ التعديلات المستعادة أولًا لتتمكّن من تغيير المظهر.','Save your recovered edits first to change the theme.')}</p>}
    </section>
  </div>
}
