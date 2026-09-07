import type { PublicUser } from '@/lib/api'

/**
 * Where a person goes once they are signed in.
 *
 * ONE DEFINITION, THREE CALLERS: password sign-in, the end of registration,
 * and the Google callback. It used to be written out at each of them as
 * `needsProfile ? '/complete-profile' : '/'`, which is how the three quietly
 * disagreed — and how every teacher, verified or not, landed on the public
 * marketing page after signing in, because there was no signed-in destination
 * to land on.
 *
 * PROFILE COMPLETION IS NO LONGER A GATE. The old expression sent any teacher
 * with no subject and no workplace to `/complete-profile` before they could
 * reach the application. Those fields are optional, the dashboard now asks for
 * the subject as one of its next steps, and a person who has just created an
 * account should see the product rather than another form. Students have a
 * dedicated place to join live classes and open teacher assignments.
 */
export function homePathFor(user: Pick<PublicUser, 'role'>): string {
  return user.role === 'teacher' ? '/teacher/dashboard' : '/student'
}

/**
 * A return path handed over by the router, checked before it is used.
 *
 * Only a same-origin absolute path is accepted. The checks, in order: it must
 * be a string; it must start with `/`; it must NOT start with `//` or `/\`,
 * both of which a browser reads as a protocol-relative URL and will happily
 * follow to another host; and it must not carry a control character, which is
 * how a newline gets smuggled into a header. Anything else returns null and
 * the caller falls back to the role's own home.
 *
 * This matters because the value reaches us from `location.state`, and a
 * redirect that trusts its input is an open redirect — the classic way a
 * phishing page borrows a real sign-in flow.
 */
export function safeReturnPath(value: unknown): string | null {
  if (typeof value !== 'string' || value.length === 0) return null
  if (!value.startsWith('/')) return null
  if (value.startsWith('//') || value.startsWith('/\\')) return null
  /* Matching control characters is the whole intent here — a newline in a
     redirect target is how a header gets split. */
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f]/.test(value)) return null
  /* Never bounce back to an authentication screen: a person who just signed in
     being returned to the sign-in page reads as a failed sign-in. */
  if (/^\/(login|signup|forgot|reset|verify-email|auth)\b/.test(value)) return null
  return value
}
