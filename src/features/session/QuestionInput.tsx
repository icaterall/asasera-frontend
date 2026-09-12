import { useLayoutEffect, useRef, useState } from 'react'
import { DndContext,DragOverlay,PointerSensor,TouchSensor,KeyboardSensor,useSensor,useSensors,useDraggable,useDroppable,type DragEndEvent } from '@dnd-kit/core'
import { SortableContext,useSortable,verticalListSortingStrategy,sortableKeyboardCoordinates,arrayMove } from '@dnd-kit/sortable'
import { ArrowUp,ArrowDown,GripVertical,Check } from 'lucide-react'
import { FormattedText,plainFormattedText } from '@/components/formatted-text/FormattedText'
import { useTranslation } from 'react-i18next'
import { AnswerTile,Button,type AnswerSlot } from '@/design'
import type { PublicQuestion } from '@/shared/session'
import {zoneClipPath,zoneOutlinePoints} from '@/shared/zones'
import type {ImageZone} from '@/shared/questions'
import type { AnswerPayload,OrderEvidence } from '@/shared/questions'
import type {MarkResult} from '@/shared/scoring'
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
    className={`${styles.cardChoice} ${selected?styles.chosen:''}`} data-dragging={d.isDragging||undefined} style={{transform:d.transform?`translate3d(${d.transform.x}px,${d.transform.y}px,0)`:undefined}}>{text}{placed&&<Check size={18}/>}</button>
}
/** Fit the authored wording to the shape's safe text area, never the viewport. */
function PlacedAnswer({text}:{text:string}){
  const areaRef=useRef<HTMLSpanElement>(null),textRef=useRef<HTMLSpanElement>(null)
  useLayoutEffect(()=>{
    const area=areaRef.current,label=textRef.current
    if(!area||!label)return
    let active=true
    const fit=()=>{
      if(!active)return
      label.style.removeProperty('font-size')
      const areaStyle=getComputedStyle(area)
      const width=area.clientWidth-parseFloat(areaStyle.paddingLeft)-parseFloat(areaStyle.paddingRight)
      const height=area.clientHeight-parseFloat(areaStyle.paddingTop)-parseFloat(areaStyle.paddingBottom)
      if(width<=0||height<=0)return
      const bounds=area.getBoundingClientRect(),range=document.createRange()
      range.selectNodeContents(label)
      const fits=()=>{
        const glyphs=range.getBoundingClientRect()
        return label.scrollWidth<=width+.5&&label.getBoundingClientRect().height<=height+.5
          &&glyphs.top>=bounds.top+parseFloat(areaStyle.paddingTop)-.5
          &&glyphs.bottom<=bounds.bottom-parseFloat(areaStyle.paddingBottom)+.5
      }
      if(fits())return
      let high=parseFloat(getComputedStyle(label).fontSize),low=Math.min(8,high)
      // The maximum follows the zone size in CSS. Only overflowing text is
      // reduced; no rerender, persistence, or change to the answer geometry.
      for(let step=0;step<7;step++){
        const size=(low+high)/2
        label.style.fontSize=`${size}px`
        if(fits())low=size;else high=size
      }
      label.style.fontSize=`${low}px`
    }
    fit()
    const observer=typeof ResizeObserver==='undefined'?undefined:new ResizeObserver(fit)
    observer?.observe(area)
    void document.fonts?.ready.then(fit)
    return ()=>{active=false;observer?.disconnect()}
  },[text])
  return <span ref={areaRef} className={styles.placedAnswer} title={text}><span ref={textRef} className={styles.placedAnswerText} dir="auto">{text}</span></span>
}
function Target({id,label,children,onClick,disabled,zone,placed}:{id:string;label:string;children?:React.ReactNode;onClick:()=>void;disabled:boolean;zone?:ImageZone;placed?:boolean}) {
  const d=useDroppable({id,disabled})
  /* The clip path is the hit area, not decoration: a browser does not deliver a
     pointer event to a clipped-away corner. So a circle drawn by the teacher
     behaves as a circle for the class, and nothing in this file has to know
     what a hexagon is — `zoneClipPath` is the one definition, shared with the
     editor so the two cannot disagree. */
  /* Image areas and matching cards must have separate base classes. Mobile
     matching targets have minimum dimensions that override image coordinates
     if both classes are applied, stretching hit areas beyond their outlines. */
  const stateClass=d.isOver?(zone?styles.zoneDropOver:styles.chosen):''
  return <button type="button" ref={d.setNodeRef} onClick={onClick} disabled={disabled} aria-label={label} data-placed={placed||undefined} data-zone-shape={zone?(zone.shape??'rect'):undefined} className={`${zone?styles.zoneTarget:styles.target} ${stateClass}`}
    style={zone?{left:`${zone.x*100}%`,top:`${zone.y*100}%`,width:`${zone.w*100}%`,height:`${zone.h*100}%`,clipPath:zoneClipPath(zone)}:undefined}>{children??label}</button>
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
export function QuestionInput({question,onAnswer,disabled=false,projectorOnly=false,preview=false,interactivePreview=false,evaluatePreview,revealed}: {
  question:PublicQuestion;onAnswer:(answer:AnswerPayload)=>void;disabled?:boolean;projectorOnly?:boolean;preview?:boolean;revealed?:unknown
}&({interactivePreview:true;evaluatePreview:(answer:AnswerPayload)=>MarkResult}|{interactivePreview?:false;evaluatePreview?:never})) {
  const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),p=question.payload
  const [sequence,setSequence]=useState(p.kind==='order'?p.items.map(i=>i.key):[])
  /* An interactive preview is a small, self-contained learner attempt. It
     intentionally never reaches the session API: checking an answer marks it
     against the authored payload in memory, then locks this attempt just as a
     submitted learner answer would be locked. The editor's “Try again”
     remounts us. Other preview callers remain read-only. */
  const [previewResult,setPreviewResult]=useState<MarkResult|null>(null)
  const interactive=!disabled&&(!preview||interactivePreview)&&!(interactivePreview&&previewResult!==null)
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
    if(!interactive)return
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
  const [draggedCard,setDraggedCard]=useState<{id:string;text:string}|null>(null)
  const draggableCards=p.kind==='match'||(p.kind==='hotspot'&&p.mode==='card_to_zone')?p.cards:[]
  const checkPreview=(answer:AnswerPayload)=>{
    onAnswer(answer)
    // Public learner questions have no answer key. Only the editor can check
    // a practice attempt, using its private authored payload through this seam.
    if(interactivePreview&&evaluatePreview)setPreviewResult(evaluatePreview(answer))
  }
  const previewFeedback=interactivePreview&&previewResult&&<p className={styles.previewFeedback} data-correct={previewResult.correct} role="status">
    {previewResult.correct
      ?(ar?'إجابة صحيحة. هكذا ستظهر للمتعلم بعد إرسال الإجابة.':'Correct. This is how a learner sees a checked answer.')
      :(ar?'ليست صحيحة بعد. استخدم «جرّب من جديد» ثم أعد المحاولة.':'Not quite. Use Try again to reset the preview and attempt it again.')}
  </p>
  const sensors=useSensors(useSensor(PointerSensor,{activationConstraint:{distance:8}}),useSensor(TouchSensor,{activationConstraint:{delay:180,tolerance:8}}),useSensor(KeyboardSensor,{coordinateGetter:sortableKeyboardCoordinates}))
  if(p.kind==='mcq'||p.kind==='tf')return <>{!projectorOnly&&question.media&&<img data-question-media="" className={styles.questionMedia} src={mediaUrl(question.media)} alt={question.prompt}/>}<div data-answer-grid="" data-layout={projectorOnly?'shape':'text'} className={`${styles.answers} ${projectorOnly?styles.phoneAnswers:''}`}>
    {p.options.map((o,i)=><AnswerTile key={o.key} slot={(Math.min(i,5)+1)as AnswerSlot} label={p.kind==='tf'?(o.key==='true'?(ar?'صح':'True'):(ar?'خطأ':'False')):o.text}
      trailing={'image'in o&&o.image&&!projectorOnly?<img src={mediaUrl(o.image)} alt={o.text}/>:undefined}
      locale={ar?'ar':'en'} shapeOnly={projectorOnly} className={styles.answer} data-answer-tile="" disabled={disabled||(interactivePreview&&previewResult!==null)} aria-disabled={preview&&!interactivePreview||undefined} tabIndex={preview&&!interactivePreview?-1:undefined}
      state={revealed!==undefined?(String(revealed)===o.key?'correct':'incorrect'):previewResult&&selected===o.key?(previewResult.correct?'correct':'incorrect'):selected===o.key?'selected':'idle'}
      onClick={()=>{if(!interactive)return;setSelected(o.key);checkPreview(p.kind==='tf'?{kind:'tf',choice:o.key as 'true'|'false'}:{kind:'mcq',choice:o.key})}} />)}
  </div>{previewFeedback}</>
  const displaySequence=p.kind==='order'&&Array.isArray(revealed)?revealed as string[]:sequence
  const displayPairs=revealed&&typeof revealed==='object'&&!Array.isArray(revealed)?revealed as Record<string,string>:pairs
  const pair=(card:string,target:string)=>{if(interactive){setPairs(current=>({...current,[card]:target}));setSelected(null)}}
  const dragEnd=(event:DragEndEvent)=>{
    if(!event.over||!interactive)return
    const from=String(event.active.id),to=String(event.over.id)
    if(p.kind==='order')reorder(sequence.indexOf(from),sequence.indexOf(to))
    else pair(from,to)
  }
  return <DndContext sensors={sensors} onDragStart={event=>{
    const card=draggableCards.find(item=>item.key===String(event.active.id))
    setDraggedCard(card?{id:card.key,text:card.text}:null)
  }} onDragCancel={()=>setDraggedCard(null)} onDragEnd={event=>{dragEnd(event);setDraggedCard(null)}}>
    {(p.kind==='order'||p.kind==='match')&&question.media&&<img className={styles.questionMedia} src={mediaUrl(question.media)} alt={question.prompt}/>}
    {p.kind==='order'&&<><p>{ar?'رتّب العناصر بالترتيب الصحيح. اسحب أو استخدم زري الأعلى والأسفل.':'Put the items in the correct order. Drag, or use the up and down buttons.'}</p>
      <SortableContext items={displaySequence} strategy={verticalListSortingStrategy}><ol className={styles.orderList}>{displaySequence.map((key,index)=><SortItem key={key} id={key} index={index} count={sequence.length} text={p.items.find(i=>i.key===key)!.text} disabled={!interactive}
        image={p.items.find(i=>i.key===key)?.image} move={direction=>reorder(index,index+direction)}/>)}</ol></SortableContext>
      {(!preview||interactivePreview)&&<Button variant="primary" disabled={!interactive} onClick={()=>checkPreview({kind:'order',sequence,evidence:orderEvidence()})}>{preview?(ar?'تحقق من إجابة المعاينة':'Check preview answer'):(ar?'تحقق':'Check')}</Button>}</>}
    {(p.kind==='match'||(p.kind==='hotspot'&&p.mode==='card_to_zone'))&&<>
      <p>{ar?'اسحب البطاقة إلى مكانها، أو انقرها ثم انقر المنطقة.':'Drag a card to its area, or tap the card then the area.'}</p>
      <div className={styles.cards} data-interactive-preview={interactivePreview||undefined}>{p.cards.filter(c=>!pairs[c.key]).map(c=><CardChoice key={c.key} id={c.key} text={c.text} selected={selected===c.key} placed={false} onClick={()=>{if(interactive)setSelected(c.key)}} disabled={!interactive}/>)}</div>
    </>}
    {p.kind==='match'&&<div className={styles.targets}>{p.targets.map(t=><Target key={t.key} id={t.key} label={t.text} disabled={!interactive} onClick={()=>{if(selected)pair(selected,t.key)}}>
      <strong>{t.text}</strong><span>{p.cards.filter(c=>displayPairs[c.key]===t.key).map(c=>c.text).join(' · ')|| (ar?'ضع البطاقة هنا':'Place a card here')}</span>
    </Target>)}</div>}
    {p.kind==='hotspot'&&<>
      {question.media?<div className={styles.imageStage} dir="ltr"><img src={mediaUrl(question.media)} alt={question.prompt}/>
        <svg className={styles.zoneSvg} viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true">{p.zones.map(z=>z.shape==='circle'
          ?<ellipse key={z.key} cx={z.x+z.w/2} cy={z.y+z.h/2} rx={z.w/2} ry={z.h/2}/>
          :z.shape&&z.shape!=='rect'
            ?<polygon key={z.key} points={zoneOutlinePoints(z)}/>
            :<rect key={z.key} x={z.x} y={z.y} width={z.w} height={z.h}/>)}</svg>
        {p.zones.map((z,i)=>{
          const placedCard=p.mode==='card_to_zone'?p.cards.find(card=>displayPairs[card.key]===z.key):undefined
          return <Target key={z.key} id={z.key} zone={z} placed={!!placedCard} label={`${ar?'المنطقة':'Zone'} ${i+1}`} disabled={!interactive} onClick={()=>{
            if(!interactive)return
            if(p.mode==='click_zone'){setPicks(current=>current.includes(z.key)?current.filter(k=>k!==z.key):[...current,z.key]);return}
            if(selected){pair(selected,z.key);return}
            /* A placed label is picked back up by selecting its area. It then
               returns to the answer bank as the active card, ready for a new
               area — no duplicate card and no hidden state to undo. */
            if(placedCard){setPairs(current=>{const next={...current};delete next[placedCard.key];return next});setSelected(placedCard.key)}
          }}>{placedCard?<PlacedAnswer text={placedCard.text}/>:<span>{i+1}{((Array.isArray(revealed)?revealed.includes(z.key):picks.includes(z.key))||Object.values(displayPairs).includes(z.key))&&<Check size={20}/>}</span>}</Target>
        })}
      </div>:<p role="alert">{ar?'تعذّر تحميل الصورة. أعد الاتصال.':'Image unavailable. Reconnect.'}</p>}
      {/* Click-zone mode has nothing on screen to read back, so its instruction
          stays visible. The card list does not: every placement is already
          legible in the picture, and repeating it underneath was noise for the
          sighted learner. It survives for screen readers, where the picture
          says nothing — announced as it changes, which is the one context
          where it is the only account of what has been placed. */}
      {p.mode==='click_zone'
        ? <p>{ar?'اختر كل المناطق الصحيحة ثم أرسل إجابتك.':'Select all correct zones, then submit.'}</p>
        : <p className={styles.pairSummary} role="status">{p.cards.map(c=>{
            const target=displayPairs[c.key],position=target?p.zones.findIndex(z=>z.key===target)+1:0
            return `${c.text}: ${position>0?(ar?`المنطقة ${position}`:`Area ${position}`):'—'}`
          }).join(' · ')}</p>}
    </>}
    {(!preview||interactivePreview)&&(p.kind==='match'||p.kind==='hotspot')&&<Button variant="primary" disabled={!interactive||(p.kind==='hotspot'&&p.mode==='click_zone'?picks.length===0:p.cards.some(c=>!pairs[c.key]))}
      onClick={()=>checkPreview(p.kind==='match'?{kind:'match',pairs:Object.entries(pairs)}:{kind:'hotspot',picks:p.mode==='click_zone'?picks.map(key=>['*',key]):Object.entries(pairs)})}>{ar?'أرسل الإجابة':'Submit answer'}</Button>}
    {previewFeedback}
    <DragOverlay dropAnimation={null}>{draggedCard&&<div className={styles.dragOverlay} dir="auto"><GripVertical size={18} aria-hidden="true"/><span>{draggedCard.text}</span></div>}</DragOverlay>
  </DndContext>
}
