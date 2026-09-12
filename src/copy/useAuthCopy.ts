import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { authAR } from './auth.ar'
import { authEN, type AuthCopy } from './auth.en'

const TABLES = { ar: authAR, en: authEN } as const

export type UseAuthCopy = {
  lang: 'ar' | 'en'
  dir: 'rtl' | 'ltr'
  /** The whole table for the active language. Read it as `c.login.title`. */
  c: AuthCopy
  /** Fills `{{name}}` placeholders. */
  fmt: (template: string, vars: Record<string, string | number>) => string
}

/**
 * The auth screens' copy.
 *
 * Reads the active language from i18next rather than holding its own, for the
 * same reason `LanguageProvider` does: i18next already persists the choice,
 * uses the browser/device language and writes `lang`/`dir` onto <html> from its own event
 * bus. A second owner of that state would disagree with the first the moment
 * the header toggle ran, and the visible symptom is a page whose direction no
 * longer matches its text.
 *
 * The table is returned whole rather than behind a `t('some.key')` lookup, so
 * a mistyped path is a TYPE error at build time instead of `undefined` on
 * screen at sign-in time. `auth.ar.ts` is typed against `AuthCopy`, so the
 * two languages cannot drift apart either.
 *
 * `fmt` is a plain string replace, not `Intl`. The only interpolated number
 * on these screens is the password counter, and `Intl.NumberFormat` under an
 * `ar` locale renders Arabic-Indic digits — exactly the numeral rule this
 * product does not follow. A template substitution keeps ASCII digits in both
 * languages with no locale override to remember.
 */
export function useAuthCopy(): UseAuthCopy {
  const { i18n } = useTranslation()
  const lang: 'ar' | 'en' = i18n.resolvedLanguage === 'en' ? 'en' : 'ar'

  return useMemo(
    () => ({
      lang,
      dir: lang === 'ar' ? ('rtl' as const) : ('ltr' as const),
      c: TABLES[lang],
      fmt: (template: string, vars: Record<string, string | number>) =>
        template.replace(/\{\{(\w+)\}\}/g, (whole, name: string) =>
          name in vars ? String(vars[name]) : whole,
        ),
    }),
    [lang],
  )
}
