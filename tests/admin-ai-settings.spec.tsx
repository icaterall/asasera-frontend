import {afterEach,beforeAll,expect,it,vi} from 'vitest'
import {act,cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {createInstance} from 'i18next'
import {I18nextProvider} from 'react-i18next'
import {QueryClient,QueryClientProvider} from '@tanstack/react-query'
import {MemoryRouter} from 'react-router-dom'
import AdminAiSettings from '../src/features/admin/AdminAiSettings'
import {aiAdministration,type AiSettings} from '../src/features/admin/api'
import {ApiError} from '../src/lib/api'
import {en,ar} from '../src/i18n/locales/adminAi'
const auth=vi.hoisted(()=>({user:{id:7,role:'admin'}}))
vi.mock('@/hooks/useAuth',()=>({useAuth:()=>auth}))
const language=createInstance()
const settings:AiSettings={policy:{version:1,provider:'openai',model:'gpt-5-mini',enabled:true},ready:true,history:[],models:[
 {provider:'openai',id:'gpt-5-mini',configured:true,structuredOutput:true,pricingAvailable:true},
 {provider:'gemini',id:'gemini-2.5-flash',configured:true,structuredOutput:true,pricingAvailable:true},
]}
function show(){const client=new QueryClient({defaultOptions:{queries:{retry:false,gcTime:0}}});render(<I18nextProvider i18n={language}><QueryClientProvider client={client}><MemoryRouter><AdminAiSettings/></MemoryRouter></QueryClientProvider></I18nextProvider>);return client}
beforeAll(async()=>{await language.init({lng:'en',resources:{en:{adminAi:en},ar:{adminAi:ar}}});vi.stubGlobal('ResizeObserver',class{observe(){}disconnect(){}unobserve(){}});vi.stubGlobal('matchMedia',()=>({matches:false,addEventListener(){},removeEventListener(){}}))})
afterEach(()=>{cleanup();vi.restoreAllMocks();auth.user.role='admin'})
it('saves a selected registry model with concurrency version, updates from server and prevents double clicks',async()=>{
 vi.spyOn(aiAdministration,'get').mockResolvedValue(settings)
 let resolve!:(value:AiSettings)=>void
 const save=vi.spyOn(aiAdministration,'save').mockImplementation(()=>new Promise(done=>{resolve=done}))
 show();await screen.findByRole('heading',{name:'AI settings'})
 await screen.findByRole('combobox',{name:'Provider'})
 const user=userEvent.setup();await user.click(screen.getByRole('combobox',{name:'Provider'}));await user.click(screen.getByRole('option',{name:'Gemini'}))
 const button=screen.getByRole('button',{name:'Save settings'});fireEvent.click(button);fireEvent.click(button)
 expect(save).toHaveBeenCalledTimes(1);expect(save).toHaveBeenCalledWith({provider:'gemini',model:'gemini-2.5-flash',enabled:true,expectedVersion:1})
 expect(button.hasAttribute('disabled')).toBe(true)
 await act(async()=>resolve({...settings,policy:{version:2,provider:'gemini',model:'gemini-2.5-flash',enabled:true}}))
 await screen.findByText('AI settings saved.')
 expect(screen.getByRole('button',{name:'Save settings'}).hasAttribute('disabled')).toBe(true)
})
it('requires reloading a conflicting configuration before another write',async()=>{
 vi.spyOn(aiAdministration,'get').mockResolvedValue(settings)
 const save=vi.spyOn(aiAdministration,'save').mockRejectedValue(new ApiError(409,'policy_conflict','internal detail'))
 show();await screen.findByLabelText('Enable question generation');fireEvent.click(screen.getByLabelText('Enable question generation'));fireEvent.click(screen.getByRole('button',{name:'Save settings'}))
 await screen.findByText(/Another administrator changed/);expect(screen.queryByText('internal detail')).toBeNull();expect(save).toHaveBeenCalledTimes(1)
 expect(screen.getByRole('button',{name:'Save settings'}).hasAttribute('disabled')).toBe(true)
 expect(screen.getByRole('button',{name:'Reload saved settings'})).toBeTruthy()
})
it('does not request admin settings for a teacher',async()=>{auth.user.role='teacher';const get=vi.spyOn(aiAdministration,'get');show();await act(async()=>{});expect(get).not.toHaveBeenCalled()})
it('blocks enabling an unready model while allowing a pause',async()=>{
 vi.spyOn(aiAdministration,'get').mockResolvedValue({...settings,ready:false,policy:{...settings.policy,enabled:false},models:settings.models.map(m=>({...m,configured:false}))})
 show();await screen.findByLabelText('Enable question generation');fireEvent.click(screen.getByLabelText('Enable question generation'))
 await waitFor(()=>expect(screen.getByRole('button',{name:'Save settings'}).hasAttribute('disabled')).toBe(true))
 expect(screen.getByText(/Generation is unavailable/)).toBeTruthy()
})
