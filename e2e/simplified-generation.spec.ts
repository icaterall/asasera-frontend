import {expect,test,type Page} from '@playwright/test'
import {isolatedStackOnly,localTeacher} from './local-fixture'
import {selectOption} from './select-option'

/** Browser-only paid-response fixtures. Authentication, activity loading, and material intake
 * use an isolated local API; every generation route is intercepted, so these tests spend $0.
 * Server execution/accounting is verified separately by backend integration tests. */
test.use({viewport:{width:1440,height:900}})
const OUT='../screenshots/creation-methods'
async function openEditor(page:Page,locale='en'){
 /* The guard is about isolation, not about one port: these tests seed and delete rows,
    so they must run against a throwaway `*test*` database and a loopback API that is not
    the shared development stack on 5173. The isolated stack's port changes per release. */
 isolatedStackOnly()
 const teacher=localTeacher()
 await page.addInitScript(lang=>localStorage.setItem('asasera.language',lang),locale)
 const login=await page.request.post('/api/v1/auth/login',{data:{email:teacher.email,password:teacher.password}});expect(login.ok()).toBeTruthy()
 const {accessToken}=await login.json()
 const create=await page.request.post('/api/v1/activities',{headers:{authorization:`Bearer ${accessToken}`},data:{title:'Browser fixture — دورة الماء',subjectId:1,levelId:8,purposeId:2}});expect(create.ok()).toBeTruthy()
 const {activity}=await create.json();await page.goto(`/teacher/activities/${activity.id}`)
 if((page.viewportSize()?.width??1440)<1000)await page.getByRole('button',{name:locale==='ar'?'الأسئلة':'Questions',exact:true}).click()
 const opener=page.getByRole('button',{name:locale==='ar'?'توليد بالذكاء الاصطناعي':'Generate with AI',exact:true});await opener.click()
 return {activity,opener,accessToken}
}
async function paidFixtures(page:Page,{locale='en',unavailable=false}:{locale?:string;unavailable?:boolean}={}){
 const requests:{path:string;method:string;body:Record<string,unknown>|null}[]=[];let state='queued',applied:number[]=[];let activityId=0;let questionId:number|null=null
 const candidates=[{kind:'mcq',prompt:locale==='ar'?'ما مصدر الطاقة الذي يسبب تبخر الماء؟':'What supplies the energy for water evaporation?',payloadJson:JSON.stringify({options:[{key:'a',text:locale==='ar'?'الشمس':'The Sun'},{key:'b',text:locale==='ar'?'القمر':'The Moon'}],correct:'a'}),explanation:locale==='ar'?'تسخّن الشمس الماء فيتبخر.':'The Sun heats water, causing evaporation.',sourceSegments:[]}, {kind:'tf',prompt:locale==='ar'?'يتكثف بخار الماء ليكوّن السحب.':'Water vapor condenses to form clouds.',payloadJson:'{"correct":true}',explanation:locale==='ar'?'يتحول بخار الماء إلى قطرات في السحب.':'Water vapor becomes droplets in clouds.',sourceSegments:[]}]
 const job=()=>({id:900001,activityId,task:'questions',state,questionId,origin:'topic',settledMillicents:12,errorCode:null,result:state==='succeeded'?{candidates:questionId?candidates.slice(0,1):candidates,appliedIndexes:applied,nextRevision:1}:null})
 await page.route('**/api/v1/activity-generation/**',async route=>{
  const r=route.request(),path=new URL(r.url()).pathname,body=r.method()==='POST'?r.postDataJSON():null;requests.push({path,method:r.method(),body})
  if(path.endsWith('/quote'))return route.fulfill({json:{quoteId:'11111111-1111-4111-8111-111111111111',quoteExpiresAt:'2999-01-01T00:00:00Z',estimateMillicents:1,maxAuthorizedMillicents:149,usableMillicents:99999,affordable:true,pricingAvailable:true,generationAvailable:!unavailable}})
  if(path.endsWith('/jobs')&&r.method()==='POST'){activityId=Number(body.activityId);questionId=body.questionId;setTimeout(()=>{state='succeeded'},400);return route.fulfill({json:{job:job()}})}
  if(path.endsWith('/apply')){applied=[...new Set([...applied,...body.selected])];return route.fulfill({json:{added:body.selected.length,remaining:candidates.length-applied.length}})}
  if(path.endsWith('/jobs/900001'))return route.fulfill({json:{job:job()}})
  if(/\/activities\/\d+$/.test(path))return route.fulfill({json:{jobs:[]}})
  return route.fulfill({status:400,json:{error:{code:'unexpected_fixture_route',message:'Unexpected fixture request'}}})
 });return requests
}
for(const m of [{locale:'en',w:1440,h:900,dark:false},{locale:'ar',w:1440,h:900,dark:true},{locale:'ar',w:768,h:1024,dark:false},{locale:'ar',w:390,h:844,dark:false},{locale:'en',w:360,h:740,dark:true}]){
 test(`compact creation/review browser fixture ${m.locale} ${m.w} ${m.dark?'dark':'light'}`,async({page})=>{
  await page.setViewportSize({width:m.w,height:m.h});const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));const requests=await paidFixtures(page,{locale:m.locale});const {opener}=await openEditor(page,m.locale)
  const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible()
  await page.evaluate(d=>document.documentElement.classList.toggle('dark',d),m.dark)
  await page.screenshot({path:`${OUT}/choices-${m.locale}-${m.w}.png`});await dialog.getByRole('button',{name:m.locale==='ar'?'موضوع إلى اختبار':'Topic to quiz',exact:true}).click()
  const topic=dialog.getByLabel(m.locale==='ar'?'موضوع الدرس':'Lesson topic');await topic.fill(m.locale==='ar'?'دورة الماء — الصف الخامس':'Water cycle — Grade 5')
  const create=dialog.getByRole('button',{name:m.locale==='ar'?/توليد [5٥] أسئلة بالذكاء الاصطناعي/:'Generate 5 questions with AI',exact:true});await expect(create).toBeEnabled()
  await expect(dialog).not.toContainText(/OpenAI|Gemini|misconception|weekly|تسميات التصورات|المهمة/)
  const money=(await dialog.locator('footer bdi').allTextContents()).map(v=>Number(v.replace(/[٠-٩]/g,c=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(c))).replace('٫','.').replace(/[^0-9.]/g,'')));expect(money).toContain(0.00149);expect(money).toContain(0.00001)
  expect(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true)
  const footer=await create.boundingBox();expect(footer!.y+footer!.height).toBeLessThanOrEqual(m.h)
  await page.screenshot({path:`${OUT}/create-${m.locale}-${m.w}-${m.dark?'dark':'light'}.png`})
  for(let i=0;i<16;i++){await page.keyboard.press('Tab');expect(await dialog.evaluate(el=>el.contains(document.activeElement))).toBe(true)}
  await create.click();await expect(page.getByText(m.locale==='ar'?'جارٍ تحضير أسئلتك…':'Preparing your questions…',{exact:true})).toBeVisible()
  await expect(page.locator('article h3').filter({hasText:m.locale==='ar'?'ما مصدر الطاقة الذي يسبب تبخر الماء؟':'What supplies the energy for water evaporation?'})).toBeVisible({timeout:8000})
  await page.getByRole('button',{name:m.locale==='ar'?'تحديد الكل':'Select all',exact:true}).click()
  await page.screenshot({path:`${OUT}/review-${m.locale}-${m.w}-${m.dark?'dark':'light'}.png`})
  const add=page.getByRole('button',{name:m.locale==='ar'?'أضف سؤالين':'Add 2 questions',exact:true});await expect(add).toBeEnabled();await add.click();await expect(page.getByText(m.locale==='ar'?'أُضيفت الأسئلة. يمكنك تعديلها داخل النشاط.':'Questions added. You can edit them in the activity.',{exact:true})).toBeVisible()
  expect(requests.filter(r=>r.path.endsWith('/jobs')&&r.method==='POST')).toHaveLength(1);expect(requests.some(r=>r.path.includes('labels'))).toBe(false)
  expect(requests.find(r=>r.path.endsWith('/quote'))?.body).not.toHaveProperty('provider');expect(errors).toEqual([])
  await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();await expect(opener).toBeFocused()
 })
}
test('quote changes, source switching and unavailable recovery browser fixture',async({page})=>{
 const requests=await paidFixtures(page,{unavailable:true});await openEditor(page)
 const dialog=page.getByRole('dialog');await dialog.getByRole('button',{name:'Topic to quiz',exact:true}).click();await dialog.getByLabel('Lesson topic').fill('Water cycle')
 await expect(dialog).toContainText('Question creation is temporarily unavailable');await expect(dialog.getByRole('button',{name:'Generate 5 questions with AI',exact:true})).toBeDisabled()
 await selectOption(dialog.getByRole('combobox',{name:'Number of questions'}),'10');await expect(dialog.getByRole('button',{name:'Generate 10 questions with AI',exact:true})).toBeDisabled()
 await dialog.getByRole('button',{name:'Change creation method'}).click();await dialog.getByRole('button',{name:'Topic to quiz',exact:true}).click();await dialog.getByRole('button',{name:'Paste text',exact:true}).click();await expect(dialog.getByLabel('Lesson text')).toBeVisible();await expect(dialog.getByRole('button',{name:'Generate 10 questions with AI',exact:true})).toBeDisabled()
 await page.screenshot({path:`${OUT}/text-unavailable-en-1440.png`});expect(requests.some(r=>r.path.endsWith('/jobs')&&r.method==='POST')).toBe(false)
})
test('real text intake, saved file and source-switch isolation with fixture quote only',async({page})=>{
 const requests=await paidFixtures(page);const {activity}=await openEditor(page)
 const dialog=page.getByRole('dialog');await dialog.getByRole('button',{name:'Topic to quiz',exact:true}).click();await dialog.getByRole('button',{name:'Paste text',exact:true}).click()
 await dialog.getByLabel('Lesson text').fill('The Sun warms water. Water vapor rises, cools and condenses into clouds. Rain returns water to Earth.')
 await dialog.getByRole('button',{name:'Use this lesson text',exact:true}).click();await expect(dialog.getByRole('button',{name:'Generate 5 questions with AI',exact:true})).toBeEnabled()
 expect(requests.filter(r=>r.path.endsWith('/quote')).at(-1)?.body?.origin).toBe('file');expect(requests.filter(r=>r.path.endsWith('/quote')).at(-1)?.body?.segments).toEqual([1])
 await page.screenshot({path:`${OUT}/text-source-en-1440.png`})
 await dialog.getByRole('button',{name:'Change creation method'}).click();await dialog.getByRole('button',{name:'PDF or slides to quiz',exact:true}).click();await expect(dialog.getByRole('button',{name:'Generate 5 questions with AI',exact:true})).toBeDisabled()
 await dialog.getByRole('button',{name:'Choose a saved file',exact:true}).click();const chooser=dialog.getByRole('combobox',{name:'Choose a saved file'});await chooser.click();await page.getByRole('option',{name:activity.title,exact:true}).click()
 await expect(dialog.getByRole('button',{name:'Generate 5 questions with AI',exact:true})).toBeEnabled();await page.screenshot({path:`${OUT}/saved-source-en-1440.png`})
 expect(requests.some(r=>r.path.endsWith('/jobs')&&r.method==='POST')).toBe(false)
})
test('real file extraction and unreadable recovery stay source-backed without paid work',async({page})=>{
 const requests=await paidFixtures(page);await openEditor(page)
 const dialog=page.getByRole('dialog');await dialog.getByRole('button',{name:'PDF or slides to quiz',exact:true}).click()
 await dialog.locator('input[type=file]').setInputFiles('../asasera-backend/tests/fixtures/en-water-cycle.pdf')
 await expect(dialog.getByRole('button',{name:'Generate 5 questions with AI',exact:true})).toBeEnabled({timeout:15000});await expect(dialog).toContainText('en-water-cycle.pdf');await page.screenshot({path:`${OUT}/pdf-source-en-1440.png`})
 /* The page selector now opens with the file, so the range is already on screen; clicking the
    disclosure collapses it. Check both directions instead of assuming it starts closed. */
 const pages=dialog.getByText('Change pages',{exact:true}),range=dialog.getByLabel('Page or slide range')
 await expect(range).toBeVisible();await pages.click();await expect(range).toBeHidden();await pages.click();await expect(range).toBeVisible()
 await dialog.getByRole('button',{name:'Change source',exact:true}).click();await dialog.locator('input[type=file]').setInputFiles('../asasera-backend/tests/fixtures/image-only-page.pdf')
 await expect(dialog).toContainText('This file has no readable lesson text',{timeout:15000});await expect(dialog.getByRole('button',{name:'Generate 5 questions with AI',exact:true})).toBeDisabled();await page.screenshot({path:`${OUT}/unreadable-source-en-1440.png`})
 expect(requests.some(r=>r.path.endsWith('/jobs')&&r.method==='POST')).toBe(false)
})
test('320 CSS pixel reflow and long text scrolling keep footer reachable',async({page})=>{
 await page.setViewportSize({width:320,height:720});await paidFixtures(page);await openEditor(page,'ar')
 const dialog=page.getByRole('dialog');await dialog.getByRole('button',{name:'موضوع إلى اختبار',exact:true}).click();await dialog.getByRole('button',{name:'الصق نصًا',exact:true}).click();await dialog.getByLabel('نص الدرس').fill('يتبخر الماء بفعل حرارة الشمس، ثم يتكثف بخار الماء ليكوّن السحب. '.repeat(40))
 await dialog.getByText('إعدادات الأسئلة',{exact:true}).click()
 expect(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true)
 const footer=dialog.locator('footer');await expect(footer).toBeInViewport();await dialog.locator('[class*=body]').evaluate(el=>el.scrollTo(0,el.scrollHeight));await expect(footer).toBeInViewport()
 await page.screenshot({path:`${OUT}/reflow-ar-320-long-text.png`})
})
test('admin configuration renders and saves through existing page (browser DTO fixture)',async({page})=>{
 await paidFixtures(page);const {accessToken}=await openEditor(page)
 // Real API refuses this actual teacher. The separate visual fixture below is not authorization evidence.
 expect((await page.request.get('/api/v1/admin/ai-settings',{headers:{authorization:`Bearer ${accessToken}`}})).status()).toBe(403)
 expect((await page.request.put('/api/v1/admin/ai-settings',{headers:{authorization:`Bearer ${accessToken}`},data:{provider:'gemini',model:'gemini-2.5-flash',enabled:true,expectedVersion:1}})).status()).toBe(403)
 await page.route('**/api/v1/auth/refresh',async r=>r.fulfill({json:{accessToken:'browser-only-fixture',user:{id:999,name:'Admin browser fixture',email:'admin-fixture@example.invalid',role:'admin',locale:'en',emailVerified:true}}}))
 let policy={version:1,provider:'openai',model:'gpt-5-mini',enabled:true};let saves=0
 await page.route('**/api/v1/admin/ai-settings',async r=>{if(r.request().method()==='PUT'){const input=r.request().postDataJSON();saves++;policy={version:2,provider:input.provider,model:input.model,enabled:input.enabled}}await r.fulfill({json:{policy,models:[{id:'gpt-5-mini',provider:'openai',configured:true,structuredOutput:true,pricingAvailable:true},{id:'gemini-2.5-flash',provider:'gemini',configured:true,structuredOutput:true,pricingAvailable:true}],ready:true,history:[{...policy,actorUserId:999,createdAt:'2026-09-10T12:00:00Z'}]}})})
 await page.goto('/admin/ai-settings');await expect(page.getByRole('heading',{name:'AI settings',exact:true})).toBeVisible()
 await selectOption(page.getByRole('combobox',{name:'Provider',exact:true}),'gemini');await page.getByRole('button',{name:'Save settings',exact:true}).click();expect(saves).toBe(1)
 await page.reload();await expect(page.getByRole('combobox',{name:'Provider',exact:true}).first()).toHaveAttribute('data-select-value','gemini')
 await page.screenshot({path:`${OUT}/admin-policy-en-1440-fixture.png`})
})
test('contextual alternative keeps original until confirmation (browser paid fixture)',async({page})=>{
 const requests=await paidFixtures(page);const {activity,accessToken}=await openEditor(page);await page.keyboard.press('Escape')
 const headers={authorization:`Bearer ${accessToken}`};const response=await page.request.post(`/api/v1/activities/${activity.id}/questions`,{headers,data:{kind:'tf',prompt:'The original question must survive rejection.',payload:{correct:true}}});expect(response.ok()).toBeTruthy();const {question}=await response.json()
 await page.reload();await page.getByRole('button',{name:'Suggest another question',exact:true}).click()
 const dialog=page.getByRole('dialog',{name:'Suggest another question',exact:true});await expect(dialog).toContainText(question.prompt);await expect(dialog.getByRole('combobox',{name:'Number of questions'})).toHaveCount(0)
 await expect(dialog.getByRole('button',{name:'Suggest another question',exact:true})).toBeEnabled();await dialog.getByRole('button',{name:'Suggest another question',exact:true}).click()
 /* A review card leads with the suggested prompt as its heading (QuestionCandidate), as the batch review above. */
 await expect(dialog.locator('article h3').filter({hasText:'What supplies the energy for water evaporation?'})).toBeVisible({timeout:8000});await page.screenshot({path:`${OUT}/replacement-review-en-1440.png`});await dialog.getByRole('button',{name:'Keep original',exact:true}).click()
 const current=await(await page.request.get(`/api/v1/activities/${activity.id}`,{headers})).json();expect(current.questions.find((q:{id:number})=>q.id===question.id).prompt).toBe(question.prompt)
 expect(requests.filter(r=>r.path.endsWith('/jobs')&&r.method==='POST')[0]?.body?.count).toBe(1);expect(requests.some(r=>r.path.endsWith('/apply'))).toBe(false)
})
test('material and legacy launchers converge on the same source-aware creator',async({page})=>{
 await paidFixtures(page);const {accessToken}=await openEditor(page);await page.keyboard.press('Escape');const headers={authorization:`Bearer ${accessToken}`}
 const m=await page.request.post('/api/v1/teaching/materials/text',{headers,data:{title:'Launcher fixture lesson',text:'The water cycle includes evaporation, condensation, precipitation and collection. Sunlight powers evaporation.'}});expect(m.ok()).toBeTruthy();const {material}=await m.json()
 await page.goto('/teacher/materials');await page.getByRole('link',{name:`Create quiz from this material: ${material.title}`,exact:true}).click();await page.getByLabel('Activity name',{exact:true}).fill('From my material');await page.getByRole('button',{name:'Next',exact:true}).click();await page.getByRole('button',{name:'PDF or slides to quiz',exact:true}).click()
 const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();await expect(dialog).toContainText(material.title);await expect(dialog.getByRole('button',{name:'Generate 5 questions with AI',exact:true})).toBeEnabled();await page.screenshot({path:`${OUT}/material-launcher-preselected-en-1440.png`})
 await page.keyboard.press('Escape');const c=await page.request.post('/api/v1/teaching/courses',{headers,data:{title:'Legacy launcher fixture course'}});const {course}=await c.json();const l=await page.request.post('/api/v1/teaching/lessons',{headers,data:{title:'Legacy launcher fixture lesson',course_id:course.id,material_revision_id:material.revisionId,scope_segments:[1]}});expect(l.ok()).toBeTruthy();const {lesson}=await l.json()
 await page.goto(`/teacher/lessons/${lesson.id}`);await page.getByRole('button',{name:/Generate with AI/}).first().click();await page.getByRole('button',{name:'Open question creator',exact:true}).click();await expect(page).toHaveURL(/\/teacher\/activities\/\d+/);await expect(dialog).toBeVisible();await expect(dialog).toContainText(material.title);await page.screenshot({path:`${OUT}/legacy-launcher-preselected-en-1440.png`})
})
test('Arabic file intake and unavailable message remain readable on mobile',async({page})=>{
 await page.setViewportSize({width:390,height:844});const requests=await paidFixtures(page,{locale:'ar',unavailable:true});await openEditor(page,'ar')
 const dialog=page.getByRole('dialog');await dialog.getByRole('button',{name:'ملف أو شرائح إلى اختبار',exact:true}).click();await dialog.locator('input[type=file]').setInputFiles('../asasera-backend/tests/fixtures/ar-photosynthesis.docx')
 await expect(dialog).toContainText('ar-photosynthesis.docx');await expect(dialog).toContainText('إنشاء الأسئلة غير متاح مؤقتًا',{timeout:15000});expect(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true)
 await page.screenshot({path:`${OUT}/file-unavailable-ar-390.png`});expect(requests.some(r=>r.path.endsWith('/jobs')&&r.method==='POST')).toBe(false)
})

test('file extraction options and editable single-question review',async({page})=>{
 const requests=await paidFixtures(page);await openEditor(page)
 const d=page.getByRole('dialog');await d.getByRole('button',{name:'PDF or slides to quiz',exact:true}).click()
 await d.locator('input[type=file]').setInputFiles('../asasera-backend/tests/fixtures/en-water-cycle.pdf')
 await expect(d.getByRole('radio',{name:'Extract existing questions',exact:true})).toBeVisible()
 await d.getByRole('radio',{name:'Extract existing questions',exact:true}).check()
 const generate=d.getByRole('button',{name:'Extract questions with AI',exact:true});await expect(generate).toBeEnabled()
 expect(requests.filter(r=>r.path.endsWith('/jobs'))).toHaveLength(0)
 await page.screenshot({path:`${OUT}/file-extraction-options.png`})
 await generate.click();const first=d.getByRole('article',{name:'Question 1',exact:true});await expect(first).toBeVisible()
 await first.getByText('Edit question and picture',{exact:true}).click()
 await first.getByLabel('Question',{exact:true}).fill('Which source heats water?')
 await expect(first.getByText('Question image (optional)',{exact:true})).toBeVisible()
 await page.screenshot({path:`${OUT}/file-extraction-review-edit.png`})
 await first.getByRole('button',{name:'Add this question',exact:true}).click();await expect(first.getByText('Added',{exact:true})).toBeVisible()
 await d.getByRole('button',{name:'Add all remaining (1)',exact:true}).click()
 const applications=requests.filter(r=>r.path.endsWith('/apply'));expect(applications[0]?.body).toMatchObject({selected:[0],edits:[{index:0,question:{prompt:'Which source heats water?'}}]});expect(applications[1]?.body).toMatchObject({selected:[1]})
 expect(requests.find(r=>r.path.endsWith('/jobs'))?.body).toMatchObject({mode:'extract',origin:'file'})
})
