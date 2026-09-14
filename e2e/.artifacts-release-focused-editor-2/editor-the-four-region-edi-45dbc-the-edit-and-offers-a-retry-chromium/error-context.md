# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: editor.spec.ts >> the four-region editor >> a failed save keeps the edit and offers a retry
- Location: e2e/editor.spec.ts:192:3

# Error details

```
Error: expect(locator).toHaveValue(expected) failed

Locator: getByLabel('نص السؤال')
Expected: "نص لا يجب أن يُفقد"
Error: Not an input element

Call log:
  - Expect "toHaveValue" getByLabel('نص السؤال') with timeout 5000ms
  - waiting for getByLabel('نص السؤال')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner "شريط المحرر" [ref=e4]:
    - link "أساسيرا — لوحة التحكم" [ref=e5] [cursor=pointer]:
      - /url: /teacher/dashboard
      - img "أساسيرا" [ref=e7]
    - generic [ref=e8]:
      - heading "عواصم أوروبا" [level=1] [ref=e9]
      - textbox "عنوان النشاط" [ref=e10]: عواصم أوروبا
      - alert [ref=e11]:
        - text: تعذّر الحفظ — تعديلك لم يُفقد
        - button "أعد المحاولة" [ref=e12] [cursor=pointer]
    - generic [ref=e13]:
      - 'button "الرصيد المتاح: 0. فتح الحساب والاستخدام" [ref=e14] [cursor=pointer]':
        - generic [ref=e18]:
          - strong [ref=e19]: "0"
          - generic [ref=e20]: أضف رصيدًا
      - button "قائمة الحساب — معلّم" [ref=e22] [cursor=pointer]:
        - generic [ref=e24]: T
    - group "أدوات النشاط" [ref=e25]:
      - button "حفظ" [ref=e26] [cursor=pointer]
      - button "تراجع" [ref=e31] [cursor=pointer]
      - button "إعدادات النشاط" [ref=e35] [cursor=pointer]
      - button "المزيد" [ref=e39] [cursor=pointer]
      - button "اعتماد النسخة" [ref=e44] [cursor=pointer]
  - navigation "أسئلة النشاط" [ref=e45]:
    - generic [ref=e46]:
      - generic [ref=e47]:
        - button "تكرار السؤال" [ref=e48] [cursor=pointer]
        - button "حذف السؤال" [ref=e52] [cursor=pointer]
      - generic [ref=e56]:
        - paragraph [ref=e57]:
          - generic [ref=e58]: 1 اختبار
        - button "نص لا يجب أن يُفقد" [ref=e59] [cursor=pointer]
    - generic [ref=e66]:
      - button "أضف سؤالًا" [ref=e67] [cursor=pointer]
      - button "توليد بالذكاء الاصطناعي" [ref=e68] [cursor=pointer]
      - paragraph [ref=e72]: من موضوع أو من مصادرك المرفوعة.
  - main [ref=e73]:
    - generic [ref=e74]:
      - generic [ref=e75]:
        - toolbar "تنسيق النص" [ref=e77]:
          - button "عريض" [ref=e78] [cursor=pointer]
          - button "مائل" [ref=e81] [cursor=pointer]
          - button "نص سفلي" [ref=e84] [cursor=pointer]
          - button "نص علوي" [ref=e89] [cursor=pointer]
          - button "رموز" [ref=e94] [cursor=pointer]
          - button "معادلة" [ref=e97] [cursor=pointer]
        - textbox "نص السؤال" [active] [ref=e102]:
          - paragraph [ref=e103]: نص لا يجب أن يُفقد
      - button "صورة السؤال (اختياري)" [ref=e105] [cursor=pointer]:
        - generic [ref=e109]: ابحث عن وسائط وأدرجها (اختياري)
        - generic [ref=e110]: ارفع ملفًا أو اسحبه إلى هنا
      - generic [ref=e111]:
        - generic [ref=e113]:
          - button "احذف الإجابة 1" [ref=e118] [cursor=pointer]
          - textbox "نص الإجابة 1" [ref=e125]:
            - text: أضف إجابة 1
            - paragraph [ref=e126]
          - button "صورة الإجابة" [ref=e128] [cursor=pointer]
        - generic [ref=e134]:
          - button "احذف الإجابة 2" [ref=e139] [cursor=pointer]
          - textbox "نص الإجابة 2" [ref=e146]:
            - text: أضف إجابة 2
            - paragraph [ref=e147]
          - button "صورة الإجابة" [ref=e149] [cursor=pointer]
        - generic [ref=e155]:
          - button "احذف الإجابة 3" [ref=e160] [cursor=pointer]
          - textbox "نص الإجابة 3" [ref=e167]:
            - text: أضف إجابة 3
            - paragraph [ref=e168]
          - button "صورة الإجابة" [ref=e170] [cursor=pointer]
        - generic [ref=e176]:
          - button "احذف الإجابة 4" [ref=e181] [cursor=pointer]
          - textbox "نص الإجابة 4" [ref=e188]:
            - text: أضف إجابة 4
            - paragraph [ref=e189]
          - button "صورة الإجابة" [ref=e191] [cursor=pointer]
      - button "أضف إجابة أخرى" [ref=e197] [cursor=pointer]
      - generic [ref=e199]:
        - generic [ref=e200]: التفسير (اختياري)
        - textbox "التفسير (اختياري)" [ref=e201]:
          - /placeholder: لماذا هذه الإجابة صحيحة؟ يظهر للطلاب بعد انتهاء وقت الإجابة.
  - complementary "خصائص السؤال" [ref=e202]:
    - generic [ref=e203]:
      - heading "خصائص السؤال" [level=2] [ref=e204]
      - button "طيّ الخصائص" [expanded] [ref=e205] [cursor=pointer]
    - tablist "لوحة الجانب" [ref=e209]:
      - tab "خصائص السؤال" [selected] [ref=e210] [cursor=pointer]
      - tab "المظاهر" [ref=e213] [cursor=pointer]
    - generic [ref=e221]:
      - generic [ref=e222]: نوع السؤال
      - button "نوع السؤال" [ref=e226] [cursor=pointer]:
        - strong [ref=e233]: اختبار
    - generic [ref=e236]:
      - generic [ref=e237]: الوقت المحدد
      - combobox "مدة السؤال بالثواني" [ref=e241] [cursor=pointer]:
        - generic [ref=e242]: 20 ثانية
      - textbox [aria-hidden] [ref=e246]: "20"
      - button "تطبيق على جميع الأسئلة" [ref=e247] [cursor=pointer]
    - generic [ref=e248]:
      - generic [ref=e249]: النقاط
      - combobox "النقاط" [ref=e256] [cursor=pointer]:
        - generic [ref=e257]: قياسي
      - textbox [aria-hidden] [ref=e261]: "1"
    - generic [ref=e262]:
      - button "تكرار السؤال" [ref=e263] [cursor=pointer]
      - button "حذف السؤال" [ref=e264] [cursor=pointer]
```

# Test source

```ts
  116 |     await expect(propertiesRail.getByLabel('مدة السؤال بالثواني')).toHaveValue('20')
  117 | 
  118 |     await page.getByRole('button', { name: 'اعتماد النسخة' }).click()
  119 | 
  120 |     await expect(page.getByRole('button', { name: 'اعتماد التغييرات' })).toBeVisible({ timeout: 15_000 })
  121 |     await expect(page.getByRole('button', { name: 'ابدأ حصة مباشرة' })).toBeVisible()
  122 |     await expect(page.getByRole('button', { name: 'كلّف كواجب' })).toBeVisible()
  123 |     await expect(page.getByRole('alert')).toHaveCount(0)
  124 | 
  125 |     /* And the server agrees — five questions, an approved version, still private (v5 §18). */
  126 |     const check = await page.request.get(`${API}/activities/${activityId}`, {
  127 |       headers: { authorization: `Bearer ${accessToken}` },
  128 |     })
  129 |     const body = await check.json()
  130 |     expect(body.questions).toHaveLength(5)
  131 |     expect(body.activity.currentVersionId).not.toBeNull()
  132 |     expect(body.activity.visibility).toBe('private')
  133 |     expect(body.questions.every((q: { timeLimitS: number }) => q.timeLimitS === 20)).toBeTruthy()
  134 |   })
  135 | 
  136 |   test('a blank answer is refused and the editor points at the option', async ({ page }) => {
  137 |     const { accessToken } = await signInAsNewTeacher(page)
  138 |     const activityId = await createActivity(page, accessToken)
  139 | 
  140 |     await page.goto(`/teacher/activities/${activityId}`)
  141 |     await expect(page.getByLabel('عنوان النشاط')).toBeVisible({ timeout: 15_000 })
  142 | 
  143 |     await addQuiz(page)
  144 |     await page.getByLabel('نص السؤال').fill('ما عاصمة فرنسا؟')
  145 |     await page.getByLabel('نص الإجابة 1').fill('باريس')
  146 |     await page.getByLabel('نص الإجابة 2').fill('لندن')
  147 |     await page.getByLabel('نص الإجابة 3').fill('برلين')
  148 |     // The fourth answer is deliberately empty.
  149 |     await expect(page.getByLabel('نص الإجابة 4')).toHaveValue('')
  150 | 
  151 |     await page.getByRole('button', { name: 'اعتماد النسخة' }).click()
  152 | 
  153 |     const alert = page.getByRole('alert').first()
  154 |     await expect(alert).toBeVisible({ timeout: 15_000 })
  155 |     // The message names the exact option, not just "incomplete".
  156 |     await expect(alert).toContainText('opt_d')
  157 | 
  158 |     // Still a draft.
  159 |     await expect(page.getByRole('button', { name: 'اعتماد النسخة' })).toBeVisible()
  160 |   })
  161 | 
  162 |   test('the save indicator reaches "saved" only after the server confirms', async ({ page }) => {
  163 |     const { accessToken } = await signInAsNewTeacher(page)
  164 |     const activityId = await createActivity(page, accessToken)
  165 | 
  166 |     /*
  167 |      * Slow the question save down so the intermediate state is observable.
  168 |      * A fixed delay rather than a manual gate: the gate had to guess which
  169 |      * request to hold, and holding the wrong one produced a failure that read
  170 |      * like a missing indicator.
  171 |      */
  172 |     await page.route('**/api/v1/activities/questions/*', async (route) => {
  173 |       if (route.request().method() === 'PATCH') await new Promise((r) => setTimeout(r, 2500))
  174 |       await route.continue()
  175 |     })
  176 | 
  177 |     await page.goto(`/teacher/activities/${activityId}`)
  178 |     await expect(page.getByLabel('عنوان النشاط')).toBeVisible({ timeout: 15_000 })
  179 |     await addQuiz(page)
  180 |     await expect(page.locator('[data-question-thumb]')).toHaveCount(1)
  181 | 
  182 |     await page.getByLabel('نص السؤال').fill('سؤال')
  183 | 
  184 |     // In flight: NOT "saved" yet. That is the whole rule (§12).
  185 |     await expect(page.getByText('جارٍ الحفظ…')).toBeVisible({ timeout: 10_000 })
  186 |     await expect(page.getByText('محفوظ', { exact: true })).toHaveCount(0)
  187 | 
  188 |     // Confirmed by the server: only now.
  189 |     await expect(page.getByText('محفوظ', { exact: true })).toBeVisible({ timeout: 15_000 })
  190 |   })
  191 | 
  192 |   test('a failed save keeps the edit and offers a retry', async ({ page }) => {
  193 |     const { accessToken } = await signInAsNewTeacher(page)
  194 |     const activityId = await createActivity(page, accessToken)
  195 | 
  196 |     let failNext = false
  197 |     await page.route('**/api/v1/activities/questions/*', async (route) => {
  198 |       if (route.request().method() === 'PATCH' && failNext) {
  199 |         failNext = false
  200 |         await route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":{"code":"upstream","message":"nope"}}' })
  201 |         return
  202 |       }
  203 |       await route.continue()
  204 |     })
  205 | 
  206 |     await page.goto(`/teacher/activities/${activityId}`)
  207 |     await expect(page.getByLabel('عنوان النشاط')).toBeVisible({ timeout: 15_000 })
  208 |     await addQuiz(page)
  209 |     await expect(page.locator('[data-question-thumb]')).toHaveCount(1)
  210 | 
  211 |     failNext = true
  212 |     await page.getByLabel('نص السؤال').fill('نص لا يجب أن يُفقد')
  213 | 
  214 |     await expect(page.getByText('تعذّر الحفظ — تعديلك لم يُفقد')).toBeVisible({ timeout: 15_000 })
  215 |     // The edit is still on screen — a failure must not roll the editor back.
> 216 |     await expect(page.getByLabel('نص السؤال')).toHaveValue('نص لا يجب أن يُفقد')
      |                                                ^ Error: expect(locator).toHaveValue(expected) failed
  217 | 
  218 |     await page.getByRole('button', { name: 'أعد المحاولة' }).click()
  219 |     await expect(page.getByText('محفوظ', { exact: true })).toBeVisible({ timeout: 15_000 })
  220 | 
  221 |     // And the server really has it.
  222 |     const check = await page.request.get(`/api/v1/activities/${activityId}`, {
  223 |       headers: { authorization: `Bearer ${accessToken}` },
  224 |     })
  225 |     expect((await check.json()).questions[0].prompt).toBe('نص لا يجب أن يُفقد')
  226 |   })
  227 | })
  228 | 
  229 | /* ---- v5.1 C4: the per-question source chip ------------------------------ */
  230 | 
  231 | type CitedQuestion = { id: number; revisionId?: number; segments?: number[]; title?: string }
  232 | type ProvenanceFixture = {
  233 |   email: string; password: string; activityId: number
  234 |   questions: { pdf: CitedQuestion; pptx: CitedQuestion; docx: CitedQuestion; topic: CitedQuestion; manual: CitedQuestion; unavailable: CitedQuestion }
  235 | }
  236 | 
  237 | /**
  238 |  * Seeds a teacher whose activity carries one question per kind of citation:
  239 |  * a PDF's pages, a PPTX slide, a DOCX section, a topic, a hand-written
  240 |  * question, and one whose material was deleted after the citation was made.
  241 |  *
  242 |  * Seeded through the backend's own script — same shape as `local-fixture.ts`,
  243 |  * kept here because this scenario needs the materials as well as the account.
  244 |  */
  245 | function seedProvenance(): ProvenanceFixture {
  246 |   const file = `/tmp/asasera-browser-${randomUUID()}.json`
  247 |   const backend = path.resolve(import.meta.dirname, '../../asasera-backend')
  248 |   try {
  249 |     execFileSync(process.execPath, ['--disable-warning=ExperimentalWarning', 'scripts/v4/seed-provenance-browser.ts', file], {
  250 |       cwd: backend,
  251 |       env: { ...process.env, NODE_ENV: 'test', PG_HOST: '127.0.0.1', PG_PORT: '55432', PG_DATABASE: process.env.E2E_PG_DATABASE ?? 'asasera', PG_USER: 'postgres', PG_PASSWORD: 'postgres', PG_SSL: 'disable' },
  252 |       stdio: 'pipe',
  253 |     })
  254 |     return JSON.parse(readFileSync(file, 'utf8'))
  255 |   } finally { try { unlinkSync(file) } catch { /* the script may have failed before writing */ } }
  256 | }
  257 | 
  258 | async function signIn(page: Page, email: string, password: string) {
  259 |   await page.addInitScript(()=>{localStorage.setItem('asasera.language','ar');localStorage.setItem('i18nextLng','ar')})
  260 |   const login = await page.request.post(`${API}/auth/login`, { data: { email, password } })
  261 |   expect(login.ok(), `login failed: ${login.status()} ${await login.text()}`).toBeTruthy()
  262 |   return (await login.json()).accessToken as string
  263 | }
  264 | 
  265 | test.describe('a question says where it came from', () => {
  266 |   /* The rail order is the seeding order: PDF, PPTX, DOCX, topic, manual, deleted. */
  267 |   const ORDER = ['pdf', 'pptx', 'docx', 'topic', 'manual', 'unavailable'] as const
  268 |   const chip = (page: Page) => page.locator('[data-source-chip]')
  269 |   const select = async (page: Page, kind: (typeof ORDER)[number]) => {
  270 |     await page.locator('[data-question-thumb]').nth(ORDER.indexOf(kind)).click()
  271 |   }
  272 | 
  273 |   test('each citation is labelled in the vocabulary its source actually has', async ({ page }) => {
  274 |     const fixture = seedProvenance()
  275 |     await signIn(page, fixture.email, fixture.password)
  276 | 
  277 |     await page.goto(`/teacher/activities/${fixture.activityId}`)
  278 |     await expect(page.locator('[data-question-thumb]')).toHaveCount(6, { timeout: 15_000 })
  279 | 
  280 |     /* A PDF cites pages, and both cited pages are named. */
  281 |     await select(page, 'pdf')
  282 |     await expect(chip(page)).toHaveAttribute('data-source-chip', 'file', { timeout: 15_000 })
  283 |     await expect(chip(page)).toContainText('صفحة 1، 2')
  284 |     await expect(chip(page)).toContainText(fixture.questions.pdf.title!)
  285 |     /* A real button, named for a screen reader, and reachable from the keyboard. */
  286 |     await expect(chip(page)).toHaveRole('button')
  287 |     await expect(chip(page)).toHaveAttribute('aria-label', new RegExp(`^المصدر: صفحة 1، 2`))
  288 |     await chip(page).focus()
  289 |     await expect(chip(page)).toBeFocused()
  290 | 
  291 |     /* A presentation cites slides. */
  292 |     await select(page, 'pptx')
  293 |     await expect(chip(page)).toContainText('شريحة 2', { timeout: 15_000 })
  294 |     await expect(chip(page)).toContainText('Water cycle')
  295 | 
  296 |     /*
  297 |      * A DOCX has no genuine pagination, so its citation is a SECTION. This is
  298 |      * the assertion the whole locator vocabulary exists for: calling a Word
  299 |      * document's block "page 3" would be a number the teacher cannot find.
  300 |      */
  301 |     await select(page, 'docx')
  302 |     await expect(chip(page)).toContainText('مقطع', { timeout: 15_000 })
  303 |     await expect(chip(page)).not.toContainText('صفحة')
  304 | 
  305 |     /* No file behind it — a topic, not a citation. */
  306 |     await select(page, 'topic')
  307 |     await expect(chip(page)).toHaveAttribute('data-source-chip', 'topic', { timeout: 15_000 })
  308 |     await expect(chip(page)).toContainText('موضوع')
  309 | 
  310 |     /* Nothing recorded at all: written by hand. A hand-written question says
  311 |        nothing rather than wearing a label that names no source and opens
  312 |        nothing — so the absence of a chip is the assertion. */
  313 |     await select(page, 'manual')
  314 |     await expect(chip(page)).toHaveCount(0, { timeout: 15_000 })
  315 | 
  316 |     /* The material is gone; the citation stays, and says so honestly. */
```