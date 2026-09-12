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
   * for plain `ar` if you want Eastern Arabic numerals instead.
   */
  intlLocale: string
}

/** Arabic remains first in the chooser; first-visit language comes from the device. */
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

/** Use English when the browser/device does not prefer Arabic. */
export const DEFAULT_LANGUAGE = 'en'

export const SUPPORTED_CODES = LANGUAGES.map((l) => l.code)

/** Resolves `ar-SA`, `AR`, or an unknown tag down to a language we ship. */
export function resolveLanguage(code: string | undefined): LanguageMeta {
  const base = (code ?? '').toLowerCase().split('-')[0]
  const fallback =
    LANGUAGES.find((l) => l.code === DEFAULT_LANGUAGE) ?? LANGUAGES[0]
  return LANGUAGES.find((l) => l.code === base) ?? fallback
}

/**
 * The first browser/device preference decides the first visit. Only Arabic
 * maps to the RTL interface; every other locale uses the English interface.
 */
export function languageFromBrowser(code: string | undefined): LanguageMeta {
  return (code ?? '').trim().toLowerCase().startsWith('ar')
    ? LANGUAGES[0]!
    : LANGUAGES.find((language) => language.code === 'en')!
}
