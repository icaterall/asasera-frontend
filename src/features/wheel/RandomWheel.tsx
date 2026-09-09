import { Select } from '@/design'
import {useEffect,useId,useLayoutEffect,useRef,useState} from 'react'
import {useTranslation} from 'react-i18next'
import {RotateCw,RotateCcw,ChevronDown,X,Check,Users} from 'lucide-react'
import {eligibleWheelEntries,wheelIsSpinning,type WheelState,type WheelCommand,type WheelEntry,type WheelSpin} from '@/shared/wheel'
import {useActivityMotion} from '../activity-themes/useActivityMotion'
import styles from './Wheel.module.css'

type Props={wheel:WheelState;clock:{now:()=>number};onCommand?:(command:WheelCommand)=>Promise<unknown>;connected?:boolean;standalone?:boolean}
const colors=[['#004ccc','#fff'],['#ffcf36','#182e48'],['#1b650a','#fff'],['#e21b3c','#fff']] as const
export function RandomWheel({wheel,clock,onCommand,connected=true,standalone=false}:Props){
 const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),t=(a:string,e:string)=>ar?a:e,motion=useActivityMotion()
 const [now,setNow]=useState(()=>clock.now()),[busy,setBusy]=useState(false),[error,setError]=useState('')
 const [source,setSource]=useState(wheel.source),[list,setList]=useState(()=>wheel.source==='custom'?wheel.entries.map(e=>e.label).join('\n'):''),[settings,setSettings]=useState(standalone&&wheel.entries.length===0)
 const inFlight=useRef(false),titleId=useId(),listId=useId()
 const spinning=wheelIsSpinning(wheel,now),eligible=eligibleWheelEntries(wheel),entries=wheel.spin?.entries??eligible
 const finished=!!wheel.spin&&!spinning,winner=finished?wheel.spin!.entries[wheel.spin!.winnerIndex]:null
 const visiblePicks=spinning&&wheel.spin?wheel.pickedIds.filter(id=>id!==wheel.spin!.entries[wheel.spin!.winnerIndex]?.id):wheel.pickedIds
 useEffect(()=>{if(!wheel.spin)return;const timer=setInterval(()=>{const time=clock.now();setNow(time);if(time>=wheel.spin!.startedAt+wheel.spin!.durationMs)clearInterval(timer)},80);return()=>clearInterval(timer)},[wheel.spin,clock])
 async function act(command:WheelCommand){
  if(!onCommand||inFlight.current||!connected)return false
  inFlight.current=true;setBusy(true);setError('')
  try{await onCommand(command);return true}catch(e){setError(e instanceof Error?e.message:t('تعذّر إكمال الطلب. أعد المحاولة.','Could not complete the request. Try again.'));return false}finally{inFlight.current=false;setBusy(false)}
 }
 const disabled=busy||spinning||!connected,Heading=standalone?'h1':'h2'
 return <section className={`asas ${styles.panel}`} aria-labelledby={titleId} dir={ar?'rtl':'ltr'} data-random-wheel="" data-wheel-state={spinning?'spinning':winner?'selected':'ready'}>
  <header className={styles.header}><div><Heading id={titleId}>{t('عجلة الاختيار العشوائي','Random wheel')}</Heading><p>{t('دورة واحدة، وفرصة متساوية لكل اسم أو خيار.','One spin. An equal chance for every entry.')}</p></div>{onCommand&&!standalone&&<button type="button" className={styles.close} disabled={disabled} onClick={()=>void act({action:'close'})}><X size={19}/>{t('العودة للحصة','Back to class')}</button>}</header>
  <div className={styles.layout}>
   <div className={styles.game}>
    <div className={styles.wheelFrame} aria-hidden="true">
     <WheelDisc entries={entries} spin={wheel.spin} clock={clock} animate={motion.enabled}/>
     <svg className={styles.pointer} viewBox="0 0 36 44"><path d="M3 3H33L18 39Z" fill="#ffcf36" stroke="#182e48" strokeWidth="4" strokeLinejoin="round"/></svg>
    </div>
    <div className={styles.result} role="status" aria-live="polite" aria-atomic="true">
     {spinning?<><span>{t('تدور العجلة…','Spinning…')}</span><strong>{t('لمن ستكون الفرصة؟','Whose turn will it be?')}</strong></>:winner?<><span><Check size={20}/>{t('وقع الاختيار على','The wheel chose')}</span><strong>{winner.label}</strong></>:<><span>{t('جاهزون؟','Ready?')}</span><strong>{wheel.entries.length?t('لنرَ من يختار الدور','Let the wheel choose'):t('أضف أسماء أو خيارات للبدء','Add names or items to begin')}</strong></>}
    </div>
    {onCommand?<div className={styles.controls}>
     <button type="button" className={styles.spin} disabled={disabled||eligible.length===0} onClick={()=>void act({action:'spin',animate:motion.enabled})}><RotateCw size={23}/>{spinning?t('تدور العجلة…','Spinning…'):t('أدر العجلة','Spin the wheel')}</button>
     <button type="button" className={styles.reset} disabled={disabled||wheel.pickedIds.length===0} onClick={()=>void act({action:'reset'})}><RotateCcw size={18}/>{t('إعادة جميع الأسماء','Reset picks')}</button>
    </div>:<p className={styles.spectator}>{t('المعلّم يتحكّم بالعجلة.','Your teacher controls the wheel.')}</p>}
    {!spinning&&wheel.entries.length>0&&eligible.length===0&&<p className={styles.notice}>{t('حصل الجميع على دور. أعد الأسماء لبدء جولة جديدة.','Everyone has had a turn. Reset picks to start another round.')}</p>}
    {!connected&&<p className={styles.notice} role="status">{t('جارٍ إعادة الاتصال. تبقى نتيجة الدور كما هي.','Reconnecting. This spin keeps the same result.')}</p>}
    {error&&<p role="alert" className={styles.error}>{error}</p>}
   </div>
   <aside className={styles.side}>
    <div className={styles.entryHeading}><Users size={20}/><h3>{t('في هذه الجولة','In this round')}</h3><strong>{spinning?entries.length:eligible.length}</strong></div>
    {onCommand&&<label className={styles.repeat}><input type="checkbox" checked={wheel.avoidRepeats} disabled={disabled||wheel.entries.length===0} onChange={e=>void act({action:'configure',source:wheel.source,labels:wheel.source==='custom'?wheel.entries.map(e=>e.label):[],avoidRepeats:e.target.checked})}/>{t('لا تكرر الاسم حتى إعادة الجولة','No repeats until picks are reset')}</label>}
    {wheel.source==='participants'&&<p className={styles.hint}>{t('من الطلاب المتصلين بالحصة عند بدء الدور.','Drawn from students connected when the spin starts.')}</p>}
    <ol className={styles.entries}>{wheel.entries.map((entry,i)=><li key={entry.id} data-picked={wheel.avoidRepeats&&visiblePicks.includes(entry.id)}><span>{i+1}</span><span>{entry.label}</span>{wheel.avoidRepeats&&visiblePicks.includes(entry.id)&&<Check size={16} aria-label={t('حصل على دور','Already picked')}/>}</li>)}</ol>
    {!wheel.entries.length&&<p className={styles.hint}>{wheel.source==='participants'?t('تظهر أسماء الطلاب بعد انضمامهم للحصة.','Student names appear after they join the class.'):t('اكتب أسماء أو موضوعات أو أسئلة، كل منها في سطر.','Add names, topics or questions, one per line.')}</p>}
    {onCommand&&<details className={styles.settings} open={settings}><summary onClick={e=>{e.preventDefault();setSettings(value=>!value)}}>{t('خيارات العجلة','Wheel options')}<ChevronDown size={18}/></summary>
     <form onSubmit={e=>{e.preventDefault();const labels=list.split(/\r?\n/).map(line=>line.trim()).filter(Boolean);if(source==='custom'&&(labels.length===0||labels.length>100||labels.some(label=>label.length>120))){setError(t('أضف من 1 إلى 100 خيار، بحد أقصى 120 حرفًا لكل سطر.','Add 1–100 entries, up to 120 characters per line.'));return}void act({action:'configure',source,labels:source==='custom'?labels:[],avoidRepeats:wheel.avoidRepeats}).then(ok=>{if(ok)setSettings(false)})}}>
      {!standalone&&<label>{t('اختر من','Choose from')}<Select value={source} disabled={disabled} onValueChange={e=>setSource(e as WheelState['source'])}><option value="participants">{t('طلاب الحصة','Class participants')}</option><option value="custom">{t('قائمتي الخاصة','My own list')}</option></Select></label>}
      {source==='custom'&&<><label htmlFor={listId}>{t('أسماء أو موضوعات أو أسئلة','Names, topics or questions')}</label><textarea id={listId} value={list} onChange={e=>setList(e.target.value)} rows={6} maxLength={12100} disabled={disabled}/><p className={styles.hint}>{t('خيار واحد في كل سطر. حتى 100 خيار.','One entry per line. Up to 100 entries.')}</p></>}
      <button type="submit" className={styles.apply} disabled={disabled}>{t('استخدم هذه القائمة','Use this list')}</button>
     </form>
    </details>}
   </aside>
  </div>
 </section>
}

function WheelDisc({entries,spin,clock,animate}:{entries:WheelEntry[];spin:WheelSpin|null;clock:{now:()=>number};animate:boolean}){
 const rotor=useRef<SVGGElement>(null)
 useLayoutEffect(()=>{
  const target=rotor.current;if(!target)return
  if(!spin){target.style.transform='rotate(0deg)';return}
  const elapsed=clock.now()-spin.startedAt
  if(!animate||elapsed>=spin.durationMs||!target.animate){target.style.transform=`rotate(${spin.toRotation}deg)`;return}
  const animation=target.animate([{transform:`rotate(${spin.fromRotation}deg)`},{transform:`rotate(${spin.toRotation}deg)`}],{duration:spin.durationMs,easing:'cubic-bezier(.12,.78,.10,1)',fill:'both'})
  animation.currentTime=elapsed
  return()=>animation.cancel()
 },[spin,clock,animate])
 const count=entries.length||4,angle=360/count,radius=178
 const point=(degrees:number)=>[200+radius*Math.cos(degrees*Math.PI/180),200+radius*Math.sin(degrees*Math.PI/180)]
 return <svg className={styles.disc} viewBox="0 0 400 400"><circle cx="200" cy="200" r="196" fill="#12304e"/><circle cx="200" cy="200" r="187" fill="#fff"/>
  <g ref={rotor} className={styles.rotor} style={{transform:`rotate(${spin?.fromRotation??0}deg)`}}>
   {Array.from({length:count},(_,i)=>{const start=-90+i*angle,end=start+angle,[x1,y1]=point(start),[x2,y2]=point(end),middle=start+angle/2,[fill,ink]=colors[i%4]!,label=entries[i]?.label??'',short=Array.from(label).length>15?Array.from(label).slice(0,14).join('')+'…':label
    return <g key={entries[i]?.id??i}>{count===1?<circle cx="200" cy="200" r={radius} fill={fill}/>:<path d={`M200 200 L${x1} ${y1} A${radius} ${radius} 0 ${angle>180?1:0} 1 ${x2} ${y2} Z`} fill={fill} stroke="#fff" strokeWidth={count>60?.6:1.5}/>}{label&&count<=60&&<text x="330" y="200" fill={ink} fontSize={count<=8?15:count<=16?12:11} fontWeight="700" textAnchor="end" dominantBaseline="middle" transform={`rotate(${middle},200,200)`} direction="auto">{count<=16?short:String(i+1)}</text>}</g>
   })}
  </g><circle cx="200" cy="200" r="28" fill="#fff" stroke="#12304e" strokeWidth="6"/><circle cx="200" cy="200" r="10" fill="#004ccc"/>
 </svg>
}
