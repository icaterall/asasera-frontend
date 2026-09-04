import { useCallback, useMemo, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { landingAr, type LandingCopyKey } from './landing.ar'
import { landingEn } from './landing.en'
import { LanguageContext, type LandingLanguage } from './language-context'

const TABLES = { ar: landingAr, en: landingEn } as const

/**
 * Holds the landing page's active language and exposes `t()` over its copy
 * tables.
 *
 * The language itself is *not* stored here. i18next already owns it for this
 * app: it persists the choice to `localStorage` under `asasera.language`,
 * defaults to Arabic on a first visit, and — via the `languageChanged`
 * listener in src/i18n/index.ts — writes `lang` and `dir` onto <html>.
 * Duplicating that state in a second provider would give the document two
 * writers for one attribute, and they would disagree the moment either the
 * header control or the app shell changed it.
 *
 * So this provider reads i18next and writes back to it. The result is what
 * the brief asks for — one context, `t(key)`, `dir` flipping for the whole
 * document, persistence, Arabic by default — with a single source of truth.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation()

  const lang: LandingLanguage = i18n.resolvedLanguage === 'en' ? 'en' : 'ar'
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  const setLanguage = useCallback(
    (next: LandingLanguage) => {
      if (next !== i18n.resolvedLanguage) void i18n.changeLanguage(next)
    },
    [i18n],
  )

  const value = useMemo(() => {
    const table = TABLES[lang]
    const t = (key: LandingCopyKey) => table[key]
    return {
      lang,
      dir: dir as 'rtl' | 'ltr',
      t,
      tList: (key: LandingCopyKey) => t(key).split('|').filter(Boolean),
      setLanguage,
    }
  }, [lang, dir, setLanguage])

  return <LanguageContext value={value}>{children}</LanguageContext>
}
