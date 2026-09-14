# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: advanced-editor.spec.ts >> teacher authors ordering, matching, and confirmed image zones with durable saves
- Location: e2e/advanced-editor.spec.ts:10:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('أضف الصورة أولًا لرسم مناطق الإجابة.', { exact: true })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('أضف الصورة أولًا لرسم مناطق الإجابة.', { exact: true }) with timeout 5000ms
  - waiting for getByText('أضف الصورة أولًا لرسم مناطق الإجابة.', { exact: true })

```

```yaml
- banner "شريط المحرر":
  - link "أساسيرا — لوحة التحكم":
    - /url: /teacher/dashboard
    - img "أساسيرا"
  - heading "اختبار أنواع الأسئلة · بيانات تجريبية" [level=1]
  - textbox "عنوان النشاط": اختبار أنواع الأسئلة · بيانات تجريبية
  - text: محفوظ
  - 'button "الرصيد المتاح: 0. فتح الحساب والاستخدام"':
    - strong: "0"
    - text: أضف رصيدًا
  - button "قائمة الحساب — معلّم"
  - group "أدوات النشاط":
    - button "حفظ" [disabled]
    - button "تراجع" [disabled]
    - button "إعدادات النشاط"
    - button "المزيد"
    - button "اعتماد النسخة"
- navigation "أسئلة النشاط":
  - paragraph: 1 رتّب
  - button "رتب الأعداد تصاعديًا"
  - paragraph: 2 مطابقة
  - button "طابق العدد مع اسمه"
  - button "انقل السؤال للأعلى"
  - button "انقل السؤال للأسفل" [disabled]
  - button "تكرار السؤال"
  - button "حذف السؤال"
  - paragraph: 3 اختبار
  - button "سؤال بلا نص"
  - button "أضف سؤالًا"
  - button "توليد بالذكاء الاصطناعي"
  - paragraph: من موضوع أو من مصادرك المرفوعة.
- main:
  - toolbar "تنسيق النص":
    - button "عريض"
    - button "مائل"
    - button "نص سفلي"
    - button "نص علوي"
    - button "رموز"
    - button "معادلة"
  - textbox "نص السؤال":
    - text: اكتب السؤال هنا
    - paragraph
  - region "صورة السؤال":
    - heading "ابدأ بصورة" [level=2]
    - paragraph: ارفع صورة أو أنشئ واحدة بالذكاء الاصطناعي. بعدها غطِّ النصوص، وحدّد مناطق الإجابات، وأضف التسميات التي يسحبها الطالب.
    - button "ارفع صورة"
    - button "أنشئ بالذكاء الاصطناعي"
    - paragraph: PNG, JPG, WebP · حتى 5 ميجابايت
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
  22 |   await page.getByLabel('نص العنصر 1',{exact:true}).fill('واحد');await page.getByLabel('نص العنصر 2',{exact:true}).fill('اثنان');await page.getByLabel('نص العنصر 3',{exact:true}).fill('ثلاثة')
  23 |   await add(page,'مطابقة')
  24 |   await expect(page.locator('[data-question-thumb]')).toHaveCount(2)
  25 |   await expect(page.locator('main')).not.toHaveAttribute('inert','')
  26 |   await page.getByLabel('نص السؤال').fill('طابق العدد مع اسمه')
  27 |   await page.getByLabel('الهدف 1',{exact:true}).fill('واحد');await page.getByLabel('الهدف 2',{exact:true}).fill('اثنان')
  28 |   await page.getByLabel('البطاقة 1',{exact:true}).fill('1');await page.getByLabel('البطاقة 2',{exact:true}).fill('2')
  29 |   await add(page,'تحديد الإجابة')
  30 |   await expect(page.locator('[data-question-thumb]')).toHaveCount(3)
  31 |   await expect(page.locator('main')).not.toHaveAttribute('inert','')
  32 |   /* «مناطق الصورة» is the one kind that cannot be applied on its own: zones need a picture
  33 |      to be drawn on, so choosing it with no media asks for the image first and the upload is
  34 |      what commits the kind. Assert both halves rather than the immediate commit. */
> 35 |   await expect(page.getByText('أضف الصورة أولًا لرسم مناطق الإجابة.',{exact:true})).toBeVisible()
     |                                                                                     ^ Error: expect(locator).toBeVisible() failed
  36 |   await expect(type).toHaveAttribute('data-select-value','mcq')
  37 |   const image=await sharp({create:{width:640,height:400,channels:3,background:'#8bd3c7'}}).png().toBuffer()
  38 |   await page.locator('aside input[type=file]').setInputFiles({name:'synthetic-zones.png',mimeType:'image/png',buffer:image})
  39 |   await expect(type).toHaveAttribute('data-select-value','hotspot',{timeout:20_000})
  40 |   await expect(page.getByRole('heading',{name:'مناطق الصورة',exact:true})).toBeVisible({timeout:20_000})
  41 |   await page.getByLabel('نص السؤال').fill('اختر المنطقة الأولى')
  42 |   await page.getByRole('button',{name:'ارسم حدود المنطقة',exact:true}).click()
  43 |   const box=await page.locator('div[class*="zoneEditor"]').boundingBox();expect(box).not.toBeNull()
  44 |   await page.mouse.move(box!.x+box!.width*.1,box!.y+box!.height*.1);await page.mouse.down();await page.mouse.move(box!.x+box!.width*.4,box!.y+box!.height*.4);await page.mouse.up()
  45 |   /* Publishing is now called approving: «اعتماد النسخة» for the first version and
  46 |      «اعتماد التغييرات» once one exists, and the blocking panel is «الاعتماد متوقّف». */
  47 |   await page.getByRole('button',{name:'اعتماد النسخة',exact:true}).click()
  48 |   await expect(page.getByRole('alert').filter({hasText:'الاعتماد متوقّف'})).toBeVisible()
  49 |   await page.getByRole('button',{name:'راجعت حدود المناطق وأؤكدها',exact:true}).click()
  50 |   await page.getByRole('button',{name:'اعتماد النسخة',exact:true}).click()
  51 |   await expect(page.getByRole('button',{name:'اعتماد التغييرات',exact:true})).toBeVisible()
  52 |   const loaded=await(await page.request.get(`/api/v1/activities/${activity.id}`,{headers})).json()
  53 |   expect(loaded.questions.map((q:{kind:string})=>q.kind)).toEqual(['order','match','hotspot'])
  54 |   expect(loaded.questions[0].payload.items.map((i:{text:string})=>i.text)).toEqual(['واحد','اثنان','ثلاثة'])
  55 |   expect(loaded.questions[2].payload.zones[0].x).toBeCloseTo(.1,1)
  56 |   await page.screenshot({path:'../screenshots/v4/editor-hotspot-1440.png',fullPage:true})
  57 |   await page.reload();await page.locator('[data-question-thumb]').nth(2).click()
  58 |   await expect(page.getByRole('heading',{name:'مناطق الصورة',exact:true})).toBeVisible()
  59 |   await page.setViewportSize({width:390,height:844});await expect(page.locator('aside')).not.toBeVisible();await expect(page.locator('nav')).not.toBeVisible();await expect(page.locator('main img').first()).toBeVisible();await page.screenshot({path:'../screenshots/v4/editor-hotspot-390.png',fullPage:true})
  60 |   for(const width of [360,2560]){await page.setViewportSize({width,height:1000});const ratios=await page.locator('div[class*=zoneEditor]').evaluate(el=>{const stage=el.getBoundingClientRect(),rect=el.querySelector('rect')!.getBoundingClientRect();return {x:(rect.x-stage.x)/stage.width,w:rect.width/stage.width}});expect(ratios.x).toBeCloseTo(.1,1);expect(ratios.w).toBeCloseTo(.3,1)}
  61 | })
  62 | 
```