import type {ReactNode} from 'react'
import { Select } from '@/design'
import {useEffect,useId,useRef,useState} from 'react'
import {useTranslation} from 'react-i18next'
import {RotateCw,RotateCcw,ChevronDown,X,Check,Users,MessageCircleQuestion,ListOrdered,Maximize,Minimize,Volume2,VolumeX} from 'lucide-react'
import {eligibleWheelEntries,wheelIsSpinning,type WheelState,type WheelCommand} from '@/shared/wheel'
import {useActivityMotion} from '../activity-themes/useActivityMotion'
import {SessionAudio} from '@/design/audio'
import {WheelPlayback} from './WheelPlayback'
import {useWheelFullscreen} from './useWheelFullscreen'
export {WheelDisc} from './WheelDisc'
import {MotionControl} from '../activity-themes/ActivityStage'
import styles from './Wheel.module.css'
import {wheelEntryLabel} from './entryLabel'

type Props={audio?:SessionAudio;onSound?:()=>void;soundEnabled?:boolean;headerAction?:ReactNode;wheel:WheelState;excludedIds?:string[];clock:{now:()=>number};onCommand?:(command:WheelCommand)=>Promise<unknown>;connected?:boolean;standalone?:boolean;allowQuestions?:boolean}
export function RandomWheel({wheel,excludedIds=[],clock,onCommand,connected=true,standalone=false,allowQuestions=false,headerAction,audio:providedAudio,onSound,soundEnabled}:Props){
 const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),t=(a:string,e:string)=>ar?a:e,motion=useActivityMotion()
 const [now,setNow]=useState(()=>clock.now()),[busy,setBusy]=useState(false),[error,setError]=useState('')
 const fullscreen=useWheelFullscreen()
 const [localAudio]=useState(()=>new SessionAudio()),[localSound,setLocalSound]=useState(false),[showWheel,setShowWheel]=useState(false)
 const audio=providedAudio??localAudio
 useEffect(()=>()=>localAudio.dispose(),[localAudio])
 async function toggleSound(){if(onSound){onSound();return}const ready=await audio.unlock();if(ready){audio.setMuted(localSound);setLocalSound(!localSound)}}
 const [skipped,setSkipped]=useState<string|null>(null)
 const [source,setSource]=useState(wheel.source),[list,setList]=useState(()=>wheel.source==='custom'?wheel.entries.map(e=>e.label).join('\n'):''),[settings,setSettings]=useState(standalone&&wheel.entries.length===0)
 const inFlight=useRef(false),titleId=useId(),listId=useId()
 useEffect(()=>{setSource(wheel.source)},[wheel.source])
 const spinning=wheelIsSpinning(wheel,now),eligible=eligibleWheelEntries(wheel).filter(e=>!excludedIds.includes(e.id)),entries=wheel.spin?.entries??eligible
 const questionMode=wheel.source==='questions'
 const locallySettled=!motion.enabled||skipped===wheel.spin?.id
 const finished=!!wheel.spin&&(!spinning||locallySettled),winner=finished?wheel.spin!.entries[wheel.spin!.winnerIndex]:null
 const visiblePicks=spinning&&wheel.spin?wheel.pickedIds.filter(id=>id!==wheel.spin!.entries[wheel.spin!.winnerIndex]?.id):wheel.pickedIds
 useEffect(()=>{if(!wheel.spin)return;const timer=setInterval(()=>{const time=clock.now();setNow(time);if(time>=wheel.spin!.startedAt+wheel.spin!.durationMs)clearInterval(timer)},80);return()=>clearInterval(timer)},[wheel.spin,clock])
 async function act(command:WheelCommand){
  if(!onCommand||inFlight.current||!connected)return false
  if(command.action==='spin'){setShowWheel(false);if(!providedAudio&&!audio.muted)void audio.unlock().then(setLocalSound)}
  inFlight.current=true;setBusy(true);setError('')
  try{await onCommand(command);return true}catch(e){setError(e instanceof Error?e.message:t('تعذّر إكمال الطلب. أعد المحاولة.','Could not complete the request. Try again.'));return false}finally{inFlight.current=false;setBusy(false)}
 }
 const disabled=busy||spinning||!connected,Heading=standalone?'h1':'h2'
 return <section ref={fullscreen.ref} className={`asas ${styles.panel} ${styles.referencePanel}`} data-expanded={fullscreen.expanded} data-fullscreen={fullscreen.full} role={fullscreen.expanded?'dialog':undefined} aria-modal={fullscreen.expanded?true:undefined} aria-labelledby={titleId} dir={ar?'rtl':'ltr'} data-random-wheel="" data-motion={motion.enabled?'on':'off'} data-wheel-state={spinning&&!locallySettled?'spinning':winner?'selected':'ready'}>
  <header className={styles.header}><div><Heading id={titleId}>{t('عجلة الاختيار العشوائي','Random wheel')}</Heading><p>{questionMode?t('دورة واحدة، وفرصة متساوية لكل سؤال في هذا النشاط.','One spin. An equal chance for every question in this activity.'):wheel.pairQuestions?t('دورة واحدة: اسم يُختار، وسؤال عشوائي يأتي معه.','One spin: a name is chosen, and a random question comes with it.'):t('دورة واحدة، وفرصة متساوية لكل اسم أو خيار.','One spin. An equal chance for every entry.')}{ar&&<span className={styles.wheelEn}>{questionMode?'Spin the questions':'Spin the names'}</span>}</p></div><div className={styles.viewControls}>{(onCommand||providedAudio)&&<button type="button" onClick={()=>void toggleSound()} aria-label={(soundEnabled??localSound)?t('كتم الصوت','Mute sound'):t('تشغيل الصوت','Turn sound on')}>{(soundEnabled??localSound)?<Volume2 size={19}/>:<VolumeX size={19}/>}</button>}<button type="button" onClick={()=>void fullscreen.toggle()} aria-label={fullscreen.full?t('الخروج من ملء الشاشة','Exit fullscreen'):t('ملء الشاشة','Fullscreen')}>{fullscreen.full?<Minimize size={19}/>:<Maximize size={19}/>}</button></div>{headerAction}{onCommand&&!standalone&&<button type="button" className={styles.close} disabled={disabled} onClick={()=>void act({action:'close'})}><X size={19}/>{t('العودة للحصة','Back to class')}</button>}</header>
  {/* TWO WAYS TO SPIN, SAID AS TWO BUTTONS.
      Whose turn it is and what they are asked are different questions, and a
      teacher switches between them mid-lesson. They used to be different
      products: a name wheel here, a question wheel inside a presentation, and
      a textarea for anyone who wanted both. */}
  {onCommand&&allowQuestions&&<div className={styles.modes} role="radiogroup" aria-label={t('ماذا تدير العجلة؟','What does the wheel spin?')}>
   <button type="button" role="radio" aria-checked={wheel.source==='participants'&&!wheel.pairQuestions} disabled={disabled} className={styles.mode}
    onClick={()=>{if(wheel.source!=='participants'||wheel.pairQuestions)void act({action:'configure',source:'participants',labels:[],avoidRepeats:wheel.avoidRepeats,pairQuestions:false})}}>
    <Users size={20} aria-hidden="true"/><span><strong>{t('الطلاب فقط','Students only')}</strong><small>{t('اختر طالبًا ليأخذ دوره.','Choose a student to take their turn.')}</small></span>
   </button>
   <button type="button" role="radio" aria-checked={questionMode} disabled={disabled} className={styles.mode}
    onClick={()=>{if(!questionMode)void act({action:'configure',source:'questions',labels:[],avoidRepeats:wheel.avoidRepeats})}}>
    <MessageCircleQuestion size={20} aria-hidden="true"/><span><strong>{t('الأسئلة فقط','Questions only')}</strong><small>{t('تختار العجلة سؤالًا من هذا النشاط.','The wheel picks a question from this activity.')}</small></span>
   </button>
   <button type="button" role="radio" aria-checked={wheel.source==='participants'&&wheel.pairQuestions} disabled={disabled} className={styles.mode} onClick={()=>void act({action:'configure',source:'participants',labels:[],avoidRepeats:wheel.avoidRepeats,pairQuestions:true})}><Users size={20} aria-hidden="true"/><span><strong>{t('طالب وسؤال','Student + question')}</strong><small>{t('اختر طالبًا وسؤالًا معًا.','Choose a student and a question together.')}</small></span></button>
   {wheel.source==='custom'&&<button type="button" role="radio" aria-checked disabled={disabled} className={styles.mode}><ListOrdered size={20} aria-hidden="true"/><span><strong>{t('قائمتي الخاصة','My own list')}</strong><small>{t('من خيارات العجلة بالأسفل.','From wheel options below.')}</small></span></button>}
  </div>}
  <div className={styles.layout}>
   <div className={styles.game}>
    {(!winner||showWheel)&&<WheelPlayback entries={entries} spin={wheel.spin} clock={clock} animate={motion.enabled&&!locallySettled} audio={onCommand||providedAudio?audio:undefined}/>}
    {/* WHAT THE SPIN PRODUCED, READ FROM THE BACK OF THE ROOM.
        The name is the headline; the question it drew sits under it as its own
        card, because it is the thing the class is about to answer and it is
        usually a sentence, not a word. */}
    <div className={styles.result} hidden={!winner&&entries.length>0} data-kind={questionMode?'question':'name'} data-phase={spinning&&!locallySettled?'spinning':winner?'settled':'ready'} role="status" aria-live="polite" aria-atomic="true">
     {spinning&&!locallySettled?<><span>{t('تدور العجلة…','Spinning…')}</span><strong>{questionMode?t('أي سؤال سيكون؟','Which question will it be?'):t('لمن ستكون الفرصة؟','Whose turn will it be?')}</strong></>
      :winner?<>
       <span><Check size={20}/>{questionMode?t('السؤال المختار','The chosen question'):t('وقع الاختيار على','The wheel chose')}</span>
       <strong dir="auto">{wheelEntryLabel(winner,wheel.entries,ar)}</strong>
       {!questionMode&&wheel.spin?.paired&&<div className={styles.paired}><span>{t('وسؤاله','and their question')}</span><p dir="auto">{wheel.spin.paired.label}</p></div>}
      </>
      :<><span>{t('جاهزون؟','Ready?')}</span><strong>{entries.length?(questionMode?t('لنرَ أي سؤال يخرج','Let the wheel choose a question'):t('لنرَ من يختار الدور','Let the wheel choose')):t('أضف أسماء أو خيارات للبدء','Add names or items to begin')}</strong></>}
    </div>
    {onCommand?<div className={styles.controls}>
     <button type="button" className={styles.spin} disabled={disabled||eligible.length===0} onClick={()=>void act({action:'spin',animate:motion.enabled})}><RotateCw size={23}/>{spinning?t('تدور العجلة…','Spinning…'):t('أدر العجلة','Spin the wheel')}</button>
     <button type="button" className={styles.reset} disabled={disabled||wheel.pickedIds.length===0} onClick={()=>void act({action:'reset'})}><RotateCcw size={18}/>{t('جولة جديدة','Reset picks')}</button>
    </div>:<p className={styles.spectator}>{t('المعلّم يتحكّم بالعجلة.','Your teacher controls the wheel.')}</p>}
    <div className={styles.controls}>{winner&&<button type="button" className={styles.reset} onClick={()=>setShowWheel(value=>!value)}>{showWheel?t('إخفاء العجلة','Hide wheel'):t('عرض العجلة','Show wheel')}</button>}<MotionControl/>{spinning&&!locallySettled&&<button type="button" className={styles.reset} onClick={()=>setSkipped(wheel.spin!.id)}>{t('تخطي الحركة','Skip animation')}</button>}</div>
    {entries.length>60&&<p className={styles.hint}>{t(`اختيار متساوٍ من ${entries.length} أسماء. العجلة للزينة؛ القائمة والنتيجة تعرضان الأسماء.`,`Choosing equally from ${entries.length} entries. The wheel is decorative; names appear in the list and result.`)}</p>}
    {!spinning&&wheel.entries.length>0&&eligible.length===0&&<p className={styles.notice}>{t('حصل الجميع على دور. أعد الأسماء لبدء جولة جديدة.','Everyone has had a turn. Reset picks to start another round.')}</p>}
    {!connected&&<p className={styles.notice} role="status">{t('جارٍ إعادة الاتصال. تبقى نتيجة الدور كما هي.','Reconnecting. This spin keeps the same result.')}</p>}
    {error&&<p role="alert" className={styles.error}>{error}</p>}
   </div>
   <aside className={styles.side}>
    <div className={styles.entryHeading}>{questionMode?<MessageCircleQuestion size={20}/>:<Users size={20}/>}<h3>{questionMode?t('أسئلة هذه الجولة','Questions this round'):t('في هذه الجولة','In this round')}</h3><strong>{spinning?entries.length:eligible.length}</strong></div>
    {onCommand&&wheel.source==='participants'&&allowQuestions&&<label className={styles.repeat}><input type="checkbox" checked={wheel.pairQuestions} disabled={disabled} onChange={e=>void act({action:'configure',source:'participants',labels:[],avoidRepeats:wheel.avoidRepeats,pairQuestions:e.target.checked})}/>{t('اسحب سؤالًا عشوائيًا لكل اسم','Draw a random question for each name')}</label>}
    {onCommand&&<label className={styles.repeat}><input type="checkbox" checked={wheel.avoidRepeats} disabled={disabled||wheel.entries.length===0} onChange={e=>void act({action:'configure',source:wheel.source,labels:wheel.source==='custom'?wheel.entries.map(e=>e.label):[],avoidRepeats:e.target.checked,pairQuestions:wheel.pairQuestions})}/>{t('عدم التكرار حتى بدء جولة جديدة','No repeats until picks are reset')}</label>}
    {wheel.source==='participants'&&<p className={styles.hint}>{t('من الطلاب المتصلين بالحصة عند بدء الدور.','Drawn from students connected when the spin starts.')}</p>}
    {questionMode&&<p className={styles.hint}>{t('أسئلة هذا النشاط، بالترتيب الذي رتّبته.','This activity’s questions, in the order you arranged them.')}</p>}
    <ol className={styles.entries}>{wheel.entries.map((entry,i)=><li key={entry.id} data-picked={wheel.avoidRepeats&&visiblePicks.includes(entry.id)}><span>{i+1}</span><span>{entry.label}</span>{wheel.avoidRepeats&&visiblePicks.includes(entry.id)&&<Check size={16} aria-label={t('حصل على دور','Already picked')}/>}</li>)}</ol>
    {!wheel.entries.length&&<p className={styles.hint}>{wheel.source==='participants'?t('تظهر أسماء الطلاب بعد انضمامهم للحصة.','Student names appear after they join the class.'):t('اكتب أسماء أو موضوعات أو أسئلة، كل منها في سطر.','Add names, topics or questions, one per line.')}</p>}
    {onCommand&&<details className={styles.settings} open={settings}><summary onClick={e=>{e.preventDefault();setSettings(value=>!value)}}>{t('خيارات العجلة','Wheel options')}<ChevronDown size={18}/></summary>
     <form onSubmit={e=>{e.preventDefault();const labels=list.split(/\r?\n/).map(line=>line.trim()).filter(Boolean);if(source==='custom'&&(labels.length===0||labels.length>100||labels.some(label=>label.length>120))){setError(t('أضف من 1 إلى 100 خيار، بحد أقصى 120 حرفًا لكل سطر.','Add 1–100 entries, up to 120 characters per line.'));return}void act({action:'configure',source,labels:source==='custom'?labels:[],avoidRepeats:wheel.avoidRepeats}).then(ok=>{if(ok)setSettings(false)})}}>
      {!standalone&&<label>{t('اختر من','Choose from')}<Select value={source} disabled={disabled} onValueChange={e=>setSource(e as WheelState['source'])}><option value="participants">{t('طلاب الحصة','Class participants')}</option>{allowQuestions&&<option value="questions">{t('أسئلة النشاط','This activity’s questions')}</option>}<option value="custom">{t('قائمتي الخاصة','My own list')}</option></Select></label>}
      {source==='custom'&&<><label htmlFor={listId}>{t('أسماء أو موضوعات أو أسئلة','Names, topics or questions')}</label><textarea id={listId} value={list} onChange={e=>setList(e.target.value)} rows={6} maxLength={12100} disabled={disabled}/><p className={styles.hint}>{t('خيار واحد في كل سطر. حتى 100 خيار.','One entry per line. Up to 100 entries.')}</p></>}
      <button type="submit" className={styles.apply} disabled={disabled}>{t('استخدم هذه القائمة','Use this list')}</button>
     </form>
    </details>}
   </aside>
  </div>
 </section>
}
