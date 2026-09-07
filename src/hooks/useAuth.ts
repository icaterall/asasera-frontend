import { use } from 'react'

import { AuthContext } from '@/context/auth-context'

/** The session. Throws outside the provider rather than returning a null. */
export function useAuth() {
  const context = use(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>')
  }
  return context
}
