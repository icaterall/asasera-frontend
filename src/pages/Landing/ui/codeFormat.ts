import { normalizePin } from '@/lib/joinInput'

/**
 * Join-code shape, kept out of CodeInput.tsx so that file exports only its
 * component — the same split the repo already makes between Button.tsx and
 * buttonStyles.ts, and what keeps React Fast Refresh working.
 *
 * A live-session PIN is six digits (see SessionPage, which reads `?pin=`),
 * so the landing strip uses the same normaliser as the student join screens:
 * Western, Arabic-Indic and Persian digits are accepted, everything else is
 * dropped.
 */
export const CODE_LENGTH = 6

/** Strips anything a join PIN cannot contain and keeps the first six digits. */
export function normaliseCode(raw: string): string {
  return normalizePin(raw).slice(0, CODE_LENGTH)
}

/** The in-app route a valid PIN opens — `/join` reads the PIN from the query. */
export function joinPath(code: string): string {
  return `/join?pin=${encodeURIComponent(code)}`
}
