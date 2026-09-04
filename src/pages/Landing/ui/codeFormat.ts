/**
 * Join-code shape, kept out of CodeInput.tsx so that file exports only its
 * component — the same split the repo already makes between Button.tsx and
 * buttonStyles.ts, and what keeps React Fast Refresh working.
 */
export const CODE_LENGTH = 6

/** Strips anything a join code cannot contain and upper-cases the rest. */
export function normaliseCode(raw: string): string {
  return raw
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, CODE_LENGTH)
}
