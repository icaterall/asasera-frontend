import {test,expect,type Page,type Locator} from '@playwright/test'
import {assignment,label,teacherFixture} from './helpers/interactive-evidence'
import type {AttemptView} from '../src/shared/delivery'
import type {SavedWordBoard} from '../src/shared/word-boards'
test.use({trace:'off'})
type Audit={duration:number;transform:boolean}
declare global {interface Window {__interactiveMotionAudit:Audit[]}}
async function command(page:Page,button:Locator){const response=page.waitForResponse(r=>/\/delivery\/attempts\/[^/]+\/(presentation|answer)$/.test(new URL(r.url()).pathname)&&r.request().method()==='POST');await button.click();const result=await response;expect(result.ok()).toBe(true);return await result.json() as AttemptView}
for(const language of ['en','ar'] as const)for(const kind of ['flashcards','random-cards','memory','open-box','word-search','crossword'] as const)test(`committed outcome is unchanged by reduced motion ${kind} ${language}`,async({page,request,browser},testInfo)=>{
 test.setTimeout(90000)
 const ar=language==='ar',grid=kind==='word-search'||kind==='crossword',memory=kind==='memory',flash=kind==='flashcards'
 const source:Record<string,unknown>=grid?{kind:'vocabulary',prompt:label(language,'Complete these reviewed words.','أكمل هذه الكلمات المعتمدة.'),payload:{schemaVersion:1,policy:{version:1,language,diacritics:'preserve',tatweel:'preserve',case:'ignore',spaces:'preserve'},entries:(ar?['باب','تاب']:['cat','tap']).map((word,i)=>({id:`w${i}`,word,clue:label(language,`Reviewed clue ${i+1}`,`التلميح المعتمد ${i+1}`)}))}}:memory?{kind:'match',prompt:label(language,'Remember the reviewed pair.','تذكر الزوج المعتمد.')}:{kind:'tf',prompt:label(language,'The moon is a star.','القمر نجم.'),payload:{correct:false}}
 if(memory)source.payload={cards:[{key:'a',text:label(language,'Cat','قطة')},{key:'b',text:label(language,'Bird','طائر')}],targets:[{key:'x',text:label(language,'Mammal','ثديي')},{key:'y',text:label(language,'Feathers','ريش')}],map:{a:'x',b:'y'}}
 const fixture=await teacherFixture(page,request,language,[source]);let board:SavedWordBoard|undefined
 if(grid){const q=fixture.questions[0],generated=await request.post(`/api/v1/activities/questions/${q.id}/word-board`,{headers:fixture.headers,data:{kind,expectedRevision:q.revision,requestId:crypto.randomUUID(),config:{rows:8,columns:8,seed:31}}});expect(generated.ok()).toBe(true);board=(await generated.json()).board;expect(board?.status).toBe('ready')}
 await fixture.publish()
 const names={flashcards:label(language,'Flashcards','بطاقات المراجعة'),'random-cards':label(language,'Random cards','بطاقات عشوائية'),memory:label(language,'Memory','الذاكرة'),'open-box':label(language,'Open the box','افتح الصندوق'),'word-search':label(language,'Word search','البحث عن الكلمات'),crossword:label(language,'Crossword','الكلمات المتقاطعة')}
 const link=await assignment(page,fixture.activity.id,language,names[kind]),outcomes:unknown[]=[],audits:unknown[]=[]
 for(const reducedMotion of ['no-preference','reduce'] as const){
  const viewport=ar?{width:390,height:844}:{width:1440,height:900}
  const context=await browser.newContext({viewport,reducedMotion,hasTouch:ar,recordVideo:{dir:'../docs/evidence/interactive/recordings',size:viewport}})
  await context.addInitScript(lang=>{localStorage.setItem('asasera.language',lang);window.__interactiveMotionAudit=[];const original=Element.prototype.animate;Element.prototype.animate=function(frames,options){if(this.closest('[data-presentation]'))window.__interactiveMotionAudit.push({duration:Number(typeof options==='number'?options:options?.duration??0),transform:JSON.stringify(frames).includes('transform')});return original.call(this,frames,options)}},language)
  const learn=await context.newPage(),errors:string[]=[];learn.on('pageerror',error=>errors.push(error.message))
  try{
   await learn.goto(link);await learn.getByRole('textbox',{name:label(language,'Your name','اسمك')}).fill(label(language,'Motion learner','متعلم الحركة'));await learn.getByRole('button',{name:label(language,'Start','ابدأ'),exact:true}).click()
   expect(await learn.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(reducedMotion==='reduce')
   let view=await command(learn,learn.getByRole('button',{name:kind==='open-box'?label(language,'Box 1','الصندوق 1'):label(language,'Start round','ابدأ الجولة'),exact:true}))
   expect(view.question?.id).toBe(fixture.questions[0].id)
   if(flash){await command(learn,learn.getByRole('button',{name:label(language,'Reveal answer','اكشف الإجابة'),exact:true}));view=await command(learn,learn.getByRole('button',{name:label(language,'Remembered','أتذكرها'),exact:true}));expect(Object.values(view.presentation!.ratings)).toEqual(['known'])}
   else if(memory){
    const known=new Map<number,string>(),pairs=ar?[['قطة','ثديي'],['طائر','ريش']]:[['Cat','Mammal'],['Bird','Feathers']]
    for(let step=0;step<30;step++){
     const region=learn.getByRole('region',{name:label(language,'Memory board','لوحة الذاكرة')}),cards=region.locator('button[data-state]'),states=await cards.evaluateAll(elements=>elements.map(el=>({state:el.getAttribute('data-state'),text:el.querySelector('[dir="auto"]')?.textContent??''})))
     states.forEach((card,i)=>{if(card.text)known.set(i,card.text)})
     if(states.every(card=>card.state==='matched'))break
     const clear=learn.getByRole('button',{name:label(language,'Turn cards over','اقلب البطاقتين'),exact:true})
     if(await clear.isVisible()){view=await command(learn,clear);continue}
     const shown=states.findIndex(card=>card.state==='revealed'),hidden=states.map((card,i)=>card.state==='hidden'?i:-1).filter(i=>i>=0)
     const other=shown<0?undefined:pairs.find(pair=>pair.includes(known.get(shown)??''))?.find(text=>text!==known.get(shown))
     const target=hidden.find(i=>other&&known.get(i)===other)??hidden.find(i=>!known.has(i))??hidden[0]
     view=await command(learn,cards.nth(target))
    }
    expect(view.presentation!.memory?.complete).toBe(true)
   }else if(board){
    for(const placement of board.placements){if(kind==='word-search'){const a=placement.cells[0],b=placement.cells.at(-1)!;await learn.locator(`button[data-row="${a.row}"][data-column="${a.column}"]`).click();view=await command(learn,learn.locator(`button[data-row="${b.row}"][data-column="${b.column}"]`))}else{await learn.getByRole('button').filter({hasText:placement.clue}).click();await learn.getByRole('textbox',{name:label(language,`Answer to clue ${placement.number}`,`إجابة التلميح ${placement.number}`)}).fill(placement.word);view=await command(learn,learn.getByRole('button',{name:label(language,'Save word','احفظ الكلمة'),exact:true}))}}
    if(kind==='crossword')view=await command(learn,learn.getByRole('button',{name:label(language,'Check words','تحقق من الكلمات'),exact:true}))
    expect(view.presentation!.wordGrid?.complete).toBe(true)
   }else{view=await command(learn,learn.getByRole('button',{name:label(language,'False','خطأ'),exact:true}));expect(view.reveal?.wasCorrect).toBe(true)}
   const audit=await learn.evaluate(()=>window.__interactiveMotionAudit),transforms=audit.filter(item=>item.transform)
   if(reducedMotion==='reduce')expect(transforms).toEqual([]);else{expect(transforms.length).toBeGreaterThan(0);expect(transforms.every(item=>(kind==='open-box'?[300]:[260,280]).includes(item.duration))).toBe(true);if(memory)expect(transforms.some(item=>item.duration===260)).toBe(true)}
   audits.push({reducedMotion,animations:audit})
   const pairsFound=view.presentation!.memory?.pairsFound,wordsFound=kind==='crossword'?Object.values(view.presentation!.wordGrid!.feedback).filter(value=>value==='correct').length:view.presentation!.wordGrid?.found.length
   if(memory)expect(pairsFound).toBe(2);if(grid)expect(wordsFound).toBe(2)
   await learn.evaluate(async()=>{await document.fonts.ready;await Promise.all(document.getAnimations().filter(animation=>animation.effect?.getTiming().iterations!==Infinity).map(animation=>animation.finished.catch(()=>{})))})
   await learn.screenshot({path:`../docs/evidence/interactive/motion-${kind}-${language}-${reducedMotion}-populated.png`,fullPage:true})
   view=await command(learn,learn.getByRole('button',{name:label(language,'Finish round','إنهاء الجولة'),exact:true}));await expect(learn.getByRole('heading',{name:label(language,'Round complete','اكتملت الجولة'),exact:true})).toBeVisible()
   if(flash||memory||grid){expect(view.score).toBeNull();expect(view.correctCount).toBeNull()}else expect(view.correctCount).toBe(1)
   outcomes.push({status:view.status,questionCount:view.questionCount,score:view.score,correctCount:view.correctCount,ratings:view.presentation!.ratings,drawn:view.presentation!.drawn,pairsFound,wordsFound})
   await learn.reload();await expect(learn.getByRole('heading',{name:label(language,'Round complete','اكتملت الجولة'),exact:true})).toBeVisible();expect(await learn.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
   await learn.screenshot({path:`../docs/evidence/interactive/motion-${kind}-${language}-${reducedMotion}.png`,fullPage:true});expect(errors).toEqual([])
  }finally{const video=learn.video();await context.close();await video?.saveAs(`../docs/evidence/interactive/recordings/equivalence-${kind}-${language}-${reducedMotion}.webm`)}
 }
 expect(outcomes[0]).toEqual(outcomes[1]);console.info('MOTION_EVIDENCE',JSON.stringify({kind,language,outcomes,audits}));await testInfo.attach('motion-audit',{body:JSON.stringify({kind,language,outcomes,audits},null,2),contentType:'application/json'})
})
