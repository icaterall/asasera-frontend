import { useEffect } from 'react'

import { LanguageProvider } from '@/copy/LanguageProvider'
import { useCopy } from '@/copy/useCopy'

import { Departments } from './sections/Departments'
import { Editor } from './sections/Editor'
import { Footer } from './sections/Footer'
import { Gap } from './sections/Gap'
import { Hero } from './sections/Hero'
import { JoinStrip } from './sections/JoinStrip'
import { Loop } from './sections/Loop'
import { Nav } from './sections/Nav'
import { Pricing } from './sections/Pricing'
import { Types } from './sections/Types'
import { ZeroPrep } from './sections/ZeroPrep'

/**
 * Section order and background grouping.
 *
 * The tint does not simply alternate. Sections are paired by subject, so a
 * change of ground marks a change of topic rather than a change of row:
 *
 *   hero + join        surface / tint   the opening and the way in
 *   loop + gap         surface          how a session runs, and why it differs
 *   types + editor     tint             what the product actually is
 *   zero + pricing     surface          what it costs, in effort and in money
 *   departments        tint             the buying conversation
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
    <div className="asas-landing">
      {/*
        First focusable thing on the page. Hidden until focused, then it lands
        on an ink chip in the corner — a skip link that stays invisible when
        focused is the version everyone ships and nobody can use.
      */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[60] focus:m-3 focus:rounded-asas focus:bg-asas-inksurface focus:px-4 focus:py-3 focus:text-white"
      >
        {t('skipToContent')}
      </a>

      <Nav />

      <main id="main">
        <Hero />
        <JoinStrip />
        <Loop />
        <Gap />
        <Types />
        <Editor />
        <ZeroPrep />
        <Pricing />
        <Departments />
      </main>

      <Footer />
    </div>
  )
}

/**
 * The public landing page.
 *
 * Not wrapped in the app's shared `Layout`: that shell carries the starter's
 * navigation, footer and toggles, and this page owns its own header and
 * footer. It is routed as a sibling of the Layout branch in App.tsx.
 */
export default function Landing() {
  return (
    <LanguageProvider>
      <LandingContent />
    </LanguageProvider>
  )
}
