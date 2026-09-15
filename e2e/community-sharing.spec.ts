import {test,expect,type Page} from '@playwright/test'
import {isolatedStackOnly,localTeacher} from './local-fixture'
test.use({actionTimeout:15000})

for(const [language,width,height,theme] of [['en',1440,1000,'light'],['ar',390,844,'dark']] as const){
 test(`public ownership, question comments and student ratings ${language}`,async({page,browser})=>{
  isolatedStackOnly();test.setTimeout(90000)
  const ar=language==='ar',baseURL=process.env.PW_BASE_URL!,owner=localTeacher()
  const capture=async(p:Page,name:string)=>{await p.evaluate(()=>{if(document.activeElement instanceof HTMLElement)document.activeElement.blur();document.querySelectorAll('*').forEach(el=>{if(el.scrollTop)el.scrollTo({top:0,behavior:'instant'})});window.scrollTo({top:0,behavior:'instant'})});await p.screenshot({path:`../docs/evidence/community/${name}-${language}-${theme}.png`,fullPage:true})}
  const prepare=async(p:Page)=>{await p.addInitScript(({language,theme})=>{localStorage.setItem('asasera.language',language);localStorage.setItem('asasera.theme',theme)},{language,theme});await p.setViewportSize({width,height})}
  await prepare(page)
  const login=await page.request.post('/api/v1/auth/login',{data:{email:owner.email,password:owner.password}})
  expect(login.ok()).toBe(true)
  const headers={authorization:`Bearer ${(await login.json()).accessToken}`}
  const created=await page.request.post('/api/v1/activities',{headers,data:{title:ar?'مشاركة درس الكسور':'Fractions for everyone',subjectId:1,levelId:8,purposeId:2}})
  expect(created.ok(),await created.text()).toBe(true)
  const {activity}=await created.json()
  const q=await page.request.post(`/api/v1/activities/${activity.id}/questions`,{headers,data:{kind:'tf',prompt:ar?'النصف يساوي ربعين.':'One half equals two quarters.',payload:{correct:true},explanation:ar?'ربعان يساويان نصفًا.':'Two quarters make one half.'}})
  expect(q.ok(),await q.text()).toBe(true)
  expect((await page.request.post(`/api/v1/activities/${activity.id}/publish`,{headers})).ok()).toBe(true)
  expect((await page.request.get(`/api/v1/community/activities/${activity.id}`)).status()).toBe(404)
  expect((await page.request.post(`/api/v1/activities/${activity.id}/share`,{headers})).ok()).toBe(true)
  const path=`/activities/${activity.id}`
  const reviewerContext=await browser.newContext({baseURL}),studentContext=await browser.newContext({baseURL})
  try{
   const reviewer=await reviewerContext.newPage(),student=await studentContext.newPage()
   const errors:string[]=[];for(const p of [page,reviewer,student])p.on('pageerror',e=>errors.push(e.message))
   for(const [p,role] of [[reviewer,'teacher'],[student,'student']] as const){
    await prepare(p)
    const email=`community-${crypto.randomUUID()}@example.com`,password='Synthetic community test 2026!'
    const registration=await p.request.post(`/api/v1/auth/register/${role}`,{data:{name:role==='teacher'?'Review instructor':'Private student',email,password}})
    expect(registration.ok(),await registration.text()).toBe(true)
    expect((await p.request.post('/api/v1/auth/login',{data:{email,password}})).ok()).toBe(true)
    await p.goto(path)
   }
   await reviewer.getByText(ar?'ملاحظة على هذا السؤال':'Comment on this question',{exact:true}).click()
   const comment=ar?'يرجى إضافة مثال بالرسم.':'Please add a visual fraction example.'
   await reviewer.getByLabel(ar?'ملاحظتك':'Your comment',{exact:true}).fill(comment)
   await reviewer.getByRole('button',{name:ar?'إرسال الملاحظة':'Send comment',exact:true}).click()
   await expect(reviewer.getByRole('button',{name:ar?'تحديث الملاحظة':'Update comment'})).toBeVisible()
   await reviewer.reload()
   await expect(reviewer.getByRole('textbox',{name:ar?'ملاحظتك':'Your comment',exact:true})).toHaveValue(comment)
   await reviewer.getByRole('radio',{name:ar?'4 من 5':'4 out of 5'}).check()
   await reviewer.getByRole('button',{name:ar?'إرسال الملاحظات':'Send feedback',exact:true}).click()
   await expect(reviewer.getByRole('button',{name:ar?'تحديث الملاحظات':'Update feedback',exact:true})).toBeVisible()
   expect(await reviewer.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
   await capture(reviewer,'reviewer')
   await student.getByRole('radio',{name:ar?'5 من 5':'5 out of 5'}).check()
   await expect(student.getByRole('checkbox')).toHaveCount(0)
   await student.getByRole('button',{name:ar?'إرسال الملاحظات':'Send feedback',exact:true}).click()
   await expect(student.getByRole('button',{name:ar?'تحديث الملاحظات':'Update feedback',exact:true})).toBeVisible()
   await student.reload()
   await expect(student.getByRole('radio',{name:ar?'5 من 5':'5 out of 5'})).toBeChecked()
   await expect(student.getByText(ar?/تقييمات طلاب/:/student reviews/).first()).toBeVisible()
   await capture(student,'student')
   await page.goto(`/teacher/feedback?activityId=${activity.id}`)
   const entry=page.locator('article').filter({hasText:comment})
   await entry.getByText(ar?'الردّ وتحديث الحالة':'Reply and update status',{exact:true}).click()
   const response=ar?'شكرًا، سأضيف المثال.':'Thank you, I will add the example.'
   await entry.getByLabel(ar?'ردّك لصاحب الملاحظة (اختياري)':'Your reply to the reviewer (optional)').fill(response)
   await entry.getByRole('button',{name:ar?'حفظ الردّ':'Save response'}).click()
   await expect(page.getByRole('status').filter({hasText:ar?'تم تحديث الملاحظات.':'Feedback updated.'})).toBeVisible()
   await capture(page,'owner')
   await reviewer.reload();await expect(reviewer.getByText(response,{exact:true})).toBeVisible()
   await page.goto(path)
   await page.getByRole('button',{name:ar?'إيقاف المشاركة وجعله خاصًا':'Stop sharing and make private'}).click()
   await expect(page.getByRole('heading',{name:ar?'أصبح النشاط خاصًا':'Your activity is now private'})).toBeVisible()
   await reviewer.reload();await expect(reviewer.getByRole('heading',{name:ar?'النشاط غير متاح':'This activity isn’t available'})).toBeVisible()
   expect(errors).toEqual([])
  }finally{await reviewerContext.close();await studentContext.close()}
 })
}
