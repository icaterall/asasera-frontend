import { Link } from 'react-router-dom'

import { useAuthCopy } from '@/copy/useAuthCopy'

/**
 * "An account with this email already exists. Sign in instead."
 *
 * TWO SCREENS, ONE SENTENCE. The address step shows this after asking the
 * server whether the address is free; the password step shows it when the
 * account was created by someone else in the seconds between that answer and
 * the submit. Both are the same fact and deserve the same words, so the words
 * live here rather than being written twice and drifting apart.
 *
 * THE ADDRESS TRAVELS IN ROUTER STATE, NOT THE URL. `/login?email=…` would put
 * it in the address bar, in history, in the `Referer` of anything the sign-in
 * page loads, and in any access log along the way. Router state is held in
 * memory by the history entry and reaches the next screen without any of that.
 * A missing state (someone pasted the link, or reloaded) simply means no
 * prefill — never a broken page.
 *
 * The sentence is split on its own placeholder rather than concatenated, so
 * "Sign in" is a real <Link> inside the sentence and the surrounding words
 * stay one translated string. In Arabic the link falls in a different place;
 * the split is what lets it.
 */
export function EmailTakenMessage({ email }: { email: string }) {
  const { c } = useAuthCopy()
  const [before, after] = c.errors.emailTaken.split('{{signIn}}')

  return (
    <>
      {before}
      <Link to="/login" state={{ email }} className="auth-link">
        {c.errors.emailTakenAction}
      </Link>
      {after}
    </>
  )
}
