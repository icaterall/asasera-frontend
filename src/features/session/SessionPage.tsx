import {normalizePin} from '@/lib/joinInput'
import {useQuery} from '@tanstack/react-query'
import {api} from '@/lib/api'
import { useEffect,useRef,useState } from 'react'
import { useNavigate,useParams,useSearchParams,Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import QRCode from 'qrcode'
import confetti from 'canvas-confetti'
import { Volume2,VolumeX,Maximize,LogOut,Monitor,Play,ArrowRight,Users } from 'lucide-react'
import { Button,Field } from '@/design'
import { SessionAudio } from '@/design/audio'
import { useAuth } from '@/hooks/useAuth'
import type { AnswerPayload } from '@/shared/questions'
import { useSession,PARTICIPANT_STORAGE } from './useSession'
import { Countdown } from './Countdown'
import { QuestionInput } from './QuestionInput'
import styles from './Session.module.css'

export default function SessionPage({role}:{role:'host'|'projector'|'player'}) {
  const {id}=useParams(),[search]=useSearchParams(),navigate=useNavigate(),{i18n}=useTranslation(),ar=i18n.language.startsWith('ar')
  const {accessToken}=useAuth()
  const [projectorToken]=useState(()=>{const hash=new URLSearchParams(location.hash.slice(1));const token=hash.get('token')??sessionStorage.getItem(`asasera:projector:${id}`)??'';if(token&&id){sessionStorage.setItem(`asasera:projector:${id}`,token);history.replaceState(null,'',location.pathname+location.search)}return token})
  const session=useSession({role,...(id&&id!=='new'?{runId:Number(id)}:{}),...(search.get('activityId')?{activityId:Number(search.get('activityId'))}:{}),...(search.get('request')?{requestId:search.get('request')!}:{}),projectorToken,onCreated:runId=>navigate(`/teacher/live/${runId}`,{replace:true})})
  const classes=useQuery({queryKey:['teaching-classes'],queryFn:()=>api.get<{classes:{id:number;name:string}[]}>('/api/v1/discovery/classes'),enabled:role==='host'})
  const [newClass,setNewClass]=useState('')
  const s=session.snapshot
  const [audio]=useState(()=>new SessionAudio())
  const [muted,setMuted]=useState(audio.muted),[enabled,setEnabled]=useState(false),[full,setFull]=useState(!!document.fullscreenElement)
  const [pin,setPin]=useState(normalizePin(search.get('pin')??'')),[name,setName]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState<string|null>(null),[pending,setPending]=useState(false)
  const joinRequest=useRef(crypto.randomUUID()),answerRequest=useRef(crypto.randomUUID()),[qr,setQr]=useState('')
  const previous=useRef<string|null>(null),podiumRef=useRef<HTMLDivElement>(null)
  const t=(a:string,e:string)=>ar?a:e
  const activate=()=>{setEnabled(audio.unlock());void document.documentElement.requestFullscreen?.().catch(()=>{});if(s?.state==='lobby')audio.lobby(s.participants.length)}
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
      if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
        podiumRef.current?.animate([{transform:'translateY(80px)'},{transform:'translateY(-8px)',offset:.8},{transform:'translateY(0)'}],{duration:1200,easing:'cubic-bezier(.2,.8,.2,1)'})
        void confetti({particleCount:90,spread:70,origin:{y:.65},disableForReducedMotion:true})
      }
    }
  },[s,audio])
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
  return <div className={`asas ${styles.session}`} data-theme={s?.theme??'classic'} data-role={role}>
    <header className={styles.toolbar}>
      <Link to={role==='player'?'/join':'/teacher/activities'} className={styles.brand}><img src="/asas-logo.png" alt="أساسيرا"/></Link>
      <span className={styles.connection} role="status">{session.connected?t('متصل','Connected'):t('جارٍ الاتصال…','Reconnecting…')}</span>
      <button type="button" onClick={()=>void i18n.changeLanguage(ar?'en':'ar')}>{ar?'English':'العربية'}</button>
      <button type="button" onClick={()=>{audio.unlock();audio.setMuted(!muted);setMuted(!muted)}} aria-label={muted?t('تشغيل الصوت','Unmute'):t('كتم الصوت','Mute')}>{muted?<VolumeX/>:<Volume2/>}</button>
      <button type="button" onClick={activate} aria-label={t('ملء الشاشة','Fullscreen')}><Maximize/></button>
      <button type="button" onClick={leave} aria-label={t('خروج','Leave')}><LogOut/></button>
    </header>
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
      <div className={styles.sessionMeta}><span>{s.title}</span><span dir="ltr">{s.pin}</span>{role==='host'&&<strong>{t('تحكم خاص للمعلّم','Private teacher controls')}</strong>}</div>
      {role==='host'&&<div className={styles.hostControls}>
        <Button variant="secondary" onClick={()=>{const tab=window.open('about:blank','_blank');if(tab)tab.opener=null;void action(async()=>{try{const reply=await session.send('host:projector',{runId:s.runId});if(tab&&reply.projectorToken)tab.location.href=`/projector/${s.runId}#token=${reply.projectorToken}`;else throw new Error(t('اسمح بفتح تبويب العرض ثم أعد المحاولة','Allow the projector tab, then retry'))}catch(error){tab?.close();throw error}})}}><Monitor size={20}/>{t('افتح شاشة العرض وشارك هذا التبويب','Open projector · share that tab')}</Button>
        {s.state==='lobby'&&<Button variant="primary" loading={busy} onClick={()=>{activate();command('start')}}><Play size={20}/>{t('ابدأ الحصة','Start class')}</Button>}
        {s.state==='question_open'&&<Button variant="primary" disabled={busy} onClick={()=>command('reveal')}>{t('اقفل واكشف الإجابة','Lock and reveal')}</Button>}
        {(s.state==='revealing'||s.state==='podium')&&!s.intervention&&<Button variant="primary" disabled={busy} onClick={()=>command('next')}>{s.state==='podium'?t('أكمل الحصة','Finish class'):s.question?.qIndex===s.questionCount-1?t('اعرض المنصة','Show podium'):t('السؤال التالي','Next question')}<ArrowRight size={20}/></Button>}
        {s.state!=='ended'&&<Button variant="quiet" disabled={busy} onClick={()=>command('end')}>{t('إنهاء مبكر','End early')}</Button>}
      </div>}
      {role==='host'&&s.state==='lobby'&&<section className={styles.classSetup}>
        <label htmlFor="session-class">{t('الصف','Class')}</label><select id="session-class" value={s.classId??''} disabled={busy} onChange={e=>void action(()=>session.send('host:class',{runId:s.runId,classId:e.target.value?Number(e.target.value):null}))}><option value="">{t('حصة دون صف محفوظ','Class without a saved group')}</option>{classes.data?.classes.map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select>
        <details><summary>{t('أضف صفًا','Add a class')}</summary><form onSubmit={e=>{e.preventDefault();void action(async()=>{const r=await api.post<{class:{id:number}}>('/api/v1/discovery/classes',{name:newClass});await classes.refetch();await session.send('host:class',{runId:s.runId,classId:r.class.id});setNewClass('')})}}><input aria-label={t('اسم الصف','Class name')} value={newClass} onChange={e=>setNewClass(e.target.value)} maxLength={100} required/><Button type="submit" disabled={busy}>{t('احفظ الصف','Save class')}</Button></form></details>
        <p>{t('اختر الصف نفسه في كل حصة للحفاظ على دقة تقارير الاستخدام.','Choose the same saved class each time to keep usage reports accurate.')}</p>
      </section>}
      {role==='host'&&s.intervention&&<section className={styles.intervention} aria-live="polite">
        <p>{t(`${s.intervention.count} من ${s.intervention.total} اختاروا الخطأ نفسه. احتمال للمراجعة: ${s.intervention.reason}`,`${s.intervention.count} of ${s.intervention.total} chose the same mistake. Possible explanation: ${s.intervention.reason}`)}</p>
        <Button variant="primary" disabled={busy} onClick={()=>void action(()=>session.send('host:decision',{runId:s.runId,requestId:crypto.randomUUID(),choice:'treat'}))}>{t('عالج الآن','Treat now')}</Button>
        <Button disabled={busy} onClick={()=>void action(()=>session.send('host:decision',{runId:s.runId,requestId:crypto.randomUUID(),choice:'continue'}))}>{t('تابع','Continue')}</Button>
      </section>}
      {!enabled&&role!=='host'&&<button className={styles.enable} onClick={activate}>{t('فعّل الصوت وملء الشاشة','Enable sound and fullscreen')}</button>}
      {enabled&&!full&&<button className={styles.enable} onClick={activate}>{t('العودة لملء الشاشة','Return to fullscreen')}</button>}
      {s.state==='lobby'?<main className={styles.lobby}>
        {role==='player'?<><h1>{t('أهلًا','Welcome')}, {s.self?.name}</h1><p>{t('أنت في الحصة. انتظر إشارة المعلّم.','You are in. Wait for your teacher to start.')}</p></>:<>
          <h1>{t('لنبدأ معًا','Let’s play together')}</h1><p>{t('امسح الرمز أو افتح رابط الانضمام','Scan the code or open the join page')}</p>
          <div className={styles.pinRow}><strong className={styles.pin} dir="ltr">{s.pin}</strong>{qr&&<img className={styles.qr} src={qr} alt={t('رمز الانضمام','Join QR code')}/>}</div>
          <a className={styles.joinLink} dir="ltr" href={`/join?pin=${s.pin}`} target="_blank" rel="noreferrer">{location.host}/join</a>
          <h2><Users size={28}/>{s.participants.length} {t('مشارك','participants')}</h2><div className={styles.names}>{s.participants.map(p=><span key={p.id}>{p.name}</span>)}</div>
        </>}
      </main>:s.state==='podium'?<main className={styles.center}><h1>{t('أحسنتم جميعًا','Well played, everyone')}</h1><div ref={podiumRef} className={styles.podium}>{[...new Set(s.top.map(p=>p.rank))].map(rank=>{const group=s.top.filter(p=>p.rank===rank);return <section key={rank} className={styles.podiumPlace}><strong>{rank}</strong><h2>{group.length>1?t(`${group.length} مشاركًا في تعادل`,`${group.length} participants tied`):group[0]!.name}</h2><p>{group[0]!.score} {t('نقطة','points')}</p>{group.length>1&&<ul className={styles.tiedNames}>{group.map(p=><li key={p.participantId}>{p.name}</li>)}</ul>}</section>})}</div></main>
      :s.state==='ended'?<main className={styles.center}><h1>{t('انتهت الحصة','Class finished')}</h1><p>{s.endReason==='completed'?t('شكرًا لمشاركتكم.','Thank you for taking part.'):t('أُغلقت الحصة. الإجابات المحفوظة متاحة في التقرير.','The session closed. Saved answers remain in the report.')}</p>{role==='host'&&<Link className={styles.endLink} to={`/teacher/reports/runs/${s.runId}`}>{t('افتح تقرير الحصة','Open class report')}</Link>}<Button variant="secondary" onClick={leave}>{t('خروج','Leave')}</Button></main>
      :<main className={styles.playArea}>
        <div className={styles.questionHeading}><span dir="ltr">{(s.question?.qIndex??0)+1} / {s.questionCount}</span>{s.endsAt&&s.state==='question_open'&&<Countdown endsAt={s.endsAt} duration={s.question?.timeLimitS??20} clock={session.clock} audio={audio}/>}</div>
        {role==='player'&&(s.self?.answered||s.state==='question_locked')&&s.state!=='revealing'?<div className={styles.center}><h1>{s.self?.answered?t('تم تسجيل إجابتك','Answer accepted'):t('انتهى الوقت','Time is up')}</h1><p>{t('انظر إلى شاشة العرض','Look at the projector')}</p></div>:<>
          <h1 className={styles.prompt}>{role==='player'&&['mcq','tf'].includes(s.question?.payload.kind??'')&&s.state==='question_open'?t('اختر الشكل الصحيح','Choose your answer'):s.question?.prompt}</h1>
          {s.question&&<QuestionInput key={`${s.runId}:${s.question.qIndex}`} question={s.question} classroom={role==='player'&&s.state==='question_open'} preview={role!=='player'}
            disabled={s.state!=='question_open'||pending||!!s.self?.answered||!session.connected||(s.endsAt!==null&&session.clock.now()>=s.endsAt)}
            {...(s.reveal?{revealed:s.reveal.correct}:{})} onAnswer={payload=>void answer(payload)}/>}
          {pending&&<p role="status">{t('جارٍ إرسال الإجابة…','Sending your answer…')}</p>}
          {s.state==='question_locked'&&<h2 className={styles.locked}>{t('انتهى الوقت…','Time is up…')}</h2>}
          {s.state==='revealing'&&<section className={styles.reveal} aria-live="polite">
            {s.self&&<h2>{s.self.result==='correct'?t('إجابة صحيحة','Correct answer'):s.self.result==='incorrect'?t('لنتعلّم من هذه الإجابة','Let’s learn from this answer'):t('لم تصل إجابة لهذا السؤال','No answer received for this question')} · {s.self.score} {t('نقطة','points')}</h2>}
            {s.reveal?.distribution.map((d,index)=><div className={styles.distribution} key={d.key}><span>{s.question?.payload.kind==='mcq'?s.question.payload.options.find(option=>option.key===d.key)?.text??d.key:({true:t('صح','True'),false:t('خطأ','False'),correct:t('إجابة صحيحة','Correct'),incorrect:t('إجابة غير صحيحة','Incorrect')} as Record<string,string>)[d.key]??d.key}</span><div style={{width:`${Math.max(2,d.count/Math.max(1,s.participants.length)*100)}%`,animationDelay:`${index*80}ms`}}/><strong>{d.count}</strong></div>)}
          </section>}
        </>}
      </main>}
    </>}
  </div>
}
