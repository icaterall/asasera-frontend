import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import { DEFAULT_LANGUAGE, SUPPORTED_CODES, languageFromBrowser, resolveLanguage } from './languages'
import ar from './locales/ar'
import en from './locales/en'
import { en as adminAiEn, ar as adminAiAr } from './locales/adminAi'

export const LANGUAGE_STORAGE_KEY = 'asasera.language'

/* Ignore an old or malformed stored value so browser detection can still make
   the first-visit choice. The language picker only writes `ar` or `en`. */
function savedLanguage(): string | undefined {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (!stored) return undefined
    const code = stored.trim().toLowerCase().split('-')[0]
    if (code === 'ar' || code === 'en') return code
    localStorage.removeItem(LANGUAGE_STORAGE_KEY)
  } catch {
    // Storage can be unavailable in private or embedded browser contexts.
  }
  return undefined
}

function deviceLanguage(): string | undefined {
  if (typeof navigator === 'undefined') return undefined
  return navigator.languages?.[0] ?? navigator.language
}

const initialLanguage = savedLanguage() ?? languageFromBrowser(deviceLanguage()).code
let languageReady = false

void i18n
  .use(initReactI18next)
  .init({
    lng: initialLanguage,
    resources: {
      en: { translation: en, adminAi: adminAiEn },
      ar: { translation: ar, adminAi: adminAiAr },
    },
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: SUPPORTED_CODES,
    // Collapse `ar-SA`, `ar-EG` … onto the `ar` bundle.
    load: 'languageOnly',
    interpolation: {
      // React already escapes interpolated values.
      escapeValue: false,
    },
  })
  .then(() => {
    languageReady = true
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

applyDocumentLanguage(initialLanguage)
i18n.on('languageChanged', (code) => {
  applyDocumentLanguage(code)
  // Initial device detection is not a user preference. Every later change —
  // including language controls outside the main header — is remembered.
  if (!languageReady) return
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, resolveLanguage(code).code)
  } catch {
    // The active session still changes language if storage is unavailable.
  }
})

export default i18n
