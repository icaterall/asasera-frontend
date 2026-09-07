import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { AuthCard, AuthNotice } from '@/components/form/AuthCard'
import { useAuthCopy } from '@/copy/useAuthCopy'
import { useAuth } from '@/hooks/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { auth } from '@/lib/api'
import {homePathFor} from '@/lib/afterAuth'

type State = 'working' | 'done' | 'failed' | 'missing'

/**
 * Where the emailed verification link lands.
 *
 * THIS ROUTE DID NOT EXIST. The verification email has always pointed at
 * `/verify-email?token=…`, and nothing was mounted there — the link fell
 * through to the 404 page, so verification could never actually be completed
 * from an inbox. The endpoint, the token and the copy were all already
 * written; the page was the missing piece.
 *
 * ANONYMOUS ON PURPOSE. A link is opened from an inbox, which is often a
 * different browser or a phone from the one that signed up. Requiring a
 * session here would make the message useless to exactly the people most
 * likely to click it. The token is the proof; a session would add nothing.
 *
 * If the person DOES happen to be signed in in this tab, their cached user is
 * refreshed on success so the banner disappears without a reload. If they are
 * not, the banner in whatever tab they left open picks the change up when
 * that tab regains focus.
 */
export default function VerifyEmail() {
  const { c } = useAuthCopy()
  const [params] = useSearchParams()
  const { status, user, applyUser } = useAuth()
  useDocumentTitle(c.verify.title)

  const token = params.get('token')
  const [state, setState] = useState<State>(token ? 'working' : 'missing')

  /*
   * StrictMode mounts effects twice in development, and this one spends a
   * single-use token. Without the guard the second run consumes the token the
   * first run already spent, and a perfectly good link reports itself as
   * invalid — a bug that only ever appears in development, which is the worst
   * kind to leave in.
   */
  const started = useRef(false)

  useEffect(() => {
    if (!token || started.current) return
    started.current = true

    /*
     * NO `cancelled` FLAG, and that absence is load-bearing.
     *
     * The obvious shape here — set `cancelled` in the cleanup, check it before
     * every setState — is wrong in combination with the `started` guard above,
     * and wrong in a way that only appears in development. StrictMode runs the
     * effect, tears it down, and runs it again: the teardown sets the first
     * run's `cancelled` to true, and the second run returns immediately
     * because `started` is already set. So the only request in flight belongs
     * to a closure that has been told to discard its result, and the page sits
     * on "Verifying…" forever while the account is verified perfectly well on
     * the server. I shipped exactly that and caught it in the browser.
     *
     * Setting state after unmount is a no-op in React 18+, so there is nothing
     * to guard against; `started` alone gives the property that matters, which
     * is that a single-use token is spent once.
     */
    void (async () => {
      try {
        await auth.verifyEmail(token)
        setState('done')

      } catch {
        setState('failed')
      }
    })()
  }, [token, status, applyUser])

  useEffect(() => {
    if (state !== 'done' || status !== 'authenticated') return
    let active = true
    void auth.me().then(({user: fresh}) => { if (active) applyUser(fresh) }).catch(() => {})
    return () => { active = false }
  }, [state, status, applyUser])

  if (state === 'working') {
    return (
      <AuthCard title={c.verify.title}>
        <p className="text-sm" style={{ color: 'var(--ink-muted)' }} role="status" aria-live="polite">
          {c.verify.working}
        </p>
      </AuthCard>
    )
  }

  if (state === 'done') {
    return (
      <AuthCard title={c.verify.done}>
        <p className="mb-6" role="status">{c.verify.doneBody}</p>
          <Link to={user?homePathFor(user):'/login'} className="auth-provider justify-center font-semibold">
            {c.verify.continueAction}
          </Link>
      </AuthCard>
    )
  }

  /*
   * One screen for expired, already-used, replaced and never-issued.
   *
   * The server answers all four identically, and deliberately: telling a
   * stranger holding a URL which of those it was is telling them whether the
   * token ever existed. The recovery is the same in every case anyway — get a
   * fresh link — so the copy names that instead of the cause.
   */
  return (
    <AuthCard title={c.verify.failed}>
      <AuthNotice
        title={c.verify.failed}
        body={state === 'missing' ? c.verify.missing : c.verify.failedBody}
      >
        <Link to="/login" className="auth-provider justify-center font-semibold">
          {c.common.backToSignIn}
        </Link>
      </AuthNotice>
    </AuthCard>
  )
}
