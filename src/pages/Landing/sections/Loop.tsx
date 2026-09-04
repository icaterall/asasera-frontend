import { useCopy } from '@/copy/useCopy'
import type { LandingCopyKey } from '@/copy/landing.ar'
import { Bdi } from '@/components/Bdi'

import { SectionShell } from '../ui/SectionShell'

const steps = [1, 2, 3, 4, 5, 6] as const

/**
 * The six steps of a session, as a timeline rather than six cards.
 *
 * The step number is the structure here: set large and at low opacity it
 * reads as a position marker, not as content, which lets the title carry the
 * emphasis at a much smaller size. Six equally-weighted cards made the
 * sequence look like a feature grid; a hairline and a number make it look
 * like a sequence, which is what it is.
 *
 * Horizontal on desktop, vertical on mobile, one rule in each direction.
 */
export function Loop() {
  const { t } = useCopy()

  return (
    <SectionShell id="how" tone="surface" overline={t('loop.overline')} title={t('loop.title')}>
      <ol className="relative grid gap-y-10 md:grid-cols-3 md:gap-x-8 lg:grid-cols-6 lg:gap-x-6">
        {/*
          The desktop rule. Inset from both ends so the line spans the steps
          rather than running off the edge of the section.
        */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-7 hidden h-px bg-line lg:block"
          style={{ insetInlineStart: '2rem', insetInlineEnd: '2rem' }}
        />

        {steps.map((n, index) => (
          <li key={n} className="relative min-w-0 ps-14 md:ps-0">
            {/*
              The mobile rail, drawn per item so it stops at the last step
              instead of trailing past it.
            */}
            {index < steps.length - 1 ? (
              <span
                aria-hidden="true"
                className="absolute top-10 w-px bg-line md:hidden"
                style={{ insetInlineStart: '1.4rem', bottom: '-2.5rem' }}
              />
            ) : null}

            <span
              aria-hidden="true"
              className="absolute top-0 text-[3rem] leading-none font-bold text-fg/15 md:relative md:mb-2 md:block"
              style={{ insetInlineStart: 0 }}
            >
              <Bdi dir="ltr">{t(`loop.${n}.index` as LandingCopyKey)}</Bdi>
            </span>

            <p className="mb-1 text-sm text-muted">
              <Bdi>{t(`loop.${n}.duration` as LandingCopyKey)}</Bdi>
            </p>

            <h3 className="mb-1.5 text-[1.125rem] leading-snug font-semibold text-fg">
              {t(`loop.${n}.actor` as LandingCopyKey)}
            </h3>

            <p className="text-[0.9375rem] leading-[1.75] text-muted">
              {t(`loop.${n}.body` as LandingCopyKey)}
            </p>
          </li>
        ))}
      </ol>

      <p className="mt-14 max-w-[40ch] text-xl font-semibold text-fg md:mt-20">
        {t('loop.closing')}
      </p>
    </SectionShell>
  )
}
