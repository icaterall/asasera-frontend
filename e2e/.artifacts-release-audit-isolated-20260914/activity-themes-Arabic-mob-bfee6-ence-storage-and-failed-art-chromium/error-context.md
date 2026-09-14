# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: activity-themes.spec.ts >> Arabic mobile gallery handles keyboard, denied preference storage and failed art
- Location: e2e/activity-themes.spec.ts:124:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'المظاهر', exact: true })

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner "شريط المحرر" [ref=e4]:
    - generic [ref=e5]:
      - heading "Activity worlds · test" [level=1] [ref=e6]
      - textbox "عنوان النشاط" [ref=e7]: Activity worlds · test
    - group "أدوات النشاط" [ref=e8]:
      - button "اعتماد النسخة" [ref=e9] [cursor=pointer]
  - main [ref=e10]:
    - generic [ref=e11]:
      - textbox "نص السؤال" [ref=e14]:
        - paragraph [ref=e15]: أي كوكب يُعرف بالكوكب الأحمر؟
      - button "صورة السؤال (اختياري)" [ref=e17] [cursor=pointer]:
        - generic [ref=e21]: ابحث عن وسائط وأدرجها (اختياري)
        - generic [ref=e22]: ارفع ملفًا أو اسحبه إلى هنا
      - generic [ref=e23]:
        - generic [ref=e25]:
          - button "احذف الإجابة 1" [ref=e30] [cursor=pointer]
          - textbox "نص الإجابة 1" [ref=e37]:
            - paragraph [ref=e38]: Mars
          - generic [ref=e39]:
            - generic "الإجابة الصحيحة" [ref=e40] [cursor=pointer]:
              - radio "الإجابة 1 هي الصحيحة" [checked] [ref=e41]
            - button "صورة الإجابة" [ref=e42] [cursor=pointer]
        - generic [ref=e48]:
          - button "احذف الإجابة 2" [ref=e53] [cursor=pointer]
          - textbox "نص الإجابة 2" [ref=e60]:
            - paragraph [ref=e61]: Venus
          - generic [ref=e62]:
            - generic "الإجابة الصحيحة" [ref=e63] [cursor=pointer]:
              - radio "الإجابة 2 هي الصحيحة" [ref=e64]
            - button "صورة الإجابة" [ref=e65] [cursor=pointer]
        - generic [ref=e71]:
          - button "احذف الإجابة 3" [ref=e76] [cursor=pointer]
          - textbox "نص الإجابة 3" [ref=e83]:
            - paragraph [ref=e84]: Saturn
          - generic [ref=e85]:
            - generic "الإجابة الصحيحة" [ref=e86] [cursor=pointer]:
              - radio "الإجابة 3 هي الصحيحة" [ref=e87]
            - button "صورة الإجابة" [ref=e88] [cursor=pointer]
        - generic [ref=e94]:
          - button "احذف الإجابة 4" [ref=e99] [cursor=pointer]
          - textbox "نص الإجابة 4" [ref=e106]:
            - paragraph [ref=e107]: Jupiter
          - generic [ref=e108]:
            - generic "الإجابة الصحيحة" [ref=e109] [cursor=pointer]:
              - radio "الإجابة 4 هي الصحيحة" [ref=e110]
            - button "صورة الإجابة" [ref=e111] [cursor=pointer]
      - button "أضف إجابة أخرى" [ref=e117] [cursor=pointer]
      - generic [ref=e119]:
        - generic [ref=e120]: التفسير (اختياري)
        - textbox "التفسير (اختياري)" [ref=e121]:
          - /placeholder: لماذا هذه الإجابة صحيحة؟ يظهر للطلاب بعد انتهاء وقت الإجابة.
  - navigation "أدوات المحرر" [ref=e122]:
    - button "الأسئلة" [ref=e123] [cursor=pointer]:
      - generic [aria-hidden] [ref=e128]: "1"
    - button "حفظ" [disabled] [ref=e129]
    - button "الخصائص" [ref=e135] [cursor=pointer]
    - button "المزيد" [ref=e138] [cursor=pointer]
```

# Test source

```ts
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
  43  |   const open=page.getByRole('button',{name:'Themes',exact:true});await open.click()
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
> 128 |   await page.getByRole('button',{name:'المظاهر',exact:true}).click();const dialog=page.getByRole('dialog',{name:'اختر عالم نشاطك'})
      |                                                              ^ Error: locator.click: Test timeout of 30000ms exceeded.
  129 |   await dialog.locator('input[value="jungle"]').focus();await page.keyboard.press('ArrowLeft');await expect(dialog.locator('input[value="sky"]')).toBeChecked()
  130 |   await dialog.getByRole('button',{name:'إيقاف الحركة',exact:true}).click();await expect(dialog.locator('[data-variant=preview]')).toHaveAttribute('data-motion','off')
  131 |   await capture(page,'picker-mobile-ar');expect(await dialog.evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true)
  132 |   await page.route('**/activity-themes/ocean-*.webp',route=>route.abort());await dialog.locator('input[value="ocean"]').check();await expect(dialog.locator('picture')).toHaveCount(0);await expect(dialog.getByRole('heading',{name:'أي كوكب يُعرف بالكوكب الأحمر؟'})).toBeVisible()
  133 |   await page.keyboard.press('Escape');await expect(dialog).toBeHidden();await expect(page.getByRole('button',{name:'المظاهر',exact:true})).toBeFocused()
  134 | })
  135 | 
```