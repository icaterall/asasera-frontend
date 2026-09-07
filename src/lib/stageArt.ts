import {
  BooksIllustration,
  GraduationIllustration,
  SchoolIllustration,
} from '@/components/ui/AuthIllustrations'

type Art = { Illustration: typeof BooksIllustration; hue: string; wash: string }

/**
 * Which illustration and hue a given education-stage record gets.
 *
 * KEYED ON THE RECORD, NOT ITS POSITION. The endpoint orders by
 * `sort_order, id`, and that order changes the moment somebody reorders the
 * table — so an array-index mapping would silently repaint every stage. The
 * key here is the row's own `name_en`, normalised, which is the only stable
 * identifier the public endpoint exposes (it returns id, name_ar, name_en and
 * nothing else; ids are sequence-assigned and differ between environments).
 *
 * NEUTRAL FALLBACK, DELIBERATELY. Anything unrecognised gets the graduation
 * mark in brand blue rather than a guess. The current table cannot describe
 * kindergarten, school or training contexts through this endpoint at all —
 * when those records become reachable they will land on the fallback and look
 * intentional, not broken, until a key is added here.
 */
const KEYS: Array<[RegExp, Art]> = [
  [
    /kindergarten|early|nursery|روضة/i,
    { Illustration: BooksIllustration, hue: 'var(--acc-coral)', wash: 'var(--acc-coral-wash)' },
  ],
  [
    /grade|primary|secondary|school|ابتدائ|ثانو|مدرسة/i,
    { Illustration: SchoolIllustration, hue: 'var(--acc-amber)', wash: 'var(--acc-amber-wash)' },
  ],
  [
    /diploma|college|دبلوم|كلية/i,
    { Illustration: BooksIllustration, hue: 'var(--acc-sky)', wash: 'var(--acc-sky-wash)' },
  ],
  [
    /bachelor|undergraduate|university|بكالوريوس|جامع/i,
    { Illustration: GraduationIllustration, hue: 'var(--acc-mint)', wash: 'var(--acc-mint-wash)' },
  ],
  [
    /master|phd|doctor|postgraduate|postdoc|ماجستير|دكتوراه|عليا|زمالة/i,
    { Illustration: GraduationIllustration, hue: 'var(--brand-blue)', wash: 'var(--acc-blue-wash)' },
  ],
]

const FALLBACK: Art = {
  Illustration: GraduationIllustration,
  hue: 'var(--brand-blue)',
  wash: 'var(--acc-blue-wash)',
}

export function stageArt(nameEn: string, nameAr: string): Art {
  const haystack = `${nameEn} ${nameAr}`
  return KEYS.find(([pattern]) => pattern.test(haystack))?.[1] ?? FALLBACK
}
