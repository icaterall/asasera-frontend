import { useEffect,useRef,useState } from 'react'
import type { ServerClock } from './clock'
import type { SessionAudio } from '@/design/audio'
import styles from './Session.module.css'
import {questionTime} from './questionPresentation'
export function Countdown({endsAt,duration,clock,audio,ar=false,onExpire}:{endsAt:number;duration:number;clock:ServerClock;audio:SessionAudio;ar?:boolean;onExpire?:()=>void}) {
  const [remaining,setRemaining]=useState(()=>Math.max(0,endsAt-clock.now()))
  const previous=useRef<number|null>(null)
  const expire=useRef(onExpire)
  useEffect(()=>{expire.current=onExpire},[onExpire])
  useEffect(()=>{
    let frame=0,lastBucket=-1;previous.current=null
    function update(){
      const left=questionTime(endsAt,clock.now(),duration).remaining
      const bucket=Math.ceil(left/100)
      if(bucket!==lastBucket){setRemaining(left);lastBucket=bucket}
      const tick=Math.ceil(left/(left<=5000?500:1000))
      if(previous.current!==null&&tick!==previous.current&&left>0&&!document.hidden)audio.play('tick')
      previous.current=tick
      if(left===0){expire.current?.();return}
      frame=requestAnimationFrame(update)
    }
    update();return()=>cancelAnimationFrame(frame)
  },[endsAt,duration,clock,audio])
  const time=questionTime(endsAt,endsAt-remaining,duration)
  return <div className={styles.timer} role="timer" data-urgent={time.urgent} aria-label={ar?`${time.seconds} ثانية متبقية`:`${time.seconds} seconds remaining`}>
    <svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="43"/><circle cx="50" cy="50" r="43" pathLength="100" strokeDasharray="100" strokeDashoffset={100*(1-time.fraction)}/></svg>
    <strong>{time.seconds}</strong>
  </div>
}
