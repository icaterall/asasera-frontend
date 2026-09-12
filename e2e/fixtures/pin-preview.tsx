import {createRoot} from 'react-dom/client'
import {createInstance} from 'i18next'
import {I18nextProvider} from 'react-i18next'
import '@fontsource/montserrat/latin-400.css'
import '@fontsource/montserrat/latin-700.css'
import '@/index.css'
import {HotspotCanvas} from '@/features/editor/HotspotCanvas'
import type {HotspotPayload} from '@/shared/questions'
import type {QuestionRecord} from '@/lib/api'

// Mount the real editor workspace and styles; all API traffic is intercepted
// by the browser test. No account, saved activity, or live session is needed.
const params=new URLSearchParams(location.search),ar=params.get('lang')==='ar',circle=params.get('shape')==='circle',long=params.has('long')
const i18n=createInstance()
await i18n.init({lng:ar?'ar':'en',resources:{en:{translation:{}},ar:{translation:{}}}})
document.documentElement.lang=ar?'ar':'en'
document.documentElement.dir=ar?'rtl':'ltr'
const payload:HotspotPayload={
  mode:'card_to_zone',imageKey:'pin-layout-fixture.svg',
  zones:[.765,.515,.265,.015].map((x,index)=>({key:`z${index+1}`,shape:circle?'circle':'rect',x,y:.74,w:.21,h:.23})),
  cards:(long?(ar?['زجاجة الحليب','الجهاز الهضمي','ثاني أكسيد الكربون','الجهاز العصبي']:['Milk bottle','Digestive system','Carbon dioxide','Nervous system']):(ar?['حليب','خبز','عصير','بيض']:['Milk','Bread','Juice','Egg'])).map((text,index)=>({key:`c${index+1}`,text})),
  map:{c1:'z1',c2:'z2',c3:'z3',c4:'z4'},
}
const question:QuestionRecord={id:1,revision:1,ordinal:1,kind:'hotspot',prompt:ar?'قم بتوصيل ما يناسب الصورة':'Match the labels to the picture',mediaKey:payload.imageKey,timeLimitS:20,payload}
createRoot(document.getElementById('root')!).render(<I18nextProvider i18n={i18n}>
  <main className="asas" style={{maxWidth:1100,margin:'0 auto',padding:8}}>
    <HotspotCanvas activityId={1} question={question} p={payload} onChange={()=>{}} onConfirm={()=>{}} onPrepare={async()=>question} onApplied={async()=>{}}/>
  </main>
</I18nextProvider>)
