import {expect,test} from '@playwright/test'
import {mkdir} from 'node:fs/promises'
import {resolve} from 'node:path'

for(const [name,width,lang,theme] of [['desktop',1440,'en','light'],['mobile',390,'en','light'],['mobile-ar',390,'ar','light'],['desktop-dark',1440,'en','dark'],['pending-mobile',390,'en','light']] as const){
 test(`billing return ${name}`,async({page})=>{
  let checks=0
  const pending=name==='pending-mobile'
  if(pending)await page.clock.install()
  const requests:string[]=[],errors:string[]=[]
  page.on('pageerror',error=>errors.push(error.message))
  await page.route('**/api/**',async route=>{
   const path=new URL(route.request().url()).pathname;requests.push(route.request().method())
   if(path.includes('/checkout/')){
    checks++
    await route.fulfill({json:pending||checks===1?{state:'pending',balanceAiCredits:50000,usableAiCredits:49000}:{state:'recorded',plan:'topup_small',paidMillicents:300000,currency:'usd',addedAiCredits:80000,addedActivities:40,balanceAiCredits:130000,usableAiCredits:129000,imageQualityCeiling:'low',maxOpenJobs:1,subscription:null,purchasedAt:'2026-09-13T10:00:00Z'}})
   }else if(path.endsWith('/wallet'))await route.fulfill({json:{balanceAiCredits:!pending&&checks>1?130000:50000,usableAiCredits:!pending&&checks>1?129000:49000,reservedAiCredits:1000,spendableAiCredits:!pending&&checks>1?129000:49000}})
   else if(path.endsWith('/plans'))await route.fulfill({json:{configured:true,currency:'usd',plans:[],subscription:null,free:{millicents:30000,aiCredits:30000,activities:15}}})
   else if(path.endsWith('/purchases'))await route.fulfill({json:[{plan:'topup_small',paidMillicents:300000,currency:'usd',aiCredits:80000,createdAt:'2026-09-13T10:00:00Z'}]})
   else if(path.endsWith('/account-overview'))await route.fulfill({json:{updatedAt:'2026-09-13T10:00:00Z',creditPolicyVersion:1,usage:{last30DaysAiCredits:2300,allTimeAiCredits:7800},workspace:{activities:24,questions:316,liveSessions:18,assignments:12,materials:9,participations:248},recent:[]}})
   else await route.fulfill({status:404,json:{error:'Unexpected fixture request'}})
  })
  await page.setViewportSize({width,height:1000});await page.emulateMedia({reducedMotion:'reduce'})
  await page.goto(`/e2e/fixtures/billing-return.html?lang=${lang}&theme=${theme}`)
  const arabic=lang==='ar'
  await expect(page.getByRole('heading',{name:arabic?'جارٍ التحقق من الدفع':'Confirming your payment'})).toBeVisible()
  await expect(page.getByRole('heading',{name:arabic?'الرصيد والاستخدام':'Balance & usage'})).toBeVisible()
  await expect(page.getByRole('heading',{name:arabic?'سجل المشتريات':'Purchase history'})).toBeVisible()
  const formatted=await page.evaluate(({lang,value})=>new Intl.NumberFormat(lang).format(value),{lang,value:pending?49000:129000})
  const balance=page.getByRole('button',{name:arabic?/الرصيد المتاح:/:/Available balance:/})
  await expect(balance).toHaveAttribute('title',new RegExp(formatted.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')))
  await expect(page.getByRole('button',{name:arabic?'تحديث':'Refresh',exact:true})).toBeEnabled()
  if(pending){
   await page.clock.runFor(31_000)
   await expect(page.getByRole('heading',{name:'Payment confirmation delayed'})).toBeVisible()
   await expect(page.getByRole('button',{name:'Check again'})).toBeEnabled()
   await expect(page.getByRole('heading',{name:'Balance & usage'})).toBeVisible()
   await expect(page.getByRole('heading',{name:'Purchase history'})).toBeVisible()
   await expect(page.getByText('Credit added',{exact:true}).filter({has:page.locator('strong')})).toHaveCount(0)
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
  await mkdir('.impeccable/review/billing-return',{recursive:true})
  await page.screenshot({path:resolve(`.impeccable/review/billing-return/${name}.png`),fullPage:true})
  await page.getByRole('link',{name:arabic?'الخطط وشحن الرصيد':'Plans & top-ups'}).click()
  await expect(page.getByRole('heading',{name:arabic?'الرصيد والخطط':'Credit and plans'})).toBeVisible()
  await page.getByRole('link',{name:arabic?'الرصيد والاستخدام':'Balance & usage',exact:true}).click()
  await expect(page.getByRole('heading',{name:arabic?'الرصيد والاستخدام':'Balance & usage'})).toBeVisible()
  expect(requests.every(method=>method==='GET')).toBe(true)
  expect(errors).toEqual([])
 })
}
