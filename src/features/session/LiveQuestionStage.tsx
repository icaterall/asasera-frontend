import {FormattedText} from '@/components/formatted-text/FormattedText'
import {useState, type CSSProperties} from 'react'
import {Button} from '@/design'
import {BookOpen, Check, CheckCircle2, Clock3, LockKeyhole, Send, Star, Users} from 'lucide-react'
import type {SessionSnapshot} from '@/shared/session'
import type {AnswerPayload} from '@/shared/questions'
import type {SessionAudio} from '@/design/audio'
import type {ServerClock} from './clock'
import {Countdown} from './Countdown'
import {QuestionInput} from './QuestionInput'
import {FlashcardContent} from '../presentations/FlashcardContent'
import {LiveMemoryBoard} from './LiveMemoryBoard'
import type {LivePresentationCommand} from '@/shared/live-presentation'
import {answerDistribution, answerProgress} from './questionPresentation'
import styles from './LiveQuestionStage.module.css'

export function LiveQuestionStage({snapshot:s,role,clock,audio,connected,pending,persisted=null,ar,onAnswer,onRetry,onPresentation}: {
  snapshot:SessionSnapshot;role:'host'|'projector'|'player';clock:ServerClock;audio:SessionAudio;
  connected:boolean;pending:boolean;
  /** From the answer ACK: true = the answer row committed ("saved"); false = accepted in memory, written at close ("received"). */
  persisted?:boolean|null;
  ar:boolean;onAnswer:(payload:AnswerPayload)=>void;onRetry?:(payload:AnswerPayload)=>void;
  onPresentation?:(command:LivePresentationCommand)=>Promise<unknown>;
}) {
  const [expiredDeadline,setExpiredDeadline]=useState<number|null>(null)
  const expired=s.endsAt!==null&&(expiredDeadline===s.endsAt||clock.now()>=s.endsAt)
  const [retrying,setRetrying]=useState(false)
  const q=s.question,player=role==='player',open=s.state==='question_open',revealing=s.state==='revealing'
  const choice=q?.payload.kind==='mcq'||q?.payload.kind==='tf'
  const progress=answerProgress(s.acceptedCount,s.participants.length)
  const oral=!!s.presentation&&(['discussion','self-rated'].includes(s.presentation.selection.config.semantics)||['flashcards','speaking-cards','memory'].includes(s.presentation.selection.definitionId)||q?.payload.kind==='discussion')
  const flash=s.presentation?.selection.definitionId==='flashcards'
  const recall=flash||s.presentation?.selection.definitionId==='speaking-cards'
  const memory=s.presentation?.active?.memory
  const contentLanguage=/^(ar|en|fr|es)(-[a-z0-9]{2,8})*$/i.test(s.contentLanguage??'')?s.contentLanguage!:undefined
  const contentDir=contentLanguage?.toLowerCase().startsWith('ar')?'rtl':contentLanguage?'ltr':'auto'
  const retryUsed=s.self?.practiceRetry?.used??false
  const retryActive=retrying&&!retryUsed
  const waiting=player&&!revealing&&!retryActive&&(s.self?.answered||s.state==='question_locked'||expired)
  const t=(a:string,e:string)=>ar?a:e
  if(!q)return null
  const rows=revealing&&s.reveal?answerDistribution(q,s.reveal,s.participants.length,ar):[]
  return <main className={styles.stage} data-question-surface="" data-player={player} data-choice={choice} data-revealing={revealing} data-collective={oral}>
    <div className={styles.round}>
      <span>{t(`السؤال ${s.presentation?.active?.position??q.qIndex+1} من ${s.questionCount}`,`Question ${s.presentation?.active?.position??q.qIndex+1} of ${s.questionCount}`)}</span>
      <span>{revealing?t('لنتعلّم معًا','Let’s learn together'):s.state==='question_locked'||expired?t('انتهى الوقت','Time is up'):oral?t('فكّروا وناقشوا معًا','Think and discuss together'):choice?t('اختر إجابة واحدة','Choose one answer'):t('اتبع تعليمات السؤال','Follow the question instructions')}</span>
    </div>
    <h1 className={styles.prompt} dir={contentDir} lang={contentLanguage}><FormattedText text={q.prompt}/></h1>
    {s.presentation?.active?.challenge&&<p className={styles.stageStatus}><Star size={20} aria-hidden="true"/>{t('سؤال تحدٍّ','Challenge question')}</p>}
    {!!s.presentation?.active?.bonusPoints&&<p className={styles.stageStatus}>{t(`الإجابة الصحيحة: ${s.presentation.rules.baseGamePoints} + ${s.presentation.active.bonusPoints} نقطة لعب. لا تغير درجة التعلّم.`,`Correct response: ${s.presentation.rules.baseGamePoints} + ${s.presentation.active.bonusPoints} game points. Learning marks are unchanged.`)}</p>}
    {s.presentation?.active?.hint&&<p className={styles.stageStatus}><strong>{t('تلميح','Hint')}</strong> <span dir={contentDir} lang={contentLanguage}>{s.presentation.active.hint}</span></p>}
    <div className={styles.arena}>
      {!player&&!oral&&<div className={styles.responseCount}>
        <Users size={24} aria-hidden="true"/>
        <strong>{s.acceptedCount}<span> / {s.participants.length}</span></strong>
        <span role="status">{progress.complete?t('أجاب الجميع','Everyone answered'):t('إجابات وصلت','Answers received')}</span>
        <progress max={Math.max(1,s.participants.length)} value={s.acceptedCount} aria-label={t('الإجابات المستلمة','Answers received')}/>
      </div>}
      <div className={styles.feedback}>
        {waiting?<section className={styles.waiting} role="status">
          {s.self?.answered?<CheckCircle2 aria-hidden="true"/>:<Clock3 aria-hidden="true"/>}
          <h2>{s.self?.answered?(persisted?t('تم حفظ إجابتك','You’re in! Answer saved'):t('تم تسجيل إجابتك','You’re in! Answer received')):t('انتهى الوقت','Time is up')}</h2>
          <p>{t('تابع شاشة العرض لنكتشف الإجابة معًا.','Look at the projector. Let’s discover the answer together.')}</p>
        </section>:revealing?<>
          {s.self&&!oral&&<div className={styles.personalResult} role="status" data-correct={s.self.result==='correct'}>
            {s.self.result==='correct'?<CheckCircle2 aria-hidden="true"/>:<BookOpen aria-hidden="true"/>}
            <div><h2>{s.self.result==='correct'?t('إجابة صحيحة!','You got it!'):s.self.result==='incorrect'?t('تعلّمت شيئًا جديدًا','Keep learning'):t('لم تصل إجابة لهذا السؤال','No answer received')}</h2><p>{s.self.score} {t('نقطة إجمالية','total points')}</p></div>
          </div>}
          {!player&&!oral&&rows.length>0&&<figure className={styles.results}>
            <figcaption>{t('إجابات الصف','Class answers')}</figcaption>
            {rows.map(row=><div className={styles.resultRow} key={row.key} style={{'--result-color':row.slot?`var(--a${row.slot})`:'var(--color-brand-500)'} as CSSProperties}>
              <span className={styles.resultLabel} dir="auto">{row.label}{row.correct&&<Check size={20} aria-label={t('إجابة صحيحة','Correct answer')}/>}</span>
              <span className={styles.resultTrack} aria-hidden="true"><span style={{transform:`scaleX(${row.fraction})`}}/></span>
              <strong>{row.count}</strong>
            </div>)}
            {progress.unanswered>0&&<p>{t(`${progress.unanswered} لم يجيبوا`,`${progress.unanswered} did not answer`)}</p>}
          </figure>}
          {/* v5 §19 "reveal + explanation": arrives only inside the reveal, after the answer window closed; shown to host, projector and players alike. */}
          {!recall&&s.reveal?.explanation&&<figure className={styles.results} data-explanation="">
            <figcaption><BookOpen size={18} aria-hidden="true"/> {t('لماذا هذه الإجابة؟','Why this answer?')}</figcaption>
            <div className={styles.resultRow} style={{gridTemplateColumns:'minmax(0,1fr)'}}><span className={styles.resultLabel} dir={contentDir} lang={contentLanguage}><bdi>{s.reveal.explanation}</bdi></span></div>
          </figure>}
        </>:<div className={styles.stageStatus}>
          {s.state==='question_locked'||expired?<><LockKeyhole aria-hidden="true"/><span>{t('نجهّز كشف الإجابة…','Getting the answer ready…')}</span></>:pending?<span role="status"><Send aria-hidden="true"/>{t('جارٍ إرسال الإجابة…','Sending your answer…')}</span>:player&&choice&&!oral?<span>{t('اضغط على الإجابة التي تختارها.','Tap the answer you choose.')}</span>:null}
        </div>}
      </div>
      <div className={styles.clock}>
        {s.endsAt!==null&&open?<Countdown endsAt={s.endsAt} duration={q.timeLimitS+(s.presentation?.active?.thinkingAdded?15:0)} clock={clock} audio={audio} ar={ar} onExpire={()=>setExpiredDeadline(s.endsAt)}/>:revealing?<CheckCircle2 size={48} aria-label={t('تم كشف الإجابة','Answer revealed')}/>:open?<span>{t('بإيقاع المعلّم','Host-paced')}</span>:<Clock3 size={48} aria-label={t('انتهى الوقت','Time is up')}/>}
      </div>
    </div>
    {/* v5 §07/§19 (LIVE-01, UI-04): the player's phone shows the prompt, media and
        option TEXT together with the colour+shape glyph by default. QuestionInput /
        AnswerTile keep a `projectorOnly` (shape-only) capability for a classroom that
        reads the wording off the front screen, but a host-local toggle can never reach
        the players' phones, so turning it on needs a snapshot flag from the server
        (a shared-contract follow-up, e.g. `SessionSnapshot.projectorOnly`). */}
    {memory?<LiveMemoryBoard board={memory} host={role==='host'} ar={ar} disabled={pending||!connected||!open||!onPresentation} contentLanguage={contentLanguage} onCommand={onPresentation??(async()=>{})}/>:recall?<div className={`${styles.input} ${styles.recall}`} dir={contentDir}><FlashcardContent question={q} revealed={revealing} correct={s.reveal?.correct} explanation={s.reveal?.explanation} contentLanguage={contentLanguage}/><p className={styles.stageStatus}>{flash?t('استرجاع جماعي؛ لا تُسجَّل درجة فردية.','Shared recall; no individual grade is recorded.'):t('نقاش جماعي؛ لا تُسجَّل درجة فردية.','Shared discussion; no individual grade is recorded.')}</p></div>:oral?<p className={styles.stageStatus}>{revealing&&typeof s.reveal?.correct==='string'&&s.reveal.correct?<span dir={contentDir} lang={contentLanguage}>{s.reveal.correct}</span>:t('ناقشوا السؤال معًا؛ لا تُسجَّل إجابة فردية صحيحة.','Discuss the question together; no individual correct answer is recorded.')}</p>:!waiting&&<div className={styles.input} dir={contentDir}>
      <QuestionInput key={`${s.runId}:${q.qIndex}`} question={q} preview={!player}
        disabled={pending||!connected||(retryActive?false:!open||expired||!!s.self?.answered)}
        {...(s.reveal&&!retryActive?{revealed:s.reveal.correct}:{})} onAnswer={retryActive?onRetry??onAnswer:onAnswer}/>
    </div>}
    {player&&s.presentation?.rules.extraPracticeAttempt&&s.self?.answered&&!oral&&<section className={styles.stageStatus}>{retryUsed?<p role="status">{t('حُفظت محاولة التدريب الإضافية؛ بقيت الإجابة الأولى كما هي.','Extra practice attempt saved; the first response is unchanged.')}{s.self?.practiceRetry?.correct!==null&&s.self?.practiceRetry?.correct!==undefined&&' '+(s.self.practiceRetry.correct?t('صحيحة','Correct'):t('غير صحيحة','Incorrect'))}</p>:!retryActive?<Button variant="secondary" disabled={!connected||pending||!['question_open','revealing'].includes(s.state)} onClick={()=>setRetrying(true)}>{t('حاول مرة أخرى · تدريب','Try again · practice')}</Button>:<p>{t('محاولة إضافية واحدة. لا تغير الإجابة الأولى أو درجة التعلّم.','One extra attempt. It does not change the first answer or learning marks.')}</p>}</section>}
  </main>
}
