# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: interactive-challenge-language.spec.ts >> T087 T088 Challenge cards preserve mixed source wording and names on Arabic phone, English phone/desktop and projector
- Location: e2e/interactive-challenge-language.spec.ts:19:1

# Error details

```
Error: expect(locator).toHaveAttribute(expected) failed

Locator:  getByRole('heading', { name: 'الأكسجين Oxygen يساعد الإنسان على التنفس.', exact: true })
Expected: "auto"
Received: "rtl"
Timeout:  5000ms

Call log:
  - Expect "toHaveAttribute" getByRole('heading', { name: 'الأكسجين Oxygen يساعد الإنسان على التنفس.', exact: true }) with timeout 5000ms
  - waiting for getByRole('heading', { name: 'الأكسجين Oxygen يساعد الإنسان على التنفس.', exact: true })
    14 × locator resolved to <h1 dir="rtl" lang="ar" class="_prompt_1dmj5_4">…</h1>
       - unexpected value "rtl"

```

```yaml
- heading "الأكسجين Oxygen يساعد الإنسان على التنفس." [level=1]
```

# Test source

```ts
  1  | import {test,expect,type Page} from '@playwright/test'
  2  | import {teacherFixture} from './helpers/interactive-evidence'
  3  | import type {SessionSnapshot} from '../src/shared/session'
  4  | test.use({trace:'off'})
  5  | 
  6  | function watch(page:Page){
  7  |  let current:SessionSnapshot|null=null
  8  |  page.on('websocket',socket=>socket.on('framereceived',frame=>{
  9  |   const text=String(frame.payload);if(!text.startsWith('42'))return
  10 |   try{const [event,value]=JSON.parse(text.slice(2));if(event==='session:snapshot')current=value}catch{/* Other protocol frames. */}
  11 |  }))
  12 |  return()=>current
  13 | }
  14 | async function capture(page:Page,name:string){
  15 |  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all(document.getAnimations().filter(a=>a.effect?.getTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{})));window.scrollTo({top:0,behavior:'instant'})})
  16 |  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
  17 |  await page.screenshot({path:`../docs/evidence/interactive/language-challenge-${name}.png`,fullPage:true})
  18 | }
  19 | test('T087 T088 Challenge cards preserve mixed source wording and names on Arabic phone, English phone/desktop and projector',async({page,request,browser})=>{
  20 |  test.setTimeout(60000)
  21 |  const prompt='الأكسجين Oxygen يساعد الإنسان على التنفس.',hint='اقرأ كلمة Oxygen ثم فكّر في الهواء الذي نتنفسه.',name='ليان Layan 7'
  22 |  const fixture=await teacherFixture(page,request,'ar',[{kind:'tf',prompt,payload:{correct:true},timeLimitS:120,challenge:true,hint,explanation:'الأكسجين غاز ضروري للتنفس. Oxygen is needed for breathing.'}])
  23 |  await fixture.publish()
  24 |  const host=watch(page),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message))
  25 |  await page.goto(`/teacher/activities/${fixture.activity.id}/play?mode=live`)
  26 |  await page.getByRole('radio',{name:/بطاقات التحدي/}).check()
  27 |  await page.getByRole('checkbox',{name:'السماح للمعلم بعرض التلميحات المحفوظة للجميع'}).check()
  28 |  await page.getByRole('button',{name:'ابدأ الحصة المباشرة',exact:true}).click()
  29 |  await expect(page).toHaveURL(/\/teacher\/live\/\d+$/)
  30 |  const pin=await page.locator('strong[dir=ltr]').first().innerText()
  31 |  const context=await browser.newContext({baseURL:process.env.PW_BASE_URL,viewport:{width:390,height:844}})
  32 |  await context.addInitScript(()=>localStorage.setItem('asasera.language','en'))
  33 |  const learner=await context.newPage();learner.on('pageerror',e=>errors.push(e.message));const student=watch(learner)
  34 |  let projector:Page|undefined
  35 |  try{
  36 |   await learner.goto(`/join?pin=${pin}`);await learner.getByLabel('Display name').fill(name);await learner.getByRole('button',{name:'Join class',exact:true}).click()
  37 |   await expect(learner.getByText('You are in. Wait for your teacher to start.')).toBeVisible()
  38 |   await expect.poll(()=>host()?.participants.some(p=>p.name===name)).toBe(true)
  39 |   await expect(page.getByRole('main').getByText(name,{exact:true})).toBeVisible()
  40 |   await capture(page,'roster-ar-390')
  41 |   await page.locator('summary[aria-label="خيارات الحصة"]').click()
  42 |   const popup=page.waitForEvent('popup');await page.getByRole('button',{name:'افتح شاشة العرض',exact:true}).click();projector=await popup
  43 |   await projector.setViewportSize({width:1920,height:1080});projector.on('pageerror',e=>errors.push(e.message))
  44 |   await expect(projector.getByRole('heading',{name:'لنبدأ معًا'})).toBeVisible()
  45 |   await page.getByRole('button',{name:'اسحب بطاقة',exact:true}).click()
  46 |   await expect.poll(()=>host()?.presentation?.selection.definitionId).toBe('challenge-cards')
  47 |   await page.getByRole('button',{name:'ابدأ السؤال',exact:true}).click()
  48 |   await expect(learner.getByRole('heading',{name:prompt,exact:true})).toBeVisible()
  49 |   await expect(projector.getByRole('heading',{name:prompt,exact:true})).toBeVisible()
  50 |   await page.getByRole('button',{name:'أظهر تلميحًا',exact:true}).click()
  51 |   for(const target of [page,learner,projector]){
  52 |    await expect(target.getByText(hint,{exact:true})).toBeVisible()
> 53 |    await expect(target.getByRole('heading',{name:prompt,exact:true})).toHaveAttribute('dir','auto')
     |                                                                       ^ Error: expect(locator).toHaveAttribute(expected) failed
  54 |   }
  55 |   const occurrence=host()!.presentation!.active!.id
  56 |   await expect.poll(()=>student()?.presentation?.active?.id).toBe(occurrence)
  57 |   await expect(page.getByText('سؤال تحدٍّ',{exact:true})).toBeVisible()
  58 |   await expect(learner.getByText('Challenge question',{exact:true})).toBeVisible()
  59 |   await capture(page,'host-ar-390');await capture(learner,'learner-en-390');await capture(projector,'projector-ar-1920')
  60 |   await page.locator('summary[aria-label="خيارات الحصة"]').click();await page.getByRole('button',{name:'English',exact:true}).click()
  61 |   for(const width of [1440,390]){
  62 |    await page.setViewportSize({width,height:width===1440?900:844})
  63 |    await expect(page.getByRole('heading',{name:prompt,exact:true})).toBeVisible();await expect(page.getByText(hint,{exact:true})).toBeVisible()
  64 |    expect(host()!.presentation!.active!.id).toBe(occurrence)
  65 |    await expect(page.getByRole('button',{name:'Reveal answer',exact:true})).toBeEnabled()
  66 |    await capture(page,`host-en-${width}`)
  67 |   }
  68 |   await learner.getByRole('button',{name:'True',exact:true}).click()
  69 |   await expect(learner.getByRole('heading',{name:'You’re in! Answer saved'})).toBeVisible()
  70 |   await page.getByRole('button',{name:'Reveal answer',exact:true}).click()
  71 |   await expect(learner.getByRole('heading',{name:'You got it!',exact:true})).toBeVisible()
  72 |   await page.locator('summary[aria-label="Session options"]').click();await page.getByRole('button',{name:'End class early',exact:true}).click()
  73 |   await expect(page.getByRole('heading',{name:'Class finished',exact:true})).toBeVisible()
  74 |   expect(errors).toEqual([])
  75 |  }finally{await projector?.close();await context.close()}
  76 | })
  77 | 
```