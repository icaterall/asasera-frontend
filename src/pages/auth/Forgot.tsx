import { useAuth } from '@/hooks/useAuth'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { AuthCard, AuthNotice, FormError } from '@/components/form/AuthCard'
import { AuthDivider } from '@/components/form/AuthDivider'
import { Field } from '@/components/form/Field'
import { GoogleButton } from '@/components/form/GoogleButton'
import { SubmitButton } from '@/components/form/SubmitButton'
import { useAuthOptions } from '@/hooks/useAuthOptions'
import { useAuthCopy } from '@/copy/useAuthCopy'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import { useAuthForm } from '@/hooks/useAuthForm'
import { useAuthValidators, normalizeEmail } from '@/hooks/useAuthValidators'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { auth } from '@/lib/api'

/**
 * Request a password reset link.
 *
 * The confirmation is deliberately unconditional: it says "if that address has
 * an account", not "we sent it". A message that differed between a known and
 * an unknown address would turn this form into an account-enumeration oracle —
 * type a list of addresses, read which ones exist. The server answers the same
 * way for the same reason, so the client is not softening a truth the API
 * would otherwise reveal; both are silent by design.
 */
export default function Forgot() {
  const { c } = useAuthCopy()
  const providers = useAuthOptions()
  useDocumentTitle(c.forgot.title)

  const validators = useAuthValidators()
  const toMessage = useApiErrorMessage()
  const { user } = useAuth()
  const seeded = useRef(false)
  const [sent, setSent] = useState(false)

  const form = useAuthForm({
    initial: { email: user?.email ?? '' },
    validators: { email: validators.email },
    normalizers: { email: normalizeEmail },
    onError: toMessage,
    onSubmit: async (values) => {
      await auth.forgot(values.email)
      setSent(true)
    },
  })

  useEffect(() => {
    if (!seeded.current && user?.email) {
      seeded.current = true
      if (!form.values.email) form.setValue('email', user.email)
    }
  }, [user, form])

  const backToSignIn = (
    <Link to="/login" className="auth-link">
      {c.common.backToSignIn}
    </Link>
  )

  if (sent) {
    return (
      <AuthCard title={c.forgot.title} footer={backToSignIn}>
        <AuthNotice title={c.forgot.title} body={c.forgot.sent}>
          <Link to="/login" className="auth-button auth-button--provider">
            {c.common.backToSignIn}
          </Link>
        </AuthNotice>
      </AuthCard>
    )
  }

  return (
    <AuthCard title={c.forgot.title} lead={c.forgot.lead} footer={backToSignIn}>
      <form onSubmit={form.handleSubmit} noValidate className="flex flex-col gap-5">
        <FormError>{form.formError}</FormError>

        <Field
          label={c.common.emailLabel}
          placeholder={c.common.emailPlaceholder}
          type="email"
          autoComplete="email"
          inputMode="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          ltr
          disabled={form.submitting}
          {...form.field('email')}
        />

        <SubmitButton label={c.forgot.submit} submitting={form.submitting} />
      </form>

      {providers.google && <><AuthDivider /><GoogleButton /></>}
    </AuthCard>
  )
}
