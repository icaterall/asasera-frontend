import {test,expect} from '@playwright/test'
import {readFileSync} from 'node:fs'
test('teacher assigns, learner resumes and completes all question types, feedback waits until closure',async({page,browser})=>{
 test.setTimeout(90_000)
 const fixture=JSON.parse(readFileSync('/tmp/asasera-delivery-browser-fixture.json','utf8'))
 await page.addInitScript(()=>localStorage.setItem('asasera.language','en'))
 const login=await page.request.post('/api/v1/auth/login',{data:{email:fixture.email,password:fixture.password}});expect(login.ok()).toBe(true)
 const {accessToken}=await login.json(),headers={authorization:`Bearer ${accessToken}`}
 await page.setViewportSize({width:1440,height:900});await page.goto(`/teacher/activities/${fixture.activityId}/play`)
 await page.getByRole('radio',{name:/Assign homework/}).check()
 await page.screenshot({path:'../screenshots/v4/delivery-setup-1440.png',fullPage:true})
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'../screenshots/v4/delivery-setup-390.png',fullPage:true})
 await page.getByRole('button',{name:'Create assignment link',exact:true}).click()
 const link=await page.getByLabel('Assignment link',{exact:true}).inputValue();expect(link).toContain('/learn/')
 const assignmentId=new URL(link).pathname.split('/').at(-1)!
 const context=await browser.newContext({viewport:{width:390,height:844}})
 const student=await context.newPage();await context.addInitScript(()=>localStorage.setItem('asasera.language','en'))
 const responses:unknown[]=[]
 student.on('response',async r=>{if(r.url().includes('/delivery/attempts/')&&r.status()===200)responses.push(await r.json())})
 try{
  await student.goto(link);await student.getByLabel('Your name',{exact:true}).fill('Synthetic learner');await student.getByRole('button',{name:'Start',exact:true}).click()
  await expect(student.getByRole('heading',{name:'Synthetic mcq',exact:true})).toBeVisible()
  await student.screenshot({path:'../screenshots/v4/homework-question-390.png',fullPage:true})
  await student.getByRole('button',{name:'a',exact:true}).click();await expect(student.getByRole('button',{name:'Next',exact:true})).toBeVisible()
  await student.reload();await expect(student.getByRole('button',{name:'Next',exact:true})).toBeVisible();await student.getByRole('button',{name:'Next',exact:true}).click()
  await student.getByRole('button',{name:'True',exact:true}).click();await student.getByRole('button',{name:'Next',exact:true}).click()
  const first=student.locator('li[class*=orderItem]').first();if((await first.innerText()).includes('Two'))await student.getByRole('button',{name:'Move up / للأعلى One',exact:true}).press('Enter')
  await student.getByRole('button',{name:'Submit order',exact:true}).click();await student.getByRole('button',{name:'Next',exact:true}).click()
  await student.getByRole('button',{name:'One',exact:true}).press('Enter');await student.getByRole('button',{name:'A',exact:true}).press('Enter')
  await student.getByRole('button',{name:'Two',exact:true}).press('Enter');await student.getByRole('button',{name:'B',exact:true}).press('Enter')
  await student.getByRole('button',{name:'Submit answer',exact:true}).click();await student.getByRole('button',{name:'Next',exact:true}).click()
  await student.getByRole('button',{name:'Zone 1',exact:true}).press('Enter');await student.getByRole('button',{name:'Submit answer',exact:true}).click();await student.getByRole('button',{name:'Next',exact:true}).click()
  await student.getByRole('button',{name:'One',exact:true}).click();await student.getByRole('button',{name:'Zone 1',exact:true}).click()
  await student.getByRole('button',{name:'Two',exact:true}).click();await student.getByRole('button',{name:'Zone 2',exact:true}).click()
  await student.getByRole('button',{name:'Submit answer',exact:true}).click();await student.getByRole('button',{name:'Submit activity',exact:true}).click()
  await expect(student.getByRole('heading',{name:'Activity submitted!',exact:true})).toBeVisible()
  for(const value of responses){const r=value as {feedbackAvailable:boolean;score:number|null;correctCount:number|null;review:unknown[];question?:unknown};expect(r.feedbackAvailable).toBe(false);expect(r.score).toBeNull();expect(r.correctCount).toBeNull();expect(r.review).toEqual([]);expect(JSON.stringify(r)).not.toContain('PRIVATE_DELIVERY_REASON')}
  await expect(student.getByRole('dialog')).toHaveCount(0)
  const closed=await page.request.post(`/api/v1/delivery/assignments/${assignmentId}/close`,{headers});expect(closed.ok()).toBe(true);const {runId}=await closed.json()
  await student.reload();await expect(student.getByText('6 correct out of 6',{exact:true})).toBeVisible()
  await student.getByRole('button',{name:'العربية',exact:true}).click();await expect(student.locator('main')).toHaveAttribute('dir','rtl')
  expect(await student.evaluate(()=>innerWidth)).toBe(390);expect(await student.evaluate(()=>document.documentElement.scrollWidth)).toBe(390)
  const badges=await student.locator('span[class*=mark]').evaluateAll(elements=>elements.map(el=>{const r=el.getBoundingClientRect();const p=el.parentElement!.getBoundingClientRect();return {left:r.left,right:r.right,parentLeft:p.left,parentRight:p.right,size:parseFloat(getComputedStyle(el).fontSize)}}))
  expect(badges.every(b=>b.left>=b.parentLeft&&b.right<=b.parentRight&&b.size<=16)).toBe(true)
  await student.screenshot({path:'../screenshots/v4/homework-review-390-ar.png',fullPage:true,animations:'disabled'})
  const report=await(await page.request.get(`/api/v1/reports/runs/${runId}`,{headers})).json();expect(report.participants[0].correctCount).toBe(6);expect(report.participants[0].status).toBe('submitted')
  await student.getByRole('button',{name:'خروج من جهاز مشترك',exact:true}).click();await expect(student.getByRole('dialog',{name:'إزالة مفتاح الاستئناف؟',exact:true})).toBeVisible();await student.getByRole('button',{name:'أزل المفتاح واخرج',exact:true}).click();expect(await student.evaluate(id=>localStorage.getItem(`asasera:assignment:${id}`),assignmentId)).toBeNull()
 }finally{await context.close()}
})
