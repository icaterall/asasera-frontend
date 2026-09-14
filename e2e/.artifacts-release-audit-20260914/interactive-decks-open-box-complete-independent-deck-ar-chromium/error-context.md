# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: interactive-decks.spec.ts >> open-box complete independent deck ar
- Location: e2e/interactive-decks.spec.ts:3:99

# Error details

```
Error: locator.check: Test ended.
Call log:
  - waiting for getByRole('radio', { name: /الذاكرة/ })

```

# Test source

```ts
  1  | import {test,expect} from '@playwright/test'
  2  | 
  3  | for(const mode of ['open-box','random-cards'] as const)for(const language of ['ar','en'] as const)test(`${mode} complete independent deck ${language}`,async({page,request,browser})=>{
  4  |  test.setTimeout(90000)
  5  |  expect(new URL(process.env.PW_BASE_URL??'http://127.0.0.1:5411').hostname).toMatch(/^(127\.0\.0\.1|localhost)$/)
  6  |  const ar=language==='ar',width=ar?390:1440,height=ar?844:900,boxes=mode==='open-box',count=boxes?13:3,email=`deck-${crypto.randomUUID()}@example.com`,password='Synthetic deck fixture2026!'
  7  |  await request.post('/api/v1/auth/register/teacher',{data:{name:'Deck instructor',email,password}})
  8  |  const login=await request.post('/api/v1/auth/login',{data:{email,password}}),{accessToken}=await login.json(),headers={Authorization:`Bearer ${accessToken}`}
  9  |  const create=await request.post('/api/v1/activities',{headers,data:{title:ar?'مراجعة تجريبية':'Synthetic review',contentLanguage:language,subjectId:1,levelId:8,purposeId:2}}),{activity}=await create.json()
  10 |  for(let n=1;n<=count;n++)expect((await request.post(`/api/v1/activities/${activity.id}/questions`,{headers,data:{kind:'tf',prompt:ar?`العبارة التجريبية ${n}: الشمس نجم.`:`Synthetic statement ${n}: the sun is a star.`,payload:{correct:true}}})).ok()).toBe(true)
  11 |  expect((await request.post(`/api/v1/activities/${activity.id}/publish`,{headers})).ok()).toBe(true)
  12 |  await page.context().addCookies((await request.storageState()).cookies)
  13 |  await page.addInitScript(lang=>localStorage.setItem('asasera.language',lang),language);await page.setViewportSize({width,height})
  14 |  await page.goto(`/teacher/activities/${activity.id}/play?mode=study`)
  15 |  // Unavailable is inspectable, but cannot launch or silently manufacture pairs.
> 16 |  await page.getByRole('radio',{name:ar?/الذاكرة/:/Memory/}).check()
     |                                                             ^ Error: locator.check: Test ended.
  17 |  await expect(page.getByRole('button',{name:ar?'أنشئ رابط المشاركة':'Create assignment link'})).toBeDisabled()
  18 |  await expect(page.getByRole('link',{name:ar?'تعديل محتوى النشاط':'Edit activity content'})).toHaveAttribute('href',`/teacher/activities/${activity.id}`)
  19 |  await page.screenshot({path:`../docs/evidence/interactive/deck-${mode}-${language}-compatibility.png`,fullPage:true})
  20 |  await page.getByRole('radio',{name:boxes?(ar?/افتح الصندوق/:/Open the box/):(ar?/بطاقات عشوائية/:/Random cards/)}).check()
  21 |  await page.getByRole('button',{name:ar?'أنشئ رابط المشاركة':'Create assignment link'}).click()
  22 |  const link=await page.getByRole('textbox',{name:ar?'رابط النشاط':'Assignment link'}).inputValue()
  23 |  const context=await browser.newContext({viewport:{width,height},recordVideo:{dir:'../docs/evidence/interactive/recordings',size:{width,height}}})
  24 |  await context.addInitScript(lang=>localStorage.setItem('asasera.language',lang),language)
  25 |  const learn=await context.newPage(),errors:string[]=[],seen=new Set<string>();learn.on('pageerror',e=>errors.push(e.message))
  26 |  try{
  27 |   await learn.goto(link);await learn.getByRole('textbox',{name:ar?'اسمك':'Your name'}).fill(ar?'طالب تجريبي':'Synthetic learner')
  28 |   await learn.getByRole('button',{name:ar?'ابدأ':'Start',exact:true}).click()
  29 |   const board=learn.locator('[data-presentation="open-box"]')
  30 |   if(boxes){
  31 |    let originalNumbers:string[]|undefined
  32 |    for(const size of [390,768,1440]){
  33 |     await learn.setViewportSize({width:size,height:900})
  34 |     const buttons=board.getByRole('button',{name:ar?/^الصندوق /:/^Box /})
  35 |     await expect(buttons).toHaveCount(12)
  36 |     const numbers=await buttons.evaluateAll(nodes=>nodes.map(node=>node.getAttribute('aria-label')??''))
  37 |     if(originalNumbers)expect(numbers).toEqual(originalNumbers);else originalNumbers=numbers
  38 |     const positions=await buttons.evaluateAll(nodes=>nodes.map(node=>node.getBoundingClientRect().top))
  39 |     expect(positions.filter(top=>top===positions[0])).toHaveLength(size===390?2:size===768?3:4)
  40 |     await learn.screenshot({path:`../docs/evidence/interactive/boxes-${language}-${size}-page1.png`,fullPage:true})
  41 |    }
  42 |    await learn.setViewportSize({width,height})
  43 |   }
  44 |   for(let n=1;n<=count;n++)await test.step(`Select and save item ${n}`,async()=>{
  45 |    if(boxes){
  46 |     if(n===13)await learn.getByRole('navigation',{name:ar?'صفحات الصناديق':'Box pages'}).getByRole('button',{name:ar?'التالي':'Next'}).click()
  47 |     if(n===1)await learn.route('**/delivery/attempts/*/presentation',async route=>{
  48 |      const committed=await route.fetch()
  49 |      await new Promise(resolve=>setTimeout(resolve,400))
  50 |      await route.fulfill({response:committed})
  51 |     },{times:1})
  52 |     await learn.getByRole('button',{name:ar?`الصندوق ${n}`:`Box ${n}`,exact:true}).click()
  53 |     if(n===1){
  54 |      expect(await board.getByRole('button',{name:ar?/^الصندوق /:/^Box /}).count()).toBe(12)
  55 |      await expect(learn.getByRole('button',{name:ar?'الصندوق 1':'Box 1',exact:true})).toBeDisabled()
  56 |     }
  57 |    }else{
  58 |     const draw=learn.getByRole('button',{name:n===1?(ar?'ابدأ الجولة':'Start round'):(ar?'البطاقة التالية':'Next card')})
  59 |     await draw.scrollIntoViewIfNeeded()
  60 |     const rect=await draw.boundingBox();expect(rect).not.toBeNull()
  61 |     // Real repeated pointer clicks must consume only one unseen card.
  62 |     await learn.mouse.click(rect!.x+rect!.width/2,rect!.y+rect!.height/2,{clickCount:5,delay:10})
  63 |    }
  64 |    const heading=learn.getByRole('heading',{name:ar?/العبارة التجريبية/:/Synthetic statement/})
  65 |    await expect(heading).toBeVisible();await expect.poll(async()=>seen.has(await heading.innerText())).toBe(false);const text=await heading.innerText();seen.add(text)
  66 |    // Record the complete draw transition before a separate answer action.
  67 |    if(n===1)await learn.waitForTimeout(380)
  68 |    const answer=learn.getByRole('button',{name:ar?'صح':'True',exact:true});await answer.focus();await learn.keyboard.press('Enter')
  69 |    await expect(learn.getByRole('status').filter({hasText:ar?'إجابة صحيحة':'Correct'})).toBeVisible()
  70 |    if(n===1){await learn.reload();await expect(heading).toHaveText(text)}
  71 |    if(n===count)await learn.screenshot({path:`../docs/evidence/interactive/deck-${mode}-${language}-answered.png`,fullPage:true})
  72 |    if(boxes&&n<count){await learn.getByRole('button',{name:ar?'العودة إلى الصناديق':'Back to boxes'}).click();if(n===1){
  73 |     const consumed=learn.getByRole('button',{name:ar?'الصندوق 1، مفتوح':'Box 1, opened'})
  74 |     await expect(consumed).toBeDisabled()
  75 |     await context.setOffline(true)
  76 |     await expect(consumed).toBeDisabled()
  77 |     await context.setOffline(false);await learn.reload()
  78 |     await expect(heading).toHaveText(text)
  79 |     await learn.getByRole('button',{name:ar?'العودة إلى الصناديق':'Back to boxes'}).click()
  80 |     await expect(consumed).toBeDisabled()
  81 |    }}
  82 |   })
  83 |   expect(seen.size).toBe(count)
  84 |   await learn.getByRole('button',{name:ar?'إنهاء الجولة':'Finish round'}).click()
  85 |   await expect(learn.getByRole('heading',{name:ar?'اكتملت الجولة':'Round complete'})).toBeVisible()
  86 |   expect(await learn.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(errors).toEqual([])
  87 |  }finally{const video=learn.video();await context.close();await video?.saveAs(`../docs/evidence/interactive/recordings/deck-${mode}-${language}.webm`)}
  88 | })
  89 | 
```