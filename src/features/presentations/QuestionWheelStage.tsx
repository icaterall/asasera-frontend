import {useEffect,useMemo,useState,type ReactNode} from 'react'
import {Maximize,Minimize,Volume2,VolumeX} from 'lucide-react'
import {useTranslation} from 'react-i18next'
import {Button} from '@/design'
import type {WheelSpin} from '@/shared/wheel'
import {WheelPlayback} from '../wheel/WheelPlayback'
import {useWheelFullscreen} from '../wheel/useWheelFullscreen'
import {SessionAudio} from '@/design/audio'
import {useActivityMotion} from '../activity-themes/useActivityMotion'
import {MotionControl} from '../activity-themes/ActivityStage'
import wheelStyles from '../wheel/Wheel.module.css'
import styles from './Presentations.module.css'

/** Local animation never draws or changes the persisted outcome. Reload resumes server time. */
export function QuestionWheelStage({active,spin,serverNow,children}:{active:boolean;spin?:WheelSpin;serverNow:number;children:ReactNode}){
 const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),motion=useActivityMotion()
 const fullscreen=useWheelFullscreen(),[audio]=useState(()=>new SessionAudio()),[sound,setSound]=useState(false)
 useEffect(()=>()=>audio.dispose(),[audio])
 async function toggleSound(){if(await audio.unlock()){audio.setMuted(sound);setSound(!sound)}}
 const [skipped,setSkipped]=useState<string|null>(null),[,tick]=useState(0)
 const clock=useMemo(()=>{const received=performance.now();return {now:()=>serverNow+performance.now()-received}},[serverNow])
 const spinning=!!spin&&clock.now()<spin.startedAt+spin.durationMs
 const moving=active&&spinning&&motion.enabled&&skipped!==spin?.id
 useEffect(()=>{if(!active||!spin)return;const timer=setInterval(()=>{tick(n=>n+1);if(clock.now()>=spin.startedAt+spin.durationMs)clearInterval(timer)},80);return()=>clearInterval(timer)},[active,spin,clock])
 if(!active)return children
 return <section ref={fullscreen.ref} className={wheelStyles.presentationScreen} data-expanded={fullscreen.expanded} data-fullscreen={fullscreen.full} role={fullscreen.expanded?'dialog':undefined} aria-modal={fullscreen.expanded?true:undefined} aria-label={ar?'عجلة الأسئلة':'Question wheel'}>
  {spin&&<section className={styles.questionWheel} aria-label={ar?'عجلة الأسئلة':'Question wheel'} data-wheel-phase={moving?'spinning':'selected'}>
   {moving&&<WheelPlayback entries={spin.entries} spin={spin} clock={clock} animate={moving} audio={audio}/>}
   <p role="status">{moving?(ar?'تدور العجلة…':'Spinning…'):(ar?`السؤال المختار: ${spin.entries[spin.winnerIndex]?.label}`:`Selected question: ${spin.entries[spin.winnerIndex]?.label}`)}</p>
   <div className={styles.actions}><Button variant="secondary" onClick={()=>void fullscreen.toggle()} aria-label={fullscreen.full?(ar?'الخروج من ملء الشاشة':'Exit fullscreen'):(ar?'ملء الشاشة':'Fullscreen')}>{fullscreen.full?<Minimize size={18}/>:<Maximize size={18}/>}</Button><Button variant="secondary" onClick={()=>void toggleSound()} aria-label={sound?(ar?'كتم الصوت':'Mute sound'):(ar?'تشغيل الصوت':'Turn sound on')}>{sound?<Volume2 size={18}/>:<VolumeX size={18}/>}</Button><MotionControl/>{moving&&<Button onClick={()=>setSkipped(spin.id)}>{ar?'تخطي الحركة':'Skip animation'}</Button>}</div>
  </section>}
  {!moving&&children}
 </section>
}
