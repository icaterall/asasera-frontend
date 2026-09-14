import {afterEach,expect,it,vi} from 'vitest'
import {cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react'
import {livePresentationViewSchema} from '../src/shared/live-presentation'
import {LivePresentationControls} from '../src/features/session/LivePresentationControls'
import {LiveQuestionStage} from '../src/features/session/LiveQuestionStage'
import {snapshotSchema} from '../src/shared/session'
import {ServerClock} from '../src/features/session/clock'
import {SessionAudio} from '../src/design/audio'
import {LiveMemoryBoard} from '../src/features/session/LiveMemoryBoard'
import i18n from '../src/i18n'
afterEach(cleanup)
const state=livePresentationViewSchema.parse({schemaVersion:1,selection:{definitionId:'open-box',definitionVersion:1,adapterVersion:1,contentVersionId:8,selectedQuestionIds:[22],config:{context:'live',semantics:'scored',noRepeat:true,revealPolicy:'host'}},rules:{},revision:0,pass:1,active:null,wheel:null,items:[{elementId:'question:22',number:2,canonicalIndex:1,questionId:22,status:'closed'}]})
it('selects a stable box then offers a separate begin action without exposing a prompt or teacher actions to spectators',async()=>{
 const send=vi.fn().mockResolvedValue(undefined),clock={now:()=>1000}
 const view=render(<LivePresentationControls state={state} phase="lobby" host ar={false} disabled={false} participants={[]} clock={clock} onCommand={send}/>)
 fireEvent.click(screen.getByRole('button',{name:'Open box 2'}))
 await waitFor(()=>expect(send).toHaveBeenCalledWith({action:'select-box',elementId:'question:22'}))
 const selected=livePresentationViewSchema.parse({...state,revision:1,items:[{...state.items[0],status:'selected'}],active:{id:crypto.randomUUID(),qIndex:0,canonicalIndex:1,questionId:22,pass:1,position:1,status:'selected',openedAt:null,endsAt:null}})
 view.rerender(<LivePresentationControls state={selected} phase="lobby" host ar={false} disabled={false} participants={[]} clock={clock} onCommand={send}/>)
 fireEvent.click(screen.getByRole('button',{name:'Begin question'}))
 await waitFor(()=>expect(send).toHaveBeenCalledWith({action:'begin'}))
 view.rerender(<LivePresentationControls state={selected} phase="lobby" host={false} ar disabled={false} participants={[]} clock={clock} onCommand={send}/>)
 expect(screen.queryByRole('button',{name:/ابدأ|افتح/})).toBeNull()
 expect(screen.getByText('انتظر بدء السؤال من المعلّم.')).toBeTruthy()
})

it('keeps a host-paced question answerable and labels the canonical position without claiming that time expired',()=>{
 void i18n.changeLanguage('en')
 const snapshot=snapshotSchema.parse({runId:4,pin:'234567',title:'Synthetic lesson',theme:'classic',state:'question_open',revision:3,serverNow:1000,endsAt:null,questionCount:1,question:{id:22,qIndex:4,prompt:'A reviewed statement',media:null,timeLimitS:20,payload:{kind:'tf',options:[{key:'true',text:'True'},{key:'false',text:'False'}]}},participants:[],acceptedCount:0,reveal:null,top:[],persistence:'ready',endReason:null,hostConnected:true,classId:null,intervention:null,self:{participantId:'student',name:'Learner',score:0,correctCount:0,answered:false,result:null},presentation:{...state,active:{id:crypto.randomUUID(),qIndex:4,canonicalIndex:1,questionId:22,pass:2,position:1,status:'open',openedAt:1000,endsAt:null}}})
 const answer=vi.fn()
 render(<LiveQuestionStage snapshot={snapshot} role="player" clock={new ServerClock()} audio={new SessionAudio()} connected pending={false} ar={false} onAnswer={answer}/>)
 expect(screen.queryByLabelText('Time is up')).toBeNull()
 expect(screen.getByText('Question 1 of 1')).toBeTruthy()
 fireEvent.click(screen.getByRole('button',{name:/True/}))
 expect(answer).toHaveBeenCalledWith({kind:'tf',choice:'true'})
})

it('shows all reviewed flashcard choices before reveal and then the reference text, never a key or invented personal grade',()=>{
 void i18n.changeLanguage('en')
 const snapshot=snapshotSchema.parse({runId:4,pin:'234567',title:'Synthetic recall',theme:'classic',contentLanguage:'ar',state:'question_open',revision:3,serverNow:1000,endsAt:null,questionCount:1,question:{id:22,qIndex:0,prompt:'اختر الوصف',media:null,timeLimitS:20,payload:{kind:'mcq',options:[{key:'a',text:'First statement'},{key:'b',text:'Second statement'},{key:'c',text:'All of the above'}]}},participants:[],acceptedCount:0,reveal:null,top:[],persistence:'ready',endReason:null,hostConnected:true,classId:null,intervention:null,self:{participantId:'student',name:'Learner',score:0,correctCount:0,answered:false,result:null},presentation:{...state,selection:{...state.selection,definitionId:'flashcards',config:{...state.selection.config,context:'teacher-led',semantics:'self-rated'}},active:{id:crypto.randomUUID(),qIndex:0,canonicalIndex:1,questionId:22,pass:1,position:1,status:'open',openedAt:1000,endsAt:null}}})
 const props={snapshot,role:'player' as const,clock:new ServerClock(),audio:new SessionAudio(),connected:true,pending:false,ar:false,onAnswer:vi.fn()}
 const view=render(<LiveQuestionStage {...props}/>)
 expect(screen.getByText('All of the above')).toBeTruthy()
 expect(screen.getByRole('heading',{name:'اختر الوصف'}).getAttribute('lang')).toBe('ar')
 expect(screen.queryByRole('button')).toBeNull()
 view.rerender(<LiveQuestionStage {...props} snapshot={{...snapshot,state:'revealing',reveal:{qIndex:0,correct:'c',distribution:[],topScores:[],explanation:null}}}/>)
 expect(screen.getByRole('region',{name:'Reference answer'}).textContent).toContain('All of the above')
 expect(screen.queryByText('No answer received')).toBeNull()
})

it('gives only the teacher memory flip controls and keeps unmatched cards visible until an explicit continue',async()=>{
 const board={cards:[{id:'a'.repeat(32),state:'hidden' as const},{id:'b'.repeat(32),state:'hidden' as const}],totalPairs:1,pairsFound:0,moves:0,complete:false,turn:'first' as const}
 const send=vi.fn().mockResolvedValue(undefined)
 const view=render(<LiveMemoryBoard board={board} host ar={false} disabled={false} onCommand={send}/>)
 fireEvent.click(screen.getByRole('button',{name:'Flip card 1'}))
 await waitFor(()=>expect(send).toHaveBeenCalledWith({action:'memory-flip',cardId:'a'.repeat(32)}))
 view.rerender(<LiveMemoryBoard board={{...board,turn:'mismatch',moves:1,cards:[{...board.cards[0]!,state:'revealed',text:'Alpha'},{...board.cards[1]!,state:'revealed',text:'Second'}]}} host ar={false} disabled={false} onCommand={send}/>)
 expect(screen.getByText('Alpha')).toBeTruthy();expect(screen.getByText('Second')).toBeTruthy()
 fireEvent.click(screen.getByRole('button',{name:'Turn both cards back'}))
 await waitFor(()=>expect(send).toHaveBeenCalledWith({action:'memory-continue'}))
 view.rerender(<LiveMemoryBoard board={board} host={false} ar disabled={false} onCommand={send}/>)
 expect(screen.queryByRole('button')).toBeNull()
 expect(screen.getByText('تابعوا اللوحة؛ المعلّم يقلب البطاقات.')).toBeTruthy()
})
