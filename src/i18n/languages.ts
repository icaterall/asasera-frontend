export type Direction = 'ltr' | 'rtl'

export type LanguageMeta = {
  /** BCP-47 code, also the i18next resource key. */
  code: string
  /** Endonym — always shown in its own script. */
  nativeName: string
  /** Name in English, for `aria-label` and analytics. */
  englishName: string
  dir: Direction
  /**
   * Locale used for Intl formatting. `ar-u-nu-latn` keeps Western digits,
   * which is what most modern Arabic interfaces in the region use. Swap it
   * for plain `ar` if you want Eastern Arabic numerals (٠١٢٣).
   */
  intlLocale: string
}

/**
 * Arabic is listed first because this product is Arabic-first: it is the
 * default a new visitor gets, and the leading segment in the language switch.
 */
export const LANGUAGES: readonly LanguageMeta[] = [
  {
    code: 'ar',
    nativeName: 'العربية',
    englishName: 'Arabic',
    dir: 'rtl',
    intlLocale: 'ar-u-nu-latn',
  },
  {
    code: 'en',
    nativeName: 'English',
    englishName: 'English',
    dir: 'ltr',
    intlLocale: 'en-US',
  },
] as const

export const DEFAULT_LANGUAGE = 'ar'

export const SUPPORTED_CODES = LANGUAGES.map((l) => l.code)

/** Resolves `ar-SA`, `AR`, or an unknown tag down to a language we ship. */
export function resolveLanguage(code: string | undefined): LanguageMeta {
  const base = (code ?? '').toLowerCase().split('-')[0]
  const fallback =
    LANGUAGES.find((l) => l.code === DEFAULT_LANGUAGE) ?? LANGUAGES[0]
  return LANGUAGES.find((l) => l.code === base) ?? fallback
}
