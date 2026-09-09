import { test, expect } from '@playwright/test'

test('a stalled session check releases the landing page and can retry on reload', async ({ page }) => {
  let refreshes = 0
  let stalled = true
  await page.route('**/api/v1/auth/refresh', async route => {
    refreshes += 1
    if (stalled) return // Leave the request pending to reproduce an unresponsive API.
    await route.fulfill({ status: 401, json: { error: { code: 'unauthorized' } } })
  })
  await page.goto('/')
  await expect(page.locator('h1').first()).toBeVisible({ timeout: 12000 })
  expect(refreshes).toBe(1) // StrictMode must still share one refresh request.
  stalled = false
  await page.reload()
  await expect(page.locator('h1').first()).toBeVisible({ timeout: 4000 })
  expect(refreshes).toBe(2)
})
