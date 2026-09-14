# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: interactive-puzzle-reflow.spec.ts >> large saved crossword en: 320 landscape tablet, keyboard, correction and reload
- Location: e2e/interactive-puzzle-reflow.spec.ts:48:99

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Board complete. This records word practice, not mastery of the meanings.', { exact: true })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('Board complete. This records word practice, not mastery of the meanings.', { exact: true }) with timeout 5000ms
  - waiting for getByText('Board complete. This records word practice, not mastery of the meanings.', { exact: true })

```

```yaml
- main:
  - strong: Asasera
  - button "Pause motion"
  - text: Self-study
  - button "العربية"
  - button "Leave a shared device"
  - paragraph: "Reviewed puzzle reflow · Deadline: Sep 21, 2026, 11:30 AM"
  - progressbar "Progress"
  - strong: Crossword
  - text: 1 of 1
  - paragraph: Your progress is saved after every step.
  - heading "Complete the reviewed large word board." [level=1]
  - region "Crossword":
    - paragraph: Choose a clue and use the large answer field. Save your word before checking.
    - paragraph: The board scrolls inside this frame; cell positions do not change with the interface language.
    - region "Scrollable word board":
      - 'button "Row 9, column 10: t"': t
      - 'button "Row 10, column 9: c"': c
      - 'button "Row 10, column 10: a"': a
      - 'button "Row 10, column 11: t"': t
      - 'button "Row 11, column 10: p"': p
    - heading "Across" [level=2]
    - button "2 A small feline animal that often lives with people (3)" [pressed]:
      - strong: "2"
      - text: A small feline animal that often lives with people (3)
    - heading "Down" [level=2]
    - button "1 Touch something lightly with a short movement (3) Correct":
      - strong: "1"
      - text: Touch something lightly with a short movement (3)
      - img "Correct"
    - text: Answer to clue 2
    - textbox "Answer to clue 2": cat
    - button "Save word"
    - status: Saved
    - button "Check words"
    - text: "Checks: 1 of 100"
  - button "Finish round" [disabled]
```

# Test source

```ts
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
  27  |  return {board,activityId:activity.id}
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
  39  |  return {context,learn,errors}
  40  | }
  41  | async function activate(locator:Locator,page:Page,language:Language){if(language==='ar')await locator.tap();else{await locator.focus();await page.keyboard.press('Enter')}}
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
> 109 |   await expect(learn.getByText(text(language,'Board complete. This records word practice, not mastery of the meanings.','اكتملت اللوحة. يُحفظ هذا كتدريب كلمات، وليس دليلًا على فهم المعاني.'),{exact:true})).toBeVisible()
      |                                                                                                                                                                                                               ^ Error: expect(locator).toBeVisible() failed
  110 |   await learn.reload();await expect(learn.getByText(text(language,'Board complete. This records word practice, not mastery of the meanings.','اكتملت اللوحة. يُحفظ هذا كتدريب كلمات، وليس دليلًا على فهم المعاني.'),{exact:true})).toBeVisible()
  111 |   await capture(learn,`${kind}-${language}-complete`)
  112 |   await activate(learn.getByRole('button',{name:text(language,'Finish round','إنهاء الجولة'),exact:true}),learn,language)
  113 |   await expect(learn.getByRole('heading',{name:text(language,'Round complete','اكتملت الجولة'),exact:true})).toBeVisible();expect(errors).toEqual([])
  114 |  }finally{await context.close()}
  115 | })
  116 | 
```