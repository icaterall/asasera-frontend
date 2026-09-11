import {selectOption} from './select-option'
import {localTeacher} from './local-fixture'
import {test,expect} from '@playwright/test'
import {createRequire} from 'node:module'
const require=createRequire(import.meta.url)
const sharp=require('../../asasera-backend/node_modules/sharp') as typeof import('../../asasera-backend/node_modules/sharp/lib/index.js')
test('teacher authors ordering, matching, and confirmed image zones with durable saves',async({page})=>{
  test.setTimeout(120_000)
  const {email,password}=localTeacher()
  const {accessToken}=await(await page.request.post('/api/v1/auth/login',{data:{email,password}})).json(),headers={authorization:`Bearer ${accessToken}`}
  const {activity}=await(await page.request.post('/api/v1/activities',{headers,data:{title:'اختبار أنواع الأسئلة · بيانات تجريبية',subjectId:1,levelId:8,purposeId:2}})).json()
  await page.setViewportSize({width:1440,height:1000});await page.goto(`/teacher/activities/${activity.id}`)
  await page.getByRole('button',{name:'أضف سؤالًا',exact:true}).first().click()
  await expect(page.locator('[data-question-thumb]')).toHaveCount(1)
  await expect(page.locator('main')).not.toHaveAttribute('inert','')
  const type=page.locator('aside [data-select-trigger]').first()
  await selectOption(type,'order');await page.getByLabel('نص السؤال').fill('رتب الأعداد تصاعديًا')
  await page.getByLabel('العنصر 1',{exact:true}).fill('واحد');await page.getByLabel('العنصر 2',{exact:true}).fill('اثنان')
  await page.getByRole('button',{name:'أضف عنصرًا',exact:true}).click();await page.getByLabel('العنصر 3',{exact:true}).fill('ثلاثة')
  await page.getByRole('button',{name:'أضف سؤالًا',exact:true}).first().click()
  await expect(page.locator('[data-question-thumb]')).toHaveCount(2)
  await expect(page.locator('main')).not.toHaveAttribute('inert','')
  await selectOption(type,'match');await page.getByLabel('نص السؤال').fill('طابق العدد مع اسمه')
  await page.getByLabel('الهدف 1',{exact:true}).fill('واحد');await page.getByLabel('الهدف 2',{exact:true}).fill('اثنان')
  await page.getByLabel('البطاقة 1',{exact:true}).fill('1');await page.getByLabel('البطاقة 2',{exact:true}).fill('2')
  await page.getByRole('button',{name:'أضف سؤالًا',exact:true}).first().click()
  await expect(page.locator('[data-question-thumb]')).toHaveCount(3)
  await expect(page.locator('main')).not.toHaveAttribute('inert','')
  /* «مناطق الصورة» is the one kind that cannot be applied on its own: zones need a picture
     to be drawn on, so choosing it with no media asks for the image first and the upload is
     what commits the kind. Assert both halves rather than the immediate commit. */
  await type.click();await page.locator('[role="option"][data-option-value="hotspot"]:visible').click()
  await expect(page.getByText('أضف الصورة أولًا لرسم مناطق الإجابة.',{exact:true})).toBeVisible()
  await expect(type).toHaveAttribute('data-select-value','mcq')
  const image=await sharp({create:{width:640,height:400,channels:3,background:'#8bd3c7'}}).png().toBuffer()
  await page.locator('aside input[type=file]').setInputFiles({name:'synthetic-zones.png',mimeType:'image/png',buffer:image})
  await expect(type).toHaveAttribute('data-select-value','hotspot',{timeout:20_000})
  await expect(page.getByRole('heading',{name:'مناطق الصورة',exact:true})).toBeVisible({timeout:20_000})
  await page.getByLabel('نص السؤال').fill('اختر المنطقة الأولى')
  await page.getByRole('button',{name:'ارسم حدود المنطقة',exact:true}).click()
  const box=await page.locator('div[class*="zoneEditor"]').boundingBox();expect(box).not.toBeNull()
  await page.mouse.move(box!.x+box!.width*.1,box!.y+box!.height*.1);await page.mouse.down();await page.mouse.move(box!.x+box!.width*.4,box!.y+box!.height*.4);await page.mouse.up()
  /* Publishing is now called approving: «اعتماد النسخة» for the first version and
     «اعتماد التغييرات» once one exists, and the blocking panel is «الاعتماد متوقّف». */
  await page.getByRole('button',{name:'اعتماد النسخة',exact:true}).click()
  await expect(page.getByRole('alert').filter({hasText:'الاعتماد متوقّف'})).toBeVisible()
  await page.getByRole('button',{name:'راجعت حدود المناطق وأؤكدها',exact:true}).click()
  await page.getByRole('button',{name:'اعتماد النسخة',exact:true}).click()
  await expect(page.getByRole('button',{name:'اعتماد التغييرات',exact:true})).toBeVisible()
  const loaded=await(await page.request.get(`/api/v1/activities/${activity.id}`,{headers})).json()
  expect(loaded.questions.map((q:{kind:string})=>q.kind)).toEqual(['order','match','hotspot'])
  expect(loaded.questions[0].payload.items.map((i:{text:string})=>i.text)).toEqual(['واحد','اثنان','ثلاثة'])
  expect(loaded.questions[2].payload.zones[0].x).toBeCloseTo(.1,1)
  await page.screenshot({path:'../screenshots/v4/editor-hotspot-1440.png',fullPage:true})
  await page.reload();await page.locator('[data-question-thumb]').nth(2).click()
  await expect(page.getByRole('heading',{name:'مناطق الصورة',exact:true})).toBeVisible()
  await page.setViewportSize({width:390,height:844});await expect(page.locator('aside')).not.toBeVisible();await expect(page.locator('nav')).not.toBeVisible();await expect(page.locator('main img').first()).toBeVisible();await page.screenshot({path:'../screenshots/v4/editor-hotspot-390.png',fullPage:true})
  for(const width of [360,2560]){await page.setViewportSize({width,height:1000});const ratios=await page.locator('div[class*=zoneEditor]').evaluate(el=>{const stage=el.getBoundingClientRect(),rect=el.querySelector('rect')!.getBoundingClientRect();return {x:(rect.x-stage.x)/stage.width,w:rect.width/stage.width}});expect(ratios.x).toBeCloseTo(.1,1);expect(ratios.w).toBeCloseTo(.3,1)}
})
