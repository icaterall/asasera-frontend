import {localTeacher} from './local-fixture'
import { expect, test } from '@playwright/test'
import path from 'node:path'

/**
 * Evidence capture. Not an assertion suite — `design-system.spec.ts` does the
 * asserting. This exists so a human can look at what the assertions describe.
 *
 * Every file records the viewport it was actually taken at, and the viewport
 * is asserted first, so a capture can never be filed under a width it was not
 * rendered at.
 */
const OUT = path.resolve('../screenshots/v4')

const MATRIX = [
  { file: 'gallery-light-rtl-1440.png', w: 1440, h: 900, dark: false, rtl: true },
  { file: 'gallery-dark-rtl-1440.png', w: 1440, h: 900, dark: true, rtl: true },
  { file: 'gallery-light-ltr-1440.png', w: 1440, h: 900, dark: false, rtl: false },
  { file: 'gallery-dark-ltr-1440.png', w: 1440, h: 900, dark: true, rtl: false },
  { file: 'gallery-light-rtl-390.png', w: 390, h: 844, dark: false, rtl: true },
  { file: 'gallery-dark-rtl-360.png', w: 360, h: 740, dark: true, rtl: true },
]

for (const shot of MATRIX) {
  test(`capture ${shot.file}`, async ({ page }) => {
    await page.setViewportSize({ width: shot.w, height: shot.h })
    await page.goto('/__design')
    await page.waitForSelector('.asas')
    await page.evaluate(([d, r]) => {
      document.documentElement.classList.toggle('dark', d as boolean)
      document.documentElement.dir = (r as boolean) ? 'rtl' : 'ltr'
    }, [shot.dark, shot.rtl])
    await page.waitForTimeout(400)

    const actual = await page.evaluate(() => window.innerWidth)
    if (actual !== shot.w) throw new Error(`viewport is ${actual}, expected ${shot.w} — refusing to file this capture`)

    await page.screenshot({ path: path.join(OUT, shot.file), fullPage: true })
  })
}

/* The editor, authored and populated — W03 evidence. */
test('capture editor-authored-1440.png', async ({ page }) => {
  const {email,password}=localTeacher()
  const login = await page.request.post('/api/v1/auth/login', { data: { email, password } })
  const { accessToken } = await login.json()
  const created = await page.request.post('/api/v1/activities', {
    headers: { authorization: `Bearer ${accessToken}` },
    data: { title: 'عواصم أوروبا', subjectId: 9, levelId: 8, purposeId: 2 },
  })
  const id = (await created.json()).activity.id

  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(`/teacher/activities/${id}`)
  await page.getByRole('button', { name: 'أضف سؤالًا' }).first().click()
  await page.getByLabel('نص السؤال').fill('ما عاصمة فرنسا؟')
  for (const [slot, answer] of [['مثلث', 'باريس'], ['معيّن', 'لندن'], ['دائرة', 'برلين'], ['مربع', 'مدريد']]) {
    await page.getByLabel(`نص الخيار ${slot}`).fill(answer!)
  }
  await expect(page.getByText('محفوظ', { exact: true })).toBeVisible({ timeout: 15_000 })

  if (await page.evaluate(() => window.innerWidth) !== 1440) throw new Error('viewport mismatch')
  await page.evaluate(()=>{document.querySelectorAll('*').forEach(el=>{if(el instanceof HTMLElement&&el.scrollTop)el.scrollTop=0})})
  await page.screenshot({ path: path.join(OUT, 'editor-authored-1440.png') })
  for(const [w,h] of [[1920,1080],[1280,720],[390,844]]){
    await page.setViewportSize({width:w!,height:h!});await page.evaluate(()=>{scrollTo(0,0);document.querySelectorAll('*').forEach(el=>{if(el instanceof HTMLElement&&el.scrollTop)el.scrollTop=0})})
    expect(await page.evaluate(()=>innerWidth)).toBe(w);expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(w)
    await page.screenshot({path:path.join(OUT,`editor-authored-${w}.png`),animations:'disabled'})
  }

})
