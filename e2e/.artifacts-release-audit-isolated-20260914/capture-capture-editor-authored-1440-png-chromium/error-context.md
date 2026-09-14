# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: capture.spec.ts >> capture editor-authored-1440.png
- Location: e2e/capture.spec.ts:43:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'أضف سؤالًا' }).first()

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner "Editor bar" [ref=e4]:
    - link "Asasera — dashboard" [ref=e5] [cursor=pointer]:
      - /url: /teacher/dashboard
      - img "Asasera" [ref=e7]
    - generic [ref=e8]:
      - heading "عواصم أوروبا" [level=1] [ref=e9]
      - textbox "Activity title" [ref=e10]: عواصم أوروبا
    - generic [ref=e11]:
      - 'button "Available balance: 0. Open account and usage" [ref=e12] [cursor=pointer]':
        - generic [ref=e16]:
          - strong [ref=e17]: "0"
          - generic [ref=e18]: Add credit
      - button "Account menu — Teacher" [ref=e20] [cursor=pointer]:
        - generic [ref=e22]: T
    - group "Activity actions" [ref=e23]:
      - button "Activity settings" [ref=e24] [cursor=pointer]
      - button "More" [ref=e28] [cursor=pointer]
      - button "Approve version" [ref=e33] [cursor=pointer]
  - navigation "Activity questions" [ref=e34]:
    - generic [ref=e35]:
      - button "Add question" [ref=e36] [cursor=pointer]
      - button "Generate with AI" [ref=e37] [cursor=pointer]
      - paragraph [ref=e41]: From a topic or your uploaded sources.
  - main [ref=e42]:
    - generic [ref=e44]:
      - heading "No questions yet" [level=3] [ref=e48]
      - paragraph [ref=e49]: Add your first question. Type and timer are already set.
      - button "Add question" [ref=e51] [cursor=pointer]
  - complementary "Question properties" [ref=e52]:
    - generic [ref=e53]:
      - heading "Question properties" [level=2] [ref=e54]
      - button "Fold properties" [expanded] [ref=e55] [cursor=pointer]
    - tablist "Sidebar panel" [ref=e59]:
      - tab "Question properties" [selected] [ref=e60] [cursor=pointer]
      - tab "Themes" [ref=e63] [cursor=pointer]
    - generic [ref=e71]:
      - generic [ref=e72]: Question type
      - button "Question type" [disabled] [ref=e76]:
        - strong [ref=e83]: Quiz
    - generic [ref=e86]:
      - generic [ref=e87]: Time limit
      - combobox "Time limit in seconds" [disabled] [ref=e91]:
        - generic [ref=e92]: 20 seconds
      - textbox [disabled] [aria-hidden] [ref=e96]: "20"
      - button "Apply to all questions" [disabled] [ref=e97]
    - generic [ref=e98]:
      - generic [ref=e99]: Points
      - combobox "Points" [disabled] [ref=e106]:
        - generic [ref=e107]: Standard
      - textbox [disabled] [aria-hidden] [ref=e111]: "1"
    - generic [ref=e112]:
      - button "Duplicate question" [disabled] [ref=e113]
      - button "Delete question" [disabled] [ref=e114]
```

# Test source

```ts
  1  | import {localTeacher} from './local-fixture'
  2  | import { expect, test } from '@playwright/test'
  3  | import path from 'node:path'
  4  | 
  5  | /**
  6  |  * Evidence capture. Not an assertion suite — `design-system.spec.ts` does the
  7  |  * asserting. This exists so a human can look at what the assertions describe.
  8  |  *
  9  |  * Every file records the viewport it was actually taken at, and the viewport
  10 |  * is asserted first, so a capture can never be filed under a width it was not
  11 |  * rendered at.
  12 |  */
  13 | const OUT = path.resolve('../screenshots/v4')
  14 | 
  15 | const MATRIX = [
  16 |   { file: 'gallery-light-rtl-1440.png', w: 1440, h: 900, dark: false, rtl: true },
  17 |   { file: 'gallery-dark-rtl-1440.png', w: 1440, h: 900, dark: true, rtl: true },
  18 |   { file: 'gallery-light-ltr-1440.png', w: 1440, h: 900, dark: false, rtl: false },
  19 |   { file: 'gallery-dark-ltr-1440.png', w: 1440, h: 900, dark: true, rtl: false },
  20 |   { file: 'gallery-light-rtl-390.png', w: 390, h: 844, dark: false, rtl: true },
  21 |   { file: 'gallery-dark-rtl-360.png', w: 360, h: 740, dark: true, rtl: true },
  22 | ]
  23 | 
  24 | for (const shot of MATRIX) {
  25 |   test(`capture ${shot.file}`, async ({ page }) => {
  26 |     await page.setViewportSize({ width: shot.w, height: shot.h })
  27 |     await page.goto('/__design')
  28 |     await page.waitForSelector('.asas')
  29 |     await page.evaluate(([d, r]) => {
  30 |       document.documentElement.classList.toggle('dark', d as boolean)
  31 |       document.documentElement.dir = (r as boolean) ? 'rtl' : 'ltr'
  32 |     }, [shot.dark, shot.rtl])
  33 |     await page.waitForTimeout(400)
  34 | 
  35 |     const actual = await page.evaluate(() => window.innerWidth)
  36 |     if (actual !== shot.w) throw new Error(`viewport is ${actual}, expected ${shot.w} — refusing to file this capture`)
  37 | 
  38 |     await page.screenshot({ path: path.join(OUT, shot.file), fullPage: true })
  39 |   })
  40 | }
  41 | 
  42 | /* The editor, authored and populated — W03 evidence. */
  43 | test('capture editor-authored-1440.png', async ({ page }) => {
  44 |   const {email,password}=localTeacher()
  45 |   const login = await page.request.post('/api/v1/auth/login', { data: { email, password } })
  46 |   const { accessToken } = await login.json()
  47 |   const created = await page.request.post('/api/v1/activities', {
  48 |     headers: { authorization: `Bearer ${accessToken}` },
  49 |     data: { title: 'عواصم أوروبا', subjectId: 9, levelId: 8, purposeId: 2 },
  50 |   })
  51 |   const id = (await created.json()).activity.id
  52 | 
  53 |   await page.setViewportSize({ width: 1440, height: 900 })
  54 |   await page.goto(`/teacher/activities/${id}`)
> 55 |   await page.getByRole('button', { name: 'أضف سؤالًا' }).first().click()
     |                                                                  ^ Error: locator.click: Test timeout of 30000ms exceeded.
  56 |   await page.getByLabel('نص السؤال').fill('ما عاصمة فرنسا؟')
  57 |   for (const [slot, answer] of ['باريس', 'لندن', 'برلين', 'مدريد'].entries()) {
  58 |     await page.getByLabel(`نص الإجابة ${slot + 1}`).fill(answer)
  59 |   }
  60 |   await expect(page.getByText('محفوظ', { exact: true })).toBeVisible({ timeout: 15_000 })
  61 | 
  62 |   if (await page.evaluate(() => window.innerWidth) !== 1440) throw new Error('viewport mismatch')
  63 |   await page.evaluate(()=>{document.querySelectorAll('*').forEach(el=>{if(el instanceof HTMLElement&&el.scrollTop)el.scrollTop=0})})
  64 |   await page.screenshot({ path: path.join(OUT, 'editor-authored-1440.png') })
  65 |   for(const [w,h] of [[1920,1080],[1280,720],[390,844]]){
  66 |     await page.setViewportSize({width:w!,height:h!});await page.evaluate(()=>{scrollTo(0,0);document.querySelectorAll('*').forEach(el=>{if(el instanceof HTMLElement&&el.scrollTop)el.scrollTop=0})})
  67 |     expect(await page.evaluate(()=>innerWidth)).toBe(w);expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(w)
  68 |     await page.screenshot({path:path.join(OUT,`editor-authored-${w}.png`),animations:'disabled'})
  69 |   }
  70 | 
  71 | })
  72 | 
```