import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { AuthCard, FormError } from '@/components/form/AuthCard'
import { EmailTakenMessage } from '@/components/form/EmailTakenMessage'
import { PasswordField, PASSWORD_MIN } from '@/components/form/PasswordField'
import { SubmitButton } from '@/components/form/SubmitButton'
import { useAuthCopy } from '@/copy/useAuthCopy'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useAuth } from '@/hooks/useAuth'
import { useSignup } from '@/hooks/useSignup'
import { useLoginRedirect } from '@/hooks/useLoginRedirect'
import { ApiError, auth } from '@/lib/api'

/**
 * Step four: set a password, and create the account.
 *
 * The password lives in this component's local state and nowhere else. It is
 * never written to the signup draft, so it cannot reach any other screen; and
 * a refresh loses it, which is the correct outcome — the field starts empty
 * and the person retypes it rather than the browser restoring a credential.
 *
 * DOUBLE SUBMIT. `submitting` disables the control for the whole round trip,
 * and the guard at the top of `submit` rejects a second call that slipped
 * through — a double-click on a slow connection must not create two accounts.
 * The unique index on the address is what actually guarantees that; this only
 * saves the second request.
 *
 * THE RACE. The address was checked one screen ago, and an answer from a
 * minute ago is not a promise. Someone else can register it in between — or
 * the same person can, in another tab — and the server answers `email_taken`.
 * That is not a generic failure and is not shown as one: it gets the same
 * sentence and the same working sign-in link the address step uses, because
 * it is the same fact arriving later.
 */
export default function PasswordStep() {
  const { c } = useAuthCopy()
  const navigate = useNavigate()
  const redirectAfterLogin = useLoginRedirect()
  const { role } = useParams<{ role: string }>()
  const { draft } = useSignup()
  const { signIn } = useAuth()
  const toMessage = useApiErrorMessage()

  const signupRole = role === 'student' ? 'student' : 'teacher'
  useDocumentTitle(c.signup.password.title)

  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [banner, setBanner] = useState<string | null>(null)
  /* Set only when the server refuses the address as already registered. Kept
     apart from `banner` because it is a sentence with a link in it, and
     because it is the one failure with a next step attached. */
  const [taken, setTaken] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  /*
   * Refresh recovery. Without an email in the draft there is nothing to
   * create an account with, so send the person back to collect it rather than
   * render a password field that cannot submit.
   */
  useEffect(() => {
    if (!draft?.email) navigate(`/signup/${signupRole}/method`, { replace: true })
  }, [draft, navigate, signupRole])

  if (!draft?.email) return null

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (submitting) return
    if (password.length < PASSWORD_MIN) return setError(c.errors.passwordShort)

    setError(null)
    setBanner(null)
    setTaken(false)
    setSubmitting(true)
    try {
      const payload = { email: draft!.email, password }
      if (signupRole === 'teacher') {
        /*
         * The workplace goes with the account, not after it.
         *
         * It could have waited for the profile screen the way the student's
         * stage does. It does not, because the draft lives in memory and this
         * answer was given two screens ago — asking for it again because
         * somebody reloaded the password page would throw away a choice they
         * already made. The id is validated server-side before it is stored.
         */
        await auth.registerTeacher({
          ...payload,
          ...(draft!.workplaceId !== null ? { workplace_type_id: draft!.workplaceId } : {}),
        })
      } else {
        await auth.registerStudent({ ...payload, learning_profile: draft!.learningProfile })
      }

      /*
       * STRAIGHT INTO THE APPLICATION, not to a check-your-email wall.
       *
       * Registration deliberately answers identically whether or not the
       * address was already taken — that is what keeps signup from telling a
       * stranger which addresses exist — so it cannot hand back a session
       * without becoming exactly the oracle it was built to avoid. Signing in
       * afterwards with the credentials this screen already holds gets the
       * same result and reveals nothing new: an attacker could have attempted
       * that login anyway.
       *
       * A teacher therefore enters unverified, and the sticky banner carries
       * the reminder. `/signup/:role/check-email` still exists and is still
       * reachable — it is guidance now, not a gate.
       */
      try {
        /*
         * Straight into the workspace, and NOT via the profile screen.
         *
         * This used to divert any teacher with no subject and no workplace to
         * /complete-profile, which meant a person who had just finished
         * signing up was handed another form before seeing the product. Those
         * fields are optional; the dashboard asks for the subject as one of
         * its next steps, which is where an optional question belongs.
         *
         * An unverified account stays unverified — the sticky banner in the
         * workspace carries that, and entering before verifying is the
         * approved behaviour.
         */
        const user = await signIn(draft!.email, password)
        redirectAfterLogin(user)
      } catch {
        /*
         * The account exists — the register call succeeded — but signing in
         * did not. Rather than strand someone on a screen whose form has
         * already been used, send them to the guidance page, which tells them
         * what is in their inbox and offers the way back to sign in.
         */
        navigate(`/signup/${signupRole}/check-email`, { replace: true })
      }
    } catch (cause) {
      /*
       * Lost the race, or came back to a stale tab. Either way the account
       * belongs to someone already, nothing here was created, and nothing on
       * that account was touched or signed into — the server refused before
       * writing. The only useful thing left is the way to sign in.
       */
      if (cause instanceof ApiError && cause.code === 'email_taken') setTaken(true)
      else setBanner(toMessage(cause))
      setSubmitting(false)
    }
  }

  return (
    <AuthCard title={c.signup.password.title} lead={c.signup.password.lead}>
      {/* The address being used, with a way to correct it without losing the flow. */}
      <div className="mb-5 flex items-center justify-between gap-3 rounded-sm border px-3 py-2.5" style={{ borderColor: 'var(--line)' }}>
        <span className="truncate text-sm" dir="ltr" style={{ color: 'var(--ink)' }}>
          {draft.email}
        </span>
        <button
          type="button"
          onClick={() => navigate(`/signup/${signupRole}/method`)}
          className="shrink-0 rounded-sm px-2 py-1 text-sm font-semibold underline underline-offset-2"
          style={{ color: 'var(--brand-blue)' }}
        >
          {c.signup.password.edit}
        </button>
      </div>

      {banner ? <FormError>{banner}</FormError> : null}
      {taken ? (
        <FormError>
          <EmailTakenMessage email={draft.email} />
        </FormError>
      ) : null}

      <form onSubmit={submit} noValidate>
        <PasswordField
          label={c.common.passwordLabel}
          autoComplete="new-password"
          value={password}
          error={error ?? undefined}
          disabled={submitting}
          onChange={(event) => {setPassword(event.target.value);setError(null)}}
          onBlur={() => setError(password && password.length < PASSWORD_MIN ? c.errors.passwordShort : null)}
        />
        <p className="mt-2 text-xs leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
          {c.signup.password.hint}
        </p>
        <div className="mt-5">
          <SubmitButton label={c.signup.password.submit} submitting={submitting} />
        </div>
      </form>
    </AuthCard>
  )
}
