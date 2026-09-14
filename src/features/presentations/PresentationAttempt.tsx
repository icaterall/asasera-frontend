import {useLayoutEffect,useRef,useState} from 'react'
import {useTranslation} from 'react-i18next'
import {RotateCw,Layers,Check} from 'lucide-react'
import {Button} from '@/design'
import type {AttemptView,AttemptPresentationCommand} from '@/shared/delivery'
import type {AnswerPayload} from '@/shared/questions'
import {FormattedText} from '@/components/formatted-text/FormattedText'
import {QuestionInput} from '../session/QuestionInput'
import {useActivityMotion} from '../activity-themes/useActivityMotion'
import {interactiveMotion} from '@/shared/interactive-motion'
import {FlashcardContent,PracticeSourceLine} from './FlashcardContent'
import {WordBuilderInput} from './WordBuilderInput'
import {MemoryBoard} from './MemoryBoard'
import {QuestionWheelStage} from './QuestionWheelStage'
import {WordGridInput} from './WordGridInput'
import styles from './Presentations.module.css'
type Action=Omit<AttemptPresentationCommand,'requestId'|'expectedRevision'|'token'>
export function PresentationAttempt({view,busy,onCommand,onAnswer}:{view:AttemptView;busy:boolean;onCommand:(action:Action)=>void;onAnswer:(answer:AnswerPayload)=>void}){
 const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),t=(a:string,e:string)=>ar?a:e
 const p=view.presentation!,flash=p.definitionId==='flashcards',speaking=p.definitionId==='speaking-cards',boxes=p.definitionId==='open-box'
 const face=useRef<HTMLDivElement>(null),boxStage=useRef<HTMLElement>(null),motion=useActivityMotion()
 const [boxPage,setBoxPage]=useState(0)
 const [showBoxBoard,setShowBoxBoard]=useState(p.activeIndex===null)
 const [pendingBox,setPendingBox]=useState<number|null>(null)
 // Keep the selected tile visible until the server commits this exact draw.
 // Animation never gates the authoritative question or its answer controls.
 const showingBoxes=showBoxBoard&&(pendingBox===null||p.activeIndex!==pendingBox)
 const contentLanguage=['ar','en','fr','es'].includes(view.contentLanguage??'')?view.contentLanguage:undefined
 const completed=view.status!=='active'&&!p.reviewing,remaining=p.reviewing?p.reviewOrder.filter(index=>!p.reviewed.includes(index)):p.order.filter(index=>!p.drawn.includes(index))
 const recallOrder=p.reviewing?p.reviewOrder:p.drawn
 const recallPosition=p.activeIndex===null?-1:recallOrder.indexOf(p.activeIndex)
 const recallHasForward=flash&&recallPosition>=0&&recallPosition+1<recallOrder.length
 const hasNextCard=flash&&p.reviewing?recallHasForward:remaining.length>0||recallHasForward
 const labels:Record<string,[string,string]>={'flashcards':['بطاقات المراجعة','Flashcards'],'question-wheel':['عجلة الأسئلة','Question wheel'],'random-cards':['بطاقات عشوائية','Random cards'],'speaking-cards':['بطاقات التحدث','Speaking cards'],'open-box':['افتح الصندوق','Open the box'],'match-up':['المطابقة','Match up'],'group-sort':['تصنيف المجموعات','Group sort'],sequence:['الترتيب','Sequence'],'sentence-completion':['إكمال الجملة','Complete the sentence'],'word-builder':['بناء الكلمات','Word builder']}
 const label=p.definitionId==='memory'?['الذاكرة','Memory'] as [string,string]:p.definitionId==='word-search'?['البحث عن الكلمات','Word search'] as [string,string]:p.definitionId==='crossword'?['الكلمات المتقاطعة','Crossword'] as [string,string]:labels[p.definitionId]??['نشاط','Activity']
 const readyForNext=p.activeIndex===null||view.answered
 useLayoutEffect(()=>{
  const target=boxes?boxStage.current:face.current;if(!target||!motion.enabled||typeof target.animate!=='function')return
  const frames=boxes?[{opacity:.65,transform:'translateY(4px)'},{opacity:1,transform:'translateY(0)'}]:[{transform:flash?'perspective(1000px) rotateY(-8deg)':'translateY(8px)'},{transform:flash?'perspective(1000px) rotateY(0deg)':'translateY(0)'}]
  const animation=target.animate(frames,{duration:boxes?interactiveMotion.duration.box:flash?interactiveMotion.duration.flip:interactiveMotion.duration.deal,easing:interactiveMotion.easing.enter})
  return()=>animation.cancel()
 },[p.activeIndex,p.revealed,motion.enabled,flash,boxes])
 return <section className={styles.stage} data-presentation={p.definitionId}>
  <div className={styles.progress}><strong>{t(...label)}</strong><span>{p.reviewing?t(`مراجعة ${p.reviewed.length} من ${p.reviewOrder.length}`,`Review ${p.reviewed.length} of ${p.reviewOrder.length}`):t(`السؤال ${p.activeIndex===null?p.drawn.length:p.drawn.indexOf(p.activeIndex)+1} من ${view.questionCount}`,`${p.activeIndex===null?p.drawn.length:p.drawn.indexOf(p.activeIndex)+1} of ${view.questionCount}`)}</span></div>
  <p className={styles.hint}>{flash?t('فكّر في الإجابة، ثم اكشف البطاقة وقيّم تذكّرك. هذا تدريب وليس اختبارًا.','Recall the answer, reveal the card, then rate your memory. This is practice, not a test.'):speaking?t('ناقش الموضوع، ثم سجّل أنك ناقشته. لا توجد درجة آلية.','Discuss the topic, then mark it discussed. There is no automatic grade.'):t('يُحفظ تقدّمك بعد كل خطوة.','Your progress is saved after every step.')}</p>
  {boxes&&!completed&&showingBoxes&&<><p>{t('اختر صندوقًا مغلقًا. سيظهر السؤال بحجمه الكامل.','Choose a closed box to open its full question.')}</p><div className={styles.boxes} aria-label={t('صناديق الأسئلة','Question boxes')}>{p.order.slice(boxPage*12,boxPage*12+12).map((index,n)=>{const number=boxPage*12+n+1;return <Button key={index} disabled={busy||!readyForNext||p.drawn.includes(index)} data-opening={busy&&pendingBox===index} aria-label={t(`الصندوق ${number}${p.drawn.includes(index)?'، مفتوح':''}`,`Box ${number}${p.drawn.includes(index)?', opened':''}`)} onClick={()=>{setPendingBox(index);onCommand({action:'draw',index})}}><span>{number}</span>{p.drawn.includes(index)&&<><Check aria-hidden="true"/><small>{t('مفتوح','Opened')}</small></>}</Button>})}</div>{p.order.length>12&&<nav className={styles.actions} aria-label={t('صفحات الصناديق','Box pages')}><Button disabled={boxPage===0||busy} onClick={()=>setBoxPage(n=>n-1)}>{t('السابق','Previous')}</Button><span>{t(`الصفحة ${boxPage+1} من ${Math.ceil(p.order.length/12)}`,`Page ${boxPage+1} of ${Math.ceil(p.order.length/12)}`)}</span><Button disabled={(boxPage+1)*12>=p.order.length||busy} onClick={()=>setBoxPage(n=>n+1)}>{t('التالي','Next')}</Button></nav>}</>}
  {(!boxes||!showingBoxes||completed)&&<>
  <QuestionWheelStage active={p.definitionId==='question-wheel'&&!completed} spin={p.questionWheel} serverNow={view.serverNow}>
  {completed?<section className={styles.card}><h1>{t('اكتملت الجولة','Round complete')}</h1><p>{flash?t('حُفظ تقييمك الذاتي. لا يُحسب كإجابات صحيحة أو درجات.','Your self-ratings are saved. They are not counted as correct answers or marks.'):speaking||['memory','word-search','crossword'].includes(p.definitionId)?t('حُفظ تقدم التدريب، وليس درجة اختبار.','Your practice progress is saved, not a test grade.'):t('حُفظت إجاباتك وتقدّمك.','Your answers and progress are saved.')}</p>{flash&&<ul>{(['again','learning','known'] as const).map((rating,i)=><li key={rating}>{[t('أراجع مرة أخرى','Review again'),t('أتعلمها','Learning'),t('أتذكرها','Remembered')][i]}: {Object.values(p.ratings).filter(value=>value===rating).length}</li>)}</ul>}</section>:view.question?<section ref={boxStage} className={styles.card} data-revealed={p.revealed}>
   <div ref={face}><h1 dir="auto" lang={contentLanguage}><FormattedText text={view.question.prompt}/></h1>{flash&&<FlashcardContent question={view.question} revealed={p.revealed} correct={view.reveal?.correct} explanation={view.reveal?.explanation} contentLanguage={contentLanguage}/>}</div>
   {flash?<>
    <div className={styles.actions}><Button disabled={busy} onClick={()=>onCommand({action:'flip'})}><Layers size={18}/>{p.revealed?t('إظهار السؤال','Show question'):t('اكشف الإجابة','Reveal answer')}</Button></div>
    {p.revealed&&<div className={styles.ratings} aria-label={t('قيّم تذكّرك','Rate your recall')}>{(['again','learning','known'] as const).map((rating,i)=><Button key={rating} disabled={busy} aria-label={[t('أراجع مرة أخرى','Review again'),t('أتعلمها','Learning'),t('أتذكرها','Remembered')][i]} aria-pressed={p.ratings[String(p.activeIndex)]===rating} onClick={()=>onCommand({action:'rate',rating})}>{p.ratings[String(p.activeIndex)]===rating&&<Check aria-hidden="true" size={16}/>} {[t('أراجع مرة أخرى','Review again'),t('أتعلمها','Learning'),t('أتذكرها','Remembered')][i]}</Button>)}</div>}
   </>:speaking?<>
    <QuestionInput question={view.question} disabled preview onAnswer={()=>{}}/>
    {p.revealed&&typeof view.reveal?.correct==='string'&&<p className={styles.response}>{view.reveal.correct}</p>}
    <PracticeSourceLine source={view.question.sourceContext}/>
    <div className={styles.actions}><Button disabled={busy} onClick={()=>onCommand({action:'flip'})}>{p.revealed?t('إخفاء المرجع','Hide reference'):t('إظهار المرجع إن وجد','Show reference if available')}</Button><Button variant="primary" disabled={busy||view.answered} onClick={()=>onCommand({action:'discussed'})}>{view.answered?t('تمت المناقشة','Discussed'):t('سجّل كمناقَش','Mark discussed')}</Button></div>
   </>:p.memory?<MemoryBoard board={p.memory} busy={busy} onCommand={onCommand}/>:p.wordGrid?<WordGridInput key={view.question.id} grid={p.wordGrid} busy={busy} onCommand={onCommand}/>:<>{p.wordBuilder&&!view.answered?<WordBuilderInput key={view.question.id} board={p.wordBuilder} disabled={busy} onAnswer={onAnswer}/>:<QuestionInput key={view.question.id} question={view.question} onAnswer={onAnswer} disabled={busy||view.answered} submittedAnswer={view.submittedAnswer} revealed={view.reveal?.correct}/>} {view.answered&&<p role="status">{view.reveal?(view.reveal.wasCorrect?t('إجابة صحيحة','Correct'):t('راجع الإجابة الصحيحة','Review the correct answer')):t('تم حفظ إجابتك','Your answer is saved')}</p>}{view.reveal?.explanation&&<p>{view.reveal.explanation}</p>}</>}
  </section>:<section className={styles.card}><h1>{boxes?t('اختر صندوقًا للبدء','Choose a box to begin'):p.definitionId==='question-wheel'?t('جاهز لاختيار سؤال؟','Ready to choose a question?'):p.definitionId==='memory'?t('جاهز للوحة الذاكرة؟','Ready for a memory board?'):p.definitionId==='word-search'?t('جاهز للبحث عن الكلمات؟','Ready to find the words?'):p.definitionId==='crossword'?t('جاهز للكلمات المتقاطعة؟','Ready for the crossword?'):t('جاهز لأول بطاقة؟','Ready for your first card?')}</h1></section>}
  </QuestionWheelStage>
  {boxes&&!completed&&<div className={styles.actions}><Button disabled={busy||!readyForNext} onClick={()=>{setPendingBox(null);setShowBoxBoard(true)}}>{t('العودة إلى الصناديق','Back to boxes')}</Button></div>}
  </>}
  {!completed&&(!boxes||remaining.length===0)&&<div className={styles.actions}><Button variant="primary" disabled={busy||!readyForNext} onClick={()=>onCommand({action:'draw'})}><RotateCw size={18}/>{p.activeIndex===null?t('ابدأ الجولة','Start round'):hasNextCard?t('البطاقة التالية','Next card'):t('إنهاء الجولة','Finish round')}</Button></div>}
  {flash&&<div className={styles.actions}>{p.activeIndex!==null&&p.drawn.indexOf(p.activeIndex)>0&&!completed&&<Button disabled={busy} onClick={()=>onCommand({action:'previous'})}>{t('البطاقة السابقة','Previous card')}</Button>}{completed&&Object.values(p.ratings).includes('again')&&<Button disabled={busy} onClick={()=>onCommand({action:'review-again'})}>{t('راجع البطاقات التي تحتاجها','Review cards marked again')}</Button>}{p.reviewing&&<p role="status">{t('مراجعة اختيارية؛ تقييماتك السابقة محفوظة.','Optional review; your previous ratings are saved.')}</p>}</div>}
 </section>
}
