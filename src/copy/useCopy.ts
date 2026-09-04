import { use } from 'react'

import { LanguageContext } from './language-context'

/**
 * The landing page's copy and language controls.
 *
 * Every string on the page comes through here, so switching language is a
 * re-render rather than a reload, and a component cannot accidentally
 * hard-code Arabic.
 */
export function useCopy() {
  const context = use(LanguageContext)
  if (!context) {
    throw new Error('useCopy must be used inside <LanguageProvider>')
  }
  return context
}
