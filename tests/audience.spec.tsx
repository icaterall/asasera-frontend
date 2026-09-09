import {afterEach,beforeAll,describe,expect,it,vi} from 'vitest'
import {cleanup,render,screen,waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {createInstance} from 'i18next'
import {I18nextProvider} from 'react-i18next'
import {useState,type ReactNode} from 'react'
import {QueryClient,QueryClientProvider} from '@tanstack/react-query'
import {MultiSelect} from '../src/design/MultiSelect'
import {orderedCountries} from '../src/features/audience/countries'
import {useAudienceForm} from '../src/features/audience/useAudienceForm'
import {reference,type AudienceSelection,type CountryOption} from '../src/lib/api'
const language=createInstance()
beforeAll(async()=>{
 await language.init({lng:'en',resources:{en:{translation:{}},ar:{translation:{}}}})
 Element.prototype.scrollIntoView=vi.fn()
 vi.stubGlobal('ResizeObserver',class{observe(){}unobserve(){}disconnect(){}})
})
afterEach(()=>{cleanup();vi.restoreAllMocks();void language.changeLanguage('en')})
const show=(ui:ReactNode)=>render(<I18nextProvider i18n={language}>{ui}</I18nextProvider>)
function Stages({disabled=false}:{disabled?:boolean}){
 const [value,setValue]=useState<string[]>([])
 return <form aria-label="Audience"><MultiSelect label="Education stages" value={value} onValueChange={setValue} required disabled={disabled} placeholder="Choose stages">
  <option value="1" data-search-text="Primary ابتدائي">Primary school</option><option value="2">Secondary school</option><option value="3" disabled>Unavailable stage</option>
 </MultiSelect><button type="button">Outside</button></form>
}
describe('multi-selection controls',()=>{
 it('supports multiple stages, visible removable chips and clearing',async()=>{
  const user=userEvent.setup();show(<Stages/>);const form=screen.getByRole('form') as HTMLFormElement
  expect(form.checkValidity()).toBe(false)
  await user.click(screen.getByRole('combobox',{name:'Education stages'}))
  await user.click(await screen.findByRole('option',{name:'Primary school'}));await user.click(screen.getByRole('option',{name:'Secondary school'}))
  expect(screen.getByRole('option',{name:'Primary school'}).getAttribute('aria-selected')).toBe('true')
  expect(screen.getByRole('option',{name:'Secondary school'}).getAttribute('aria-selected')).toBe('true')
  await user.click(screen.getByRole('button',{name:'Done'}))
  expect(form.checkValidity()).toBe(true)
  await user.click(screen.getByRole('button',{name:'Remove Primary school'}));expect(screen.queryByRole('button',{name:'Remove Primary school'})).toBeNull()
  expect(screen.getByRole('button',{name:'Remove Secondary school'})).toBeTruthy()
  await user.click(screen.getByRole('combobox',{name:'Education stages'}));await user.click(await screen.findByRole('button',{name:'Clear selections'}))
  expect(form.checkValidity()).toBe(false)
 })
 it('searches Arabic names, skips disabled options, and Escape restores focus',async()=>{
  const user=userEvent.setup();show(<Stages/>)
  const trigger=screen.getByRole('combobox',{name:'Education stages'})
  await user.click(trigger);const search=await screen.findByRole('combobox',{name:'Search options'})
  await user.type(search,'اِبتدائي');await user.click(await screen.findByRole('option',{name:'Primary school'}))
  await user.keyboard('{Escape}');await waitFor(()=>expect(document.activeElement).toBe(trigger))
  await user.click(trigger);await user.click(await screen.findByRole('option',{name:'Unavailable stage'}));expect(screen.queryByRole('button',{name:'Remove Unavailable stage'})).toBeNull()
 })
 it('disabled controls stay closed and Arabic menus retain direction',async()=>{
  const user=userEvent.setup();const disabled=show(<Stages disabled/>);await user.click(screen.getByRole('combobox',{name:'Education stages'}));expect(screen.queryByRole('listbox')).toBeNull();disabled.unmount()
  await language.changeLanguage('ar');show(<Stages/>);await user.click(screen.getByRole('combobox',{name:'Education stages'}))
  const list=await screen.findByRole('listbox');expect(list.closest('[dir]')?.getAttribute('dir')).toBe('rtl')
 })
})
const countries:CountryOption[]=[
 {id:1,iso_code:'OM',iso_alpha2:'OM',name_en:'Oman',name_ar:'عمان',is_arab:true},
 {id:2,iso_code:'DZ',iso_alpha2:'DZ',name_en:'Algeria',name_ar:'الجزائر',is_arab:true},
 {id:3,iso_code:'CA',iso_alpha2:'CA',name_en:'Canada',name_ar:'كندا',is_arab:false},
 {id:4,iso_code:'AU',iso_alpha2:'AU',name_en:'Australia',name_ar:'أستراليا',is_arab:false},
]
it('orders current country first, then Arab countries only for Arab visitors',()=>{
 expect(orderedCountries(countries,1,'en').map(c=>c.id)).toEqual([1,2,4,3])
 expect(orderedCountries(countries,3,'en').map(c=>c.id)).toEqual([3,2,4,1])
 expect(orderedCountries(countries,null,'en').map(c=>c.id)).toEqual([2,4,3,1])
 expect(countries.map(c=>c.id)).toEqual([1,2,3,4])
})
function FormState({initial}:{initial?:AudienceSelection}){
 const form=useAudienceForm(initial)
 return <><output aria-label="Country IDs">{JSON.stringify(form.value.countryIds)}</output><button onClick={()=>form.setCountryIds([])}>Any country</button></>
}
function referenceMocks(countryPromise=Promise.resolve({countries,detectedCountryId:1})){
 vi.spyOn(reference,'categories').mockResolvedValue([{id:1,name_en:'Science',name_ar:'العلوم'}])
 vi.spyOn(reference,'educationStages').mockResolvedValue([{id:1,name_en:'Primary school',name_ar:'ابتدائي'}])
 vi.spyOn(reference,'countries').mockReturnValue(countryPromise)
}
const form=(initial?:AudienceSelection)=>show(<QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><FormState initial={initial}/></QueryClientProvider>)
it('preselects the detected country in a new form and permits clearing it',async()=>{
 referenceMocks();const user=userEvent.setup();form()
 await waitFor(()=>expect(screen.getByLabelText('Country IDs').textContent).toBe('[1]'))
 await user.click(screen.getByRole('button',{name:'Any country'}));expect(screen.getByLabelText('Country IDs').textContent).toBe('[]')
})
it('a late country suggestion cannot replace an explicit any-country choice',async()=>{
 let resolve!:(value:{countries:CountryOption[];detectedCountryId:number})=>void
 referenceMocks(new Promise(r=>{resolve=r}));const user=userEvent.setup();form()
 await user.click(screen.getByRole('button',{name:'Any country'}));resolve({countries,detectedCountryId:1})
 await waitFor(()=>expect(reference.countries).toHaveBeenCalled());expect(screen.getByLabelText('Country IDs').textContent).toBe('[]')
})
it.each([{ids:[]},{ids:[3]}])('editing retains saved countries $ids instead of applying a new suggestion',async({ids})=>{
 referenceMocks();form({categoryId:1,educationStageIds:[1],countryIds:ids})
 await waitFor(()=>expect(reference.countries).toHaveBeenCalled());expect(screen.getByLabelText('Country IDs').textContent).toBe(JSON.stringify(ids))
})
