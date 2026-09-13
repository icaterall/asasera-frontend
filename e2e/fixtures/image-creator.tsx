import {createRoot} from 'react-dom/client'
import {useState} from 'react'
import {createInstance} from 'i18next'
import {I18nextProvider} from 'react-i18next'
import {QueryClient,QueryClientProvider} from '@tanstack/react-query'
import {MemoryRouter} from 'react-router-dom'
import '@fontsource/montserrat/latin-400.css'
import '@fontsource/montserrat/latin-700.css'
import '@/index.css'
import {ImageCreationProvider} from '@/features/editor/ImageCreator'
import {MediaField} from '@/features/editor/MediaPicker'
const params=new URLSearchParams(location.search),ar=params.get('lang')==='ar',i18n=createInstance()
await i18n.init({lng:ar?'ar':'en',resources:{en:{translation:{}},ar:{translation:{}}}})
document.documentElement.dir=ar?'rtl':'ltr';document.documentElement.lang=ar?'ar':'en'
document.documentElement.classList.toggle('dark',params.get('theme')==='dark')
function Fixture(){const [selected,setSelected]=useState(''),[clip,setClip]=useState<{start:number|null;end:number|null}>({start:null,end:null});return <main className="asas" style={{padding:24}}>
 <ImageCreationProvider activityId={42} questionId={7} onPrepare={async()=>{}} videoId={params.has('video')?selected:null} videoStartS={clip.start} videoEndS={clip.end} onVideo={(id,start=null,end=null)=>{setSelected(id??'');setClip({start,end})}}>
  <MediaField imageKey={null} onImage={setSelected} onRemove={()=>{}} label="Open media"/>
 </ImageCreationProvider><output>{selected}</output>
</main>}
createRoot(document.getElementById('root')!).render(<I18nextProvider i18n={i18n}><QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><MemoryRouter><Fixture/></MemoryRouter></QueryClientProvider></I18nextProvider>)
