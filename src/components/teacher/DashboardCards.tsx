import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { ForwardIcon } from './TeacherIcons'

/**
 * The two card shapes the dashboard repeats, and the section heading above
 * them. Three small components rather than one configurable one: a card that
 * took a `variant` prop and branched five ways internally would be harder to
 * read than the two it replaced.
 */

/**
 * A section title with an optional trailing link.
 *
 * `level` exists because this is the first heading on the guides page and the
 * second on the dashboard. Hardcoding h2 gave the guides page no h1 at all,
 * which leaves a screen-reader user with no top-level heading to orient by.
 */
export function SectionHeader({
  title,
  lead,
  action,
  level = 2,
}: {
  title: string
  lead?: string
  action?: ReactNode
  level?: 1 | 2
}) {
  const Heading = level === 1 ? 'h1' : 'h2'
  return (
    <div className="mb-3 flex flex-wrap items-end justify-between gap-4">
      {/* Wraps under the actions on a 360 px phone instead of squeezing the lead into a sliver. */}
      <div className="min-w-[14rem] flex-1">
        <Heading className="text-lg font-bold text-fg">{title}</Heading>
        {lead ? <p className="mt-0.5 text-sm text-pretty text-muted">{lead}</p> : null}
      </div>
      {action}
    </div>
  )
}

type Tone = 'brand' | 'teal' | 'coral' | 'amber' | 'sky' | 'violet'

const FILL: Record<Tone, string> = {
  brand: 'var(--tc-brand)',
  teal: 'var(--tc-teal)',
  coral: 'var(--tc-coral)',
  amber: 'var(--tc-amber)',
  sky: 'var(--tc-sky)',
  violet: 'var(--tc-violet)',
}

/**
 * Amber is the one fill white cannot sit on — measured, white on #f5a524 is
 * 1.9:1, which is not a contrast failure so much as an unreadable label. It
 * takes dark ink instead, rather than being quietly darkened until white
 * passes and the palette loses its warmest colour.
 */
const ON_FILL: Partial<Record<Tone, string>> = { amber: 'var(--tc-amber-ink)' }

/**
 * A large illustrated card: coloured thumbnail on top, text below.
 *
 * `onClick` opens a guide; `to` navigates. Exactly one is given, and the
 * element rendered matches — a button for an action, a link for a destination.
 * A div with a click handler would be neither, and would reach the keyboard
 * only by accident.
 */
export function IllustratedActionCard({
  tone,
  art,
  title,
  body,
  action,
  chip,
  onClick,
  to,
}: {
  tone: Tone
  art: ReactNode
  title: string
  body: string
  action: string
  /** Rendered when the destination is a written guide rather than a tool. */
  chip?: string
  onClick?: () => void
  to?: string
}) {
  const inner = (
    <>
      <div className="teacher-card-thumb" style={{ ['--tc-fill' as string]: FILL[tone] }}>
        {art}
        {chip ? (
          <span
            className="absolute end-3 top-3 rounded-sm bg-white/90 px-2 py-1 text-[0.6875rem] font-bold text-ink-900"
            /* The chip sits over the illustration, so it needs its own stacking
               context; the art itself is pointer-events-none. */
          >
            {chip}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-[0.9375rem] font-bold text-balance text-fg">{title}</h3>
        <p className="mt-1.5 flex-1 text-sm leading-relaxed text-pretty text-muted">{body}</p>
        <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-accent">
          {action}
          <ForwardIcon className="size-4" />
        </span>
      </div>
    </>
  )

  if (to) {
    return (
      <Link to={to} className="teacher-card rounded-sm">
        {inner}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className="teacher-card rounded-sm">
      {inner}
    </button>
  )
}

/** A compact, fully coloured card for an action that works today. */
export function TeacherToolCard({
  tone,
  icon,
  title,
  body,
  action,
  onClick,
  to,
}: {
  tone: Tone
  icon: ReactNode
  title: string
  body: string
  action: string
  onClick?: () => void
  to?: string
}) {
  const inner = (
    <>
      <span aria-hidden="true" className="mb-1">
        {icon}
      </span>
      <h3 className="text-[0.9375rem] font-bold text-balance">{title}</h3>
      <p className="text-sm leading-snug text-pretty opacity-90">{body}</p>
      <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold underline underline-offset-4">
        {action}
      </span>
    </>
  )

  const style = {
    ['--tc-fill' as string]: FILL[tone],
    ...(ON_FILL[tone] ? { ['--tc-on-fill' as string]: ON_FILL[tone] } : {}),
  }

  if (to) {
    return (
      <Link to={to} className="teacher-tool rounded-sm" style={style}>
        {inner}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className="teacher-tool rounded-sm" style={style}>
      {inner}
    </button>
  )
}

/**
 * A section that failed to load says so where it is, and offers the retry
 * there too. The rest of the dashboard keeps rendering — one failed reference
 * list must not blank a page whose other six sections are fine.
 */
export function SectionError({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation()
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-line bg-surface p-4"
    >
      <p className="text-sm text-muted">{t('teacher.section.failed')}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-sm border border-line px-3 py-2 text-sm font-bold text-accent focus-visible:outline-3 focus-visible:outline-accent"
      >
        {t('teacher.section.retry')}
      </button>
    </div>
  )
}
