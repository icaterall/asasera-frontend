import {createRoot} from 'react-dom/client'
import {useState} from 'react'
import {createInstance} from 'i18next'
import {I18nextProvider} from 'react-i18next'
import {MemoryRouter,Route,Routes} from 'react-router-dom'
import {QueryClient,QueryClientProvider} from '@tanstack/react-query'
import '@fontsource/montserrat/latin-400.css'
import '@fontsource/montserrat/latin-700.css'
import '@/index.css'
import CreateActivity from '@/features/editor/CreateActivity'
import {ActivityAudience} from '@/features/audience/ActivityAudience'
import {AuthContext} from '@/context/auth-context'
import {activities,type ActivityRecord,type PublicUser} from '@/lib/api'

// Actual creation/settings controls. Browser tests intercept every API call;
// this fixture never uses an account, changes an activity, or spends AI tokens.
const params=new URLSearchParams(location.search),ar=params.get('lang')==='ar'
const i18n=createInstance()
await i18n.init({lng:ar?'ar':'en',resources:{en:{translation:{}},ar:{translation:{}}}})
function setDirection(){document.documentElement.lang=i18n.language;document.documentElement.dir=i18n.language==='ar'?'rtl':'ltr'}
setDirection();i18n.on('languageChanged',setDirection)
const user={id:73,locale:ar?'ar':'en'} as PublicUser
const initial={id:42,title:'Language fixture',revision:1,contentLanguage:'French',categoryId:null,educationStageIds:[],countryIds:[],currentVersionId:null} as ActivityRecord
function Settings(){
 const [activity,setActivity]=useState(initial)
 return <div className="asas" style={{maxWidth:1000,margin:'24px auto',padding:16}}>
  <ActivityAudience activity={activity} onSave={async()=>{}} onLanguageSave={async contentLanguage=>{const result=await activities.update(42,{contentLanguage,expectedRevision:activity.revision});setActivity(result.activity)}}/>
  <output aria-label="Saved content language">{activity.contentLanguage}</output>
 </div>
}
createRoot(document.getElementById('root')!).render(<I18nextProvider i18n={i18n}><QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><AuthContext.Provider value={{status:'authenticated',user,accessToken:null,needsProfile:false,signIn:async()=>user,signOut:async()=>{},forgetSession:()=>{},applyUser:()=>{}}}>
 <button onClick={()=>void i18n.changeLanguage(i18n.language==='ar'?'en':'ar')}>Switch interface language</button>
 <MemoryRouter initialEntries={[params.has('settings')?'/settings':'/create']}><Routes><Route path="/create" element={<CreateActivity/>}/><Route path="/settings" element={<Settings/>}/><Route path="/teacher/activities/:id" element={<p>Activity created</p>}/></Routes></MemoryRouter>
</AuthContext.Provider></QueryClientProvider></I18nextProvider>)
