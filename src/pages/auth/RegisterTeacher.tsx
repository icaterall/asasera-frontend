import { useState } from 'react'
import { Link } from 'react-router-dom'

import { AuthCard, AuthNotice, FormError } from '@/components/form/AuthCard'
import { AuthDivider } from '@/components/form/AuthDivider'
import { Field } from '@/components/form/Field'
import { GoogleButton } from '@/components/form/GoogleButton'
import { PasswordField } from '@/components/form/PasswordField'
import { ComboSelect } from '@/components/form/ComboSelect'
import { SubmitButton } from '@/components/form/SubmitButton'
import { useAuthCopy } from '@/copy/useAuthCopy'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import { useAuthForm } from '@/hooks/useAuthForm'
import { useAuthValidators, normalizeEmail } from '@/hooks/useAuthValidators'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useReferenceList } from '@/hooks/useReferenceList'
import { auth, reference } from '@/lib/api'

/*
 * Hoisted so their identity is stable across renders — `useReferenceList`
 * depends on the function, and an inline arrow would refetch on every render.
 */
const loadSalutations = (signal?: AbortSignal) => reference.salutations(signal)
const loadCategories = (signal?: AbortSignal) => reference.categories(signal)

/**
 * Teacher registration.
 *
 * THE ROLE IS THE ROUTE. This screen posts to /auth/register/teacher, and that
 * is the only thing that makes the account a teacher — there is no role
 * selector on the page and no `role` key in the body. A selector would be a
 * field the client controls that decides a privilege, which is the shape of
 * every privilege-escalation bug; the server takes the same view and does not
 * declare `role` in its schema at all, so one arriving from anywhere is
 * dropped before a handler runs.
 */
export default function RegisterTeacher() {
  const { c } = useAuthCopy()
  useDocumentTitle(c.registerTeacher.title)

  const validators = useAuthValidators()
  const toMessage = useApiErrorMessage()
  const [sent, setSent] = useState(false)

  const salutations = useReferenceList(loadSalutations)
  const categories = useReferenceList(loadCategories)

  const form = useAuthForm({
    initial: { name: '', email: '', password: '', salutation_id: '', category_id: '' },
    validators: {
      name: validators.name,
      email: validators.email,
      password: validators.newPassword,
      category_id: validators.subject,
    },
    normalizers: { email: normalizeEmail },
    onError: toMessage,
    onSubmit: async (values) => {
      await auth.registerTeacher({
        name: values.name.trim(),
        email: values.email,
        password: values.password,
        // A <select> value is a string, as every DOM value is. The server
        // coerces, but sending a number keeps the contract honest.
        /*
         * Omitted when blank rather than sent as 0: `Number('')` is 0, and 0
         * fails the server's `.positive()` check — a validation error on a
         * field nobody was required to fill.
         */
        ...(values.salutation_id ? { salutation_id: Number(values.salutation_id) } : {}),
        category_id: Number(values.category_id),
      })
      setSent(true)
    },
  })

  const switcher = (
    <>
      {c.registerTeacher.switch}{' '}
      <Link to="/register/student" className="auth-link">
        {c.registerTeacher.switchLink}
      </Link>
    </>
  )

  if (sent) {
    return (
      <AuthCard title={c.registered.title} footer={switcher}>
        {/*
          The confirmation does not repeat the address back. The server answers
          a registration identically whether or not the address was already
          taken, and echoing it here would undo that: it would confirm to
          whoever typed it that this is the address the mail went to.
        */}
        <AuthNotice title={c.registerTeacher.title} body={c.registered.body}>
          <Link to="/login" className="auth-button auth-button--provider">
            {c.login.submit}
          </Link>
        </AuthNotice>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title={c.registerTeacher.title}
      lead={c.registerTeacher.lead}
      footer={switcher}
      width="wide"
    >
      {/*
        A real <form>, so Enter submits from any field with no key handler.

        Five fields and no wizard. The threshold for splitting a form is
        around seven, and below it a wizard costs more than it saves: it hides
        how long the form is, which is what people abandon over; it breaks
        password managers, which fill one document and cannot carry a value
        across a step; and it charges two extra clicks for the privilege. The
        whole form is one document here, so one autofill completes it.

        DOM order is the visual order — name, email, title, subject, password
        — so tabbing and a screen reader walk the fields in the sequence the
        grid shows them in.
      */}
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
          // Forced LTR inside the RTL page: an address is a Latin run, and in
          // an RTL field its punctuation drifts in ways that make a correct
          // value look wrong. Lowercased and trimmed on blur.
          ltr
          disabled={form.submitting}
          {...form.field('email')}
        />

        {/*
          Salutation replaces the stage select.
        
          Optional — plenty of teachers use no title, and a required one would
          force a wrong answer. Options come from /api/v1/salutations for the
          same reason subject does: a closed list a non-engineer can correct
          without a deploy. It sits before subject because a title belongs to
          the person, like the name above it, while subject describes what they
          teach — so the form reads identity first, then role.
        */}
        <ComboSelect
          label={c.registerTeacher.salutationLabel}
          placeholder={c.registerTeacher.salutationPlaceholder}
          name="salutation_id"
          disabled={form.submitting}
          options={salutations.options}
          loading={salutations.loading}
          failed={salutations.failed}
          onRetry={salutations.reload}
          value={form.values.salutation_id}
          error={form.errors.salutation_id}
          onChange={(next) => form.setValue('salutation_id', next)}
          onBlur={form.field('salutation_id').onBlur}
        />

        <ComboSelect
          label={c.registerTeacher.categoryLabel}
          placeholder={c.registerTeacher.categoryPlaceholder}
          name="category_id"
          disabled={form.submitting}
          options={categories.options}
          loading={categories.loading}
          failed={categories.failed}
          onRetry={categories.reload}
          value={form.values.category_id}
          error={form.errors.category_id}
          onChange={(next) => form.setValue('category_id', next)}
          onBlur={form.field('category_id').onBlur}
        />

        {/* Full width at every breakpoint — see `.auth-grid-wide`. */}
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
          <SubmitButton label={c.registerTeacher.submit} submitting={form.submitting} />
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
