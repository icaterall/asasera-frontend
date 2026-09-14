import {useEffect,useRef,useState} from 'react'
import {Check,LockKeyhole} from 'lucide-react'
import {Button} from '@/design'
import {FormattedText} from '@/components/formatted-text/FormattedText'
import type {MemoryView} from '@/shared/memory'
import type {LivePresentationCommand} from '@/shared/live-presentation'
import styles from './LiveMemoryBoard.module.css'
import {useActivityMotion} from '../activity-themes/useActivityMotion'
import {MemoryFace} from '../presentations/MemoryFace'

export function LiveMemoryBoard({board,host,ar,disabled,contentLanguage,onCommand}:{board:MemoryView;host:boolean;ar:boolean;disabled:boolean;contentLanguage?:string;onCommand:(command:LivePresentationCommand)=>Promise<unknown>}){
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),t=(a:string,e:string)=>ar?a:e
 const motion=useActivityMotion(),root=useRef<HTMLElement>(null),restore=useRef(false)
 useEffect(()=>{if(restore.current&&!busy&&!disabled&&board.turn==='first'){restore.current=false;root.current?.querySelector<HTMLButtonElement>('button[data-state=hidden]')?.focus()}},[board.turn,busy,disabled])
 async function command(input:LivePresentationCommand){if(disabled||busy)return;setBusy(true);setError('');try{await onCommand(input)}catch(error){setError(error instanceof Error?error.message:t('تعذّر حفظ الحركة. أعد المحاولة.','Could not save this move. Retry.'))}finally{setBusy(false)}}
 return <section ref={root} className={styles.board} aria-label={t('لوحة الذاكرة المشتركة','Shared memory board')}>
  <p role="status">{board.complete?t('اكتملت الأزواج؛ هذا تدريب جماعي، وليس درجة فردية.','All pairs found; this is shared practice, not an individual grade.'):host?board.turn==='second'?t('اقلب بطاقة ثانية.','Flip a second card.'):board.turn==='mismatch'?t('اقرؤوا البطاقتين، ثم أعيدوهما قبل المتابعة.','Read both cards, then turn them back before continuing.'):t('اقلب بطاقة لتبدأ.','Flip a card to begin.'):t('تابعوا اللوحة؛ المعلّم يقلب البطاقات.','Follow the board; your teacher turns the cards.')}</p>
  <p>{t(`${board.pairsFound} من ${board.totalPairs} أزواج · ${board.moves} محاولات`,`${board.pairsFound} of ${board.totalPairs} pairs · ${board.moves} moves`)}</p>
  <ol className={styles.cards}>{board.cards.map((card,index)=>{
   const face=<MemoryFace state={card.state} motion={motion.enabled}>{card.state==='hidden'?<><LockKeyhole size={24} aria-hidden="true"/><strong>{index+1}</strong></>:<><span dir="auto" lang={contentLanguage}><FormattedText text={card.text??''}/></span>{card.state==='matched'&&<Check size={22} aria-label={t('زوج مطابق','Matched pair')}/>}</>}</MemoryFace>
   return <li key={card.id}>{host?<button type="button" className={styles.card} data-state={card.state} aria-label={card.state==='hidden'?t(`اقلب البطاقة ${index+1}`,`Flip card ${index+1}`):undefined} disabled={disabled||busy||card.state!=='hidden'||board.turn==='mismatch'||board.complete} onClick={()=>void command({action:'memory-flip',cardId:card.id})}>{face}</button>:<div className={styles.card} data-state={card.state}>{face}</div>}</li>
  })}</ol>
  {host&&board.turn==='mismatch'&&<Button variant="secondary" disabled={disabled||busy} onClick={()=>{restore.current=true;void command({action:'memory-continue'})}}>{t('أعد البطاقتين','Turn both cards back')}</Button>}
  {error&&<p role="alert">{error}</p>}
 </section>
}
