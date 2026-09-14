import {useId,useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Button} from '@/design'
import type {PublicQuestion} from '@/shared/session'
import type {AnswerPayload} from '@/shared/questions'
import styles from './NativeQuestionInput.module.css'
type Payload=Extract<PublicQuestion['payload'],{kind:'cloze'|'vocabulary'|'discussion'}>
/** Only public content enters this form. Spelling policy is applied by the existing server marker. */
export function NativeQuestionInput({payload:p,interactive,onAnswer,revealed,submittedAnswer}:{payload:Payload;interactive:boolean;onAnswer:(answer:AnswerPayload)=>void;revealed?:unknown;submittedAnswer?:AnswerPayload|null}){
 const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar')
 const [values,setValues]=useState<Record<string,string>>({})
 const ownValues=submittedAnswer?.kind===p.kind&&(submittedAnswer.kind==='cloze'||submittedAnswer.kind==='vocabulary')?submittedAnswer.values:values
 const referenceId=useId()
 if(p.kind==='discussion')return <p>{ar?'ناقش أفكارك. لا تُقيّم هذه البطاقة بدرجة آلية.':'Discuss your ideas. This card is not automatically graded.'}</p>
 const fields=p.kind==='cloze'?p.segments.filter(s=>s.kind==='blank').map(s=>s.blankId):p.entries.map(e=>e.id)
 const answers=revealed&&typeof revealed==='object'&&!Array.isArray(revealed)?revealed as Record<string,unknown>:null
 const reference=(id:string)=>{const raw=answers?.[id];return Array.isArray(raw)?raw.filter(v=>typeof v==='string').join(' / '):typeof raw==='string'?raw:undefined}
 const input=(id:string,label:string)=>{
  const model=reference(id),hasOwn=ownValues[id]!==undefined,shown=hasOwn?ownValues[id]!:model??''
  return <input aria-label={p.kind==='cloze'&&model!==undefined&&!hasOwn?`${ar?'إجابة مرجعية':'Reference answer'} — ${label}`:label} aria-describedby={p.kind==='cloze'&&model!==undefined?`${referenceId}-${id}`:undefined} value={shown} onChange={e=>setValues(v=>({...v,[id]:e.target.value}))} disabled={!interactive} autoComplete="off" autoCorrect="off" spellCheck={false} dir="auto" maxLength={300}/>
 }
 return <form className={styles.native} onSubmit={e=>{e.preventDefault();if(interactive&&fields.every(id=>values[id]?.trim()))onAnswer({kind:p.kind,values})}}>
  {p.kind==='cloze'?<>
   {p.wordBank&&<div className={styles.bank} aria-label={ar?'بنك الكلمات':'Word bank'}>{p.wordBank.map((word,i)=><bdi key={i}>{word}</bdi>)}</div>}
   <p className={styles.passage} dir="auto">{p.segments.map((segment,i)=>segment.kind==='text'?<span key={i}>{segment.text}</span>:<span key={segment.blankId}>{input(segment.blankId,ar?`الفراغ ${fields.indexOf(segment.blankId)+1}`:`Blank ${fields.indexOf(segment.blankId)+1}`)}</span>)}</p>
   {fields.map(id=>reference(id)!==undefined&&<p key={id} id={`${referenceId}-${id}`} dir="auto">{ar?'إجابة مرجعية':'Reference answer'}: {reference(id)}</p>)}
  </>:p.entries.map((entry,i)=><label key={entry.id} className={styles.clue}><span dir="auto">{entry.clue||`${ar?'الكلمة':'Word'} ${i+1}`}</span>{input(entry.id,entry.clue||`${ar?'الكلمة':'Word'} ${i+1}`)}</label>)}
  {interactive&&<Button type="submit" variant="primary" disabled={!fields.every(id=>values[id]?.trim())}>{ar?'إرسال الإجابة':'Submit answer'}</Button>}
 </form>
}
