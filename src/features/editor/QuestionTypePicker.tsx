import {useEffect,useRef,useState} from 'react'
import {useTranslation} from 'react-i18next'
import {ChevronDown,X,Type,SlidersHorizontal,MapPin,ListOrdered,ChartPie,ChartNoAxesColumn,Link2,Check} from 'lucide-react'
import type {QuestionKindWire} from '@/lib/api'
import styles from './QuestionTypePicker.module.css'
const types=[
 {id:'mcq',en:'Quiz',ar:'اختبار',group:'knowledge'},
 {id:'tf',en:'True or false',ar:'صح أو خطأ',group:'knowledge'},
 {id:'text',en:'Type answer',ar:'كتابة الإجابة',group:'knowledge'},
 {id:'slider',en:'Slider',ar:'شريط التمرير',group:'knowledge'},
 {id:'hotspot',en:'Pin answer',ar:'تحديد الإجابة',group:'knowledge'},
 {id:'order',en:'Order',ar:'رتّب',group:'knowledge'},
 {id:'poll',en:'Poll',ar:'استطلاع',group:'opinions'},
 {id:'scale',en:'Scale',ar:'مقياس',group:'opinions'},
 {id:'drop-pin',en:'Drop pin',ar:'وضع دبوس',group:'opinions'},
 {id:'match',en:'Matching',ar:'مطابقة',group:'more'},
] as const
const supported=new Set<string>(['mcq','tf','hotspot','order','match'])
/**
 * What this kind of question is called, in one place.
 *
 * The rail labels every question by its type, so the name now appears in two
 * parts of the editor. Read from the same table the picker draws, because a
 * rail that still said "Puzzle" after the picker was renamed to "Order" would
 * be two names for one thing on one screen.
 */
export function questionTypeName(kind:string,ar:boolean):string{
  const type=types.find(t=>t.id===kind)
  return type?(ar?type.ar:type.en):kind
}
function TypeIcon({kind}:{kind:string}){
 const Icon=kind==='text'?Type:kind==='slider'?SlidersHorizontal:kind==='hotspot'||kind==='drop-pin'?MapPin:kind==='order'?ListOrdered:kind==='poll'?ChartPie:kind==='scale'?ChartNoAxesColumn:Link2
 return <span className={styles.icon} data-kind={kind} aria-hidden="true">{kind==='mcq'||kind==='tf'?<span className={styles.answerBlocks} data-kind={kind}>{Array.from({length:kind==='tf'?2:4},(_,i)=><i key={i}/>)}</span>:<Icon size={30} strokeWidth={2.3}/>}</span>
}
/**
 * The grid of question types, on its own.
 *
 * Split out of the picker so that "Add question" can open the SAME chooser:
 * the type is the first decision either way, and two grids that could drift
 * apart would be two answers to "what kinds of question are there".
 *
 * `value` is optional — when adding there is nothing chosen yet, and the grid
 * correctly shows no tick.
 */
export function QuestionTypeDialog({value,heading,side='end',onChange,onClose}:{value?:QuestionKindWire;heading?:string;side?:'start'|'end';onChange:(value:QuestionKindWire)=>void;onClose:()=>void}){
 const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),dialog=useRef<HTMLDialogElement>(null)
 useEffect(()=>{
  const element=dialog.current,overflow=document.body.style.overflow,opener=document.activeElement
  element?.showModal();document.body.style.overflow='hidden'
  /* The chosen tile takes focus when there is one; otherwise the first, so a
     keyboard lands on a type rather than on the close button. */
  ;(element?.querySelector<HTMLButtonElement>('[aria-pressed=true]')??element?.querySelector<HTMLButtonElement>(`.${styles.tile}:not(:disabled)`))?.focus()
  return()=>{element?.close();document.body.style.overflow=overflow;if(opener instanceof HTMLElement&&opener.isConnected)opener.focus()}
 },[])
 /*
  * Anchored with PHYSICAL sides, set inline.
  *
  * `inset-inline` resolves against the element's own `dir`, and this dialog
  * sets its own `dir` — so a logical rule here answers "which side" relative to
  * the panel rather than to the page, and lands opposite the button that opened
  * it. The interface language decides which physical edge the rail is on, and
  * an inline style cannot be out-specified by the stylesheet either.
  */
 const edge=side==='start'?(ar?{right:12,left:'auto'}:{left:12,right:'auto'}):(ar?{left:12,right:'auto'}:{right:12,left:'auto'})
 return <dialog ref={dialog} style={edge} className={`asas ${styles.dialog}`} dir={ar?'rtl':'ltr'} aria-label={heading??(ar?'اختر نوع السؤال':'Choose question type')} onCancel={e=>{e.preventDefault();onClose()}} onClick={e=>{if(e.target===dialog.current){const r=dialog.current.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)onClose()}}}>
  <header><h2>{heading??(ar?'نوع السؤال':'Question type')}</h2><button type="button" aria-label={ar?'إغلاق':'Close'} onClick={onClose}><X size={22}/></button></header>
  <div className={styles.body}>{(['knowledge','opinions','more'] as const).map(group=><section key={group}><h3>{group==='knowledge'?(ar?'اختبر المعرفة':'Test knowledge'):group==='opinions'?(ar?'اجمع الآراء':'Collect opinions'):(ar?'أنواع إضافية':'More question types')}</h3><div className={styles.grid}>{types.filter(t=>t.group===group).map(t=><button type="button" key={t.id} disabled={!supported.has(t.id)} aria-pressed={value===t.id} className={styles.tile} onClick={()=>{if(supported.has(t.id)){onChange(t.id as QuestionKindWire);onClose()}}}><TypeIcon kind={t.id}/><strong>{ar?t.ar:t.en}</strong>{value===t.id&&<Check className={styles.selected} size={17} aria-hidden="true"/>}{!supported.has(t.id)&&<small>{ar?'غير متاح بعد':'Not available yet'}</small>}</button>)}</div></section>)}</div>
 </dialog>
}

export function QuestionTypePicker({value,disabled,onChange}:{value:QuestionKindWire;disabled?:boolean;onChange:(value:QuestionKindWire)=>void}){
 const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),[open,setOpen]=useState(false)
 const chosen=types.find(t=>t.id===value)??types[0]
 return <><button type="button" id="question-kind" data-question-kind={value} aria-label={ar?'نوع السؤال':'Question type'} aria-haspopup="dialog" aria-expanded={open} disabled={disabled} className={styles.trigger} onClick={()=>setOpen(true)}><TypeIcon kind={value}/><strong>{ar?chosen.ar:chosen.en}</strong><ChevronDown size={18}/></button>
 {open&&<QuestionTypeDialog value={value} onChange={onChange} onClose={()=>setOpen(false)}/>}
 </>
}
