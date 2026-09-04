import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

type Tone = 'surface' | 'tint'

const tones: Record<Tone, string> = {
  surface: 'bg-asas-surface text-asas-ink',
  tint: 'bg-asas-tint text-asas-ink',
}

type SectionShellProps = {
  id?: string
  tone?: Tone
  children: ReactNode
  className?: string
  title?: string
  /**
   * A short label above the h2. Used on two sections only — the loop and
   * pricing — so it marks the page's turning points rather than becoming
   * another thing every heading has.
   */
  overline?: string
  lead?: string
  labelledBy?: string
}

/**
 * The page's vertical rhythm and content measure.
 *
 * Padding is block-only here; the inline gutter belongs to the inner
 * container, which also owns the measure. Keeping the two separate means a
 * section can go full-bleed later without its text losing its margins.
 */
export function SectionShell({
  id,
  tone = 'surface',
  children,
  className,
  title,
  overline,
  lead,
  labelledBy,
}: SectionShellProps) {
  const headingId = title && id ? `${id}-title` : undefined

  return (
    <section
      id={id}
      aria-labelledby={labelledBy ?? headingId}
      className={cn(
        'scroll-mt-20 py-16 md:py-24',
        tones[tone],
        className,
      )}
    >
      <div className="mx-auto w-full max-w-[1200px] px-5 md:px-8">
        {overline ? (
          <p
            className={cn(
              'mb-3 text-[0.8125rem] font-semibold tracking-[0.12em] text-asas-accent-teal',
            )}
          >
            {overline}
          </p>
        ) : null}

        {title ? (
          <h2
            id={headingId}
            className={cn(
              'max-w-[24ch] text-asas-h2 font-bold text-asas-ink',
              lead ? 'mb-4' : 'mb-10 md:mb-14',
            )}
          >
            {title}
          </h2>
        ) : null}

        {lead ? (
          <p
            className={cn(
              'mb-10 max-w-[58ch] text-asas-lead text-asas-muted md:mb-14',
            )}
          >
            {lead}
          </p>
        ) : null}

        {children}
      </div>
    </section>
  )
}
