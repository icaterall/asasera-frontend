# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: billing-return.spec.ts >> billing return desktop-dark
- Location: e2e/billing-return.spec.ts:6:2

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByRole('button', { name: /Available balance:/ })
Expected substring: "129,000"
Received string:    "129KBalance"
Timeout: 5000ms

Call log:
  - Expect "toContainText" getByRole('button', { name: /Available balance:/ }) with timeout 5000ms
  - waiting for getByRole('button', { name: /Available balance:/ })
    8 × locator resolved to <button type="button" data-low="false" data-empty="false" data-compact="false" aria-expanded="false" aria-haspopup="dialog" class="asas _trigger_o52vc_1" title="Available balance: 49,000" aria-label="Available balance: 49,000. Open account and usage">…</button>
      - unexpected value "49KBalance"
    6 × locator resolved to <button type="button" data-low="false" data-empty="false" data-compact="false" aria-expanded="false" aria-haspopup="dialog" class="asas _trigger_o52vc_1" title="Available balance: 129,000" aria-label="Available balance: 129,000. Open account and usage">…</button>
      - unexpected value "129KBalance"

```

```yaml
- 'button "Available balance: 129,000. Open account and usage"':
  - strong: 129K
  - text: Balance
```

# Test source

```ts
  1  | import {expect,test} from '@playwright/test'
  2  | import {mkdir} from 'node:fs/promises'
  3  | import {resolve} from 'node:path'
  4  | 
  5  | for(const [name,width,lang,theme] of [['desktop',1440,'en','light'],['mobile',390,'en','light'],['mobile-ar',390,'ar','light'],['desktop-dark',1440,'en','dark'],['pending-mobile',390,'en','light']] as const){
  6  |  test(`billing return ${name}`,async({page})=>{
  7  |   let checks=0
  8  |   const pending=name==='pending-mobile'
  9  |   if(pending)await page.clock.install()
  10 |   const requests:string[]=[],errors:string[]=[]
  11 |   page.on('pageerror',error=>errors.push(error.message))
  12 |   await page.route('**/api/**',async route=>{
  13 |    const path=new URL(route.request().url()).pathname;requests.push(route.request().method())
  14 |    if(path.includes('/checkout/')){
  15 |     checks++
  16 |     await route.fulfill({json:pending||checks===1?{state:'pending',balanceAiCredits:50000,usableAiCredits:49000}:{state:'recorded',plan:'topup_small',paidMillicents:300000,currency:'usd',addedAiCredits:80000,addedActivities:40,balanceAiCredits:130000,usableAiCredits:129000,imageQualityCeiling:'low',maxOpenJobs:1,subscription:null,purchasedAt:'2026-09-13T10:00:00Z'}})
  17 |    }else if(path.endsWith('/wallet'))await route.fulfill({json:{balanceAiCredits:!pending&&checks>1?130000:50000,usableAiCredits:!pending&&checks>1?129000:49000,reservedAiCredits:1000,spendableAiCredits:!pending&&checks>1?129000:49000}})
  18 |    else if(path.endsWith('/plans'))await route.fulfill({json:{configured:true,currency:'usd',plans:[],subscription:null,free:{millicents:30000,aiCredits:30000,activities:15}}})
  19 |    else if(path.endsWith('/purchases'))await route.fulfill({json:[{plan:'topup_small',paidMillicents:300000,currency:'usd',aiCredits:80000,createdAt:'2026-09-13T10:00:00Z'}]})
  20 |    else if(path.endsWith('/account-overview'))await route.fulfill({json:{updatedAt:'2026-09-13T10:00:00Z',creditPolicyVersion:1,usage:{last30DaysAiCredits:2300,allTimeAiCredits:7800},workspace:{activities:24,questions:316,liveSessions:18,assignments:12,materials:9,participations:248},recent:[]}})
  21 |    else await route.fulfill({status:404,json:{error:'Unexpected fixture request'}})
  22 |   })
  23 |   await page.setViewportSize({width,height:1000});await page.emulateMedia({reducedMotion:'reduce'})
  24 |   await page.goto(`/e2e/fixtures/billing-return.html?lang=${lang}&theme=${theme}`)
  25 |   const arabic=lang==='ar'
  26 |   await expect(page.getByRole('heading',{name:arabic?'جارٍ التحقق من الدفع':'Confirming your payment'})).toBeVisible()
  27 |   await expect(page.getByRole('heading',{name:arabic?'الرصيد والاستخدام':'Balance & usage'})).toBeVisible()
  28 |   await expect(page.getByRole('heading',{name:arabic?'سجل المشتريات':'Purchase history'})).toBeVisible()
  29 |   const formatted=await page.evaluate(({lang,value})=>new Intl.NumberFormat(lang).format(value),{lang,value:pending?49000:129000})
  30 |   const balance=page.getByRole('button',{name:arabic?/الرصيد المتاح:/:/Available balance:/})
> 31 |   await expect(balance).toContainText(formatted)
     |                         ^ Error: expect(locator).toContainText(expected) failed
  32 |   await expect(page.getByRole('button',{name:arabic?'تحديث':'Refresh',exact:true})).toBeEnabled()
  33 |   if(pending){
  34 |    await page.clock.runFor(31_000)
  35 |    await expect(page.getByRole('heading',{name:'Payment confirmation delayed'})).toBeVisible()
  36 |    await expect(page.getByRole('button',{name:'Check again'})).toBeEnabled()
  37 |    await expect(page.getByRole('heading',{name:'Balance & usage'})).toBeVisible()
  38 |    await expect(page.getByRole('heading',{name:'Purchase history'})).toBeVisible()
  39 |    await expect(page.getByText('Credit added',{exact:true}).filter({has:page.locator('strong')})).toHaveCount(0)
  40 |   }
  41 |   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
  42 |   await mkdir('.impeccable/review/billing-return',{recursive:true})
  43 |   await page.screenshot({path:resolve(`.impeccable/review/billing-return/${name}.png`),fullPage:true})
  44 |   await page.getByRole('link',{name:arabic?'الخطط وشحن الرصيد':'Plans & top-ups'}).click()
  45 |   await expect(page.getByRole('heading',{name:arabic?'الرصيد والخطط':'Credit and plans'})).toBeVisible()
  46 |   await page.getByRole('link',{name:arabic?'الرصيد والاستخدام':'Balance & usage',exact:true}).click()
  47 |   await expect(page.getByRole('heading',{name:arabic?'الرصيد والاستخدام':'Balance & usage'})).toBeVisible()
  48 |   expect(requests.every(method=>method==='GET')).toBe(true)
  49 |   expect(errors).toEqual([])
  50 |  })
  51 | }
  52 | 
```