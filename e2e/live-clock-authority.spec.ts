import {test,expect,type Page} from '@playwright/test'
import {io,type Socket} from 'socket.io-client'
import type {Reply,SessionSnapshot} from '../src/shared/session'

test('changed client clocks cannot start an unopened box, alter shared thinking time, or extend answer authority',async({page,request,browser})=>{
 test.setTimeout(45000)
 expect(process.env.PW_BASE_URL).toBe('http://127.0.0.1:5411')
 const email=`clock-authority-${crypto.randomUUID()}@example.com`,password='Synthetic clock authority2026!'
 expect((await request.post('/api/v1/auth/register/teacher',{data:{name:'Clock authority fixture',email,password}})).ok()).toBe(true)
 const login=await request.post('/api/v1/auth/login',{data:{email,password}}),{accessToken}=await login.json(),headers={Authorization:`Bearer ${accessToken}`}
 const made=await request.post('/api/v1/activities',{headers,data:{title:'Synthetic server clock authority',subjectId:1,levelId:8,purposeId:2,contentLanguage:'en'}}),{activity}=await made.json()
 const added=await request.post(`/api/v1/activities/${activity.id}/questions`,{headers,data:{kind:'tf',prompt:'The shared clock is authoritative.',timeLimitS:5,payload:{correct:true}}});expect(added.ok()).toBe(true)
 const {question}=await added.json(),published=await request.post(`/api/v1/activities/${activity.id}/publish`,{headers}),{versionId}=await published.json()
 const sockets:Socket[]=[]
 async function connect(token?:string){const socket=io('http://127.0.0.1:5410',{transports:['websocket'],autoConnect:false,reconnection:false,auth:token?{accessToken:token}:{}});sockets.push(socket);await new Promise<void>((resolve,reject)=>{socket.once('connect',resolve);socket.once('connect_error',reject);socket.connect()});return socket}
 async function ask(socket:Socket,event:string,input:unknown){const reply:Reply=await socket.timeout(5000).emitWithAck(event,input);if(!reply.ok)throw Error(`${reply.code}: ${reply.message}`);return reply}
 function watch(surface:Page){const state:{value?:SessionSnapshot}={};const packet=(value:string)=>{if(!/^4[23]\d*\[/.test(value))return;const parts=JSON.parse(value.slice(value.indexOf('[')));if(parts[0]==='session:snapshot')state.value=parts[1];else if(parts[0]?.snapshot)state.value=parts[0].snapshot};surface.on('websocket',socket=>socket.on('framereceived',frame=>packet(String(frame.payload))));surface.on('response',async response=>{if(response.url().includes('/socket.io/')&&response.request().method()==='GET'&&new URL(response.url()).searchParams.get('transport')==='polling')try{(await response.text()).split('\x1e').forEach(packet)}catch{/* Navigation can cancel an empty poll. */}});return state}
 const context=await browser.newContext({baseURL:process.env.PW_BASE_URL,viewport:{width:390,height:844}}),learner=await context.newPage(),hostState=watch(page),learnerState=watch(learner)
 await page.context().addCookies((await request.storageState()).cookies)
 for(const surface of [page,learner])await surface.addInitScript(()=>localStorage.setItem('asasera.language','en'))
 const errors:string[]=[];for(const surface of [page,learner])surface.on('pageerror',error=>errors.push(error.message))
 try{
  const setup=await connect(accessToken),created=await ask(setup,'host:create',{activityId:activity.id,requestId:crypto.randomUUID(),presentation:{selection:{definitionId:'open-box',definitionVersion:1,adapterVersion:1,contentVersionId:versionId,selectedQuestionIds:[question.id],config:{context:'live',semantics:'scored',noRepeat:true,revealPolicy:'host'}},rules:{timing:'timed',thinkTogether:true}}}),runId=created.snapshot!.runId
  setup.disconnect();await page.goto(`/teacher/live/${runId}`)
  await expect(page.getByRole('button',{name:'Open box 1',exact:true})).toBeVisible()
  await learner.goto(`/join?pin=${created.snapshot!.pin}`);await learner.getByLabel('Display name').fill('Future-clock learner');await learner.getByRole('button',{name:'Join class',exact:true}).click()
  await expect.poll(()=>learnerState.value?.self).toBeTruthy()
  const late=await connect();await ask(late,'player:join',{pin:created.snapshot!.pin,name:'Late-answer observer',requestId:crypto.randomUUID()})
  await page.getByRole('button',{name:'Open box 1',exact:true}).click()
  await expect(page.getByRole('button',{name:'Begin question',exact:true})).toBeVisible()
  expect(hostState.value!.presentation!.active!.openedAt).toBeNull();expect(learnerState.value!.question).toBeNull()
  await expect(page.getByRole('timer')).toHaveCount(0);await expect(learner.getByRole('button',{name:'True',exact:true})).toHaveCount(0)
  await new Promise(resolve=>setTimeout(resolve,400))
  // Deliberately change only each browser's wall-clock function, never the server clock.
  await page.evaluate(()=>{const now=Date.now;Date.now=()=>now()-86400000})
  await learner.evaluate(()=>{const now=Date.now;Date.now=()=>now()+86400000})
  const realBegin=Date.now();await page.getByRole('button',{name:'Begin question',exact:true}).click()
  await expect(learner.getByRole('button',{name:'True',exact:true})).toBeEnabled()
  await expect.poll(()=>hostState.value?.state).toBe('question_open')
  const opened=hostState.value!.presentation!.active!,originalDeadline=hostState.value!.endsAt!
  expect(opened.openedAt).toBeGreaterThanOrEqual(realBegin);expect(originalDeadline-opened.openedAt!).toBe(5000)
  await expect.poll(()=>learnerState.value?.endsAt).toBe(originalDeadline)
  await page.getByRole('button',{name:'Think together · 15 seconds',exact:true}).click()
  const deadline=originalDeadline+15000
  await expect.poll(()=>hostState.value?.endsAt).toBe(deadline);await expect.poll(()=>learnerState.value?.endsAt).toBe(deadline)
  expect((await ask(late,'session:sync',{})).snapshot!.endsAt).toBe(deadline)
  await expect(page.getByRole('button',{name:'Think together · 15 seconds',exact:true})).toHaveCount(0)
  const seconds=async(surface:Page)=>Number((await surface.getByRole('timer').getAttribute('aria-label'))!.split(' ')[0])
  expect(Math.abs(await seconds(page)-await seconds(learner))).toBeLessThanOrEqual(1)
  expect(await seconds(learner)).toBeGreaterThan(10)
  await learner.getByRole('button',{name:'True',exact:true}).click()
  await expect(learner.getByRole('heading',{name:'You’re in! Answer saved',exact:true})).toBeVisible()
  await expect.poll(()=>Date.now(),{timeout:25000,intervals:[500]}).toBeGreaterThan(deadline+1000)
  const rejected:Reply=await late.timeout(5000).emitWithAck('player:answer',{runId,requestId:crypto.randomUUID(),qIndex:0,questionId:question.id,payload:{kind:'tf',choice:'true'}})
  expect(rejected.ok).toBe(false)
  await page.getByLabel('Session options',{exact:true}).click();await page.getByRole('button',{name:'End class early',exact:true}).click()
  await expect(page.getByRole('heading',{name:'Class finished',exact:true})).toBeVisible()
  const report=await(await request.get(`/api/v1/reports/runs/${runId}`,{headers})).json()
  expect(report.participants.find((person:{name:string})=>person.name==='Future-clock learner').answered).toBe(1)
  expect(report.participants.find((person:{name:string})=>person.name==='Late-answer observer').answered).toBe(0)
  expect(errors).toEqual([])
  console.log('LIVE_CLOCK_AUTHORITY_EVIDENCE',JSON.stringify({clientWallClockOffsetsMs:[-86400000,86400000],unopenedDelayMs:400,originalWindowMs:5000,extensionMs:15000,identicalDeadlines:true,visibleCountdownDifferenceMaxSeconds:1,lateResponseDenied:true,savedResponses:1}))
 }finally{sockets.forEach(socket=>socket.disconnect());await context.close()}
})
