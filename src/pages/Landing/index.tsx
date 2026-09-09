import { useEffect } from 'react'

import { LanguageProvider } from '@/copy/LanguageProvider'
import { useCopy } from '@/copy/useCopy'
import { useAuth } from '@/hooks/useAuth'

import { Departments } from './sections/Departments'
import { Experience } from './sections/Experience'
import { Hero } from './sections/Hero'
import { JoinStrip } from './sections/JoinStrip'
import { Pricing } from './sections/Pricing'
import styles from './Landing.module.css'

function LandingContent() {
  const { t, lang } = useCopy()
  const { user } = useAuth()

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
    <div className={`asas ${styles.landing} ${user ? styles.signedIn : ''}`}>
      <Hero />
      <JoinStrip />
      <Experience />
      <Pricing />
      <Departments />
    </div>
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
