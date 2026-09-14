# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: editor.spec.ts >> the four-region editor >> a teacher authors and publishes five questions without opening the properties panel
- Location: e2e/editor.spec.ts:60:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: 'ابدأ حصة مباشرة' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('button', { name: 'ابدأ حصة مباشرة' }) with timeout 5000ms
  - waiting for getByRole('button', { name: 'ابدأ حصة مباشرة' })

```

```yaml
- banner "شريط المحرر":
  - link "أساسيرا — لوحة التحكم":
    - /url: /teacher/dashboard
    - img "أساسيرا"
  - heading "عواصم أوروبا" [level=1]
  - textbox "عنوان النشاط": عواصم أوروبا
  - text: محفوظ
  - 'button "الرصيد المتاح: 0. فتح الحساب والاستخدام"':
    - strong: "0"
    - text: أضف رصيدًا
  - button "قائمة الحساب — معلّم"
  - group "أدوات النشاط":
    - button "حفظ" [disabled]
    - button "تراجع"
    - button "إعدادات النشاط"
    - button "المزيد"
    - button "اعتماد التغييرات"
- navigation "أسئلة النشاط":
  - paragraph: 1 اختبار
  - button "ما عاصمة فرنسا؟"
  - paragraph: 2 اختبار
  - button "ما عاصمة إيطاليا؟"
  - paragraph: 3 اختبار
  - button "ما عاصمة إسبانيا؟"
  - paragraph: 4 اختبار
  - button "ما عاصمة ألمانيا؟"
  - button "انقل السؤال للأعلى"
  - button "انقل السؤال للأسفل" [disabled]
  - button "تكرار السؤال"
  - button "حذف السؤال"
  - paragraph: 5 اختبار
  - button "ما عاصمة البرتغال؟"
  - button "أضف سؤالًا"
  - button "توليد بالذكاء الاصطناعي"
  - paragraph: من موضوع أو من مصادرك المرفوعة.
- main:
  - textbox "نص السؤال":
    - paragraph: ما عاصمة البرتغال؟
  - button "صورة السؤال (اختياري)": ابحث عن وسائط وأدرجها (اختياري) ارفع ملفًا أو اسحبه إلى هنا
  - button "احذف الإجابة 1"
  - textbox "نص الإجابة 1":
    - paragraph: لشبونة
  - radio "الإجابة 1 هي الصحيحة" [checked]
  - button "صورة الإجابة"
  - button "احذف الإجابة 2"
  - textbox "نص الإجابة 2":
    - paragraph: بورتو
  - radio "الإجابة 2 هي الصحيحة"
  - button "صورة الإجابة"
  - button "احذف الإجابة 3"
  - textbox "نص الإجابة 3":
    - paragraph: براغا
  - radio "الإجابة 3 هي الصحيحة"
  - button "صورة الإجابة"
  - button "احذف الإجابة 4"
  - textbox "نص الإجابة 4":
    - paragraph: فارو
  - radio "الإجابة 4 هي الصحيحة"
  - button "صورة الإجابة"
  - button "أضف إجابة أخرى"
  - text: التفسير (اختياري)
  - textbox "التفسير (اختياري)":
    - /placeholder: لماذا هذه الإجابة صحيحة؟ يظهر للطلاب بعد انتهاء وقت الإجابة.
- complementary "خصائص السؤال":
  - heading "خصائص السؤال" [level=2]
  - button "طيّ الخصائص" [expanded]
  - tablist "لوحة الجانب":
    - tab "خصائص السؤال" [selected]
    - tab "المظاهر"
  - text: نوع السؤال
  - button "نوع السؤال":
    - strong: اختبار
  - text: الوقت المحدد
  - combobox "مدة السؤال بالثواني": 20 ثانية
  - button "تطبيق على جميع الأسئلة"
  - text: النقاط
  - combobox "النقاط": قياسي
  - button "للأعلى"
  - button "تكرار السؤال"
  - button "حذف السؤال"
```

# Test source

```ts
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
  116 |     await expect(propertiesRail.getByLabel('مدة السؤال بالثواني')).toHaveAttribute('data-select-value','20')
  117 | 
  118 |     await page.getByRole('button', { name: 'اعتماد النسخة' }).click()
  119 | 
  120 |     await expect(page.getByRole('button', { name: 'اعتماد التغييرات' })).toBeVisible({ timeout: 15_000 })
> 121 |     await expect(page.getByRole('button', { name: 'ابدأ حصة مباشرة' })).toBeVisible()
      |                                                                         ^ Error: expect(locator).toBeVisible() failed
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
  217 | 
  218 |     await page.getByRole('button', { name: 'أعد المحاولة' }).click()
  219 |     await expect(page.getByText('محفوظ', { exact: true })).toBeVisible({ timeout: 15_000 })
  220 | 
  221 |     // And the server really has it.
```