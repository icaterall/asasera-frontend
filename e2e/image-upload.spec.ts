import {test,expect} from '@playwright/test'
import {execFileSync} from 'node:child_process'
import path from 'node:path'
import {localTeacher,isolatedStackOnly} from './local-fixture'

for(const [width,ar] of [[1440,false],[390,true]] as const)test(`image upload progress and preserved edits ${width}`,async({page})=>{
 isolatedStackOnly();await page.setViewportSize({width,height:900});const teacher=localTeacher()
 const fixture=JSON.parse(execFileSync(process.execPath,['--import','./tests/bootstrap.mjs','--input-type=module','-e',`
  import sharp from 'sharp';import {grantImage,localImageUpload} from './src/modules/activity-media/media.service.ts';import {approveFixtureImage} from './tests/image-fixture.ts';import {pool} from './src/db/pool.js';
  const owner=Number(process.argv[1]),bytes=await sharp({create:{width:120,height:80,channels:3,background:'#159664'}}).png().toBuffer();
  try{const g=await grantImage(owner,{contentType:'image/png',byteSize:bytes.length,filename:'diagram.png'});await localImageUpload(owner,g.assetId,bytes);console.log(JSON.stringify({...await approveFixtureImage(owner,g.assetId),uploadId:g.assetId}));}finally{await pool.end()}
 `,String(teacher.owner)],{cwd:path.resolve(import.meta.dirname,'../../asasera-backend'),env:{...process.env,NODE_ENV:'test',PG_HOST:'127.0.0.1',PG_PORT:'55432',PG_DATABASE:process.env.E2E_PG_DATABASE,PG_USER:'postgres',PG_PASSWORD:'postgres'},encoding:'utf8'}).trim().split('\n').at(-1)!)
 await page.addInitScript(ar=>localStorage.setItem('asasera.language',ar?'ar':'en'),ar)
 const login=await page.request.post('/api/v1/auth/login',{data:{email:teacher.email,password:teacher.password}});expect(login.ok()).toBeTruthy()
 const {accessToken}=await login.json(),headers={authorization:`Bearer ${accessToken}`}
 const created=await page.request.post('/api/v1/activities',{headers,data:{title:'Image progress fixture',subjectId:1,levelId:8,purposeId:2}}),{activity}=await created.json()
 await page.request.post(`/api/v1/activities/${activity.id}/questions`,{headers,data:{kind:'mcq',prompt:'Choose the answer',payload:{options:[{key:'a',text:'Water'},{key:'b',text:'Air'},{key:'c',text:'Soil'},{key:'d',text:'Light'}],correct:'a'}}})
 let releaseUpload!:()=>void;const uploading=new Promise<void>(resolve=>{releaseUpload=resolve});let complete=false
 let grants=0
 await page.route('**/api/v1/activity-media/uploads',route=>{grants++;return route.fulfill({json:{assetId:fixture.uploadId,uploadUrl:'/api/v1/activity-media/test-bytes',local:true}})})
 await page.route('**/api/v1/activity-media/test-bytes',async route=>{await uploading;await route.fulfill({status:204})})
 await page.route('**/api/v1/activity-media/uploads/*/confirm',route=>route.fulfill({status:202,json:{status:'PROCESSING',stage:'CHECKING'}}))
 await page.route('**/api/v1/activity-media/uploads/*/status',route=>route.fulfill({json:complete?{...fixture,status:'APPROVED'}:{status:'PROCESSING',stage:'CHECKING'}}))
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message))
 await page.goto(`/teacher/activities/${activity.id}`)
 const answer=page.locator('[data-answer-cell]').first(),text=answer.getByRole('textbox');await text.fill('H2O')
 const picker=page.waitForEvent('filechooser');await answer.getByRole('button',{name:ar?'صورة الإجابة':'Answer image',exact:true}).click()
 await (await picker).setFiles({name:'lesson-diagram.png',mimeType:'image/png',buffer:Buffer.from('synthetic bytes; upload is intercepted')})
 const upload=answer.locator('[data-image-upload]'),toolbarButton=answer.getByRole('button',{name:ar?'صورة الإجابة':'Answer image',exact:true})
 await expect(upload.getByRole('progressbar')).toBeVisible();await expect(toolbarButton).toBeDisabled();await expect(toolbarButton.locator('[data-button-spinner]')).toBeVisible()
 await expect(text).toBeEditable();await text.fill('H2O edited during upload')
 const empty=page.locator('[data-answer-cell]').nth(1);await empty.getByRole('textbox').fill('   ');await expect(empty.locator('input[type=radio]')).toBeDisabled();await expect(empty.locator('input[type=radio]')).not.toBeChecked()
 await expect(answer.getByRole('toolbar').getByRole('button',{name:/image|صورة/})).toHaveCount(0)
 await page.screenshot({path:`../screenshots/image-upload-progress-${width}.png`})
 releaseUpload();await expect(upload.getByRole('status')).toHaveText(ar?'جارٍ التحقق من الصورة…':'Checking your image…')
 await page.screenshot({path:`../screenshots/image-checking-${width}.png`})
 complete=true;await expect(upload.getByRole('status')).toHaveText(ar?'الصورة جاهزة':'Image ready')
 await expect(text).toHaveText('H2O edited during upload');await expect(toolbarButton).toBeEnabled();await expect(answer.locator('img')).toBeVisible()
 await text.fill('');await expect(answer.getByRole('radio')).toBeEnabled();await answer.getByRole('radio').check();await expect(answer.getByRole('radio')).toBeChecked()
 await page.screenshot({path:`../screenshots/answer-rectangles-${width}.png`})
 await text.fill('H2O edited during upload')
 await expect.poll(async()=>{const r=await page.request.get(`/api/v1/activities/${activity.id}`,{headers}),data=await r.json();return JSON.stringify(data.questions)}).toContain(fixture.objectKey)
 await page.reload();await expect(page.locator('[data-answer-cell]').first().getByRole('textbox')).toHaveText('H2O edited during upload')
 // Correctness lives inside the rectangle, persists, and disappears for an emptied option.
 await empty.getByRole('textbox').fill('Air');await empty.getByRole('radio').check()
 await expect(answer.getByRole('radio')).not.toBeChecked()
 await expect.poll(async()=>{const response=await page.request.get(`/api/v1/activities/${activity.id}`,{headers});return (await response.json()).questions[0].payload.correct}).toBe('b')
 await page.reload();await expect(empty.getByRole('radio')).toBeChecked()
 await empty.getByRole('textbox').fill('');await expect(empty.locator('input[type=radio]')).toBeDisabled();await expect(empty.locator('input[type=radio]')).not.toBeChecked()
 await answer.getByRole('radio').check()
 await page.getByRole('textbox',{name:ar?'عنوان النشاط':'Activity title',exact:true}).focus()
 await page.screenshot({path:`../screenshots/answer-final-${width}.png`})
 // An old backend must never receive even the raw bytes through its unchecked path.
 await page.route('**/api/v1/activity-media/limits',route=>route.fulfill({status:404,json:{error:{code:'not_found',message:'Not found'}}}))
 await text.focus();const oldPicker=page.waitForEvent('filechooser');await toolbarButton.click();await (await oldPicker).setFiles({name:'next.png',mimeType:'image/png',buffer:Buffer.from('fixture')})
 await expect(upload.getByRole('alert')).toContainText(ar?'رفع الصور غير متاح مؤقتًا':'Image uploads are temporarily unavailable')
 expect(grants).toBe(1);await expect(toolbarButton).toBeEnabled()
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(errors).toEqual([])
})
