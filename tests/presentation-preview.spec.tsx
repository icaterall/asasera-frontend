import {afterEach,beforeEach,expect,it,vi} from 'vitest'
import {cleanup,render,screen,waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {QueryClient,QueryClientProvider} from '@tanstack/react-query'
import {PresentationPreview} from '../src/features/presentations/PresentationPreview'
import type {PresentationSelection} from '../src/shared/presentation'

const {post}=vi.hoisted(()=>({post:vi.fn()}))
vi.mock('../src/lib/api',()=>({api:{post},apiOrigin:'http://localhost'}))
vi.mock('react-i18next',()=>({useTranslation:()=>({i18n:{language:'en'}})}))
afterEach(cleanup);beforeEach(()=>post.mockReset())
const selection:PresentationSelection={definitionId:'flashcards',definitionVersion:1,adapterVersion:1,contentVersionId:7,selectedQuestionIds:[2],config:{context:'practice',semantics:'self-rated',noRepeat:true,revealPolicy:'on-request'}}
const base={previewOnly:true,activityId:1,title:'Reviewed lesson',contentLanguage:'en',contentVersionId:7,sourceQuestionCount:3,selection,items:[{question:{id:2,qIndex:1,prompt:'The moon is a star.',media:null,timeLimitS:20,payload:{kind:'tf',options:[{key:'true',text:'True'},{key:'false',text:'False'}]}},reviewedPayload:{correct:false},referenceAnswer:false,explanation:'The moon is a natural satellite.'}]}
function renderPreview(chosen=selection){return render(<QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><PresentationPreview activityId={1} selection={chosen}/></QueryClientProvider>)}
it('previews only the approved selection, reveals the contextual answer locally and resets without a delivery request',async()=>{
 post.mockResolvedValue(base);renderPreview()
 expect(await screen.findByText('The moon is a star.')).toBeTruthy()
 expect(screen.getByText(/1 of 3 approved questions/)).toBeTruthy()
 expect(screen.getByText(/Nothing is saved or scored/)).toBeTruthy()
 expect(screen.queryByText('The moon is a natural satellite.')).toBeNull()
 await userEvent.click(screen.getByRole('button',{name:'Show reference answer'}))
 expect(screen.getByText('The moon is a natural satellite.')).toBeTruthy()
 await userEvent.click(screen.getByRole('button',{name:'Reset preview'}))
 expect(screen.queryByText('The moon is a natural satellite.')).toBeNull()
 expect(post).toHaveBeenCalledTimes(1)
 expect(post).toHaveBeenCalledWith('/api/v1/presentations/activities/1/preview',selection)
})
it('uses the existing native grader for accepted alternatives and displays the reviewed comparison policy',async()=>{
 const policy={version:1,language:'ar',diacritics:'preserve',tatweel:'preserve',case:'preserve',spaces:'preserve'},segments=[{kind:'text',text:'نبدأ في '},{kind:'blank',blankId:'time'}]
 const chosen:PresentationSelection={...selection,definitionId:'sentence-completion',config:{...selection.config,semantics:'scored',revealPolicy:'after-answer'}}
 post.mockResolvedValue({...base,selection:chosen,items:[{question:{id:2,qIndex:1,prompt:'أكمل النص',media:null,timeLimitS:20,payload:{kind:'cloze',schemaVersion:1,segments,policy,trimBoundaryWhitespace:true}},reviewedPayload:{schemaVersion:1,segments,blanks:[{id:'time',acceptedAnswers:['الصباح','النهار']}],policy,trimBoundaryWhitespace:true},referenceAnswer:{time:'الصباح'},explanation:null}]})
 renderPreview(chosen)
 await userEvent.type(await screen.findByRole('textbox',{name:'Blank 1'}),'النهار')
 await userEvent.click(screen.getByRole('button',{name:'Submit answer'}))
 expect(screen.getByText(/Correct. This is how a learner/)).toBeTruthy()
 await userEvent.click(screen.getByText('Accepted answers and comparison policy'))
 expect(screen.getByText('الصباح / النهار')).toBeTruthy()
 expect(screen.getByText(/Diacritics: preserve/)).toBeTruthy()
 expect(post).toHaveBeenCalledTimes(1)
})
it('shows a recoverable authorized-preview error without starting any delivery',async()=>{
 post.mockRejectedValueOnce(new Error('The approved version changed.')).mockResolvedValue(base)
 renderPreview();expect((await screen.findByRole('alert')).textContent).toContain('The approved version changed.')
 await userEvent.click(screen.getByRole('button',{name:'Retry preview'}))
 await waitFor(()=>expect(screen.getByText('The moon is a star.')).toBeTruthy())
 expect(post).toHaveBeenCalledTimes(2)
})
it('uses the shared memory transition locally and an explicit reset restores concealed cards',async()=>{
 const chosen:PresentationSelection={...selection,definitionId:'memory',config:{...selection.config,semantics:'practice'}}
 const payload={cards:[{key:'cat',text:'Cat'},{key:'bird',text:'Bird'}],targets:[{key:'mammal',text:'Mammal'},{key:'avian',text:'Avian'}],map:{cat:'mammal',bird:'avian'}}
 post.mockResolvedValue({...base,selection:chosen,items:[{question:{...base.items[0]!.question,prompt:'Match animals',payload:{kind:'match',cards:payload.cards,targets:payload.targets}},reviewedPayload:payload,referenceAnswer:payload.map,explanation:null,memory:{cards:[{id:'a'.repeat(32),side:'card',key:'cat',text:'Cat'},{id:'b'.repeat(32),side:'target',key:'mammal',text:'Mammal'},{id:'c'.repeat(32),side:'card',key:'bird',text:'Bird'},{id:'d'.repeat(32),side:'target',key:'avian',text:'Avian'}],revealed:[],matched:[],moves:0}}]})
 renderPreview(chosen)
 await userEvent.click(await screen.findByRole('button',{name:'Reveal card 1'}))
 expect(screen.getByText('Cat')).toBeTruthy();expect(screen.queryByText('Mammal')).toBeNull()
 await userEvent.click(screen.getByRole('button',{name:'Reveal card 2'}))
 expect(screen.getByText('Pairs: 1 of 2')).toBeTruthy()
 await userEvent.click(screen.getByRole('button',{name:'Reset preview'}))
 expect(screen.queryByText('Cat')).toBeNull();expect(screen.getByText('Pairs: 0 of 2')).toBeTruthy()
 expect(post).toHaveBeenCalledTimes(1)
})
it('shows a saved crossword as read-only with an explicit local reference toggle',async()=>{
 const chosen:PresentationSelection={...selection,definitionId:'crossword',config:{...selection.config,semantics:'practice'}}
 const policy={version:1,language:'en',diacritics:'preserve',tatweel:'preserve',case:'preserve',spaces:'preserve'}
 post.mockResolvedValue({...base,selection:chosen,items:[{question:{...base.items[0]!.question,prompt:'A reviewed word',payload:{kind:'vocabulary',schemaVersion:1,policy,entries:[{id:'entry_1',clue:'Pet'}]}},reviewedPayload:{schemaVersion:1,policy,entries:[{id:'cat',word:'cat',clue:'Pet'}]},referenceAnswer:{entry_1:'cat'},explanation:null,wordGrid:{board:{algorithmVersion:1,kind:'crossword',language:'en',rows:1,columns:3,matrix:[['','','']],directions:[{rowStep:0,columnStep:1}],clues:[{id:'clue_1',number:1,text:'Pet',start:{row:0,column:0},direction:'across',length:3}]},referenceValues:{clue_1:'cat'},referencePaths:[{id:'target_1',cells:[{row:0,column:0},{row:0,column:1},{row:0,column:2}]}]}}]})
 renderPreview(chosen)
 expect(await screen.findByText(/Read-only saved layout/)).toBeTruthy()
 const field=screen.getByRole<HTMLInputElement>('textbox',{name:'Answer to clue 1'})
 expect(field.disabled).toBe(true);expect(field.value).toBe('')
 expect(screen.queryByRole('button',{name:'Save word'})).toBeNull()
 expect(screen.queryByText('Saved',{exact:true})).toBeNull()
 await userEvent.click(screen.getByRole('button',{name:'Show reference answer'}))
 expect(screen.getByRole<HTMLInputElement>('textbox',{name:'Answer to clue 1'}).value).toBe('cat')
 expect(post).toHaveBeenCalledTimes(1)
})
