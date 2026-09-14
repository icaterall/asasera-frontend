# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: image-upload.spec.ts >> image upload progress and preserved edits 1440
- Location: e2e/image-upload.spec.ts:6:60

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[data-answer-cell]').first().locator('[data-image-upload]').getByRole('progressbar')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('[data-answer-cell]').first().locator('[data-image-upload]').getByRole('progressbar') with timeout 5000ms
  - waiting for locator('[data-answer-cell]').first().locator('[data-image-upload]').getByRole('progressbar')

```

```yaml
- banner "Editor bar":
  - link "Asasera — dashboard":
    - /url: /teacher/dashboard
    - img "Asasera"
  - heading "Image progress fixture" [level=1]
  - textbox "Activity title": Image progress fixture
  - text: Saved
  - 'button "Available balance: 0. Open account and usage"':
    - strong: "0"
    - text: Add credit
  - button "Account menu — Teacher"
  - group "Activity actions":
    - button "Save" [disabled]
    - button "Undo"
    - button "Activity settings"
    - button "More"
    - button "Approve version"
- navigation "Activity questions":
  - button "Duplicate question"
  - button "Delete question"
  - paragraph: 1 Quiz
  - button "Choose the answer"
  - button "Add question"
  - button "Generate with AI"
  - paragraph: From a topic or your uploaded sources.
- main:
  - textbox "Question text":
    - paragraph: Choose the answer
  - button "Question image (optional)": Find and insert media (Optional) Upload file or drag here to upload
  - button "Remove answer 1"
  - textbox "Answer 1 text":
    - paragraph: H2O
  - radio "Answer 1 is correct" [checked]
  - button "Answer image" [disabled]
  - progressbar "Image upload"
  - button "Remove answer 2"
  - textbox "Answer 2 text":
    - paragraph: Air
  - radio "Answer 2 is correct"
  - button "Answer image"
  - button "Remove answer 3"
  - textbox "Answer 3 text":
    - paragraph: Soil
  - radio "Answer 3 is correct"
  - button "Answer image"
  - button "Remove answer 4"
  - textbox "Answer 4 text":
    - paragraph: Light
  - radio "Answer 4 is correct"
  - button "Answer image"
  - button "Add more answers"
  - text: Explanation (optional)
  - textbox "Explanation (optional)":
    - /placeholder: Why is this answer correct? Learners see it after the answer window closes.
- complementary "Question properties":
  - heading "Question properties" [level=2]
  - button "Fold properties" [expanded]
  - tablist "Sidebar panel":
    - tab "Question properties" [selected]
    - tab "Themes"
  - text: Question type
  - button "Question type":
    - strong: Quiz
  - text: Time limit
  - combobox "Time limit in seconds": 20 seconds
  - button "Apply to all questions"
  - text: Points
  - combobox "Points": Standard
  - button "Duplicate question"
  - button "Delete question"
```

# Test source

```ts
  1  | import {test,expect} from '@playwright/test'
  2  | import {execFileSync} from 'node:child_process'
  3  | import path from 'node:path'
  4  | import {localTeacher,isolatedStackOnly} from './local-fixture'
  5  | 
  6  | for(const [width,ar] of [[1440,false],[390,true]] as const)test(`image upload progress and preserved edits ${width}`,async({page})=>{
  7  |  isolatedStackOnly();await page.setViewportSize({width,height:900});const teacher=localTeacher()
  8  |  const fixture=JSON.parse(execFileSync(process.execPath,['--import','./tests/bootstrap.mjs','--input-type=module','-e',`
  9  |   import sharp from 'sharp';import {grantImage,localImageUpload} from './src/modules/activity-media/media.service.ts';import {approveFixtureImage} from './tests/image-fixture.ts';import {pool} from './src/db/pool.js';
  10 |   const owner=Number(process.argv[1]),bytes=await sharp({create:{width:120,height:80,channels:3,background:'#159664'}}).png().toBuffer();
  11 |   try{const g=await grantImage(owner,{contentType:'image/png',byteSize:bytes.length,filename:'diagram.png'});await localImageUpload(owner,g.assetId,bytes);console.log(JSON.stringify({...await approveFixtureImage(owner,g.assetId),uploadId:g.assetId}));}finally{await pool.end()}
  12 |  `,String(teacher.owner)],{cwd:path.resolve(import.meta.dirname,'../../asasera-backend'),env:{...process.env,NODE_ENV:'test',PG_HOST:'127.0.0.1',PG_PORT:'55432',PG_DATABASE:process.env.E2E_PG_DATABASE,PG_USER:'postgres',PG_PASSWORD:'postgres'},encoding:'utf8'}).trim().split('\n').at(-1)!)
  13 |  await page.addInitScript(ar=>localStorage.setItem('asasera.language',ar?'ar':'en'),ar)
  14 |  const login=await page.request.post('/api/v1/auth/login',{data:{email:teacher.email,password:teacher.password}});expect(login.ok()).toBeTruthy()
  15 |  const {accessToken}=await login.json(),headers={authorization:`Bearer ${accessToken}`}
  16 |  const created=await page.request.post('/api/v1/activities',{headers,data:{title:'Image progress fixture',subjectId:1,levelId:8,purposeId:2}}),{activity}=await created.json()
  17 |  await page.request.post(`/api/v1/activities/${activity.id}/questions`,{headers,data:{kind:'mcq',prompt:'Choose the answer',payload:{options:[{key:'a',text:'Water'},{key:'b',text:'Air'},{key:'c',text:'Soil'},{key:'d',text:'Light'}],correct:'a'}}})
  18 |  let releaseUpload!:()=>void;const uploading=new Promise<void>(resolve=>{releaseUpload=resolve});let complete=false
  19 |  let grants=0
  20 |  await page.route('**/api/v1/activity-media/uploads',route=>{grants++;return route.fulfill({json:{assetId:fixture.uploadId,uploadUrl:'/api/v1/activity-media/test-bytes',local:true}})})
  21 |  await page.route('**/api/v1/activity-media/test-bytes',async route=>{await uploading;await route.fulfill({status:204})})
  22 |  await page.route('**/api/v1/activity-media/uploads/*/confirm',route=>route.fulfill({status:202,json:{status:'PROCESSING',stage:'CHECKING'}}))
  23 |  await page.route('**/api/v1/activity-media/uploads/*/status',route=>route.fulfill({json:complete?{...fixture,status:'APPROVED'}:{status:'PROCESSING',stage:'CHECKING'}}))
  24 |  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message))
  25 |  await page.goto(`/teacher/activities/${activity.id}`)
  26 |  const answer=page.locator('[data-answer-cell]').first(),text=answer.getByRole('textbox');await text.fill('H2O')
  27 |  const picker=page.waitForEvent('filechooser');await answer.getByRole('button',{name:ar?'صورة الإجابة':'Answer image',exact:true}).click()
  28 |  await (await picker).setFiles({name:'lesson-diagram.png',mimeType:'image/png',buffer:Buffer.from('synthetic bytes; upload is intercepted')})
  29 |  const upload=answer.locator('[data-image-upload]'),toolbarButton=answer.getByRole('button',{name:ar?'صورة الإجابة':'Answer image',exact:true})
> 30 |  await expect(upload.getByRole('progressbar')).toBeVisible();await expect(toolbarButton).toBeDisabled();await expect(toolbarButton.locator('[data-button-spinner]')).toBeVisible()
     |                                                ^ Error: expect(locator).toBeVisible() failed
  31 |  await expect(text).toBeEditable();await text.fill('H2O edited during upload')
  32 |  const empty=page.locator('[data-answer-cell]').nth(1);await empty.getByRole('textbox').fill('   ');await expect(empty.locator('input[type=radio]')).toBeDisabled();await expect(empty.locator('input[type=radio]')).not.toBeChecked()
  33 |  await expect(answer.getByRole('toolbar').getByRole('button',{name:/image|صورة/})).toHaveCount(0)
  34 |  await page.screenshot({path:`../screenshots/image-upload-progress-${width}.png`})
  35 |  releaseUpload();await expect(upload.getByRole('status')).toHaveText(ar?'جارٍ التحقق من الصورة…':'Checking your image…')
  36 |  await page.screenshot({path:`../screenshots/image-checking-${width}.png`})
  37 |  complete=true;await expect(upload.getByRole('status')).toHaveText(ar?'الصورة جاهزة':'Image ready')
  38 |  await expect(text).toHaveText('H2O edited during upload');await expect(toolbarButton).toBeEnabled();await expect(answer.locator('img')).toBeVisible()
  39 |  await text.fill('');await expect(answer.getByRole('radio')).toBeEnabled();await answer.getByRole('radio').check();await expect(answer.getByRole('radio')).toBeChecked()
  40 |  await page.screenshot({path:`../screenshots/answer-rectangles-${width}.png`})
  41 |  await text.fill('H2O edited during upload')
  42 |  await expect.poll(async()=>{const r=await page.request.get(`/api/v1/activities/${activity.id}`,{headers}),data=await r.json();return JSON.stringify(data.questions)}).toContain(fixture.objectKey)
  43 |  await page.reload();await expect(page.locator('[data-answer-cell]').first().getByRole('textbox')).toHaveText('H2O edited during upload')
  44 |  // Correctness lives inside the rectangle, persists, and disappears for an emptied option.
  45 |  await empty.getByRole('textbox').fill('Air');await empty.getByRole('radio').check()
  46 |  await expect(answer.getByRole('radio')).not.toBeChecked()
  47 |  await expect.poll(async()=>{const response=await page.request.get(`/api/v1/activities/${activity.id}`,{headers});return (await response.json()).questions[0].payload.correct}).toBe('b')
  48 |  await page.reload();await expect(empty.getByRole('radio')).toBeChecked()
  49 |  await empty.getByRole('textbox').fill('');await expect(empty.locator('input[type=radio]')).toBeDisabled();await expect(empty.locator('input[type=radio]')).not.toBeChecked()
  50 |  await answer.getByRole('radio').check()
  51 |  await page.getByRole('textbox',{name:ar?'عنوان النشاط':'Activity title',exact:true}).focus()
  52 |  await page.screenshot({path:`../screenshots/answer-final-${width}.png`})
  53 |  // An old backend must never receive even the raw bytes through its unchecked path.
  54 |  await page.route('**/api/v1/activity-media/limits',route=>route.fulfill({status:404,json:{error:{code:'not_found',message:'Not found'}}}))
  55 |  await text.focus();const oldPicker=page.waitForEvent('filechooser');await toolbarButton.click();await (await oldPicker).setFiles({name:'next.png',mimeType:'image/png',buffer:Buffer.from('fixture')})
  56 |  await expect(upload.getByRole('alert')).toContainText(ar?'رفع الصور غير متاح مؤقتًا':'Image uploads are temporarily unavailable')
  57 |  expect(grants).toBe(1);await expect(toolbarButton).toBeEnabled()
  58 |  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(errors).toEqual([])
  59 | })
  60 | 
```