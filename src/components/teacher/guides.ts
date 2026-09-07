import { useTranslation } from 'react-i18next'

import ar from '@/i18n/locales/ar'
import en from '@/i18n/locales/en'

/**
 * The written guides, read straight off the translation resources.
 *
 * WHY NOT `t('teacher.guides.material', { returnObjects: true })`. Because a
 * guide is a nested object with an array of steps, and `returnObjects` hands
 * that back as `unknown` under this project's i18next typing — every field
 * would need a cast at the point of use, which is exactly where a typo stops
 * being a compile error. Reading the locale module gives the real shape, and
 * the copy still lives in `src/i18n/locales/` like every other string.
 *
 * The English object is the source of the type; Arabic is checked against it
 * by `ar.ts` itself, so a guide added to one language and forgotten in the
 * other does not compile.
 */

export type GuideKey = keyof typeof en.teacher.guides

export type Guide = {
  title: string
  lead: string
  steps: ReadonlyArray<{ title: string; body: string }>
  note: string
}

export function useGuides(): (key: GuideKey) => Guide {
  const { i18n } = useTranslation()
  const bundle = i18n.resolvedLanguage === 'en' ? en : ar
  return (key) => bundle.teacher.guides[key] as Guide
}
