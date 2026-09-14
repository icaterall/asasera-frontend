import {test,expect} from '@playwright/test'

for(const mode of ['open-box','random-cards'] as const)for(const language of ['ar','en'] as const)test(`${mode} complete independent deck ${language}`,async({page,request,browser})=>{
 test.setTimeout(90000)
 expect(new URL(process.env.PW_BASE_URL??'http://127.0.0.1:5411').hostname).toMatch(/^(127\.0\.0\.1|localhost)$/)
 const ar=language==='ar',width=ar?390:1440,height=ar?844:900,boxes=mode==='open-box',count=boxes?13:3,email=`deck-${crypto.randomUUID()}@example.com`,password='Synthetic deck fixture2026!'
 await request.post('/api/v1/auth/register/teacher',{data:{name:'Deck instructor',email,password}})
 const login=await request.post('/api/v1/auth/login',{data:{email,password}}),{accessToken}=await login.json(),headers={Authorization:`Bearer ${accessToken}`}
 const create=await request.post('/api/v1/activities',{headers,data:{title:ar?'مراجعة تجريبية':'Synthetic review',contentLanguage:language,subjectId:1,levelId:8,purposeId:2}}),{activity}=await create.json()
 for(let n=1;n<=count;n++)expect((await request.post(`/api/v1/activities/${activity.id}/questions`,{headers,data:{kind:'tf',prompt:ar?`العبارة التجريبية ${n}: الشمس نجم.`:`Synthetic statement ${n}: the sun is a star.`,payload:{correct:true}}})).ok()).toBe(true)
 expect((await request.post(`/api/v1/activities/${activity.id}/publish`,{headers})).ok()).toBe(true)
 await page.context().addCookies((await request.storageState()).cookies)
 await page.addInitScript(lang=>localStorage.setItem('asasera.language',lang),language);await page.setViewportSize({width,height})
 await page.goto(`/teacher/activities/${activity.id}/play?mode=study`)
 // Unavailable is inspectable, but cannot launch or silently manufacture pairs.
 await page.getByRole('radio',{name:ar?/الذاكرة/:/Memory/}).check()
 await expect(page.getByRole('button',{name:ar?'أنشئ رابط المشاركة':'Create assignment link'})).toBeDisabled()
 await expect(page.getByRole('link',{name:ar?'تعديل محتوى النشاط':'Edit activity content'})).toHaveAttribute('href',`/teacher/activities/${activity.id}`)
 await page.screenshot({path:`../docs/evidence/interactive/deck-${mode}-${language}-compatibility.png`,fullPage:true})
 await page.getByRole('radio',{name:boxes?(ar?/افتح الصندوق/:/Open the box/):(ar?/بطاقات عشوائية/:/Random cards/)}).check()
 await page.getByRole('button',{name:ar?'أنشئ رابط المشاركة':'Create assignment link'}).click()
 const link=await page.getByRole('textbox',{name:ar?'رابط النشاط':'Assignment link'}).inputValue()
 const context=await browser.newContext({viewport:{width,height},recordVideo:{dir:'../docs/evidence/interactive/recordings',size:{width,height}}})
 await context.addInitScript(lang=>localStorage.setItem('asasera.language',lang),language)
 const learn=await context.newPage(),errors:string[]=[],seen=new Set<string>();learn.on('pageerror',e=>errors.push(e.message))
 try{
  await learn.goto(link);await learn.getByRole('textbox',{name:ar?'اسمك':'Your name'}).fill(ar?'طالب تجريبي':'Synthetic learner')
  await learn.getByRole('button',{name:ar?'ابدأ':'Start',exact:true}).click()
  const board=learn.locator('[data-presentation="open-box"]')
  if(boxes){
   let originalNumbers:string[]|undefined
   for(const size of [390,768,1440]){
    await learn.setViewportSize({width:size,height:900})
    const buttons=board.getByRole('button',{name:ar?/^الصندوق /:/^Box /})
    await expect(buttons).toHaveCount(12)
    const numbers=await buttons.evaluateAll(nodes=>nodes.map(node=>node.getAttribute('aria-label')??''))
    if(originalNumbers)expect(numbers).toEqual(originalNumbers);else originalNumbers=numbers
    const positions=await buttons.evaluateAll(nodes=>nodes.map(node=>node.getBoundingClientRect().top))
    expect(positions.filter(top=>top===positions[0])).toHaveLength(size===390?2:size===768?3:4)
    await learn.screenshot({path:`../docs/evidence/interactive/boxes-${language}-${size}-page1.png`,fullPage:true})
   }
   await learn.setViewportSize({width,height})
  }
  for(let n=1;n<=count;n++)await test.step(`Select and save item ${n}`,async()=>{
   if(boxes){
    if(n===13)await learn.getByRole('navigation',{name:ar?'صفحات الصناديق':'Box pages'}).getByRole('button',{name:ar?'التالي':'Next'}).click()
    if(n===1)await learn.route('**/delivery/attempts/*/presentation',async route=>{
     const committed=await route.fetch()
     await new Promise(resolve=>setTimeout(resolve,400))
     await route.fulfill({response:committed})
    },{times:1})
    await learn.getByRole('button',{name:ar?`الصندوق ${n}`:`Box ${n}`,exact:true}).click()
    if(n===1){
     expect(await board.getByRole('button',{name:ar?/^الصندوق /:/^Box /}).count()).toBe(12)
     await expect(learn.getByRole('button',{name:ar?'الصندوق 1':'Box 1',exact:true})).toBeDisabled()
    }
   }else{
    const draw=learn.getByRole('button',{name:n===1?(ar?'ابدأ الجولة':'Start round'):(ar?'البطاقة التالية':'Next card')})
    await draw.scrollIntoViewIfNeeded()
    const rect=await draw.boundingBox();expect(rect).not.toBeNull()
    // Real repeated pointer clicks must consume only one unseen card.
    await learn.mouse.click(rect!.x+rect!.width/2,rect!.y+rect!.height/2,{clickCount:5,delay:10})
   }
   const heading=learn.getByRole('heading',{name:ar?/العبارة التجريبية/:/Synthetic statement/})
   await expect(heading).toBeVisible();await expect.poll(async()=>seen.has(await heading.innerText())).toBe(false);const text=await heading.innerText();seen.add(text)
   // Record the complete draw transition before a separate answer action.
   if(n===1)await learn.waitForTimeout(380)
   const answer=learn.getByRole('button',{name:ar?'صح':'True',exact:true});await answer.focus();await learn.keyboard.press('Enter')
   await expect(learn.getByRole('status').filter({hasText:ar?'إجابة صحيحة':'Correct'})).toBeVisible()
   if(n===1){await learn.reload();await expect(heading).toHaveText(text)}
   if(n===count)await learn.screenshot({path:`../docs/evidence/interactive/deck-${mode}-${language}-answered.png`,fullPage:true})
   if(boxes&&n<count){await learn.getByRole('button',{name:ar?'العودة إلى الصناديق':'Back to boxes'}).click();if(n===1){
    const consumed=learn.getByRole('button',{name:ar?'الصندوق 1، مفتوح':'Box 1, opened'})
    await expect(consumed).toBeDisabled()
    await context.setOffline(true)
    await expect(consumed).toBeDisabled()
    await context.setOffline(false);await learn.reload()
    await expect(heading).toHaveText(text)
    await learn.getByRole('button',{name:ar?'العودة إلى الصناديق':'Back to boxes'}).click()
    await expect(consumed).toBeDisabled()
   }}
  })
  expect(seen.size).toBe(count)
  await learn.getByRole('button',{name:ar?'إنهاء الجولة':'Finish round'}).click()
  await expect(learn.getByRole('heading',{name:ar?'اكتملت الجولة':'Round complete'})).toBeVisible()
  expect(await learn.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(errors).toEqual([])
 }finally{const video=learn.video();await context.close();await video?.saveAs(`../docs/evidence/interactive/recordings/deck-${mode}-${language}.webm`)}
})
