import {selectOption} from './select-option'
import {test,expect} from '@playwright/test'
import {readFileSync} from 'node:fs'
import {localTeacher} from './local-fixture'

/*
 * PAID FIXTURE — this journey replays what a REAL provider returned, and there is no
 * honest way to manufacture it. What it needs, in order:
 *
 *  1. `asasera-backend/scripts/v4/evaluate-providers.ts`, run with real provider API
 *     keys against the local DEVELOPMENT database (it refuses anything but
 *     NODE_ENV=development, PG_HOST=127.0.0.1, PG_PORT=55432, STORAGE_DRIVER=local).
 *     It spends money: it submits real question, vision and controlled-failure jobs
 *     and writes the ids it owns to /tmp/asasera-v4-provider-owned.json.
 *  2. `asasera-backend/scripts/v4/evaluation-browser-access.ts`, which turns that into
 *     a password login at /tmp/asasera-evaluation-browser-access.json.
 *
 * The account, activity and job ids in that file exist only in the database the
 * evaluation ran against. A fresh isolated e2e database does not contain them, and
 * seeding equivalents would defeat the point: the citations, image proposals and
 * released reserve under test are genuine provider output, not fixtures.
 */
const PAID='/tmp/asasera-evaluation-browser-access.json'
const paidFixture=(()=>{try{return JSON.parse(readFileSync(PAID,'utf8')) as {email:string;password:string;activityId:number}}catch{return null}})()

test('existing live-provider results open citations and image proposals without a new paid request',async({page})=>{
 test.skip(!paidFixture,`Requires ${PAID} from the PAID provider evaluation (scripts/v4/evaluate-providers.ts → evaluation-browser-access.ts)`)
 test.skip(!!process.env.E2E_PG_DATABASE,`The paid evaluation fixture lives in the development database it was produced against; E2E_PG_DATABASE=${process.env.E2E_PG_DATABASE} does not hold jobs 306-308`)
 const fixture=paidFixture!
 await page.addInitScript(()=>localStorage.setItem('asasera.language','en'))
 const login=await page.request.post('/api/v1/auth/login',{data:{email:fixture.email,password:fixture.password}});expect(login.ok()).toBe(true)
 let submissions=0;page.on('request',r=>{if(r.method()==='POST'&&r.url().endsWith('/activity-generation/jobs'))submissions++})
 await page.setViewportSize({width:1440,height:900});await page.goto(`/teacher/activities/${fixture.activityId}`)
 await page.getByRole('button',{name:'Generate with AI',exact:true}).click();await expect(page.getByRole('dialog',{name:'Generate with AI',exact:true})).toBeVisible()
 await selectOption(page.getByRole('combobox',{name:'Previous jobs',exact:true}),'306')
 await expect(page.getByRole('button',{name:'Open source 1'}).first()).toBeVisible();await page.getByRole('button',{name:'Open source 1'}).first().click()
 await expect(page.getByRole('heading',{name:'Source 1',exact:true})).toBeVisible();await expect(page.locator('section[class*=sourceText] p')).not.toBeEmpty()
 await page.locator('section[class*=sourceText]').evaluate(el=>el.scrollIntoView({block:'center'}))
 await page.screenshot({path:'../screenshots/v4/generation-source-1440.png',fullPage:true})
 await selectOption(page.getByRole('combobox',{name:'Previous jobs',exact:true}),'307');await expect(page.getByAltText('Proposed image regions')).toBeVisible()
 await page.setViewportSize({width:390,height:844});await expect(page.locator('dialog')).toHaveJSProperty('scrollWidth',await page.locator('dialog').evaluate(el=>el.clientWidth))
 await page.screenshot({path:'../screenshots/v4/generation-zones-390.png',fullPage:true})
 await selectOption(page.getByRole('combobox',{name:'Previous jobs',exact:true}),'308');await expect(page.getByRole('status')).toContainText('Reserved credit was released')
 expect(submissions).toBe(0)
})
test('account deletion requires password confirmation, revokes access and clears shared-device state',async({page})=>{
 const fixture=localTeacher();await page.addInitScript(()=>{localStorage.setItem('asasera.language','en');localStorage.setItem('asasera:synthetic-private-key','synthetic')})
 const login=await page.request.post('/api/v1/auth/login',{data:{email:fixture.email,password:fixture.password}});expect(login.ok()).toBe(true);const {accessToken}=await login.json()
 await page.setViewportSize({width:390,height:844});await page.goto('/complete-profile');await page.getByRole('button',{name:'Delete account',exact:true}).click()
 const dialog=page.getByRole('dialog',{name:'Delete your account?',exact:true});await expect(dialog).toBeVisible();await expect(dialog.getByRole('button',{name:'Delete my account',exact:true})).toBeDisabled()
 await dialog.getByRole('checkbox').check();await dialog.getByLabel('Current password, if your account uses one').fill('wrong password');await dialog.getByRole('button',{name:'Delete my account',exact:true}).click();await expect(dialog.getByRole('alert')).toBeVisible()
 await dialog.getByLabel('Current password, if your account uses one').fill(fixture.password)
 await expect(dialog.getByRole('button',{name:'Delete my account',exact:true})).toBeEnabled();await page.mouse.move(380,830);await page.waitForTimeout(250)
 await page.screenshot({path:'../screenshots/v4/account-deletion-390.png',fullPage:true,animations:'disabled'})
 await dialog.getByRole('button',{name:'Delete my account',exact:true}).click();await expect(dialog).not.toBeVisible()
 expect((await page.request.get('/api/v1/auth/me',{headers:{authorization:`Bearer ${accessToken}`}})).status()).toBe(401)
 expect(await page.evaluate(()=>localStorage.getItem('asasera:synthetic-private-key'))).toBeNull()
})
