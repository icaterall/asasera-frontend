# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: native-equivalence-authoring.spec.ts >> author and approve explicit group-sort alternatives, then complete as learner ar
- Location: e2e/native-equivalence-authoring.spec.ts:10:3

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByRole('button', { name: 'طعام', exact: true })
Expected substring: "تفاحة"
Received string:    "طعامكمثرى"
Timeout: 5000ms

Call log:
  - Expect "toContainText" getByRole('button', { name: 'طعام', exact: true }) with timeout 5000ms
  - waiting for getByRole('button', { name: 'طعام', exact: true })
    14 × locator resolved to <button disabled type="button" aria-label="طعام" class="_target_1lsp3_11 ">…</button>
       - unexpected value "طعامكمثرى"

```

```yaml
- button "طعام" [disabled]:
  - strong: طعام
  - text: كمثرى
```

# Test source

```ts
  10  |   test(`author and approve explicit ${format} alternatives, then complete as learner ${language}`, async ({ page, request, browser }) => {
  11  |     test.setTimeout(60000)
  12  |     expect(new URL(process.env.PW_BASE_URL ?? 'http://127.0.0.1:5411').hostname).toMatch(/^(127\.0\.0\.1|localhost)$/)
  13  |     const ar = language === 'ar', sequence = format === 'sequence', groups = format === 'group-sort'
  14  |     const email = `equivalence-${crypto.randomUUID()}@example.com`, password = `Synthetic-${crypto.randomUUID()}!`
  15  |     expect((await request.post('/api/v1/auth/register/teacher', { data: { name: 'Synthetic alternatives instructor', email, password } })).ok()).toBe(true)
  16  |     const login = await request.post('/api/v1/auth/login', { data: { email, password } }); expect(login.ok()).toBe(true)
  17  |     const headers = { Authorization: `Bearer ${(await login.json()).accessToken}` }
  18  |     const created = await request.post('/api/v1/activities', { headers, data: { title: ar ? 'مراجعة البدائل المقبولة' : 'Reviewed accepted alternatives', subjectId: 1, levelId: 8, purposeId: 2 } })
  19  |     expect(created.ok()).toBe(true); const { activity } = await created.json()
  20  |     const payload = sequence ? { items: [{ key: 'a', text: '' }, { key: 'b', text: '' }, { key: 'c', text: '' }], correct: ['a', 'b', 'c'] }
  21  |       : { cards: [{ key: 'a', text: '' }, { key: 'b', text: '' }], targets: [{ key: 'x', text: '' }, { key: 'y', text: '' }], map: { a: 'x', b: 'y' } }
  22  |     const added = await request.post(`/api/v1/activities/${activity.id}/questions`, { headers, data: { kind: sequence ? 'order' : 'match', prompt: '', payload } })
  23  |     expect(added.ok(), await added.text()).toBe(true)
  24  |     await page.context().addCookies((await request.storageState()).cookies)
  25  |     await page.addInitScript(lang => localStorage.setItem('asasera.language', lang), language)
  26  |     await page.setViewportSize(ar ? { width: 390, height: 844 } : { width: 1440, height: 900 })
  27  |     const errors: string[] = []; page.on('pageerror', error => errors.push(error.message))
  28  |     await page.goto(`/teacher/activities/${activity.id}`)
  29  |     const prompt = sequence ? (ar ? 'رتب الكلمات؛ يمكن تبديل النسختين المتطابقتين.' : 'Order the words; identical copies may swap.') : (ar ? 'صنّف العناصر وفق البدائل التي راجعناها.' : 'Classify the items using the reviewed alternatives.')
  30  |     await page.getByRole('textbox', { name: ar ? 'نص السؤال' : 'Question text', exact: true }).fill(prompt)
  31  |     const words = ar ? ['جميل', 'جميل', 'جداً'] : ['very', 'very', 'good']
  32  |     const cards = ar ? ['تفاحة', 'كمثرى'] : ['Apple', 'Pear'], targets = groups ? (ar ? ['فاكهة', 'طعام'] : ['Fruit', 'Food']) : (ar ? ['فاكهة', 'فاكهة'] : ['Fruit', 'Fruit'])
  33  |     if (sequence) {
  34  |       for (let i = 0; i < words.length; i++) await page.getByRole('textbox', { name: ar ? `نص العنصر ${i + 1}` : `Item ${i + 1} text`, exact: true }).fill(words[i]!)
  35  |       await page.getByText(ar ? 'إعدادات متقدمة' : 'Advanced settings', { exact: true }).click()
  36  |       await page.getByRole('checkbox', { name: ar ? 'اقبل تبديل العناصر المتطابقة' : 'Accept swaps of identical tiles' }).check()
  37  |     } else {
  38  |       for (let i = 0; i < 2; i++) {
  39  |         await page.getByRole('textbox', { name: `${ar ? 'البطاقة' : 'Card'} ${i + 1}`, exact: true }).fill(cards[i]!)
  40  |         await page.getByRole('textbox', { name: `${ar ? 'الهدف' : 'Target'} ${i + 1}`, exact: true }).fill(targets[i]!)
  41  |       }
  42  |       await page.getByText(ar ? 'البدائل المقبولة' : 'Accepted alternatives', { exact: true }).click()
  43  |       await page.getByRole('checkbox', { name: ar ? 'اقبل النصوص المتطابقة والأهداف الإضافية' : 'Accept equivalent labels and additional targets' }).check()
  44  |       if (groups) await page.getByRole('group', { name: `${ar ? 'الأهداف المقبولة للبطاقة' : 'Accepted targets for card'} 1: ${cards[0]}` }).getByRole('checkbox', { name: targets[1], exact: true }).check()
  45  |     }
  46  |     const published = page.waitForResponse(response => response.url().endsWith(`/activities/${activity.id}/publish`))
  47  |     await page.getByRole('button', { name: ar ? 'اعتماد النسخة' : 'Approve version', exact: true }).click()
  48  |     expect((await published).status()).toBe(200)
  49  |     await page.reload()
  50  |     await page.getByText(sequence ? (ar ? 'إعدادات متقدمة' : 'Advanced settings') : (ar ? 'البدائل المقبولة' : 'Accepted alternatives'), { exact: true }).click()
  51  |     await expect(page.getByRole('checkbox', { name: sequence ? (ar ? 'اقبل تبديل العناصر المتطابقة' : 'Accept swaps of identical tiles') : (ar ? 'اقبل النصوص المتطابقة والأهداف الإضافية' : 'Accept equivalent labels and additional targets') })).toBeChecked()
  52  |     if (groups) await expect(page.getByRole('group', { name: `${ar ? 'الأهداف المقبولة للبطاقة' : 'Accepted targets for card'} 1: ${cards[0]}` }).getByRole('checkbox', { name: targets[1], exact: true })).toBeChecked()
  53  |     await page.getByText(sequence ? (ar ? 'إعدادات متقدمة' : 'Advanced settings') : (ar ? 'البدائل المقبولة' : 'Accepted alternatives'), { exact: true }).locator('..').scrollIntoViewIfNeeded()
  54  |     await capture(page, `native-equivalence-${format}-${language}-editor`)
  55  |     await page.goto(`/teacher/activities/${activity.id}/play?mode=study`)
  56  |     const names = { 'match-up': ar ? 'المطابقة' : 'Match up', 'group-sort': ar ? 'تصنيف المجموعات' : 'Group sort', sequence: ar ? 'الترتيب' : 'Sequence' }
  57  |     await page.getByRole('radio', { name: new RegExp(`^${names[format]}`) }).check()
  58  |     await page.getByRole('button', { name: ar ? 'أنشئ رابط المشاركة' : 'Create assignment link' }).click()
  59  |     const link = await page.getByRole('textbox', { name: ar ? 'رابط النشاط' : 'Assignment link' }).inputValue()
  60  |     const learner = await browser.newContext({ viewport: ar ? { width: 390, height: 844 } : { width: 1440, height: 900 } })
  61  |     await learner.addInitScript(lang => localStorage.setItem('asasera.language', lang), language)
  62  |     try {
  63  |       const learn = await learner.newPage(); learn.on('pageerror', error => errors.push(error.message))
  64  |       await learn.goto(link)
  65  |       await learn.getByRole('textbox', { name: ar ? 'اسمك' : 'Your name' }).fill(ar ? 'متعلم تجريبي' : 'Synthetic learner')
  66  |       await learn.getByRole('button', { name: ar ? 'ابدأ' : 'Start', exact: true }).click()
  67  |       const drawing = learn.waitForResponse(response => response.request().method() === 'POST' && response.url().endsWith('/presentation'))
  68  |       await learn.getByRole('button', { name: ar ? 'ابدأ الجولة' : 'Start round' }).click()
  69  |       const view = await (await drawing).json()
  70  |       await expect(learn.getByRole('heading', { name: prompt, exact: true })).toBeVisible()
  71  |       let submittedOrder: string[] = []
  72  |       if (sequence) {
  73  |         const current: string[] = view.question.payload.items.map((item: { key: string }) => item.key)
  74  |         const copies: string[] = view.question.payload.items.filter((item: { text: string }) => item.text === words[0]).map((item: { key: string }) => item.key)
  75  |         const last: string = view.question.payload.items.find((item: { text: string }) => item.text === words[2]).key
  76  |         expect(copies).toHaveLength(2)
  77  |         // Opaque learner identities must not be replaced by the author-only IDs.
  78  |         // Swap the two identical visible copies and place the distinct word last.
  79  |         submittedOrder = [...copies.reverse(), last]
  80  |         for (const [index, id] of submittedOrder.entries()) {
  81  |           let position = current.indexOf(id)
  82  |           expect(position).toBeGreaterThanOrEqual(0)
  83  |           while (position > index) {
  84  |             await learn.locator('[data-order-item]').nth(position).getByRole('button', { name: /^Move up/ }).click()
  85  |             const moved = current.splice(position, 1)[0]!; current.splice(position - 1, 0, moved); position--
  86  |           }
  87  |         }
  88  |       } else {
  89  |         await learn.getByRole('button', { name: cards[0], exact: true }).click()
  90  |         await learn.getByRole('button', { name: targets[1], exact: true }).nth(groups ? 0 : 1).click()
  91  |         await learn.getByRole('button', { name: cards[1], exact: true }).click()
  92  |         await learn.getByRole('button', { name: targets[groups ? 1 : 0], exact: true }).first().click()
  93  |         if (groups) {
  94  |           await expect(learn.getByRole('button', { name: targets[1], exact: true })).toContainText(cards[0]!)
  95  |           await expect(learn.getByRole('button', { name: targets[1], exact: true })).toContainText(cards[1]!)
  96  |         }
  97  |       }
  98  |       const saving = learn.waitForResponse(response => response.request().method() === 'POST' && response.url().endsWith('/answer'))
  99  |       await learn.getByRole('button', { name: sequence ? (ar ? 'تحقق' : 'Check') : (ar ? 'أرسل الإجابة' : 'Submit answer'), exact: true }).click()
  100 |       const response = await saving; expect(response.ok(), await response.text()).toBe(true)
  101 |       const saved = await response.json(); expect(saved.reveal.wasCorrect).toBe(true)
  102 |       if (sequence) expect(response.request().postDataJSON().answer.sequence).toEqual(submittedOrder)
  103 |       if (groups) {
  104 |         const source = view.question.payload.cards.find((card: { text: string }) => card.text === cards[0]).key
  105 |         const target = view.question.payload.targets.find((item: { text: string }) => item.text === targets[1]).key
  106 |         expect(response.request().postDataJSON().answer.pairs).toContainEqual([source, target])
  107 |       }
  108 |       await learn.reload()
  109 |       await expect(learn.getByRole('status').filter({ hasText: ar ? 'إجابة صحيحة' : 'Correct' })).toBeVisible()
> 110 |       if (groups) await expect(learn.getByRole('button', { name: targets[1], exact: true })).toContainText(cards[0]!)
      |                                                                                              ^ Error: expect(locator).toContainText(expected) failed
  111 |       await capture(learn, `native-equivalence-${format}-${language}-learner`)
  112 |       await learn.getByRole('button', { name: ar ? 'إنهاء الجولة' : 'Finish round' }).click()
  113 |       await expect(learn.getByRole('heading', { name: ar ? 'اكتملت الجولة' : 'Round complete', exact: true })).toBeVisible()
  114 |       expect(errors).toEqual([])
  115 |     } finally { await learner.close() }
  116 |   })
  117 | }
  118 | 
```