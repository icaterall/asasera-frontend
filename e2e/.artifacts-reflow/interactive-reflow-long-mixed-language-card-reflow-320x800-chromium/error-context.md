# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: interactive-reflow.spec.ts >> long mixed-language card reflow 320x800
- Location: e2e/interactive-reflow.spec.ts:4:35

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - link "تخطَّ إلى المحتوى" [ref=e4] [cursor=pointer]:
    - /url: "#teacher-main"
  - status [ref=e6]:
    - generic [ref=e7]:
      - paragraph [ref=e10]: أكّد بريدك الإلكتروني لحماية حسابك في أساسيرا. تحقّق من صندوق الوارد على reflow-5fdb204c-9976-4261-978a-d8347b8e9dc6@example.com.
      - generic [ref=e11]:
        - button "تأكيد البريد الإلكتروني" [ref=e12]
        - button "تغيير البريد الإلكتروني" [ref=e13]
  - generic [ref=e15]:
    - banner [ref=e16]:
      - button "فتح القائمة" [ref=e17]
      - link [ref=e20] [cursor=pointer]:
        - /url: /teacher/dashboard
        - img "أساسيرا" [ref=e22]
      - generic [ref=e23]:
        - 'button "الرصيد المتاح: 0. فتح الحساب والاستخدام" [ref=e24] [cursor=pointer]':
          - generic [ref=e28]:
            - strong [ref=e29]: "0"
            - generic [ref=e30]: أضف رصيدًا
        - group "اللغة" [ref=e33]:
          - button "التبديل إلى العربية" [pressed] [ref=e34]: ع
          - button "Switch to English" [ref=e35]: EN
        - button "تبديل مظهر الألوان" [ref=e36]
        - button "قائمة الحساب — معلّم" [ref=e44] [cursor=pointer]:
          - generic [ref=e46]: R
    - main [ref=e47]:
      - generic [ref=e48]:
        - link "← أنشطتي" [ref=e49] [cursor=pointer]:
          - /url: /teacher/activities
        - generic [ref=e50]:
          - heading "Synthetic mixed-language reflow" [level=1] [ref=e51]
          - paragraph [ref=e52]: 1 أسئلة في النسخة المعتمدة
          - heading "كيف تريد تقديم النشاط؟" [level=2] [ref=e53]
        - group "طريقة اللعب" [ref=e54]:
          - generic [ref=e56] [cursor=pointer]:
            - radio "حصة مباشرة قد الحصة، وانضم الطلاب برمز اللعبة." [ref=e57]
            - strong [ref=e64]: حصة مباشرة
            - generic [ref=e65]: قد الحصة، وانضم الطلاب برمز اللعبة.
          - generic [ref=e66] [cursor=pointer]:
            - radio "واجب موعد نهائي واضح. يتحكم المعلم بوقت ظهور الإجابات." [ref=e67]
            - strong [ref=e71]: واجب
            - generic [ref=e72]: موعد نهائي واضح. يتحكم المعلم بوقت ظهور الإجابات.
          - generic [ref=e73] [cursor=pointer]:
            - radio "تعلّم ذاتي تدريب بالسرعة المناسبة للطالب مع تغذية راجعة." [checked] [ref=e74]
            - strong [ref=e77]: تعلّم ذاتي
            - generic [ref=e78]: تدريب بالسرعة المناسبة للطالب مع تغذية راجعة.
        - group "طريقة عرض المحتوى" [ref=e79]:
          - paragraph [ref=e81]: استخدم الأسئلة المعتمدة دون إنشاء محتوى جديد أو استهلاك الرصيد.
          - generic [ref=e82]:
            - generic [ref=e83] [cursor=pointer]:
              - radio "الأسئلة بالترتيب" [ref=e84]
              - text: الأسئلة بالترتيب
            - generic [ref=e85] [cursor=pointer]:
              - radio "بطاقات المراجعة 1 / 1" [checked] [active] [ref=e86]
              - generic [ref=e87]:
                - text: بطاقات المراجعة
                - generic [ref=e88]: 1 / 1
            - generic [ref=e89] [cursor=pointer]:
              - radio "عجلة الأسئلة 1 / 1" [ref=e90]
              - generic [ref=e91]:
                - text: عجلة الأسئلة
                - generic [ref=e92]: 1 / 1
            - generic [ref=e93] [cursor=pointer]:
              - radio "بطاقات عشوائية 1 / 1" [ref=e94]
              - generic [ref=e95]:
                - text: بطاقات عشوائية
                - generic [ref=e96]: 1 / 1
            - generic [ref=e97]:
              - radio "بطاقات التحدث 0 / 1" [disabled] [ref=e98]
              - generic [ref=e99]:
                - text: بطاقات التحدث
                - generic [ref=e100]: 0 / 1
            - generic [ref=e101] [cursor=pointer]:
              - radio "افتح الصندوق 1 / 1" [ref=e102]
              - generic [ref=e103]:
                - text: افتح الصندوق
                - generic [ref=e104]: 1 / 1
            - generic [ref=e105]:
              - radio "المطابقة 0 / 1" [disabled] [ref=e106]
              - generic [ref=e107]:
                - text: المطابقة
                - generic [ref=e108]: 0 / 1
            - generic [ref=e109]:
              - radio "الذاكرة 0 / 1" [disabled] [ref=e110]
              - generic [ref=e111]:
                - text: الذاكرة
                - generic [ref=e112]: 0 / 1
            - generic [ref=e113]:
              - radio "تصنيف المجموعات 0 / 1" [disabled] [ref=e114]
              - generic [ref=e115]:
                - text: تصنيف المجموعات
                - generic [ref=e116]: 0 / 1
            - generic [ref=e117]:
              - radio "الترتيب 0 / 1" [disabled] [ref=e118]
              - generic [ref=e119]:
                - text: الترتيب
                - generic [ref=e120]: 0 / 1
            - generic [ref=e121]:
              - radio "إكمال الجملة 0 / 1" [disabled] [ref=e122]
              - generic [ref=e123]:
                - text: إكمال الجملة
                - generic [ref=e124]: 0 / 1
            - generic [ref=e125]:
              - radio "بناء الكلمات 0 / 1" [disabled] [ref=e126]
              - generic [ref=e127]:
                - text: بناء الكلمات
                - generic [ref=e128]: 0 / 1
            - generic [ref=e129]:
              - radio "البحث عن الكلمات 0 / 1" [disabled] [ref=e130]
              - generic [ref=e131]:
                - text: البحث عن الكلمات
                - generic [ref=e132]: 0 / 1
            - generic [ref=e133]:
              - radio "الكلمات المتقاطعة 0 / 1" [disabled] [ref=e134]
              - generic [ref=e135]:
                - text: الكلمات المتقاطعة
                - generic [ref=e136]: 0 / 1
          - paragraph [ref=e137]: "مراجعة ذاتية: يقيّم الطالب تذكّره، وليست درجة اختبار."
        - group "إعدادات المشاركة" [ref=e138]:
          - generic [ref=e140]:
            - text: المنطقة الزمنية
            - combobox "المنطقة الزمنية" [ref=e141] [cursor=pointer]:
              - generic [ref=e142]: Asia/Muscat
            - textbox [aria-hidden] [ref=e145]: Asia/Muscat
          - generic [ref=e146]:
            - text: يفتح في (اختياري)
            - textbox "يفتح في (اختياري)" [ref=e147]
          - generic [ref=e148]:
            - text: الموعد النهائي
            - textbox "الموعد النهائي" [ref=e149]: 2026-09-21T10:21
          - generic [ref=e150]:
            - text: عدد المحاولات المسموح بها
            - combobox "عدد المحاولات المسموح بها" [ref=e151] [cursor=pointer]:
              - generic [ref=e152]: محاولة واحدة
            - textbox [aria-hidden] [ref=e155]: "1"
          - generic [ref=e156]:
            - text: عرض الإجابات الصحيحة
            - combobox "عرض الإجابات الصحيحة" [ref=e157] [cursor=pointer]:
              - generic [ref=e158]: بعد كل إجابة
            - textbox [aria-hidden] [ref=e162]: immediate
          - generic [ref=e163]:
            - text: الصف
            - combobox "الصف" [ref=e164] [cursor=pointer]:
              - generic [ref=e165]: دون صف محفوظ
            - textbox [aria-hidden] [ref=e169]
          - paragraph [ref=e170]:
            - generic [ref=e171]:
              - text: "ينتهي: 21 سبتمبر 2026، 10:21 ص غرينتش+4 ·"
              - generic [ref=e172]: 21‏/09‏/2026، 6:21 ص UTC
            - text: · Asia/Muscat
          - paragraph [ref=e173]: يُحفظ التقدّم في المتصفح نفسه. تظهر النتائج في تقاريرك ولا تدخل ترتيب الرف العام.
        - button "أنشئ رابط المشاركة" [ref=e174] [cursor=pointer]
```

# Test source

```ts
  1  | import {test,expect} from '@playwright/test'
  2  | 
  3  | const sizes=[[320,800],[360,800],[430,932],[844,390],[768,1024],[1024,768],[599,800],[601,800],[1023,768],[1025,768],[1920,1080]] as const
  4  | for(const [width,height] of sizes)test(`long mixed-language card reflow ${width}x${height}`,async({page,request,browser})=>{
  5  |  expect(new URL(process.env.PW_BASE_URL??'http://127.0.0.1:5411').hostname).toMatch(/^(127\.0\.0\.1|localhost)$/)
  6  |  const ar=width%2===0,language=ar?'ar':'en',contentLanguage=ar?'en':'ar',email=`reflow-${crypto.randomUUID()}@example.com`,password='Synthetic reflow fixture2026!'
  7  |  await request.post('/api/v1/auth/register/teacher',{data:{name:'Reflow instructor',email,password}})
  8  |  const login=await request.post('/api/v1/auth/login',{data:{email,password}}),{accessToken}=await login.json(),headers={Authorization:`Bearer ${accessToken}`}
  9  |  const created=await request.post('/api/v1/activities',{headers,data:{title:'Synthetic mixed-language reflow',contentLanguage,subjectId:1,levelId:8,purposeId:2}}),{activity}=await created.json()
  10 |  const prompt=ar?'Read this statement carefully: changing the presentation of an approved lesson changes its scientific meaning.':'اقرأ العبارة بعناية: تغيير طريقة عرض الدرس المعتمد يغيّر المعنى العلمي للمعلومات الواردة فيه.'
  11 |  const explanation=(ar?'The same reviewed question keeps its meaning, original content and reference explanation when it is presented as a card. ':'يحتفظ السؤال الذي راجعه المعلّم بمعناه ومحتواه الأصلي وتفسيره المرجعي عند عرضه في صورة بطاقة. ').repeat(6)
  12 |  expect((await request.post(`/api/v1/activities/${activity.id}/questions`,{headers,data:{kind:'tf',prompt,explanation,payload:{correct:false}}})).ok()).toBe(true)
  13 |  expect((await request.post(`/api/v1/activities/${activity.id}/publish`,{headers})).ok()).toBe(true)
  14 |  await page.context().addCookies((await request.storageState()).cookies)
  15 |  await page.addInitScript(lang=>localStorage.setItem('asasera.language',lang),language)
  16 |  await page.setViewportSize({width,height})
  17 |  await page.goto(`/teacher/activities/${activity.id}/play?mode=study`)
  18 |  await page.getByRole('radio',{name:ar?/بطاقات المراجعة/:/Flashcards/}).check()
> 19 |  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
     |                                                                                    ^ Error: expect(received).toBe(expected) // Object.is equality
  20 |  await page.getByRole('button',{name:ar?'أنشئ رابط المشاركة':'Create assignment link'}).click()
  21 |  const link=await page.getByRole('textbox',{name:ar?'رابط النشاط':'Assignment link'}).inputValue()
  22 |  const context=await browser.newContext({viewport:{width,height},locale:language,reducedMotion:'reduce'})
  23 |  await context.addInitScript(lang=>localStorage.setItem('asasera.language',lang),language)
  24 |  const learn=await context.newPage(),errors:string[]=[];learn.on('pageerror',e=>errors.push(e.message))
  25 |  try{
  26 |   await learn.goto(link);await learn.getByRole('textbox',{name:ar?'اسمك':'Your name'}).fill('Synthetic learner')
  27 |   await learn.getByRole('button',{name:ar?'ابدأ':'Start',exact:true}).click()
  28 |   await learn.getByRole('button',{name:ar?'ابدأ الجولة':'Start round'}).click()
  29 |   const heading=learn.getByRole('heading',{name:prompt,exact:true})
  30 |   await expect(heading).toHaveAttribute('lang',contentLanguage)
  31 |   await learn.getByRole('button',{name:ar?'اكشف الإجابة':'Reveal answer'}).focus();await learn.keyboard.press('Enter')
  32 |   await expect(learn.getByText(explanation,{exact:true})).toBeVisible()
  33 |   expect(await learn.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
  34 |   expect(await learn.locator('meta[name=viewport]').getAttribute('content')).not.toMatch(/user-scalable=no|maximum-scale=1(?:[, ]|$)/)
  35 |   await learn.screenshot({path:`../docs/evidence/interactive/reflow-${width}x${height}-${language}-mixed.png`,fullPage:true})
  36 |   const rating=learn.getByRole('button',{name:ar?'أتذكرها':'Remembered',exact:true});await rating.focus();await learn.keyboard.press('Enter')
  37 |   await expect(rating).toHaveAttribute('aria-pressed','true')
  38 |   await learn.getByRole('button',{name:ar?'إنهاء الجولة':'Finish round'}).click()
  39 |   await expect(learn.getByRole('heading',{name:ar?'اكتملت الجولة':'Round complete'})).toBeVisible()
  40 |   expect(errors).toEqual([])
  41 |  }finally{await context.close()}
  42 | })
  43 | 
```