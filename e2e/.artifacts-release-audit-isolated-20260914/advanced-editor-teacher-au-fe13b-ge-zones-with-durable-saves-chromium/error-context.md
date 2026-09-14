# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: advanced-editor.spec.ts >> teacher authors ordering, matching, and confirmed image zones with durable saves
- Location: e2e/advanced-editor.spec.ts:7:1

# Error details

```
Test timeout of 120000ms exceeded.
```

```
Error: locator.click: Test timeout of 120000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'أضف سؤالًا', exact: true }).first()

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner "Editor bar" [ref=e4]:
    - link "Asasera — dashboard" [ref=e5] [cursor=pointer]:
      - /url: /teacher/dashboard
      - img "Asasera" [ref=e7]
    - generic [ref=e8]:
      - heading "اختبار أنواع الأسئلة · بيانات تجريبية" [level=1] [ref=e9]
      - textbox "Activity title" [ref=e10]: اختبار أنواع الأسئلة · بيانات تجريبية
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
  1  | import {selectOption} from './select-option'
  2  | import {localTeacher} from './local-fixture'
  3  | import {test,expect} from '@playwright/test'
  4  | import {createRequire} from 'node:module'
  5  | const require=createRequire(import.meta.url)
  6  | const sharp=require('../../asasera-backend/node_modules/sharp') as typeof import('../../asasera-backend/node_modules/sharp/lib/index.js')
  7  | test('teacher authors ordering, matching, and confirmed image zones with durable saves',async({page})=>{
  8  |   test.setTimeout(120_000)
  9  |   const {email,password}=localTeacher()
  10 |   const {accessToken}=await(await page.request.post('/api/v1/auth/login',{data:{email,password}})).json(),headers={authorization:`Bearer ${accessToken}`}
  11 |   const {activity}=await(await page.request.post('/api/v1/activities',{headers,data:{title:'اختبار أنواع الأسئلة · بيانات تجريبية',subjectId:1,levelId:8,purposeId:2}})).json()
  12 |   await page.setViewportSize({width:1440,height:1000});await page.goto(`/teacher/activities/${activity.id}`)
> 13 |   await page.getByRole('button',{name:'أضف سؤالًا',exact:true}).first().click()
     |                                                                         ^ Error: locator.click: Test timeout of 120000ms exceeded.
  14 |   await expect(page.locator('[data-question-thumb]')).toHaveCount(1)
  15 |   await expect(page.locator('main')).not.toHaveAttribute('inert','')
  16 |   const type=page.locator('aside [data-select-trigger]').first()
  17 |   await selectOption(type,'order');await page.getByLabel('نص السؤال').fill('رتب الأعداد تصاعديًا')
  18 |   await page.getByLabel('العنصر 1',{exact:true}).fill('واحد');await page.getByLabel('العنصر 2',{exact:true}).fill('اثنان')
  19 |   await page.getByRole('button',{name:'أضف عنصرًا',exact:true}).click();await page.getByLabel('العنصر 3',{exact:true}).fill('ثلاثة')
  20 |   await page.getByRole('button',{name:'أضف سؤالًا',exact:true}).first().click()
  21 |   await expect(page.locator('[data-question-thumb]')).toHaveCount(2)
  22 |   await expect(page.locator('main')).not.toHaveAttribute('inert','')
  23 |   await selectOption(type,'match');await page.getByLabel('نص السؤال').fill('طابق العدد مع اسمه')
  24 |   await page.getByLabel('الهدف 1',{exact:true}).fill('واحد');await page.getByLabel('الهدف 2',{exact:true}).fill('اثنان')
  25 |   await page.getByLabel('البطاقة 1',{exact:true}).fill('1');await page.getByLabel('البطاقة 2',{exact:true}).fill('2')
  26 |   await page.getByRole('button',{name:'أضف سؤالًا',exact:true}).first().click()
  27 |   await expect(page.locator('[data-question-thumb]')).toHaveCount(3)
  28 |   await expect(page.locator('main')).not.toHaveAttribute('inert','')
  29 |   /* «مناطق الصورة» is the one kind that cannot be applied on its own: zones need a picture
  30 |      to be drawn on, so choosing it with no media asks for the image first and the upload is
  31 |      what commits the kind. Assert both halves rather than the immediate commit. */
  32 |   await type.click();await page.locator('[role="option"][data-option-value="hotspot"]:visible').click()
  33 |   await expect(page.getByText('أضف الصورة أولًا لرسم مناطق الإجابة.',{exact:true})).toBeVisible()
  34 |   await expect(type).toHaveAttribute('data-select-value','mcq')
  35 |   const image=await sharp({create:{width:640,height:400,channels:3,background:'#8bd3c7'}}).png().toBuffer()
  36 |   await page.locator('aside input[type=file]').setInputFiles({name:'synthetic-zones.png',mimeType:'image/png',buffer:image})
  37 |   await expect(type).toHaveAttribute('data-select-value','hotspot',{timeout:20_000})
  38 |   await expect(page.getByRole('heading',{name:'مناطق الصورة',exact:true})).toBeVisible({timeout:20_000})
  39 |   await page.getByLabel('نص السؤال').fill('اختر المنطقة الأولى')
  40 |   await page.getByRole('button',{name:'ارسم حدود المنطقة',exact:true}).click()
  41 |   const box=await page.locator('div[class*="zoneEditor"]').boundingBox();expect(box).not.toBeNull()
  42 |   await page.mouse.move(box!.x+box!.width*.1,box!.y+box!.height*.1);await page.mouse.down();await page.mouse.move(box!.x+box!.width*.4,box!.y+box!.height*.4);await page.mouse.up()
  43 |   /* Publishing is now called approving: «اعتماد النسخة» for the first version and
  44 |      «اعتماد التغييرات» once one exists, and the blocking panel is «الاعتماد متوقّف». */
  45 |   await page.getByRole('button',{name:'اعتماد النسخة',exact:true}).click()
  46 |   await expect(page.getByRole('alert').filter({hasText:'الاعتماد متوقّف'})).toBeVisible()
  47 |   await page.getByRole('button',{name:'راجعت حدود المناطق وأؤكدها',exact:true}).click()
  48 |   await page.getByRole('button',{name:'اعتماد النسخة',exact:true}).click()
  49 |   await expect(page.getByRole('button',{name:'اعتماد التغييرات',exact:true})).toBeVisible()
  50 |   const loaded=await(await page.request.get(`/api/v1/activities/${activity.id}`,{headers})).json()
  51 |   expect(loaded.questions.map((q:{kind:string})=>q.kind)).toEqual(['order','match','hotspot'])
  52 |   expect(loaded.questions[0].payload.items.map((i:{text:string})=>i.text)).toEqual(['واحد','اثنان','ثلاثة'])
  53 |   expect(loaded.questions[2].payload.zones[0].x).toBeCloseTo(.1,1)
  54 |   await page.screenshot({path:'../screenshots/v4/editor-hotspot-1440.png',fullPage:true})
  55 |   await page.reload();await page.locator('[data-question-thumb]').nth(2).click()
  56 |   await expect(page.getByRole('heading',{name:'مناطق الصورة',exact:true})).toBeVisible()
  57 |   await page.setViewportSize({width:390,height:844});await expect(page.locator('aside')).not.toBeVisible();await expect(page.locator('nav')).not.toBeVisible();await expect(page.locator('main img').first()).toBeVisible();await page.screenshot({path:'../screenshots/v4/editor-hotspot-390.png',fullPage:true})
  58 |   for(const width of [360,2560]){await page.setViewportSize({width,height:1000});const ratios=await page.locator('div[class*=zoneEditor]').evaluate(el=>{const stage=el.getBoundingClientRect(),rect=el.querySelector('rect')!.getBoundingClientRect();return {x:(rect.x-stage.x)/stage.width,w:rect.width/stage.width}});expect(ratios.x).toBeCloseTo(.1,1);expect(ratios.w).toBeCloseTo(.3,1)}
  59 | })
  60 | 
```