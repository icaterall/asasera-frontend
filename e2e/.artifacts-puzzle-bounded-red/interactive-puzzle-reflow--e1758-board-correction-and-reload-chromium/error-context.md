# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: interactive-puzzle-reflow.spec.ts >> large saved crossword en: 320 landscape tablet, keyboard, correction and reload
- Location: e2e/interactive-puzzle-reflow.spec.ts:48:99

# Error details

```
Error: large boards keep nearby clue controls reachable

expect(received).toBeLessThanOrEqual(expected)

Expected: <= 441
Received:    938
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - link "Skip to content" [ref=e4] [cursor=pointer]:
    - /url: "#teacher-main"
  - status [ref=e6]:
    - generic [ref=e7]:
      - paragraph [ref=e10]: Verify your email to secure your Asasera account. Check your inbox at puzzle-reflow-26a8bc9d-95a2-475f-b63c-7379685fb96c@example.com.
      - generic [ref=e11]:
        - button "Verify email" [ref=e12]
        - button "Change email" [ref=e13]
  - generic [ref=e14]:
    - complementary [ref=e15]:
      - link [ref=e17] [cursor=pointer]:
        - /url: /
        - img "Asasera" [ref=e19]
      - navigation "Teacher navigation" [ref=e20]:
        - link "Home" [ref=e21] [cursor=pointer]:
          - /url: /teacher/dashboard
        - link "My activities" [ref=e25] [cursor=pointer]:
          - /url: /teacher/activities
        - link "My materials" [ref=e30] [cursor=pointer]:
          - /url: /teacher/materials
        - link "Homework & study" [ref=e34] [cursor=pointer]:
          - /url: /teacher/assignments
        - link "Class reports" [ref=e37] [cursor=pointer]:
          - /url: /teacher/reports
        - group [ref=e40]:
          - generic "More" [ref=e41] [cursor=pointer]
        - link "Help & guides" [ref=e42] [cursor=pointer]:
          - /url: /teacher/guides
    - generic [ref=e50]:
      - banner [ref=e51]:
        - paragraph [ref=e52]: Teacher workspace
        - generic [ref=e53]:
          - link "Create activity" [ref=e54] [cursor=pointer]:
            - /url: /teacher/activities/new
          - 'button "Available balance: 0. Open account and usage" [ref=e55] [cursor=pointer]':
            - generic [ref=e59]:
              - strong [ref=e60]: "0"
              - generic [ref=e61]: Add credit
          - group "Language" [ref=e64]:
            - button "التبديل إلى العربية" [ref=e65]: ع
            - button "Switch to English" [pressed] [ref=e66]: EN
          - button "Toggle colour theme" [ref=e67]
          - button "Account menu — Teacher" [ref=e75] [cursor=pointer]:
            - generic [ref=e77]: S
      - main [ref=e78]:
        - generic [ref=e79]:
          - link "← My activities" [ref=e80] [cursor=pointer]:
            - /url: /teacher/activities
          - generic [ref=e81]:
            - heading "Reviewed puzzle reflow" [level=1] [ref=e82]
            - paragraph [ref=e83]: 1 questions in the approved version
            - heading "How would you like to play?" [level=2] [ref=e84]
          - group "Play mode" [ref=e85]:
            - generic [ref=e87] [cursor=pointer]:
              - radio "Live game Host together. Students join with a game PIN." [disabled] [ref=e88]
              - strong [ref=e95]: Live game
              - generic [ref=e96]: Host together. Students join with a game PIN.
            - generic [ref=e97] [cursor=pointer]:
              - radio "Assign homework Set a deadline and choose when answers become visible." [disabled] [ref=e98]
              - strong [ref=e102]: Assign homework
              - generic [ref=e103]: Set a deadline and choose when answers become visible.
            - generic [ref=e104] [cursor=pointer]:
              - radio "Self-study Let learners practice at their own pace with feedback." [checked] [disabled] [ref=e105]
              - strong [ref=e108]: Self-study
              - generic [ref=e109]: Let learners practice at their own pace with feedback.
          - group "Present your content" [ref=e110]:
            - paragraph [ref=e112]: Reuse approved questions without creating new content or using AI credit.
            - generic [ref=e113]:
              - generic [ref=e114]:
                - radio "Questions in order" [disabled] [ref=e115]
                - text: Questions in order
              - generic [ref=e116]:
                - radio "Flashcards Recall an answer, then rate your memory. Needs compatible content · Practice" [disabled] [ref=e117]
                - generic [ref=e122]:
                  - text: Flashcards
                  - generic [ref=e123]: Recall an answer, then rate your memory.
                  - generic [ref=e124]: Needs compatible content · Practice
              - generic [ref=e125]:
                - radio "Question wheel Spin to choose a question without repeats. Needs compatible content · Practice" [disabled] [ref=e126]
                - generic [ref=e130]:
                  - text: Question wheel
                  - generic [ref=e131]: Spin to choose a question without repeats.
                  - generic [ref=e132]: Needs compatible content · Practice
              - generic [ref=e133]:
                - radio "Random cards Draw and answer a card from the deck. Needs compatible content · Practice" [disabled] [ref=e134]
                - generic [ref=e141]:
                  - text: Random cards
                  - generic [ref=e142]: Draw and answer a card from the deck.
                  - generic [ref=e143]: Needs compatible content · Practice
              - generic [ref=e144]:
                - radio "Speaking cards Discuss a prompt without automatic grading. Needs compatible content · Practice" [disabled] [ref=e145]
                - generic [ref=e148]:
                  - text: Speaking cards
                  - generic [ref=e149]: Discuss a prompt without automatic grading.
                  - generic [ref=e150]: Needs compatible content · Practice
              - generic [ref=e151]:
                - radio "Open the box Open a numbered box to reveal its question. Needs compatible content · Practice" [disabled] [ref=e152]
                - generic [ref=e157]:
                  - text: Open the box
                  - generic [ref=e158]: Open a numbered box to reveal its question.
                  - generic [ref=e159]: Needs compatible content · Practice
              - generic [ref=e160]:
                - radio "Match up Connect each item with its matching meaning. Needs compatible content · Practice" [disabled] [ref=e161]
                - generic [ref=e165]:
                  - text: Match up
                  - generic [ref=e166]: Connect each item with its matching meaning.
                  - generic [ref=e167]: Needs compatible content · Practice
              - generic [ref=e168]:
                - radio "Memory Reveal cards and remember matching pairs. Needs compatible content · Practice" [disabled] [ref=e169]
                - generic [ref=e172]:
                  - text: Memory
                  - generic [ref=e173]: Reveal cards and remember matching pairs.
                  - generic [ref=e174]: Needs compatible content · Practice
              - generic [ref=e175]:
                - radio "Group sort Place items in their reviewed groups. Needs compatible content · Practice" [disabled] [ref=e176]
                - generic [ref=e178]:
                  - text: Group sort
                  - generic [ref=e179]: Place items in their reviewed groups.
                  - generic [ref=e180]: Needs compatible content · Practice
              - generic [ref=e181]:
                - radio "Sequence Put steps or phrases in the right order. Needs compatible content · Practice" [disabled] [ref=e182]
                - generic [ref=e186]:
                  - text: Sequence
                  - generic [ref=e187]: Put steps or phrases in the right order.
                  - generic [ref=e188]: Needs compatible content · Practice
              - generic [ref=e189]:
                - radio "Complete the sentence Fill a passage’s blanks with accepted answers. Needs compatible content · Practice" [disabled] [ref=e190]
                - generic [ref=e196]:
                  - text: Complete the sentence
                  - generic [ref=e197]: Fill a passage’s blanks with accepted answers.
                  - generic [ref=e198]: Needs compatible content · Practice
              - generic [ref=e199]:
                - radio "Word builder Build a word from its letter tiles. 1 of 1 compatible · Practice" [disabled] [ref=e200]
                - generic [ref=e203]:
                  - text: Word builder
                  - generic [ref=e204]: Build a word from its letter tiles.
                  - generic [ref=e205]: 1 of 1 compatible · Practice
              - generic [ref=e206]:
                - radio "Word search Find words in the saved letter grid. Needs compatible content · Practice" [disabled] [ref=e207]
                - generic [ref=e211]:
                  - text: Word search
                  - generic [ref=e212]: Find words in the saved letter grid.
                  - generic [ref=e213]: Needs compatible content · Practice
              - generic [ref=e214]:
                - radio "Crossword Solve clues in the reviewed crossword. 1 of 1 compatible · Practice" [checked] [disabled] [ref=e215]
                - generic [ref=e218]:
                  - text: Crossword
                  - generic [ref=e219]: Solve clues in the reviewed crossword.
                  - generic [ref=e220]: 1 of 1 compatible · Practice
          - button "Preview approved content" [ref=e222] [cursor=pointer]
          - group "Assignment settings" [ref=e223]:
            - generic [ref=e225]:
              - text: Time zone
              - combobox "Time zone" [disabled] [ref=e226]:
                - generic [ref=e227]: Asia/Muscat
              - textbox [disabled] [aria-hidden] [ref=e230]: Asia/Muscat
            - generic [ref=e231]:
              - text: Opens at (optional)
              - textbox "Opens at (optional)" [disabled] [ref=e232]
            - generic [ref=e233]:
              - text: Deadline
              - textbox "Deadline" [disabled] [ref=e234]: 2026-09-21T11:35
            - generic [ref=e235]:
              - text: Attempts allowed
              - combobox "Attempts allowed" [disabled] [ref=e236]:
                - generic [ref=e237]: 1 attempt
              - textbox [disabled] [aria-hidden] [ref=e240]: "1"
            - generic [ref=e241]:
              - text: Show correct answers
              - combobox "Show correct answers" [disabled] [ref=e242]:
                - generic [ref=e243]: After each answer
              - textbox [disabled] [aria-hidden] [ref=e247]: immediate
            - generic [ref=e248]:
              - text: Class
              - combobox "Class" [disabled] [ref=e249]:
                - generic [ref=e250]: No saved class
              - textbox [disabled] [aria-hidden] [ref=e254]
            - paragraph [ref=e255]:
              - generic [ref=e256]:
                - text: "Closes: Sep 21, 2026, 11:35 AM GMT+4 ·"
                - generic [ref=e257]: Sep 21, 2026, 7:35 AM UTC
              - text: · Asia/Muscat
            - paragraph [ref=e258]: Progress resumes in the same browser. Results appear in your reports and do not affect public shelf rankings.
          - generic [ref=e259]:
            - heading "Your link is ready to share" [level=2] [ref=e260]
            - paragraph [ref=e261]: Copy it and share it with your learners.
            - paragraph [ref=e262]:
              - generic [ref=e263]:
                - text: "Closes: Sep 21, 2026, 11:35 AM GMT+4 ·"
                - generic [ref=e264]: Sep 21, 2026, 7:35 AM UTC
              - text: · Asia/Muscat · 1 attempt
            - textbox "Assignment link" [ref=e265]: http://127.0.0.1:5411/learn/f6b51c3b-5cba-4e63-a7eb-4c90fb12e1b3#3d4ZbF7_euzVTC-v2AZuaGsX2UaWJp_ZOq7FVK12Xlc
            - button "Copy link" [ref=e266] [cursor=pointer]
            - link "Manage assignments" [ref=e270] [cursor=pointer]:
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
> 64  |    expect((await region.boundingBox())!.height,'large boards keep nearby clue controls reachable').toBeLessThanOrEqual(Math.min(height*.55,440)+1)
      |                                                                                                    ^ Error: large boards keep nearby clue controls reachable
  65  |    expect(await region.locator('button[data-row]').evaluateAll(nodes=>nodes.map(node=>[node.getAttribute('data-row'),node.getAttribute('data-column')]))).toEqual(before)
  66  |    await capture(learn,`${kind}-${language}-${label}`)
  67  |   }
  68  |   await learn.setViewportSize({width:320,height:800})
  69  |   expect(await learn.locator('meta[name=viewport]').getAttribute('content')).not.toMatch(/user-scalable=no|maximum-scale=1(?:[, ]|$)/)
  70  |   const cdp=await context.newCDPSession(learn);await cdp.send('Emulation.setPageScaleFactor',{pageScaleFactor:2})
  71  |   expect(await learn.evaluate(()=>visualViewport?.scale)).toBe(2)
  72  |   await cdp.send('Emulation.setPageScaleFactor',{pageScaleFactor:1});await cdp.detach()
  73  |   if(kind==='word-search'){
  74  |    for(const [index,placement] of board!.placements.entries()){
  75  |     const start=placement.cells[0]!,end=placement.cells.at(-1)!,first=region.locator(`button[data-row="${start.row}"][data-column="${start.column}"]`)
  76  |     await activate(first,learn,language)
  77  |     if(language==='en'){
  78  |      if(index===0){await learn.keyboard.press('Escape');await expect(learn.locator('[data-preview=true]')).toHaveCount(0);await activate(first,learn,language)}
  79  |      const dr=Math.sign(end.row-start.row),dc=Math.sign(end.column-start.column)
  80  |      for(let i=1;i<placement.cells.length;i++){if(dr)await learn.keyboard.press(dr>0?'ArrowDown':'ArrowUp');if(dc)await learn.keyboard.press(dc>0?'ArrowRight':'ArrowLeft')}
  81  |      await expect(learn.locator('[data-preview=true]')).toHaveCount(placement.cells.length);await learn.keyboard.press('Enter')
  82  |     }else await region.locator(`button[data-row="${end.row}"][data-column="${end.column}"]`).tap()
  83  |     await expect(learn.locator('li[data-found=true]')).toHaveCount(index+1)
  84  |     if(index===0){await learn.reload();await expect(learn.locator('li[data-found=true]')).toHaveCount(1)}
  85  |    }
  86  |   }else{
  87  |    const first=board!.placements[0]!,other=board!.placements.slice(1).find(p=>p.cells.some(c=>first.cells.some(a=>a.row===c.row&&a.column===c.column)))
  88  |    expect(other,'the author-saved layout must contain a real tested intersection').toBeDefined()
  89  |    const wrong=language==='ar'?'سسس':'xxx'
  90  |    for(const placement of board!.placements){
  91  |     await activate(learn.getByRole('button').filter({hasText:placement.clue}),learn,language)
  92  |     const active=region.locator('button[data-active=true]')
  93  |     await expect(active).toHaveCount(placement.cells.length)
  94  |     await expect.poll(()=>active.evaluateAll(nodes=>nodes.every(node=>{const frame=node.closest('[role=region]')!.getBoundingClientRect(),cell=node.getBoundingClientRect();return cell.left>=frame.left&&cell.right<=frame.right&&cell.top>=frame.top&&cell.bottom<=frame.bottom}))).toBe(true)
  95  |     const input=learn.getByRole('textbox',{name:text(language,`Answer to clue ${placement.number}`,`إجابة التلميح ${placement.number}`)})
  96  |     await input.fill(placement.entryId===first.entryId?wrong:placement.word)
  97  |     expect((await input.boundingBox())!.height).toBeGreaterThanOrEqual(44)
  98  |     await expect(learn.getByRole('button',{name:text(language,'Check words','تحقق من الكلمات'),exact:true})).toBeDisabled()
  99  |     await activate(learn.getByRole('button',{name:text(language,'Save word','احفظ الكلمة'),exact:true}),learn,language)
  100 |     await expect(learn.getByText(text(language,'Not saved yet','تعديل غير محفوظ بعد'),{exact:true})).toHaveCount(0)
  101 |    }
  102 |    await expect(learn.getByText(text(language,'Some intersection letters disagree. Review your saved words.','تختلف حروف بعض التقاطعات. راجع الكلمات المحفوظة.'),{exact:true})).toBeVisible()
  103 |    await activate(learn.getByRole('button',{name:text(language,'Check words','تحقق من الكلمات'),exact:true}),learn,language)
  104 |    await expect(learn.getByText(text(language,'Some words need another look. You can edit them and check again.','بعض الكلمات تحتاج مراجعة؛ يمكنك تعديلها والتحقق مجددًا.'),{exact:true})).toBeVisible()
  105 |    await capture(learn,`crossword-${language}-wrong-intersection`)
  106 |    await learn.reload()
  107 |    await activate(learn.getByRole('button').filter({hasText:first.clue}),learn,language)
  108 |    const input=learn.getByRole('textbox',{name:text(language,`Answer to clue ${first.number}`,`إجابة التلميح ${first.number}`)})
  109 |    await expect(input).toHaveValue(wrong);await input.fill(first.word)
  110 |    await activate(learn.getByRole('button',{name:text(language,'Save word','احفظ الكلمة'),exact:true}),learn,language)
  111 |    await activate(learn.getByRole('button',{name:text(language,'Check words','تحقق من الكلمات'),exact:true}),learn,language)
  112 |   }
  113 |   await expect(learn.getByText(text(language,'Board complete. This records word practice, not mastery of the meanings.','اكتملت اللوحة. يُحفظ هذا كتدريب كلمات، وليس دليلًا على فهم المعاني.'),{exact:true})).toBeVisible()
  114 |   await learn.reload();await expect(learn.getByText(text(language,'Board complete. This records word practice, not mastery of the meanings.','اكتملت اللوحة. يُحفظ هذا كتدريب كلمات، وليس دليلًا على فهم المعاني.'),{exact:true})).toBeVisible()
  115 |   await capture(learn,`${kind}-${language}-complete`)
  116 |   await activate(learn.getByRole('button',{name:text(language,'Finish round','إنهاء الجولة'),exact:true}),learn,language)
  117 |   await expect(learn.getByRole('heading',{name:text(language,'Round complete','اكتملت الجولة'),exact:true})).toBeVisible();expect(errors).toEqual([])
  118 |  }finally{await context.close()}
  119 | })
  120 | 
  121 | for(const diacritics of ['preserve','ignore'] as const)test(`edited Arabic passage and ${diacritics} policy keep hamza distinct in preview and saved learner answers`,async({page,request,browser})=>{
  122 |  test.setTimeout(60000)
  123 |  const before='نقرأُ الكلمةَ «',after='» ثم نُفَسِّرُ مَعْنَاهَا.',accepted=diacritics==='ignore'?'أمل':'أَمَل',wrong=diacritics==='ignore'?'امل':'اَمَل'
  124 |  const {activityId,questionId,headers}=await prepare(page,request,'ar',{kind:'cloze',prompt:'أكمل الكلمة مع مراعاة قاعدة الإملاء المعتمدة.',payload:{schemaVersion:1,segments:[{kind:'text',text:'كلمة '},{kind:'blank',blankId:'hope'},{kind:'text',text:'.'}],blanks:[{id:'hope',acceptedAnswers:['أَمَل']}],policy:policy('ar'),trimBoundaryWhitespace:true}})
  125 |  await page.goto(`/teacher/activities/${activityId}`)
  126 |  await page.getByRole('textbox',{name:'جزء النص 1',exact:true}).fill(before)
  127 |  await page.getByRole('textbox',{name:'جزء النص 2',exact:true}).fill(after)
  128 |  await page.getByText('قواعد الإملاء',{exact:true}).click()
  129 |  if(diacritics==='ignore')await page.getByRole('checkbox',{name:'تجاهل الحركات عند المطابقة',exact:true}).check()
  130 |  const published=page.waitForResponse(response=>response.url().endsWith(`/activities/${activityId}/publish`)&&response.request().method()==='POST')
  131 |  await page.getByRole('button',{name:'اعتماد التغييرات',exact:true}).click();expect((await published).ok()).toBe(true)
  132 |  await page.reload();await expect(page.getByRole('textbox',{name:'جزء النص 1',exact:true})).toHaveValue(before);await expect(page.getByRole('textbox',{name:'جزء النص 2',exact:true})).toHaveValue(after)
  133 |  const owner=await request.get(`/api/v1/activities/${activityId}`,{headers});expect(owner.ok()).toBe(true)
  134 |  const body=await owner.json(),savedQuestion=body.questions.find((item:{id:number})=>item.id===questionId)
  135 |  expect(savedQuestion.payload.segments).toEqual([{kind:'text',text:before},{kind:'blank',blankId:'hope'},{kind:'text',text:after}]);expect(savedQuestion.payload.policy.diacritics).toBe(diacritics)
  136 |  await page.goto(`/teacher/activities/${activityId}/play?mode=study`);await select(page,'ar','sentence-completion')
  137 |  await page.getByRole('button',{name:'معاينة المحتوى المعتمد',exact:true}).click()
  138 |  const preview=page.getByRole('region',{name:'معاينة العرض',exact:true})
  139 |  await expect(preview.getByText(before,{exact:true})).toBeVisible();await expect(preview.getByText(after,{exact:true})).toBeVisible()
  140 |  for(const [answer,correct] of [[wrong,false],[accepted,true]] as const){
  141 |   await preview.getByRole('textbox',{name:'الفراغ 1',exact:true}).fill(answer)
  142 |   await preview.getByRole('button',{name:'إرسال الإجابة',exact:true}).click()
  143 |   await expect(preview.locator(`[role=status][data-correct=${correct}]`)).toBeVisible()
  144 |   await preview.getByRole('button',{name:'إعادة المعاينة',exact:true}).click()
  145 |  }
  146 |  const joined=await join(page,browser,'ar')
  147 |  try{
  148 |   for(const [answer,correct] of [[wrong,false],[accepted,true]] as const){
  149 |    const context=correct?await browser.newContext({viewport:{width:320,height:800},hasTouch:true}):joined.context
  150 |    let learn=joined.learn
  151 |    if(correct){await context.addInitScript(()=>localStorage.setItem('asasera.language','ar'));learn=await context.newPage();await learn.goto(joined.link);await learn.getByRole('textbox',{name:'اسمك'}).fill('متعلم ثانٍ');await learn.getByRole('button',{name:'ابدأ',exact:true}).tap();await learn.getByRole('button',{name:'ابدأ الجولة',exact:true}).tap()}
  152 |    try{
  153 |     await expect(learn.getByText(before,{exact:true})).toBeVisible();await expect(learn.getByText(after,{exact:true})).toBeVisible()
  154 |     const blank=learn.getByRole('textbox',{name:'الفراغ 1',exact:true});await blank.fill(answer)
  155 |     const response=learn.waitForResponse(r=>r.url().endsWith('/answer')&&r.request().method()==='POST');await learn.getByRole('button',{name:'إرسال الإجابة',exact:true}).tap()
  156 |     const submitted=await response;expect(submitted.ok()).toBe(true);expect((await submitted.json()).reveal.wasCorrect).toBe(correct)
  157 |     await learn.reload();await expect(learn.getByRole('textbox',{name:'الفراغ 1',exact:true})).toHaveValue(answer)
  158 |     await capture(learn,`cloze-hamza-${diacritics}-${correct?'accepted':'wrong'}-320`)
  159 |    }finally{if(correct)await context.close()}
  160 |   }
  161 |   expect(joined.errors).toEqual([])
  162 |  }finally{await joined.context.close()}
  163 | })
  164 | 
```