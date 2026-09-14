import { test, expect, type Page } from '@playwright/test'
test.use({ trace: 'off' })

async function capture(page: Page, name: string) {
  await page.evaluate(async () => { await document.fonts.ready; window.scrollTo({ top: 0, behavior: 'instant' }) })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: `.impeccable/review/${name}.png`, fullPage: true })
}
for (const language of ['en', 'ar'] as const) for (const format of ['match-up', 'group-sort', 'sequence'] as const) {
  test(`author and approve explicit ${format} alternatives, then complete as learner ${language}`, async ({ page, request, browser }) => {
    test.setTimeout(60000)
    expect(new URL(process.env.PW_BASE_URL ?? 'http://127.0.0.1:5411').hostname).toMatch(/^(127\.0\.0\.1|localhost)$/)
    const ar = language === 'ar', sequence = format === 'sequence', groups = format === 'group-sort'
    const email = `equivalence-${crypto.randomUUID()}@example.com`, password = `Synthetic-${crypto.randomUUID()}!`
    expect((await request.post('/api/v1/auth/register/teacher', { data: { name: 'Synthetic alternatives instructor', email, password } })).ok()).toBe(true)
    const login = await request.post('/api/v1/auth/login', { data: { email, password } }); expect(login.ok()).toBe(true)
    const headers = { Authorization: `Bearer ${(await login.json()).accessToken}` }
    const created = await request.post('/api/v1/activities', { headers, data: { title: ar ? 'مراجعة البدائل المقبولة' : 'Reviewed accepted alternatives', subjectId: 1, levelId: 8, purposeId: 2 } })
    expect(created.ok()).toBe(true); const { activity } = await created.json()
    const payload = sequence ? { items: [{ key: 'a', text: '' }, { key: 'b', text: '' }, { key: 'c', text: '' }], correct: ['a', 'b', 'c'] }
      : { cards: [{ key: 'a', text: '' }, { key: 'b', text: '' }], targets: [{ key: 'x', text: '' }, { key: 'y', text: '' }], map: { a: 'x', b: 'y' } }
    const added = await request.post(`/api/v1/activities/${activity.id}/questions`, { headers, data: { kind: sequence ? 'order' : 'match', prompt: '', payload } })
    expect(added.ok(), await added.text()).toBe(true)
    await page.context().addCookies((await request.storageState()).cookies)
    await page.addInitScript(lang => localStorage.setItem('asasera.language', lang), language)
    await page.setViewportSize(ar ? { width: 390, height: 844 } : { width: 1440, height: 900 })
    const errors: string[] = []; page.on('pageerror', error => errors.push(error.message))
    await page.goto(`/teacher/activities/${activity.id}`)
    const prompt = sequence ? (ar ? 'رتب الكلمات؛ يمكن تبديل النسختين المتطابقتين.' : 'Order the words; identical copies may swap.') : (ar ? 'صنّف العناصر وفق البدائل التي راجعناها.' : 'Classify the items using the reviewed alternatives.')
    await page.getByRole('textbox', { name: ar ? 'نص السؤال' : 'Question text', exact: true }).fill(prompt)
    const words = ar ? ['جميل', 'جميل', 'جداً'] : ['very', 'very', 'good']
    const cards = ar ? ['تفاحة', 'كمثرى'] : ['Apple', 'Pear'], targets = groups ? (ar ? ['فاكهة', 'طعام'] : ['Fruit', 'Food']) : (ar ? ['فاكهة', 'فاكهة'] : ['Fruit', 'Fruit'])
    if (sequence) {
      for (let i = 0; i < words.length; i++) await page.getByRole('textbox', { name: ar ? `نص العنصر ${i + 1}` : `Item ${i + 1} text`, exact: true }).fill(words[i]!)
      await page.getByText(ar ? 'إعدادات متقدمة' : 'Advanced settings', { exact: true }).click()
      await page.getByRole('checkbox', { name: ar ? 'اقبل تبديل العناصر المتطابقة' : 'Accept swaps of identical tiles' }).check()
    } else {
      for (let i = 0; i < 2; i++) {
        await page.getByRole('textbox', { name: `${ar ? 'البطاقة' : 'Card'} ${i + 1}`, exact: true }).fill(cards[i]!)
        await page.getByRole('textbox', { name: `${ar ? 'الهدف' : 'Target'} ${i + 1}`, exact: true }).fill(targets[i]!)
      }
      await page.getByText(ar ? 'البدائل المقبولة' : 'Accepted alternatives', { exact: true }).click()
      await page.getByRole('checkbox', { name: ar ? 'اقبل النصوص المتطابقة والأهداف الإضافية' : 'Accept equivalent labels and additional targets' }).check()
      if (groups) await page.getByRole('group', { name: `${ar ? 'الأهداف المقبولة للبطاقة' : 'Accepted targets for card'} 1: ${cards[0]}` }).getByRole('checkbox', { name: targets[1], exact: true }).check()
    }
    const published = page.waitForResponse(response => response.url().endsWith(`/activities/${activity.id}/publish`))
    await page.getByRole('button', { name: ar ? 'اعتماد النسخة' : 'Approve version', exact: true }).click()
    expect((await published).status()).toBe(200)
    await page.reload()
    await page.getByText(sequence ? (ar ? 'إعدادات متقدمة' : 'Advanced settings') : (ar ? 'البدائل المقبولة' : 'Accepted alternatives'), { exact: true }).click()
    await expect(page.getByRole('checkbox', { name: sequence ? (ar ? 'اقبل تبديل العناصر المتطابقة' : 'Accept swaps of identical tiles') : (ar ? 'اقبل النصوص المتطابقة والأهداف الإضافية' : 'Accept equivalent labels and additional targets') })).toBeChecked()
    if (groups) await expect(page.getByRole('group', { name: `${ar ? 'الأهداف المقبولة للبطاقة' : 'Accepted targets for card'} 1: ${cards[0]}` }).getByRole('checkbox', { name: targets[1], exact: true })).toBeChecked()
    await page.getByText(sequence ? (ar ? 'إعدادات متقدمة' : 'Advanced settings') : (ar ? 'البدائل المقبولة' : 'Accepted alternatives'), { exact: true }).locator('..').scrollIntoViewIfNeeded()
    await capture(page, `native-equivalence-${format}-${language}-editor`)
    await page.goto(`/teacher/activities/${activity.id}/play?mode=study`)
    const names = { 'match-up': ar ? 'المطابقة' : 'Match up', 'group-sort': ar ? 'تصنيف المجموعات' : 'Group sort', sequence: ar ? 'الترتيب' : 'Sequence' }
    await page.getByRole('radio', { name: new RegExp(`^${names[format]}`) }).check()
    await page.getByRole('button', { name: ar ? 'أنشئ رابط المشاركة' : 'Create assignment link' }).click()
    const link = await page.getByRole('textbox', { name: ar ? 'رابط النشاط' : 'Assignment link' }).inputValue()
    const learner = await browser.newContext({ viewport: ar ? { width: 390, height: 844 } : { width: 1440, height: 900 } })
    await learner.addInitScript(lang => localStorage.setItem('asasera.language', lang), language)
    try {
      const learn = await learner.newPage(); learn.on('pageerror', error => errors.push(error.message))
      await learn.goto(link)
      await learn.getByRole('textbox', { name: ar ? 'اسمك' : 'Your name' }).fill(ar ? 'متعلم تجريبي' : 'Synthetic learner')
      await learn.getByRole('button', { name: ar ? 'ابدأ' : 'Start', exact: true }).click()
      const drawing = learn.waitForResponse(response => response.request().method() === 'POST' && response.url().endsWith('/presentation'))
      await learn.getByRole('button', { name: ar ? 'ابدأ الجولة' : 'Start round' }).click()
      const view = await (await drawing).json()
      await expect(learn.getByRole('heading', { name: prompt, exact: true })).toBeVisible()
      let submittedOrder: string[] = []
      if (sequence) {
        const current: string[] = view.question.payload.items.map((item: { key: string }) => item.key)
        const copies: string[] = view.question.payload.items.filter((item: { text: string }) => item.text === words[0]).map((item: { key: string }) => item.key)
        const last: string = view.question.payload.items.find((item: { text: string }) => item.text === words[2]).key
        expect(copies).toHaveLength(2)
        // Opaque learner identities must not be replaced by the author-only IDs.
        // Swap the two identical visible copies and place the distinct word last.
        submittedOrder = [...copies.reverse(), last]
        for (const [index, id] of submittedOrder.entries()) {
          let position = current.indexOf(id)
          expect(position).toBeGreaterThanOrEqual(0)
          while (position > index) {
            await learn.locator('[data-order-item]').nth(position).getByRole('button', { name: /^Move up/ }).click()
            const moved = current.splice(position, 1)[0]!; current.splice(position - 1, 0, moved); position--
          }
        }
      } else {
        await learn.getByRole('button', { name: cards[0], exact: true }).click()
        await learn.getByRole('button', { name: targets[1], exact: true }).nth(groups ? 0 : 1).click()
        await learn.getByRole('button', { name: cards[1], exact: true }).click()
        await learn.getByRole('button', { name: targets[groups ? 1 : 0], exact: true }).first().click()
        if (groups) {
          await expect(learn.getByRole('button', { name: targets[1], exact: true })).toContainText(cards[0]!)
          await expect(learn.getByRole('button', { name: targets[1], exact: true })).toContainText(cards[1]!)
        }
      }
      const saving = learn.waitForResponse(response => response.request().method() === 'POST' && response.url().endsWith('/answer'))
      await learn.getByRole('button', { name: sequence ? (ar ? 'تحقق' : 'Check') : (ar ? 'أرسل الإجابة' : 'Submit answer'), exact: true }).click()
      const response = await saving; expect(response.ok(), await response.text()).toBe(true)
      const saved = await response.json(); expect(saved.reveal.wasCorrect).toBe(true)
      if (sequence) expect(response.request().postDataJSON().answer.sequence).toEqual(submittedOrder)
      if (groups) {
        const source = view.question.payload.cards.find((card: { text: string }) => card.text === cards[0]).key
        const target = view.question.payload.targets.find((item: { text: string }) => item.text === targets[1]).key
        expect(response.request().postDataJSON().answer.pairs).toContainEqual([source, target])
      }
      await learn.reload()
      await expect(learn.getByRole('status').filter({ hasText: ar ? 'إجابة صحيحة' : 'Correct' })).toBeVisible()
      if (groups) await expect(learn.getByRole('button', { name: targets[1], exact: true })).toContainText(cards[0]!)
      await capture(learn, `native-equivalence-${format}-${language}-learner`)
      await learn.getByRole('button', { name: ar ? 'إنهاء الجولة' : 'Finish round' }).click()
      await expect(learn.getByRole('heading', { name: ar ? 'اكتملت الجولة' : 'Round complete', exact: true })).toBeVisible()
      expect(errors).toEqual([])
    } finally { await learner.close() }
  })
}
