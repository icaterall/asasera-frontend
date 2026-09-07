import { useState } from 'react'
import { Link } from 'react-router-dom'

import { AuthCard, AuthNotice, FormError } from '@/components/form/AuthCard'
import { AuthDivider } from '@/components/form/AuthDivider'
import { Field } from '@/components/form/Field'
import { GoogleButton } from '@/components/form/GoogleButton'
import { PasswordField } from '@/components/form/PasswordField'
import { SubmitButton } from '@/components/form/SubmitButton'
import { useAuthCopy } from '@/copy/useAuthCopy'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import { useAuthForm } from '@/hooks/useAuthForm'
import { useAuthValidators, normalizeEmail } from '@/hooks/useAuthValidators'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { auth } from '@/lib/api'

/**
 * Student registration. Three fields, and the role comes from the route.
 *
 * No subject and no stage: a student is not registering to teach anything, so
 * the two reference lists are not fetched here at all. The server agrees — the
 * student schema declares name, email and password and nothing else, and it
 * writes `education_stage_id` NULL by design rather than by omission.
 */
export default function RegisterStudent() {
  const { c } = useAuthCopy()
  useDocumentTitle(c.registerStudent.title)

  const validators = useAuthValidators()
  const toMessage = useApiErrorMessage()
  const [sent, setSent] = useState(false)

  const form = useAuthForm({
    initial: { name: '', email: '', password: '' },
    validators: {
      name: validators.name,
      email: validators.email,
      password: validators.newPassword,
    },
    normalizers: { email: normalizeEmail },
    onError: toMessage,
    onSubmit: async (values) => {
      await auth.registerStudent({
        name: values.name.trim(),
        email: values.email,
        password: values.password,
      })
      setSent(true)
    },
  })

  const switcher = (
    <>
      {c.registerStudent.switch}{' '}
      <Link to="/register/teacher" className="auth-link">
        {c.registerStudent.switchLink}
      </Link>
    </>
  )

  if (sent) {
    return (
      <AuthCard title={c.registered.title} footer={switcher}>
        <AuthNotice title={c.registerStudent.title} body={c.registered.body}>
          <Link to="/login" className="auth-button auth-button--provider">
            {c.login.submit}
          </Link>
        </AuthNotice>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title={c.registerStudent.title}
      lead={c.registerStudent.lead}
      footer={switcher}
      width="wide"
    >
      {/* Name beside email, then the password on its own row. Three fields in
          one document, so a password manager fills all of them in one go. */}
      <form onSubmit={form.handleSubmit} noValidate className="auth-grid">
        <FormError>{form.formError}</FormError>

        <Field
          label={c.common.nameLabel}
          placeholder={c.common.namePlaceholder}
          type="text"
          autoComplete="name"
          inputMode="text"
          disabled={form.submitting}
          {...form.field('name')}
        />

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

        <div className="auth-grid-wide">
          <PasswordField
            label={c.common.passwordLabel}
            autoComplete="new-password"
            disabled={form.submitting}
            value={form.values.password}
            error={form.errors.password}
            onChange={form.field('password').onChange}
            onBlur={form.field('password').onBlur}
          />
        </div>

        <div className="auth-grid-wide">
          <SubmitButton label={c.registerStudent.submit} submitting={form.submitting} />
        </div>
      </form>

      <AuthDivider />
      <GoogleButton />

      <p className="text-center text-sm">
        <Link to="/login" className="auth-link">
          {c.common.backToSignIn}
        </Link>
      </p>
    </AuthCard>
  )
}
