import { useAuth } from '@/hooks/useAuth'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { AuthCard, AuthNotice, FormError } from '@/components/form/AuthCard'
import { AuthDivider } from '@/components/form/AuthDivider'
import { GoogleButton } from '@/components/form/GoogleButton'
import { PasswordField } from '@/components/form/PasswordField'
import { SubmitButton } from '@/components/form/SubmitButton'
import { useAuthOptions } from '@/hooks/useAuthOptions'
import { useAuthCopy } from '@/copy/useAuthCopy'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import { useAuthForm } from '@/hooks/useAuthForm'
import { useAuthValidators } from '@/hooks/useAuthValidators'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { auth } from '@/lib/api'

/**
 * Set a new password from an emailed link: /reset?token=...
 *
 * The token stays in the URL and is never written anywhere. It is single-use
 * and short-lived server-side, so the exposure it does carry — history, the
 * Referer of the next request — is bounded by the server invalidating it the
 * moment it is spent, which is the property that makes an emailed link
 * workable at all.
 *
 * A missing token is answered here rather than by posting an empty one: the
 * server would reject it, but a round trip to learn that a link is truncated
 * tells the person nothing they could not be told immediately.
 */
export default function Reset() {
  const { c } = useAuthCopy()
  const providers = useAuthOptions()
  const { forgetSession } = useAuth()
  useDocumentTitle(c.reset.title)

  const [params] = useSearchParams()
  const token = params.get('token')
  const validators = useAuthValidators()
  const toMessage = useApiErrorMessage()
  const [done, setDone] = useState(false)

  const form = useAuthForm({
    initial: { password: '' },
    validators: { password: validators.newPassword },
    onError: toMessage,
    onSubmit: async (values) => {
        await auth.reset(token ?? '', values.password)
        forgetSession()
        setDone(true)
    },
  })

  /*
   * Each state names itself.
   *
   * The card used to head all three with "Choose a new password", so someone
   * whose link had expired — and someone who had just succeeded — both read
   * an instruction to do the thing that had not happened.
   */
  if (!token) {
    return (
      <AuthCard title={c.reset.badTokenTitle}>
        <AuthNotice title={c.reset.badTokenTitle} body={c.reset.badToken}>
          <Link to="/forgot" className="auth-button auth-button--provider">
            {c.reset.requestAnother}
          </Link>
        </AuthNotice>
      </AuthCard>
    )
  }

  if (done) {
    return (
      <AuthCard title={c.reset.doneTitle}>
        <div role="status"><p className="mb-6">{c.reset.done}</p>
          <Link to="/login" className="auth-button auth-button--primary">
            {c.login.submit}
          </Link>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title={c.reset.title}
      lead={c.reset.lead}

      footer={
        <Link to="/login" className="auth-link">
          {c.common.backToSignIn}
        </Link>
      }
    >
      <form onSubmit={form.handleSubmit} noValidate className="flex flex-col gap-5">
        <FormError>{form.formError}</FormError>

        <PasswordField
          label={c.common.passwordLabel}
          autoComplete="new-password"
          disabled={form.submitting}
          value={form.values.password}
          error={form.errors.password}
          onChange={form.field('password').onChange}
          onBlur={form.field('password').onBlur}
        />

        <SubmitButton label={c.reset.submit} submitting={form.submitting} />
      </form>

      {providers.google && <><AuthDivider /><GoogleButton /></>}
    </AuthCard>
  )
}
