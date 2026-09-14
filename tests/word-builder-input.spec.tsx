import {afterEach,expect,it,vi} from 'vitest'
import {cleanup,render,screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {WordBuilderInput} from '../src/features/presentations/WordBuilderInput'
vi.mock('react-i18next',()=>({useTranslation:()=>({i18n:{language:'en'}})}))
afterEach(cleanup)
it('moves repeated grapheme tiles individually and submits composed text without sending tile identities as answers',async()=>{
 const answer=vi.fn(),user=userEvent.setup()
 render(<WordBuilderInput board={{entries:[{id:'entry_1',clue:'A parent',tiles:[{id:'opaque3',text:'a'},{id:'opaque1',text:'b'},{id:'opaque2',text:'a'}]}]}} disabled={false} onAnswer={answer}/>)
 await user.click(screen.getByRole('button',{name:'Add b, tile 2'}))
 await user.click(screen.getByRole('button',{name:'Add a, tile 1'}))
 await user.click(screen.getByRole('button',{name:'Add a, tile 3'}))
 expect(screen.queryByRole('button',{name:'Add a, tile 1'})).toBeNull()
 await user.click(screen.getByRole('button',{name:'Remove a, position 2'}))
 await user.click(screen.getByRole('button',{name:'Add a, tile 1'}))
 await user.click(screen.getByRole('button',{name:'Submit answer'}))
 expect(answer).toHaveBeenCalledWith({kind:'vocabulary',values:{entry_1:'baa'}})
})
