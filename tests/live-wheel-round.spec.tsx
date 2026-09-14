import {afterEach,expect,it,vi} from 'vitest'
import {cleanup,render,screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {LiveWheelRoundControls} from '../src/features/session/ParticipantControls'
import type {LiveWheelRound} from '../src/shared/live-wheel'
import type {WheelState} from '../src/shared/wheel'

afterEach(cleanup)
const participantId='11111111-1111-4111-8111-111111111111',drawId='22222222-2222-4222-8222-222222222222'
const wheel:WheelState={visible:true,source:'participants',avoidRepeats:true,entries:[{id:participantId,label:'Sara'}],pickedIds:[participantId],spin:{id:drawId,entries:[{id:participantId,label:'Sara'}],winnerIndex:0,startedAt:0,durationMs:0,fromRotation:0,toRotation:180}}
const round:LiveWheelRound={round:1,passedIds:[],earlierEvents:0,history:[{id:drawId,round:1,at:0,action:'selected',participantId,label:'Sara',drawId}]}
const participants=[{id:participantId,name:'Sara',connected:true}]

it('passes the recorded selected identity without issuing a redraw',async()=>{
 const command=vi.fn(async()=>{})
 render(<LiveWheelRoundControls wheel={wheel} round={round} participants={participants} ar={false} disabled={false} clock={{now:()=>10}} onCommand={command}/> )
 await userEvent.click(screen.getByRole('button',{name:'Pass Sara for now'}))
 expect(command).toHaveBeenCalledExactlyOnceWith({action:'pass',participantId,drawId})
 expect(screen.getByText('Passes end at the next round. Regular exclusions remain until you include the participant again. No scores change.')).toBeTruthy()
})

it('restores deliberately with a stable focus target and localized history',async()=>{
 const command=vi.fn(async()=>{})
 const passed={...round,passedIds:[participantId],history:[...round.history,{...round.history[0]!,id:'33333333-3333-4333-8333-333333333333',action:'passed' as const}]}
 const view=render(<LiveWheelRoundControls wheel={wheel} round={passed} participants={participants} ar disabled={false} clock={{now:()=>10}} onCommand={command}/> )
 await userEvent.click(screen.getByRole('button',{name:'إعادة Sara إلى هذه الجولة'}))
 expect(command).toHaveBeenCalledExactlyOnceWith({action:'restore',participantId})
 view.rerender(<LiveWheelRoundControls wheel={wheel} round={round} participants={participants} ar disabled={false} clock={{now:()=>10}} onCommand={command}/> )
 expect(screen.getByText('سجل الاختيار · الجولة 1')).toBe(document.activeElement)
})

it('keeps retryable save errors visible and does not offer restoration for removed seats',async()=>{
 const command=vi.fn(async()=>{throw Error('Connection lost. Retry the same action.')})
 render(<LiveWheelRoundControls wheel={wheel} round={round} participants={[]} ar={false} disabled={false} clock={{now:()=>10}} onCommand={command}/> )
 await userEvent.click(screen.getByRole('button',{name:'Pass Sara for now'}))
 expect(screen.getByRole('alert').textContent).toBe('Connection lost. Retry the same action.')
 expect(screen.queryByRole('button',{name:/Restore/})).toBeNull()
})

it('can deliberately start a new round after all consumed participants were restored',async()=>{
 const command=vi.fn(async()=>{})
 render(<LiveWheelRoundControls wheel={{...wheel,pickedIds:[]}} round={round} participants={participants} ar={false} disabled={false} clock={{now:()=>10}} onCommand={command}/> )
 await userEvent.click(screen.getByRole('button',{name:'Start next round',exact:true}))
 expect(command).toHaveBeenCalledExactlyOnceWith({action:'reset'})
})
