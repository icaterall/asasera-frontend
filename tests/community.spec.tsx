import {afterEach,beforeAll,beforeEach,expect,it,vi} from 'vitest'
import {cleanup,render,screen,waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {createInstance} from 'i18next'
import {I18nextProvider} from 'react-i18next'
import type {ReactNode} from 'react'
import {QueryClient,QueryClientProvider} from '@tanstack/react-query'
import {MemoryRouter,Route,Routes,useLocation} from 'react-router-dom'
import {FeedbackForm} from '../src/features/community/FeedbackForm'
import {InboxEntry} from '../src/features/community/FeedbackInbox'
import SharedActivity from '../src/features/community/SharedActivity'
import {community,type Feedback,type InboxItem,type SharedActivity as Activity} from '../src/features/community/api'
import {activities,api,taxonomy} from '../src/lib/api'

const session=vi.hoisted(()=>({user:null as {id:number;role:string}|null,status:'anonymous'}))
vi.mock('@/hooks/useAuth',()=>({useAuth:()=>session}))
const language=createInstance()
beforeAll(async()=>{
 await language.init({lng:'en',resources:{en:{translation:{}},ar:{translation:{}}}})
 Element.prototype.scrollIntoView=vi.fn()
 vi.stubGlobal('ResizeObserver',class{observe(){}unobserve(){}disconnect(){}})
})
beforeEach(()=>{session.user=null;session.status='anonymous'})
afterEach(()=>{cleanup();vi.restoreAllMocks();void language.changeLanguage('en')})
function show(ui:ReactNode,path='/activities/42'){
 return render(<I18nextProvider i18n={language}><QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false},mutations:{retry:false}}})}><MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter></QueryClientProvider></I18nextProvider>)
}
const review:Feedback={id:4,versionId:7,rating:4,recommend:true,strengths:'Clear examples',suggestion:'Add a worked example',status:'reviewed',response:'Thank you. Example added.',revision:2,createdAt:'2026-09-09T00:00:00Z',updatedAt:'2026-09-09T00:00:00Z'}
const item:InboxItem={...review,kind:'feedback',activityId:42,activityTitle:'Fractions',reviewerName:'Another teacher',questionId:null,reason:null}
const activity:Activity={id:42,title:'Fractions together',theme:'jungle',authorName:'Creator',versionId:7,version:1,publishedAt:review.createdAt,subjectId:1,levelId:8,shareUrl:'https://asasera.com/activities/42',questionCount:1,questions:[{id:5,qIndex:0,prompt:'Is one half equal to two quarters?',media:null,timeLimitS:30,payload:{kind:'tf',options:[{key:'true',text:'True'},{key:'false',text:'False'}]}}],audience:{category:{name_en:'Mathematics',name_ar:'الرياضيات'},educationStages:[],countries:[]},summary:{reviewCount:0,averageRating:null,recommendationCount:0}}
function sharedMocks(isAuthor=false){
 vi.spyOn(community,'activity').mockResolvedValue(activity)
 vi.spyOn(community,'context').mockResolvedValue({isAuthor,feedback:null,flags:[]})
 vi.spyOn(community,'recommendations').mockResolvedValue({activities:[],personalized:false})
 vi.spyOn(taxonomy,'purposes').mockResolvedValue({purposes:[]})
}
function Location(){const l=useLocation();return <output aria-label="Destination">{l.pathname} {l.state?.from}</output>}
function shared(){return show(<Routes><Route path="/activities/:id" element={<SharedActivity/>}/><Route path="*" element={<Location/>}/></Routes>)}

it('requires a rating and submits version-bound teacher feedback without losing optional text',async()=>{
 const user=userEvent.setup(),saved=vi.fn(),send=vi.spyOn(community,'save').mockResolvedValue({feedback:review})
 show(<FeedbackForm activityId={42} versionId={7} initial={null} onSaved={saved}/> )
 expect(screen.getByRole('button',{name:'Send feedback'}).hasAttribute('disabled')).toBe(true)
 await user.click(screen.getByRole('radio',{name:'4 out of 5'}))
 await user.click(screen.getByRole('checkbox'))
 await user.type(screen.getByLabelText('What worked well? (optional)'),'Clear examples')
 await user.type(screen.getByLabelText('What could be improved? (optional)'),'Add a worked example')
 await user.click(screen.getByRole('button',{name:'Send feedback'}))
 await waitFor(()=>expect(saved).toHaveBeenCalledOnce())
 expect(send).toHaveBeenCalledWith(42,{versionId:7,rating:4,recommend:true,strengths:'Clear examples',suggestion:'Add a worked example'})
})
it('retains a failed review for retry and renders feedback text safely',async()=>{
 const user=userEvent.setup();vi.spyOn(community,'save').mockRejectedValue(new Error('Connection interrupted'))
 show(<FeedbackForm activityId={42} versionId={7} initial={{...review,response:'<script>secret()</script>'}} onSaved={vi.fn()}/> )
 await user.click(screen.getByRole('button',{name:'Update feedback'}))
 expect((await screen.findByRole('alert')).textContent).toContain('Connection interrupted')
 expect((screen.getByLabelText('What could be improved? (optional)') as HTMLTextAreaElement).value).toBe(review.suggestion)
 expect(screen.getByText('<script>secret()</script>')).toBeTruthy()
 expect(document.querySelector('script')).toBeNull()
})
it('withdraws the existing review and warns when the reviewed version changed',async()=>{
 const user=userEvent.setup(),saved=vi.fn(),withdraw=vi.spyOn(community,'withdraw').mockResolvedValue(undefined)
 show(<FeedbackForm activityId={42} versionId={8} initial={review} onSaved={saved}/> )
 expect(screen.getByText(/creator updated this activity/)).toBeTruthy()
 await user.click(screen.getByRole('button',{name:'Withdraw my feedback'}))
 await waitFor(()=>expect(saved).toHaveBeenCalledOnce());expect(withdraw).toHaveBeenCalledWith(42)
})
it('offers Arabic review labels and keeps free text direction automatic',async()=>{
 await language.changeLanguage('ar');show(<FeedbackForm activityId={42} versionId={7} initial={null} onSaved={vi.fn()}/> )
 expect(screen.getByRole('radio',{name:'5 من 5'})).toBeTruthy()
 expect(screen.getByLabelText('ما الذي يمكن تحسينه؟ (اختياري)').getAttribute('dir')).toBe('auto')
})
it('sends a creator reply and status against the displayed feedback revision',async()=>{
 const user=userEvent.setup(),saved=vi.fn(),patch=vi.spyOn(api,'patch').mockResolvedValue({ok:true})
 show(<InboxEntry item={item} onSaved={saved}/> )
 await user.click(screen.getByText('Reply and update status'))
 const reply=screen.getByLabelText('Your reply to the teacher (optional)');await user.clear(reply);await user.type(reply,'Updated the worked example.')
 await user.click(screen.getByRole('combobox',{name:'Feedback status'}));await user.click(await screen.findByRole('option',{name:'Resolved'}))
 await user.click(screen.getByRole('button',{name:'Save response'}));await waitFor(()=>expect(saved).toHaveBeenCalledOnce())
 expect(patch).toHaveBeenCalledWith('/api/v1/community/inbox/feedback/4',{status:'resolved',response:'Updated the worked example.',expectedRevision:2})
})
it('keeps a failed creator reply editable and offers a refresh on conflict',async()=>{
 const user=userEvent.setup();vi.spyOn(community,'respond').mockRejectedValue(new Error('This feedback changed.'))
 show(<InboxEntry item={item} onSaved={vi.fn()}/> )
 await user.click(screen.getByText('Reply and update status'));await user.click(screen.getByRole('button',{name:'Save response'}))
 expect((await screen.findByRole('alert')).textContent).toContain('This feedback changed.')
 expect(screen.getByRole('button',{name:'Refresh feedback'})).toBeTruthy()
 expect((screen.getByLabelText('Your reply to the teacher (optional)') as HTMLTextAreaElement).value).toBe(review.response)
})
it('lets a guest preview the activity and carries its URL through sign in',async()=>{
 sharedMocks();const user=userEvent.setup();shared()
 expect(await screen.findByRole('heading',{name:activity.title})).toBeTruthy()
 expect(screen.queryByRole('button',{name:'Send feedback'})).toBeNull()
 await user.click(screen.getByRole('link',{name:'Sign in to use this activity'}))
 expect(screen.getByLabelText('Destination').textContent).toBe('/login /activities/42')
})
it('keeps the canonical share URL available when clipboard access fails',async()=>{
 sharedMocks();const user=userEvent.setup();vi.spyOn(navigator.clipboard,'writeText').mockRejectedValue(new Error('Denied'));shared()
 await user.click(await screen.findByRole('button',{name:'Copy link'}))
 expect((await screen.findByRole('status')).textContent).toContain('Automatic copying is unavailable')
 expect((screen.getByLabelText('Share link') as HTMLInputElement).value).toBe('https://asasera.com/activities/42')
})
it('lets the creator stop sharing and clearly confirms the link is private',async()=>{
 session.user={id:1,role:'teacher'};session.status='authenticated';sharedMocks(true)
 const user=userEvent.setup(),stop=vi.spyOn(activities,'unpublish').mockResolvedValue({ok:true});shared()
 await user.click(await screen.findByRole('button',{name:'Stop sharing and make private'}))
 expect(await screen.findByRole('heading',{name:'Your activity is now private'})).toBeTruthy()
 expect(stop).toHaveBeenCalledWith(42)
 expect(screen.queryByRole('button',{name:'Copy link'})).toBeNull()
})
it('creates an editable copy and sends the teacher to the new editor',async()=>{
 session.user={id:2,role:'teacher'};session.status='authenticated';sharedMocks()
 const user=userEvent.setup(),copy=vi.spyOn(api,'post').mockResolvedValue({activity:{id:84}});shared()
 await user.click(await screen.findByRole('button',{name:'Make an editable copy'}))
 await waitFor(()=>expect(screen.getByLabelText('Destination').textContent).toContain('/teacher/activities/84'))
 expect(copy).toHaveBeenCalledWith('/api/v1/discovery/activities/42/fork',{})
})
