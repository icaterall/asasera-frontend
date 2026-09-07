import {localTeacher} from './local-fixture'
import { expect, test, type Page } from '@playwright/test'

/**
 * W03 acceptance, in a browser — §16 p26:
 *   «معلّم يؤلّف نشاطًا من خمسة أسئلة وينشره دون فتح لوحة الخصائص.»
 *   A teacher authors a five-question activity and publishes it WITHOUT
 *   opening the properties panel.
 *
 * The "without" is the point, so this test never touches region 4. If a
 * default is missing, the publish at the end fails and the test says so.
 *
 * Needs the dev API on 4100 and vite on 5199 (see CHECKPOINT.md).
 */

/*
 * Auth goes through THE PAGE'S OWN ORIGIN, not the API's.
 *
 * The refresh token is an httpOnly cookie (§19). A cookie set by a request to
 * 127.0.0.1:4100 is not sent by a page on 127.0.0.1:5199, so signing in
 * against the API directly leaves the app signed out and the guard bounces to
 * /login. Vite proxies /api/v1 for exactly this reason — the note in
 * vite.config.ts says so — and going through the proxy means the browser holds
 * the same cookie the real app would, and boots via the same silent refresh.
 *
 * Nothing here fakes a session.
 */
const API = '/api/v1'

async function signInAsNewTeacher(page: Page) {
  const {email,password}=localTeacher()

  const login = await page.request.post(`${API}/auth/login`, { data: { email, password } })
  expect(login.ok(), `login failed: ${login.status()}`).toBeTruthy()
  const { accessToken } = await login.json()
  return { email, accessToken }
}

/** Creates the activity over the API — this test is about the EDITOR. */
async function createActivity(page: Page, accessToken: string) {
  const res = await page.request.post(`${API}/activities`, {
    headers: { authorization: `Bearer ${accessToken}` },
    data: { title: 'عواصم أوروبا', subjectId: 9, levelId: 8, purposeId: 2 },
  })
  expect(res.ok(), `create failed: ${res.status()} ${await res.text()}`).toBeTruthy()
  return (await res.json()).activity.id as number
}

test.describe('the four-region editor', () => {
  test('a teacher authors and publishes five questions without opening the properties panel', async ({ page }) => {
    const { accessToken } = await signInAsNewTeacher(page)
    const activityId = await createActivity(page, accessToken)



    await page.goto(`/teacher/activities/${activityId}`)
    await expect(page.getByLabel('عنوان النشاط')).toHaveValue('عواصم أوروبا', { timeout: 15_000 })

    const QUESTIONS = [
      { prompt: 'ما عاصمة فرنسا؟', answers: ['باريس', 'لندن', 'برلين', 'مدريد'] },
      { prompt: 'ما عاصمة إيطاليا؟', answers: ['روما', 'ميلانو', 'نابولي', 'تورينو'] },
      { prompt: 'ما عاصمة إسبانيا؟', answers: ['مدريد', 'برشلونة', 'إشبيلية', 'فالنسيا'] },
      { prompt: 'ما عاصمة ألمانيا؟', answers: ['برلين', 'ميونخ', 'هامبورغ', 'كولونيا'] },
      { prompt: 'ما عاصمة البرتغال؟', answers: ['لشبونة', 'بورتو', 'براغا', 'فارو'] },
    ]

    /* The thumbnails only — the rail also holds Add and Generate. */
    const thumbs = page.locator('[data-question-thumb]')

    for (const [index, question] of QUESTIONS.entries()) {
      await page.getByRole('button', { name: 'أضف سؤالًا' }).first().click()

      /*
       * Wait for the new question to BE the active one before typing.
       *
       * Clicking Add is a round trip; without this the next `fill` can land in
       * the previous question's textarea, and the test then reports a data-loss
       * bug the product does not have. Asserting the rail count and the empty
       * prompt is what "the new question is ready" actually means.
       */
      await expect(thumbs).toHaveCount(index + 1)
      await expect(page.getByLabel('نص السؤال')).toHaveValue('')

      await page.getByLabel('نص السؤال').fill(question.prompt)

      const slots = ['مثلث', 'معيّن', 'دائرة', 'مربع']
      for (const [slot, answer] of question.answers.entries()) {
        await page.getByLabel(`نص الخيار ${slots[slot]}`).fill(answer)
      }

      /* The first option is correct by default, so the three others need a
         reason. Nothing here opens region 4. */
      for (const slot of [1, 2, 3]) {
        await page.locator(`#reason-opt_${'abcd'[slot]}`).fill(`خطأ شائع في السؤال ${index + 1}`)
      }
    }

    /*
     * The acceptance criterion, stated precisely.
     *
     * §12 asks for four FIXED regions, so on a desktop the properties rail is
     * visible by design — "without opening it" cannot mean "hidden". What it
     * means is that the teacher never had to go there: nothing above touched
     * region 4, and every default it holds is still the default.
     *
     * Asserted on the server's own rows further down: five questions, all
     * `mcq`, all 20 seconds, none of it ever supplied by this test.
     */
    const propertiesRail = page.getByLabel('خصائص السؤال')
    await expect(propertiesRail.getByLabel('نوع السؤال',{exact:true})).toHaveValue('mcq')
    await expect(propertiesRail.getByLabel('مدة السؤال بالثواني')).toHaveValue('20')

    await page.getByRole('button', { name: 'انشر' }).click()

    await expect(page.getByRole('button', { name: 'إعادة النشر' })).toBeVisible({ timeout: 15_000 })
    await expect(page.getByRole('alert')).toHaveCount(0)

    /* And the server agrees — five questions, published, version 1. */
    const check = await page.request.get(`${API}/activities/${activityId}`, {
      headers: { authorization: `Bearer ${accessToken}` },
    })
    const body = await check.json()
    expect(body.questions).toHaveLength(5)
    expect(body.activity.visibility).toBe('published')
    expect(body.questions.every((q: { timeLimitS: number }) => q.timeLimitS === 20)).toBeTruthy()
  })

  test('publishing without a reason is refused and the editor points at the option', async ({ page }) => {
    const { accessToken } = await signInAsNewTeacher(page)
    const activityId = await createActivity(page, accessToken)

    await page.goto(`/teacher/activities/${activityId}`)
    await expect(page.getByLabel('عنوان النشاط')).toBeVisible({ timeout: 15_000 })

    await page.getByRole('button', { name: 'أضف سؤالًا' }).first().click()
    await page.getByLabel('نص السؤال').fill('ما عاصمة فرنسا؟')
    await page.getByLabel('نص الخيار مثلث').fill('باريس')
    await page.getByLabel('نص الخيار معيّن').fill('لندن')
    await page.getByLabel('نص الخيار دائرة').fill('برلين')
    await page.getByLabel('نص الخيار مربع').fill('مدريد')
    // Two of the three distractors get a reason; the square deliberately does not.
    await page.locator('#reason-opt_b').fill('يخلط بين لندن وباريس')
    await page.locator('#reason-opt_c').fill('يخلط بين برلين وباريس')

    await page.getByRole('button', { name: 'انشر' }).click()

    const alert = page.getByRole('alert').first()
    await expect(alert).toBeVisible({ timeout: 15_000 })
    // The message names the exact option, not just "incomplete".
    await expect(alert).toContainText('opt_d')

    // Still a draft.
    await expect(page.getByRole('button', { name: 'انشر' })).toBeVisible()
  })

  test('the save indicator reaches "saved" only after the server confirms', async ({ page }) => {
    const { accessToken } = await signInAsNewTeacher(page)
    const activityId = await createActivity(page, accessToken)

    /*
     * Slow the question save down so the intermediate state is observable.
     * A fixed delay rather than a manual gate: the gate had to guess which
     * request to hold, and holding the wrong one produced a failure that read
     * like a missing indicator.
     */
    await page.route('**/api/v1/activities/questions/*', async (route) => {
      if (route.request().method() === 'PATCH') await new Promise((r) => setTimeout(r, 2500))
      await route.continue()
    })

    await page.goto(`/teacher/activities/${activityId}`)
    await expect(page.getByLabel('عنوان النشاط')).toBeVisible({ timeout: 15_000 })
    await page.getByRole('button', { name: 'أضف سؤالًا' }).first().click()
    await expect(page.locator('[data-question-thumb]')).toHaveCount(1)

    await page.getByLabel('نص السؤال').fill('سؤال')

    // In flight: NOT "saved" yet. That is the whole rule (§12).
    await expect(page.getByText('جارٍ الحفظ…')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText('محفوظ', { exact: true })).toHaveCount(0)

    // Confirmed by the server: only now.
    await expect(page.getByText('محفوظ', { exact: true })).toBeVisible({ timeout: 15_000 })
  })

  test('a failed save keeps the edit and offers a retry', async ({ page }) => {
    const { accessToken } = await signInAsNewTeacher(page)
    const activityId = await createActivity(page, accessToken)

    let failNext = false
    await page.route('**/api/v1/activities/questions/*', async (route) => {
      if (route.request().method() === 'PATCH' && failNext) {
        failNext = false
        await route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":{"code":"upstream","message":"nope"}}' })
        return
      }
      await route.continue()
    })

    await page.goto(`/teacher/activities/${activityId}`)
    await expect(page.getByLabel('عنوان النشاط')).toBeVisible({ timeout: 15_000 })
    await page.getByRole('button', { name: 'أضف سؤالًا' }).first().click()
    await expect(page.locator('[data-question-thumb]')).toHaveCount(1)

    failNext = true
    await page.getByLabel('نص السؤال').fill('نص لا يجب أن يُفقد')

    await expect(page.getByText('تعذّر الحفظ — تعديلك لم يُفقد')).toBeVisible({ timeout: 15_000 })
    // The edit is still on screen — a failure must not roll the editor back.
    await expect(page.getByLabel('نص السؤال')).toHaveValue('نص لا يجب أن يُفقد')

    await page.getByRole('button', { name: 'أعد المحاولة' }).click()
    await expect(page.getByText('محفوظ', { exact: true })).toBeVisible({ timeout: 15_000 })

    // And the server really has it.
    const check = await page.request.get(`/api/v1/activities/${activityId}`, {
      headers: { authorization: `Bearer ${accessToken}` },
    })
    expect((await check.json()).questions[0].prompt).toBe('نص لا يجب أن يُفقد')
  })
})
