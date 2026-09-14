# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: interactive-decks.spec.ts >> open-box complete independent deck ar
- Location: e2e/interactive-decks.spec.ts:3:99

# Error details

```
Test timeout of 90000ms exceeded.
```

```
Error: locator.check: Test timeout of 90000ms exceeded.
Call log:
  - waiting for getByRole('radio', { name: /الذاكرة/ })

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - link "تخطَّ إلى المحتوى" [ref=e4] [cursor=pointer]:
    - /url: "#teacher-main"
  - status [ref=e6]:
    - generic [ref=e7]:
      - paragraph [ref=e10]: أكّد بريدك الإلكتروني لحماية حسابك في أساسيرا. تحقّق من صندوق الوارد على deck-a4bdcb38-fd67-494a-892d-75fc6263d5f2@example.com.
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
          - generic [ref=e46]: D
    - main [ref=e47]:
      - generic [ref=e48]:
        - link "← أنشطتي" [ref=e49] [cursor=pointer]:
          - /url: /teacher/activities
        - generic [ref=e50]:
          - generic [ref=e51]:
            - heading "مراجعة تجريبية" [level=1] [ref=e52]
            - paragraph [ref=e53]: اختر تجربة مناسبة لطلابك، ثم ابدأ عندما تكون مستعدًا.
          - generic "13 أسئلة معتمدة" [ref=e54]:
            - strong [ref=e55]: "13"
            - generic [ref=e56]: أسئلة معتمدة
        - generic [ref=e57]:
          - generic [aria-hidden] [ref=e58]: "1"
          - generic [ref=e59]:
            - heading "كيف تريد تقديم النشاط؟" [level=2] [ref=e60]
            - paragraph [ref=e61]: اختر طريقة واحدة. يمكنك العودة وتغييرها قبل البدء.
        - group "طريقة اللعب" [ref=e62]:
          - generic [ref=e64] [cursor=pointer]:
            - radio "حصة مباشرة قد الحصة، وانضم الطلاب برمز اللعبة." [ref=e65]
            - generic [ref=e66]:
              - strong [ref=e67]: حصة مباشرة
              - generic [ref=e68]: قد الحصة، وانضم الطلاب برمز اللعبة.
          - generic [ref=e70] [cursor=pointer]:
            - radio "واجب موعد نهائي واضح. يتحكم المعلم بوقت ظهور الإجابات." [ref=e71]
            - generic [ref=e72]:
              - strong [ref=e73]: واجب
              - generic [ref=e74]: موعد نهائي واضح. يتحكم المعلم بوقت ظهور الإجابات.
          - generic [ref=e76] [cursor=pointer]:
            - radio "تعلّم ذاتي تدريب بالسرعة المناسبة للطالب مع تغذية راجعة." [checked] [ref=e77]
            - generic [ref=e78]:
              - strong [ref=e79]: تعلّم ذاتي
              - generic [ref=e80]: تدريب بالسرعة المناسبة للطالب مع تغذية راجعة.
        - group "طريقة عرض المحتوى" [ref=e82]:
          - generic [ref=e83]:
            - generic [aria-hidden] [ref=e84]: "2"
            - generic [ref=e85]: طريقة عرض المحتوى
          - paragraph [ref=e86]: استخدم الأسئلة المعتمدة دون إنشاء محتوى جديد أو استهلاك الرصيد.
          - generic [ref=e87]:
            - generic [ref=e88] [cursor=pointer]:
              - radio "الأسئلة بالترتيب" [checked] [ref=e89]
              - generic [ref=e90]:
                - strong [ref=e91]: الأسئلة بالترتيب
                - generic [ref=e92]: قدّم الأسئلة المعتمدة واحدًا بعد الآخر.
              - generic [ref=e93]: جاهز · كل الأسئلة (13)
            - generic [ref=e95] [cursor=pointer]:
              - radio "بطاقات المراجعة" [ref=e96]
              - generic [ref=e97]:
                - strong [ref=e98]: بطاقات المراجعة
                - generic [ref=e99]: استرجاع الإجابة ثم تقييم التذكّر.
              - generic [ref=e100]: جاهز · كل الأسئلة (13)
            - generic [ref=e102] [cursor=pointer]:
              - radio "عجلة الأسئلة" [ref=e103]
              - generic [ref=e104]:
                - strong [ref=e105]: عجلة الأسئلة
                - generic [ref=e106]: اختر سؤالًا عشوائيًا دون تكرار.
              - generic [ref=e107]: جاهز · كل الأسئلة (13)
            - generic [ref=e109] [cursor=pointer]:
              - radio "بطاقات عشوائية" [ref=e110]
              - generic [ref=e111]:
                - strong [ref=e112]: بطاقات عشوائية
                - generic [ref=e113]: اسحب سؤالًا من مجموعة البطاقات.
              - generic [ref=e114]: جاهز · كل الأسئلة (13)
            - generic [ref=e116] [cursor=pointer]:
              - radio "افتح الصندوق" [ref=e117]
              - generic [ref=e118]:
                - strong [ref=e119]: افتح الصندوق
                - generic [ref=e120]: افتح صندوقًا لعرض سؤاله كاملًا.
              - generic [ref=e121]: جاهز · كل الأسئلة (13)
          - group [ref=e123]:
            - generic "قوالب تحتاج محتوى من نوع آخر (8)" [ref=e124] [cursor=pointer]
        - group [ref=e125]:
          - 'generic "متقدم: تجربة اللعب المسابقة الكلاسيكية" [ref=e126] [cursor=pointer]':
            - generic [ref=e127]: "متقدم: تجربة اللعب"
            - emphasis [ref=e128]: المسابقة الكلاسيكية
        - group "إعدادات المشاركة" [ref=e129]:
          - generic [ref=e131]:
            - text: المنطقة الزمنية
            - combobox "المنطقة الزمنية" [ref=e132] [cursor=pointer]:
              - generic [ref=e133]: Asia/Muscat
            - textbox [aria-hidden] [ref=e136]: Asia/Muscat
          - generic [ref=e137]:
            - text: يفتح في (اختياري)
            - textbox "يفتح في (اختياري)" [ref=e138]
          - generic [ref=e139]:
            - text: الموعد النهائي
            - textbox "الموعد النهائي" [ref=e140]: 2026-09-21T21:45
          - generic [ref=e141]:
            - text: عدد المحاولات المسموح بها
            - combobox "عدد المحاولات المسموح بها" [ref=e142] [cursor=pointer]:
              - generic [ref=e143]: محاولة واحدة
            - textbox [aria-hidden] [ref=e146]: "1"
          - generic [ref=e147]:
            - text: عرض الإجابات الصحيحة
            - combobox "عرض الإجابات الصحيحة" [ref=e148] [cursor=pointer]:
              - generic [ref=e149]: بعد كل إجابة
            - textbox [aria-hidden] [ref=e153]: immediate
          - generic [ref=e154]:
            - text: الصف
            - combobox "الصف" [ref=e155] [cursor=pointer]:
              - generic [ref=e156]: دون صف محفوظ
            - textbox [aria-hidden] [ref=e160]
          - paragraph [ref=e161]:
            - generic [ref=e162]:
              - text: "ينتهي: 21 سبتمبر 2026، 09:45 م غرينتش+4 ·"
              - generic [ref=e163]: 21‏/09‏/2026، 5:45 م UTC
            - text: · Asia/Muscat
          - paragraph [ref=e164]: يُحفظ التقدّم في المتصفح نفسه. تظهر النتائج في تقاريرك ولا تدخل ترتيب الرف العام.
        - generic [ref=e165]:
          - generic [ref=e166]:
            - generic [ref=e167]: جاهز للبدء
            - strong [ref=e168]: تعلّم ذاتي · الأسئلة بالترتيب
            - generic [ref=e169]: راجع الجدول، ثم أنشئ رابط المشاركة.
          - button "أنشئ رابط المشاركة" [ref=e170] [cursor=pointer]
```

# Test source

```ts
  1  | import {test,expect} from '@playwright/test'
  2  | 
  3  | for(const mode of ['open-box','random-cards'] as const)for(const language of ['ar','en'] as const)test(`${mode} complete independent deck ${language}`,async({page,request,browser})=>{
  4  |  test.setTimeout(90000)
  5  |  expect(new URL(process.env.PW_BASE_URL??'http://127.0.0.1:5411').hostname).toMatch(/^(127\.0\.0\.1|localhost)$/)
  6  |  const ar=language==='ar',width=ar?390:1440,height=ar?844:900,boxes=mode==='open-box',count=boxes?13:3,email=`deck-${crypto.randomUUID()}@example.com`,password='Synthetic deck fixture2026!'
  7  |  await request.post('/api/v1/auth/register/teacher',{data:{name:'Deck instructor',email,password}})
  8  |  const login=await request.post('/api/v1/auth/login',{data:{email,password}}),{accessToken}=await login.json(),headers={Authorization:`Bearer ${accessToken}`}
  9  |  const create=await request.post('/api/v1/activities',{headers,data:{title:ar?'مراجعة تجريبية':'Synthetic review',contentLanguage:language,subjectId:1,levelId:8,purposeId:2}}),{activity}=await create.json()
  10 |  for(let n=1;n<=count;n++)expect((await request.post(`/api/v1/activities/${activity.id}/questions`,{headers,data:{kind:'tf',prompt:ar?`العبارة التجريبية ${n}: الشمس نجم.`:`Synthetic statement ${n}: the sun is a star.`,payload:{correct:true}}})).ok()).toBe(true)
  11 |  expect((await request.post(`/api/v1/activities/${activity.id}/publish`,{headers})).ok()).toBe(true)
  12 |  await page.context().addCookies((await request.storageState()).cookies)
  13 |  await page.addInitScript(lang=>localStorage.setItem('asasera.language',lang),language);await page.setViewportSize({width,height})
  14 |  await page.goto(`/teacher/activities/${activity.id}/play?mode=study`)
  15 |  // Unavailable is inspectable, but cannot launch or silently manufacture pairs.
> 16 |  await page.getByRole('radio',{name:ar?/الذاكرة/:/Memory/}).check()
     |                                                             ^ Error: locator.check: Test timeout of 90000ms exceeded.
  17 |  await expect(page.getByRole('button',{name:ar?'أنشئ رابط المشاركة':'Create assignment link'})).toBeDisabled()
  18 |  await expect(page.getByRole('link',{name:ar?'تعديل محتوى النشاط':'Edit activity content'})).toHaveAttribute('href',`/teacher/activities/${activity.id}`)
  19 |  await page.screenshot({path:`../docs/evidence/interactive/deck-${mode}-${language}-compatibility.png`,fullPage:true})
  20 |  await page.getByRole('radio',{name:boxes?(ar?/افتح الصندوق/:/Open the box/):(ar?/بطاقات عشوائية/:/Random cards/)}).check()
  21 |  await page.getByRole('button',{name:ar?'أنشئ رابط المشاركة':'Create assignment link'}).click()
  22 |  const link=await page.getByRole('textbox',{name:ar?'رابط النشاط':'Assignment link'}).inputValue()
  23 |  const context=await browser.newContext({viewport:{width,height},recordVideo:{dir:'../docs/evidence/interactive/recordings',size:{width,height}}})
  24 |  await context.addInitScript(lang=>localStorage.setItem('asasera.language',lang),language)
  25 |  const learn=await context.newPage(),errors:string[]=[],seen=new Set<string>();learn.on('pageerror',e=>errors.push(e.message))
  26 |  try{
  27 |   await learn.goto(link);await learn.getByRole('textbox',{name:ar?'اسمك':'Your name'}).fill(ar?'طالب تجريبي':'Synthetic learner')
  28 |   await learn.getByRole('button',{name:ar?'ابدأ':'Start',exact:true}).click()
  29 |   const board=learn.locator('[data-presentation="open-box"]')
  30 |   if(boxes){
  31 |    let originalNumbers:string[]|undefined
  32 |    for(const size of [390,768,1440]){
  33 |     await learn.setViewportSize({width:size,height:900})
  34 |     const buttons=board.getByRole('button',{name:ar?/^الصندوق /:/^Box /})
  35 |     await expect(buttons).toHaveCount(12)
  36 |     const numbers=await buttons.evaluateAll(nodes=>nodes.map(node=>node.getAttribute('aria-label')??''))
  37 |     if(originalNumbers)expect(numbers).toEqual(originalNumbers);else originalNumbers=numbers
  38 |     const positions=await buttons.evaluateAll(nodes=>nodes.map(node=>node.getBoundingClientRect().top))
  39 |     expect(positions.filter(top=>top===positions[0])).toHaveLength(size===390?2:size===768?3:4)
  40 |     await learn.screenshot({path:`../docs/evidence/interactive/boxes-${language}-${size}-page1.png`,fullPage:true})
  41 |    }
  42 |    await learn.setViewportSize({width,height})
  43 |   }
  44 |   for(let n=1;n<=count;n++)await test.step(`Select and save item ${n}`,async()=>{
  45 |    if(boxes){
  46 |     if(n===13)await learn.getByRole('navigation',{name:ar?'صفحات الصناديق':'Box pages'}).getByRole('button',{name:ar?'التالي':'Next'}).click()
  47 |     if(n===1)await learn.route('**/delivery/attempts/*/presentation',async route=>{
  48 |      const committed=await route.fetch()
  49 |      await new Promise(resolve=>setTimeout(resolve,400))
  50 |      await route.fulfill({response:committed})
  51 |     },{times:1})
  52 |     await learn.getByRole('button',{name:ar?`الصندوق ${n}`:`Box ${n}`,exact:true}).click()
  53 |     if(n===1){
  54 |      expect(await board.getByRole('button',{name:ar?/^الصندوق /:/^Box /}).count()).toBe(12)
  55 |      await expect(learn.getByRole('button',{name:ar?'الصندوق 1':'Box 1',exact:true})).toBeDisabled()
  56 |     }
  57 |    }else{
  58 |     const draw=learn.getByRole('button',{name:n===1?(ar?'ابدأ الجولة':'Start round'):(ar?'البطاقة التالية':'Next card')})
  59 |     await draw.scrollIntoViewIfNeeded()
  60 |     const rect=await draw.boundingBox();expect(rect).not.toBeNull()
  61 |     // Real repeated pointer clicks must consume only one unseen card.
  62 |     await learn.mouse.click(rect!.x+rect!.width/2,rect!.y+rect!.height/2,{clickCount:5,delay:10})
  63 |    }
  64 |    const heading=learn.getByRole('heading',{name:ar?/العبارة التجريبية/:/Synthetic statement/})
  65 |    await expect(heading).toBeVisible();await expect.poll(async()=>seen.has(await heading.innerText())).toBe(false);const text=await heading.innerText();seen.add(text)
  66 |    // Record the complete draw transition before a separate answer action.
  67 |    if(n===1)await learn.waitForTimeout(380)
  68 |    const answer=learn.getByRole('button',{name:ar?'صح':'True',exact:true});await answer.focus();await learn.keyboard.press('Enter')
  69 |    await expect(learn.getByRole('status').filter({hasText:ar?'إجابة صحيحة':'Correct'})).toBeVisible()
  70 |    if(n===1){await learn.reload();await expect(heading).toHaveText(text)}
  71 |    if(n===count)await learn.screenshot({path:`../docs/evidence/interactive/deck-${mode}-${language}-answered.png`,fullPage:true})
  72 |    if(boxes&&n<count){await learn.getByRole('button',{name:ar?'العودة إلى الصناديق':'Back to boxes'}).click();if(n===1){
  73 |     const consumed=learn.getByRole('button',{name:ar?'الصندوق 1، مفتوح':'Box 1, opened'})
  74 |     await expect(consumed).toBeDisabled()
  75 |     await context.setOffline(true)
  76 |     await expect(consumed).toBeDisabled()
  77 |     await context.setOffline(false);await learn.reload()
  78 |     await expect(heading).toHaveText(text)
  79 |     await learn.getByRole('button',{name:ar?'العودة إلى الصناديق':'Back to boxes'}).click()
  80 |     await expect(consumed).toBeDisabled()
  81 |    }}
  82 |   })
  83 |   expect(seen.size).toBe(count)
  84 |   await learn.getByRole('button',{name:ar?'إنهاء الجولة':'Finish round'}).click()
  85 |   await expect(learn.getByRole('heading',{name:ar?'اكتملت الجولة':'Round complete'})).toBeVisible()
  86 |   expect(await learn.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(errors).toEqual([])
  87 |  }finally{const video=learn.video();await context.close();await video?.saveAs(`../docs/evidence/interactive/recordings/deck-${mode}-${language}.webm`)}
  88 | })
  89 | 
```