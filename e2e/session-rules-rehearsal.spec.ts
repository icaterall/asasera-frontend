import {test,expect,type Page} from '@playwright/test'
import type {SessionSnapshot} from '../src/shared/session'

function watchSnapshots(page:Page){
 let latest:SessionSnapshot|null=null
 page.on('websocket',socket=>socket.on('framereceived',frame=>{
  const payload=String(frame.payload)
  if(!payload.startsWith('42'))return
  try{const [event,value]=JSON.parse(payload.slice(2));if(event==='session:snapshot')latest=value}catch{/* Other protocol frames are not snapshots. */}
 }))
 return ()=>latest
}

for(const mode of ['class-competition','question-wheel'] as const)test(`actual shared ${mode}: phone rules and teams, two learners, projector and separated report`,async({page,request,browser})=>{
 test.setTimeout(90000)
 expect(new URL(process.env.PW_BASE_URL??'').hostname).toMatch(/^(127\.0\.0\.1|localhost)$/)
 const email=`live-rules-${crypto.randomUUID()}@example.com`,password='Synthetic live rules 2026!'
 expect((await request.post('/api/v1/auth/register/teacher',{data:{name:'Synthetic rules host',email,password}})).ok()).toBe(true)
 const login=await request.post('/api/v1/auth/login',{data:{email,password}}),{accessToken}=await login.json(),headers={authorization:`Bearer ${accessToken}`}
 await page.context().addCookies((await request.storageState()).cookies)
 const made=await request.post('/api/v1/activities',{headers,data:{title:`Synthetic ${mode} rehearsal`,subjectId:1,levelId:8,purposeId:2,contentLanguage:'en'}}),{activity}=await made.json()
 const prompts=['Two plus two equals four.','Three plus three equals six.']
 for(const prompt of prompts)expect((await request.post(`/api/v1/activities/${activity.id}/questions`,{headers,data:{kind:'tf',prompt,timeLimitS:120,payload:{correct:true},challenge:true,hint:'Use the reviewed number pairs.'}})).ok()).toBe(true)
 expect((await request.post(`/api/v1/activities/${activity.id}/publish`,{headers})).ok()).toBe(true)
 await page.setViewportSize({width:390,height:844})
 await page.addInitScript(()=>localStorage.setItem('asasera.language','ar'))
 const hostSnapshot=watchSnapshots(page),errors:string[]=[]
 page.on('pageerror',error=>errors.push(error.message))
 await page.goto(`/teacher/activities/${activity.id}/play?mode=live`)
 await page.getByRole('radio',{name:mode==='class-competition'?/مسابقة الصف/:/عجلة الأسئلة/}).check()
 await page.locator('summary').filter({hasText:'تخصيص الحصة المباشرة'}).click()
 await page.getByRole('checkbox',{name:'احتساب إجابات الطلاب'}).uncheck()
 await page.getByRole('checkbox',{name:'السماح بمحاولة تدريب إضافية'}).check()
 await page.getByRole('checkbox',{name:'استخدام وقت كل سؤال'}).check()
 await page.getByRole('checkbox',{name:'السماح بعرض التلميحات المحفوظة'}).check()
 await page.getByRole('checkbox',{name:'إتاحة 15 ثانية إضافية للتفكير'}).check()
 await expect(page.getByRole('checkbox',{name:'مكافأة الإجابات السريعة'})).not.toBeChecked()
 await page.locator('summary').filter({hasText:'إضافة نقاط لبعض الأسئلة'}).click()
 await page.getByRole('spinbutton',{name:'النقاط الإضافية لكل إجابة صحيحة'}).fill('50')
 for(const prompt of prompts)await page.getByRole('checkbox',{name:new RegExp(prompt.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'))}).check()
 await page.evaluate(async()=>{await document.fonts.ready;scrollTo({top:0,behavior:'instant'});await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())))})
 await page.screenshot({path:`.impeccable/review/live-${mode}-rules-phone-ar.png`,fullPage:true})
 await page.getByRole('button',{name:'ابدأ الحصة المباشرة',exact:true}).click()
 await expect(page).toHaveURL(/\/teacher\/live\/\d+$/)
 const runId=Number(new URL(page.url()).pathname.split('/').at(-1)),pin=await page.locator('strong[dir=ltr]').first().innerText()
 const learners=await Promise.all(['Amal','Badr'].map(async name=>{
  const context=await browser.newContext({baseURL:process.env.PW_BASE_URL,viewport:{width:390,height:844}})
  await context.addInitScript(()=>localStorage.setItem('asasera.language','en'))
  const learner=await context.newPage(),snapshot=watchSnapshots(learner)
  learner.on('pageerror',error=>errors.push(error.message))
  await learner.goto(`/join?pin=${pin}`);await learner.getByLabel('Display name').fill(name);await learner.getByRole('button',{name:'Join class',exact:true}).click()
  await expect(learner.getByText('You are in. Wait for your teacher to start.')).toBeVisible()
  return {context,page:learner,snapshot,name}
 }))
 let projector:Page|undefined
 try{
  await expect.poll(()=>hostSnapshot()?.participants.length).toBe(2)
  await page.getByText('إعداد الفرق',{exact:true}).click()
  await page.getByLabel('اسم الفريق 1').fill('فريق أ')
  await page.getByLabel('اسم الفريق 2').fill('فريق ب')
  for(const [name,team] of [['Amal','فريق أ'],['Badr','فريق ب']]){await page.getByRole('combobox',{name:`فريق ${name}`}).click();await page.getByRole('option',{name:team,exact:true}).click()}
  await page.getByRole('button',{name:'احفظ الفرق',exact:true}).click()
  await expect.poll(()=>hostSnapshot()?.presentation?.teamAssignments?.map(team=>team.participantIds.length)).toEqual([1,1])
  await page.locator('summary[aria-label="خيارات الحصة"]').click()
  const popup=page.waitForEvent('popup')
  await page.getByRole('button',{name:'افتح شاشة العرض',exact:true}).click()
  projector=await popup;const projectorSnapshot=watchSnapshots(projector)
  await projector.setViewportSize({width:1920,height:1080})
  projector.on('pageerror',error=>errors.push(error.message))
  await expect(projector).toHaveURL(/\/projector\/\d+/)
  await expect(projector.getByRole('heading',{name:'لنبدأ معًا'})).toBeVisible()
  await page.getByRole('button',{name:mode==='question-wheel'?'اختر سؤالًا':'اسحب بطاقة',exact:true}).click()
  await expect.poll(()=>hostSnapshot()?.presentation?.active?.status).toBe('selected')
  const selected=hostSnapshot()!.presentation!.active!
  for(const learner of learners){await expect.poll(()=>learner.snapshot()?.presentation?.active?.id).toBe(selected.id);expect(learner.snapshot()?.question).toBeNull()}
  await expect.poll(()=>projectorSnapshot()?.presentation?.active?.id).toBe(selected.id)
  expect(projectorSnapshot()?.question).toBeNull()
  if(mode==='question-wheel'){
   expect(hostSnapshot()?.presentation?.wheel?.spin?.durationMs).toBe(4800)
   await expect(page.getByRole('button',{name:'ابدأ السؤال',exact:true})).toBeDisabled()
   await projector.screenshot({path:'.impeccable/review/live-question-wheel-projector-selected.png',fullPage:true})
   await page.getByRole('button',{name:'ملء الشاشة',exact:true}).last().click()
  }
  await expect(page.getByRole('button',{name:'ابدأ السؤال',exact:true})).toBeEnabled({timeout:8000})
  await page.getByRole('button',{name:'ابدأ السؤال',exact:true}).click()
  await expect.poll(()=>hostSnapshot()?.state).toBe('question_open')
  const opened=hostSnapshot()!,question=opened.question!,deadline=opened.endsAt!
  if(mode==='question-wheel'){
   expect(await page.evaluate(()=>document.fullscreenElement===document.documentElement)).toBe(true)
   await page.getByRole('button',{name:'الخروج من ملء الشاشة',exact:true}).last().click()
  }
  expect(deadline-opened.presentation!.active!.openedAt!).toBe(120000)
  for(const learner of learners){await expect(learner.page.getByRole('heading',{name:question.prompt,exact:true})).toBeVisible();await expect.poll(()=>learner.snapshot()?.endsAt).toBe(deadline)}
  await expect(projector.getByRole('heading',{name:question.prompt,exact:true})).toBeVisible()
  await expect(page.getByText('سؤال تحدٍّ',{exact:true})).toBeVisible()
  await expect(learners[0]!.page.getByText('Correct response: 100 + 50 game points. Learning marks are unchanged.',{exact:true})).toBeVisible()
  await page.getByRole('button',{name:'فكّروا معًا · 15 ثانية',exact:true}).click()
  await expect(page.getByRole('button',{name:'فكّروا معًا · 15 ثانية',exact:true})).toHaveCount(0)
  for(const read of [hostSnapshot,projectorSnapshot,...learners.map(learner=>learner.snapshot)])await expect.poll(()=>read()?.endsAt).toBe(deadline+15000)
  await page.getByRole('button',{name:'أظهر تلميحًا',exact:true}).click()
  for(const target of [page,projector,...learners.map(learner=>learner.page)])await expect(target.getByText('Use the reviewed number pairs.',{exact:true})).toBeVisible()
  await learners[0]!.page.getByRole('button',{name:'False',exact:true}).click()
  await expect(learners[0]!.page.getByRole('heading',{name:'You’re in! Answer saved'})).toBeVisible()
  await learners[0]!.page.getByRole('button',{name:'Try again · practice',exact:true}).click()
  await learners[0]!.page.getByRole('button',{name:'True',exact:true}).click()
  await expect(learners[0]!.page.getByText('Extra practice attempt saved; the first response is unchanged.',{exact:false})).toBeVisible()
  await learners[1]!.page.getByRole('button',{name:'True',exact:true}).click()
  await expect(learners[1]!.page.getByRole('heading',{name:'You’re in! Answer saved'})).toBeVisible()
  await page.getByRole('button',{name:'اكشف الإجابة',exact:true}).click()
  await expect.poll(()=>hostSnapshot()?.state).toBe('revealing')
  const standings=hostSnapshot()!.presentation!.teamStandings
  expect(standings.map(team=>({name:team.name,points:team.points,memberCount:team.memberCount}))).toEqual([{name:'فريق ب',points:150,memberCount:1},{name:'فريق أ',points:0,memberCount:1}])
  await expect(learners[0]!.page.getByRole('heading',{name:'Keep learning',exact:true})).toBeVisible()
  await expect(learners[1]!.page.getByRole('heading',{name:'You got it!',exact:true})).toBeVisible()
  for(const read of [projectorSnapshot,...learners.map(learner=>learner.snapshot)]){await expect.poll(()=>read()?.state).toBe('revealing');expect(JSON.stringify(read())).not.toMatch(/teamAssignments|teamRoster|resumeToken/)}
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await projector.evaluate(()=>scrollTo({top:0,behavior:'instant'}))
  await page.screenshot({path:`.impeccable/review/live-${mode}-host-phone-ar.png`,fullPage:true})
  await projector.screenshot({path:`.impeccable/review/live-${mode}-projector-1920.png`,fullPage:true})
  await learners[0]!.page.screenshot({path:`.impeccable/review/live-${mode}-practice-retry-phone-en.png`,fullPage:true})
  await page.locator('summary[aria-label="خيارات الحصة"]').click()
  await expect(page.getByRole('button',{name:'إنهاء الحصة مبكرًا',exact:true})).toBeVisible()
  await page.getByRole('button',{name:'إنهاء الحصة مبكرًا',exact:true}).click()
  await expect(page.getByRole('heading',{name:'انتهت الحصة',exact:true})).toBeVisible()
  await page.getByRole('link',{name:'افتح تقرير الحصة',exact:true}).click()
  await expect(page.getByRole('table',{name:'دليل الإجابات الأولى'})).toBeVisible()
  await expect(page.getByRole('table',{name:'التكرار والمساعدة في التدريب'})).toBeVisible()
  const firstTable=page.getByRole('table',{name:'دليل الإجابات الأولى'}),repeatTable=page.getByRole('table',{name:'التكرار والمساعدة في التدريب'})
  await expect(firstTable.getByRole('row').filter({hasText:'Amal'}).getByRole('cell').nth(1)).toHaveText('0 من 1')
  await expect(firstTable.getByRole('row').filter({hasText:'Badr'}).getByRole('cell').nth(1)).toHaveText('1 من 1')
  await expect(repeatTable.getByRole('row').filter({hasText:'Amal'}).getByRole('cell').nth(2)).toHaveText('1')
  await expect(repeatTable.getByRole('row').filter({hasText:'Amal'}).getByRole('cell').nth(3)).toHaveText('0')
  await expect(repeatTable.getByRole('row').filter({hasText:'Badr'}).getByRole('cell').nth(3)).toHaveText('150')
  const response=await request.get(`/api/v1/reports/runs/${runId}`,{headers});expect(response.ok()).toBe(true)
  const report=await response.json()
  expect(report.liveEvidence).toMatchObject({semantics:'practice',totals:{firstResponses:2,repeatResponses:0,assistedFirstResponses:2,practiceRetries:1,gamePoints:150}})
  expect(report.questionCount).toBe(1)
  expect(report.questions).toMatchObject([{questionId:question.id,answered:2,correct:1}])
  expect(report.participants.find((person:{name:string})=>person.name==='Amal')).toMatchObject({firstResponses:1,correctCount:0,practiceRetries:1,gamePoints:0})
  expect(report.participants.find((person:{name:string})=>person.name==='Badr')).toMatchObject({firstResponses:1,correctCount:1,practiceRetries:0,gamePoints:150})
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}))
  await page.screenshot({path:`.impeccable/review/live-${mode}-report-phone-ar.png`,fullPage:true})
  for(const table of [firstTable,repeatTable])await table.locator('..').evaluate(element=>{element.scrollLeft=-element.scrollWidth})
  await repeatTable.getByRole('row').filter({hasText:'Badr'}).getByRole('cell').nth(3).scrollIntoViewIfNeeded()
  await expect(repeatTable.getByRole('row').filter({hasText:'Badr'}).getByRole('cell').nth(3)).toBeInViewport()
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}))
  await page.screenshot({path:`.impeccable/review/live-${mode}-report-columns-phone-ar.png`,fullPage:true})
  for(const target of [page,projector,...learners.map(learner=>learner.page)])expect(await target.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
  expect(errors).toEqual([])
 }finally{await projector?.close();for(const learner of learners)await learner.context.close()}
})
