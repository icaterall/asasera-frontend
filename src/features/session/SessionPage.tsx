import {normalizePin} from '@/lib/joinInput'
import {useQuery} from '@tanstack/react-query'
import {api} from '@/lib/api'
import { useEffect,useRef,useState } from 'react'
import { useNavigate,useParams,useSearchParams,Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import QRCode from 'qrcode'
import confetti from 'canvas-confetti'
import { Play,ArrowRight,Users,Disc3 } from 'lucide-react'
import { Button,Field, Select } from '@/design'
import { SessionAudio } from '@/design/audio'
import { useAuth } from '@/hooks/useAuth'
import type { AnswerPayload } from '@/shared/questions'
import { useSession,PARTICIPANT_STORAGE } from './useSession'
import { LiveQuestionStage } from './LiveQuestionStage'
import { SessionToolbar } from './SessionToolbar'
import { GameBriefing } from './GameBriefing'
import chrome from './SessionChrome.module.css'
import styles from './Session.module.css'
import { ActivityStage } from '../activity-themes/ActivityStage'
import {GameArena} from '../games/GameArena'
import {gameInfo} from '../games/catalog'
import {gameModeSchema} from '@/shared/arcade'
import { useActivityMotion } from '../activity-themes/useActivityMotion'
import {RandomWheel} from '../wheel/RandomWheel'

export default function SessionPage({role}:{role:'host'|'projector'|'player'}) {
  const {id}=useParams(),[search]=useSearchParams(),navigate=useNavigate(),{i18n}=useTranslation(),ar=i18n.language.startsWith('ar')
  const {accessToken}=useAuth()
  const [projectorToken]=useState(()=>{const hash=new URLSearchParams(location.hash.slice(1));const token=hash.get('token')??sessionStorage.getItem(`asasera:projector:${id}`)??'';if(token&&id){sessionStorage.setItem(`asasera:projector:${id}`,token);history.replaceState(null,'',location.pathname+location.search)}return token})
  const session=useSession({role,gameMode:gameModeSchema.catch('quiz').parse(search.get('gameMode')??'quiz'),...(id&&id!=='new'?{runId:Number(id)}:{}),...(search.get('activityId')?{activityId:Number(search.get('activityId'))}:{}),...(search.get('request')?{requestId:search.get('request')!}:{}),projectorToken,onCreated:runId=>navigate(`/teacher/live/${runId}`,{replace:true})})
  const classes=useQuery({queryKey:['teaching-classes'],queryFn:()=>api.get<{classes:{id:number;name:string}[]}>('/api/v1/discovery/classes'),enabled:role==='host'})
  const [newClass,setNewClass]=useState('')
  const s=session.snapshot
  const motion=useActivityMotion()
  const [audio]=useState(()=>new SessionAudio())
  const [muted,setMuted]=useState(audio.muted),[enabled,setEnabled]=useState(false),[full,setFull]=useState(!!document.fullscreenElement)
  const [pin,setPin]=useState(normalizePin(search.get('pin')??'')),[name,setName]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState<string|null>(null),[pending,setPending]=useState(false)
  const joinRequest=useRef(crypto.randomUUID()),answerRequest=useRef(crypto.randomUUID()),[qr,setQr]=useState('')
  const previous=useRef<string|null>(null),podiumRef=useRef<HTMLDivElement>(null)
  useEffect(()=>{if(!motion.enabled){podiumRef.current?.getAnimations().forEach(animation=>animation.cancel());confetti.reset()}},[motion.enabled])
  const t=(a:string,e:string)=>ar?a:e
  const activate=()=>{setEnabled(audio.unlock());if(s?.state==='lobby')audio.lobby(s.participants.length)}
  const fullscreen=()=>{if(document.fullscreenElement)void document.exitFullscreen().catch(()=>{});else void document.documentElement.requestFullscreen?.().catch(()=>{})}
  const toggleSound=()=>{activate();const next=enabled?!muted:false;audio.setMuted(next);setMuted(next)}
  useEffect(()=>{const update=()=>setFull(!!document.fullscreenElement);document.addEventListener('fullscreenchange',update);return()=>document.removeEventListener('fullscreenchange',update)},[])
  useEffect(()=>()=>audio.dispose(),[audio])
  useEffect(()=>{
    if(!s)return
    const key=`${s.runId}:${s.question?.qIndex}:${s.state}`
    if(previous.current===key)return
    const initial=previous.current===null;previous.current=key
    if(s.state!=='lobby')audio.stopLoop()
    setPending(false);answerRequest.current=crypto.randomUUID()
    if(initial)return
    if(s.state==='question_open')audio.play('question')
    if(s.state==='question_locked')audio.play('lock')
    if(s.state==='revealing')audio.play(s.self?.result==='incorrect'?'incorrect':'correct')
    if(s.state==='podium') {
      audio.play('podium')
      if(motion.enabled){
        podiumRef.current?.animate([{transform:'translateY(80px)'},{transform:'translateY(-8px)',offset:.8},{transform:'translateY(0)'}],{duration:1200,easing:'cubic-bezier(.2,.8,.2,1)'})
        void confetti({particleCount:90,spread:70,origin:{y:.65},disableForReducedMotion:true})
      }
    }
  },[s,audio,motion.enabled])
  useEffect(()=>{if(enabled&&s?.state==='lobby')audio.lobby(s.participants.length);return()=>audio.stopLoop()},[enabled,s?.state,s?.participants.length,audio])
  useEffect(()=>{if(!s?.pin)return;void QRCode.toDataURL(`${location.origin}/join?pin=${s.pin}`,{width:180,margin:2,errorCorrectionLevel:'M'}).then(setQr)},[s?.pin])
  const action=async(work:()=>Promise<unknown>)=>{setBusy(true);setError(null);try{await work()}catch(e){setError(e instanceof Error?e.message:t('تعذّرت العملية','Action failed'))}finally{setBusy(false)}}
  const command=(name:'start'|'next'|'reveal'|'end')=>{if(!s)return;void action(()=>session.send(`host:${name}`,{runId:s.runId,requestId:crypto.randomUUID()}))}
  async function answer(payload:AnswerPayload){
    if(!s?.question||s.state!=='question_open'||s.endsAt===null||session.clock.now()>=s.endsAt)return
    audio.play('select');setPending(true);setError(null)
    try{await session.send('player:answer',{runId:s.runId,qIndex:s.question.qIndex,questionId:s.question.id,requestId:answerRequest.current,payload})}
    catch(e){setError(e instanceof Error?e.message:'Answer failed')}finally{setPending(false)}
  }
  const leave=()=>{if(id)sessionStorage.removeItem(`asasera:projector:${id}`);session.exit();if(document.fullscreenElement)void document.exitFullscreen();navigate(role==='player'?'/join':'/teacher/activities')}
  return <ActivityStage theme={s&&s.gameMode!=='quiz'?gameInfo(s.gameMode).theme:s?.theme} phase={s?.state??'lobby'} className={`asas ${styles.session}`} data-role={role} dir={ar?'rtl':'ltr'}>
    <SessionToolbar role={role} pin={s?.pin} participants={s?.participants.length??0} connected={session.connected} ar={ar} muted={muted} enabled={enabled} full={full} busy={busy}
      canWheel={!!s&&!s.wheel?.visible&&['lobby','revealing','game_results','podium'].includes(s.state)} canEnd={!!s&&s.state!=='ended'}
      onSound={toggleSound} onFullscreen={fullscreen} onLanguage={()=>void i18n.changeLanguage(ar?'en':'ar')} onLeave={leave}
      onProjector={()=>{if(!s)return;const tab=window.open('about:blank','_blank');if(tab)tab.opener=null;void action(async()=>{try{const reply=await session.send('host:projector',{runId:s.runId});if(tab&&reply.projectorToken)tab.location.href=`/projector/${s.runId}#token=${reply.projectorToken}`;else throw new Error(t('اسمح بفتح تبويب العرض ثم أعد المحاولة','Allow the projector tab, then retry'))}catch(error){tab?.close();throw error}})}}
      onWheel={()=>{if(s)void action(()=>session.send('host:wheel',{runId:s.runId,requestId:crypto.randomUUID(),command:{action:'open'}}))}} onEnd={()=>command('end')}/>
    {(error||session.error)&&<div className={styles.notice} role="alert">{error??session.error}<button type="button" onClick={()=>location.reload()}>{t('إعادة الاتصال','Reconnect')}</button></div>}
    {s?.persistence!=='ready'&&s&&<div className={styles.notice} role="status">{t('جارٍ حفظ النتائج. تبقى إجاباتك محفوظة في هذه الجلسة.','Saving results. Accepted answers remain in this session.')} {s.persistence==='failed'&&role==='host'&&<button onClick={()=>command('reveal')}>{t('أعد الحفظ','Retry save')}</button>}</div>}
    {!s&&role==='player'?<main className={styles.join}>
      <h1>{t('الحصة تبدأ بك','Your class starts here')}</h1><p>{t('أدخل رمز الحصة واسمك. لا تحتاج إلى حساب.','Enter the class PIN and your name. No account needed.')}</p>
      <form onSubmit={e=>{e.preventDefault();setEnabled(audio.unlock());void action(async()=>{const reply=await session.send('player:join',{pin,name,requestId:joinRequest.current});if(reply.snapshot&&reply.resumeToken)sessionStorage.setItem(PARTICIPANT_STORAGE,JSON.stringify({runId:reply.snapshot.runId,resumeToken:reply.resumeToken}))})}}>
        <Field label={t('رمز الحصة','Class PIN')} inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={pin} onChange={e=>setPin(normalizePin(e.target.value))} required dir="ltr"/>
        <Field label={t('اسمك في الحصة','Display name')} value={name} onChange={e=>setName(e.target.value)} maxLength={40} required autoComplete="off"/>
        <Button variant="primary" type="submit" loading={busy} disabled={!session.connected}>{t('انضم','Join class')}</Button>
      </form>
    </main>:!s?<main className={styles.center}><h1>{t('نجهّز الحصة…','Preparing your class…')}</h1>{role==='host'&&!accessToken&&<Link to="/login">{t('سجّل الدخول','Sign in')}</Link>}</main>:<>
      <div className={chrome.runBar}>
        <span className={chrome.runTitle} dir="auto">{s.title}</span>
        {role==='host'&&<div className={chrome.runActions}>
          {!s.wheel?.visible&&['lobby','revealing','game_results','podium'].includes(s.state)&&<Button className={chrome.wheel} variant="secondary" disabled={busy||!session.connected} aria-label={t('العجلة العشوائية','Random wheel')} onClick={()=>void action(()=>session.send('host:wheel',{runId:s.runId,requestId:crypto.randomUUID(),command:{action:'open'}}))}><Disc3 size={20}/><span>{t('العجلة','Wheel')}</span></Button>}
          {s.state==='lobby'&&<Button className={chrome.advance} loading={busy} disabled={!session.connected||!!s.wheel?.visible} onClick={()=>{activate();command('start')}}><Play size={20}/>{t('ابدأ الحصة','Start class')}</Button>}
          {s.state==='question_open'&&<Button className={chrome.advance} disabled={busy||!session.connected} onClick={()=>command('reveal')}>{t('اكشف الإجابة','Reveal answer')}</Button>}
          {(s.state==='revealing'||s.state==='podium'||s.state==='game_play'||s.state==='game_results')&&!s.intervention&&<Button className={chrome.advance} disabled={busy||!session.connected||!!s.wheel?.visible} onClick={()=>command('next')}>{s.state==='podium'?t('أكمل الحصة','Finish class'):s.state==='game_play'?t('إنهاء الجولة','End game round'):s.state==='revealing'&&s.gameMode!=='quiz'?t('ابدأ جولة اللعب','Play game round'):s.question?.qIndex===s.questionCount-1?t('اعرض المنصة','Show podium'):t('السؤال التالي','Next question')}<ArrowRight size={20}/></Button>}
        </div>}
      </div>
      {role==='host'&&!s.wheel?.visible&&s.state==='lobby'&&<section className={styles.classSetup}>
        <label htmlFor="session-class">{t('الصف','Class')}</label><Select id="session-class" value={s.classId??''} disabled={busy} onValueChange={e=>void action(()=>session.send('host:class',{runId:s.runId,classId:e?Number(e):null}))}><option value="">{t('حصة دون صف محفوظ','Class without a saved group')}</option>{classes.data?.classes.map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</Select>
        <details><summary>{t('أضف صفًا','Add a class')}</summary><form onSubmit={e=>{e.preventDefault();void action(async()=>{const r=await api.post<{class:{id:number}}>('/api/v1/discovery/classes',{name:newClass});await classes.refetch();await session.send('host:class',{runId:s.runId,classId:r.class.id});setNewClass('')})}}><input aria-label={t('اسم الصف','Class name')} value={newClass} onChange={e=>setNewClass(e.target.value)} maxLength={100} required/><Button type="submit" disabled={busy}>{t('احفظ الصف','Save class')}</Button></form></details>
        <p>{t('اختر الصف نفسه في كل حصة للحفاظ على دقة تقارير الاستخدام.','Choose the same saved class each time to keep usage reports accurate.')}</p>
      </section>}
      {role==='host'&&!s.wheel?.visible&&s.intervention&&<section className={styles.intervention} aria-live="polite">
        <p>{t(`${s.intervention.count} من ${s.intervention.total} اختاروا الخطأ نفسه. احتمال للمراجعة: ${s.intervention.reason}`,`${s.intervention.count} of ${s.intervention.total} chose the same mistake. Possible explanation: ${s.intervention.reason}`)}</p>
        <Button variant="primary" disabled={busy} onClick={()=>void action(()=>session.send('host:decision',{runId:s.runId,requestId:crypto.randomUUID(),choice:'treat'}))}>{t('عالج الآن','Treat now')}</Button>
        <Button disabled={busy} onClick={()=>void action(()=>session.send('host:decision',{runId:s.runId,requestId:crypto.randomUUID(),choice:'continue'}))}>{t('تابع','Continue')}</Button>
      </section>}
      {s.wheel?.visible?<RandomWheel wheel={s.wheel} clock={session.clock} connected={session.connected} {...(role==='host'?{onCommand:async command=>{await session.send('host:wheel',{runId:s.runId,requestId:crypto.randomUUID(),command})}}:{})}/>: (s.state==='game_play'||s.state==='game_results')&&s.arcade&&(s.arcade.self||s.arcade.watch)?<GameArena key={`game-${s.arcade.round}`} state={(s.arcade.self??s.arcade.watch)!} serverNow={s.serverNow} connected={session.connected} {...(role==='player'?{onInput:async input=>{await session.send('player:game',{runId:s.runId,...input})}}:{spectator:s.arcade.watchName})} leaders={s.arcade.leaders}/>:s.state==='lobby'?<main className={styles.lobby}>
        {role==='player'?<><h1>{t('أهلًا','Welcome')}, {s.self?.name}</h1><p>{t('أنت في الحصة. انتظر إشارة المعلّم.','You are in. Wait for your teacher to start.')}</p></>:<>
          <h1>{t('لنبدأ معًا','Let’s play together')}</h1><p>{t('امسح الرمز أو افتح رابط الانضمام','Scan the code or open the join page')}</p>
          <div className={styles.pinRow}><strong className={styles.pin} dir="ltr">{s.pin}</strong>{qr&&<img className={styles.qr} src={qr} alt={t('رمز الانضمام','Join QR code')}/>}</div>
          <a className={styles.joinLink} dir="ltr" href={`/join?pin=${s.pin}`} target="_blank" rel="noreferrer">{location.host}/join</a>
          <h2><Users size={28}/>{s.participants.length} {t('مشارك','participants')}</h2><div className={styles.names}>{s.participants.map(p=><span key={p.id}>{p.name}</span>)}</div>
        </>}
        {s.gameMode!=='quiz'&&<GameBriefing mode={s.gameMode} ar={ar}/>}
      </main>:s.state==='podium'?<main className={styles.center}><h1>{t('أحسنتم جميعًا','Well played, everyone')}</h1><div ref={podiumRef} className={styles.podium}>{s.gameMode!=='quiz'&&s.gameScores.slice(0,3).map((player,i)=><section className={styles.podiumPlace} key={player.id}><strong>{i+1}</strong><h2>{player.name}</h2><p>{player.points} {t('نقطة لعب','game points')}</p><p>{player.correctCount} {t('إجابات صحيحة','correct answers')}</p></section>)}{s.gameMode==='quiz'&&[...new Set(s.top.map(p=>p.rank))].map(rank=>{const group=s.top.filter(p=>p.rank===rank);return <section key={rank} className={styles.podiumPlace}><strong>{rank}</strong><h2>{group.length>1?t(`${group.length} مشاركًا في تعادل`,`${group.length} participants tied`):group[0]!.name}</h2><p>{group[0]!.score} {t('نقطة','points')}</p>{group.length>1&&<ul className={styles.tiedNames}>{group.map(p=><li key={p.participantId}>{p.name}</li>)}</ul>}</section>})}</div></main>
      :s.state==='ended'?<main className={styles.center}><h1>{t('انتهت الحصة','Class finished')}</h1><p>{s.endReason==='completed'?t('شكرًا لمشاركتكم.','Thank you for taking part.'):t('أُغلقت الحصة. الإجابات المحفوظة متاحة في التقرير.','The session closed. Saved answers remain in the report.')}</p>{role==='host'&&<Link className={styles.endLink} to={`/teacher/reports/runs/${s.runId}`}>{t('افتح تقرير الحصة','Open class report')}</Link>}<Button variant="secondary" onClick={leave}>{t('خروج','Leave')}</Button></main>
      :<LiveQuestionStage key={`${s.runId}:${s.question?.qIndex}:${s.question?.id}`} snapshot={s} role={role} clock={session.clock} audio={audio} connected={session.connected} pending={pending} ar={ar} onAnswer={payload=>void answer(payload)}/>}
    </>}
  </ActivityStage>
}
