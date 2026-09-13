import {afterEach,beforeAll,beforeEach,expect,test,vi} from 'vitest'
import {cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react'
import {createInstance} from 'i18next'
import {I18nextProvider} from 'react-i18next'
import {QueryClient,QueryClientProvider} from '@tanstack/react-query'
import {ImageCreator} from '../src/features/editor/ImageCreator'
import {api} from '../src/lib/api'
/* imageQuality and outputTokens are always present on a real quote (see
   image-creation.service.ts: the quote object always carries both, with
   outputTokens null when the model has no reference). Omitting them made the
   dialog throw on undefined.toLocaleString and render nothing. */
const language=createInstance(),quote={quoteToken:'signed-test-quote',model:'test-model',imageQuality:'medium' as const,outputTokens:1056,estimateAiCredits:40,maxAiCredits:60,affordable:true,expiresAt:'2999-01-01T00:00:00Z'}
beforeAll(async()=>{await language.init({lng:'en',resources:{en:{translation:{}}},interpolation:{escapeValue:false}});HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','')};HTMLDialogElement.prototype.close=function(){this.removeAttribute('open')}})
const preferences={imageQuality:'low',effectiveImageQuality:'low',qualitySelectable:true,choices:['low','medium','high'].map(quality=>({quality,allowed:true,outputTokens:625,amountMillicents:100}))}
beforeEach(()=>{sessionStorage.clear();vi.spyOn(api,'get').mockResolvedValue(preferences);vi.spyOn(api,'post').mockImplementation(async path=>{if(path.endsWith('/quote'))return quote;throw new Error('Response lost')})})
afterEach(()=>{cleanup();vi.restoreAllMocks()})
function show(){return render(<QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><I18nextProvider i18n={language}><ImageCreator activityId={1} questionId={2} onPrepare={async()=>{}} onImage={vi.fn()} onClose={vi.fn()}/></I18nextProvider></QueryClientProvider>)}
test('estimating never submits a paid job, and clearing a prompt stops the pending estimate',async()=>{
 show();fireEvent.change(screen.getByRole('textbox'),{target:{value:'Flower diagram'}})
 await waitFor(()=>expect((screen.getByRole('button',{name:'Generate image'}) as HTMLButtonElement).disabled).toBe(false))
 expect(vi.mocked(api.post).mock.calls.filter(([p])=>p.endsWith('/jobs'))).toHaveLength(0)
 fireEvent.change(screen.getByRole('textbox'),{target:{value:''}})
 expect(screen.queryByText('Estimating cost…')).toBeNull()
 expect((screen.getByRole('button',{name:'Generate image'}) as HTMLButtonElement).disabled).toBe(true)
})
test('lost responses freeze the approved request and retry the identical key after reopening',async()=>{
 const view=show();fireEvent.change(screen.getByRole('textbox'),{target:{value:'Flower diagram'}})
 await waitFor(()=>expect((screen.getByRole('button',{name:'Generate image'}) as HTMLButtonElement).disabled).toBe(false))
 fireEvent.click(screen.getByRole('button',{name:'Generate image'}))
 await screen.findByRole('alert');expect((screen.getByRole('textbox') as HTMLTextAreaElement).disabled).toBe(true)
 const first=vi.mocked(api.post).mock.calls.find(([p])=>p.endsWith('/jobs'))![1]
 view.unmount();show();fireEvent.click(screen.getByRole('button',{name:'Resume request'}))
 await waitFor(()=>expect(vi.mocked(api.post).mock.calls.filter(([p])=>p.endsWith('/jobs'))).toHaveLength(2))
 expect(vi.mocked(api.post).mock.calls.filter(([p])=>p.endsWith('/jobs'))[1]![1]).toEqual(first)
})
test('quality changes invalidate the old quote and block paid submission until the choice is saved',async()=>{
 let finish!:(value:unknown)=>void
 vi.spyOn(api,'put').mockImplementation(()=>new Promise(resolve=>{finish=resolve}))
 show();fireEvent.change(screen.getByRole('textbox'),{target:{value:'Flower diagram'}})
 const button=screen.getByRole('button',{name:'Generate image'}) as HTMLButtonElement
 await waitFor(()=>expect(button.disabled).toBe(false))
 fireEvent.click(screen.getByRole('radio',{name:/^High/}))
 expect(button.disabled).toBe(true)
 expect(screen.queryByText(/Estimated balance cost:/)).toBeNull()
 finish({...preferences,imageQuality:'high',effectiveImageQuality:'high'})
 await waitFor(()=>expect(button.disabled).toBe(false))
 expect(api.put).toHaveBeenCalledWith('/api/v1/activity-media/preferences',{imageQuality:'high'})
 expect(vi.mocked(api.post).mock.calls.filter(([path])=>path.endsWith('/jobs'))).toHaveLength(0)
})
