# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: advanced-editor.spec.ts >> teacher authors ordering, matching, and confirmed image zones with durable saves
- Location: e2e/advanced-editor.spec.ts:10:1

# Error details

```
Test timeout of 120000ms exceeded.
```

```
Error: locator.fill: Test timeout of 120000ms exceeded.
Call log:
  - waiting for getByLabel('العنصر 1', { exact: true })

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
      - generic [ref=e11]: محفوظ
    - generic [ref=e14]:
      - 'button "الرصيد المتاح: 0. فتح الحساب والاستخدام" [ref=e15] [cursor=pointer]':
        - generic [ref=e19]:
          - strong [ref=e20]: "0"
          - generic [ref=e21]: أضف رصيدًا
      - button "قائمة الحساب — معلّم" [ref=e23] [cursor=pointer]:
        - generic [ref=e25]: T
    - group "أدوات النشاط" [ref=e26]:
      - button "حفظ" [disabled] [ref=e27]
      - button "تراجع" [ref=e32] [cursor=pointer]
      - button "إعدادات النشاط" [ref=e36] [cursor=pointer]
      - button "المزيد" [ref=e40] [cursor=pointer]
      - button "اعتماد النسخة" [ref=e45] [cursor=pointer]
  - navigation "أسئلة النشاط" [ref=e46]:
    - generic [ref=e47]:
      - generic [ref=e48]:
        - button "تكرار السؤال" [ref=e49] [cursor=pointer]
        - button "حذف السؤال" [ref=e53] [cursor=pointer]
      - generic [ref=e57]:
        - paragraph [ref=e58]:
          - generic [ref=e59]: 1 رتّب
        - button "رتب الأعداد تصاعديًا" [ref=e60] [cursor=pointer]
    - generic [ref=e67]:
      - button "أضف سؤالًا" [ref=e68] [cursor=pointer]
      - button "توليد بالذكاء الاصطناعي" [ref=e69] [cursor=pointer]
      - paragraph [ref=e73]: من موضوع أو من مصادرك المرفوعة.
  - main [ref=e74]:
    - generic [ref=e75]:
      - generic [ref=e76]:
        - toolbar "تنسيق النص" [ref=e78]:
          - button "عريض" [ref=e79] [cursor=pointer]
          - button "مائل" [ref=e82] [cursor=pointer]
          - button "نص سفلي" [ref=e85] [cursor=pointer]
          - button "نص علوي" [ref=e90] [cursor=pointer]
          - button "رموز" [ref=e95] [cursor=pointer]
          - button "معادلة" [ref=e98] [cursor=pointer]
        - textbox "نص السؤال" [active] [ref=e103]:
          - paragraph [ref=e104]: رتب الأعداد تصاعديًا
      - generic [ref=e105]:
        - button "ابحث عن وسائط وأدرجها (اختياري)" [ref=e108] [cursor=pointer]:
          - generic [ref=e113]: ارفع ملفًا أو اسحبه إلى هنا
        - generic [ref=e114]:
          - paragraph [ref=e115]: اكتب العناصر بترتيبها الصحيح. يخلطها النظام لكل طالب عند العرض.
          - list [ref=e116]:
            - listitem [ref=e117]:
              - button "احذف العنصر 1" [ref=e121] [cursor=pointer]
              - generic [ref=e125]:
                - textbox "نص العنصر 1" [ref=e128]:
                  - text: أضف العنصر 1
                  - paragraph [ref=e129]
                - button "صورة العنصر 1" [ref=e130] [cursor=pointer]
                - generic [ref=e135]:
                  - button "انقل «العنصر 1» للأعلى" [disabled] [ref=e136]
                  - button "انقل «العنصر 1» للأسفل" [ref=e139] [cursor=pointer]
                - button "أعد ترتيب «العنصر 1»" [ref=e142]
            - listitem [ref=e150]:
              - button "احذف العنصر 2" [ref=e154] [cursor=pointer]
              - generic [ref=e158]:
                - textbox "نص العنصر 2" [ref=e161]:
                  - text: أضف العنصر 2
                  - paragraph [ref=e162]
                - button "صورة العنصر 2" [ref=e163] [cursor=pointer]
                - generic [ref=e168]:
                  - button "انقل «العنصر 2» للأعلى" [ref=e169] [cursor=pointer]
                  - button "انقل «العنصر 2» للأسفل" [ref=e172] [cursor=pointer]
                - button "أعد ترتيب «العنصر 2»" [ref=e175]
            - listitem [ref=e183]:
              - button "احذف العنصر 3" [ref=e187] [cursor=pointer]
              - generic [ref=e191]:
                - textbox "نص العنصر 3" [ref=e194]:
                  - text: أضف العنصر 3
                  - paragraph [ref=e195]
                - button "صورة العنصر 3" [ref=e196] [cursor=pointer]
                - generic [ref=e201]:
                  - button "انقل «العنصر 3» للأعلى" [ref=e202] [cursor=pointer]
                  - button "انقل «العنصر 3» للأسفل" [disabled] [ref=e205]
                - button "أعد ترتيب «العنصر 3»" [ref=e208]
          - status [ref=e216]
          - button "أضف عنصرًا" [ref=e218] [cursor=pointer]
      - group [ref=e220]:
        - generic "إعدادات متقدمة" [ref=e221] [cursor=pointer]
      - generic [ref=e222]:
        - generic [ref=e223]: التفسير (اختياري)
        - textbox "التفسير (اختياري)" [ref=e224]:
          - /placeholder: لماذا هذه الإجابة صحيحة؟ يظهر للطلاب بعد انتهاء وقت الإجابة.
  - complementary "خصائص السؤال" [ref=e225]:
    - generic [ref=e226]:
      - heading "خصائص السؤال" [level=2] [ref=e227]
      - button "طيّ الخصائص" [expanded] [ref=e228] [cursor=pointer]
    - tablist "لوحة الجانب" [ref=e232]:
      - tab "خصائص السؤال" [selected] [ref=e233] [cursor=pointer]
      - tab "المظاهر" [ref=e236] [cursor=pointer]
    - generic [ref=e244]:
      - generic [ref=e245]: نوع السؤال
      - button "نوع السؤال" [ref=e249] [cursor=pointer]:
        - strong [ref=e258]: رتّب
    - generic [ref=e261]:
      - generic [ref=e262]: الوقت المحدد
      - combobox "مدة السؤال بالثواني" [ref=e266] [cursor=pointer]:
        - generic [ref=e267]: 20 ثانية
      - textbox [aria-hidden] [ref=e271]: "20"
      - button "تطبيق على جميع الأسئلة" [ref=e272] [cursor=pointer]
    - generic [ref=e273]:
      - generic [ref=e274]: النقاط
      - combobox "النقاط" [ref=e281] [cursor=pointer]:
        - generic [ref=e282]: قياسي
      - textbox [aria-hidden] [ref=e286]: "1"
    - generic [ref=e287]:
      - button "تكرار السؤال" [ref=e288] [cursor=pointer]
      - button "حذف السؤال" [ref=e289] [cursor=pointer]
```

# Test source

```ts
  1  | import {localTeacher} from './local-fixture'
  2  | import {test,expect} from '@playwright/test'
  3  | import {createRequire} from 'node:module'
  4  | const require=createRequire(import.meta.url)
  5  | const sharp=require('../../asasera-backend/node_modules/sharp') as typeof import('../../asasera-backend/node_modules/sharp/lib/index.js')
  6  | async function add(page:import('@playwright/test').Page,type:string){
  7  |  await page.getByRole('button',{name:'أضف سؤالًا',exact:true}).first().click()
  8  |  await page.getByRole('dialog',{name:'ما نوع السؤال الجديد؟'}).getByRole('button',{name:type,exact:true}).click()
  9  | }
  10 | test('teacher authors ordering, matching, and confirmed image zones with durable saves',async({page})=>{
  11 |   test.setTimeout(120_000)
  12 |   const {email,password}=localTeacher()
  13 |   await page.addInitScript(()=>{localStorage.setItem('asasera.language','ar');localStorage.setItem('i18nextLng','ar')})
  14 |   const {accessToken}=await(await page.request.post('/api/v1/auth/login',{data:{email,password}})).json(),headers={authorization:`Bearer ${accessToken}`}
  15 |   const {activity}=await(await page.request.post('/api/v1/activities',{headers,data:{title:'اختبار أنواع الأسئلة · بيانات تجريبية',subjectId:1,levelId:8,purposeId:2}})).json()
  16 |   await page.setViewportSize({width:1440,height:1000});await page.goto(`/teacher/activities/${activity.id}`)
  17 |   await add(page,'رتّب')
  18 |   await expect(page.locator('[data-question-thumb]')).toHaveCount(1)
  19 |   await expect(page.locator('main')).not.toHaveAttribute('inert','')
  20 |   const type=page.locator('aside [data-select-trigger]').first()
  21 |   await page.getByLabel('نص السؤال').fill('رتب الأعداد تصاعديًا')
> 22 |   await page.getByLabel('العنصر 1',{exact:true}).fill('واحد');await page.getByLabel('العنصر 2',{exact:true}).fill('اثنان')
     |                                                  ^ Error: locator.fill: Test timeout of 120000ms exceeded.
  23 |   await page.getByRole('button',{name:'أضف عنصرًا',exact:true}).click();await page.getByLabel('العنصر 3',{exact:true}).fill('ثلاثة')
  24 |   await add(page,'مطابقة')
  25 |   await expect(page.locator('[data-question-thumb]')).toHaveCount(2)
  26 |   await expect(page.locator('main')).not.toHaveAttribute('inert','')
  27 |   await page.getByLabel('نص السؤال').fill('طابق العدد مع اسمه')
  28 |   await page.getByLabel('الهدف 1',{exact:true}).fill('واحد');await page.getByLabel('الهدف 2',{exact:true}).fill('اثنان')
  29 |   await page.getByLabel('البطاقة 1',{exact:true}).fill('1');await page.getByLabel('البطاقة 2',{exact:true}).fill('2')
  30 |   await add(page,'تحديد الإجابة')
  31 |   await expect(page.locator('[data-question-thumb]')).toHaveCount(3)
  32 |   await expect(page.locator('main')).not.toHaveAttribute('inert','')
  33 |   /* «مناطق الصورة» is the one kind that cannot be applied on its own: zones need a picture
  34 |      to be drawn on, so choosing it with no media asks for the image first and the upload is
  35 |      what commits the kind. Assert both halves rather than the immediate commit. */
  36 |   await expect(page.getByText('أضف الصورة أولًا لرسم مناطق الإجابة.',{exact:true})).toBeVisible()
  37 |   await expect(type).toHaveAttribute('data-select-value','mcq')
  38 |   const image=await sharp({create:{width:640,height:400,channels:3,background:'#8bd3c7'}}).png().toBuffer()
  39 |   await page.locator('aside input[type=file]').setInputFiles({name:'synthetic-zones.png',mimeType:'image/png',buffer:image})
  40 |   await expect(type).toHaveAttribute('data-select-value','hotspot',{timeout:20_000})
  41 |   await expect(page.getByRole('heading',{name:'مناطق الصورة',exact:true})).toBeVisible({timeout:20_000})
  42 |   await page.getByLabel('نص السؤال').fill('اختر المنطقة الأولى')
  43 |   await page.getByRole('button',{name:'ارسم حدود المنطقة',exact:true}).click()
  44 |   const box=await page.locator('div[class*="zoneEditor"]').boundingBox();expect(box).not.toBeNull()
  45 |   await page.mouse.move(box!.x+box!.width*.1,box!.y+box!.height*.1);await page.mouse.down();await page.mouse.move(box!.x+box!.width*.4,box!.y+box!.height*.4);await page.mouse.up()
  46 |   /* Publishing is now called approving: «اعتماد النسخة» for the first version and
  47 |      «اعتماد التغييرات» once one exists, and the blocking panel is «الاعتماد متوقّف». */
  48 |   await page.getByRole('button',{name:'اعتماد النسخة',exact:true}).click()
  49 |   await expect(page.getByRole('alert').filter({hasText:'الاعتماد متوقّف'})).toBeVisible()
  50 |   await page.getByRole('button',{name:'راجعت حدود المناطق وأؤكدها',exact:true}).click()
  51 |   await page.getByRole('button',{name:'اعتماد النسخة',exact:true}).click()
  52 |   await expect(page.getByRole('button',{name:'اعتماد التغييرات',exact:true})).toBeVisible()
  53 |   const loaded=await(await page.request.get(`/api/v1/activities/${activity.id}`,{headers})).json()
  54 |   expect(loaded.questions.map((q:{kind:string})=>q.kind)).toEqual(['order','match','hotspot'])
  55 |   expect(loaded.questions[0].payload.items.map((i:{text:string})=>i.text)).toEqual(['واحد','اثنان','ثلاثة'])
  56 |   expect(loaded.questions[2].payload.zones[0].x).toBeCloseTo(.1,1)
  57 |   await page.screenshot({path:'../screenshots/v4/editor-hotspot-1440.png',fullPage:true})
  58 |   await page.reload();await page.locator('[data-question-thumb]').nth(2).click()
  59 |   await expect(page.getByRole('heading',{name:'مناطق الصورة',exact:true})).toBeVisible()
  60 |   await page.setViewportSize({width:390,height:844});await expect(page.locator('aside')).not.toBeVisible();await expect(page.locator('nav')).not.toBeVisible();await expect(page.locator('main img').first()).toBeVisible();await page.screenshot({path:'../screenshots/v4/editor-hotspot-390.png',fullPage:true})
  61 |   for(const width of [360,2560]){await page.setViewportSize({width,height:1000});const ratios=await page.locator('div[class*=zoneEditor]').evaluate(el=>{const stage=el.getBoundingClientRect(),rect=el.querySelector('rect')!.getBoundingClientRect();return {x:(rect.x-stage.x)/stage.width,w:rect.width/stage.width}});expect(ratios.x).toBeCloseTo(.1,1);expect(ratios.w).toBeCloseTo(.3,1)}
  62 | })
  63 | 
```