import { test, expect } from '@playwright/test'

/*
 * The stalled-refresh contract, as it stands after the session-recovery work
 * of 2026-09-10 (docs/session-recovery.md).
 *
 * A refresh that never answers used to be indistinguishable from a rejected
 * cookie, so startup marked the person anonymous and released the landing
 * page. It now keeps that distinction: the request gives up on its own
 * deadline, the app stops waiting, and instead of a blank loading screen — or
 * a sign-out — it says the API is unreachable and offers a retry. What has not
 * changed, and is the reason this test exists, is that a stalled API must not
 * strand the tab, and StrictMode must still put exactly ONE request on the
 * rotating refresh cookie per boot: a second presentation of a rotated token
 * is read as theft and revokes the whole family.
 */
test('a stalled session check offers a reconnect and releases the landing page on reload', async ({ page }) => {
  let refreshes = 0
  let stalled = true
  await page.route('**/api/v1/auth/refresh', async route => {
    refreshes += 1
    if (stalled) return // Leave the request pending to reproduce an unresponsive API.
    await route.fulfill({ status: 401, json: { error: { code: 'unauthorized' } } })
  })
  await page.goto('/')
  // StrictMode double-invokes the boot effect; the shared single-flight must
  // still have issued exactly one request by the time both invocations ran.
  await page.waitForTimeout(2000)
  expect(refreshes).toBe(1)
  // The tab is released rather than held on Loading, and it is not signed out.
  await expect(page.getByRole('button', { name: /Reconnect now|إعادة الاتصال/ })).toBeVisible({ timeout: 12000 })
  await expect(page.getByRole('alert')).toContainText(/temporarily unreachable|تعذّر الاتصال/)
  await expect(page).toHaveURL(/\/$/) // not bounced to /login
  const beforeReload = refreshes // a backoff retry may already have fired
  stalled = false
  await page.reload()
  await expect(page.locator('h1').first()).toBeVisible({ timeout: 8000 })
  expect(refreshes).toBe(beforeReload + 1)
})
