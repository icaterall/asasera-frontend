import {test,expect,type APIRequestContext,type Browser,type Locator,type Page} from '@playwright/test'
import type {SavedWordBoard} from '../src/shared/word-boards'

test.use({trace:'off'})
type Language='en'|'ar'
const names={'word-search':['Word search','البحث عن الكلمات'],crossword:['Crossword','الكلمات المتقاطعة'],'word-builder':['Word builder','بناء الكلمات'],'sentence-completion':['Complete the sentence','إكمال الجملة']} as const
const policy=(language:Language)=>({version:1,language,diacritics:'preserve',tatweel:'preserve',case:'preserve',spaces:'preserve'})
const text=(language:Language,en:string,ar:string)=>language==='ar'?ar:en
const escaped=(value:string)=>value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')

async function prepare(page:Page,request:APIRequestContext,language:Language,source:Record<string,unknown>,kind?:'word-search'|'crossword'){
 expect(new URL(process.env.PW_BASE_URL??'').hostname).toMatch(/^(127\.0\.0\.1|localhost)$/)
 const email=`puzzle-reflow-${crypto.randomUUID()}@example.com`,password=`Synthetic-${crypto.randomUUID()}!`
 expect((await request.post('/api/v1/auth/register/teacher',{data:{name:'Synthetic puzzle instructor',email,password}})).ok()).toBe(true)
 const login=await request.post('/api/v1/auth/login',{data:{email,password}});expect(login.ok()).toBe(true)
 const headers={Authorization:`Bearer ${(await login.json()).accessToken}`}
 const created=await request.post('/api/v1/activities',{headers,data:{title:text(language,'Reviewed puzzle reflow','مراجعة لوحة الكلمات'),subjectId:1,levelId:8,purposeId:2,contentLanguage:language}})
 expect(created.ok()).toBe(true);const {activity}=await created.json()
 const added=await request.post(`/api/v1/activities/${activity.id}/questions`,{headers,data:source});expect(added.ok(),await added.text()).toBe(true)
 const {question}=await added.json();let board:SavedWordBoard|undefined
 if(kind){const generated=await request.post(`/api/v1/activities/questions/${question.id}/word-board`,{headers,data:{kind,expectedRevision:question.revision,requestId:crypto.randomUUID(),config:{rows:20,columns:20,seed:31,maxWork:100000}}});expect(generated.ok(),await generated.text()).toBe(true);board=(await generated.json()).board;expect(board?.status).toBe('ready')}
 expect((await request.post(`/api/v1/activities/${activity.id}/publish`,{headers})).ok()).toBe(true)
 await page.context().addCookies((await request.storageState()).cookies)
 await page.addInitScript(lang=>localStorage.setItem('asasera.language',lang),language)
 await page.setViewportSize({width:language==='ar'?390:1440,height:900})
 await page.goto(`/teacher/activities/${activity.id}/play?mode=study`)
 return {board,activityId:activity.id,questionId:question.id,headers}
}
async function select(page:Page,language:Language,kind:keyof typeof names){await page.getByRole('radio',{name:new RegExp(`^${escaped(names[kind][language==='ar'?1:0])}`)}).check()}
async function join(page:Page,browser:Browser,language:Language,withoutScrollTo=false,recording=false){
 await page.getByRole('button',{name:text(language,'Create assignment link','أنشئ رابط المشاركة'),exact:true}).click()
 const link=await page.getByRole('textbox',{name:text(language,'Assignment link','رابط النشاط')}).inputValue()
 const context=await browser.newContext({viewport:{width:320,height:800},hasTouch:true,locale:language,...(recording?{recordVideo:{dir:'e2e/.artifacts-puzzle-videos',size:{width:320,height:800}}}:{})})
 if(withoutScrollTo)await context.addInitScript(()=>Object.defineProperty(Element.prototype,'scrollTo',{value:undefined,configurable:true}))
 await context.addInitScript(lang=>localStorage.setItem('asasera.language',lang),language)
 const learn=await context.newPage(),errors:string[]=[];learn.on('pageerror',error=>errors.push(error.message))
 await learn.goto(link);await learn.getByRole('textbox',{name:text(language,'Your name','اسمك')}).fill(text(language,'Synthetic learner','متعلم تجريبي'))
 await learn.getByRole('button',{name:text(language,'Start','ابدأ'),exact:true}).tap()
 await learn.getByRole('button',{name:text(language,'Start round','ابدأ الجولة'),exact:true}).tap()
 return {context,learn,errors,link}
}
async function activate(locator:Locator,page:Page,language:Language){await expect(locator).toBeEnabled();if(language==='ar')await locator.tap();else{await locator.focus();await expect(locator).toBeFocused();await page.keyboard.press('Enter')}}
async function capture(page:Page,name:string){
 await page.evaluate(async()=>{await document.fonts.ready;await Promise.all(document.getAnimations().filter(a=>a.effect?.getTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{})))})
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
 await page.screenshot({path:`../docs/evidence/interactive/puzzle-${name}.png`,fullPage:true})
}

for(const language of ['en','ar'] as const)for(const kind of ['word-search','crossword'] as const)test(`large saved ${kind} ${language}: 320 landscape tablet, ${language==='ar'?'tap':'keyboard'}, correction and reload`,async({page,request,browser})=>{
 test.setTimeout(90000)
 const words=kind==='crossword'?(language==='ar'?['باب','تاب']:['cat','tap']):(language==='ar'?['باب','تاب','بات','بيت','بنت']:['cat','tap','pat','cap','act'])
 const clues=language==='ar'?['مدخل البيت الذي نمرّ منه كل يوم','رجع عن الخطأ وقرر أن يصحح عمله','قضى الليل في مكان آمن','مكان السكن الذي يجمع الأسرة','طفلة صغيرة ضمن أفراد الأسرة']:['A small feline animal that often lives with people','Touch something lightly with a short movement','A gentle touch with the flat part of the hand','A covering worn on the head in the sunshine','Do something rather than simply describe it']
 const {board}=await prepare(page,request,language,{kind:'vocabulary',prompt:text(language,'Complete the reviewed large word board.','أكمل لوحة الكلمات الكبيرة المعتمدة.'),payload:{schemaVersion:1,policy:policy(language),entries:words.map((word,i)=>({id:`entry${i}`,word,clue:clues[i]}))}},kind)
 expect(board!.placements).toHaveLength(words.length)
 await select(page,language,kind)
 const {context,learn,errors}=await join(page,browser,language,kind==='crossword'&&language==='ar',true)
 try{
  const region=learn.getByRole('region',{name:text(language,'Scrollable word board','لوحة كلمات قابلة للتمرير')})
  await expect(region).toBeVisible()
  expect(await region.evaluate(el=>el.scrollWidth>el.clientWidth)).toBe(true)
  const cell=region.locator('button[data-row]').first();expect((await cell.boundingBox())!.width).toBeGreaterThanOrEqual(44)
  if(kind==='word-search'&&language==='ar'){
   await region.scrollIntoViewIfNeeded();const bounds=(await region.boundingBox())!,touch=await context.newCDPSession(learn)
   await touch.send('Input.synthesizeScrollGesture',{x:Math.round(bounds.x+bounds.width/2),y:Math.round(bounds.y+bounds.height/2),xDistance:-120,yDistance:-120,gestureSourceType:'touch',speed:600,preventFling:true})
   await expect.poll(()=>region.evaluate(el=>el.scrollLeft>50&&el.scrollTop>50),'a finger gesture inside the letters must pan the large board, not require the narrow frame edge').toBe(true)
   await expect(learn.locator('li[data-found=true]')).toHaveCount(0);await expect(learn.locator('[data-preview=true]')).toHaveCount(0);await touch.detach()
  }
  const before=await region.locator('button[data-row]').evaluateAll(nodes=>nodes.map(node=>[node.getAttribute('data-row'),node.getAttribute('data-column')]))
  for(const [width,height,label] of [[320,800,'320'],[844,390,'landscape'],[768,1024,'tablet']] as const){
   await learn.setViewportSize({width,height});await expect(region).toBeVisible()
   expect((await region.boundingBox())!.height,'large boards keep nearby clue controls reachable').toBeLessThanOrEqual(Math.min(height*.55,440)+1)
   if(kind==='crossword')await expect.poll(()=>region.locator('button[data-active=true]').evaluateAll(nodes=>nodes.every(node=>{const frame=node.closest('[role=region]')!.getBoundingClientRect(),cell=node.getBoundingClientRect();return cell.left>=frame.left&&cell.right<=frame.right&&cell.top>=frame.top&&cell.bottom<=frame.bottom}))).toBe(true)
   expect(await region.locator('button[data-row]').evaluateAll(nodes=>nodes.map(node=>[node.getAttribute('data-row'),node.getAttribute('data-column')]))).toEqual(before)
   await capture(learn,`${kind}-${language}-${label}`)
  }
  await learn.setViewportSize({width:320,height:800})
  expect(await learn.locator('meta[name=viewport]').getAttribute('content')).not.toMatch(/user-scalable=no|maximum-scale=1(?:[, ]|$)/)
  const cdp=await context.newCDPSession(learn);await cdp.send('Emulation.setPageScaleFactor',{pageScaleFactor:2})
  expect(await learn.evaluate(()=>visualViewport?.scale)).toBe(2)
  await cdp.send('Emulation.setPageScaleFactor',{pageScaleFactor:1});await cdp.detach()
  if(kind==='word-search'){
   for(const [index,placement] of board!.placements.entries()){
    const start=placement.cells[0]!,end=placement.cells.at(-1)!,first=region.locator(`button[data-row="${start.row}"][data-column="${start.column}"]`)
    await activate(first,learn,language)
    if(language==='en'){
     if(index===0){await learn.keyboard.press('Escape');await expect(learn.locator('[data-preview=true]')).toHaveCount(0);await activate(first,learn,language)}
     const dr=Math.sign(end.row-start.row),dc=Math.sign(end.column-start.column)
     for(let i=1;i<placement.cells.length;i++){if(dr)await learn.keyboard.press(dr>0?'ArrowDown':'ArrowUp');if(dc)await learn.keyboard.press(dc>0?'ArrowRight':'ArrowLeft')}
     await expect(learn.locator('[data-preview=true]')).toHaveCount(placement.cells.length);await learn.keyboard.press('Enter')
    }else await region.locator(`button[data-row="${end.row}"][data-column="${end.column}"]`).tap()
    await expect(learn.locator('li[data-found=true]')).toHaveCount(index+1)
    if(index===0){await learn.reload();await expect(learn.locator('li[data-found=true]')).toHaveCount(1)}
   }
  }else{
   const first=board!.placements[0]!,other=board!.placements.slice(1).find(p=>p.cells.some(c=>first.cells.some(a=>a.row===c.row&&a.column===c.column)))
   expect(other,'the author-saved layout must contain a real tested intersection').toBeDefined()
   const wrong=language==='ar'?'سسس':'xxx'
   for(const placement of board!.placements){
    const clue=learn.getByRole('button').filter({hasText:placement.clue});await clue.scrollIntoViewIfNeeded()
    const pageScroll=await learn.evaluate(()=>scrollY)
    await activate(clue,learn,language)
    expect(await learn.evaluate(()=>scrollY)).toBe(pageScroll)
    if(language==='en')await expect(clue).toBeFocused()
    const active=region.locator('button[data-active=true]')
    await expect(active).toHaveCount(placement.cells.length)
    await expect.poll(()=>active.evaluateAll(nodes=>nodes.every(node=>{const frame=node.closest('[role=region]')!.getBoundingClientRect(),cell=node.getBoundingClientRect();return cell.left>=frame.left&&cell.right<=frame.right&&cell.top>=frame.top&&cell.bottom<=frame.bottom}))).toBe(true)
    const input=learn.getByRole('textbox',{name:text(language,`Answer to clue ${placement.number}`,`إجابة التلميح ${placement.number}`)})
    await input.fill(placement.entryId===first.entryId?wrong:placement.word)
    expect((await input.boundingBox())!.height).toBeGreaterThanOrEqual(44)
    await expect(learn.getByRole('button',{name:text(language,'Check words','تحقق من الكلمات'),exact:true})).toBeDisabled()
    await activate(learn.getByRole('button',{name:text(language,'Save word','احفظ الكلمة'),exact:true}),learn,language)
    await expect(learn.getByText(text(language,'Not saved yet','تعديل غير محفوظ بعد'),{exact:true})).toHaveCount(0)
   }
   await expect(learn.getByText(text(language,'Some intersection letters disagree. Review your saved words.','تختلف حروف بعض التقاطعات. راجع الكلمات المحفوظة.'),{exact:true})).toBeVisible()
   await activate(learn.getByRole('button',{name:text(language,'Check words','تحقق من الكلمات'),exact:true}),learn,language)
   await expect(learn.getByText(text(language,'Some words need another look. You can edit them and check again.','بعض الكلمات تحتاج مراجعة؛ يمكنك تعديلها والتحقق مجددًا.'),{exact:true})).toBeVisible()
   await capture(learn,`crossword-${language}-wrong-intersection`)
   await learn.reload()
   await activate(learn.getByRole('button').filter({hasText:first.clue}),learn,language)
   const input=learn.getByRole('textbox',{name:text(language,`Answer to clue ${first.number}`,`إجابة التلميح ${first.number}`)})
   await expect(input).toHaveValue(wrong);await input.fill(first.word)
   await activate(learn.getByRole('button',{name:text(language,'Save word','احفظ الكلمة'),exact:true}),learn,language)
   await activate(learn.getByRole('button',{name:text(language,'Check words','تحقق من الكلمات'),exact:true}),learn,language)
  }
  await expect(learn.getByText(text(language,'Board complete. This records word practice, not mastery of the meanings.','اكتملت اللوحة. يُحفظ هذا كتدريب كلمات، وليس دليلًا على فهم المعاني.'),{exact:true})).toBeVisible()
  await learn.reload();await expect(learn.getByText(text(language,'Board complete. This records word practice, not mastery of the meanings.','اكتملت اللوحة. يُحفظ هذا كتدريب كلمات، وليس دليلًا على فهم المعاني.'),{exact:true})).toBeVisible()
  await capture(learn,`${kind}-${language}-complete`)
  await activate(learn.getByRole('button',{name:text(language,'Finish round','إنهاء الجولة'),exact:true}),learn,language)
  await expect(learn.getByRole('heading',{name:text(language,'Round complete','اكتملت الجولة'),exact:true})).toBeVisible();expect(errors).toEqual([])
 }finally{const video=learn.video();await context.close();await video?.saveAs(`../docs/evidence/interactive/recordings/puzzle-${kind}-${language}-320.webm`)}
})

for(const diacritics of ['preserve','ignore'] as const)test(`edited Arabic passage and ${diacritics} policy keep hamza distinct in preview and saved learner answers`,async({page,request,browser})=>{
 test.setTimeout(60000)
 const before='نقرأُ الكلمةَ «',after='» ثم نُفَسِّرُ مَعْنَاهَا.',accepted=diacritics==='ignore'?'أمل':'أَمَل',wrong=diacritics==='ignore'?'امل':'اَمَل'
 const {activityId,questionId,headers}=await prepare(page,request,'ar',{kind:'cloze',prompt:'أكمل الكلمة مع مراعاة قاعدة الإملاء المعتمدة.',payload:{schemaVersion:1,segments:[{kind:'text',text:'كلمة '},{kind:'blank',blankId:'hope'},{kind:'text',text:'.'}],blanks:[{id:'hope',acceptedAnswers:['أَمَل']}],policy:policy('ar'),trimBoundaryWhitespace:true}})
 await page.goto(`/teacher/activities/${activityId}`)
 await page.getByRole('textbox',{name:'جزء النص 1',exact:true}).fill(before)
 await page.getByRole('textbox',{name:'جزء النص 2',exact:true}).fill(after)
 await page.getByText('قواعد الإملاء',{exact:true}).click()
 if(diacritics==='ignore')await page.getByRole('checkbox',{name:'تجاهل الحركات عند المطابقة',exact:true}).check()
 const published=page.waitForResponse(response=>response.url().endsWith(`/activities/${activityId}/publish`)&&response.request().method()==='POST')
 await page.getByRole('button',{name:'اعتماد التغييرات',exact:true}).click();expect((await published).ok()).toBe(true)
 await page.reload();await expect(page.getByRole('textbox',{name:'جزء النص 1',exact:true})).toHaveValue(before);await expect(page.getByRole('textbox',{name:'جزء النص 2',exact:true})).toHaveValue(after)
 const owner=await request.get(`/api/v1/activities/${activityId}`,{headers});expect(owner.ok()).toBe(true)
 const body=await owner.json(),savedQuestion=body.questions.find((item:{id:number})=>item.id===questionId)
 expect(savedQuestion.payload.segments).toEqual([{kind:'text',text:before},{kind:'blank',blankId:'hope'},{kind:'text',text:after}]);expect(savedQuestion.payload.policy.diacritics).toBe(diacritics)
 await page.goto(`/teacher/activities/${activityId}/play?mode=study`);await select(page,'ar','sentence-completion')
 await page.getByRole('button',{name:'معاينة الأسئلة',exact:true}).click()
 const preview=page.getByRole('region',{name:'معاينة العرض',exact:true})
 await expect(preview.getByText(before,{exact:true})).toBeVisible();await expect(preview.getByText(after,{exact:true})).toBeVisible()
 for(const [answer,correct] of [[wrong,false],[accepted,true]] as const){
  await preview.getByRole('textbox',{name:'الفراغ 1',exact:true}).fill(answer)
  await preview.getByRole('button',{name:'إرسال الإجابة',exact:true}).click()
  await expect(preview.locator(`[role=status][data-correct=${correct}]`)).toBeVisible()
  await preview.getByRole('button',{name:'إعادة المعاينة',exact:true}).click()
 }
 const joined=await join(page,browser,'ar')
 try{
  for(const [answer,correct] of [[wrong,false],[accepted,true]] as const){
   const context=correct?await browser.newContext({viewport:{width:320,height:800},hasTouch:true}):joined.context
   let learn=joined.learn
   if(correct){await context.addInitScript(()=>localStorage.setItem('asasera.language','ar'));learn=await context.newPage();await learn.goto(joined.link);await learn.getByRole('textbox',{name:'اسمك'}).fill('متعلم ثانٍ');await learn.getByRole('button',{name:'ابدأ',exact:true}).tap();await learn.getByRole('button',{name:'ابدأ الجولة',exact:true}).tap()}
   try{
    await expect(learn.getByText(before,{exact:true})).toBeVisible();await expect(learn.getByText(after,{exact:true})).toBeVisible()
    const blank=learn.getByRole('textbox',{name:'الفراغ 1',exact:true});await blank.fill(answer)
    const response=learn.waitForResponse(r=>r.url().endsWith('/answer')&&r.request().method()==='POST');await learn.getByRole('button',{name:'إرسال الإجابة',exact:true}).tap()
    const submitted=await response;expect(submitted.ok()).toBe(true);expect((await submitted.json()).reveal.wasCorrect).toBe(correct)
    await learn.reload();await expect(learn.getByRole('textbox',{name:'الفراغ 1',exact:true})).toHaveValue(answer)
    await capture(learn,`cloze-hamza-${diacritics}-${correct?'accepted':'wrong'}-320`)
   }finally{if(correct)await context.close()}
  }
  expect(joined.errors).toEqual([])
 }finally{await joined.context.close()}
})

async function fillTiles(scope:Page|Locator,page:Page,language:Language,graphemes:string[]){
 for(const grapheme of graphemes){
  // The blank-space tile is visibly ␣; accessible names collapse whitespace.
  const label=grapheme===' '?new RegExp(`^${language==='ar'?'إضافة':'Add'}\\s*${language==='ar'?'،':','}`):new RegExp(`^${language==='ar'?'إضافة':'Add'} ${escaped(grapheme)}${language==='ar'?'،':','}`)
  await activate(scope.getByRole('button',{name:label}).first(),page,language)
 }
}
for(const language of ['en','ar'] as const)test(`reviewed phrase ${language}: preserved spaces, repeated graphemes, teacher preview and saved ${language==='ar'?'tap':'keyboard'} response`,async({page,request,browser})=>{
 test.setTimeout(60000)
 const phrase=language==='ar'?'بَاب بَاب':'letter letter',clue=text(language,'A written message, repeated twice with one space','مدخل البيت مرتين وبينهما مسافة واحدة')
 const graphemes=language==='ar'?['بَ','ا','ب',' ','بَ','ا','ب']:['l','e','t','t','e','r',' ','l','e','t','t','e','r']
 await prepare(page,request,language,{kind:'vocabulary',prompt:text(language,'Build the exact reviewed phrase.','كوّن العبارة المعتمدة بحروفها وحركاتها.'),payload:{schemaVersion:1,policy:policy(language),entries:[{id:'phrase',word:phrase,clue}]}})
 await select(page,language,'word-builder')
 await page.getByRole('button',{name:text(language,'Preview questions','معاينة الأسئلة'),exact:true}).click()
 const preview=page.getByRole('region',{name:text(language,'Presentation preview','معاينة العرض'),exact:true})
 await preview.getByText(text(language,'Accepted answers and comparison policy','الإجابات المقبولة وقواعد المقارنة'),{exact:true}).click()
 await expect(preview.getByText(text(language,'Diacritics: preserve · Tatweel: preserve · Spaces: preserve · Case: preserve','التشكيل: محفوظ · التطويل: محفوظ · المسافات: محفوظة · حالة الأحرف: محفوظة'),{exact:true})).toBeVisible()
 // Teacher desktop uses keyboard even for Arabic; the learner below uses touch.
 for(const grapheme of graphemes){const label=grapheme===' '?new RegExp(`^${language==='ar'?'إضافة':'Add'}\\s*${language==='ar'?'،':','}`):new RegExp(`^${language==='ar'?'إضافة':'Add'} ${escaped(grapheme)}${language==='ar'?'،':','}`);const tile=preview.getByRole('button',{name:label}).first();await tile.focus();await page.keyboard.press('Enter')}
 await preview.getByRole('button',{name:text(language,'Submit answer','إرسال الإجابة'),exact:true}).click()
 await expect(preview.getByRole('status').filter({hasText:text(language,'The answer matches the approved content. Preview result only.','الإجابة توافق المحتوى المعتمد. نتيجة معاينة فقط.')})).toBeVisible()
 const {context,learn,errors}=await join(page,browser,language)
 try{
  await expect(learn.getByRole('group',{name:clue,exact:true})).toBeVisible()
  await fillTiles(learn,learn,language,graphemes)
  const saving=learn.waitForResponse(response=>response.request().method()==='POST'&&response.url().endsWith('/answer'))
  await activate(learn.getByRole('button',{name:text(language,'Submit answer','إرسال الإجابة'),exact:true}),learn,language)
  const response=await saving;expect(response.ok(),await response.text()).toBe(true)
  const saved=await response.json();expect(Object.values(response.request().postDataJSON().answer.values)).toEqual([phrase]);expect(saved.reveal.wasCorrect).toBe(true)
  await learn.reload();await expect(learn.getByRole('textbox',{name:clue,exact:true})).toHaveValue(phrase)
  await capture(learn,`phrase-${language}-320-saved`)
  await activate(learn.getByRole('button',{name:text(language,'Finish round','إنهاء الجولة'),exact:true}),learn,language)
  await expect(learn.getByRole('heading',{name:text(language,'Round complete','اكتملت الجولة'),exact:true})).toBeVisible();expect(errors).toEqual([])
 }finally{await context.close()}
})
