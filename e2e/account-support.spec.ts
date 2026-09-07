import { test, expect, type Page } from '@playwright/test'
import { readFileSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
const environment = process.env.PW_JOURNEY_STATE ? JSON.parse(readFileSync(process.env.PW_JOURNEY_STATE, 'utf8')) : { web: '', directory: '', mailDir: '' }
test.skip(!process.env.PW_JOURNEY_STATE, 'Requires the isolated local SMTP environment')
test.use({ baseURL: environment.web || 'http://127.0.0.1:5201' })
const shots = '.impeccable/review/account-support'
mkdirSync(shots, { recursive: true })
const password = 'Asasera account support 2026'
async function prepare(page: Page, language = 'en') {
  await page.addInitScript(lang => { if (!localStorage.getItem('asasera.language')) localStorage.setItem('asasera.language', lang) }, language)
}
async function account(page: Page, role: 'teacher' | 'student') {
  await prepare(page)
  const email = `support-journey-${randomUUID()}@example.test`
  const registered = await page.request.post('/api/v1/auth/register/' + role, { data: { email, password } })
  expect(registered.status()).toBe(200)
  await page.goto('/login')
  await page.getByLabel('Email address', { exact: true }).fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(page).toHaveURL(role === 'teacher' ? /\/teacher\/dashboard$/ : /\/student$/)
  return email
}
function supportMail(marker: string) {
  const parser = `import pathlib,email,email.policy,json,sys
out=[]
for p in pathlib.Path(sys.argv[1]).glob('*.eml'):
 m=email.message_from_bytes(p.read_bytes(),policy=email.policy.default)
 body='\\n'.join(part.get_content() for part in m.walk() if part.get_content_type()=='text/plain')
 if sys.argv[2] in body:
  out.append({'to':str(m['To']),'from':str(m['From']),'reply':str(m['Reply-To']),'intended':str(m['X-Asasera-Intended-To']),'body':body,'envelope':json.loads(p.with_suffix('.envelope.json').read_text())})
print(json.dumps(out))`
  return JSON.parse(execFileSync('python3', ['-c', parser, environment.mailDir, marker], { encoding: 'utf8' })) as { to: string; from: string; reply: string; intended: string; body: string; envelope: string[] }[]
}
async function fillContact(page: Page, marker: string) {
  const form = page.getByRole('form', { name: 'Contact form' })
  await form.getByLabel('Name', { exact: true }).fill('Synthetic Support Sender')
  await form.getByLabel('Email address', { exact: true }).fill('reply@example.test')
  await form.getByLabel('Organization (optional)', { exact: true }).fill('Synthetic School')
  await form.getByLabel('How can we help?', { exact: true }).fill(marker + ' — رسالة دعم عربية محفوظة بالكامل.')
}

test('landing contact validates, focuses errors, and sends one complete support email', async ({ page }) => {
  await prepare(page); await page.goto('/#departments')
  await page.getByRole('button', { name: 'Send message', exact: true }).click()
  await expect(page.getByLabel('Name', { exact: true })).toBeFocused()
  await expect(page.getByText('Enter a valid email address.', { exact: true })).toBeVisible()
  const marker = 'contact-success-' + randomUUID()
  await fillContact(page, marker)
  const response = page.waitForResponse(r => r.url().endsWith('/api/v1/contact') && r.request().method() === 'POST')
  // A duplicate native submit while the first is in flight must not send twice.
  await page.getByRole('form', { name: 'Contact form' }).evaluate(form => { (form as HTMLFormElement).requestSubmit(); (form as HTMLFormElement).requestSubmit() })
  expect((await response).status()).toBe(201)
  await expect(page.getByRole('heading', { name: 'Your message has been sent' })).toBeVisible()
  const mails = supportMail(marker)
  expect(mails).toHaveLength(1)
  expect(mails[0]!.intended).toBe('support@asasera.com')
  expect(mails[0]!.to).toBe('capture@example.test')
  expect(mails[0]!.reply).toContain('reply@example.test')
  expect(mails[0]!.from).toContain('sandbox@example.test')
  expect(mails[0]!.body).toContain('رسالة دعم عربية محفوظة بالكامل')
  expect(mails[0]!.envelope).toEqual(['RCPT TO:<capture@example.test>'])
  await page.getByRole('button', { name: 'Send another message' }).click()
  await expect(page.getByLabel('How can we help?', { exact: true })).toHaveValue('')
})

test('SMTP refusal preserves the message and retry really delivers it', async ({ page }) => {
  await prepare(page); await page.goto('/contact')
  const marker = 'contact-retry-' + randomUUID()
  await fillContact(page, marker)
  writeFileSync(`${environment.directory}/mail-reject`, 'synthetic test only')
  try {
    const response = page.waitForResponse(r => r.url().endsWith('/api/v1/contact'))
    await page.getByRole('button', { name: 'Send message', exact: true }).click()
    expect((await response).status()).toBe(503)
    await expect(page.getByRole('alert')).toContainText('Your text is still here')
    await expect(page.getByLabel('How can we help?', { exact: true })).toContainText(marker)
    expect(supportMail(marker)).toHaveLength(0)
  } finally { rmSync(`${environment.directory}/mail-reject`, { force: true }) }
  await page.getByRole('button', { name: 'Send message', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Your message has been sent' })).toBeVisible()
  expect(supportMail(marker)).toHaveLength(1)
})

test('throttling feedback preserves input and gives a direct support alternative', async ({ page }) => {
  await prepare(page); await page.goto('/contact')
  await fillContact(page, 'rate-limited-' + randomUUID())
  await page.route('**/api/v1/contact', route => route.fulfill({ status: 429, contentType: 'application/json', body: JSON.stringify({ error: { code: 'too_many_requests', message: 'Synthetic limit' } }) }))
  await page.getByRole('button', { name: 'Send message', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('Try later or email support@asasera.com directly.')
  await expect(page.getByLabel('Name', { exact: true })).toHaveValue('Synthetic Support Sender')
})

for (const role of ['teacher', 'student'] as const) test(`${role} account menu, profile persistence, password entry and logout work`, async ({ page }) => {
  const email = await account(page, role)
  const trigger = page.getByRole('button', { name: 'Account menu', exact: true })
  await trigger.focus(); await page.keyboard.press('ArrowDown')
  const menu = page.getByRole('menu', { name: 'Account menu' })
  await expect(menu.getByRole('menuitem').first()).toBeFocused()
  await page.keyboard.press('End'); await expect(menu.getByRole('menuitem', { name: 'Sign out', exact: true })).toBeFocused()
  await page.keyboard.press('ArrowDown'); await expect(menu.getByRole('menuitem').first()).toBeFocused()
  await page.keyboard.press('Escape'); await expect(menu).not.toBeVisible(); await expect(trigger).toBeFocused()
  await trigger.click()
  await page.screenshot({ path: `${shots}/${role}-menu-desktop.png`, fullPage: true })
  if (role === 'teacher') {
    for (const [label, href] of [['My activities', '/teacher/activities'], ['Assignments', '/teacher/assignments'], ['Reports', '/teacher/reports']]) await expect(menu.getByRole('menuitem', { name: label, exact: true })).toHaveAttribute('href', href!)
  } else await expect(menu.getByRole('menuitem', { name: 'Join a class', exact: true })).toHaveAttribute('href', '/join')
  await menu.getByRole('menuitem', { name: 'Account settings', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Account settings', exact: true })).toBeVisible()
  await page.getByLabel('Display name', { exact: true }).fill(role === 'teacher' ? 'Synthetic Teacher' : 'أشرف قحمان')
  await page.getByRole('button', { name: 'Save changes', exact: true }).click()
  await expect(page.getByText('Changes saved.', { exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByLabel('Display name', { exact: true })).toHaveValue(role === 'teacher' ? 'Synthetic Teacher' : 'أشرف قحمان')
  await expect(trigger).toHaveText(role === 'teacher' ? 'S' : 'أ')
  await trigger.click(); await page.getByRole('heading', { name: 'Account settings', exact: true }).click(); await expect(menu).not.toBeVisible()
  await page.getByRole('link', { name: 'Reset password', exact: true }).click()
  await expect(page.getByLabel('Email address', { exact: true })).toHaveValue(email)
  await page.goto('/account'); await trigger.click(); await menu.getByRole('menuitem', { name: 'Contact support', exact: true }).click()
  await expect(page).toHaveURL(/\/contact$/)
  await expect(page.getByRole('form', { name: 'Contact form' }).getByLabel('Email address', { exact: true })).toHaveValue(email)
  await trigger.click(); await menu.getByRole('menuitem', { name: 'Sign out', exact: true }).click()
  await expect(page).toHaveURL(/\/login$/)
  await page.goto('/account'); await expect(page).toHaveURL(/\/login$/)
})

test('Arabic mobile and English desktop account/support captures fit the viewport', async ({ page }) => {
  await prepare(page); await page.setViewportSize({ width: 1440, height: 1000 }); await page.goto('/contact')
  await expect(page.getByRole('heading', { name: 'Let’s talk', exact: true })).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: `${shots}/contact-desktop-en.png`, fullPage: true })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.evaluate(() => localStorage.setItem('asasera.language', 'ar')); await page.reload()
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  await expect(page.getByRole('heading', { name: 'لنتحدث', exact: true })).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: `${shots}/contact-mobile-ar.png`, fullPage: true })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.evaluate(() => localStorage.setItem('asasera.language', 'en'))
  await account(page, 'student')
  await page.goto('/account'); await page.getByLabel('Display name', { exact: true }).fill('Synthetic Student')
  await page.getByRole('button', { name: 'Save changes', exact: true }).click()
  await expect(page.getByText('Changes saved.', { exact: true })).toBeVisible()
  await page.screenshot({ path: `${shots}/account-mobile-en.png`, fullPage: true })
  await page.goto('/student')
  await page.evaluate(() => { localStorage.setItem('asasera.language', 'ar'); localStorage.setItem('asasera.theme', 'dark') })
  // The page's explicit control ensures the theme follows the product's storage key.
  await page.reload()
  await page.getByRole('button', { name: 'قائمة الحساب', exact: true }).click()
  await page.screenshot({ path: `${shots}/student-menu-mobile-ar.png`, fullPage: true })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('dark support and account settings, and a small teacher menu, retain focus and readable controls', async ({ page }) => {
  await prepare(page)
  await page.addInitScript(() => localStorage.setItem('asasera.theme', 'dark'))
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/contact')
  await expect(page.getByRole('heading', { name: 'Let’s talk', exact: true })).toBeVisible()
  await page.getByLabel('Name', { exact: true }).focus()
  const focus = await page.getByLabel('Name', { exact: true }).evaluate(input => {
    const style = getComputedStyle(input)
    return { width: style.outlineWidth, style: style.outlineStyle, color: style.outlineColor }
  })
  expect(focus).toEqual({ width: '3px', style: 'solid', color: 'rgb(255, 255, 255)' })
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: `${shots}/contact-desktop-en-dark.png`, fullPage: true })
  await account(page, 'teacher'); await page.goto('/account')
  await expect(page.getByLabel('Display name', { exact: true })).toBeVisible()
  await page.screenshot({ path: `${shots}/account-desktop-en-dark.png`, fullPage: true })
  await page.setViewportSize({ width: 390, height: 667 }); await page.goto('/teacher/dashboard')
  const trigger = page.getByRole('button', { name: 'Account menu', exact: true })
  await trigger.focus(); await page.keyboard.press('ArrowUp')
  await expect(page.getByRole('menuitem', { name: 'Sign out', exact: true })).toBeFocused()
  await page.keyboard.press('Home')
  const menu = page.getByRole('menu', { name: 'Account menu' })
  const bounds = await menu.boundingBox()
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(667)
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await page.screenshot({ path: `${shots}/teacher-menu-mobile-en-dark.png`, fullPage: true })
  await page.keyboard.press('Tab'); await expect(menu).not.toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  writeFileSync(`${shots}/control-states.json`, JSON.stringify({ darkSupportFocus: focus, mobileTeacherMenuBounds: bounds, viewport: { width: 390, height: 667 }, keyboard: 'ArrowUp, Home, Tab and Escape checked by the suite' }, null, 2))
})


test('public and signed-in landing fragments do not throw on malformed IDs', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await prepare(page)
  for (const fragment of ['#(', '#%E0%A4%A', '#departments']) {
    await page.goto('/' + fragment)
    await expect(page.getByRole('form', { name: 'Contact form' })).toBeAttached()
  }
  await account(page, 'student')
  await page.goto('/#departments')
  await expect(page).toHaveURL(/\/#departments$/)
  await expect(page.getByRole('button', { name: 'Send message', exact: true })).toBeVisible()
  expect(errors).toEqual([])
})
