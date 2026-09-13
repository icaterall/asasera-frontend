import {createRoot} from 'react-dom/client'
import {createInstance} from 'i18next'
import {I18nextProvider} from 'react-i18next'
import {QueryClient,QueryClientProvider} from '@tanstack/react-query'
import '@fontsource/montserrat/latin-400.css'
import '@fontsource/montserrat/latin-700.css'
import '@/index.css'
import {FileMetadataStatus} from '@/features/editor/FileMetadataStatus'
import styles from '@/features/editor/GenerationPanel.module.css'

const params=new URLSearchParams(location.search),ar=params.get('lang')==='ar',i18n=createInstance()
await i18n.init({lng:ar?'ar':'en',resources:{en:{translation:{}},ar:{translation:{}}}})
document.documentElement.dir=ar?'rtl':'ltr'
document.documentElement.lang=ar?'ar':'en'
document.documentElement.classList.toggle('dark',params.get('theme')==='dark')
createRoot(document.getElementById('root')!).render(<I18nextProvider i18n={i18n}><QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}>
 <main className="asas" style={{maxWidth:800,margin:'24px auto',padding:16}}>
  <section className={styles.fileSummary}>
   <strong>{ar?'دورة الماء.pdf':'Water cycle.pdf'}</strong>
   <FileMetadataStatus revisionId={42}/>
   <label><input type="checkbox"/>{ar?'الصفحة ١':'Page 1'}</label>
  </section>
 </main>
</QueryClientProvider></I18nextProvider>)
