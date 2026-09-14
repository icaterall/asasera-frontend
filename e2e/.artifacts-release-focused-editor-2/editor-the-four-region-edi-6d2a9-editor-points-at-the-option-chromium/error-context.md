# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: editor.spec.ts >> the four-region editor >> a blank answer is refused and the editor points at the option
- Location: e2e/editor.spec.ts:136:3

# Error details

```
Error: expect(locator).toHaveValue(expected) failed

Locator: getByLabel('نص الإجابة 4')
Expected: ""
Error: Not an input element

Call log:
  - Expect "toHaveValue" getByLabel('نص الإجابة 4') with timeout 5000ms
  - waiting for getByLabel('نص الإجابة 4')

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
      - generic [ref=e11]: تغييرات غير محفوظة
    - generic [ref=e12]:
      - 'button "الرصيد المتاح: 0. فتح الحساب والاستخدام" [ref=e13] [cursor=pointer]':
        - generic [ref=e17]:
          - strong [ref=e18]: "0"
          - generic [ref=e19]: أضف رصيدًا
      - button "قائمة الحساب — معلّم" [ref=e21] [cursor=pointer]:
        - generic [ref=e23]: T
    - group "أدوات النشاط" [ref=e24]:
      - button "حفظ" [ref=e25] [cursor=pointer]
      - button "تراجع" [ref=e30] [cursor=pointer]
      - button "إعدادات النشاط" [ref=e34] [cursor=pointer]
      - button "المزيد" [ref=e38] [cursor=pointer]
      - button "اعتماد النسخة" [ref=e43] [cursor=pointer]
  - navigation "أسئلة النشاط" [ref=e44]:
    - generic [ref=e45]:
      - generic [ref=e46]:
        - button "تكرار السؤال" [ref=e47] [cursor=pointer]
        - button "حذف السؤال" [ref=e51] [cursor=pointer]
      - generic [ref=e55]:
        - paragraph [ref=e56]:
          - generic [ref=e57]: 1 اختبار
        - button "ما عاصمة فرنسا؟" [ref=e58] [cursor=pointer]
    - generic [ref=e65]:
      - button "أضف سؤالًا" [ref=e66] [cursor=pointer]
      - button "توليد بالذكاء الاصطناعي" [ref=e67] [cursor=pointer]
      - paragraph [ref=e71]: من موضوع أو من مصادرك المرفوعة.
  - main [ref=e72]:
    - generic [ref=e73]:
      - textbox "نص السؤال" [ref=e76]:
        - paragraph [ref=e77]: ما عاصمة فرنسا؟
      - button "صورة السؤال (اختياري)" [ref=e79] [cursor=pointer]:
        - generic [ref=e83]: ابحث عن وسائط وأدرجها (اختياري)
        - generic [ref=e84]: ارفع ملفًا أو اسحبه إلى هنا
      - generic [ref=e85]:
        - generic [ref=e87]:
          - button "احذف الإجابة 1" [ref=e92] [cursor=pointer]
          - textbox "نص الإجابة 1" [ref=e99]:
            - paragraph [ref=e100]: باريس
          - generic [ref=e101]:
            - generic "الإجابة الصحيحة" [ref=e102] [cursor=pointer]:
              - radio "الإجابة 1 هي الصحيحة" [checked] [ref=e103]
            - button "صورة الإجابة" [ref=e104] [cursor=pointer]
        - generic [ref=e110]:
          - button "احذف الإجابة 2" [ref=e115] [cursor=pointer]
          - textbox "نص الإجابة 2" [ref=e122]:
            - paragraph [ref=e123]: لندن
          - generic [ref=e124]:
            - generic "الإجابة الصحيحة" [ref=e125] [cursor=pointer]:
              - radio "الإجابة 2 هي الصحيحة" [ref=e126]
            - button "صورة الإجابة" [ref=e127] [cursor=pointer]
        - generic [ref=e133]:
          - button "احذف الإجابة 3" [ref=e138] [cursor=pointer]
          - generic [ref=e143]:
            - toolbar "تنسيق النص" [ref=e145]:
              - button "عريض" [ref=e146] [cursor=pointer]
              - button "مائل" [ref=e149] [cursor=pointer]
              - button "نص سفلي" [ref=e152] [cursor=pointer]
              - button "نص علوي" [ref=e157] [cursor=pointer]
              - button "رموز" [ref=e162] [cursor=pointer]
              - button "معادلة" [ref=e165] [cursor=pointer]
            - textbox "نص الإجابة 3" [active] [ref=e170]:
              - paragraph [ref=e171]: برلين
          - generic [ref=e172]:
            - generic "الإجابة الصحيحة" [ref=e173] [cursor=pointer]:
              - radio "الإجابة 3 هي الصحيحة" [ref=e174]
            - button "صورة الإجابة" [ref=e175] [cursor=pointer]
        - generic [ref=e181]:
          - button "احذف الإجابة 4" [ref=e186] [cursor=pointer]
          - textbox "نص الإجابة 4" [ref=e193]:
            - text: أضف إجابة 4
            - paragraph [ref=e194]
          - button "صورة الإجابة" [ref=e196] [cursor=pointer]
      - button "أضف إجابة أخرى" [ref=e202] [cursor=pointer]
      - generic [ref=e204]:
        - generic [ref=e205]: التفسير (اختياري)
        - textbox "التفسير (اختياري)" [ref=e206]:
          - /placeholder: لماذا هذه الإجابة صحيحة؟ يظهر للطلاب بعد انتهاء وقت الإجابة.
  - complementary "خصائص السؤال" [ref=e207]:
    - generic [ref=e208]:
      - heading "خصائص السؤال" [level=2] [ref=e209]
      - button "طيّ الخصائص" [expanded] [ref=e210] [cursor=pointer]
    - tablist "لوحة الجانب" [ref=e214]:
      - tab "خصائص السؤال" [selected] [ref=e215] [cursor=pointer]
      - tab "المظاهر" [ref=e218] [cursor=pointer]
    - generic [ref=e226]:
      - generic [ref=e227]: نوع السؤال
      - button "نوع السؤال" [ref=e231] [cursor=pointer]:
        - strong [ref=e238]: اختبار
    - generic [ref=e241]:
      - generic [ref=e242]: الوقت المحدد
      - combobox "مدة السؤال بالثواني" [ref=e246] [cursor=pointer]:
        - generic [ref=e247]: 20 ثانية
      - textbox [aria-hidden] [ref=e251]: "20"
      - button "تطبيق على جميع الأسئلة" [ref=e252] [cursor=pointer]
    - generic [ref=e253]:
      - generic [ref=e254]: النقاط
      - combobox "النقاط" [ref=e261] [cursor=pointer]:
        - generic [ref=e262]: قياسي
      - textbox [aria-hidden] [ref=e266]: "1"
    - generic [ref=e267]:
      - button "تكرار السؤال" [ref=e268] [cursor=pointer]
      - button "حذف السؤال" [ref=e269] [cursor=pointer]
```

# Test source

```ts
  49  |   })
  50  |   expect(res.ok(), `create failed: ${res.status()} ${await res.text()}`).toBeTruthy()
  51  |   return (await res.json()).activity.id as number
  52  | }
  53  | 
  54  | async function addQuiz(page:Page){
  55  |   await page.getByRole('button',{name:'أضف سؤالًا',exact:true}).first().click()
  56  |   await page.getByRole('dialog',{name:'ما نوع السؤال الجديد؟'}).getByRole('button',{name:'اختبار',exact:true}).click()
  57  | }
  58  | 
  59  | test.describe('the four-region editor', () => {
  60  |   test('a teacher authors and publishes five questions without opening the properties panel', async ({ page }) => {
  61  |     const { accessToken } = await signInAsNewTeacher(page)
  62  |     const activityId = await createActivity(page, accessToken)
  63  | 
  64  | 
  65  | 
  66  |     await page.goto(`/teacher/activities/${activityId}`)
  67  |     await expect(page.getByLabel('عنوان النشاط')).toHaveValue('عواصم أوروبا', { timeout: 15_000 })
  68  | 
  69  |     const QUESTIONS = [
  70  |       { prompt: 'ما عاصمة فرنسا؟', answers: ['باريس', 'لندن', 'برلين', 'مدريد'] },
  71  |       { prompt: 'ما عاصمة إيطاليا؟', answers: ['روما', 'ميلانو', 'نابولي', 'تورينو'] },
  72  |       { prompt: 'ما عاصمة إسبانيا؟', answers: ['مدريد', 'برشلونة', 'إشبيلية', 'فالنسيا'] },
  73  |       { prompt: 'ما عاصمة ألمانيا؟', answers: ['برلين', 'ميونخ', 'هامبورغ', 'كولونيا'] },
  74  |       { prompt: 'ما عاصمة البرتغال؟', answers: ['لشبونة', 'بورتو', 'براغا', 'فارو'] },
  75  |     ]
  76  | 
  77  |     /* The thumbnails only — the rail also holds Add and Generate. */
  78  |     const thumbs = page.locator('[data-question-thumb]')
  79  | 
  80  |     for (const [index, question] of QUESTIONS.entries()) {
  81  |       await addQuiz(page)
  82  | 
  83  |       /*
  84  |        * Wait for the new question to BE the active one before typing.
  85  |        *
  86  |        * Clicking Add is a round trip; without this the next `fill` can land in
  87  |        * the previous question's textarea, and the test then reports a data-loss
  88  |        * bug the product does not have. Asserting the rail count and the empty
  89  |        * prompt is what "the new question is ready" actually means.
  90  |        */
  91  |       await expect(thumbs).toHaveCount(index + 1)
  92  |       await expect(page.getByLabel('نص السؤال')).toHaveValue('')
  93  | 
  94  |       await page.getByLabel('نص السؤال').fill(question.prompt)
  95  | 
  96  |       for (const [slot, answer] of question.answers.entries()) {
  97  |         await page.getByLabel(`نص الإجابة ${slot + 1}`).fill(answer)
  98  |       }
  99  | 
  100 |     }
  101 | 
  102 |     /*
  103 |      * The acceptance criterion, stated precisely.
  104 |      *
  105 |      * §12 asks for four FIXED regions, so on a desktop the properties rail is
  106 |      * visible by design — "without opening it" cannot mean "hidden". What it
  107 |      * means is that the teacher never had to go there: nothing above touched
  108 |      * region 4, and every default it holds is still the default.
  109 |      *
  110 |      * Asserted on the server's own rows further down: five questions, all
  111 |      * `mcq`, all 20 seconds, none of it ever supplied by this test.
  112 |      */
  113 |     const propertiesRail = page.getByLabel('خصائص السؤال')
  114 |     /* The type control is the design-system Select (a combobox), which exposes its value as data-select-value. */
  115 |     await expect(propertiesRail.getByLabel('نوع السؤال',{exact:true}).first()).toHaveAttribute('data-question-kind','mcq')
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
> 149 |     await expect(page.getByLabel('نص الإجابة 4')).toHaveValue('')
      |                                                   ^ Error: expect(locator).toHaveValue(expected) failed
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
  216 |     await expect(page.getByLabel('نص السؤال')).toHaveValue('نص لا يجب أن يُفقد')
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
```