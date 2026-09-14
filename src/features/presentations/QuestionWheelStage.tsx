import {useEffect,useMemo,useState,type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {Button} from '@/design'
import type {WheelSpin} from '@/shared/wheel'
import {WheelDisc} from '../wheel/RandomWheel'
import {useActivityMotion} from '../activity-themes/useActivityMotion'
import {MotionControl} from '../activity-themes/ActivityStage'
import wheelStyles from '../wheel/Wheel.module.css'
import styles from './Presentations.module.css'

/** Local animation never draws or changes the persisted outcome. Reload resumes server time. */
export function QuestionWheelStage({active,spin,serverNow,children}:{active:boolean;spin?:WheelSpin;serverNow:number;children:ReactNode}){
 const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),motion=useActivityMotion()
 const [skipped,setSkipped]=useState<string|null>(null),[,tick]=useState(0)
 const clock=useMemo(()=>{const received=performance.now();return {now:()=>serverNow+performance.now()-received}},[serverNow])
 const spinning=!!spin&&clock.now()<spin.startedAt+spin.durationMs
 const moving=active&&spinning&&motion.enabled&&skipped!==spin?.id
 useEffect(()=>{if(!active||!spin)return;const timer=setInterval(()=>{tick(n=>n+1);if(clock.now()>=spin.startedAt+spin.durationMs)clearInterval(timer)},80);return()=>clearInterval(timer)},[active,spin,clock])
 if(!active)return children
 return <>
  {spin&&<section className={styles.questionWheel} aria-label={ar?'عجلة الأسئلة':'Question wheel'} data-wheel-phase={moving?'spinning':'selected'}>
   <div className={wheelStyles.wheelFrame} aria-hidden="true"><WheelDisc entries={spin.entries} spin={spin} clock={clock} animate={moving}/><svg className={wheelStyles.pointer} viewBox="0 0 36 44"><path d="M3 3H33L18 39Z" fill="#ffcf36" stroke="#182e48" strokeWidth="4" strokeLinejoin="round"/></svg></div>
   <p role="status">{moving?(ar?'تدور العجلة…':'Spinning…'):(ar?`السؤال المختار: ${spin.entries[spin.winnerIndex]?.label}`:`Selected question: ${spin.entries[spin.winnerIndex]?.label}`)}</p>
   <div className={styles.actions}><MotionControl/>{moving&&<Button onClick={()=>setSkipped(spin.id)}>{ar?'تخطي الحركة':'Skip animation'}</Button>}</div>
  </section>}
  {!moving&&children}
 </>
}
