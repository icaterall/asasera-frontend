import {expect,test,type Page} from '@playwright/test'
import {mkdir} from 'node:fs/promises'
import {resolve} from 'node:path'

const wallet={balanceAiCredits:12500,reservedAiCredits:1200,spendableAiCredits:11300,usableAiCredits:11300,creditUnit:'AI Credits'}
const overview={updatedAt:'2026-09-13T06:00:00Z',creditPolicyVersion:1,usage:{allTimeAiCredits:7800,last30DaysAiCredits:2300},workspace:{activities:24,questions:316,liveSessions:18,assignments:12,participations:248,materials:9},recent:[{id:'a',kind:'settle',amountAiCredits:450,createdAt:'2026-09-12T10:00:00Z'},{id:'b',kind:'grant',amountAiCredits:10000,createdAt:'2026-09-01T10:00:00Z'}]}
async function intercept(page:Page,mode='normal'){
 const calls:string[]=[]
 await page.route('**/api/**',async route=>{
  const request=route.request(),path=new URL(request.url()).pathname;calls.push(`${request.method()} ${path}`)
  if(mode==='failure'){await route.fulfill({status:503,json:{error:'Unavailable'}});return}
  await route.fulfill({json:path.endsWith('/wallet')?(mode==='zero'?{...wallet,balanceAiCredits:0,reservedAiCredits:0,spendableAiCredits:0,usableAiCredits:0}:wallet):overview})
 })
 return calls
}
const shots=resolve('.impeccable/review/instructor-balance')
for(const [name,width,lang,theme] of [['desktop',1440,'en','light'],['mobile',390,'en','light'],['mobile-ar',390,'ar','light'],['desktop-dark',1440,'en','dark']] as const)test(`account overview ${name}`,async({page})=>{
 const calls=await intercept(page),arabic=lang==='ar'
 await page.setViewportSize({width,height:1000});await page.emulateMedia({reducedMotion:'reduce'})
 await page.goto(`/e2e/fixtures/instructor-balance.html?lang=${lang}&theme=${theme}`)
 const trigger=page.getByRole('button',{name:arabic?/الرصيد المتاح/:/Available balance: 11,300/})
 await expect(trigger).toBeVisible()
 await expect(trigger).toContainText(arabic?'رصيد':'Balance')
 expect(calls.some(c=>c.includes('account-overview'))).toBe(false)
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
 await mkdir(shots,{recursive:true});await page.screenshot({path:resolve(shots,`${name}-header.png`),fullPage:true})
 await trigger.click()
 const dialog=page.getByRole('dialog'),close=dialog.getByRole('button',{name:arabic?'إغلاق الحساب والاستخدام':'Close account and usage'})
 await expect(dialog).toBeVisible();await expect(dialog.getByText(arabic?'مشاركات المتعلّمين':'Learner participations',{exact:true})).toBeVisible()
 await expect(close).toBeFocused()
 expect(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true)
 await page.screenshot({path:resolve(shots,`${name}.png`),fullPage:true})
 await dialog.getByRole('heading',{name:arabic?'آخر حركات الرصيد':'Recent balance activity'}).scrollIntoViewIfNeeded()
 await page.screenshot({path:resolve(shots,`${name}-history.png`),fullPage:true})
 await page.keyboard.press('Shift+Tab');await expect(dialog.getByRole('link',{name:arabic?'إعدادات الحساب':'Account settings'})).toBeFocused()
 await page.keyboard.press('Tab');await expect(close).toBeFocused()
 await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();await expect(trigger).toBeFocused()
 expect(calls.every(c=>c.startsWith('GET ')&&(c.endsWith('/wallet')||c.endsWith('/account-overview')))).toBe(true)
})
test('empty balance is actionable, compact badge opens the same overview',async({page})=>{
 await intercept(page,'zero');await page.setViewportSize({width:320,height:640})
 await page.goto('/e2e/fixtures/instructor-balance.html?compact=1')
 await page.getByRole('button',{name:/Available balance: 0/}).click()
 await expect(page.getByText('No balance is available now. Contact support; manual creation is still available.')).toBeVisible()
 const dialog=page.getByRole('dialog');expect(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true)
 await dialog.getByRole('link',{name:'Support',exact:true}).click();await expect(dialog).not.toBeVisible()
})
test('failed requests never turn unknown balance into zero and can retry',async({page})=>{
 await intercept(page,'failure');await page.goto('/e2e/fixtures/instructor-balance.html')
 const trigger=page.getByRole('button',{name:'Balance needs refresh. Open account and usage'})
 await expect(trigger).toContainText('—');await trigger.click()
 await expect(page.getByText('Usage and analytics could not refresh. Refresh to try again.')).toBeVisible()
 await page.unroute('**/api/**');await intercept(page)
 await page.getByRole('button',{name:'Refresh',exact:true}).click()
 await expect(page.getByRole('dialog').getByText('11,300',{exact:true})).toBeVisible()
})
test('student never loads or displays instructor balance',async({page})=>{
 const calls=await intercept(page);await page.goto('/e2e/fixtures/instructor-balance.html?role=student&compact=1')
 await expect(page.getByRole('heading',{name:'Instructor workspace'})).toBeVisible()
 await expect(page.getByRole('button',{name:/account and/})).toHaveCount(0);expect(calls).toEqual([])
})
