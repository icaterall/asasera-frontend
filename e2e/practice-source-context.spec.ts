import {test,expect} from '@playwright/test'
import {createRequire} from 'node:module'
const {Client}=createRequire(import.meta.url)('../../asasera-backend/node_modules/pg')

for(const language of ['en','ar'] as const)for(const definition of ['flashcards','speaking-cards'] as const)test(`pinned permitted source on ${definition} both faces ${language}`,async({page,request})=>{
 test.setTimeout(60000)
 expect(new URL(process.env.PW_BASE_URL??'http://127.0.0.1:5411').hostname).toMatch(/^(127\.0\.0\.1|localhost)$/)
 const ar=language==='ar',flash=definition==='flashcards',width=ar?390:1440,height=ar?844:900,email=`source-${crypto.randomUUID()}@example.com`,password='Synthetic source fixture2026!'
 expect((await request.post('/api/v1/auth/register/teacher',{data:{name:'Source instructor',email,password}})).ok()).toBe(true)
 const login=await request.post('/api/v1/auth/login',{data:{email,password}}),{accessToken,user}=await login.json(),headers={Authorization:`Bearer ${accessToken}`}
 const create=await request.post('/api/v1/activities',{headers,data:{title:ar?'سياق المصدر التجريبي':'Synthetic source context',contentLanguage:language,subjectId:1,levelId:8,purposeId:2}}),{activity}=await create.json()
 const prompt=flash?(ar?'القمر نجم.':'The moon is a star.'):(ar?'ناقش الفرق بين النجم والقمر.':'Discuss the difference between a star and the moon.')
 const correction=ar?'القمر ليس نجمًا.':'The moon is not a star.'
 const added=await request.post(`/api/v1/activities/${activity.id}/questions`,{headers,data:{kind:flash?'tf':'discussion',prompt,payload:flash?{correct:false}:{schemaVersion:1,referenceResponse:correction},explanation:flash?correction:undefined}})
 expect(added.ok()).toBe(true)
 // Only synthetic provenance is seeded: no generator, uploaded file, or provider call.
 const database=process.env.E2E_PG_DATABASE,port=Number(process.env.E2E_PG_PORT??55432)
 expect(database).toContain('test')
 const db=new Client({host:'127.0.0.1',port,database,user:process.env.E2E_PG_USER??'postgres',password:'postgres',ssl:false})
 let questionId:number
 await db.connect()
 try{
  expect((await db.query('SELECT current_database() AS name')).rows[0].name).toBe(database)
  expect((await db.query('SELECT author_id FROM activities WHERE id=$1',[activity.id])).rows[0].author_id).toBe(user.id)
  questionId=(await db.query('SELECT id FROM questions WHERE activity_id=$1',[activity.id])).rows[0].id
  await db.query("INSERT INTO question_provenance(question_id,origin,segment_indexes) VALUES($1,'file',ARRAY[2,4])",[questionId])
 }finally{await db.end()}
 const published=await request.post(`/api/v1/activities/${activity.id}/publish`,{headers});expect(published.ok()).toBe(true)
 const {versionId}=await published.json()
 const selection={definitionId:definition,definitionVersion:1,adapterVersion:1,contentVersionId:versionId,selectedQuestionIds:[questionId],config:{context:'practice',semantics:flash?'self-rated':'discussion',noRepeat:true,revealPolicy:'on-request'}}
 const made=await request.post('/api/v1/delivery/assignments',{headers,data:{activityId:activity.id,mode:'study',feedback:'immediate',classId:null,deadline:new Date(Date.now()+3600000).toISOString(),requestId:crypto.randomUUID(),presentation:selection}})
 expect(made.ok(),await made.text()).toBe(true)
 const assignment=await made.json(),errors:string[]=[]
 page.on('pageerror',error=>errors.push(error.message))
 await page.addInitScript(lang=>localStorage.setItem('asasera.language',lang),language)
 await page.setViewportSize({width,height})
 await page.goto(`/learn/${assignment.id}#${assignment.accessToken}`)
 await page.getByRole('textbox',{name:ar?'اسمك':'Your name'}).fill(ar?'طالب تجريبي':'Synthetic learner')
 await page.getByRole('button',{name:ar?'ابدأ':'Start',exact:true}).click()
 const frontResponse=page.waitForResponse(response=>response.url().endsWith('/presentation')&&response.request().method()==='POST')
 await page.getByRole('button',{name:ar?'ابدأ الجولة':'Start round'}).click()
 const front=await(await frontResponse).json()
 expect(front.question.sourceContext).toEqual({origin:'file',sections:[2,4]})
 expect(JSON.stringify(front)).not.toMatch(/materialRevisionId|jobId|segmentIndexes|storageKey|sourceUrl/)
 const label=ar?'المصدر: مادة مرفوعة · أقسام المصدر 2، 4':'Source: uploaded material · source sections 2, 4'
 await expect(page.locator('[data-source-context]')).toHaveText(label)
 await expect(page.getByRole('heading',{name:prompt,exact:true})).toBeVisible()
 await expect(page.locator('[data-source-context] a')).toHaveCount(0)
 await page.screenshot({path:`../docs/evidence/interactive/source-${definition}-${language}-front.png`,fullPage:true})
 await page.getByRole('button',{name:flash?(ar?'اكشف الإجابة':'Reveal answer'):(ar?'إظهار المرجع إن وجد':'Show reference if available'),exact:true}).click()
 await expect(page.locator('[data-source-context]')).toHaveText(label)
 await expect(page.getByText(correction,{exact:true})).toBeVisible()
 await page.reload()
 await expect(page.locator('[data-source-context]')).toHaveText(label)
 await expect(page.getByText(correction,{exact:true})).toBeVisible()
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
 await page.screenshot({path:`../docs/evidence/interactive/source-${definition}-${language}-back.png`,fullPage:true})
 // The same pinned source must not appear in a scored assessment surface.
 if(flash){
  const sealed=await request.post('/api/v1/delivery/assignments',{headers,data:{activityId:activity.id,mode:'homework',feedback:'after_submission',classId:null,deadline:new Date(Date.now()+3600000).toISOString(),requestId:crypto.randomUUID(),presentation:{...selection,definitionId:'open-box',config:{...selection.config,semantics:'scored',revealPolicy:'after-submission'}}}})
  expect(sealed.ok()).toBe(true);const homework=await sealed.json()
  await page.goto(`/learn/${homework.id}#${homework.accessToken}`)
  await page.getByRole('textbox',{name:ar?'اسمك':'Your name'}).fill('Sealed learner')
  await page.getByRole('button',{name:ar?'ابدأ':'Start',exact:true}).click()
  const sealedResponse=page.waitForResponse(response=>response.url().endsWith('/presentation')&&response.request().method()==='POST')
  await page.getByRole('button',{name:ar?'الصندوق 1':'Box 1',exact:true}).click()
  expect(JSON.stringify(await(await sealedResponse).json())).not.toMatch(/sourceContext|segmentIndexes|materialRevisionId|jobId/)
  await expect(page.getByRole('heading',{name:prompt,exact:true})).toBeVisible()
  await expect(page.locator('[data-source-context]')).toHaveCount(0)
 }
 expect(errors).toEqual([])
})
