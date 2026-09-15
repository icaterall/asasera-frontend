import {useId,useLayoutEffect,useRef} from 'react'
import type {WheelEntry,WheelSpin} from '@/shared/wheel'
import {interactiveMotion} from '@/shared/interactive-motion'
import styles from './Wheel.module.css'

export const WHEEL_ZOOM_MS=850
export const WHEEL_EXIT_MS=700
export const wheelExitDuration=(spin:WheelSpin)=>Math.min(WHEEL_EXIT_MS,spin.durationMs*.15)
export const wheelRotationDuration=(spin:WheelSpin)=>Math.max(1,spin.durationMs-Math.min(WHEEL_ZOOM_MS,spin.durationMs*.2)-wheelExitDuration(spin))

/** The server uses a top pointer. Rotating the whole drawing -90° puts that
 * same selected segment at the reference's left pointer, without a new draw. */
export function WheelDisc({entries,spin,clock,animate,numbered=false,reference=false}:{entries:WheelEntry[];spin:WheelSpin|null;clock:{now:()=>number};animate:boolean;numbered?:boolean;reference?:boolean}){
 const rotor=useRef<SVGGElement>(null),gradient=useId().replace(/:/g,'')
 useLayoutEffect(()=>{
  const target=rotor.current;if(!target)return
  if(!spin){target.style.transform='rotate(0deg)';return}
  const elapsed=clock.now()-spin.startedAt,duration=reference?wheelRotationDuration(spin):spin.durationMs
  if(!animate||elapsed>=duration||!target.animate){target.style.transform=`rotate(${spin.toRotation}deg)`;return}
  const animation=target.animate([{transform:`rotate(${spin.fromRotation}deg)`},{transform:`rotate(${spin.toRotation}deg)`}],{duration,easing:interactiveMotion.easing.spin,fill:'both'})
  animation.currentTime=elapsed
  return()=>animation.cancel()
 },[spin,clock,animate,reference])
 const count=entries.length||4,angle=360/count,radius=178
 const point=(degrees:number)=>[200+radius*Math.cos(degrees*Math.PI/180),200+radius*Math.sin(degrees*Math.PI/180)]
 const colors=reference?['#087eaf','#bb123b','#b8580b','#248a42','#633dc8','#b829ae']:['#b97600','#b92038','#7045c8','#245fcb','#14833c','#087f77','#b9530c','#be276c']
 return <svg className={styles.disc} viewBox="0 0 400 400" data-wheel-disc="" data-pointer-angle={reference?'180':'270'}>
  <defs><linearGradient id={gradient} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".2"/><stop offset="1" stopColor="#000" stopOpacity=".14"/></linearGradient></defs>
  <circle cx="200" cy="200" r="183" fill="#fff" stroke="#c4c8cc" strokeWidth="2"/>
  <g transform={reference?'rotate(-90 200 200)':undefined}>
   <g ref={rotor} className={styles.rotor} style={{transform:`rotate(${spin?.fromRotation??0}deg)`}} data-wheel-rotor="">
    {Array.from({length:count},(_,i)=>{
     const start=-90+i*angle,end=start+angle,[x1,y1]=point(start),[x2,y2]=point(end),middle=start+angle/2,label=entries[i]?.label??''
     const short=Array.from(label).length>15?Array.from(label).slice(0,14).join('')+'…':label
     // Radial labels keep the same geometry for Latin and Arabic. Explicit LTR
     // anchors prevent inherited RTL from pushing text out of the wheel.
     return <g key={entries[i]?.id??i}>
      {count===1?<circle cx="200" cy="200" r={radius} fill={colors[i%colors.length]}/>:<path d={`M200 200 L${x1} ${y1} A${radius} ${radius} 0 ${angle>180?1:0} 1 ${x2} ${y2} Z`} fill={colors[i%colors.length]} stroke="#fff" strokeWidth={count>60?.6:1.5}/>}
      {label&&count<=60&&<text x={reference?63:337} y="200" fill="#fff" fontSize={numbered?19:count<=8?15:count<=16?12:11} fontWeight="600" textAnchor={reference?'start':'end'} dominantBaseline="middle" transform={`rotate(${reference?middle+180:middle},200,200)`} direction="ltr">{numbered||count>16?String(i+1):short}</text>}
     </g>
    })}
   </g>
  </g>
  <circle cx="200" cy="200" r={radius} fill={`url(#${gradient})`} pointerEvents="none"/>
  <circle cx="200" cy="200" r="28" fill="#fff" stroke="#b7bdc2" strokeWidth="2"/><circle cx="200" cy="200" r="24" fill="#fff" stroke="#e4e7e9" strokeWidth="1"/>
 </svg>
}
