import {localTeacher} from './local-fixture'
import {test,expect} from '@playwright/test'
import {createRequire} from 'node:module'
import {execFileSync} from 'node:child_process'
import path from 'node:path'
const require=createRequire(import.meta.url)
const sharp=require('../../asasera-backend/node_modules/sharp') as typeof import('../../asasera-backend/node_modules/sharp/lib/index.js')
async function add(page:import('@playwright/test').Page,type:string){
 await page.getByRole('button',{name:'أضف سؤالًا',exact:true}).first().click()
 await page.getByRole('dialog',{name:'ما نوع السؤال الجديد؟'}).getByRole('button',{name:type,exact:true}).click()
}
test('teacher authors ordering, matching, and confirmed image zones with durable saves',async({page})=>{
  test.setTimeout(120_000)
  const teacher=localTeacher(),{email,password}=teacher
  await page.addInitScript(()=>{localStorage.setItem('asasera.language','ar');localStorage.setItem('i18nextLng','ar')})
  const {accessToken}=await(await page.request.post('/api/v1/auth/login',{data:{email,password}})).json(),headers={authorization:`Bearer ${accessToken}`}
  const {activity}=await(await page.request.post('/api/v1/activities',{headers,data:{title:'اختبار أنواع الأسئلة · بيانات تجريبية',subjectId:1,levelId:8,purposeId:2}})).json()
  const imageFixture=JSON.parse(execFileSync(process.execPath,['--import','./tests/bootstrap.mjs','--input-type=module','-e',`
   import sharp from 'sharp';import {grantImage,localImageUpload} from './src/modules/activity-media/media.service.ts';import {approveFixtureImage} from './tests/image-fixture.ts';import {pool} from './src/db/pool.js';
   const owner=Number(process.argv[1]),bytes=await sharp({create:{width:640,height:400,channels:3,background:'#8bd3c7'}}).png().toBuffer();
   try{const grant=await grantImage(owner,{contentType:'image/png',byteSize:bytes.length,filename:'synthetic-zones.png'});await localImageUpload(owner,grant.assetId,bytes);console.log(JSON.stringify(await approveFixtureImage(owner,grant.assetId)))}finally{await pool.end()}
  `,String(teacher.owner)],{cwd:path.resolve(import.meta.dirname,'../../asasera-backend'),env:{...process.env,NODE_ENV:'test',PG_HOST:'127.0.0.1',PG_PORT:process.env.E2E_PG_PORT??'55432',PG_DATABASE:process.env.E2E_PG_DATABASE,PG_USER:process.env.E2E_PG_USER??'postgres',PG_PASSWORD:'postgres',PG_SSL:'disable'},encoding:'utf8'}).trim().split('\n').at(-1)!)
  await page.route('**/api/v1/activity-media/uploads',route=>route.fulfill({json:{assetId:imageFixture.assetId,uploadUrl:'/api/v1/activity-media/test-bytes',local:true}}))
  await page.route('**/api/v1/activity-media/test-bytes',route=>route.fulfill({status:204}))
  await page.route('**/api/v1/activity-media/uploads/*/confirm',route=>route.fulfill({json:{...imageFixture,status:'APPROVED'}}))
  await page.setViewportSize({width:1440,height:1000});await page.goto(`/teacher/activities/${activity.id}`)
  await add(page,'رتّب')
  await expect(page.locator('[data-question-thumb]')).toHaveCount(1)
  await expect(page.locator('main')).not.toHaveAttribute('inert','')
  const type=page.locator('aside [data-question-kind]').first()
  await page.getByLabel('نص السؤال').fill('رتب الأعداد تصاعديًا')
  await page.getByLabel('نص العنصر 1',{exact:true}).fill('واحد');await page.getByLabel('نص العنصر 2',{exact:true}).fill('اثنان');await page.getByLabel('نص العنصر 3',{exact:true}).fill('ثلاثة')
  await add(page,'مطابقة')
  await expect(page.locator('[data-question-thumb]')).toHaveCount(2)
  await expect(page.locator('main')).not.toHaveAttribute('inert','')
  await page.getByLabel('نص السؤال').fill('طابق العدد مع اسمه')
  await page.getByLabel('الهدف 1',{exact:true}).fill('واحد');await page.getByLabel('الهدف 2',{exact:true}).fill('اثنان')
  await page.getByLabel('البطاقة 1',{exact:true}).fill('1');await page.getByLabel('البطاقة 2',{exact:true}).fill('2')
  await add(page,'تحديد الإجابة')
  await expect(page.locator('[data-question-thumb]')).toHaveCount(3)
  await expect(page.locator('main')).not.toHaveAttribute('inert','')
  /* A pin question cannot be stored without a picture. The new-question flow
     therefore opens its image-first canvas and commits the hotspot kind only
     after the image is approved. */
  await expect(page.getByRole('heading',{name:'ابدأ بصورة',exact:true})).toBeVisible()
  await expect(type).toHaveAttribute('data-question-kind','mcq')
  const image=await sharp({create:{width:640,height:400,channels:3,background:'#8bd3c7'}}).png().toBuffer()
  const picker=page.waitForEvent('filechooser');await page.getByRole('button',{name:'ارفع صورة',exact:true}).click();await (await picker).setFiles({name:'synthetic-zones.png',mimeType:'image/png',buffer:image})
  await expect(type).toHaveAttribute('data-question-kind','hotspot',{timeout:20_000})
  await expect(page.getByRole('heading',{name:'حوّل الصورة إلى سؤال',exact:true})).toBeVisible({timeout:20_000})
  /* The approved image still has to resolve and decode before the zone editor
     becomes interactive. Filling a visible descendant while its workspace is
     inert sends keyboard input to the previously focused prompt in Chromium. */
  await expect(page.getByRole('region',{name:'محرر إجابات الصورة'})).not.toHaveAttribute('aria-busy','true',{timeout:20_000})
  const prompt=page.getByLabel('نص السؤال')
  const zoneAnswer=page.locator('input[aria-label="إجابة المنطقة 1"]')
  await prompt.fill('اختر المنطقة الأولى')
  await expect(prompt).toHaveText('اختر المنطقة الأولى')
  await expect(zoneAnswer).toBeVisible()
  await zoneAnswer.fill('المنطقة الأولى')
  await expect(zoneAnswer).toHaveValue('المنطقة الأولى')
  await expect(prompt).toHaveText('اختر المنطقة الأولى')
  await page.getByText('الشكل والموضع الدقيق',{exact:true}).click()
  await page.getByLabel('أفقي %',{exact:true}).fill('10');await page.getByLabel('رأسي %',{exact:true}).fill('10');await page.getByLabel('عرض %',{exact:true}).fill('30');await page.getByLabel('ارتفاع %',{exact:true}).fill('30')
  /* Publishing is now called approving: «اعتماد النسخة» for the first version and
     «اعتماد التغييرات» once one exists, and the blocking panel is «الاعتماد متوقّف». */
  await page.getByRole('button',{name:'اعتماد النسخة',exact:true}).click()
  await expect(page.getByRole('alert').filter({hasText:'الاعتماد متوقّف'})).toBeVisible()
  await page.getByRole('button',{name:'تأكيد مناطق الإجابة',exact:true}).click()
  await page.getByRole('button',{name:'اعتماد النسخة',exact:true}).click()
  await expect(page.getByRole('button',{name:'اعتماد التغييرات',exact:true})).toBeVisible()
  const loaded=await(await page.request.get(`/api/v1/activities/${activity.id}`,{headers})).json()
  expect(loaded.questions.map((q:{kind:string})=>q.kind)).toEqual(['order','match','hotspot'])
  expect(loaded.questions[0].payload.items.map((i:{text:string})=>i.text)).toEqual(['واحد','اثنان','ثلاثة'])
  expect(loaded.questions[2].payload.zones[0].x).toBeCloseTo(.1,1)
  await page.screenshot({path:'../screenshots/v4/editor-hotspot-1440.png',fullPage:true})
  await page.reload();await page.locator('[data-question-thumb]').nth(2).click()
  await expect(page.getByRole('heading',{name:'حوّل الصورة إلى سؤال',exact:true})).toBeVisible()
  await page.setViewportSize({width:390,height:844});await expect(page.locator('aside[aria-label="خصائص السؤال"]')).not.toBeVisible();await expect(page.locator('nav[aria-label="أسئلة النشاط"]')).not.toBeVisible();await expect(page.getByRole('navigation',{name:'أدوات المحرر'})).toBeVisible();await expect(page.locator('main img').first()).toBeVisible();await page.screenshot({path:'../screenshots/v4/editor-hotspot-390.png',fullPage:true})
  for(const width of [360,2560]){await page.setViewportSize({width,height:1000});const ratios=await page.locator('svg[class*=zoneEditor]').evaluate(el=>{const stage=el.getBoundingClientRect(),rect=el.querySelector('rect')!.getBoundingClientRect();return {x:(rect.x-stage.x)/stage.width,w:rect.width/stage.width}});expect(ratios.x).toBeCloseTo(.1,1);expect(ratios.w).toBeCloseTo(.3,1)}
})
