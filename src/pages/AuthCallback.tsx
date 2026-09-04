import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { Container } from '@/components/ui/Container'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { auth } from '@/lib/api'

/**
 * Where every federated sign-in lands, Google and Facebook alike.
 *
 * The backend has already done the work by the time the browser gets here: it
 * verified the handshake, exchanged the code, resolved the account and set the
 * httpOnly refresh cookie. What arrives in the URL is only the outcome —
 * either an `error` reason, or the two optional follow-up prompts.
 *
 * Nothing sensitive travels in this URL, deliberately. No access token, no
 * refresh token, no provider token. A URL is written to browser history, to
 * the Referer header of the next request, and to any proxy log in between, so
 * a token placed here would be a token leaked here. The session arrives in the
 * cookie; the access token is fetched by exchanging that cookie below, and
 * lives in memory only.
 */
export default function AuthCallback() {
  const { t } = useTranslation()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  useDocumentTitle(t('signIn.title'))

  const error = params.get('error')
  const needsEmail = params.get('needs_email') === '1'
  const needsProfile = params.get('needs_profile') === '1'

  const [failed, setFailed] = useState(false)

  useEffect(() => {
    // An error means no session was opened; there is nothing to exchange.
    // Send them back to the sign-in page, which owns the message table.
    if (error) {
      navigate(`/login?error=${encodeURIComponent(error)}`, { replace: true })
      return
    }

    /*
     * Trade the refresh cookie for an in-memory access token. This is the
     * existing refresh endpoint — the callback issues no new token shape and
     * needs no provider-specific client code.
     */
    let cancelled = false
    auth
      .refresh()
      .then(() => {
        if (cancelled) return
        /*
         * The prompts survive as query params rather than being acted on
         * here: which screen should ask for a missing email, and where the
         * profile step lives, are decisions for the routes that own them.
         * Both are optional — neither blocks the session that is now open.
         */
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })

    return () => {
      cancelled = true
    }
  }, [error, navigate])

  if (error) return null

  return (
    <section className="pt-36 pb-24 sm:pt-44">
      <Container>
        <div className="mx-auto w-full max-w-md">
          {failed ? (
            <>
              <p role="alert" className="text-lead text-pretty">
                {t('signIn.errors.failed')}
              </p>
              <Link
                to="/login"
                className="mt-6 inline-flex min-h-12 items-center rounded-md border border-line px-5 py-3 font-semibold hover:border-line-strong"
              >
                {t('signIn.retry')}
              </Link>
            </>
          ) : (
            <>
              <h1 className="text-title font-extrabold text-balance">
                {t('signIn.signedIn')}
              </h1>

              {/*
                Prompts, in the order they matter, and never gates. An account
                with no email address is a fully working account: a Facebook
                account created against a phone number has none to give, and
                refusing to finish the sign-in over it would turn a normal case
                into a dead end.
              */}
              {needsEmail ? (
                <p className="mt-5 leading-relaxed text-muted text-pretty">
                  {t('signIn.notices.needsEmail')}
                </p>
              ) : null}

              {needsProfile ? (
                <p className="mt-4 leading-relaxed text-muted text-pretty">
                  {t('signIn.notices.needsProfile')}
                </p>
              ) : null}
            </>
          )}
        </div>
      </Container>
    </section>
  )
}
