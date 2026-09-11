import {useEffect,useRef,useState} from 'react'
import {BackLink} from '@/design/BackLink'
import {useTranslation} from 'react-i18next'
import {useAuth} from '@/hooks/useAuth'
import {newWheel,wheelStateSchema,eligibleWheelEntries,wheelIsSpinning,makeWheelSpin,randomWheelIndex,type WheelCommand,type WheelState} from '@/shared/wheel'
import {RandomWheel} from './RandomWheel'
import styles from './Wheel.module.css'

const KEY='asasera.teacher.random-wheel.v1'
function savedWheel(storageKey:string):WheelState{
 try{const stored=wheelStateSchema.safeParse(JSON.parse(localStorage.getItem(storageKey)??'null'));if(stored.success&&stored.data.source==='custom'&&(!stored.data.spin||stored.data.spin.winnerIndex<stored.data.spin.entries.length))return {...stored.data,visible:true}}catch{/* The wheel also works without local storage. */}
 return {...newWheel('custom'),visible:true}
}
export default function WheelPage(){
 const {user}=useAuth()
 return user?<SavedWheel key={user.id} storageKey={`${KEY}:${user.id}`}/>:null
}
function SavedWheel({storageKey}:{storageKey:string}){
 const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),[wheel,setWheel]=useState(()=>savedWheel(storageKey)),[clock]=useState(()=>({now:Date.now})),[version,setVersion]=useState(0),[stored,setStored]=useState(true),[now,setNow]=useState(Date.now)
 const current=useRef(wheel)
 useEffect(()=>{if(!wheel.spin)return;const timer=setTimeout(()=>setNow(Date.now()),Math.max(0,wheel.spin.startedAt+wheel.spin.durationMs-Date.now()+50));return()=>clearTimeout(timer)},[wheel.spin])
 function save(next:WheelState){current.current=next;setWheel(next);try{localStorage.setItem(storageKey,JSON.stringify(next));setStored(true)}catch{setStored(false)}}
 async function command(action:WheelCommand){
  const prior=current.current,now=Date.now()
  if(wheelIsSpinning(prior,now))throw Error(ar?'انتظر حتى تتوقف العجلة.':'Wait for the wheel to finish.')
  let next=structuredClone(prior)
  if(action.action==='configure'){
   const entries=(action.labels??[]).map((label,index)=>({id:`custom-${index}`,label}));if(!entries.length)throw Error(ar?'أضف خيارًا واحدًا على الأقل.':'Add at least one entry.')
   if(JSON.stringify(entries)!==JSON.stringify(next.entries)){next.spin=null;next.pickedIds=[]}
   next={...next,source:'custom',entries,avoidRepeats:action.avoidRepeats}
  }else if(action.action==='reset'){next.pickedIds=[];next.spin=null}
  else if(action.action==='spin'){
   const entries=eligibleWheelEntries(next)
   if(!entries.length)throw Error(ar?'أعد الأسماء أو أضف خيارات جديدة.':'Reset picks or add more entries.')
   const index=randomWheelIndex(entries.length,()=>crypto.getRandomValues(new Uint32Array(1))[0]!)
   next.spin=makeWheelSpin(entries,index,next.spin?.toRotation??0,now,crypto.randomUUID(),action.animate??true)
   if(!next.pickedIds.includes(entries[index]!.id))next.pickedIds.push(entries[index]!.id)
  }
  save(next)
 }
 return <div className={`asas ${styles.page}`} dir={ar?'rtl':'ltr'}><RandomWheel key={version} wheel={wheel} clock={clock} onCommand={command} standalone headerAction={<BackLink to="/teacher/tools">{ar?'أدوات المعلم':'Teacher tools'}</BackLink>}/>
  <p className={styles.storage}>{stored?(ar?'تُحفظ قائمتك واختياراتك في هذا المتصفح.':'Your list and picks are saved in this browser.'):(ar?'التخزين غير متاح في هذا المتصفح. تعمل العجلة لهذه الزيارة.':'Browser storage is unavailable. The wheel works for this visit.')}
   <button type="button" disabled={!!wheel.spin&&wheelIsSpinning(wheel,now)} onClick={()=>{save({...newWheel('custom'),visible:true});setVersion(v=>v+1)}}>{ar?'مسح القائمة والاختيارات':'Clear list and picks'}</button>
  </p>
 </div>
}
