import { safeReturnPath } from './afterAuth.ts'

const KEY = 'asasera.login-return.v1'
const MAX_AGE_MS = 30 * 60 * 1000
type ReturnStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

/** Tab-scoped navigation context survives Google's full-page redirect and is
 * cleared after login/sign-out. Authentication tokens are managed separately. */
export function createLoginReturnStore(storage: () => ReturnStorage, now = Date.now) {
  let memory: string | null = null
  function clear() {
    memory = null
    try { storage().removeItem(KEY) } catch { /* Storage can be disabled. */ }
  }
  function remember(value: unknown) {
    const path = safeReturnPath(value)
    if (!path) { clear(); return }
    memory = JSON.stringify({ path, expiresAt: now() + MAX_AGE_MS })
    try { storage().setItem(KEY, memory) } catch {
      // If storage is full, do not retain a different, older destination.
      try { storage().removeItem(KEY) } catch { /* Keep this page's fallback. */ }
    }
  }
  function read(): string | null {
    let raw = memory
    try { raw = storage().getItem(KEY) ?? memory } catch { /* Use memory if unavailable. */ }
    if (!raw) return null
    try {
      const entry = JSON.parse(raw)
      const path = safeReturnPath(entry?.path)
      if (path && typeof entry.expiresAt === 'number' && Number.isFinite(entry.expiresAt) && entry.expiresAt > now() && entry.expiresAt <= now() + MAX_AGE_MS) return path
    } catch { /* A stale or edited entry is never trusted. */ }
    clear()
    return null
  }
  return { remember, read, clear }
}

export const pendingLoginReturn = createLoginReturnStore(() => window.sessionStorage)
