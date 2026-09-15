import {test,expect} from '@playwright/test'

for(const [width,lang,theme] of [[1440,'en','light'],[390,'ar','light'],[390,'en','dark']] as const){
 test(`saved file analysis ${width} ${lang} ${theme}`,async({page})=>{
  await page.setViewportSize({width,height:900})
  const errors:string[]=[],writes:string[]=[]
  page.on('pageerror',error=>errors.push(error.message))
  await page.route('**/api/**',async route=>{
   if(route.request().method()!=='GET')writes.push(route.request().url())
   await route.fulfill({json:{state:'ready',instructorCreditsCharged:0,coveredSegments:[1,2],metadata:{title:'Water cycle',language:'English',summary:lang==='ar'?'شرح التبخر والتكاثف والهطول في دورة الماء.':'Explains evaporation, condensation and precipitation in the water cycle.',topics:[{text:lang==='ar'?'التبخر':'Evaporation',sourceSegments:[1]}]}}})
  })
  await page.goto(`/e2e/fixtures/file-metadata.html?lang=${lang}&theme=${theme}`)
  const summary=page.locator('summary')
  await expect(summary).toContainText(lang==='ar'?'تحليل الملف محفوظ':'File analysis saved')
  await summary.focus();await page.keyboard.press('Enter')
  await expect(page.locator('details')).toHaveAttribute('open','')
  await expect(page.getByText(lang==='ar'?'التبخر':'Evaporation',{exact:true})).toBeVisible()
  await page.getByRole('checkbox').check();await page.getByRole('checkbox').uncheck()
  expect(writes).toEqual([]);expect(errors).toEqual([])
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
  await page.screenshot({path:`/tmp/asasera-file-metadata-${width}-${lang}-${theme}.png`})
 })
}
test('old uploads queue once, while pending and failed states never block page selection',async({page})=>{
 let writes=0,state='not_analyzed'
 await page.route('**/api/**',async route=>{
  if(route.request().method()==='POST'){writes++;state='queued'}
  await route.fulfill({json:{state,coveredSegments:[],metadata:null}})
 })
 await page.goto('/e2e/fixtures/file-metadata.html')
 const analysisStatus=page.locator('main').getByRole('status').first()
 await expect(analysisStatus).toContainText('Analysing your file')
 await page.getByRole('checkbox').check();expect(writes).toBe(1)
 state='uncertain';await page.reload()
 await expect(page.locator('main').getByRole('status').first()).toContainText('Your file is saved and you can continue')
 await page.getByRole('checkbox').check();expect(writes).toBe(1)
})
