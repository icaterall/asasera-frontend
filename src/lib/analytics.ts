import { api, API_PREFIX } from '@/lib/api'

const visitorKey = 'asasera-visitor-v1'
const sentKey = 'asasera-landing-visit-sent'

/**
 * Records one landing-page session using a browser-generated random value.
 * The API digests it before storage; no account, IP address, or URL query is
 * included in the analytics record. Measurement must never disrupt a visit.
 */
export function recordLandingVisit(): void {
  if (typeof window === 'undefined' || !window.crypto?.randomUUID) return
  try {
    if (window.sessionStorage.getItem(sentKey)) return
    let visitorId = window.localStorage.getItem(visitorKey)
    if (!visitorId) {
      visitorId = window.crypto.randomUUID()
      window.localStorage.setItem(visitorKey, visitorId)
    }
    window.sessionStorage.setItem(sentKey, '1')
    void api.post(`${API_PREFIX}/analytics/visits`, { visitorId, route: 'landing' }, { anonymous: true }).catch(() => undefined)
  } catch {
    // Storage can be disabled in privacy-focused browser contexts. The page
    // remains fully usable; the dashboard simply has less traffic coverage.
  }
}
