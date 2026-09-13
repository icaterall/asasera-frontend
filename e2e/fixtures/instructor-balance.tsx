import {createRoot} from 'react-dom/client'
import {createInstance} from 'i18next'
import {I18nextProvider} from 'react-i18next'
import {MemoryRouter} from 'react-router-dom'
import {QueryClient,QueryClientProvider} from '@tanstack/react-query'
import '@fontsource/montserrat/latin-400.css'
import '@fontsource/montserrat/latin-700.css'
import '@/index.css'
import {AuthContext} from '@/context/auth-context'
import {ThemeProvider} from '@/context/ThemeProvider'
import {TeacherHeader} from '@/components/teacher/TeacherHeader'
import {InstructorBalance} from '@/features/account/InstructorBalance'
import type {PublicUser} from '@/lib/api'
import en from '@/i18n/locales/en'
import ar from '@/i18n/locales/ar'

// Synthetic account only; the browser suite intercepts all API requests.
const params=new URLSearchParams(location.search),arabic=params.get('lang')==='ar'
const i18n=createInstance()
await i18n.init({lng:arabic?'ar':'en',resources:{en:{translation:en},ar:{translation:ar}}})
document.documentElement.dir=arabic?'rtl':'ltr'
document.documentElement.lang=arabic?'ar':'en'
localStorage.setItem('asasera.theme',params.get('theme')||'light')
const user={id:73,name:arabic?'أحمد الراشدي':'Ahmed Al Rashdi',email:'instructor@example.test',role:params.get('role')||'teacher',emailVerified:true,locale:arabic?'ar':'en'} as PublicUser
createRoot(document.getElementById('root')!).render(<I18nextProvider i18n={i18n}><ThemeProvider><QueryClientProvider client={new QueryClient()}><AuthContext.Provider value={{status:'authenticated',user,accessToken:null,needsProfile:false,signIn:async()=>user,signOut:async()=>{},forgetSession:()=>{},applyUser:()=>{}}}><MemoryRouter initialEntries={['/teacher/dashboard']}>
 {params.has('compact')?<div className="asas" style={{padding:16,display:'flex',justifyContent:'flex-end'}}><InstructorBalance compact/></div>:<TeacherHeader onOpenNav={()=>{}}/>}
 <main className="asas" style={{padding:24}}><h1>{arabic?'مساحة المعلّم':'Instructor workspace'}</h1><p>{arabic?'أنشئ أنشطتك التعليمية وأدر حصصك.':'Create learning activities and manage your sessions.'}</p></main>
</MemoryRouter></AuthContext.Provider></QueryClientProvider></ThemeProvider></I18nextProvider>)
