import {afterEach,expect,it,vi} from 'vitest'
import {cleanup,render,screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {WordGridInput} from '../src/features/presentations/WordGridInput'
import type {AttemptPresentation} from '../src/shared/delivery'
vi.mock('react-i18next',()=>({useTranslation:()=>({i18n:{language:'en'}})}))
afterEach(cleanup)
const state:NonNullable<AttemptPresentation['wordGrid']>={board:{algorithmVersion:1,kind:'word-search',language:'en',rows:2,columns:2,matrix:[['a','b'],['c','d']],directions:[{rowStep:0,columnStep:1}],clues:[],targets:[{id:'target_1',text:'ab'}]},found:[],values:{},feedback:{},conflicts:[],checks:0,maxChecks:100,complete:false}
it('selects saved search geometry using two keyboard-accessible cell buttons',async()=>{
 const command=vi.fn(),user=userEvent.setup()
 render(<WordGridInput grid={state} busy={false} onCommand={command}/> )
 await user.click(screen.getByRole('button',{name:'Row 1, column 1: a'}))
 await user.click(screen.getByRole('button',{name:'Row 1, column 2: b'}))
 expect(command).toHaveBeenCalledWith({action:'word-search-select',start:{row:0,column:0},end:{row:0,column:1}})
})
it('previews the full keyboard selection and its letters before submitting',async()=>{
 const command=vi.fn(),user=userEvent.setup()
 render(<WordGridInput grid={state} busy={false} onCommand={command}/> )
 screen.getByRole('button',{name:'Row 1, column 1: a'}).focus()
 await user.keyboard('{Enter}{ArrowRight}')
 expect(screen.getByText('ab',{selector:'output'})).toBeTruthy()
 expect(document.querySelectorAll('[data-preview="true"]')).toHaveLength(2)
 expect(command).not.toHaveBeenCalled()
 await user.keyboard('{Enter}')
 expect(command).toHaveBeenCalledWith({action:'word-search-select',start:{row:0,column:0},end:{row:0,column:1}})
})
it('provides external crossword answer input and saves a draft without claiming correctness',async()=>{
 const command=vi.fn(),user=userEvent.setup()
 render(<WordGridInput grid={{...state,board:{...state.board,kind:'crossword',matrix:[['',''],[null,null]],targets:undefined,clues:[{id:'clue_1',number:1,text:'First two letters',start:{row:0,column:0},direction:'across',length:2}]}}} busy={false} onCommand={command}/> )
 await user.type(screen.getByRole('textbox',{name:'Answer to clue 1'}),'ab')
 await user.click(screen.getByRole('button',{name:'Save word'}))
 expect(command).toHaveBeenCalledWith({action:'crossword-entry',entryId:'clue_1',value:'ab'})
 expect(screen.queryByText('Correct')).toBeNull()
})
