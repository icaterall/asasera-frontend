import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { isAuthenticationPath, loginStateFor } from '@/lib/afterAuth'
import { pendingLoginReturn } from '@/lib/loginReturn'

import { AuthContext, type AuthStatus } from './auth-context'
import {
  auth,
  setAccessToken,
  getAccessToken,
  refreshSession,
  setSessionLostHandler,
  subscribeToAccessToken,
  type PublicUser,
} from '@/lib/api'

/**
 * Holds the session for the whole app.
 *
 * Two things live here and nowhere else: the current user, and the knowledge
 * of whether we have finished asking. The access token is NOT duplicated into
 * React state — it is read out of the api module's store through
 * `useSyncExternalStore`, because the 401 interceptor writes it from outside
 * React and a second copy would be stale for exactly as long as it took a
 * background refresh to finish.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const [user, setUser] = useState<PublicUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')

  const accessToken = useSyncExternalStore(subscribeToAccessToken, getAccessToken, () => null)

  // Leaving login/recovery/signup abandons the old request. Google navigates
  // outside this app, so its callback can still recover the tab's destination.
  useEffect(() => {
    if (!isAuthenticationPath(location.pathname)) pendingLoginReturn.clear()
  }, [location.pathname, location.search, location.hash])

  /**
   * Silent refresh on boot.
   *
   * The access token died with the last page, but the refresh cookie is
   * httpOnly and outlived it, so a reload can recover the session without
   * anyone typing anything. This is the only reason a signed-in person stays
   * signed in across F5 while nothing sensitive is in localStorage.
   *
   * A failure here is the ordinary case, not an error: it means nobody was
   * signed in. It sets `anonymous` and shows no message.
   */
  useEffect(() => {
    let cancelled = false

    /*
     * `refreshSession` and not a bare POST: the backend rotates the refresh
     * token on every use and reads a second presentation of a rotated token
     * as theft, revoking the family. StrictMode double-invokes this effect in
     * development, so a direct call here fires twice against one cookie and
     * signs the user out — which is exactly the bug the shared single-flight
     * exists to prevent.
     */
    refreshSession()
      .then((session) => {
        if (cancelled) return
        if (session) {
          setUser(session.user)
          setStatus('authenticated')
        } else {
          // The ordinary case: nobody was signed in. Not an error, and it
          // shows no message.
          setUser(null)
          setStatus('anonymous')
        }
      })
      .catch(() => {
        if (cancelled) return
        setUser(null)
        setStatus('anonymous')
      })

    return () => {
      cancelled = true
    }
  }, [])

  /**
   * What the interceptor calls when a refresh has failed and a replay still
   * came back 401 — the session is genuinely over.
   *
   * `navigate` rather than `window.location`, so the app does not reload its
   * own bundle to show a form it already has. Registered here because the api
   * module has no router of its own, and cleared on unmount so a stale closure
   * cannot navigate a tree that is gone.
   */
  useEffect(() => {
    setSessionLostHandler(() => {
      setUser(null)
      setStatus('anonymous')
      queryClient.clear()
      navigate('/login', { replace: true, state: loginStateFor(location) })
    })
    return () => setSessionLostHandler(null)
  }, [navigate, queryClient, location])

  const forgetSession = useCallback(() => {
    pendingLoginReturn.clear()
    setAccessToken(null)
    setUser(null)
    setStatus('anonymous')
    queryClient.clear()
  }, [queryClient])

  const signIn = useCallback(async (email: string, password: string) => {
    queryClient.clear()
    const session = await auth.login(email, password)
    setUser(session.user)
    setStatus('authenticated')
    return session.user
  }, [queryClient])

  const signOut = useCallback(async () => {
    /*
     * The server call is the point. Clearing the token locally would end the
     * session in this tab only — the refresh cookie would still be valid and
     * the next reload would sign the person straight back in. `auth.logout`
     * revokes the refresh family server-side and clears the cookie, and it
     * clears the in-memory token even if the network call fails.
     */
    await auth.logout().catch(() => {})
    forgetSession()
    navigate('/login', { replace: true })
  }, [navigate, forgetSession])

  const applyUser = useCallback((next: PublicUser) => {
    setUser(next)
    setStatus('authenticated')
  }, [])

  const value = useMemo(
    () => ({
      status,
      user,
      accessToken,
      /*
       * WHY THIS NO LONGER KEYS ON `educationStageId`.
       *
       * It used to read `role === 'teacher' && educationStageId === null`,
       * and that stopped being a completeness test the moment teachers stopped
       * being asked for a level: they are not asked at signup, and the profile
       * screen now shows the stage select to students only. The field would be
       * null for every teacher forever, so the condition would be permanently
       * true and each of them would be redirected to the profile step on every
       * single sign-in, with no way to satisfy it.
       *
       * The test is now "has this teacher told us anything at all" — a subject
       * or a workplace. A teacher who picked a workplace card during signup
       * has one before they ever sign in, which is the ordinary path and skips
       * the prompt outright.
       *
       * Student profile context is optional and never gates joining a class.
       */
      needsProfile:
        user?.role === 'teacher' && user.workplaceTypeId === null && user.categoryId === null,
      signIn,
      signOut,
      forgetSession,
      applyUser,
    }),
    [status, user, accessToken, signIn, signOut, forgetSession, applyUser],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
