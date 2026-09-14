import {test,expect} from '@playwright/test'

// Real local API and isolated database. No network interception or fake wallet.
for(const [language,width,height] of [['ar',390,844],['en',1440,900]] as const){
 test(`saved instructor wheel ${language} ${width}`,async({page,request})=>{
  const origin=process.env.PW_BASE_URL??'http://127.0.0.1:5411'
  expect(new URL(origin).hostname).toMatch(/^(127\.0\.0\.1|localhost)$/)
  const email=`interactive-wheel-${crypto.randomUUID()}@example.com`,password='Synthetic wheel test 2026!'
  const registration=await request.post('/api/v1/auth/register/teacher',{data:{name:'Interactive fixture',email,password}})
  expect(registration.ok()).toBe(true)
  const login=await request.post('/api/v1/auth/login',{data:{email,password}})
  expect(login.ok()).toBe(true)
  // The API context stores this synthetic fixture's normal HttpOnly session.
  await page.context().addCookies((await request.storageState()).cookies)
  await page.addInitScript(lang=>{localStorage.setItem('asasera.language',lang)},language)
  await page.setViewportSize({width,height})
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message))
  await page.goto('/teacher/wheel')
  const ar=language==='ar'
  await expect(page.getByRole('heading',{name:ar?'عجلة الاختيار العشوائي':'Random wheel',exact:true})).toBeVisible()
  const list=page.getByRole('textbox',{name:ar?'أسماء أو موضوعات أو أسئلة':'Names, topics or questions'})
  await list.fill(ar?'أحمد\nأحمد\nمريم ذات الاسم الطويل للاختبار':'Sara\nSara\nLong classroom participant name')
  await page.getByRole('button',{name:ar?'استخدم هذه القائمة':'Use this list'}).click()
  await expect(page.locator('[data-random-wheel]')).toHaveAttribute('data-wheel-state','ready')
  await page.screenshot({path:`../docs/evidence/interactive/wheel-${language}-${width}-ready.png`,fullPage:true})
  await page.getByRole('button',{name:ar?'أدر العجلة':'Spin the wheel',exact:true}).click()
  await expect(page.locator('[data-random-wheel]')).toHaveAttribute('data-wheel-state','spinning')
  await page.screenshot({path:`../docs/evidence/interactive/wheel-${language}-${width}-motion.png`})
  await expect(page.locator('[data-random-wheel]')).toHaveAttribute('data-wheel-state','selected',{timeout:8000})
  const result=await page.locator('[role=status] strong').innerText()
  await page.reload()
  await expect(page.locator('[role=status] strong')).toHaveText(result)
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
  await page.screenshot({path:`../docs/evidence/interactive/wheel-${language}-${width}-recovered.png`,fullPage:true})
  expect(errors).toEqual([])
 })
}
