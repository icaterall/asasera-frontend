import {afterEach,expect,it,vi} from 'vitest'
import {cleanup,render,screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {useState} from 'react'
import {QueryClient,QueryClientProvider} from '@tanstack/react-query'
import {LiveRulesSetup} from '../src/features/presentations/LiveRulesSetup'
import {liveRulesSchema} from '../src/shared/live-rules'
import type {PresentationSelection} from '../src/shared/presentation'
import {api} from '../src/lib/api'

vi.mock('react-i18next',()=>({useTranslation:()=>({i18n:{language:'en'}})}))
afterEach(()=>{cleanup();vi.restoreAllMocks()})

const selection:PresentationSelection={
 definitionId:'question-wheel',definitionVersion:1,adapterVersion:1,contentVersionId:2,selectedQuestionIds:[1],
 config:{context:'live',semantics:'scored',noRepeat:true,revealPolicy:'host'},
}

it('keeps advanced live settings collapsed behind a plain-language summary',async()=>{
 vi.spyOn(api,'get').mockResolvedValue({items:[]})
 render(<QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><LiveRulesSetup activityId={1} selection={selection} rules={liveRulesSchema.parse({})} disabled={false} onChange={vi.fn()} onSemantics={vi.fn()}/></QueryClientProvider>)
 const summary=screen.getByText('Customize live game').closest('summary')!
 expect(summary.parentElement?.hasAttribute('open')).toBe(false)
 expect(screen.getByText(/Optional — change scoring, timing, hints, or bonus points/)).toBeTruthy()
 await userEvent.click(summary)
 expect(summary.parentElement?.hasAttribute('open')).toBe(true)
 expect((screen.getByRole('checkbox',{name:/Score learner answers/}) as HTMLInputElement).checked).toBe(true)
 expect(screen.queryByText('Ungraded practice instead of first-response assessment')).toBeNull()
})

it('reveals speed and thinking choices only after the instructor enables timers',async()=>{
 vi.spyOn(api,'get').mockResolvedValue({items:[]})
 function RulesHarness(){const [rules,setRules]=useState(()=>liveRulesSchema.parse({}));return <LiveRulesSetup activityId={1} selection={selection} rules={rules} disabled={false} onChange={setRules} onSemantics={vi.fn()}/>}
 render(<QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><RulesHarness/></QueryClientProvider>)
 await userEvent.click(screen.getByText('Customize live game').closest('summary')!)
 expect(screen.queryByRole('checkbox',{name:/Reward faster answers/})).toBeNull()
 await userEvent.click(screen.getByRole('checkbox',{name:/Use each question’s time limit/}))
 expect(screen.getByText('Custom settings')).toBeTruthy()
 expect(screen.getByRole('checkbox',{name:/Reward faster answers/})).toBeTruthy()
 expect(screen.getByRole('checkbox',{name:/Allow 15 extra thinking seconds/})).toBeTruthy()
})
