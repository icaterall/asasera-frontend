import {afterEach,expect,it,vi} from 'vitest'
import {cleanup,render,screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {MemoryBoard} from '../src/features/presentations/MemoryBoard'
vi.mock('react-i18next',()=>({useTranslation:()=>({i18n:{language:'en'}})}))
afterEach(cleanup)
it('restores keyboard focus to the next hidden card only after mismatch continuation is saved',async()=>{
 const command=vi.fn(),user=userEvent.setup()
 const board={cards:[{id:'a'.repeat(32),state:'revealed' as const,text:'Sun'},{id:'b'.repeat(32),state:'revealed' as const,text:'Moon'}],turn:'mismatch' as const,moves:1,pairsFound:0,totalPairs:1,complete:false}
 const view=render(<MemoryBoard board={board} busy={false} onCommand={command}/>)
 await user.click(screen.getByRole('button',{name:'Turn cards over'}))
 view.rerender(<MemoryBoard board={board} busy onCommand={command}/>)
 view.rerender(<MemoryBoard board={{...board,turn:'first',cards:board.cards.map(card=>({id:card.id,state:'hidden'}))}} busy={false} onCommand={command}/>)
 expect(document.activeElement).toBe(screen.getByRole('button',{name:'Reveal card 1'}))
 await user.keyboard('{Enter}')
 expect(command).toHaveBeenLastCalledWith({action:'memory-flip',cardId:'a'.repeat(32)})
})
it('reveals only server-supplied faces and sends opaque card identities',async()=>{
 const command=vi.fn(),user=userEvent.setup()
 render(<MemoryBoard board={{cards:[{id:'a'.repeat(32),state:'hidden'},{id:'b'.repeat(32),state:'revealed',text:'Moon'}],turn:'second',moves:0,pairsFound:0,totalPairs:1,complete:false}} busy={false} onCommand={command}/> )
 expect(screen.getAllByText('Moon')).toHaveLength(1)
 await user.click(screen.getByRole('button',{name:'Reveal card 1'}))
 expect(command).toHaveBeenCalledWith({action:'memory-flip',cardId:'a'.repeat(32)})
 expect((screen.getByRole('button',{name:'Card 2: Moon'}) as HTMLButtonElement).disabled).toBe(true)
})
it('keeps a mismatch visible until the learner explicitly continues',async()=>{
 const command=vi.fn(),user=userEvent.setup()
 render(<MemoryBoard board={{cards:[{id:'a'.repeat(32),state:'revealed',text:'Sun'},{id:'b'.repeat(32),state:'revealed',text:'Moon'}],turn:'mismatch',moves:1,pairsFound:0,totalPairs:1,complete:false}} busy={false} onCommand={command}/> )
 expect(screen.getByText('Not a pair. Compare the cards, then try again.')).toBeTruthy()
 await user.click(screen.getByRole('button',{name:'Turn cards over'}))
 expect(command).toHaveBeenCalledWith({action:'memory-continue'})
})
