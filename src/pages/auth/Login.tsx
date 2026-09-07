import { useEffect } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { AuthCard, FormError } from '@/components/form/AuthCard'
import { AuthDivider } from '@/components/form/AuthDivider'
import { Field } from '@/components/form/Field'
import { GoogleButton } from '@/components/form/GoogleButton'
import { PasswordField } from '@/components/form/PasswordField'
import { SubmitButton } from '@/components/form/SubmitButton'
import { useAuthOptions } from '@/hooks/useAuthOptions'
import { useAuthCopy } from '@/copy/useAuthCopy'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import { useAuth } from '@/hooks/useAuth'
import { useAuthForm } from '@/hooks/useAuthForm'
import { useAuthValidators, normalizeEmail } from '@/hooks/useAuthValidators'
import { homePathFor, safeReturnPath } from '@/lib/afterAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

/**
 * Sign in.
 *
 * The password form is the main path and comes first; Google is an
 * alternative below the divider. There is no Facebook button — it is behind
 * `VITE_ENABLE_FACEBOOK_AUTH`, which ships false, and the flag drops the
 * subtree from the bundle rather than hiding it in the DOM.
 */
export default function Login() {
  const { c } = useAuthCopy()
  const providers = useAuthOptions()
  useDocumentTitle(c.login.title)

  const [params] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()

  /*
   * Prefilled when signup sent someone here because the address is already
   * registered. It arrives in ROUTER STATE, not the query string: an address
   * in a URL ends up in history, in access logs, and in the `Referer` of
   * anything this page loads. Read defensively — a pasted link or a reload
   * carries no state, and that has to mean an empty field, not a crash.
   */
  const handedOver = (location.state as { email?: unknown } | null)?.email
  const prefilledEmail = typeof handedOver === 'string' ? handedOver : ''

  /*
   * Where a protected route sent them, if one did. Validated rather than
   * trusted — see safeReturnPath. Null means "no authorized destination", and
   * the role's own home takes over.
   */
  const returnTo = safeReturnPath((location.state as { from?: unknown } | null)?.from)
  const { signIn, status, user } = useAuth()
  const validators = useAuthValidators()
  const toMessage = useApiErrorMessage()

  /*
   * The federated callback sends people here with a reason from a FIXED set,
   * and it is looked up rather than displayed. A crafted `?error=<text>` in
   * the address bar therefore cannot put arbitrary words on our own origin —
   * the worst it can do is miss the table and fall through to the generic
   * line.
   */
  const reasons: Record<string, string> = {
    cancelled: c.callback.cancelled,
    account_exists: c.callback.accountExists,
    bad_state: c.callback.badState,
    expired: c.callback.expired,
    unavailable: c.callback.unavailable,
    failed: c.callback.failed,
  }
  const reason = params.get('error')
  const providerMessage = reason ? (reasons[reason] ?? c.callback.failed) : null

  /*
   * Already signed in — the boot refresh found a live session. Sending them
   * onward rather than showing a sign-in form they do not need, and to the
   * profile step first if the account still owes us those two fields.
   */
  useEffect(() => {
    if (status !== 'authenticated' || !user) return
    navigate(returnTo ?? homePathFor(user), { replace: true })
  }, [status, user, returnTo, navigate])

  const form = useAuthForm({
    initial: { email: prefilledEmail, password: '' },
    validators: { email: validators.email, password: validators.currentPassword },
    normalizers: { email: normalizeEmail },
    onError: toMessage,
    onSubmit: async (values) => {
      /* The user this sign-in just returned, not the one in context — context
         has not been updated yet at this point in the callback. */
      const signedIn = await signIn(values.email, values.password)
      navigate(returnTo ?? homePathFor(signedIn), { replace: true })
    },
  })

  return (
    <AuthCard
      title={c.login.title}
      lead={c.login.lead}

      footer={
        <>
          {c.login.noAccount}{' '}
          <Link to="/signup/student" className="auth-link">
            {c.login.registerStudent}
          </Link>
          {' · '}
          <Link to="/signup/teacher" className="auth-link">
            {c.login.registerTeacher}
          </Link>
        </>
      }
    >
      <form onSubmit={form.handleSubmit} noValidate className="flex flex-col gap-5">
        {/* The provider's reason and a failed password attempt are the same
            kind of message, so they share one slot rather than stacking. */}
        <FormError>{form.formError ?? providerMessage}</FormError>

        <Field
          label={c.common.emailLabel}
          placeholder={c.common.emailPlaceholder}
          type="email"
          autoComplete="username"
          inputMode="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          ltr
          disabled={form.submitting}
          {...form.field('email')}
        />

        <PasswordField
          label={c.common.passwordLabel}
          autoComplete="current-password"
          disabled={form.submitting}
          // A returning user is not choosing a password; counting the
          // characters of one they already have is noise.
          value={form.values.password}
          error={form.errors.password}
          onChange={form.field('password').onChange}
          onBlur={form.field('password').onBlur}
        />

        <div className="-mt-2">
          <Link to="/forgot" className="auth-link text-sm">
            {c.login.forgot}
          </Link>
        </div>

        <SubmitButton label={c.login.submit} submitting={form.submitting} />
      </form>

      {providers.google && <><AuthDivider /><GoogleButton /></>}
    </AuthCard>
  )
}
