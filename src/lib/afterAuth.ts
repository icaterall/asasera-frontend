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
  if (user.role === 'teacher') return '/teacher/dashboard'
  if (user.role === 'student') return '/student'
  // Admin/support have no dedicated workspace in this application yet.
  return '/account'
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
  if (typeof value !== 'string' || value.length === 0 || value.length > 4096) return null
  const unsafeCharacters = (text: string) => [...text].some(char => char === '\\' || char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127)
  if (!value.startsWith('/') || value.startsWith('//') || unsafeCharacters(value)) return null
  try {
    const url = new URL(value, 'https://asasera.invalid')
    const pathname = decodeURIComponent(url.pathname)
    if (url.origin !== 'https://asasera.invalid' || unsafeCharacters(pathname) || pathname.startsWith('//')) return null
    // Normalize dot segments before excluding authentication and API routes.
    // Those endpoints can themselves redirect, so they are never destinations.
    if (pathname === '/' || /^\/(login|signup|register|forgot|reset|verify-email|auth|api)(\/|$)/i.test(pathname)) return null
    return url.pathname + url.search + url.hash
  } catch {
    return null
  }
}

/** Navigation follows the authenticated role; it never grants access. */
export function loginDestinationFor(user: Pick<PublicUser, 'role'>, requested: unknown): string {
  const path = safeReturnPath(requested)
  if (!path) return homePathFor(user)
  const pathname = decodeURIComponent(new URL(path, 'https://asasera.invalid').pathname)
  if (/^\/teacher(\/|$)/i.test(pathname) && user.role !== 'teacher') return homePathFor(user)
  if (/^\/student(\/|$)/i.test(pathname) && user.role !== 'student') return homePathFor(user)
  return path
}

export function loginStateFor(location: { pathname: string; search: string; hash: string }) {
  return { from: safeReturnPath(location.pathname + location.search + location.hash) }
}

export function isAuthenticationPath(pathname: string): boolean {
  return /^\/(login|signup|register|forgot|reset|verify-email|auth)(\/|$)/i.test(pathname)
}
