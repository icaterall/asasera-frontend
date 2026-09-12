import {afterEach,beforeAll,beforeEach,expect,test,vi} from 'vitest'
import {cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react'
import {createInstance} from 'i18next'
import {I18nextProvider} from 'react-i18next'
import {ImageCreator} from '../src/features/editor/ImageCreator'
import {api} from '../src/lib/api'
const language=createInstance(),quote={quoteToken:'signed-test-quote',model:'test-model',estimateAiCredits:40,maxAiCredits:60,affordable:true,expiresAt:'2999-01-01T00:00:00Z'}
beforeAll(async()=>{await language.init({lng:'en',resources:{en:{translation:{}}},interpolation:{escapeValue:false}});HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','')};HTMLDialogElement.prototype.close=function(){this.removeAttribute('open')}})
beforeEach(()=>{sessionStorage.clear();vi.spyOn(api,'post').mockImplementation(async path=>{if(path.endsWith('/quote'))return quote;throw new Error('Response lost')})})
afterEach(()=>{cleanup();vi.restoreAllMocks()})
function show(){return render(<I18nextProvider i18n={language}><ImageCreator activityId={1} questionId={2} onPrepare={async()=>{}} onImage={vi.fn()} onClose={vi.fn()}/></I18nextProvider>)}
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
