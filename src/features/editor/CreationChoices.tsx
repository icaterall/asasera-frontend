import {Files,Lightbulb,Plus,Sparkles,ArrowRight} from 'lucide-react'
import {useTranslation} from 'react-i18next'
import styles from './CreationChoices.module.css'
export type CreationMethod='file'|'topic'|'manual'
export function CreationChoices({onChoose,busy=false}:{onChoose:(method:CreationMethod)=>void;busy?:boolean}){
 const {t}=useTranslation()
 return <div className={styles.grid}>{([
  ['file',Files,'fileCard','fileCardDescription'],['topic',Lightbulb,'topicCard','topicCardDescription'],['manual',Plus,'blankCard','manualDescription']
 ] as const).map(([method,Icon,title,description])=><button key={method} type="button" className={styles.card} data-method={method} disabled={busy} aria-label={String(t(`questionCreation.${title}`))} onClick={()=>onChoose(method)}><span className={styles.art} aria-hidden="true">{method!=='manual'&&<span className={styles.badge}><Sparkles size={14}/>Asasera AI</span>}<Icon className={styles.icon} size={58} strokeWidth={1.8}/></span><span className={styles.content}><strong className={styles.title}>{t(`questionCreation.${title}`)}</strong><span className={styles.description}>{t(`questionCreation.${description}`)}</span><span className={styles.action}>{t(`questionCreation.${method}Action`)}<ArrowRight className={styles.arrow} size={18}/></span></span></button>)}</div>
}
