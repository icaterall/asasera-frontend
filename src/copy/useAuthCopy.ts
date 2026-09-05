import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { authAr, type AuthCopyKey } from './auth.ar'
import { authEn } from './auth.en'

const TABLES = { ar: authAr, en: authEn } as const

export type AuthCopy = {
  lang: 'ar' | 'en'
  dir: 'rtl' | 'ltr'
  /** Reads a key from the active table, interpolating `{name}` placeholders. */
  t: (key: AuthCopyKey, vars?: Record<string, string | number>) => string
}

/**
 * The auth screens' copy.
 *
 * Reads the active language from i18next rather than holding its own, for the
 * same reason `LanguageProvider` does: i18next already persists the choice,
 * defaults to Arabic and writes `lang`/`dir` onto <html> from its own event
 * bus. A second owner of that state would disagree with the first the moment
 * the header toggle ran, and the visible symptom is a page whose direction no
 * longer matches its text.
 *
 * Interpolation is a plain string replace, not `Intl`. The only interpolated
 * number on these screens is the password counter, and `Intl.NumberFormat`
 * under an `ar` locale renders Arabic-Indic digits — which is exactly the
 * numeral rule this product does not follow. A template substitution keeps
 * ASCII digits in both languages without a locale override to remember.
 */
export function useAuthCopy(): AuthCopy {
  const { i18n } = useTranslation()

  const lang: 'ar' | 'en' = i18n.resolvedLanguage === 'en' ? 'en' : 'ar'

  const t = useCallback(
    (key: AuthCopyKey, vars?: Record<string, string | number>) => {
      const value = TABLES[lang][key]
      if (!vars) return value
      return value.replace(/\{(\w+)\}/g, (whole, name: string) =>
        name in vars ? String(vars[name]) : whole,
      )
    },
    [lang],
  )

  return useMemo(
    () => ({ lang, dir: lang === 'ar' ? 'rtl' : 'ltr', t }),
    [lang, t],
  )
}
