import {test,expect,type APIRequestContext,type Page,type Locator,type TestInfo} from '@playwright/test'
import {execFileSync} from 'node:child_process'
import {resolve} from 'node:path'
import {writeFile} from 'node:fs/promises'
test.use({trace:'off',actionTimeout:12000})
test.beforeEach(()=>expect(new URL(process.env.PW_BASE_URL??'').hostname).toMatch(/^(127\.0\.0\.1|localhost)$/))
const API='/api/v1'
async function record(info:TestInfo,name:string,value:unknown){const path=info.outputPath(name+'.json');await writeFile(path,JSON.stringify(value,null,2));await info.attach(name,{path,contentType:'application/json'})}
async function instructor(request:APIRequestContext){
 const email=`disclosure-${crypto.randomUUID()}@example.com`,password=`Synthetic-${crypto.randomUUID()}!`
 expect((await request.post(`${API}/auth/register/teacher`,{data:{name:'Disclosure audit teacher',email,password}})).ok()).toBe(true)
 const r=await request.post(`${API}/auth/login`,{data:{email,password}});expect(r.ok()).toBe(true)
 const {accessToken,user}=await r.json();return {owner:user.id,headers:{Authorization:`Bearer ${accessToken}`}}
}
async function approved(request:APIRequestContext,headers:Record<string,string>,questions:unknown[],title='Disclosure audit'){
 const r=await request.post(`${API}/activities`,{headers,data:{title,subjectId:1,levelId:8,purposeId:2,contentLanguage:'en'}});expect(r.ok()).toBe(true)
 const {activity}=await r.json(),ids:number[]=[]
 for(const question of questions){const add=await request.post(`${API}/activities/${activity.id}/questions`,{headers,data:question});expect(add.ok(),await add.text()).toBe(true);ids.push((await add.json()).question.id)}
 expect((await request.post(`${API}/activities/${activity.id}/publish`,{headers})).ok()).toBe(true)
 const version=await request.get(`${API}/activities/${activity.id}/approved`,{headers});return {id:activity.id,ids,version:(await version.json()).versionId}
}
async function assignment(request:APIRequestContext,headers:Record<string,string>,activity:{id:number;ids:number[];version:number},definitionId:string,sealed=false){
 const presentation={definitionId,definitionVersion:1,adapterVersion:1,contentVersionId:activity.version,selectedQuestionIds:activity.ids,config:{context:'practice',semantics:definitionId==='flashcards'?'self-rated':['memory','crossword'].includes(definitionId)?'practice':'scored',noRepeat:true,revealPolicy:sealed?'after-deadline':definitionId==='flashcards'?'on-request':'after-answer'}}
 if(['memory','crossword'].includes(definitionId))presentation.config.revealPolicy='on-request'
 const made=await request.post(`${API}/delivery/assignments`,{headers,data:{activityId:activity.id,mode:sealed?'homework':'study',feedback:sealed?'after_deadline':'immediate',deadline:new Date(Date.now()+3600000).toISOString(),classId:null,requestId:crypto.randomUUID(),presentation}})
 expect(made.ok(),await made.text()).toBe(true);return {...await made.json(),presentation}
}
async function join(page:Page,assigned:{id:string;accessToken:string}){
 await page.addInitScript(()=>localStorage.setItem('asasera.language','en'))
 await page.goto(`/learn/${assigned.id}#${assigned.accessToken}`)
 await page.getByRole('textbox',{name:'Your name',exact:true}).fill('Synthetic disclosure learner')
 await page.getByRole('button',{name:'Start',exact:true}).click()
}
async function seat(page:Page,id:string){return page.evaluate(id=>JSON.parse(localStorage.getItem(`asasera:assignment:${id}`)!),id)}
async function inspect(page:Page,secrets:string[]){
 const result=await page.evaluate(async secrets=>{
  const leaks:string[]=[],check=(value:unknown,path:string)=>{if(typeof value==='string'&&secrets.some(secret=>value.includes(secret)))leaks.push(path)}
  check(document.documentElement.outerHTML,'DOM')
  check(document.cookie,'cookies')
  for(const [name,storage] of [['localStorage',localStorage],['sessionStorage',sessionStorage]] as const)for(let i=0;i<storage.length;i++){const key=storage.key(i)!;check(key,name+'.key');check(storage.getItem(key),name+'.value')}
  const databases=await indexedDB.databases()
  for(const database of databases){if(!database.name)continue;const db=await new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open(database.name!);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})
   try{for(const name of db.objectStoreNames){const values=await new Promise<unknown>((resolve,reject)=>{const r=db.transaction(name).objectStore(name).getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});check(JSON.stringify(values),'indexedDB.'+name)}}finally{db.close()}}
  for(const name of await caches.keys()){const cache=await caches.open(name);for(const request of await cache.keys()){const response=await cache.match(request);if(response)check(await response.text(),'cache.'+name)}}
  const queue:unknown[]=[],seen=new WeakSet<object>()
  for(const element of document.querySelectorAll('*'))for(const name of Object.getOwnPropertyNames(element))if(name.startsWith('__reactFiber$')||name.startsWith('__reactProps$'))queue.push((element as unknown as Record<string,unknown>)[name])
  let nodes=0
  while(queue.length&&nodes<100000){const value=queue.pop();if(typeof value==='string'){check(value,'React reachable props/state');continue}if(!value||typeof value!=='object'||value instanceof Node||value===window||seen.has(value))continue;seen.add(value);nodes++
   for(const descriptor of Object.values(Object.getOwnPropertyDescriptors(value)))if('value'in descriptor)queue.push(descriptor.value)}
  return {leaks,reactObjects:nodes,truncated:queue.length>0,indexedDatabases:databases.length,cacheNames:await caches.keys()}
 },secrets)
 expect(result.leaks).toEqual([]);expect(result.truncated).toBe(false);expect(result.reactObjects).toBeGreaterThan(0)
 const ax=await page.locator('body').ariaSnapshot();for(const secret of secrets)expect(ax).not.toContain(secret)
 return result
}
async function keyboardButton(page:Page,button:Locator){
 await expect(button).toBeEnabled()
 for(let i=0;i<35&&!await button.evaluate(el=>el===document.activeElement);i++)await page.keyboard.press('Tab')
 await expect(button).toBeFocused();await page.keyboard.press('Enter')
}

test('T031 T080 restricted assessment capabilities cannot become answer decks or exports; browser stores remain sealed',async({page,request},info)=>{
 test.setTimeout(60000)
 const {headers}=await instructor(request),secret=`PRIVATE_EXPLANATION_${crypto.randomUUID()}`,hint=`PRIVATE_HINT_${crypto.randomUUID()}`
 const activity=await approved(request,headers,[{kind:'tf',prompt:'A square has four equal sides.',payload:{correct:true},explanation:secret,hint,challenge:true}])
 const sealed=await assignment(request,headers,activity,'open-box',true),flash=await assignment(request,headers,activity,'flashcards')
 const list=await request.get(`${API}/delivery/assignments`,{headers}),runId=(await list.json()).assignments.find((a:{id:string})=>a.id===sealed.id).runId
 const other=await request.post(`${API}/delivery/assignments/${flash.id}/join`,{data:{accessToken:flash.accessToken,name:'Other isolated seat',requestId:crypto.randomUUID()}});expect(other.ok()).toBe(true);const otherSeat=await other.json()
 const pending:Promise<string>[]=[];page.on('response',r=>{if(r.url().includes(API)&&r.headers()['content-type']?.includes('json'))pending.push(r.text().catch(()=>''))})
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message))
 await join(page,sealed);await page.getByRole('button',{name:'Box 1',exact:true}).click()
 await expect(page.getByRole('heading',{name:'A square has four equal sides.',exact:true})).toBeVisible()
 const saved=await seat(page,sealed.id),audit:{method:string;path:string;status:number}[]=[]
 const guarded=[['GET',`/activities/${activity.id}`],['GET',`/activities/${activity.id}/approved`],...['practice','teacher-led','live'].map(context=>['GET',`/presentations/activities/${activity.id}/compatibility?context=${context}`]),['POST',`/presentations/activities/${activity.id}/preview`],['GET',`/delivery/assignments/${flash.id}/link`],['GET',`/reports/runs/${runId}`],['GET',`/reports/runs/${runId}/export.csv?sheet=all`],['GET',`/reports/runs/${runId}/export.xlsx`]]
 for(const token of [sealed.accessToken,saved.token])for(const [method,path] of guarded){
  const response=await page.request.fetch(API+path,{method,headers:{Authorization:`Bearer ${token}`,'x-role':'teacher'},...(method==='POST'?{data:flash.presentation}:{})})
  expect(response.status(),path).toBe(401);const body=await response.text();for(const value of [secret,hint])expect(body).not.toContain(value);audit.push({method,path,status:response.status()})
 }
 for(const [path,data,status] of [[`/delivery/assignments/${flash.id}/open`,{accessToken:sealed.accessToken},404],[`/delivery/assignments/${flash.id}/join`,{accessToken:sealed.accessToken,name:'Forged deck',requestId:crypto.randomUUID()},404],[`/delivery/attempts/${otherSeat.attemptId}/view`,{token:saved.token},404],[`/delivery/attempts/${saved.attemptId}/presentation`,{token:saved.token,requestId:crypto.randomUUID(),expectedRevision:1,action:'flip'},403],[`/delivery/attempts/${saved.attemptId}/view`,{token:saved.token,feedback:'immediate',mode:'study'},422]] as const){const r=await page.request.post(API+path,{data});expect(r.status(),path).toBe(status);const body=await r.text();for(const s of [secret,hint])expect(body).not.toContain(s);audit.push({method:'POST',path,status:r.status()})}
 const query='?mode=study&feedback=immediate&definitionId=flashcards&revealPolicy=on-request'
 const forged=await page.request.post(`${API}/delivery/attempts/${saved.attemptId}/view${query}`,{headers:{'x-feedback':'immediate'},data:{token:saved.token}});expect(forged.ok()).toBe(true)
 const view=await forged.json();expect(view.mode).toBe('homework');expect(view.feedbackPolicy).toBe('after_deadline');expect(view.reveal).toBeNull();expect(view.review).toEqual([])
 const before=await inspect(page,[secret,hint])
 await page.getByRole('button',{name:'True',exact:true}).click();await expect(page.getByText('Your answer is saved',{exact:true})).toBeVisible()
 await page.reload();await expect(page.getByText('Your answer is saved',{exact:true})).toBeVisible()
 const after=await inspect(page,[secret,hint]);const network=await Promise.all(pending)
 for(const body of network){expect(body).not.toContain(secret);expect(body).not.toContain(hint);expect(body).not.toMatch(/"correct"\s*:/)}
 expect(errors).toEqual([]);expect(audit).toHaveLength(25)
 await record(info,'restricted-surfaces',{audit,before,after,networkResponses:network.length})
 await page.screenshot({path:info.outputPath('sealed-after-reload.png'),fullPage:true})
})

for(const touch of [false,true])test(`T027 T028 flashcard ${touch?'touch':'keyboard'} navigation keeps hidden answers out of DOM and accessibility`,async({request,browser},info)=>{
 const {headers}=await instructor(request),secrets=['FIRST_REFERENCE_'+crypto.randomUUID(),'SECOND_REFERENCE_'+crypto.randomUUID()]
 const activity=await approved(request,headers,secrets.map((explanation,i)=>({kind:'tf',prompt:`Recall card ${i+1}: the moon is a star.`,payload:{correct:false},explanation})))
 const assigned=await assignment(request,headers,activity,'flashcards'),context=await browser.newContext({baseURL:process.env.PW_BASE_URL,hasTouch:touch,isMobile:touch,viewport:touch?{width:390,height:844}:{width:1440,height:900}}),page=await context.newPage()
 const use=async(name:string)=>{const button=page.getByRole('button',{name,exact:true});if(touch)await button.tap();else await keyboardButton(page,button)}
 try{
  await join(page,assigned);await use('Start round')
  const stage=page.locator('[data-presentation=flashcards]')
  const hidden=async()=>{await expect(stage.getByRole('region',{name:'Reference answer',includeHidden:true})).toHaveCount(0);await expect(stage.getByRole('button',{name:'Remembered',includeHidden:true})).toHaveCount(0);for(const s of secrets)expect(await stage.evaluate(el=>el.outerHTML)).not.toContain(s);const ax=await stage.ariaSnapshot();expect(ax).not.toContain('Reference answer');expect(ax).not.toContain('Remembered')}
  await hidden();await inspect(page,secrets)
  await use('Reveal answer');await expect(stage.getByRole('region',{name:'Reference answer',exact:true})).toContainText(secrets[0])
  await use('Remembered');await use('Show question');await hidden()
  await use('Next card');await expect(stage.getByRole('heading',{name:'Recall card 2: the moon is a star.'})).toBeVisible();await hidden()
  await use('Previous card');await expect(stage.getByRole('heading',{name:'Recall card 1: the moon is a star.'})).toBeVisible();await hidden()
  await use('Reveal answer');await expect(page.getByRole('button',{name:'Remembered',exact:true})).toHaveAttribute('aria-pressed','true')
  await use('Show question');await hidden();await use('Next card');await use('Reveal answer');await use('Learning');await use('Finish round')
  await expect(page.getByRole('heading',{name:'Round complete',exact:true})).toBeVisible()
  const saved=await seat(page,assigned.id),response=await page.request.post(`${API}/delivery/attempts/${saved.attemptId}/view`,{data:{token:saved.token}}),view=await response.json()
  expect(view.presentation.drawn).toHaveLength(2);expect(Object.values(view.presentation.ratings)).toEqual(['known','learning']);expect(view.questionCount).toBe(2)
  await record(info,'retained-recall-progress',{drawn:view.presentation.drawn,ratings:view.presentation.ratings,questionCount:view.questionCount})
  await page.screenshot({path:info.outputPath('accessible-card-completion.png'),fullPage:true})
 }finally{await context.close()}
})

test('T080 concealed memory and saved crossword keep pair truths and solutions out of browser surfaces',async({page,request},info)=>{
 const {headers}=await instructor(request),hidden=['PRIVATE_CAT_'+crypto.randomUUID(),'PRIVATE_DOG_'+crypto.randomUUID(),'PRIVATE_MEOW_'+crypto.randomUUID(),'PRIVATE_BARK_'+crypto.randomUUID()]
 const memory=await approved(request,headers,[{kind:'match',prompt:'Recall the two pairs.',payload:{cards:[{key:'a',text:hidden[0]},{key:'b',text:hidden[1]}],targets:[{key:'x',text:hidden[2]},{key:'y',text:hidden[3]}],map:{a:'x',b:'y'}}}])
 const assigned=await assignment(request,headers,memory,'memory'),responses:Promise<string>[]=[]
 page.on('response',r=>{if(r.url().includes('/delivery/')&&r.headers()['content-type']?.includes('json'))responses.push(r.text().catch(()=>''))})
 await join(page,assigned);await page.getByRole('button',{name:'Start round',exact:true}).click()
 await expect(page.getByRole('button',{name:'Reveal card 1',exact:true})).toBeVisible()
 const scanned=await inspect(page,hidden)
 for(const body of await Promise.all(responses)){for(const s of hidden)expect(body).not.toContain(s);expect(body).not.toMatch(/"map"\s*:/)}
 await record(info,'concealed-memory-surfaces',scanned)
 // Separate real authored board: no per-learner generation or answer injection.
 const made=await request.post(`${API}/activities`,{headers,data:{title:'Concealed authored crossword',subjectId:1,levelId:8,purposeId:2}});const {activity}=await made.json()
 const added=await request.post(`${API}/activities/${activity.id}/questions`,{headers,data:{kind:'vocabulary',prompt:'Use the reviewed clues.',payload:{schemaVersion:1,policy:{version:1,language:'en',diacritics:'preserve',tatweel:'preserve',case:'preserve',spaces:'preserve'},entries:[{id:'mineral',word:'QUARTZ',clue:'A crystalline mineral'},{id:'breeze',word:'ZEPHYR',clue:'A gentle breeze'}]}}});expect(added.ok()).toBe(true);const question=(await added.json()).question
 const board=await request.post(`${API}/activities/questions/${question.id}/word-board`,{headers,data:{kind:'crossword',expectedRevision:question.revision,requestId:crypto.randomUUID(),config:{seed:17,rows:10,columns:10}}});expect(board.ok()).toBe(true);expect((await board.json()).board.status).toBe('ready')
 expect((await request.post(`${API}/activities/${activity.id}/publish`,{headers})).ok()).toBe(true)
 const version=(await (await request.get(`${API}/activities/${activity.id}/approved`,{headers})).json()).versionId
 const crossword=await assignment(request,headers,{id:activity.id,ids:[question.id],version},'crossword');responses.length=0
 await join(page,crossword);await page.getByRole('button',{name:'Start round',exact:true}).click()
 await expect(page.getByText('A crystalline mineral',{exact:false})).toBeVisible()
 const grid=await inspect(page,['QUARTZ','ZEPHYR'])
 for(const body of await Promise.all(responses)){expect(body).not.toContain('QUARTZ');expect(body).not.toContain('ZEPHYR');expect(body).not.toMatch(/"solution"\s*:/)}
 await record(info,'concealed-grid-surfaces',grid)
 await page.screenshot({path:info.outputPath('concealed-crossword.png'),fullPage:true})
})

test('T099 unavailable image-only media has readable failure and recovers without losing the card',async({page,request},info)=>{
 const {owner,headers}=await instructor(request)
 const images=JSON.parse(execFileSync(process.execPath,['--import','./tests/bootstrap.mjs','tests/browser-image-fixture.ts',String(owner)],{cwd:resolve('../asasera-backend'),env:{...process.env,PG_HOST:'127.0.0.1',PG_PORT:process.env.E2E_PG_PORT??'55432',PG_DATABASE:process.env.E2E_PG_DATABASE,PG_USER:process.env.E2E_PG_USER??'postgres',PG_PASSWORD:'postgres',PG_SSL:'disable'},encoding:'utf8'})) as string[]
 const activity=await approved(request,headers,[{kind:'mcq',prompt:'Which reviewed image is blue?',payload:{options:[{key:'a',text:'',image:images[0]},{key:'b',text:'',image:images[1]}],correct:'a'}}]),assigned=await assignment(request,headers,activity,'flashcards')
 const matcher='**/api/v1/activity-media/file?*',errors:string[]=[];let denied=0
 page.on('pageerror',e=>errors.push(e.message));await page.route(matcher,route=>{denied++;return route.abort('failed')})
 await join(page,assigned);await page.getByRole('button',{name:'Start round',exact:true}).click()
 const stage=page.locator('[data-presentation=flashcards]')
 await expect(stage.getByRole('heading',{name:'Which reviewed image is blue?',exact:true})).toBeVisible()
 await expect.poll(()=>denied).toBeGreaterThanOrEqual(2)
 await expect(stage.getByText('Image unavailable.',{exact:false})).toHaveCount(2)
 await expect(stage.getByRole('button',{name:'Retry image: Image option 1',exact:true})).toBeVisible()
 await expect.poll(()=>stage.evaluate(el=>el.getAnimations({subtree:true}).filter(animation=>animation.playState==='running').length)).toBe(0)
 await page.screenshot({path:info.outputPath('unavailable-image.png'),fullPage:true})
 await page.getByRole('button',{name:'العربية',exact:true}).click();await page.setViewportSize({width:390,height:844})
 await expect(stage.getByText('الصورة غير متاحة.',{exact:false})).toHaveCount(2)
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false)
 const targets=await stage.getByRole('button',{name:/إعادة تحميل الصورة:/}).evaluateAll(buttons=>buttons.map(button=>({width:button.getBoundingClientRect().width,height:button.getBoundingClientRect().height})))
 for(const target of targets){expect(target.width).toBeGreaterThanOrEqual(44);expect(target.height).toBeGreaterThanOrEqual(44)}
 expect(denied).toBe(2)
 await page.screenshot({path:info.outputPath('unavailable-image-ar-390.png'),fullPage:true})
 await record(info,'media-recovery',{deniedRequests:denied,retryTargets:targets,automaticRetry:false})
 await page.unroute(matcher)
 await keyboardButton(page,stage.getByRole('button',{name:'إعادة تحميل الصورة: صورة الخيار 1',exact:true}))
 await keyboardButton(page,stage.getByRole('button',{name:'إعادة تحميل الصورة: صورة الخيار 2',exact:true}))
 await expect.poll(()=>stage.locator('img').evaluateAll(images=>images.length===2&&images.every(image=>(image as HTMLImageElement).naturalWidth>0))).toBe(true)
 await page.getByRole('button',{name:'English',exact:true}).click();await page.reload()
 await expect(stage.getByRole('heading',{name:'Which reviewed image is blue?',exact:true})).toBeVisible()
 await page.getByRole('button',{name:'Reveal answer',exact:true}).click();await page.getByRole('button',{name:'Learning',exact:true}).click();await page.getByRole('button',{name:'Finish round',exact:true}).click()
 await expect(page.getByRole('heading',{name:'Round complete',exact:true})).toBeVisible();expect(errors).toEqual([])
 await page.screenshot({path:info.outputPath('media-recovered-complete.png'),fullPage:true})
})
