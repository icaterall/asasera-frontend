import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { LANGUAGES, resolveLanguage, type LanguageMeta } from '@/i18n/languages'

export type UseLanguage = {
  current: LanguageMeta
  /** The language the toggle would switch to. */
  other: LanguageMeta
  isRTL: boolean
  languages: readonly LanguageMeta[]
  setLanguage: (code: string) => void
  toggleLanguage: () => void
}

export function useLanguage(): UseLanguage {
  const { i18n } = useTranslation()

  const current = resolveLanguage(i18n.resolvedLanguage ?? i18n.language)
  const other = LANGUAGES.find((l) => l.code !== current.code) ?? current

  const setLanguage = useCallback(
    (code: string) => {
      if (code !== i18n.resolvedLanguage) void i18n.changeLanguage(code)
    },
    [i18n],
  )

  const toggleLanguage = useCallback(() => {
    setLanguage(other.code)
  }, [other.code, setLanguage])

  return {
    current,
    other,
    isRTL: current.dir === 'rtl',
    languages: LANGUAGES,
    setLanguage,
    toggleLanguage,
  }
}
