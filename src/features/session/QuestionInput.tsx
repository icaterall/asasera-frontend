import { useState } from 'react'
import { DndContext,PointerSensor,TouchSensor,KeyboardSensor,useSensor,useSensors,useDraggable,useDroppable,type DragEndEvent } from '@dnd-kit/core'
import { SortableContext,useSortable,verticalListSortingStrategy,sortableKeyboardCoordinates,arrayMove } from '@dnd-kit/sortable'
import { ArrowUp,ArrowDown,GripVertical,Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AnswerTile,Button,type AnswerSlot } from '@/design'
import type { PublicQuestion } from '@/shared/session'
import type { AnswerPayload } from '@/shared/questions'
import {mediaUrl} from '@/features/editor/ImageUpload'
import styles from './Session.module.css'

function SortItem({id,text,index,count,move,disabled}:{id:string;text:string;index:number;count:number;move:(n:number)=>void;disabled:boolean}) {
  const d=useSortable({id,disabled})
  return <li ref={d.setNodeRef} className={styles.orderItem} style={{transform:d.transform?`translate3d(${d.transform.x}px,${d.transform.y}px,0)`:undefined}}>
    <button type="button" {...d.attributes} {...d.listeners} className={styles.grip} aria-label={`Move / حرّك ${text}`} disabled={disabled}><GripVertical size={20}/></button>
    <span>{index+1}. {text}</span>
    <button type="button" aria-label={`Move up / للأعلى ${text}`} disabled={disabled||index===0} onClick={()=>move(-1)}><ArrowUp size={20}/></button>
    <button type="button" aria-label={`Move down / للأسفل ${text}`} disabled={disabled||index===count-1} onClick={()=>move(1)}><ArrowDown size={20}/></button>
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
export function QuestionInput({question,onAnswer,disabled=false,classroom=false,preview=false,revealed}: {
  question:PublicQuestion;onAnswer:(answer:AnswerPayload)=>void;disabled?:boolean;classroom?:boolean;preview?:boolean;revealed?:unknown
}) {
  const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),p=question.payload
  const [sequence,setSequence]=useState(p.kind==='order'?p.items.map(i=>i.key):[])
  const [selected,setSelected]=useState<string|null>(null)
  const [pairs,setPairs]=useState<Record<string,string>>({})
  const [picks,setPicks]=useState<string[]>([])
  const sensors=useSensors(useSensor(PointerSensor,{activationConstraint:{distance:8}}),useSensor(TouchSensor,{activationConstraint:{delay:180,tolerance:8}}),useSensor(KeyboardSensor,{coordinateGetter:sortableKeyboardCoordinates}))
  if(p.kind==='mcq'||p.kind==='tf')return <>{!classroom&&question.media&&<img data-question-media="" className={styles.questionMedia} src={mediaUrl(question.media)} alt={question.prompt}/>}<div data-answer-grid="" className={`${styles.answers} ${classroom?styles.phoneAnswers:''}`}>
    {p.options.map((o,i)=><AnswerTile key={o.key} slot={(i%4+1)as AnswerSlot} label={p.kind==='tf'?(o.key==='true'?(ar?'صح':'True'):(ar?'خطأ':'False')):o.text}
      trailing={'image'in o&&o.image&&!classroom?<img src={mediaUrl(o.image)} alt={o.text}/>:undefined}
      locale={ar?'ar':'en'} shapeOnly={classroom} className={styles.answer} data-answer-tile="" disabled={disabled&&!preview} aria-disabled={preview||undefined} tabIndex={preview?-1:undefined}
      state={revealed!==undefined?(String(revealed)===o.key?'correct':'incorrect'):selected===o.key?'selected':'idle'}
      onClick={()=>{if(disabled||preview)return;setSelected(o.key);onAnswer(p.kind==='tf'?{kind:'tf',choice:o.key as 'true'|'false'}:{kind:'mcq',choice:o.key})}} />)}
  </div></>
  const displaySequence=p.kind==='order'&&Array.isArray(revealed)?revealed as string[]:sequence
  const displayPairs=revealed&&typeof revealed==='object'&&!Array.isArray(revealed)?revealed as Record<string,string>:pairs
  const pair=(card:string,target:string)=>{if(!disabled){setPairs(current=>({...current,[card]:target}));setSelected(null)}}
  const dragEnd=(event:DragEndEvent)=>{
    if(!event.over||disabled)return
    const from=String(event.active.id),to=String(event.over.id)
    if(p.kind==='order')setSequence(current=>arrayMove(current,current.indexOf(from),current.indexOf(to)))
    else pair(from,to)
  }
  return <DndContext sensors={sensors} onDragEnd={dragEnd}>
    {(p.kind==='order'||p.kind==='match')&&question.media&&<img className={styles.questionMedia} src={mediaUrl(question.media)} alt={question.prompt}/>}
    {p.kind==='order'&&<><p>{ar?'رتّب العناصر. يمكنك السحب أو استخدام زري الأعلى والأسفل.':'Put the items in order. Drag or use the up and down buttons.'}</p>
      <SortableContext items={displaySequence} strategy={verticalListSortingStrategy}><ol className={styles.orderList}>{displaySequence.map((key,index)=><SortItem key={key} id={key} index={index} count={sequence.length} text={p.items.find(i=>i.key===key)!.text} disabled={disabled||preview}
        move={direction=>setSequence(current=>arrayMove(current,index,index+direction))}/>)}</ol></SortableContext>
      {!preview&&<Button variant="primary" disabled={disabled} onClick={()=>onAnswer({kind:'order',sequence})}>{ar?'أرسل الترتيب':'Submit order'}</Button>}</>}
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
