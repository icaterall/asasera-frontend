import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AnswerTile, slotFor } from './AnswerTile'
import { PrimaryButton, QuietButton, StatusPill } from './TeachingUI'
import { teaching } from '@/lib/api'

/**
 * Generated suggestions, before any of them are part of the lesson.
 *
 * THE SEPARATION IS THE POINT. Generation produces candidates; the teacher
 * chooses; chosen ones enter the draft; approval is a later, separate act.
 * Collapsing any two of those steps takes a decision away from the person
 * responsible for what students are taught — and the whole product rests on
 * that person having actually looked.
 *
 * ANSWERS ARE SHOWN IN TEACHER REVIEW MODE. The key and the explanation are
 * visible here, because reviewing a question you cannot see the answer to is
 * not reviewing. This component is never rendered to a student.
 *
 * SELECTION IS LOCAL; ADDING IS NOT. What is ticked lives in this component,
 * and it is cheap to lose. What has been ADDED lives on the server, comes back
 * on reload, and is what stops a second click inserting the same activity
 * twice.
 */

type Candidate = {
  kind: string
  prompt: string
  options: { id: string; text: string }[]
  answerKey: unknown
  explanation: string
  sourceSegments: number[]
}

export function CandidateReview({
  jobId,
  onAdded,
}: {
  jobId: number
  onAdded: (added: number, draftMoved: boolean) => void | Promise<void>
}) {
  const { t } = useTranslation()
  const [candidates, setCandidates] = useState<Candidate[] | null>(null)
  const [appliedIndexes, setAppliedIndexes] = useState<number[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /* Loaded from the server, so a refresh returns to the same set with the same
     things already added. Nothing about the review survives only in memory. */
  useEffect(() => {
    let live = true
    teaching
      .generationResult(jobId)
      .then((result) => {
        if (!live) return
        setCandidates(result.activities)
        setAppliedIndexes(result.appliedIndexes)
        /* Pre-tick everything not yet added: the common case is "I want these",
           and starting from an empty selection makes the teacher do work to
           reach the obvious outcome. */
        setSelected(
          new Set(
            result.activities
              .map((_, index) => index)
              .filter((index) => !result.appliedIndexes.includes(index)),
          ),
        )
      })
      .catch(() => {})
    return () => {
      live = false
    }
  }, [jobId])

  if (!candidates || candidates.length === 0) return null

  const pending = candidates.map((_, index) => index).filter((index) => !appliedIndexes.includes(index))
  const remaining = pending.length

  async function addSelected() {
    if (busy || selected.size === 0) return
    setBusy(true)
    setError(null)
    try {
      const result = await teaching.applyGeneration(jobId, [...selected])
      const fresh = await teaching.generationResult(jobId)
      setAppliedIndexes(fresh.appliedIndexes)
      setSelected(new Set())
      await onAdded(result.applied, result.draftMovedSinceRequest)
    } catch (caught) {
      setError((caught as { message?: string }).message ?? 'error')
    } finally {
      setBusy(false)
    }
  }

  function toggle(index: number) {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  return (
    <section className="rounded-sm border border-line bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[0.95rem] font-bold text-fg">{t('teaching.generation.candidates')}</h3>
          {/* Said plainly, because both halves are easy to assume wrongly. */}
          <p className="mt-1 text-sm text-muted">{t('teaching.generation.candidatesLead')}</p>
        </div>
        {remaining > 0 ? (
          <StatusPill tone="amber">
            {t('teaching.generation.remaining', { count: remaining })}
          </StatusPill>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="mt-3 text-sm" style={{ color: 'var(--tc-coral)' }}>
          {error}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <QuietButton onClick={() => setSelected(new Set(pending))} disabled={pending.length === 0}>
          {t('teaching.generation.selectAll')}
        </QuietButton>
        <QuietButton onClick={() => setSelected(new Set())} disabled={selected.size === 0}>
          {t('teaching.generation.clearSelection')}
        </QuietButton>
        <div className="grow" />
        <PrimaryButton onClick={() => void addSelected()} disabled={busy || selected.size === 0}>
          {selected.size === 0
            ? t('teaching.generation.addNone')
            : t('teaching.generation.addSelected', { count: selected.size })}
        </PrimaryButton>
      </div>

      <ul className="mt-4 flex flex-col gap-4">
        {candidates.map((candidate, index) => {
          const isApplied = appliedIndexes.includes(index)
          const isSelected = selected.has(index)
          const correctId =
            candidate.kind === 'true_false'
              ? String(candidate.answerKey)
              : String(candidate.answerKey)

          return (
            <li
              key={index}
              className="rounded-sm border p-4"
              style={{
                borderColor: isSelected ? 'var(--accent)' : 'var(--line)',
                background: isApplied
                  ? 'color-mix(in oklab, var(--tc-teal) 7%, transparent)'
                  : 'transparent',
              }}
            >
              <div className="flex items-start gap-3">
                {/* Applied candidates lose their checkbox rather than keeping a
                    dead one: the action is genuinely unavailable, and a
                    disabled tick invites clicking. */}
                {isApplied ? (
                  <StatusPill tone="teal">{t('teaching.generation.alreadyAdded')}</StatusPill>
                ) : (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggle(index)}
                    className="mt-1 size-5 shrink-0 accent-[var(--accent)]"
                    aria-label={candidate.prompt}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-[1rem] font-bold text-fg">{candidate.prompt}</p>

                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {candidate.options.map((option, optionIndex) => (
                      <AnswerTile
                        key={option.id}
                        slot={slotFor(optionIndex)}
                        /* Teacher review mode: the key is visible, because a
                           review you cannot check is not a review. */
                        correctness={option.id === correctId ? 'correct' : undefined}
                      >
                        {option.text}
                      </AnswerTile>
                    ))}
                  </div>

                  {candidate.explanation ? (
                    <p className="mt-3 text-sm text-muted">
                      <span className="font-semibold text-fg">
                        {t('teaching.generation.explanationLabel')}:{' '}
                      </span>
                      {candidate.explanation}
                    </p>
                  ) : null}

                  {/* The citation, always. A generated answer earns no badge
                      for having one — it earns a way to check it. */}
                  {candidate.sourceSegments.length > 0 ? (
                    <p className="mt-2 text-sm text-muted">
                      {candidate.sourceSegments
                        .map((segment) => t('teaching.generation.viewSource', { page: segment }))
                        .join(' · ')}
                    </p>
                  ) : null}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
