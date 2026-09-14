# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: advanced-editor.spec.ts >> teacher authors ordering, matching, and confirmed image zones with durable saves
- Location: e2e/advanced-editor.spec.ts:7:1

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
      - heading "اختبار أنواع الأسئلة · بيانات تجريبية" [level=1] [ref=e9]
      - textbox "عنوان النشاط" [ref=e10]: اختبار أنواع الأسئلة · بيانات تجريبية
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
  1  | import {selectOption} from './select-option'
  2  | import {localTeacher} from './local-fixture'
  3  | import {test,expect} from '@playwright/test'
  4  | import {createRequire} from 'node:module'
  5  | const require=createRequire(import.meta.url)
  6  | const sharp=require('../../asasera-backend/node_modules/sharp') as typeof import('../../asasera-backend/node_modules/sharp/lib/index.js')
  7  | test('teacher authors ordering, matching, and confirmed image zones with durable saves',async({page})=>{
  8  |   test.setTimeout(120_000)
  9  |   const {email,password}=localTeacher()
  10 |   await page.addInitScript(()=>{localStorage.setItem('asasera.language','ar');localStorage.setItem('i18nextLng','ar')})
  11 |   const {accessToken}=await(await page.request.post('/api/v1/auth/login',{data:{email,password}})).json(),headers={authorization:`Bearer ${accessToken}`}
  12 |   const {activity}=await(await page.request.post('/api/v1/activities',{headers,data:{title:'اختبار أنواع الأسئلة · بيانات تجريبية',subjectId:1,levelId:8,purposeId:2}})).json()
  13 |   await page.setViewportSize({width:1440,height:1000});await page.goto(`/teacher/activities/${activity.id}`)
  14 |   await page.getByRole('button',{name:'أضف سؤالًا',exact:true}).first().click()
> 15 |   await expect(page.locator('[data-question-thumb]')).toHaveCount(1)
     |                                                       ^ Error: expect(locator).toHaveCount(expected) failed
  16 |   await expect(page.locator('main')).not.toHaveAttribute('inert','')
  17 |   const type=page.locator('aside [data-select-trigger]').first()
  18 |   await selectOption(type,'order');await page.getByLabel('نص السؤال').fill('رتب الأعداد تصاعديًا')
  19 |   await page.getByLabel('العنصر 1',{exact:true}).fill('واحد');await page.getByLabel('العنصر 2',{exact:true}).fill('اثنان')
  20 |   await page.getByRole('button',{name:'أضف عنصرًا',exact:true}).click();await page.getByLabel('العنصر 3',{exact:true}).fill('ثلاثة')
  21 |   await page.getByRole('button',{name:'أضف سؤالًا',exact:true}).first().click()
  22 |   await expect(page.locator('[data-question-thumb]')).toHaveCount(2)
  23 |   await expect(page.locator('main')).not.toHaveAttribute('inert','')
  24 |   await selectOption(type,'match');await page.getByLabel('نص السؤال').fill('طابق العدد مع اسمه')
  25 |   await page.getByLabel('الهدف 1',{exact:true}).fill('واحد');await page.getByLabel('الهدف 2',{exact:true}).fill('اثنان')
  26 |   await page.getByLabel('البطاقة 1',{exact:true}).fill('1');await page.getByLabel('البطاقة 2',{exact:true}).fill('2')
  27 |   await page.getByRole('button',{name:'أضف سؤالًا',exact:true}).first().click()
  28 |   await expect(page.locator('[data-question-thumb]')).toHaveCount(3)
  29 |   await expect(page.locator('main')).not.toHaveAttribute('inert','')
  30 |   /* «مناطق الصورة» is the one kind that cannot be applied on its own: zones need a picture
  31 |      to be drawn on, so choosing it with no media asks for the image first and the upload is
  32 |      what commits the kind. Assert both halves rather than the immediate commit. */
  33 |   await type.click();await page.locator('[role="option"][data-option-value="hotspot"]:visible').click()
  34 |   await expect(page.getByText('أضف الصورة أولًا لرسم مناطق الإجابة.',{exact:true})).toBeVisible()
  35 |   await expect(type).toHaveAttribute('data-select-value','mcq')
  36 |   const image=await sharp({create:{width:640,height:400,channels:3,background:'#8bd3c7'}}).png().toBuffer()
  37 |   await page.locator('aside input[type=file]').setInputFiles({name:'synthetic-zones.png',mimeType:'image/png',buffer:image})
  38 |   await expect(type).toHaveAttribute('data-select-value','hotspot',{timeout:20_000})
  39 |   await expect(page.getByRole('heading',{name:'مناطق الصورة',exact:true})).toBeVisible({timeout:20_000})
  40 |   await page.getByLabel('نص السؤال').fill('اختر المنطقة الأولى')
  41 |   await page.getByRole('button',{name:'ارسم حدود المنطقة',exact:true}).click()
  42 |   const box=await page.locator('div[class*="zoneEditor"]').boundingBox();expect(box).not.toBeNull()
  43 |   await page.mouse.move(box!.x+box!.width*.1,box!.y+box!.height*.1);await page.mouse.down();await page.mouse.move(box!.x+box!.width*.4,box!.y+box!.height*.4);await page.mouse.up()
  44 |   /* Publishing is now called approving: «اعتماد النسخة» for the first version and
  45 |      «اعتماد التغييرات» once one exists, and the blocking panel is «الاعتماد متوقّف». */
  46 |   await page.getByRole('button',{name:'اعتماد النسخة',exact:true}).click()
  47 |   await expect(page.getByRole('alert').filter({hasText:'الاعتماد متوقّف'})).toBeVisible()
  48 |   await page.getByRole('button',{name:'راجعت حدود المناطق وأؤكدها',exact:true}).click()
  49 |   await page.getByRole('button',{name:'اعتماد النسخة',exact:true}).click()
  50 |   await expect(page.getByRole('button',{name:'اعتماد التغييرات',exact:true})).toBeVisible()
  51 |   const loaded=await(await page.request.get(`/api/v1/activities/${activity.id}`,{headers})).json()
  52 |   expect(loaded.questions.map((q:{kind:string})=>q.kind)).toEqual(['order','match','hotspot'])
  53 |   expect(loaded.questions[0].payload.items.map((i:{text:string})=>i.text)).toEqual(['واحد','اثنان','ثلاثة'])
  54 |   expect(loaded.questions[2].payload.zones[0].x).toBeCloseTo(.1,1)
  55 |   await page.screenshot({path:'../screenshots/v4/editor-hotspot-1440.png',fullPage:true})
  56 |   await page.reload();await page.locator('[data-question-thumb]').nth(2).click()
  57 |   await expect(page.getByRole('heading',{name:'مناطق الصورة',exact:true})).toBeVisible()
  58 |   await page.setViewportSize({width:390,height:844});await expect(page.locator('aside')).not.toBeVisible();await expect(page.locator('nav')).not.toBeVisible();await expect(page.locator('main img').first()).toBeVisible();await page.screenshot({path:'../screenshots/v4/editor-hotspot-390.png',fullPage:true})
  59 |   for(const width of [360,2560]){await page.setViewportSize({width,height:1000});const ratios=await page.locator('div[class*=zoneEditor]').evaluate(el=>{const stage=el.getBoundingClientRect(),rect=el.querySelector('rect')!.getBoundingClientRect();return {x:(rect.x-stage.x)/stage.width,w:rect.width/stage.width}});expect(ratios.x).toBeCloseTo(.1,1);expect(ratios.w).toBeCloseTo(.3,1)}
  60 | })
  61 | 
```