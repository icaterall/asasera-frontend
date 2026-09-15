import {useEffect,useLayoutEffect,useRef} from 'react'
import type {WheelEntry,WheelSpin} from '@/shared/wheel'
import type {SessionAudio} from '@/design/audio'
import {WheelDisc,wheelExitDuration,wheelRotationDuration} from './WheelDisc'
import styles from './WheelPlayback.module.css'

/** One visual sequence for names, questions, live classes and individual play.
 * No randomness here: animation and sound project the committed server spin. */
export function WheelPlayback({entries,spin,clock,animate,numbered=false,audio}:{entries:WheelEntry[];spin:WheelSpin|null;clock:{now:()=>number};animate:boolean;numbered?:boolean;audio?:SessionAudio}){
 const camera=useRef<HTMLDivElement>(null),completed=useRef<string|null>(null)
 useLayoutEffect(()=>{
  const target=camera.current;if(!target)return
  target.style.transform='none'
  target.style.opacity='1'
  if(!animate||!spin||spin.durationMs===0||!target.animate)return
  const elapsed=clock.now()-spin.startedAt
  if(elapsed>=spin.durationMs)return
  const start=wheelRotationDuration(spin)/spin.durationMs
  const exitStart=1-wheelExitDuration(spin)/spin.durationMs
  // Leave to the physical right in both languages. Movement starts before
  // fading, and stays inside the committed spin window so reveal and timing
  // remain synchronized across the instructor, learner and projector.
  const animation=target.animate([
   {transform:'translateX(0) scale(1)',opacity:1,offset:0},
   {transform:'translateX(0) scale(1)',opacity:1,offset:start},
   {transform:'translateX(0) scale(2.25)',opacity:1,offset:exitStart},
   {transform:'translateX(25%) scale(2.25)',opacity:1,offset:exitStart+(1-exitStart)*.25,easing:'ease-out'},
   {transform:'translateX(110%) scale(2.25)',opacity:0,offset:1},
  ],{duration:spin.durationMs,fill:'both',easing:'linear'})
  animation.currentTime=elapsed
  return()=>animation.cancel()
 },[spin,clock,animate])
 useEffect(()=>{
  if(!audio||!spin||!animate||spin.durationMs===0)return
  let frame=0,lastBoundary:number|null=null,lastTick=-Infinity
  const duration=wheelRotationDuration(spin)
  // Use the renderer's actual eased progress. A delayed frame produces one
  // tick at most, never a burst of the ticks missed while the tab was hidden.
  const draw=()=>{
   const elapsed=clock.now()-spin.startedAt
   if(elapsed>=duration){
    if(completed.current!==spin.id&&elapsed<duration+180&&!document.hidden){audio.play('lock');completed.current=spin.id}
    return
   }
   const rotor=camera.current?.querySelector('[data-wheel-rotor]')
   const progress=rotor?.getAnimations()[0]?.effect?.getComputedTiming().progress
   if(elapsed>=0&&elapsed<duration&&typeof progress==='number'){
    const rotation=spin.fromRotation+(spin.toRotation-spin.fromRotation)*progress
    const boundary=Math.floor(rotation/(360/Math.min(spin.entries.length,60)))
    if(lastBoundary!==null&&boundary!==lastBoundary&&elapsed-lastTick>=65&&!document.hidden){audio.playWheelTick();lastTick=elapsed}
    lastBoundary=boundary
   }else lastBoundary=null
   frame=requestAnimationFrame(draw)
  }
  frame=requestAnimationFrame(draw)
  return()=>cancelAnimationFrame(frame)
 },[spin,clock,animate,audio])
 return <div className={styles.viewport} data-wheel-playback="" aria-hidden="true">
  <div ref={camera} className={styles.camera}>
   <WheelDisc entries={entries} spin={spin} clock={clock} animate={animate} numbered={numbered} reference/>
   <svg className={styles.pointer} viewBox="0 0 48 40"><path d="M2 10H21V2L45 20 21 38V30H2Z" fill="var(--surface, #fff)" stroke="#8b939b" strokeWidth="1.5"/></svg>
  </div>
 </div>
}
