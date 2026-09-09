import {DeleteAccount} from '@/features/delivery/DeleteAccount'
import { LoadingIndicator } from '@/design/LoadingIndicator'
import { useEffect, useRef } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { loginStateFor } from '@/lib/afterAuth'

import { AuthCard, FormError } from '@/components/form/AuthCard'
import { SelectField } from '@/components/form/SelectField'
import { SubmitButton } from '@/components/form/SubmitButton'
import { useAuthCopy } from '@/copy/useAuthCopy'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import { useAuth } from '@/hooks/useAuth'
import { useAuthForm } from '@/hooks/useAuthForm'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useReferenceList } from '@/hooks/useReferenceList'
import { auth, reference } from '@/lib/api'

const loadWorkplaceTypes = (signal?: AbortSignal) => reference.workplaceTypes(signal)
const loadCategories = (signal?: AbortSignal) => reference.categories(signal)

/**
 * The two-field screen a Google sign-in lands on when the account has no
 * education stage yet.
 *
 * Google creates a user with `education_stage_id` NULL, because a redirect
 * carries no proof of what anyone teaches and a default would silently place
 * them in a stage they never chose. This is where that gets answered, and it
 * is the ONLY mutation a signed-in user can make through /auth/me — the
 * endpoint accepts exactly `category_id` and `education_stage_id`, and its
 * schema strips every other key, so there is no field here that could reach
 * `role`, `email` or `status`.
 *
 * The stage list is the same endpoint the signup step uses — unfiltered, so
 * school stages are offered alongside higher-education ones — and the same
 * server-side check runs on write: a stage id that does not exist is a 422
 * whether it arrives from this form or from curl. Existence is all it checks;
 * nothing here reads an age band, and no age or consent is inferred from the
 * answer.
 *
 * BOTH FIELDS ARE OPTIONAL. The signup chain promises exactly that — the
 * check-your-email screen ends on "all of it optional" — and the endpoint has
 * always honoured it, treating an empty patch as a no-op. Only this form
 * disagreed, marking both required and so making the last screen of a signup
 * a wall. Submitting sends whichever fields were filled, and sends nothing at
 * all when neither was.
 */
export default function CompleteProfile() {
  const { c } = useAuthCopy()
  useDocumentTitle(c.completeProfile.title)

  const navigate = useNavigate()
  const location = useLocation()
  const { status, user, applyUser } = useAuth()
  const toMessage = useApiErrorMessage()

  const categories = useReferenceList(loadCategories)
  /* So that "you can change this later" on the workplace step is true. */
  const workplaces = useReferenceList(loadWorkplaceTypes)

  /*
   * Guarded on `status`, not on `user === null`: while the boot refresh is
   * still in flight the user IS null and yet the session may be perfectly
   * good. Redirecting on the null would bounce a signed-in person to /login
   * for a frame on every reload of this route.
   */
  useEffect(() => {
    if (status === 'anonymous') navigate('/login', { replace: true, state: loginStateFor(location) })
  }, [status, navigate, location])

  const form = useAuthForm({
    initial: { category_id: '', education_stage_id: '', workplace_type_id: '' },
    /* Empty, not absent: `validators` is required by the hook, and on this
       screen a blank field is a valid answer, so every entry would be a
       function that returns null. */
    validators: {},
    onError: toMessage,
    onSubmit: async (values) => {
      /*
       * Only what was actually filled. `Number('')` is 0, and 0 is not a
       * positive integer, so sending the empty fields anyway would turn
       * "I would rather not say" into a 422 on a field the person left alone
       * on purpose.
       */
      const patch: {
        category_id?: number
        education_stage_id?: number
        workplace_type_id?: number
      } = {}
      if (values.category_id) patch.category_id = Number(values.category_id)
      if (values.education_stage_id) patch.education_stage_id = Number(values.education_stage_id)
      if (values.workplace_type_id) patch.workplace_type_id = Number(values.workplace_type_id)

      /* Nothing chosen: no request to make. */
      if (Object.keys(patch).length > 0) {
        const { user: updated } = await auth.updateProfile(patch)
        applyUser(updated)
      }
      navigate('/', { replace: true })
    },
  })

  /*
   * Prefill from the profile the account already has.
   *
   * A teacher who chose a subject at registration arrived here with that
   * subject saved and the field blank, and was asked to pick it again — and
   * because both fields are required to submit, an empty Subject blocked the
   * Stage they actually came to set.
   *
   * It cannot go in `initial`: hooks run before the `status`/`user` guard
   * below, so on the first render `user` is still null and useAuthForm has
   * already captured the empty object. Hence a one-shot effect.
   *
   * `seeded` makes it one-shot, and the `!form.values.x` check means it only
   * ever fills a field nobody has touched — a prefill must never overwrite
   * something the person typed while the session was still resolving.
   */
  const seeded = useRef(false)
  useEffect(() => {
    if (seeded.current || !user) return
    seeded.current = true
    if (user.categoryId !== null && !form.values.category_id) {
      form.setValue('category_id', String(user.categoryId))
    }
    if (user.educationStageId !== null && !form.values.education_stage_id) {
      form.setValue('education_stage_id', String(user.educationStageId))
    }
    if (user.workplaceTypeId !== null && !form.values.workplace_type_id) {
      form.setValue('workplace_type_id', String(user.workplaceTypeId))
    }
  }, [user, form])

  if (status === 'loading' || !user) {
    return (
      <AuthCard title={c.completeProfile.title}>
        <LoadingIndicator label={c.common.loading} />
      </AuthCard>
    )
  }

  if (user.role === 'student') return <Navigate to="/student/profile" replace />

  return (
    <AuthCard title={c.completeProfile.title} lead={c.completeProfile.lead} width="wide">
      {/* Subject and stage are one question asked twice, so they share a row. */}
      <form onSubmit={form.handleSubmit} noValidate className="auth-grid">
        <FormError>{form.formError}</FormError>

        <SelectField
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
          onValueChange={value=>form.setValue('category_id',value)}
          onBlur={form.field('category_id').onBlur}
        />

        {/*
          Teachers only. A student is never asked where they work, and a
          disabled or empty field would be a question they have to read before
          discovering it is not for them.
        */}
        {user.role === 'teacher' ? (
          <SelectField
            label={c.completeProfile.workplaceLabel}
            placeholder={c.completeProfile.workplacePlaceholder}
            name="workplace_type_id"
            disabled={form.submitting}
            options={workplaces.options}
            loading={workplaces.loading}
            failed={workplaces.failed}
            onRetry={workplaces.reload}
            value={form.values.workplace_type_id}
            error={form.errors.workplace_type_id}
            onValueChange={value=>form.setValue('workplace_type_id',value)}
            onBlur={form.field('workplace_type_id').onBlur}
          />
        ) : null}

        <div className="auth-grid-wide">
          <SubmitButton label={c.completeProfile.submit} submitting={form.submitting} />

          {/*
            Leaving is a real destination, so it is a real control rather than
            a hint that both fields "can" be left blank. Quiet, not hidden: a
            way out that has to be discovered is not a way out.
          */}
          <button
            type="button"
            disabled={form.submitting}
            onClick={() => navigate('/', { replace: true })}
            className="mt-3 w-full rounded-sm px-3 py-2.5 text-sm font-semibold underline underline-offset-2 disabled:opacity-50"
            style={{ color: 'var(--ink-muted)' }}
          >
            {c.completeProfile.skip}
          </button>
        </div>
      </form>
      <DeleteAccount/>
    </AuthCard>
  )
}
