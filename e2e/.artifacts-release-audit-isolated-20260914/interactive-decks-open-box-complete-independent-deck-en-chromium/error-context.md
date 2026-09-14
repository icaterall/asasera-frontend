# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: interactive-decks.spec.ts >> open-box complete independent deck en
- Location: e2e/interactive-decks.spec.ts:3:99

# Error details

```
Test timeout of 90000ms exceeded.
```

```
Error: locator.check: Test timeout of 90000ms exceeded.
Call log:
  - waiting for getByRole('radio', { name: /Memory/ })

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - link "Skip to content" [ref=e4] [cursor=pointer]:
    - /url: "#teacher-main"
  - status [ref=e6]:
    - generic [ref=e7]:
      - paragraph [ref=e10]: Verify your email to secure your Asasera account. Check your inbox at deck-d22a8f3a-db7d-4b2e-b826-7f86510b24a7@example.com.
      - generic [ref=e11]:
        - button "Verify email" [ref=e12]
        - button "Change email" [ref=e13]
  - generic [ref=e14]:
    - complementary [ref=e15]:
      - link [ref=e17] [cursor=pointer]:
        - /url: /
        - img "Asasera" [ref=e18]
      - navigation "Teacher navigation" [ref=e19]:
        - link "Home" [ref=e20] [cursor=pointer]:
          - /url: /teacher/dashboard
        - link "My activities" [ref=e24] [cursor=pointer]:
          - /url: /teacher/activities
        - link "My materials" [ref=e29] [cursor=pointer]:
          - /url: /teacher/materials
        - link "Homework & study" [ref=e33] [cursor=pointer]:
          - /url: /teacher/assignments
        - link "Class reports" [ref=e36] [cursor=pointer]:
          - /url: /teacher/reports
        - group [ref=e39]:
          - generic "More" [ref=e40] [cursor=pointer]
        - link "Help & guides" [ref=e41] [cursor=pointer]:
          - /url: /teacher/guides
    - generic [ref=e49]:
      - banner [ref=e50]:
        - paragraph [ref=e51]: Teacher workspace
        - generic [ref=e52]:
          - link "Create activity" [ref=e53] [cursor=pointer]:
            - /url: /teacher/activities/new
          - 'button "Available balance: 0. Open account and usage" [ref=e54] [cursor=pointer]':
            - generic [ref=e58]:
              - strong [ref=e59]: "0"
              - generic [ref=e60]: Add credit
          - group "Language" [ref=e63]:
            - button "التبديل إلى العربية" [ref=e64]: ع
            - button "Switch to English" [pressed] [ref=e65]: EN
          - button "Toggle colour theme" [ref=e66]
          - button "Account menu — Teacher" [ref=e74] [cursor=pointer]:
            - generic [ref=e76]: D
      - main [ref=e77]:
        - generic [ref=e78]:
          - link "← My activities" [ref=e79] [cursor=pointer]:
            - /url: /teacher/activities
          - generic [ref=e80]:
            - generic [ref=e81]:
              - heading "Synthetic review" [level=1] [ref=e82]
              - paragraph [ref=e83]: Choose the experience that fits your learners, then launch when you are ready.
            - generic "13 approved questions" [ref=e84]:
              - strong [ref=e85]: "13"
              - generic [ref=e86]: Approved questions
          - generic [ref=e87]:
            - generic [aria-hidden] [ref=e88]: "1"
            - generic [ref=e89]:
              - heading "How would you like to play?" [level=2] [ref=e90]
              - paragraph [ref=e91]: Choose one delivery mode. You can change it before launching.
          - group "Play mode" [ref=e92]:
            - generic [ref=e94] [cursor=pointer]:
              - radio "Live game Host together. Students join with a game PIN." [ref=e95]
              - generic [ref=e96]:
                - strong [ref=e97]: Live game
                - generic [ref=e98]: Host together. Students join with a game PIN.
            - generic [ref=e100] [cursor=pointer]:
              - radio "Assign homework Set a deadline and choose when answers become visible." [ref=e101]
              - generic [ref=e102]:
                - strong [ref=e103]: Assign homework
                - generic [ref=e104]: Set a deadline and choose when answers become visible.
            - generic [ref=e106] [cursor=pointer]:
              - radio "Self-study Let learners practice at their own pace with feedback." [checked] [ref=e107]
              - generic [ref=e108]:
                - strong [ref=e109]: Self-study
                - generic [ref=e110]: Let learners practice at their own pace with feedback.
          - group "Present your content" [ref=e112]:
            - generic [ref=e113]:
              - generic [aria-hidden] [ref=e114]: "2"
              - generic [ref=e115]: Present your content
            - paragraph [ref=e116]: Reuse approved questions without creating new content or using AI credit.
            - generic [ref=e117]:
              - generic [ref=e118] [cursor=pointer]:
                - radio "Questions in order" [checked] [ref=e119]
                - generic [ref=e120]:
                  - strong [ref=e121]: Questions in order
                  - generic [ref=e122]: Present approved questions one after another.
                - generic [ref=e123]: Ready · all 13 questions
              - generic [ref=e125] [cursor=pointer]:
                - radio "Flashcards" [ref=e126]
                - generic [ref=e127]:
                  - strong [ref=e128]: Flashcards
                  - generic [ref=e129]: Recall an answer, then rate your memory.
                - generic [ref=e130]: Ready · all 13 questions
              - generic [ref=e132] [cursor=pointer]:
                - radio "Question wheel" [ref=e133]
                - generic [ref=e134]:
                  - strong [ref=e135]: Question wheel
                  - generic [ref=e136]: Spin to choose a question without repeats.
                - generic [ref=e137]: Ready · all 13 questions
              - generic [ref=e139] [cursor=pointer]:
                - radio "Random cards" [ref=e140]
                - generic [ref=e141]:
                  - strong [ref=e142]: Random cards
                  - generic [ref=e143]: Draw and answer a card from the deck.
                - generic [ref=e144]: Ready · all 13 questions
              - generic [ref=e146] [cursor=pointer]:
                - radio "Open the box" [ref=e147]
                - generic [ref=e148]:
                  - strong [ref=e149]: Open the box
                  - generic [ref=e150]: Open a numbered box to reveal its question.
                - generic [ref=e151]: Ready · all 13 questions
            - group [ref=e153]:
              - generic "Formats that need other content (8)" [ref=e154] [cursor=pointer]
          - group [ref=e155]:
            - 'generic "Advanced: game experience Classic quiz" [ref=e156] [cursor=pointer]':
              - generic [ref=e157]: "Advanced: game experience"
              - emphasis [ref=e158]: Classic quiz
          - group "Assignment settings" [ref=e159]:
            - generic [ref=e161]:
              - text: Time zone
              - combobox "Time zone" [ref=e162] [cursor=pointer]:
                - generic [ref=e163]: Asia/Muscat
              - textbox [aria-hidden] [ref=e166]: Asia/Muscat
            - generic [ref=e167]:
              - text: Opens at (optional)
              - textbox "Opens at (optional)" [ref=e168]
            - generic [ref=e169]:
              - text: Deadline
              - textbox "Deadline" [ref=e170]: 2026-09-21T21:46
            - generic [ref=e171]:
              - text: Attempts allowed
              - combobox "Attempts allowed" [ref=e172] [cursor=pointer]:
                - generic [ref=e173]: 1 attempt
              - textbox [aria-hidden] [ref=e176]: "1"
            - generic [ref=e177]:
              - text: Show correct answers
              - combobox "Show correct answers" [ref=e178] [cursor=pointer]:
                - generic [ref=e179]: After each answer
              - textbox [aria-hidden] [ref=e183]: immediate
            - generic [ref=e184]:
              - text: Class
              - combobox "Class" [ref=e185] [cursor=pointer]:
                - generic [ref=e186]: No saved class
              - textbox [aria-hidden] [ref=e190]
            - paragraph [ref=e191]:
              - generic [ref=e192]:
                - text: "Closes: Sep 21, 2026, 09:46 PM GMT+4 ·"
                - generic [ref=e193]: Sep 21, 2026, 5:46 PM UTC
              - text: · Asia/Muscat
            - paragraph [ref=e194]: Progress resumes in the same browser. Results appear in your reports and do not affect public shelf rankings.
          - generic [ref=e195]:
            - generic [ref=e196]:
              - generic [ref=e197]: Ready to start
              - strong [ref=e198]: Self-study · Questions in order
              - generic [ref=e199]: Review the schedule, then create the share link.
            - button "Create assignment link" [ref=e200] [cursor=pointer]
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
     |                                                             ^ Error: locator.check: Test timeout of 90000ms exceeded.
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