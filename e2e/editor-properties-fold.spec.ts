import {expect,test} from '@playwright/test'
import {isolatedStackOnly,localShapes} from './local-fixture'

/**
 * Folding the properties panel.
 *
 * Two things were wrong and both are invisible in a screenshot of the open
 * state. The panel scrolls, and its header was in the normal flow, so the fold
 * handle left the screen as soon as a teacher scrolled down the properties.
 * And the canvas column widened on fold while `.canvasInner` stayed capped and
 * centred, so on a wide screen folding only moved the question sideways — the
 * space the panel gave up never reached the question.
 *
 * So this spec measures rather than looks: the question's own width before and
 * after, and where the handle is after scrolling.
 */
test.beforeAll(isolatedStackOnly)

test('the handle stays on the edge and folding widens the question', async ({ page }) => {
  const fx = localShapes()
  const login = await page.request.post('/api/v1/auth/login', { data: { email: fx.email, password: fx.password } })
  expect(login.ok()).toBe(true)
  await page.addInitScript(() => localStorage.setItem('asasera.language', 'en'))
  await page.setViewportSize({ width: 1600, height: 1000 })
  await page.goto(`/teacher/activities/${fx.activityId}`)

  const handle = page.locator('aside[data-editor-drawer] [aria-expanded]').first()
  await expect(handle).toBeVisible({ timeout: 20_000 })
  expect(await page.locator('[class*="propsHeader"]').first().evaluate((el) => getComputedStyle(el).position)).toBe('sticky')

  const question = page.locator('[class*="canvasInner"]').first()
  const openWidth = (await question.boundingBox())!.width

  // Scrolled to the bottom of the properties, the handle must still be on screen.
  const panel = page.locator('aside[data-editor-drawer]').first()
  await panel.evaluate((el) => el.scrollTo(0, el.scrollHeight))
  await expect(handle).toBeInViewport()

  await handle.click()
  await page.waitForTimeout(150)

  const folded = await page.evaluate(() => {
    const aside = document.querySelector('aside[data-editor-drawer]') as HTMLElement
    const button = aside.querySelector('[aria-expanded]') as HTMLElement | null
    const box = button?.getBoundingClientRect()
    return {
      drawer: aside.getAttribute('data-editor-drawer'),
      stripWidth: Math.round(aside.getBoundingClientRect().width),
      handleOnScreen: !!box && box.width > 0 && box.right <= window.innerWidth + 1,
      hiddenSiblings: [...aside.children].slice(1).every((child) => getComputedStyle(child).display === 'none'),
    }
  })
  expect(folded.drawer).toBe('closed')
  expect(folded.stripWidth).toBeLessThan(80)
  expect(folded.handleOnScreen).toBe(true)
  expect(folded.hiddenSiblings).toBe(true)

  const foldedWidth = (await question.boundingBox())!.width
  expect(foldedWidth).toBeGreaterThan(openWidth)
})
