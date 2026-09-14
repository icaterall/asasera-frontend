import {useEffect,useRef} from 'react'
import {useTranslation} from 'react-i18next'
import {Check} from 'lucide-react'
import {Button} from '@/design'
import type {AttemptView,AttemptPresentationCommand} from '@/shared/delivery'
import styles from './Presentations.module.css'
import {useActivityMotion} from '../activity-themes/useActivityMotion'
import {MemoryFace} from './MemoryFace'

type Board=NonNullable<NonNullable<AttemptView['presentation']>['memory']>
type Action=Pick<AttemptPresentationCommand,'action'|'cardId'>
/** The server supplies only revealed faces. Hidden card content never enters the DOM. */
export function MemoryBoard({board,busy,onCommand}:{board:Board;busy:boolean;onCommand:(action:Action)=>void}){
 const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),t=(a:string,e:string)=>ar?a:e
 const motion=useActivityMotion(),root=useRef<HTMLElement>(null),restore=useRef(false)
 useEffect(()=>{if(restore.current&&!busy&&board.turn==='first'){restore.current=false;root.current?.querySelector<HTMLButtonElement>('button[data-state=hidden]')?.focus()}},[board.turn,busy])
 return <section ref={root} aria-label={t('لوحة الذاكرة','Memory board')}>
  <div className={styles.memoryProgress} aria-live="polite"><strong>{t(`الأزواج: ${board.pairsFound} من ${board.totalPairs}`,`Pairs: ${board.pairsFound} of ${board.totalPairs}`)}</strong><span>{t(`المحاولات: ${board.moves}`,`Moves: ${board.moves}`)}</span></div>
  <div className={styles.memoryGrid}>{board.cards.map((card,index)=><button type="button" key={card.id} data-state={card.state} disabled={busy||card.state!=='hidden'||board.turn==='mismatch'||board.complete} aria-label={card.state==='hidden'?t(`اكشف البطاقة ${index+1}`,`Reveal card ${index+1}`):t(`البطاقة ${index+1}: ${card.text??''}`,`Card ${index+1}: ${card.text??''}`)} onClick={()=>onCommand({action:'memory-flip',cardId:card.id})}>
   <MemoryFace state={card.state} motion={motion.enabled}>{card.state==='hidden'?<span className={styles.memoryBack} aria-hidden="true">{index+1}</span>:<><span dir="auto">{card.text}</span>{card.state==='matched'&&<Check size={18} aria-label={t('زوج متطابق','Matched pair')}/>}</>}</MemoryFace>
  </button>)}</div>
  {board.turn==='mismatch'&&<div className={styles.actions}><p role="status">{t('ليسا زوجًا. قارن البطاقتين، ثم حاول مجددًا.','Not a pair. Compare the cards, then try again.')}</p><Button disabled={busy} onClick={()=>{restore.current=true;onCommand({action:'memory-continue'})}}>{t('اقلب البطاقتين','Turn cards over')}</Button></div>}
  {board.complete&&<p role="status">{t('وجدت جميع الأزواج. هذا تدريب ذاكرة وليس درجة اختبار.','All pairs found. This is memory practice, not a test grade.')}</p>}
 </section>
}
