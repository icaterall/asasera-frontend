import { test, expect } from '@playwright/test'
test.use({ trace: 'off' })

for (const language of ['en', 'ar'] as const) for (const outcome of ['alternative', 'wrong'] as const) {
  test(`cloze retains exact ${outcome} response and separate feedback after reload ${language}`, async ({ page, request, browser }) => {
    expect(new URL(process.env.PW_BASE_URL ?? 'http://127.0.0.1:5411').hostname).toMatch(/^(127\.0\.0\.1|localhost)$/)
    const ar = language === 'ar', email = `retained-${crypto.randomUUID()}@example.com`, password = `Synthetic-${crypto.randomUUID()}!`
    expect((await request.post('/api/v1/auth/register/teacher', { data: { name: 'Synthetic retention instructor', email, password } })).ok()).toBe(true)
    const login = await request.post('/api/v1/auth/login', { data: { email, password } }); expect(login.ok()).toBe(true)
    const headers = { Authorization: `Bearer ${(await login.json()).accessToken}` }
    const create = await request.post('/api/v1/activities', { headers, data: { title: ar ? 'حفظ الإجابة الأصلية' : 'Retain the original response', subjectId: 1, levelId: 8, purposeId: 2 } })
    expect(create.ok()).toBe(true); const { activity } = await create.json()
    const reference = ar ? 'الصباح' : 'morning', alternative = ar ? 'النَّهار' : 'daytime', entered = ` ${outcome === 'alternative' ? alternative : ar ? 'المَساء' : 'evening'} `
    const added = await request.post(`/api/v1/activities/${activity.id}/questions`, { headers, data: { kind: 'cloze', prompt: ar ? 'أكمل بالكلمة المناسبة.' : 'Complete with a suitable word.', payload: { schemaVersion: 1, policy: { version: 1, language, diacritics: 'preserve', tatweel: 'preserve', case: 'preserve', spaces: 'preserve' }, trimBoundaryWhitespace: true, segments: [{ kind: 'text', text: ar ? 'نبدأ الدراسة في ' : 'We begin studying in the ' }, { kind: 'blank', blankId: 'time' }], blanks: [{ id: 'time', acceptedAnswers: [reference, alternative] }] } } })
    expect(added.ok()).toBe(true)
    expect((await request.post(`/api/v1/activities/${activity.id}/publish`, { headers })).ok()).toBe(true)
    await page.context().addCookies((await request.storageState()).cookies)
    await page.addInitScript(lang => localStorage.setItem('asasera.language', lang), language)
    await page.goto(`/teacher/activities/${activity.id}/play?mode=study`)
    await page.getByRole('radio', { name: new RegExp(`^${ar ? 'إكمال الجملة' : 'Complete the sentence'}`) }).check()
    await page.getByRole('button', { name: ar ? 'أنشئ رابط المشاركة' : 'Create assignment link' }).click()
    const link = await page.getByRole('textbox', { name: ar ? 'رابط النشاط' : 'Assignment link' }).inputValue()
    const context = await browser.newContext({ viewport: ar ? { width: 390, height: 844 } : { width: 1440, height: 900 } })
    await context.addInitScript(lang => localStorage.setItem('asasera.language', lang), language)
    try {
      const learner = await context.newPage(), errors: string[] = []; learner.on('pageerror', error => errors.push(error.message))
      await learner.goto(link)
      await learner.getByRole('textbox', { name: ar ? 'اسمك' : 'Your name' }).fill(ar ? 'متعلم تجريبي' : 'Synthetic learner')
      await learner.getByRole('button', { name: ar ? 'ابدأ' : 'Start', exact: true }).click()
      await learner.getByRole('button', { name: ar ? 'ابدأ الجولة' : 'Start round' }).click()
      await learner.getByRole('textbox', { name: ar ? 'الفراغ 1' : 'Blank 1', exact: true }).fill(entered)
      const saving = learner.waitForResponse(response => response.request().method() === 'POST' && response.url().endsWith('/answer'))
      await learner.getByRole('button', { name: ar ? 'إرسال الإجابة' : 'Submit answer', exact: true }).click()
      const response = await saving; expect(response.ok()).toBe(true)
      const saved = await response.json(); expect(saved.reveal.wasCorrect).toBe(outcome === 'alternative')
      expect(Object.values(saved.submittedAnswer.values)).toEqual([entered])
      await learner.reload()
      const own = learner.getByRole('group', { name: ar ? 'إجابتك المرسلة' : 'Your submitted answer' })
      await expect(own.getByRole('textbox')).toHaveValue(entered)
      await learner.getByText(ar ? 'إجابة مرجعية' : 'Reference answer', { exact: true }).click()
      const model = learner.getByRole('group', { name: ar ? 'إجابة مرجعية' : 'Reference answer' })
      await expect(model.getByRole('textbox')).toHaveValue(reference)
      await expect(own.getByRole('textbox')).toHaveValue(entered)
      await learner.evaluate(async () => { await document.fonts.ready; window.scrollTo({ top: 0, behavior: 'instant' }) })
      expect(await learner.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      await learner.screenshot({ path: `.impeccable/review/retained-cloze-${language}-${outcome}.png`, fullPage: true })
      await learner.getByRole('button', { name: ar ? 'إنهاء الجولة' : 'Finish round' }).click()
      await expect(learner.getByRole('heading', { name: ar ? 'اكتملت الجولة' : 'Round complete', exact: true })).toBeVisible()
      const reviews = learner.getByRole('group', { name: ar ? 'إجابتك المرسلة' : 'Your submitted answer' })
      await expect(reviews.getByRole('textbox')).toHaveValue(entered)
      expect(errors).toEqual([])
    } finally { await context.close() }
  })
}
