import {test,expect} from '@playwright/test'

const sizes=[[320,800],[360,800],[430,932],[844,390],[768,1024],[1024,768],[599,800],[601,800],[1023,768],[1025,768],[1920,1080]] as const
for(const [width,height] of sizes)test(`long mixed-language card reflow ${width}x${height}`,async({page,request,browser})=>{
 expect(new URL(process.env.PW_BASE_URL??'http://127.0.0.1:5411').hostname).toMatch(/^(127\.0\.0\.1|localhost)$/)
 const ar=width%2===0,language=ar?'ar':'en',contentLanguage=ar?'en':'ar',email=`reflow-${crypto.randomUUID()}@example.com`,password='Synthetic reflow fixture2026!'
 await request.post('/api/v1/auth/register/teacher',{data:{name:'Reflow instructor',email,password}})
 const login=await request.post('/api/v1/auth/login',{data:{email,password}}),{accessToken}=await login.json(),headers={Authorization:`Bearer ${accessToken}`}
 const created=await request.post('/api/v1/activities',{headers,data:{title:'Synthetic mixed-language reflow',contentLanguage,subjectId:1,levelId:8,purposeId:2}}),{activity}=await created.json()
 const prompt=ar?'Read this statement carefully: changing the presentation of an approved lesson changes its scientific meaning.':'اقرأ العبارة بعناية: تغيير طريقة عرض الدرس المعتمد يغيّر المعنى العلمي للمعلومات الواردة فيه.'
 const explanation=(ar?'The same reviewed question keeps its meaning, original content and reference explanation when it is presented as a card. ':'يحتفظ السؤال الذي راجعه المعلّم بمعناه ومحتواه الأصلي وتفسيره المرجعي عند عرضه في صورة بطاقة. ').repeat(6)
 expect((await request.post(`/api/v1/activities/${activity.id}/questions`,{headers,data:{kind:'tf',prompt,explanation,payload:{correct:false}}})).ok()).toBe(true)
 expect((await request.post(`/api/v1/activities/${activity.id}/publish`,{headers})).ok()).toBe(true)
 await page.context().addCookies((await request.storageState()).cookies)
 await page.addInitScript(lang=>localStorage.setItem('asasera.language',lang),language)
 await page.setViewportSize({width,height})
 await page.goto(`/teacher/activities/${activity.id}/play?mode=study`)
 await page.getByRole('radio',{name:ar?/بطاقات المراجعة/:/Flashcards/}).check()
 const overflow=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,nodes:[...document.querySelectorAll('main,header,section,fieldset,input,nav')].map(el=>({tag:el.tagName,cls:el.className,left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right})).filter(el=>el.right>innerWidth+.5||el.left<-.5)}))
 expect(overflow.scroll,JSON.stringify(overflow)).toBeLessThanOrEqual(overflow.width)
 await page.getByRole('button',{name:ar?'أنشئ رابط المشاركة':'Create assignment link'}).click()
 const link=await page.getByRole('textbox',{name:ar?'رابط النشاط':'Assignment link'}).inputValue()
 const context=await browser.newContext({viewport:{width,height},locale:language,reducedMotion:'reduce'})
 await context.addInitScript(lang=>localStorage.setItem('asasera.language',lang),language)
 const learn=await context.newPage(),errors:string[]=[];learn.on('pageerror',e=>errors.push(e.message))
 try{
  await learn.goto(link);await learn.getByRole('textbox',{name:ar?'اسمك':'Your name'}).fill('Synthetic learner')
  await learn.getByRole('button',{name:ar?'ابدأ':'Start',exact:true}).click()
  await learn.getByRole('button',{name:ar?'ابدأ الجولة':'Start round'}).click()
  const heading=learn.getByRole('heading',{name:prompt,exact:true})
  await expect(heading).toHaveAttribute('lang',contentLanguage)
  await learn.getByRole('button',{name:ar?'اكشف الإجابة':'Reveal answer'}).focus();await learn.keyboard.press('Enter')
  await expect(learn.getByText(explanation,{exact:true})).toBeVisible()
  expect(await learn.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
  expect(await learn.locator('meta[name=viewport]').getAttribute('content')).not.toMatch(/user-scalable=no|maximum-scale=1(?:[, ]|$)/)
  await learn.screenshot({path:`../docs/evidence/interactive/reflow-${width}x${height}-${language}-mixed.png`,fullPage:true})
  const rating=learn.getByRole('button',{name:ar?'أتذكرها':'Remembered',exact:true});await rating.focus();await learn.keyboard.press('Enter')
  await expect(rating).toHaveAttribute('aria-pressed','true')
  await learn.getByRole('button',{name:ar?'إنهاء الجولة':'Finish round'}).click()
  await expect(learn.getByRole('heading',{name:ar?'اكتملت الجولة':'Round complete'})).toBeVisible()
  expect(errors).toEqual([])
 }finally{await context.close()}
})
