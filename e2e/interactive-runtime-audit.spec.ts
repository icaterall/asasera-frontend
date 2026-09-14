import {test,expect,type Page,type APIRequestContext,chromium,firefox,webkit} from '@playwright/test'
import {existsSync,mkdirSync,writeFileSync} from 'node:fs'

const OUT=process.env.RUNTIME_AUDIT_OUT??'../docs/evidence/interactive/runtime-audit-20260914'
test.setTimeout(120_000)
// Evidence must not include session capabilities or request authorization headers.
test.use({trace:'off'})
test.beforeEach(()=>{expect(new URL(process.env.PW_BASE_URL??'').hostname).toMatch(/^(127\.0\.0\.1|localhost)$/);mkdirSync(OUT,{recursive:true})})
function save(name:string,value:unknown){writeFileSync(`${OUT}/${name}.json`,JSON.stringify(value,null,2))}
async function teacher(page:Page,request:APIRequestContext){
 const email=`runtime-audit-${crypto.randomUUID()}@example.com`,password='Synthetic runtime audit 2026!'
 expect((await request.post('/api/v1/auth/register/teacher',{data:{name:'Synthetic runtime audit',email,password}})).ok()).toBe(true)
 const login=await request.post('/api/v1/auth/login',{data:{email,password}});expect(login.ok()).toBe(true)
 await page.context().addCookies((await request.storageState()).cookies)
 return {authorization:`Bearer ${(await login.json()).accessToken}`}
}
async function lesson(page:Page,request:APIRequestContext){
 const headers=await teacher(page,request)
 const made=await request.post('/api/v1/activities',{headers,data:{title:'Synthetic runtime audit',subjectId:1,levelId:8,purposeId:2,contentLanguage:'en'}})
 expect(made.ok()).toBe(true);const {activity}=await made.json()
 expect((await request.post(`/api/v1/activities/${activity.id}/questions`,{headers,data:{kind:'tf',prompt:'The moon is a star.',payload:{correct:false},explanation:'The moon is a natural satellite.'}})).ok()).toBe(true)
 expect((await request.post(`/api/v1/activities/${activity.id}/publish`,{headers})).ok()).toBe(true)
 return activity.id as number
}
async function instrument(page:Page,options:{noAnimation?:boolean;denyAudio?:boolean;muted?:boolean}={}){
 await page.addInitScript(options=>{
  localStorage.setItem('asasera.language','en');localStorage.setItem('asasera:mute',String(!!options.muted))
  const intervals=new Map<number,number>(),listeners=new Map<string,number>(),identities=new WeakMap<object,Map<string,Set<EventListenerOrEventListenerObject>>>()
  const originalSet=window.setInterval.bind(window),originalClear=window.clearInterval.bind(window)
  window.setInterval=((handler:TimerHandler,delay?:number,...args:unknown[])=>{const id=originalSet(handler,delay,...args);intervals.set(id,delay??0);return id}) as typeof setInterval
  window.clearInterval=((id?:number)=>{intervals.delete(id!);originalClear(id)}) as typeof clearInterval
  const add=EventTarget.prototype.addEventListener,remove=EventTarget.prototype.removeEventListener
  function key(target:EventTarget,type:string){return target===window&&['storage','asasera-activity-motion'].includes(type)?`window:${type}`:target===document&&['fullscreenchange','visibilitychange','pointerdown'].includes(type)?`document:${type}`:typeof MediaQueryList!=='undefined'&&target instanceof MediaQueryList&&type==='change'?'media:change':null}
  EventTarget.prototype.addEventListener=function(type,callback,opts){const k=key(this,type);if(k&&callback){const capture=typeof opts==='boolean'?opts:!!opts?.capture;let registry=identities.get(this);if(!registry){registry=new Map();identities.set(this,registry)}const id=`${k}:${capture}`;let set=registry.get(id);if(!set){set=new Set();registry.set(id,set)}if(!set.has(callback)){set.add(callback);listeners.set(k,(listeners.get(k)??0)+1)}}return add.call(this,type,callback,opts)}
  EventTarget.prototype.removeEventListener=function(type,callback,opts){const k=key(this,type),capture=typeof opts==='boolean'?opts:!!opts?.capture;if(k&&callback&&identities.get(this)?.get(`${k}:${capture}`)?.delete(callback))listeners.set(k,(listeners.get(k)??0)-1);return remove.call(this,type,callback,opts)}
  let denied=0,contexts=0,started=0,ended=0
  const denialCallers:string[]=[]
  const Audio=window.AudioContext
  if(Audio){window.AudioContext=class extends Audio{constructor(options?:AudioContextOptions){super(options);contexts++}}
   if(options.denyAudio)Audio.prototype.resume=function(){denialCallers.push(new Error('resume caller').stack??'');denied++;return Promise.reject(new DOMException('Synthetic autoplay refusal','NotAllowedError'))}
  }
  if(options.denyAudio)HTMLMediaElement.prototype.play=function(){denied++;return Promise.reject(new DOMException('Synthetic autoplay refusal','NotAllowedError'))}
  const start=AudioBufferSourceNode.prototype.start
  AudioBufferSourceNode.prototype.start=function(...args:Parameters<typeof start>){started++;this.addEventListener('ended',()=>ended++,{once:true});return start.apply(this,args)}
  if(options.noAnimation)Object.defineProperty(Element.prototype,'animate',{configurable:true,value:undefined})
  Object.assign(window,{__runtimeAudit:()=>({intervals:[...intervals.values()].sort((a,b)=>a-b),listeners:Object.fromEntries([...listeners].sort()),domNodes:document.getElementsByTagName('*').length,animations:document.getAnimations().filter(a=>a.playState==='running').length,audio:{contexts,started,ended,denied,denialCallers},timeOrigin:performance.timeOrigin})})
 },options)
}
async function snapshot(page:Page){return page.evaluate(()=>((window as unknown as {__runtimeAudit:()=>Record<string,unknown>}).__runtimeAudit()))}

test('T098 wheel SPA cycles release tracked resources and retain bounded heap indicators',async({page,request,browser})=>{
 await teacher(page,request);await instrument(page)
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message))
 await page.goto('/teacher/wheel')
 await page.getByRole('textbox',{name:'Names, topics or questions'}).fill('Sara\nAmal\nLong synthetic classroom participant')
 await page.getByRole('button',{name:'Use this list'}).click()
 const cdp=await page.context().newCDPSession(page),samples:unknown[]=[]
 await cdp.send('Performance.enable')
 for(let cycle=0;cycle<12;cycle++){
  await expect(page.getByRole('button',{name:'Spin the wheel',exact:true})).toBeEnabled()
  if(await page.getByRole('button',{name:'Reset picks',exact:true}).isEnabled())await page.getByRole('button',{name:'Reset picks',exact:true}).click()
  await page.getByRole('button',{name:'Spin the wheel',exact:true}).click()
  await expect(page.locator('[data-random-wheel]')).toHaveAttribute('data-wheel-state','spinning')
  if(cycle%3===0)await expect(page.locator('[data-random-wheel]')).toHaveAttribute('data-wheel-state','selected',{timeout:8000})
  await page.getByRole('link',{name:'Teacher tools',exact:true}).click()
  await expect(page).toHaveURL(/\/teacher\/tools$/)
  await expect.poll(async()=>(await snapshot(page)).intervals).not.toContain(80)
  await expect.poll(async()=>((await snapshot(page)).listeners as Record<string,number>)['window:asasera-activity-motion']).toBe(0)
  await cdp.send('HeapProfiler.collectGarbage')
  const state=await snapshot(page),metrics=await cdp.send('Performance.getMetrics'),dom=await cdp.send('Memory.getDOMCounters')
  expect(state.intervals).not.toContain(80)
  samples.push({cycle,...state,heapBytes:metrics.metrics.find(m=>m.name==='JSHeapUsedSize')?.value,dom})
  await page.goBack();await expect(page.getByRole('heading',{name:'Random wheel',exact:true})).toBeVisible()
 }
 const values=samples as {heapBytes:number;listeners:unknown;domNodes:number;timeOrigin:number}[]
 save('wheel-cycles',{engine:browser.version(),viewport:page.viewportSize(),deviceScaleFactor:1,touch:false,locale:'en-US',reducedMotion:'no-preference',samples,errors})
 expect(values.at(-1)!.listeners).toEqual(values[2]!.listeners)
 expect(values.at(-1)!.domNodes).toBeLessThanOrEqual(values[2]!.domNodes+10)
 expect(values.at(-1)!.heapBytes-values[2]!.heapBytes).toBeLessThan(8_000_000)
 expect(new Set(values.map(v=>v.timeOrigin)).size).toBe(1)
 expect(errors).toEqual([])
})

for(const reducedMotion of ['no-preference','reduce'] as const)test(`T099 missing Animation API flashcards and wheel ${reducedMotion}`,async({page,request,browser})=>{
 const id=await lesson(page,request);await instrument(page,{noAnimation:true});await page.emulateMedia({reducedMotion})
 const errors:string[]=[],errorStacks:string[]=[];page.on('pageerror',e=>{errors.push(e.message);errorStacks.push(e.stack??e.message)})
 await page.goto('/teacher/wheel')
 await page.getByRole('textbox',{name:'Names, topics or questions'}).fill('Sara\nAmal')
 await page.getByRole('button',{name:'Use this list'}).click();await page.getByRole('button',{name:'Spin the wheel',exact:true}).click()
 await expect(page.locator('[data-random-wheel]')).toHaveAttribute('data-wheel-state','selected',{timeout:8000})
 await expect(page.locator('[data-random-wheel] [role=status]')).toContainText('The wheel chose')
 await page.goto(`/teacher/activities/${id}/play?mode=study`)
 await page.getByRole('radio',{name:/Flashcards/}).check();await page.getByRole('button',{name:'Create assignment link'}).click()
 const link=await page.getByRole('textbox',{name:'Assignment link'}).inputValue()
 await page.goto(link);await page.getByRole('textbox',{name:'Your name'}).fill('Synthetic runtime learner');await page.getByRole('button',{name:'Start',exact:true}).click()
 await page.getByRole('button',{name:'Start round',exact:true}).click()
 try{
  await expect(page.getByRole('heading',{name:'The moon is a star.',exact:true})).toBeVisible()
  await page.getByRole('button',{name:'Reveal answer',exact:true}).click();await expect(page.getByText('The moon is a natural satellite.',{exact:true})).toBeVisible()
  for(let cycle=0;cycle<8;cycle++){await page.getByRole('button',{name:'Show question',exact:true}).click();await page.getByRole('button',{name:'Reveal answer',exact:true}).click()}
  await page.getByRole('button',{name:'Review again',exact:true}).click();await page.getByRole('button',{name:'Finish round',exact:true}).click();await expect(page.getByRole('heading',{name:'Round complete'})).toBeVisible()
  expect(errors).toEqual([])
  }finally{save(`animation-fallback-${reducedMotion}`,{engine:browser.version(),reducedMotion,noAnimation:true,errors,errorStacks,state:await snapshot(page)});await page.screenshot({path:`${OUT}/animation-fallback-${reducedMotion}.png`,fullPage:true})}
})

for(const denyAudio of [false,true])test(`T093 live activity remains readable with ${denyAudio?'denied autoplay':'muted audio'} and exits`,async({page,request,browser})=>{
 const id=await lesson(page,request);await instrument(page,{denyAudio,muted:!denyAudio})
 const errors:string[]=[],errorStacks:string[]=[];page.on('pageerror',e=>{errors.push(e.message);errorStacks.push(e.stack??e.message)})
 await page.goto(`/teacher/live/new?activityId=${id}&request=${crypto.randomUUID()}`)
 await expect(page.getByRole('button',{name:'Start class',exact:true})).toBeEnabled()
 await page.getByRole('button',{name:'Start class',exact:true}).click()
 await expect(page.getByRole('heading',{name:'The moon is a star.',exact:true})).toBeVisible()
 await page.getByRole('button',{name:'Reveal answer',exact:true}).click()
 await expect(page.getByText('The moon is a natural satellite.',{exact:true})).toBeVisible()
 await page.screenshot({path:`${OUT}/audio-${denyAudio?'denied':'muted'}-reveal.png`,fullPage:true})
 const active=await snapshot(page)
 await page.getByRole('button',{name:'Show podium',exact:true}).click();await expect(page.getByRole('heading',{name:'Well played, everyone'})).toBeVisible()
 await page.getByRole('button',{name:'Finish class',exact:true}).click();await page.getByRole('button',{name:'Leave',exact:true}).click()
 await expect(page).toHaveURL(/\/teacher\/activities$/)
 await expect.poll(async()=>((await snapshot(page)).listeners as Record<string,number>)['document:fullscreenchange']).toBe(0)
 await expect.poll(async()=>{const audio=(await snapshot(page)).audio as {started:number;ended:number};return audio.started-audio.ended}).toBe(0)
 const exited=await snapshot(page)
 save(`audio-${denyAudio?'denied':'muted'}`,{engine:browser.version(),injection:denyAudio?'AudioContext.resume and HTMLMediaElement.play reject NotAllowedError':'saved mute preference true',active,exited,errors,errorStacks})
 expect((exited.listeners as Record<string,number>)['document:fullscreenchange']).toBe(0)
 expect(exited.intervals).not.toContain(80)
 expect(errors).toEqual([])
})

for(const browserName of ['firefox','webkit'] as const)test.describe(`${browserName} core smoke`,()=>{
 test('reviewed flashcard cycle and server-selected wheel are usable',async({request})=>{
  const browser=await (browserName==='firefox'?firefox:webkit).launch(),context=await browser.newContext({baseURL:process.env.PW_BASE_URL,viewport:{width:390,height:844},deviceScaleFactor:1,hasTouch:true,locale:'en-US',reducedMotion:'reduce'}),page=await context.newPage()
  try{
  const id=await lesson(page,request);await instrument(page)
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message))
  await page.goto('/teacher/wheel');await page.getByRole('textbox',{name:'Names, topics or questions'}).fill('Sara\nAmal')
  await page.getByRole('button',{name:'Use this list'}).click();await page.getByRole('button',{name:'Spin the wheel',exact:true}).click()
  await expect(page.locator('[data-random-wheel]')).toHaveAttribute('data-wheel-state','selected')
  await expect(page.locator('[data-random-wheel] [role=status]')).toContainText('The wheel chose')
  await page.screenshot({path:`${OUT}/${browserName}-wheel.png`,fullPage:true})
  await page.goto(`/teacher/activities/${id}/play?mode=study`);await page.getByRole('radio',{name:/Flashcards/}).check();await page.getByRole('button',{name:'Create assignment link'}).click()
  const link=await page.getByRole('textbox',{name:'Assignment link'}).inputValue()
  await page.goto(link);await page.getByRole('textbox',{name:'Your name'}).fill('Synthetic browser learner');await page.getByRole('button',{name:'Start',exact:true}).click();await page.getByRole('button',{name:'Start round',exact:true}).click()
  await expect(page.getByRole('heading',{name:'The moon is a star.',exact:true})).toBeVisible();await page.getByRole('button',{name:'Reveal answer',exact:true}).click();await expect(page.getByText('The moon is a natural satellite.',{exact:true})).toBeVisible()
  await page.getByRole('button',{name:'Review again',exact:true}).click();await page.getByRole('button',{name:'Finish round',exact:true}).click();await expect(page.getByRole('heading',{name:'Round complete'})).toBeVisible()
  await page.screenshot({path:`${OUT}/${browserName}-flashcards-complete.png`,fullPage:true})
  save(`${browserName}-core`,{engine:browserName,version:browser.version(),viewport:page.viewportSize(),deviceScaleFactor:1,hasTouch:true,locale:'en-US',reducedMotion:'reduce',physicalDevice:false,errors,state:await snapshot(page)})
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(errors).toEqual([])
  }finally{await context.close();await browser.close()}
 })
})

test('browser installation coverage inventory',async({browser})=>{
 save('engines',{playwright:'1.63.0',chromiumVersion:browser.version(),engines:[chromium,firefox,webkit].map(engine=>({engine:engine.name(),installed:existsSync(engine.executablePath())})),physicalDevicesTested:false})
})

test('T098 repeated native memory boards complete with bounded subscriptions and animations',async({page,request,browser})=>{
 const headers=await teacher(page,request);await instrument(page)
 const made=await request.post('/api/v1/activities',{headers,data:{title:'Synthetic runtime memory boards',subjectId:1,levelId:8,purposeId:2,contentLanguage:'en'}});expect(made.ok()).toBe(true);const {activity}=await made.json()
 for(let board=0;board<8;board++)expect((await request.post(`/api/v1/activities/${activity.id}/questions`,{headers,data:{kind:'match',prompt:`Find the matching pairs ${board+1}.`,payload:{cards:[{key:'a',text:'Cat'},{key:'b',text:'Bird'}],targets:[{key:'x',text:'Mammal'},{key:'y',text:'Feathers'}],map:{a:'x',b:'y'}}}})).ok()).toBe(true)
 expect((await request.post(`/api/v1/activities/${activity.id}/publish`,{headers})).ok()).toBe(true)
 await page.goto(`/teacher/activities/${activity.id}/play?mode=study`);await page.getByRole('radio',{name:/Memory/}).check();await page.getByRole('button',{name:'Create assignment link'}).click()
 const link=await page.getByRole('textbox',{name:'Assignment link'}).inputValue();await page.goto(link);await page.getByRole('textbox',{name:'Your name'}).fill('Synthetic memory learner');await page.getByRole('button',{name:'Start',exact:true}).click();await page.getByRole('button',{name:'Start round',exact:true}).click()
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message))
 const cdp=await page.context().newCDPSession(page);await cdp.send('Performance.enable')
 const samples:Record<string,unknown>[]=[],pairs:Record<string,string>={Cat:'Mammal',Mammal:'Cat',Bird:'Feathers',Feathers:'Bird'}
 for(let cycle=0;cycle<8;cycle++){
  const board=page.getByRole('region',{name:'Memory board'}),cards=board.locator('button[data-state]'),known=new Map<number,string>()
  await expect(cards).toHaveCount(4)
  await expect(board.locator('button[data-state=hidden]')).toHaveCount(4)
  for(let step=0;step<40;step++){
   const state=await cards.evaluateAll(elements=>elements.map(el=>({state:el.getAttribute('data-state'),text:el.querySelector('[dir=auto]')?.textContent??''})))
   state.forEach((card,index)=>{if(card.text)known.set(index,card.text)})
   if(state.every(card=>card.state==='matched'))break
   const continued=board.getByRole('button',{name:'Turn cards over',exact:true})
   if(await continued.isVisible()){await continued.click();await expect(continued).toHaveCount(0);continue}
   const shown=state.findIndex(card=>card.state==='revealed'),hidden=state.flatMap((card,index)=>card.state==='hidden'?[index]:[])
   const next=shown>=0?hidden.find(index=>known.get(index)===pairs[state[shown].text])??hidden.find(index=>!known.has(index))??hidden[0]:hidden.find(index=>known.has(index)&&hidden.some(other=>known.get(other)===pairs[known.get(index)!]))??hidden[0]
   await cards.nth(next).click();await expect(cards.nth(next)).not.toHaveAttribute('data-state','hidden')
  }
  await expect(board.getByText('All pairs found. This is memory practice, not a test grade.',{exact:true})).toBeVisible()
  await expect.poll(async()=>(await snapshot(page)).animations).toBe(0)
  await cdp.send('HeapProfiler.collectGarbage');const metrics=await cdp.send('Performance.getMetrics')
  samples.push({cycle,...await snapshot(page),heapBytes:metrics.metrics.find(m=>m.name==='JSHeapUsedSize')?.value})
  await page.getByRole('button',{name:cycle===7?'Finish round':'Next card',exact:true}).click()
 }
 await expect(page.getByRole('heading',{name:'Round complete'})).toBeVisible()
 await expect.poll(async()=>((await snapshot(page)).listeners as Record<string,number>)['window:asasera-activity-motion']).toBe(4)
 const last=samples.at(-1)!,warm=samples[2]!
 save('memory-board-cycles',{engine:browser.version(),boards:8,nativePairsPerBoard:2,motion:'enabled',samples,completed:await snapshot(page),errors})
 expect(last.listeners).toEqual(warm.listeners);expect(Number(last.domNodes)).toBeLessThanOrEqual(Number(warm.domNodes)+2);expect(Number(last.heapBytes)-Number(warm.heapBytes)).toBeLessThan(8_000_000);expect(errors).toEqual([])
 await page.screenshot({path:`${OUT}/memory-eight-boards-complete.png`,fullPage:true})
})
