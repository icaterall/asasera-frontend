import {execFileSync} from 'node:child_process'
import {randomUUID} from 'node:crypto'
import {readFileSync,unlinkSync} from 'node:fs'
import path from 'node:path'
import {localTeacher} from './local-fixture'
import { expect, test, type Page } from '@playwright/test'

/**
 * W03 acceptance, in a browser — §16 p26:
 *   «معلّم يؤلّف نشاطًا من خمسة أسئلة وينشره دون فتح لوحة الخصائص.»
 *   A teacher authors a five-question activity and approves it WITHOUT
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

      for (const [slot, answer] of question.answers.entries()) {
        await page.getByLabel(`نص الإجابة ${slot + 1}`).fill(answer)
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
    /* The type control is the design-system Select (a combobox), which exposes its value as data-select-value. */
    await expect(propertiesRail.getByLabel('نوع السؤال',{exact:true}).first()).toHaveAttribute('data-question-kind','mcq')
    await expect(propertiesRail.getByLabel('مدة السؤال بالثواني')).toHaveValue('20')

    await page.getByRole('button', { name: 'اعتماد النسخة' }).click()

    await expect(page.getByRole('button', { name: 'اعتماد التغييرات' })).toBeVisible({ timeout: 15_000 })
    await expect(page.getByRole('button', { name: 'ابدأ حصة مباشرة' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'كلّف كواجب' })).toBeVisible()
    await expect(page.getByRole('alert')).toHaveCount(0)

    /* And the server agrees — five questions, an approved version, still private (v5 §18). */
    const check = await page.request.get(`${API}/activities/${activityId}`, {
      headers: { authorization: `Bearer ${accessToken}` },
    })
    const body = await check.json()
    expect(body.questions).toHaveLength(5)
    expect(body.activity.currentVersionId).not.toBeNull()
    expect(body.activity.visibility).toBe('private')
    expect(body.questions.every((q: { timeLimitS: number }) => q.timeLimitS === 20)).toBeTruthy()
  })

  test('a blank answer is refused and the editor points at the option', async ({ page }) => {
    const { accessToken } = await signInAsNewTeacher(page)
    const activityId = await createActivity(page, accessToken)

    await page.goto(`/teacher/activities/${activityId}`)
    await expect(page.getByLabel('عنوان النشاط')).toBeVisible({ timeout: 15_000 })

    await page.getByRole('button', { name: 'أضف سؤالًا' }).first().click()
    await page.getByLabel('نص السؤال').fill('ما عاصمة فرنسا؟')
    await page.getByLabel('نص الإجابة 1').fill('باريس')
    await page.getByLabel('نص الإجابة 2').fill('لندن')
    await page.getByLabel('نص الإجابة 3').fill('برلين')
    // The fourth answer is deliberately empty.
    await expect(page.getByLabel('نص الإجابة 4')).toHaveValue('')

    await page.getByRole('button', { name: 'اعتماد النسخة' }).click()

    const alert = page.getByRole('alert').first()
    await expect(alert).toBeVisible({ timeout: 15_000 })
    // The message names the exact option, not just "incomplete".
    await expect(alert).toContainText('opt_d')

    // Still a draft.
    await expect(page.getByRole('button', { name: 'اعتماد النسخة' })).toBeVisible()
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

/* ---- v5.1 C4: the per-question source chip ------------------------------ */

type CitedQuestion = { id: number; revisionId?: number; segments?: number[]; title?: string }
type ProvenanceFixture = {
  email: string; password: string; activityId: number
  questions: { pdf: CitedQuestion; pptx: CitedQuestion; docx: CitedQuestion; topic: CitedQuestion; manual: CitedQuestion; unavailable: CitedQuestion }
}

/**
 * Seeds a teacher whose activity carries one question per kind of citation:
 * a PDF's pages, a PPTX slide, a DOCX section, a topic, a hand-written
 * question, and one whose material was deleted after the citation was made.
 *
 * Seeded through the backend's own script — same shape as `local-fixture.ts`,
 * kept here because this scenario needs the materials as well as the account.
 */
function seedProvenance(): ProvenanceFixture {
  const file = `/tmp/asasera-browser-${randomUUID()}.json`
  const backend = path.resolve(import.meta.dirname, '../../asasera-backend')
  try {
    execFileSync(process.execPath, ['--disable-warning=ExperimentalWarning', 'scripts/v4/seed-provenance-browser.ts', file], {
      cwd: backend,
      env: { ...process.env, NODE_ENV: 'test', PG_HOST: '127.0.0.1', PG_PORT: '55432', PG_DATABASE: process.env.E2E_PG_DATABASE ?? 'asasera', PG_USER: 'postgres', PG_PASSWORD: 'postgres', PG_SSL: 'disable' },
      stdio: 'pipe',
    })
    return JSON.parse(readFileSync(file, 'utf8'))
  } finally { try { unlinkSync(file) } catch { /* the script may have failed before writing */ } }
}

async function signIn(page: Page, email: string, password: string) {
  const login = await page.request.post(`${API}/auth/login`, { data: { email, password } })
  expect(login.ok(), `login failed: ${login.status()} ${await login.text()}`).toBeTruthy()
  return (await login.json()).accessToken as string
}

test.describe('a question says where it came from', () => {
  /* The rail order is the seeding order: PDF, PPTX, DOCX, topic, manual, deleted. */
  const ORDER = ['pdf', 'pptx', 'docx', 'topic', 'manual', 'unavailable'] as const
  const chip = (page: Page) => page.locator('[data-source-chip]')
  const select = async (page: Page, kind: (typeof ORDER)[number]) => {
    await page.locator('[data-question-thumb]').nth(ORDER.indexOf(kind)).click()
  }

  test('each citation is labelled in the vocabulary its source actually has', async ({ page }) => {
    const fixture = seedProvenance()
    await signIn(page, fixture.email, fixture.password)

    await page.goto(`/teacher/activities/${fixture.activityId}`)
    await expect(page.locator('[data-question-thumb]')).toHaveCount(6, { timeout: 15_000 })

    /* A PDF cites pages, and both cited pages are named. */
    await select(page, 'pdf')
    await expect(chip(page)).toHaveAttribute('data-source-chip', 'file', { timeout: 15_000 })
    await expect(chip(page)).toContainText('صفحة 1، 2')
    await expect(chip(page)).toContainText(fixture.questions.pdf.title!)
    /* A real button, named for a screen reader, and reachable from the keyboard. */
    await expect(chip(page)).toHaveRole('button')
    await expect(chip(page)).toHaveAttribute('aria-label', new RegExp(`^المصدر: صفحة 1، 2`))
    await chip(page).focus()
    await expect(chip(page)).toBeFocused()

    /* A presentation cites slides. */
    await select(page, 'pptx')
    await expect(chip(page)).toContainText('شريحة 2', { timeout: 15_000 })
    await expect(chip(page)).toContainText('Water cycle')

    /*
     * A DOCX has no genuine pagination, so its citation is a SECTION. This is
     * the assertion the whole locator vocabulary exists for: calling a Word
     * document's block "page 3" would be a number the teacher cannot find.
     */
    await select(page, 'docx')
    await expect(chip(page)).toContainText('مقطع', { timeout: 15_000 })
    await expect(chip(page)).not.toContainText('صفحة')

    /* No file behind it — a topic, not a citation. */
    await select(page, 'topic')
    await expect(chip(page)).toHaveAttribute('data-source-chip', 'topic', { timeout: 15_000 })
    await expect(chip(page)).toContainText('موضوع')

    /* Nothing recorded at all: written by hand. A hand-written question says
       nothing rather than wearing a label that names no source and opens
       nothing — so the absence of a chip is the assertion. */
    await select(page, 'manual')
    await expect(chip(page)).toHaveCount(0, { timeout: 15_000 })

    /* The material is gone; the citation stays, and says so honestly. */
    await select(page, 'unavailable')
    await expect(chip(page)).toHaveAttribute('data-source-chip', 'unavailable', { timeout: 15_000 })
    await expect(chip(page)).toContainText('المصدر غير متاح')

    /* Nowhere does the editor claim the question was CHECKED against its source. */
    await expect(page.getByText(/AI verified|تحقّق الذكاء|مُتحقَّق/)).toHaveCount(0)
  })

  test('the chip opens the cited page, and the citation survives a reload, an edit and approval', async ({ page }) => {
    const fixture = seedProvenance()
    const accessToken = await signIn(page, fixture.email, fixture.password)

    /* What the server says pages 1 and 2 of that PDF hold — the panel must show THAT text. */
    const segments = await page.request.get(`${API}/teaching/revisions/${fixture.questions.pdf.revisionId}/segments`, {
      headers: { authorization: `Bearer ${accessToken}` },
    })
    expect(segments.ok(), `segments: ${segments.status()}`).toBeTruthy()
    const cited: { segmentIndex: number; text: string }[] = (await segments.json()).segments
      .filter((s: { segmentIndex: number }) => fixture.questions.pdf.segments!.includes(s.segmentIndex))
    expect(cited.length).toBe(2)

    await page.goto(`/teacher/activities/${fixture.activityId}`)
    await expect(page.locator('[data-question-thumb]')).toHaveCount(6, { timeout: 15_000 })
    await select(page, 'pdf')
    await expect(chip(page)).toContainText('صفحة 1، 2', { timeout: 15_000 })

    /* Closed until asked. */
    await expect(page.locator('[data-source-panel]')).toHaveCount(0)
    await expect(chip(page)).toHaveAttribute('aria-expanded', 'false')

    await chip(page).click()
    const panel = page.locator('[data-source-panel]')
    await expect(panel).toBeVisible({ timeout: 15_000 })
    await expect(chip(page)).toHaveAttribute('aria-expanded', 'true')
    /* The right pages, named, with the text the server holds for them. */
    await expect(panel).toContainText('صفحة 1')
    await expect(panel).toContainText('صفحة 2')
    for (const segment of cited) {
      const sample = segment.text.trim().split(/\s+/).slice(0, 6).join(' ')
      if (sample.length > 8) await expect(panel).toContainText(sample)
    }
    /* And it says what a citation is — origin, never a verdict on the answer. */
    await expect(panel).toContainText('تسجّل الإشارة أصل السؤال فقط')

    /* Closing returns focus to the chip, so the keyboard is never stranded. */
    await panel.getByRole('button', { name: 'أغلق المصدر' }).click()
    await expect(panel).toHaveCount(0)
    await expect(chip(page)).toBeFocused()

    /* Reload: the citation is stored, not a rendering accident. */
    await page.reload()
    await expect(page.locator('[data-question-thumb]')).toHaveCount(6, { timeout: 15_000 })
    await select(page, 'pdf')
    await expect(chip(page)).toContainText('صفحة 1، 2', { timeout: 15_000 })

    /* Editing the question does not erase where it came from. */
    await page.getByLabel('نص السؤال').fill('ما الغاز الذي يمتصه النبات أثناء البناء الضوئي؟ (مُراجَع)')
    await expect(page.getByText('محفوظ', { exact: true })).toBeVisible({ timeout: 15_000 })
    await expect(chip(page)).toContainText('صفحة 1، 2')

    /* Nor does approving the activity. */
    await page.getByRole('button', { name: 'اعتماد النسخة' }).click()
    await expect(page.getByRole('button', { name: 'اعتماد التغييرات' })).toBeVisible({ timeout: 20_000 })
    await expect(chip(page)).toContainText('صفحة 1، 2')

    /* The server agrees the citation is still attached to the edited question. */
    const check = await page.request.get(`${API}/activities/${fixture.activityId}`, { headers: { authorization: `Bearer ${accessToken}` } })
    const question = (await check.json()).questions.find((q: { id: number }) => q.id === fixture.questions.pdf.id)
    expect(question.provenance).toEqual({ origin: 'file', materialRevisionId: fixture.questions.pdf.revisionId, segmentIndexes: [1, 2] })
  })
})
