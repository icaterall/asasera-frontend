# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: activity-language.spec.ts >> custom language survives interface changes and saves from settings (ar)
- Location: e2e/activity-language.spec.ts:29:31

# Error details

```
Error: expect(locator).toHaveValue(expected) failed

Locator: getByRole('textbox', { name: 'اسم اللغة', exact: true })
Expected: "French"
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toHaveValue" getByRole('textbox', { name: 'اسم اللغة', exact: true }) with timeout 5000ms
  - waiting for getByRole('textbox', { name: 'اسم اللغة', exact: true })

```

```yaml
- button "Switch interface language"
- group:
  - text: اللغة والجمهور إغلاق
  - form "إعداد لغة النشاط":
    - text: لغة النشاط
    - combobox "لغة النشاط": French
    - paragraph: تُحفظ مع النشاط وتُستخدم لتوليد المحتوى بالذكاء الاصطناعي. تغيير لغة الواجهة لا يغيّرها.
    - paragraph: يؤثر التغيير على التوليد القادم فقط، ولا يترجم الأسئلة الموجودة. عند استخراج أسئلة من ملف تبقى صياغتها الأصلية.
    - button "حفظ اللغة"
  - text: التصنيف
  - combobox "التصنيف": اختر تصنيفًا واحدًا
  - text: المراحل التعليمية
  - combobox "المراحل التعليمية" [disabled]: اختر مرحلة أو أكثر
  - paragraph: يمكن أن يناسب المحتوى أكثر من مرحلة.
  - text: الدول (اختياري)
  - combobox "الدول (اختياري)" [disabled]: جميع الدول
  - paragraph: اختر الدول المناسبة للمحتوى، أو اترك القائمة فارغة لجميع الدول.
  - button "حفظ الجمهور" [disabled]
  - status
- status "Saved content language": French
```

# Test source

```ts
  1  | import {expect,test,type Page} from '@playwright/test'
  2  | 
  3  | async function intercept(page:Page){
  4  |  const writes:Array<Record<string,unknown>>=[]
  5  |  await page.route('**/api/**',async route=>{
  6  |   const request=route.request(),path=new URL(request.url()).pathname
  7  |   if(request.method()==='POST'||request.method()==='PATCH'){
  8  |    const body=request.postDataJSON();writes.push(body)
  9  |    await route.fulfill({json:{activity:{id:42,title:'Language fixture',revision:2,categoryId:null,educationStageIds:[],countryIds:[],contentLanguage:body.contentLanguage}}});return
  10 |   }
  11 |   const body=path.endsWith('/purposes')?{purposes:[]}:path.endsWith('/categories')?{categories:[]}:path.endsWith('/education-stages')?{stages:[]}:path.endsWith('/countries')?{countries:[],detectedCountryId:null}:{}
  12 |   await route.fulfill({json:body})
  13 |  })
  14 |  return writes
  15 | }
  16 | for(const width of [390,1440])for(const lang of ['en','ar'])test(`new activity defaults to ${lang}, ${width}px`,async({page},testInfo)=>{
  17 |  const writes=await intercept(page),ar=lang==='ar'
  18 |  await page.setViewportSize({width,height:1000})
  19 |  await page.goto(`/e2e/fixtures/activity-language.html?lang=${lang}`)
  20 |  await expect(page.getByRole('combobox',{name:ar?'لغة النشاط':'Activity language'})).toHaveAttribute('data-select-value',lang)
  21 |  await expect(page.locator('html')).toHaveAttribute('dir',ar?'rtl':'ltr')
  22 |  await page.getByRole('textbox',{name:ar?'اسم النشاط':'Activity name'}).fill(ar?'دورة الماء':'The water cycle')
  23 |  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
  24 |  await page.screenshot({path:testInfo.outputPath(`creation-${lang}-${width}.png`),fullPage:true})
  25 |  await page.getByRole('button',{name:ar?'التالي':'Next',exact:true}).click()
  26 |  await expect(page.getByText('Activity created',{exact:true})).toBeVisible()
  27 |  expect(writes).toEqual([expect.objectContaining({contentLanguage:lang})])
  28 | })
  29 | for(const lang of ['en','ar'])test(`custom language survives interface changes and saves from settings (${lang})`,async({page},testInfo)=>{
  30 |  const writes=await intercept(page),ar=lang==='ar'
  31 |  await page.setViewportSize({width:390,height:1000})
  32 |  await page.goto(`/e2e/fixtures/activity-language.html?settings=1&lang=${lang}`)
  33 |  await page.getByText(ar?'اللغة والجمهور':'Language & audience',{exact:true}).click()
  34 |  const field=page.getByRole('textbox',{name:ar?'اسم اللغة':'Language name',exact:true})
> 35 |  await expect(field).toHaveValue('French')
     |                      ^ Error: expect(locator).toHaveValue(expected) failed
  36 |  await field.fill('日本語')
  37 |  await page.getByRole('button',{name:'Switch interface language'}).click()
  38 |  await expect(page.getByRole('textbox',{name:ar?'Language name':'اسم اللغة',exact:true})).toHaveValue('日本語')
  39 |  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
  40 |  await page.screenshot({path:testInfo.outputPath(`settings-${lang}-390.png`),fullPage:true})
  41 |  await page.getByRole('button',{name:ar?'Save language':'حفظ اللغة',exact:true}).click()
  42 |  await expect(page.getByLabel('Saved content language')).toHaveText('日本語')
  43 |  expect(writes).toEqual([{contentLanguage:'日本語',expectedRevision:1}])
  44 | })
  45 | 
```