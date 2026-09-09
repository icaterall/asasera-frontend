import type {GameMode} from '@/shared/arcade'
import {Check,Gamepad2} from 'lucide-react'
import {useTranslation} from 'react-i18next'
import {ThemeThumbnail} from '../activity-themes/ActivityStage'
import {games} from './catalog'
import styles from './Games.module.css'
export function GameModePicker({value,onChange,disabled=false,classic=true}:{value:GameMode;onChange:(value:GameMode)=>void;disabled?:boolean;classic?:boolean}){
 const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar')
 return <fieldset className={styles.modePicker} disabled={disabled}><legend><Gamepad2/>{ar?'اختر تجربة اللعب':'Choose your game experience'}</legend><div className={styles.modeGrid}>
  {classic&&<label className={styles.modeCard} data-selected={value==='quiz'}><input type="radio" name="game-experience" value="quiz" checked={value==='quiz'} onChange={()=>onChange('quiz')}/><ThemeThumbnail theme="classic"/><div><h3>{ar?'المسابقة الكلاسيكية':'Classic quiz'}{value==='quiz'&&<Check size={18}/>}</h3><p>{ar?'سؤال، إجابات، ترتيب. يتحكم المعلم في وتيرة الحصة.':'Questions, answers and a podium. The teacher sets the pace.'}</p></div></label>}
  {games.map(game=><label key={game.id} className={styles.modeCard} data-selected={value===game.id}><input type="radio" name="game-experience" value={game.id} checked={value===game.id} onChange={()=>onChange(game.id)}/><ThemeThumbnail theme={game.theme}/><div><h3>{ar?game.ar:game.en}{value===game.id&&<Check size={18}/>}</h3><p>{ar?game.description.ar:game.description.en}</p></div></label>)}
 </div></fieldset>
}
