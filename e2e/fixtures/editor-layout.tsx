import {createRoot} from 'react-dom/client'
import {createInstance} from 'i18next'
import {I18nextProvider} from 'react-i18next'
import {MemoryRouter,Route,Routes} from 'react-router-dom'
import {QueryClient,QueryClientProvider} from '@tanstack/react-query'
import '@fontsource/montserrat/latin-400.css'
import '@fontsource/montserrat/latin-700.css'
import '@/index.css'
import en from '@/i18n/locales/en'
import arLocale from '@/i18n/locales/ar'
import ActivityEditor from '@/features/editor/ActivityEditor'
import {AuthContext} from '@/context/auth-context'
import {activities,reference,taxonomy,type ActivityRecord,type QuestionRecord,type PublicUser} from '@/lib/api'
import {community} from '@/features/community/api'

// Synthetic activity only; browser tests intercept all remaining network calls.
const params=new URLSearchParams(location.search),ar=params.get('lang')==='ar'
const i18n=createInstance()
await i18n.init({lng:ar?'ar':'en',resources:{en:{translation:en},ar:{translation:arLocale}}})
function direction(){document.documentElement.lang=i18n.language;document.documentElement.dir=i18n.language==='ar'?'rtl':'ltr'}
direction();i18n.on('languageChanged',direction)
document.documentElement.classList.toggle('dark',params.get('theme')==='dark')
const user={id:73,name:'Test instructor',role:'teacher',email:'test@example.test',locale:ar?'ar':'en'} as PublicUser
let activity:ActivityRecord={id:42,title:ar?'مقدمة في الحاسوب':'Computer studies',theme:'desert',revision:1,currentVersionId:7,visibility:'private',ownerId:73,subjectId:null,levelId:null,curriculumNodeId:null,purposeId:2,createdAt:'',updatedAt:'',categoryId:1,educationStageIds:[8],countryIds:[1],contentLanguage:ar?'ar':'en'}
let questions:QuestionRecord[]=Array.from({length:5},(_,i)=>({id:i+5,ordinal:i+1,kind:'mcq',prompt:ar?'ما العملية التي تحول النص المشفر إلى نص عادي؟':'Which process converts encrypted text back to normal text?',mediaKey:null,videoId:'abcdefghijk',timeLimitS:20,payload:{options:(ar?['فك التشفير','التصيد','الانتحال','التشفير']:['Decryption','Phishing','Spoofing','Encryption']).map((text,j)=>({key:String(j+1),text})),correct:'1'},revision:1}))
activities.load=async()=>({activity,questions,errorPairs:[]})
activities.update=async(_id,patch)=>({activity:activity={...activity,...patch,revision:activity.revision+1}})
activities.updateQuestion=async(id,patch)=>{const q=questions.find(q=>q.id===id)!;const question={...q,...patch,revision:q.revision+1};questions=questions.map(q=>q.id===id?question:q);return {question}}
reference.categories=async()=>[{id:1,name_en:'Computing',name_ar:'الحوسبة'}]
reference.educationStages=async()=>[{id:8,name_en:'University',name_ar:'الجامعة'}]
reference.countries=async()=>({countries:[{id:1,name_en:'Oman',name_ar:'عمان',iso_code:'OM',iso_alpha2:'OM',is_arab:true}],detectedCountryId:1})
taxonomy.purposes=async()=>({purposes:[{id:2,nameEn:'Practice',nameAr:'تدريب'}]})
community.inbox=async()=>({items:[],hasMore:false,summary:{total:0,open:0,reviewed:0,resolved:0}})
createRoot(document.getElementById('root')!).render(<I18nextProvider i18n={i18n}><QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><AuthContext.Provider value={{status:'authenticated',user,accessToken:null,needsProfile:false,signIn:async()=>user,signOut:async()=>{},forgetSession:()=>{},applyUser:()=>{}}}><MemoryRouter initialEntries={['/teacher/activities/42']}><Routes><Route path="/teacher/activities/:id" element={<ActivityEditor/>}/><Route path="*" element={<p>Test destination</p>}/></Routes></MemoryRouter></AuthContext.Provider></QueryClientProvider></I18nextProvider>)
