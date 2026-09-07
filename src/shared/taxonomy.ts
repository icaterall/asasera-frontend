/*
 * GENERATED FILE — DO NOT EDIT.
 *
 * Mirrored from asasera-backend/packages/shared/src/taxonomy.ts.
 * Edit the source there and run `npm run sync:shared` in asasera-backend.
 * CI fails if this file and its source differ.
 */
import { z } from 'zod'

/**
 * Classification — plan §3 (p6).
 *
 * The level ladder is closed: fourteen values, 0 through 13, and L13 is
 * «higher ed and above». `LEVEL_IDS` is the single place that number is
 * written down on this side of the wire; the database says the same thing in
 * `CHECK (id BETWEEN 0 AND 13)`.
 */
export const LEVEL_IDS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] as const
export type LevelId = (typeof LEVEL_IDS)[number]

export const levelIdSchema = z
  .number()
  .int()
  .min(0)
  .max(13)
  .refine((n): n is LevelId => LEVEL_IDS.includes(n as LevelId))

/** ISO-3166-1 alpha-2, upper case. The column is CHAR(2) with the same check. */
export const countrySchema = z.string().regex(/^[A-Z]{2}$/, 'expected a two-letter ISO country code')

export const levelSchema = z.object({
  id: levelIdSchema,
  code: z.string().regex(/^L(?:[0-9]|1[0-3])$/),
  ageFrom: z.number().int().min(0).max(120),
  ageTo: z.number().int().min(0).max(120),
})
export type Level = z.infer<typeof levelSchema>

export const subjectSchema = z.object({
  id: z.number().int().positive(),
  code: z.string().regex(/^[a-z][a-z0-9_]*$/),
  nameAr: z.string().min(1),
  nameEn: z.string().min(1),
})
export type Subject = z.infer<typeof subjectSchema>

export const purposeSchema = subjectSchema
export type Purpose = z.infer<typeof purposeSchema>

/**
 * The generic fallback label.
 *
 * §3: «الدولة غير المُدخلة ترتدّ إلى تسمية عامة مشتقّة من رقم المستوى» — a
 * country that was not entered falls back to a generic label derived from the
 * level number.
 *
 * DERIVED, and deliberately not stored. A fourth pseudo-country row in
 * `level_labels` would be a second source of truth that could disagree with
 * this function, and the disagreement would show up as one screen calling a
 * level «المستوى 8» while another called it something else.
 *
 * It lives in shared because the front end renders it during an optimistic
 * update, before any response has arrived, and a second implementation there
 * is exactly the drift §2 forbids.
 */
export function genericLevelLabel(levelId: LevelId, locale: 'ar' | 'en'): string {
  if (levelId === 13) {
    return locale === 'ar' ? 'التعليم العالي وما بعده' : 'Higher education and above'
  }
  if (levelId === 0) {
    return locale === 'ar' ? 'ما قبل المدرسة' : 'Pre-school'
  }
  return locale === 'ar' ? `المستوى ${levelId}` : `Level ${levelId}`
}

/**
 * The label to show, given whatever the server had.
 *
 * One function so «which label wins» is answered once. A country-specific label
 * beats the generic one; an absent or blank one falls back rather than
 * rendering an empty cell.
 */
export function resolveLevelLabel(
  levelId: LevelId,
  locale: 'ar' | 'en',
  countryLabel?: { ar?: string | null; en?: string | null } | null,
): string {
  const specific = locale === 'ar' ? countryLabel?.ar : countryLabel?.en
  const trimmed = specific?.trim()
  return trimmed && trimmed.length > 0 ? trimmed : genericLevelLabel(levelId, locale)
}
