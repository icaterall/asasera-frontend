import {useEffect,useLayoutEffect,useRef,useState} from 'react'
import {useTranslation} from 'react-i18next'
import {ArrowLeft,ArrowRight,ArrowUp,ArrowDown,ArrowDownToLine,Gem,Shield,Boxes,Footprints,Trophy,Volume2,VolumeX,Accessibility} from 'lucide-react'
import {movingBlock,runnerRow,treasureGems,TREASURE_WALLS,TREASURE_MINES,type ArcadeState,type ArcadeAction,type ArcadeInput,type ArcadeView} from '@/shared/arcade'
import {SessionAudio} from '@/design/audio'
import {gameInfo} from './catalog'
import styles from './Games.module.css'

type Props={state:ArcadeState;serverNow:number;onInput?:(input:ArcadeInput)=>Promise<unknown>;connected?:boolean;spectator?:string;leaders?:ArcadeView['leaders']}
export function GameArena({state,serverNow,onInput,connected=true,spectator,leaders=[]}:Props){
 const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),info=gameInfo(state.mode),t=(a:string,e:string)=>ar?a:e
 const [simple,setSimple]=useState(()=>matchMedia('(prefers-reduced-motion:reduce)').matches),[failed,setFailed]=useState(false),[error,setError]=useState(''),[sound,setSound]=useState(false)
 const [now,setNow]=useState(serverNow),clock=useRef({server:serverNow,received:0})
 const [reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion:reduce)').matches)
 const canvas=useRef<HTMLCanvasElement>(null),viewport=useRef<HTMLDivElement>(null),sending=useRef(false),lastInput=useRef(0),live=useRef({state,reduced})
 const interactive=!!onInput
 const [audio]=useState(()=>new SessionAudio()),lastEvent=useRef(state.eventAt)
 useLayoutEffect(()=>{clock.current={server:serverNow,received:performance.now()}},[serverNow])
 useLayoutEffect(()=>{live.current={state,reduced}},[state,reduced])
 useEffect(()=>{const media=matchMedia('(prefers-reduced-motion:reduce)'),change=()=>{setReduced(media.matches);if(media.matches)setSimple(true)};media.addEventListener('change',change);return()=>media.removeEventListener('change',change)},[])
 useEffect(()=>{const timer=setInterval(()=>setNow(clock.current.server+performance.now()-clock.current.received),80);return()=>clearInterval(timer)},[])
 useEffect(()=>()=>audio.dispose(),[audio])
 useEffect(()=>{if(interactive)viewport.current?.focus({preventScroll:true})},[state.round,interactive])
 useEffect(()=>{if(state.eventAt!==lastEvent.current){lastEvent.current=state.eventAt;if(sound)audio.play(['gem','perfect','placed','chest'].includes(state.event)?'correct':state.event==='hit'||state.event==='miss'?'incorrect':'select')}},[state.eventAt,state.event,sound,audio])
 useEffect(()=>{
  if(simple||failed||!canvas.current)return
  const target=canvas.current;let cancelled=false,dispose:(()=>void)|undefined
  void import('./WorldRenderer').then(({createWorld})=>{if(!cancelled)try{dispose=createWorld(target,()=>({...live.current,now:clock.current.server+performance.now()-clock.current.received}),()=>setFailed(true))}catch{setFailed(true)}}).catch(()=>setFailed(true))
  return()=>{cancelled=true;dispose?.()}
 },[state.mode,state.seed,state.round,simple,failed])
 const ready=now>=state.startedAt,finished=state.finished||now>=state.endsAt,playable=!!onInput&&connected&&ready&&!finished
 async function act(action:ArcadeAction){
  if(!playable||sending.current||performance.now()-lastInput.current<130)return
  sending.current=true;lastInput.current=performance.now();setError('')
  try{await onInput?.({round:state.round,sequence:state.sequence+1,action})}catch(e){setError(e instanceof Error?e.message:t('أعد المحاولة','Try again'))}finally{sending.current=false}
 }
 const labels:Record<ArcadeState['event'],string>={ready:t('استعد للمغامرة','Your adventure is ready'),move:'',jump:t('قفزة!','Jump!'),gem:t('جوهرة! +100','Crystal! +100'),shield:t('حماك الدرع','Your shield protected you'),hit:t('انتبه للفخ! يمكنك المتابعة','Watch the obstacle! Keep going'),blocked:t('الطريق مغلق. جرّب اتجاهًا آخر','Path blocked. Try another direction'),placed:t('هبوط ناجح! +100','Block landed! +100'),perfect:t('تطابق تام! +150','Perfect landing! +150'),miss:t('لم يتطابق المكعب. جرّب مجددًا','The block missed. Try the next one'),chest:t('فُتح الكنز! +300','Treasure unlocked! +300'),finished:t('انتهت الجولة','Round complete')}
 const keys:Record<string,ArcadeAction>={ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right',ArrowUp:state.mode==='runner'?'jump':'up',w:state.mode==='runner'?'jump':'up',W:state.mode==='runner'?'jump':'up',ArrowDown:'down',s:'down',S:'down',' ':state.mode==='tower'?'drop':'jump'}
 return <section className={styles.arena} data-game-mode={state.mode} data-game-started-at={state.startedAt} data-game-sequence={state.sequence} data-game-status={finished?'finished':ready?'playing':'countdown'} dir={ar?'rtl':'ltr'} aria-label={ar?info.ar:info.en} onKeyDown={e=>{if(e.key===' '&&(e.target as HTMLElement).closest('button'))return;const action=keys[e.key];if(action){e.preventDefault();void act(action)}}}>
  <header className={styles.gameHeader}><div><h2>{ar?info.ar:info.en}</h2><p>{spectator?t(`نشاهد ${spectator}`,`Watching ${spectator}`):t('إجاباتك تمنحك القوة. مهارتك تصنع المغامرة.','Your answers power the adventure. You control what happens next.')}</p></div><div className={styles.viewControls}>
   <button onClick={()=>{if(failed){setFailed(false);setSimple(false)}else setSimple(v=>!v)}} aria-pressed={simple||failed}><Accessibility size={18}/>{simple||failed?t('عرض ثلاثي الأبعاد','3D view'):t('عرض مبسّط','Simple view')}</button>
   <button aria-label={sound?t('كتم أصوات اللعبة','Mute game sounds'):t('تشغيل أصوات اللعبة','Enable game sounds')} onClick={()=>{if(!sound)audio.unlock();audio.setMuted(sound);setSound(!sound)}}>{sound?<Volume2 size={19}/>:<VolumeX size={19}/>}</button>
  </div></header>
  <div className={styles.gameLayout}>
   <div className={styles.playColumn}>
    <div className={styles.hud}>
     <span><Gem size={20}/><strong data-game-points>{state.points}</strong><small>{t('نقطة','points')}</small></span>
     <span>{state.mode==='runner'?<Shield size={20}/>:state.mode==='tower'?<Boxes size={20}/>:<Footprints size={20}/>}<strong>{state.power}</strong><small>{state.mode==='runner'?t('دروع','shields'):state.mode==='tower'?t('مكعبات','blocks'):t('طاقة','energy')}</small></span>
     <span className={styles.timer} role="timer" aria-label={t('الوقت المتبقي','Time remaining')}>{Math.max(0,Math.ceil((state.endsAt-now)/1000))}<small>{t('ث','sec')}</small></span>
    </div>
    <div ref={viewport} className={styles.viewport} tabIndex={onInput?0:undefined} aria-label={t('ساحة اللعبة. استخدم الأسهم للتحرك وزر المسافة للقفز أو الإسقاط.','Game arena. Use arrow keys to move and Space to jump or drop.')} data-renderer={simple||failed?'board':'three'}>
     {!simple&&!failed&&<canvas ref={canvas} aria-hidden="true"/>}
     {(simple||failed)&&<SimpleBoard state={state} now={now} ar={ar}/>}
     {!ready&&!finished&&<div className={styles.countdown} aria-live="polite"><span>{t('استعد','Get ready')}</span><strong>{Math.ceil((state.startedAt-now)/1000)}</strong></div>}
     {finished&&<div className={styles.roundEnd}><Trophy size={35}/><h3>{state.event==='chest'?t('اكتشفت الكنز!','Treasure found!'):t('أحسنت!','Round complete!')}</h3><strong>{state.points} {t('نقطة','points')}</strong><p>{t('كل سؤال جديد يفتح مغامرة أخرى.','A new question unlocks another adventure.')}</p></div>}
     {!connected&&<div className={styles.connection} role="status">{t('جارٍ إعادة الاتصال. تُحفظ النقاط على الخادم.','Reconnecting. Your game score stays saved on the server.')}</div>}
    </div>
    <div className={styles.event} role="status" aria-live="polite">{labels[state.event]||t('استمر، المغامرة بين يديك','Keep going. This adventure is yours.')}</div>
    {onInput&&<div className={styles.controls} dir="ltr">
     {state.mode==='tower'?<button className={styles.drop} disabled={!playable} onClick={()=>void act('drop')}><ArrowDownToLine/>{t('أسقط المكعب','Drop block')}<kbd>Space</kbd></button>:<>
      {state.mode==='treasure'&&<button className={styles.up} disabled={!playable} aria-label={t('تحرّك للأمام','Move forward')} onClick={()=>void act('up')}><ArrowUp/></button>}
      <button className={styles.left} disabled={!playable} aria-label={t('تحرّك لليسار','Move left')} onClick={()=>void act('left')}><ArrowLeft/></button>
      {state.mode==='runner'?<button className={styles.jump} disabled={!playable} onClick={()=>void act('jump')}><ArrowUp/>{t('اقفز','Jump')}</button>:<button className={styles.down} disabled={!playable} aria-label={t('تحرّك للخلف','Move back')} onClick={()=>void act('down')}><ArrowDown/></button>}
      <button className={styles.right} disabled={!playable} aria-label={t('تحرّك لليمين','Move right')} onClick={()=>void act('right')}><ArrowRight/></button>
     </>}
    </div>}
    {error&&<p className={styles.error} role="alert">{error}</p>}
    <p className={styles.instructions}>{ar?info.instructions.ar:info.instructions.en}</p>
   </div>
   {leaders.length>0&&<aside className={styles.leaderboard}><h3><Trophy size={20}/>{t('المغامرون','Adventurers')}</h3><ol>{leaders.map((p,i)=><li key={p.id}><span>{i+1}</span><div><strong>{p.name}</strong><small>{p.correctCount} {t('إجابات صحيحة','correct answers')}{!p.connected?` · ${t('غير متصل','offline')}`:''}</small></div><b>{p.points}</b></li>)}</ol><p>{t('نقاط اللعبة مستقلة عن درجات التعلّم.','Game points are separate from learning marks.')}</p></aside>}
  </div>
 </section>
}

function SimpleBoard({state:s,now,ar}:{state:ArcadeState;now:number;ar:boolean}){
 if(s.mode==='treasure')return <div className={styles.simpleMap} aria-label={ar?'خريطة الجزيرة':'Island map'} dir="ltr">{Array.from({length:49},(_,tile)=>{const player=tile===s.z*7+s.x,gem=treasureGems(s.seed).includes(tile)&&!s.collected.includes(tile);return <div key={tile} data-wall={TREASURE_WALLS.includes(tile)} data-hazard={TREASURE_MINES.includes(tile)} data-player={player} aria-label={player?(ar?'موقعك':'Your position'):undefined}>{player?<Footprints/>:gem?<Gem/>:tile===3?<Trophy/>:TREASURE_MINES.includes(tile)?'×':''}</div>})}</div>
 if(s.mode==='tower'){const b=movingBlock(s,now),axis=b.axis;return <div className={styles.simpleTower} dir="ltr">{s.blocks.map((block,i)=><div key={i} style={{width:`${(axis==='x'?block.w:block.d)*60}px`,bottom:30+i*32,left:`calc(50% + ${block[axis]*60}px)`}}/>)}{!s.finished&&<div className={styles.movingBlock} style={{width:`${(axis==='x'?b.w:b.d)*60}px`,bottom:30+s.blocks.length*32,left:`calc(50% + ${b[axis]*60}px)`}}/>}<span>{ar?'طابق المكعب ثم أسقطه':'Line up the block, then drop'}</span></div>}
 const row=Math.max(0,s.lastRow+1),item=runnerRow(s.seed,row)
 return <div className={styles.simpleRunner} dir="ltr">{[0,1,2].map(lane=><div key={lane} data-player={s.x===lane}><span>{lane+1}</span><div className={styles.approaching}>{item.lane===lane?(item.kind==='gem'?<Gem size={40}/>:<Boxes size={40}/>):null}</div>{s.x===lane&&<Footprints size={42}/>}</div>)}<p>{ar?'المسار التالي:':'Next object in lane:'} {item.lane+1} · {item.kind==='gem'?(ar?'بلورة':'crystal'):(ar?'جذع، اقفز':'log — jump')}</p></div>
}
