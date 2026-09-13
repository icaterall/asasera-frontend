import {expect,test,type Page} from '@playwright/test'

async function intercept(page:Page){
 const writes:Array<Record<string,unknown>>=[]
 await page.route('**/api/**',async route=>{
  const request=route.request(),path=new URL(request.url()).pathname
  if(request.method()==='POST'||request.method()==='PATCH'){
   const body=request.postDataJSON();writes.push(body)
   await route.fulfill({json:{activity:{id:42,title:'Language fixture',revision:2,categoryId:null,educationStageIds:[],countryIds:[],contentLanguage:body.contentLanguage}}});return
  }
  const body=path.endsWith('/purposes')?{purposes:[]}:path.endsWith('/categories')?{categories:[]}:path.endsWith('/education-stages')?{stages:[]}:path.endsWith('/countries')?{countries:[],detectedCountryId:null}:{}
  await route.fulfill({json:body})
 })
 return writes
}
for(const width of [390,1440])for(const lang of ['en','ar'])test(`new activity defaults to ${lang}, ${width}px`,async({page},testInfo)=>{
 const writes=await intercept(page),ar=lang==='ar'
 await page.setViewportSize({width,height:1000})
 await page.goto(`/e2e/fixtures/activity-language.html?lang=${lang}`)
 await expect(page.getByRole('combobox',{name:ar?'لغة النشاط':'Activity language'})).toHaveAttribute('data-select-value',lang)
 await expect(page.locator('html')).toHaveAttribute('dir',ar?'rtl':'ltr')
 await page.getByRole('textbox',{name:ar?'اسم النشاط':'Activity name'}).fill(ar?'دورة الماء':'The water cycle')
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
 await page.screenshot({path:testInfo.outputPath(`creation-${lang}-${width}.png`),fullPage:true})
 await page.getByRole('button',{name:ar?'التالي':'Next',exact:true}).click()
 await expect(page.getByText('Activity created',{exact:true})).toBeVisible()
 expect(writes).toEqual([expect.objectContaining({contentLanguage:lang})])
})
for(const lang of ['en','ar'])test(`custom language survives interface changes and saves from settings (${lang})`,async({page},testInfo)=>{
 const writes=await intercept(page),ar=lang==='ar'
 await page.setViewportSize({width:390,height:1000})
 await page.goto(`/e2e/fixtures/activity-language.html?settings=1&lang=${lang}`)
 await page.getByText(ar?'اللغة والجمهور':'Language & audience',{exact:true}).click()
 const field=page.getByRole('textbox',{name:ar?'اسم اللغة':'Language name',exact:true})
 await expect(field).toHaveValue('French')
 await field.fill('日本語')
 await page.getByRole('button',{name:'Switch interface language'}).click()
 await expect(page.getByRole('textbox',{name:ar?'Language name':'اسم اللغة',exact:true})).toHaveValue('日本語')
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
 await page.screenshot({path:testInfo.outputPath(`settings-${lang}-390.png`),fullPage:true})
 await page.getByRole('button',{name:ar?'Save language':'حفظ اللغة',exact:true}).click()
 await expect(page.getByLabel('Saved content language')).toHaveText('日本語')
 expect(writes).toEqual([{contentLanguage:'日本語',expectedRevision:1}])
})
