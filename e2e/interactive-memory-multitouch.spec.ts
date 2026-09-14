import {test,expect,type Locator} from '@playwright/test'
import {assignment,label,teacherFixture} from './helpers/interactive-evidence'
import type {AttemptView} from '../src/shared/delivery'
test.use({trace:'off'})
declare global{interface Window{__memoryTouchAudit:{maxTouches:number;starts:number;pointerCancels:number;maxUnmatched:number}}}
async function centers(cards:Locator){const points=[];for(let i=0;i<await cards.count();i++){const box=await cards.nth(i).boundingBox();expect(box).not.toBeNull();points.push({x:Math.round(box!.x+box!.width/2),y:Math.round(box!.y+box!.height/2)})}return points}
for(const language of ['en','ar'] as const)test(`real memory multi-touch and rapid tap ACK state ${language}`,async({page,request,browser},testInfo)=>{
 test.setTimeout(45000)
 const fixture=await teacherFixture(page,request,language,[{kind:'match',prompt:label(language,'Find the reviewed pairs.','جد الأزواج المعتمدة.'),payload:{cards:[{key:'cat',text:label(language,'Cat','قطة')},{key:'bird',text:label(language,'Bird','طائر')}],targets:[{key:'mammal',text:label(language,'Mammal','ثديي')},{key:'feather',text:label(language,'Feathers','ريش')}],map:{cat:'mammal',bird:'feather'}}}]);await fixture.publish()
 const link=await assignment(page,fixture.activity.id,language,label(language,'Memory','الذاكرة'))
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true})
 await context.addInitScript(lang=>{localStorage.setItem('asasera.language',lang);window.__memoryTouchAudit={maxTouches:0,starts:0,pointerCancels:0,maxUnmatched:0};document.addEventListener('touchstart',event=>{window.__memoryTouchAudit.starts++;window.__memoryTouchAudit.maxTouches=Math.max(window.__memoryTouchAudit.maxTouches,event.touches.length)},{passive:true});document.addEventListener('pointercancel',()=>window.__memoryTouchAudit.pointerCancels++);new MutationObserver(()=>{window.__memoryTouchAudit.maxUnmatched=Math.max(window.__memoryTouchAudit.maxUnmatched,document.querySelectorAll('[data-presentation="memory"] button[data-state="revealed"]').length)}).observe(document,{childList:true,subtree:true,attributes:true,attributeFilter:['data-state']})},language)
 const learn=await context.newPage(),errors:string[]=[];learn.on('pageerror',error=>errors.push(error.message))
 try{
  await learn.goto(link);await learn.getByRole('textbox',{name:label(language,'Your name','اسمك')}).fill(label(language,'Touch learner','متعلم اللمس'));await learn.getByRole('button',{name:label(language,'Start','ابدأ'),exact:true}).click();await learn.getByRole('button',{name:label(language,'Start round','ابدأ الجولة'),exact:true}).click()
  const region=learn.getByRole('region',{name:label(language,'Memory board','لوحة الذاكرة')}),cards=region.locator('button[data-state]');await expect(cards).toHaveCount(4);await region.scrollIntoViewIfNeeded();await expect(cards.first()).toBeEnabled()
  const cdp=await context.newCDPSession(learn),acks:AttemptView[]=[],statuses:number[]=[],pending:Promise<void>[]=[],commands:string[]=[]
  learn.on('request',req=>{if(req.url().endsWith('/presentation')&&req.method()==='POST')commands.push(String(req.postDataJSON()?.action))})
  learn.on('response',response=>{if(response.url().endsWith('/presentation')&&response.request().method()==='POST')pending.push((async()=>{statuses.push(response.status());if(response.ok())acks.push(await response.json() as AttemptView)})())})
  async function settle(){await learn.waitForTimeout(150);await expect.poll(()=>statuses.length).toBe(commands.length);await Promise.all(pending);await expect(learn.getByRole('alert')).toHaveCount(0)}
  const initial=await centers(cards)
  // One genuine two-finger touch gesture, not two synthetic click events.
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:initial.slice(0,2).map((point,id)=>({...point,id,radiusX:4,radiusY:4,force:1}))})
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await settle()
  const gestureRequests=commands.filter(action=>action==='memory-flip').length
  expect(await learn.evaluate(()=>window.__memoryTouchAudit.maxTouches)).toBe(2)
  const clear=learn.getByRole('button',{name:label(language,'Turn cards over','اقلب البطاقتين'),exact:true})
  if(await clear.isVisible()){await clear.tap();await settle()}
  const beforeBurst=commands.length
  const hidden=region.locator('button[data-state="hidden"]');await expect(hidden.first()).toBeEnabled();const points=await centers(hidden)
  expect(points.length).toBeGreaterThanOrEqual(2)
  // Consecutive physical single-touch taps, deliberately with no server-ACK
  // waits between fingers. Browser/API busy guards, not the harness, serialize.
  for(const point of points){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...point,id:0,radiusX:4,radiusY:4,force:1}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})}
  await expect.poll(()=>commands.slice(beforeBurst).filter(action=>action==='memory-flip').length).toBeGreaterThan(0);await settle()
  expect(acks.length).toBeGreaterThan(0);expect(statuses.every(status=>status===200)).toBe(true)
  for(const view of acks){const board=view.presentation!.memory!;expect(board.cards.filter(card=>card.state==='revealed').length).toBeLessThanOrEqual(2);for(const card of board.cards.filter(card=>card.state==='hidden'))expect(card.text).toBeUndefined();expect(board.cards.filter(card=>card.state==='matched').length).toBe(board.pairsFound*2);expect(view.score).toBeNull();expect(view.correctCount).toBeNull()}
  for(let i=1;i<acks.length;i++)expect(acks[i].presentation!.revision).toBe(acks[i-1].presentation!.revision+1)
  const last=acks.at(-1)!,saved=last.presentation!.memory!,audit=await learn.evaluate(()=>window.__memoryTouchAudit)
  expect(audit.maxUnmatched).toBeLessThanOrEqual(2);await expect(cards).toHaveCount(4)
  await expect(region.locator('button[data-state="revealed"]')).toHaveCount(saved.cards.filter(card=>card.state==='revealed').length)
  const reloadResponse=learn.waitForResponse(response=>response.url().endsWith('/view')&&response.request().method()==='POST');await learn.reload();const reloaded=await (await reloadResponse).json() as AttemptView
  expect(reloaded.presentation!.revision).toBe(last.presentation!.revision);expect(reloaded.presentation!.memory).toEqual(saved)
  await expect(learn.getByRole('region',{name:label(language,'Memory board','لوحة الذاكرة')})).toBeVisible();expect(await learn.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
  await learn.screenshot({path:`../docs/evidence/interactive/memory-multitouch-${language}-ack-reload.png`,fullPage:true});expect(errors).toEqual([])
  const evidence={language,gestureTouches:audit.maxTouches,gestureRequests,rapidTapCount:points.length,rapidFlipRequests:commands.slice(beforeBurst).filter(action=>action==='memory-flip').length,acknowledged:acks.length,statuses,maxUnmatched:audit.maxUnmatched,finalUnmatched:saved.cards.filter(card=>card.state==='revealed').length,finalPairs:saved.pairsFound,finalMoves:saved.moves,reloadSame:true}
  console.info('MEMORY_TOUCH_EVIDENCE',JSON.stringify(evidence));await testInfo.attach('memory-touch-evidence',{body:JSON.stringify(evidence,null,2),contentType:'application/json'})
 }finally{await context.close().catch(()=>{})}
})
