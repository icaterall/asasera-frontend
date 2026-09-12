import {test,expect} from '@playwright/test'
import {execFileSync} from 'node:child_process'
import {readFileSync,unlinkSync} from 'node:fs'
import {randomUUID} from 'node:crypto'
import path from 'node:path'
import {isolatedStackOnly} from './local-fixture'
for(const width of [1440,390])test(`PDF source shows original page images ${width}`,async({page})=>{
 isolatedStackOnly();await page.setViewportSize({width,height:1000})
 const file=`/tmp/asasera-browser-${randomUUID()}.json`
 let fixture:{email:string;password:string;activityId:number}
 try{execFileSync(process.execPath,['scripts/v4/seed-provenance-browser.ts',file],{cwd:path.resolve(import.meta.dirname,'../../asasera-backend'),env:{...process.env,NODE_ENV:'test',PG_HOST:'127.0.0.1',PG_PORT:'55432',PG_DATABASE:process.env.E2E_PG_DATABASE,PG_USER:'postgres',PG_PASSWORD:'postgres',PG_SSL:'disable'},stdio:'pipe'});fixture=JSON.parse(readFileSync(file,'utf8'))}finally{try{unlinkSync(file)}catch{}}
 await page.addInitScript(()=>localStorage.setItem('asasera.language','ar'))
 expect((await page.request.post('/api/v1/auth/login',{data:{email:fixture.email,password:fixture.password}})).ok()).toBeTruthy()
 await page.goto(`/teacher/activities/${fixture.activityId}`)
 await page.locator('[data-source-chip="file"]').click()
 const panel=page.locator('[data-source-panel]'),images=panel.locator('img')
 await expect(images).toHaveCount(2)
 for(const img of await images.all()){await img.scrollIntoViewIfNeeded();await expect.poll(()=>img.evaluate((el:HTMLImageElement)=>el.naturalWidth)).toBe(420)}
 await expect(panel.locator('details').first()).not.toHaveAttribute('open','')
 await panel.locator('summary').first().click();await expect(panel.locator('details').first()).toHaveAttribute('open','')
 await panel.locator('summary').first().click()
 expect(await panel.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true)
 await page.screenshot({path:`/tmp/asasera-pdf-source-${width}.png`})
 await panel.getByRole('button',{name:'أغلق المصدر'}).click();await expect(panel).toHaveCount(0)
 await page.goto('/teacher/activities/new')
 await page.getByLabel('اسم النشاط',{exact:true}).fill('صفحات المصدر')
 await page.getByRole('button',{name:'التالي',exact:true}).click()
 await page.getByRole('button',{name:'ملف أو شرائح إلى اختبار',exact:true}).click()
 const dialog=page.getByRole('dialog');await dialog.locator('input[type=file]').setInputFiles('../asasera-backend/tests/fixtures/ar-photosynthesis.pdf')
 const shots=dialog.locator('[data-state=drawn] img')
 await expect(shots).toHaveCount(2)
 for(const shot of await shots.all())expect(await shot.evaluate((el:HTMLImageElement)=>el.naturalWidth)).toBe(420)
 await page.screenshot({path:`/tmp/asasera-pdf-picker-${width}.png`})
})
