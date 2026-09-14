import {useState} from 'react'
import {useQuery} from '@tanstack/react-query'
import {useTranslation} from 'react-i18next'
import {Button} from '@/design'
import {api} from '@/lib/api'
import {FormattedText} from '@/components/formatted-text/FormattedText'
import {presentationPreviewSchema,type PresentationPreview as Preview,type PresentationPreviewItem} from '@/shared/presentation-preview'
import type {PresentationSelection} from '@/shared/presentation'
import {parsePayload,matchPayloadSchema,type AnswerPayload} from '@/shared/questions'
import {markAnswer,type MarkResult} from '@/shared/scoring'
import {projectMemoryBoard,updateMemoryBoard} from '@/shared/memory'
import {QuestionInput} from '../session/QuestionInput'
import {FlashcardContent} from './FlashcardContent'
import {MemoryBoard} from './MemoryBoard'
import {WordBuilderInput} from './WordBuilderInput'
import {WordGridInput} from './WordGridInput'
import styles from './PresentationPreview.module.css'

/** Authenticated content read only; all interactions below are disposable local preview state. */
export function PresentationPreview({activityId,selection}:{activityId:number;selection:PresentationSelection}){
 const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar')
 const result=useQuery({queryKey:['teacher-presentation-preview',activityId,selection],queryFn:async()=>presentationPreviewSchema.parse(await api.post(`/api/v1/presentations/activities/${activityId}/preview`,selection)),retry:false,gcTime:0,staleTime:Infinity})
 if(result.isPending)return <p role="status">{ar?'جارٍ تحميل معاينة النسخة المعتمدة…':'Loading the approved preview…'}</p>
 if(result.error)return <div><p role="alert">{result.error.message}</p><Button onClick={()=>void result.refetch()}>{ar?'إعادة تحميل المعاينة':'Retry preview'}</Button></div>
 return <PreviewSelection key={JSON.stringify(selection)} data={result.data}/>
}
export default PresentationPreview

function PreviewSelection({data}:{data:Preview}){
 const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),[index,setIndex]=useState(0),[reset,setReset]=useState(0)
 const item=data.items[index]!
 return <section className={styles.root} aria-label={ar?'معاينة العرض':'Presentation preview'}>
  <header className={styles.header}><h2>{ar?'معاينة العرض':'Presentation preview'}</h2><Button variant="quiet" onClick={()=>setReset(value=>value+1)}>{ar?'إعادة المعاينة':'Reset preview'}</Button></header>
  <p className={styles.notice}>{ar?'جرّب المحتوى هنا فقط. لا تُحفظ هذه المعاينة ولا تُسجّل درجات أو إجابات للطلاب.':'Try the content here only. Nothing is saved or scored, and no learner responses are recorded.'}</p>
  <p>{ar?`${data.items.length} من ${data.sourceQuestionCount} أسئلة معتمدة · النسخة ${data.contentVersionId}`:`${data.items.length} of ${data.sourceQuestionCount} approved questions · Version ${data.contentVersionId}`}</p>
  <div className={styles.stage} lang={data.contentLanguage??undefined} dir={data.contentLanguage==='ar'?'rtl':data.contentLanguage==='en'?'ltr':'auto'}>
   <h3><FormattedText text={item.question.prompt}/></h3>
   <PreviewItem key={`${item.question.id}:${reset}`} item={item} definitionId={data.selection.definitionId} contentLanguage={data.contentLanguage??undefined}/>
  </div>
  <nav className={styles.navigation} aria-label={ar?'أسئلة المعاينة':'Preview questions'}><Button disabled={index===0} onClick={()=>setIndex(value=>value-1)}>{ar?'السابق':'Previous'}</Button><span aria-live="polite">{ar?`${index+1} من ${data.items.length}`:`${index+1} of ${data.items.length}`}</span><Button disabled={index===data.items.length-1} onClick={()=>setIndex(value=>value+1)}>{ar?'التالي':'Next'}</Button></nav>
 </section>
}

function PreviewItem({item,definitionId,contentLanguage}:{item:PresentationPreviewItem;definitionId:PresentationSelection['definitionId'];contentLanguage:string|undefined}){
 const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),[revealed,setRevealed]=useState(false),[memory,setMemory]=useState(item.memory),[check,setCheck]=useState<MarkResult|null>(null)
 const parsed=parsePayload(item.question.payload.kind,item.reviewedPayload)
 const evaluate=(answer:AnswerPayload)=>markAnswer(item.question.payload.kind,item.reviewedPayload,answer)
 const reference=<Button onClick={()=>setRevealed(value=>!value)}>{revealed?(ar?'إخفاء الإجابة المرجعية':'Hide reference answer'):(ar?'أظهر الإجابة المرجعية':'Show reference answer')}</Button>
 let content
 if(memory){
  content=<><MemoryBoard board={projectMemoryBoard(memory)} busy={false} onCommand={command=>setMemory(previous=>previous?updateMemoryBoard(previous,matchPayloadSchema.parse(item.reviewedPayload),command.action==='memory-continue'?{action:'continue'}:{action:'flip',cardId:command.cardId!}):previous)}/>{reference}{revealed&&<QuestionInput question={item.question} disabled preview onAnswer={()=>{}} revealed={item.referenceAnswer}/>}</>
 }else if(item.wordGrid){
  const grid=item.wordGrid
  content=<><p>{ar?'معاينة للوحة المحفوظة فقط. لا يمكن إرسال كلمات أو حفظ تقدم هنا.':'Read-only saved layout. Words cannot be submitted and progress is not saved here.'}</p>{reference}<WordGridInput previewOnly busy onCommand={()=>{}} grid={{board:grid.board,found:revealed?grid.referencePaths:[],values:revealed?grid.referenceValues:{},feedback:{},conflicts:[],checks:0,maxChecks:100,complete:false}}/></>
 }else if(item.wordBuilder){
  content=<><WordBuilderInput board={item.wordBuilder} disabled={check!==null} onAnswer={answer=>setCheck(evaluate(answer))}/>{check&&<p role="status">{check.correct?(ar?'الإجابة توافق المحتوى المعتمد. نتيجة معاينة فقط.':'The answer matches the approved content. Preview result only.'):(ar?'راجع ترتيب الحروف، ثم أعد المعاينة.':'Review the tile order, then reset the preview.')}</p>}{reference}{revealed&&<QuestionInput question={item.question} disabled preview onAnswer={()=>{}} revealed={item.referenceAnswer}/>}</>
 }else if(definitionId==='flashcards'){
  content=<><FlashcardContent question={item.question} revealed={revealed} correct={item.referenceAnswer} explanation={item.explanation} {...(contentLanguage?{contentLanguage}:{})}/>{reference}</>
 }else if(definitionId==='speaking-cards'){
  content=<><p>{ar?'مناقشة دون تقييم آلي. لا تُسجّل المشاركة في المعاينة.':'Discussion without automatic grading. Participation is not recorded in preview.'}</p>{reference}{revealed&&<p className={styles.reference} dir="auto">{typeof item.referenceAnswer==='string'&&item.referenceAnswer?item.referenceAnswer:(ar?'لم تُضف إجابة مرجعية.':'No reference response was supplied.')}</p>}</>
 }else content=<QuestionInput question={item.question} preview interactivePreview evaluatePreview={evaluate} onAnswer={()=>{}}/>
 const policy=parsed.success&&'policy' in parsed.data?parsed.data.policy:null
 return <div className={styles.content}>{content}{policy&&<details className={styles.policy}><summary>{ar?'الإجابات المقبولة وقواعد المقارنة':'Accepted answers and comparison policy'}</summary>
  {parsed.success&&'blanks' in parsed.data&&<ol>{parsed.data.blanks.map(blank=><li key={blank.id} dir="auto">{blank.acceptedAnswers.join(' / ')}</li>)}</ol>}
  <p>{ar?`التشكيل: ${policy.diacritics==='preserve'?'محفوظ':'متجاهَل'} · التطويل: ${policy.tatweel==='preserve'?'محفوظ':'متجاهَل'} · المسافات: ${policy.spaces==='preserve'?'محفوظة':'متجاهَلة'} · حالة الأحرف: ${policy.case==='preserve'?'محفوظة':'متجاهَلة'}`:`Diacritics: ${policy.diacritics} · Tatweel: ${policy.tatweel} · Spaces: ${policy.spaces} · Case: ${policy.case}`}</p>
  {parsed.success&&'trimBoundaryWhitespace' in parsed.data&&<p>{parsed.data.trimBoundaryWhitespace?(ar?'تُتجاهل المسافات في بداية الإجابة ونهايتها.':'Leading and trailing answer spaces are ignored.'):(ar?'تُحفظ المسافات في بداية الإجابة ونهايتها.':'Leading and trailing answer spaces are preserved.')}</p>}
  <p>{ar?'لا تُوحّد الهمزة والألف أو الحروف المختلفة.':'Different Arabic letters, including hamza/alef variants, remain distinct.'}</p>
 </details>}</div>
}
