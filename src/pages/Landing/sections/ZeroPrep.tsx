import { useCopy } from '@/copy/useCopy'
import type { LandingCopyKey } from '@/copy/landing.ar'

import { IconId, IconMap, IconUsers } from '../ui/Icons'
import { SectionShell } from '../ui/SectionShell'

const items = [
  { n: 1, Icon: IconMap },
  { n: 2, Icon: IconUsers },
  { n: 3, Icon: IconId },
] as const

/**
 * Where the content comes from — three columns split by hairlines.
 *
 * The divider is `border-inline-start` on the second and third items, which
 * is why the rules land between the columns and not outside them, and why
 * they move to the correct edge when the document flips to LTR without a
 * second rule being written.
 */
export function ZeroPrep() {
  const { t } = useCopy()

  return (
    <SectionShell id="zero" tone="surface" title={t('zero.title')}>
      <ul className="grid gap-8 md:grid-cols-3 md:gap-0">
        {items.map(({ n, Icon }, index) => (
          <li
            key={n}
            className={
              index === 0
                ? 'md:pe-8'
                : 'border-asas-line md:ps-8 md:pe-8 md:[border-inline-start-width:1px]'
            }
          >
            <span className="mb-4 block text-asas-accent-teal">
              <Icon size={24} />
            </span>
            <h3 className="mb-1.5 text-asas-h3 font-semibold text-asas-ink">
              {t(`zero.${n}.title` as LandingCopyKey)}
            </h3>
            <p className="text-[0.9375rem] text-asas-muted">
              {t(`zero.${n}.body` as LandingCopyKey)}
            </p>
          </li>
        ))}
      </ul>

      <p className="mt-12 max-w-[46ch] text-asas-h3 font-semibold text-asas-ink md:mt-16">
        {t('zero.closing')}
      </p>
    </SectionShell>
  )
}
