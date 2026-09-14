# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: interactive-puzzle-reflow.spec.ts >> large saved word-search ar: 320 landscape tablet, tap, correction and reload
- Location: e2e/interactive-puzzle-reflow.spec.ts:49:99

# Error details

```
Error: a finger gesture inside the letters must pan the large board, not require the narrow frame edge

a finger gesture inside the letters must pan the large board, not require the narrow frame edge

expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false

Call Log:
- Timeout 5000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - link "تخطَّ إلى المحتوى" [ref=e4] [cursor=pointer]:
    - /url: "#teacher-main"
  - status [ref=e6]:
    - generic [ref=e7]:
      - paragraph [ref=e10]: أكّد بريدك الإلكتروني لحماية حسابك في أساسيرا. تحقّق من صندوق الوارد على puzzle-reflow-2aa1a942-254c-43ec-9c88-74ad70374285@example.com.
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
          - generic [ref=e46]: S
    - main [ref=e47]:
      - generic [ref=e48]:
        - link "← أنشطتي" [ref=e49] [cursor=pointer]:
          - /url: /teacher/activities
        - generic [ref=e50]:
          - heading "مراجعة لوحة الكلمات" [level=1] [ref=e51]
          - paragraph [ref=e52]: 1 أسئلة في النسخة المعتمدة
          - heading "كيف تريد تقديم النشاط؟" [level=2] [ref=e53]
        - group "طريقة اللعب" [ref=e54]:
          - generic [ref=e56] [cursor=pointer]:
            - radio "حصة مباشرة قد الحصة، وانضم الطلاب برمز اللعبة." [disabled] [ref=e57]
            - strong [ref=e64]: حصة مباشرة
            - generic [ref=e65]: قد الحصة، وانضم الطلاب برمز اللعبة.
          - generic [ref=e66] [cursor=pointer]:
            - radio "واجب موعد نهائي واضح. يتحكم المعلم بوقت ظهور الإجابات." [disabled] [ref=e67]
            - strong [ref=e71]: واجب
            - generic [ref=e72]: موعد نهائي واضح. يتحكم المعلم بوقت ظهور الإجابات.
          - generic [ref=e73] [cursor=pointer]:
            - radio "تعلّم ذاتي تدريب بالسرعة المناسبة للطالب مع تغذية راجعة." [checked] [disabled] [ref=e74]
            - strong [ref=e77]: تعلّم ذاتي
            - generic [ref=e78]: تدريب بالسرعة المناسبة للطالب مع تغذية راجعة.
        - group "طريقة عرض المحتوى" [ref=e79]:
          - paragraph [ref=e81]: استخدم الأسئلة المعتمدة دون إنشاء محتوى جديد أو استهلاك الرصيد.
          - generic [ref=e82]:
            - generic [ref=e83]:
              - radio "الأسئلة بالترتيب" [disabled] [ref=e84]
              - text: الأسئلة بالترتيب
            - generic [ref=e85]:
              - radio "بطاقات المراجعة استرجاع الإجابة ثم تقييم التذكّر. يحتاج محتوى مناسبًا · تدريب" [disabled] [ref=e86]
              - generic [ref=e91]:
                - text: بطاقات المراجعة
                - generic [ref=e92]: استرجاع الإجابة ثم تقييم التذكّر.
                - generic [ref=e93]: يحتاج محتوى مناسبًا · تدريب
            - generic [ref=e94]:
              - radio "عجلة الأسئلة اختر سؤالًا عشوائيًا دون تكرار. يحتاج محتوى مناسبًا · تدريب" [disabled] [ref=e95]
              - generic [ref=e99]:
                - text: عجلة الأسئلة
                - generic [ref=e100]: اختر سؤالًا عشوائيًا دون تكرار.
                - generic [ref=e101]: يحتاج محتوى مناسبًا · تدريب
            - generic [ref=e102]:
              - radio "بطاقات عشوائية اسحب سؤالًا من مجموعة البطاقات. يحتاج محتوى مناسبًا · تدريب" [disabled] [ref=e103]
              - generic [ref=e110]:
                - text: بطاقات عشوائية
                - generic [ref=e111]: اسحب سؤالًا من مجموعة البطاقات.
                - generic [ref=e112]: يحتاج محتوى مناسبًا · تدريب
            - generic [ref=e113]:
              - radio "بطاقات التحدث ناقش موضوعًا دون درجة آلية. يحتاج محتوى مناسبًا · تدريب" [disabled] [ref=e114]
              - generic [ref=e117]:
                - text: بطاقات التحدث
                - generic [ref=e118]: ناقش موضوعًا دون درجة آلية.
                - generic [ref=e119]: يحتاج محتوى مناسبًا · تدريب
            - generic [ref=e120]:
              - radio "افتح الصندوق افتح صندوقًا لعرض سؤاله كاملًا. يحتاج محتوى مناسبًا · تدريب" [disabled] [ref=e121]
              - generic [ref=e126]:
                - text: افتح الصندوق
                - generic [ref=e127]: افتح صندوقًا لعرض سؤاله كاملًا.
                - generic [ref=e128]: يحتاج محتوى مناسبًا · تدريب
            - generic [ref=e129]:
              - radio "المطابقة صل كل عنصر بما يناسبه. يحتاج محتوى مناسبًا · تدريب" [disabled] [ref=e130]
              - generic [ref=e134]:
                - text: المطابقة
                - generic [ref=e135]: صل كل عنصر بما يناسبه.
                - generic [ref=e136]: يحتاج محتوى مناسبًا · تدريب
            - generic [ref=e137]:
              - radio "الذاكرة اكشف البطاقات وتذكّر مواقع الأزواج. يحتاج محتوى مناسبًا · تدريب" [disabled] [ref=e138]
              - generic [ref=e141]:
                - text: الذاكرة
                - generic [ref=e142]: اكشف البطاقات وتذكّر مواقع الأزواج.
                - generic [ref=e143]: يحتاج محتوى مناسبًا · تدريب
            - generic [ref=e144]:
              - radio "تصنيف المجموعات ضع العناصر في مجموعاتها المناسبة. يحتاج محتوى مناسبًا · تدريب" [disabled] [ref=e145]
              - generic [ref=e147]:
                - text: تصنيف المجموعات
                - generic [ref=e148]: ضع العناصر في مجموعاتها المناسبة.
                - generic [ref=e149]: يحتاج محتوى مناسبًا · تدريب
            - generic [ref=e150]:
              - radio "الترتيب رتّب الخطوات أو العبارات. يحتاج محتوى مناسبًا · تدريب" [disabled] [ref=e151]
              - generic [ref=e155]:
                - text: الترتيب
                - generic [ref=e156]: رتّب الخطوات أو العبارات.
                - generic [ref=e157]: يحتاج محتوى مناسبًا · تدريب
            - generic [ref=e158]:
              - radio "إكمال الجملة أكمل فراغات النص بالإجابة المناسبة. يحتاج محتوى مناسبًا · تدريب" [disabled] [ref=e159]
              - generic [ref=e165]:
                - text: إكمال الجملة
                - generic [ref=e166]: أكمل فراغات النص بالإجابة المناسبة.
                - generic [ref=e167]: يحتاج محتوى مناسبًا · تدريب
            - generic [ref=e168]:
              - radio "بناء الكلمات كوّن الكلمة من حروفها. 1 من 1 متوافق · تدريب" [disabled] [ref=e169]
              - generic [ref=e172]:
                - text: بناء الكلمات
                - generic [ref=e173]: كوّن الكلمة من حروفها.
                - generic [ref=e174]: 1 من 1 متوافق · تدريب
            - generic [ref=e175]:
              - radio "البحث عن الكلمات اعثر على الكلمات في اللوحة المحفوظة. 1 من 1 متوافق · تدريب" [checked] [disabled] [ref=e176]
              - generic [ref=e180]:
                - text: البحث عن الكلمات
                - generic [ref=e181]: اعثر على الكلمات في اللوحة المحفوظة.
                - generic [ref=e182]: 1 من 1 متوافق · تدريب
            - generic [ref=e183]:
              - radio "الكلمات المتقاطعة حل التلميحات المتقاطعة. يحتاج محتوى مناسبًا · تدريب" [disabled] [ref=e184]
              - generic [ref=e187]:
                - text: الكلمات المتقاطعة
                - generic [ref=e188]: حل التلميحات المتقاطعة.
                - generic [ref=e189]: يحتاج محتوى مناسبًا · تدريب
        - button "معاينة المحتوى المعتمد" [ref=e191] [cursor=pointer]
        - group "إعدادات المشاركة" [ref=e192]:
          - generic [ref=e194]:
            - text: المنطقة الزمنية
            - combobox "المنطقة الزمنية" [disabled] [ref=e195]:
              - generic [ref=e196]: Asia/Muscat
            - textbox [disabled] [aria-hidden] [ref=e199]: Asia/Muscat
          - generic [ref=e200]:
            - text: يفتح في (اختياري)
            - textbox "يفتح في (اختياري)" [disabled] [ref=e201]
          - generic [ref=e202]:
            - text: الموعد النهائي
            - textbox "الموعد النهائي" [disabled] [ref=e203]: 2026-09-21T11:39
          - generic [ref=e204]:
            - text: عدد المحاولات المسموح بها
            - combobox "عدد المحاولات المسموح بها" [disabled] [ref=e205]:
              - generic [ref=e206]: محاولة واحدة
            - textbox [disabled] [aria-hidden] [ref=e209]: "1"
          - generic [ref=e210]:
            - text: عرض الإجابات الصحيحة
            - combobox "عرض الإجابات الصحيحة" [disabled] [ref=e211]:
              - generic [ref=e212]: بعد كل إجابة
            - textbox [disabled] [aria-hidden] [ref=e216]: immediate
          - generic [ref=e217]:
            - text: الصف
            - combobox "الصف" [disabled] [ref=e218]:
              - generic [ref=e219]: دون صف محفوظ
            - textbox [disabled] [aria-hidden] [ref=e223]
          - paragraph [ref=e224]:
            - generic [ref=e225]:
              - text: "ينتهي: 21 سبتمبر 2026، 11:39 ص غرينتش+4 ·"
              - generic [ref=e226]: 21‏/09‏/2026، 7:39 ص UTC
            - text: · Asia/Muscat
          - paragraph [ref=e227]: يُحفظ التقدّم في المتصفح نفسه. تظهر النتائج في تقاريرك ولا تدخل ترتيب الرف العام.
        - generic [ref=e228]:
          - heading "الرابط جاهز للمشاركة" [level=2] [ref=e229]
          - paragraph [ref=e230]: انسخه وشاركه مع الطلاب بالطريقة المعتادة.
          - paragraph [ref=e231]:
            - generic [ref=e232]:
              - text: "ينتهي: 21 سبتمبر 2026، 11:39 ص غرينتش+4 ·"
              - generic [ref=e233]: 21‏/09‏/2026، 7:39 ص UTC
            - text: · Asia/Muscat · محاولة واحدة
          - textbox "رابط النشاط" [ref=e234]: http://127.0.0.1:5411/learn/d770d300-e1dd-4fcb-b6e8-217ea69197a7#5unQwnWEEIEpFqx7dPzDYZtS4lpGwmvOYiW4az8iGTU
          - button "انسخ الرابط" [ref=e235] [cursor=pointer]
          - link "متابعة الواجبات" [ref=e239] [cursor=pointer]:
            - /url: /teacher/assignments
```

# Test source

```ts
  1   | import {test,expect,type APIRequestContext,type Browser,type Locator,type Page} from '@playwright/test'
  2   | import type {SavedWordBoard} from '../src/shared/word-boards'
  3   | 
  4   | test.use({trace:'off'})
  5   | type Language='en'|'ar'
  6   | const names={'word-search':['Word search','البحث عن الكلمات'],crossword:['Crossword','الكلمات المتقاطعة'],'word-builder':['Word builder','بناء الكلمات'],'sentence-completion':['Complete the sentence','إكمال الجملة']} as const
  7   | const policy=(language:Language)=>({version:1,language,diacritics:'preserve',tatweel:'preserve',case:'preserve',spaces:'preserve'})
  8   | const text=(language:Language,en:string,ar:string)=>language==='ar'?ar:en
  9   | const escaped=(value:string)=>value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')
  10  | 
  11  | async function prepare(page:Page,request:APIRequestContext,language:Language,source:Record<string,unknown>,kind?:'word-search'|'crossword'){
  12  |  expect(process.env.PW_BASE_URL).toBe('http://127.0.0.1:5411')
  13  |  const email=`puzzle-reflow-${crypto.randomUUID()}@example.com`,password=`Synthetic-${crypto.randomUUID()}!`
  14  |  expect((await request.post('/api/v1/auth/register/teacher',{data:{name:'Synthetic puzzle instructor',email,password}})).ok()).toBe(true)
  15  |  const login=await request.post('/api/v1/auth/login',{data:{email,password}});expect(login.ok()).toBe(true)
  16  |  const headers={Authorization:`Bearer ${(await login.json()).accessToken}`}
  17  |  const created=await request.post('/api/v1/activities',{headers,data:{title:text(language,'Reviewed puzzle reflow','مراجعة لوحة الكلمات'),subjectId:1,levelId:8,purposeId:2,contentLanguage:language}})
  18  |  expect(created.ok()).toBe(true);const {activity}=await created.json()
  19  |  const added=await request.post(`/api/v1/activities/${activity.id}/questions`,{headers,data:source});expect(added.ok(),await added.text()).toBe(true)
  20  |  const {question}=await added.json();let board:SavedWordBoard|undefined
  21  |  if(kind){const generated=await request.post(`/api/v1/activities/questions/${question.id}/word-board`,{headers,data:{kind,expectedRevision:question.revision,requestId:crypto.randomUUID(),config:{rows:20,columns:20,seed:31,maxWork:100000}}});expect(generated.ok(),await generated.text()).toBe(true);board=(await generated.json()).board;expect(board?.status).toBe('ready')}
  22  |  expect((await request.post(`/api/v1/activities/${activity.id}/publish`,{headers})).ok()).toBe(true)
  23  |  await page.context().addCookies((await request.storageState()).cookies)
  24  |  await page.addInitScript(lang=>localStorage.setItem('asasera.language',lang),language)
  25  |  await page.setViewportSize({width:language==='ar'?390:1440,height:900})
  26  |  await page.goto(`/teacher/activities/${activity.id}/play?mode=study`)
  27  |  return {board,activityId:activity.id,questionId:question.id,headers}
  28  | }
  29  | async function select(page:Page,language:Language,kind:keyof typeof names){await page.getByRole('radio',{name:new RegExp(`^${escaped(names[kind][language==='ar'?1:0])}`)}).check()}
  30  | async function join(page:Page,browser:Browser,language:Language,withoutScrollTo=false){
  31  |  await page.getByRole('button',{name:text(language,'Create assignment link','أنشئ رابط المشاركة'),exact:true}).click()
  32  |  const link=await page.getByRole('textbox',{name:text(language,'Assignment link','رابط النشاط')}).inputValue()
  33  |  const context=await browser.newContext({viewport:{width:320,height:800},hasTouch:true,locale:language})
  34  |  if(withoutScrollTo)await context.addInitScript(()=>Object.defineProperty(Element.prototype,'scrollTo',{value:undefined,configurable:true}))
  35  |  await context.addInitScript(lang=>localStorage.setItem('asasera.language',lang),language)
  36  |  const learn=await context.newPage(),errors:string[]=[];learn.on('pageerror',error=>errors.push(error.message))
  37  |  await learn.goto(link);await learn.getByRole('textbox',{name:text(language,'Your name','اسمك')}).fill(text(language,'Synthetic learner','متعلم تجريبي'))
  38  |  await learn.getByRole('button',{name:text(language,'Start','ابدأ'),exact:true}).tap()
  39  |  await learn.getByRole('button',{name:text(language,'Start round','ابدأ الجولة'),exact:true}).tap()
  40  |  return {context,learn,errors,link}
  41  | }
  42  | async function activate(locator:Locator,page:Page,language:Language){await expect(locator).toBeEnabled();if(language==='ar')await locator.tap();else{await locator.focus();await expect(locator).toBeFocused();await page.keyboard.press('Enter')}}
  43  | async function capture(page:Page,name:string){
  44  |  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all(document.getAnimations().filter(a=>a.effect?.getTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{})))})
  45  |  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
  46  |  await page.screenshot({path:`../docs/evidence/interactive/puzzle-${name}.png`,fullPage:true})
  47  | }
  48  | 
  49  | for(const language of ['en','ar'] as const)for(const kind of ['word-search','crossword'] as const)test(`large saved ${kind} ${language}: 320 landscape tablet, ${language==='ar'?'tap':'keyboard'}, correction and reload`,async({page,request,browser})=>{
  50  |  test.setTimeout(90000)
  51  |  const words=kind==='crossword'?(language==='ar'?['باب','تاب']:['cat','tap']):(language==='ar'?['باب','تاب','بات','بيت','بنت']:['cat','tap','pat','cap','act'])
  52  |  const clues=language==='ar'?['مدخل البيت الذي نمرّ منه كل يوم','رجع عن الخطأ وقرر أن يصحح عمله','قضى الليل في مكان آمن','مكان السكن الذي يجمع الأسرة','طفلة صغيرة ضمن أفراد الأسرة']:['A small feline animal that often lives with people','Touch something lightly with a short movement','A gentle touch with the flat part of the hand','A covering worn on the head in the sunshine','Do something rather than simply describe it']
  53  |  const {board}=await prepare(page,request,language,{kind:'vocabulary',prompt:text(language,'Complete the reviewed large word board.','أكمل لوحة الكلمات الكبيرة المعتمدة.'),payload:{schemaVersion:1,policy:policy(language),entries:words.map((word,i)=>({id:`entry${i}`,word,clue:clues[i]}))}},kind)
  54  |  expect(board!.placements).toHaveLength(words.length)
  55  |  await select(page,language,kind)
  56  |  const {context,learn,errors}=await join(page,browser,language,kind==='crossword'&&language==='ar')
  57  |  try{
  58  |   const region=learn.getByRole('region',{name:text(language,'Scrollable word board','لوحة كلمات قابلة للتمرير')})
  59  |   await expect(region).toBeVisible()
  60  |   expect(await region.evaluate(el=>el.scrollWidth>el.clientWidth)).toBe(true)
  61  |   const cell=region.locator('button[data-row]').first();expect((await cell.boundingBox())!.width).toBeGreaterThanOrEqual(44)
  62  |   if(kind==='word-search'&&language==='ar'){
  63  |    await region.scrollIntoViewIfNeeded();const bounds=(await region.boundingBox())!,touch=await context.newCDPSession(learn)
  64  |    await touch.send('Input.synthesizeScrollGesture',{x:Math.round(bounds.x+bounds.width/2),y:Math.round(bounds.y+bounds.height/2),xDistance:-120,yDistance:-120,gestureSourceType:'touch',speed:600,preventFling:true})
> 65  |    await expect.poll(()=>region.evaluate(el=>el.scrollLeft>50&&el.scrollTop>50),'a finger gesture inside the letters must pan the large board, not require the narrow frame edge').toBe(true)
      |                                                                                                                                                                                    ^ Error: a finger gesture inside the letters must pan the large board, not require the narrow frame edge
  66  |    await expect(learn.locator('li[data-found=true]')).toHaveCount(0);await touch.detach()
  67  |   }
  68  |   const before=await region.locator('button[data-row]').evaluateAll(nodes=>nodes.map(node=>[node.getAttribute('data-row'),node.getAttribute('data-column')]))
  69  |   for(const [width,height,label] of [[320,800,'320'],[844,390,'landscape'],[768,1024,'tablet']] as const){
  70  |    await learn.setViewportSize({width,height});await expect(region).toBeVisible()
  71  |    expect((await region.boundingBox())!.height,'large boards keep nearby clue controls reachable').toBeLessThanOrEqual(Math.min(height*.55,440)+1)
  72  |    expect(await region.locator('button[data-row]').evaluateAll(nodes=>nodes.map(node=>[node.getAttribute('data-row'),node.getAttribute('data-column')]))).toEqual(before)
  73  |    await capture(learn,`${kind}-${language}-${label}`)
  74  |   }
  75  |   await learn.setViewportSize({width:320,height:800})
  76  |   expect(await learn.locator('meta[name=viewport]').getAttribute('content')).not.toMatch(/user-scalable=no|maximum-scale=1(?:[, ]|$)/)
  77  |   const cdp=await context.newCDPSession(learn);await cdp.send('Emulation.setPageScaleFactor',{pageScaleFactor:2})
  78  |   expect(await learn.evaluate(()=>visualViewport?.scale)).toBe(2)
  79  |   await cdp.send('Emulation.setPageScaleFactor',{pageScaleFactor:1});await cdp.detach()
  80  |   if(kind==='word-search'){
  81  |    for(const [index,placement] of board!.placements.entries()){
  82  |     const start=placement.cells[0]!,end=placement.cells.at(-1)!,first=region.locator(`button[data-row="${start.row}"][data-column="${start.column}"]`)
  83  |     await activate(first,learn,language)
  84  |     if(language==='en'){
  85  |      if(index===0){await learn.keyboard.press('Escape');await expect(learn.locator('[data-preview=true]')).toHaveCount(0);await activate(first,learn,language)}
  86  |      const dr=Math.sign(end.row-start.row),dc=Math.sign(end.column-start.column)
  87  |      for(let i=1;i<placement.cells.length;i++){if(dr)await learn.keyboard.press(dr>0?'ArrowDown':'ArrowUp');if(dc)await learn.keyboard.press(dc>0?'ArrowRight':'ArrowLeft')}
  88  |      await expect(learn.locator('[data-preview=true]')).toHaveCount(placement.cells.length);await learn.keyboard.press('Enter')
  89  |     }else await region.locator(`button[data-row="${end.row}"][data-column="${end.column}"]`).tap()
  90  |     await expect(learn.locator('li[data-found=true]')).toHaveCount(index+1)
  91  |     if(index===0){await learn.reload();await expect(learn.locator('li[data-found=true]')).toHaveCount(1)}
  92  |    }
  93  |   }else{
  94  |    const first=board!.placements[0]!,other=board!.placements.slice(1).find(p=>p.cells.some(c=>first.cells.some(a=>a.row===c.row&&a.column===c.column)))
  95  |    expect(other,'the author-saved layout must contain a real tested intersection').toBeDefined()
  96  |    const wrong=language==='ar'?'سسس':'xxx'
  97  |    for(const placement of board!.placements){
  98  |     const clue=learn.getByRole('button').filter({hasText:placement.clue});await clue.scrollIntoViewIfNeeded()
  99  |     const pageScroll=await learn.evaluate(()=>scrollY)
  100 |     await activate(clue,learn,language)
  101 |     expect(await learn.evaluate(()=>scrollY)).toBe(pageScroll)
  102 |     if(language==='en')await expect(clue).toBeFocused()
  103 |     const active=region.locator('button[data-active=true]')
  104 |     await expect(active).toHaveCount(placement.cells.length)
  105 |     await expect.poll(()=>active.evaluateAll(nodes=>nodes.every(node=>{const frame=node.closest('[role=region]')!.getBoundingClientRect(),cell=node.getBoundingClientRect();return cell.left>=frame.left&&cell.right<=frame.right&&cell.top>=frame.top&&cell.bottom<=frame.bottom}))).toBe(true)
  106 |     const input=learn.getByRole('textbox',{name:text(language,`Answer to clue ${placement.number}`,`إجابة التلميح ${placement.number}`)})
  107 |     await input.fill(placement.entryId===first.entryId?wrong:placement.word)
  108 |     expect((await input.boundingBox())!.height).toBeGreaterThanOrEqual(44)
  109 |     await expect(learn.getByRole('button',{name:text(language,'Check words','تحقق من الكلمات'),exact:true})).toBeDisabled()
  110 |     await activate(learn.getByRole('button',{name:text(language,'Save word','احفظ الكلمة'),exact:true}),learn,language)
  111 |     await expect(learn.getByText(text(language,'Not saved yet','تعديل غير محفوظ بعد'),{exact:true})).toHaveCount(0)
  112 |    }
  113 |    await expect(learn.getByText(text(language,'Some intersection letters disagree. Review your saved words.','تختلف حروف بعض التقاطعات. راجع الكلمات المحفوظة.'),{exact:true})).toBeVisible()
  114 |    await activate(learn.getByRole('button',{name:text(language,'Check words','تحقق من الكلمات'),exact:true}),learn,language)
  115 |    await expect(learn.getByText(text(language,'Some words need another look. You can edit them and check again.','بعض الكلمات تحتاج مراجعة؛ يمكنك تعديلها والتحقق مجددًا.'),{exact:true})).toBeVisible()
  116 |    await capture(learn,`crossword-${language}-wrong-intersection`)
  117 |    await learn.reload()
  118 |    await activate(learn.getByRole('button').filter({hasText:first.clue}),learn,language)
  119 |    const input=learn.getByRole('textbox',{name:text(language,`Answer to clue ${first.number}`,`إجابة التلميح ${first.number}`)})
  120 |    await expect(input).toHaveValue(wrong);await input.fill(first.word)
  121 |    await activate(learn.getByRole('button',{name:text(language,'Save word','احفظ الكلمة'),exact:true}),learn,language)
  122 |    await activate(learn.getByRole('button',{name:text(language,'Check words','تحقق من الكلمات'),exact:true}),learn,language)
  123 |   }
  124 |   await expect(learn.getByText(text(language,'Board complete. This records word practice, not mastery of the meanings.','اكتملت اللوحة. يُحفظ هذا كتدريب كلمات، وليس دليلًا على فهم المعاني.'),{exact:true})).toBeVisible()
  125 |   await learn.reload();await expect(learn.getByText(text(language,'Board complete. This records word practice, not mastery of the meanings.','اكتملت اللوحة. يُحفظ هذا كتدريب كلمات، وليس دليلًا على فهم المعاني.'),{exact:true})).toBeVisible()
  126 |   await capture(learn,`${kind}-${language}-complete`)
  127 |   await activate(learn.getByRole('button',{name:text(language,'Finish round','إنهاء الجولة'),exact:true}),learn,language)
  128 |   await expect(learn.getByRole('heading',{name:text(language,'Round complete','اكتملت الجولة'),exact:true})).toBeVisible();expect(errors).toEqual([])
  129 |  }finally{await context.close()}
  130 | })
  131 | 
  132 | for(const diacritics of ['preserve','ignore'] as const)test(`edited Arabic passage and ${diacritics} policy keep hamza distinct in preview and saved learner answers`,async({page,request,browser})=>{
  133 |  test.setTimeout(60000)
  134 |  const before='نقرأُ الكلمةَ «',after='» ثم نُفَسِّرُ مَعْنَاهَا.',accepted=diacritics==='ignore'?'أمل':'أَمَل',wrong=diacritics==='ignore'?'امل':'اَمَل'
  135 |  const {activityId,questionId,headers}=await prepare(page,request,'ar',{kind:'cloze',prompt:'أكمل الكلمة مع مراعاة قاعدة الإملاء المعتمدة.',payload:{schemaVersion:1,segments:[{kind:'text',text:'كلمة '},{kind:'blank',blankId:'hope'},{kind:'text',text:'.'}],blanks:[{id:'hope',acceptedAnswers:['أَمَل']}],policy:policy('ar'),trimBoundaryWhitespace:true}})
  136 |  await page.goto(`/teacher/activities/${activityId}`)
  137 |  await page.getByRole('textbox',{name:'جزء النص 1',exact:true}).fill(before)
  138 |  await page.getByRole('textbox',{name:'جزء النص 2',exact:true}).fill(after)
  139 |  await page.getByText('قواعد الإملاء',{exact:true}).click()
  140 |  if(diacritics==='ignore')await page.getByRole('checkbox',{name:'تجاهل الحركات عند المطابقة',exact:true}).check()
  141 |  const published=page.waitForResponse(response=>response.url().endsWith(`/activities/${activityId}/publish`)&&response.request().method()==='POST')
  142 |  await page.getByRole('button',{name:'اعتماد التغييرات',exact:true}).click();expect((await published).ok()).toBe(true)
  143 |  await page.reload();await expect(page.getByRole('textbox',{name:'جزء النص 1',exact:true})).toHaveValue(before);await expect(page.getByRole('textbox',{name:'جزء النص 2',exact:true})).toHaveValue(after)
  144 |  const owner=await request.get(`/api/v1/activities/${activityId}`,{headers});expect(owner.ok()).toBe(true)
  145 |  const body=await owner.json(),savedQuestion=body.questions.find((item:{id:number})=>item.id===questionId)
  146 |  expect(savedQuestion.payload.segments).toEqual([{kind:'text',text:before},{kind:'blank',blankId:'hope'},{kind:'text',text:after}]);expect(savedQuestion.payload.policy.diacritics).toBe(diacritics)
  147 |  await page.goto(`/teacher/activities/${activityId}/play?mode=study`);await select(page,'ar','sentence-completion')
  148 |  await page.getByRole('button',{name:'معاينة المحتوى المعتمد',exact:true}).click()
  149 |  const preview=page.getByRole('region',{name:'معاينة العرض',exact:true})
  150 |  await expect(preview.getByText(before,{exact:true})).toBeVisible();await expect(preview.getByText(after,{exact:true})).toBeVisible()
  151 |  for(const [answer,correct] of [[wrong,false],[accepted,true]] as const){
  152 |   await preview.getByRole('textbox',{name:'الفراغ 1',exact:true}).fill(answer)
  153 |   await preview.getByRole('button',{name:'إرسال الإجابة',exact:true}).click()
  154 |   await expect(preview.locator(`[role=status][data-correct=${correct}]`)).toBeVisible()
  155 |   await preview.getByRole('button',{name:'إعادة المعاينة',exact:true}).click()
  156 |  }
  157 |  const joined=await join(page,browser,'ar')
  158 |  try{
  159 |   for(const [answer,correct] of [[wrong,false],[accepted,true]] as const){
  160 |    const context=correct?await browser.newContext({viewport:{width:320,height:800},hasTouch:true}):joined.context
  161 |    let learn=joined.learn
  162 |    if(correct){await context.addInitScript(()=>localStorage.setItem('asasera.language','ar'));learn=await context.newPage();await learn.goto(joined.link);await learn.getByRole('textbox',{name:'اسمك'}).fill('متعلم ثانٍ');await learn.getByRole('button',{name:'ابدأ',exact:true}).tap();await learn.getByRole('button',{name:'ابدأ الجولة',exact:true}).tap()}
  163 |    try{
  164 |     await expect(learn.getByText(before,{exact:true})).toBeVisible();await expect(learn.getByText(after,{exact:true})).toBeVisible()
  165 |     const blank=learn.getByRole('textbox',{name:'الفراغ 1',exact:true});await blank.fill(answer)
```