import { useEffect, useRef, useState } from 'react'

import { Bdi } from '@/components/Bdi'
import { useAuthCopy } from '@/copy/useAuthCopy'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import { useAuth } from '@/hooks/useAuth'
import { auth } from '@/lib/api'

/** A closed padlock. Inline SVG — no icon package, per the project rules. */
function LockIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="size-5 shrink-0" fill="currentColor">
      <path d="M10 1a4 4 0 0 0-4 4v2h-.5A1.5 1.5 0 0 0 4 8.5v8A1.5 1.5 0 0 0 5.5 18h9a1.5 1.5 0 0 0 1.5-1.5v-8A1.5 1.5 0 0 0 14.5 7H14V5a4 4 0 0 0-4-4Zm0 2a2 2 0 0 1 2 2v2H8V5a2 2 0 0 1 2-2Zm0 8a1.5 1.5 0 0 1 .75 2.8V15a.75.75 0 0 1-1.5 0v-1.2A1.5 1.5 0 0 1 10 11Z" />
    </svg>
  )
}

type Panel = 'none' | 'verify' | 'change'

/**
 * The sticky strip an unverified teacher sees above the header.
 *
 * WHY IT EXISTS AT ALL. Teachers are no longer stopped at a "check your email"
 * screen — they register, land in the application, and work. Verification
 * still matters, so the reminder has to travel with them instead of being a
 * gate they got past. That is what makes it sticky rather than a notice on
 * one page.
 *
 * NO DISMISS, and not by oversight. The banner is the only route to the two
 * actions that resolve it, so a dismissed banner is a teacher with no way back
 * to "resend" short of guessing a URL. It disappears when the SERVER says the
 * address is verified, and by no other means.
 *
 * Both account workspaces expose the same verification recovery actions.
 */
export function VerifyEmailBanner() {
  const { c, fmt } = useAuthCopy()
  const { status, user, applyUser } = useAuth()
  const toMessage = useApiErrorMessage()

  const [panel, setPanel] = useState<Panel>('none')
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [nextEmail, setNextEmail] = useState('')
  const [fieldError, setFieldError] = useState<string | null>(null)

  const show = status === 'authenticated' && !!user && !user.emailVerified

  /*
   * REFRESH ON FOCUS, NOT ON A TIMER.
   *
   * The link is usually opened in another tab, or on a phone, so this tab has
   * no way to learn that anything happened. Polling would mean a request per
   * teacher every few seconds, all day, to catch one event that happens once.
   * Coming back to the tab is exactly the moment the answer might have
   * changed, so that is when it asks — once, and guarded so a focus event and
   * a visibility event arriving together do not both fire.
   */
  const refreshing = useRef(false)
  useEffect(() => {
    if (!show) return

    async function recheck() {
      if (refreshing.current || document.visibilityState !== 'visible') return
      refreshing.current = true
      try {
        const { user: fresh } = await auth.me()
        applyUser(fresh)
      } catch {
        /* A failed re-check is not worth reporting: the banner simply stays,
           which is the safe direction to fail in. */
      } finally {
        refreshing.current = false
      }
    }

    window.addEventListener('focus', recheck)
    document.addEventListener('visibilitychange', recheck)
    return () => {
      window.removeEventListener('focus', recheck)
      document.removeEventListener('visibilitychange', recheck)
    }
  }, [show, applyUser])

  if (!show || !user?.email) return null

  const email = user.email

  async function resend() {
    setBusy(true)
    setNotice(null)
    try {
      const result = await auth.resendVerification()
      setNotice(result.alreadyVerified ? c.verify.alreadyVerified : c.verify.resendSent)
      if (result.alreadyVerified) {
        const { user: fresh } = await auth.me()
        applyUser(fresh)
      }
    } catch (cause) {
      /*
       * The server owns the cooldown and reports how long is left. Showing its
       * number rather than running a client-side timer keeps the two from
       * disagreeing — and they would, the moment a request was slow.
       */
      const detail = (cause as { details?: { retryAfterSeconds?: number } })?.details
      setNotice(
        typeof detail?.retryAfterSeconds === 'number'
          ? fmt(c.verify.resendWait, { seconds: detail.retryAfterSeconds })
          : toMessage(cause),
      )
    } finally {
      setBusy(false)
    }
  }

  async function submitChange(event: React.FormEvent) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setFieldError(null)
    try {
      const { user: updated } = await auth.changeEmail(nextEmail.trim().toLowerCase())
      /* The displayed destination follows the persisted account, not the
         field — so it only moves once the server has actually stored it. */
      applyUser(updated)
      setNextEmail('')
      setPanel('verify')
      setNotice(c.verify.resendSent)
    } catch (cause) {
      setFieldError(toMessage(cause))
    } finally {
      setBusy(false)
    }
  }

  /*
   * The sentence is split on its own placeholder rather than interpolated,
   * so the address can be a real <bdi> element. An email address is Latin
   * text inside an Arabic sentence, and without an isolate the bidi algorithm
   * reorders it against the words on either side.
   */
  const [beforeEmail, afterEmail] = c.verify.banner.split('{{email}}')

  return (
    <div className="verify-banner" role="status">
      <div className="verify-banner-bar">
        <LockIcon />

        <p className="verify-banner-text">
          {beforeEmail}
          <Bdi className="verify-banner-email">{email}</Bdi>
          {afterEmail}
        </p>

        <div className="verify-banner-actions">
          <button
            type="button"
            className="verify-btn verify-btn-solid"
            aria-expanded={panel === 'verify'}
            onClick={() => {
              /*
               * Opening the panel does NOT send anything. Only the button
               * inside it does. A panel that mails on open turns idle
               * curiosity into a stream of near-identical messages, and the
               * first thing a mail provider does with that is start filing
               * them as spam.
               */
              setPanel((current) => (current === 'verify' ? 'none' : 'verify'))
              setNotice(null)
            }}
          >
            {c.verify.verifyAction}
          </button>

          <button
            type="button"
            className="verify-btn verify-btn-quiet"
            aria-expanded={panel === 'change'}
            onClick={() => {
              setPanel((current) => (current === 'change' ? 'none' : 'change'))
              setFieldError(null)
              setNextEmail(email)
            }}
          >
            {c.verify.changeAction}
          </button>
        </div>
      </div>

      {panel === 'verify' ? (
        <div className="verify-panel">
          <h2 className="verify-panel-title">{c.verify.panelTitle}</h2>
          <p className="verify-panel-body">{c.verify.panelBody}</p>
          <p className="verify-panel-email">
            <Bdi>{email}</Bdi>
          </p>
          <div className="verify-panel-actions">
            <button
              type="button"
              className="verify-btn verify-btn-solid"
              disabled={busy}
              onClick={resend}
            >
              {c.verify.resend}
            </button>
            <button
              type="button"
              className="verify-btn verify-btn-quiet"
              onClick={() => setPanel('none')}
            >
              {c.verify.close}
            </button>
          </div>
          {notice ? (
            <p className="verify-panel-note" role="status" aria-live="polite">
              {notice}
            </p>
          ) : null}
        </div>
      ) : null}

      {panel === 'change' ? (
        <div className="verify-panel">
          <h2 className="verify-panel-title">{c.verify.changeTitle}</h2>
          <p className="verify-panel-body">{c.verify.changeBody}</p>
          <form onSubmit={submitChange} noValidate>
            <label className="verify-panel-label" htmlFor="verify-next-email">
              {c.verify.changeLabel}
            </label>
            <input
              id="verify-next-email"
              type="email"
              dir="ltr"
              inputMode="email"
              autoComplete="email"
              className="verify-panel-input"
              value={nextEmail}
              disabled={busy}
              onChange={(event) => setNextEmail(event.target.value)}
            />
            {fieldError ? (
              <p className="verify-panel-error" role="alert">
                {fieldError}
              </p>
            ) : null}
            <div className="verify-panel-actions">
              <button type="submit" className="verify-btn verify-btn-solid" disabled={busy}>
                {c.verify.changeSubmit}
              </button>
              <button
                type="button"
                className="verify-btn verify-btn-quiet"
                onClick={() => setPanel('none')}
              >
                {c.verify.close}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  )
}
