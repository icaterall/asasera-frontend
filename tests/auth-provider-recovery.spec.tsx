import {afterEach,beforeAll,expect,it,vi} from 'vitest'
import {cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react'
import {StrictMode} from 'react'
import {MemoryRouter} from 'react-router-dom'
import {QueryClient,QueryClientProvider} from '@tanstack/react-query'
import {createInstance} from 'i18next'
import {I18nextProvider} from 'react-i18next'
import {AuthProvider} from '../src/context/AuthProvider'
import {useAuth} from '../src/hooks/useAuth'
import {setAccessToken,setSessionLostHandler} from '../src/lib/api'

const language=createInstance()
const restored={accessToken:'restored-test-session',user:{id:12,name:'Teacher',email:'teacher@example.test',role:'teacher',status:'active',locale:'en',emailVerified:true,categoryId:null,educationStageId:null,workplaceTypeId:null}}
const success=()=>new Response(JSON.stringify(restored),{status:200,headers:{'content-type':'application/json'}})
function SessionProbe(){const {status,user}=useAuth();return <p>{status==='authenticated'?`Signed in as ${user?.name}`:status}</p>}
function show(){return render(<StrictMode><I18nextProvider i18n={language}><QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false,gcTime:0}}})}><MemoryRouter initialEntries={['/teacher/dashboard']}><AuthProvider><SessionProbe/></AuthProvider></MemoryRouter></QueryClientProvider></I18nextProvider></StrictMode>)}
beforeAll(async()=>{await language.init({lng:'en',resources:{en:{translation:{}}}})})
afterEach(()=>{cleanup();vi.unstubAllGlobals();setAccessToken(null);setSessionLostHandler(null)})

it('recovers the signed-in teacher after a backend restart without returning to login',async()=>{
  const fetch=vi.fn().mockResolvedValueOnce(new Response('Restarting',{status:503})).mockImplementation(async()=>success())
  vi.stubGlobal('fetch',fetch);show()
  await screen.findByRole('button',{name:'Reconnect now'})
  expect(screen.queryByText('anonymous')).toBeNull()
  fireEvent.click(screen.getByRole('button',{name:'Reconnect now'}))
  await screen.findByText('Signed in as Teacher')
  expect(fetch).toHaveBeenCalledTimes(2)
  expect(fetch.mock.calls.every(([url])=>String(url).endsWith('/auth/refresh'))).toBe(true)
})
it('reconnects automatically after a temporary network error, including StrictMode startup',async()=>{
  const fetch=vi.fn().mockRejectedValueOnce(new TypeError('Connection refused')).mockImplementation(async()=>success())
  vi.stubGlobal('fetch',fetch);show()
  await screen.findByRole('button',{name:'Reconnect now'})
  await waitFor(()=>expect(screen.getByText('Signed in as Teacher')).toBeTruthy(),{timeout:3000})
  expect(fetch).toHaveBeenCalledTimes(2)
})
it('does not reconnect indefinitely when the server confirms the cookie is expired',async()=>{
  const fetch=vi.fn().mockResolvedValue(new Response('{}',{status:401}))
  vi.stubGlobal('fetch',fetch);show()
  await screen.findByText('anonymous')
  expect(screen.queryByRole('button',{name:'Reconnect now'})).toBeNull()
  expect(fetch).toHaveBeenCalledOnce()
})
