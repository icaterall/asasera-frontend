import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { AuthCard } from '@/components/form/AuthCard'
import { AuthDivider } from '@/components/form/AuthDivider'
import { EmailTakenMessage } from '@/components/form/EmailTakenMessage'
import { Field } from '@/components/form/Field'
import { SubmitButton } from '@/components/form/SubmitButton'
import { GoogleIcon } from '@/components/ui/BrandIcons'
import { useAuthOptions } from '@/hooks/useAuthOptions'
import { useAuthCopy } from '@/copy/useAuthCopy'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSignup } from '@/hooks/useSignup'
import { auth, federatedSignInUrl } from '@/lib/api'
import { APPLE_AUTH_ENABLED } from '@/lib/flags'

/** Apple's mark. Inline SVG — no icon package, per the project rules. */
function AppleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M16.36 12.78c-.02-2.2 1.8-3.26 1.88-3.31-1.02-1.5-2.61-1.7-3.18-1.72-1.35-.14-2.64.79-3.33.79-.69 0-1.75-.77-2.87-.75-1.48.02-2.84.86-3.6 2.18-1.53 2.66-.39 6.6 1.1 8.76.73 1.06 1.6 2.25 2.74 2.2 1.1-.04 1.51-.71 2.84-.71s1.7.71 2.87.69c1.18-.02 1.93-1.08 2.65-2.14.83-1.22 1.18-2.4 1.2-2.46-.03-.01-2.3-.88-2.32-3.5zM14.2 6.1c.6-.74 1.01-1.75.9-2.77-.87.04-1.93.58-2.56 1.31-.56.65-1.06 1.7-.93 2.7.97.08 1.97-.5 2.59-1.24z" />
    </svg>
  )
}

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/**
 * Step three: how the account will be created.
 *
 * Email-first. This screen takes an address and nothing else — no name, no
 * title, no subject, no password. It creates nothing, so a mistyped address
 * costs a correction rather than an orphan account.
 *
 * CONTINUE NOW ASKS THE SERVER. Shape first, because a malformed address is
 * not worth a round trip, then one call to say whether the address is free.
 * Free means the password step; taken means staying here with a sentence that
 * links to sign in. The alternative was what this replaced: someone who
 * already had an account chose a password, submitted, and got nothing —
 * registration answered a duplicate exactly like a new address, so there was
 * nothing left to tell them with.
 *
 * ON CONTINUE, NOT ON KEYSTROKE. A check per character is a request per
 * character, all of them answering a question about a half-typed address, and
 * it hands anyone watching the network a free enumeration tool. The button is
 * the moment the person says they mean it.
 *
 * A FAILED CHECK IS NOT A PASS. If the request errors the screen says so and
 * stays put. Treating an unanswered question as "available" would walk the
 * person to the password step to fail there instead.
 */
export default function MethodStep() {
  const { c } = useAuthCopy()
  const providers = useAuthOptions()
  const navigate = useNavigate()
  const { role } = useParams<{ role: string }>()
  const { draft, begin, setEmail } = useSignup()

  const signupRole = role === 'student' ? 'student' : 'teacher'
  useDocumentTitle(c.signup.method.title)

  const toMessage = useApiErrorMessage()

  const [value, setValue] = useState(draft?.email ?? '')
  const [error, setError] = useState<string | null>(null)
  const [touched, setTouched] = useState(false)
  const [checking, setChecking] = useState(false)
  /* The address the server said was taken — held rather than a boolean, so
     the sign-in link carries the value that was actually checked even if the
     field has since been edited. */
  const [takenEmail, setTakenEmail] = useState<string | null>(null)

  /*
   * WHICH ANSWER IS STILL THE CURRENT ONE.
   *
   * A ref, not state: it is read and written inside the async handler and has
   * to hold the value at that instant, not the one from the render that built
   * the closure. Every edit and every new submit bumps it, so a reply that
   * belongs to a superseded address is dropped instead of overwriting the
   * screen with an answer about text the person has already changed.
   */
  const request = useRef(0)

  /*
   * The double-submit guard, and it has to be a ref.
   *
   * `checking` was the obvious thing to test, and it is wrong: React batches
   * state, so two clicks landing in the same tick both read the value from
   * the render that built their handler — `false` — and both fire. The
   * button's own `disabled` has not re-rendered yet either. Three clicks sent
   * three requests when I tested it. A ref is written synchronously, so the
   * second click sees the first one's write.
   */
  const busy = useRef(false)

  /* Refresh recovery: the draft lives in memory, so a reload lands here with
     nothing. Rather than submit an incomplete request later, go back to the
     first unanswered step. */
  useEffect(() => {
    if (!draft) begin(signupRole)
  }, [draft, begin, signupRole])

  /*
   * Any edit invalidates whatever is in flight and clears whatever is on
   * screen. A message about the previous address is worse than none: it is
   * wrong about the text the person is now looking at.
   */
  function change(next: string) {
    setValue(next)
    setError(null)
    setTakenEmail(null)
    request.current += 1
    busy.current = false
    setChecking(false)
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    /* The second click of a double-click, read from a ref so it is the value
       at this instant rather than at the last render. */
    if (busy.current) return

    setTouched(true)
    const cleaned = value.trim().toLowerCase()
    if (!cleaned) return setError(c.errors.emailRequired)
    if (!EMAIL_SHAPE.test(cleaned)) return setError(c.errors.emailInvalid)

    busy.current = true
    setTouched(true)
    setError(null)
    setTakenEmail(null)
    setChecking(true)

    const seq = (request.current += 1)
    const current = () => seq === request.current

    try {
      const { available } = await auth.emailAvailable(cleaned)
      if (!current()) return

      if (!available) {
        busy.current = false
        setChecking(false)
        setTakenEmail(cleaned)
        return
      }

      /* Leaving `checking` true through the navigation: the button stays
         disabled until this screen unmounts, so the last frame before the
         route changes cannot be clicked again. */
      setEmail(cleaned)
      navigate(`/signup/${signupRole}/password`)
    } catch (cause) {
      if (!current()) return
      busy.current = false
      setChecking(false)
      setError(toMessage(cause))
    }
  }

  return (
    <AuthCard title={c.signup.method.title} lead={providers.google ? c.signup.method.lead : c.common.emailLabel}>
      {providers.google && <><div className="flex flex-col gap-2">
        <a
          /*
             One hint each, and only the one the person actually answered: a
             teacher chose a workplace on the step before this, a student chose
             a study level. Both ride in the handshake cookie rather than in
             the redirect to Google — see federatedSignInUrl.
          */
          href={federatedSignInUrl('google', {
            role: signupRole,
            workplaceId: signupRole === 'teacher' ? draft?.workplaceId : null,
            learningProfile: signupRole === 'student' ? draft?.learningProfile : null,
          })}
          className="auth-provider"
        >
          <GoogleIcon className="size-5 shrink-0" />
          {c.common.google}
        </a>

        {/*
          Apple is rendered but INERT until configured. A disabled control that
          says why is honest; a clickable button that leads to a failed or
          simulated sign-in is not. It is hidden entirely in production builds —
          see APPLE_AUTH_ENABLED — so nobody is offered a provider that cannot
          work.
        */}
        {APPLE_AUTH_ENABLED ? (
          <button type="button" disabled aria-disabled="true" className="auth-provider is-unavailable">
            <AppleIcon className="size-5 shrink-0" />
            {c.common.apple}
            <span className="ms-auto text-xs font-semibold" style={{ color: 'var(--ink-muted)' }}>
              {c.common.comingSoon}
            </span>
          </button>
        ) : null}
      </div>

      <AuthDivider /></>}

      <form onSubmit={submit} noValidate>
        <Field
          label={c.common.emailLabel}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder={c.common.emailPlaceholder}
          ltr
          value={value}
          /*
           * One slot, and the duplicate answer wins it. Both are failures of
           * the same field, they cannot both be true of the same value, and
           * stacking two red lines under one input reads as two problems.
           */
          error={
            takenEmail ? (
              <EmailTakenMessage email={takenEmail} />
            ) : touched ? (
              (error ?? undefined)
            ) : undefined
          }
          onChange={(event) => change(event.target.value)}
          onBlur={() => {
            setTouched(true)
            const cleaned = value.trim().toLowerCase()
            setError(!cleaned ? c.errors.emailRequired : EMAIL_SHAPE.test(cleaned) ? null : c.errors.emailInvalid)
          }}
        />
        <div className="mt-5">
          <SubmitButton
            label={c.signup.method.submit}
            submitting={checking}
            busyLabel={c.common.checking}
          />
        </div>
      </form>

      <p className="mt-6 text-center text-sm" style={{ color: 'var(--ink-muted)' }}>
        {c.chooseRole.haveAccount}{' '}
        <Link to="/login" className="auth-link">
          {c.login.title}
        </Link>
      </p>
    </AuthCard>
  )
}
