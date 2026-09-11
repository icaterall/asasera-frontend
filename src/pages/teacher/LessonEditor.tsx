import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'

import { ActivityCanvas } from '@/components/editor/ActivityCanvas'
import { ActivityRail } from '@/components/editor/ActivityRail'
import { CandidateDialog } from '@/components/editor/CandidateDialog'
import { ContextPanel } from '@/components/editor/ContextPanel'
import { StudentPreview } from '@/components/editor/StudentPreview'
import { Dialog } from '@/design'
import { GenerationPanel } from '@/components/teaching/GenerationPanel'
import {
  PrimaryButton,
  QuietButton,
  SaveIndicator,
  StatusPill,
  type SaveState,
} from '@/components/teaching/TeachingUI'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { ApiError, teaching, type Activity, type ActivityKind, type Lesson } from '@/lib/api'

/**
 * The lesson editor workspace.
 *
 * FOUR REGIONS, ONE SCREEN. Toolbar, activity rail, canvas, context panel.
 * What this replaced was a single scrolling column that stacked AI candidate
 * review, a lesson settings form, and a full edit form for every activity —
 * 2373px tall at 1440x900, with the question being edited somewhere in the
 * middle and the same answers rendered twice, once in colour and once as radio
 * buttons.
 *
 * THE CONTRACTS ARE UNCHANGED. Draft writes still go through one `patch` that
 * carries `draftRevision` and turns a 409 into the reload banner; activities
 * still commit through `updateActivity` keyed on their stable id; reordering
 * still sends the id array the server expects. This is a composition change,
 * not a persistence change.
 *
 * SELECTION IS A STABLE ID, NOT AN INDEX. The active activity is tracked by
 * `activity.id`, so reordering, deleting, and inserting generated activities
 * cannot silently move the teacher to a different question.
 */
export default function LessonEditor() {
  const { id } = useParams()
  const { t } = useTranslation()
  const { t: creationText } = useTranslation('adminAi')
  const toMessage = useApiErrorMessage()

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [failed, setFailed] = useState<string | null>(null)
  const [conflict, setConflict] = useState(false)
  const [save, setSave] = useState<SaveState>('idle')
  const [activeId, setActiveId] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [showGenerate, setShowGenerate] = useState(false)
  const [candidateJob, setCandidateJob] = useState<number | null>(null)
  const [addedNotice, setAddedNotice] = useState<number | null>(null)
  const [railOpen, setRailOpen] = useState(false)
  const [contextOpen, setContextOpen] = useState(false)
  const [preview, setPreview] = useState(false)
  const [approving, setApproving] = useState(false)
  const [issues, setIssues] = useState<
    { severity: 'blocking' | 'warning'; code: string }[] | null
  >(null)
  const [approvedNo, setApprovedNo] = useState<number | null>(null)

  const inFlight = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useDocumentTitle(lesson?.title ?? t('teaching.lessons.title'))

  const load = useCallback(async () => {
    try {
      const { lesson: row } = await teaching.lesson(Number(id))
      setLesson(row)
      setTitle(row.title)
      /* Keep the teacher where they were across a reload; fall back to the
         first activity only when the one they had is gone. */
      setActiveId((current) =>
        current && row.activities.some((a) => a.id === current)
          ? current
          : (row.activities[0]?.id ?? null),
      )
      setFailed(null)
    } catch (cause) {
      setFailed(toMessage(cause))
    }
  }, [id, toMessage])

  useEffect(() => {
    void load()
  }, [load])

  /** One place every draft write goes through, so the revision is never stale. */
  const patch = useCallback(
    async (body: Record<string, unknown>) => {
      if (!lesson || inFlight.current) return
      inFlight.current = true
      setSave('saving')
      try {
        const { lesson: updated } = await teaching.updateDraft(lesson.id, {
          draft_revision: lesson.draftRevision,
          ...body,
        })
        setLesson(updated)
        setSave('saved')
      } catch (cause) {
        if (cause instanceof ApiError && cause.code === 'draft_conflict') {
          setConflict(true)
          setSave('idle')
        } else {
          setSave('failed')
        }
      } finally {
        inFlight.current = false
      }
    },
    [lesson],
  )

  function scheduleSave(body: Record<string, unknown>) {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => void patch(body), 800)
  }

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  async function commitActivity(next: Activity) {
    if (!lesson) return
    setSave('saving')
    try {
      const { lesson: updated } = await teaching.updateActivity(lesson.id, next.id, {
        kind: next.kind,
        prompt: next.prompt,
        body: next.body,
        options: next.options,
        answer_key: next.answerKey,
        explanation: next.explanation,
        source_segments: next.sourceSegments,
        points: next.points,
      })
      setLesson(updated)
      setSave('saved')
    } catch (cause) {
      if (cause instanceof ApiError && cause.code === 'draft_conflict') setConflict(true)
      else setSave('failed')
    }
  }

  async function addActivity(kind: ActivityKind) {
    if (!lesson) return
    setSave('saving')
    try {
      const seed =
        kind === 'multiple_choice'
          ? {
              options: [
                { id: 'a', text: '' },
                { id: 'b', text: '' },
              ],
              answer_key: { optionId: 'a' },
            }
          : kind === 'true_false'
            ? { answer_key: { value: true } }
            : {}
      const { lesson: updated } = await teaching.addActivity(lesson.id, {
        kind,
        prompt: '',
        source_segments: lesson.scopeSegments,
        ...seed,
      })
      setLesson(updated)
      /* Land on the thing that was just created — the teacher asked for it. */
      setActiveId(updated.activities.at(-1)?.id ?? null)
      setSave('saved')
      setRailOpen(false)
    } catch (cause) {
      if (cause instanceof ApiError && cause.code === 'draft_conflict') setConflict(true)
      else setSave('failed')
    }
  }

  async function move(index: number, direction: -1 | 1) {
    if (!lesson) return
    const order = lesson.activities.map((a) => a.id)
    const target = index + direction
    if (target < 0 || target >= order.length) return
    ;[order[index], order[target]] = [order[target]!, order[index]!]
    setSave('saving')
    try {
      const { lesson: updated } = await teaching.reorderActivities(lesson.id, {
        draft_revision: lesson.draftRevision,
        activity_ids: order,
      })
      setLesson(updated)
      setSave('saved')
    } catch (cause) {
      if (cause instanceof ApiError && cause.code === 'draft_conflict') setConflict(true)
      else setSave('failed')
    }
  }

  async function remove(activityId: number) {
    if (!lesson) return
    setSave('saving')
    try {
      const { lesson: updated } = await teaching.deleteActivity(lesson.id, activityId)
      setLesson(updated)
      setActiveId(updated.activities[0]?.id ?? null)
      setSave('saved')
    } catch (cause) {
      if (cause instanceof ApiError && cause.code === 'draft_conflict') setConflict(true)
      else setSave('failed')
    }
  }

  /**
   * Review, then approve — two steps, because they answer different questions.
   *
   * A blocking issue stops the approval and is listed; warnings do not block
   * but must be acknowledged deliberately, which is the existing server rule.
   * Nothing here approves as a side effect of saving or of adding candidates.
   */
  async function approve(acknowledge: boolean) {
    if (!lesson || approving) return
    setApproving(true)
    setIssues(null)
    try {
      const review = await teaching.reviewLesson(lesson.id)
      const blocking = review.issues.filter((issue) => issue.severity === 'blocking')
      if (blocking.length > 0) {
        setIssues(blocking)
        return
      }
      const warnings = [
        ...new Set(review.issues.filter((i) => i.severity === 'warning').map((i) => i.code)),
      ]
      if (warnings.length > 0 && !acknowledge) {
        setIssues(review.issues.filter((issue) => issue.severity === 'warning'))
        return
      }
      const { version } = await teaching.approveLesson(lesson.id, {
        draft_revision: lesson.draftRevision,
        acknowledged_warnings: warnings,
      })
      setApprovedNo(version.versionNo)
      setIssues(null)
      await load()
    } catch (cause) {
      if (cause instanceof ApiError && cause.code === 'draft_conflict') setConflict(true)
      else setIssues([{ severity: 'blocking', code: 'issueGeneric' }])
    } finally {
      setApproving(false)
    }
  }

  if (failed) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-fg">{failed}</p>
          <PrimaryButton onClick={() => void load()}>{t('teaching.editor.reload')}</PrimaryButton>
        </div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-8 text-sm text-muted">
        {t('teaching.common.loading')}
      </div>
    )
  }

  const active = lesson.activities.find((a) => a.id === activeId) ?? null

  return (
    <div className="ed-shell teacher-scope">
      {/* ---- A. toolbar ---- */}
      {/*
        The toolbar's min-content width is what decides whether the whole shell
        can fit a phone. Every item below either shrinks, truncates, or is
        hidden under 640px — the first build kept them all and the shell
        overflowed silently behind `overflow: hidden`, which looked fine to a
        scrollWidth check and was visibly clipped on screen.
      */}
      <header className="flex h-[68px] shrink-0 items-center gap-2 overflow-hidden border-b border-line bg-surface px-3 sm:gap-3 sm:px-4">
        <Link
          to="/teacher/lessons"
          className="flex min-h-[40px] items-center gap-1.5 rounded-sm border border-line px-3 text-sm font-semibold text-fg transition-colors duration-200 hover:border-accent focus-visible:outline-3 focus-visible:outline-accent focus-visible:outline-offset-2"
        >
          <span aria-hidden="true">‹</span>
          <span className="hidden sm:inline">{t('teaching.editor.backToLibrary')}</span>
          <span className="sr-only sm:hidden">{t('teaching.editor.backToLibrary')}</span>
        </Link>

        <input
          value={title}
          onChange={(event) => {
            setTitle(event.target.value)
            scheduleSave({ title: event.target.value })
          }}
          aria-label={t('teaching.create.fieldTitle')}
          placeholder={t('teaching.editor.untitled')}
          className="min-w-0 flex-1 rounded-sm border border-transparent bg-transparent px-2 py-2 text-[1.05rem] font-bold text-fg outline-none hover:border-line focus-visible:outline-3 focus-visible:outline-accent focus-visible:outline-offset-2"
        />

        {/* Status is a label, not an action: first to go when width is tight. */}
        <span className="hidden md:block">
          <StatusPill tone={lesson.status === 'approved' ? 'teal' : 'neutral'}>
            {lesson.status === 'approved'
              ? t('teaching.lessons.statusApproved')
              : t('teaching.lessons.statusDraft')}
          </StatusPill>
        </span>

        {/* Truthful: this only says "saved" after the server answered. */}
        <SaveIndicator state={save} />

        {/*
          Wrapped, not classed. QuietButton hardcodes `inline-flex`, and
          Tailwind resolves display utilities by stylesheet order rather than by
          the order they appear in the class attribute — so `hidden` passed as a
          prop lost to the component's own `inline-flex` and the button kept
          rendering at 82px on a phone. A wrapper element has no such conflict.
        */}
        <span className="hidden sm:block">
          <QuietButton onClick={() => setPreview((c) => !c)}>
            {preview ? t('teaching.editor.exitPreview') : t('teaching.editor.preview')}
          </QuietButton>
        </span>

        {/* The primary action, and visually the only one. Approval is separate
            from saving and from adding candidates. */}
        {lesson.status !== 'approved' ? (
          <PrimaryButton
            className="shrink-0 whitespace-nowrap"
            onClick={() => void approve(false)}
            disabled={approving}
          >
            {approving ? t('teaching.editor.approving') : t('teaching.editor.approve')}
          </PrimaryButton>
        ) : null}

        {/* Below xl the two side regions become drawers, so their openers live
            in the toolbar rather than vanishing. */}
        <span className="shrink-0 xl:hidden">
          <QuietButton onClick={() => setRailOpen(true)}>
          <span aria-hidden="true">☰</span>
          <span className="hidden lg:inline">{t('teaching.editor.openRail')}</span>
            <span className="sr-only lg:hidden">{t('teaching.editor.openRail')}</span>
          </QuietButton>
        </span>
        <span className="hidden shrink-0 sm:block xl:hidden">
          <QuietButton onClick={() => setContextOpen(true)}>
            <span aria-hidden="true">⚙</span>
            <span className="hidden lg:inline">{t('teaching.editor.openContext')}</span>
            <span className="sr-only lg:hidden">{t('teaching.editor.openContext')}</span>
          </QuietButton>
        </span>
      </header>

      {conflict ? (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3"
          style={{
            borderColor: 'color-mix(in oklab, var(--tc-amber) 55%, transparent)',
            background: 'color-mix(in oklab, var(--tc-amber) 12%, transparent)',
          }}
        >
          <p className="text-sm text-fg">{t('teaching.editor.conflict')}</p>
          <PrimaryButton onClick={() => void load()}>{t('teaching.editor.reload')}</PrimaryButton>
        </div>
      ) : null}

      {issues ? (
        <div
          role="alert"
          className="flex flex-col gap-1.5 border-b px-4 py-3"
          style={{
            borderColor: 'color-mix(in oklab, var(--tc-coral) 45%, transparent)',
            background: 'color-mix(in oklab, var(--tc-coral) 8%, transparent)',
          }}
        >
          <p className="text-sm font-bold text-fg">{t('teaching.editor.cannotApprove')}</p>
          <ul className="flex flex-col gap-0.5">
            {issues.map((issue, index) => (
              <li key={index} className="text-sm text-muted">
                {issueText(issue.code, t)}
              </li>
            ))}
          </ul>
          {/* Warnings do not block, but approving past them is a decision the
              teacher makes on purpose. */}
          {issues.every((issue) => issue.severity === 'warning') ? (
            <div className="mt-1 flex gap-2">
              <PrimaryButton onClick={() => void approve(true)} disabled={approving}>
                {t('teaching.editor.acknowledgeWarnings')}
              </PrimaryButton>
              <QuietButton onClick={() => setIssues(null)}>
                {t('teaching.editor.close')}
              </QuietButton>
            </div>
          ) : null}
        </div>
      ) : null}

      {approvedNo !== null ? (
        <div
          role="status"
          className="flex items-center gap-3 border-b px-4 py-2.5"
          style={{
            borderColor: 'color-mix(in oklab, var(--tc-teal) 45%, transparent)',
            background: 'color-mix(in oklab, var(--tc-teal) 10%, transparent)',
          }}
        >
          <p className="text-sm font-semibold text-fg">
            {t('teaching.editor.approved', { number: approvedNo })}
          </p>
          <QuietButton onClick={() => setApprovedNo(null)}>
            {t('teaching.editor.close')}
          </QuietButton>
        </div>
      ) : null}

      {addedNotice !== null ? (
        <div
          role="status"
          className="flex flex-wrap items-center gap-3 border-b px-4 py-2.5"
          style={{
            borderColor: 'color-mix(in oklab, var(--tc-teal) 45%, transparent)',
            background: 'color-mix(in oklab, var(--tc-teal) 10%, transparent)',
          }}
        >
          <p className="text-sm font-semibold text-fg">
            {t('teaching.editor.addedToLesson', { count: addedNotice })}
          </p>
          <QuietButton onClick={() => setAddedNotice(null)}>
            {t('teaching.editor.close')}
          </QuietButton>
        </div>
      ) : null}

      <div className="ed-body">
        {/* ---- B. rail ---- */}
        <div className="hidden xl:block">
          <ActivityRail
            lesson={lesson}
            activeId={activeId}
            onSelect={setActiveId}
            onAdd={addActivity}
            onGenerate={() => setShowGenerate(true)}
            onMove={(index, direction) => void move(index, direction)}
            onDelete={(activityId) => void remove(activityId)}
          />
        </div>

        {/* ---- C. canvas ---- */}
        {active && preview ? (
          <StudentPreview activity={active} />
        ) : active ? (
          <ActivityCanvas
            key={active.id}
            activity={active}
            onCommit={(next) => void commitActivity(next)}
          />
        ) : (
          <div className="ed-canvas ed-region items-center justify-center text-center">
            <h2 className="text-[1.6rem] font-bold text-fg">{t('teaching.editor.emptyTitle')}</h2>
            <p className="max-w-[46ch] text-[1rem] text-muted">{t('teaching.editor.emptyBody')}</p>
            <div className="flex flex-wrap justify-center gap-2">
              <PrimaryButton onClick={() => void addActivity('multiple_choice')}>
                {t('teaching.editor.addMultipleChoice')}
              </PrimaryButton>
              <QuietButton onClick={() => setShowGenerate(true)}>
                ✦ {t('teaching.editor.generateWithAi')}
              </QuietButton>
            </div>
          </div>
        )}

        {/* ---- D. context ---- */}
        <div className="hidden xl:block">
          <ContextPanel
            lesson={lesson}
            activity={active}
            saveState={save}
            onCommit={(next) => void commitActivity(next)}
          />
        </div>
      </div>

      {railOpen ? (
        <>
          <div className="ed-scrim xl:hidden" onClick={() => setRailOpen(false)} />
          <div className="ed-drawer xl:hidden">
            <ActivityRail
              lesson={lesson}
              activeId={activeId}
              onSelect={(nextId) => {
                setActiveId(nextId)
                setRailOpen(false)
              }}
              onAdd={addActivity}
              onGenerate={() => {
                setRailOpen(false)
                setShowGenerate(true)
              }}
              onMove={(index, direction) => void move(index, direction)}
              onDelete={(activityId) => void remove(activityId)}
            />
          </div>
        </>
      ) : null}

      {contextOpen ? (
        <>
          <div className="ed-scrim xl:hidden" onClick={() => setContextOpen(false)} />
          <div className="ed-drawer xl:hidden" data-side="end">
            <ContextPanel
              lesson={lesson}
              activity={active}
              saveState={save}
              onCommit={(next) => void commitActivity(next)}
            />
          </div>
        </>
      ) : null}

      {/* Generation configuration, and the review dialog it opens. Both are
          workspace states, so neither pushes the editor down the page. */}
      {showGenerate && <Dialog open title={creationText('legacy')} onClose={()=>setShowGenerate(false)}>
        <GenerationPanel lesson={lesson} onReview={jobId=>{setShowGenerate(false);setCandidateJob(jobId)}}/>
      </Dialog>}

      {candidateJob !== null ? (
        <CandidateDialog
          jobId={candidateJob}
          onClose={() => setCandidateJob(null)}
          onAdded={async (added) => {
            setAddedNotice(added)
            await load()
          }}
        />
      ) : null}
    </div>
  )
}

/** Server issue codes are machine-readable; the interface translates them. */
function issueText(code: string, t: (key: never, options?: never) => string): string {
  const known: Record<string, string> = {
    no_activities: 'teaching.editor.issueNoActivities',
    empty_prompt: 'teaching.editor.issueEmptyPrompt',
    no_answer_key: 'teaching.editor.issueNoAnswer',
    too_few_options: 'teaching.editor.issueTooFewOptions',
    empty_option: 'teaching.editor.issueEmptyOption',
    no_objective: 'teaching.editor.issueNoObjective',
  }
  return t((known[code] ?? 'teaching.editor.issueGeneric') as never)
}
