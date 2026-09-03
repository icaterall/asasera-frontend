import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Keeps `<title>` in step with the route *and* the active language, so a
 * language switch re-titles the tab without a reload.
 */
export function useDocumentTitle(title?: string) {
  const { t, i18n } = useTranslation()

  useEffect(() => {
    const brand = t('brand.name')
    document.title = title ? `${title} · ${brand}` : `${brand} — ${t('brand.tagline')}`
  }, [title, t, i18n.resolvedLanguage])
}
