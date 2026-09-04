import { useCopy } from '@/copy/useCopy'
import type { LandingCopyKey } from '@/copy/landing.ar'

import { IconArrowEnd } from '../ui/Icons'
import { SectionShell } from '../ui/SectionShell'

const rows = [1, 2, 3] as const

/**
 * What the market leaves undone, beside what this does instead.
 *
 * Three rules and no boxes. The contrast that matters is between the two
 * halves of each row — muted and struck through against full-strength ink —
 * so putting a border around both halves only flattened them back together.
 *
 * Order is reading order, not a fixed left/right: the page runs RTL in
 * Arabic and LTR in English, so the "missing" column is simply first in the
 * DOM and lands on the start side either way.
 */
export function Gap() {
  const { t } = useCopy()

  return (
    <SectionShell id="gap" tone="surface" title={t('gap.title')}>
      <ul className="border-t border-line">
        {rows.map((n) => (
          <li
            key={n}
            className="grid items-baseline gap-x-6 gap-y-2 border-b border-line py-6 md:grid-cols-[1fr_auto_1fr] md:py-8"
          >
            <p className="text-[1.0625rem] text-muted line-through decoration-muted/40 md:text-lg">
              {t(`gap.${n}.lack` as LandingCopyKey)}
            </p>

            {/*
              A drawn arrow, not a text glyph: "→" is a character whose shape
              and weight come from whichever font happens to own it, and it
              points the wrong way the moment the page flips to LTR. The SVG
              points at the inline end in both directions.
            */}
            <span aria-hidden="true" className="hidden text-line md:block">
              <IconArrowEnd size={20} />
            </span>

            <p className="text-[1.0625rem] font-medium text-fg md:text-lg">
              {t(`gap.${n}.us` as LandingCopyKey)}
            </p>
          </li>
        ))}
      </ul>
    </SectionShell>
  )
}
