import { useCallback, useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { PublicUser } from '@/lib/api'
import { loginDestinationFor, safeReturnPath } from '@/lib/afterAuth'
import { pendingLoginReturn } from '@/lib/loginReturn'

/** Password login, Google callback and signup share one arrival policy. */
export function useLoginRedirect() {
  const location = useLocation()
  const navigate = useNavigate()
  const returnTo = useMemo(() => {
    const from = (location.state as { from?: unknown } | null)?.from
    return safeReturnPath(from) ?? pendingLoginReturn.read()
  }, [location])

  useEffect(() => {
    if (returnTo) pendingLoginReturn.remember(returnTo)
  }, [returnTo])

  return useCallback((user: Pick<PublicUser, 'role'>) => {
    const destination = loginDestinationFor(user, returnTo)
    pendingLoginReturn.clear()
    navigate(destination, { replace: true })
  }, [navigate, returnTo])
}
