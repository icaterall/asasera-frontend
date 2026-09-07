import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * React Router does not restore scroll or honour `#hash` targets on its own.
 * This puts new routes at the top and eases to an anchor when one is present.
 */
export function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      // Wait a frame so the target section exists before we measure it.
      const frame = requestAnimationFrame(() => {
        // Fragments are element IDs, not CSS selectors. Ignore malformed
        // percent-encoding instead of throwing while navigating a shared URL.
        try {
          document.getElementById(decodeURIComponent(hash.slice(1)))
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        } catch { /* An unknown fragment leaves the page usable. */ }
      })
      return () => cancelAnimationFrame(frame)
    }

    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname, hash])

  return null
}
