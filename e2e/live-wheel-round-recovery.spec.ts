import {test,expect,type Page} from '@playwright/test'
import {io,type Socket} from 'socket.io-client'
import type {Reply,SessionSnapshot} from '../src/shared/session'

// Actual local API, sockets and browser pages; no route interception or fabricated snapshots.
for(const [language,width,height,reduced] of [['en',1440,900,false],['ar',844,390,true]] as const)test(`shared wheel private pass and recovery ${language} ${width} reduced=${reduced}`,async({page,request,browser})=>{
 test.setTimeout(60000)
 expect(new URL(process.env.PW_BASE_URL??'http://127.0.0.1:5411').hostname).toMatch(/^(localhost|127\.0\.0\.1)$/)
 const ar=language==='ar',email=`live-round-${crypto.randomUUID()}@example.com`,password='Synthetic round recovery2026!'
 expect((await request.post('/api/v1/auth/register/teacher',{data:{name:'Round recovery fixture',email,password}})).ok()).toBe(true)
 const login=await request.post('/api/v1/auth/login',{data:{email,password}}),{accessToken}=await login.json(),headers={Authorization:`Bearer ${accessToken}`}
 const created=await request.post('/api/v1/activities',{headers,data:{title:ar?'حصة الاختيار المحفوظ':'Saved classroom selection',subjectId:1,levelId:8,purposeId:2,contentLanguage:language}}),{activity}=await created.json()
 for(const prompt of ar?['الأرض كوكب.','القمر تابع للأرض.']:['Earth is a planet.','The moon is Earth’s satellite.'])expect((await request.post(`/api/v1/activities/${activity.id}/questions`,{headers,data:{kind:'tf',prompt,timeLimitS:120,payload:{correct:true}}})).ok()).toBe(true)
 expect((await request.post(`/api/v1/activities/${activity.id}/publish`,{headers})).ok()).toBe(true)
 await page.context().addCookies((await request.storageState()).cookies)
 await page.addInitScript(lang=>localStorage.setItem('asasera.language',lang),language)
 await page.setViewportSize({width,height});await page.emulateMedia({reducedMotion:reduced?'reduce':'no-preference'})
 let current:SessionSnapshot|undefined
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message))
 function snapshots(surface:Page,accept:(state:SessionSnapshot)=>void){
  const packet=(value:string)=>{if(!/^4[23]\d*\[/.test(value))return;const parts=JSON.parse(value.slice(value.indexOf('[')));if(parts[0]==='session:snapshot')accept(parts[1]);else if(parts[0]?.snapshot)accept(parts[0].snapshot)}
  surface.on('websocket',socket=>socket.on('framereceived',frame=>packet(String(frame.payload))))
  // Socket.IO's initial ACK may arrive over polling before its WebSocket upgrade.
  surface.on('response',async response=>{if(response.url().includes('/socket.io/')&&response.request().method()==='GET'&&new URL(response.url()).searchParams.get('transport')==='polling')try{(await response.text()).split('\x1e').forEach(packet)}catch{/* A replaced document can cancel an empty polling response. */}})
 }
 snapshots(page,state=>{current=state})
 const sockets:Socket[]=[],context=await browser.newContext({baseURL:process.env.PW_BASE_URL??'http://127.0.0.1:5411',viewport:{width:390,height:844}})
 await context.addInitScript(lang=>localStorage.setItem('asasera.language',lang),language)
 const learner=await context.newPage();let learnerState:SessionSnapshot|undefined,projectorState:SessionSnapshot|undefined
 snapshots(learner,state=>{learnerState=state})
 try{
  await page.goto(`/teacher/live/new?activityId=${activity.id}&request=${crypto.randomUUID()}`)
  await expect(page.getByRole('button',{name:ar?'ابدأ الحصة':'Start class',exact:true})).toBeVisible()
  await expect.poll(()=>current?.pin).toBeTruthy()
  await learner.goto(`/join?pin=${current!.pin}`)
  await learner.getByLabel(ar?'اسمك في الحصة':'Display name').fill(ar?'مريم':'Mariam')
  await learner.getByRole('button',{name:ar?'انضم':'Join class',exact:true}).click()
  await expect.poll(()=>learnerState?.self).toBeTruthy()
  for(const name of ar?['أحمد','سارة']:['Ahmed','Sara']){
   const socket=io('http://127.0.0.1:5410',{transports:['websocket'],autoConnect:false,reconnection:false});sockets.push(socket)
   await new Promise<void>((resolve,reject)=>{socket.once('connect',resolve);socket.once('connect_error',reject);socket.connect()})
   const reply:Reply=await socket.timeout(5000).emitWithAck('player:join',{pin:current!.pin,name,requestId:crypto.randomUUID()});expect(reply.ok).toBe(true)
  }
  await expect.poll(()=>current?.participants.length).toBe(3)
  await page.getByLabel(ar?'خيارات الحصة':'Session options',{exact:true}).click()
  page.context().once('page',opened=>snapshots(opened,state=>{projectorState=state}))
  const popup=page.waitForEvent('popup');await page.getByRole('button',{name:ar?'افتح شاشة العرض':'Open projector',exact:true}).click()
  const projector=await popup;await projector.setViewportSize({width:1920,height:1080})
  // The opener-null capability tab may navigate before Playwright attaches its network target.
  // Wait for its real first connection, then reload using its already-retained projector capability.
  await expect(projector.locator('[data-connected=true]')).toBeVisible()
  snapshots(projector,state=>{projectorState=state});await projector.reload()
  await expect.poll(()=>projectorState?.runId).toBe(current!.runId)
  await page.getByRole('button',{name:ar?'العجلة العشوائية':'Random wheel',exact:true}).click()
  await page.getByRole('button',{name:ar?'أدر العجلة':'Spin the wheel',exact:true}).click()
  await expect.poll(()=>current?.wheel?.spin?.id).toBeTruthy()
  const original=structuredClone(current!.wheel!.spin!)
  if(!reduced){
   await expect(page.locator('[data-random-wheel]')).toHaveAttribute('data-wheel-state','spinning')
   await learner.getByRole('button',{name:'Skip animation',exact:true}).click()
   await expect(learner.locator('[data-random-wheel]')).toHaveAttribute('data-wheel-state','selected')
   expect(learnerState!.wheel!.spin!.id).toBe(original.id)
   const cdp=await page.context().newCDPSession(page)
   // Renderer suspension is verified separately from OS background visibility. This harness
   // continues reporting visible even with its window minimized; do not fake document.hidden.
   await cdp.send('Page.setWebLifecycleState',{state:'frozen'})
   await new Promise(resolve=>setTimeout(resolve,2700))
   await cdp.send('Page.setWebLifecycleState',{state:'active'})
   await cdp.detach()
   await page.bringToFront()
  }
  await expect(page.locator('[data-random-wheel]')).toHaveAttribute('data-wheel-state','selected')
  expect(current!.wheel!.spin).toEqual(original)
  const privateControls=page.getByRole('region',{name:ar?'اختيارات خاصة بالمعلّم':'Private teacher selections'})
  const selected=original.entries[original.winnerIndex]!
  await privateControls.getByRole('button',{name:ar?`تجاوز ${selected.label} الآن`:`Pass ${selected.label} for now`,exact:true}).click()
  await expect.poll(()=>current?.wheelRound?.passedIds).toEqual([selected.id])
  await expect.poll(()=>projectorState?.wheelRound).toBeNull();await expect.poll(()=>learnerState?.wheelRound).toBeNull()
  expect(projectorState!.wheel!.spin).toEqual(original);expect(learnerState!.wheel!.spin).toEqual(original)
  await expect(projector.getByRole('region',{name:ar?'اختيارات خاصة بالمعلّم':'Private teacher selections'})).toHaveCount(0)
  await expect(learner.getByRole('button',{name:ar?'تجاوز الآن':'Pass for now',exact:true})).toHaveCount(0)
  await page.context().setOffline(true)
  await expect(page.locator('[data-connected=false]')).toBeVisible()
  await page.context().setOffline(false);await page.reload()
  await expect(privateControls.getByRole('button',{name:ar?`إعادة ${selected.label} إلى هذه الجولة`:`Restore ${selected.label} to this round`,exact:true})).toBeVisible({timeout:15000})
  expect(current!.wheel!.spin).toEqual(original);expect(current!.wheelRound!.history.map(event=>event.action)).toEqual(['selected','passed'])
  await privateControls.getByRole('button',{name:ar?`إعادة ${selected.label} إلى هذه الجولة`:`Restore ${selected.label} to this round`,exact:true}).click()
  await expect.poll(()=>current?.wheelRound?.history.at(-1)?.action).toBe('restored')
  expect(current!.wheel!.spin).toEqual(original);expect(current!.wheelRound!.passedIds).toEqual([])
  await privateControls.getByText(ar?'سجل الاختيار · الجولة 1':'Selection history · round 1',{exact:true}).click()
  await expect(privateControls.getByText(ar?'الجولة 1 · أُعيد إلى الجولة':'Round 1 · Restored to the round',{exact:true})).toBeVisible()
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
  await privateControls.screenshot({path:`../docs/evidence/interactive/live-wheel-round-${language}-private.png`})
  await page.screenshot({path:`../docs/evidence/interactive/live-wheel-round-${language}-${width}.png`,fullPage:true})
  await projector.screenshot({path:`../docs/evidence/interactive/live-wheel-round-${language}-projector1920.png`,fullPage:true})
  await privateControls.getByRole('button',{name:ar?'ابدأ الجولة التالية':'Start next round',exact:true}).click()
  await expect.poll(()=>current?.wheelRound?.round).toBe(2)
  expect(current!.wheelRound!.history.at(-1)!.action).toBe('new-round')
  await page.getByRole('button',{name:ar?'العودة للحصة':'Back to class',exact:true}).click()
  await page.getByRole('button',{name:ar?'ابدأ الحصة':'Start class',exact:true}).click()
  await learner.getByRole('button',{name:ar?'صح':'True',exact:true}).click()
  await expect.poll(()=>learnerState?.self?.answered).toBe(true)
  await page.getByRole('button',{name:ar?'اكشف الإجابة':'Reveal answer',exact:true}).click()
  await page.getByRole('button',{name:ar?'السؤال التالي':'Next question',exact:true}).click()
  await expect.poll(()=>current?.question?.qIndex).toBe(1)
  await page.getByLabel(ar?'خيارات الحصة':'Session options',{exact:true}).click()
  await page.getByRole('button',{name:ar?'إنهاء الحصة مبكرًا':'End class early',exact:true}).click()
  await expect(page.getByRole('heading',{name:ar?'انتهت الحصة':'Class finished',exact:true})).toBeVisible()
  const report=await(await request.get(`/api/v1/reports/runs/${current!.runId}`,{headers})).json()
  expect(report.participants.find((person:{id:string})=>person.id===learnerState!.self!.participantId).answered).toBe(1)
  expect(errors).toEqual([])
  console.log('LIVE_WHEEL_BROWSER_EVIDENCE',JSON.stringify({language,width,height,reduced,learnerSkippedMotion:!reduced,actualBackground:false,rendererFrozenMs:reduced?0:2700,hostOfflineReload:true,privateHistory:true,round:2,firstResponseRetained:true,projector:{width:1920,height:1080},selectedId:selected.id}))
 }finally{sockets.forEach(socket=>socket.disconnect());await context.close()}
})
