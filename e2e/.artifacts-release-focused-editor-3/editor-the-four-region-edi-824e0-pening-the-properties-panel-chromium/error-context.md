# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: editor.spec.ts >> the four-region editor >> a teacher authors and publishes five questions without opening the properties panel
- Location: e2e/editor.spec.ts:60:3

# Error details

```
Error: expect(locator).toHaveValue(expected) failed

Locator: getByLabel('خصائص السؤال').getByLabel('مدة السؤال بالثواني')
Expected: "20"
Error: Not an input element

Call log:
  - Expect "toHaveValue" getByLabel('خصائص السؤال').getByLabel('مدة السؤال بالثواني') with timeout 5000ms
  - waiting for getByLabel('خصائص السؤال').getByLabel('مدة السؤال بالثواني')

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
    - generic [ref=e47]:
      - paragraph [ref=e48]:
        - generic [ref=e49]: 1 اختبار
      - button "ما عاصمة فرنسا؟" [ref=e50] [cursor=pointer]
    - generic [ref=e59]:
      - paragraph [ref=e60]:
        - generic [ref=e61]: 2 اختبار
      - button "ما عاصمة إيطاليا؟" [ref=e62] [cursor=pointer]
    - generic [ref=e71]:
      - paragraph [ref=e72]:
        - generic [ref=e73]: 3 اختبار
      - button "ما عاصمة إسبانيا؟" [ref=e74] [cursor=pointer]
    - generic [ref=e83]:
      - paragraph [ref=e84]:
        - generic [ref=e85]: 4 اختبار
      - button "ما عاصمة ألمانيا؟" [ref=e86] [cursor=pointer]
    - generic [ref=e93]:
      - generic [ref=e94]:
        - button "انقل السؤال للأعلى" [ref=e95] [cursor=pointer]
        - button "انقل السؤال للأسفل" [disabled] [ref=e98]
        - button "تكرار السؤال" [ref=e101] [cursor=pointer]
        - button "حذف السؤال" [ref=e105] [cursor=pointer]
      - generic [ref=e109]:
        - paragraph [ref=e110]:
          - generic [ref=e111]: 5 اختبار
        - button "ما عاصمة البرتغال؟" [ref=e112] [cursor=pointer]
    - generic [ref=e119]:
      - button "أضف سؤالًا" [ref=e120] [cursor=pointer]
      - button "توليد بالذكاء الاصطناعي" [ref=e121] [cursor=pointer]
      - paragraph [ref=e125]: من موضوع أو من مصادرك المرفوعة.
  - main [ref=e126]:
    - generic [ref=e127]:
      - textbox "نص السؤال" [ref=e130]:
        - paragraph [ref=e131]: ما عاصمة البرتغال؟
      - button "صورة السؤال (اختياري)" [ref=e133] [cursor=pointer]:
        - generic [ref=e137]: ابحث عن وسائط وأدرجها (اختياري)
        - generic [ref=e138]: ارفع ملفًا أو اسحبه إلى هنا
      - generic [ref=e139]:
        - generic [ref=e141]:
          - button "احذف الإجابة 1" [ref=e146] [cursor=pointer]
          - textbox "نص الإجابة 1" [ref=e153]:
            - paragraph [ref=e154]: لشبونة
          - generic [ref=e155]:
            - generic "الإجابة الصحيحة" [ref=e156] [cursor=pointer]:
              - radio "الإجابة 1 هي الصحيحة" [checked] [ref=e157]
            - button "صورة الإجابة" [ref=e158] [cursor=pointer]
        - generic [ref=e164]:
          - button "احذف الإجابة 2" [ref=e169] [cursor=pointer]
          - textbox "نص الإجابة 2" [ref=e176]:
            - paragraph [ref=e177]: بورتو
          - generic [ref=e178]:
            - generic "الإجابة الصحيحة" [ref=e179] [cursor=pointer]:
              - radio "الإجابة 2 هي الصحيحة" [ref=e180]
            - button "صورة الإجابة" [ref=e181] [cursor=pointer]
        - generic [ref=e187]:
          - button "احذف الإجابة 3" [ref=e192] [cursor=pointer]
          - textbox "نص الإجابة 3" [ref=e199]:
            - paragraph [ref=e200]: براغا
          - generic [ref=e201]:
            - generic "الإجابة الصحيحة" [ref=e202] [cursor=pointer]:
              - radio "الإجابة 3 هي الصحيحة" [ref=e203]
            - button "صورة الإجابة" [ref=e204] [cursor=pointer]
        - generic [ref=e210]:
          - button "احذف الإجابة 4" [ref=e215] [cursor=pointer]
          - generic [ref=e220]:
            - toolbar "تنسيق النص" [ref=e222]:
              - button "عريض" [ref=e223] [cursor=pointer]
              - button "مائل" [ref=e226] [cursor=pointer]
              - button "نص سفلي" [ref=e229] [cursor=pointer]
              - button "نص علوي" [ref=e234] [cursor=pointer]
              - button "رموز" [ref=e239] [cursor=pointer]
              - button "معادلة" [ref=e242] [cursor=pointer]
            - textbox "نص الإجابة 4" [active] [ref=e247]:
              - paragraph [ref=e248]: فارو
          - generic [ref=e249]:
            - generic "الإجابة الصحيحة" [ref=e250] [cursor=pointer]:
              - radio "الإجابة 4 هي الصحيحة" [ref=e251]
            - button "صورة الإجابة" [ref=e252] [cursor=pointer]
      - button "أضف إجابة أخرى" [ref=e258] [cursor=pointer]
      - generic [ref=e260]:
        - generic [ref=e261]: التفسير (اختياري)
        - textbox "التفسير (اختياري)" [ref=e262]:
          - /placeholder: لماذا هذه الإجابة صحيحة؟ يظهر للطلاب بعد انتهاء وقت الإجابة.
  - complementary "خصائص السؤال" [ref=e263]:
    - generic [ref=e264]:
      - heading "خصائص السؤال" [level=2] [ref=e265]
      - button "طيّ الخصائص" [expanded] [ref=e266] [cursor=pointer]
    - tablist "لوحة الجانب" [ref=e270]:
      - tab "خصائص السؤال" [selected] [ref=e271] [cursor=pointer]
      - tab "المظاهر" [ref=e274] [cursor=pointer]
    - generic [ref=e282]:
      - generic [ref=e283]: نوع السؤال
      - button "نوع السؤال" [ref=e287] [cursor=pointer]:
        - strong [ref=e294]: اختبار
    - generic [ref=e297]:
      - generic [ref=e298]: الوقت المحدد
      - combobox "مدة السؤال بالثواني" [ref=e302] [cursor=pointer]:
        - generic [ref=e303]: 20 ثانية
      - textbox [aria-hidden] [ref=e307]: "20"
      - button "تطبيق على جميع الأسئلة" [ref=e308] [cursor=pointer]
    - generic [ref=e309]:
      - generic [ref=e310]: النقاط
      - combobox "النقاط" [ref=e317] [cursor=pointer]:
        - generic [ref=e318]: قياسي
      - textbox [aria-hidden] [ref=e322]: "1"
    - generic [ref=e323]:
      - button "للأعلى" [ref=e325] [cursor=pointer]
      - button "تكرار السؤال" [ref=e328] [cursor=pointer]
      - button "حذف السؤال" [ref=e329] [cursor=pointer]
```

# Test source

```ts
  16  |  *
  17  |  * Needs the dev API on 4100 and vite on 5199 (see CHECKPOINT.md).
  18  |  */
  19  | 
  20  | /*
  21  |  * Auth goes through THE PAGE'S OWN ORIGIN, not the API's.
  22  |  *
  23  |  * The refresh token is an httpOnly cookie (§19). A cookie set by a request to
  24  |  * 127.0.0.1:4100 is not sent by a page on 127.0.0.1:5199, so signing in
  25  |  * against the API directly leaves the app signed out and the guard bounces to
  26  |  * /login. Vite proxies /api/v1 for exactly this reason — the note in
  27  |  * vite.config.ts says so — and going through the proxy means the browser holds
  28  |  * the same cookie the real app would, and boots via the same silent refresh.
  29  |  *
  30  |  * Nothing here fakes a session.
  31  |  */
  32  | const API = '/api/v1'
  33  | 
  34  | async function signInAsNewTeacher(page: Page) {
  35  |   await page.addInitScript(()=>{localStorage.setItem('asasera.language','ar');localStorage.setItem('i18nextLng','ar')})
  36  |   const {email,password}=localTeacher()
  37  | 
  38  |   const login = await page.request.post(`${API}/auth/login`, { data: { email, password } })
  39  |   expect(login.ok(), `login failed: ${login.status()}`).toBeTruthy()
  40  |   const { accessToken } = await login.json()
  41  |   return { email, accessToken }
  42  | }
  43  | 
  44  | /** Creates the activity over the API — this test is about the EDITOR. */
  45  | async function createActivity(page: Page, accessToken: string) {
  46  |   const res = await page.request.post(`${API}/activities`, {
  47  |     headers: { authorization: `Bearer ${accessToken}` },
  48  |     data: { title: 'عواصم أوروبا', subjectId: 9, levelId: 8, purposeId: 2 },
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
  92  |       await expect(page.getByLabel('نص السؤال')).toHaveText('')
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
> 116 |     await expect(propertiesRail.getByLabel('مدة السؤال بالثواني')).toHaveValue('20')
      |                                                                    ^ Error: expect(locator).toHaveValue(expected) failed
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
  146 |     await page.getByLabel('نص الإجابة 3').fill('برلين')
  147 |     // The first two options are required. Later empty slots are authoring
  148 |     // placeholders and are deliberately removed during approval.
  149 |     await expect(page.getByLabel('نص الإجابة 2')).toHaveText('')
  150 | 
  151 |     await page.getByRole('button', { name: 'اعتماد النسخة' }).click()
  152 | 
  153 |     const alert = page.getByRole('alert').first()
  154 |     await expect(alert).toBeVisible({ timeout: 15_000 })
  155 |     // The message names the exact option, not just "incomplete".
  156 |     await expect(alert).toContainText('opt_b')
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
  216 |     await expect(page.getByLabel('نص السؤال')).toHaveText('نص لا يجب أن يُفقد')
```