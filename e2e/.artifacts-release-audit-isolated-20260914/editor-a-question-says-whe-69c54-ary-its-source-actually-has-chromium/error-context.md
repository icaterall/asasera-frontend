# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: editor.spec.ts >> a question says where it came from >> each citation is labelled in the vocabulary its source actually has
- Location: e2e/editor.spec.ts:266:3

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('[data-source-chip]')
Expected substring: "صفحة 1، 2"
Received string:    "PDF p. 1, 2·البناء الضوئي"
Timeout: 5000ms

Call log:
  - Expect "toContainText" locator('[data-source-chip]') with timeout 5000ms
  - waiting for locator('[data-source-chip]')
    14 × locator resolved to <button type="button" aria-expanded="false" class="_chip_3wdgo_11" data-source-chip="file" aria-label="Source: PDF p. 1, 2 · البناء الضوئي">…</button>
       - unexpected value "PDF p. 1, 2·البناء الضوئي"

```

```yaml
- 'button "Source: PDF p. 1, 2 · البناء الضوئي"': PDF p. 1, 2 البناء الضوئي
```

# Test source

```ts
  176 |     await page.getByLabel('نص السؤال').fill('سؤال')
  177 | 
  178 |     // In flight: NOT "saved" yet. That is the whole rule (§12).
  179 |     await expect(page.getByText('جارٍ الحفظ…')).toBeVisible({ timeout: 10_000 })
  180 |     await expect(page.getByText('محفوظ', { exact: true })).toHaveCount(0)
  181 | 
  182 |     // Confirmed by the server: only now.
  183 |     await expect(page.getByText('محفوظ', { exact: true })).toBeVisible({ timeout: 15_000 })
  184 |   })
  185 | 
  186 |   test('a failed save keeps the edit and offers a retry', async ({ page }) => {
  187 |     const { accessToken } = await signInAsNewTeacher(page)
  188 |     const activityId = await createActivity(page, accessToken)
  189 | 
  190 |     let failNext = false
  191 |     await page.route('**/api/v1/activities/questions/*', async (route) => {
  192 |       if (route.request().method() === 'PATCH' && failNext) {
  193 |         failNext = false
  194 |         await route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":{"code":"upstream","message":"nope"}}' })
  195 |         return
  196 |       }
  197 |       await route.continue()
  198 |     })
  199 | 
  200 |     await page.goto(`/teacher/activities/${activityId}`)
  201 |     await expect(page.getByLabel('عنوان النشاط')).toBeVisible({ timeout: 15_000 })
  202 |     await page.getByRole('button', { name: 'أضف سؤالًا' }).first().click()
  203 |     await expect(page.locator('[data-question-thumb]')).toHaveCount(1)
  204 | 
  205 |     failNext = true
  206 |     await page.getByLabel('نص السؤال').fill('نص لا يجب أن يُفقد')
  207 | 
  208 |     await expect(page.getByText('تعذّر الحفظ — تعديلك لم يُفقد')).toBeVisible({ timeout: 15_000 })
  209 |     // The edit is still on screen — a failure must not roll the editor back.
  210 |     await expect(page.getByLabel('نص السؤال')).toHaveValue('نص لا يجب أن يُفقد')
  211 | 
  212 |     await page.getByRole('button', { name: 'أعد المحاولة' }).click()
  213 |     await expect(page.getByText('محفوظ', { exact: true })).toBeVisible({ timeout: 15_000 })
  214 | 
  215 |     // And the server really has it.
  216 |     const check = await page.request.get(`/api/v1/activities/${activityId}`, {
  217 |       headers: { authorization: `Bearer ${accessToken}` },
  218 |     })
  219 |     expect((await check.json()).questions[0].prompt).toBe('نص لا يجب أن يُفقد')
  220 |   })
  221 | })
  222 | 
  223 | /* ---- v5.1 C4: the per-question source chip ------------------------------ */
  224 | 
  225 | type CitedQuestion = { id: number; revisionId?: number; segments?: number[]; title?: string }
  226 | type ProvenanceFixture = {
  227 |   email: string; password: string; activityId: number
  228 |   questions: { pdf: CitedQuestion; pptx: CitedQuestion; docx: CitedQuestion; topic: CitedQuestion; manual: CitedQuestion; unavailable: CitedQuestion }
  229 | }
  230 | 
  231 | /**
  232 |  * Seeds a teacher whose activity carries one question per kind of citation:
  233 |  * a PDF's pages, a PPTX slide, a DOCX section, a topic, a hand-written
  234 |  * question, and one whose material was deleted after the citation was made.
  235 |  *
  236 |  * Seeded through the backend's own script — same shape as `local-fixture.ts`,
  237 |  * kept here because this scenario needs the materials as well as the account.
  238 |  */
  239 | function seedProvenance(): ProvenanceFixture {
  240 |   const file = `/tmp/asasera-browser-${randomUUID()}.json`
  241 |   const backend = path.resolve(import.meta.dirname, '../../asasera-backend')
  242 |   try {
  243 |     execFileSync(process.execPath, ['--disable-warning=ExperimentalWarning', 'scripts/v4/seed-provenance-browser.ts', file], {
  244 |       cwd: backend,
  245 |       env: { ...process.env, NODE_ENV: 'test', PG_HOST: '127.0.0.1', PG_PORT: '55432', PG_DATABASE: process.env.E2E_PG_DATABASE ?? 'asasera', PG_USER: 'postgres', PG_PASSWORD: 'postgres', PG_SSL: 'disable' },
  246 |       stdio: 'pipe',
  247 |     })
  248 |     return JSON.parse(readFileSync(file, 'utf8'))
  249 |   } finally { try { unlinkSync(file) } catch { /* the script may have failed before writing */ } }
  250 | }
  251 | 
  252 | async function signIn(page: Page, email: string, password: string) {
  253 |   const login = await page.request.post(`${API}/auth/login`, { data: { email, password } })
  254 |   expect(login.ok(), `login failed: ${login.status()} ${await login.text()}`).toBeTruthy()
  255 |   return (await login.json()).accessToken as string
  256 | }
  257 | 
  258 | test.describe('a question says where it came from', () => {
  259 |   /* The rail order is the seeding order: PDF, PPTX, DOCX, topic, manual, deleted. */
  260 |   const ORDER = ['pdf', 'pptx', 'docx', 'topic', 'manual', 'unavailable'] as const
  261 |   const chip = (page: Page) => page.locator('[data-source-chip]')
  262 |   const select = async (page: Page, kind: (typeof ORDER)[number]) => {
  263 |     await page.locator('[data-question-thumb]').nth(ORDER.indexOf(kind)).click()
  264 |   }
  265 | 
  266 |   test('each citation is labelled in the vocabulary its source actually has', async ({ page }) => {
  267 |     const fixture = seedProvenance()
  268 |     await signIn(page, fixture.email, fixture.password)
  269 | 
  270 |     await page.goto(`/teacher/activities/${fixture.activityId}`)
  271 |     await expect(page.locator('[data-question-thumb]')).toHaveCount(6, { timeout: 15_000 })
  272 | 
  273 |     /* A PDF cites pages, and both cited pages are named. */
  274 |     await select(page, 'pdf')
  275 |     await expect(chip(page)).toHaveAttribute('data-source-chip', 'file', { timeout: 15_000 })
> 276 |     await expect(chip(page)).toContainText('صفحة 1، 2')
      |                              ^ Error: expect(locator).toContainText(expected) failed
  277 |     await expect(chip(page)).toContainText(fixture.questions.pdf.title!)
  278 |     /* A real button, named for a screen reader, and reachable from the keyboard. */
  279 |     await expect(chip(page)).toHaveRole('button')
  280 |     await expect(chip(page)).toHaveAttribute('aria-label', new RegExp(`^المصدر: صفحة 1، 2`))
  281 |     await chip(page).focus()
  282 |     await expect(chip(page)).toBeFocused()
  283 | 
  284 |     /* A presentation cites slides. */
  285 |     await select(page, 'pptx')
  286 |     await expect(chip(page)).toContainText('شريحة 2', { timeout: 15_000 })
  287 |     await expect(chip(page)).toContainText('Water cycle')
  288 | 
  289 |     /*
  290 |      * A DOCX has no genuine pagination, so its citation is a SECTION. This is
  291 |      * the assertion the whole locator vocabulary exists for: calling a Word
  292 |      * document's block "page 3" would be a number the teacher cannot find.
  293 |      */
  294 |     await select(page, 'docx')
  295 |     await expect(chip(page)).toContainText('مقطع', { timeout: 15_000 })
  296 |     await expect(chip(page)).not.toContainText('صفحة')
  297 | 
  298 |     /* No file behind it — a topic, not a citation. */
  299 |     await select(page, 'topic')
  300 |     await expect(chip(page)).toHaveAttribute('data-source-chip', 'topic', { timeout: 15_000 })
  301 |     await expect(chip(page)).toContainText('موضوع')
  302 | 
  303 |     /* Nothing recorded at all: written by hand. A hand-written question says
  304 |        nothing rather than wearing a label that names no source and opens
  305 |        nothing — so the absence of a chip is the assertion. */
  306 |     await select(page, 'manual')
  307 |     await expect(chip(page)).toHaveCount(0, { timeout: 15_000 })
  308 | 
  309 |     /* The material is gone; the citation stays, and says so honestly. */
  310 |     await select(page, 'unavailable')
  311 |     await expect(chip(page)).toHaveAttribute('data-source-chip', 'unavailable', { timeout: 15_000 })
  312 |     await expect(chip(page)).toContainText('المصدر غير متاح')
  313 | 
  314 |     /* Nowhere does the editor claim the question was CHECKED against its source. */
  315 |     await expect(page.getByText(/AI verified|تحقّق الذكاء|مُتحقَّق/)).toHaveCount(0)
  316 |   })
  317 | 
  318 |   test('the chip opens the cited page, and the citation survives a reload, an edit and approval', async ({ page }) => {
  319 |     const fixture = seedProvenance()
  320 |     const accessToken = await signIn(page, fixture.email, fixture.password)
  321 | 
  322 |     /* What the server says pages 1 and 2 of that PDF hold — the panel must show THAT text. */
  323 |     const segments = await page.request.get(`${API}/teaching/revisions/${fixture.questions.pdf.revisionId}/segments`, {
  324 |       headers: { authorization: `Bearer ${accessToken}` },
  325 |     })
  326 |     expect(segments.ok(), `segments: ${segments.status()}`).toBeTruthy()
  327 |     const cited: { segmentIndex: number; text: string }[] = (await segments.json()).segments
  328 |       .filter((s: { segmentIndex: number }) => fixture.questions.pdf.segments!.includes(s.segmentIndex))
  329 |     expect(cited.length).toBe(2)
  330 | 
  331 |     await page.goto(`/teacher/activities/${fixture.activityId}`)
  332 |     await expect(page.locator('[data-question-thumb]')).toHaveCount(6, { timeout: 15_000 })
  333 |     await select(page, 'pdf')
  334 |     await expect(chip(page)).toContainText('صفحة 1، 2', { timeout: 15_000 })
  335 | 
  336 |     /* Closed until asked. */
  337 |     await expect(page.locator('[data-source-panel]')).toHaveCount(0)
  338 |     await expect(chip(page)).toHaveAttribute('aria-expanded', 'false')
  339 | 
  340 |     await chip(page).click()
  341 |     const panel = page.locator('[data-source-panel]')
  342 |     await expect(panel).toBeVisible({ timeout: 15_000 })
  343 |     await expect(chip(page)).toHaveAttribute('aria-expanded', 'true')
  344 |     /* The right pages, named, with the text the server holds for them. */
  345 |     await expect(panel).toContainText('صفحة 1')
  346 |     await expect(panel).toContainText('صفحة 2')
  347 |     for (const segment of cited) {
  348 |       const sample = segment.text.trim().split(/\s+/).slice(0, 6).join(' ')
  349 |       if (sample.length > 8) await expect(panel).toContainText(sample)
  350 |     }
  351 |     /* And it says what a citation is — origin, never a verdict on the answer. */
  352 |     await expect(panel).toContainText('تسجّل الإشارة أصل السؤال فقط')
  353 | 
  354 |     /* Closing returns focus to the chip, so the keyboard is never stranded. */
  355 |     await panel.getByRole('button', { name: 'أغلق المصدر' }).click()
  356 |     await expect(panel).toHaveCount(0)
  357 |     await expect(chip(page)).toBeFocused()
  358 | 
  359 |     /* Reload: the citation is stored, not a rendering accident. */
  360 |     await page.reload()
  361 |     await expect(page.locator('[data-question-thumb]')).toHaveCount(6, { timeout: 15_000 })
  362 |     await select(page, 'pdf')
  363 |     await expect(chip(page)).toContainText('صفحة 1، 2', { timeout: 15_000 })
  364 | 
  365 |     /* Editing the question does not erase where it came from. */
  366 |     await page.getByLabel('نص السؤال').fill('ما الغاز الذي يمتصه النبات أثناء البناء الضوئي؟ (مُراجَع)')
  367 |     await expect(page.getByText('محفوظ', { exact: true })).toBeVisible({ timeout: 15_000 })
  368 |     await expect(chip(page)).toContainText('صفحة 1، 2')
  369 | 
  370 |     /* Nor does approving the activity. */
  371 |     await page.getByRole('button', { name: 'اعتماد النسخة' }).click()
  372 |     await expect(page.getByRole('button', { name: 'اعتماد التغييرات' })).toBeVisible({ timeout: 20_000 })
  373 |     await expect(chip(page)).toContainText('صفحة 1، 2')
  374 | 
  375 |     /* The server agrees the citation is still attached to the edited question. */
  376 |     const check = await page.request.get(`${API}/activities/${fixture.activityId}`, { headers: { authorization: `Bearer ${accessToken}` } })
```