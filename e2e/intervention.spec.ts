import {selectOption} from './select-option'
import {localTeacher} from './local-fixture'
import {test,expect} from '@playwright/test'
test('a private teacher decision inserts an approved verification question and records provenance',async({browser,page})=>{
  test.setTimeout(90_000)
  const {email,password}=localTeacher()
  const {accessToken}=await(await page.request.post('/api/v1/auth/login',{data:{email,password}})).json(),headers={authorization:`Bearer ${accessToken}`}
  const make=async(title:string,kind:'mcq'|'tf')=>{
    const {activity}=await(await page.request.post('/api/v1/activities',{headers,data:{title,subjectId:1,levelId:8,purposeId:2}})).json()
    const payload=kind==='mcq'?{options:['أ','ب','ج','د'].map((text,i)=>({key:['a','b','c','d'][i],text})),correct:'a'}:{correct:true}
    const {question}=await(await page.request.post(`/api/v1/activities/${activity.id}/questions`,{headers,data:{kind,prompt:title,payload}})).json()
    for(const elementKey of kind==='mcq'?['b','c','d']:['false'])await page.request.put(`/api/v1/activities/questions/${question.id}/reasons`,{headers,data:{elementKey,reason:'PRIVATE_HYPOTHESIS'}})
    const result=await(await page.request.post(`/api/v1/activities/${activity.id}/publish`,{headers})).json()
    return {activity,question,versionId:result.versionId}
  }
  const source=await make('سؤال الحصة التجريبي','mcq'),target=await make('سؤال التحقق المعتمد','tf')
  expect((await page.request.post('/api/v1/discovery/verification/links',{headers,data:{sourceQuestionId:source.question.id,elementKey:'b',wrongTargetKey:null,versionId:target.versionId,questionId:target.question.id}})).ok()).toBe(true)
  const group=await(await page.request.post('/api/v1/discovery/classes',{headers,data:{name:'الصف التجريبي الثابت'}})).json()
  await page.goto(`/teacher/live/new?activityId=${source.activity.id}&request=${crypto.randomUUID()}`)
  await expect(page.getByRole('button',{name:'ابدأ الحصة',exact:true})).toBeVisible()
  await selectOption(page.getByLabel('الصف',{exact:true}),String(group.class.id))
  const pin=await page.locator('strong[dir=ltr]').first().innerText()
  const contexts=await Promise.all(Array.from({length:3},()=>browser.newContext({baseURL:new URL(page.url()).origin,viewport:{width:390,height:844}})))
  try{
    let leaked=false
    const players=await Promise.all(contexts.map(c=>c.newPage()))
    for(const [index,p]of players.entries()){
      p.on('websocket',ws=>ws.on('framereceived',f=>{if(String(f.payload).includes('PRIVATE_HYPOTHESIS'))leaked=true}))
      await p.goto(`/join?pin=${pin}`);await p.getByLabel('اسمك في الحصة').fill(`مشارك ${index+1}`);await p.getByRole('button',{name:'انضم',exact:true}).click();await expect(p.getByText('أنت في الحصة. انتظر إشارة المعلّم.')).toBeVisible()
    }
    await page.getByRole('button',{name:'ابدأ الحصة',exact:true}).click()
    for(const p of players){await p.getByRole('button',{name:'ب',exact:true}).click();await expect(p.getByRole('heading',{name:/تم (حفظ|تسجيل) إجابتك/})).toBeVisible()}
    await page.getByRole('button',{name:'اكشف الإجابة',exact:true}).click()
    const card=page.locator('section[class*=intervention]');await expect(card).toContainText('PRIVATE_HYPOTHESIS');await expect(card.getByRole('button')).toHaveCount(2)
    const answerLayout=await page.locator('[class*="answers"] > button').evaluateAll(tiles=>tiles.map(tile=>{
      const label=tile.querySelector('span[class*="label"]')!,glyph=tile.querySelector(':scope > svg')!,mark=tile.querySelector('span[class*="mark"]')!
      const labelBox=label.getBoundingClientRect(),glyphBox=glyph.getBoundingClientRect()
      return {fontSize:parseFloat(getComputedStyle(label).fontSize),centerDifference:Math.abs(labelBox.top+labelBox.height/2-glyphBox.top-glyphBox.height/2),feedbackBelow:mark.getBoundingClientRect().top>=labelBox.bottom}
    }))
    expect(answerLayout).toHaveLength(4)
    expect(new Set(answerLayout.map(answer=>answer.fontSize)).size).toBe(1)
    for(const answer of answerLayout){expect(answer.fontSize).toBeGreaterThan(30);expect(answer.centerDifference).toBeLessThan(1);expect(answer.feedbackBelow).toBe(true)}
    await page.screenshot({path:'../screenshots/v4/teacher-intervention.png',fullPage:true})
    await card.getByRole('button',{name:'عالج الآن',exact:true}).click()
    await expect(page.getByRole('heading',{name:'سؤال التحقق المعتمد',exact:true})).toBeVisible()
    for(const p of players)await p.getByRole('button',{name:'صح',exact:true}).click()
    await page.getByRole('button',{name:'اكشف الإجابة',exact:true}).click();await page.getByRole('button',{name:'اعرض المنصة',exact:true}).click();await page.getByRole('button',{name:'أكمل الحصة',exact:true}).click()
    await expect(page.getByRole('heading',{name:'انتهت الحصة',exact:true})).toBeVisible()
    const runId=Number(new URL(page.url()).pathname.split('/').at(-1))
    const response=await page.request.get(`/api/v1/reports/runs/${runId}`,{headers});expect(response.ok(),await response.text()).toBe(true)
    const report=await response.json()
    expect(report.questions).toHaveLength(2);expect(report.questions[1].remedial).toBe(true);expect(report.questions[1].prompt).toBe(target.question.prompt)
    expect(report.participants.every((p:{originalCorrect:number;remedialCorrect:number})=>p.originalCorrect===0&&p.remedialCorrect===1)).toBe(true)
    expect(leaked).toBe(false)
  }finally{await Promise.all(contexts.map(c=>c.close()))}
})
