import {useEffect,useMemo,useRef,useState} from 'react'
import {createPortal} from 'react-dom'
import {useMutation,useQuery,useQueryClient} from '@tanstack/react-query'
import {useTranslation} from 'react-i18next'
import {Trash2,X} from 'lucide-react'
import {api,type QuestionKindWire} from '@/lib/api'
import {errorPairSlots} from '@/shared/error-pairs'
import {Button,LoadingIndicator,Select} from '@/design'
import {VerificationSuggestions,type Suggestion} from './VerificationSuggestions'
import styles from './VerificationDialog.module.css'

/**
 * Linking one mistake to the question that proves it was understood.
 *
 * WHY IT IS A DIALOG NOW. This used to be its own page, reached by navigating
 * out of the editor — so a teacher in the middle of writing a question left it,
 * chose their question again from a list, and came back having lost their
 * place. It is a decision ABOUT the open question, so it belongs on top of it.
 *
 * WHY IT LEADS WITH A SENTENCE. The old screen opened on three empty dropdowns
 * and a list called "possible mistakes", which reads as configuration. The
 * thing being set up is a teaching move — fix, then check it took — and it is
 * unrecognisable unless that is said first.
 */

interface Option {
  activityId: number
  title: string
  versionId: number
  questions: {id: number; prompt: string; slots: {elementKey: string; wrongTargetKey: string | null; label: string}[]}[]
}

const slotId = (slot: {elementKey: string; wrongTargetKey: string | null}) => JSON.stringify([slot.elementKey, slot.wrongTargetKey])

export function VerificationDialog({activityId, questionId, revision, kind, payload, pairs, onPair, onApplied, onClose}: {
  activityId: number
  questionId: number
  revision: number
  kind: QuestionKindWire
  payload: unknown
  pairs: {elementKey: string; wrongTargetKey: string | null; reason: string}[]
  onPair: (elementKey: string, wrongTargetKey: string | null, reason: string) => void
  onApplied: () => Promise<void> | void
  onClose: () => void
}) {
  const {i18n} = useTranslation(), ar = i18n.language.startsWith('ar'), t = (a: string, e: string) => (ar ? a : e)
  const dialog = useRef<HTMLDialogElement>(null)
  const cache = useQueryClient()
  const [slot, setSlot] = useState('')
  const [reason, setReason] = useState('')
  const [target, setTarget] = useState(0)

  useEffect(() => {
    const element = dialog.current, overflow = document.body.style.overflow, opener = document.activeElement
    element?.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      element?.close()
      document.body.style.overflow = overflow
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus()
    }
  }, [])

  const options = useQuery({queryKey: ['verification-options'], queryFn: () => api.get<{activities: Option[]}>('/api/v1/discovery/verification/options')})
  const links = useQuery({
    queryKey: ['verification-links'],
    queryFn: () => api.get<{links: {id: number; sourceQuestionId: number; elementKey: string; targetPrompt: string}[]}>('/api/v1/discovery/verification/links'),
  })

  /*
   * WHICH mistakes exist comes from the approved version — a link may only
   * point at content that was actually published. HOW they are worded comes
   * from the question open in the editor, because that is the copy the teacher
   * is looking at: an area renamed since approval, or named for the first
   * time, reads correctly here instead of falling back to a bare number.
   *
   * Keys decide the pairing, so a slot the live payload no longer has simply
   * keeps the approved wording rather than disappearing.
   */
  const liveLabels = useMemo(
    () => new Map(errorPairSlots(kind, payload).map(s => [slotId(s), s.label])),
    [kind, payload],
  )
  const wording = (slot: {elementKey: string; wrongTargetKey: string | null; label: string}) => liveLabels.get(slotId(slot)) ?? slot.label

  const questions = options.data?.activities.flatMap(a => a.questions.map(q => ({...q, title: a.title, versionId: a.versionId}))) ?? []
  const source = questions.find(q => q.id === questionId)
  const chosen = source?.slots.find(s => slotId(s) === slot)
  const pickSlot = (value: string) => {
    setSlot(value)
    save.reset()
    /* A reason may already exist for this mistake; show it rather than
       silently replacing it with an empty box. */
    setReason(pairs.find(pair => slotId(pair) === value)?.reason ?? '')
  }
  const destination = questions.find(q => q.id === target)
  /* Verifying with the question that was just got wrong proves nothing. */
  const candidates = questions.filter(q => q.id !== questionId)
  const mine = (links.data?.links ?? []).filter(l => l.sourceQuestionId === questionId)

  const save = useMutation({
    mutationFn: () => {
      if (!chosen || !destination || !reason.trim()) throw Error(t('أكمل الخطوات الثلاث', 'Complete all three steps'))
      /*
       * BOTH halves, from one press.
       *
       * The live engine offers to treat a mistake only when a reason AND a link
       * exist for it — `if (link && reason)` in session-engine.ts. They used to
       * be written in two unrelated places, so either one alone produced a
       * setup that silently never fires in class.
       *
       * The reason goes through the question's own autosave; the link through
       * its endpoint. Two stores, one decision.
       */
      onPair(chosen.elementKey, chosen.wrongTargetKey, reason.trim())
      return api.post('/api/v1/discovery/verification/links', {
        sourceQuestionId: questionId, elementKey: chosen.elementKey, wrongTargetKey: chosen.wrongTargetKey,
        versionId: destination.versionId, questionId: target,
      })
    },
    onSuccess: () => { setSlot(''); setReason(''); setTarget(0); void cache.invalidateQueries({queryKey: ['verification-links']}) },
  })
  const remove = useMutation({
    mutationFn: (id: number) => api.del(`/api/v1/discovery/verification/links/${id}`),
    onSuccess: () => cache.invalidateQueries({queryKey: ['verification-links']}),
  })

  const body = () => {
    if (options.isPending) return <LoadingIndicator label={t('جارٍ التحميل…', 'Loading…')}/>
    if (options.error) return <p role="alert">{options.error.message}</p>
    /*
     * Two ways to have nothing to do here, and they are different problems:
     * this question is not approved yet, or there is no second question to
     * verify with. Saying which one saves a teacher from hunting.
     */
    if (!source) return <p className={styles.empty}>{t('اعتمد هذا السؤال أولًا، ثم يمكنك ربط أخطائه بسؤال تحقق.', 'Approve this question first, then you can link its mistakes to a verification question.')}</p>
    if (!candidates.length) return <p className={styles.empty}>{t('تحتاج سؤالًا معتمدًا آخر ليكون سؤال التحقق. اعتمد سؤالًا ثانيًا ثم عد إلى هنا.', 'You need a second approved question to verify with. Approve another one, then come back.')}</p>
    if (!source.slots.length) return <p className={styles.empty}>{t('لا توجد إجابات خاطئة يمكن ربطها في هذا السؤال بعد.', 'This question has no wrong answers to link yet.')}</p>

    return <>
      {/* Above the steps, because it is a way of filling them in — not a
          fourth thing to do after them. */}
      <VerificationSuggestions activityId={activityId} questionId={questionId} revision={revision}
        labelFor={s => {
          const match = source.slots.find(slot => slot.elementKey === s.elementKey && slot.wrongTargetKey === s.wrongTargetKey)
          return match ? wording(match) : s.elementKey
        }}
        promptFor={s => questions.find(q => q.id === s.questionId)?.prompt ?? ''}
        onUse={(s: Suggestion) => {
          /* Fills the three steps and stops. The teacher presses Save, so the
             wording that reaches the class is the wording they approved. */
          pickSlot(slotId(s))
          setReason(s.reason)
          setTarget(s.questionId)
          save.reset()
        }}
        onApplied={async () => {
          await onApplied()
          await cache.invalidateQueries({queryKey: ['verification-links']})
        }}/>
      <ol className={styles.steps}>
        <li>
          <span className={styles.stepNumber} aria-hidden="true">1</span>
          <div>
            <strong>{t('أي خطأ يهمّك؟', 'Which mistake matters?')}</strong>
            <p>{t('اختر الإجابة الخاطئة التي تدلّ على سوء فهم تريد معالجته.', 'Choose the wrong answer that points to a misunderstanding worth fixing.')}</p>
            <Select aria-label={t('الخطأ المتوقع', 'Possible mistake')} value={slot} onValueChange={pickSlot}>
              <option value="">{t('اختر إجابة خاطئة', 'Choose a wrong answer')}</option>
              {source.slots.map(s => <option key={slotId(s)} value={slotId(s)}>{wording(s)}</option>)}
            </Select>
          </div>
        </li>
        <li>
          <span className={styles.stepNumber} aria-hidden="true">2</span>
          <div>
            <strong>{t('لماذا يقع هذا الخطأ؟', 'Why does this mistake happen?')}</strong>
            <p>{t('ما تقرأه أنت أثناء الحصة عندما يتكرّر هذا الخطأ. اكتب احتمالًا يساعد على المراجعة، دون الجزم بسبب خطأ الطالب.', 'What you read in class when this mistake recurs. Record a possibility that supports review, without claiming to diagnose a learner.')}</p>
            <textarea className={styles.reason} rows={3} dir="auto" maxLength={400} value={reason} disabled={!chosen}
              aria-label={t('سبب متوقع', 'Possible reason')}
              placeholder={t('مثال: يخلط بين المنتج والعبوة التي يأتي فيها.', 'For example: they confuse the product with the container it comes in.')}
              onChange={event => {setReason(event.target.value); save.reset()}}/>
          </div>
        </li>
        <li>
          <span className={styles.stepNumber} aria-hidden="true">3</span>
          <div>
            <strong>{t('أي سؤال يثبت أنهم فهموا؟', 'Which question proves they understood?')}</strong>
            <p>{t('سؤال معتمد آخر يقيس المهارة نفسها بصياغة مختلفة.', 'Another approved question that measures the same skill in different words.')}</p>
            <Select aria-label={t('سؤال التحقق', 'Verification question')} value={target} onValueChange={value => {setTarget(Number(value)); save.reset()}}>
              <option value={0}>{t('اختر سؤالًا', 'Choose a question')}</option>
              {candidates.map(q => <option key={q.id} value={q.id}>{q.title} — {q.prompt.slice(0, 70)}</option>)}
            </Select>
          </div>
        </li>
      </ol>

      {save.error && <p role="alert" className={styles.error}>{save.error.message}</p>}

      {!!mine.length && <section className={styles.saved}>
        <h3>{t('روابط هذا السؤال', 'Links on this question')}</h3>
        <ul>{mine.map(link => <li key={link.id}>
          <span dir="auto">{link.targetPrompt}</span>
          <Button variant="quiet" aria-label={t('احذف الرابط', 'Remove link')} loading={remove.isPending} onClick={() => remove.mutate(link.id)}><Trash2 size={16}/></Button>
        </li>)}</ul>
      </section>}
    </>
  }

  return createPortal(
    <dialog ref={dialog} className={`asas ${styles.dialog}`} dir={ar ? 'rtl' : 'ltr'}
      aria-label={t('سؤال التحقق', 'Verification question')}
      onCancel={event => {event.preventDefault(); onClose()}}>
      <header>
        <div>
          <h2>{t('سؤال التحقق', 'Verification question')}</h2>
          {/* One sentence, before anything is asked of them. */}
          <p>{t('إذا وقع عدد من الطلاب في الخطأ نفسه، يعرض عليك النظام معالجتهم — ثم يسألهم هذا السؤال ليثبتوا أنهم فهموا بأنفسهم.', 'When several learners make the same mistake, you are offered the chance to fix it with them — then this question asks them to show they understood, on their own.')}</p>
        </div>
        <button type="button" aria-label={t('إغلاق', 'Close')} onClick={onClose}><X size={22}/></button>
      </header>
      <div className={styles.body}>{body()}</div>
      <footer>
        <Button onClick={onClose}>{t('إغلاق', 'Close')}</Button>
        <Button variant="primary" loading={save.isPending} disabled={!chosen || !destination || !reason.trim()} onClick={() => save.mutate()}>
          {t('اربط سؤال التحقق', 'Link verification question')}
        </Button>
      </footer>
    </dialog>, document.body)
}
