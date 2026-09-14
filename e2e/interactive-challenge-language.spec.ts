import {test,expect,type Page} from '@playwright/test'
import {teacherFixture} from './helpers/interactive-evidence'
import type {SessionSnapshot} from '../src/shared/session'
test.use({trace:'off'})

function watch(page:Page){
 let current:SessionSnapshot|null=null
 page.on('websocket',socket=>socket.on('framereceived',frame=>{
  const text=String(frame.payload);if(!text.startsWith('42'))return
  try{const [event,value]=JSON.parse(text.slice(2));if(event==='session:snapshot')current=value}catch{/* Other protocol frames. */}
 }))
 return()=>current
}
async function capture(page:Page,name:string){
 await page.evaluate(async()=>{await document.fonts.ready;await Promise.all(document.getAnimations().filter(a=>a.effect?.getTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{})));window.scrollTo({top:0,behavior:'instant'})})
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
 await page.screenshot({path:`../docs/evidence/interactive/language-challenge-${name}.png`,fullPage:true})
}
test('T087 T088 Challenge cards preserve mixed source wording and names on Arabic phone, English phone/desktop and projector',async({page,request,browser})=>{
 test.setTimeout(60000)
 const prompt='الأكسجين Oxygen يساعد الإنسان على التنفس.',hint='اقرأ كلمة Oxygen ثم فكّر في الهواء الذي نتنفسه.',name='ليان Layan 7'
 const fixture=await teacherFixture(page,request,'ar',[{kind:'tf',prompt,payload:{correct:true},timeLimitS:120,challenge:true,hint,explanation:'الأكسجين غاز ضروري للتنفس. Oxygen is needed for breathing.'}])
 await fixture.publish()
 const host=watch(page),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message))
 await page.goto(`/teacher/activities/${fixture.activity.id}/play?mode=live`)
 await page.getByRole('radio',{name:/بطاقات التحدي/}).check()
 await page.getByRole('checkbox',{name:'السماح للمعلم بعرض التلميحات المحفوظة للجميع'}).check()
 await page.getByRole('button',{name:'ابدأ الحصة المباشرة',exact:true}).click()
 await expect(page).toHaveURL(/\/teacher\/live\/\d+$/)
 const pin=await page.locator('strong[dir=ltr]').first().innerText()
 const context=await browser.newContext({baseURL:process.env.PW_BASE_URL,viewport:{width:390,height:844}})
 await context.addInitScript(()=>localStorage.setItem('asasera.language','en'))
 const learner=await context.newPage();learner.on('pageerror',e=>errors.push(e.message));const student=watch(learner)
 let projector:Page|undefined
 try{
  await learner.goto(`/join?pin=${pin}`);await learner.getByLabel('Display name').fill(name);await learner.getByRole('button',{name:'Join class',exact:true}).click()
  await expect(learner.getByText('You are in. Wait for your teacher to start.')).toBeVisible()
  await expect.poll(()=>host()?.participants.some(p=>p.name===name)).toBe(true)
  await expect(page.getByRole('main').getByText(name,{exact:true})).toBeVisible()
  await capture(page,'roster-ar-390')
  await page.locator('summary[aria-label="خيارات الحصة"]').click()
  const popup=page.waitForEvent('popup');await page.getByRole('button',{name:'افتح شاشة العرض',exact:true}).click();projector=await popup
  await projector.setViewportSize({width:1920,height:1080});projector.on('pageerror',e=>errors.push(e.message))
  await expect(projector.getByRole('heading',{name:'لنبدأ معًا'})).toBeVisible()
  await page.getByRole('button',{name:'اسحب بطاقة',exact:true}).click()
  await expect.poll(()=>host()?.presentation?.selection.definitionId).toBe('challenge-cards')
  await page.getByRole('button',{name:'ابدأ السؤال',exact:true}).click()
  await expect(learner.getByRole('heading',{name:prompt,exact:true})).toBeVisible()
  await expect(projector.getByRole('heading',{name:prompt,exact:true})).toBeVisible()
  await page.getByRole('button',{name:'أظهر تلميحًا',exact:true}).click()
  for(const target of [page,learner,projector]){
   await expect(target.getByText(hint,{exact:true})).toBeVisible()
   await expect(target.getByRole('heading',{name:prompt,exact:true})).toHaveAttribute('dir','rtl')
   await expect(target.getByRole('heading',{name:prompt,exact:true})).toHaveAttribute('lang','ar')
  }
  const occurrence=host()!.presentation!.active!.id
  await expect.poll(()=>student()?.presentation?.active?.id).toBe(occurrence)
  await expect(page.getByText('سؤال تحدٍّ',{exact:true})).toBeVisible()
  await expect(learner.getByText('Challenge question',{exact:true})).toBeVisible()
  await capture(page,'host-ar-390');await capture(learner,'learner-en-390');await capture(projector,'projector-ar-1920')
  await page.locator('summary[aria-label="خيارات الحصة"]').click();await page.getByRole('button',{name:'English',exact:true}).click()
  for(const width of [1440,390]){
   await page.setViewportSize({width,height:width===1440?900:844})
   await expect(page.getByRole('heading',{name:prompt,exact:true})).toBeVisible();await expect(page.getByText(hint,{exact:true})).toBeVisible()
   expect(host()!.presentation!.active!.id).toBe(occurrence)
   await expect(page.getByRole('button',{name:'Reveal answer',exact:true})).toBeEnabled()
   await capture(page,`host-en-${width}`)
  }
  await learner.getByRole('button',{name:'True',exact:true}).click()
  await expect(learner.getByRole('heading',{name:'You’re in! Answer saved'})).toBeVisible()
  await page.getByRole('button',{name:'Reveal answer',exact:true}).click()
  await expect(learner.getByRole('heading',{name:'You got it!',exact:true})).toBeVisible()
  await page.locator('summary[aria-label="Session options"]').click();await page.getByRole('button',{name:'End class early',exact:true}).click()
  await expect(page.getByRole('heading',{name:'Class finished',exact:true})).toBeVisible()
  expect(errors).toEqual([])
 }finally{await projector?.close();await context.close()}
})
