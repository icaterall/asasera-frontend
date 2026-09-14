import {test,expect} from '@playwright/test'
import {createRequire} from 'node:module'
const {Client}=createRequire(import.meta.url)('../../asasera-backend/node_modules/pg')
// Read only this synthetic instructor's isolated board to guarantee a mismatch.
// The real learner still receives no hidden faces, keys or answer map.
async function mismatchPositions(activityId:number,owner:number):Promise<number[]>{
 const client=new Client({host:'127.0.0.1',port:55432,database:'asasera_interactive_browser_test_20260914',user:'postgres',password:'postgres',ssl:false})
 await client.connect()
 try{
  expect((await client.query('SELECT current_database() AS name')).rows[0].name).toBe('asasera_interactive_browser_test_20260914')
  const rows=(await client.query('SELECT t.presentation_state FROM assignment_attempts t JOIN assignments a ON a.id=t.assignment_id JOIN activity_runs r ON r.id=a.run_id WHERE a.host_id=$1 AND r.activity_id=$2',[owner,activityId])).rows
  expect(rows).toHaveLength(1)
  const state=rows[0].presentation_state,cards=state.layouts[String(state.activeIndex)].memory.cards
  return cards.flatMap((card:{side:string},index:number)=>card.side==='card'?[index]:[])
 }finally{await client.end()}
}
test.use({video:'on'})
for(const [language,width,height] of [['en',1440,900],['ar',390,844]] as const){
 test(`native memory instructor and learner ${language}`,async({page,request,browser})=>{
  const origin=process.env.PW_BASE_URL??'http://127.0.0.1:5411'
  expect(new URL(origin).hostname).toMatch(/^(127\.0\.0\.1|localhost)$/)
  const ar=language==='ar',email=`memory-${crypto.randomUUID()}@example.com`,password='Synthetic memory fixture2026!'
  expect((await request.post('/api/v1/auth/register/teacher',{data:{name:'Memory instructor',email,password}})).ok()).toBe(true)
  const login=await request.post('/api/v1/auth/login',{data:{email,password}}),{accessToken,user}=await login.json(),headers={Authorization:`Bearer ${accessToken}`}
  const created=await request.post('/api/v1/activities',{headers,data:{title:ar?'ذاكرة الحيوانات':'Animal memory',subjectId:1,levelId:8,purposeId:2}}),{activity}=await created.json()
  const words=ar?['قط','طائر','ثديي','له ريش']:['Cat','Bird','Mammal','Feathers']
  const pairs:Record<string,string>={[words[0]]:words[2],[words[2]]:words[0],[words[1]]:words[3],[words[3]]:words[1]}
  expect((await request.post(`/api/v1/activities/${activity.id}/questions`,{headers,data:{kind:'match',prompt:ar?'جد الأزواج المتطابقة.':'Find the matching pairs.',payload:{cards:[{key:'a',text:words[0]},{key:'b',text:words[1]}],targets:[{key:'x',text:words[2]},{key:'y',text:words[3]}],map:{a:'x',b:'y'}}}})).ok()).toBe(true)
  expect((await request.post(`/api/v1/activities/${activity.id}/publish`,{headers})).ok()).toBe(true)
  await page.context().addCookies((await request.storageState()).cookies)
  await page.addInitScript(lang=>localStorage.setItem('asasera.language',lang),language)
  await page.setViewportSize({width,height})
  await page.goto(`/teacher/activities/${activity.id}/play?mode=study`)
  await page.getByRole('radio',{name:ar?/الذاكرة/:/Memory/}).check()
  await page.getByRole('button',{name:ar?'أنشئ رابط المشاركة':'Create assignment link'}).click()
  const link=await page.getByRole('textbox',{name:ar?'رابط النشاط':'Assignment link'}).inputValue()
  const context=await browser.newContext({viewport:{width,height},hasTouch:ar,recordVideo:{dir:'../docs/evidence/interactive/recordings',size:{width,height}}})
  await context.addInitScript(lang=>localStorage.setItem('asasera.language',lang),language)
  const learn=await context.newPage(),errors:string[]=[];learn.on('pageerror',error=>errors.push(error.message))
  try{
   await learn.goto(link);await learn.getByRole('textbox',{name:ar?'اسمك':'Your name'}).fill(ar?'طالب ذاكرة':'Memory learner')
   await learn.getByRole('button',{name:ar?'ابدأ':'Start',exact:true}).click()
   await learn.getByRole('button',{name:ar?'ابدأ الجولة':'Start round'}).click()
   const board=learn.getByRole('region',{name:ar?'لوحة الذاكرة':'Memory board'}),cards=board.locator('button[data-state]')
   await expect(cards).toHaveCount(4)
   for(const word of words)await expect(board.getByText(word,{exact:true})).toHaveCount(0)
   await learn.screenshot({path:`../docs/evidence/interactive/memory-${language}-${width}-hidden.png`,fullPage:true})
   const mismatch=await mismatchPositions(activity.id,user.id)
   expect(mismatch).toHaveLength(2)
   for(const index of mismatch){if(ar)await cards.nth(index).tap();else await cards.nth(index).click();await expect(cards.nth(index)).toHaveAttribute('data-state','revealed')}
   const closePair=board.getByRole('button',{name:ar?'اقلب البطاقتين':'Turn cards over'})
   await expect(closePair).toBeVisible()
   // Reading time is deliberately longer than the flip duration; no timer may
   // clear this state or accept a third unmatched card.
   await learn.waitForTimeout(1800)
   await expect(cards.locator('..').locator('button[data-state=revealed]')).toHaveCount(2)
   for(const index of [0,1,2,3].filter(i=>!mismatch.includes(i)))await expect(cards.nth(index)).toBeDisabled()
   await learn.screenshot({path:`../docs/evidence/interactive/memory-${language}-${width}-mismatch.png`,fullPage:true})
   await closePair.focus();await learn.keyboard.press('Enter')
   await expect(closePair).toHaveCount(0)
   await expect.poll(()=>learn.evaluate(()=>document.activeElement?.getAttribute('data-state'))).toBe('hidden')
   const known=new Map<number,string>()
   let reloaded=false
   for(let step=0;step<40;step++){
    const status=await cards.evaluateAll(elements=>elements.map(el=>({state:el.getAttribute('data-state'),text:el.querySelector('[dir=auto]')?.textContent??''})))
    status.forEach((card,index)=>{if(card.text)known.set(index,card.text)})
    if(status.every(card=>card.state==='matched'))break
    const continued=board.getByRole('button',{name:ar?'اقلب البطاقتين':'Turn cards over'})
    if(await continued.isVisible()){await continued.focus();await learn.keyboard.press('Enter');await expect(continued).toHaveCount(0);await expect.poll(()=>learn.evaluate(()=>document.activeElement?.getAttribute('data-state'))).toBe('hidden');continue}
    const shown=status.findIndex(card=>card.state==='revealed'),hidden=status.flatMap((card,index)=>card.state==='hidden'?[index]:[])
    const next=shown>=0?hidden.find(index=>known.get(index)===pairs[status[shown].text])??hidden.find(index=>!known.has(index))??hidden[0]:hidden.find(index=>known.has(index)&&hidden.some(other=>known.get(other)===pairs[known.get(index)!]))??hidden[0]
    await cards.nth(next).click()
    await expect(cards.nth(next)).not.toHaveAttribute('data-state','hidden')
    if(!reloaded){const label=await cards.nth(next).getAttribute('aria-label');await learn.reload();await expect(cards.nth(next)).toHaveAttribute('aria-label',label!);reloaded=true}
   }
   await expect(board.getByText(ar?'وجدت جميع الأزواج. هذا تدريب ذاكرة وليس درجة اختبار.':'All pairs found. This is memory practice, not a test grade.',{exact:true})).toBeVisible()
   expect(await learn.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
   await learn.screenshot({path:`../docs/evidence/interactive/memory-${language}-${width}-matched.png`,fullPage:true})
   await learn.getByRole('button',{name:ar?'إنهاء الجولة':'Finish round'}).click()
   await expect(learn.getByRole('heading',{name:ar?'اكتملت الجولة':'Round complete'})).toBeVisible()
   expect(errors).toEqual([])
  }finally{const video=learn.video();await context.close();await video?.saveAs(`../docs/evidence/interactive/recordings/memory-${language}-${width}.webm`)}
 })
}
