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

Locator: getByLabel('نص السؤال')
Expected: ""
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
    - generic [ref=e11]:
      - 'button "الرصيد المتاح: 0. فتح الحساب والاستخدام" [ref=e12] [cursor=pointer]':
        - generic [ref=e16]:
          - strong [ref=e17]: "0"
          - generic [ref=e18]: أضف رصيدًا
      - button "قائمة الحساب — معلّم" [ref=e20] [cursor=pointer]:
        - generic [ref=e22]: T
    - group "أدوات النشاط" [ref=e23]:
      - button "حفظ" [disabled] [ref=e24]
      - button "تراجع" [disabled] [ref=e29]
      - button "إعدادات النشاط" [ref=e33] [cursor=pointer]
      - button "المزيد" [ref=e37] [cursor=pointer]
      - button "اعتماد النسخة" [ref=e42] [cursor=pointer]
  - navigation "أسئلة النشاط" [ref=e43]:
    - generic [ref=e44]:
      - generic [ref=e45]:
        - button "تكرار السؤال" [ref=e46] [cursor=pointer]
        - button "حذف السؤال" [ref=e50] [cursor=pointer]
      - generic [ref=e54]:
        - paragraph [ref=e55]:
          - generic [ref=e56]: 1 اختبار
        - button "سؤال بلا نص" [ref=e57] [cursor=pointer]
    - generic [ref=e64]:
      - button "أضف سؤالًا" [ref=e65] [cursor=pointer]
      - button "توليد بالذكاء الاصطناعي" [ref=e66] [cursor=pointer]
      - paragraph [ref=e70]: من موضوع أو من مصادرك المرفوعة.
  - main [ref=e71]:
    - generic [ref=e72]:
      - generic [ref=e73]:
        - toolbar "تنسيق النص" [ref=e75]:
          - button "عريض" [ref=e76] [cursor=pointer]
          - button "مائل" [ref=e79] [cursor=pointer]
          - button "نص سفلي" [ref=e82] [cursor=pointer]
          - button "نص علوي" [ref=e87] [cursor=pointer]
          - button "رموز" [ref=e92] [cursor=pointer]
          - button "معادلة" [ref=e95] [cursor=pointer]
        - textbox "نص السؤال" [active] [ref=e100]:
          - text: اكتب السؤال هنا
          - paragraph [ref=e101]
      - button "صورة السؤال (اختياري)" [ref=e103] [cursor=pointer]:
        - generic [ref=e107]: ابحث عن وسائط وأدرجها (اختياري)
        - generic [ref=e108]: ارفع ملفًا أو اسحبه إلى هنا
      - generic [ref=e109]:
        - generic [ref=e111]:
          - button "احذف الإجابة 1" [ref=e116] [cursor=pointer]
          - textbox "نص الإجابة 1" [ref=e123]:
            - text: أضف إجابة 1
            - paragraph [ref=e124]
          - button "صورة الإجابة" [ref=e126] [cursor=pointer]
        - generic [ref=e132]:
          - button "احذف الإجابة 2" [ref=e137] [cursor=pointer]
          - textbox "نص الإجابة 2" [ref=e144]:
            - text: أضف إجابة 2
            - paragraph [ref=e145]
          - button "صورة الإجابة" [ref=e147] [cursor=pointer]
        - generic [ref=e153]:
          - button "احذف الإجابة 3" [ref=e158] [cursor=pointer]
          - textbox "نص الإجابة 3" [ref=e165]:
            - text: أضف إجابة 3
            - paragraph [ref=e166]
          - button "صورة الإجابة" [ref=e168] [cursor=pointer]
        - generic [ref=e174]:
          - button "احذف الإجابة 4" [ref=e179] [cursor=pointer]
          - textbox "نص الإجابة 4" [ref=e186]:
            - text: أضف إجابة 4
            - paragraph [ref=e187]
          - button "صورة الإجابة" [ref=e189] [cursor=pointer]
      - button "أضف إجابة أخرى" [ref=e195] [cursor=pointer]
      - generic [ref=e197]:
        - generic [ref=e198]: التفسير (اختياري)
        - textbox "التفسير (اختياري)" [ref=e199]:
          - /placeholder: لماذا هذه الإجابة صحيحة؟ يظهر للطلاب بعد انتهاء وقت الإجابة.
  - complementary "خصائص السؤال" [ref=e200]:
    - generic [ref=e201]:
      - heading "خصائص السؤال" [level=2] [ref=e202]
      - button "طيّ الخصائص" [expanded] [ref=e203] [cursor=pointer]
    - tablist "لوحة الجانب" [ref=e207]:
      - tab "خصائص السؤال" [selected] [ref=e208] [cursor=pointer]
      - tab "المظاهر" [ref=e211] [cursor=pointer]
    - generic [ref=e219]:
      - generic [ref=e220]: نوع السؤال
      - button "نوع السؤال" [ref=e224] [cursor=pointer]:
        - strong [ref=e231]: اختبار
    - generic [ref=e234]:
      - generic [ref=e235]: الوقت المحدد
      - combobox "مدة السؤال بالثواني" [ref=e239] [cursor=pointer]:
        - generic [ref=e240]: 20 ثانية
      - textbox [aria-hidden] [ref=e244]: "20"
      - button "تطبيق على جميع الأسئلة" [ref=e245] [cursor=pointer]
    - generic [ref=e246]:
      - generic [ref=e247]: النقاط
      - combobox "النقاط" [ref=e254] [cursor=pointer]:
        - generic [ref=e255]: قياسي
      - textbox [aria-hidden] [ref=e259]: "1"
    - generic [ref=e260]:
      - button "تكرار السؤال" [ref=e261] [cursor=pointer]
      - button "حذف السؤال" [ref=e262] [cursor=pointer]
```

# Test source

```ts
  1   | import {execFileSync} from 'node:child_process'
  2   | import {randomUUID} from 'node:crypto'
  3   | import {readFileSync,unlinkSync} from 'node:fs'
  4   | import path from 'node:path'
  5   | import {localTeacher} from './local-fixture'
  6   | import { expect, test, type Page } from '@playwright/test'
  7   | 
  8   | /**
  9   |  * W03 acceptance, in a browser — §16 p26:
  10  |  *   «معلّم يؤلّف نشاطًا من خمسة أسئلة وينشره دون فتح لوحة الخصائص.»
  11  |  *   A teacher authors a five-question activity and approves it WITHOUT
  12  |  *   opening the properties panel.
  13  |  *
  14  |  * The "without" is the point, so this test never touches region 4. If a
  15  |  * default is missing, the publish at the end fails and the test says so.
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
> 92  |       await expect(page.getByLabel('نص السؤال')).toHaveValue('')
      |                                                  ^ Error: expect(locator).toHaveValue(expected) failed
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
```