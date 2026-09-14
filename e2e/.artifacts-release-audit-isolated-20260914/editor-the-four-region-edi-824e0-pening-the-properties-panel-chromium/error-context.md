# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: editor.spec.ts >> the four-region editor >> a teacher authors and publishes five questions without opening the properties panel
- Location: e2e/editor.spec.ts:54:3

# Error details

```
Error: expect(locator).toHaveValue(expected) failed

Locator: getByLabel('عنوان النشاط')
Expected: "عواصم أوروبا"
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toHaveValue" getByLabel('عنوان النشاط') with timeout 15000ms
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
> 61  |     await expect(page.getByLabel('عنوان النشاط')).toHaveValue('عواصم أوروبا', { timeout: 15_000 })
      |                                                   ^ Error: expect(locator).toHaveValue(expected) failed
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
```