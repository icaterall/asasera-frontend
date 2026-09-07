import { useEffect,useRef,useState } from 'react'
import type { ServerClock } from './clock'
import type { SessionAudio } from '@/design/audio'
import styles from './Session.module.css'
export function Countdown({endsAt,duration,clock,audio}:{endsAt:number;duration:number;clock:ServerClock;audio:SessionAudio}) {
  const [remaining,setRemaining]=useState(()=>Math.max(0,endsAt-clock.now()))
  const previous=useRef<number|null>(null)
  useEffect(()=>{
    let frame=0;previous.current=null
    function update(){
      const left=Math.max(0,endsAt-clock.now());setRemaining(left)
      const tick=Math.ceil(left/(left<=5000?500:1000))
      if(previous.current!==null&&tick!==previous.current&&left>0&&!document.hidden)audio.play('tick')
      previous.current=tick;frame=requestAnimationFrame(update)
    }
    frame=requestAnimationFrame(update);return()=>cancelAnimationFrame(frame)
  },[endsAt,clock,audio])
  return <div className={styles.timer} role="timer" aria-label={`${Math.ceil(remaining/1000)} seconds`}>
    <svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="43"/><circle cx="50" cy="50" r="43" pathLength="100" strokeDasharray="100" strokeDashoffset={100*(1-Math.min(1,remaining/(duration*1000)))}/></svg>
    <strong>{Math.ceil(remaining/1000)}</strong>
  </div>
}
