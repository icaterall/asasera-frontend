import {test,expect,chromium,type Page,type Browser} from '@playwright/test'
import {spawn} from 'node:child_process'
import {mkdtemp,rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join,basename} from 'node:path'
import {io,type Socket} from 'socket.io-client'
import {teacherFixture,label} from './helpers/interactive-evidence'
import type {Reply,SessionSnapshot} from '../src/shared/session'
test.use({trace:'off'})
declare global{interface Window{__nativeVisibility:{state:string;time:number;trusted:boolean}[]}}
async function nativeBrowser(){
 const profile=await mkdtemp(join(tmpdir(),'asasera-wheel-native-'))
 // This browser is deliberately not launched through Playwright: its normal
 // launch enables focus emulation, which makes visibility checks misleading.
 const process=spawn(chromium.executablePath(),['--remote-debugging-port=0',`--user-data-dir=${profile}`,'--no-first-run','--no-default-browser-check','--disable-background-networking','--disable-component-update','--disable-sync','about:blank'],{stdio:['ignore','ignore','pipe']})
 let browser:Browser|undefined
 async function close(){if(browser){const session=await browser.newBrowserCDPSession().catch(()=>null);await session?.send('Browser.close').catch(()=>{});await browser.close().catch(()=>{})}if(process.exitCode===null)process.kill('SIGTERM');expect(basename(profile).startsWith('asasera-wheel-native-')).toBe(true);await rm(profile,{recursive:true,force:true}).catch(()=>{})}
 try{
  const endpoint=await new Promise<string>((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Native test browser endpoint unavailable')),10000);process.once('error',error=>{clearTimeout(timer);reject(error)});process.stderr.on('data',data=>{const match=String(data).match(/DevTools listening on (ws:\/\/[^\s]+)/);if(match){clearTimeout(timer);resolve(match[1])}})})
  browser=await chromium.connectOverCDP(endpoint,{noDefaults:true});return {browser,context:browser.contexts()[0],close}
 }catch(error){await close();throw error}
}
function snapshots(page:Page,accept:(state:SessionSnapshot)=>void){
 const packet=(value:string)=>{if(!/^4[23]\d*\[/.test(value))return;const parts=JSON.parse(value.slice(value.indexOf('[')));if(parts[0]==='session:snapshot')accept(parts[1]);else if(parts[0]?.snapshot)accept(parts[0].snapshot)}
 page.on('websocket',socket=>socket.on('framereceived',frame=>packet(String(frame.payload))))
 page.on('response',async response=>{if(response.url().includes('/socket.io/')&&response.request().method()==='GET'&&new URL(response.url()).searchParams.get('transport')==='polling')try{(await response.text()).split('\x1e').forEach(packet)}catch{/* Replaced document can cancel an empty poll. */}})
}
for(const language of ['en','ar'] as const)test(`native hidden tab preserves committed live wheel ${language}`,async({request},testInfo)=>{
 test.setTimeout(45000)
 expect(new URL(process.env.PW_BASE_URL??'').hostname).toMatch(/^(127\.0\.0\.1|localhost)$/)
 const native=await nativeBrowser(),page=native.context.pages()[0],sockets:Socket[]=[],errors:string[]=[];page.on('pageerror',error=>errors.push(error.message))
 try{
  const fixture=await teacherFixture(page,request,language,[{kind:'tf',prompt:label(language,'Earth is a planet.','الأرض كوكب.'),payload:{correct:true}}]);await fixture.publish()
  await page.addInitScript(()=>{window.__nativeVisibility=[];document.addEventListener('visibilitychange',event=>window.__nativeVisibility.push({state:document.visibilityState,time:performance.now(),trusted:event.isTrusted}))})
  let current:SessionSnapshot|undefined;snapshots(page,state=>{current=state})
  await page.goto(`${process.env.PW_BASE_URL}/teacher/live/new?activityId=${fixture.activity.id}&request=${crypto.randomUUID()}`)
  await expect(page.getByRole('button',{name:label(language,'Start class','ابدأ الحصة'),exact:true})).toBeVisible();await expect.poll(()=>current?.pin).toBeTruthy()
  for(const name of language==='ar'?['أحمد','مريم','سارة']:['Ahmed','Mariam','Sara']){const socket=io(process.env.PW_BASE_URL!,{transports:['websocket'],autoConnect:false,reconnection:false});sockets.push(socket);await new Promise<void>((resolve,reject)=>{socket.once('connect',resolve);socket.once('connect_error',reject);socket.connect()});const reply:Reply=await socket.timeout(5000).emitWithAck('player:join',{pin:current!.pin,name,requestId:crypto.randomUUID()});expect(reply.ok).toBe(true)}
  await expect.poll(()=>current?.participants.length).toBe(3)
  const other=await native.context.newPage();await other.goto('about:blank');await page.bringToFront();await expect.poll(()=>page.evaluate(()=>document.visibilityState)).toBe('visible')
  await page.getByRole('button',{name:label(language,'Random wheel','العجلة العشوائية'),exact:true}).click();await page.getByRole('button',{name:label(language,'Spin the wheel','أدر العجلة'),exact:true}).click();await expect.poll(()=>current?.wheel?.spin?.id).toBeTruthy()
  const committed=structuredClone(current!.wheel!.spin!),winner=committed.entries[committed.winnerIndex]!
  await expect(page.locator('[data-random-wheel]')).toHaveAttribute('data-wheel-state','spinning')
  await other.bringToFront();await expect.poll(()=>page.evaluate(()=>document.visibilityState)).toBe('hidden');expect(await page.evaluate(()=>document.hasFocus())).toBe(false)
  // Wait in the other real tab while the committed server deadline passes.
  // No lifecycle freezing, clock patch, visibility getter override or fake event.
  await other.waitForTimeout(2700);expect(await page.evaluate(()=>document.visibilityState)).toBe('hidden')
  await page.bringToFront();await expect.poll(()=>page.evaluate(()=>document.visibilityState)).toBe('visible');await expect(page.locator('[data-random-wheel]')).toHaveAttribute('data-wheel-state','selected');expect(current!.wheel!.spin).toEqual(committed)
  const transitions=await page.evaluate(()=>window.__nativeVisibility),hidden=transitions.findLast(event=>event.state==='hidden')!,visible=transitions.findLast(event=>event.state==='visible')!
  expect(hidden).toBeTruthy();expect(visible.time-hidden.time).toBeGreaterThanOrEqual(2600);expect(transitions.every(event=>event.trusted)).toBe(true);expect(await page.evaluate(()=>document.hasFocus())).toBe(true)
  await page.screenshot({path:`../docs/evidence/interactive/wheel-native-background-${language}-returned.png`,fullPage:true})
  current=undefined;await page.reload();await expect.poll(()=>current?.wheel?.spin?.id).toBe(committed.id);await expect(page.locator('[data-random-wheel]')).toHaveAttribute('data-wheel-state','selected');expect(current!.wheel!.spin).toEqual(committed);expect(errors).toEqual([])
  const evidence={language,nativeVisibility:true,transitionStates:transitions.map(event=>event.state),hiddenMs:Math.round(visible.time-hidden.time),sameCommittedDraw:true,sameWinner:true,reloadSame:true,participants:committed.entries.length,winnerLabel:winner.label,launch:'fresh native Chromium; CDP noDefaults=true'}
  console.info('NATIVE_BACKGROUND_EVIDENCE',JSON.stringify(evidence));await testInfo.attach('native-background',{body:JSON.stringify(evidence,null,2),contentType:'application/json'})
 }finally{sockets.forEach(socket=>socket.disconnect());await native.close()}
})
