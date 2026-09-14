import {useEffect,useRef,type ReactNode} from 'react'
import {interactiveMotion} from '@/shared/interactive-motion'
import {useActivityMotion} from '../activity-themes/useActivityMotion'

/** A local placement acknowledgement, never persistence or correctness feedback. */
export function PlacementFeedback({value,children}:{value:string;children:ReactNode}){
 const ref=useRef<HTMLSpanElement>(null),previous=useRef(value),motion=useActivityMotion()
 useEffect(()=>{
  const changed=previous.current!==value;previous.current=value
  const node=ref.current
  if(!changed||!value||!motion.enabled||!node||typeof node.animate!=='function')return
  const animation=node.animate([{transform:'translateY(4px)',opacity:.65},{transform:'translateY(0)',opacity:1}],{duration:interactiveMotion.duration.placement,easing:interactiveMotion.easing.enter})
  return()=>animation.cancel()
 },[value,motion.enabled])
 return <span ref={ref} style={{display:'block'}}>{children}</span>
}
