import { useQueryClient } from '@tanstack/react-query'
import { studentQueryKey } from '../student/student-api'
import { useAuth } from '@/hooks/useAuth'
import { studentApi } from '../student/student-api'
import {useCallback,useEffect,useId,useRef,useState} from 'react'
import {Link,useParams} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {api} from '@/lib/api'
import {Button} from '@/design'
import {attemptViewSchema,type AttemptView} from '@/shared/delivery'
import type {AnswerPayload} from '@/shared/questions'
import {QuestionInput} from '../session/QuestionInput'
import stage from '../session/Session.module.css'
import { ActivityStage, MotionControl } from '../activity-themes/ActivityStage'
import {GameArena} from '../games/GameArena'
import {gameInfo} from '../games/catalog'
import type {GameMode,ArcadeInput} from '@/shared/arcade'
import styles from './Delivery.module.css'
type Saved={accessToken:string;attemptId?:string;token?:string;requestId:string}
type Assignment={gameMode:GameMode;title:string;theme:string;mode:'homework'|'study';deadline:string;closed:boolean;questionCount:number;feedback:string;serverNow:number}
function storageKey(id:string,studentId:number|null){return studentId?`asasera:assignment:student:${studentId}:${id}`:`asasera:assignment:${id}`}
function readSaved(id:string,studentId:number|null):Saved{
 let prior:Partial<Saved>={};try{prior=JSON.parse(localStorage.getItem(storageKey(id,studentId))??'{}')}catch{/* An invalid local entry never authorizes an attempt. */}
 const hash=location.hash.slice(1),accessToken=hash||prior.accessToken||''
 const saved={...prior,accessToken,requestId:prior.requestId||crypto.randomUUID()}
 if(hash){try{localStorage.setItem(storageKey(id,studentId),JSON.stringify(saved))}catch{}}
 return saved
}
export default function LearnPage(){
 const {status,user}=useAuth(),{id=''}=useParams(),{i18n}=useTranslation()
 if(status==='loading')return <main role="status">{i18n.language.startsWith('ar')?'جارٍ فتح حسابك…':'Opening your account…'}</main>
 const studentId=user?.role==='student'?user.id:null
 return <LearnAttempt key={`${id}:${studentId??'guest'}`} studentId={studentId} defaultName={user?.name??''}/>
}
function LearnAttempt({studentId,defaultName}:{studentId:number|null;defaultName:string}){
 const queryClient=useQueryClient()
 const dialogTitleId=useId()
 const {id=''}=useParams(),{i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),t=(a:string,e:string)=>ar?a:e
 const [saved,setSaved]=useState(()=>readSaved(id,studentId)),[assignment,setAssignment]=useState<Assignment|null>(null),[view,setView]=useState<AttemptView|null>(null),[name,setName]=useState(defaultName.slice(0,40)),[busy,setBusy]=useState(false),[error,setError]=useState(''),[left,setLeft]=useState(false)
 const [ready,setReady]=useState(!studentId)
 const initialSaved=useRef(saved)
 const inFlight=useRef(false),leaveDialog=useRef<HTMLDialogElement>(null),offset=useRef(0)
 const save=useCallback((s:Saved)=>{try{localStorage.setItem(storageKey(id,studentId),JSON.stringify(s))}catch{};setSaved(s)},[id,studentId])
 const accept=useCallback((value:unknown)=>{if(studentId)void queryClient.invalidateQueries({queryKey:studentQueryKey(studentId)});const parsed=attemptViewSchema.parse(value);offset.current=parsed.serverNow-Date.now();setView(prior=>prior&&prior.id===parsed.id&&(prior.position>parsed.position||(prior.position===parsed.position&&(prior.serverNow>parsed.serverNow||(prior.game?.sequence??0)>(parsed.game?.sequence??0)||(prior.game?.finished&&!parsed.game?.finished)||(prior.status!=='active'&&parsed.status==='active'))))?prior:parsed)},[studentId,queryClient])
 const refresh=useCallback(async()=>{if(!ready)return;if(saved.attemptId&&saved.token)accept(await api.post(`/api/v1/delivery/attempts/${saved.attemptId}/view`,{token:saved.token}));else{const a=await api.post<Assignment>(`/api/v1/delivery/assignments/${id}/open`,{accessToken:saved.accessToken});offset.current=a.serverNow-Date.now();setAssignment(a)}},[saved,id,accept,ready])
 const work=async(action:()=>Promise<void>)=>{if(inFlight.current)return;inFlight.current=true;setBusy(true);setError('');try{await action()}catch(e){setError(e instanceof Error?e.message:t('تعذّر الاتصال. حاول مجددًا.','Connection failed. Try again.'))}finally{inFlight.current=false;setBusy(false)}}
 useEffect(()=>{if(location.hash)history.replaceState(null,'',location.pathname+location.search)},[])
 const connectAccount=useCallback(async()=>{
  if(!studentId)return
  const initial=initialSaved.current
  if(initial.accessToken)await studentApi.save(id,initial.accessToken)
  if(initial.attemptId&&initial.token)await studentApi.attach(id,initial.attemptId,initial.token)
  const access=await studentApi.resume(id)
  save({accessToken:access.accessToken,requestId:initial.requestId,...(access.attemptId&&access.token?{attemptId:access.attemptId,token:access.token}:{})})
  setReady(true)
 },[studentId,id,save])
 useEffect(()=>{let alive=true;if(studentId)void connectAccount().catch(e=>{if(alive)setError(e.message)});return()=>{alive=false}},[studentId,connectAccount])
 useEffect(()=>{let alive=true;void Promise.resolve().then(refresh).catch(e=>{if(alive)setError(e.message)});return()=>{alive=false}},[refresh])
 useEffect(()=>{
  if(!view||left||view.feedbackAvailable&&view.status!=='active')return
  const remaining=new Date(view.deadline).getTime()-Date.now()-offset.current
  const timer=setTimeout(()=>{void refresh().catch(e=>setError(e.message))},Math.max(1000,Math.min(15000,remaining+100)))
  return()=>clearTimeout(timer)
 },[view,refresh,left])
 const answer=(answer:AnswerPayload)=>void work(async()=>{if(!view?.question||!saved.token)return;accept(await api.post(`/api/v1/delivery/attempts/${view.id}/answer`,{token:saved.token,position:view.position,questionId:view.question.id,answer}))})
 const attemptId=view?.id,position=view?.position
 const sendGame=useCallback(async(action:'start'|'sync'|'input'|'finish',input?:ArcadeInput)=>{if(!attemptId||!saved.token)return;accept(await api.post(`/api/v1/delivery/attempts/${attemptId}/game`,{token:saved.token,position,action,...(input?{input}:{})}))},[attemptId,position,saved.token,accept])
 const playing=!!view?.game&&view.game.round===view.position
 useEffect(()=>{if(!playing||view?.game?.finished||left||view?.status!=='active')return;const timer=setInterval(()=>{if(!document.hidden)void sendGame('sync').catch(e=>setError(e.message))},1000);return()=>clearInterval(timer)},[playing,view?.game?.finished,view?.status,left,sendGame])
 const gameMode=view?.gameMode??assignment?.gameMode??'quiz'
 const title=view?.title??assignment?.title??'Asasera'
 return <ActivityStage as="main" theme={gameMode==='quiz'?(view?.theme??assignment?.theme):gameInfo(gameMode).theme} className={`asas ${stage.session}`} phase={playing?'game_play':'question_open'} dir={ar?'rtl':'ltr'}><div className={styles.learn}>
  <header className={styles.learnHeader}><strong>Asasera</strong><MotionControl/><span>{(view?.mode??assignment?.mode)==='study'?t('تعلّم ذاتي','Self-study'):t('واجب','Homework')}</span><button onClick={()=>void i18n.changeLanguage(ar?'en':'ar')}>{ar?'English':'العربية'}</button>{saved.attemptId&&!left&&<button onClick={()=>leaveDialog.current?.showModal()}>{t('خروج من جهاز مشترك','Leave a shared device')}</button>}</header>
  {error&&<div className={styles.alert} role="alert"><p>{error}</p><Button disabled={busy} onClick={()=>void work(async()=>{if(studentId)await connectAccount();await refresh()})}>{t('أعد الاتصال','Reconnect')}</Button></div>}
  {left?<section className={styles.complete}><h1>{t('أُزيل مفتاح الاستئناف من هذا المتصفح','Resume key removed from this browser')}</h1><p>{t('تبقى الإجابات التي أرسلتها محفوظة لدى المعلم.','Your submitted answers remain saved for your teacher.')}</p><Link to={studentId?"/student":"/"}>{t('الرئيسية','Home')}</Link></section>:view?<>
   <p>{title} · {t('الموعد النهائي','Deadline')}: {new Date(view.deadline).toLocaleString(ar?'ar':'en')}</p>
   <progress className={styles.progress} aria-label={t('التقدّم','Progress')} max={view.questionCount} value={view.status==='submitted'?view.questionCount:view.position+(view.answered?1:0)}/>
   {view.status==='active'&&view.question?<>
    {playing&&view.game?<><GameArena state={view.game} serverNow={view.serverNow} onInput={input=>sendGame('input',input)}/><div className={styles.next}><p>{view.gamePoints} {t('نقطة لعب محفوظة','saved game points')}</p><Button variant="primary" loading={busy} onClick={()=>void work(async()=>{await sendGame('finish');accept(await api.post(`/api/v1/delivery/attempts/${view.id}/next`,{token:saved.token,position:view.position}))})}>{view.game.finished?(view.position===view.questionCount-1?t('سلّم النشاط','Submit activity'):t('السؤال التالي','Next question')):t('تجاوز الجولة وتابع التعلّم','Skip round and keep learning')}</Button></div></>:<>
    <p>{t(`السؤال ${view.position+1} من ${view.questionCount}`,`Question ${view.position+1} of ${view.questionCount}`)}</p>
    <h1 key={view.question.id} className={styles.questionTitle} data-question-surface="">{view.question.prompt}</h1>
    <QuestionInput key={view.question.id} question={view.question} onAnswer={answer} disabled={busy||view.answered} revealed={view.reveal?.correct}/>
    {view.answered&&<div className={styles.next}><p role="status">{view.reveal?(view.reveal.wasCorrect?t('إجابة صحيحة!','Correct!'):t('راجع الإجابة الصحيحة ثم تابع.','Review the correct answer, then continue.')):t('تم حفظ إجابتك.','Your answer is saved.')}</p>{view.gameMode!=='quiz'&&<Button variant="primary" loading={busy} onClick={()=>void work(()=>sendGame('start'))}>{t('ابدأ جولة اللعب','Play game round')}</Button>}<Button variant={view.gameMode==='quiz'?'primary':'secondary'} loading={busy} onClick={()=>void work(async()=>accept(await api.post(`/api/v1/delivery/attempts/${view.id}/next`,{token:saved.token,position:view.position})))}>{view.position===view.questionCount-1?t('سلّم النشاط','Submit activity'):t('التالي','Next')}</Button></div>}
   </>}
   </>:<section className={styles.complete}>{view.gameMode!=='quiz'&&<p className={styles.summary}>{view.gamePoints} {t('نقطة لعب','game points')}</p>}<h1>{view.status==='submitted'?t('تم تسليم نشاطك!','Activity submitted!'):t('انتهى وقت النشاط','This assignment has closed')}</h1><p>{view.status==='submitted'?studentId?t('حُفظت إجاباتك. تابع النتائج من صفحة تقدّمك.','Your answers are saved. Follow the results from your progress page.'):t('حُفظت إجاباتك للمعلم. يمكنك العودة من هذا المتصفح لعرض التغذية الراجعة.','Your answers are saved for your teacher. Return in this browser to see your feedback.'):t('حُفظت الإجابات التي أرسلتها قبل انتهاء الوقت.','Answers sent before the deadline have been saved.')}</p>{view.feedbackAvailable?<p className={styles.summary}>{t(`${view.correctCount} إجابات صحيحة من ${view.questionCount}`,`${view.correctCount} correct out of ${view.questionCount}`)}</p>:<p>{t('تظهر الإجابات الصحيحة بعد الموعد النهائي أو عند إغلاق المعلم للنشاط.','Correct answers appear after the deadline or when your teacher closes the assignment.')}</p>}</section>}
   {view.review.map((r,index)=><section className={styles.review} key={r.question.id}><h2>{index+1}. {r.question.prompt}</h2><p>{r.wasCorrect===null?t('لم تُجب','Unanswered'):r.wasCorrect?t('أجبت بشكل صحيح','You answered correctly'):t('راجع الإجابة الصحيحة','Review the correct answer')}</p><QuestionInput question={r.question} onAnswer={()=>{}} disabled preview revealed={r.correct}/></section>)}
  </>:assignment?<section className={styles.join}><h1>{title}</h1><p>{assignment.questionCount} {t('أسئلة','questions')} · {new Date(assignment.deadline).toLocaleString(ar?'ar':'en')}</p>{assignment.closed?<p>{t('أغلق هذا النشاط. لا يمكن الانضمام الآن.','This assignment is closed. New attempts are unavailable.')}</p>:<form onSubmit={e=>{e.preventDefault();void work(async()=>{const result=studentId?await studentApi.start(id,name,saved.requestId):await api.post<{attemptId:string;token:string}>(`/api/v1/delivery/assignments/${id}/join`,{accessToken:saved.accessToken,name,requestId:saved.requestId});save({...saved,...result});initialSaved.current={...saved,...result}})}}><label>{t('اسمك','Your name')}<input value={name} onChange={e=>setName(e.target.value)} maxLength={40} autoComplete="nickname" required/></label><p>{studentId?t('يُحفظ هذا النشاط في حسابك لتتابعه من أي جهاز. سجّل الخروج من حسابك عند استخدام جهاز مشترك.','This activity is saved to your account to continue on any device. Sign out of your account on a shared device.'):t('يُحفظ تقدّمك في هذا المتصفح. عند استخدام جهاز مشترك، استخدم زر الخروج بعد الانتهاء.','Your progress resumes in this browser. On a shared device, use the leave button when you finish.')}</p><Button variant="primary" type="submit" loading={busy}>{t('ابدأ','Start')}</Button></form>}</section>:!error?<p role="status">{t('جارٍ فتح النشاط…','Opening activity…')}</p>:null}
  <dialog aria-labelledby={dialogTitleId} className={styles.leave} ref={leaveDialog}><h2 id={dialogTitleId}>{t('إزالة مفتاح الاستئناف؟','Remove your resume key?')}</h2><p>{studentId?t('سنزيل المفتاح المحفوظ على هذا الجهاز. يمكنك استئناف النشاط من حسابك. سجّل الخروج من حسابك عند استخدام جهاز مشترك.','This removes the key stored on this device. You can still resume from your account. Sign out on a shared device.'):t('لن تستطيع استئناف هذه المحاولة من هذا المتصفح. تبقى إجاباتك المرسلة لدى المعلم.','You will no longer be able to resume this attempt here. Submitted answers remain with your teacher.')}</p><Button variant="primary" onClick={()=>{localStorage.removeItem(storageKey(id,studentId));leaveDialog.current?.close();setLeft(true)}}>{t('أزل المفتاح واخرج','Remove key and leave')}</Button><Button onClick={()=>leaveDialog.current?.close()}>{t('ابقَ هنا','Stay here')}</Button></dialog>
 </div></ActivityStage>
}
