import assert from 'node:assert/strict'
import {it} from 'node:test'
import {readFileSync} from 'node:fs'
import {answerDistribution, answerProgress, questionTime} from '../src/features/session/questionPresentation.ts'
import type {PublicQuestion, Reveal} from '../src/shared/session.ts'

const question:PublicQuestion={id:1,qIndex:0,prompt:'Which is sensitive data?',media:null,timeLimitS:100,payload:{kind:'mcq',options:[{key:'bank',text:'Your bank account number'},{key:'weather',text:'Tomorrow’s weather forecast'},{key:'bus',text:'A public bus timetable'},{key:'holiday',text:'The date of a national holiday'}]}}
const reveal:Reveal={qIndex:0,correct:'bank',distribution:[{key:'holiday',count:1},{key:'bank',count:2},{key:'weather',count:0},{key:'bus',count:0}],topScores:[]}

it('a delayed arrival uses the remaining server time, without restarting the question',()=>{
  assert.deepEqual(questionTime(100_000,3_500,100),{remaining:96_500,seconds:97,fraction:.965,urgent:false})
})
it('the last five seconds are urgent, with no negative timer after tab suspension',()=>{
  assert.equal(questionTime(10_000,5_001,10).urgent,true)
  assert.equal(questionTime(10_000,9_999,10).seconds,1)
  assert.deepEqual(questionTime(10_000,100_000,10),{remaining:0,seconds:0,fraction:0,urgent:false})
})
it('the progress ring stays finite and bounded on a clock correction or zero duration',()=>{
  assert.equal(questionTime(100_000,0,20).fraction,1)
  assert.equal(questionTime(10_000,10_000,0).fraction,0)
})
it('an empty lobby does not falsely announce that everyone answered',()=>{
  assert.deepEqual(answerProgress(0,0),{fraction:0,complete:false,unanswered:0})
  assert.deepEqual(answerProgress(2,3),{fraction:2/3,complete:false,unanswered:1})
  assert.deepEqual(answerProgress(3,3),{fraction:1,complete:true,unanswered:0})
})
it('chart colors stay attached to answer positions even if result rows arrive reordered',()=>{
  const rows=answerDistribution(question,reveal,4,false)
  assert.equal(rows[0].slot,4)
  assert.equal(rows[1].slot,1)
  assert.equal(rows[0].correct,false)
  assert.equal(rows[1].correct,true)
  assert.equal(rows[1].label,'Your bank account number')
})
it('zero answers have zero length, and nonresponses stay part of the class denominator',()=>{
  const rows=answerDistribution(question,reveal,4,false)
  assert.equal(rows[1].fraction,.5)
  assert.equal(rows[2].fraction,0)
  assert.equal(answerProgress(3,4).unanswered,1)
})
it('true/false disclosure accepts the server’s boolean and localizes the labels',()=>{
  const tf:PublicQuestion={...question,payload:{kind:'tf',options:[{key:'true',text:'صح'},{key:'false',text:'خطأ'}]}}
  const result:Reveal={...reveal,correct:false,distribution:[{key:'true',count:0},{key:'false',count:1}]}
  assert.equal(answerDistribution(tf,result,1,false)[1].label,'False')
  assert.equal(answerDistribution(tf,result,1,true)[0].label,'صح')
  assert.equal(answerDistribution(tf,result,1,false)[1].correct,true)
})
it('authored option text keeps its own language while interface labels translate',()=>{
  assert.equal(answerDistribution(question,reveal,4,true)[1].label,'Your bank account number')
})
it('advanced questions use correctness counts instead of inventing four answer choices',()=>{
  const order:PublicQuestion={...question,payload:{kind:'order',items:[{key:'a',text:'First'},{key:'b',text:'Second'}]}}
  const result:Reveal={...reveal,correct:['a','b'],distribution:[{key:'correct',count:2},{key:'incorrect',count:1}]}
  const rows=answerDistribution(order,result,4,true)
  assert.equal(rows[0].label,'إجابة صحيحة')
  assert.equal(rows[0].correct,true)
  assert.equal(rows[0].slot,null)
  assert.equal(rows[1].correct,false)
})

/*
 * v5 §07/§19 (LIVE-01, UI-04): the player's phone shows the prompt, media and the
 * option TEXT beside the colour+shape glyph by default. The components are .tsx
 * (not importable under node:test), so this pins the contract at the source level.
 */
const stageSource=readFileSync(new URL('../src/features/session/LiveQuestionStage.tsx',import.meta.url),'utf8')
const inputSource=readFileSync(new URL('../src/features/session/QuestionInput.tsx',import.meta.url),'utf8')
it('players read the real prompt during an open question, not a "match the projector" placeholder',()=>{
  assert.match(stageSource,/<h1 className=\{styles\.prompt\} dir="auto">\{q\.prompt\}<\/h1>/)
  assert.doesNotMatch(stageSource,/اختر الشكل الصحيح|طابق اللون والشكل/)
})
it('the stage never forces shape-only tiles on the player role; projector-only mode is opt-in',()=>{
  assert.doesNotMatch(stageSource,/classroom=|shapeOnly=|projectorOnly=\{player/)
  assert.match(inputSource,/projectorOnly=false/)
  assert.match(inputSource,/shapeOnly=\{projectorOnly\}/)
  assert.match(inputSource,/data-layout=\{projectorOnly\?'shape':'text'\}/)
})
it('option text and media are hidden only in the optional projector-only layout',()=>{
  assert.match(inputSource,/\{!projectorOnly&&question\.media&&<img data-question-media=""/)
  assert.match(inputSource,/'image'in o&&o\.image&&!projectorOnly/)
})
