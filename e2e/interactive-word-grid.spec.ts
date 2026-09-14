import {test,expect} from '@playwright/test'
import type {SavedWordBoard} from '../src/shared/word-boards'
test.use({video:'on'})
for(const language of ['en','ar'] as const)for(const kind of ['word-search','crossword'] as const){
 test(`saved ${kind} learner ${language}`,async({page,request,browser})=>{
  expect(new URL(process.env.PW_BASE_URL??'http://127.0.0.1:5411').hostname).toMatch(/^(127\.0\.0\.1|localhost)$/)
  const ar=language==='ar',width=ar?390:1440,height=ar?844:900,email=`grid-${crypto.randomUUID()}@example.com`,password='Synthetic grid fixture2026!'
  expect((await request.post('/api/v1/auth/register/teacher',{data:{name:'Word instructor',email,password}})).ok()).toBe(true)
  const login=await request.post('/api/v1/auth/login',{data:{email,password}}),{accessToken}=await login.json(),headers={Authorization:`Bearer ${accessToken}`}
  const created=await request.post('/api/v1/activities',{headers,data:{title:ar?'تدريب الكلمات':'Word practice',subjectId:1,levelId:8,purposeId:2}}),{activity}=await created.json()
  const words=ar?['باب','تاب']:['cat','tap'],clues=ar?['مدخل البيت','رجع عن الخطأ']:['A feline','A light touch']
  const added=await request.post(`/api/v1/activities/${activity.id}/questions`,{headers,data:{kind:'vocabulary',prompt:ar?'أكمل لوحة الكلمات.':'Complete the word board.',payload:{schemaVersion:1,policy:{version:1,language,diacritics:'preserve',tatweel:'preserve',case:'ignore',spaces:'preserve'},entries:words.map((word,i)=>({id:`word${i}`,word,clue:clues[i]}))}}})
  expect(added.ok(),await added.text()).toBe(true);const {question}=await added.json()
  const generated=await request.post(`/api/v1/activities/questions/${question.id}/word-board`,{headers,data:{kind,expectedRevision:question.revision,requestId:crypto.randomUUID(),config:{rows:8,columns:8,seed:31}}})
  expect(generated.ok(),await generated.text()).toBe(true);const {board}=await generated.json() as {board:SavedWordBoard};expect(board.status).toBe('ready')
  expect((await request.post(`/api/v1/activities/${activity.id}/publish`,{headers})).ok()).toBe(true)
  await page.context().addCookies((await request.storageState()).cookies)
  await page.addInitScript(lang=>localStorage.setItem('asasera.language',lang),language)
  await page.goto(`/teacher/activities/${activity.id}/play?mode=study`)
  await page.getByRole('radio',{name:kind==='word-search'?(ar?/البحث عن الكلمات/:/Word search/):(ar?/الكلمات المتقاطعة/:/Crossword/)}).check()
  await page.getByRole('button',{name:ar?'أنشئ رابط المشاركة':'Create assignment link'}).click()
  const link=await page.getByRole('textbox',{name:ar?'رابط النشاط':'Assignment link'}).inputValue()
  const context=await browser.newContext({viewport:{width,height},recordVideo:{dir:'../docs/evidence/interactive/recordings',size:{width,height}}})
  await context.addInitScript(lang=>localStorage.setItem('asasera.language',lang),language)
  const learn=await context.newPage(),errors:string[]=[];learn.on('pageerror',e=>errors.push(e.message))
  try{
   await learn.goto(link);await learn.getByRole('textbox',{name:ar?'اسمك':'Your name'}).fill(ar?'طالب كلمات':'Word learner')
   await learn.getByRole('button',{name:ar?'ابدأ':'Start',exact:true}).click()
   await learn.getByRole('button',{name:ar?'ابدأ الجولة':'Start round'}).click()
   await expect(learn.getByRole('region',{name:ar?'لوحة كلمات قابلة للتمرير':'Scrollable word board'})).toBeVisible()
   await learn.screenshot({path:`../docs/evidence/interactive/${kind}-${language}-${width}-start.png`,fullPage:true})
   for(const [index,placement] of board.placements.entries()){
    if(kind==='word-search'){
     const start=placement.cells[0],end=placement.cells.at(-1)!
     const first=learn.locator(`button[data-row="${start.row}"][data-column="${start.column}"]`),last=learn.locator(`button[data-row="${end.row}"][data-column="${end.column}"]`)
     if(index===0&&!ar){
      await first.scrollIntoViewIfNeeded();const a=(await first.boundingBox())!,b=(await last.boundingBox())!
      await learn.mouse.move(a.x+22,a.y+22);await learn.mouse.down();await learn.mouse.move(b.x+22,b.y+22,{steps:12})
      await expect(learn.locator('[data-preview=true]')).toHaveCount(placement.cells.length)
      await learn.screenshot({path:`../docs/evidence/interactive/word-search-${language}-${width}-drag.png`,fullPage:true})
      await learn.mouse.up()
     }else if(index===1){
      await first.focus();await learn.keyboard.press('Enter')
      const dr=Math.sign(end.row-start.row),dc=Math.sign(end.column-start.column)
      for(let step=1;step<placement.cells.length;step++){if(dr)await learn.keyboard.press(dr>0?'ArrowDown':'ArrowUp');if(dc)await learn.keyboard.press(dc>0?'ArrowRight':'ArrowLeft')}
      await expect(learn.locator('[data-preview=true]')).toHaveCount(placement.cells.length)
      await learn.screenshot({path:`../docs/evidence/interactive/word-search-${language}-${width}-keyboard.png`,fullPage:true})
      await learn.keyboard.press('Enter')
     }else{await first.click();await last.click()}
     await expect(learn.locator('li[data-found=true]')).toHaveCount(index+1)
    }else{
     await learn.getByRole('button').filter({hasText:placement.clue}).click()
     const answer=learn.getByRole('textbox',{name:ar?`إجابة التلميح ${placement.number}`:`Answer to clue ${placement.number}`})
     await answer.fill(placement.word)
     await learn.getByRole('button',{name:ar?'احفظ الكلمة':'Save word'}).click()
     await expect(learn.getByText(ar?'تعديل غير محفوظ بعد':'Not saved yet',{exact:true})).toHaveCount(0)
    }
    if(index===0){await learn.reload();await expect(learn.getByRole('region',{name:ar?'لوحة كلمات قابلة للتمرير':'Scrollable word board'})).toBeVisible();if(kind==='word-search')await expect(learn.locator('li[data-found=true]')).toHaveCount(1)}
   }
   if(kind==='crossword')await learn.getByRole('button',{name:ar?'تحقق من الكلمات':'Check words'}).click()
   await expect(learn.getByText(ar?'اكتملت اللوحة. يُحفظ هذا كتدريب كلمات، وليس دليلًا على فهم المعاني.':'Board complete. This records word practice, not mastery of the meanings.',{exact:true})).toBeVisible()
   expect(await learn.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
   await learn.screenshot({path:`../docs/evidence/interactive/${kind}-${language}-${width}-complete.png`,fullPage:true})
   await learn.getByRole('button',{name:ar?'إنهاء الجولة':'Finish round'}).click()
   await expect(learn.getByRole('heading',{name:ar?'اكتملت الجولة':'Round complete'})).toBeVisible()
   expect(errors).toEqual([])
  }finally{const video=learn.video();await context.close();await video?.saveAs(`../docs/evidence/interactive/recordings/${kind}-${language}-${width}.webm`)}
 })
}
