# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: interactive-challenge-language.spec.ts >> T087 T088 Challenge cards preserve mixed source wording and names on Arabic phone, English phone/desktop and projector
- Location: e2e/interactive-challenge-language.spec.ts:18:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator:  getByText('ليان Layan 7', { exact: true }).first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
  - Expect "toBeVisible" getByText('ليان Layan 7', { exact: true }).first() with timeout 5000ms
  - waiting for getByText('ليان Layan 7', { exact: true }).first()
    14 × locator resolved to <b dir="auto">ليان Layan 7</b>
       - unexpected value "hidden"

```

```yaml
- banner:
  - link "انضم برمز 486683":
    - /url: /join?pin=486683
    - text: انضم عبر 127.0.0.1:5411/join
    - strong: "486683"
  - link "أساسيرا":
    - /url: /teacher/activities
    - img "أساسيرا"
  - text: "1"
  - status "متصل"
  - button "تشغيل الصوت"
  - button "ملء الشاشة"
  - group
- text: مراجعة نشاط معتمد
- button "العجلة العشوائية"
- group: إدارة المشاركين (1)
- region "بطاقات الأسئلة":
  - heading "بطاقات الأسئلة" [level=2]
  - paragraph: الجولة 1 · 1 متبقٍ
  - button "اسحب بطاقة"
  - group: قواعد هذه الحصة
  - group: إعداد الفرق
- text: الصف
- combobox "الصف": حصة دون صف محفوظ
- group: أضف صفًا
- paragraph: اختر الصف نفسه في كل حصة للحفاظ على دقة تقارير الاستخدام.
- main:
  - heading "لنبدأ معًا" [level=1]
  - paragraph: امسح الرمز أو افتح رابط الانضمام
  - strong: "486683"
  - img "رمز الانضمام"
  - link "127.0.0.1:5411/join":
    - /url: /join?pin=486683
  - heading "1 مشارك" [level=2]
  - text: ليان Layan 7
```

# Test source

```ts
  1  | import {test,expect,type Page} from '@playwright/test'
  2  | import {teacherFixture} from './helpers/interactive-evidence'
  3  | import type {SessionSnapshot} from '../src/shared/session'
  4  | 
  5  | function watch(page:Page){
  6  |  let current:SessionSnapshot|null=null
  7  |  page.on('websocket',socket=>socket.on('framereceived',frame=>{
  8  |   const text=String(frame.payload);if(!text.startsWith('42'))return
  9  |   try{const [event,value]=JSON.parse(text.slice(2));if(event==='session:snapshot')current=value}catch{/* Other protocol frames. */}
  10 |  }))
  11 |  return()=>current
  12 | }
  13 | async function capture(page:Page,name:string){
  14 |  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all(document.getAnimations().filter(a=>a.effect?.getTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{})));window.scrollTo({top:0,behavior:'instant'})})
  15 |  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
  16 |  await page.screenshot({path:`../docs/evidence/interactive/language-challenge-${name}.png`,fullPage:true})
  17 | }
  18 | test('T087 T088 Challenge cards preserve mixed source wording and names on Arabic phone, English phone/desktop and projector',async({page,request,browser})=>{
  19 |  test.setTimeout(60000)
  20 |  const prompt='الأكسجين Oxygen يساعد الإنسان على التنفس.',hint='اقرأ كلمة Oxygen ثم فكّر في الهواء الذي نتنفسه.',name='ليان Layan 7'
  21 |  const fixture=await teacherFixture(page,request,'ar',[{kind:'tf',prompt,payload:{correct:true},timeLimitS:120,challenge:true,hint,explanation:'الأكسجين غاز ضروري للتنفس. Oxygen is needed for breathing.'}])
  22 |  await fixture.publish()
  23 |  const host=watch(page),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message))
  24 |  await page.goto(`/teacher/activities/${fixture.activity.id}/play?mode=live`)
  25 |  await page.getByRole('radio',{name:/بطاقات التحدي/}).check()
  26 |  await page.getByRole('checkbox',{name:'السماح للمعلم بعرض التلميحات المحفوظة للجميع'}).check()
  27 |  await page.getByRole('button',{name:'ابدأ الحصة المباشرة',exact:true}).click()
  28 |  await expect(page).toHaveURL(/\/teacher\/live\/\d+$/)
  29 |  const pin=await page.locator('strong[dir=ltr]').first().innerText()
  30 |  const context=await browser.newContext({baseURL:process.env.PW_BASE_URL,viewport:{width:390,height:844}})
  31 |  await context.addInitScript(()=>localStorage.setItem('asasera.language','en'))
  32 |  const learner=await context.newPage();learner.on('pageerror',e=>errors.push(e.message));const student=watch(learner)
  33 |  let projector:Page|undefined
  34 |  try{
  35 |   await learner.goto(`/join?pin=${pin}`);await learner.getByLabel('Display name').fill(name);await learner.getByRole('button',{name:'Join class',exact:true}).click()
  36 |   await expect(learner.getByText('You are in. Wait for your teacher to start.')).toBeVisible()
  37 |   await expect.poll(()=>host()?.participants.some(p=>p.name===name)).toBe(true)
> 38 |   await expect(page.getByText(name,{exact:true}).first()).toBeVisible()
     |                                                           ^ Error: expect(locator).toBeVisible() failed
  39 |   await capture(page,'roster-ar-390')
  40 |   await page.locator('summary[aria-label="خيارات الحصة"]').click()
  41 |   const popup=page.waitForEvent('popup');await page.getByRole('button',{name:'افتح شاشة العرض',exact:true}).click();projector=await popup
  42 |   await projector.setViewportSize({width:1920,height:1080});projector.on('pageerror',e=>errors.push(e.message))
  43 |   await expect(projector.getByRole('heading',{name:'لنبدأ معًا'})).toBeVisible()
  44 |   await page.getByRole('button',{name:'اسحب بطاقة',exact:true}).click()
  45 |   await expect.poll(()=>host()?.presentation?.selection.definitionId).toBe('challenge-cards')
  46 |   await page.getByRole('button',{name:'ابدأ السؤال',exact:true}).click()
  47 |   await expect(learner.getByRole('heading',{name:prompt,exact:true})).toBeVisible()
  48 |   await expect(projector.getByRole('heading',{name:prompt,exact:true})).toBeVisible()
  49 |   await page.getByRole('button',{name:'أظهر تلميحًا',exact:true}).click()
  50 |   for(const target of [page,learner,projector]){
  51 |    await expect(target.getByText(hint,{exact:true})).toBeVisible()
  52 |    await expect(target.getByRole('heading',{name:prompt,exact:true})).toHaveAttribute('dir','auto')
  53 |   }
  54 |   const occurrence=host()!.presentation!.active!.id
  55 |   await expect.poll(()=>student()?.presentation?.active?.id).toBe(occurrence)
  56 |   await expect(page.getByText('سؤال تحدٍّ',{exact:true})).toBeVisible()
  57 |   await expect(learner.getByText('Challenge question',{exact:true})).toBeVisible()
  58 |   await capture(page,'host-ar-390');await capture(learner,'learner-en-390');await capture(projector,'projector-ar-1920')
  59 |   await page.locator('summary[aria-label="خيارات الحصة"]').click();await page.getByRole('button',{name:'English',exact:true}).click()
  60 |   for(const width of [1440,390]){
  61 |    await page.setViewportSize({width,height:width===1440?900:844})
  62 |    await expect(page.getByRole('heading',{name:prompt,exact:true})).toBeVisible();await expect(page.getByText(hint,{exact:true})).toBeVisible()
  63 |    expect(host()!.presentation!.active!.id).toBe(occurrence)
  64 |    await expect(page.getByRole('button',{name:'Reveal answer',exact:true})).toBeEnabled()
  65 |    await capture(page,`host-en-${width}`)
  66 |   }
  67 |   await learner.getByRole('button',{name:'True',exact:true}).click()
  68 |   await expect(learner.getByRole('heading',{name:'You’re in! Answer saved'})).toBeVisible()
  69 |   await page.getByRole('button',{name:'Reveal answer',exact:true}).click()
  70 |   await expect(learner.getByRole('heading',{name:'You got it!',exact:true})).toBeVisible()
  71 |   await page.locator('summary[aria-label="Session options"]').click();await page.getByRole('button',{name:'End class early',exact:true}).click()
  72 |   await expect(page.getByRole('heading',{name:'Class finished',exact:true})).toBeVisible()
  73 |   expect(errors).toEqual([])
  74 |  }finally{await projector?.close();await context.close()}
  75 | })
  76 | 
```