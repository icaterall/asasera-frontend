import {afterEach,beforeAll,expect,it,vi} from 'vitest'
import {act,cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {createInstance} from 'i18next'
import {I18nextProvider} from 'react-i18next'
import {QueryClient,QueryClientProvider} from '@tanstack/react-query'
import {MemoryRouter} from 'react-router-dom'
import AdminAiSettings from '../src/features/admin/AdminAiSettings'
import {aiAdministration,type AiModelPrice,type AiSettings} from '../src/features/admin/api'
import {ApiError} from '../src/lib/api'
import {en,ar} from '../src/i18n/locales/adminAi'
const auth=vi.hoisted(()=>({user:{id:7,role:'admin'}}))
vi.mock('@/hooks/useAuth',()=>({useAuth:()=>auth}))
const language=createInstance()
const textPrice:AiModelPrice={catalogVersion:'2026-09-11-standard',currency:'USD',serviceTier:'standard',lifecycle:'stable',verifiedAt:'2026-09-11',source:'https://example.test/openai',components:[{kind:'input_text',amountMillicents:25_000},{kind:'output_text',amountMillicents:200_000}]}
const geminiTextPrice:AiModelPrice={...textPrice,source:'https://example.test/gemini',components:[{kind:'input_text',amountMillicents:30_000},{kind:'output_text',amountMillicents:250_000}]}
const imagePrice:AiModelPrice={...textPrice,lifecycle:'deprecated',components:[{kind:'input_text',amountMillicents:500_000},{kind:'output_image',amountMillicents:4_000_000}],imageOutputReferences:[{size:'1024 × 1024',quality:'low',amountMillicents:1_100},{size:'1024 × 1024',quality:'high',amountMillicents:16_700}]}
const geminiImagePrice:AiModelPrice={...textPrice,components:[{kind:'input_text_or_image',amountMillicents:50_000},{kind:'output_image',amountMillicents:6_000_000}],imageOutputReferences:[{size:'1K',quality:null,amountMillicents:6_700}]}
const audioPrice:AiModelPrice={...textPrice,components:[{kind:'input_text',amountMillicents:60_000},{kind:'output_audio',amountMillicents:1_200_000}]}
const geminiAudioPrice:AiModelPrice={...textPrice,lifecycle:'preview',components:[{kind:'input_text',amountMillicents:100_000},{kind:'output_audio',amountMillicents:2_000_000}]}
const capabilities:NonNullable<AiSettings['capabilities']>=[
 {id:'pdf_questions',status:'available',provider:'openai',model:'gpt-5-mini'},
 {id:'image_review',status:'available',provider:'openai + gemini',model:'omni-moderation-latest + gemini-2.5-flash-lite'},
 {id:'image_generation',status:'configured_pending',provider:'openai',model:'gpt-image-1'},
 {id:'audio_generation',status:'configured_pending',provider:'gemini',model:'gemini-2.5-pro-preview-tts'},
]
const routes:NonNullable<AiSettings['routes']>=[
 {capability:'pdf_questions',version:1,provider:'openai',model:'gpt-5-mini',enabled:true,configured:true,execution:'active'},
 {capability:'image_generation',version:1,provider:'openai',model:'gpt-image-1',enabled:true,configured:true,execution:'pending'},
 {capability:'audio_generation',version:1,provider:'gemini',model:'gemini-2.5-pro-preview-tts',enabled:true,configured:true,execution:'pending'},
]
const settings:AiSettings={policy:{version:1,provider:'openai',model:'gpt-5-mini',enabled:true},ready:true,history:[],capabilities,routes,routeModels:{
 pdf_questions:[{provider:'openai',id:'gpt-5-mini',configured:true,price:textPrice},{provider:'gemini',id:'gemini-2.5-flash',configured:true,price:geminiTextPrice}],
 image_generation:[{provider:'openai',id:'gpt-image-1',configured:true,price:imagePrice},{provider:'gemini',id:'gemini-3.1-flash-image',configured:true,price:geminiImagePrice}],
 audio_generation:[{provider:'openai',id:'gpt-4o-mini-tts',configured:true,price:audioPrice},{provider:'gemini',id:'gemini-2.5-pro-preview-tts',configured:true,price:geminiAudioPrice}],
},models:[
 {provider:'openai',id:'gpt-5-mini',configured:true,structuredOutput:true,pricingAvailable:true,price:textPrice},
 {provider:'gemini',id:'gemini-2.5-flash',configured:true,structuredOutput:true,pricingAvailable:true,price:geminiTextPrice},
],modelCatalog:{providers:[{provider:'openai',status:'not_fetched',modelCount:0,fetchedAt:null},{provider:'gemini',status:'not_fetched',modelCount:0,fetchedAt:null}],candidates:[]}}
function show(){const client=new QueryClient({defaultOptions:{queries:{retry:false,gcTime:0}}});render(<I18nextProvider i18n={language}><QueryClientProvider client={client}><MemoryRouter><AdminAiSettings/></MemoryRouter></QueryClientProvider></I18nextProvider>);return client}
beforeAll(async()=>{await language.init({lng:'en',resources:{en:{adminAi:en},ar:{adminAi:ar}}});vi.stubGlobal('ResizeObserver',class{observe(){}disconnect(){}unobserve(){}});vi.stubGlobal('matchMedia',()=>({matches:false,addEventListener(){},removeEventListener(){}}))})
afterEach(()=>{cleanup();vi.restoreAllMocks();auth.user.role='admin'})
it('saves a selected registry model with concurrency version, updates from server and prevents double clicks',async()=>{
 vi.spyOn(aiAdministration,'get').mockResolvedValue(settings)
 let resolve!:(value:AiSettings)=>void
 const save=vi.spyOn(aiAdministration,'save').mockImplementation(()=>new Promise(done=>{resolve=done}))
 show();await screen.findByText('AI capability status')
 await screen.findByRole('combobox',{name:'Provider'})
 const user=userEvent.setup();await user.click(screen.getByRole('combobox',{name:'Provider'}));await user.click(screen.getByRole('option',{name:'Gemini'}))
 expect(await screen.findByText('$0.30 / 1M tokens')).toBeTruthy()
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
it('handles a settings response from an older backend that has no capability list',async()=>{
 vi.spyOn(aiAdministration,'get').mockResolvedValue({...settings,capabilities:undefined} as unknown as AiSettings)
 show()
 await screen.findByRole('heading',{name:'AI routes'})
 expect(await screen.findByText('AI capability status')).toBeTruthy()
})
it('shows the selected model’s traceable rates and image-output cost references',async()=>{
 vi.spyOn(aiAdministration,'get').mockResolvedValue(settings)
 show();await screen.findAllByText('Current reference price')
 expect(screen.getByText('$0.25 / 1M tokens')).toBeTruthy()
 expect(screen.getByText('Image-output reference')).toBeTruthy()
 expect(screen.getByText('$0.011 / image')).toBeTruthy()
 expect(screen.getByText('Deprecated')).toBeTruthy()
})
it('fetches provider model IDs into the reviewed catalog without changing a route',async()=>{
 vi.spyOn(aiAdministration,'get').mockResolvedValue(settings)
 const refresh=vi.spyOn(aiAdministration,'refreshModelCatalog').mockResolvedValue({...settings,modelCatalog:{providers:[{provider:'openai',status:'updated',modelCount:2,fetchedAt:'2026-09-11T12:00:00.000Z'},{provider:'gemini',status:'updated',modelCount:1,fetchedAt:'2026-09-11T12:00:00.000Z'}],candidates:[{provider:'openai',id:'gpt-next',firstSeenAt:'2026-09-11T12:00:00.000Z',lastSeenAt:'2026-09-11T12:00:00.000Z',verification:'needs_verification'}]}})
 show();await screen.findByRole('heading',{name:'Provider model catalog'})
 fireEvent.click(screen.getByRole('button',{name:'Fetch latest models'}))
 await waitFor(()=>expect(refresh).toHaveBeenCalledTimes(1))
 expect(await screen.findByText('Provider model catalog updated.')).toBeTruthy()
 expect(screen.getByText('gpt-next')).toBeTruthy()
 expect(screen.getByText('Needs price and capability verification')).toBeTruthy()
})
it('saves the selected image-generation model as its own administrator route',async()=>{
 vi.spyOn(aiAdministration,'get').mockResolvedValue(settings)
 const save=vi.spyOn(aiAdministration,'saveRoute').mockResolvedValue({...settings,routes:settings.routes!.map(route=>route.capability==='image_generation'?{...route,enabled:false,version:2}:route)})
 show();await screen.findByRole('heading',{name:'AI routes'})
 expect(await screen.findByText('Generation route settings')).toBeTruthy()
 fireEvent.click(screen.getByRole('checkbox',{name:'Enable Image generation'}))
 fireEvent.click(screen.getByRole('button',{name:'Save Image generation settings'}))
 await waitFor(()=>expect(save).toHaveBeenCalledWith('image_generation',{provider:'openai',model:'gpt-image-1',enabled:false,expectedVersion:1}))
})
it('labels a saved but disabled media route as paused instead of unavailable',async()=>{
 vi.spyOn(aiAdministration,'get').mockResolvedValue({...settings,capabilities:capabilities.map(capability=>capability.id==='image_generation'?{...capability,status:'paused' as const}:capability),routes:routes.map(route=>route.capability==='image_generation'?{...route,enabled:false}:route)})
 show();await screen.findByText('AI capability status')
 expect(screen.getAllByText('Paused').length).toBeGreaterThanOrEqual(2)
 expect(screen.queryByText('Not available')).toBeNull()
})
it('blocks enabling an unready model while allowing a pause',async()=>{
 vi.spyOn(aiAdministration,'get').mockResolvedValue({...settings,ready:false,policy:{...settings.policy,enabled:false},models:settings.models.map(m=>({...m,configured:false}))})
 show();await screen.findByLabelText('Enable question generation');fireEvent.click(screen.getByLabelText('Enable question generation'))
 await waitFor(()=>expect(screen.getByRole('button',{name:'Save settings'}).hasAttribute('disabled')).toBe(true))
 expect(screen.getByText(/Generation is unavailable/)).toBeTruthy()
})
