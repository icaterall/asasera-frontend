import { Link, useParams } from 'react-router-dom'

import { AuthCard } from '@/components/form/AuthCard'
import { useAuthCopy } from '@/copy/useAuthCopy'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSignup } from '@/hooks/useSignup'

/**
 * The end of the email chain: the account exists, and a verification message
 * is on its way.
 *
 * The address is shown only if the draft still holds it. After a refresh it
 * does not, and this screen says the same thing without it rather than
 * inventing one — the account was already created, so there is nothing to
 * recover and nowhere to send the person back to.
 */
export default function CheckEmail() {
  const { c } = useAuthCopy()
  const { role } = useParams<{ role: string }>()
  const { draft } = useSignup()
  useDocumentTitle(c.signup.checkEmail.title)

  const signupRole = role === 'student' ? 'student' : 'teacher'

  return (
    <AuthCard title={c.signup.checkEmail.title} lead={c.signup.checkEmail.lead}>
      {draft?.email ? (
        <p className="text-sm" dir="ltr" style={{ color: 'var(--ink)' }}>
          {draft.email}
        </p>
      ) : null}

      <p className="mt-4 text-sm leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
        {c.signup.checkEmail.body}
      </p>

      <div className="mt-6">
        <Link to="/login" className="auth-provider justify-center font-semibold">
          {c.common.backToSignIn}
        </Link>
      </div>

      <p className="mt-4 text-center text-xs" style={{ color: 'var(--ink-muted)' }}>
        {signupRole === 'teacher' ? c.signup.checkEmail.nextTeacher : c.signup.checkEmail.nextStudent}
      </p>
    </AuthCard>
  )
}
