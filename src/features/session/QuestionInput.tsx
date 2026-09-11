import { useRef, useState } from 'react'
import { DndContext,PointerSensor,TouchSensor,KeyboardSensor,useSensor,useSensors,useDraggable,useDroppable,type DragEndEvent } from '@dnd-kit/core'
import { SortableContext,useSortable,verticalListSortingStrategy,sortableKeyboardCoordinates,arrayMove } from '@dnd-kit/sortable'
import { ArrowUp,ArrowDown,GripVertical,Check } from 'lucide-react'
import { FormattedText,plainFormattedText } from '@/components/formatted-text/FormattedText'
import { useTranslation } from 'react-i18next'
import { AnswerTile,Button,type AnswerSlot } from '@/design'
import type { PublicQuestion } from '@/shared/session'
import type { AnswerPayload,OrderEvidence } from '@/shared/questions'
import {mediaUrl} from '@/features/editor/ImageUpload'
import styles from './Session.module.css'

/**
 * One draggable row.
 *
 * The grip is the only drag activator, and the arrows do the same job without
 * one — a learner on a phone whose drag competes with the page scroll, and a
 * learner on a keyboard, both need a way through that is not "drag better".
 * The row text is rendered formatted, so an equation inside a step stays an
 * equation and keeps its own direction inside Arabic wording.
 */
function SortItem({id,text,image,index,count,move,disabled}:{id:string;text:string;image?:string|undefined;index:number;count:number;move:(n:number)=>void;disabled:boolean}) {
  const d=useSortable({id,disabled})
  const spoken=plainFormattedText(text).trim()||`${index+1}`
  return <li ref={d.setNodeRef} className={styles.orderItem} data-order-item="" data-dragging={d.isDragging||undefined}
    style={{transform:d.transform?`translate3d(0,${d.transform.y}px,0)`:undefined,transition:d.transition}}>
    <button type="button" ref={d.setActivatorNodeRef} {...d.attributes} {...d.listeners} className={styles.grip} aria-label={`Reorder / أعد ترتيب ${spoken}`} disabled={disabled}><GripVertical size={20}/></button>
    <span className={styles.orderRank} aria-hidden="true">{index+1}</span>
    {/* An item may BE the picture — ordering four photographs of a process is
        the same skill as ordering four sentences. The alt falls back to the
        position, so a picture-only item still has a name to drag by. */}
    {image&&<img className={styles.orderImage} src={image} alt={spoken}/>}
    <span dir="auto"><FormattedText text={text}/></span>
    <button type="button" aria-label={`Move up / للأعلى ${spoken}`} disabled={disabled||index===0} onClick={()=>move(-1)}><ArrowUp size={20}/></button>
    <button type="button" aria-label={`Move down / للأسفل ${spoken}`} disabled={disabled||index===count-1} onClick={()=>move(1)}><ArrowDown size={20}/></button>
  </li>
}
function CardChoice({id,text,selected,placed,onClick,disabled}:{id:string;text:string;selected:boolean;placed:boolean;onClick:()=>void;disabled:boolean}) {
  const d=useDraggable({id,disabled})
  return <button type="button" ref={d.setNodeRef} {...d.attributes} {...d.listeners} onClick={onClick} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();if(!disabled)onClick()}}} disabled={disabled} aria-pressed={selected}
    className={`${styles.cardChoice} ${selected?styles.chosen:''}`} style={{transform:d.transform?`translate3d(${d.transform.x}px,${d.transform.y}px,0)`:undefined}}>{text}{placed&&<Check size={18}/>}</button>
}
function Target({id,label,children,onClick,disabled,zone}:{id:string;label:string;children?:React.ReactNode;onClick:()=>void;disabled:boolean;zone?:{x:number;y:number;w:number;h:number}}) {
  const d=useDroppable({id,disabled})
  return <button type="button" ref={d.setNodeRef} onClick={onClick} disabled={disabled} aria-label={label} className={`${styles.target} ${d.isOver?styles.chosen:''} ${zone?styles.zoneTarget:''}`}
    style={zone?{left:`${zone.x*100}%`,top:`${zone.y*100}%`,width:`${zone.w*100}%`,height:`${zone.h*100}%`}:undefined}>{children??label}</button>
}
/**
 * Renders one question for answering (player / learner), or as a read-only preview.
 *
 * `projectorOnly` is the optional shape-only classroom mode: the phone shows only the
 * colour+shape glyph and the wording lives on the projector. It is OFF by default
 * (v5 §07): a student who cannot see the front screen, or who is working self-paced,
 * must read prompt, media and option text on their own device. The option text stays
 * in the accessible name either way, and colour is never the only signal.
 */
export function QuestionInput({question,onAnswer,disabled=false,projectorOnly=false,preview=false,revealed}: {
  question:PublicQuestion;onAnswer:(answer:AnswerPayload)=>void;disabled?:boolean;projectorOnly?:boolean;preview?:boolean;revealed?:unknown
}) {
  const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),p=question.payload
  const [sequence,setSequence]=useState(p.kind==='order'?p.items.map(i=>i.key):[])
  /*
   * ORDERING EVIDENCE (brief §4). What the learner was shown, what they moved
   * and how long they took — recorded because the submitted sequence alone
   * cannot tell a confident ordering from a rescued one.
   *
   * Deliberately coarse: one entry per committed reorder, no coordinates, no
   * per-move clock. Every call site keys this component by question, so these
   * refs are per question without needing to be reset.
   */
  const shown=useRef(p.kind==='order'?p.items.map(i=>i.key):[])
  const openedAt=useRef(Date.now())
  const moves=useRef<OrderEvidence['moves']>([])
  const reorder=(from:number,to:number)=>{
    if(from<0||to<0||from===to||from>=sequence.length||to>=sequence.length)return
    const item=sequence[from]
    if(item===undefined)return
    /* Recorded here rather than inside the updater: React invokes an updater
       twice in development, and an evidence log that counts a move twice is
       worse than no log. */
    if(moves.current.length<60)moves.current.push({item,from,to})
    setSequence(current=>arrayMove(current,from,to))
  }
  const orderEvidence=():OrderEvidence=>({
    shown:shown.current,
    moves:moves.current,
    durationMs:Math.min(3_600_000,Math.max(0,Date.now()-openedAt.current)),
    /* The live engine answers a mistake by INSERTING a follow-up question, which
       arrives here as its own question. So a resubmission of this one does not
       exist yet and claiming otherwise would put a number in the evidence that
       nothing measured. */
    attempt:1,
  })
  const [selected,setSelected]=useState<string|null>(null)
  const [pairs,setPairs]=useState<Record<string,string>>({})
  const [picks,setPicks]=useState<string[]>([])
  const sensors=useSensors(useSensor(PointerSensor,{activationConstraint:{distance:8}}),useSensor(TouchSensor,{activationConstraint:{delay:180,tolerance:8}}),useSensor(KeyboardSensor,{coordinateGetter:sortableKeyboardCoordinates}))
  if(p.kind==='mcq'||p.kind==='tf')return <>{!projectorOnly&&question.media&&<img data-question-media="" className={styles.questionMedia} src={mediaUrl(question.media)} alt={question.prompt}/>}<div data-answer-grid="" data-layout={projectorOnly?'shape':'text'} className={`${styles.answers} ${projectorOnly?styles.phoneAnswers:''}`}>
    {p.options.map((o,i)=><AnswerTile key={o.key} slot={(Math.min(i,5)+1)as AnswerSlot} label={p.kind==='tf'?(o.key==='true'?(ar?'صح':'True'):(ar?'خطأ':'False')):o.text}
      trailing={'image'in o&&o.image&&!projectorOnly?<img src={mediaUrl(o.image)} alt={o.text}/>:undefined}
      locale={ar?'ar':'en'} shapeOnly={projectorOnly} className={styles.answer} data-answer-tile="" disabled={disabled&&!preview} aria-disabled={preview||undefined} tabIndex={preview?-1:undefined}
      state={revealed!==undefined?(String(revealed)===o.key?'correct':'incorrect'):selected===o.key?'selected':'idle'}
      onClick={()=>{if(disabled||preview)return;setSelected(o.key);onAnswer(p.kind==='tf'?{kind:'tf',choice:o.key as 'true'|'false'}:{kind:'mcq',choice:o.key})}} />)}
  </div></>
  const displaySequence=p.kind==='order'&&Array.isArray(revealed)?revealed as string[]:sequence
  const displayPairs=revealed&&typeof revealed==='object'&&!Array.isArray(revealed)?revealed as Record<string,string>:pairs
  const pair=(card:string,target:string)=>{if(!disabled){setPairs(current=>({...current,[card]:target}));setSelected(null)}}
  const dragEnd=(event:DragEndEvent)=>{
    if(!event.over||disabled)return
    const from=String(event.active.id),to=String(event.over.id)
    if(p.kind==='order')reorder(sequence.indexOf(from),sequence.indexOf(to))
    else pair(from,to)
  }
  return <DndContext sensors={sensors} onDragEnd={dragEnd}>
    {(p.kind==='order'||p.kind==='match')&&question.media&&<img className={styles.questionMedia} src={mediaUrl(question.media)} alt={question.prompt}/>}
    {p.kind==='order'&&<><p>{ar?'رتّب العناصر بالترتيب الصحيح. اسحب أو استخدم زري الأعلى والأسفل.':'Put the items in the correct order. Drag, or use the up and down buttons.'}</p>
      <SortableContext items={displaySequence} strategy={verticalListSortingStrategy}><ol className={styles.orderList}>{displaySequence.map((key,index)=><SortItem key={key} id={key} index={index} count={sequence.length} text={p.items.find(i=>i.key===key)!.text} disabled={disabled||preview}
        image={p.items.find(i=>i.key===key)?.image} move={direction=>reorder(index,index+direction)}/>)}</ol></SortableContext>
      {!preview&&<Button variant="primary" disabled={disabled} onClick={()=>onAnswer({kind:'order',sequence,evidence:orderEvidence()})}>{ar?'تحقق':'Check'}</Button>}</>}
    {(p.kind==='match'||(p.kind==='hotspot'&&p.mode==='card_to_zone'))&&<>
      <p>{ar?'اختر بطاقة ثم هدفها، أو اسحبها. يمكنك تغيير اختياراتك قبل الإرسال.':'Choose a card, then its target, or drag it. You can change placements before submitting.'}</p>
      <div className={styles.cards}>{p.cards.map(c=><CardChoice key={c.key} id={c.key} text={c.text} selected={selected===c.key} placed={!!pairs[c.key]} onClick={()=>setSelected(c.key)} disabled={disabled||preview}/>)}</div>
    </>}
    {p.kind==='match'&&<div className={styles.targets}>{p.targets.map(t=><Target key={t.key} id={t.key} label={t.text} disabled={disabled||preview} onClick={()=>{if(selected)pair(selected,t.key)}}>
      <strong>{t.text}</strong><span>{p.cards.filter(c=>displayPairs[c.key]===t.key).map(c=>c.text).join(' · ')|| (ar?'ضع البطاقة هنا':'Place a card here')}</span>
    </Target>)}</div>}
    {p.kind==='hotspot'&&<>
      {question.media?<div className={styles.imageStage} dir="ltr"><img src={mediaUrl(question.media)} alt={question.prompt}/>
        <svg className={styles.zoneSvg} viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true">{p.zones.map(z=><rect key={z.key} x={z.x} y={z.y} width={z.w} height={z.h}/>)}</svg>
        {p.zones.map((z,i)=><Target key={z.key} id={z.key} zone={z} label={`${ar?'المنطقة':'Zone'} ${i+1}`} disabled={disabled||preview} onClick={()=>{
          if(p.mode==='click_zone')setPicks(current=>current.includes(z.key)?current.filter(k=>k!==z.key):[...current,z.key])
          else if(selected)pair(selected,z.key)
        }}><span>{i+1}{((Array.isArray(revealed)?revealed.includes(z.key):picks.includes(z.key))||Object.values(displayPairs).includes(z.key))&&<Check size={20}/>}</span></Target>)}
      </div>:<p role="alert">{ar?'تعذّر تحميل الصورة. أعد الاتصال.':'Image unavailable. Reconnect.'}</p>}
      <p>{p.mode==='click_zone'?(ar?'اختر كل المناطق الصحيحة ثم أرسل إجابتك.':'Select all correct zones, then submit.') :p.cards.map(c=>`${c.text}: ${displayPairs[c.key]??'—'}`).join(' · ')}</p>
    </>}
    {!preview&&(p.kind==='match'||p.kind==='hotspot')&&<Button variant="primary" disabled={disabled||(p.kind==='hotspot'&&p.mode==='click_zone'?picks.length===0:p.cards.some(c=>!pairs[c.key]))}
      onClick={()=>onAnswer(p.kind==='match'?{kind:'match',pairs:Object.entries(pairs)}:{kind:'hotspot',picks:p.mode==='click_zone'?picks.map(key=>['*',key]):Object.entries(pairs)})}>{ar?'أرسل الإجابة':'Submit answer'}</Button>}
  </DndContext>
}
