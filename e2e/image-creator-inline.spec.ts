import {test,expect} from '@playwright/test'

for(const [width,lang,theme] of [[1440,'en','light'],[390,'ar','light'],[390,'en','dark']] as const){
 test(`one image creation window ${width} ${lang} ${theme}`,async({page})=>{
  const ar=lang==='ar',errors:string[]=[],requests:Record<string,unknown>[]=[]
  let quality='low'
  page.on('pageerror',error=>errors.push(error.message))
  await page.setViewportSize({width,height:900})
  await page.route('**/api/**',async route=>{
   const path=new URL(route.request().url()).pathname
   if(path.endsWith('/preferences')){
    if(route.request().method()==='PUT')quality=route.request().postDataJSON().imageQuality
    return route.fulfill({json:{imageQuality:quality,effectiveImageQuality:quality,qualitySelectable:true,choices:['low','medium','high'].map((q,i)=>({quality:q,allowed:true,outputTokens:625*(i+1),amountMillicents:100*(i+1)})),capabilities:{imageCreation:{state:'ready'},textToSpeech:{state:'pending'},videoSuggestions:{state:'ready'}}}})
   }
   if(path.endsWith('/quote'))return route.fulfill({json:{quoteToken:'test-only-quote',imageQuality:quality,outputTokens:625,estimateAiCredits:40,maxAiCredits:60,affordable:true,expiresAt:'2999-01-01T00:00:00Z'}})
   if(path.endsWith('/creation/jobs')){requests.push(route.request().postDataJSON());return route.fulfill({json:{id:'inline-image-test',state:'running'}})}
   if(path.includes('/creation/jobs/'))return route.fulfill({json:{id:'inline-image-test',state:'succeeded',outputTokens:625,settledAiCredits:40,imageKey:'reviewed-fixture-image',imageUrl:'/src/assets/images/media-icons.svg'}})
   if(path.endsWith('/wallet'))return route.fulfill({json:{usableAiCredits:10000,spendableMillicents:10000}})
   return route.fulfill({json:{suggestions:[]}})
  })
  await page.goto(`/e2e/fixtures/image-creator.html?lang=${lang}&theme=${theme}`)
  await page.getByRole('button',{name:'Open media'}).click()
  await page.getByRole('button',{name:ar?'منشئ الصور':'Image Creator',exact:true}).click()
  const prompt=page.getByRole('textbox');await prompt.fill('A clear flower diagram without labels')
  await page.getByRole('button',{name:ar?'رفع صورة':'Upload image',exact:true}).click()
  await page.getByRole('button',{name:ar?'منشئ الصور':'Image Creator',exact:true}).click()
  await expect(prompt).toHaveValue('A clear flower diagram without labels')
   await page.getByRole('radio',{name:ar?/^عالية(?:\s|$)/:/^High(?:\s|$)/}).check()
  const action=page.getByRole('button',{name:ar?/^(أنشئ|أنشئ الصورة)$/:/^(Create|Generate image)$/})
  await expect(action).toBeEnabled()
  await page.screenshot({path:`/tmp/asasera-image-inline-before-${width}-${lang}-${theme}.png`})
  await action.click()
  await expect(page.locator('dialog[open]')).toHaveCount(1)
  await expect(page.getByRole('img',{name:ar?'صورة أنشأها الذكاء الاصطناعي للمراجعة':'AI-created image for review'})).toBeVisible()
  const use=page.getByRole('button',{name:ar?'استخدم هذه الصورة':'Use this image'})
  await expect(use).toBeDisabled()
  await page.getByRole('checkbox').check();await expect(use).toBeEnabled()
  expect(requests).toHaveLength(1);expect(requests[0]?.prompt).toBe('A clear flower diagram without labels')
  expect(await page.locator('dialog[open]').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true)
  await page.screenshot({path:`/tmp/asasera-image-inline-result-${width}-${lang}-${theme}.png`})
  await use.click();await expect(page.locator('dialog[open]')).toHaveCount(0)
  await expect(page.locator('output')).toHaveText('reviewed-fixture-image')
  expect(errors).toEqual([])
 })
}
