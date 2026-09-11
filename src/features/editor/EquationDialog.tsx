import {useEffect,useId,useRef,useState} from 'react'
import {createPortal} from 'react-dom'
import {MathfieldElement} from 'mathlive'
import 'mathlive/fonts.css'
import katex from 'katex'
import {X} from 'lucide-react'
import {FormattedText} from '@/components/formatted-text/FormattedText'
import styles from './EquationDialog.module.css'

// Vite bundles the fonts locally. The authoring keyboard has no sound or speech effects.
MathfieldElement.fontsDirectory=null
MathfieldElement.soundsDirectory=null
MathfieldElement.keypressSound=null
MathfieldElement.plonkSound=null

const structures=[
 {en:'Fraction',ar:'كسر',preview:'\\frac{\\square}{\\square}',insert:'\\frac{#0}{#?}'},
 {en:'Power',ar:'أس',preview:'x^{\\square}',insert:'#0^{#?}'},
 {en:'Square root',ar:'جذر تربيعي',preview:'\\sqrt{\\square}',insert:'\\sqrt{#0}'},
 {en:'Subscript',ar:'رمز سفلي',preview:'x_{\\square}',insert:'#0_{#?}'},
 {en:'Brackets',ar:'أقواس',preview:'(\\square)',insert:'\\left(#0\\right)'},
]
// Only what a keyboard cannot produce. Digits, letters, + - = and % are typed, not tapped.
const symbols=[
 ['\\times','Multiply','ضرب'],['\\div','Divide','قسمة'],['\\le','Less than or equal','أصغر من أو يساوي'],['\\ge','Greater than or equal','أكبر من أو يساوي'],['\\ne','Not equal','لا يساوي'],
 ['\\pm','Plus or minus','زائد أو ناقص'],['\\pi','Pi','باي'],['\\theta','Theta','ثيتا'],['\\infty','Infinity','ما لا نهاية'],['\\circ','Degree','درجة'],
]
const extras=[['\\angle','Angle','زاوية'],['\\sum','Sum','مجموع'],['\\int','Integral','تكامل'],['\\alpha','Alpha','ألفا'],['\\beta','Beta','بيتا'],['\\gamma','Gamma','غاما'],['\\delta','Delta','دلتا'],['\\epsilon','Epsilon','إبسيلون'],['\\lambda','Lambda','لامدا'],['\\mu','Mu','ميو'],['\\rho','Rho','رو'],['\\sigma','Sigma','سيغما'],['\\tau','Tau','تاو'],['\\phi','Phi','فاي'],['\\omega','Omega','أوميغا'],['\\Delta','Capital delta','دلتا كبيرة'],['\\Sigma','Capital sigma','سيغما كبيرة']]

export default function EquationDialog({initialValue,onInsert,onClose,ar,maxLength}: {initialValue:string;onInsert:(equation:string)=>void;onClose:()=>void;ar:boolean;maxLength:number}){
 const dialog=useRef<HTMLDialogElement>(null),mount=useRef<HTMLDivElement>(null),field=useRef<MathfieldElement|null>(null)
 const [value,setValue]=useState(initialValue)
 const titleId=useId(),helpId=useId(),t=(a:string,e:string)=>ar?a:e
 useEffect(()=>{
  const previous=document.activeElement,element=dialog.current,overflow=document.body.style.overflow
  element?.showModal();document.body.style.overflow='hidden'
  const mf=new MathfieldElement()
  // Touch authoring has no physical keyboard, so MathLive supplies its own on those devices only.
  // A modal dialog sits in the top layer, so the keyboard has to be mounted inside it to stay visible.
  mf.mathVirtualKeyboardPolicy='auto'
  if(element)window.mathVirtualKeyboard.container=element
  mf.smartFence=true
  mf.setAttribute('aria-label',ar?'محرر المعادلة المرئي':'Visual equation editor')
  mf.setAttribute('aria-describedby',helpId);mf.setAttribute('dir','ltr')
  mf.value=initialValue
  const sync=()=>setValue(mf.getValue('latex'))
  mf.addEventListener('input',sync);field.current=mf;mount.current?.append(mf);mf.menuItems=[];mf.focus()
  return()=>{mf.removeEventListener('input',sync);mf.remove();field.current=null;window.mathVirtualKeyboard.hide();window.mathVirtualKeyboard.container=null;element?.close();document.body.style.overflow=overflow;if(previous instanceof HTMLElement&&previous.isConnected)previous.focus()}
  // The mathfield owns its caret and undo history throughout this modal.
 },[ar,helpId,initialValue])
 function insert(fragment:string){const mf=field.current;if(!mf)return;mf.focus();mf.insert(fragment,{selectionMode:'placeholder'});setValue(mf.getValue('latex'))}
 let problem=''
 if(value.length>maxLength)problem=t('المعادلة طويلة جدًا لهذا الحقل. اختصرها ثم أدرجها.','This equation is too long for this field. Shorten it before inserting.')
 else if(/\\placeholder|\\frac\s*\{\s*\}|\{\s*\}/.test(value))problem=t('أكمل الخانات الفارغة في المعادلة.','Fill in the empty boxes in your equation.')
 else if(value.trim()){try{katex.renderToString(value,{throwOnError:true,trust:false,strict:'error',maxExpand:100,maxSize:10})}catch{problem=t('المعادلة غير مكتملة. راجع الرموز أو تراجع عن آخر خطوة.','This equation is incomplete. Check the symbols or undo the last step.')}}
 const valid=!!value.trim()&&!problem
 const key=([code,en,arabic]:string[])=><button type="button" key={code} aria-label={ar?arabic:en} title={ar?arabic:en} onMouseDown={e=>e.preventDefault()} onClick={()=>insert(code)}><FormattedText text={`\\(${code}\\)`}/></button>
 return createPortal(<dialog ref={dialog} className={`asas ${styles.dialog}`} dir={ar?'rtl':'ltr'} aria-labelledby={titleId} onCancel={e=>{e.preventDefault();onClose()}} onKeyDown={e=>e.stopPropagation()}>
  <header className={styles.header}><h2 id={titleId}>{t('إنشاء معادلة','Build an equation')}</h2><button type="button" aria-label={t('إغلاق محرر المعادلات','Close equation editor')} onClick={onClose}><X size={22}/></button></header>
  <div className={styles.body}>
   <p id={helpId} className={styles.help}>{t('اختر شكلًا من الأشكال، أو اكتب مباشرة بلوحة المفاتيح: الشرطة المائلة تُنشئ كسرًا، وعلامة الأس تُنشئ قوة.','Choose a shape below, or type straight into the box: 1/2 makes a fraction and x^2 makes a power.')}</p>
   <div className={styles.structures}>{structures.map(s=><button type="button" key={s.en} onMouseDown={e=>e.preventDefault()} onClick={()=>insert(s.insert)}><span className={styles.preview} aria-hidden="true"><FormattedText text={`\\(${s.preview}\\)`}/></span><span className={styles.structureLabel}>{ar?s.ar:s.en}</span></button>)}</div>
   <p className={styles.boxNote}><span className={styles.boxGlyph} aria-hidden="true"><FormattedText text={'\\(\\square\\)'}/></span><span>{t('المربّعات الفارغة هي الخانات التي تكتب فيها: اضغط على خانة، أو تنقّل بينها بمفتاح الجدولة، ثم اكتب.','The empty boxes are the spaces you fill in. Click a box — or press Tab to move between them — then type.')}</span></p>
   <div className={styles.fieldWrap}><div ref={mount} className={styles.mathfield}/>{!value&&<span className={styles.empty} aria-hidden="true">{t('اكتب هنا، أو اختر شكلًا من الأعلى','Type here, or choose a shape above')}</span>}</div>
   <div className={styles.symbolRow}>
    <div className={styles.symbols} dir="ltr" role="group" aria-label={t('رموز رياضية','Maths symbols')}>{symbols.map(key)}</div>
    <button type="button" className={styles.clear} disabled={!value} onClick={()=>{const mf=field.current;if(mf){mf.focus();mf.executeCommand('selectAll');mf.executeCommand('deleteBackward');setValue(mf.getValue('latex'))}}}>{t('مسح المعادلة','Clear equation')}</button>
   </div>
   <details className={styles.more}><summary>{t('رموز وحروف إضافية','More symbols and letters')}</summary><div className={styles.symbols} dir="ltr">{extras.map(key)}</div></details>
   <p className={styles.message} role="status">{problem}</p>
  </div>
  <footer className={styles.footer}><button type="button" onClick={onClose}>{t('إلغاء','Cancel')}</button><button type="button" className={styles.insert} disabled={!valid} onClick={()=>{if(valid)onInsert(value)}}>{t('إدراج المعادلة','Insert equation')}</button></footer>
 </dialog>,document.body)
}
