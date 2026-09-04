import { useEffect } from 'react'

import { LanguageProvider } from '@/copy/LanguageProvider'
import { useCopy } from '@/copy/useCopy'

import { Departments } from './sections/Departments'
import { Editor } from './sections/Editor'
import { Gap } from './sections/Gap'
import { Hero } from './sections/Hero'
import { JoinStrip } from './sections/JoinStrip'
import { Loop } from './sections/Loop'
import { Pricing } from './sections/Pricing'
import { Types } from './sections/Types'
import { ZeroPrep } from './sections/ZeroPrep'

/**
 * Section order.
 *
 * The nav, the ambient gradient, the skip link and the footer are no longer
 * here — `Layout` owns all four, and this page now sits inside it like every
 * other route. That is the point of the change: there was one design on the
 * sign-in page and a different one on the landing page, and a visitor moving
 * between them crossed a visible seam.
 *
 * Backgrounds still alternate, but they alternate in the app's own tokens:
 * `canvas` for most sections and `raised` where a group of related sections
 * should read as one block.
 */
function LandingContent() {
  const { t, lang } = useCopy()

  useEffect(() => {
    document.title = t('meta.title')

    const description = document.querySelector('meta[name="description"]')
    const previous = description?.getAttribute('content') ?? null
    description?.setAttribute('content', t('meta.description'))

    return () => {
      if (previous !== null) description?.setAttribute('content', previous)
    }
    /* Re-runs on a language switch, so the tab title follows the page. */
  }, [t, lang])

  return (
    <>
      <Hero />
      <JoinStrip />
      <Loop />
      <Gap />
      <Types />
      <Editor />
      <ZeroPrep />
      <Pricing />
      <Departments />
    </>
  )
}

/**
 * The public landing page.
 *
 * `LanguageProvider` stays because the landing copy lives in its own tables
 * rather than the i18next bundles. It reads the active language *from*
 * i18next, so the language control in the shared header drives this page too
 * — one switch, one source of truth, two copy stores.
 */
export default function Landing() {
  return (
    <LanguageProvider>
      <LandingContent />
    </LanguageProvider>
  )
}
