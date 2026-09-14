import {afterEach,beforeAll,beforeEach,expect,test,vi} from 'vitest'
import {act,cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {createInstance} from 'i18next'
import {I18nextProvider} from 'react-i18next'
import {QueryClient,QueryClientProvider} from '@tanstack/react-query'
import {MemoryRouter} from 'react-router-dom'
import type {ReactNode} from 'react'
import CreateActivity from '../src/features/editor/CreateActivity'
import {ActivityLanguageSettings} from '../src/features/editor/ActivityLanguageSettings'
import {activities,reference,taxonomy,type ActivityRecord} from '../src/lib/api'
vi.mock('@/hooks/useAuth',()=>({useAuth:()=>({user:{id:73},status:'authenticated'})}))
const language=createInstance()
beforeAll(async()=>{await language.init({lng:'en',resources:{en:{translation:{}},ar:{translation:{}}}});Element.prototype.scrollIntoView=vi.fn();vi.stubGlobal('ResizeObserver',class{observe(){}unobserve(){}disconnect(){}});vi.stubGlobal('matchMedia',()=>({matches:false,addEventListener(){},removeEventListener(){}}))})
beforeEach(async()=>{
 sessionStorage.clear();await language.changeLanguage('en')
 vi.spyOn(reference,'categories').mockResolvedValue([]);vi.spyOn(reference,'educationStages').mockResolvedValue([])
 vi.spyOn(reference,'countries').mockResolvedValue({countries:[],detectedCountryId:null})
 vi.spyOn(taxonomy,'purposes').mockResolvedValue({purposes:[]})
 vi.spyOn(activities,'create').mockResolvedValue({activity:{id:42} as ActivityRecord})
})
afterEach(()=>{cleanup();vi.restoreAllMocks()})
function show(ui:ReactNode=<CreateActivity/>){return render(<I18nextProvider i18n={language}><QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><MemoryRouter>{ui}</MemoryRouter></QueryClientProvider></I18nextProvider>)}
test.each(['en','ar'])('creation selects the %s interface language and includes it in the saved activity',async locale=>{
 await language.changeLanguage(locale);show()
 const field=await screen.findByRole('combobox',{name:locale==='ar'?'لغة النشاط':'Activity language'})
 expect(field.getAttribute('data-select-value')).toBe(locale)
 fireEvent.change(screen.getByRole('textbox',{name:locale==='ar'?'اسم النشاط':'Activity name'}),{target:{value:'Example'}})
 fireEvent.click(screen.getByRole('button',{name:locale==='ar'?'التالي':'Next'}))
 await waitFor(()=>expect(activities.create).toHaveBeenCalledWith(expect.objectContaining({contentLanguage:locale})))
})
test('a listed language choice survives interface changes and remount without a free-text escape',async()=>{
 const user=userEvent.setup(),view=show();await screen.findByRole('combobox',{name:'Activity language'})
 fireEvent.change(screen.getByRole('textbox',{name:'Activity name'}),{target:{value:'Example'}})
 await user.click(screen.getByRole('combobox',{name:'Activity language'}))
 expect(await screen.findByRole('option',{name:'French'})).toBeTruthy()
 expect(screen.queryByRole('option',{name:'Other language'})).toBeNull()
 await user.click(screen.getByRole('option',{name:'French'}))
 expect(screen.queryByRole('textbox',{name:'Language name'})).toBeNull()
 expect(screen.getByRole('combobox',{name:'Activity language'}).getAttribute('data-select-value')).toBe('fr')
 await act(()=>language.changeLanguage('ar'))
 expect(screen.getByRole('combobox',{name:'لغة النشاط'}).getAttribute('data-select-value')).toBe('fr')
 view.unmount();show()
 expect((await screen.findByRole('combobox',{name:'لغة النشاط'})).getAttribute('data-select-value')).toBe('fr')
 fireEvent.click(screen.getByRole('button',{name:'التالي'}))
 await waitFor(()=>expect(activities.create).toHaveBeenCalledWith(expect.objectContaining({contentLanguage:'fr'})))
})
test('settings retain a historical typed language instead of silently replacing it with a listed code',async()=>{
 const save=vi.fn().mockResolvedValue(undefined)
 const view=show(<ActivityLanguageSettings activity={{id:42,contentLanguage:'Français'} as ActivityRecord} onSave={save}/>)
 const user=userEvent.setup()
 await user.click(screen.getByRole('combobox',{name:'Activity language'}))
 expect(await screen.findByRole('option',{name:'Français'})).toBeTruthy()
 await user.keyboard('{Escape}')
 await act(()=>language.changeLanguage('ar'))
 expect(screen.getByRole('combobox',{name:'لغة النشاط'}).getAttribute('data-select-value')).toBe('Français')
 view.unmount();show(<ActivityLanguageSettings activity={{id:42,contentLanguage:'Français'} as ActivityRecord} onSave={save}/>)
 fireEvent.click(screen.getByRole('button',{name:'حفظ اللغة'}))
 await waitFor(()=>expect(save).toHaveBeenCalledWith('Français'))
})
test('an invalid historical blank language cannot be saved even by submitting the form directly',()=>{
 const save=vi.fn()
 show(<ActivityLanguageSettings activity={{id:42,contentLanguage:'   '} as ActivityRecord} onSave={save}/>)
 expect((screen.getByRole('button',{name:'Save language'}) as HTMLButtonElement).disabled).toBe(true)
 fireEvent.submit(screen.getByRole('form',{name:'Activity language settings'}))
 expect(save).not.toHaveBeenCalled()
})
test('settings preserve a failed language edit for retry and never follow a later interface switch',async()=>{
 const save=vi.fn().mockRejectedValueOnce(new Error('Network interrupted')).mockResolvedValue(undefined)
 show(<ActivityLanguageSettings activity={{id:42,contentLanguage:'ar'} as ActivityRecord} onSave={save}/>)
 expect(screen.getByRole('combobox',{name:'Activity language'}).getAttribute('data-select-value')).toBe('ar')
 const user=userEvent.setup();screen.getByRole('combobox',{name:'Activity language'}).focus();await user.keyboard('{ArrowDown}');await user.click(await screen.findByRole('option',{name:'English'}))
 fireEvent.click(screen.getByRole('button',{name:'Save language'}));await screen.findByRole('alert')
 expect(screen.getByRole('combobox',{name:'Activity language'}).getAttribute('data-select-value')).toBe('en')
 await act(()=>language.changeLanguage('ar'))
 fireEvent.click(screen.getByRole('button',{name:'حفظ اللغة'}));await screen.findByText('تم حفظ لغة النشاط.')
 expect(save).toHaveBeenLastCalledWith('en')
})
