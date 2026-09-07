import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { PrimaryButton, QuietButton, StatusPill, inputClass } from './TeachingUI'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import { ApiError, teaching, type GenerationJob, type Lesson } from '@/lib/api'

/**
 * Drafting activities with a model, as a durable operation the teacher owns.
 *
 * THE PRICE IS SHOWN BEFORE THE BUTTON, not after the charge. A ceiling the
 * teacher read first is what makes "cost-bounded" a promise; discovering the
 * cost by being billed is not.
 *
 * THE JOB IS FOUND, NOT REMEMBERED. On mount this asks the server which job
 * belongs to this lesson, so closing the tab, refreshing, or coming back
 * tomorrow all land on the same operation. Nothing about the run is kept in
 * component state that would be lost with the page.
 *
 * NO INVENTED PERCENTAGE. The server knows queued, running and finished, and
 * that is exactly what is shown. A progress bar moving on a timer would be a
 * lie about work nobody is measuring.
 */

/** Millicents are an implementation detail; the teacher sees dollars. */
function usd(millicents: number): string {
  return `$${(millicents / 100_000).toFixed(2)}`
}

const POLL_MS = 2500
/** Two minutes of watching. Past that the job is still tracked by the server —
 *  the page simply stops asking, so an abandoned tab is not a permanent poller. */
const MAX_POLLS = 48

export function GenerationPanel({
  lesson,
  onReview,
}: {
  lesson: Lesson
  /* Candidates are reviewed in their own workspace state, not inline under the
     configuration form — the editor must not grow by the height of the result
     set. The panel hands the job up and the workspace opens the dialog. */
  onReview: (jobId: number) => void
}) {
  const { t } = useTranslation()
  const toMessage = useApiErrorMessage()

  const [job, setJob] = useState<GenerationJob | null>(null)
  const [quote, setQuote] = useState<Awaited<ReturnType<typeof teaching.generationQuote>> | null>(null)
  const [objective, setObjective] = useState(lesson.objective ?? '')
  const [count, setCount] = useState(4)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [applied, setApplied] = useState<{ count: number; editsKept: boolean } | null>(null)

  /* Stable for the life of this attempt, so a double click is one operation.
     Regenerated only when a new run genuinely starts. */
  const keyRef = useRef<string>(crypto.randomUUID())

  const segments = lesson.scopeSegments ?? []
  const revisionId = lesson.material?.revisionId ?? null

  const refreshQuote = useCallback(async () => {
    try {
      setQuote(await teaching.generationQuote(count, Math.max(1, segments.length)))
    } catch {
      /* A missing quote disables the button; it is not worth an error banner. */
    }
  }, [count, segments.length])

  useEffect(() => {
    void refreshQuote()
  }, [refreshQuote])

  /* The job is the server's, not the page's. */
  useEffect(() => {
    let live = true
    teaching
      .generationForLesson(lesson.id)
      .then(({ job: found }) => {
        if (live) setJob(found)
      })
      .catch(() => {})
    return () => {
      live = false
    }
  }, [lesson.id])

  /*
   * Poll only while something is actually running, and not forever. The
   * interval clears on unmount, so navigating away stops the requests.
   */
  useEffect(() => {
    if (!job || (job.state !== 'queued' && job.state !== 'running')) return
    let polls = 0
    const timer = setInterval(() => {
      polls += 1
      if (polls > MAX_POLLS) {
        clearInterval(timer)
        return
      }
      teaching
        .generationJob(job.id)
        .then(({ job: fresh }) => setJob(fresh))
        .catch(() => {})
    }, POLL_MS)
    return () => clearInterval(timer)
  }, [job])

  async function start() {
    if (busy || !revisionId) return
    setBusy(true)
    setError(null)
    setApplied(null)
    try {
      const { job: created } = await teaching.startGeneration({
        lesson_id: lesson.id,
        material_revision_id: revisionId,
        segments,
        objective,
        language: lesson.contentLanguage ?? 'ar',
        activity_count: count,
        draft_revision: lesson.draftRevision,
        idempotency_key: keyRef.current,
      })
      setJob(created)
    } catch (caught) {
      /* Two conditions the teacher can actually act on. A generic "something
         went wrong" for either would leave them clicking a button that will
         keep failing for a reason we already know. */
      setError(describe(caught))
    } finally {
      setBusy(false)
    }
  }

  function describe(caught: unknown): string {
    if (caught instanceof ApiError) {
      if (caught.code === 'too_many_requests') return t('teaching.generation.rateLimited')
      if (caught.code === 'insufficient_credit') return t('teaching.generation.insufficient')
    }
    return toMessage(caught)
  }

  async function cancel() {
    if (!job) return
    try {
      setJob((await teaching.cancelGeneration(job.id)).job)
    } catch (caught) {
      setError(toMessage(caught))
    }
  }

  async function claimGrant() {
    setBusy(true)
    try {
      await teaching.claimWelcomeGrant()
      await refreshQuote()
    } catch (caught) {
      setError(toMessage(caught))
    } finally {
      setBusy(false)
    }
  }

  if (!revisionId || segments.length === 0) return null

  const running = job?.state === 'queued' || job?.state === 'running'
  /* Still reviewable while any candidate remains unused: a partly-used set
     is exactly what the teacher comes back to. */
  const reviewable = job?.state === 'succeeded' && (job.resultActivities ?? 0) > 0

  return (
    <section className="rounded-sm border border-line bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[0.95rem] font-bold text-fg">{t('teaching.generation.title')}</h2>
          <p className="mt-1 text-sm text-muted">{t('teaching.generation.lead')}</p>
        </div>
        {running ? (
          <StatusPill tone="amber">
            {job.state === 'queued'
              ? t('teaching.generation.queued')
              : t('teaching.generation.running')}
          </StatusPill>
        ) : null}
      </div>

      {error ? (
        <div
          role="alert"
          className="mt-4 rounded-sm border p-3"
          style={{
            borderColor: 'color-mix(in oklab, var(--tc-coral) 45%, transparent)',
            background: 'color-mix(in oklab, var(--tc-coral) 6%, transparent)',
          }}
        >
          <p className="text-sm text-fg">{error}</p>
          <p className="mt-1 text-sm text-muted">{t('teaching.generation.manualNote')}</p>
        </div>
      ) : null}

      {/* No approved tariff in this environment. Said plainly, and manual
          authoring is untouched. */}
      {quote && !quote.pricingAvailable ? (
        <p className="mt-4 text-sm text-muted">{t('teaching.generation.noPricing')}</p>
      ) : null}

      {!running && !reviewable && quote?.pricingAvailable ? (
        <div className="mt-4 flex flex-col gap-3">
          <label className="text-sm font-semibold text-fg" htmlFor="gen-objective">
            {t('teaching.generation.objective')}
          </label>
          <input
            id="gen-objective"
            className={inputClass}
            value={objective}
            onChange={(event) => setObjective(event.target.value)}
          />

          <label className="text-sm font-semibold text-fg" htmlFor="gen-count">
            {t('teaching.generation.count')}
          </label>
          <input
            id="gen-count"
            type="number"
            min={1}
            max={quote.maxActivities}
            className={inputClass}
            value={count}
            onChange={(event) => setCount(Number(event.target.value))}
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-muted">
              <p>{t('teaching.generation.maxCharge', { amount: usd(quote.maxAuthorizedMillicents) })}</p>
              <p>{t('teaching.generation.credit', { amount: usd(quote.spendableMillicents) })}</p>
            </div>

            {quote.affordable ? (
              <PrimaryButton onClick={() => void start()} disabled={busy || !objective.trim()}>
                {busy ? t('teaching.generation.generating') : t('teaching.generation.generate')}
              </PrimaryButton>
            ) : (
              /* Not enough credit. The reason and the specific next step, not a
                 disabled button with no explanation. */
              <div className="text-end">
                <p className="text-sm font-semibold text-fg">{t('teaching.generation.noCredit')}</p>
                {!quote.welcomeGrantClaimed ? (
                  <div className="mt-2">
                    <PrimaryButton onClick={() => void claimGrant()} disabled={busy}>
                      {t('teaching.generation.claimGrant')}
                    </PrimaryButton>
                    <p className="mt-1 text-xs text-muted">{t('teaching.generation.verifyFirst')}</p>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {running ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-fg">
              {job.state === 'queued'
                ? t('teaching.generation.queued')
                : t('teaching.generation.running')}
            </p>
            {/* The durability promise, said out loud. */}
            <p className="mt-1 text-sm text-muted">{t('teaching.generation.stateNote')}</p>
          </div>
          <QuietButton tone="danger" onClick={() => void cancel()} disabled={job.cancelRequested}>
            {t('teaching.generation.cancel')}
          </QuietButton>
        </div>
      ) : null}

      {job?.state === 'failed' ? (
        <p className="mt-4 text-sm text-muted">{t('teaching.generation.failed')}</p>
      ) : null}
      {job?.state === 'cancelled' ? (
        <p className="mt-4 text-sm text-muted">{t('teaching.generation.cancelled')}</p>
      ) : null}
      {job?.state === 'needs_review' ? (
        <p className="mt-4 text-sm text-muted">{t('teaching.generation.needsReview')}</p>
      ) : null}

      {reviewable ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-fg">
            {t('teaching.generation.ready', { count: job.resultActivities ?? 0 })}
          </p>
          <PrimaryButton onClick={() => onReview(job.id)}>
            {t('teaching.generation.candidates')}
          </PrimaryButton>
        </div>
      ) : null}

      {applied ? (
        <div
          role="status"
          className="mt-4 rounded-sm border p-3"
          style={{
            borderColor: 'color-mix(in oklab, var(--tc-teal) 40%, transparent)',
            background: 'color-mix(in oklab, var(--tc-teal) 8%, transparent)',
          }}
        >
          <p className="text-sm text-fg">
            {t('teaching.generation.addedSome', { count: applied.count })}
          </p>
          {/* The teacher edited while it ran. Their work is intact and they are
              told so, rather than being asked to choose. */}
          {applied.editsKept ? (
            <p className="mt-1 text-sm text-muted">{t('teaching.generation.editsKept')}</p>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
