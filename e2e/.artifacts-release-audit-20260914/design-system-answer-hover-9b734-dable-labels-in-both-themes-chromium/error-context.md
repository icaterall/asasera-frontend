# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: design-system.spec.ts >> answer hover retains exact fills and readable labels in both themes
- Location: e2e/design-system.spec.ts:25:1

# Error details

```
Error: expect(received).toBeGreaterThanOrEqual(expected)

Expected: >= 4.5
Received:    4.094739352154565
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - heading "نظام الرموز — v4 §5" [level=1] [ref=e5]
    - button "الوضع الداكن" [ref=e6] [cursor=pointer]
    - button "RTL" [ref=e7] [cursor=pointer]
    - generic [ref=e8]: 1280×720 · light · ltr
  - generic [ref=e9]:
    - heading "الألوان والتباين" [level=2] [ref=e10]
    - paragraph [ref=e11]: كل نسبة تُحسب في المتصفح من قيمة الرمز بعد حلّها، لا من جدول مكتوب. تتغيّر مع تبديل الوضع.
    - generic [ref=e12]:
      - generic [ref=e13]:
        - generic [ref=e14]: إجراء
        - generic [ref=e15]: "--act · 5.39 AA"
      - generic [ref=e16]:
        - generic [ref=e17]: إجراء مضغوط
        - generic [ref=e18]: "--act-press · 6.54 AA"
      - generic [ref=e19]:
        - generic [ref=e20]: دليل
        - generic [ref=e21]: "--evidence · 4.50 AA"
      - generic [ref=e22]:
        - generic [ref=e23]: مثلث
        - generic [ref=e24]: "--a1 · 4.71 AA"
      - generic [ref=e25]:
        - generic [ref=e26]: معيّن
        - generic [ref=e27]: "--a2 · 5.39 AA"
      - generic [ref=e28]:
        - generic [ref=e29]: دائرة
        - generic [ref=e30]: "--a3 · 4.09 AA large only"
      - generic [ref=e31]:
        - generic [ref=e32]: مربع
        - generic [ref=e33]: "--a4 · 4.50 AA large · نص كبير فقط"
      - generic [ref=e34]:
        - generic [ref=e35]: حبر
        - generic [ref=e36]: "--ink على السطح · 12.63 AAA"
      - generic [ref=e37]:
        - generic [ref=e38]: خافت
        - generic [ref=e39]: "--muted على السطح · 5.10 AA"
  - generic [ref=e40]:
    - heading "الهندسة — 4 للأدوات و8 للبطاقات" [level=2] [ref=e41]
    - paragraph [ref=e42]: "§5: «نصف قطر واحد لكل شيء» ممنوع صراحة. نصف القطر يشفّر التسلسل."
    - generic [ref=e43]:
      - generic [ref=e44]: 4px · أداة
      - generic [ref=e45]: 8px · بطاقة
      - generic [ref=e46]: "--press"
  - generic [ref=e47]:
    - heading "الأزرار — كل الحالات" [level=2] [ref=e48]
    - paragraph [ref=e49]: لا سهم ملحق بأي نص زر (§5).
    - generic [ref=e50]:
      - generic [ref=e51]: primary
      - button "عادي" [ref=e52] [cursor=pointer]
      - button "معطّل" [disabled] [ref=e53]
      - button "جارٍ" [disabled] [ref=e54]
    - generic [ref=e58]:
      - generic [ref=e59]: secondary
      - button "عادي" [ref=e60] [cursor=pointer]
      - button "معطّل" [disabled] [ref=e61]
      - button "جارٍ" [disabled] [ref=e62]
    - generic [ref=e66]:
      - generic [ref=e67]: quiet
      - button "عادي" [ref=e68] [cursor=pointer]
      - button "معطّل" [disabled] [ref=e69]
      - button "جارٍ" [disabled] [ref=e70]
    - generic [ref=e74]:
      - generic [ref=e75]: danger
      - button "عادي" [ref=e76] [cursor=pointer]
      - button "معطّل" [disabled] [ref=e77]
      - button "جارٍ" [disabled] [ref=e78]
    - paragraph [ref=e82]: "التركيز: استخدم Tab. الحلقة صلبة بإزاحة، لا لون فقط."
  - generic [ref=e83]:
    - heading "بطاقات الإجابة — اللون مربوط بالشكل" [level=2] [ref=e84]
    - paragraph [ref=e85]: نفس الفتحة تعطي نفس اللون ونفس الشكل في المحرّر والبروجكتر وشاشة الطالب. لا خاصية لون منفصلة.
    - generic [ref=e86]:
      - button "باريس" [ref=e87] [cursor=pointer]
      - button "لندن" [ref=e91] [cursor=pointer]
      - button "برلين" [ref=e95] [cursor=pointer]
      - button "مدريد" [ref=e99] [cursor=pointer]
    - paragraph [ref=e103]: الكشف — صحيح وخاطئ، بعلامة ونص لا بلون وحده
    - generic [ref=e104]:
      - button "باريس، إجابة صحيحة" [ref=e105] [cursor=pointer]:
        - generic [ref=e108]: باريس
        - generic [ref=e109]: إجابة صحيحة
        - generic [ref=e112]: "12"
      - button "لندن، إجابة خاطئة" [ref=e113] [cursor=pointer]:
        - generic [ref=e116]: لندن
        - generic [ref=e117]: إجابة خاطئة
        - generic [ref=e121]: "7"
      - button "برلين، إجابة خاطئة" [ref=e122] [cursor=pointer]:
        - generic [ref=e125]: برلين
        - generic [ref=e126]: إجابة خاطئة
        - generic [ref=e130]: "3"
      - button "مدريد، قيد الإرسال" [ref=e131] [cursor=pointer]:
        - generic [ref=e134]: مدريد
    - paragraph [ref=e135]: شاشة الطالب — أشكال وألوان بلا نص (§8). النص يبقى في الاسم المتاح.
    - generic [ref=e136]:
      - 'button "مثلث: باريس" [ref=e137] [cursor=pointer]'
      - 'button "معيّن: لندن" [ref=e140] [cursor=pointer]'
      - 'button "دائرة: برلين" [ref=e143] [cursor=pointer]'
      - 'button "مربع: مدريد" [ref=e146] [cursor=pointer]'
  - generic [ref=e149]:
    - heading "مقياس البروجكتر — 40 إلى 72 بكسل" [level=2] [ref=e150]
    - paragraph [ref=e151]: "§4 #4: clamp() على عرض المنفذ."
    - paragraph [ref=e153]: ما عاصمة فرنسا؟
  - generic [ref=e154]:
    - heading "الحقول" [level=2] [ref=e155]
    - generic [ref=e156]:
      - generic [ref=e158]:
        - generic [ref=e159]: عنوان النشاط
        - textbox "عنوان النشاط" [ref=e160]:
          - /placeholder: اكتب عنوانًا
      - generic [ref=e162]:
        - generic [ref=e163]: مع تلميح
        - textbox "مع تلميح" [ref=e164]: كسور
        - generic [ref=e165]: يظهر للمعلّمين فقط
      - generic [ref=e167]:
        - generic [ref=e168]: خطأ
        - textbox "خطأ" [invalid] [ref=e169]
        - alert [ref=e170]: هذا الحقل مطلوب قبل النشر
      - generic [ref=e174]:
        - generic [ref=e175]: معطّل
        - textbox "معطّل" [disabled] [ref=e176]: غير قابل للتعديل
  - generic [ref=e177]:
    - heading "البطاقات والنوافذ" [level=2] [ref=e178]
    - generic [ref=e179]:
      - generic [ref=e180]:
        - strong [ref=e181]: بطاقة عادية
        - paragraph [ref=e182]: حدّ شعري، لا ظل رمادي ناعم.
      - generic [ref=e183]:
        - strong [ref=e184]: شريط وحدة
        - paragraph [ref=e185]: اللون هنا يعني الوحدة، لا زينة.
      - button "افتح نافذة" [ref=e186] [cursor=pointer]
  - generic [ref=e188]:
    - heading "Asasera loading" [level=2] [ref=e189]
    - paragraph [ref=e190]: A steady logo with a rotating blue-green ring, gaps and dots. Rotation stops when reduced motion is preferred.
    - generic [ref=e191]:
      - status [ref=e193]:
        - generic [ref=e202]: Loading your learning space…
      - button "Saving…" [disabled] [ref=e213]
    - status [ref=e235]:
      - generic [ref=e244]: Loading your activity…
    - generic [ref=e267]:
      - status [ref=e272]:
        - generic [ref=e281]: Loading activities…
      - status [ref=e300]:
        - generic [ref=e309]: Loading settings…
  - generic [ref=e321]:
    - heading "الحالات المشتركة" [level=2] [ref=e322]
    - paragraph [ref=e323]: كل حالة تقول ما حدث وما التالي. الحالة بلا مخرج ليست حالة.
    - generic [ref=e324]:
      - generic [ref=e326]:
        - heading "لا أنشطة في هذا الرفّ بعد" [level=3] [ref=e330]
        - paragraph [ref=e331]: لم يؤلّف أحد هنا حتى الآن.
        - button "كن أول من يؤلّف هنا" [ref=e333] [cursor=pointer]
      - alert [ref=e335]:
        - heading "تعذّر الحفظ" [level=3] [ref=e338]
        - paragraph [ref=e339]: آخر تعديل محفوظ محليًا ولم يُفقد.
        - button "أعد المحاولة" [ref=e341] [cursor=pointer]
      - status [ref=e343]:
        - heading "نُشر النشاط" [level=3] [ref=e347]
        - paragraph [ref=e348]: أصبح ظاهرًا في رفّ الرياضيات — الثاني المتوسط.
      - status [ref=e354]:
        - generic [ref=e363]: Loading…
  - generic [ref=e386]:
    - heading "السلّم الطباعي — عربي أولًا" [level=2] [ref=e387]
    - generic [ref=e388]:
      - text: مسرح — الثاني المتوسط · Grade 8 · 1234
      - generic [ref=e389]: "--f-stage"
    - generic [ref=e390]:
      - text: رئيس — الثاني المتوسط · Grade 8 · 1234
      - generic [ref=e391]: "--f-hero"
    - generic [ref=e392]:
      - text: عنوان — الثاني المتوسط · Grade 8 · 1234
      - generic [ref=e393]: "--f-title"
    - generic [ref=e394]:
      - text: ترويسة — الثاني المتوسط · Grade 8 · 1234
      - generic [ref=e395]: "--f-heading"
    - generic [ref=e396]:
      - text: نص — الثاني المتوسط · Grade 8 · 1234
      - generic [ref=e397]: "--f-body"
    - generic [ref=e398]:
      - text: صغير — الثاني المتوسط · Grade 8 · 1234
      - generic [ref=e399]: "--f-small"
    - generic [ref=e400]:
      - text: دقيق — الثاني المتوسط · Grade 8 · 1234
      - generic [ref=e401]: "--f-micro"
```

# Test source

```ts
  1   | import { expect, test, type Page } from '@playwright/test'
  2   | 
  3   | /**
  4   |  * W02 acceptance — §16 p25:
  5   |  * «صفحة عرض تُظهر كل مكوّن في كل حالاته، في الوضعين الفاتح والداكن،
  6   |  *  وباتجاهين، بتباين مطابق للمعيار.»
  7   |  *
  8   |  * Run against the dev server; the gallery route exists only there.
  9   |  *
  10  |  * WHY PLAYWRIGHT AND NOT THE BROWSER EXTENSION: the extension's resize
  11  |  * reported success and left `window.innerWidth` at 1728. A responsive claim
  12  |  * made from a viewport that never changed is worse than no claim, so every
  13  |  * width below is asserted before anything is measured at it.
  14  |  */
  15  | 
  16  | const VIEWPORTS = [
  17  |   { name: 'wide desktop', width: 1920, height: 1080 },
  18  |   { name: 'laptop', width: 1440, height: 900 },
  19  |   { name: 'short laptop', width: 1280, height: 720 },
  20  |   { name: 'phone 390', width: 390, height: 844 },
  21  |   { name: 'phone 360', width: 360, height: 740 },
  22  |   { name: 'projector 2560', width: 2560, height: 1440 },
  23  | ]
  24  | 
  25  | test('answer hover retains exact fills and readable labels in both themes',async({page})=>{
  26  |  for(const dark of [false,true]){
  27  |   await openGallery(page,{dark,rtl:true})
  28  |   for(const slot of [1,2,3,4]){
  29  |    const tile=page.locator(`button[class*="_s${slot}_"]`).first()
  30  |    const fill=await tile.evaluate(el=>getComputedStyle(el).backgroundColor)
  31  |    await tile.hover();await page.waitForTimeout(250)
  32  |    const measured=await tile.evaluate(el=>{
  33  |     const c=getComputedStyle(el),label=getComputedStyle(el.querySelector('span[class*=label]')!)
  34  |     const lum=(color:string)=>{const rgb=color.match(/[\d.]+/g)!.slice(0,3).map(Number).map(n=>{const v=n/255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4});return rgb[0]!*.2126+rgb[1]!*.7152+rgb[2]!*.0722}
  35  |     const a=lum(c.backgroundColor),b=lum(label.color)
  36  |     return {fill:c.backgroundColor,filter:c.filter,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05),large:parseFloat(label.fontSize)>=18.667&&Number(label.fontWeight)>=700}
  37  |    })
> 38  |    expect(measured.fill).toBe(fill);expect(measured.filter).toBe('none');expect(measured.ratio).toBeGreaterThanOrEqual(measured.large?3:4.5)
      |                                                                                                 ^ Error: expect(received).toBeGreaterThanOrEqual(expected)
  39  |   }
  40  |  }
  41  | })
  42  | 
  43  | async function openGallery(page: Page, { dark, rtl }: { dark: boolean; rtl: boolean }) {
  44  |   await page.goto('/__design')
  45  |   await page.waitForSelector('.asas')
  46  |   await page.evaluate(
  47  |     ([d, r]) => {
  48  |       document.documentElement.classList.toggle('dark', d as boolean)
  49  |       document.documentElement.dir = (r as boolean) ? 'rtl' : 'ltr'
  50  |     },
  51  |     [dark, rtl],
  52  |   )
  53  |   // The contrast readouts observe <html>; give the observer a frame to fire.
  54  |   await page.waitForTimeout(250)
  55  | }
  56  | 
  57  | test.describe('the owner-approved Kahoot token contract', () => {
  58  |   test('the seventeen baseline tokens resolve to the Kahoot override values', async ({ page }) => {
  59  |     await openGallery(page, { dark: false, rtl: true })
  60  |     const tokens = await page.evaluate(() => {
  61  |       const host = document.querySelector('.asas')!
  62  |       const read = (n: string) => getComputedStyle(host).getPropertyValue(n).trim()
  63  |       return {
  64  |         act: read('--act'), actPress: read('--act-press'), evidence: read('--evidence'),
  65  |         a1: read('--a1'), a2: read('--a2'), a3: read('--a3'), a4: read('--a4'),
  66  |         ink: read('--ink'), muted: read('--muted'), line: read('--line'), surface: read('--surface'),
  67  |         rControl: read('--r-control'), rCard: read('--r-card'), hControl: read('--h-control'),
  68  |         tState: read('--t-state'), tSelect: read('--t-select'), tPanel: read('--t-panel'),
  69  |       }
  70  |     })
  71  |     expect(tokens).toEqual({
  72  |       act: '#1368ce', actPress: '#105cb4', evidence: '#26890c',
  73  |       a1: '#e21b3c', a2: '#1368ce', a3: '#d89e00', a4: '#26890c',
  74  |       ink: '#333333', muted: '#6e6e6e', line: '#cccccc', surface: '#ffffff',
  75  |       rControl: '4px', rCard: '8px', hControl: '48px',
  76  |       tState: '200ms', tSelect: '100ms', tPanel: '300ms',
  77  |     })
  78  |   })
  79  | 
  80  |   test('radius encodes hierarchy — a control is 4px and a card is 8px, never one value', async ({ page }) => {
  81  |     await openGallery(page, { dark: false, rtl: true })
  82  |     const control = await page.locator('button[class*="btn"]').first().evaluate((el) => getComputedStyle(el).borderRadius)
  83  |     const card = await page.locator('div[class*="card"]').first().evaluate((el) => getComputedStyle(el).borderRadius)
  84  |     expect(control).toBe('4px')
  85  |     expect(card).toBe('8px')
  86  |     expect(control).not.toBe(card)
  87  |   })
  88  | 
  89  |   test('legacy screens inherit the current control geometry', async ({ page }) => {
  90  |     await page.goto('/')
  91  |     const legacy = await page.evaluate(() =>
  92  |       getComputedStyle(document.documentElement).getPropertyValue('--radius-sm').trim(),
  93  |     )
  94  |     // Owner styling override applies to the legacy shell as well.
  95  |     expect(legacy === '4px').toBeTruthy()
  96  |   })
  97  | })
  98  | 
  99  | test.describe('answer slots bind colour to shape, permanently', () => {
  100 |   for (const dark of [false, true]) {
  101 |     test(`the four slots keep their shape and hue pairing (${dark ? 'dark' : 'light'})`, async ({ page }) => {
  102 |       await openGallery(page, { dark, rtl: true })
  103 |       const tiles = page.locator('button[class*="tile"]')
  104 |       const slots = await tiles.evaluateAll((els) =>
  105 |         els.slice(0, 4).map((el) => {
  106 |           const shape = el.querySelector('svg path, svg circle, svg rect')!.tagName.toLowerCase()
  107 |           return { fill: getComputedStyle(el).backgroundColor, shape }
  108 |         }),
  109 |       )
  110 |       expect(slots).toHaveLength(4)
  111 |       // Shape order is fixed: triangle, diamond, circle, square.
  112 |       expect(slots.map((s) => s.shape)).toEqual(['path', 'path', 'circle', 'rect'])
  113 |       // Four distinct fills — a duplicate would make two slots indistinguishable.
  114 |       expect(new Set(slots.map((s) => s.fill)).size).toBe(4)
  115 |     })
  116 |   }
  117 | 
  118 |   test('classroom mode hides the wording on screen but keeps it in the accessible name', async ({ page }) => {
  119 |     await openGallery(page, { dark: false, rtl: true })
  120 |     const shapeOnly = page.locator('button[class*="shapeOnly"]').first()
  121 |     const name = await shapeOnly.getAttribute('aria-label')
  122 |     // The shape AND the option text: a screen-reader user gets what the room
  123 |     // gets from the projector, not less.
  124 |     expect(name).toContain('مثلث')
  125 |     expect(name).toContain('باريس')
  126 |     // The text is not painted on the control itself.
  127 |     await expect(shapeOnly.locator('span[class*="label"]')).toHaveCount(0)
  128 |   })
  129 | 
  130 |   test('correct and incorrect are announced as words, not only as colour', async ({ page }) => {
  131 |     await openGallery(page, { dark: false, rtl: true })
  132 |     await expect(page.getByText('إجابة صحيحة').first()).toBeVisible()
  133 |     await expect(page.getByText('إجابة خاطئة').first()).toBeVisible()
  134 |   })
  135 | })
  136 | 
  137 | test.describe('contrast meets the standard, measured in the browser', () => {
  138 |   for (const dark of [false, true]) {
```