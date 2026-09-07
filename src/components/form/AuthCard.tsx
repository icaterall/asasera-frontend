import type { ReactNode } from 'react'

import { useAuthCopy } from '@/copy/useAuthCopy'
import { cn } from '@/lib/cn'

/**
 * How wide the card is allowed to get.
 *
 * Never a two-pane split with marketing art beside it — the person is here to
 * type, and a second column of something else to look at is not help. What
 * varies is only how many fields share a row.
 *
 * The cap is on the CARD, and the outer padding keeps it clear of the
 * viewport edge, so at 375px the card is 375 - 40 = 335px wide whichever
 * value is chosen. There is no fixed width anywhere in this tree that could
 * force a horizontal scrollbar.
 */
const WIDTHS = {
  /*
   * Sign in, forgot, reset. These ask for one thing, so they stay a single
   * column and the cap only stops a lone input from stretching to the width
   * of a desktop window.
   */
  narrow: 'max-w-[480px]',
  /*
   * The registration forms and the profile step, which lay their fields out
   * two to a row. Wide enough that each half still holds a real value — a
   * name, an address, the longer subject names — and no wider, because past
   * this the eye has to travel too far from a label to its own field.
   */
  wide: 'max-w-[720px]',
  /*
   * The choice screens — role, workplace, study level.
   *
   * 470px, measured off the supplied screenshots: the panel there is 472px
   * on a 2048px viewport, and 201px cards sit inside it two to a row with an
   * 11px gap. It was 640px, which is where the drift showed most — the panel
   * filled nearly half the screen and the cards stopped reading as a compact
   * block. Narrower than `narrow`'s 480 by a hair, and that is correct: this
   * panel holds a grid, not a column of full-width inputs.
   */
  choice: 'max-w-[470px]',
} as const

/**
 * The shell every auth screen shares: heading, one line of subtext, the
 * fields, and a quiet switch-role line under the card.
 *
 * `.auth-scope` is what brings in the five brand values; it is on this
 * element, so those colours exist inside these screens and nowhere else in
 * the app.
 */
export function AuthCard({
  title,
  lead,
  children,
  footer,
  width = 'narrow',
}: {
  title: string
  lead?: string
  children: ReactNode
  /** The "switch to the other form" line. Outside the card, under it. */
  footer?: ReactNode
  /** Single-column screens are `narrow`; the two-column forms are `wide`. */
  width?: keyof typeof WIDTHS
}) {
  const { dir } = useAuthCopy()

  return (
    /*
     * TOP SPACING, IN NORMAL FLOW.
     *
     * This was `pt-32 sm:pt-40` — 128px, then 160px — on top of a header
     * that already ends around 114px, which put the panel at 274px on a
     * desktop and left it stranded in the middle of the viewport with the
     * footer pushed off the fold.
     *
     * It is now a third of that, and it is still ordinary padding: no
     * negative margin, no translate, no absolute positioning. The panel
     * sits where the flow puts it, and `flex-1` on the <main> above lets
     * the leftover height fall below it rather than around it.
     *
     * The short-screen step is a `max-height` query, not another width
     * breakpoint. A 1280x720 laptop is a wide viewport with no vertical
     * room to spare, and it needs the same treatment as a phone — which a
     * width query would never give it.
     *
     * One value for every auth screen. There is no per-screen override and
     * no prop for one: the whole chain is the same shell, and a panel that
     * jumped vertically between the role step and the form after it would
     * read as a glitch rather than a difference.
     */
    <section className="auth-scope auth-section px-5 pb-16" dir={dir}>
      <div className={cn('mx-auto w-full', WIDTHS[width])}>
        <div className="auth-card p-6 sm:p-8">
          <h1 className="text-xl font-bold text-balance sm:text-2xl" style={{ color: 'var(--ink)' }}>
            {title}
          </h1>
          {lead ? (
            <p className="mt-2 text-sm leading-relaxed text-pretty" style={{ color: 'var(--ink-muted)' }}>
              {lead}
            </p>
          ) : null}

          <div className="mt-6 flex flex-col gap-5">{children}</div>
        </div>

        {footer ? (
          <p className="mt-5 text-center text-sm" style={{ color: 'var(--ink-muted)' }}>
            {footer}
          </p>
        ) : null}
      </div>
    </section>
  )
}

/**
 * A failure that belongs to the attempt rather than to one input — a wrong
 * password, a refused link, an unreachable server.
 *
 * Field-level messages never come through here; they render under their own
 * input, which is the difference between "this is wrong" and "something is
 * wrong somewhere above".
 *
 * It carries `auth-grid-wide` itself rather than being wrapped in a spanning
 * <div> by each form. The class is inert outside `.auth-grid`, and the early
 * return is the reason: a wrapper would still occupy a cell on the screens
 * where there is no error, opening a blank row above the first field.
 */
export function FormError({ children }: { children: ReactNode }) {
  if (!children) return null

  return (
    <p
      role="alert"
      aria-live="polite"
      className="auth-grid-wide rounded-sm border px-3 py-2.5 text-sm leading-relaxed"
      style={{
        color: 'var(--danger)',
        borderColor: 'color-mix(in oklab, var(--danger) 35%, transparent)',
        background: 'color-mix(in oklab, var(--danger) 8%, transparent)',
      }}
    >
      {children}
    </p>
  )
}

/** A success/limbo panel — "check your email", "password changed". */
export function AuthNotice({ title, body, children }: { title: string; body: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-base font-bold" style={{ color: 'var(--ink)' }}>
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-pretty" style={{ color: 'var(--ink-muted)' }}>
          {body}
        </p>
      </div>
      {children}
    </div>
  )
}
