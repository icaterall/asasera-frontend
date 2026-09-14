# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: delivery.spec.ts >> a zoned assignment with two attempts: the guest submits, retries once, and is refused a third
- Location: e2e/delivery.spec.ts:63:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Test source

```ts
  1   | import {test,expect,type Locator,type Page} from '@playwright/test'
  2   | import {readFileSync,mkdirSync} from 'node:fs'
  3   | test('teacher assigns, learner resumes and completes all question types, feedback waits until closure',async({page,browser})=>{
  4   |  test.setTimeout(90_000)
  5   |  const fixture=JSON.parse(readFileSync('/tmp/asasera-delivery-browser-fixture.json','utf8'))
  6   |  await page.addInitScript(()=>localStorage.setItem('asasera.language','en'))
  7   |  const login=await page.request.post('/api/v1/auth/login',{data:{email:fixture.email,password:fixture.password}});expect(login.ok()).toBe(true)
  8   |  const {accessToken}=await login.json(),headers={authorization:`Bearer ${accessToken}`}
  9   |  await page.setViewportSize({width:1440,height:900});await page.goto(`/teacher/activities/${fixture.activityId}/play`)
  10  |  await page.getByRole('radio',{name:/Assign homework/}).check()
  11  |  await page.screenshot({path:'../screenshots/v4/delivery-setup-1440.png',fullPage:true})
  12  |  await page.setViewportSize({width:390,height:844});await page.screenshot({path:'../screenshots/v4/delivery-setup-390.png',fullPage:true})
  13  |  await page.getByRole('button',{name:'Create assignment link',exact:true}).click()
  14  |  const link=await page.getByLabel('Assignment link',{exact:true}).inputValue();expect(link).toContain('/learn/')
  15  |  const assignmentId=new URL(link).pathname.split('/').at(-1)!
  16  |  const context=await browser.newContext({viewport:{width:390,height:844}})
  17  |  const student=await context.newPage();await context.addInitScript(()=>localStorage.setItem('asasera.language','en'))
  18  |  const responses:unknown[]=[]
  19  |  student.on('response',async r=>{if(r.url().includes('/delivery/attempts/')&&r.status()===200)responses.push(await r.json())})
  20  |  try{
  21  |   await student.goto(link);await student.getByLabel('Your name',{exact:true}).fill('Synthetic learner');await student.getByRole('button',{name:'Start',exact:true}).click()
  22  |   await expect(student.getByRole('heading',{name:'Synthetic mcq',exact:true})).toBeVisible()
  23  |   await student.screenshot({path:'../screenshots/v4/homework-question-390.png',fullPage:true})
  24  |   await student.getByRole('button',{name:'a',exact:true}).click();await expect(student.getByRole('button',{name:'Next',exact:true})).toBeVisible()
  25  |   await student.reload();await expect(student.getByRole('button',{name:'Next',exact:true})).toBeVisible();await student.getByRole('button',{name:'Next',exact:true}).click()
  26  |   await student.getByRole('button',{name:'True',exact:true}).click();await student.getByRole('button',{name:'Next',exact:true}).click()
  27  |   const first=student.locator('li[class*=orderItem]').first();if((await first.innerText()).includes('Two'))await student.getByRole('button',{name:'Move up / للأعلى One',exact:true}).press('Enter')
  28  |   await student.getByRole('button',{name:'Submit order',exact:true}).click();await student.getByRole('button',{name:'Next',exact:true}).click()
  29  |   await student.getByRole('button',{name:'One',exact:true}).press('Enter');await student.getByRole('button',{name:'A',exact:true}).press('Enter')
  30  |   await student.getByRole('button',{name:'Two',exact:true}).press('Enter');await student.getByRole('button',{name:'B',exact:true}).press('Enter')
  31  |   await student.getByRole('button',{name:'Submit answer',exact:true}).click();await student.getByRole('button',{name:'Next',exact:true}).click()
  32  |   await student.getByRole('button',{name:'Zone 1',exact:true}).press('Enter');await student.getByRole('button',{name:'Submit answer',exact:true}).click();await student.getByRole('button',{name:'Next',exact:true}).click()
  33  |   await student.getByRole('button',{name:'One',exact:true}).click();await student.getByRole('button',{name:'Zone 1',exact:true}).click()
  34  |   await student.getByRole('button',{name:'Two',exact:true}).click();await student.getByRole('button',{name:'Zone 2',exact:true}).click()
  35  |   await student.getByRole('button',{name:'Submit answer',exact:true}).click();await student.getByRole('button',{name:'Submit activity',exact:true}).click()
  36  |   await expect(student.getByRole('heading',{name:'Activity submitted!',exact:true})).toBeVisible()
  37  |   for(const value of responses){const r=value as {feedbackAvailable:boolean;score:number|null;correctCount:number|null;review:unknown[];question?:unknown};expect(r.feedbackAvailable).toBe(false);expect(r.score).toBeNull();expect(r.correctCount).toBeNull();expect(r.review).toEqual([]);expect(JSON.stringify(r)).not.toContain('PRIVATE_DELIVERY_REASON')}
  38  |   await expect(student.getByRole('dialog')).toHaveCount(0)
  39  |   const closed=await page.request.post(`/api/v1/delivery/assignments/${assignmentId}/close`,{headers});expect(closed.ok()).toBe(true);const {runId}=await closed.json()
  40  |   await student.reload();await expect(student.getByText('6 correct out of 6',{exact:true})).toBeVisible()
  41  |   await student.getByRole('button',{name:'العربية',exact:true}).click();await expect(student.locator('main')).toHaveAttribute('dir','rtl')
  42  |   expect(await student.evaluate(()=>innerWidth)).toBe(390);expect(await student.evaluate(()=>document.documentElement.scrollWidth)).toBe(390)
  43  |   const badges=await student.locator('span[class*=mark]').evaluateAll(elements=>elements.map(el=>{const r=el.getBoundingClientRect();const p=el.parentElement!.getBoundingClientRect();return {left:r.left,right:r.right,parentLeft:p.left,parentRight:p.right,size:parseFloat(getComputedStyle(el).fontSize)}}))
  44  |   expect(badges.every(b=>b.left>=b.parentLeft&&b.right<=b.parentRight&&b.size<=16)).toBe(true)
  45  |   await student.screenshot({path:'../screenshots/v4/homework-review-390-ar.png',fullPage:true,animations:'disabled'})
  46  |   const report=await(await page.request.get(`/api/v1/reports/runs/${runId}`,{headers})).json();expect(report.participants[0].correctCount).toBe(6);expect(report.participants[0].status).toBe('submitted')
  47  |   await student.getByRole('button',{name:'خروج من جهاز مشترك',exact:true}).click();await expect(student.getByRole('dialog',{name:'إزالة مفتاح الاستئناف؟',exact:true})).toBeVisible();await student.getByRole('button',{name:'أزل المفتاح واخرج',exact:true}).click();expect(await student.evaluate(id=>localStorage.getItem(`asasera:assignment:${id}`),assignmentId)).toBeNull()
  48  |  }finally{await context.close()}
  49  | })
  50  | 
  51  | /* ── v5.1 C2: the availability window and the attempt limit, end to end ──────────────────────────
  52  |    The teacher names a zone and allows two attempts; a guest submits, retries once, and is refused a
  53  |    third. Every refusal comes from the server — the browser only renders what it is told. */
  54  | const EVIDENCE=process.env.C2_EVIDENCE_DIR??'../screenshots/v51/assign'
  55  | const shot=(target:Page,name:string)=>target.screenshot({path:`${EVIDENCE}/${name}.png`,fullPage:true,animations:'disabled'})
  56  | /** Choose in the same combobox a person uses; the search box keeps a long zone list manageable. */
  57  | async function choose(page:Page,control:Locator,value:string,search?:string){
  58  |  await control.first().click()
  59  |  if(search)await page.getByRole('combobox',{name:/Search options|ابحث في الخيارات/}).fill(search)
  60  |  await page.locator(`[role="option"][data-option-value=${JSON.stringify(value)}]:visible`).click()
  61  |  await expect(control.first()).toHaveAttribute('data-select-value',value)
  62  | }
  63  | test('a zoned assignment with two attempts: the guest submits, retries once, and is refused a third',async({page,browser})=>{
  64  |  test.setTimeout(180_000)
  65  |  mkdirSync(EVIDENCE,{recursive:true})
  66  |  const fixture=JSON.parse(readFileSync('/tmp/asasera-delivery-browser-fixture.json','utf8'))
> 67  |  const login=await page.request.post('/api/v1/auth/login',{data:{email:fixture.email,password:fixture.password}});expect(login.ok()).toBe(true)
      |                                                                                                                                      ^ Error: expect(received).toBe(expected) // Object.is equality
  68  |  const {accessToken}=await login.json(),headers={authorization:`Bearer ${accessToken}`}
  69  |  // A two-question activity of its own, so the retry journey stays inside one screen of interactions.
  70  |  const made=await page.request.post('/api/v1/activities',{headers,data:{title:'Two attempts at shapes',subjectId:1,levelId:8,purposeId:2}})
  71  |  expect(made.ok()).toBe(true);const activityId=(await made.json()).activity.id
  72  |  for(const q of [{kind:'mcq',prompt:'Pick a',payload:{options:['a','b','c','d'].map(key=>({key,text:key})),correct:'a'}},{kind:'tf',prompt:'True or false',payload:{correct:true}}])
  73  |   expect((await page.request.post(`/api/v1/activities/${activityId}/questions`,{headers,data:q})).ok()).toBe(true)
  74  |  expect((await page.request.post(`/api/v1/activities/${activityId}/publish`,{headers})).ok()).toBe(true)
  75  | 
  76  |  const fill=async()=>{
  77  |   await choose(page,page.getByLabel(/Time zone|المنطقة الزمنية/),'Asia/Muscat','Muscat')
  78  |   await choose(page,page.getByLabel(/Attempts allowed|عدد المحاولات المسموح بها/),'2')
  79  |   await expect(page.locator('[data-resolved-window]')).toContainText('UTC')
  80  |  }
  81  |  for(const language of ['en','ar'] as const){
  82  |   await page.addInitScript(lang=>localStorage.setItem('asasera.language',lang),language)
  83  |   await page.goto(`/teacher/activities/${activityId}/play?mode=homework`)
  84  |   await fill()
  85  |   await page.setViewportSize({width:1280,height:900});await shot(page,`teacher-window-1280-${language}`)
  86  |   await page.setViewportSize({width:390,height:844});await shot(page,`teacher-window-390-${language}`)
  87  |  }
  88  |  // The link is created from the Arabic form; the resolved instant the SERVER stored is shown back.
  89  |  await page.setViewportSize({width:1280,height:900})
  90  |  await page.getByRole('button',{name:'أنشئ رابط المشاركة',exact:true}).click()
  91  |  await expect(page.locator('[data-created-window]')).toContainText('Asia/Muscat')
  92  |  await expect(page.locator('[data-created-window]')).toContainText('2')
  93  |  const link=await page.getByLabel('رابط النشاط',{exact:true}).inputValue();expect(link).toContain('/learn/')
  94  |  const assignmentId=new URL(link).pathname.split('/').at(-1)!
  95  |  await shot(page,'teacher-created-1280-ar')
  96  | 
  97  |  const context=await browser.newContext({viewport:{width:390,height:844}})
  98  |  await context.addInitScript(()=>localStorage.setItem('asasera.language','en'))
  99  |  const student=await context.newPage()
  100 |  const attempt=async(name?:string)=>{
  101 |   if(name){await student.getByLabel('Your name',{exact:true}).fill(name);await student.getByRole('button',{name:'Start',exact:true}).click()}
  102 |   await student.getByRole('button',{name:'a',exact:true}).click()
  103 |   await student.getByRole('button',{name:'Next',exact:true}).click()
  104 |   await student.getByRole('button',{name:'True',exact:true}).click()
  105 |   await student.getByRole('button',{name:'Submit activity',exact:true}).click()
  106 |   await expect(student.getByRole('heading',{name:'Activity submitted!',exact:true})).toBeVisible()
  107 |  }
  108 |  const bothLanguages=async(prefix:string)=>{
  109 |   for(const width of [390,1280]){
  110 |    await student.setViewportSize({width,height:width===390?844:900})
  111 |    await shot(student,`${prefix}-${width}-en`)
  112 |    await student.getByRole('button',{name:'العربية',exact:true}).click()
  113 |    await expect(student.locator('main')).toHaveAttribute('dir','rtl')
  114 |    await shot(student,`${prefix}-${width}-ar`)
  115 |    await student.getByRole('button',{name:'English',exact:true}).click()
  116 |    await expect(student.locator('main')).toHaveAttribute('dir','ltr')
  117 |   }
  118 |   await student.setViewportSize({width:390,height:844})
  119 |  }
  120 |  try{
  121 |   await student.goto(link)
  122 |   await attempt('Synthetic learner')
  123 |   // Attempt 1 of 2 is spent; the offer names the attempt it is about to start.
  124 |   await expect(student.getByRole('button',{name:'Try again (2 of 2)',exact:true})).toBeVisible()
  125 |   await expect(student.locator('[data-attempts-left]')).toContainText('1 of 2 attempts left')
  126 |   await expect(student.locator('[data-attempts-left]')).toContainText('browser-storage identity')
  127 |   // A submitted attempt shows no question — and no leftover heading from the ones already answered.
  128 |   await expect(student.locator('[data-question-surface]')).toHaveCount(0)
  129 |   await bothLanguages('learner-retry-offered')
  130 |   const before=await student.evaluate(id=>localStorage.getItem(`asasera:assignment:${id}`),assignmentId)
  131 |   await student.getByRole('button',{name:'Try again (2 of 2)',exact:true}).click()
  132 |   await expect(student.locator('[data-attempt-counter]')).toHaveText('Attempt 2 of 2')
  133 |   expect(await student.evaluate(id=>localStorage.getItem(`asasera:assignment:${id}`),assignmentId)).not.toBe(before)
  134 |   await attempt()
  135 |   // Attempt 2 of 2 is spent: no third offer anywhere on the page, and the server says so too.
  136 |   await expect(student.getByRole('button',{name:/Try again/})).toHaveCount(0)
  137 |   await expect(student.locator('[data-attempts-exhausted]')).toContainText('all 2 attempts')
  138 |   await bothLanguages('learner-limit-reached')
  139 |   const saved=JSON.parse(await student.evaluate(id=>localStorage.getItem(`asasera:assignment:${id}`),assignmentId)??'{}')
  140 |   const refused=await student.request.post(`/api/v1/delivery/attempts/${saved.attemptId}/retry`,{data:{token:saved.token,requestId:crypto.randomUUID()}})
  141 |   expect(refused.status()).toBe(409);expect((await refused.json()).error?.code??(await refused.json()).code).toBe('attempts_exhausted')
  142 |   // Exactly two attempt rows exist for this identity — the browser could not talk the server into a third.
  143 |   const report=await(await page.request.get(`/api/v1/delivery/assignments`,{headers})).json()
  144 |   expect(report.assignments.find((a:{id:string})=>a.id===assignmentId)).toMatchObject({maxAttempts:2,deadlineTz:'Asia/Muscat',windowState:'open',attempts:2,submitted:2})
  145 |  }finally{await context.close()}
  146 | })
  147 | 
  148 | test('an assignment that has not opened yet tells the learner when it does, in its own zone',async({page,browser})=>{
  149 |  test.setTimeout(120_000)
  150 |  mkdirSync(EVIDENCE,{recursive:true})
  151 |  const fixture=JSON.parse(readFileSync('/tmp/asasera-delivery-browser-fixture.json','utf8'))
  152 |  const login=await page.request.post('/api/v1/auth/login',{data:{email:fixture.email,password:fixture.password}});expect(login.ok()).toBe(true)
  153 |  const {accessToken}=await login.json(),headers={authorization:`Bearer ${accessToken}`}
  154 |  const wall=(days:number)=>new Date(Date.now()+days*86400000).toISOString().slice(0,11)+'09:00'
  155 |  // Wall-clock times in a zone that is not this machine's, so the learner sees a real conversion.
  156 |  const created=await page.request.post('/api/v1/delivery/assignments',{headers,data:{activityId:fixture.activityId,mode:'homework',feedback:'after_deadline',classId:null,
  157 |   deadlineLocal:wall(8),opensAtLocal:wall(1),deadlineTz:'Europe/London',maxAttempts:3,requestId:crypto.randomUUID()}})
  158 |  expect(created.status()).toBe(201)
  159 |  const body=await created.json();expect(body.windowState).toBe('scheduled');expect(body.deadlineTz).toBe('Europe/London')
  160 |  // The server refuses a join before the opening instant and says when it opens.
  161 |  const early=await page.request.post(`/api/v1/delivery/assignments/${body.id}/join`,{data:{accessToken:body.accessToken,name:'Too early',requestId:crypto.randomUUID()}})
  162 |  expect(early.status()).toBe(409)
  163 |  const refusal=await early.json();expect(refusal.error?.code??refusal.code).toBe('assignment_not_open')
  164 |  expect(refusal.error?.details?.opensAt??refusal.details?.opensAt).toBe(body.opensAt)
  165 | 
  166 |  const context=await browser.newContext({viewport:{width:390,height:844}})
  167 |  await context.addInitScript(()=>localStorage.setItem('asasera.language','en'))
```