import { expect, test, type Page } from '@playwright/test'
import { demoQuestionBank } from '../src/pages/Landing/demo-question-bank'
import { DEMO_HISTORY_KEY } from '../src/pages/Landing/demo-quiz'

async function currentQuestion(page: Page) {
  const id = await page.locator('#demo').getAttribute('data-question-id')
  const question = demoQuestionBank.find(question => question.id === id)
  if (!question) throw new Error('Unknown visible demo question')
  return question
}

async function chooseAnswer(page: Page, correct = true) {
  const question = await currentQuestion(page)
  const index = correct ? question.correct : (question.correct + 1) % 4
  await page.locator('#demo').getByRole('button', { name: question.en.answers[index], exact: true }).click()
  return question
}

// Exercise the public page without creating accounts, classrooms, or sending email.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('asasera.language', 'en')
    localStorage.setItem('i18nextLng', 'en')
    localStorage.setItem('asasera.theme', 'light')
  })
  await page.route('**/api/v1/auth/refresh', route => route.fulfill({ status: 401, json: { error: { code: 'unauthorized' } } }))
})

test('the photo quiz gives feedback, locks answers, scores and starts a fresh round by keyboard', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Upload what you teach.')
  await expect(page.getByRole('link', { name: 'Create a quiz from your lesson' }).first()).toHaveAttribute('href', '/signup/teacher')
  const quiz = page.locator('#demo')
  await page.getByRole('button', { name: 'Try a quick quiz' }).click()
  await expect(quiz.getByRole('heading')).toBeFocused()
  const first = await currentQuestion(page)
  const firstIds = [first.id]
  const wrong = first.en.answers[(first.correct + 1) % 4]
  const correctSlot = await quiz.getByRole('button', { name: first.en.answers[first.correct], exact: true }).getAttribute('data-answer')
  const wrongSlot = await quiz.getByRole('button', { name: wrong, exact: true }).getAttribute('data-answer')
  await quiz.getByRole('button', { name: wrong, exact: true }).focus()
  await page.keyboard.press('Enter')
  await expect(quiz).toContainText(`Correct answer: ${first.en.answers[first.correct]}.`)
  const correctButton = quiz.locator(`button[data-answer="${correctSlot}"]`)
  await expect(correctButton).toBeDisabled()
  await correctButton.dispatchEvent('click')
  await expect(quiz.locator(`button[data-answer="${wrongSlot}"]`)).toHaveAttribute('aria-pressed', 'true')
  await quiz.getByRole('button', { name: 'Next question' }).click()
  await expect(quiz.getByRole('heading')).toBeFocused()
  firstIds.push((await chooseAnswer(page)).id)
  await expect(quiz).toContainText('You’ve got it!')
  await quiz.getByRole('button', { name: 'Next question' }).click()
  firstIds.push((await chooseAnswer(page)).id)
  await quiz.getByRole('button', { name: 'See my result' }).click()
  await expect(quiz.getByRole('heading')).toBeFocused()
  await expect(quiz.locator('[aria-label="Your demo score: 2 of 3"]')).toBeVisible()
  await quiz.getByRole('button', { name: 'Try another round' }).click()
  await expect(quiz.getByRole('heading')).toBeFocused()
  const secondIds: string[] = []
  for (let i = 0; i < 3; i++) {
    const question = await chooseAnswer(page)
    expect(firstIds).not.toContain(question.id)
    secondIds.push(question.id)
    await quiz.getByRole('button', { name: i === 2 ? 'See my result' : 'Next question' }).click()
  }
  await expect(quiz.locator('[aria-label="Your demo score: 3 of 3"]')).toBeVisible()
  expect(new Set(secondIds).size).toBe(3)
})

test('the workflow switches from PDF to questions to classroom and keeps real entry links', async ({ page }) => {
  await page.goto('/')
  const how = page.locator('#how')
  await expect(how.getByRole('region', { name: 'Example preview: Upload what you teach' })).toContainText('Plant life.pdf')
  await how.getByRole('button', { name: /Generate and review questions/ }).click()
  await expect(how.getByRole('region', { name: 'Example preview: Generate and review questions' })).toContainText('photosynthesis')
  await how.getByRole('button', { name: /Run it live or assign homework/ }).focus()
  await page.keyboard.press('Space')
  await expect(how.getByRole('region', { name: 'Example preview: Run it live or assign homework' })).toContainText('A7K2M9')
  await expect(how.getByRole('link', { name: 'Run your first session' })).toHaveAttribute('href', '/signup/teacher')
  await expect(how.locator('#types li')).toHaveText(['Multiple choice', 'True or false'])
  await expect(how.locator('#types')).toContainText('Also supported: ordering, drag and drop, interactive images.')
  await expect(page.getByRole('link', { name: 'Start learning', exact: true })).toHaveAttribute('href', '/signup/student')
  await page.getByRole('link', { name: 'Start teaching', exact: true }).click()
  await expect(page).toHaveURL(/\/signup\/teacher/)
  await expect(page.getByRole('heading').first()).toBeVisible()
})

test('join validates and normalizes the PIN before opening the existing /join route', async ({ page }) => {
  await page.goto('/')
  const join = page.locator('#join')
  await join.getByRole('button', { name: 'Join the session' }).click()
  await expect(join.getByRole('alert')).toContainText('Enter the PIN')
  await join.getByRole('textbox').fill('a2')
  await expect(join.getByRole('textbox')).toHaveValue('2')
  await join.getByRole('button').click()
  await expect(join.getByRole('alert')).toContainText('six digits')
  // Arabic-Indic digits from an Arabic keyboard normalise to the same PIN.
  await join.getByRole('textbox').fill('١٢٣٤٥٦')
  await expect(join.getByRole('textbox')).toHaveValue('123456')
  await join.getByRole('textbox').fill('12-34 56 78')
  await expect(join.getByRole('textbox')).toHaveValue('123456')
  await page.route('**/api/**', route => route.fulfill({ status: 404, json: { error: { code: 'not_found' } } }))
  await join.getByRole('button').click()
  await expect(page).toHaveURL(/\/join\?pin=123456$/)
})

test('changing language retains quiz progress, switches direction, and keeps theme controls working', async ({ page }) => {
  await page.goto('/')
  const before = await chooseAnswer(page)
  const selectedSlot = await page.locator('#demo button[aria-pressed="true"]').getAttribute('data-answer')
  await page.locator('header nav button[lang="ar"]').click()
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  await expect(page.locator('#demo')).toContainText('أحسنت')
  await expect(page.locator('#demo')).toHaveAttribute('data-question-id', before.id)
  await expect(page.locator(`#demo button[data-answer="${selectedSlot}"]`)).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('#demo button[aria-pressed="true"]')).toContainText(before.ar.answers[before.correct])
  await page.locator('header nav button[title]').click()
  await expect(page.locator('html')).toHaveClass(/dark/)
  await expect(page.locator('#top')).toHaveCSS('background-color', 'rgb(0, 76, 204)')
})

test('pricing states the free pilot honestly and reaches the connected contact form', async ({ page }) => {
  await page.goto('/')
  const pricing = page.locator('#pricing')
  await expect(pricing.getByRole('heading', { level: 2 })).toHaveText('Free during the pilot.')
  await expect(pricing).toContainText('small trial credit')
  await expect(pricing.getByRole('link')).toHaveCount(1)
  await expect(pricing).not.toContainText(/\$|per month|per year/)
  await pricing.getByRole('link', { name: 'Talk to us' }).click()
  const form = page.getByRole('form', { name: 'Contact form' })
  await form.getByRole('button', { name: 'Send message' }).click()
  await expect(form.getByRole('textbox', { name: 'Name', exact: true })).toBeFocused()
  await form.getByRole('textbox', { name: 'Name', exact: true }).fill('Landing test')
  await form.getByRole('textbox', { name: 'Email address' }).fill('landing@example.test')
  await form.getByRole('textbox', { name: 'How can we help?' }).fill('Testing the redesigned landing form connection.')
  let payload: Record<string, string> | undefined
  await page.route('**/api/v1/contact', async route => {
    payload = route.request().postDataJSON()
    await route.fulfill({ status: 201, json: { data: { sent: true } } })
  })
  await form.getByRole('button', { name: 'Send message' }).click()
  await expect(page.getByRole('status')).toContainText('Your message has been sent')
  expect(payload?.email).toBe('landing@example.test')
})

for (const scene of [
  { name: 'desktop-en', width: 1440, height: 1000, lang: 'en', dark: false },
  { name: 'desktop-ar', width: 1440, height: 1000, lang: 'ar', dark: false },
  { name: 'mobile-en', width: 390, height: 844, lang: 'en', dark: false },
  { name: 'mobile-ar', width: 390, height: 844, lang: 'ar', dark: false },
  { name: 'desktop-dark', width: 1440, height: 1000, lang: 'en', dark: true },
  { name: 'tablet-ar', width: 768, height: 1024, lang: 'ar', dark: false },
]) {
  test(`responsive content and reduced motion: ${scene.name}`, async ({ page }) => {
    await page.setViewportSize({ width: scene.width, height: scene.height })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.addInitScript(({ lang, dark }) => {
      localStorage.setItem('asasera.language', lang)
      localStorage.setItem('i18nextLng', lang)
      localStorage.setItem('asasera.theme', dark ? 'dark' : 'light')
    }, scene)
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('/')
    await expect(page.locator('#landing-title')).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    await expect(page.locator('#demo button[data-answer]').first()).toBeVisible()
    await expect(page.locator('#demo img')).toBeVisible()
    await expect.poll(() => page.locator('#demo img').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true)
    await expect(page.locator('#pricing h2')).toBeVisible()
    await expect(page.locator('#departments form')).toBeVisible()
    const infinite = await page.evaluate(() => document.getAnimations().filter(animation => animation.effect?.getTiming().iterations === Infinity).length)
    expect(infinite).toBe(0)
    if (process.env.PW_CAPTURE_LANDING === '1') {
      await page.evaluate(() => window.scrollTo(0, 0))
      await page.screenshot({ path: `.impeccable/review/landing-photo-quiz/${scene.name}.png`, fullPage: true, animations: 'disabled' })
      if (!scene.dark) await page.screenshot({ path: `.impeccable/review/landing-photo-quiz/${scene.name}-hero.png`, animations: 'disabled' })
    }
    if (scene.width === 390) {
      await page.locator('header button[aria-controls="mobile-menu"]').click()
      await expect(page.locator('#mobile-menu')).toBeVisible()
      await page.keyboard.press('Escape')
      await expect(page.locator('#mobile-menu')).toBeHidden()
    }
    expect(errors).toEqual([])
  })
}


test('refreshes and New questions avoid the last eight rounds and only remember one StrictMode round', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#demo img')).toBeVisible()
  const initial = await page.evaluate(key => JSON.parse(localStorage.getItem(key) ?? '[]'), DEMO_HISTORY_KEY) as string[]
  expect(initial).toHaveLength(3)
  const firstId = await page.locator('#demo').getAttribute('data-question-id')
  expect(initial).toContain(firstId)
  await page.reload()
  await expect(page.locator('#demo')).toHaveAttribute('data-question-id', /.+/)
  const secondId = await page.locator('#demo').getAttribute('data-question-id')
  expect(initial).not.toContain(secondId)
  let previous = initial
  for (let i = 0; i < 10; i++) {
    const before = await page.evaluate(key => JSON.parse(localStorage.getItem(key) ?? '[]'), DEMO_HISTORY_KEY) as string[]
    await page.locator('#demo').getByRole('button', { name: 'New questions', exact: true }).click()
    await expect(page.locator('#demo h2')).toBeFocused()
    await expect(page.locator('#demo button[data-answer][aria-pressed="true"]')).toHaveCount(0)
    const after = await page.evaluate(key => JSON.parse(localStorage.getItem(key) ?? '[]'), DEMO_HISTORY_KEY) as string[]
    expect(after.length).toBeLessThanOrEqual(24)
    const fresh = after.slice(-3)
    fresh.forEach(id => expect(before).not.toContain(id))
    expect(new Set(after).size).toBe(after.length)
    previous = after
  }
  expect(previous).toHaveLength(24)
})

test('malformed or unavailable storage and a failed photo do not break play', async ({ page }) => {
  await page.addInitScript(key => localStorage.setItem(key, '{broken'), DEMO_HISTORY_KEY)
  await page.route('**/landing-quiz/*.webp', route => route.abort())
  await page.goto('/')
  await expect(page.locator('#demo')).toContainText('Photo unavailable')
  await chooseAnswer(page)
  await expect(page.locator('#demo')).toContainText('You’ve got it!')
  await page.addInitScript(() => {
    const get = Storage.prototype.getItem
    const set = Storage.prototype.setItem
    Storage.prototype.getItem = function(key) { if (key === 'asasera.demo.recent.v1') throw new Error('Storage blocked'); return get.call(this, key) }
    Storage.prototype.setItem = function(key, value) { if (key === 'asasera.demo.recent.v1') throw new Error('Storage blocked'); return set.call(this, key, value) }
  })
  await page.reload()
  const previous = (await currentQuestion(page)).id
  await page.locator('#demo').getByRole('button', { name: 'New questions', exact: true }).click()
  expect((await currentQuestion(page)).id).not.toBe(previous)
  await chooseAnswer(page)
  await expect(page.locator('#demo')).toContainText('You’ve got it!')
})
