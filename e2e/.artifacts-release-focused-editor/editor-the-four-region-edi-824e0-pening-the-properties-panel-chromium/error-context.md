# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: editor.spec.ts >> the four-region editor >> a teacher authors and publishes five questions without opening the properties panel
- Location: e2e/editor.spec.ts:55:3

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  locator('[data-question-thumb]')
Expected: 1
Received: 0
Timeout:  5000ms

Call log:
  - Expect "toHaveCount" locator('[data-question-thumb]') with timeout 5000ms
  - waiting for locator('[data-question-thumb]')
    14 × locator resolved to 0 elements
       - unexpected value "0"

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
      - button "إعدادات النشاط" [ref=e24] [cursor=pointer]
      - button "المزيد" [ref=e28] [cursor=pointer]
      - button "اعتماد النسخة" [ref=e33] [cursor=pointer]
  - dialog "ما نوع السؤال الجديد؟" [ref=e34]:
    - banner [ref=e35]:
      - heading "ما نوع السؤال الجديد؟" [level=2] [ref=e36]
      - button "إغلاق" [ref=e37] [cursor=pointer]
    - generic [ref=e41]:
      - generic [ref=e42]:
        - heading "اختبر المعرفة" [level=3] [ref=e43]
        - generic [ref=e44]:
          - button [active] [ref=e45] [cursor=pointer]:
            - strong [ref=e52]: اختبار
          - button [ref=e53] [cursor=pointer]:
            - strong [ref=e58]: صح أو خطأ
          - button "كتابة الإجابة غير متاح بعد" [disabled] [ref=e59]:
            - strong [ref=e65]: كتابة الإجابة
            - generic [ref=e66]: غير متاح بعد
          - button "شريط التمرير غير متاح بعد" [disabled] [ref=e67]:
            - strong [ref=e79]: شريط التمرير
            - generic [ref=e80]: غير متاح بعد
          - button [ref=e81] [cursor=pointer]:
            - strong [ref=e86]: تحديد الإجابة
          - button [ref=e87] [cursor=pointer]:
            - strong [ref=e96]: رتّب
          - button [ref=e97] [cursor=pointer]:
            - strong [ref=e103]: أكمل الجملة
      - generic [ref=e104]:
        - heading "اجمع الآراء" [level=3] [ref=e105]
        - generic [ref=e106]:
          - button [ref=e107] [cursor=pointer]:
            - strong [ref=e113]: مناقشة
          - button "استطلاع غير متاح بعد" [disabled] [ref=e114]:
            - strong [ref=e119]: استطلاع
            - generic [ref=e120]: غير متاح بعد
          - button "مقياس غير متاح بعد" [disabled] [ref=e121]:
            - strong [ref=e127]: مقياس
            - generic [ref=e128]: غير متاح بعد
          - button "وضع دبوس غير متاح بعد" [disabled] [ref=e129]:
            - strong [ref=e134]: وضع دبوس
            - generic [ref=e135]: غير متاح بعد
      - generic [ref=e136]:
        - heading "أنواع إضافية" [level=3] [ref=e137]
        - generic [ref=e138]:
          - button [ref=e139] [cursor=pointer]:
            - strong [ref=e145]: مطابقة
          - button [ref=e146] [cursor=pointer]:
            - strong [ref=e152]: كلمات
  - navigation "أسئلة النشاط" [ref=e153]:
    - generic [ref=e154]:
      - button "أضف سؤالًا" [ref=e155] [cursor=pointer]
      - button "توليد بالذكاء الاصطناعي" [ref=e156] [cursor=pointer]
      - paragraph [ref=e160]: من موضوع أو من مصادرك المرفوعة.
  - main [ref=e161]:
    - generic [ref=e163]:
      - heading "لا أسئلة بعد" [level=3] [ref=e167]
      - paragraph [ref=e168]: أضف سؤالًا لتبدأ. النوع والمؤقّت مضبوطان مسبقًا.
      - button "أضف سؤالًا" [ref=e170] [cursor=pointer]
  - complementary "خصائص السؤال" [ref=e171]:
    - generic [ref=e172]:
      - heading "خصائص السؤال" [level=2] [ref=e173]
      - button "طيّ الخصائص" [expanded] [ref=e174] [cursor=pointer]
    - tablist "لوحة الجانب" [ref=e178]:
      - tab "خصائص السؤال" [selected] [ref=e179] [cursor=pointer]
      - tab "المظاهر" [ref=e182] [cursor=pointer]
    - generic [ref=e190]:
      - generic [ref=e191]: نوع السؤال
      - button "نوع السؤال" [disabled] [ref=e195]:
        - strong [ref=e202]: اختبار
    - generic [ref=e205]:
      - generic [ref=e206]: الوقت المحدد
      - combobox "مدة السؤال بالثواني" [disabled] [ref=e210]:
        - generic [ref=e211]: 20 ثانية
      - textbox [disabled] [aria-hidden] [ref=e215]: "20"
      - button "تطبيق على جميع الأسئلة" [disabled] [ref=e216]
    - generic [ref=e217]:
      - generic [ref=e218]: النقاط
      - combobox "النقاط" [disabled] [ref=e225]:
        - generic [ref=e226]: قياسي
      - textbox [disabled] [aria-hidden] [ref=e230]: "1"
    - generic [ref=e231]:
      - button "تكرار السؤال" [disabled] [ref=e232]
      - button "حذف السؤال" [disabled] [ref=e233]
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
  54  | test.describe('the four-region editor', () => {
  55  |   test('a teacher authors and publishes five questions without opening the properties panel', async ({ page }) => {
  56  |     const { accessToken } = await signInAsNewTeacher(page)
  57  |     const activityId = await createActivity(page, accessToken)
  58  | 
  59  | 
  60  | 
  61  |     await page.goto(`/teacher/activities/${activityId}`)
  62  |     await expect(page.getByLabel('عنوان النشاط')).toHaveValue('عواصم أوروبا', { timeout: 15_000 })
  63  | 
  64  |     const QUESTIONS = [
  65  |       { prompt: 'ما عاصمة فرنسا؟', answers: ['باريس', 'لندن', 'برلين', 'مدريد'] },
  66  |       { prompt: 'ما عاصمة إيطاليا؟', answers: ['روما', 'ميلانو', 'نابولي', 'تورينو'] },
  67  |       { prompt: 'ما عاصمة إسبانيا؟', answers: ['مدريد', 'برشلونة', 'إشبيلية', 'فالنسيا'] },
  68  |       { prompt: 'ما عاصمة ألمانيا؟', answers: ['برلين', 'ميونخ', 'هامبورغ', 'كولونيا'] },
  69  |       { prompt: 'ما عاصمة البرتغال؟', answers: ['لشبونة', 'بورتو', 'براغا', 'فارو'] },
  70  |     ]
  71  | 
  72  |     /* The thumbnails only — the rail also holds Add and Generate. */
  73  |     const thumbs = page.locator('[data-question-thumb]')
  74  | 
  75  |     for (const [index, question] of QUESTIONS.entries()) {
  76  |       await page.getByRole('button', { name: 'أضف سؤالًا' }).first().click()
  77  | 
  78  |       /*
  79  |        * Wait for the new question to BE the active one before typing.
  80  |        *
  81  |        * Clicking Add is a round trip; without this the next `fill` can land in
  82  |        * the previous question's textarea, and the test then reports a data-loss
  83  |        * bug the product does not have. Asserting the rail count and the empty
  84  |        * prompt is what "the new question is ready" actually means.
  85  |        */
> 86  |       await expect(thumbs).toHaveCount(index + 1)
      |                            ^ Error: expect(locator).toHaveCount(expected) failed
  87  |       await expect(page.getByLabel('نص السؤال')).toHaveValue('')
  88  | 
  89  |       await page.getByLabel('نص السؤال').fill(question.prompt)
  90  | 
  91  |       for (const [slot, answer] of question.answers.entries()) {
  92  |         await page.getByLabel(`نص الإجابة ${slot + 1}`).fill(answer)
  93  |       }
  94  | 
  95  |     }
  96  | 
  97  |     /*
  98  |      * The acceptance criterion, stated precisely.
  99  |      *
  100 |      * §12 asks for four FIXED regions, so on a desktop the properties rail is
  101 |      * visible by design — "without opening it" cannot mean "hidden". What it
  102 |      * means is that the teacher never had to go there: nothing above touched
  103 |      * region 4, and every default it holds is still the default.
  104 |      *
  105 |      * Asserted on the server's own rows further down: five questions, all
  106 |      * `mcq`, all 20 seconds, none of it ever supplied by this test.
  107 |      */
  108 |     const propertiesRail = page.getByLabel('خصائص السؤال')
  109 |     /* The type control is the design-system Select (a combobox), which exposes its value as data-select-value. */
  110 |     await expect(propertiesRail.getByLabel('نوع السؤال',{exact:true}).first()).toHaveAttribute('data-question-kind','mcq')
  111 |     await expect(propertiesRail.getByLabel('مدة السؤال بالثواني')).toHaveValue('20')
  112 | 
  113 |     await page.getByRole('button', { name: 'اعتماد النسخة' }).click()
  114 | 
  115 |     await expect(page.getByRole('button', { name: 'اعتماد التغييرات' })).toBeVisible({ timeout: 15_000 })
  116 |     await expect(page.getByRole('button', { name: 'ابدأ حصة مباشرة' })).toBeVisible()
  117 |     await expect(page.getByRole('button', { name: 'كلّف كواجب' })).toBeVisible()
  118 |     await expect(page.getByRole('alert')).toHaveCount(0)
  119 | 
  120 |     /* And the server agrees — five questions, an approved version, still private (v5 §18). */
  121 |     const check = await page.request.get(`${API}/activities/${activityId}`, {
  122 |       headers: { authorization: `Bearer ${accessToken}` },
  123 |     })
  124 |     const body = await check.json()
  125 |     expect(body.questions).toHaveLength(5)
  126 |     expect(body.activity.currentVersionId).not.toBeNull()
  127 |     expect(body.activity.visibility).toBe('private')
  128 |     expect(body.questions.every((q: { timeLimitS: number }) => q.timeLimitS === 20)).toBeTruthy()
  129 |   })
  130 | 
  131 |   test('a blank answer is refused and the editor points at the option', async ({ page }) => {
  132 |     const { accessToken } = await signInAsNewTeacher(page)
  133 |     const activityId = await createActivity(page, accessToken)
  134 | 
  135 |     await page.goto(`/teacher/activities/${activityId}`)
  136 |     await expect(page.getByLabel('عنوان النشاط')).toBeVisible({ timeout: 15_000 })
  137 | 
  138 |     await page.getByRole('button', { name: 'أضف سؤالًا' }).first().click()
  139 |     await page.getByLabel('نص السؤال').fill('ما عاصمة فرنسا؟')
  140 |     await page.getByLabel('نص الإجابة 1').fill('باريس')
  141 |     await page.getByLabel('نص الإجابة 2').fill('لندن')
  142 |     await page.getByLabel('نص الإجابة 3').fill('برلين')
  143 |     // The fourth answer is deliberately empty.
  144 |     await expect(page.getByLabel('نص الإجابة 4')).toHaveValue('')
  145 | 
  146 |     await page.getByRole('button', { name: 'اعتماد النسخة' }).click()
  147 | 
  148 |     const alert = page.getByRole('alert').first()
  149 |     await expect(alert).toBeVisible({ timeout: 15_000 })
  150 |     // The message names the exact option, not just "incomplete".
  151 |     await expect(alert).toContainText('opt_d')
  152 | 
  153 |     // Still a draft.
  154 |     await expect(page.getByRole('button', { name: 'اعتماد النسخة' })).toBeVisible()
  155 |   })
  156 | 
  157 |   test('the save indicator reaches "saved" only after the server confirms', async ({ page }) => {
  158 |     const { accessToken } = await signInAsNewTeacher(page)
  159 |     const activityId = await createActivity(page, accessToken)
  160 | 
  161 |     /*
  162 |      * Slow the question save down so the intermediate state is observable.
  163 |      * A fixed delay rather than a manual gate: the gate had to guess which
  164 |      * request to hold, and holding the wrong one produced a failure that read
  165 |      * like a missing indicator.
  166 |      */
  167 |     await page.route('**/api/v1/activities/questions/*', async (route) => {
  168 |       if (route.request().method() === 'PATCH') await new Promise((r) => setTimeout(r, 2500))
  169 |       await route.continue()
  170 |     })
  171 | 
  172 |     await page.goto(`/teacher/activities/${activityId}`)
  173 |     await expect(page.getByLabel('عنوان النشاط')).toBeVisible({ timeout: 15_000 })
  174 |     await page.getByRole('button', { name: 'أضف سؤالًا' }).first().click()
  175 |     await expect(page.locator('[data-question-thumb]')).toHaveCount(1)
  176 | 
  177 |     await page.getByLabel('نص السؤال').fill('سؤال')
  178 | 
  179 |     // In flight: NOT "saved" yet. That is the whole rule (§12).
  180 |     await expect(page.getByText('جارٍ الحفظ…')).toBeVisible({ timeout: 10_000 })
  181 |     await expect(page.getByText('محفوظ', { exact: true })).toHaveCount(0)
  182 | 
  183 |     // Confirmed by the server: only now.
  184 |     await expect(page.getByText('محفوظ', { exact: true })).toBeVisible({ timeout: 15_000 })
  185 |   })
  186 | 
```