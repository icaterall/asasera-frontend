import {useTranslation} from 'react-i18next'
import type {PublicQuestion} from '@/shared/session'
import {FormattedText} from '@/components/formatted-text/FormattedText'
import {QuestionInput} from '../session/QuestionInput'
import {QuestionVideo} from '@/components/QuestionVideo'
import {mediaUrl} from '../editor/ImageUpload'
import {PresentationImage} from './PresentationImage'
import type {PracticeSourceContext} from '@/shared/practice-source'
import styles from './Presentations.module.css'
export function PracticeSourceLine({source}:{source?:PracticeSourceContext}){
 const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar')
 if(!source)return null
 const text=source.origin==='topic'?(ar?'المصدر: سؤال مبني على موضوع':'Source: topic-based question'):(ar?'المصدر: مادة مرفوعة':'Source: uploaded material')+(source.sections.length?(ar?' · أقسام المصدر ':' · source sections ')+source.sections.join(ar?'، ':', '):'')
 return <p className={styles.sourceContext} data-source-context="" dir={ar?'rtl':'ltr'} lang={i18n.language}>{text}</p>
}
/** Recall still includes every authored choice: “all of the above” keeps its context. */
export function FlashcardContent({question,revealed,correct,explanation,contentLanguage}:{question:PublicQuestion;revealed:boolean;correct?:unknown;explanation?:string|null;contentLanguage?:string}){
 const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),p=question.payload
 const sourceLine=<PracticeSourceLine source={question.sourceContext}/>
 if(p.kind!=='mcq'&&p.kind!=='tf')return <><QuestionInput question={question} disabled preview onAnswer={()=>{}} revealed={revealed?correct:undefined}/>{revealed&&explanation&&<p className={styles.response} dir="auto" lang={contentLanguage}>{explanation}</p>}{sourceLine}</>
 const choice=p.options.find(o=>o.key===String(correct))
 const choiceNumber=p.options.findIndex(option=>option.key===String(correct))+1
 return <>
  {p.kind==='tf'&&<p className={styles.recallCue}>{ar?'صح أم خطأ؟':'True or false?'}</p>}
  <QuestionVideo videoId={question.videoId} start={question.videoStartS} end={question.videoEndS}/>
  {question.media&&<PresentationImage className={styles.media} src={mediaUrl(question.media)} alt={question.prompt}/>}
  {p.kind==='mcq'&&<ol className={styles.recallOptions}>{p.options.map((option,index)=><li key={option.key} dir="auto" lang={contentLanguage}><FormattedText text={option.text}/>{'image'in option&&option.image&&<PresentationImage className={styles.media} src={mediaUrl(option.image)} alt={option.text||(ar?`صورة الخيار ${index+1}`:`Image option ${index+1}`)}/>}</li>)}</ol>}
  {revealed?<div className={styles.recallAnswer} data-card-answer="" role="region" aria-label={ar?'الإجابة المرجعية':'Reference answer'}><span>{ar?'الإجابة المرجعية':'Reference answer'}</span><strong dir="auto" lang={p.kind==='tf'?i18n.language:contentLanguage}>{p.kind==='tf'?(correct===true?ar?'صح':'True':ar?'خطأ':'False'):choice?.text?<FormattedText text={choice.text}/>:null}</strong>{choice&&'image'in choice&&typeof choice.image==='string'&&choice.image&&<PresentationImage className={styles.media} src={mediaUrl(choice.image)} alt={choice.text||(ar?`الصورة الصحيحة، الخيار ${choiceNumber}`:`Correct image, option ${choiceNumber}`)}/>} {explanation&&<p dir="auto" lang={contentLanguage}>{explanation}</p>}</div>:<p className={styles.recallPrompt}>{ar?'استرجع الإجابة قبل كشفها.':'Bring the answer to mind before revealing it.'}</p>}
  {sourceLine}
 </>
}
