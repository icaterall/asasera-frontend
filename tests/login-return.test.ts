import assert from 'node:assert/strict'
import { it } from 'node:test'
import { homePathFor, isAuthenticationPath, loginDestinationFor, loginStateFor, safeReturnPath } from '../src/lib/afterAuth.ts'
import { createLoginReturnStore } from '../src/lib/loginReturn.ts'
import { accountRoleLabel } from '../src/lib/accountRole.ts'

function storage() {
  const entries = new Map<string, string>()
  return {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => { entries.set(key, value) },
    removeItem: (key: string) => { entries.delete(key) },
  }
}
const teacher = { role: 'teacher' as const }, student = { role: 'student' as const }

it('preserves the requested page, query and section after password login', () => {
  const from = loginStateFor({ pathname: '/teacher/activities/42', search: '?tab=questions&sort=latest', hash: '#question-3' }).from
  assert.equal(loginDestinationFor(teacher, from), '/teacher/activities/42?tab=questions&sort=latest#question-3')
})
it('keeps student and account query/section links as well', () => {
  for (const path of ['/student?view=assignments#latest', '/account?tab=profile#name']) {
    assert.equal(loginDestinationFor(student, path), path)
  }
})
it('keeps classroom and assignment links shared with either role', () => {
  for (const user of [teacher, student]) {
    assert.equal(loginDestinationFor(user, '/join?pin=123456'), '/join?pin=123456')
    assert.equal(loginDestinationFor(user, '/learn/123#sample-link'), '/learn/123#sample-link')
  }
})
it('uses the authenticated role dashboard when there is no requested page', () => {
  for (const value of [undefined, null, '', '/', '/#top']) {
    assert.equal(loginDestinationFor(teacher, value), '/teacher/dashboard')
    assert.equal(loginDestinationFor(student, value), '/student')
  }
})
it('falls back to the right dashboard for a page belonging to the other role', () => {
  assert.equal(loginDestinationFor(student, '/teacher/activities?filter=drafts'), '/student')
  assert.equal(loginDestinationFor(teacher, '/student?tab=classes'), '/teacher/dashboard')
  assert.equal(loginDestinationFor(student, '/Teacher/live/42'), '/student')
  assert.equal(loginDestinationFor(student, '/%74eacher/live/42'), '/student')
})
it('does not send admin/support accounts into a teacher/student redirect loop', () => {
  for (const role of ['admin', 'support'] as const) {
    const home = role === 'admin' ? '/admin/users' : '/account'
    assert.equal(homePathFor({ role }), home)
    assert.equal(loginDestinationFor({ role }, '/student'), home)
    assert.equal(loginDestinationFor({ role }, '/teacher/dashboard'), home)
  }
})
it('rejects external redirects, executable URLs, malformed and oversized paths', () => {
  for (const value of ['https://evil.example', '//evil.example', '/\\evil.example', '/%5cevil.example', '/%2f/evil.example', 'javascript:alert(1)', ' /account', '/account\n', '/%00account', '/%', '/a' + 'x'.repeat(4096), { from: '/account' }]) {
    assert.equal(safeReturnPath(value), null)
  }
})
it('rejects login loops and API endpoints, including normalized or encoded forms', () => {
  for (const value of ['/login', '/login?next=/account', '/signup/teacher', '/register/student', '/forgot', '/reset?token=sample', '/verify-email', '/auth/callback', '/api/v1/auth/google', '/teacher/../login', '/%6cogin']) {
    assert.equal(safeReturnPath(value), null)
  }
})
it('allows public-page login to return there, while landing login defaults to a dashboard', () => {
  assert.equal(loginStateFor({ pathname: '/contact', search: '', hash: '#form' }).from, '/contact#form')
  assert.equal(loginStateFor({ pathname: '/', search: '', hash: '#top' }).from, null)
})
it('restores the destination after the full-page Google round trip', () => {
  const tab = storage()
  createLoginReturnStore(() => tab).remember('/teacher/reports?class=42#results')
  const callbackStore = createLoginReturnStore(() => tab)
  assert.equal(loginDestinationFor(teacher, callbackStore.read()), '/teacher/reports?class=42#results')
  callbackStore.clear()
  assert.equal(createLoginReturnStore(() => tab).read(), null)
})
it('retains the destination across failed login/recovery and replaces it for a newer request', () => {
  const tab = storage(), pending = createLoginReturnStore(() => tab)
  pending.remember('/teacher/reports')
  for (const path of ['/login', '/forgot', '/reset', '/signup/student', '/auth/callback']) {
    assert.equal(isAuthenticationPath(path), true)
    assert.equal(createLoginReturnStore(() => tab).read(), '/teacher/reports')
  }
  pending.remember('/account#profile')
  assert.equal(createLoginReturnStore(() => tab).read(), '/account#profile')
  assert.equal(isAuthenticationPath('/about'), false)
  pending.clear()
  assert.equal(pending.read(), null)
})
it('expires abandoned sign-in requests and does not share them between tabs', () => {
  let time = 1000
  const tab = storage(), pending = createLoginReturnStore(() => tab, () => time)
  pending.remember('/teacher/activities')
  assert.equal(createLoginReturnStore(storage).read(), null)
  time += 30 * 60 * 1000
  assert.equal(pending.read(), null)
  assert.equal(loginDestinationFor(student, pending.read()), '/student')
})
it('remains usable when browser storage is blocked or full', () => {
  const blocked = createLoginReturnStore(() => { throw new Error('storage blocked') })
  blocked.remember('/account'); assert.equal(blocked.read(), '/account')
  blocked.clear(); assert.equal(blocked.read(), null)
  const full = createLoginReturnStore(() => ({ ...storage(), setItem() { throw new Error('quota exceeded') } }))
  full.remember('/teacher/materials'); assert.equal(full.read(), '/teacher/materials')
})
it('discards edited and broken saved destinations', () => {
  const tab = storage()
  for (const value of ['not-json', JSON.stringify({ path: '//evil.example', expiresAt: Date.now() + 1000 }), JSON.stringify({ path: '/account', expiresAt: 'forever' })]) {
    tab.setItem('asasera.login-return.v1', value)
    assert.equal(createLoginReturnStore(() => tab).read(), null)
  }
})
it('names all stored roles accurately in English and Arabic', () => {
  assert.equal(accountRoleLabel('teacher', 'en'), 'Teacher')
  assert.equal(accountRoleLabel('student', 'en-US'), 'Student')
  assert.equal(accountRoleLabel('teacher', 'ar'), 'معلّم')
  assert.equal(accountRoleLabel('student', 'ar-OM'), 'طالب')
  assert.equal(accountRoleLabel('admin', 'en'), 'Admin')
  assert.equal(accountRoleLabel('support', 'ar'), 'الدعم الفني')
})
