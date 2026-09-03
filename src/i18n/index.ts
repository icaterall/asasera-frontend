import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import { DEFAULT_LANGUAGE, SUPPORTED_CODES, resolveLanguage } from './languages'
import ar from './locales/ar'
import en from './locales/en'

export const LANGUAGE_STORAGE_KEY = 'asasera.language'

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: SUPPORTED_CODES,
    // Collapse `ar-SA`, `ar-EG` … onto the `ar` bundle.
    load: 'languageOnly',
    detection: {
      // Arabic-first: `navigator` is deliberately absent. A returning visitor's
      // stored choice wins; everyone else gets the document's own language,
      // which index.html sets to Arabic — not whatever locale their browser
      // happens to report.
      order: ['localStorage', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
    },
    interpolation: {
      // React already escapes interpolated values.
      escapeValue: false,
    },
  })

/**
 * Keeps `<html lang>` and `<html dir>` in step with the active language.
 * Living on the i18next event bus rather than in a component means the
 * document is correct even before React mounts, and stays correct no
 * matter which part of the tree triggers the change.
 */
function applyDocumentLanguage(code: string) {
  const { code: resolved, dir } = resolveLanguage(code)
  const root = document.documentElement
  root.lang = resolved
  root.dir = dir
}

applyDocumentLanguage(i18n.resolvedLanguage ?? DEFAULT_LANGUAGE)
i18n.on('languageChanged', applyDocumentLanguage)

export default i18n
