import {afterEach,beforeAll,beforeEach,expect,it,vi} from 'vitest'
import {act,cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {createInstance} from 'i18next'
import {I18nextProvider} from 'react-i18next'
import {QueryClient,QueryClientProvider} from '@tanstack/react-query'
import {MemoryRouter,Route,Routes} from 'react-router-dom'
import AdminLayout from '../src/features/admin/AdminLayout'
import AdminUsers from '../src/features/admin/AdminUsers'
import AdminUserDetail,{CreditForm} from '../src/features/admin/AdminUserDetail'
import {administration,creditMillicents,type AdminUser} from '../src/features/admin/api'
import {homePathFor,loginDestinationFor} from '../src/lib/afterAuth'

const auth=vi.hoisted(()=>({status:'authenticated',user:{id:1,name:'Owner',email:'owner@example.test',role:'admin',emailVerified:true},signOut:vi.fn()}))
vi.mock('@/hooks/useAuth',()=>({useAuth:()=>auth}))
vi.mock('@/hooks/useAuthOptions',()=>({useAuthOptions:()=>({google:true})}))
const language=createInstance()
const person:AdminUser={id:25,name:'Test teacher',email:'teacher@example.test',role:'teacher',status:'active',locale:'en',emailVerified:true,
  createdAt:'2026-09-09T10:00:00Z',lastLoginAt:null,balanceMillicents:50000,reservedMillicents:20000,spendableMillicents:30000,welcomeGrantClaimed:true}
function show(node:React.ReactNode) {
  const client=new QueryClient({defaultOptions:{queries:{retry:false,gcTime:0}}})
  render(<I18nextProvider i18n={language}><QueryClientProvider client={client}><MemoryRouter initialEntries={['/admin/users/25']}>{node}</MemoryRouter></QueryClientProvider></I18nextProvider>)
  return client
}
beforeAll(async()=>{
  await language.init({lng:'en',resources:{en:{translation:{}},ar:{translation:{}}}})
  vi.stubGlobal('ResizeObserver',class {observe(){}unobserve(){}disconnect(){}})
  vi.stubGlobal('matchMedia',vi.fn(()=>({matches:false,addEventListener(){},removeEventListener(){}})))
})
beforeEach(async()=>{auth.status='authenticated';auth.user={...auth.user,role:'admin'};await language.changeLanguage('en')})
afterEach(()=>{cleanup();vi.restoreAllMocks()})

it('shows Google-only sign-in and keeps user data out of unauthorized screens',()=>{
  auth.status='anonymous';const stored=auth.user;auth.user=null as unknown as typeof auth.user
  show(<AdminLayout/>);expect(screen.getByRole('heading',{name:'Admin sign-in'})).toBeTruthy()
  expect(document.querySelector('a[href*="/auth/google"]')).not.toBeNull()
  expect(document.querySelector('input[type="password"]')).toBeNull()
  auth.user=stored
})
it('does not offer administration to an instructor',()=>{
  auth.user={...auth.user,role:'teacher'};show(<AdminLayout/>)
  expect(screen.getByText(/This account does not have admin access/)).toBeTruthy()
  expect(screen.queryByRole('navigation',{name:'Admin navigation'})).toBeNull()
})
it('shows real users and searches on submit with the correct filters',async()=>{
  const get=vi.spyOn(administration,'users').mockResolvedValue({users:[person],total:1,page:1,limit:25})
  show(<AdminUsers/>);await screen.findByText(person.email!)
  expect(screen.getByRole('link',{name:'Manage credit'}).getAttribute('href')).toBe('/admin/users/25')
  expect(screen.getByText('$0.30')).toBeTruthy()
  fireEvent.change(screen.getByLabelText('Search by name or email'),{target:{value:'teacher@example.test'}})
  fireEvent.click(screen.getByRole('button',{name:'Search'}))
  await waitFor(()=>expect(get).toHaveBeenLastCalledWith('teacher@example.test','',1,expect.any(AbortSignal)))
})
it('requires review, prevents double submission, and retries an uncertain result with the same key',async()=>{
  let reject!:(error:Error)=>void
  const pending=new Promise<never>((_,fail)=>{reject=fail})
  const adjust=vi.spyOn(administration,'adjust').mockReturnValueOnce(pending).mockResolvedValue({adjustmentId:10,balanceMillicents:100000,replayed:true})
  show(<CreditForm person={person}/>)
  fireEvent.change(screen.getByLabelText('Reason for adjustment'),{target:{value:'Additional preparation credit'}})
  fireEvent.click(screen.getByRole('button',{name:'Review adjustment'}))
  expect(adjust).not.toHaveBeenCalled()
  expect(screen.getByText(person.email!)).toBeTruthy()
  const confirm=screen.getByRole('button',{name:'Confirm adjustment'})
  fireEvent.click(confirm);fireEvent.click(confirm)
  expect(confirm.getAttribute('aria-busy')).toBe('true');expect(adjust).toHaveBeenCalledTimes(1)
  const original=adjust.mock.calls[0]![1]
  expect(original).toMatchObject({direction:'add',amountUsd:'0.50',reason:'Additional preparation credit'})
  await act(async()=>reject(new Error('Connection interrupted')))
  expect(screen.getByRole('button',{name:'Edit details'}).hasAttribute('disabled')).toBe(true)
  fireEvent.click(screen.getByRole('button',{name:'Retry same adjustment'}))
  await screen.findByText(/Adjustment saved/)
  expect(adjust.mock.calls[1]![1].requestKey).toBe(original.requestKey)
})
it('rejects invalid credit amounts before sending an adjustment',()=>{
  const adjust=vi.spyOn(administration,'adjust')
  show(<CreditForm person={person}/>)
  fireEvent.change(screen.getByLabelText('Amount in USD'),{target:{value:'-0.50'}})
  fireEvent.change(screen.getByLabelText('Reason for adjustment'),{target:{value:'Reason'}})
  fireEvent.submit(screen.getByLabelText('Amount in USD').closest('form')!)
  expect(screen.getByRole('alert').textContent).toMatch(/greater than zero/)
  expect(adjust).not.toHaveBeenCalled()
})
it('can remove exactly seven cents of available credit while retaining reservations and restoring keyboard focus',async()=>{
  const user=userEvent.setup()
  show(<CreditForm person={{...person,balanceMillicents:12000,reservedMillicents:5000,spendableMillicents:7000}}/>)
  await user.click(screen.getByRole('combobox',{name:'Action'}))
  await user.click(await screen.findByRole('option',{name:'Remove credit'}))
  fireEvent.change(screen.getByLabelText('Amount in USD'),{target:{value:'0.07'}})
  fireEvent.change(screen.getByLabelText('Reason for adjustment'),{target:{value:'Correction of credit'}})
  await user.click(screen.getByRole('button',{name:'Review adjustment'}))
  expect(screen.queryByRole('alert')).toBeNull()
  expect(document.activeElement).toBe(screen.getByRole('heading',{name:'Review adjustment'}))
  expect(screen.getByText('$0.05')).toBeTruthy()
  await user.click(screen.getByRole('button',{name:'Edit details'}))
  expect(document.activeElement).toBe(screen.getByLabelText('Amount in USD'))
  expect(creditMillicents('0.07')).toBe(7000)
  expect(creditMillicents('0.00001')).toBe(1)
})
it('shows the credit history with the administrator and reason',async()=>{
  vi.spyOn(administration,'user').mockResolvedValue(person)
  vi.spyOn(administration,'history').mockResolvedValue({entries:[{id:20,kind:'adjustment',amountMillicents:50000,reason:'Additional preparation credit',createdAt:person.createdAt,actorEmail:'owner@example.test',balanceAfterMillicents:50000}],nextBefore:null})
  show(<Routes><Route path="/admin/users/:id" element={<AdminUserDetail/>}/></Routes>)
  await screen.findByText('Additional preparation credit')
  expect(screen.getByText('owner@example.test')).toBeTruthy()
  expect(screen.getByText('Admin credit')).toBeTruthy()
})
it('does not provide credit adjustments for a student',async()=>{
  vi.spyOn(administration,'user').mockResolvedValue({...person,role:'student'})
  const history=vi.spyOn(administration,'history')
  show(<Routes><Route path="/admin/users/:id" element={<AdminUserDetail/>}/></Routes>)
  await screen.findByText(/This is not an instructor account/)
  expect(screen.queryByLabelText('Amount in USD')).toBeNull();expect(history).not.toHaveBeenCalled()
})
it('renders the credit form in Arabic and uses role-aware return destinations',async()=>{
  await language.changeLanguage('ar');show(<CreditForm person={person}/>)
  expect(screen.getByLabelText('سبب التعديل')).toBeTruthy()
  expect(homePathFor({role:'admin'})).toBe('/admin/users')
  expect(loginDestinationFor({role:'student'},'/admin/users')).toBe('/student')
  expect(loginDestinationFor({role:'admin'},'/admin/users/25')).toBe('/admin/users/25')
})
