import {test,expect} from '@playwright/test'
for(const [language,width,reduced] of [['en',1440,false],['ar',390,false],['en',360,true]] as const){
 test(`persisted question wheel ${language} ${width} reduced=${reduced}`,async({page,request,browser})=>{
  expect(new URL(process.env.PW_BASE_URL??'http://127.0.0.1:5411').hostname).toMatch(/^(127\.0\.0\.1|localhost)$/)
  const ar=language==='ar',email=`question-wheel-${crypto.randomUUID()}@example.com`,password='Synthetic wheel fixture2026!'
  expect((await request.post('/api/v1/auth/register/teacher',{data:{name:'Question wheel instructor',email,password}})).ok()).toBe(true)
  const login=await request.post('/api/v1/auth/login',{data:{email,password}}),{accessToken}=await login.json(),headers={Authorization:`Bearer ${accessToken}`}
  const created=await request.post('/api/v1/activities',{headers,data:{title:ar?'عجلة العلوم':'Science wheel',subjectId:1,levelId:8,purposeId:2,contentLanguage:language}}),{activity}=await created.json()
  for(const prompt of ar?['الأرض كوكب.','القمر تابع للأرض.']:['Earth is a planet.','The moon is Earth’s satellite.'])expect((await request.post(`/api/v1/activities/${activity.id}/questions`,{headers,data:{kind:'tf',prompt,payload:{correct:true}}})).ok()).toBe(true)
  expect((await request.post(`/api/v1/activities/${activity.id}/publish`,{headers})).ok()).toBe(true)
  await page.context().addCookies((await request.storageState()).cookies)
  await page.addInitScript(lang=>localStorage.setItem('asasera.language',lang),language)
  await page.goto(`/teacher/activities/${activity.id}/play?mode=study`)
  await page.getByRole('radio',{name:ar?/عجلة الأسئلة/:/Question wheel/}).check()
  await page.getByRole('button',{name:ar?'أنشئ رابط المشاركة':'Create assignment link'}).click()
  const link=await page.getByRole('textbox',{name:ar?'رابط النشاط':'Assignment link'}).inputValue()
  const height=900,context=await browser.newContext({viewport:{width,height},reducedMotion:reduced?'reduce':'no-preference',recordVideo:{dir:'../docs/evidence/interactive/recordings',size:{width,height}}})
  await context.addInitScript(lang=>localStorage.setItem('asasera.language',lang),language)
  const learn=await context.newPage(),errors:string[]=[];learn.on('pageerror',e=>errors.push(e.message))
  try{
   await learn.goto(link);await learn.getByRole('textbox',{name:ar?'اسمك':'Your name'}).fill(ar?'طالب عجلة':'Wheel learner')
   await learn.getByRole('button',{name:ar?'ابدأ':'Start',exact:true}).click()
   const draw=learn.waitForResponse(response=>response.url().endsWith('/presentation')&&response.request().method()==='POST')
   await learn.getByRole('button',{name:ar?'ابدأ الجولة':'Start round'}).click()
   const result=await (await draw).json(),spin=result.presentation.questionWheel
   expect(spin.durationMs).toBe(4800)
   const wheel=learn.locator('[data-wheel-phase]')
   if(width===1440)await learn.getByRole('button',{name:'Fullscreen',exact:true}).click()
   if(!reduced){await expect(wheel).toHaveAttribute('data-wheel-phase','spinning');await wheel.screenshot({path:`../docs/evidence/interactive/question-wheel-${language}-${width}-motion.png`})}
   if(ar&&!reduced)await learn.getByRole('button',{name:'تخطي الحركة'}).click()
   await expect(wheel).toHaveAttribute('data-wheel-phase','selected',{timeout:8000})
   await expect(learn.getByRole('heading',{name:result.question.prompt,exact:true})).toBeVisible()
   if(width===1440){
    expect(await learn.getByRole('heading',{name:result.question.prompt,exact:true}).evaluate(el=>document.fullscreenElement?.contains(el))).toBe(true)
    await learn.getByRole('button',{name:'Exit fullscreen',exact:true}).click()
   }
   await learn.reload()
   await expect(learn.getByRole('heading',{name:result.question.prompt,exact:true})).toBeVisible()
   await expect(wheel.getByRole('status')).toContainText(spin.entries[spin.winnerIndex].label)
   expect(await learn.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
   await learn.screenshot({path:`../docs/evidence/interactive/question-wheel-${language}-${width}-recovered.png`,fullPage:true})
   await learn.getByRole('button',{name:ar?'صح':'True',exact:true}).click()
   await expect(learn.getByRole('status').filter({hasText:ar?'إجابة صحيحة':'Correct'})).toBeVisible()
   expect(errors).toEqual([])
  }finally{const video=learn.video();await context.close();await video?.saveAs(`../docs/evidence/interactive/recordings/question-wheel-${language}-${width}.webm`)}
 })
}
