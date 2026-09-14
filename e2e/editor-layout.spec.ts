import {test,expect} from '@playwright/test'

for(const [width,height,lang,theme] of [[1440,900,'en','light'],[1366,768,'en','light'],[1366,768,'ar','light'],[1025,768,'en','light'],[390,844,'ar','light'],[390,844,'en','dark']] as const){
 test(`editor density ${width} ${lang} ${theme}`,async({page})=>{
  const ar=lang==='ar'
  await page.setViewportSize({width,height})
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message))
  await page.route('https://www.youtube-nocookie.com/**',route=>route.fulfill({contentType:'text/html; charset=utf-8',body:'<body style="margin:0;background:#21354b;color:white;display:grid;place-items:center;height:100vh;font:16px sans-serif"><div style="text-align:center"><b>COMPUTER STUDIES</b><p>Video preview · synthetic test fixture</p></div></body>'}))
  await page.route('**/api/**',route=>{
   const path=new URL(route.request().url()).pathname
   return route.fulfill({json:path.includes('wallet')?{usableAiCredits:30122913,balanceAiCredits:30122913,reservedAiCredits:0,spendableAiCredits:30122913}:path.includes('video-suggestions')?{suggestions:[{videoId:'abcdefghijk',title:'Evolution of computers',durationSeconds:975}]}:{}})
  })
  await page.goto(`/e2e/fixtures/editor-layout.html?lang=${lang}&theme=${theme}`)
  await expect(page.getByLabel(ar?'نص السؤال':'Question text',{exact:true})).toBeVisible()
  await expect(page.frameLocator('iframe').getByText('Video preview · synthetic test fixture')).toBeVisible()
  await page.evaluate(()=>document.fonts.ready)
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
  const header=page.getByRole('banner')
  const headerBox=(await header.boundingBox())!
  expect(headerBox.height).toBeLessThan(width>1100?85:150)
  if(width>1024){
   const options=page.locator('[class*="answerTile"]')
   await expect(options).toHaveCount(4)
   for(const option of await options.all()){const box=(await option.boundingBox())!;expect(box.y+box.height).toBeLessThan(height)}
  }
  await page.screenshot({path:`.impeccable/review/editor-${width}-${lang}-${theme}.png`,fullPage:true})
  const more=page.getByRole('button',{name:ar?'المزيد':'More',exact:true})
  await more.click()
  await expect(page.getByRole('dialog')).toHaveCount(1)
  await expect(page.getByRole('button',{name:ar?'الملاحظات':'Feedback',exact:true})).toBeVisible()
  await page.screenshot({path:`.impeccable/review/editor-tools-${width}-${lang}-${theme}.png`})
  await page.keyboard.press('Escape');await expect(more).toBeFocused()
  if(width>700)await page.getByRole('button',{name:ar?'إعدادات النشاط':'Activity settings',exact:true}).click()
  else{await more.click();await page.getByRole('button',{name:ar?'إعدادات النشاط':'Activity settings',exact:true}).click()}
  await expect(page.getByRole('dialog')).toHaveCount(1)
  expect(await page.getByRole('dialog').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true)
  await expect(page.getByRole('button',{name:ar?'حفظ الجمهور':'Save audience',exact:true})).toBeVisible()
  const category=page.getByRole('dialog').getByRole('combobox').first()
  await category.click()
  await expect(page.getByRole('option').first()).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(1)
  await page.keyboard.press('Escape')
  expect(errors).toEqual([])
 })
}
