import {afterEach,beforeAll,beforeEach,expect,test,vi} from 'vitest'
import {cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react'
import {createInstance} from 'i18next'
import {I18nextProvider} from 'react-i18next'
import {ZoneSuggestions} from '../src/features/editor/ZoneSuggestions'
import {HotspotCanvas} from '../src/features/editor/HotspotCanvas'
import {api,type QuestionRecord} from '../src/lib/api'
import type {HotspotPayload} from '../src/shared/questions'
const language=createInstance(),storageKey='asasera:zone-suggestions:42:8'
const p:HotspotPayload={mode:'card_to_zone',imageKey:'new.png',zones:[{key:'manual',x:.1,y:.1,w:.2,h:.2,shape:'rect'}],cards:[{key:'c',text:'Stem'}],map:{c:'manual'}}
const question={id:8,revision:2,ordinal:1,kind:'hotspot',prompt:'Label the flower',mediaKey:p.imageKey,timeLimitS:20,payload:p} as QuestionRecord
const proposal={key:'ai',x:.4,y:.4,w:.2,h:.2,shape:'circle',label:'Petal',points:null}
const quote={quoteId:crypto.randomUUID(),quoteExpiresAt:'2999-01-01',estimateMillicents:10,maxAuthorizedMillicents:20,estimateAiCredits:10,maxAuthorizedAiCredits:20,usableAiCredits:900,creditPolicyVersion:1,creditUnit:'AI Credits',spendableMillicents:900,usableMillicents:900,allowanceMillicents:900,exposureMillicents:0,affordable:true,pricingAvailable:true,generationAvailable:true,grant:{trialMillicents:900,trialAiCredits:900,claimed:true,eligible:true,reason:null},delivery:'new answers'}
beforeAll(async()=>{await language.init({lng:'en',resources:{en:{translation:{}}},interpolation:{escapeValue:false}});HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','')};HTMLDialogElement.prototype.close=function(){this.removeAttribute('open')}})
beforeEach(()=>{sessionStorage.clear();vi.spyOn(api,'post').mockImplementation(async(path,body)=>path.endsWith('/resolve')?{url:`/${(body as {key:string}).key}`} :quote)})
afterEach(()=>{cleanup();vi.restoreAllMocks()})
function saved(){sessionStorage.setItem(storageKey,JSON.stringify({jobId:90,request:{task:'zones',activityId:42,questionId:8,expectedRevision:1,objective:'Flower',maxAuthorizedMillicents:20,idempotencyKey:crypto.randomUUID()}}))}
function show(){return render(<I18nextProvider i18n={language}><ZoneSuggestions activityId={42} question={question} imageUrl="/new.png" onPrepare={async()=>question} onApplied={async()=>{}} onClose={vi.fn()}/></I18nextProvider>)}
test('an empty completed result can request a new estimate without submitting another paid job',async()=>{
 saved();vi.spyOn(api,'get').mockResolvedValue({job:{id:90,state:'succeeded',imageKey:p.imageKey,result:{candidates:[],appliedIndexes:[],nextRevision:2}}})
 show();await screen.findByText(/There are no new usable areas/)
 fireEvent.click(screen.getByRole('button',{name:'Get a fresh estimate'}))
 await waitFor(()=>expect((screen.getByRole('button',{name:'Suggest with AI'}) as HTMLButtonElement).disabled).toBe(false))
 expect(sessionStorage.getItem(storageKey)).toBeNull();expect(vi.mocked(api.post).mock.calls.filter(([path])=>path.endsWith('/quote'))).toHaveLength(1)
 expect(vi.mocked(api.post).mock.calls.some(([path])=>path.endsWith('/jobs'))).toBe(false)
})
test('old-image suggestions are hidden and stale results can get a fresh quote',async()=>{
 saved();vi.spyOn(api,'get').mockResolvedValue({job:{id:90,state:'succeeded',imageKey:'old.png',result:{candidates:[proposal],appliedIndexes:[],nextRevision:1}}})
 show();await screen.findByText(/Old areas are hidden/)
 expect(screen.queryByText('Petal')).toBeNull();expect(document.querySelector('svg ellipse')).toBeNull()
 fireEvent.click(screen.getByRole('button',{name:'Get a fresh estimate'}))
 await waitFor(()=>expect((screen.getByRole('button',{name:'Suggest with AI'}) as HTMLButtonElement).disabled).toBe(false))
 expect(vi.mocked(api.post).mock.calls.find(([path])=>path.endsWith('/quote'))?.[1]).toMatchObject({expectedRevision:2,questionId:8})
})
test('pending requests retain their recovery record and cannot start a fresh request',async()=>{
 saved();const recovery=sessionStorage.getItem(storageKey);vi.spyOn(api,'get').mockResolvedValue({job:{id:90,state:'running',imageKey:'old.png',result:null}})
 show();await screen.findByText(/Finding visible parts/)
 expect(screen.queryByRole('button',{name:'Get a fresh estimate'})).toBeNull();expect(sessionStorage.getItem(storageKey)).toBe(recovery)
 expect(vi.mocked(api.post).mock.calls).toHaveLength(0)
})
test('an image failure clears when any replacement path supplies a new key',async()=>{
 const props={activityId:42,question,onChange:vi.fn(),onConfirm:vi.fn(),onPrepare:async()=>question,onApplied:async()=>{}}
 const view=render(<I18nextProvider i18n={language}><HotspotCanvas {...props} p={p}/></I18nextProvider>)
 const image=await screen.findByAltText('Question image');fireEvent.error(image)
 expect(screen.getByRole('alert').textContent).toContain('Could not load the image')
 view.rerender(<I18nextProvider i18n={language}><HotspotCanvas {...props} p={{...p,imageKey:'replacement.png'}}/></I18nextProvider>)
 await waitFor(()=>expect(screen.queryByRole('alert')).toBeNull())
 expect((await screen.findByAltText('Question image')).getAttribute('src')).toBe('/replacement.png')
})
