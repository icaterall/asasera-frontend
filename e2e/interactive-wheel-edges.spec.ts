import {test,expect} from '@playwright/test'
test.use({video:'on'})

for(const language of ['ar','en'] as const)test(`empty, singleton, duplicate and large saved roster ${language}`,async({page,request})=>{
 test.setTimeout(60000)
 expect(new URL(process.env.PW_BASE_URL??'http://127.0.0.1:5411').hostname).toMatch(/^(localhost|127\.0\.0\.1)$/)
 const ar=language==='ar',email=`wheel-edges-${crypto.randomUUID()}@example.com`,password='Synthetic wheel edges2026!'
 expect((await request.post('/api/v1/auth/register/teacher',{data:{name:'Wheel edges',email,password}})).ok()).toBe(true)
 expect((await request.post('/api/v1/auth/login',{data:{email,password}})).ok()).toBe(true)
 await page.context().addCookies((await request.storageState()).cookies)
 await page.addInitScript(lang=>localStorage.setItem('asasera.language',lang),language)
 await page.setViewportSize({width:ar?390:1440,height:ar?844:900});await page.goto('/teacher/wheel')
 const spin=()=>page.getByRole('button',{name:ar?'أدر العجلة':'Spin the wheel',exact:true}),wheel=page.locator('[data-random-wheel]')
 async function capture(state:string){
  // Reset real scroll position before a full-page stitch so sticky app chrome
  // is not composited over the middle of the wheel/result.
  await page.evaluate(()=>{
   if(document.activeElement instanceof HTMLElement)document.activeElement.blur()
   document.querySelectorAll('*').forEach(el=>{if(el.scrollTop)el.scrollTo({top:0,behavior:'instant'})})
   window.scrollTo({top:0,behavior:'instant'})
  })
  await expect.poll(()=>page.evaluate(()=>window.scrollY)).toBe(0)
  await page.screenshot({path:`../docs/evidence/interactive/wheel-edges-${language}-${state}.png`,fullPage:true})
 }
 await expect(spin()).toBeDisabled()
 await expect(page.getByText(ar?'أضف أسماء أو خيارات للبدء':'Add names or items to begin',{exact:true})).toBeVisible()
 await capture('empty')
 async function configure(names:string[]){
  const field=page.getByRole('textbox',{name:ar?'أسماء أو موضوعات أو أسئلة':'Names, topics or questions'})
  if(!await field.isVisible())await page.getByText(ar?'خيارات العجلة':'Wheel options',{exact:true}).click()
  await field.fill(names.join('\n'))
  const response=page.waitForResponse(r=>r.url().endsWith('/wheel/commands')&&r.request().method()==='POST')
  await page.getByRole('button',{name:ar?'استخدم هذه القائمة':'Use this list'}).click()
  const saved=await response;expect(saved.ok(),await saved.text()).toBe(true)
  return saved.json()
 }
 const name=ar?'سارة':'Sara'
 await configure([name])
 const singleton=page.waitForResponse(r=>r.url().endsWith('/wheel/commands')&&r.request().postDataJSON()?.action==='spin')
 await spin().click();const one=await (await singleton).json()
 expect(one.wheel.spin.durationMs).toBe(0)
 await expect(wheel).toHaveAttribute('data-wheel-state','selected')
 await expect(page.locator('[role=status] strong')).toHaveText(name)
 await expect(spin()).toBeDisabled()
 await capture('singleton')
 await page.getByRole('button',{name:ar?'إعادة جميع الأسماء':'Reset picks'}).click()
 await configure([name,name])
 const picked=new Set<string>()
 for(let turn=0;turn<2;turn++){
  const response=page.waitForResponse(r=>r.url().endsWith('/wheel/commands')&&r.request().postDataJSON()?.action==='spin')
  await spin().click();const view=await (await response).json(),winner=view.wheel.spin.entries[view.wheel.spin.winnerIndex]
  picked.add(winner.id)
  if(await page.getByRole('button',{name:ar?'تخطي الحركة':'Skip animation'}).isVisible())await page.getByRole('button',{name:ar?'تخطي الحركة':'Skip animation'}).click()
  const position=view.wheel.entries.findIndex((entry:{id:string})=>entry.id===winner.id)+1
  await expect(page.locator('[role=status] strong')).toHaveText(`${name} (${ar?'الخيار':'Entry'} ${position})`)
  await expect(wheel).toHaveAttribute('data-wheel-state','selected')
  const read=page.waitForResponse(r=>r.url().endsWith('/presentations/wheel')&&r.request().method()==='GET')
  await page.reload();const restored=await (await read).json()
  expect(restored.roundId).toBe(view.roundId);expect(restored.wheel.pickedIds).toEqual(view.wheel.pickedIds)
  expect(restored.wheel.entries).toEqual(view.wheel.entries)
 }
 expect(picked.size).toBe(2)
 await page.getByText(new RegExp(ar?'سجل السحب':'Draw history')).click()
  await expect(page.locator('bdi').filter({hasText:`${name} (${ar?'الخيار':'Entry'} 1)`}).first()).toBeVisible()
 await expect(page.locator('bdi').filter({hasText:`${name} (${ar?'الخيار':'Entry'} 2)`})).toBeVisible()
 await capture('duplicates')
 await page.getByRole('button',{name:ar?'إعادة جميع الأسماء':'Reset picks'}).click()
 const duplicateLabels=[`${name} (${ar?'الخيار':'Entry'} 1)`,`${name} (${ar?'الخيار':'Entry'} 2)`]
 for(const size of [7,16,100]){
 await configure(Array.from({length:size},(_,i)=>ar?`الاسم ${i+1} طالب من المجموعة الدراسية`:`Entry ${i+1} from the classroom group`))
 for(const original of duplicateLabels)await expect(page.locator('bdi').filter({hasText:original}).first()).toBeVisible()
 const response=page.waitForResponse(r=>r.url().endsWith('/wheel/commands')&&r.request().postDataJSON()?.action==='spin')
 await spin().click();const selected=await (await response).json()
 await expect(wheel).toHaveAttribute('data-wheel-state','selected')
 const winner=selected.wheel.spin.entries[selected.wheel.spin.winnerIndex]
 await expect(page.locator('[role=status] strong')).toHaveText(winner.label)
 // Read the final rendered rotor, not a restatement of the server angle.
 const rotation=await wheel.locator('svg[viewBox="0 0 400 400"] > g').evaluate(el=>{
  const matrix=new DOMMatrix(getComputedStyle(el).transform)
  return Math.atan2(matrix.b,matrix.a)*180/Math.PI
 })
 const pointerSector=Math.floor((((-rotation)%360)+360)%360/(360/size))
 expect(pointerSector).toBe(selected.wheel.spin.winnerIndex)
 const labelRadii=await wheel.locator('svg text').evaluateAll(nodes=>nodes.flatMap(node=>{
  const box=(node as SVGGraphicsElement).getBBox()
  return [box.x,box.x+box.width].flatMap(x=>[box.y,box.y+box.height].map(y=>Math.hypot(x-200,y-200)))
 }))
 expect(labelRadii.every(radius=>radius<178),`All sector labels stay inside the 178px rim: ${labelRadii.join(',')}`).toBe(true)
 await capture(`pointer-${size}`)
 await page.getByRole('button',{name:ar?'إعادة جميع الأسماء':'Reset picks'}).click()
 }
 await expect(page.getByText(ar?/العجلة للزينة/:/wheel is decorative/)).toBeVisible()
 expect(await wheel.locator('aside ol li').count()).toBe(100)
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
 await capture('large')
})
