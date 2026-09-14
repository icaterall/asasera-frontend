# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: editor.spec.ts >> the four-region editor >> a blank answer is refused and the editor points at the option
- Location: e2e/editor.spec.ts:130:3

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
  35  |   const {email,password}=localTeacher()
  36  | 
  37  |   const login = await page.request.post(`${API}/auth/login`, { data: { email, password } })
  38  |   expect(login.ok(), `login failed: ${login.status()}`).toBeTruthy()
  39  |   const { accessToken } = await login.json()
  40  |   return { email, accessToken }
  41  | }
  42  | 
  43  | /** Creates the activity over the API — this test is about the EDITOR. */
  44  | async function createActivity(page: Page, accessToken: string) {
  45  |   const res = await page.request.post(`${API}/activities`, {
  46  |     headers: { authorization: `Bearer ${accessToken}` },
  47  |     data: { title: 'عواصم أوروبا', subjectId: 9, levelId: 8, purposeId: 2 },
  48  |   })
  49  |   expect(res.ok(), `create failed: ${res.status()} ${await res.text()}`).toBeTruthy()
  50  |   return (await res.json()).activity.id as number
  51  | }
  52  | 
  53  | test.describe('the four-region editor', () => {
  54  |   test('a teacher authors and publishes five questions without opening the properties panel', async ({ page }) => {
  55  |     const { accessToken } = await signInAsNewTeacher(page)
  56  |     const activityId = await createActivity(page, accessToken)
  57  | 
  58  | 
  59  | 
  60  |     await page.goto(`/teacher/activities/${activityId}`)
  61  |     await expect(page.getByLabel('عنوان النشاط')).toHaveValue('عواصم أوروبا', { timeout: 15_000 })
  62  | 
  63  |     const QUESTIONS = [
  64  |       { prompt: 'ما عاصمة فرنسا؟', answers: ['باريس', 'لندن', 'برلين', 'مدريد'] },
  65  |       { prompt: 'ما عاصمة إيطاليا؟', answers: ['روما', 'ميلانو', 'نابولي', 'تورينو'] },
  66  |       { prompt: 'ما عاصمة إسبانيا؟', answers: ['مدريد', 'برشلونة', 'إشبيلية', 'فالنسيا'] },
  67  |       { prompt: 'ما عاصمة ألمانيا؟', answers: ['برلين', 'ميونخ', 'هامبورغ', 'كولونيا'] },
  68  |       { prompt: 'ما عاصمة البرتغال؟', answers: ['لشبونة', 'بورتو', 'براغا', 'فارو'] },
  69  |     ]
  70  | 
  71  |     /* The thumbnails only — the rail also holds Add and Generate. */
  72  |     const thumbs = page.locator('[data-question-thumb]')
  73  | 
  74  |     for (const [index, question] of QUESTIONS.entries()) {
  75  |       await page.getByRole('button', { name: 'أضف سؤالًا' }).first().click()
  76  | 
  77  |       /*
  78  |        * Wait for the new question to BE the active one before typing.
  79  |        *
  80  |        * Clicking Add is a round trip; without this the next `fill` can land in
  81  |        * the previous question's textarea, and the test then reports a data-loss
  82  |        * bug the product does not have. Asserting the rail count and the empty
  83  |        * prompt is what "the new question is ready" actually means.
  84  |        */
  85  |       await expect(thumbs).toHaveCount(index + 1)
  86  |       await expect(page.getByLabel('نص السؤال')).toHaveValue('')
  87  | 
  88  |       await page.getByLabel('نص السؤال').fill(question.prompt)
  89  | 
  90  |       for (const [slot, answer] of question.answers.entries()) {
  91  |         await page.getByLabel(`نص الإجابة ${slot + 1}`).fill(answer)
  92  |       }
  93  | 
  94  |     }
  95  | 
  96  |     /*
  97  |      * The acceptance criterion, stated precisely.
  98  |      *
  99  |      * §12 asks for four FIXED regions, so on a desktop the properties rail is
  100 |      * visible by design — "without opening it" cannot mean "hidden". What it
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
> 135 |     await expect(page.getByLabel('عنوان النشاط')).toBeVisible({ timeout: 15_000 })
      |                                                   ^ Error: expect(locator).toBeVisible() failed
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
```