import {test,expect,type Locator,type Page} from '@playwright/test'
test.use({trace:'off'})
const touch=process.env.PW_NATIVE_TOUCH==='1',reduced=process.env.PW_REDUCED_MOTION==='1'
const dropAcknowledgement=process.env.PW_DROP_NATIVE_ACK==='1'
declare global{interface Window{placementDurations:number[]}}

type NativeFormat='match-up'|'group-sort'|'sequence'|'sentence-completion'|'word-builder'|'speaking-cards'
const formats:NativeFormat[]=['match-up','group-sort','sequence','sentence-completion','word-builder','speaking-cards']
const names:Record<NativeFormat,[string,string]>={'match-up':['Match up','المطابقة'],'group-sort':['Group sort','تصنيف المجموعات'],sequence:['Sequence','الترتيب'],'sentence-completion':['Complete the sentence','إكمال الجملة'],'word-builder':['Word builder','بناء الكلمات'],'speaking-cards':['Speaking cards','بطاقات التحدث']}
async function activate(locator:Locator){if(touch)await locator.tap();else{await locator.focus();await locator.press('Enter')}}
async function capture(page:Page,path:string){
 await page.evaluate(async()=>{await document.fonts.ready;await Promise.all(document.getAnimations().filter(a=>a.effect?.getTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{})));window.scrollTo({top:0,behavior:'instant'})})
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No document-wide horizontal overflow').toBe(true)
 await page.screenshot({path,fullPage:true})
}
function authored(format:NativeFormat,ar:boolean){
 const policy={version:1,language:ar?'ar':'en',diacritics:'preserve',tatweel:'preserve',case:'preserve',spaces:'preserve'}
 if(format==='match-up'||format==='group-sort'){
  const group=format==='group-sort',cards=ar?(group?['قطة أليفة تعيش مع الأسرة وتحتاج إلى العناية والطعام كل يوم','كلب يساعد الإنسان في الحراسة ويعتني بصغاره بعد ولادتها','عصفور صغير يبني عشه بين أغصان الأشجار ويغطي الريش جسمه']:['قطة','عصفور']):(group?['Cat','Dog','Bird']:['Cat','Bird']),targets=ar?(group?['الثدييات التي تلد صغارها وترضعها وتعتني بها حتى تستطيع الاعتماد على نفسها','الطيور التي يغطي جسمها الريش وتضع البيض وتبني أعشاشًا لحماية صغارها']:['ثدييات','طيور']):['Mammals','Birds']
  return {kind:'match',prompt:ar?(group?'صنّف الحيوانات في مجموعاتها.':'صل كل حيوان بمجموعته.'):(group?'Sort each animal into its group.':'Match each animal to its group.'),payload:{cards:cards.map((text,i)=>({key:`animal${i}`,text})),targets:targets.map((text,i)=>({key:`group${i}`,text})),map:Object.fromEntries(cards.map((_,i)=>[`animal${i}`,`group${i===cards.length-1?1:0}`]))},cards,targets}
 }
 if(format==='sequence')return {kind:'order',prompt:ar?'رتّب مراحل نمو النبتة.':'Put the plant growth stages in order.',payload:{items:(ar?['بذرة','برعم','نبتة']:['Seed','Sprout','Plant']).map((text,i)=>({key:`step${i}`,text})),correct:['step0','step1','step2']},ordered:ar?['بذرة','برعم','نبتة']:['Seed','Sprout','Plant']}
 if(format==='sentence-completion')return {kind:'cloze',prompt:ar?'أكمل الجملة بالكلمة المناسبة.':'Complete the sentence with a suitable word.',payload:{schemaVersion:1,segments:[{kind:'text',text:ar?'نبدأ الدراسة في ':'We begin studying in the '},{kind:'blank',blankId:'time'},{kind:'text',text:'.'}],blanks:[{id:'time',acceptedAnswers:ar?['الصباح','النهار']:['morning','daytime']}],policy,trimBoundaryWhitespace:true},answer:ar?'النهار':'daytime'}
 if(format==='word-builder')return {kind:'vocabulary',prompt:ar?'كوّن الكلمة التي تناسب المعنى.':'Build the word that fits the clue.',payload:{schemaVersion:1,entries:[{id:'reviewed_word',word:ar?'مُعَلِّم':'letter',clue:ar?'الشخص الذي يدرّس':'A written message sent to someone'}],policy},answer:ar?'مُعَلِّم':'letter',clue:ar?'الشخص الذي يدرّس':'A written message sent to someone'}
 return {kind:'discussion',prompt:ar?'كيف تساعد زميلًا جديدًا على الشعور بالترحيب؟':'How would you help a new classmate feel welcome?',payload:{schemaVersion:1,referenceResponse:ar?'أعرّف بنفسي وأدعوه إلى المشاركة في نشاط المجموعة.':'I would introduce myself and invite them to join our group activity.'},reference:ar?'أعرّف بنفسي وأدعوه إلى المشاركة في نشاط المجموعة.':'I would introduce myself and invite them to join our group activity.'}
}

for(const [language,width,height] of [['en',1440,900],['ar',390,844]] as const)for(const format of formats){
 test(`${format}: instructor selection and ${touch?'touch':'keyboard'} learner completion survive reload ${language}`,async({page,request,browser})=>{
  const origin=process.env.PW_BASE_URL??'http://127.0.0.1:5411'
  expect(new URL(origin).hostname).toMatch(/^(127\.0\.0\.1|localhost)$/)
  const ar=language==='ar',fixture=authored(format,ar),email=`native-${crypto.randomUUID()}@example.com`,password=`Synthetic-only-${crypto.randomUUID()}!`
  expect((await request.post('/api/v1/auth/register/teacher',{data:{name:'Native practice instructor',email,password}})).ok()).toBe(true)
  const login=await request.post('/api/v1/auth/login',{data:{email,password}});expect(login.ok()).toBe(true)
  const {accessToken}=await login.json(),headers={Authorization:`Bearer ${accessToken}`}
  const created=await request.post('/api/v1/activities',{headers,data:{title:ar?'تدريب المحتوى الأصلي':'Native content practice',subjectId:1,levelId:8,purposeId:2}})
  expect(created.ok()).toBe(true);const {activity}=await created.json()
  const question=await request.post(`/api/v1/activities/${activity.id}/questions`,{headers,data:{kind:fixture.kind,prompt:fixture.prompt,payload:fixture.payload}})
  expect(question.ok(),await question.text()).toBe(true)
  expect((await request.post(`/api/v1/activities/${activity.id}/publish`,{headers})).ok()).toBe(true)
  await page.context().addCookies((await request.storageState()).cookies)
  await page.addInitScript(lang=>localStorage.setItem('asasera.language',lang),language)
  await page.setViewportSize({width,height});await page.goto(`/teacher/activities/${activity.id}/play?mode=study`)
  await page.getByRole('radio',{name:new RegExp(`^${names[format][ar?1:0]}`)}).check()
  await page.getByRole('button',{name:ar?'أنشئ رابط المشاركة':'Create assignment link'}).click()
  const link=await page.getByRole('textbox',{name:ar?'رابط النشاط':'Assignment link'}).inputValue()
  if(format==='match-up'){
   await page.evaluate(async()=>{await document.fonts.ready;document.querySelectorAll('*').forEach(el=>{if(el.scrollTop)el.scrollTo({top:0,behavior:'instant'})});window.scrollTo({top:0,behavior:'instant'})})
   await page.screenshot({path:`../docs/evidence/interactive/native-practice-${language}-instructor.png`,fullPage:true,mask:[page.getByRole('textbox',{name:ar?'رابط النشاط':'Assignment link'})]})
  }
  const learner=await browser.newContext({viewport:{width,height},hasTouch:touch,reducedMotion:reduced?'reduce':'no-preference',recordVideo:{dir:'../docs/evidence/interactive/recordings',size:{width,height}}});await learner.addInitScript(lang=>localStorage.setItem('asasera.language',lang),language)
  await learner.addInitScript(()=>{
   window.placementDurations=[]
   const original=Element.prototype.animate
   Element.prototype.animate=function(frames,options){
    if(Array.isArray(frames)&&frames.some(frame=>frame.transform==='translateY(4px)'))window.placementDurations.push(Number(typeof options==='number'?options:options?.duration))
    return original.call(this,frames,options)
   }
  })
  const learn=await learner.newPage(),pageErrors:string[]=[];learn.on('pageerror',e=>pageErrors.push(e.message))
  try{
   await learn.goto(link);await learn.getByRole('textbox',{name:ar?'اسمك':'Your name'}).fill(ar?'متعلم تجريبي':'Synthetic learner')
   await activate(learn.getByRole('button',{name:ar?'ابدأ':'Start',exact:true}))
   await activate(learn.getByRole('button',{name:ar?'ابدأ الجولة':'Start round'}))
   await expect(learn.getByRole('heading',{name:fixture.prompt,exact:true})).toBeVisible()
   if(format==='match-up'||format==='group-sort'){
    for(const [i,card] of fixture.cards!.entries()){
     await activate(learn.getByRole('button',{name:card,exact:true}))
     await activate(learn.getByRole('button',{name:fixture.targets![i===fixture.cards!.length-1?1:0]!,exact:true}))
     await learn.waitForTimeout(350)
    }
    expect(await learn.evaluate(()=>window.placementDurations)).toEqual(reduced?[]:fixture.cards!.map(()=>180))
   }else if(format==='sequence'){
    const first=fixture.ordered![0]!,up=learn.getByRole('button',{name:`Move up / للأعلى ${first}`,exact:true}),down=learn.getByRole('button',{name:`Move down / للأسفل ${first}`,exact:true})
    // Exercise the non-drag controls even when the random initial order is correct.
    if(await down.isEnabled())await activate(down);else await activate(up)
    for(const [index,word] of fixture.ordered!.entries()){
     let position=(await learn.locator('[data-order-item] > span[dir="auto"]').allTextContents()).indexOf(word)
     while(position>index){await activate(learn.getByRole('button',{name:`Move up / للأعلى ${word}`,exact:true}));position--}
    }
   }else if(format==='sentence-completion')await learn.getByRole('textbox',{name:ar?'الفراغ 1':'Blank 1'}).fill(fixture.answer!)
   else if(format==='word-builder'){
    const graphemes=[...new Intl.Segmenter(language,{granularity:'grapheme'}).segment(fixture.answer!)].map(item=>item.segment)
    for(const grapheme of graphemes){const escaped=grapheme.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');await activate(learn.getByRole('button',{name:new RegExp(`^${ar?'إضافة':'Add'} ${escaped}${ar?'،':','}`)}).first())}
   }else{
    await expect(learn.getByText(fixture.reference!,{exact:true})).toHaveCount(0)
    await activate(learn.getByRole('button',{name:ar?'إظهار المرجع إن وجد':'Show reference if available'}))
    await expect(learn.getByText(fixture.reference!,{exact:true})).toBeVisible()
   }
   await capture(learn,`../docs/evidence/interactive/native-practice-${format}-${language}-populated.png`)
   let firstBody:unknown,firstSaved:{score:number;submittedAnswer:unknown}|undefined,replayed=0
   if(dropAcknowledgement&&format!=='speaking-cards')await learn.route('**/delivery/attempts/*/answer',async route=>{
    const body=route.request().postDataJSON()
    if(firstBody===undefined){
     firstBody=body
     const committed=await route.fetch();expect(committed.ok()).toBe(true);firstSaved=await committed.json()
     await route.abort('connectionreset')
    }else{
     // Elapsed client observation time can increase on retry. The actual
     // ordering/placements and the server's first persisted evidence cannot.
     const stable=(value:typeof body)=>{const copy=structuredClone(value);if(copy.answer.evidence)delete copy.answer.evidence.durationMs;return copy}
     expect(stable(body)).toEqual(stable(firstBody));replayed++;await route.continue()
    }
   })
   const saved=learn.waitForResponse(response=>response.request().method()==='POST'&&response.url().endsWith(format==='speaking-cards'?'/presentation':'/answer'))
   const submit=learn.getByRole('button',{name:format==='speaking-cards'?(ar?'سجّل كمناقَش':'Mark discussed'):format==='sequence'?(ar?'تحقق':'Check'):ar?(format==='match-up'||format==='group-sort'?'أرسل الإجابة':'إرسال الإجابة'):'Submit answer',exact:true})
   await activate(submit)
   if(dropAcknowledgement&&format!=='speaking-cards'){
    await expect(learn.getByRole('alert')).toBeVisible()
    await expect(submit).toBeEnabled()
    await activate(submit)
   }
   const response=await saved;expect(response.ok(),await response.text()).toBe(true)
   const savedView=await response.json();expect(savedView.answered).toBe(true)
   if(dropAcknowledgement&&format!=='speaking-cards'){expect(replayed).toBe(1);expect(savedView.score).toBe(firstSaved?.score);expect(savedView.submittedAnswer).toEqual(firstSaved?.submittedAnswer)}
   if(format==='speaking-cards'){expect(savedView.correctCount).toBeNull();expect(savedView.presentation.discussed).toHaveLength(1)}else expect(savedView.reveal.wasCorrect).toBe(true)
   if(format==='sentence-completion'){
    await expect(learn.getByRole('textbox',{name:ar?'الفراغ 1':'Blank 1',exact:true})).toHaveValue(fixture.answer!)
    await activate(learn.getByText(ar?'إجابة مرجعية':'Reference answer',{exact:true}))
    await expect(learn.getByText(ar?'إجابة مرجعية: الصباح':'Reference answer: morning',{exact:true})).toBeVisible()
   }
   await learn.reload()
   await expect(learn.getByRole('heading',{name:fixture.prompt,exact:true})).toBeVisible()
   if(format==='speaking-cards')await expect(learn.getByRole('button',{name:ar?'تمت المناقشة':'Discussed',exact:true})).toBeDisabled()
   else await expect(learn.getByRole('status').filter({hasText:ar?'إجابة صحيحة':'Correct'})).toBeVisible()
   if(format==='match-up'||format==='group-sort')for(const [i,card] of fixture.cards!.entries()){
    await expect(learn.getByRole('button',{name:fixture.targets![i===fixture.cards!.length-1?1:0]!,exact:true})).toContainText(card)
    await expect(learn.getByRole('button',{name:card,exact:true})).toHaveCount(0)
   }
   if(format==='sequence')expect(await learn.getByRole('group',{name:ar?'إجابتك المرسلة':'Your submitted answer'}).locator('[data-order-item] > span[dir="auto"]').allTextContents()).toEqual(fixture.ordered)
   // The durable submitted wording stays distinct from the primary reference.
   if(format==='sentence-completion'){
    await expect(learn.getByRole('group',{name:ar?'إجابتك المرسلة':'Your submitted answer'}).getByRole('textbox')).toHaveValue(fixture.answer!)
    await activate(learn.getByText(ar?'إجابة مرجعية':'Reference answer',{exact:true}))
    await expect(learn.getByRole('textbox',{name:ar?'إجابة مرجعية — الفراغ 1':'Reference answer — Blank 1',exact:true})).toHaveValue(ar?'الصباح':'morning')
    await expect(learn.getByText(ar?'إجابة مرجعية: الصباح':'Reference answer: morning',{exact:true})).toBeVisible()
   }
   if(format==='word-builder')await expect(learn.getByRole('textbox',{name:fixture.clue!,exact:true})).toHaveValue(fixture.answer!)
   await capture(learn,`../docs/evidence/interactive/native-practice-${format}-${language}-saved.png`)
   await activate(learn.getByRole('button',{name:ar?'إنهاء الجولة':'Finish round'}))
   await expect(learn.getByRole('heading',{name:ar?'اكتملت الجولة':'Round complete',exact:true})).toBeVisible()
   await learn.reload();await expect(learn.getByRole('heading',{name:ar?'اكتملت الجولة':'Round complete',exact:true})).toBeVisible()
   expect(pageErrors).toEqual([])
  }finally{const video=learn.video();await learner.close();await video?.saveAs(`../docs/evidence/interactive/recordings/native-${format}-${language}${touch?'-touch':''}${reduced?'-reduced':''}${dropAcknowledgement?'-lost-ack':''}.webm`)}
 })
}
