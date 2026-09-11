import {test,expect,type Locator,type Page} from '@playwright/test'
import {readFileSync,mkdirSync} from 'node:fs'
test('teacher assigns, learner resumes and completes all question types, feedback waits until closure',async({page,browser})=>{
 test.setTimeout(90_000)
 const fixture=JSON.parse(readFileSync('/tmp/asasera-delivery-browser-fixture.json','utf8'))
 await page.addInitScript(()=>localStorage.setItem('asasera.language','en'))
 const login=await page.request.post('/api/v1/auth/login',{data:{email:fixture.email,password:fixture.password}});expect(login.ok()).toBe(true)
 const {accessToken}=await login.json(),headers={authorization:`Bearer ${accessToken}`}
 await page.setViewportSize({width:1440,height:900});await page.goto(`/teacher/activities/${fixture.activityId}/play`)
 await page.getByRole('radio',{name:/Assign homework/}).check()
 await page.screenshot({path:'../screenshots/v4/delivery-setup-1440.png',fullPage:true})
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'../screenshots/v4/delivery-setup-390.png',fullPage:true})
 await page.getByRole('button',{name:'Create assignment link',exact:true}).click()
 const link=await page.getByLabel('Assignment link',{exact:true}).inputValue();expect(link).toContain('/learn/')
 const assignmentId=new URL(link).pathname.split('/').at(-1)!
 const context=await browser.newContext({viewport:{width:390,height:844}})
 const student=await context.newPage();await context.addInitScript(()=>localStorage.setItem('asasera.language','en'))
 const responses:unknown[]=[]
 student.on('response',async r=>{if(r.url().includes('/delivery/attempts/')&&r.status()===200)responses.push(await r.json())})
 try{
  await student.goto(link);await student.getByLabel('Your name',{exact:true}).fill('Synthetic learner');await student.getByRole('button',{name:'Start',exact:true}).click()
  await expect(student.getByRole('heading',{name:'Synthetic mcq',exact:true})).toBeVisible()
  await student.screenshot({path:'../screenshots/v4/homework-question-390.png',fullPage:true})
  await student.getByRole('button',{name:'a',exact:true}).click();await expect(student.getByRole('button',{name:'Next',exact:true})).toBeVisible()
  await student.reload();await expect(student.getByRole('button',{name:'Next',exact:true})).toBeVisible();await student.getByRole('button',{name:'Next',exact:true}).click()
  await student.getByRole('button',{name:'True',exact:true}).click();await student.getByRole('button',{name:'Next',exact:true}).click()
  const first=student.locator('li[class*=orderItem]').first();if((await first.innerText()).includes('Two'))await student.getByRole('button',{name:'Move up / للأعلى One',exact:true}).press('Enter')
  await student.getByRole('button',{name:'Submit order',exact:true}).click();await student.getByRole('button',{name:'Next',exact:true}).click()
  await student.getByRole('button',{name:'One',exact:true}).press('Enter');await student.getByRole('button',{name:'A',exact:true}).press('Enter')
  await student.getByRole('button',{name:'Two',exact:true}).press('Enter');await student.getByRole('button',{name:'B',exact:true}).press('Enter')
  await student.getByRole('button',{name:'Submit answer',exact:true}).click();await student.getByRole('button',{name:'Next',exact:true}).click()
  await student.getByRole('button',{name:'Zone 1',exact:true}).press('Enter');await student.getByRole('button',{name:'Submit answer',exact:true}).click();await student.getByRole('button',{name:'Next',exact:true}).click()
  await student.getByRole('button',{name:'One',exact:true}).click();await student.getByRole('button',{name:'Zone 1',exact:true}).click()
  await student.getByRole('button',{name:'Two',exact:true}).click();await student.getByRole('button',{name:'Zone 2',exact:true}).click()
  await student.getByRole('button',{name:'Submit answer',exact:true}).click();await student.getByRole('button',{name:'Submit activity',exact:true}).click()
  await expect(student.getByRole('heading',{name:'Activity submitted!',exact:true})).toBeVisible()
  for(const value of responses){const r=value as {feedbackAvailable:boolean;score:number|null;correctCount:number|null;review:unknown[];question?:unknown};expect(r.feedbackAvailable).toBe(false);expect(r.score).toBeNull();expect(r.correctCount).toBeNull();expect(r.review).toEqual([]);expect(JSON.stringify(r)).not.toContain('PRIVATE_DELIVERY_REASON')}
  await expect(student.getByRole('dialog')).toHaveCount(0)
  const closed=await page.request.post(`/api/v1/delivery/assignments/${assignmentId}/close`,{headers});expect(closed.ok()).toBe(true);const {runId}=await closed.json()
  await student.reload();await expect(student.getByText('6 correct out of 6',{exact:true})).toBeVisible()
  await student.getByRole('button',{name:'العربية',exact:true}).click();await expect(student.locator('main')).toHaveAttribute('dir','rtl')
  expect(await student.evaluate(()=>innerWidth)).toBe(390);expect(await student.evaluate(()=>document.documentElement.scrollWidth)).toBe(390)
  const badges=await student.locator('span[class*=mark]').evaluateAll(elements=>elements.map(el=>{const r=el.getBoundingClientRect();const p=el.parentElement!.getBoundingClientRect();return {left:r.left,right:r.right,parentLeft:p.left,parentRight:p.right,size:parseFloat(getComputedStyle(el).fontSize)}}))
  expect(badges.every(b=>b.left>=b.parentLeft&&b.right<=b.parentRight&&b.size<=16)).toBe(true)
  await student.screenshot({path:'../screenshots/v4/homework-review-390-ar.png',fullPage:true,animations:'disabled'})
  const report=await(await page.request.get(`/api/v1/reports/runs/${runId}`,{headers})).json();expect(report.participants[0].correctCount).toBe(6);expect(report.participants[0].status).toBe('submitted')
  await student.getByRole('button',{name:'خروج من جهاز مشترك',exact:true}).click();await expect(student.getByRole('dialog',{name:'إزالة مفتاح الاستئناف؟',exact:true})).toBeVisible();await student.getByRole('button',{name:'أزل المفتاح واخرج',exact:true}).click();expect(await student.evaluate(id=>localStorage.getItem(`asasera:assignment:${id}`),assignmentId)).toBeNull()
 }finally{await context.close()}
})

/* ── v5.1 C2: the availability window and the attempt limit, end to end ──────────────────────────
   The teacher names a zone and allows two attempts; a guest submits, retries once, and is refused a
   third. Every refusal comes from the server — the browser only renders what it is told. */
const EVIDENCE=process.env.C2_EVIDENCE_DIR??'../screenshots/v51/assign'
const shot=(target:Page,name:string)=>target.screenshot({path:`${EVIDENCE}/${name}.png`,fullPage:true,animations:'disabled'})
/** Choose in the same combobox a person uses; the search box keeps a long zone list manageable. */
async function choose(page:Page,control:Locator,value:string,search?:string){
 await control.first().click()
 if(search)await page.getByRole('combobox',{name:/Search options|ابحث في الخيارات/}).fill(search)
 await page.locator(`[role="option"][data-option-value=${JSON.stringify(value)}]:visible`).click()
 await expect(control.first()).toHaveAttribute('data-select-value',value)
}
test('a zoned assignment with two attempts: the guest submits, retries once, and is refused a third',async({page,browser})=>{
 test.setTimeout(180_000)
 mkdirSync(EVIDENCE,{recursive:true})
 const fixture=JSON.parse(readFileSync('/tmp/asasera-delivery-browser-fixture.json','utf8'))
 const login=await page.request.post('/api/v1/auth/login',{data:{email:fixture.email,password:fixture.password}});expect(login.ok()).toBe(true)
 const {accessToken}=await login.json(),headers={authorization:`Bearer ${accessToken}`}
 // A two-question activity of its own, so the retry journey stays inside one screen of interactions.
 const made=await page.request.post('/api/v1/activities',{headers,data:{title:'Two attempts at shapes',subjectId:1,levelId:8,purposeId:2}})
 expect(made.ok()).toBe(true);const activityId=(await made.json()).activity.id
 for(const q of [{kind:'mcq',prompt:'Pick a',payload:{options:['a','b','c','d'].map(key=>({key,text:key})),correct:'a'}},{kind:'tf',prompt:'True or false',payload:{correct:true}}])
  expect((await page.request.post(`/api/v1/activities/${activityId}/questions`,{headers,data:q})).ok()).toBe(true)
 expect((await page.request.post(`/api/v1/activities/${activityId}/publish`,{headers})).ok()).toBe(true)

 const fill=async()=>{
  await choose(page,page.getByLabel(/Time zone|المنطقة الزمنية/),'Asia/Muscat','Muscat')
  await choose(page,page.getByLabel(/Attempts allowed|عدد المحاولات المسموح بها/),'2')
  await expect(page.locator('[data-resolved-window]')).toContainText('UTC')
 }
 for(const language of ['en','ar'] as const){
  await page.addInitScript(lang=>localStorage.setItem('asasera.language',lang),language)
  await page.goto(`/teacher/activities/${activityId}/play?mode=homework`)
  await fill()
  await page.setViewportSize({width:1280,height:900});await shot(page,`teacher-window-1280-${language}`)
  await page.setViewportSize({width:390,height:844});await shot(page,`teacher-window-390-${language}`)
 }
 // The link is created from the Arabic form; the resolved instant the SERVER stored is shown back.
 await page.setViewportSize({width:1280,height:900})
 await page.getByRole('button',{name:'أنشئ رابط المشاركة',exact:true}).click()
 await expect(page.locator('[data-created-window]')).toContainText('Asia/Muscat')
 await expect(page.locator('[data-created-window]')).toContainText('2')
 const link=await page.getByLabel('رابط النشاط',{exact:true}).inputValue();expect(link).toContain('/learn/')
 const assignmentId=new URL(link).pathname.split('/').at(-1)!
 await shot(page,'teacher-created-1280-ar')

 const context=await browser.newContext({viewport:{width:390,height:844}})
 await context.addInitScript(()=>localStorage.setItem('asasera.language','en'))
 const student=await context.newPage()
 const attempt=async(name?:string)=>{
  if(name){await student.getByLabel('Your name',{exact:true}).fill(name);await student.getByRole('button',{name:'Start',exact:true}).click()}
  await student.getByRole('button',{name:'a',exact:true}).click()
  await student.getByRole('button',{name:'Next',exact:true}).click()
  await student.getByRole('button',{name:'True',exact:true}).click()
  await student.getByRole('button',{name:'Submit activity',exact:true}).click()
  await expect(student.getByRole('heading',{name:'Activity submitted!',exact:true})).toBeVisible()
 }
 const bothLanguages=async(prefix:string)=>{
  for(const width of [390,1280]){
   await student.setViewportSize({width,height:width===390?844:900})
   await shot(student,`${prefix}-${width}-en`)
   await student.getByRole('button',{name:'العربية',exact:true}).click()
   await expect(student.locator('main')).toHaveAttribute('dir','rtl')
   await shot(student,`${prefix}-${width}-ar`)
   await student.getByRole('button',{name:'English',exact:true}).click()
   await expect(student.locator('main')).toHaveAttribute('dir','ltr')
  }
  await student.setViewportSize({width:390,height:844})
 }
 try{
  await student.goto(link)
  await attempt('Synthetic learner')
  // Attempt 1 of 2 is spent; the offer names the attempt it is about to start.
  await expect(student.getByRole('button',{name:'Try again (2 of 2)',exact:true})).toBeVisible()
  await expect(student.locator('[data-attempts-left]')).toContainText('1 of 2 attempts left')
  await expect(student.locator('[data-attempts-left]')).toContainText('browser-storage identity')
  // A submitted attempt shows no question — and no leftover heading from the ones already answered.
  await expect(student.locator('[data-question-surface]')).toHaveCount(0)
  await bothLanguages('learner-retry-offered')
  const before=await student.evaluate(id=>localStorage.getItem(`asasera:assignment:${id}`),assignmentId)
  await student.getByRole('button',{name:'Try again (2 of 2)',exact:true}).click()
  await expect(student.locator('[data-attempt-counter]')).toHaveText('Attempt 2 of 2')
  expect(await student.evaluate(id=>localStorage.getItem(`asasera:assignment:${id}`),assignmentId)).not.toBe(before)
  await attempt()
  // Attempt 2 of 2 is spent: no third offer anywhere on the page, and the server says so too.
  await expect(student.getByRole('button',{name:/Try again/})).toHaveCount(0)
  await expect(student.locator('[data-attempts-exhausted]')).toContainText('all 2 attempts')
  await bothLanguages('learner-limit-reached')
  const saved=JSON.parse(await student.evaluate(id=>localStorage.getItem(`asasera:assignment:${id}`),assignmentId)??'{}')
  const refused=await student.request.post(`/api/v1/delivery/attempts/${saved.attemptId}/retry`,{data:{token:saved.token,requestId:crypto.randomUUID()}})
  expect(refused.status()).toBe(409);expect((await refused.json()).error?.code??(await refused.json()).code).toBe('attempts_exhausted')
  // Exactly two attempt rows exist for this identity — the browser could not talk the server into a third.
  const report=await(await page.request.get(`/api/v1/delivery/assignments`,{headers})).json()
  expect(report.assignments.find((a:{id:string})=>a.id===assignmentId)).toMatchObject({maxAttempts:2,deadlineTz:'Asia/Muscat',windowState:'open',attempts:2,submitted:2})
 }finally{await context.close()}
})

test('an assignment that has not opened yet tells the learner when it does, in its own zone',async({page,browser})=>{
 test.setTimeout(120_000)
 mkdirSync(EVIDENCE,{recursive:true})
 const fixture=JSON.parse(readFileSync('/tmp/asasera-delivery-browser-fixture.json','utf8'))
 const login=await page.request.post('/api/v1/auth/login',{data:{email:fixture.email,password:fixture.password}});expect(login.ok()).toBe(true)
 const {accessToken}=await login.json(),headers={authorization:`Bearer ${accessToken}`}
 const wall=(days:number)=>new Date(Date.now()+days*86400000).toISOString().slice(0,11)+'09:00'
 // Wall-clock times in a zone that is not this machine's, so the learner sees a real conversion.
 const created=await page.request.post('/api/v1/delivery/assignments',{headers,data:{activityId:fixture.activityId,mode:'homework',feedback:'after_deadline',classId:null,
  deadlineLocal:wall(8),opensAtLocal:wall(1),deadlineTz:'Europe/London',maxAttempts:3,requestId:crypto.randomUUID()}})
 expect(created.status()).toBe(201)
 const body=await created.json();expect(body.windowState).toBe('scheduled');expect(body.deadlineTz).toBe('Europe/London')
 // The server refuses a join before the opening instant and says when it opens.
 const early=await page.request.post(`/api/v1/delivery/assignments/${body.id}/join`,{data:{accessToken:body.accessToken,name:'Too early',requestId:crypto.randomUUID()}})
 expect(early.status()).toBe(409)
 const refusal=await early.json();expect(refusal.error?.code??refusal.code).toBe('assignment_not_open')
 expect(refusal.error?.details?.opensAt??refusal.details?.opensAt).toBe(body.opensAt)

 const context=await browser.newContext({viewport:{width:390,height:844}})
 await context.addInitScript(()=>localStorage.setItem('asasera.language','en'))
 const student=await context.newPage()
 try{
  await student.goto(`/learn/${body.id}#${body.accessToken}`)
  await expect(student.locator('[data-opens-later]')).toBeVisible()
  await expect(student.locator('[data-opens-later]')).toContainText('Europe/London')
  // No way in: the name form is not offered at all.
  await expect(student.getByLabel('Your name',{exact:true})).toHaveCount(0)
  for(const width of [390,1280]){
   await student.setViewportSize({width,height:width===390?844:900})
   await shot(student,`learner-opens-later-${width}-en`)
   await student.getByRole('button',{name:'العربية',exact:true}).click();await expect(student.locator('main')).toHaveAttribute('dir','rtl')
   await shot(student,`learner-opens-later-${width}-ar`)
   await student.getByRole('button',{name:'English',exact:true}).click();await expect(student.locator('main')).toHaveAttribute('dir','ltr')
  }
 }finally{await context.close()}
 // The teacher's list carries the same window: state, opening time and zone.
 for(const [language,label] of [['en','Not open yet'],['ar','لم يفتح بعد']] as const){
  await page.addInitScript(lang=>localStorage.setItem('asasera.language',lang),language)
  await page.goto('/teacher/assignments')
  const row=page.locator(`[data-window]:has-text(${JSON.stringify(label)})`).first()
  await expect(row).toContainText('Europe/London')
  await expect(row).toContainText(language==='en'?'3 attempts':'3 محاولات')
  await page.setViewportSize({width:1280,height:900});await shot(page,`teacher-list-1280-${language}`)
  await page.setViewportSize({width:390,height:844});await shot(page,`teacher-list-390-${language}`)
 }
})
