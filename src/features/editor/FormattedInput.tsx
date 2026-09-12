import {lazy,Suspense,useEffect,useRef,useState,type RefObject} from 'react'
import {useTranslation} from 'react-i18next'
import {EditorContent,useEditor} from '@tiptap/react'
import {Extension,Node} from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import SubscriptMark from '@tiptap/extension-subscript'
import SuperscriptMark from '@tiptap/extension-superscript'
import {Plugin} from '@tiptap/pm/state'
import {Bold,Italic,Subscript,Superscript,Omega,FunctionSquare} from 'lucide-react'
import katex from 'katex'
import {readDocument,readInline,writeDocument} from './rich-document'
import {authoringDirection} from '../../lib/textDirection'
import styles from './FormattedInput.module.css'
import 'katex/dist/katex.min.css'

const EquationDialog=lazy(()=>import('./EquationDialog'))
type EquationSelection={from:number;to:number;latex:string}
const Equation=Node.create<{onEdit:(selection:EquationSelection)=>void}>({
 name:'equation',group:'inline',inline:true,atom:true,
 addOptions:()=>({onEdit:()=>{}}),
 addAttributes:()=>({latex:{default:''}}),
 parseHTML:()=>[{tag:'span[data-equation]',getAttrs:element=>({latex:element.getAttribute('data-equation')??''})}],
 renderHTML:({node})=>['span',{'data-equation':node.attrs.latex},'ƒ'],
 addNodeView(){return ({node,getPos,editor})=>{
  const dom=document.createElement('span');dom.className='asasera-equation';dom.dir='ltr';dom.contentEditable='false';dom.dataset.equation=node.attrs.latex
  try{dom.innerHTML=katex.renderToString(node.attrs.latex,{throwOnError:true,trust:false,strict:'error',maxExpand:100,maxSize:10})}catch{dom.textContent='ƒ';dom.title='Edit equation'}
  dom.addEventListener('click',event=>{if(!editor.isEditable)return;event.preventDefault();event.stopPropagation();const from=getPos();if(typeof from==='number')this.options.onEdit({from,to:from+node.nodeSize,latex:node.attrs.latex})})
  return {dom}
 }}
})

export function FormattedInput({value,onChange,label,placeholder,className,maxLength=2000,inputRef,disabled=false}:{value:string;onChange:(text:string)=>void;label:string;placeholder?:string;className?:string;maxLength?:number;inputRef?:RefObject<HTMLDivElement|null>;disabled?:boolean}){
 const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar')
 const direction=authoringDirection(value,ar)
 /*
  * Whether the placeholder shows is decided by the VALUE, not by the shape of
  * the editor's DOM.
  *
  * It used to be a CSS guess — «one paragraph whose only child is a <br>» —
  * which is what an empty ProseMirror looks like today. Anything that leaves a
  * second editor node in this field, or renders an empty document differently,
  * then paints "Type your question here" across a question that has text in it.
  * The prop is the one thing that cannot be wrong about whether there are words.
  */
 const empty=!readInline(value).some(node=>!!(node.text??node.attrs?.latex??'').trim())
 const [panel,setPanel]=useState<'symbols'|null>(null),[equation,setEquation]=useState<EquationSelection|null>(null),[error,setError]=useState('')
 const latest=useRef({onChange,maxLength,ar});latest.current={onChange,maxLength,ar}
 const lastValue=useRef(value)
 const editor=useEditor({
  extensions:[StarterKit.configure({blockquote:false,bulletList:false,orderedList:false,listItem:false,listKeymap:false,code:false,codeBlock:false,heading:false,horizontalRule:false,strike:false,link:false,underline:false,trailingNode:false}),SubscriptMark,SuperscriptMark,Equation.configure({onEdit:setEquation}),
   Extension.create({name:'storedLength',addProseMirrorPlugins:()=>[new Plugin({filterTransaction:(transaction,state)=>{
    if(!transaction.docChanged)return true
    const next=writeDocument(transaction.doc.toJSON()),previous=writeDocument(state.doc.toJSON())
    if(next.length>latest.current.maxLength&&next.length>previous.length){queueMicrotask(()=>setError(latest.current.ar?'النص أطول من الحد المسموح.':'This exceeds the text limit.'));return false}return true
   }})]})],
  content:readDocument(value),editable:!disabled,enableInputRules:false,enablePasteRules:false,shouldRerenderOnTransaction:true,
  editorProps:{
   attributes:{role:'textbox','aria-label':label,'aria-multiline':'true',dir:direction,class:`${styles.editor} ${className??''}`,'data-placeholder':placeholder??''},
   // Paste plain wording; never treat external markup as commands or executable HTML.
   handlePaste:(view,event)=>{const text=event.clipboardData?.getData('text/plain');if(text===undefined)return false;view.dispatch(view.state.tr.insertText(text));return true},
  },
  onUpdate:({editor:current})=>{const next=writeDocument(current.getJSON());if(next===lastValue.current)return;lastValue.current=next;latest.current.onChange(next);setError('')},
 })
 useEffect(()=>{if(editor&&value!==lastValue.current){lastValue.current=value;editor.commands.setContent(readDocument(value),{emitUpdate:false})}},[editor,value])
 useEffect(()=>{editor?.setEditable(!disabled)},[editor,disabled])
 useEffect(()=>{if(!editor)return;editor.setOptions({editorProps:{...editor.options.editorProps,attributes:{role:'textbox','aria-label':label,'aria-multiline':'true',dir:direction,class:`${styles.editor} ${className??''}`,'data-placeholder':placeholder??''}}});if(inputRef)inputRef.current=editor.view.dom as HTMLDivElement;return()=>{if(inputRef)inputRef.current=null}},[editor,label,placeholder,className,inputRef,direction])
 function format(mark:string){
  if(!editor)return
  if(editor.state.selection.empty){setError(ar?'حدّد النص أو الرقم أولًا لتنسيقه.':'Select text or a number first to format it.');editor.view.focus();return}
  editor.view.focus();const command=editor.chain()
  if(mark==='subscript')command.unsetSuperscript()
  if(mark==='superscript')command.unsetSubscript()
  command.toggleMark(mark).run();setPanel(null)
 }
 function openEquation(){if(!editor)return;const {from,to,$from}=editor.state.selection,node=$from.nodeAfter;setPanel(null);setEquation(node?.type.name==='equation'?{from,to:from+node.nodeSize,latex:node.attrs.latex}:{from,to,latex:''})}
 const controls=[{Icon:Bold,en:'Bold',ar:'عريض',mark:'bold'},{Icon:Italic,en:'Italic',ar:'مائل',mark:'italic'},{Icon:Subscript,en:'Subscript',ar:'نص سفلي',mark:'subscript'},{Icon:Superscript,en:'Superscript',ar:'نص علوي',mark:'superscript'}]
 return <div className={styles.field} data-formatted-field="" data-empty={empty||undefined} data-plain={!className} data-tools-open={panel!==null||equation!==null} data-size={maxLength===2000?'question':'answer'}>
  <div className={styles.tools}>
   <div className={styles.toolbar} role="toolbar" aria-label={ar?'تنسيق النص':'Text formatting'} onMouseDown={event=>event.preventDefault()}>
   {controls.map(({Icon,en,ar:arabic,mark})=><button key={en} type="button" disabled={disabled} title={ar?arabic:en} aria-label={ar?arabic:en} aria-pressed={editor?.isActive(mark)??false} onClick={()=>format(mark)}><Icon size={18}/></button>)}
   <button type="button" disabled={disabled} title={ar?'رموز':'Symbols'} aria-label={ar?'رموز':'Symbols'} aria-expanded={panel==='symbols'} onClick={()=>setPanel(panel==='symbols'?null:'symbols')}><Omega size={18}/></button>
   <button type="button" disabled={disabled} title={ar?'معادلة':'Equation'} aria-label={ar?'معادلة':'Equation'} aria-expanded={equation!==null} onClick={openEquation}><FunctionSquare size={19}/></button>
   </div>
   {panel==='symbols'&&<div className={styles.symbols} aria-label={ar?'اختر رمزًا':'Choose a symbol'}>{['π','Ω','α','β','θ','Δ','∞','≠','≤','≥','±','×','÷','√','∑','∫','°','→'].map(symbol=><button type="button" key={symbol} disabled={disabled} onMouseDown={event=>event.preventDefault()} onClick={()=>{editor?.view.focus();editor?.commands.insertContent({type:'text',text:symbol});setPanel(null)}}>{symbol}</button>)}</div>}
  </div>
  <EditorContent editor={editor}/>
  {equation&&<Suspense fallback={<span role="status">{ar?'جارٍ فتح محرر المعادلات…':'Opening equation editor…'}</span>}><EquationDialog initialValue={equation.latex} onInsert={latex=>{if(editor?.chain().insertContentAt({from:equation.from,to:equation.to},{type:'equation',attrs:{latex}}).run())setEquation(null)}} onClose={()=>setEquation(null)} ar={ar} maxLength={Math.min(500,maxLength-(editor?writeDocument(editor.getJSON()).length:0)+(equation.latex?equation.latex.length+4:0)-4)}/></Suspense>}
  {error&&<p role="alert">{error}</p>}
 </div>
}
