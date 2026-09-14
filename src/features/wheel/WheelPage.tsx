import {useEffect,useRef,useState} from 'react'
import {BackLink} from '@/design/BackLink'
import {Button} from '@/design/Button'
import {LoadingIndicator} from '@/design/LoadingIndicator'
import {useTranslation} from 'react-i18next'
import {api,ApiError} from '@/lib/api'
import {useAuth} from '@/hooks/useAuth'
import {wheelStateSchema,type WheelCommand,type WheelEntry} from '@/shared/wheel'
import {persistentWheelViewSchema,type PersistentWheelView,type PersistentWheelCommand} from '@/shared/presentation-wheel'
import {RandomWheel} from './RandomWheel'
import styles from './Wheel.module.css'

/** Labels are not identities: duplicate names consume different seats. */
function reconcileEntries(labels:string[],prior:WheelEntry[]):WheelEntry[]{
 const available=[...prior]
 return labels.map(label=>{const index=available.findIndex(e=>e.label===label);return index<0?{id:crypto.randomUUID(),label}:available.splice(index,1)[0]!})
}
type Action=Omit<Extract<PersistentWheelCommand,{action:'configure'}>,'requestId'|'expectedRevision'>|Omit<Extract<PersistentWheelCommand,{action:'spin'}>,'requestId'|'expectedRevision'>|{action:'reset'}|{action:'exclude';entryId:string;excluded:boolean}
export default function WheelPage(){
 const {user}=useAuth(),{i18n}=useTranslation(),ar=i18n.language.startsWith('ar')
 const [view,setView]=useState<PersistentWheelView|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false)
 const [legacy,setLegacy]=useState<WheelEntry[]|null>(null)
 const current=useRef(view),pending=useRef<{signature:string;body:PersistentWheelCommand}|null>(null)
 const clockSample=useRef({server:Date.now(),local:performance.now()})
 const [clock]=useState(()=>({now:()=>clockSample.current.server+performance.now()-clockSample.current.local}))
 function accept(next:PersistentWheelView){clockSample.current={server:next.serverNow,local:performance.now()};current.current=next;setView(next)}
 async function refresh(){try{accept(persistentWheelViewSchema.parse(await api.get('/api/v1/presentations/wheel')));setError('')}catch(e){setError(e instanceof Error?e.message:'Could not load the wheel.')}}
 useEffect(()=>{void refresh();try{const value=wheelStateSchema.safeParse(JSON.parse(localStorage.getItem(`asasera.teacher.random-wheel.v1:${user?.id}`)??'null'));if(value.success&&value.data.entries.length)setLegacy(value.data.entries)}catch{/* A browser-only list is optional. */}},[user?.id]) // eslint-disable-line react-hooks/exhaustive-deps
 async function send(action:Action){
  const prior=current.current;if(!prior)return
  const signature=JSON.stringify(action)
  // Retry an uncertain response with the same intent, never a second draw.
  const intent=pending.current?.signature===signature?pending.current:{signature,body:{...action,requestId:crypto.randomUUID(),expectedRevision:prior.revision} as PersistentWheelCommand}
  pending.current=intent;setBusy(true)
  try{accept(persistentWheelViewSchema.parse(await api.post('/api/v1/presentations/wheel/commands',intent.body)));pending.current=null;setError('')}
  catch(e){if(e instanceof ApiError&&e.status<500){pending.current=null;if(e.status===409)await refresh()}throw e}finally{setBusy(false)}
 }
 async function command(action:WheelCommand){
  if(action.action==='configure')return send({action:'configure',entries:reconcileEntries(action.labels??[],current.current?.wheel.entries??[]),avoidRepeats:action.avoidRepeats})
  if(action.action==='spin')return send({action:'spin',animate:action.animate??true})
  if(action.action==='reset')return send(action)
 }
 async function safe(action:Action){try{await send(action)}catch(e){setError(e instanceof Error?e.message:'Could not save.')}}
 return <div className={`asas ${styles.page}`} dir={ar?'rtl':'ltr'}>
  {!view&&!error&&<LoadingIndicator label={ar?'تحميل العجلة المحفوظة…':'Loading your saved wheel…'}/>}
  {error&&<div role="alert"><p>{error}</p><Button onClick={()=>void refresh()}>{ar?'إعادة التحميل':'Reload'}</Button></div>}
  {view&&<>
   <RandomWheel wheel={view.wheel} excludedIds={view.excludedIds} clock={clock} onCommand={command} standalone headerAction={<BackLink to="/teacher/tools">{ar?'أدوات المعلم':'Teacher tools'}</BackLink>}/>
   <section className={styles.storage}>
    <p>{ar?'تُحفظ القائمة ونتائج السحب في حسابك. لا يستخدم السحب رصيد الذكاء الاصطناعي.':'Your list and draws are saved to your account. Spinning uses no AI credit.'}</p>
    <Button disabled={busy} onClick={()=>void safe({action:'configure',entries:[],avoidRepeats:true})}>{ar?'مسح القائمة':'Clear list'}</Button>
    {legacy&&view.wheel.entries.length===0&&<Button disabled={busy} onClick={()=>{void safe({action:'configure',entries:legacy.map(e=>({...e,id:crypto.randomUUID()})),avoidRepeats:true});setLegacy(null)}}>{ar?'استيراد قائمة هذا المتصفح':'Import this browser’s list'}</Button>}
    {view.wheel.entries.length>0&&<details><summary>{ar?'تضمين الأسماء واستبعادها':'Include or exclude names'}</summary>{view.wheel.entries.map((entry,i)=><label key={entry.id} className={styles.rosterEntry}><input type="checkbox" checked={!view.excludedIds.includes(entry.id)} disabled={busy} onChange={e=>void safe({action:'exclude',entryId:entry.id,excluded:!e.target.checked})}/><span>{i+1}. {entry.label}</span></label>)}</details>}
    {view.history.length>0&&<details><summary>{ar?'سجل السحب':'Draw history'} ({view.history.length})</summary><ol>{[...view.history].reverse().map(item=><li key={item.id}><bdi>{item.entry.label}{item.entryNumber?` (${ar?'الخيار':'Entry'} ${item.entryNumber})`:''}</bdi> · {new Intl.DateTimeFormat(ar?'ar':'en',{dateStyle:'short',timeStyle:'short'}).format(item.at)}</li>)}</ol></details>}
   </section>
  </>}
 </div>
}
