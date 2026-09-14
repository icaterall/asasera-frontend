# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: advanced-editor.spec.ts >> teacher authors ordering, matching, and confirmed image zones with durable saves
- Location: e2e/advanced-editor.spec.ts:12:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: 'اعتماد التغييرات', exact: true })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('button', { name: 'اعتماد التغييرات', exact: true }) with timeout 5000ms
  - waiting for getByRole('button', { name: 'اعتماد التغييرات', exact: true })

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
    - button "تراجع"
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
  - paragraph: 3 تحديد الإجابة
  - button "اختر المنطقة الأولىالمنطقة الأولى"
  - button "أضف سؤالًا"
  - button "توليد بالذكاء الاصطناعي"
  - paragraph: من موضوع أو من مصادرك المرفوعة.
- main:
  - alert:
    - heading "الاعتماد متوقّف — 1" [level=2]
    - list:
      - listitem:
        - button "أكمل نص العنصر أو أضف صورة."
  - textbox "نص السؤال":
    - paragraph: اختر المنطقة الأولىالمنطقة الأولى
  - region "محرر إجابات الصورة":
    - heading "حوّل الصورة إلى سؤال" [level=2]
    - paragraph: غطِّ التسميات، وحدّد أماكن الإجابات، ثم جرّب السؤال.
    - button "معاينة الطالب"
    - text: الصورة
    - button "استبدل الصورة"
    - button "صورة بالذكاء الاصطناعي"
    - button "نظّف الصورة"
    - text: الأداة
    - button "تحديد وتحريك" [pressed]: تحديد
    - button "مستطيل"
    - button "دائرة"
    - status: انقر على منطقة لتحديدها. اسحبها لتحريكها أو اسحب الزاوية لتغيير الحجم.
    - paragraph: يرى كل طالب هذه التسميات بترتيب مختلف، فترتيبها هنا لا يهم.
    - list:
      - listitem:
        - textbox "إجابة المنطقة 1":
          - /placeholder: اكتب التسمية الصحيحة
    - img "صورة السؤال"
    - img "مناطق الإجابة القابلة للتحرير":
      - button "منطقة 1" [pressed]
    - group:
      - text: الشكل والموضع الدقيق الشكل
      - combobox "الشكل": مستطيل
      - text: أفقي %
      - spinbutton "أفقي %": "10"
      - text: رأسي %
      - spinbutton "رأسي %": "10"
      - text: عرض %
      - spinbutton "عرض %": "30"
      - text: ارتفاع %
      - spinbutton "ارتفاع %": "30"
    - complementary "الإجابات ومناطقها":
      - heading "الإجابات" [level=3]
      - text: 1/12 طريقة الإجابة
      - combobox "طريقة الإجابة": اسحب التسميات
      - list:
        - listitem:
          - button "حدد المنطقة 1" [pressed]: "1"
          - strong: المنطقة 1
          - button "احذف المنطقة 1"
      - button "أضف منطقة إجابة"
      - button "اقترح الإجابات بالذكاء الاصطناعي"
      - button "احذف كل مناطق الإجابة"
      - paragraph: يرى الطالب التسميات ويسحب كل تسمية إلى مكانها.
    - paragraph: راجع مواضع الإجابات وتسمياتها ثم أكّدها. لا يمكن اعتماد السؤال قبل تأكيدها.
    - button "تم تأكيد مناطق الإجابة"
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
    - strong: تحديد الإجابة
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
  4  | import {execFileSync} from 'node:child_process'
  5  | import path from 'node:path'
  6  | const require=createRequire(import.meta.url)
  7  | const sharp=require('../../asasera-backend/node_modules/sharp') as typeof import('../../asasera-backend/node_modules/sharp/lib/index.js')
  8  | async function add(page:import('@playwright/test').Page,type:string){
  9  |  await page.getByRole('button',{name:'أضف سؤالًا',exact:true}).first().click()
  10 |  await page.getByRole('dialog',{name:'ما نوع السؤال الجديد؟'}).getByRole('button',{name:type,exact:true}).click()
  11 | }
  12 | test('teacher authors ordering, matching, and confirmed image zones with durable saves',async({page})=>{
  13 |   test.setTimeout(120_000)
  14 |   const teacher=localTeacher(),{email,password}=teacher
  15 |   await page.addInitScript(()=>{localStorage.setItem('asasera.language','ar');localStorage.setItem('i18nextLng','ar')})
  16 |   const {accessToken}=await(await page.request.post('/api/v1/auth/login',{data:{email,password}})).json(),headers={authorization:`Bearer ${accessToken}`}
  17 |   const {activity}=await(await page.request.post('/api/v1/activities',{headers,data:{title:'اختبار أنواع الأسئلة · بيانات تجريبية',subjectId:1,levelId:8,purposeId:2}})).json()
  18 |   const imageFixture=JSON.parse(execFileSync(process.execPath,['--import','./tests/bootstrap.mjs','--input-type=module','-e',`
  19 |    import sharp from 'sharp';import {grantImage,localImageUpload} from './src/modules/activity-media/media.service.ts';import {approveFixtureImage} from './tests/image-fixture.ts';import {pool} from './src/db/pool.js';
  20 |    const owner=Number(process.argv[1]),bytes=await sharp({create:{width:640,height:400,channels:3,background:'#8bd3c7'}}).png().toBuffer();
  21 |    try{const grant=await grantImage(owner,{contentType:'image/png',byteSize:bytes.length,filename:'synthetic-zones.png'});await localImageUpload(owner,grant.assetId,bytes);console.log(JSON.stringify(await approveFixtureImage(owner,grant.assetId)))}finally{await pool.end()}
  22 |   `,String(teacher.owner)],{cwd:path.resolve(import.meta.dirname,'../../asasera-backend'),env:{...process.env,NODE_ENV:'test',PG_HOST:'127.0.0.1',PG_PORT:process.env.E2E_PG_PORT??'55432',PG_DATABASE:process.env.E2E_PG_DATABASE,PG_USER:process.env.E2E_PG_USER??'postgres',PG_PASSWORD:'postgres',PG_SSL:'disable'},encoding:'utf8'}).trim().split('\n').at(-1)!)
  23 |   await page.route('**/api/v1/activity-media/uploads',route=>route.fulfill({json:{assetId:imageFixture.assetId,uploadUrl:'/api/v1/activity-media/test-bytes',local:true}}))
  24 |   await page.route('**/api/v1/activity-media/test-bytes',route=>route.fulfill({status:204}))
  25 |   await page.route('**/api/v1/activity-media/uploads/*/confirm',route=>route.fulfill({json:{...imageFixture,status:'APPROVED'}}))
  26 |   await page.setViewportSize({width:1440,height:1000});await page.goto(`/teacher/activities/${activity.id}`)
  27 |   await add(page,'رتّب')
  28 |   await expect(page.locator('[data-question-thumb]')).toHaveCount(1)
  29 |   await expect(page.locator('main')).not.toHaveAttribute('inert','')
  30 |   const type=page.locator('aside [data-question-kind]').first()
  31 |   await page.getByLabel('نص السؤال').fill('رتب الأعداد تصاعديًا')
  32 |   await page.getByLabel('نص العنصر 1',{exact:true}).fill('واحد');await page.getByLabel('نص العنصر 2',{exact:true}).fill('اثنان');await page.getByLabel('نص العنصر 3',{exact:true}).fill('ثلاثة')
  33 |   await add(page,'مطابقة')
  34 |   await expect(page.locator('[data-question-thumb]')).toHaveCount(2)
  35 |   await expect(page.locator('main')).not.toHaveAttribute('inert','')
  36 |   await page.getByLabel('نص السؤال').fill('طابق العدد مع اسمه')
  37 |   await page.getByLabel('الهدف 1',{exact:true}).fill('واحد');await page.getByLabel('الهدف 2',{exact:true}).fill('اثنان')
  38 |   await page.getByLabel('البطاقة 1',{exact:true}).fill('1');await page.getByLabel('البطاقة 2',{exact:true}).fill('2')
  39 |   await add(page,'تحديد الإجابة')
  40 |   await expect(page.locator('[data-question-thumb]')).toHaveCount(3)
  41 |   await expect(page.locator('main')).not.toHaveAttribute('inert','')
  42 |   /* A pin question cannot be stored without a picture. The new-question flow
  43 |      therefore opens its image-first canvas and commits the hotspot kind only
  44 |      after the image is approved. */
  45 |   await expect(page.getByRole('heading',{name:'ابدأ بصورة',exact:true})).toBeVisible()
  46 |   await expect(type).toHaveAttribute('data-question-kind','mcq')
  47 |   const image=await sharp({create:{width:640,height:400,channels:3,background:'#8bd3c7'}}).png().toBuffer()
  48 |   const picker=page.waitForEvent('filechooser');await page.getByRole('button',{name:'ارفع صورة',exact:true}).click();await (await picker).setFiles({name:'synthetic-zones.png',mimeType:'image/png',buffer:image})
  49 |   await expect(type).toHaveAttribute('data-question-kind','hotspot',{timeout:20_000})
  50 |   await expect(page.getByRole('heading',{name:'حوّل الصورة إلى سؤال',exact:true})).toBeVisible({timeout:20_000})
  51 |   await page.getByLabel('نص السؤال').fill('اختر المنطقة الأولى')
  52 |   await page.getByRole('textbox',{name:'إجابة المنطقة 1',exact:true}).fill('المنطقة الأولى')
  53 |   await page.getByText('الشكل والموضع الدقيق',{exact:true}).click()
  54 |   await page.getByLabel('أفقي %',{exact:true}).fill('10');await page.getByLabel('رأسي %',{exact:true}).fill('10');await page.getByLabel('عرض %',{exact:true}).fill('30');await page.getByLabel('ارتفاع %',{exact:true}).fill('30')
  55 |   /* Publishing is now called approving: «اعتماد النسخة» for the first version and
  56 |      «اعتماد التغييرات» once one exists, and the blocking panel is «الاعتماد متوقّف». */
  57 |   await page.getByRole('button',{name:'اعتماد النسخة',exact:true}).click()
  58 |   await expect(page.getByRole('alert').filter({hasText:'الاعتماد متوقّف'})).toBeVisible()
  59 |   await page.getByRole('button',{name:'تأكيد مناطق الإجابة',exact:true}).click()
  60 |   await page.getByRole('button',{name:'اعتماد النسخة',exact:true}).click()
> 61 |   await expect(page.getByRole('button',{name:'اعتماد التغييرات',exact:true})).toBeVisible()
     |                                                                               ^ Error: expect(locator).toBeVisible() failed
  62 |   const loaded=await(await page.request.get(`/api/v1/activities/${activity.id}`,{headers})).json()
  63 |   expect(loaded.questions.map((q:{kind:string})=>q.kind)).toEqual(['order','match','hotspot'])
  64 |   expect(loaded.questions[0].payload.items.map((i:{text:string})=>i.text)).toEqual(['واحد','اثنان','ثلاثة'])
  65 |   expect(loaded.questions[2].payload.zones[0].x).toBeCloseTo(.1,1)
  66 |   await page.screenshot({path:'../screenshots/v4/editor-hotspot-1440.png',fullPage:true})
  67 |   await page.reload();await page.locator('[data-question-thumb]').nth(2).click()
  68 |   await expect(page.getByRole('heading',{name:'حوّل الصورة إلى سؤال',exact:true})).toBeVisible()
  69 |   await page.setViewportSize({width:390,height:844});await expect(page.locator('aside')).not.toBeVisible();await expect(page.locator('nav')).not.toBeVisible();await expect(page.locator('main img').first()).toBeVisible();await page.screenshot({path:'../screenshots/v4/editor-hotspot-390.png',fullPage:true})
  70 |   for(const width of [360,2560]){await page.setViewportSize({width,height:1000});const ratios=await page.locator('div[class*=zoneEditor]').evaluate(el=>{const stage=el.getBoundingClientRect(),rect=el.querySelector('rect')!.getBoundingClientRect();return {x:(rect.x-stage.x)/stage.width,w:rect.width/stage.width}});expect(ratios.x).toBeCloseTo(.1,1);expect(ratios.w).toBeCloseTo(.3,1)}
  71 | })
  72 | 
```