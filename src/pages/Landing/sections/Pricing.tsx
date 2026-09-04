import { Bdi } from '@/components/Bdi'
import type { LandingCopyKey } from '@/copy/landing.ar'
import { useCopy } from '@/copy/useCopy'
import { cn } from '@/lib/cn'

import { IconCheck } from '../ui/Icons'
import { SectionShell } from '../ui/SectionShell'

/**
 * `dept` is the featured plan, not `pro`.
 *
 * The emphasis follows the money: this is sold to departments, and
 * highlighting the individual plan would aim the section's strongest visual
 * cue at its weakest revenue line. The badge says who it is for rather than
 * "most popular", which we have no users to justify.
 */
const plans = [
  { key: 'free', featured: false },
  { key: 'pro', featured: false },
  { key: 'dept', featured: true },
  { key: 'org', featured: false },
] as const

export function Pricing() {
  const { t, tList } = useCopy()

  return (
    <SectionShell
      id="pricing"
      tone="surface"
      overline={t('pricing.overline')}
      title={t('pricing.title')}
    >
      <ul className="grid items-stretch gap-4 md:grid-cols-2 md:gap-5 xl:grid-cols-4">
        {plans.map(({ key, featured }) => {
          const features = tList(`pricing.${key}.features` as LandingCopyKey)
          const period = t(`pricing.${key}.period` as LandingCopyKey)

          return (
            <li
              key={key}
              className={cn(
                'relative flex flex-col overflow-hidden rounded-md border bg-surface p-6',
                featured ? 'border-accent/40' : 'border-line',
              )}
            >
              {featured ? (
                <p className="mb-3 inline-flex self-start rounded-sm bg-accent/12 px-2.5 py-1 text-sm font-semibold text-accent">
                  {t('pricing.featured')}
                </p>
              ) : null}

              <h3 className="mb-2 text-xl font-semibold text-fg">
                {t(`pricing.${key}.name` as LandingCopyKey)}
              </h3>

              {/*
                The price is a mixed run — digits, an en-dash and a currency
                symbol — so it is isolated as one LTR island. Left bare inside
                Arabic, "8–12 $" resolves with the symbol dragged to the wrong
                end of the range.
              */}
              <p className="mb-5 flex flex-wrap items-baseline gap-x-2">
                <Bdi dir="ltr" className="text-[1.5rem] font-bold text-fg">
                  {t(`pricing.${key}.price` as LandingCopyKey)}
                </Bdi>
                {period ? <span className="text-sm text-muted">{period}</span> : null}
              </p>

              <ul className="flex flex-col gap-2.5">
                {features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 text-[0.9375rem] text-muted"
                  >
                    <span className="mt-1 shrink-0 text-accent-alt">
                      <IconCheck size={16} />
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </li>
          )
        })}
      </ul>

      {/*
        The section's closing promise, and the answer to the question every
        department asks second. Solid teal, white text at 4.88:1.
      */}
      <p className="mt-6 rounded-md bg-teal-700 px-6 py-5 text-center font-bold text-white md:mt-8 md:text-lead">
        {t('pricing.band')}
      </p>
    </SectionShell>
  )
}
