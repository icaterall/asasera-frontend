import {test,expect} from '@playwright/test'
import {execFileSync} from 'node:child_process'
import {resolve} from 'node:path'

for(const language of ['en','ar'] as const)test(`image-only recall and previous-card state ${language}`,async({page,request,browser})=>{
 test.setTimeout(60000)
 expect(new URL(process.env.PW_BASE_URL??'http://127.0.0.1:5411').hostname).toMatch(/^(127\.0\.0\.1|localhost)$/)
 const ar=language==='ar',width=ar?390:1440,height=ar?844:900,email=`image-card-${crypto.randomUUID()}@example.com`,password='Synthetic image card2026!'
 await request.post('/api/v1/auth/register/teacher',{data:{name:'Image card instructor',email,password}})
 const login=await request.post('/api/v1/auth/login',{data:{email,password}}),{accessToken,user}=await login.json(),headers={Authorization:`Bearer ${accessToken}`}
 const images=JSON.parse(execFileSync(process.execPath,['--import','./tests/bootstrap.mjs','tests/browser-image-fixture.ts',String(user.id)],{cwd:resolve('../asasera-backend'),env:{...process.env,PG_HOST:'127.0.0.1',PG_PORT:process.env.E2E_PG_PORT??'55432',PG_DATABASE:process.env.E2E_PG_DATABASE,PG_USER:process.env.E2E_PG_USER??'postgres',PG_PASSWORD:'postgres',PG_SSL:'disable'},encoding:'utf8'})) as string[]
 const created=await request.post('/api/v1/activities',{headers,data:{title:ar?'بطاقات صور تجريبية':'Synthetic picture cards',contentLanguage:language,subjectId:1,levelId:8,purposeId:2}}),{activity}=await created.json()
 for(const n of [1,2])expect((await request.post(`/api/v1/activities/${activity.id}/questions`,{headers,data:{kind:'mcq',prompt:ar?`بطاقة ${n}: أي صورة زرقاء؟`:`Card ${n}: which image is blue?`,payload:{options:[{key:'a',text:'',image:images[0]},{key:'b',text:'',image:images[1]}],correct:'a'}}})).ok()).toBe(true)
 expect((await request.post(`/api/v1/activities/${activity.id}/publish`,{headers})).ok()).toBe(true)
 await page.context().addCookies((await request.storageState()).cookies);await page.addInitScript(lang=>localStorage.setItem('asasera.language',lang),language)
 await page.goto(`/teacher/activities/${activity.id}/play?mode=study`);await page.getByRole('radio',{name:ar?/بطاقات المراجعة/:/Flashcards/}).check()
 await page.getByRole('button',{name:ar?'أنشئ رابط المشاركة':'Create assignment link'}).click()
 const link=await page.getByRole('textbox',{name:ar?'رابط النشاط':'Assignment link'}).inputValue(),context=await browser.newContext({viewport:{width,height}})
 await context.addInitScript(lang=>localStorage.setItem('asasera.language',lang),language);const learn=await context.newPage()
 try{
  await learn.goto(link);await learn.getByRole('textbox',{name:ar?'اسمك':'Your name'}).fill('Synthetic image learner');await learn.getByRole('button',{name:ar?'ابدأ':'Start',exact:true}).click()
  await learn.getByRole('button',{name:ar?'ابدأ الجولة':'Start round'}).click()
  const stage=learn.locator('[data-presentation]'),loaded=async()=>expect.poll(()=>stage.locator('img').evaluateAll(imgs=>imgs.length>0&&imgs.every(image=>(image as HTMLImageElement).naturalWidth>0))).toBe(true)
  await loaded();await stage.evaluate(async el=>{await document.fonts.ready;await Promise.all(el.getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{})))})
  await learn.screenshot({path:`../docs/evidence/interactive/image-cards-${language}-front.png`,fullPage:true})
  await learn.getByRole('button',{name:ar?'اكشف الإجابة':'Reveal answer'}).click()
  const correct=learn.getByRole('img',{name:ar?'الصورة الصحيحة، الخيار 1':'Correct image, option 1'});await expect(correct).toBeVisible();await loaded()
  await stage.evaluate(async el=>{await Promise.all(el.getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{})))})
  const rating=learn.getByRole('button',{name:ar?'أتذكرها':'Remembered',exact:true});await rating.click();await expect(rating).toHaveAttribute('aria-pressed','true');await expect(rating.locator('svg')).toHaveCount(1)
  await expect(rating).toBeEnabled();await stage.evaluate(async el=>{await Promise.all(el.getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{})))})
  await learn.screenshot({path:`../docs/evidence/interactive/image-cards-${language}-selected.png`,fullPage:true})
  await learn.getByRole('button',{name:ar?'البطاقة التالية':'Next card'}).click();await expect(learn.getByRole('heading',{name:ar?'بطاقة 2: أي صورة زرقاء؟':'Card 2: which image is blue?'})).toBeVisible()
  await learn.getByRole('button',{name:ar?'البطاقة السابقة':'Previous card'}).click();await expect(learn.getByRole('heading',{name:ar?'بطاقة 1: أي صورة زرقاء؟':'Card 1: which image is blue?'})).toBeVisible()
  await expect(stage.getByText(ar?'السؤال 1 من 2':'1 of 2',{exact:true})).toBeVisible()
  await learn.getByRole('button',{name:ar?'اكشف الإجابة':'Reveal answer'}).click();await expect(rating).toHaveAttribute('aria-pressed','true');await loaded()
  await expect(rating).toBeEnabled();await stage.evaluate(async el=>{await Promise.all(el.getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{})))})
  await learn.screenshot({path:`../docs/evidence/interactive/image-cards-${language}-previous.png`,fullPage:true})
  expect(await learn.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
 }finally{await context.close()}
})
