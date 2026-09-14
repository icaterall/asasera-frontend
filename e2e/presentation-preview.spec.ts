import {test,expect} from '@playwright/test'
test.use({trace:'off'})
for(const language of ['en','ar'] as const)test(`approved presentation preview is local and reusable ${language}`,async({page,request})=>{
 const ar=language==='ar',origin=process.env.PW_BASE_URL??'http://127.0.0.1:5411'
 expect(new URL(origin).hostname).toMatch(/^(127\.0\.0\.1|localhost)$/)
 const email=`preview-${crypto.randomUUID()}@example.com`,password=`Synthetic-only-${crypto.randomUUID()}!`
 expect((await request.post('/api/v1/auth/register/teacher',{data:{name:'Synthetic preview instructor',email,password}})).ok()).toBe(true)
 const login=await request.post('/api/v1/auth/login',{data:{email,password}});expect(login.ok()).toBe(true)
 const {accessToken}=await login.json(),headers={Authorization:`Bearer ${accessToken}`}
 const activityResponse=await request.post('/api/v1/activities',{headers,data:{title:ar?'معاينة درس معتمد':'Approved lesson preview',subjectId:1,levelId:8,purposeId:2,contentLanguage:language}})
 expect(activityResponse.ok()).toBe(true);const {activity}=await activityResponse.json()
 const policy={version:1,language,diacritics:'preserve',tatweel:'preserve',case:'preserve',spaces:'preserve'}
 const sources=[
  {kind:'tf',prompt:ar?'القمر نجم.':'The moon is a star.',payload:{correct:false},explanation:ar?'القمر تابع طبيعي للأرض.':'The moon is a natural satellite.'},
  {kind:'match',prompt:ar?'صل الحيوان بمجموعته.':'Match animals to groups.',payload:{cards:[{key:'cat',text:ar?'قطة':'Cat'},{key:'bird',text:ar?'عصفور':'Bird'}],targets:[{key:'mammal',text:ar?'ثدييات':'Mammals'},{key:'avian',text:ar?'طيور':'Birds'}],map:{cat:'mammal',bird:'avian'}}},
  {kind:'cloze',prompt:ar?'أكمل الجملة المعتمدة.':'Complete the approved sentence.',payload:{schemaVersion:1,segments:[{kind:'text',text:ar?'نبدأ في ':'We begin in the '},{kind:'blank',blankId:'time'}],blanks:[{id:'time',acceptedAnswers:ar?['الصباح','النهار']:['morning','daytime']}],policy,trimBoundaryWhitespace:true}},
  {kind:'vocabulary',prompt:ar?'ابحث عن الكلمات المعتمدة.':'Find the reviewed words.',payload:{schemaVersion:1,entries:ar?[{id:'moon',word:'قمر',clue:'تابع الأرض'},{id:'soup',word:'مرق',clue:'طعام سائل'}]:[{id:'cat',word:'cat',clue:'A pet'},{id:'act',word:'act',clue:'Do something'}],policy}},
 ]
 let vocabulary:{id:number;revision:number}|undefined
 for(const source of sources){const added=await request.post(`/api/v1/activities/${activity.id}/questions`,{headers,data:source});expect(added.ok()).toBe(true);if(source.kind==='vocabulary')vocabulary=(await added.json()).question}
 for(const kind of ['word-search','crossword']){const made=await request.post(`/api/v1/activities/questions/${vocabulary!.id}/word-board`,{headers,data:{kind,expectedRevision:vocabulary!.revision,requestId:crypto.randomUUID(),config:{seed:7,rows:7,columns:7}}});expect(made.ok(),await made.text()).toBe(true);const body=await made.json();expect(body.board.status).toBe('ready');vocabulary=body.question}
 expect((await request.post(`/api/v1/activities/${activity.id}/publish`,{headers})).ok()).toBe(true)
 await page.context().addCookies((await request.storageState()).cookies)
 await page.addInitScript(lang=>localStorage.setItem('asasera.language',lang),language)
 await page.setViewportSize(ar?{width:390,height:844}:{width:1440,height:900})
 const errors:string[]=[],mutations:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{const path=new URL(r.url()).pathname;if(r.method()==='POST'&&/\/api\/v1\/(delivery|activities|sessions)/.test(path))mutations.push(path)})
 await page.goto(`/teacher/activities/${activity.id}/play?mode=study`)
 for(const [id,en,arabic] of [['flashcards','Flashcards','بطاقات المراجعة'],['memory','Memory','الذاكرة'],['sentence-completion','Complete the sentence','إكمال الجملة'],['word-builder','Word builder','بناء الكلمات'],['word-search','Word search','البحث عن الكلمات'],['crossword','Crossword','الكلمات المتقاطعة']]){
  await page.getByRole('radio',{name:new RegExp(`^${ar?arabic:en}`)}).check()
  const subset=page.getByRole('checkbox',{name:new RegExp(ar?'^استخدم':'^Use only')});if(await subset.isVisible())await subset.check()
  const response=page.waitForResponse(r=>r.url().endsWith(`/presentations/activities/${activity.id}/preview`)&&r.request().method()==='POST')
  await page.getByRole('button',{name:ar?'معاينة المحتوى المعتمد':'Preview approved content',exact:true}).click()
  expect((await response).ok()).toBe(true)
  const preview=page.getByRole('region',{name:ar?'معاينة العرض':'Presentation preview',exact:true})
  await expect(preview).toBeVisible()
  if(id==='flashcards'){
   await expect(preview.getByText(sources[0]!.explanation!,{exact:true})).toHaveCount(0)
   await preview.getByRole('button',{name:ar?'أظهر الإجابة المرجعية':'Show reference answer',exact:true}).click()
   await expect(preview.getByText(sources[0]!.explanation!,{exact:true})).toBeVisible()
  }else if(id==='memory'){
   await preview.getByRole('button',{name:ar?'اكشف البطاقة 1':'Reveal card 1',exact:true}).click()
   await expect(preview.locator('[data-state=revealed]')).toHaveCount(1)
  }else if(id==='sentence-completion'){
   await preview.getByRole('textbox',{name:ar?'الفراغ 1':'Blank 1'}).fill(ar?'النهار':'daytime')
   await preview.getByRole('button',{name:ar?'إرسال الإجابة':'Submit answer',exact:true}).click()
   await expect(preview.getByRole('status').filter({hasText:ar?'إجابة صحيحة':'Correct.'})).toBeVisible()
   await preview.getByText(ar?'الإجابات المقبولة وقواعد المقارنة':'Accepted answers and comparison policy',{exact:true}).click()
  }else if(id==='word-search'||id==='crossword'){
   await preview.getByRole('button',{name:ar?'أظهر الإجابة المرجعية':'Show reference answer',exact:true}).click()
   await expect(preview.getByRole('button',{name:ar?'احفظ الكلمة':'Save word',exact:true})).toHaveCount(0)
  }
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all(document.getAnimations().filter(a=>a.effect?.getTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{})));document.querySelectorAll('*').forEach(element=>{if(element.scrollTop)element.scrollTo({top:0,behavior:'instant'})});window.scrollTo({top:0,behavior:'instant'})})
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
  await page.screenshot({path:`../docs/evidence/interactive/approved-preview-${id}-${language}.png`,fullPage:true,mask:[page.getByText(email,{exact:false})]})
  const bounds=await preview.boundingBox();expect(bounds).not.toBeNull()
  await page.screenshot({path:`../docs/evidence/interactive/approved-preview-${id}-${language}-detail.png`,fullPage:true,clip:bounds!})
  await preview.getByRole('button',{name:ar?'إعادة المعاينة':'Reset preview',exact:true}).click()
  if(id==='memory')await expect(preview.locator('[data-state=revealed]')).toHaveCount(0)
 }
 expect(mutations).toEqual([]);expect(errors).toEqual([])
 await expect(page.getByRole('textbox',{name:ar?'رابط النشاط':'Assignment link'})).toHaveCount(0)
})
