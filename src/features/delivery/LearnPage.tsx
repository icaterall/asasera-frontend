import {useCallback,useEffect,useId,useRef,useState} from 'react'
import {Link,useParams} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {api} from '@/lib/api'
import {Button} from '@/design'
import {attemptViewSchema,type AttemptView} from '@/shared/delivery'
import type {AnswerPayload} from '@/shared/questions'
import {QuestionInput} from '../session/QuestionInput'
import stage from '../session/Session.module.css'
import styles from './Delivery.module.css'
type Saved={accessToken:string;attemptId?:string;token?:string;requestId:string}
type Assignment={title:string;mode:'homework'|'study';deadline:string;closed:boolean;questionCount:number;feedback:string;serverNow:number}
function readSaved(id:string):Saved{
 let prior:Partial<Saved>={};try{prior=JSON.parse(localStorage.getItem(`asasera:assignment:${id}`)??'{}')}catch{/* An invalid local entry never authorizes an attempt. */}
 const hash=location.hash.slice(1),accessToken=hash||prior.accessToken||''
 const saved={...prior,accessToken,requestId:prior.requestId||crypto.randomUUID()}
 if(hash){localStorage.setItem(`asasera:assignment:${id}`,JSON.stringify(saved));history.replaceState(null,'',location.pathname)}
 return saved
}
export default function LearnPage(){
 const dialogTitleId=useId()
 const {id=''}=useParams(),{i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),t=(a:string,e:string)=>ar?a:e
 const [saved,setSaved]=useState(()=>readSaved(id)),[assignment,setAssignment]=useState<Assignment|null>(null),[view,setView]=useState<AttemptView|null>(null),[name,setName]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[left,setLeft]=useState(false)
 const inFlight=useRef(false),leaveDialog=useRef<HTMLDialogElement>(null),offset=useRef(0)
 const save=(s:Saved)=>{localStorage.setItem(`asasera:assignment:${id}`,JSON.stringify(s));setSaved(s)}
 const accept=useCallback((value:unknown)=>{const parsed=attemptViewSchema.parse(value);offset.current=parsed.serverNow-Date.now();setView(parsed)},[])
 const refresh=useCallback(async()=>{if(saved.attemptId&&saved.token)accept(await api.post(`/api/v1/delivery/attempts/${saved.attemptId}/view`,{token:saved.token}));else{const a=await api.post<Assignment>(`/api/v1/delivery/assignments/${id}/open`,{accessToken:saved.accessToken});offset.current=a.serverNow-Date.now();setAssignment(a)}},[saved,id,accept])
 const work=async(action:()=>Promise<void>)=>{if(inFlight.current)return;inFlight.current=true;setBusy(true);setError('');try{await action()}catch(e){setError(e instanceof Error?e.message:t('تعذّر الاتصال. حاول مجددًا.','Connection failed. Try again.'))}finally{inFlight.current=false;setBusy(false)}}
 useEffect(()=>{let alive=true;void refresh().catch(e=>{if(alive)setError(e.message)});return()=>{alive=false}},[refresh])
 useEffect(()=>{
  if(!view||left||view.feedbackAvailable&&view.status!=='active')return
  const remaining=new Date(view.deadline).getTime()-Date.now()-offset.current
  const timer=setTimeout(()=>{void refresh().catch(e=>setError(e.message))},Math.max(1000,Math.min(15000,remaining+100)))
  return()=>clearTimeout(timer)
 },[view,refresh,left])
 const answer=(answer:AnswerPayload)=>void work(async()=>{if(!view?.question||!saved.token)return;accept(await api.post(`/api/v1/delivery/attempts/${view.id}/answer`,{token:saved.token,position:view.position,questionId:view.question.id,answer}))})
 const title=view?.title??assignment?.title??'Asasera'
 return <main className={`asas ${stage.session}`} data-theme="classic" dir={ar?'rtl':'ltr'}><div className={styles.learn}>
  <header className={styles.learnHeader}><strong>Asasera</strong><span>{(view?.mode??assignment?.mode)==='study'?t('تعلّم ذاتي','Self-study'):t('واجب','Homework')}</span><button onClick={()=>void i18n.changeLanguage(ar?'en':'ar')}>{ar?'English':'العربية'}</button>{saved.attemptId&&!left&&<button onClick={()=>leaveDialog.current?.showModal()}>{t('خروج من جهاز مشترك','Leave a shared device')}</button>}</header>
  {error&&<div className={styles.alert} role="alert"><p>{error}</p><Button disabled={busy} onClick={()=>void work(refresh)}>{t('أعد الاتصال','Reconnect')}</Button></div>}
  {left?<section className={styles.complete}><h1>{t('أُزيل مفتاح الاستئناف من هذا المتصفح','Resume key removed from this browser')}</h1><p>{t('تبقى الإجابات التي أرسلتها محفوظة لدى المعلم.','Your submitted answers remain saved for your teacher.')}</p><Link to="/">{t('الرئيسية','Home')}</Link></section>:view?<>
   <p>{title} · {t('الموعد النهائي','Deadline')}: {new Date(view.deadline).toLocaleString(ar?'ar':'en')}</p>
   <progress className={styles.progress} aria-label={t('التقدّم','Progress')} max={view.questionCount} value={view.status==='submitted'?view.questionCount:view.position+(view.answered?1:0)}/>
   {view.status==='active'&&view.question?<>
    <p>{t(`السؤال ${view.position+1} من ${view.questionCount}`,`Question ${view.position+1} of ${view.questionCount}`)}</p>
    <h1 className={styles.questionTitle}>{view.question.prompt}</h1>
    <QuestionInput key={view.question.id} question={view.question} onAnswer={answer} disabled={busy||view.answered} revealed={view.reveal?.correct}/>
    {view.answered&&<div className={styles.next}><p role="status">{view.reveal?(view.reveal.wasCorrect?t('إجابة صحيحة!','Correct!'):t('راجع الإجابة الصحيحة ثم تابع.','Review the correct answer, then continue.')):t('تم حفظ إجابتك.','Your answer is saved.')}</p><Button variant="primary" loading={busy} onClick={()=>void work(async()=>accept(await api.post(`/api/v1/delivery/attempts/${view.id}/next`,{token:saved.token,position:view.position})))}>{view.position===view.questionCount-1?t('سلّم النشاط','Submit activity'):t('التالي','Next')}</Button></div>}
   </>:<section className={styles.complete}><h1>{view.status==='submitted'?t('تم تسليم نشاطك!','Activity submitted!'):t('انتهى وقت النشاط','This assignment has closed')}</h1><p>{view.status==='submitted'?t('حُفظت إجاباتك للمعلم. يمكنك العودة من هذا المتصفح لعرض التغذية الراجعة.','Your answers are saved for your teacher. Return in this browser to see your feedback.'):t('حُفظت الإجابات التي أرسلتها قبل انتهاء الوقت.','Answers sent before the deadline have been saved.')}</p>{view.feedbackAvailable?<p className={styles.summary}>{t(`${view.correctCount} إجابات صحيحة من ${view.questionCount}`,`${view.correctCount} correct out of ${view.questionCount}`)}</p>:<p>{t('تظهر الإجابات الصحيحة بعد الموعد النهائي أو عند إغلاق المعلم للنشاط.','Correct answers appear after the deadline or when your teacher closes the assignment.')}</p>}</section>}
   {view.review.map((r,index)=><section className={styles.review} key={r.question.id}><h2>{index+1}. {r.question.prompt}</h2><p>{r.wasCorrect===null?t('لم تُجب','Unanswered'):r.wasCorrect?t('أجبت بشكل صحيح','You answered correctly'):t('راجع الإجابة الصحيحة','Review the correct answer')}</p><QuestionInput question={r.question} onAnswer={()=>{}} disabled preview revealed={r.correct}/></section>)}
  </>:assignment?<section className={styles.join}><h1>{title}</h1><p>{assignment.questionCount} {t('أسئلة','questions')} · {new Date(assignment.deadline).toLocaleString(ar?'ar':'en')}</p>{assignment.closed?<p>{t('أغلق هذا النشاط. لا يمكن الانضمام الآن.','This assignment is closed. New attempts are unavailable.')}</p>:<form onSubmit={e=>{e.preventDefault();void work(async()=>{const result=await api.post<{attemptId:string;token:string}>(`/api/v1/delivery/assignments/${id}/join`,{accessToken:saved.accessToken,name,requestId:saved.requestId});save({...saved,...result})})}}><label>{t('اسمك','Your name')}<input value={name} onChange={e=>setName(e.target.value)} maxLength={40} autoComplete="nickname" required/></label><p>{t('يُحفظ تقدّمك في هذا المتصفح. عند استخدام جهاز مشترك، استخدم زر الخروج بعد الانتهاء.','Your progress resumes in this browser. On a shared device, use the leave button when you finish.')}</p><Button variant="primary" type="submit" loading={busy}>{t('ابدأ','Start')}</Button></form>}</section>:!error?<p role="status">{t('جارٍ فتح النشاط…','Opening activity…')}</p>:null}
  <dialog aria-labelledby={dialogTitleId} className={styles.leave} ref={leaveDialog}><h2 id={dialogTitleId}>{t('إزالة مفتاح الاستئناف؟','Remove your resume key?')}</h2><p>{t('لن تستطيع استئناف هذه المحاولة من هذا المتصفح. تبقى إجاباتك المرسلة لدى المعلم.','You will no longer be able to resume this attempt here. Submitted answers remain with your teacher.')}</p><Button variant="primary" onClick={()=>{localStorage.removeItem(`asasera:assignment:${id}`);leaveDialog.current?.close();setLeft(true)}}>{t('أزل المفتاح واخرج','Remove key and leave')}</Button><Button onClick={()=>leaveDialog.current?.close()}>{t('ابقَ هنا','Stay here')}</Button></dialog>
 </div></main>
}
