import {expect,test} from '@playwright/test'
import {isolatedStackOnly,localShapes} from './local-fixture'

/**
 * Image zones are not all rectangles (Kahoot parity: circles, squares, polygons).
 *
 * The claim worth testing is not that a circle is drawn — a picture proves that
 * — but that a circle BEHAVES as a circle: a tap in the corner of its box must
 * miss it. That works because the target is a real element carrying the shared
 * `zoneClipPath`, and a browser does not deliver a pointer event to a clipped
 * corner. So this spec probes the document at coordinates, which is the only
 * way to catch the failure where a shape is painted but still hittable as a box.
 */
test.beforeAll(isolatedStackOnly)

test('a shaped zone is hittable only inside its outline', async ({ page }) => {
  const fx = localShapes()
  await page.addInitScript(() => localStorage.setItem('asasera.language', 'en'))
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto(`/learn/${fx.assignmentId}#${fx.accessToken}`)

  const name = page.getByRole('textbox', { name: 'Your name' })
  await expect(name).toBeVisible({ timeout: 20_000 })
  await name.fill('Shape Tester')
  await page.getByRole('button', { name: 'Start', exact: true }).click()

  const circle = page.getByRole('button', { name: 'Zone 2' })
  await expect(circle).toBeVisible({ timeout: 20_000 })
  expect(await circle.evaluate((el) => getComputedStyle(el).clipPath)).toContain('ellipse')

  const box = (await circle.boundingBox())!
  /* Resolve to the nearest button: the label sits inside the target, so what
     matters is which target receives the tap, not which text node is on top. */
  const probe = ([x, y]: [number, number]) => {
    const element = document.elementFromPoint(x, y) as HTMLElement | null
    return element?.closest('button')?.getAttribute('aria-label') ?? element?.tagName ?? 'none'
  }
  const centre = await page.evaluate(probe, [box.x + box.width / 2, box.y + box.height / 2] as [number, number])
  const corner = await page.evaluate(probe, [box.x + box.width * 0.03, box.y + box.height * 0.03] as [number, number])
  expect(centre).toBe('Zone 2')
  expect(corner).not.toBe('Zone 2')

  expect(await page.getByRole('button', { name: 'Zone 3' }).evaluate((el) => getComputedStyle(el).clipPath)).toContain('polygon')
  /* The rectangle carries no clip path at all, so nothing changed for every
     zone drawn before shapes existed. */
  expect(await page.getByRole('button', { name: 'Zone 1' }).evaluate((el) => getComputedStyle(el).clipPath)).toBe('none')
})

test('the stored shapes are drawn in the image workspace and survive a reload', async ({ page }) => {
  const fx = localShapes()
  const login = await page.request.post('/api/v1/auth/login', { data: { email: fx.email, password: fx.password } })
  expect(login.ok()).toBe(true)
  const { accessToken } = await login.json()
  await page.addInitScript(() => localStorage.setItem('asasera.language', 'en'))
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto(`/teacher/activities/${fx.activityId}`)

  /* The image workspace draws the stored shapes. Asserted through the outline
     elements rather than a particular control, because the surface a teacher
     draws on is being rebuilt: what must not regress is that a circle is drawn
     as an ellipse and a polygon as a polygon, whichever editor is on screen. */
  const board = page.locator('[class*="zoneEditor"] svg, [class*="board"] svg, [class*="workbench"] svg').first()
  await expect(board).toBeVisible({ timeout: 25_000 })
  await expect(board.locator('ellipse')).toHaveCount(1)
  await expect(board.locator('polygon')).toHaveCount(1)

  const after = await page.request.get(`/api/v1/activities/${fx.activityId}`, { headers: { authorization: `Bearer ${accessToken}` } })
  expect(after.ok()).toBe(true)
  const zones = (await after.json()).questions[0].payload.zones as { key: string; shape?: string }[]
  expect(zones.find((z) => z.key === 'round')?.shape).toBe('circle')
  expect(zones.find((z) => z.key === 'hex')?.shape).toBe('hexagon')
})

test('the pin-answer tools draw only a box or a circle, and a hexagon is still reachable per area', async ({ page }) => {
  const fx = localShapes()
  const login = await page.request.post('/api/v1/auth/login', { data: { email: fx.email, password: fx.password } })
  expect(login.ok()).toBe(true)
  const { accessToken } = await login.json()
  const zones = async () => {
    const response = await page.request.get(`/api/v1/activities/${fx.activityId}`, { headers: { authorization: `Bearer ${accessToken}` } })
    return (await response.json()).questions[0].payload.zones as { key: string; shape?: string }[]
  }

  await page.addInitScript(() => localStorage.setItem('asasera.language', 'en'))
  await page.setViewportSize({ width: 1600, height: 1000 })
  await page.goto(`/teacher/activities/${fx.activityId}`)
  await expect(page.getByRole('button', { name: 'Circle', exact: true })).toBeVisible({ timeout: 25_000 })

  /* Deliberate: drawing offers a box and a circle only. A hexagon is a choice
     made per area, not a fourth drawing tool. */
  await expect(page.getByRole('button', { name: 'Hexagon', exact: true })).toHaveCount(0)

  // Drawing still produces a box, and the shape can then be changed per area.
  const stage = page.locator('[class*="imageStage"]').first()
  const box = (await stage.boundingBox())!
  const before = (await zones()).length
  await page.getByRole('button', { name: 'Box', exact: true }).click()
  await page.mouse.move(box.x + box.width * 0.70, box.y + box.height * 0.62)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width * 0.88, box.y + box.height * 0.86, { steps: 8 })
  await page.mouse.up()
  await expect.poll(async () => (await zones()).length, { timeout: 15_000 }).toBe(before + 1)
  expect((await zones()).at(-1)?.shape).toBe('rect')

  await page.getByText('Shape and precise position').click()
  const shape = page.getByLabel('Shape', { exact: true })
  await expect(shape).toBeVisible()
  await shape.click()
  await page.getByRole('option', { name: 'Hexagon' }).click()
  await expect.poll(async () => (await zones()).at(-1)?.shape, { timeout: 15_000 }).toBe('hexagon')
})
