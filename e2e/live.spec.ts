import {localTeacher} from './local-fixture'
import {test,expect} from '@playwright/test'
import {mkdirSync,writeFileSync} from 'node:fs'
/* v5 §19 "reveal + explanation": the explanation is authored with the question and must reach
   nobody — host, projector or player — until the answer window has closed and the reveal is out. */
const EXPLANATION='SYNTHETIC_EXPLANATION'
const SHOTS=process.env.PW_SHOT_DIR??'../screenshots/v4'
test.use({video:{mode:'on',size:{width:1440,height:900}}})
test('30 browser participants complete ten questions through the real classroom UI',async({browser,page})=>{
  test.setTimeout(180_000)
  mkdirSync(SHOTS,{recursive:true})
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message))
  await page.addInitScript(()=>{const Original=window.AudioContext;Object.assign(window,{__audioContexts:0});window.AudioContext=class extends Original{constructor(options?:AudioContextOptions){super(options);(window as unknown as {__audioContexts:number}).__audioContexts++}}})
  const {email,password}=localTeacher()
  const login=await page.request.post('/api/v1/auth/login',{data:{email,password}})
  const {accessToken}=await login.json(),headers={authorization:`Bearer ${accessToken}`}
  const made=await page.request.post('/api/v1/activities',{headers,data:{title:'اختبار الحصة · بيانات تجريبية',subjectId:1,levelId:8,purposeId:2}})
  const {activity}=await made.json()
  for(let i=0;i<10;i++) {
    const added=await page.request.post(`/api/v1/activities/${activity.id}/questions`,{headers,data:{kind:'mcq',prompt:`السؤال التجريبي ${i+1}: اختر واحدًا`,timeLimitS:30,explanation:`${EXPLANATION} ${i+1}`,payload:{options:[{key:'a',text:'واحد'},{key:'b',text:'اثنان'},{key:'c',text:'ثلاثة'},{key:'d',text:'أربعة'}],correct:'a'}}})
    const {question}=await added.json()
    for(const key of ['b','c','d'])expect((await page.request.put(`/api/v1/activities/questions/${question.id}/reasons`,{headers,data:{elementKey:key,reason:'SYNTHETIC_PRIVATE_REASON'}})).ok()).toBe(true)
  }
  expect((await page.request.post(`/api/v1/activities/${activity.id}/publish`,{headers})).ok()).toBe(true)
  await page.setViewportSize({width:1440,height:900})
  await page.goto(`/teacher/live/new?activityId=${activity.id}&request=${crypto.randomUUID()}`)
  await expect(page.getByRole('button',{name:'ابدأ الحصة',exact:true})).toBeVisible({timeout:20_000})
  const pin=await page.locator('strong[dir=ltr]').first().innerText()
  const contexts=await Promise.all(Array.from({length:30},()=>browser.newContext({viewport:{width:390,height:844},baseURL:process.env.PW_BASE_URL??'http://127.0.0.1:5199'})))
  try {
    const players=await Promise.all(contexts.map(c=>c.newPage()))
    let leaked=false
    await Promise.all(players.map(async(p,i)=>{
      p.on('websocket',ws=>ws.on('framereceived',frame=>{
        const text=String(frame.payload)
        if(text.includes('SYNTHETIC_PRIVATE_REASON'))leaked=true
        if(text.includes('"state":"question_open"')&&text.includes('"correct":"a"'))leaked=true
        /* The explanation is part of the answer key: it may not be in a frame whose state is still
           before the reveal. It legitimately stays in the reveal a podium or ended frame carries. */
        if(text.includes(EXPLANATION)&&/"state":"(lobby|question_open|question_locked)"/.test(text))leaked=true
      }))
      await p.goto(`/join?pin=${pin}`)
      await p.getByLabel('اسمك في الحصة').fill(`مشارك ${i+1}`)
      await p.getByRole('button',{name:'انضم',exact:true}).click()
      await expect(p.getByText('أنت في الحصة. انتظر إشارة المعلّم.')).toBeVisible({timeout:20_000})
    }))
    await expect(page.getByRole('heading',{name:'30 مشارك'})).toBeVisible()
    await page.screenshot({path:`${SHOTS}/live-lobby-1440.png`,fullPage:true})
    expect(await page.evaluate(()=>(window as unknown as {__audioContexts:number}).__audioContexts)).toBe(0)
    await page.getByRole('button',{name:'ابدأ الحصة',exact:true}).click()
    expect(await page.evaluate(()=>(window as unknown as {__audioContexts:number}).__audioContexts)).toBeGreaterThan(0)
    expect(await page.locator('audio').count()).toBe(0)
    await players[0]!.reload()
    await players[1]!.evaluate(()=>{const now=Date.now;Date.now=()=>now()+86_400_000})
    const cdp=await page.context().newCDPSession(page)
    const before=await page.getByRole('timer').getAttribute('aria-label')
    await cdp.send('Page.setWebLifecycleState',{state:'frozen'});await new Promise(resolve=>setTimeout(resolve,1300));await cdp.send('Page.setWebLifecycleState',{state:'active'})
    await expect.poll(async()=>Number((await page.getByRole('timer').getAttribute('aria-label'))?.split(' ')[0])).toBeLessThan(Number(before?.split(' ')[0]))
    await cdp.detach()

    for(let i=0;i<10;i++) {
      await Promise.all(players.map(async p=>{
        await p.getByRole('button',{name:'واحد',exact:true}).click()
        // 'saved' once the ACK confirms the row committed; 'received' when it was accepted in memory only.
        await expect(p.getByRole('heading',{name:/تم (حفظ|تسجيل) إجابتك/})).toBeVisible()
      }))
      if(i===0){await page.screenshot({path:`${SHOTS}/live-question-1440.png`,fullPage:true});await players[0]!.screenshot({path:`${SHOTS}/live-player-390.png`,fullPage:true})}
      // Everyone has answered and the window is still open: no explanation anywhere, on any screen.
      for(const surface of [page,players[0]!,players[1]!]) {
        await expect(surface.locator('[data-explanation]')).toHaveCount(0)
        await expect(surface.getByText(EXPLANATION,{exact:false})).toHaveCount(0)
      }
      await page.getByRole('button',{name:'اكشف الإجابة',exact:true}).click()
      // ...and only now does it appear, with the text authored for THIS question.
      for(const surface of [page,players[0]!])await expect(surface.locator('[data-explanation]')).toContainText(`${EXPLANATION} ${i+1}`,{timeout:15_000})
      if(i===0){await page.screenshot({path:`${SHOTS}/live-reveal-explanation-1440.png`,fullPage:true});await players[0]!.screenshot({path:`${SHOTS}/live-reveal-explanation-390.png`,fullPage:true})}
      await page.getByRole('button',{name:i===9?'اعرض المنصة':'السؤال التالي',exact:true}).click()
    }
    await expect(page.getByRole('heading',{name:'أحسنتم جميعًا'})).toBeVisible()
    expect(leaked).toBe(false)
    await page.screenshot({path:`${SHOTS}/live-podium-1440.png`,fullPage:true})
    await page.getByRole('button',{name:'أكمل الحصة',exact:true}).click()
    await expect(page.getByRole('heading',{name:'انتهت الحصة',exact:true})).toBeVisible()
    const runId=Number(new URL(page.url()).pathname.split('/').at(-1))
    const report=await(await page.request.get(`/api/v1/reports/runs/${runId}`,{headers})).json()
    expect(report.participants).toHaveLength(30);expect(report.participants.every((p:{answered:number;correctCount:number})=>p.answered===10&&p.correctCount===10)).toBe(true)
    expect(errors).toEqual([])
    writeFileSync(`${SHOTS}/live-browser-evidence.json`,JSON.stringify({runId,label:'30 SIMULATED browser participants — separate Chromium contexts at 390×844 in this process, not physical phones',participants:30,questions:10,acceptedAnswers:300,explanationBeforeReveal:'absent from every host and player screen and from every player websocket frame',explanationAtReveal:'shown to host and players, matching the question just closed',reloadResume:true,deviceClockChanged:true,tabFrozenMs:1300,audioUnlockedOnStart:true,noAudioElements:true,pageErrors:errors,viewport:await page.evaluate(()=>({width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth}))},null,2))
    const video=page.video();await page.close();if(video)await video.saveAs(`${SHOTS}/live-lobby-to-podium.webm`)

  } finally {await Promise.all(contexts.map(c=>c.close()))}
})
