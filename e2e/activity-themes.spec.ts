import { test, expect, type Page } from '@playwright/test'
import { localTeacher } from './local-fixture'
import { readFileSync } from 'node:fs'
const ROOT = '.impeccable/review/activity-themes'
const worlds=['jungle','sky','island','ocean','desert','space','aurora','volcano','candy','arctic','castle','garden']
async function setup(page:Page, theme='classic', lang='en') {
  const account=localTeacher()
  await page.addInitScript(lang=>{localStorage.setItem('asasera.language',lang);localStorage.setItem('i18nextLng',lang);localStorage.setItem('asasera.theme','light')},lang)
  const login=await page.request.post('/api/v1/auth/login',{data:{email:account.email,password:account.password}})
  expect(login.ok()).toBe(true)
  const {accessToken}=await login.json(), headers={authorization:`Bearer ${accessToken}`}
  const created=await page.request.post('/api/v1/activities',{headers,data:{title:'Activity worlds · test',subjectId:1,levelId:8,purposeId:2,theme}})
  expect(created.ok()).toBe(true)
  const {activity}=await created.json()
  const added=await page.request.post(`/api/v1/activities/${activity.id}/questions`,{headers,data:{kind:'mcq',prompt:lang==='ar'?'أي كوكب يُعرف بالكوكب الأحمر؟':'Which planet is known as the Red Planet?',timeLimitS:120,payload:{options:[{key:'a',text:'Mars'},{key:'b',text:'Venus'},{key:'c',text:'Saturn'},{key:'d',text:'Jupiter'}],correct:'a'}}})
  expect(added.ok()).toBe(true)
  const {question}=await added.json()
  for(const key of ['b','c','d'])expect((await page.request.put(`/api/v1/activities/questions/${question.id}/reasons`,{headers,data:{elementKey:key,reason:'A different planet.'}})).ok()).toBe(true)
  return {activity,question,headers}
}
async function capture(page:Page,name:string) {
  await page.evaluate(()=>document.fonts.ready)
  await page.locator('[data-activity-theme] picture img').evaluateAll(async imgs=>{await Promise.all(imgs.map(img=>(img as HTMLImageElement).decode().catch(()=>{})))})
  // Live worlds use a fixed viewport backdrop; a full-page stitch adds an artificial flat strip below it.
  if(process.env.PW_CAPTURE_THEMES==='1')await page.screenshot({path:`${ROOT}/${name}.png`,fullPage:!await page.locator('[data-variant=live]').count(),animations:'disabled'})
}

test('all 12 HD worlds are real generated assets with mobile derivatives and provenance', async({request})=>{
  const manifest=JSON.parse(readFileSync('src/assets/images/activity-themes/prompts.json','utf8'))
  expect(manifest.images).toHaveLength(12)
  for(const id of worlds){
    const entry=manifest.images.find((item:{id:string})=>item.id===id)
    expect(entry.nativeWidth).toBeGreaterThanOrEqual(1280);expect(entry.nativeHeight).toBeGreaterThanOrEqual(720)
    expect(entry.prompt).toContain('Asasera');expect(entry.outputs).toHaveLength(3)
    for(const output of entry.outputs){const response=await request.get(`/src/assets/images/activity-themes/${output.path.split('/').at(-1)}`);expect(response.ok()).toBe(true);expect(response.headers()['content-type']).toContain('image/webp');expect((await response.body()).length).toBeGreaterThan(8000)}
  }
})

test('teacher previews every world, cancels, retries failed saves and preserves edits across reload',async({page})=>{
  const {activity,headers}=await setup(page)
  await page.setViewportSize({width:1440,height:1000});await page.goto(`/teacher/activities/${activity.id}`)
  await page.getByRole('textbox',{name:'Question text',exact:true}).fill('A saved question before choosing a world')
  const open=page.getByRole('button',{name:'Themes',exact:true});await open.click()
  const dialog=page.getByRole('dialog',{name:'Choose your activity world'});await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('radio')).toHaveCount(13)
  for(const id of worlds){await dialog.locator(`input[value="${id}"]`).check();await expect(dialog.locator('[data-variant=preview]')).toHaveAttribute('data-activity-theme',id);await expect.poll(()=>dialog.locator('picture img').evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0)).toBe(true)}
  await dialog.locator('input[value="jungle"]').check();await capture(page,'picker-desktop-jungle')
  await page.setViewportSize({width:768,height:1024});await capture(page,'picker-tablet')
  await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>document.documentElement.classList.add('dark'));await capture(page,'picker-desktop-dark');await page.evaluate(()=>document.documentElement.classList.remove('dark'))
  await dialog.getByRole('button',{name:'Lobby',exact:true}).click();await expect(dialog).toContainText('Example PIN');await capture(page,'picker-desktop-lobby')
  await dialog.getByRole('button',{name:'Podium',exact:true}).click();await expect(dialog).toContainText('Every answer');await capture(page,'picker-desktop-podium')
  await dialog.getByRole('button',{name:'Cancel',exact:true}).click();await expect(open).toBeFocused()
  expect((await(await page.request.get(`/api/v1/activities/${activity.id}`,{headers})).json()).activity.theme).toBe('classic')
  await open.click();await dialog.locator('input[value="island"]').check()
  let fails=true
  await page.route(`**/api/v1/activities/${activity.id}`,async route=>{if(route.request().method()==='PATCH'&&fails){fails=false;await route.fulfill({status:503,json:{error:{code:'unavailable',message:'Theme save temporarily unavailable'}}})}else await route.continue()})
  await dialog.getByRole('button',{name:'Use this theme',exact:true}).click();await expect(dialog.getByRole('alert')).toBeVisible();await expect(dialog.locator('input[value="island"]')).toBeChecked()
  await page.evaluate(()=>document.documentElement.classList.add('dark'))
  await dialog.locator('input[value="island"]').focus();await page.keyboard.press('Tab');await page.keyboard.press('Tab')
  const retry=dialog.getByRole('button',{name:'Use this theme',exact:true});await expect(retry).toBeFocused()
  expect(await retry.evaluate(el=>getComputedStyle(el).outlineColor)).toBe('rgb(255, 255, 255)')
  expect(await dialog.getByRole('alert').evaluate(el=>getComputedStyle(el).color)).toBe('rgb(255, 139, 157)')
  await capture(page,'picker-desktop-dark');await page.evaluate(()=>document.documentElement.classList.remove('dark'))
  await dialog.getByRole('button',{name:'Use this theme',exact:true}).click();await expect(dialog).toBeHidden()
  await page.reload();await expect(page.locator('main[data-activity-theme]')).toHaveAttribute('data-activity-theme','island')
  await expect(page.getByRole('textbox',{name:'Question text',exact:true})).toHaveValue('A saved question before choosing a world')
  await capture(page,'editor-island')
})

test('a saved theme survives publishing and real host, projector and player play through results',async({page,browser})=>{
  test.setTimeout(90000)
  const {activity,headers}=await setup(page,'jungle')
  expect((await page.request.post(`/api/v1/activities/${activity.id}/publish`,{headers})).ok()).toBe(true)
  await page.setViewportSize({width:1440,height:1000});await page.goto(`/teacher/live/new?activityId=${activity.id}&request=${crypto.randomUUID()}`)
  await expect(page.getByRole('button',{name:'Start class',exact:true})).toBeVisible()
  await expect(page.locator('[data-variant=live]')).toHaveAttribute('data-activity-theme','jungle')
  const pin=await page.locator('strong[dir=ltr]').innerText()
  const playerContext=await browser.newContext({baseURL:process.env.PW_BASE_URL??'http://localhost:5173',viewport:{width:390,height:844}})
  await playerContext.addInitScript(()=>{localStorage.setItem('asasera.language','en');localStorage.setItem('i18nextLng','en')})
  try{
    const player=await playerContext.newPage();await player.goto(`/join?pin=${pin}`);await player.getByLabel('Display name',{exact:true}).fill('Theme explorer');await player.getByRole('button',{name:'Join class',exact:true}).click();await expect(player.locator('[data-variant=live]')).toHaveAttribute('data-activity-theme','jungle')
    const popup=page.waitForEvent('popup');await page.getByRole('button',{name:'Open projector · share that tab',exact:true}).click();const projector=await popup;await projector.setViewportSize({width:1440,height:1000});await expect(projector.locator('[data-variant=live]')).toHaveAttribute('data-activity-theme','jungle')
    await capture(projector,'projector-jungle-lobby');await capture(page,'host-jungle-lobby');await capture(player,'player-jungle-lobby')
    await page.getByRole('button',{name:'Pause motion',exact:true}).click();await expect(page.locator('[data-variant=live]')).toHaveAttribute('data-motion','off');await page.getByRole('button',{name:'Resume motion',exact:true}).click()
    await page.getByRole('button',{name:'Start class',exact:true}).click();await expect(player.getByRole('heading',{name:'Choose your answer',exact:true})).toBeVisible()
    await capture(projector,'projector-jungle-question');await capture(player,'player-jungle-question')
    await player.locator('button[class*=answer]').first().click();await expect(player.getByRole('heading',{name:'Answer accepted',exact:true})).toBeVisible()
    await page.getByRole('button',{name:'Lock and reveal',exact:true}).click();await page.getByRole('button',{name:'Show podium',exact:true}).click();await expect(projector.getByRole('heading',{name:'Well played, everyone',exact:true})).toBeVisible();await capture(projector,'projector-jungle-podium')
    await page.getByRole('button',{name:'Finish class',exact:true}).click();await expect(page.getByRole('heading',{name:'Class finished',exact:true})).toBeVisible();await projector.close()
  }finally{await playerContext.close()}
})

test('homework uses the published world and keeps answers, language, reduced motion and resume working',async({page,browser})=>{
  const {activity,headers}=await setup(page,'sky')
  expect((await page.request.post(`/api/v1/activities/${activity.id}/publish`,{headers})).ok()).toBe(true)
  const made=await page.request.post('/api/v1/delivery/assignments',{headers,data:{activityId:activity.id,mode:'study',feedback:'immediate',deadline:new Date(Date.now()+86400000).toISOString(),requestId:crypto.randomUUID()}})
  expect(made.ok()).toBe(true);const assignment=await made.json()
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'})
  await context.addInitScript(()=>{localStorage.setItem('asasera.language','en');localStorage.setItem('i18nextLng','en')})
  try{
    const student=await context.newPage();await student.goto(`${process.env.PW_BASE_URL??'http://localhost:5173'}/learn/${assignment.id}#${assignment.accessToken}`)
    await expect(student.locator('main[data-activity-theme]')).toHaveAttribute('data-activity-theme','sky');await expect(student.getByRole('button',{name:'Reduced motion'})).toBeDisabled()
    await student.getByLabel('Your name',{exact:true}).fill('Sky explorer');await student.getByRole('button',{name:'Start',exact:true}).click();await expect(student.getByRole('heading',{name:'Which planet is known as the Red Planet?'})).toBeVisible()
    await student.getByRole('button',{name:'Mars',exact:true}).click();await expect(student.getByText('Correct!',{exact:true})).toBeVisible();await student.reload();await expect(student.getByRole('button',{name:'Submit activity',exact:true})).toBeVisible()
    await student.getByRole('button',{name:'العربية',exact:true}).click();await expect(student.locator('main[data-activity-theme]')).toHaveAttribute('dir','rtl');await capture(student,'homework-sky-mobile-ar')
    expect(await student.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
    expect(await student.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length)).toBe(0)
    await student.getByRole('button',{name:'سلّم النشاط',exact:true}).click();await expect(student.getByRole('heading',{name:'تم تسليم نشاطك!',exact:true})).toBeVisible()
  }finally{await context.close()}
})

test('Arabic mobile gallery handles keyboard, denied preference storage and failed art',async({page})=>{
  const {activity}=await setup(page,'forest','ar');await page.setViewportSize({width:390,height:844})
  await page.addInitScript(()=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key==='asasera.activity.motion')throw new Error('Storage unavailable');return original.call(this,key,value)}})
  await page.goto(`/teacher/activities/${activity.id}`);await expect(page.locator('main[data-activity-theme]')).toHaveAttribute('data-activity-theme','jungle')
  await page.getByRole('button',{name:'المظاهر',exact:true}).click();const dialog=page.getByRole('dialog',{name:'اختر عالم نشاطك'})
  await dialog.locator('input[value="jungle"]').focus();await page.keyboard.press('ArrowLeft');await expect(dialog.locator('input[value="sky"]')).toBeChecked()
  await dialog.getByRole('button',{name:'إيقاف الحركة',exact:true}).click();await expect(dialog.locator('[data-variant=preview]')).toHaveAttribute('data-motion','off')
  await capture(page,'picker-mobile-ar');expect(await dialog.evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true)
  await page.route('**/activity-themes/ocean-*.webp',route=>route.abort());await dialog.locator('input[value="ocean"]').check();await expect(dialog.locator('picture')).toHaveCount(0);await expect(dialog.getByRole('heading',{name:'أي كوكب يُعرف بالكوكب الأحمر؟'})).toBeVisible()
  await page.keyboard.press('Escape');await expect(dialog).toBeHidden();await expect(page.getByRole('button',{name:'المظاهر',exact:true})).toBeFocused()
})
