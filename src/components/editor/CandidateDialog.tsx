import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AnswerTile, slotFor } from '@/components/teaching/AnswerTile'
import { PrimaryButton, QuietButton, StatusPill } from '@/components/teaching/TeachingUI'
import { teaching } from '@/lib/api'

/**
 * Reviewing AI suggestions, as a workspace state rather than a page section.
 *
 * WHY A DIALOG. The version this replaces rendered every candidate at full
 * size above the lesson editor, so four suggestions pushed the actual editing
 * surface a screen and a half down and twelve would have been unreadable. Here
 * the list is a compact index and one candidate is shown at a time — the same
 * shape as the rail and canvas next door, for the same reason.
 *
 * FOUR STATES, VISUALLY DISTINCT. Available, selected for insertion, already
 * added, and needs review. "Added" is a filled teal marker and loses its
 * checkbox; "selected" is a ticked box and an accent ring. They cannot be
 * confused, which matters because one is reversible and the other is not.
 */

type Candidate = {
  kind: string
  prompt: string
  options: { id: string; text: string }[]
  answerKey: unknown
  explanation: string
  sourceSegments: number[]
}

export function CandidateDialog({
  jobId,
  onClose,
  onAdded,
}: {
  jobId: number
  onClose: () => void
  onAdded: (added: number) => void | Promise<void>
}) {
  const { t } = useTranslation()
  const [candidates, setCandidates] = useState<Candidate[] | null>(null)
  const [applied, setApplied] = useState<number[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [active, setActive] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const heading = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    let live = true
    teaching
      .generationResult(jobId)
      .then((result) => {
        if (!live) return
        setCandidates(result.activities)
        setApplied(result.appliedIndexes)
        setSelected(
          new Set(
            result.activities
              .map((_, index) => index)
              .filter((index) => !result.appliedIndexes.includes(index)),
          ),
        )
      })
      .catch(() => setError('load'))
    return () => {
      live = false
    }
  }, [jobId])

  useEffect(() => {
    heading.current?.focus()
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function addSelected() {
    if (busy || selected.size === 0) return
    setBusy(true)
    setError(null)
    try {
      const result = await teaching.applyGeneration(jobId, [...selected])
      const fresh = await teaching.generationResult(jobId)
      setApplied(fresh.appliedIndexes)
      setSelected(new Set())
      await onAdded(result.applied)
    } catch (caught) {
      setError((caught as { message?: string }).message ?? 'error')
    } finally {
      setBusy(false)
    }
  }

  const current = candidates?.[active]
  const pending = (candidates ?? []).map((_, i) => i).filter((i) => !applied.includes(i))

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: 'color-mix(in oklab, var(--fg) 55%, transparent)' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cand-title"
        onClick={(event) => event.stopPropagation()}
        className="flex h-[min(760px,92dvh)] w-[min(1120px,95vw)] flex-col rounded-sm border border-line"
        style={{ background: 'var(--tc-surface-solid)' }}
      >
        <header className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-4">
          <h2
            id="cand-title"
            ref={heading}
            tabIndex={-1}
            className="text-lg font-bold text-fg outline-none"
          >
            {t('teaching.editor.candidatesTitle')}
          </h2>
          {pending.length > 0 ? (
            <StatusPill tone="amber">
              {t('teaching.generation.remaining', { count: pending.length })}
            </StatusPill>
          ) : null}
          <div className="grow" />
          <span className="text-sm text-muted">
            {t('teaching.generation.candidatesLead')}
          </span>
          <QuietButton onClick={onClose}>{t('teaching.editor.close')}</QuietButton>
        </header>

        {error ? (
          <p role="alert" className="px-5 py-2 text-sm" style={{ color: 'var(--tc-coral)' }}>
            {error}
          </p>
        ) : null}

        <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[264px_minmax(0,1fr)]">
          {/* Compact index: many candidates stay reviewable because only one is
              ever drawn at full size. */}
          <ul className="min-h-0 overflow-y-auto border-line p-2 md:border-e">
            {(candidates ?? []).map((candidate, index) => {
              const isApplied = applied.includes(index)
              const isSelected = selected.has(index)
              return (
                <li key={index} className="mb-1.5">
                  <div
                    className="flex items-start gap-2 rounded-sm border p-2"
                    style={{
                      borderColor:
                        index === active
                          ? 'var(--accent)'
                          : isSelected
                            ? 'color-mix(in oklab, var(--accent) 45%, transparent)'
                            : 'var(--line)',
                      background: isApplied
                        ? 'color-mix(in oklab, var(--tc-teal) 10%, transparent)'
                        : 'transparent',
                    }}
                  >
                    {isApplied ? (
                      <span
                        aria-hidden="true"
                        className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-sm text-xs font-bold text-white"
                        style={{ background: 'var(--tc-teal)' }}
                      >
                        ✓
                      </span>
                    ) : (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() =>
                          setSelected((current) => {
                            const next = new Set(current)
                            if (next.has(index)) next.delete(index)
                            else next.add(index)
                            return next
                          })
                        }
                        aria-label={candidate.prompt}
                        className="mt-0.5 size-5 shrink-0 accent-[var(--accent)]"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => setActive(index)}
                      className="min-w-0 flex-1 text-start focus-visible:outline-3 focus-visible:outline-accent focus-visible:outline-offset-2"
                    >
                      <span className="line-clamp-2 block text-[0.82rem] leading-snug font-semibold text-fg">
                        {candidate.prompt}
                      </span>
                      {isApplied ? (
                        <span className="mt-0.5 block text-[0.7rem] font-bold" style={{ color: 'var(--tc-teal)' }}>
                          {t('teaching.generation.alreadyAdded')}
                        </span>
                      ) : null}
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>

          {/* One candidate, readable. */}
          <div className="min-h-0 overflow-y-auto p-5">
            {current ? (
              <>
                <p className="text-[1.35rem] leading-snug font-bold text-fg">{current.prompt}</p>
                <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {current.options.map((option, index) => (
                    <AnswerTile
                      key={option.id}
                      slot={slotFor(index)}
                      correctness={
                        option.id === String(current.answerKey) ? 'correct' : undefined
                      }
                    >
                      {option.text}
                    </AnswerTile>
                  ))}
                </div>
                {current.explanation ? (
                  <p className="mt-4 text-sm text-muted">
                    <span className="font-semibold text-fg">
                      {t('teaching.generation.explanationLabel')}:{' '}
                    </span>
                    {current.explanation}
                  </p>
                ) : null}
                {current.sourceSegments.length > 0 ? (
                  <p className="mt-2 text-sm text-muted">
                    {current.sourceSegments
                      .map((segment) => t('teaching.generation.viewSource', { page: segment }))
                      .join(' · ')}
                  </p>
                ) : null}
              </>
            ) : null}
          </div>
        </div>

        <footer className="flex flex-wrap items-center gap-2 border-t border-line px-5 py-4">
          <QuietButton
            onClick={() => setSelected(new Set(pending))}
            disabled={pending.length === 0}
          >
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
        </footer>
      </div>
    </div>
  )
}
