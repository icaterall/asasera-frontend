import {expect,test,type Page} from '@playwright/test'

const picture=`<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="460" viewBox="0 0 1000 460"><rect width="1000" height="460" fill="#391639"/><text x="500" y="55" text-anchor="middle" font-family="sans-serif" font-size="28" fill="white">Match the following</text>${['#28629d','#2792a0','#eca019','#c84768'].map((color,index)=>`<rect x="${index*250+8}" y="115" width="238" height="130" rx="6" fill="${color}"/><circle cx="${index*250+127}" cy="180" r="25" fill="white"/><rect x="${index*250+8}" y="330" width="238" height="122" rx="6" fill="#30142e"/>`).join('')}</svg>`

for(const width of [390,1440])for(const lang of ['en','ar']){
 test(`clear all and rebuild answers at ${width}px ${lang}`,async({page},testInfo)=>{
  const ar=lang==='ar',errors:string[]=[],requests:string[]=[]
  page.on('pageerror',e=>errors.push(e.message))
  await page.setViewportSize({width,height:900})
  await page.route('**/api/**',route=>{
   const path=route.request().url();requests.push(path)
   if(path.endsWith('/activity-media/resolve'))return route.fulfill({json:{url:`data:image/svg+xml,${encodeURIComponent(picture)}`}})
   if(path.endsWith('/activity-generation/quote'))return route.fulfill({json:{quoteId:'aadd4477-7878-4444-8989-888888888888',quoteExpiresAt:'2999-01-01',estimateMillicents:10,maxAuthorizedMillicents:20,estimateAiCredits:10,maxAuthorizedAiCredits:20,usableAiCredits:900,creditPolicyVersion:1,creditUnit:'AI Credits',spendableMillicents:900,usableMillicents:900,allowanceMillicents:900,exposureMillicents:0,affordable:true,pricingAvailable:true,generationAvailable:true,grant:{trialMillicents:900,trialAiCredits:900,claimed:true,eligible:true,reason:null},delivery:'new answers'}})
   return route.fulfill({json:{}})
  })
  await page.goto(`/e2e/fixtures/pin-preview.html?lang=${lang}`)
  const image=page.getByAltText(ar?'صورة السؤال':'Question image'),clear=page.getByRole('button',{name:ar?'احذف كل مناطق الإجابة':'Clear all answer areas',exact:true})
  await expect(image).toBeVisible()
  await clear.click()
  await page.getByRole('button',{name:ar?'إلغاء':'Cancel',exact:true}).click()
  await expect(page.getByRole('textbox',{name:ar?'إجابة المنطقة 1':'Answer for area 1',exact:true})).toHaveValue(ar?'حليب':'Milk')
  await clear.click()
  await page.getByRole('button',{name:ar?'احذف الكل':'Clear all',exact:true}).click()
  await expect(page.getByText('0/12',{exact:true})).toBeVisible()
  await expect(page.getByRole('button',{name:ar?'معاينة الطالب':'Learner preview',exact:true})).toBeDisabled()
  await expect(image).toBeVisible()
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
  await page.screenshot({path:testInfo.outputPath('empty-draft.png'),fullPage:true})
  await page.getByRole('button',{name:ar?'أضف منطقة إجابة':'Add answer area',exact:true}).click()
  await expect(page.getByRole('textbox',{name:ar?'إجابة المنطقة 1':'Answer for area 1',exact:true})).toHaveValue('')
  await page.getByRole('button',{name:ar?'احذف المنطقة 1':'Delete Area 1',exact:true}).click()
  await expect(page.getByText('0/12',{exact:true})).toBeVisible()
  await page.getByRole('button',{name:ar?'اقترح الإجابات بالذكاء الاصطناعي':'Suggest answers with AI',exact:true}).click()
  await expect(page.getByRole('button',{name:ar?'اقترح بالذكاء الاصطناعي':'Suggest with AI',exact:true})).toBeEnabled()
  await expect(page.getByText(ar?/حساب التكلفة مجاني/:/Estimating is free/)).toBeVisible()
  expect(requests.some(path=>path.endsWith('/activity-generation/jobs'))).toBe(false)
  expect(errors).toEqual([])
  await page.screenshot({path:testInfo.outputPath('free-estimate.png'),fullPage:true})
 })
}

async function assertZoneGeometry(page:Page,{long=false}={}){
  const sizes=await page.locator('div[class*="imageStage"]:has(svg[class*="zoneSvg"])').evaluate(stage=>{
    const outlines=[...stage.querySelectorAll('svg rect,svg ellipse')]
    return [...stage.querySelectorAll('button')].map((button,index)=>{
      const actual=button.getBoundingClientRect(),expected=outlines[index]!.getBoundingClientRect()
      const styles=getComputedStyle(button)
      return {area:index+1,actual:{x:actual.x,y:actual.y,w:actual.width,h:actual.height},expected:{x:expected.x,y:expected.y,w:expected.width,h:expected.height},minWidth:styles.minWidth,minHeight:styles.minHeight}
    })
  })
  expect(sizes).toHaveLength(4)
  for(const area of sizes){
    for(const axis of ['x','y','w','h'] as const){
      expect(Math.abs(area.actual[axis]-area.expected[axis]),JSON.stringify(area)).toBeLessThan(1)
    }
  }
  const labels=await page.locator('[data-placed]>span>span').evaluateAll(elements=>elements.map(element=>{
    const surface=element.parentElement!,target=surface.parentElement!,box=element.getBoundingClientRect(),area=target.getBoundingClientRect(),fill=surface.getBoundingClientRect()
    const text=document.createRange();text.selectNodeContents(element)
    const inset=target.getAttribute('data-zone-shape')==='circle'?.146:0
    const glyphs=text.getBoundingClientRect()
    // A font's ink may extend past its line box without being clipped. The
    // clipping boundary is the shape, not this overflow-visible text span.
    return {text:element.textContent,lines:text.getClientRects().length,inside:box.left>=area.left+area.width*inset-.5&&box.right<=area.right-area.width*inset+.5&&box.top>=area.top+area.height*inset-.5&&box.bottom<=area.bottom-area.height*inset+.5,unclipped:glyphs.left>=area.left+area.width*inset-.5&&glyphs.right<=area.right-area.width*inset+.5&&glyphs.top>=area.top+area.height*inset-.5&&glyphs.bottom<=area.bottom-area.height*inset+.5,fullShape:Math.abs(fill.width-area.width)<1&&Math.abs(fill.height-area.height)<1,noInnerBorder:getComputedStyle(surface).borderTopWidth==='0px'&&getComputedStyle(surface).boxShadow==='none'}
  }))
  for(const label of labels){
    expect(label.inside,JSON.stringify(label)).toBe(true)
    expect(label.unclipped,JSON.stringify(label)).toBe(true)
    expect(label.fullShape,JSON.stringify(label)).toBe(true)
    expect(label.noInnerBorder,JSON.stringify(label)).toBe(true)
    if(!long)expect(label.lines,JSON.stringify(label)).toBe(1)
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
}

async function openPreview(page:Page,lang='en',{shape='rect',long=false}={}){
  await page.route('**/api/**',route=>route.request().url().endsWith('/activity-media/resolve')
    ?route.fulfill({json:{url:`data:image/svg+xml,${encodeURIComponent(picture)}`}})
    :route.fulfill({json:{}}))
  await page.goto(`/e2e/fixtures/pin-preview.html?lang=${lang}&shape=${shape}${long?'&long=1':''}`)
  await page.getByRole('button',{name:lang==='ar'?'معاينة الطالب':'Learner preview',exact:true}).click()
  await expect(page.getByRole('region').locator('img').first()).toBeVisible()
}

for(const width of [320,1440])for(const lang of ['en','ar']){
  test(`answers fill circle areas at ${width}px ${lang}`,async({page},testInfo)=>{
    await page.setViewportSize({width,height:900})
    await openPreview(page,lang,{shape:'circle'})
    for(const [index,label] of (lang==='ar'?['حليب','خبز','عصير','بيض']:['Milk','Bread','Juice','Egg']).entries()){
      await page.getByRole('button',{name:label,exact:true}).click()
      await page.getByRole('button',{name:`${lang==='ar'?'المنطقة':'Zone'} ${index+1}`,exact:true}).click()
    }
    await assertZoneGeometry(page)
    await page.screenshot({path:testInfo.outputPath('circle-placed.png'),fullPage:true})
  })
}

for(const shape of ['rect','circle'])for(const lang of ['en','ar']){
  test(`long answers fit ${shape} areas on a phone in ${lang}`,async({page},testInfo)=>{
    await page.setViewportSize({width:390,height:900})
    await openPreview(page,lang,{shape,long:true})
    for(const [index,label] of (lang==='ar'?['زجاجة الحليب','الجهاز الهضمي','ثاني أكسيد الكربون','الجهاز العصبي']:['Milk bottle','Digestive system','Carbon dioxide','Nervous system']).entries()){
      await page.getByRole('button',{name:label,exact:true}).click()
      await page.getByRole('button',{name:`${lang==='ar'?'المنطقة':'Zone'} ${index+1}`,exact:true}).click()
    }
    await assertZoneGeometry(page,{long:true})
    await page.screenshot({path:testInfo.outputPath('long-placed.png'),fullPage:true})
  })
}

for(const width of [320,390,480,700,768,1440])for(const lang of ['en','ar']){
  test(`pin preview areas match image geometry at ${width}px ${lang}`,async({page},testInfo)=>{
    await page.setViewportSize({width,height:900})
    const errors:string[]=[]
    page.on('pageerror',error=>errors.push(error.message))
    await openPreview(page,lang)
    const region=page.getByRole('region')
    await page.screenshot({path:testInfo.outputPath('empty.png'),fullPage:true})
    await assertZoneGeometry(page)
    for(const [index,label] of (lang==='ar'?['حليب','خبز','عصير','بيض']:['Milk','Bread','Juice','Egg']).entries()){
      await page.getByRole('button',{name:label,exact:true}).click()
      await page.getByRole('button',{name:`${lang==='ar'?'المنطقة':'Zone'} ${index+1}`,exact:true}).click()
      await assertZoneGeometry(page)
    }
    await page.screenshot({path:testInfo.outputPath('placed.png'),fullPage:true})
    await page.getByRole('button',{name:lang==='ar'?'أرسل الإجابة':'Submit answer',exact:true}).click()
    expect(errors).toEqual([])
    await expect(page.getByText(lang==='ar'?'إجابة صحيحة. هكذا ستظهر للمتعلم بعد إرسال الإجابة.':'Correct. This is how a learner sees a checked answer.',{exact:true})).toBeVisible()
    await page.getByRole('button',{name:lang==='ar'?'جرّب من جديد':'Try again',exact:true}).click()
    await assertZoneGeometry(page)
    await expect(region.locator('[data-placed]')).toHaveCount(0)
  })
}

test('mobile drag moves a card onto the image and keeps every target aligned',async({page})=>{
  await page.setViewportSize({width:390,height:900})
  await openPreview(page)
  const card=page.getByRole('button',{name:'Milk',exact:true}),zone=page.getByRole('button',{name:'Zone 1',exact:true})
  const from=(await card.boundingBox())!,to=(await zone.boundingBox())!
  await page.mouse.move(from.x+from.width/2,from.y+from.height/2)
  await page.mouse.down()
  await page.mouse.move(to.x+to.width/2,to.y+to.height/2,{steps:12})
  await expect(page.locator('[class*="dragOverlay"]')).toHaveText('Milk')
  await page.mouse.up()
  await expect(card).toHaveCount(0)
  await expect(zone).toHaveText('Milk')
  await assertZoneGeometry(page)
  // @dnd-kit suppresses all click events for 50ms after a drop, including
  // keyboard-generated clicks. Allow that documented sensor cleanup before
  // starting a new gesture (not a wait for rendering or network activity).
  await page.waitForTimeout(60)
  await zone.press('Enter')
  await expect(card).toBeVisible()
  await expect(page.locator('[data-placed]')).toHaveCount(0)
})

test.describe('touchscreen preview',()=>{
  test.use({hasTouch:true,viewport:{width:390,height:844}})
  test('tap-to-place works on a phone without dragging',async({page})=>{
    await openPreview(page)
    await page.getByRole('button',{name:'Milk',exact:true}).tap()
    await page.getByRole('button',{name:'Zone 1',exact:true}).tap()
    await expect(page.getByRole('button',{name:'Milk',exact:true})).toHaveCount(0)
    await expect(page.getByRole('button',{name:'Zone 1',exact:true})).toHaveText('Milk')
    await assertZoneGeometry(page)
    await page.getByRole('button',{name:'Zone 1',exact:true}).tap()
    await expect(page.getByRole('button',{name:'Milk',exact:true})).toBeVisible()
    await expect(page.locator('[data-placed]')).toHaveCount(0)
  })
})
