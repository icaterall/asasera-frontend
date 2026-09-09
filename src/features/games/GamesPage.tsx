import { learningLabel, type LearningProfile } from '@/shared/student'
import { practiceQuestionBank, practiceRound, practiceCard } from '../student/practice-questions'
import {useEffect,useMemo,useRef,useState} from 'react'
import {Link,useSearchParams} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {ArrowLeft,ArrowRight,Gamepad2,Trophy,Triangle,Diamond,Circle,Square,Check,RotateCcw} from 'lucide-react'
import {createArcade,advanceArcade,inputArcade,finishArcade,arcadeStateSchema,type ArcadeState,type ArcadeMode,type ArcadeInput} from '@/shared/arcade'
import {ActivityStage} from '../activity-themes/ActivityStage'
import {newDemoRound,localizeDemoCard,rememberDemoRound,type DemoCard} from '@/pages/Landing/demo-quiz'
import {demoQuestionBank,type DemoQuestion} from '@/pages/Landing/demo-question-bank'
import {GameArena} from './GameArena'
import {GameModePicker} from './GameModePicker'
import {gameInfo,games} from './catalog'
import styles from './Games.module.css'
type Practice={mode:ArcadeMode;cards:DemoCard[];index:number;choice:number|null;correctCount:number;points:number;phase:'question'|'game'|'summary';arcade:ArcadeState|null;seed:number}
const STORAGE='asasera.practice.games.v1'
function resume(storage: string, bank: DemoQuestion[]):Practice|null{
 try{const p=JSON.parse(sessionStorage.getItem(storage)??'null') as Practice|null
  if(!p||!games.some(g=>g.id===p.mode)||!Array.isArray(p.cards)||p.cards.length!==3||!p.cards.every(c=>bank.some(q=>q.id===c.questionId)&&Array.isArray(c.answerOrder)&&c.answerOrder.length===4&&new Set(c.answerOrder).size===4&&c.answerOrder.every(n=>Number.isInteger(n)&&n>=0&&n<=3))||!Number.isInteger(p.index)||p.index<0||p.index>3||!['question','game','summary'].includes(p.phase)||!Number.isInteger(p.seed)||!Number.isFinite(p.points)||!Number.isFinite(p.correctCount))return null
  if(p.phase==='summary'?p.index!==3:p.index>=3)return null
  if(!Number.isInteger(p.correctCount)||p.correctCount<0||p.correctCount>3||p.points<0)return null
  if(p.choice!==null&&(!Number.isInteger(p.choice)||p.choice<0||p.choice>3))return null
  if(p.arcade&&(!arcadeStateSchema.safeParse(p.arcade).success||p.arcade.mode!==p.mode||p.arcade.round!==p.index))return null
  if(p.phase==='game'&&(!p.arcade||p.choice===null))return null
  return p
 }catch{return null}
}
export default function GamesPage({learningProfile,studentId}:{learningProfile?:LearningProfile;studentId?:number}={}){
 const bank=useMemo(()=>learningProfile?practiceQuestionBank(learningProfile):demoQuestionBank,[learningProfile])
 const storage=learningProfile?`${STORAGE}:${studentId}:${learningProfile.stage}:${learningProfile.grade??"general"}`:STORAGE
 const localize=(card:DemoCard,lang:"ar"|"en")=>learningProfile?practiceCard(card,lang,bank):localizeDemoCard(card,lang)
 const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),t=(a:string,e:string)=>ar?a:e,[search]=useSearchParams()
 const [run,setRun]=useState<Practice|null>(()=>resume(storage,bank)),[mode,setMode]=useState<ArcadeMode>(()=>games.find(g=>g.id===search.get('mode'))?.id??'runner'),heading=useRef<HTMLHeadingElement>(null)
 const [localNow,setLocalNow]=useState(Date.now)
 const chosen=gameInfo(run?.mode??mode)
 useEffect(()=>{try{if(run)sessionStorage.setItem(storage,JSON.stringify(run));else sessionStorage.removeItem(storage)}catch{/* Practice remains playable without storage. */}},[run,storage])
 useEffect(()=>{heading.current?.focus()},[run?.index,run?.phase])
 useEffect(()=>{if(run?.phase!=='game')return;const timer=setInterval(()=>{const now=Date.now();setLocalNow(now);setRun(prior=>{if(!prior?.arcade||prior.phase!=='game')return prior;const next=advanceArcade(prior.arcade,now);return JSON.stringify(next)===JSON.stringify(prior.arcade)?prior:{...prior,arcade:next}})},150);return()=>clearInterval(timer)},[run?.phase])
 function start(){let recent:string[]=[];try{const value:unknown=JSON.parse(sessionStorage.getItem(`${storage}:recent`)??'[]');if(Array.isArray(value))recent=value.filter((v):v is string=>typeof v==='string')}catch{}
 const cards=learningProfile?practiceRound(bank,recent):newDemoRound();if(learningProfile){try{sessionStorage.setItem(`${storage}:recent`,JSON.stringify([...recent,...cards.map(c=>c.questionId)].slice(-12)))}catch{}}else rememberDemoRound(cards);setRun({mode,cards,index:0,choice:null,correctCount:0,points:0,phase:'question',arcade:null,seed:crypto.getRandomValues(new Uint32Array(1))[0]!%1000000})}
 function launch(){if(!run)return;const card=localize(run.cards[run.index]!,ar?'ar':'en'),now=Date.now();setLocalNow(now);setRun({...run,phase:'game',arcade:createArcade(run.mode,run.index,run.seed+run.index,run.choice===card.correct,now)})}
 function next(){if(!run?.arcade)return;setRun({...run,points:run.points+finishArcade(run.arcade,Date.now()).points,index:run.index+1,choice:null,phase:run.index===run.cards.length-1?'summary':'question',arcade:null})}
 const question=run?.phase==='question'?localize(run.cards[run.index]!,ar?'ar':'en'):null
 const shapes=[Triangle,Diamond,Circle,Square]
 return <ActivityStage as="main" theme={chosen.theme} phase={run?.phase==='game'?'game_play':'lobby'} className={`asas ${styles.demo}`} dir={ar?'rtl':'ltr'}>
  <header className={styles.demoHeader}><Link to={learningProfile?"/student":"/"}><ArrowLeft size={18}/>{t('أساسيرا','Asasera')}</Link><Link to={learningProfile?"/student/profile":"/teacher/activities"}><Gamepad2 size={20}/>{learningProfile?learningLabel(learningProfile,ar?'ar':'en'):t('استخدم أسئلتك','Use your own questions')}</Link><button onClick={()=>void i18n.changeLanguage(ar?'en':'ar')}>{ar?'English':'العربية'}</button></header>
  {!run?<section className={styles.intro}><h1>{t('تعلّم. العب. انطلق في المغامرة.','Learn it. Play it. Make an adventure.')}</h1><p>{t('ثلاث ألعاب يمكنك التحكّم بها. أجب عن أسئلة قصيرة، واكسب الموارد، ثم اقفز أو ابنِ أو استكشف.','Three games you control. Answer short questions, earn resources, then jump, build or explore.')}</p><GameModePicker value={mode} onChange={m=>m!=='quiz'&&setMode(m)} classic={false}/><div className={styles.startPanel}><div><p>{ar?chosen.reward.ar:chosen.reward.en}</p><p>{learningProfile?t('تدريب من ٣ أسئلة يناسب مرحلتك.','Three-question practice for your learning stage.'):t('تدريب مجاني من 3 أسئلة. لا يحتاج حسابًا.','Free three-question practice. No account needed.')}</p></div><button className={styles.primary} onClick={start}><Gamepad2/>{t('العب الآن','Play now')}<ArrowRight/></button></div></section>
  :run.phase==='summary'?<section className={styles.summary}><Trophy size={56}/><h1 ref={heading} tabIndex={-1}>{t('مغامرة رائعة!','Adventure complete!')}</h1><strong>{run.points} {t('نقطة لعب','game points')}</strong><p>{t(`أجبت عن ${run.correctCount} من ${run.cards.length} بشكل صحيح.`,`${run.correctCount} of ${run.cards.length} questions answered correctly.`)}</p><p>{learningProfile?t('تدريب حر. نتائج هذه الجولة مستقلة عن أنشطة المعلّم.','Free practice. This round is separate from teacher activity results.'):t('هذه تجربة تدريبية. يختار المعلم أسئلة الحصة ويحفظ نتائج التعلّم في الحساب.','This is a practice lesson. Teachers can launch these games with their own questions and save learning results.')}</p><button className={styles.primary} onClick={()=>{setRun(null);setMode(run.mode)}}><RotateCcw/>{t('مغامرة جديدة','New adventure')}</button><Link to={learningProfile?"/student":"/register"}>{learningProfile?t('العودة إلى مساحة تعلّمي','Back to my learning space'):t('أنشئ لعبة بأسئلتك','Create a game with your questions')}</Link></section>
  :run.phase==='game'&&run.arcade?<><GameArena state={run.arcade} serverNow={localNow} onInput={async(input:ArcadeInput)=>{setRun(prior=>prior?.arcade?{...prior,arcade:inputArcade(prior.arcade,input,Date.now())}:prior)}}/><div className={styles.roundNext}><button onClick={next}>{run.arcade.finished?(run.index===2?t('نتائج المغامرة','Adventure results'):t('السؤال التالي','Next question')):t('تجاوز الجولة وتابع التعلّم','Skip round and keep learning')}</button></div></>
  :question?<section className={styles.lesson}><div className={styles.lessonMeta}><span>{ar?chosen.ar:chosen.en}</span><span>{t(`السؤال ${run.index+1} من 3`,`Question ${run.index+1} of 3`)}</span><span>{run.points} {t('نقطة لعب','game points')}</span></div><h1 ref={heading} tabIndex={-1}>{question.title}</h1><div className={styles.lessonAnswers}>{question.answers.map((answer,i)=>{const Shape=shapes[i]!;return <button key={i} aria-pressed={run.choice===i} aria-disabled={run.choice!==null} onClick={()=>{if(run.choice!==null)return;setRun({...run,choice:i,correctCount:run.correctCount+(i===question.correct?1:0)})}}><Shape fill="currentColor"/>{answer}{run.choice!==null&&i===question.correct&&<Check/>}</button>})}</div>{run.choice!==null&&<div className={styles.lessonFeedback} role="status"><div><p><strong>{run.choice===question.correct?t('إجابة صحيحة!','Correct!'):t('لنتعلّم منها','Let’s learn from this')}</strong> {question.explanation}</p><p>{ar?chosen.reward.ar:chosen.reward.en}</p></div><button className={styles.primary} onClick={launch}>{t('ابدأ جولة اللعب','Play game round')}<ArrowRight/></button></div>}</section>:null}
 </ActivityStage>
}
