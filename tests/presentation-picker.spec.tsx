import {afterEach,expect,it,vi} from 'vitest'
import {cleanup,render,screen,waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {QueryClient,QueryClientProvider} from '@tanstack/react-query'
import {PresentationPicker} from '../src/features/presentations/PresentationPicker'
import {api} from '../src/lib/api'
const interfaceLanguage=vi.hoisted(()=>({value:'en'}))
vi.mock('react-i18next',()=>({useTranslation:()=>({i18n:{language:interfaceLanguage.value}})}))
afterEach(()=>{cleanup();vi.restoreAllMocks();interfaceLanguage.value='en'})
it('offers exactly twelve live presentation cards and removes the redundant speaking-card choice',async()=>{
 vi.spyOn(api,'get').mockResolvedValue({contentVersionId:2,questionCount:1,presentations:[]})
 render(<QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><PresentationPicker activityId={1} context="live" disabled={false} onChange={vi.fn()} onReadyChange={vi.fn()}/></QueryClientProvider>)
 await waitFor(()=>expect(screen.getByRole('radio',{name:'Questions in order'})).toBeTruthy())
 expect(screen.getAllByRole('radio')).toHaveLength(12)
 expect(screen.queryByRole('radio',{name:'Speaking cards'})).toBeNull()
})
it('explains unavailable formats and provides a correction path without enabling launch',async()=>{
 vi.spyOn(api,'get').mockResolvedValue({contentVersionId:2,questionCount:2,presentations:[{definitionId:'memory',contentVersionId:2,status:'unavailable',compatibleItemRefs:[],excludedItemRefs:[],reasons:['native-pairs-required']}]})
 const ready=vi.fn(),changed=vi.fn()
 render(<QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><PresentationPicker activityId={12} disabled={false} onChange={changed} onReadyChange={ready}/></QueryClientProvider>)
 const radio=await screen.findByRole<HTMLInputElement>('radio',{name:/Memory/})
 expect(radio.disabled).toBe(false)
 await userEvent.click(radio)
 expect(screen.getByText('Add reviewed matching pairs to use this format.')).toBeTruthy()
 expect(screen.getByRole('link',{name:'Edit activity content'}).getAttribute('href')).toBe('/teacher/activities/12')
 await waitFor(()=>expect(ready).toHaveBeenLastCalledWith(false))
 expect(changed).toHaveBeenLastCalledWith(null)
})
it('launches collective flashcards through the teacher-led live context, not individual scoring',async()=>{
 vi.spyOn(api,'get').mockImplementation(async url=>({contentVersionId:2,questionCount:1,presentations:[{definitionId:'flashcards',contentVersionId:2,status:String(url).includes('teacher-led')?'ready':'unavailable',compatibleItemRefs:[{questionId:1,contentVersionId:2}],excludedItemRefs:[]}]}))
 const changed=vi.fn(),ready=vi.fn()
 render(<QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><PresentationPicker activityId={1} context="live" disabled={false} onChange={changed} onReadyChange={ready}/></QueryClientProvider>)
 const radio=await screen.findByRole<HTMLInputElement>('radio',{name:/Flashcards/})
 expect(radio.disabled).toBe(false)
 await userEvent.click(radio)
 await waitFor(()=>expect(changed).toHaveBeenLastCalledWith(expect.objectContaining({definitionId:'flashcards',config:expect.objectContaining({context:'teacher-led',semantics:'self-rated',revealPolicy:'host'})})))
})
it('gives the compatibility status the full card width so long labels stay inside the card',async()=>{
 vi.spyOn(api,'get').mockResolvedValue({contentVersionId:2,questionCount:4,presentations:[{definitionId:'flashcards',contentVersionId:2,status:'ready',compatibleItemRefs:[{questionId:1,contentVersionId:2},{questionId:2,contentVersionId:2},{questionId:3,contentVersionId:2},{questionId:4,contentVersionId:2}],excludedItemRefs:[]}]})
 render(<QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><PresentationPicker activityId={1} context="live" disabled={false} onChange={vi.fn()} onReadyChange={vi.fn()}/></QueryClientProvider>)
 const radio=await screen.findByRole<HTMLInputElement>('radio',{name:/Flashcards/})
 expect(radio.disabled).toBe(false)
 const status=screen.getByText('Ready · all 4 questions · Teacher-led')
 expect(status.parentElement).toBe(radio.closest('label'))
})
it('blocks launch until the instructor explicitly accepts a compatible subset',async()=>{
 vi.spyOn(api,'get').mockResolvedValue({contentVersionId:2,questionCount:2,presentations:[{definitionId:'flashcards',contentVersionId:2,status:'requires-subset',compatibleItemRefs:[{questionId:1,contentVersionId:2}],excludedItemRefs:[{questionId:2,contentVersionId:2}]}]})
 const changed=vi.fn(),ready=vi.fn()
 render(<QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><PresentationPicker activityId={1} disabled={false} onChange={changed} onReadyChange={ready}/></QueryClientProvider>)
 const radio=await screen.findByRole<HTMLInputElement>('radio',{name:/Flashcards/})
 expect(radio.disabled).toBe(false)
 await userEvent.click(radio)
 await waitFor(()=>expect(ready).toHaveBeenLastCalledWith(false))
 expect(changed).toHaveBeenLastCalledWith(null)
 await userEvent.click(screen.getByRole('checkbox',{name:/Use only 1 compatible/}))
 await waitFor(()=>expect(ready).toHaveBeenLastCalledWith(true))
 expect(changed).toHaveBeenLastCalledWith(expect.objectContaining({definitionId:'flashcards',selectedQuestionIds:[1]}))
})

/*
 * WHAT THE CARD SAYS BEFORE IT IS SELECTED.
 *
 * Every assertion below is about the grid itself. The explanation panels under
 * it were already correct — they list the dropped questions, the reason for
 * each and a link to fix them, and they hold the consent checkbox that gates
 * launch. What was missing is that the card gave no sign any of that was
 * waiting, and coloured its badge by which format it was rather than by
 * whether it could run.
 */
const view=(presentations:unknown[],questionCount=5)=>({contentVersionId:2,questionCount,presentations})
const show=(context:'live'|'practice'='live',props:Record<string,unknown>={})=>render(
 <QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}>
  <PresentationPicker activityId={7} context={context} disabled={false} onChange={vi.fn()} onReadyChange={vi.fn()} {...props}/>
 </QueryClientProvider>)
const cardFor=(name:RegExp|string)=>screen.getByRole<HTMLInputElement>('radio',{name}).closest('label')!

it('names the decision a partly-compatible format is waiting for, instead of a bare fraction',async()=>{
 vi.spyOn(api,'get').mockResolvedValue(view([{definitionId:'question-wheel',contentVersionId:2,status:'requires-subset',compatibleItemRefs:[1,2,3,4].map(questionId=>({questionId,contentVersionId:2})),excludedItemRefs:[{questionId:5,contentVersionId:2,reason:'native-pairs-required'}]}]))
 show()
 await waitFor(()=>expect(cardFor(/Question wheel/).dataset.state).toBe('requires-subset'))
 expect(screen.getByText('4 of 5 · needs your approval')).toBeTruthy()
 expect(screen.queryByText(/compatible$/)).toBeNull()
})

it('tells an unavailable format what it is missing on the card, not only after it is selected',async()=>{
 vi.spyOn(api,'get').mockResolvedValue(view([
  {definitionId:'match-up',contentVersionId:2,status:'unavailable',compatibleItemRefs:[],excludedItemRefs:[],reasons:['native-pairs-required']},
  {definitionId:'sequence',contentVersionId:2,status:'unavailable',compatibleItemRefs:[],excludedItemRefs:[{questionId:1,contentVersionId:2,reason:'native-sequence-required'}]},
  {definitionId:'group-sort',contentVersionId:2,status:'unavailable',compatibleItemRefs:[],excludedItemRefs:[],reasons:['native-groups-required']},
  {definitionId:'sentence-completion',contentVersionId:2,status:'unavailable',compatibleItemRefs:[],excludedItemRefs:[],reasons:['native-blanks-required']},
 ]))
 show()
 await waitFor(()=>expect(screen.getByText('Needs matching pairs')).toBeTruthy())
 expect(screen.getByText('Needs ordered steps')).toBeTruthy()          // read from the excluded item, not only from reasons
 expect(screen.getByText('Needs items and groups')).toBeTruthy()
 expect(screen.getByText('Needs a passage with blanks')).toBeTruthy()
 expect(screen.queryByText('Needs compatible content')).toBeNull()
})

it('carries the status in the state attribute the palette reads, so one colour means one thing',async()=>{
 vi.spyOn(api,'get').mockResolvedValue(view([
  {definitionId:'question-wheel',contentVersionId:2,status:'ready',compatibleItemRefs:[1,2,3,4,5].map(questionId=>({questionId,contentVersionId:2})),excludedItemRefs:[]},
  {definitionId:'open-box',contentVersionId:2,status:'requires-subset',compatibleItemRefs:[{questionId:1,contentVersionId:2}],excludedItemRefs:[{questionId:2,contentVersionId:2,reason:'native-pairs-required'}]},
  {definitionId:'match-up',contentVersionId:2,status:'unavailable',compatibleItemRefs:[],excludedItemRefs:[],reasons:['native-pairs-required']},
 ]))
 show()
 await waitFor(()=>expect(cardFor(/Question wheel/).dataset.state).toBe('ready'))
 // Two formats that are equally ready must not differ, and two that differ must not match.
 expect(cardFor('Questions in order').dataset.state).toBe('ready')
 expect(cardFor(/Open the box/).dataset.state).toBe('requires-subset')
 expect(cardFor(/Match up/).dataset.state).toBe('unavailable')
 expect(cardFor(/Question wheel/).dataset.tone).not.toBe(cardFor('Questions in order').dataset.tone)
})

it('puts the formats that can run first and folds the ones that cannot behind a count',async()=>{
 vi.spyOn(api,'get').mockResolvedValue(view([
  {definitionId:'match-up',contentVersionId:2,status:'unavailable',compatibleItemRefs:[],excludedItemRefs:[],reasons:['native-pairs-required']},
  {definitionId:'memory',contentVersionId:2,status:'unavailable',compatibleItemRefs:[],excludedItemRefs:[],reasons:['native-pairs-required']},
  {definitionId:'question-wheel',contentVersionId:2,status:'ready',compatibleItemRefs:[{questionId:1,contentVersionId:2}],excludedItemRefs:[]},
 ]))
 show()
 const fold=await screen.findByText(/Formats that need other content/)
 const details=fold.closest('details')!
 // The count is the promise the summary makes: it must equal what is inside.
 expect(fold.textContent).toContain(`(${details.querySelectorAll('input[type=radio]').length})`)
 expect(details.open).toBe(false)
 expect(details.contains(cardFor(/Match up/))).toBe(true)
 expect(details.contains(cardFor(/Question wheel/))).toBe(false)
 // Still reachable, and opening it is one click.
 await userEvent.click(fold)
 expect(details.open).toBe(true)
})

it('opens the fold by itself when the selected format is inside it',async()=>{
 vi.spyOn(api,'get').mockResolvedValue(view([
  {definitionId:'match-up',contentVersionId:2,status:'unavailable',compatibleItemRefs:[],excludedItemRefs:[],reasons:['native-pairs-required']},
  {definitionId:'question-wheel',contentVersionId:2,status:'ready',compatibleItemRefs:[{questionId:1,contentVersionId:2}],excludedItemRefs:[]},
 ]))
 show()
 const fold=await screen.findByText(/Formats that need other content/)
 await userEvent.click(screen.getByRole('radio',{name:/Match up/}))
 expect(fold.closest('details')!.open).toBe(true)
 expect(screen.getByText('Add reviewed matching pairs to use this format.')).toBeTruthy()
})

it('stops repeating the delivery mode already chosen, and keeps the label that contradicts it',async()=>{
 vi.spyOn(api,'get').mockImplementation(async url=>view([
  {definitionId:'question-wheel',contentVersionId:2,status:'ready',compatibleItemRefs:[{questionId:1,contentVersionId:2}],excludedItemRefs:[]},
  {definitionId:'flashcards',contentVersionId:2,status:String(url).includes('teacher-led')?'ready':'unavailable',compatibleItemRefs:[{questionId:1,contentVersionId:2}],excludedItemRefs:[],reasons:['native-pairs-required']},
 ],1))
 show('live')
 await waitFor(()=>expect(cardFor(/Question wheel/).dataset.state).toBe('ready'))
 expect(cardFor(/Question wheel/).textContent).not.toContain('Live')      // step 1 already said so
 expect(cardFor(/Flashcards/).textContent).toContain('Teacher-led')       // this one differs from step 1
})

it('draws no card until compatibility is known, so nothing moves under the pointer',async()=>{
 let answer=(_value:unknown)=>{}
 vi.spyOn(api,'get').mockImplementation(()=>new Promise(resolve=>{answer=resolve}))
 show('practice')   // one compatibility request, so the test controls exactly when it answers
 expect(screen.queryAllByRole('radio')).toHaveLength(0)
 expect(screen.getByText('Checking your approved questions…')).toBeTruthy()
 answer(view([{definitionId:'question-wheel',contentVersionId:2,status:'ready',compatibleItemRefs:[{questionId:1,contentVersionId:2}],excludedItemRefs:[]}],5))
 // Once drawn, a card keeps the node it was drawn with: a moved card is a new
 // element, and the browser's focus does not follow it.
 const wheel=await screen.findByRole('radio',{name:/Question wheel/})
 expect(screen.getByText('Ready · all 5 questions')).toBeTruthy()
 await new Promise(resolve=>setTimeout(resolve,50))
 expect(screen.getByRole('radio',{name:/Question wheel/})).toBe(wheel)
})

it('never leaves a format the server did not report sitting under a status that cannot resolve',async()=>{
 vi.spyOn(api,'get').mockResolvedValue(view([{definitionId:'question-wheel',contentVersionId:2,status:'ready',compatibleItemRefs:[{questionId:1,contentVersionId:2}],excludedItemRefs:[]}],5))
 show('practice')   // Crossword is a practice format
 const missing=await screen.findByRole<HTMLInputElement>('radio',{name:/Crossword/})
 expect(missing.disabled).toBe(true)
 expect(cardFor(/Crossword/).textContent).toContain('Not available yet')
 expect(cardFor(/Crossword/).dataset.state).toBe('unavailable')
 expect(screen.queryByText('Loading…')).toBeNull()
})

it('says the same three things in Arabic, including what each blocked format needs',async()=>{
 interfaceLanguage.value='ar'
 vi.spyOn(api,'get').mockResolvedValue(view([
  {definitionId:'question-wheel',contentVersionId:2,status:'ready',compatibleItemRefs:[1,2,3,4,5].map(questionId=>({questionId,contentVersionId:2})),excludedItemRefs:[]},
  {definitionId:'open-box',contentVersionId:2,status:'requires-subset',compatibleItemRefs:[{questionId:1,contentVersionId:2}],excludedItemRefs:[{questionId:2,contentVersionId:2,reason:'native-blanks-required'}]},
  {definitionId:'match-up',contentVersionId:2,status:'unavailable',compatibleItemRefs:[],excludedItemRefs:[],reasons:['native-pairs-required']},
 ]))
 show()
 // Both ready formats read identically — that is the point of a state badge.
 await waitFor(()=>expect(screen.getAllByText('جاهز · كل الأسئلة (5)')).toHaveLength(2))
 expect(screen.getByText('1 من 5 · يحتاج موافقتك')).toBeTruthy()
 expect(screen.getByText('يحتاج أزواج مطابقة')).toBeTruthy()
 expect(screen.getByText(/قوالب تحتاج محتوى من نوع آخر/)).toBeTruthy()
 expect(screen.queryByText(/compatible|Ready|Needs/)).toBeNull()
})

it('reads in decision order: what can run, then what is asking, then the fold',async()=>{
 // Flashcards comes before Open the box in the catalogue, so catalogue order
 // and decision order disagree here — which is the only way to see the sort.
 vi.spyOn(api,'get').mockResolvedValue(view([
  {definitionId:'flashcards',contentVersionId:2,status:'requires-subset',compatibleItemRefs:[{questionId:1,contentVersionId:2}],excludedItemRefs:[{questionId:2,contentVersionId:2,reason:'native-pairs-required'}]},
  {definitionId:'open-box',contentVersionId:2,status:'ready',compatibleItemRefs:[{questionId:1,contentVersionId:2},{questionId:2,contentVersionId:2}],excludedItemRefs:[]},
 ],2))
 show('practice')
 await screen.findByRole('radio',{name:/Open the box/})
 const grid=screen.getAllByRole('radio').filter(radio=>!radio.closest('details')).map(radio=>radio.getAttribute('aria-label'))
 expect(grid).toEqual(['Questions in order','Open the box','Flashcards'])
})

it('has words for every reason the compatibility engine can emit',async()=>{
 // The engine's vocabulary, from compatibility.ts. A code with no text falls
 // back to "requires a different content shape", which is what the teacher was
 // reading instead of the reason the server had already worked out.
 const engine=['incompatible-content','unsupported-context','native-pairs-required','ambiguous-labels','native-groups-required','native-sequence-required','native-blanks-required','native-vocabulary-required','authored-board-required','reference-response-required','participant-content-required','unknown-question','no-compatible-content']
 for(const reason of engine){
  vi.spyOn(api,'get').mockResolvedValue(view([{definitionId:'match-up',contentVersionId:2,status:'unavailable',compatibleItemRefs:[],excludedItemRefs:[],reasons:[reason]}]))
  show('practice')
  await userEvent.click(await screen.findByRole('radio',{name:/Match up/}))
  const panel=screen.getByRole('status')
  expect(panel.querySelectorAll('li')).toHaveLength(1)
  expect(panel.querySelector('li')!.textContent!.length,`no text for ${reason}`).toBeGreaterThan(20)
  cleanup();vi.restoreAllMocks()
 }
})
