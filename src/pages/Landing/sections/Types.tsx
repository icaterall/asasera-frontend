import { useCopy } from '@/copy/useCopy'

import { Card } from '../ui/Card'
import { SectionShell } from '../ui/SectionShell'

/**
 * Drag: the path, not the destination.
 *
 * The drawing records what the product records — a route with a hesitation
 * and a reversal in it, not a straight line from token to slot. That is the
 * claim the card makes in words, so the illustration has to make it too.
 *
 * Fills are tokens rather than hex, so the illustration follows the theme
 * instead of staying a bright rectangle on the dark rendition.
 */
function DragIllustration() {
  return (
    <svg viewBox="0 0 320 132" className="h-auto w-full" role="presentation">
      <rect x="18" y="20" width="88" height="40" rx="3" fill="var(--asas-surface-tint)" stroke="var(--asas-line)" />
      <rect x="18" y="74" width="88" height="40" rx="3" fill="var(--asas-surface-tint)" stroke="var(--asas-line)" />

      <path
        d="M232 44 C196 40 168 58 150 74 C140 83 128 90 118 92"
        fill="none"
        stroke="var(--asas-accent)"
        strokeWidth="2"
        strokeDasharray="4 4"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M118 92 C132 88 140 70 132 52 C128 44 118 40 110 40"
        fill="none"
        stroke="var(--asas-accent)"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Hesitation, marked where the path doubles back. */}
      <circle cx="118" cy="92" r="5" fill="var(--asas-surface)" stroke="var(--asas-warn)" strokeWidth="2" />

      <rect x="232" y="26" width="70" height="36" rx="3" fill="var(--asas-surface)" stroke="var(--asas-accent)" strokeWidth="1.5" />
      <path d="M248 44h38" stroke="var(--asas-accent)" strokeWidth="2" strokeLinecap="round" opacity="0.35" />
    </svg>
  )
}

/** Interactive image: regions on a picture from the teacher's own material. */
function ImageIllustration() {
  return (
    <svg viewBox="0 0 320 132" className="h-auto w-full" role="presentation">
      <rect x="14" y="12" width="292" height="108" rx="3" fill="var(--asas-surface-tint)" stroke="var(--asas-line)" />
      <ellipse cx="112" cy="66" rx="62" ry="42" fill="var(--asas-surface)" stroke="var(--asas-line)" />
      <circle cx="100" cy="60" r="17" fill="var(--asas-surface)" stroke="var(--asas-accent-teal)" strokeWidth="2" />

      <path d="M117 60h52" stroke="var(--asas-accent-teal)" strokeWidth="1.5" strokeDasharray="3 3" />
      <rect x="172" y="48" width="112" height="24" rx="2" fill="var(--asas-surface)" stroke="var(--asas-accent-teal)" strokeWidth="1.5" />

      <path d="M150 92h20" stroke="var(--asas-ink-muted)" strokeWidth="1.5" strokeDasharray="3 3" />
      <rect x="172" y="82" width="112" height="22" rx="2" fill="var(--asas-surface)" stroke="var(--asas-line)" />
    </svg>
  )
}

const small = ['mcq', 'truefalse', 'ordering'] as const

/**
 * Two developed cards and three plain text items.
 *
 * The card budget is spent here on the two interactions that differentiate
 * the product. The other three are real, so they are named — but wrapping
 * them in matching boxes produced five equal-looking features and buried the
 * argument. Text in a row says "these exist too" without competing.
 */
export function Types() {
  const { t } = useCopy()

  return (
    <SectionShell id="types" tone="tint" title={t('types.title')} lead={t('types.lead')}>
      <div className="grid gap-5 md:grid-cols-2">
        <Card raised className="overflow-hidden p-6 md:p-7">
          <DragIllustration />
          <h3 className="mt-6 mb-2 text-asas-h3 font-semibold text-asas-ink">{t('types.drag.title')}</h3>
          <p className="text-[0.9375rem] leading-[1.8] text-asas-muted">{t('types.drag.body')}</p>
        </Card>

        <Card raised className="overflow-hidden p-6 md:p-7">
          <ImageIllustration />
          <h3 className="mt-6 mb-2 text-asas-h3 font-semibold text-asas-ink">{t('types.image.title')}</h3>
          <p className="text-[0.9375rem] leading-[1.8] text-asas-muted">{t('types.image.body')}</p>
        </Card>
      </div>

      <ul className="mt-12 grid gap-8 border-t border-asas-line pt-10 md:mt-16 md:grid-cols-3">
        {small.map((key) => (
          <li key={key}>
            <h3 className="mb-1 text-[1.0625rem] font-semibold text-asas-ink">
              {t(`types.${key}.title` as 'types.mcq.title')}
            </h3>
            <p className="text-[0.9375rem] text-asas-muted">
              {t(`types.${key}.body` as 'types.mcq.body')}
            </p>
          </li>
        ))}
      </ul>
    </SectionShell>
  )
}
