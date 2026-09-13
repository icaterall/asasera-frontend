import {afterEach,beforeAll,beforeEach,expect,it,vi} from 'vitest'
import {cleanup,render,screen,waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {createInstance} from 'i18next'
import {I18nextProvider} from 'react-i18next'
import {MemoryRouter} from 'react-router-dom'
import {QueryClient,QueryClientProvider} from '@tanstack/react-query'
import {AuthContext} from '../src/context/auth-context'
import {teaching,type PublicUser} from '../src/lib/api'
import {billing,instructorAccount} from '../src/features/account/instructor-account-api'
import BillingPlans from '../src/features/account/BillingPlans'

const language=createInstance()
const user={id:73,name:'Instructor',email:'teacher@example.test',role:'teacher',emailVerified:true} as PublicUser
const wallet={balanceAiCredits:130000,reservedAiCredits:1000,spendableAiCredits:129000,usableAiCredits:129000} as Awaited<ReturnType<typeof teaching.wallet>>
const recorded={state:'recorded',plan:'topup_small',paidMillicents:300000,currency:'usd',addedAiCredits:80000,addedActivities:40,balanceAiCredits:130000,usableAiCredits:129000,imageQualityCeiling:'low',maxOpenJobs:1,subscription:null,purchasedAt:'2026-09-13T10:00:00Z'} as const
beforeAll(async()=>{await language.init({lng:'en',resources:{en:{translation:{}},ar:{translation:{}}}})})
beforeEach(()=>{
 vi.spyOn(billing,'plans').mockResolvedValue({configured:true,currency:'usd',free:{millicents:30000,aiCredits:30000,activities:15},plans:[],subscription:null})
 vi.spyOn(billing,'receipt').mockResolvedValue(recorded)
 vi.spyOn(billing,'purchases').mockResolvedValue([{plan:'topup_small',paidMillicents:300000,currency:'usd',aiCredits:80000,createdAt:recorded.purchasedAt}])
 vi.spyOn(teaching,'wallet').mockResolvedValue(wallet)
 vi.spyOn(instructorAccount,'overview').mockResolvedValue({updatedAt:recorded.purchasedAt,creditPolicyVersion:1,usage:{last30DaysAiCredits:2300,allTimeAiCredits:7800},workspace:{activities:24,questions:316,liveSessions:18,assignments:12,participations:248,materials:9},recent:[]})
})
afterEach(()=>{cleanup();vi.restoreAllMocks();void language.changeLanguage('en')})
function show(path='/teacher/billing',ready=true){
 const client=new QueryClient({defaultOptions:{queries:{retry:false,gcTime:0}}})
 const ui=render(<I18nextProvider i18n={language}><QueryClientProvider client={client}><AuthContext.Provider value={{status:ready?'authenticated':'loading',user:ready?user:null,accessToken:null,needsProfile:false,signIn:async()=>user,signOut:async()=>{},forgetSession:()=>{},applyUser:()=>{}}}><MemoryRouter initialEntries={[path]}><BillingPlans/></MemoryRouter></AuthContext.Provider></QueryClientProvider></I18nextProvider>)
 return {...ui,client}
}
it('returns a confirmed checkout to the balance dashboard with purchases and usage',async()=>{
 show('/teacher/billing?checkout=done&session=cs_test_return123')
 expect(await screen.findByRole('heading',{name:'Balance & usage'})).toBeTruthy()
 expect(await screen.findByText('129,000')).toBeTruthy()
 expect(await screen.findByRole('heading',{name:'Purchase history'})).toBeTruthy()
 expect(await screen.findByText('$3.00')).toBeTruthy()
 expect(await screen.findByText('2,300')).toBeTruthy()
})
it('opens the dashboard on a later visit, with plans a deliberate choice',async()=>{
 show()
 expect(await screen.findByRole('heading',{name:'Balance & usage'})).toBeTruthy()
 await userEvent.click(screen.getByRole('link',{name:'Plans & top-ups'}))
 expect(await screen.findByRole('heading',{name:'Credit and plans'})).toBeTruthy()
 await userEvent.click(screen.getByRole('link',{name:'Balance & usage'}))
 expect(await screen.findByRole('heading',{name:'Balance & usage'})).toBeTruthy()
})
it('does not assert payment success or leave verification while receipt is pending',async()=>{
 vi.mocked(billing.receipt).mockResolvedValue({state:'pending',balanceAiCredits:50000,usableAiCredits:50000})
 show('/teacher/billing?checkout=done&session=cs_test_pending123')
 expect(await screen.findByRole('heading',{name:'Confirming your payment'})).toBeTruthy()
 expect(screen.queryByText('Payment successful')).toBeNull()
 expect(screen.queryByRole('heading',{name:'Your credit is ready'})).toBeNull()
 expect(await screen.findByRole('heading',{name:'Balance & usage'})).toBeTruthy()
 expect(await screen.findByText('129,000')).toBeTruthy()
})
it('waits for the authenticated instructor before loading any account data',()=>{
 show('/teacher/billing?checkout=done&session=cs_test_return123',false)
 expect(billing.receipt).not.toHaveBeenCalled()
 expect(teaching.wallet).not.toHaveBeenCalled()
 expect(billing.purchases).not.toHaveBeenCalled()
})
it('refreshes purchases as well as the wallet after confirmation',async()=>{
 const {client}=show('/teacher/billing?checkout=done&session=cs_test_return123')
 const invalidate=vi.spyOn(client,'invalidateQueries')
 await waitFor(()=>expect(invalidate).toHaveBeenCalledWith({queryKey:['billing-purchases']}))
})
it('transitions only after a delayed receipt is recorded, even for an existing subscriber',async()=>{
 vi.mocked(billing.plans).mockResolvedValue({configured:true,currency:'usd',free:{millicents:30000,aiCredits:30000,activities:15},plans:[],subscription:{plan:'monthly',status:'active',currentPeriodEnd:'2026-10-13T10:00:00Z',cancelAtPeriodEnd:false}})
 vi.mocked(billing.receipt).mockResolvedValue({state:'pending',balanceAiCredits:50000,usableAiCredits:50000})
 const {client}=show('/teacher/billing?checkout=done&session=cs_test_delayed123')
 expect(await screen.findByRole('heading',{name:'Confirming your payment'})).toBeTruthy()
 expect(await screen.findByRole('heading',{name:'Purchase history'})).toBeTruthy()
 expect(screen.queryByText('Credit added',{selector:'strong'})).toBeNull()
 vi.mocked(billing.receipt).mockResolvedValue(recorded)
 await client.refetchQueries({queryKey:['checkout-receipt']})
 expect(await screen.findByRole('heading',{name:'Purchase history'})).toBeTruthy()
 expect(await screen.findByText('Credit added',{selector:'strong'})).toBeTruthy()
 await waitFor(()=>expect(screen.getByRole('button',{name:'Refresh',exact:true}).hasAttribute('disabled')).toBe(false))
})
it('keeps the dashboard useful when purchase history fails, and allows retry',async()=>{
 vi.mocked(billing.purchases).mockRejectedValue(new Error('offline'))
 show()
 expect(await screen.findByText('129,000')).toBeTruthy()
 expect(await screen.findByText('Purchases could not refresh. Refresh before trying to pay again.',{}, {timeout:2500})).toBeTruthy()
 expect(screen.queryByText('No recorded purchases yet. Free allowances are not purchases.')).toBeNull()
 vi.mocked(billing.purchases).mockResolvedValue([{plan:'topup_small',currency:'usd',paidMillicents:300000,aiCredits:80000,createdAt:recorded.purchasedAt}])
 await userEvent.click(screen.getByRole('button',{name:'Refresh',exact:true}))
 expect(await screen.findByText('$3.00')).toBeTruthy()
})
it('never treats a missing session in the return URL as proof of payment',async()=>{
 show('/teacher/billing?checkout=done')
 expect(await screen.findByRole('heading',{name:'Balance & usage'})).toBeTruthy()
 expect(screen.getByText(/This return link has no payment reference/)).toBeTruthy()
 expect(billing.receipt).not.toHaveBeenCalled()
 expect(screen.queryByText('Payment received. Your credit will appear in a moment.')).toBeNull()
})
it('renders the account overview in Arabic RTL',async()=>{
 await language.changeLanguage('ar')
 show()
 const heading=await screen.findByRole('heading',{name:'الرصيد والاستخدام'})
 expect(heading.closest('[dir]')?.getAttribute('dir')).toBe('rtl')
 expect(await screen.findByRole('heading',{name:'سجل المشتريات'})).toBeTruthy()
})
it('offers a receipt retry without starting a second checkout',async()=>{
 vi.mocked(billing.receipt).mockRejectedValue(new Error('offline'))
 const checkout=vi.spyOn(billing,'checkout')
 show('/teacher/billing?checkout=done&session=cs_test_retry123')
 expect(await screen.findByRole('heading',{name:'Payment confirmation unavailable'},{timeout:2500})).toBeTruthy()
 expect(screen.queryByText('Payment successful')).toBeNull()
 vi.mocked(billing.receipt).mockResolvedValue(recorded)
 await userEvent.click(screen.getByRole('button',{name:'Check again'}))
 expect(await screen.findByRole('heading',{name:'Purchase history'})).toBeTruthy()
 expect(checkout).not.toHaveBeenCalled()
})
it('keeps a way back to the balance when loading plans fails',async()=>{
 vi.mocked(billing.plans).mockRejectedValue(new Error('offline'))
 show('/teacher/billing?view=plans')
 expect(await screen.findByRole('heading',{name:'Plans could not load'},{timeout:2500})).toBeTruthy()
 await userEvent.click(screen.getByRole('link',{name:'Balance & usage'}))
 expect(await screen.findByText('129,000')).toBeTruthy()
})
