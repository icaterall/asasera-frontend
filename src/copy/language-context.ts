import { createContext } from 'react'

import type { LandingCopyKey } from './landing.ar'

export type LandingLanguage = 'ar' | 'en'

export type LanguageContextValue = {
  lang: LandingLanguage
  dir: 'rtl' | 'ltr'
  /** Reads a key from the active language's copy table. */
  t: (key: LandingCopyKey) => string
  /** Splits a pipe-joined list (the pricing feature lists). */
  tList: (key: LandingCopyKey) => string[]
  setLanguage: (next: LandingLanguage) => void
}

/*
 * Split from the provider component so the module exports only a context —
 * a file that exports both a component and a value breaks React Fast
 * Refresh, which is the same split the repo already makes in
 * src/context/theme-context.ts.
 */
export const LanguageContext = createContext<LanguageContextValue | null>(null)
