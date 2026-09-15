import {useEffect,useRef,useState} from 'react'

/** Native fullscreen when available, with a keyboard-safe expanded view for
 * browsers that do not offer element fullscreen (including some phones). */
export function useWheelFullscreen(){
 const ref=useRef<HTMLElement>(null),trigger=useRef<HTMLElement|null>(null)
 const [full,setFull]=useState(false),[expanded,setExpanded]=useState(false)
 useEffect(()=>{const change=()=>setFull(document.fullscreenElement===ref.current);document.addEventListener('fullscreenchange',change);return()=>document.removeEventListener('fullscreenchange',change)},[])
 useEffect(()=>{
  if(!expanded)return
  const previous=document.body.style.overflow;document.body.style.overflow='hidden'
  const key=(event:KeyboardEvent)=>{
   if(event.key==='Escape'){setExpanded(false);trigger.current?.focus()}
   if(event.key==='Tab'){
    const controls=Array.from(ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),textarea:not(:disabled),a[href],summary,[tabindex="0"]')??[]).filter(element=>element.getClientRects().length)
    const first=controls[0],last=controls.at(-1)
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}
   }
  }
  document.addEventListener('keydown',key)
  return()=>{document.body.style.overflow=previous;document.removeEventListener('keydown',key)}
 },[expanded])
 async function toggle(){
  if(expanded){setExpanded(false);trigger.current?.focus();return}
  if(full){await document.exitFullscreen().catch(()=>{});trigger.current?.focus();return}
  trigger.current=document.activeElement as HTMLElement|null
  try{if(ref.current?.requestFullscreen){await ref.current.requestFullscreen();return}}catch{/* Expanded view remains available. */}
  setExpanded(true)
 }
 return {ref,full:full||expanded,expanded,toggle}
}
