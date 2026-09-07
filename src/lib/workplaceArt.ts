import {
  BriefcaseIllustration,
  CompassIllustration,
  GraduationIllustration,
  SchoolIllustration,
} from '@/components/ui/AuthIllustrations'

type WorkplaceArt = {
  Illustration: typeof SchoolIllustration
  /** The card's fill. A CSS custom property, defined in auth.css. */
  fill: string
  /** The colour the label and the drawing take ON that fill. */
  on: string
}

/**
 * Which picture and which colour each workplace card wears.
 *
 * KEYED ON `code`, WHICH IS WHY THE ENDPOINT RETURNS ONE. The alternatives
 * were both wrong. Row ids come from a sequence and are not stable — the four
 * rows on the development database came out 1, 2, 4, 3 because an earlier
 * partial run had already taken an id, and a fresh production install would
 * number them differently again; a mapping keyed on id would have painted
 * Business with the compass. Array position is worse still, since the endpoint
 * orders by `sort_order` and an editor may reorder it. `code` is pinned by a
 * CHECK constraint and is the only field of the four that may not be edited.
 *
 * WHY EACH COLOUR SITS WHERE IT DOES. Higher education takes the exact brand
 * blue #004ccc, because it is the one card that names what Asasera itself is
 * for and the brand belongs on it. School takes the warmest of the four so the
 * pair reads as two kinds of teaching rather than two ranks of it. Business
 * takes the teal — the second brand value's family — and Other takes amber,
 * the only card whose label is dark, which is what makes "none of the above"
 * visibly a different kind of answer without making it look like an error.
 *
 * EVERY PAIRING IS MEASURED. Each label sits directly on its fill, so each
 * pair clears 4.5:1 — see the table in auth.css. That is also why `on` exists
 * per card rather than a single white: white on amber is 2.15:1, and the fix
 * is a dark label on amber, not a browner amber.
 */
const BY_CODE: Record<string, WorkplaceArt> = {
  school: {
    Illustration: SchoolIllustration,
    fill: 'var(--wp-school)',
    on: '#ffffff',
  },
  higher_education: {
    Illustration: GraduationIllustration,
    fill: 'var(--wp-higher)',
    on: '#ffffff',
  },
  business: {
    Illustration: BriefcaseIllustration,
    fill: 'var(--wp-business)',
    on: '#ffffff',
  },
  other: {
    Illustration: CompassIllustration,
    fill: 'var(--wp-other)',
    on: '#ffffff',
  },
}

/**
 * A neutral card for a code this build does not know.
 *
 * The four are pinned by a database constraint, so this should be unreachable
 * — but a client is deployed separately from a schema, and the window where a
 * fifth row exists and the bundle has not caught up is exactly when a `!` here
 * would blank the screen. A brand-blue compass is a card that works.
 */
const FALLBACK: WorkplaceArt = {
  Illustration: CompassIllustration,
  fill: 'var(--wp-higher)',
  on: '#ffffff',
}

export function workplaceArt(code: string): WorkplaceArt {
  return BY_CODE[code] ?? FALLBACK
}
