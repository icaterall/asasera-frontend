import {test,expect,type Page,type APIRequestContext} from '@playwright/test'
import {createRequire} from 'node:module'
const {Client}=createRequire(import.meta.url)('../../asasera-backend/node_modules/pg')
test.use({trace:'off',actionTimeout:12000})
test.beforeEach(()=>expect(process.env.PW_BASE_URL).toBe('http://127.0.0.1:5411'))

async function teacher(page:Page,request:APIRequestContext){
 const email=`context-${crypto.randomUUID()}@example.com`,password=`Synthetic-context-${crypto.randomUUID()}!`
 expect((await request.post('/api/v1/auth/register/teacher',{data:{name:'Context audit instructor',email,password}})).ok()).toBe(true)
 const login=await request.post('/api/v1/auth/login',{data:{email,password}});expect(login.ok()).toBe(true)
 const {accessToken,user}=await login.json(),headers={Authorization:`Bearer ${accessToken}`}
 await page.context().addCookies((await request.storageState()).cookies)
 await page.addInitScript(()=>localStorage.setItem('asasera.language','en'))
 await page.setViewportSize({width:1440,height:900})
 return {owner:user.id as number,headers}
}
async function lesson(request:APIRequestContext,headers:Record<string,string>,title:string,mixed=false){
 const made=await request.post('/api/v1/activities',{headers,data:{title,contentLanguage:'en',subjectId:1,levelId:8,purposeId:2}})
 expect(made.ok(),await made.text()).toBe(true);const {activity}=await made.json()
 const question={kind:'mcq',prompt:'Which properties belong to water?',payload:{options:[{key:'a',text:'It can freeze'},{key:'b',text:'It can flow'},{key:'c',text:'It can evaporate'},{key:'d',text:'All of the above'}],correct:'d'},explanation:'All three listed properties apply to water.'}
 const added=await request.post(`/api/v1/activities/${activity.id}/questions`,{headers,data:question});expect(added.ok()).toBe(true)
 const q=(await added.json()).question
 let excluded:number|undefined
 if(mixed){const extra=await request.post(`/api/v1/activities/${activity.id}/questions`,{headers,data:{kind:'order',prompt:'EXCLUDED: order the reviewed water cycle',payload:{items:[{key:'a',text:'Evaporation'},{key:'b',text:'Condensation'}],correct:['a','b']}}});expect(extra.ok()).toBe(true);excluded=(await extra.json()).question.id}
 return {activity,q,question,excluded}
}
// A guarded, teacher-scoped fixture boundary, not a generation workflow. No
// schema migration/seed/global counters. Every query is restricted to this ID.
async function stored(owner:number,activityId:number,operation:'read'|'provenance'|'newer',value?:number|string){
 const client=new Client({host:'127.0.0.1',port:55432,database:'asasera_interactive_browser_test_20260914',user:'postgres',password:'postgres',ssl:false})
 await client.connect()
 try{
  expect((await client.query('SELECT current_database() AS name')).rows[0].name).toBe('asasera_interactive_browser_test_20260914')
  expect((await client.query('SELECT author_id FROM activities WHERE id=$1',[activityId])).rows[0].author_id).toBe(owner)
  if(operation==='provenance')await client.query("INSERT INTO question_provenance(question_id,origin,material_revision_id,segment_indexes) SELECT id,'file',$2,'{1}' FROM questions WHERE activity_id=$1 AND kind='mcq'",[activityId,value])
  if(operation==='newer')expect((await client.query("UPDATE activity_runs SET presentation_config=jsonb_set(presentation_config,'{definitionVersion}','99') WHERE host_id=$1 AND activity_id=$2 AND id=(SELECT run_id FROM assignments WHERE id=$3)",[owner,activityId,value])).rowCount).toBe(1)
  const versions=(await client.query('SELECT id,snapshot FROM activity_versions WHERE activity_id=$1 ORDER BY id',[activityId])).rows
  const runs=(await client.query('SELECT id,version_id,presentation_config FROM activity_runs WHERE activity_id=$1 AND host_id=$2 ORDER BY id',[activityId,owner])).rows
  const answers=(await client.query("SELECT (v.snapshot->'questions'->a.q_index->>'id')::int AS question_id,a.correct,a.points FROM run_answers a JOIN activity_runs r ON r.id=a.run_id JOIN activity_versions v ON v.id=r.version_id WHERE r.activity_id=$1 AND r.host_id=$2 ORDER BY a.run_id,a.q_index",[activityId,owner])).rows
  return {versions,runs,answers}
 }finally{await client.end()}
}

test('T001 T002 homepage simple quiz and existing standalone/live wheel entrances return correctly',async({page,request},info)=>{
 test.setTimeout(90000)
 const {headers}=await teacher(page,request),errors:string[]=[],paid:string[]=[]
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.method()==='POST'&&/generation\/jobs|creation\/jobs/.test(r.url()))paid.push(r.url())})
 await page.goto('/teacher')
 await page.getByRole('link',{name:/^Random wheel/}).click()
 await expect(page.getByRole('heading',{name:'Random wheel',exact:true})).toBeVisible()
 await page.getByRole('link',{name:'Teacher tools',exact:true}).click();await expect(page).toHaveURL(/\/teacher\/tools$/)
 await page.goto('/teacher');await page.getByRole('link',{name:'Create a quiz from your lesson',exact:true}).click()
 await page.getByRole('textbox',{name:'Activity name',exact:true}).fill('Context audit simple quiz')
 const created=page.waitForResponse(r=>r.url().endsWith('/api/v1/activities')&&r.request().method()==='POST')
 await page.getByRole('button',{name:'Next',exact:true}).click();const {activity}=await (await created).json()
 await page.locator('[data-method=manual]').click()
 await page.getByRole('button',{name:'Add question',exact:true}).first().click()
 await page.getByRole('dialog',{name:'What kind of question?',exact:true}).getByRole('button',{name:/^Quiz/}).click()
 await page.getByLabel('Question text',{exact:true}).fill('Two plus two equals which number?')
 // The editor's visible labels are verified before filling; no hidden state setter.
 for(let i=1;i<=4;i++)await page.getByLabel(`Answer ${i} text`,{exact:true}).fill(String(i+1))
 await page.getByRole('radio',{name:'Answer 3 is correct',exact:true}).check()
 await page.getByRole('button',{name:'Approve version',exact:true}).click()
 await expect.poll(async()=>{const r=await request.get(`/api/v1/activities/${activity.id}/approved`,{headers});return r.status()}).toBe(200)
 await expect(page.getByRole('radio',{name:/Flashcards|Random cards|Question wheel/})).toHaveCount(0)
 await page.screenshot({path:info.outputPath('simple-quiz-approved.png'),fullPage:true})
 await page.getByRole('link',{name:'Asasera — dashboard',exact:true}).click()
 await page.getByRole('link',{name:'Start live: Context audit simple quiz',exact:true}).click()
 await expect(page.getByRole('radio',{name:'Questions in order',exact:true})).toBeChecked()
 await page.getByRole('button',{name:'Start live game',exact:true}).click()
 await expect(page.getByRole('button',{name:'Start class',exact:true})).toBeVisible()
 const classUrl=page.url()
 await page.getByRole('button',{name:'Random wheel',exact:true}).click()
 await expect(page.locator('[data-random-wheel]')).toBeVisible()
 await page.getByRole('button',{name:'Back to class',exact:true}).click()
 await expect(page.getByRole('button',{name:'Start class',exact:true})).toBeVisible();expect(page.url()).toBe(classUrl)
 await page.screenshot({path:info.outputPath('live-wheel-return.png'),fullPage:true})
 await page.locator('summary[aria-label="Session options"]').click()
 await page.getByRole('button',{name:'End class early',exact:true}).click()
 await expect(page.getByRole('heading',{name:'Class finished',exact:true})).toBeVisible()
 expect(errors).toEqual([]);expect(paid).toEqual([])
})

for(const language of ['en','ar'] as const)test(`T004 mixed-set selection identifies exclusions and requires consent before launch ${language}`,async({page,request},info)=>{
 const {headers}=await teacher(page,request),f=await lesson(request,headers,'Context mixed content',true)
 const ar=language==='ar'
 await page.addInitScript(lang=>localStorage.setItem('asasera.language',lang),language)
 await page.setViewportSize(ar?{width:390,height:844}:{width:1440,height:900})
 expect((await request.post(`/api/v1/activities/${f.activity.id}/publish`,{headers})).ok()).toBe(true)
 await page.goto(`/teacher/activities/${f.activity.id}/play?mode=study`)
 await page.getByRole('radio',{name:ar?/^بطاقات المراجعة/:/^Flashcards/}).check()
 const launch=page.getByRole('button',{name:ar?'أنشئ رابط المشاركة':'Create assignment link',exact:true}),consent=page.getByRole('checkbox',{name:ar?/^استخدم 1/:/^Use only 1 compatible questions; 1/})
 await expect(launch).toBeDisabled();await expect(consent).not.toBeChecked()
 const compatibility=await request.get(`/api/v1/presentations/activities/${f.activity.id}/compatibility?context=practice`,{headers});const compat=await compatibility.json()
 expect(compat.presentations.find((p:{definitionId:string})=>p.definitionId==='flashcards').excludedItemRefs).toEqual([{questionId:f.excluded,contentVersionId:compat.contentVersionId,reason:'incompatible-content'}])
 // Count alone cannot identify which authored question is being omitted.
 await expect.soft(page.getByText('EXCLUDED: order the reviewed water cycle',{exact:true})).toBeVisible()
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
 await page.evaluate(()=>{document.querySelectorAll('*').forEach(element=>{if(element.scrollTop)element.scrollTo({top:0,behavior:'instant'})});window.scrollTo({top:0,behavior:'instant'})})
 await page.screenshot({path:info.outputPath('mixed-exclusion-consent.png'),fullPage:true})
 await consent.scrollIntoViewIfNeeded()
 await page.screenshot({path:info.outputPath('mixed-exclusion-viewport.png')})
 await consent.check();await expect(launch).toBeEnabled()
 const response=page.waitForResponse(r=>r.url().endsWith('/delivery/assignments')&&r.request().method()==='POST')
 await launch.click();const assigned=await response;expect(assigned.ok()).toBe(true)
 const sent=assigned.request().postDataJSON();expect(sent.presentation.selectedQuestionIds).toEqual([f.q.id]);expect(sent.presentation.contentVersionId).toBe(compat.contentVersionId)
})

test('T003 T008 same approved MCQ keys and citations survive presentation reuse and an active draft edit',async({page,request,browser},info)=>{
 test.setTimeout(90000)
 const {owner,headers}=await teacher(page,request),f=await lesson(request,headers,'Context preserved source')
 const source=await request.post('/api/v1/teaching/materials/text',{headers,data:{title:'Synthetic cited lesson',text:'Water freezes, flows and evaporates.'}});expect(source.ok()).toBe(true)
 const {material}=await source.json();await stored(owner,f.activity.id,'provenance',material.revisionId)
 expect((await request.post(`/api/v1/activities/${f.activity.id}/publish`,{headers})).ok()).toBe(true)
 const before=await stored(owner,f.activity.id,'read'),version=before.versions[0]
 expect(version.snapshot.questions[0]).toMatchObject({id:f.q.id,prompt:f.question.prompt,payload:f.question.payload,explanation:f.question.explanation})
 expect(version.snapshot.questions[0].provenance).toMatchObject({origin:'file',materialRevisionId:material.revisionId,segmentIndexes:[1]})
 let link=''
 for(const label of ['Flashcards','Question wheel','Random cards']){
  await page.goto(`/teacher/activities/${f.activity.id}/play?mode=study`)
  await page.getByRole('radio',{name:new RegExp(`^${label}`)}).check()
  await page.getByRole('button',{name:'Create assignment link',exact:true}).click()
  link=await page.getByRole('textbox',{name:'Assignment link',exact:true}).inputValue()
  const saved=await stored(owner,f.activity.id,'read');expect(saved.versions).toEqual(before.versions)
  const run=saved.runs.at(-1);expect(run.version_id).toBe(version.id);expect(run.presentation_config.selectedQuestionIds).toEqual([f.q.id])
 }
 const learnerContext=await browser.newContext({baseURL:process.env.PW_BASE_URL})
 await learnerContext.addInitScript(()=>localStorage.setItem('asasera.language','en'))
 const learner=await learnerContext.newPage()
 try{
  await learner.goto(link);await learner.getByRole('textbox',{name:'Your name',exact:true}).fill('Pinned learner')
  await learner.getByRole('button',{name:'Start',exact:true}).click();await learner.getByRole('button',{name:'Start round',exact:true}).click()
  await expect(learner.getByRole('heading',{name:f.question.prompt,exact:true})).toBeVisible()
  const changed=await request.patch(`/api/v1/activities/questions/${f.q.id}`,{headers,data:{expectedRevision:f.q.revision,prompt:'DRAFT ONLY: different truth',payload:{...f.question.payload,correct:'a'}}});expect(changed.ok(),await changed.text()).toBe(true)
  await learner.reload();await expect(learner.getByRole('heading',{name:f.question.prompt,exact:true})).toBeVisible()
  await learner.getByRole('button',{name:/All of the above/}).click()
  await expect(learner.getByRole('status').filter({hasText:'Correct'})).toBeVisible()
  await learner.getByRole('button',{name:'Finish round',exact:true}).click();await expect(learner.getByRole('heading',{name:'Round complete',exact:true})).toBeVisible()
  const after=await stored(owner,f.activity.id,'read');expect(after.versions).toEqual(before.versions)
  expect(after.answers).toHaveLength(1);expect(after.answers[0]).toMatchObject({question_id:f.q.id,correct:true});expect(after.answers[0].points).toBeGreaterThan(0)
  const edited=(await changed.json()).question
  expect((await request.patch(`/api/v1/activities/questions/${f.q.id}`,{headers,data:{expectedRevision:edited.revision,payload:{...f.question.payload,correct:'b'}}})).ok()).toBe(true)
  expect((await stored(owner,f.activity.id,'read')).answers).toEqual(after.answers)
  const draft=await request.get(`/api/v1/activities/${f.activity.id}`,{headers});expect((await draft.json()).questions[0].payload.correct).toBe('b')
  await learner.screenshot({path:info.outputPath('pinned-graded-completion.png'),fullPage:true})
 }finally{await learnerContext.close()}
})

test('T010 a stored newer presentation configuration does not crash teacher activity or assignment libraries',async({page,request},info)=>{
 const {owner,headers}=await teacher(page,request),f=await lesson(request,headers,'Context newer configuration')
 expect((await request.post(`/api/v1/activities/${f.activity.id}/publish`,{headers})).ok()).toBe(true)
 await page.goto(`/teacher/activities/${f.activity.id}/play?mode=study`);await page.getByRole('radio',{name:/^Random cards/}).check()
 const created=page.waitForResponse(r=>r.url().endsWith('/delivery/assignments')&&r.request().method()==='POST')
 await page.getByRole('button',{name:'Create assignment link',exact:true}).click();const body=await (await created).json()
 await stored(owner,f.activity.id,'newer',body.id)
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message))
 await page.goto('/teacher/activities');await expect(page.getByRole('link',{name:f.activity.title,exact:true})).toBeVisible()
 await page.goto('/teacher/assignments');await expect(page.getByRole('heading',{name:f.activity.title,exact:true})).toBeVisible()
 await page.reload();await expect(page.getByRole('heading',{name:f.activity.title,exact:true})).toBeVisible()
 await expect(page.getByRole('link',{name:'Choose an activity',exact:true})).toBeVisible();expect(errors).toEqual([])
 await page.screenshot({path:info.outputPath('newer-config-library.png'),fullPage:true})
})
