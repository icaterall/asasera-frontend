# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: editor.spec.ts >> the four-region editor >> a failed save keeps the edit and offers a retry
- Location: e2e/editor.spec.ts:186:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByLabel('عنوان النشاط')
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByLabel('عنوان النشاط') with timeout 15000ms
  - waiting for getByLabel('عنوان النشاط')

```

```yaml
- banner "Editor bar":
  - link "Asasera — dashboard":
    - /url: /teacher/dashboard
    - img "Asasera"
  - heading "عواصم أوروبا" [level=1]
  - textbox "Activity title": عواصم أوروبا
  - 'button "Available balance: 0. Open account and usage"':
    - strong: "0"
    - text: Add credit
  - button "Account menu — Teacher"
  - group "Activity actions":
    - button "Activity settings"
    - button "More"
    - button "Approve version"
- navigation "Activity questions":
  - button "Add question"
  - button "Generate with AI"
  - paragraph: From a topic or your uploaded sources.
- main:
  - heading "No questions yet" [level=3]
  - paragraph: Add your first question. Type and timer are already set.
  - button "Add question"
- complementary "Question properties":
  - heading "Question properties" [level=2]
  - button "Fold properties" [expanded]
  - tablist "Sidebar panel":
    - tab "Question properties" [selected]
    - tab "Themes"
  - text: Question type
  - button "Question type" [disabled]:
    - strong: Quiz
  - text: Time limit
  - combobox "Time limit in seconds" [disabled]: 20 seconds
  - button "Apply to all questions" [disabled]
  - text: Points
  - combobox "Points" [disabled]: Standard
  - button "Duplicate question" [disabled]
  - button "Delete question" [disabled]
```

# Test source

```ts
  101 |      * means is that the teacher never had to go there: nothing above touched
  102 |      * region 4, and every default it holds is still the default.
  103 |      *
  104 |      * Asserted on the server's own rows further down: five questions, all
  105 |      * `mcq`, all 20 seconds, none of it ever supplied by this test.
  106 |      */
  107 |     const propertiesRail = page.getByLabel('خصائص السؤال')
  108 |     /* The type control is the design-system Select (a combobox), which exposes its value as data-select-value. */
  109 |     await expect(propertiesRail.getByLabel('نوع السؤال',{exact:true}).first()).toHaveAttribute('data-question-kind','mcq')
  110 |     await expect(propertiesRail.getByLabel('مدة السؤال بالثواني')).toHaveValue('20')
  111 | 
  112 |     await page.getByRole('button', { name: 'اعتماد النسخة' }).click()
  113 | 
  114 |     await expect(page.getByRole('button', { name: 'اعتماد التغييرات' })).toBeVisible({ timeout: 15_000 })
  115 |     await expect(page.getByRole('button', { name: 'ابدأ حصة مباشرة' })).toBeVisible()
  116 |     await expect(page.getByRole('button', { name: 'كلّف كواجب' })).toBeVisible()
  117 |     await expect(page.getByRole('alert')).toHaveCount(0)
  118 | 
  119 |     /* And the server agrees — five questions, an approved version, still private (v5 §18). */
  120 |     const check = await page.request.get(`${API}/activities/${activityId}`, {
  121 |       headers: { authorization: `Bearer ${accessToken}` },
  122 |     })
  123 |     const body = await check.json()
  124 |     expect(body.questions).toHaveLength(5)
  125 |     expect(body.activity.currentVersionId).not.toBeNull()
  126 |     expect(body.activity.visibility).toBe('private')
  127 |     expect(body.questions.every((q: { timeLimitS: number }) => q.timeLimitS === 20)).toBeTruthy()
  128 |   })
  129 | 
  130 |   test('a blank answer is refused and the editor points at the option', async ({ page }) => {
  131 |     const { accessToken } = await signInAsNewTeacher(page)
  132 |     const activityId = await createActivity(page, accessToken)
  133 | 
  134 |     await page.goto(`/teacher/activities/${activityId}`)
  135 |     await expect(page.getByLabel('عنوان النشاط')).toBeVisible({ timeout: 15_000 })
  136 | 
  137 |     await page.getByRole('button', { name: 'أضف سؤالًا' }).first().click()
  138 |     await page.getByLabel('نص السؤال').fill('ما عاصمة فرنسا؟')
  139 |     await page.getByLabel('نص الإجابة 1').fill('باريس')
  140 |     await page.getByLabel('نص الإجابة 2').fill('لندن')
  141 |     await page.getByLabel('نص الإجابة 3').fill('برلين')
  142 |     // The fourth answer is deliberately empty.
  143 |     await expect(page.getByLabel('نص الإجابة 4')).toHaveValue('')
  144 | 
  145 |     await page.getByRole('button', { name: 'اعتماد النسخة' }).click()
  146 | 
  147 |     const alert = page.getByRole('alert').first()
  148 |     await expect(alert).toBeVisible({ timeout: 15_000 })
  149 |     // The message names the exact option, not just "incomplete".
  150 |     await expect(alert).toContainText('opt_d')
  151 | 
  152 |     // Still a draft.
  153 |     await expect(page.getByRole('button', { name: 'اعتماد النسخة' })).toBeVisible()
  154 |   })
  155 | 
  156 |   test('the save indicator reaches "saved" only after the server confirms', async ({ page }) => {
  157 |     const { accessToken } = await signInAsNewTeacher(page)
  158 |     const activityId = await createActivity(page, accessToken)
  159 | 
  160 |     /*
  161 |      * Slow the question save down so the intermediate state is observable.
  162 |      * A fixed delay rather than a manual gate: the gate had to guess which
  163 |      * request to hold, and holding the wrong one produced a failure that read
  164 |      * like a missing indicator.
  165 |      */
  166 |     await page.route('**/api/v1/activities/questions/*', async (route) => {
  167 |       if (route.request().method() === 'PATCH') await new Promise((r) => setTimeout(r, 2500))
  168 |       await route.continue()
  169 |     })
  170 | 
  171 |     await page.goto(`/teacher/activities/${activityId}`)
  172 |     await expect(page.getByLabel('عنوان النشاط')).toBeVisible({ timeout: 15_000 })
  173 |     await page.getByRole('button', { name: 'أضف سؤالًا' }).first().click()
  174 |     await expect(page.locator('[data-question-thumb]')).toHaveCount(1)
  175 | 
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
> 201 |     await expect(page.getByLabel('عنوان النشاط')).toBeVisible({ timeout: 15_000 })
      |                                                   ^ Error: expect(locator).toBeVisible() failed
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
  276 |     await expect(chip(page)).toContainText('صفحة 1، 2')
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
```