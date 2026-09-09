import { useEffect } from 'react'
import { LoadingIndicator } from '@/design/LoadingIndicator'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { AuthCard } from '@/components/form/AuthCard'
import { useAuthCopy } from '@/copy/useAuthCopy'
import { useAuth } from '@/hooks/useAuth'
import { useLoginRedirect } from '@/hooks/useLoginRedirect'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

/**
 * Where every federated sign-in lands, Google and Facebook alike.
 *
 * The backend has already done the work by the time the browser gets here: it
 * verified the handshake, exchanged the code, resolved the account and set the
 * httpOnly refresh cookie. What arrives in the URL is only the outcome —
 * either an `error` reason from a fixed set, or nothing at all.
 *
 * NOTHING SENSITIVE TRAVELS IN THIS URL, deliberately. No access token, no
 * refresh token, no provider token. A URL is written to browser history, to
 * the Referer header of the next request, and to any proxy log in between, so
 * a token placed here would be a token leaked here. The session arrives in the
 * cookie, and `AuthProvider`'s boot refresh trades that cookie for an
 * in-memory access token as this page mounts — which is why there is no fetch
 * of its own here.
 *
 * Whether the account still owes us a profile is likewise NOT read from the
 * URL. It comes off the user object the refresh returned
 * (a teacher with neither a subject nor a workplace), because a query
 * parameter is something anyone can set and an account's completeness is not.
 */
export default function AuthCallback() {
  const { c } = useAuthCopy()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const redirectAfterLogin = useLoginRedirect()
  const { status, user } = useAuth()
  useDocumentTitle(c.login.title)

  const error = params.get('error')

  useEffect(() => {
    /*
     * An error means no session was opened, so there is nothing to wait for.
     * Back to /login, which owns the message table — this screen does not
     * duplicate it.
     */
    if (error) {
      navigate(`/login?error=${encodeURIComponent(error)}`, { replace: true })
      return
    }

    if (status === 'authenticated' && user) {
      /* Same destination policy as password sign-in. The OAuth exchange above
         is untouched; only where it lands has changed. */
      redirectAfterLogin(user)
      return
    }

    /*
     * The cookie did not produce a session: it expired between the redirect
     * and this page, or the browser refused it. Reported as a failed sign-in
     * rather than silently landing on an anonymous home page.
     */
    if (status === 'anonymous') {
      navigate('/login?error=failed', { replace: true })
    }
  }, [error, status, user, navigate, redirectAfterLogin])

  return (
    <AuthCard title={c.login.title}>
      <LoadingIndicator label={c.callback.working} />
    </AuthCard>
  )
}
