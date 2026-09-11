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
 {id:'order',en:'Puzzle',ar:'ترتيب',group:'knowledge'},
 {id:'poll',en:'Poll',ar:'استطلاع',group:'opinions'},
 {id:'scale',en:'Scale',ar:'مقياس',group:'opinions'},
 {id:'drop-pin',en:'Drop pin',ar:'وضع دبوس',group:'opinions'},
 {id:'match',en:'Matching',ar:'مطابقة',group:'more'},
] as const
const supported=new Set<string>(['mcq','tf','hotspot','order','match'])
function TypeIcon({kind}:{kind:string}){
 const Icon=kind==='text'?Type:kind==='slider'?SlidersHorizontal:kind==='hotspot'||kind==='drop-pin'?MapPin:kind==='order'?ListOrdered:kind==='poll'?ChartPie:kind==='scale'?ChartNoAxesColumn:Link2
 return <span className={styles.icon} data-kind={kind} aria-hidden="true">{kind==='mcq'||kind==='tf'?<span className={styles.answerBlocks} data-kind={kind}>{Array.from({length:kind==='tf'?2:4},(_,i)=><i key={i}/>)}</span>:<Icon size={30} strokeWidth={2.3}/>}</span>
}
export function QuestionTypePicker({value,disabled,onChange}:{value:QuestionKindWire;disabled?:boolean;onChange:(value:QuestionKindWire)=>void}){
 const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),[open,setOpen]=useState(false),dialog=useRef<HTMLDialogElement>(null),trigger=useRef<HTMLButtonElement>(null)
 const chosen=types.find(t=>t.id===value)??types[0]
 useEffect(()=>{if(!open)return;const d=dialog.current,overflow=document.body.style.overflow;d?.showModal();document.body.style.overflow='hidden';d?.querySelector<HTMLButtonElement>('[aria-pressed=true]')?.focus();return()=>{d?.close();document.body.style.overflow=overflow;trigger.current?.focus()}},[open])
 return <><button ref={trigger} type="button" id="question-kind" data-question-kind={value} aria-label={ar?'نوع السؤال':'Question type'} aria-haspopup="dialog" aria-expanded={open} disabled={disabled} className={styles.trigger} onClick={()=>setOpen(true)}><TypeIcon kind={value}/><strong>{ar?chosen.ar:chosen.en}</strong><ChevronDown size={18}/></button>
 {open&&<dialog ref={dialog} className={`asas ${styles.dialog}`} dir={ar?'rtl':'ltr'} aria-label={ar?'اختر نوع السؤال':'Choose question type'} onCancel={e=>{e.preventDefault();setOpen(false)}} onClick={e=>{if(e.target===dialog.current){const r=dialog.current.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)setOpen(false)}}}>
  <header><h2>{ar?'نوع السؤال':'Question type'}</h2><button type="button" aria-label={ar?'إغلاق':'Close'} onClick={()=>setOpen(false)}><X size={22}/></button></header>
  <div className={styles.body}>{(['knowledge','opinions','more'] as const).map(group=><section key={group}><h3>{group==='knowledge'?(ar?'اختبر المعرفة':'Test knowledge'):group==='opinions'?(ar?'اجمع الآراء':'Collect opinions'):(ar?'أنواع إضافية':'More question types')}</h3><div className={styles.grid}>{types.filter(t=>t.group===group).map(t=><button type="button" key={t.id} disabled={!supported.has(t.id)} aria-pressed={value===t.id} className={styles.tile} onClick={()=>{if(supported.has(t.id)){onChange(t.id as QuestionKindWire);setOpen(false)}}}><TypeIcon kind={t.id}/><strong>{ar?t.ar:t.en}</strong>{value===t.id&&<Check className={styles.selected} size={17} aria-hidden="true"/>}{!supported.has(t.id)&&<small>{ar?'غير متاح بعد':'Not available yet'}</small>}</button>)}</div></section>)}</div>
 </dialog>}
 </>
}
