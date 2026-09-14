# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: design-system.spec.ts >> contrast meets the standard, measured in the browser >> no token pair fails AA in the light theme
- Location: e2e/design-system.spec.ts:139:5

# Error details

```
Error: contrast failures: [{"pair":"--on-a3 on --a3","ratio":4.09,"bar":4.5}]

expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 7

- Array []
+ Array [
+   Object {
+     "bar": 4.5,
+     "pair": "--on-a3 on --a3",
+     "ratio": 4.09,
+   },
+ ]
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
  139 |     test(`no token pair fails AA in the ${dark ? 'dark' : 'light'} theme`, async ({ page }) => {
  140 |       await openGallery(page, { dark, rtl: true })
  141 |       const failures = await page.evaluate(() => {
  142 |         const host = document.querySelector('.asas')!
  143 |         const tok = (n: string) => {
  144 |           const p = document.createElement('span')
  145 |           p.style.color = `var(${n})`; p.style.display = 'none'
  146 |           host.appendChild(p); const v = getComputedStyle(p).color; p.remove(); return v
  147 |         }
  148 |         const parse = (c: string) => {
  149 |           const m = c.match(/rgba?\(([^)]+)\)/)!
  150 |           const a = m[1]!.split(/[\s,/]+/).filter(Boolean).map(Number)
  151 |           return [a[0]!, a[1]!, a[2]!] as [number, number, number]
  152 |         }
  153 |         const lin = (c: number) => { const s = c / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4 }
  154 |         const lum = ([r, g, b]: [number, number, number]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
  155 |         const ratio = (a: string, b: string) => {
  156 |           const la = lum(parse(a)), lb = lum(parse(b))
  157 |           return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
  158 |         }
  159 |         /* --a4 is documented as large-text-only: white on #1f8a37 is 4.42,
  160 |            and the plan fixes the fill exactly. Its bar is AA large. */
  161 |         const pairs: Array<[string, string, number]> = [
  162 |           ['--on-act', '--act', 4.5], ['--on-evidence', '--evidence', 4.5],
  163 |           ['--on-a1', '--a1', 4.5], ['--on-a2', '--a2', 4.5], ['--on-a3', '--a3', 4.5],
  164 |           ['--on-a4', '--a4', 3.0],
  165 |           ['--ink', '--surface', 4.5], ['--muted', '--surface', 4.5],
  166 |         ]
  167 |         return pairs
  168 |           .map(([f, b, bar]) => ({ pair: `${f} on ${b}`, ratio: +ratio(tok(f), tok(b)).toFixed(2), bar }))
  169 |           .filter((r) => r.ratio < r.bar)
  170 |       })
> 171 |       expect(failures, `contrast failures: ${JSON.stringify(failures)}`).toEqual([])
      |                                                                          ^ Error: contrast failures: [{"pair":"--on-a3 on --a3","ratio":4.09,"bar":4.5}]
  172 |     })
  173 |   }
  174 | })
  175 | 
  176 | test.describe('responsive — the viewport is asserted before anything is measured', () => {
  177 |   for (const vp of VIEWPORTS) {
  178 |     test(`${vp.name} (${vp.width}x${vp.height}): no horizontal overflow`, async ({ page }) => {
  179 |       await page.setViewportSize({ width: vp.width, height: vp.height })
  180 |       await openGallery(page, { dark: false, rtl: true })
  181 | 
  182 |       const measured = await page.evaluate(() => ({
  183 |         w: window.innerWidth,
  184 |         h: window.innerHeight,
  185 |         scrollWidth: document.documentElement.scrollWidth,
  186 |         clientWidth: document.documentElement.clientWidth,
  187 |       }))
  188 | 
  189 |       // The resize must have actually happened. This is the assertion that
  190 |       // stops a desktop measurement being reported as a phone one.
  191 |       expect(measured.w, 'the viewport did not actually resize').toBe(vp.width)
  192 | 
  193 |       expect(
  194 |         measured.scrollWidth,
  195 |         `the page scrolls horizontally at ${vp.width}px (${measured.scrollWidth} > ${measured.clientWidth})`,
  196 |       ).toBeLessThanOrEqual(measured.clientWidth + 1)
  197 |     })
  198 |   }
  199 | 
  200 |   test('the stage type reaches the 40–72px band across viewports (§4 #4)', async ({ page }) => {
  201 |     const sizes: Record<number, number> = {}
  202 |     for (const width of [360, 1440, 2560]) {
  203 |       await page.setViewportSize({ width, height: 900 })
  204 |       await openGallery(page, { dark: false, rtl: true })
  205 |       expect(await page.evaluate(() => window.innerWidth)).toBe(width)
  206 |       sizes[width] = await page
  207 |         .locator('p[class*="stageText"]')
  208 |         .evaluate((el) => Number.parseFloat(getComputedStyle(el).fontSize))
  209 |     }
  210 |     // Clamped at both ends, and monotonically larger on a wider viewport.
  211 |     expect(sizes[360]).toBeGreaterThanOrEqual(40)
  212 |     expect(sizes[2560]).toBeLessThanOrEqual(72)
  213 |     expect(sizes[2560]).toBeGreaterThan(sizes[360]!)
  214 |     expect(sizes[2560]).toBe(72)
  215 |   })
  216 | })
  217 | 
  218 | test.describe('direction', () => {
  219 |   test('the chrome mirrors but the numbers do not', async ({ page }) => {
  220 |     await openGallery(page, { dark: false, rtl: true })
  221 |     const rtlReadout = await page.getByTestId('viewport').textContent()
  222 |     await openGallery(page, { dark: false, rtl: false })
  223 |     const ltrReadout = await page.getByTestId('viewport').textContent()
  224 | 
  225 |     // Both directions must report the SAME width first. Without dir="ltr" on
  226 |     // the readout the RTL one reads «846×1728» — the bidi algorithm reorders
  227 |     // the two number runs around the separator.
  228 |     const first = (s: string | null) => s?.trim().split('×')[0]
  229 |     expect(first(rtlReadout)).toBe(first(ltrReadout))
  230 |   })
  231 | 
  232 |   test('both directions render the gallery without overflow', async ({ page }) => {
  233 |     for (const rtl of [true, false]) {
  234 |       await page.setViewportSize({ width: 1280, height: 720 })
  235 |       await openGallery(page, { dark: false, rtl })
  236 |       const overflow = await page.evaluate(() =>
  237 |         document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)
  238 |       expect(overflow, `overflow in ${rtl ? 'rtl' : 'ltr'}`).toBe(false)
  239 |     }
  240 |   })
  241 | })
  242 | 
  243 | test.describe('focus is visible and is not colour alone', () => {
  244 |   test('a keyboard-focused control gets a solid outline with an offset', async ({ page }) => {
  245 |     await openGallery(page, { dark: false, rtl: true })
  246 |     const button = page.locator('button[class*="btn"]').first()
  247 |     await button.focus()
  248 |     const focus = await button.evaluate((el) => {
  249 |       const cs = getComputedStyle(el)
  250 |       return { style: cs.outlineStyle, width: cs.outlineWidth, offset: cs.outlineOffset }
  251 |     })
  252 |     expect(focus.style).toBe('solid')
  253 |     expect(Number.parseFloat(focus.width)).toBeGreaterThanOrEqual(2)
  254 |     expect(Number.parseFloat(focus.offset)).toBeGreaterThan(0)
  255 |   })
  256 | })
  257 | 
```