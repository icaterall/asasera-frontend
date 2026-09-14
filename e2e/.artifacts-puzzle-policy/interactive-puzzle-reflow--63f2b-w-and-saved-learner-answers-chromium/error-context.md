# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: interactive-puzzle-reflow.spec.ts >> edited Arabic passage and preserve policy keep hamza distinct in preview and saved learner answers
- Location: e2e/interactive-puzzle-reflow.spec.ts:117:56

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: page.waitForResponse: Test timeout of 60000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=f1e3]:
  - banner "شريط المحرر" [ref=f1e4]:
    - generic [ref=f1e5]:
      - heading "مراجعة لوحة الكلمات" [level=1] [ref=f1e6]
      - textbox "عنوان النشاط" [ref=f1e7]: مراجعة لوحة الكلمات
      - generic [ref=f1e8]: محفوظ
    - group "أدوات النشاط" [ref=f1e11]:
      - button "اعتماد التغييرات" [ref=f1e12] [cursor=pointer]
  - main [ref=f1e13]:
    - generic [ref=f1e14]:
      - textbox "نص السؤال" [ref=f1e17]:
        - paragraph [ref=f1e18]: أكمل الكلمة مع مراعاة قاعدة الإملاء المعتمدة.
      - button "أضف وسائط (اختياري)" [ref=f1e20] [cursor=pointer]:
        - generic [ref=f1e24]: ابحث عن وسائط وأدرجها (اختياري)
        - generic [ref=f1e25]: ارفع ملفًا أو اسحبه إلى هنا
      - region "النص والفراغات" [ref=f1e26]:
        - heading "النص والفراغات" [level=2] [ref=f1e27]
        - paragraph [ref=f1e28]: حرّر النص، ثم حدّد كلمة واضغط «حوّل النص المحدد إلى فراغ». اكتب الإجابات المقبولة لكل فراغ.
        - generic [ref=f1e29]:
          - generic [ref=f1e30]: جزء النص 1
          - textbox "جزء النص 1" [ref=f1e31]: نقرأُ الكلمةَ «
        - generic [ref=f1e32]:
          - generic [ref=f1e33]:
            - generic [ref=f1e34]: الإجابات المقبولة للفراغ 1
            - textbox "الإجابات المقبولة للفراغ 1" [ref=f1e35]: أَمَل
          - button "احذف الفراغ 1" [disabled] [ref=f1e36]
        - generic [ref=f1e40]:
          - generic [ref=f1e41]: جزء النص 2
          - textbox "جزء النص 2" [ref=f1e42]: » ثم نُفَسِّرُ مَعْنَاهَا.
        - paragraph [ref=f1e43]: بديل مقبول واحد في كل سطر، حتى ٨ بدائل لكل فراغ. حذف الفراغ يعيد أول إجابة إلى النص.
        - button "حوّل النص المحدد إلى فراغ" [disabled] [ref=f1e44]
        - generic [ref=f1e45]:
          - checkbox "أتح بنك كلمات" [ref=f1e46]
          - generic [ref=f1e47]: أتح بنك كلمات
        - group [ref=f1e48]:
          - generic "قواعد الإملاء" [active] [ref=f1e49] [cursor=pointer]
          - generic [ref=f1e50]:
            - text: لغة الكلمات
            - combobox "لغة الكلمات" [ref=f1e51] [cursor=pointer]:
              - generic [ref=f1e52]: العربية
            - textbox [aria-hidden] [ref=f1e56]: ar
          - generic [ref=f1e57]:
            - checkbox "تجاهل الحركات عند المطابقة" [ref=f1e58]
            - generic [ref=f1e59]: تجاهل الحركات عند المطابقة
          - generic [ref=f1e60]:
            - checkbox "تجاهل التطويل عند المطابقة" [ref=f1e61]
            - generic [ref=f1e62]: تجاهل التطويل عند المطابقة
          - paragraph [ref=f1e63]: تبقى الهمزات وة/ه وى/ي حروفًا مختلفة.
          - generic [ref=f1e64]:
            - checkbox "تجاهل المسافات عند المطابقة" [ref=f1e65]
            - generic [ref=f1e66]: تجاهل المسافات عند المطابقة
        - generic [ref=f1e67]:
          - checkbox "تجاهل المسافات في بداية الإجابة ونهايتها" [checked] [ref=f1e68]
          - generic [ref=f1e69]: تجاهل المسافات في بداية الإجابة ونهايتها
      - generic [ref=f1e70]:
        - generic [ref=f1e71]: التفسير (اختياري)
        - textbox "التفسير (اختياري)" [ref=f1e72]:
          - /placeholder: لماذا هذه الإجابة صحيحة؟ يظهر للطلاب بعد انتهاء وقت الإجابة.
  - navigation "أدوات المحرر" [ref=f1e73]:
    - button "الأسئلة" [ref=f1e74] [cursor=pointer]:
      - generic [aria-hidden] [ref=f1e79]: "1"
    - button "حفظ" [disabled] [ref=f1e80]
    - button "الخصائص" [ref=f1e86] [cursor=pointer]
    - button "المزيد" [ref=f1e89] [cursor=pointer]
```

# Test source

```ts
  26  |  await page.goto(`/teacher/activities/${activity.id}/play?mode=study`)
  27  |  return {board,activityId:activity.id,questionId:question.id,headers}
  28  | }
  29  | async function select(page:Page,language:Language,kind:keyof typeof names){await page.getByRole('radio',{name:new RegExp(`^${escaped(names[kind][language==='ar'?1:0])}`)}).check()}
  30  | async function join(page:Page,browser:Browser,language:Language){
  31  |  await page.getByRole('button',{name:text(language,'Create assignment link','أنشئ رابط المشاركة'),exact:true}).click()
  32  |  const link=await page.getByRole('textbox',{name:text(language,'Assignment link','رابط النشاط')}).inputValue()
  33  |  const context=await browser.newContext({viewport:{width:320,height:800},hasTouch:true,locale:language})
  34  |  await context.addInitScript(lang=>localStorage.setItem('asasera.language',lang),language)
  35  |  const learn=await context.newPage(),errors:string[]=[];learn.on('pageerror',error=>errors.push(error.message))
  36  |  await learn.goto(link);await learn.getByRole('textbox',{name:text(language,'Your name','اسمك')}).fill(text(language,'Synthetic learner','متعلم تجريبي'))
  37  |  await learn.getByRole('button',{name:text(language,'Start','ابدأ'),exact:true}).tap()
  38  |  await learn.getByRole('button',{name:text(language,'Start round','ابدأ الجولة'),exact:true}).tap()
  39  |  return {context,learn,errors,link}
  40  | }
  41  | async function activate(locator:Locator,page:Page,language:Language){await expect(locator).toBeEnabled();if(language==='ar')await locator.tap();else{await locator.focus();await expect(locator).toBeFocused();await page.keyboard.press('Enter')}}
  42  | async function capture(page:Page,name:string){
  43  |  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all(document.getAnimations().filter(a=>a.effect?.getTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{})))})
  44  |  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
  45  |  await page.screenshot({path:`../docs/evidence/interactive/puzzle-${name}.png`,fullPage:true})
  46  | }
  47  | 
  48  | for(const language of ['en','ar'] as const)for(const kind of ['word-search','crossword'] as const)test(`large saved ${kind} ${language}: 320 landscape tablet, ${language==='ar'?'tap':'keyboard'}, correction and reload`,async({page,request,browser})=>{
  49  |  test.setTimeout(90000)
  50  |  const words=kind==='crossword'?(language==='ar'?['باب','تاب']:['cat','tap']):(language==='ar'?['باب','تاب','بات','بيت','بنت']:['cat','tap','pat','cap','act'])
  51  |  const clues=language==='ar'?['مدخل البيت الذي نمرّ منه كل يوم','رجع عن الخطأ وقرر أن يصحح عمله','قضى الليل في مكان آمن','مكان السكن الذي يجمع الأسرة','طفلة صغيرة ضمن أفراد الأسرة']:['A small feline animal that often lives with people','Touch something lightly with a short movement','A gentle touch with the flat part of the hand','A covering worn on the head in the sunshine','Do something rather than simply describe it']
  52  |  const {board}=await prepare(page,request,language,{kind:'vocabulary',prompt:text(language,'Complete the reviewed large word board.','أكمل لوحة الكلمات الكبيرة المعتمدة.'),payload:{schemaVersion:1,policy:policy(language),entries:words.map((word,i)=>({id:`entry${i}`,word,clue:clues[i]}))}},kind)
  53  |  expect(board!.placements).toHaveLength(words.length)
  54  |  await select(page,language,kind)
  55  |  const {context,learn,errors}=await join(page,browser,language)
  56  |  try{
  57  |   const region=learn.getByRole('region',{name:text(language,'Scrollable word board','لوحة كلمات قابلة للتمرير')})
  58  |   await expect(region).toBeVisible()
  59  |   expect(await region.evaluate(el=>el.scrollWidth>el.clientWidth)).toBe(true)
  60  |   const cell=region.locator('button[data-row]').first();expect((await cell.boundingBox())!.width).toBeGreaterThanOrEqual(44)
  61  |   const before=await region.locator('button[data-row]').evaluateAll(nodes=>nodes.map(node=>[node.getAttribute('data-row'),node.getAttribute('data-column')]))
  62  |   for(const [width,height,label] of [[320,800,'320'],[844,390,'landscape'],[768,1024,'tablet']] as const){
  63  |    await learn.setViewportSize({width,height});await expect(region).toBeVisible()
  64  |    expect(await region.locator('button[data-row]').evaluateAll(nodes=>nodes.map(node=>[node.getAttribute('data-row'),node.getAttribute('data-column')]))).toEqual(before)
  65  |    await capture(learn,`${kind}-${language}-${label}`)
  66  |   }
  67  |   await learn.setViewportSize({width:320,height:800})
  68  |   expect(await learn.locator('meta[name=viewport]').getAttribute('content')).not.toMatch(/user-scalable=no|maximum-scale=1(?:[, ]|$)/)
  69  |   const cdp=await context.newCDPSession(learn);await cdp.send('Emulation.setPageScaleFactor',{pageScaleFactor:2})
  70  |   expect(await learn.evaluate(()=>visualViewport?.scale)).toBe(2)
  71  |   await cdp.send('Emulation.setPageScaleFactor',{pageScaleFactor:1});await cdp.detach()
  72  |   if(kind==='word-search'){
  73  |    for(const [index,placement] of board!.placements.entries()){
  74  |     const start=placement.cells[0]!,end=placement.cells.at(-1)!,first=region.locator(`button[data-row="${start.row}"][data-column="${start.column}"]`)
  75  |     await activate(first,learn,language)
  76  |     if(language==='en'){
  77  |      if(index===0){await learn.keyboard.press('Escape');await expect(learn.locator('[data-preview=true]')).toHaveCount(0);await activate(first,learn,language)}
  78  |      const dr=Math.sign(end.row-start.row),dc=Math.sign(end.column-start.column)
  79  |      for(let i=1;i<placement.cells.length;i++){if(dr)await learn.keyboard.press(dr>0?'ArrowDown':'ArrowUp');if(dc)await learn.keyboard.press(dc>0?'ArrowRight':'ArrowLeft')}
  80  |      await expect(learn.locator('[data-preview=true]')).toHaveCount(placement.cells.length);await learn.keyboard.press('Enter')
  81  |     }else await region.locator(`button[data-row="${end.row}"][data-column="${end.column}"]`).tap()
  82  |     await expect(learn.locator('li[data-found=true]')).toHaveCount(index+1)
  83  |     if(index===0){await learn.reload();await expect(learn.locator('li[data-found=true]')).toHaveCount(1)}
  84  |    }
  85  |   }else{
  86  |    const first=board!.placements[0]!,other=board!.placements.slice(1).find(p=>p.cells.some(c=>first.cells.some(a=>a.row===c.row&&a.column===c.column)))
  87  |    expect(other,'the author-saved layout must contain a real tested intersection').toBeDefined()
  88  |    const wrong=language==='ar'?'سسس':'xxx'
  89  |    for(const placement of board!.placements){
  90  |     await activate(learn.getByRole('button').filter({hasText:placement.clue}),learn,language)
  91  |     const input=learn.getByRole('textbox',{name:text(language,`Answer to clue ${placement.number}`,`إجابة التلميح ${placement.number}`)})
  92  |     await input.fill(placement.entryId===first.entryId?wrong:placement.word)
  93  |     expect((await input.boundingBox())!.height).toBeGreaterThanOrEqual(44)
  94  |     await expect(learn.getByRole('button',{name:text(language,'Check words','تحقق من الكلمات'),exact:true})).toBeDisabled()
  95  |     await activate(learn.getByRole('button',{name:text(language,'Save word','احفظ الكلمة'),exact:true}),learn,language)
  96  |     await expect(learn.getByText(text(language,'Not saved yet','تعديل غير محفوظ بعد'),{exact:true})).toHaveCount(0)
  97  |    }
  98  |    await expect(learn.getByText(text(language,'Some intersection letters disagree. Review your saved words.','تختلف حروف بعض التقاطعات. راجع الكلمات المحفوظة.'),{exact:true})).toBeVisible()
  99  |    await activate(learn.getByRole('button',{name:text(language,'Check words','تحقق من الكلمات'),exact:true}),learn,language)
  100 |    await expect(learn.getByText(text(language,'Some words need another look. You can edit them and check again.','بعض الكلمات تحتاج مراجعة؛ يمكنك تعديلها والتحقق مجددًا.'),{exact:true})).toBeVisible()
  101 |    await capture(learn,`crossword-${language}-wrong-intersection`)
  102 |    await learn.reload()
  103 |    await activate(learn.getByRole('button').filter({hasText:first.clue}),learn,language)
  104 |    const input=learn.getByRole('textbox',{name:text(language,`Answer to clue ${first.number}`,`إجابة التلميح ${first.number}`)})
  105 |    await expect(input).toHaveValue(wrong);await input.fill(first.word)
  106 |    await activate(learn.getByRole('button',{name:text(language,'Save word','احفظ الكلمة'),exact:true}),learn,language)
  107 |    await activate(learn.getByRole('button',{name:text(language,'Check words','تحقق من الكلمات'),exact:true}),learn,language)
  108 |   }
  109 |   await expect(learn.getByText(text(language,'Board complete. This records word practice, not mastery of the meanings.','اكتملت اللوحة. يُحفظ هذا كتدريب كلمات، وليس دليلًا على فهم المعاني.'),{exact:true})).toBeVisible()
  110 |   await learn.reload();await expect(learn.getByText(text(language,'Board complete. This records word practice, not mastery of the meanings.','اكتملت اللوحة. يُحفظ هذا كتدريب كلمات، وليس دليلًا على فهم المعاني.'),{exact:true})).toBeVisible()
  111 |   await capture(learn,`${kind}-${language}-complete`)
  112 |   await activate(learn.getByRole('button',{name:text(language,'Finish round','إنهاء الجولة'),exact:true}),learn,language)
  113 |   await expect(learn.getByRole('heading',{name:text(language,'Round complete','اكتملت الجولة'),exact:true})).toBeVisible();expect(errors).toEqual([])
  114 |  }finally{await context.close()}
  115 | })
  116 | 
  117 | for(const diacritics of ['preserve','ignore'] as const)test(`edited Arabic passage and ${diacritics} policy keep hamza distinct in preview and saved learner answers`,async({page,request,browser})=>{
  118 |  test.setTimeout(60000)
  119 |  const before='نقرأُ الكلمةَ «',after='» ثم نُفَسِّرُ مَعْنَاهَا.',accepted=diacritics==='ignore'?'أمل':'أَمَل',wrong=diacritics==='ignore'?'امل':'اَمَل'
  120 |  const {activityId,questionId,headers}=await prepare(page,request,'ar',{kind:'cloze',prompt:'أكمل الكلمة مع مراعاة قاعدة الإملاء المعتمدة.',payload:{schemaVersion:1,segments:[{kind:'text',text:'كلمة '},{kind:'blank',blankId:'hope'},{kind:'text',text:'.'}],blanks:[{id:'hope',acceptedAnswers:['أَمَل']}],policy:policy('ar'),trimBoundaryWhitespace:true}})
  121 |  await page.goto(`/teacher/activities/${activityId}`)
  122 |  await page.getByRole('textbox',{name:'جزء النص 1',exact:true}).fill(before)
  123 |  await page.getByRole('textbox',{name:'جزء النص 2',exact:true}).fill(after)
  124 |  await page.getByText('قواعد الإملاء',{exact:true}).click()
  125 |  if(diacritics==='ignore')await page.getByRole('checkbox',{name:'تجاهل الحركات عند المطابقة',exact:true}).check()
> 126 |  const published=page.waitForResponse(response=>response.url().endsWith(`/activities/${activityId}/publish`)&&response.request().method()==='POST')
      |                       ^ Error: page.waitForResponse: Test timeout of 60000ms exceeded.
  127 |  await page.getByRole('button',{name:'اعتماد النسخة',exact:true}).click();expect((await published).ok()).toBe(true)
  128 |  await page.reload();await expect(page.getByRole('textbox',{name:'جزء النص 1',exact:true})).toHaveValue(before);await expect(page.getByRole('textbox',{name:'جزء النص 2',exact:true})).toHaveValue(after)
  129 |  const owner=await request.get(`/api/v1/activities/${activityId}`,{headers});expect(owner.ok()).toBe(true)
  130 |  const body=await owner.json(),savedQuestion=body.questions.find((item:{id:number})=>item.id===questionId)
  131 |  expect(savedQuestion.payload.segments).toEqual([{kind:'text',text:before},{kind:'blank',blankId:'hope'},{kind:'text',text:after}]);expect(savedQuestion.payload.policy.diacritics).toBe(diacritics)
  132 |  await page.goto(`/teacher/activities/${activityId}/play?mode=study`);await select(page,'ar','sentence-completion')
  133 |  await page.getByRole('button',{name:'معاينة المحتوى المعتمد',exact:true}).click()
  134 |  const preview=page.getByRole('region',{name:'معاينة العرض',exact:true})
  135 |  await expect(preview.getByText(before,{exact:true})).toBeVisible();await expect(preview.getByText(after,{exact:true})).toBeVisible()
  136 |  for(const [answer,correct] of [[wrong,false],[accepted,true]] as const){
  137 |   await preview.getByRole('textbox',{name:'الفراغ 1',exact:true}).fill(answer)
  138 |   await preview.getByRole('button',{name:'إرسال الإجابة',exact:true}).click()
  139 |   await expect(preview.locator(`[role=status][data-correct=${correct}]`)).toBeVisible()
  140 |   await preview.getByRole('button',{name:'إعادة المعاينة',exact:true}).click()
  141 |  }
  142 |  const joined=await join(page,browser,'ar')
  143 |  try{
  144 |   for(const [answer,correct] of [[wrong,false],[accepted,true]] as const){
  145 |    const context=correct?await browser.newContext({viewport:{width:320,height:800},hasTouch:true}):joined.context
  146 |    let learn=joined.learn
  147 |    if(correct){await context.addInitScript(()=>localStorage.setItem('asasera.language','ar'));learn=await context.newPage();await learn.goto(joined.link);await learn.getByRole('textbox',{name:'اسمك'}).fill('متعلم ثانٍ');await learn.getByRole('button',{name:'ابدأ',exact:true}).tap();await learn.getByRole('button',{name:'ابدأ الجولة',exact:true}).tap()}
  148 |    try{
  149 |     await expect(learn.getByText(before,{exact:true})).toBeVisible();await expect(learn.getByText(after,{exact:true})).toBeVisible()
  150 |     const blank=learn.getByRole('textbox',{name:'الفراغ 1',exact:true});await blank.fill(answer)
  151 |     const response=learn.waitForResponse(r=>r.url().endsWith('/answer')&&r.request().method()==='POST');await learn.getByRole('button',{name:'إرسال الإجابة',exact:true}).tap()
  152 |     const submitted=await response;expect(submitted.ok()).toBe(true);expect((await submitted.json()).reveal.wasCorrect).toBe(correct)
  153 |     await learn.reload();await expect(learn.getByRole('textbox',{name:'الفراغ 1',exact:true})).toHaveValue(answer)
  154 |     await capture(learn,`cloze-hamza-${diacritics}-${correct?'accepted':'wrong'}-320`)
  155 |    }finally{if(correct)await context.close()}
  156 |   }
  157 |   expect(joined.errors).toEqual([])
  158 |  }finally{await joined.context.close()}
  159 | })
  160 | 
  161 | async function fillTiles(scope:Page|Locator,page:Page,language:Language,graphemes:string[]){
  162 |  for(const grapheme of graphemes){
  163 |   // The blank-space tile is visibly ␣; accessible names collapse whitespace.
  164 |   const label=grapheme===' '?new RegExp(`^${language==='ar'?'إضافة':'Add'}\\s*${language==='ar'?'،':','}`):new RegExp(`^${language==='ar'?'إضافة':'Add'} ${escaped(grapheme)}${language==='ar'?'،':','}`)
  165 |   await activate(scope.getByRole('button',{name:label}).first(),page,language)
  166 |  }
  167 | }
  168 | for(const language of ['en','ar'] as const)test(`reviewed phrase ${language}: preserved spaces, repeated graphemes, teacher preview and saved ${language==='ar'?'tap':'keyboard'} response`,async({page,request,browser})=>{
  169 |  test.setTimeout(60000)
  170 |  const phrase=language==='ar'?'بَاب بَاب':'letter letter',clue=text(language,'A written message, repeated twice with one space','مدخل البيت مرتين وبينهما مسافة واحدة')
  171 |  const graphemes=language==='ar'?['بَ','ا','ب',' ','بَ','ا','ب']:['l','e','t','t','e','r',' ','l','e','t','t','e','r']
  172 |  await prepare(page,request,language,{kind:'vocabulary',prompt:text(language,'Build the exact reviewed phrase.','كوّن العبارة المعتمدة بحروفها وحركاتها.'),payload:{schemaVersion:1,policy:policy(language),entries:[{id:'phrase',word:phrase,clue}]}})
  173 |  await select(page,language,'word-builder')
  174 |  await page.getByRole('button',{name:text(language,'Preview approved content','معاينة المحتوى المعتمد'),exact:true}).click()
  175 |  const preview=page.getByRole('region',{name:text(language,'Presentation preview','معاينة العرض'),exact:true})
  176 |  await preview.getByText(text(language,'Accepted answers and comparison policy','الإجابات المقبولة وقواعد المقارنة'),{exact:true}).click()
  177 |  await expect(preview.getByText(text(language,'Diacritics: preserve · Tatweel: preserve · Spaces: preserve · Case: preserve','التشكيل: محفوظ · التطويل: محفوظ · المسافات: محفوظة · حالة الأحرف: محفوظة'),{exact:true})).toBeVisible()
  178 |  // Teacher desktop uses keyboard even for Arabic; the learner below uses touch.
  179 |  for(const grapheme of graphemes){const label=grapheme===' '?new RegExp(`^${language==='ar'?'إضافة':'Add'}\\s*${language==='ar'?'،':','}`):new RegExp(`^${language==='ar'?'إضافة':'Add'} ${escaped(grapheme)}${language==='ar'?'،':','}`);const tile=preview.getByRole('button',{name:label}).first();await tile.focus();await page.keyboard.press('Enter')}
  180 |  await preview.getByRole('button',{name:text(language,'Submit answer','إرسال الإجابة'),exact:true}).click()
  181 |  await expect(preview.getByRole('status').filter({hasText:text(language,'The answer matches the approved content. Preview result only.','الإجابة توافق المحتوى المعتمد. نتيجة معاينة فقط.')})).toBeVisible()
  182 |  const {context,learn,errors}=await join(page,browser,language)
  183 |  try{
  184 |   await expect(learn.getByRole('group',{name:clue,exact:true})).toBeVisible()
  185 |   await fillTiles(learn,learn,language,graphemes)
  186 |   const saving=learn.waitForResponse(response=>response.request().method()==='POST'&&response.url().endsWith('/answer'))
  187 |   await activate(learn.getByRole('button',{name:text(language,'Submit answer','إرسال الإجابة'),exact:true}),learn,language)
  188 |   const response=await saving;expect(response.ok(),await response.text()).toBe(true)
  189 |   const saved=await response.json();expect(Object.values(response.request().postDataJSON().answer.values)).toEqual([phrase]);expect(saved.reveal.wasCorrect).toBe(true)
  190 |   await learn.reload();await expect(learn.getByRole('textbox',{name:clue,exact:true})).toHaveValue(phrase)
  191 |   await capture(learn,`phrase-${language}-320-saved`)
  192 |   await activate(learn.getByRole('button',{name:text(language,'Finish round','إنهاء الجولة'),exact:true}),learn,language)
  193 |   await expect(learn.getByRole('heading',{name:text(language,'Round complete','اكتملت الجولة'),exact:true})).toBeVisible();expect(errors).toEqual([])
  194 |  }finally{await context.close()}
  195 | })
  196 | 
```