# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: activity-themes.spec.ts >> teacher previews every world, cancels, retries failed saves and preserves edits across reload
- Location: e2e/activity-themes.spec.ts:39:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Themes', exact: true })

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner "Editor bar" [ref=e4]:
    - link "Asasera — dashboard" [ref=e5] [cursor=pointer]:
      - /url: /teacher/dashboard
      - img "Asasera" [ref=e7]
    - generic [ref=e8]:
      - heading "Activity worlds · test" [level=1] [ref=e9]
      - textbox "Activity title" [ref=e10]: Activity worlds · test
      - generic [ref=e11]: Saved
    - generic [ref=e14]:
      - 'button "Available balance: 0. Open account and usage" [ref=e15] [cursor=pointer]':
        - generic [ref=e19]:
          - strong [ref=e20]: "0"
          - generic [ref=e21]: Add credit
      - button "Account menu — Teacher" [ref=e23] [cursor=pointer]:
        - generic [ref=e25]: T
    - group "Activity actions" [ref=e26]:
      - button "Save" [disabled] [ref=e27]
      - button "Undo" [ref=e32] [cursor=pointer]
      - button "Activity settings" [ref=e36] [cursor=pointer]
      - button "More" [ref=e40] [cursor=pointer]
      - button "Approve version" [ref=e45] [cursor=pointer]
  - navigation "Activity questions" [ref=e46]:
    - generic [ref=e47]:
      - generic [ref=e48]:
        - button "Duplicate question" [ref=e49] [cursor=pointer]
        - button "Delete question" [ref=e53] [cursor=pointer]
      - generic [ref=e57]:
        - paragraph [ref=e58]:
          - generic [ref=e59]: 1 Quiz
        - button "A saved question before choosing a world" [ref=e60] [cursor=pointer]
    - generic [ref=e67]:
      - button "Add question" [ref=e68] [cursor=pointer]
      - button "Generate with AI" [ref=e69] [cursor=pointer]
      - paragraph [ref=e73]: From a topic or your uploaded sources.
  - main [ref=e74]:
    - generic [ref=e75]:
      - generic [ref=e76]:
        - toolbar "Text formatting" [ref=e78]:
          - button "Bold" [ref=e79] [cursor=pointer]
          - button "Italic" [ref=e82] [cursor=pointer]
          - button "Subscript" [ref=e85] [cursor=pointer]
          - button "Superscript" [ref=e90] [cursor=pointer]
          - button "Symbols" [ref=e95] [cursor=pointer]
          - button "Equation" [ref=e98] [cursor=pointer]
        - textbox "Question text" [active] [ref=e103]:
          - paragraph [ref=e104]: A saved question before choosing a world
      - button "Question image (optional)" [ref=e106] [cursor=pointer]:
        - generic [ref=e110]: Find and insert media (Optional)
        - generic [ref=e111]: Upload file or drag here to upload
      - generic [ref=e112]:
        - generic [ref=e114]:
          - button "Remove answer 1" [ref=e119] [cursor=pointer]
          - textbox "Answer 1 text" [ref=e126]:
            - paragraph [ref=e127]: Mars
          - generic [ref=e128]:
            - generic "Correct answer" [ref=e129] [cursor=pointer]:
              - radio "Answer 1 is correct" [checked] [ref=e130]
            - button "Answer image" [ref=e131] [cursor=pointer]
        - generic [ref=e137]:
          - button "Remove answer 2" [ref=e142] [cursor=pointer]
          - textbox "Answer 2 text" [ref=e149]:
            - paragraph [ref=e150]: Venus
          - generic [ref=e151]:
            - generic "Correct answer" [ref=e152] [cursor=pointer]:
              - radio "Answer 2 is correct" [ref=e153]
            - button "Answer image" [ref=e154] [cursor=pointer]
        - generic [ref=e160]:
          - button "Remove answer 3" [ref=e165] [cursor=pointer]
          - textbox "Answer 3 text" [ref=e172]:
            - paragraph [ref=e173]: Saturn
          - generic [ref=e174]:
            - generic "Correct answer" [ref=e175] [cursor=pointer]:
              - radio "Answer 3 is correct" [ref=e176]
            - button "Answer image" [ref=e177] [cursor=pointer]
        - generic [ref=e183]:
          - button "Remove answer 4" [ref=e188] [cursor=pointer]
          - textbox "Answer 4 text" [ref=e195]:
            - paragraph [ref=e196]: Jupiter
          - generic [ref=e197]:
            - generic "Correct answer" [ref=e198] [cursor=pointer]:
              - radio "Answer 4 is correct" [ref=e199]
            - button "Answer image" [ref=e200] [cursor=pointer]
      - button "Add more answers" [ref=e206] [cursor=pointer]
      - generic [ref=e208]:
        - generic [ref=e209]: Explanation (optional)
        - textbox "Explanation (optional)" [ref=e210]:
          - /placeholder: Why is this answer correct? Learners see it after the answer window closes.
  - complementary "Question properties" [ref=e211]:
    - generic [ref=e212]:
      - heading "Question properties" [level=2] [ref=e213]
      - button "Fold properties" [expanded] [ref=e214] [cursor=pointer]
    - tablist "Sidebar panel" [ref=e218]:
      - tab "Question properties" [selected] [ref=e219] [cursor=pointer]
      - tab "Themes" [ref=e222] [cursor=pointer]
    - generic [ref=e230]:
      - generic [ref=e231]: Question type
      - button "Question type" [ref=e235] [cursor=pointer]:
        - strong [ref=e242]: Quiz
    - generic [ref=e245]:
      - generic [ref=e246]: Time limit
      - combobox "Time limit in seconds" [ref=e250] [cursor=pointer]:
        - generic [ref=e251]: 120 seconds
      - textbox [aria-hidden] [ref=e255]: "120"
      - button "Apply to all questions" [ref=e256] [cursor=pointer]
    - generic [ref=e257]:
      - generic [ref=e258]: Points
      - combobox "Points" [ref=e265] [cursor=pointer]:
        - generic [ref=e266]: Standard
      - textbox [aria-hidden] [ref=e270]: "1"
    - generic [ref=e271]:
      - button "Duplicate question" [ref=e272] [cursor=pointer]
      - button "Delete question" [ref=e273] [cursor=pointer]
```

# Test source

```ts
  1   | import { test, expect, type Page } from '@playwright/test'
  2   | import { localTeacher } from './local-fixture'
  3   | import { readFileSync } from 'node:fs'
  4   | const ROOT = '.impeccable/review/activity-themes'
  5   | const worlds=['jungle','sky','island','ocean','desert','space','aurora','volcano','candy','arctic','castle','garden']
  6   | async function setup(page:Page, theme='classic', lang='en') {
  7   |   const account=localTeacher()
  8   |   await page.addInitScript(lang=>{localStorage.setItem('asasera.language',lang);localStorage.setItem('i18nextLng',lang);localStorage.setItem('asasera.theme','light')},lang)
  9   |   const login=await page.request.post('/api/v1/auth/login',{data:{email:account.email,password:account.password}})
  10  |   expect(login.ok()).toBe(true)
  11  |   const {accessToken}=await login.json(), headers={authorization:`Bearer ${accessToken}`}
  12  |   const created=await page.request.post('/api/v1/activities',{headers,data:{title:'Activity worlds · test',subjectId:1,levelId:8,purposeId:2,theme}})
  13  |   expect(created.ok()).toBe(true)
  14  |   const {activity}=await created.json()
  15  |   const added=await page.request.post(`/api/v1/activities/${activity.id}/questions`,{headers,data:{kind:'mcq',prompt:lang==='ar'?'أي كوكب يُعرف بالكوكب الأحمر؟':'Which planet is known as the Red Planet?',timeLimitS:120,payload:{options:[{key:'a',text:'Mars'},{key:'b',text:'Venus'},{key:'c',text:'Saturn'},{key:'d',text:'Jupiter'}],correct:'a'}}})
  16  |   expect(added.ok()).toBe(true)
  17  |   const {question}=await added.json()
  18  |   for(const key of ['b','c','d'])expect((await page.request.put(`/api/v1/activities/questions/${question.id}/reasons`,{headers,data:{elementKey:key,reason:'A different planet.'}})).ok()).toBe(true)
  19  |   return {activity,question,headers}
  20  | }
  21  | async function capture(page:Page,name:string) {
  22  |   await page.evaluate(()=>document.fonts.ready)
  23  |   await page.locator('[data-activity-theme] picture img').evaluateAll(async imgs=>{await Promise.all(imgs.map(img=>(img as HTMLImageElement).decode().catch(()=>{})))})
  24  |   // Live worlds use a fixed viewport backdrop; a full-page stitch adds an artificial flat strip below it.
  25  |   if(process.env.PW_CAPTURE_THEMES==='1')await page.screenshot({path:`${ROOT}/${name}.png`,fullPage:!await page.locator('[data-variant=live]').count(),animations:'disabled'})
  26  | }
  27  | 
  28  | test('all 12 HD worlds are real generated assets with mobile derivatives and provenance', async({request})=>{
  29  |   const manifest=JSON.parse(readFileSync('src/assets/images/activity-themes/prompts.json','utf8'))
  30  |   expect(manifest.images).toHaveLength(12)
  31  |   for(const id of worlds){
  32  |     const entry=manifest.images.find((item:{id:string})=>item.id===id)
  33  |     expect(entry.nativeWidth).toBeGreaterThanOrEqual(1280);expect(entry.nativeHeight).toBeGreaterThanOrEqual(720)
  34  |     expect(entry.prompt).toContain('Asasera');expect(entry.outputs).toHaveLength(3)
  35  |     for(const output of entry.outputs){const response=await request.get(`/src/assets/images/activity-themes/${output.path.split('/').at(-1)}`);expect(response.ok()).toBe(true);expect(response.headers()['content-type']).toContain('image/webp');expect((await response.body()).length).toBeGreaterThan(8000)}
  36  |   }
  37  | })
  38  | 
  39  | test('teacher previews every world, cancels, retries failed saves and preserves edits across reload',async({page})=>{
  40  |   const {activity,headers}=await setup(page)
  41  |   await page.setViewportSize({width:1440,height:1000});await page.goto(`/teacher/activities/${activity.id}`)
  42  |   await page.getByRole('textbox',{name:'Question text',exact:true}).fill('A saved question before choosing a world')
> 43  |   const open=page.getByRole('button',{name:'Themes',exact:true});await open.click()
      |                                                                             ^ Error: locator.click: Test timeout of 30000ms exceeded.
  44  |   const dialog=page.getByRole('dialog',{name:'Choose your activity world'});await expect(dialog).toBeVisible()
  45  |   await expect(dialog.getByRole('radio')).toHaveCount(13)
  46  |   for(const id of worlds){await dialog.locator(`input[value="${id}"]`).check();await expect(dialog.locator('[data-variant=preview]')).toHaveAttribute('data-activity-theme',id);await expect.poll(()=>dialog.locator('picture img').evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0)).toBe(true)}
  47  |   await dialog.locator('input[value="jungle"]').check();await capture(page,'picker-desktop-jungle')
  48  |   await page.setViewportSize({width:768,height:1024});await capture(page,'picker-tablet')
  49  |   await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>document.documentElement.classList.add('dark'));await capture(page,'picker-desktop-dark');await page.evaluate(()=>document.documentElement.classList.remove('dark'))
  50  |   await dialog.getByRole('button',{name:'Lobby',exact:true}).click();await expect(dialog).toContainText('Example PIN');await capture(page,'picker-desktop-lobby')
  51  |   await dialog.getByRole('button',{name:'Podium',exact:true}).click();await expect(dialog).toContainText('Every answer');await capture(page,'picker-desktop-podium')
  52  |   await dialog.getByRole('button',{name:'Cancel',exact:true}).click();await expect(open).toBeFocused()
  53  |   expect((await(await page.request.get(`/api/v1/activities/${activity.id}`,{headers})).json()).activity.theme).toBe('classic')
  54  |   await open.click();await dialog.locator('input[value="island"]').check()
  55  |   let fails=true
  56  |   await page.route(`**/api/v1/activities/${activity.id}`,async route=>{if(route.request().method()==='PATCH'&&fails){fails=false;await route.fulfill({status:503,json:{error:{code:'unavailable',message:'Theme save temporarily unavailable'}}})}else await route.continue()})
  57  |   await dialog.getByRole('button',{name:'Use this theme',exact:true}).click();await expect(dialog.getByRole('alert')).toBeVisible();await expect(dialog.locator('input[value="island"]')).toBeChecked()
  58  |   await page.evaluate(()=>document.documentElement.classList.add('dark'))
  59  |   await dialog.locator('input[value="island"]').focus();await page.keyboard.press('Tab');await page.keyboard.press('Tab')
  60  |   const retry=dialog.getByRole('button',{name:'Use this theme',exact:true});await expect(retry).toBeFocused()
  61  |   expect(await retry.evaluate(el=>getComputedStyle(el).outlineColor)).toBe('rgb(255, 255, 255)')
  62  |   expect(await dialog.getByRole('alert').evaluate(el=>getComputedStyle(el).color)).toBe('rgb(255, 139, 157)')
  63  |   await capture(page,'picker-desktop-dark');await page.evaluate(()=>document.documentElement.classList.remove('dark'))
  64  |   await dialog.getByRole('button',{name:'Use this theme',exact:true}).click();await expect(dialog).toBeHidden()
  65  |   await page.reload();await expect(page.locator('main[data-activity-theme]')).toHaveAttribute('data-activity-theme','island')
  66  |   await expect(page.getByRole('textbox',{name:'Question text',exact:true})).toHaveText('A saved question before choosing a world')
  67  |   await capture(page,'editor-island')
  68  | })
  69  | 
  70  | test('a saved theme survives publishing and real host, projector and player play through results',async({page,browser})=>{
  71  |   test.setTimeout(90000)
  72  |   const {activity,headers}=await setup(page,'jungle')
  73  |   expect((await page.request.post(`/api/v1/activities/${activity.id}/publish`,{headers})).ok()).toBe(true)
  74  |   await page.setViewportSize({width:1440,height:1000});await page.goto(`/teacher/live/new?activityId=${activity.id}&request=${crypto.randomUUID()}`)
  75  |   await expect(page.getByRole('button',{name:'Start class',exact:true})).toBeVisible()
  76  |   await expect(page.locator('[data-variant=live]')).toHaveAttribute('data-activity-theme','jungle')
  77  |   /* The host screen now shows the PIN twice: large in the lobby, and again in the
  78  |      toolbar's join affordance. Read the lobby one and hold the toolbar to it, so the
  79  |      second rendering is checked rather than merely tolerated. */
  80  |   const pin=await page.locator('main strong[dir=ltr]').innerText()
  81  |   expect(pin).toMatch(/^[0-9]{6}$/)
  82  |   await expect(page.getByRole('link',{name:`Join with PIN ${pin}`})).toBeVisible()
  83  |   const playerContext=await browser.newContext({baseURL:process.env.PW_BASE_URL??'http://localhost:5173',viewport:{width:390,height:844}})
  84  |   await playerContext.addInitScript(()=>{localStorage.setItem('asasera.language','en');localStorage.setItem('i18nextLng','en')})
  85  |   try{
  86  |     const player=await playerContext.newPage();await player.goto(`/join?pin=${pin}`);await player.getByLabel('Display name',{exact:true}).fill('Theme explorer');await player.getByRole('button',{name:'Join class',exact:true}).click();await expect(player.locator('[data-variant=live]')).toHaveAttribute('data-activity-theme','jungle')
  87  |     /* Everything but the run actions now sits behind the toolbar's Session options menu. */
  88  |     const options=page.locator('summary[aria-label="Session options"]')
  89  |     await options.click()
  90  |     const popup=page.waitForEvent('popup');await page.getByRole('button',{name:'Open projector',exact:true}).click();const projector=await popup;await projector.setViewportSize({width:1440,height:1000});await expect(projector.locator('[data-variant=live]')).toHaveAttribute('data-activity-theme','jungle')
  91  |     await capture(projector,'projector-jungle-lobby');await capture(page,'host-jungle-lobby');await capture(player,'player-jungle-lobby')
  92  |     await options.click()
  93  |     await page.getByRole('button',{name:'Pause motion',exact:true}).click();await expect(page.locator('[data-variant=live]')).toHaveAttribute('data-motion','off');await page.getByRole('button',{name:'Resume motion',exact:true}).click()
  94  |     await page.keyboard.press('Escape')
  95  |     /* The question stage leads with the prompt itself, and the acknowledgement names
  96  |        whether the answer was saved or merely received — see LiveQuestionStage. */
  97  |     await page.getByRole('button',{name:'Start class',exact:true}).click();await expect(player.getByRole('heading',{name:'Which planet is known as the Red Planet?',exact:true})).toBeVisible()
  98  |     await capture(projector,'projector-jungle-question');await capture(player,'player-jungle-question')
  99  |     await player.locator('button[class*=answer]').first().click();await expect(player.getByRole('heading',{name:/You’re in! Answer (saved|received)/})).toBeVisible()
  100 |     await page.getByRole('button',{name:'Reveal answer',exact:true}).click();await page.getByRole('button',{name:'Show podium',exact:true}).click();await expect(projector.getByRole('heading',{name:'Well played, everyone',exact:true})).toBeVisible();await capture(projector,'projector-jungle-podium')
  101 |     await page.getByRole('button',{name:'Finish class',exact:true}).click();await expect(page.getByRole('heading',{name:'Class finished',exact:true})).toBeVisible();await projector.close()
  102 |   }finally{await playerContext.close()}
  103 | })
  104 | 
  105 | test('homework uses the published world and keeps answers, language, reduced motion and resume working',async({page,browser})=>{
  106 |   const {activity,headers}=await setup(page,'sky')
  107 |   expect((await page.request.post(`/api/v1/activities/${activity.id}/publish`,{headers})).ok()).toBe(true)
  108 |   const made=await page.request.post('/api/v1/delivery/assignments',{headers,data:{activityId:activity.id,mode:'study',feedback:'immediate',deadline:new Date(Date.now()+86400000).toISOString(),requestId:crypto.randomUUID()}})
  109 |   expect(made.ok()).toBe(true);const assignment=await made.json()
  110 |   const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'})
  111 |   await context.addInitScript(()=>{localStorage.setItem('asasera.language','en');localStorage.setItem('i18nextLng','en')})
  112 |   try{
  113 |     const student=await context.newPage();await student.goto(`${process.env.PW_BASE_URL??'http://localhost:5173'}/learn/${assignment.id}#${assignment.accessToken}`)
  114 |     await expect(student.locator('main[data-activity-theme]')).toHaveAttribute('data-activity-theme','sky');await expect(student.getByRole('button',{name:'Reduced motion'})).toBeDisabled()
  115 |     await student.getByLabel('Your name',{exact:true}).fill('Sky explorer');await student.getByRole('button',{name:'Start',exact:true}).click();await expect(student.getByRole('heading',{name:'Which planet is known as the Red Planet?'})).toBeVisible()
  116 |     await student.getByRole('button',{name:'Mars',exact:true}).click();await expect(student.getByText('Correct!',{exact:true})).toBeVisible();await student.reload();await expect(student.getByRole('button',{name:'Submit activity',exact:true})).toBeVisible()
  117 |     await student.getByRole('button',{name:'العربية',exact:true}).click();await expect(student.locator('main[data-activity-theme]')).toHaveAttribute('dir','rtl');await capture(student,'homework-sky-mobile-ar')
  118 |     expect(await student.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
  119 |     expect(await student.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length)).toBe(0)
  120 |     await student.getByRole('button',{name:'سلّم النشاط',exact:true}).click();await expect(student.getByRole('heading',{name:'تم تسليم نشاطك!',exact:true})).toBeVisible()
  121 |   }finally{await context.close()}
  122 | })
  123 | 
  124 | test('Arabic mobile gallery handles keyboard, denied preference storage and failed art',async({page})=>{
  125 |   const {activity}=await setup(page,'forest','ar');await page.setViewportSize({width:390,height:844})
  126 |   await page.addInitScript(()=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key==='asasera.activity.motion')throw new Error('Storage unavailable');return original.call(this,key,value)}})
  127 |   await page.goto(`/teacher/activities/${activity.id}`);await expect(page.locator('main[data-activity-theme]')).toHaveAttribute('data-activity-theme','jungle')
  128 |   await page.getByRole('button',{name:'المظاهر',exact:true}).click();const dialog=page.getByRole('dialog',{name:'اختر عالم نشاطك'})
  129 |   await dialog.locator('input[value="jungle"]').focus();await page.keyboard.press('ArrowLeft');await expect(dialog.locator('input[value="sky"]')).toBeChecked()
  130 |   await dialog.getByRole('button',{name:'إيقاف الحركة',exact:true}).click();await expect(dialog.locator('[data-variant=preview]')).toHaveAttribute('data-motion','off')
  131 |   await capture(page,'picker-mobile-ar');expect(await dialog.evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true)
  132 |   await page.route('**/activity-themes/ocean-*.webp',route=>route.abort());await dialog.locator('input[value="ocean"]').check();await expect(dialog.locator('picture')).toHaveCount(0);await expect(dialog.getByRole('heading',{name:'أي كوكب يُعرف بالكوكب الأحمر؟'})).toBeVisible()
  133 |   await page.keyboard.press('Escape');await expect(dialog).toBeHidden();await expect(page.getByRole('button',{name:'المظاهر',exact:true})).toBeFocused()
  134 | })
  135 | 
```