import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { AuthCard, FormError } from '@/components/form/AuthCard'
import { useAuthCopy } from '@/copy/useAuthCopy'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useReferenceList } from '@/hooks/useReferenceList'
import { useSignup } from '@/hooks/useSignup'
import { reference } from '@/lib/api'
import { stageArt } from '@/lib/stageArt'
import { IconCheck } from '@/pages/Landing/ui/Icons'

/* Hoisted so its identity is stable across renders — useReferenceList keys its
   effect on the function, and an inline arrow would refetch every render. */
const loadStages = (signal?: AbortSignal) => reference.educationStages(signal)

/**
 * Step two: which level the person teaches, or studies.
 *
 * WHAT THIS QUESTION IS NOT. It is not the teacher's own qualification, and it
 * is not a workplace or an institution. The reference screenshots put School /
 * Higher education / Business / Other here; those are organisation types and
 * would have to be invented as rows, so they are deliberately absent.
 *
 * WHAT THE DATA SUPPORTS. The endpoint returns every selectable row in
 * `education_stages` — school stages and higher-education levels alike. It no
 * longer filters to `age_band = 'university'`, because that filter was hiding
 * school stages from teachers who teach them; it is not a claim about anyone's
 * age, and nothing here derives an age, a year group, or a consent status from
 * the answer. The rows still mix institution types (College) with award levels
 * (Bachelor, Master), so "Choose later" exists because of that gap rather than
 * as padding: someone whose level is not listed must be able to continue, and
 * must not be pushed into a row that misdescribes them.
 *
 * Nothing is saved here. The choice rides in the in-memory draft and is
 * applied after the account exists, through the profile endpoint that already
 * validates the id server-side.
 */
export default function StageStep() {
  const { c, lang } = useAuthCopy()
  const navigate = useNavigate()
  const { role } = useParams<{ role: string }>()
  const { draft, begin, setStage } = useSignup()
  const stages = useReferenceList(loadStages)

  const signupRole = role === 'student' ? 'student' : 'teacher'
  useDocumentTitle(c.signup.stage.title[signupRole])

  /* A direct link to /signup/teacher starts the draft; it is not a form
     submission, so it can safely run on mount. */
  useEffect(() => {
    begin(signupRole)
  }, [begin, signupRole])

  function choose(stageId: number | null) {
    setStage(stageId)
    navigate(`/signup/${signupRole}/method`)
  }

  const selected = draft?.stageAnswered ? draft.stageId : undefined

  return (
    <AuthCard
      title={c.signup.stage.title[signupRole]}
      lead={c.signup.stage.lead[signupRole]}
      width="choice"
    >
      {stages.loading ? (
        <p className="text-sm" style={{ color: 'var(--ink-muted)' }} role="status" aria-live="polite">
          {c.common.loading}
        </p>
      ) : stages.failed ? (
        <div>
          <FormError>{c.common.loadError}</FormError>
          <button
            type="button"
            onClick={stages.reload}
            className="mt-3 rounded-sm px-3 py-2 text-sm font-semibold underline underline-offset-2"
            style={{ color: 'var(--brand-blue)' }}
          >
            {c.common.retry}
          </button>
        </div>
      ) : stages.options.length === 0 ? (
        /* Loaded fine, nothing in it. Not an error, and not a dead end —
           "Choose later" below still moves the person forward. */
        <p className="text-sm" style={{ color: 'var(--ink-muted)' }} role="status">
          {c.common.unavailable}
        </p>
      ) : (
        <ul className="tile-grid" role="list">
          {stages.options.map((option) => {
            const art = stageArt(option.name_en, option.name_ar)
            const isSelected = selected === option.id
            return (
              <li key={option.id}>
                <button
                  type="button"
                  onClick={() => choose(option.id)}
                  data-selected={isSelected ? 'true' : undefined}
                  aria-pressed={isSelected}
                  className="tile tile--stacked"
                  style={
                    { '--tile-hue': art.hue, '--tile-wash': art.wash } as React.CSSProperties
                  }
                >
                  <span className="tile-art">
                    <art.Illustration tone={art.hue} className="size-11" />
                  </span>
                  {/*
                    Long Arabic labels stay fully readable: the text panel
                    wraps rather than truncating, and the grid row grows with
                    the tallest label in it so the tiles stay a level set.
                  */}
                  <span className="tile-body text-sm font-bold leading-snug text-balance" style={{ color: 'var(--ink)' }}>
                    {lang === 'ar' ? option.name_ar : option.name_en}
                  </span>
                  {/* Selection is a border + ring + mark, never colour alone. */}
                  {isSelected ? (
                    <span className="tile-check" aria-hidden="true">
                      <IconCheck size={13} />
                    </span>
                  ) : null}
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {/*
        Always available, including while the list is loading or failed — the
        point of it is that a missing or unhelpful list must never trap anyone.
        It stores nothing: no invented id, no placeholder row.
      */}
      <button
        type="button"
        onClick={() => choose(null)}
        data-selected={draft?.stageAnswered && draft.stageId === null ? 'true' : undefined}
        className="mt-4 w-full rounded-sm px-3 py-2.5 text-sm font-semibold underline underline-offset-2"
        style={{ color: 'var(--ink-muted)' }}
      >
        {c.signup.stage.later}
      </button>
    </AuthCard>
  )
}
