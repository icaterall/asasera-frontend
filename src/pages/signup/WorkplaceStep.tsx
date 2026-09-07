import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { AuthCard, FormError } from '@/components/form/AuthCard'
import { useAuthCopy } from '@/copy/useAuthCopy'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useReferenceList } from '@/hooks/useReferenceList'
import { useSignup } from '@/hooks/useSignup'
import { reference } from '@/lib/api'
import { workplaceArt } from '@/lib/workplaceArt'
import { IconCheck } from '@/pages/Landing/ui/Icons'

/* Hoisted so its identity is stable across renders — useReferenceList keys its
   effect on the function, and an inline arrow would refetch every render. */
const loadWorkplaceTypes = (signal?: AbortSignal) => reference.workplaceTypes(signal)

/**
 * The teacher's first question: what kind of place do you work in?
 *
 * WHAT THIS REPLACED. This step used to be the whole `education_stages` ladder
 * — every undergraduate year, both school phases, postgraduate — rendered as a
 * list a teacher had to find themselves in. That list answers "what level is
 * this material for". It is a good question about a lesson and the wrong one
 * to open an account with, and it was rejected.
 *
 * Four cards answer the question the step was for, in one glance. There is no
 * education-stage screen after it: reinstating one would put the ladder back
 * one screen later and undo the correction.
 *
 * NOTHING IS SAVED HERE. Choosing a card writes the id into the in-memory
 * draft and moves on; the account does not exist yet. The id reaches the
 * server on the registration request, or — for a Google signup — inside the
 * handshake cookie, where it is validated against the table after the account
 * is created. Either way the client's number is checked before it is stored.
 *
 * AND IT IS NOT A PERMISSION. A workplace grants nothing, unlocks nothing, and
 * no age or consent is derived from it. It is one nullable column.
 */
export default function WorkplaceStep() {
  const { c, lang } = useAuthCopy()
  const navigate = useNavigate()
  const { draft, begin, setWorkplace } = useSignup()
  const options = useReferenceList(loadWorkplaceTypes)

  useDocumentTitle(c.signup.workplace.title)

  /* A direct link to /signup/teacher starts the draft; it is not a form
     submission, so it can safely run on mount. */
  useEffect(() => {
    begin('teacher')
  }, [begin])

  function choose(workplaceTypeId: number) {
    setWorkplace(workplaceTypeId)
    navigate('/signup/teacher/method')
  }

  const selected = draft?.workplaceId ?? null

  return (
    <AuthCard title={c.signup.workplace.title} lead={c.signup.workplace.lead} width="choice">
      {options.loading ? (
        <p className="text-sm" style={{ color: 'var(--ink-muted)' }} role="status" aria-live="polite">
          {c.common.loading}
        </p>
      ) : options.failed ? (
        /*
         * The list is the screen. Unlike the old step there is no "choose
         * later" to fall through to, so a failed fetch has to offer the retry
         * rather than a way past — and the retry is a real control, not a
         * suggestion to reload the page.
         */
        <div>
          <FormError>{c.common.loadError}</FormError>
          <button
            type="button"
            onClick={options.reload}
            className="mt-3 rounded-sm px-3 py-2 text-sm font-semibold underline underline-offset-2"
            style={{ color: 'var(--brand-blue)' }}
          >
            {c.common.retry}
          </button>
        </div>
      ) : options.options.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--ink-muted)' }} role="status">
          {c.common.unavailable}
        </p>
      ) : (
        /*
         * A list, because it is one: four peers. A screen reader announces the
         * count before the first card, which tells someone how long this is
         * before they start reading it.
         */
        <ul className="choice-grid" role="list">
          {options.options.map((option) => {
            /* Keyed on the row's own code, never its position or its id —
               see lib/workplaceArt.ts for why both of those are unstable. */
            const art = workplaceArt(option.code)
            const isSelected = selected === option.id

            return (
              <li key={option.id}>
                <button
                  type="button"
                  onClick={() => choose(option.id)}
                  aria-pressed={isSelected}
                  className="choice-card"
                  style={
                    { '--card-fill': art.fill, '--card-on': art.on } as React.CSSProperties
                  }
                >
                  {/*
                    The mark sits in the corner and the label is centred —
                    the composition the reference uses. Decorative, because
                    the label names the card; drawn in white so it reads on
                    every one of the four fills.
                  */}
                  <span className="choice-card-mark" aria-hidden="true">
                    <art.Illustration tone="#ffffff" className="size-5" />
                  </span>

                  <span className="choice-card-label">
                    {lang === 'ar' ? option.name_ar : option.name_en}
                  </span>

                  {/* Selection is a ring plus a mark. These cards are already
                      four colours, so colour alone could not say "this one". */}
                  {isSelected ? (
                    <span className="choice-card-check" aria-hidden="true">
                      <IconCheck size={14} />
                    </span>
                  ) : null}
                </button>
              </li>
            )
          })}
        </ul>
      )}
      {/*
        The same footer the role and account-method steps carry. It was
        missing here, so a teacher who already had an account and landed on
        the workplace step had no way out except Back — and the reference
        screenshot carries it inside this panel too.
      */}
      <p className="mt-6 text-center text-sm" style={{ color: 'var(--ink-muted)' }}>
        {c.chooseRole.haveAccount}{' '}
        <Link to="/login" className="auth-link">
          {c.login.title}
        </Link>
      </p>
    </AuthCard>
  )
}
