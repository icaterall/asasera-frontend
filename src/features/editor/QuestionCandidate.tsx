import {FormattedInput} from './FormattedInput'
import {FormattedText} from '@/components/formatted-text/FormattedText'
import {Check,Plus,Triangle,Diamond,Circle,Square} from 'lucide-react'
import {Button,Select} from '@/design'
import {ImageUpload,useImage} from './ImageUpload'
import styles from './GenerationPanel.module.css'
export type ReviewCandidate={prompt:string;kind:string;payloadJson:string;explanation?:string;sourceSegments?:number[];concept?:string;reasons?:unknown[];mediaKey?:string|null}
export function QuestionCandidate({candidate:c,index,added,selected,busy,replacement,ar,onSelect,onChange,onAdd,onUploadBusy,children}:{candidate:ReviewCandidate;index:number;added:boolean;selected:boolean;busy:boolean;replacement:boolean;ar:boolean;onSelect:()=>void;onChange:(patch:Partial<ReviewCandidate>)=>void;onAdd:()=>void;onUploadBusy:(busy:boolean)=>void;children:React.ReactNode}){
 const url=useImage(c.mediaKey??null),number=new Intl.NumberFormat(ar?'ar':'en').format(index+1)
 let payload:{options?:{key:string;text:string}[];correct?:string|boolean}={};try{payload=JSON.parse(c.payloadJson)}catch{/* Invalid results remain subject to server validation. */}
 const options=c.kind==='tf'?[{key:'true',text:ar?'صحيح':'True'},{key:'false',text:ar?'خطأ':'False'}]:payload.options??[]
 const shapes=[Triangle,Diamond,Circle,Square]
 return <article className={styles.reviewCard} aria-label={`${ar?'السؤال':'Question'} ${number}`} data-added={added}>
  <header className={styles.reviewHeader}><label className={styles.check}><input type={replacement?'radio':'checkbox'} name="selected-question" disabled={added||busy} checked={selected} onChange={onSelect}/><span>{ar?'السؤال':'Question'} {number}</span></label>{added?<span className={styles.addedBadge}><Check size={18}/>{ar?'تمت الإضافة':'Added'}</span>:!replacement&&<Button variant="primary" disabled={busy} onClick={onAdd} icon={<Plus size={18}/>}>{replacement?(ar?'استبدال السؤال':'Replace question'):(ar?'أضف هذا السؤال':'Add this question')}</Button>}</header>
  <div className={styles.questionPreview}><h3 dir="auto"><FormattedText text={c.prompt}/></h3>{url&&<img className={styles.reviewImage} src={url} alt={ar?'صورة السؤال':'Question image'}/>}<div className={styles.answerPreview}>{options.map((o,i)=>{const Shape=shapes[i%4],correct=String(payload.correct)===o.key;return <div key={o.key} data-answer={i%4} className={styles.answerTile}><Shape size={22} fill="currentColor" aria-hidden="true"/><span dir="auto"><FormattedText text={o.text}/></span>{correct&&<Check aria-label={ar?'الإجابة الصحيحة':'Correct answer'} size={22}/>}</div>})}</div></div>
  {!added&&<details className={styles.candidateEditor}><summary>{ar?'تعديل السؤال والصورة':'Edit question and picture'}</summary><fieldset disabled={busy} className={styles.form}>
   <FormattedInput disabled={busy} label={ar?'السؤال':'Question'} value={c.prompt} onChange={prompt=>onChange({prompt})}/>
   <ImageUpload onBusyChange={onUploadBusy} imageKey={c.mediaKey??null} label={ar?'صورة السؤال (اختيارية)':'Question image (optional)'} onImage={mediaKey=>onChange({mediaKey})} onRemove={()=>onChange({mediaKey:null})}/>
   {payload.options?.map((o,i)=><FormattedInput disabled={busy} key={o.key} label={`${ar?'الإجابة':'Answer'} ${i+1}`} value={o.text} maxLength={500} onChange={text=>onChange({payloadJson:JSON.stringify({...payload,options:payload.options!.map(x=>x.key===o.key?{...x,text}:x)})})}/>)}
   <label>{ar?'الإجابة الصحيحة':'Correct answer'}<Select disabled={busy} value={String(payload.correct)} onValueChange={v=>onChange({payloadJson:JSON.stringify({...payload,correct:c.kind==='tf'?v==='true':v})})}>{options.map(o=><option key={o.key} value={o.key}>{o.text}</option>)}</Select></label>
   <label>{ar?'التفسير':'Explanation'}<textarea dir="auto" maxLength={600} value={c.explanation??''} onChange={e=>onChange({explanation:e.target.value})}/></label>
  </fieldset></details>}
  {c.explanation&&<details className={styles.candidateEditor}><summary>{ar?'التفسير':'Explanation'}</summary><p dir="auto">{c.explanation}</p></details>}{children}
 </article>
}
