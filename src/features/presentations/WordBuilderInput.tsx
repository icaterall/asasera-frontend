import {useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Button} from '@/design'
import type {AttemptPresentation} from '@/shared/delivery'
import type {AnswerPayload} from '@/shared/questions'
import styles from './Presentations.module.css'
export function WordBuilderInput({board,disabled,onAnswer}:{board:NonNullable<AttemptPresentation['wordBuilder']>;disabled:boolean;onAnswer:(answer:AnswerPayload)=>void}){
 const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar')
 const [picks,setPicks]=useState<Record<string,string[]>>({})
 const complete=board.entries.every(entry=>picks[entry.id]?.length===entry.tiles.length)
 return <form onSubmit={e=>{e.preventDefault();if(complete&&!disabled)onAnswer({kind:'vocabulary',values:Object.fromEntries(board.entries.map(entry=>[entry.id,(picks[entry.id]??[]).map(id=>entry.tiles.find(tile=>tile.id===id)!.text).join('')]))})}}>
  <p>{ar?'اختر الحروف بالترتيب. انقر حرفًا في إجابتك لإعادته إلى المجموعة.':'Choose tiles in order. Select a tile in your answer to return it to the bank.'}</p>
  {board.entries.map((entry,index)=>{const chosen=picks[entry.id]??[];return <fieldset key={entry.id} className={styles.wordEntry} disabled={disabled}>
   <legend dir="auto">{entry.clue||`${ar?'الكلمة':'Word'} ${index+1}`}</legend>
   <div className={styles.tileRow} aria-label={ar?'إجابتك':'Your answer'}>{chosen.length?chosen.map((id,position)=>{const tile=entry.tiles.find(t=>t.id===id)!;return <button type="button" key={id} aria-label={ar?`إزالة ${tile.text}، الموضع ${position+1}`:`Remove ${tile.text}, position ${position+1}`} onClick={()=>setPicks(v=>({...v,[entry.id]:chosen.filter(t=>t!==id)}))}>{tile.text===' '?<span aria-hidden="true">␣</span>:tile.text}</button>}):<span className={styles.emptyTiles}>{ar?'رتّب إجابتك هنا':'Build your answer here'}</span>}</div>
   <div className={styles.tileRow} aria-label={ar?'الحروف المتاحة':'Available tiles'}>{entry.tiles.map((tile,i)=>chosen.includes(tile.id)?null:<button type="button" key={tile.id} aria-label={ar?`إضافة ${tile.text}، الحرف ${i+1}`:`Add ${tile.text}, tile ${i+1}`} onClick={()=>setPicks(v=>({...v,[entry.id]:[...chosen,tile.id]}))}>{tile.text===' '?<span aria-hidden="true">␣</span>:tile.text}</button>)}</div>
   {chosen.length>0&&<Button variant="quiet" onClick={()=>setPicks(v=>({...v,[entry.id]:[]}))}>{ar?'إعادة الحروف':'Return all tiles'}</Button>}
  </fieldset>})}
  <Button type="submit" variant="primary" disabled={disabled||!complete}>{ar?'إرسال الإجابة':'Submit answer'}</Button>
 </form>
}
