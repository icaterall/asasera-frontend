import { Link, useNavigate } from 'react-router-dom'

import { AuthCard } from '@/components/form/AuthCard'
import { StudentIllustration, TeacherIllustration } from '@/components/ui/AuthIllustrations'
import { useAuthCopy } from '@/copy/useAuthCopy'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

/**
 * Step one of signing up: which kind of account.
 *
 * THE ROLE IS STILL THE ROUTE. This screen does not set a role — it navigates
 * to the flow that owns one. Nothing here is submitted, nothing is stored, and
 * the eventual request goes to `/auth/register/teacher` or
 * `/auth/register/student`, which is what actually decides the role. A choice
 * made here is a routing decision, not a privilege.
 *
 * Two real <Link>s rather than buttons with onClick: each destination is a
 * URL, so it should be openable in a new tab, focusable, and reachable by a
 * direct link — /signup/teacher and /signup/student both preselect.
 */
export default function ChooseRole() {
  const { c } = useAuthCopy()
  useDocumentTitle(c.chooseRole.title)
  useNavigate()

  /*
   * Two cards, side by side, in the reference's own composition: a mark in
   * the corner and the label centred on a flat colour. This was a stacked
   * pair of white rows with a 44px illustration block down one edge, which is
   * a different control entirely.
   *
   * Teacher takes the red the reference gives it; Student takes the Asasera
   * teal rather than the reference's amber, because amber cannot carry a
   * white label (2.15:1) and the labels here are white on all four screens.
   */
  const options = [
    {
      to: '/signup/teacher',
      title: c.chooseRole.teacher.title,
      Art: TeacherIllustration,
      fill: 'var(--wp-school)',
    },
    {
      to: '/signup/student',
      title: c.chooseRole.student.title,
      Art: StudentIllustration,
      fill: 'var(--role-student)',
    },
  ]

  return (
    <AuthCard title={c.chooseRole.title} lead={c.chooseRole.lead} width="choice">
      {/*
        A list, because it is one: two peers, not a form. Screen readers
        announce "2 items", which tells someone how many choices exist before
        they arrive at the second one.
      */}
      <ul className="choice-grid" role="list">
        {options.map((option) => (
          <li key={option.to}>
            <Link
              to={option.to}
              className="choice-card"
              style={{ '--card-fill': option.fill } as React.CSSProperties}
            >
              <span className="choice-card-mark" aria-hidden="true">
                <option.Art tone="#ffffff" className="size-5" />
              </span>
              <span className="choice-card-label">{option.title}</span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-center text-sm" style={{ color: 'var(--ink-muted)' }}>
        {c.chooseRole.haveAccount}{' '}
        <Link to="/login" className="auth-link">
          {c.login.title}
        </Link>
      </p>
    </AuthCard>
  )
}
