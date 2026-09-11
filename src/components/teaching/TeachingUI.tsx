import { useEffect, useId, useRef, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { SectionError } from '@/components/teacher/DashboardCards'
import type { MaterialSegment } from '@/lib/api'

/**
 * The handful of pieces every instructor screen repeats.
 *
 * Deliberately small. The workspace already has its card, tool and section
 * components; these add only what authoring needs — a labelled field, a save
 * indicator that tells the truth, an empty state with a picture, and the
 * source viewer. Anything used once lives in the page that uses it.
 */

/**
 * One labelled control. The label is a real <label>, always — and so is the
 * description.
 *
 * The hint and the error used to be loose paragraphs beside the control: a
 * sighted user saw "file too large" under the field, while a screen-reader user
 * on that same field heard the label and nothing else, because nothing tied the
 * two together. `role="alert"` announces an error once, when it appears; it does
 * not answer "what is wrong with this field?" asked later, and it says nothing
 * at all about a hint. The control arrives as `children`, so the wiring is done
 * on the DOM node rather than through props — no caller has to change.
 *
 * Both are prose, so both are --f-small; §5 reserves 12px for labels and
 * counters, and a limit a teacher must act on is not a counter.
 */
export function Field({
  label,
  hint,
  error,
  children,
  htmlFor,
}: {
  label: string
  hint?: string
  error?: string | null
  children: ReactNode
  htmlFor?: string
}) {
  const auto = useId()
  const base = htmlFor ?? auto
  const hintId = hint ? `${base}-hint` : undefined
  const errorId = error ? `${base}-error` : undefined
  const control = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const field = control.current?.querySelector<HTMLElement>('input, select, textarea, [contenteditable="true"]')
    if (!field) return
    const described = [hintId, errorId].filter(Boolean).join(' ')
    if (described) field.setAttribute('aria-describedby', described)
    else field.removeAttribute('aria-describedby')
    if (error) field.setAttribute('aria-invalid', 'true')
    else field.removeAttribute('aria-invalid')
  }, [hintId, errorId, error, children])
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-fg">
        {label}
      </label>
      <div ref={control} className="contents">
        {children}
      </div>
      {hint ? <p id={hintId} className="text-sm text-muted">{hint}</p> : null}
      {error ? (
        <p id={errorId} role="alert" className="text-sm font-medium" style={{ color: 'var(--tc-coral)' }}>
          {error}
        </p>
      ) : null}
    </div>
  )
}

export const inputClass =
  'w-full rounded-sm border border-line bg-surface px-3 py-2.5 text-sm text-fg outline-none focus-visible:border-accent focus-visible:outline-3 focus-visible:outline-accent'

/**
 * The primary action, with the pressable face.
 *
 * `tc-tactile` carries the whole treatment — the darker inset lower edge, the
 * 1px sink on press, hover, focus ring and the disabled rules. It is a class
 * because the alternative is a box-shadow declaration on every page that uses
 * a button, and the fifth one always drifts.
 *
 * 48px min-height: the reference's primary-control size, and the size a thumb
 * actually hits on a phone.
 */
export function PrimaryButton({
  children,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`tc-tactile inline-flex min-h-[48px] items-center gap-2 rounded-sm bg-brand-500 px-5 text-[0.95rem] font-bold text-white ${className}`}
    >
      {children}
    </button>
  )
}

/**
 * The secondary action. Outlined, not filled, and deliberately without the
 * pressable edge — if every control has a raised face, none of them reads as
 * the primary one.
 *
 * 40px: the reference's toolbar size, which is the right target for a control
 * that sits in a row of several.
 */
export function QuietButton({
  children,
  tone = 'neutral',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: 'neutral' | 'danger' }) {
  return (
    <button
      {...props}
      className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-sm border border-line px-3.5 text-sm font-semibold transition-colors duration-200 hover:border-line-strong focus-visible:outline-3 focus-visible:outline-accent focus-visible:outline-offset-2 disabled:opacity-55 ${className}`}
      style={{ color: tone === 'danger' ? 'var(--tc-coral)' : 'var(--fg)' }}
    >
      {children}
    </button>
  )
}

export type SaveState = 'idle' | 'saving' | 'saved' | 'failed'

/**
 * Says what the server actually did.
 *
 * Three states and no optimistic fourth: "Saved" appears only after a response
 * came back, because a teacher who trusts an optimistic label and closes the
 * tab loses work and has no reason to suspect it. `role="status"` so the change
 * is announced rather than only coloured.
 */
export function SaveIndicator({ state }: { state: SaveState }) {
  const { t } = useTranslation()
  if (state === 'idle') return null

  const label =
    state === 'saving'
      ? t('teaching.common.saving')
      : state === 'saved'
        ? t('teaching.common.saved')
        : t('teaching.common.saveFailed')

  const colour =
    state === 'failed' ? 'var(--tc-coral)' : state === 'saved' ? 'var(--tc-teal)' : 'var(--muted)'

  return (
    <p role="status" aria-live="polite" className="text-xs font-semibold" style={{ color: colour }}>
      {label}
    </p>
  )
}

/** An empty state that looks intentional, with a real next action. */
export function EmptyState({
  art,
  title,
  body,
  action,
}: {
  art: ReactNode
  title: string
  body: string
  action?: ReactNode
}) {
  return (
    <div className="rounded-sm border border-line bg-surface p-8 text-center">
      <div className="mx-auto h-[132px] w-[240px]">{art}</div>
      <h2 className="mt-4 text-base font-bold text-balance text-fg">{title}</h2>
      <p className="mx-auto mt-2 max-w-[46ch] text-sm leading-relaxed text-pretty text-muted">
        {body}
      </p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  )
}

/** A status word with a colour AND a word, never colour alone. */
export function StatusPill({ tone, children }: { tone: 'teal' | 'amber' | 'coral' | 'neutral'; children: ReactNode }) {
  const colour = {
    teal: 'var(--tc-teal)',
    amber: 'var(--tc-amber-ink)',
    coral: 'var(--tc-coral)',
    neutral: 'var(--muted)',
  }[tone]
  const background = {
    teal: 'color-mix(in oklab, var(--tc-teal) 12%, transparent)',
    amber: 'color-mix(in oklab, var(--tc-amber) 26%, transparent)',
    coral: 'color-mix(in oklab, var(--tc-coral) 12%, transparent)',
    neutral: 'var(--canvas)',
  }[tone]

  return (
    <span
      className="inline-flex items-center rounded-sm px-2 py-1 text-xs font-bold"
      style={{ color: colour, background }}
    >
      {children}
    </span>
  )
}

/**
 * The source viewer.
 *
 * Extracted text beside its own page or paragraph number, with any warning
 * shown in place. A page this reader could not open is listed with its warning
 * rather than hidden — a gap in the list would read as a shorter document.
 *
 * The text is rendered as text. It came out of an untrusted file and may
 * contain anything, including sentences addressed to a machine; nothing here
 * interprets it, and no `dangerouslySetInnerHTML` appears in this tree.
 */
export function SourceSegments({
  segments,
  selected,
  onToggle,
}: {
  segments: MaterialSegment[]
  /** When given, each segment gets a checkbox and the list becomes a picker. */
  selected?: number[]
  onToggle?: (segmentIndex: number) => void
}) {
  const { t } = useTranslation()

  const warningLabel = (warning: string | null) =>
    warning === 'empty'
      ? t('teaching.materials.warningEmpty')
      : warning === 'unreadable'
        ? t('teaching.materials.warningUnreadable')
        : warning === 'low_text'
          ? t('teaching.materials.warningLowText')
          : null

  return (
    <ul className="flex flex-col gap-2">
      {segments.map((segment) => {
        const isPicker = Boolean(onToggle)
        const isSelected = selected?.includes(segment.segmentIndex) ?? false
        const label = segment.pageIndex
          ? t('teaching.editor.page', { n: segment.pageIndex })
          : t('teaching.editor.paragraph', { n: segment.segmentIndex })

        const inner = (
          <>
            <div className="flex items-center gap-2">
              {isPicker ? (
                <input
                  type="checkbox"
                  checked={isSelected}
                  readOnly
                  tabIndex={-1}
                  aria-hidden="true"
                  className="size-4 shrink-0 accent-brand-500"
                />
              ) : null}
              <span className="text-xs font-bold text-accent">{label}</span>
              {segment.warning ? (
                <StatusPill tone="amber">{warningLabel(segment.warning)}</StatusPill>
              ) : null}
            </div>
            <p className="mt-1.5 line-clamp-4 text-sm leading-relaxed text-pretty text-muted">
              {segment.text || '—'}
            </p>
          </>
        )

        return (
          <li key={segment.segmentIndex}>
            {isPicker ? (
              <button
                type="button"
                onClick={() => onToggle?.(segment.segmentIndex)}
                aria-pressed={isSelected}
                className="w-full rounded-sm border p-3 text-start focus-visible:outline-3 focus-visible:outline-accent"
                style={{
                  borderColor: isSelected ? 'var(--tc-brand)' : 'var(--line)',
                  background: isSelected
                    ? 'color-mix(in oklab, var(--tc-brand) 6%, var(--surface))'
                    : 'var(--surface)',
                }}
              >
                {inner}
              </button>
            ) : (
              <div className="rounded-sm border border-line bg-surface p-3">{inner}</div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export { SectionError }

/**
 * A confirmation the keyboard and a screen reader can both use.
 *
 * WHY IT IS NOT window.confirm. A native confirm cannot carry the thing that
 * makes this decision safe — the explanation of what will actually happen to
 * the teacher's files, which differs per material and comes from the server.
 *
 * FOCUS IS MOVED AND RETURNED. The heading takes focus on open so the reason is
 * read before the buttons are reached, and focus returns to whatever opened the
 * dialog on close, so a keyboard user is not dropped at the top of the page.
 * Escape cancels; the destructive action is never the default.
 */
export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  body: ReactNode
  confirmLabel: string
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  const { t } = useTranslation()
  const headingRef = useRef<HTMLHeadingElement>(null)
  const openerRef = useRef<Element | null>(null)

  useEffect(() => {
    if (!open) return
    openerRef.current = document.activeElement
    headingRef.current?.focus()

    const onKey = (event: KeyboardEvent) => {
      /* Escape cancels even mid-request: the request itself is not cancelled,
         but the teacher is not trapped watching it. */
      if (event.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      if (openerRef.current instanceof HTMLElement) openerRef.current.focus()
    }
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      style={{ background: 'color-mix(in oklab, var(--fg) 45%, transparent)' }}
      /* A click on the backdrop cancels; a click inside must not, so the panel
         stops the event rather than the backdrop guessing from coordinates. */
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-md rounded-sm border border-line bg-surface p-6 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <h2
          id="confirm-title"
          ref={headingRef}
          tabIndex={-1}
          className="text-lg font-bold text-balance text-fg outline-none"
        >
          {title}
        </h2>
        <div className="mt-2 flex flex-col gap-1.5 text-sm text-muted">{body}</div>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          {/* Cancel first in the DOM, so the safe choice is the one a keyboard
              reaches first and the destructive one is never the default. */}
          <QuietButton type="button" onClick={onCancel} disabled={busy}>
            {t('teaching.common.cancel')}
          </QuietButton>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-sm px-4 py-2.5 text-sm font-bold text-white transition-colors focus-visible:outline-3 focus-visible:outline-accent focus-visible:outline-offset-2 disabled:opacity-60"
            style={{ background: 'var(--tc-coral)' }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
