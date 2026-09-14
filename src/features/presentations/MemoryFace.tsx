import {useEffect,useRef,type ReactNode} from 'react'
import {interactiveMotion} from '@/shared/interactive-motion'

/** Only the authorized face exists. Animation is a cancellable projection, never a command. */
export function MemoryFace({state,motion,children}:{state:string;motion:boolean;children:ReactNode}){
 const target=useRef<HTMLSpanElement>(null),previous=useRef(state)
 useEffect(()=>{
  const changed=previous.current!==state;previous.current=state
  const element=target.current
  if(!changed||!motion||!element||typeof element.animate!=='function')return
  const animation=element.animate([{transform:'scaleX(.94)'},{transform:'scaleX(1)'}],{duration:interactiveMotion.duration.flip,easing:interactiveMotion.easing.enter})
  return()=>animation.cancel()
 },[state,motion])
 return <span ref={target} style={{display:'inline-flex',alignItems:'center',justifyContent:'center',gap:8,minWidth:0}}>{children}</span>
}
