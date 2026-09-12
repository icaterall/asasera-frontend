import {useEffect,useId,useRef,useState} from 'react'
import {createPortal} from 'react-dom'
import {useTranslation} from 'react-i18next'
import {Brush,Check,Eye,Palette,Redo2,Undo2,X} from 'lucide-react'
import {Button} from '@/design'
import {ImageUpload,UploadBar,useUploadProgress} from './ImageUpload'
import styles from './HotspotCanvas.module.css'

export type PaintPoint={x:number;y:number}
export type PaintStroke={colour:string;size:number;points:PaintPoint[]}
export function paintStroke(context:CanvasRenderingContext2D,stroke:PaintStroke){
 const first=stroke.points[0];if(!first)return
 context.fillStyle=stroke.colour;context.strokeStyle=stroke.colour;context.lineWidth=stroke.size;context.lineCap='round';context.lineJoin='round'
 if(stroke.points.length===1){context.beginPath();context.arc(first.x,first.y,stroke.size/2,0,Math.PI*2);context.fill();return}
 context.beginPath();context.moveTo(first.x,first.y);for(const p of stroke.points.slice(1))context.lineTo(p.x,p.y);context.stroke()
}
export const pixelColour=(pixel:Uint8ClampedArray)=>`#${Array.from(pixel.slice(0,3)).map(n=>n.toString(16).padStart(2,'0')).join('')}`

/** A protected editing session: original media stays attached until a new,
 * moderated image is ready. No destructive bitmap writes or remote AI call. */
export function ImageRetouch({url,imageKey,onImage,onClose}:{url:string;imageKey:string;onImage:(key:string)=>void;onClose:()=>void}){
 const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),t=(a:string,e:string)=>ar?a:e
 const title=useId(),help=useId(),dialog=useRef<HTMLDialogElement>(null),canvas=useRef<HTMLCanvasElement>(null),base=useRef<HTMLImageElement|null>(null)
 const strokes=useRef<PaintStroke[]>([]),draft=useRef<PaintStroke|null>(null),cursor=useRef(0),saveGate=useRef(false)
 const [history,setHistory]=useState({position:0,total:0}),[colour,setColour]=useState('#ffffff'),[size,setSize]=useState(24),[tool,setTool]=useState<'brush'|'sample'>('sample')
 const [ready,setReady]=useState(false),[error,setError]=useState(''),[compare,setCompare]=useState(false),[confirmClose,setConfirmClose]=useState(false),[file,setFile]=useState<File|null>(null),[exporting,setExporting]=useState(false)
 const upload=useUploadProgress(),busy=exporting||upload.busy
 useEffect(()=>{if(upload.state.phase!=='idle')setExporting(false);if(['error','ready'].includes(upload.state.phase))saveGate.current=false},[upload.state.phase])
 function redraw(original=false){const c=canvas.current,ctx=c?.getContext('2d');if(!c||!ctx||!base.current)return;ctx.clearRect(0,0,c.width,c.height);ctx.drawImage(base.current,0,0);if(!original)for(const stroke of strokes.current.slice(0,cursor.current))paintStroke(ctx,stroke)}
 function undo(){if(!cursor.current||busy)return;setCompare(false);cursor.current--;setHistory({position:cursor.current,total:strokes.current.length});redraw()}
 function redo(){if(cursor.current>=strokes.current.length||busy)return;setCompare(false);cursor.current++;setHistory({position:cursor.current,total:strokes.current.length});redraw()}
 function close(){if(busy)return;if(cursor.current&&!confirmClose){setConfirmClose(true);return}onClose()}
 useEffect(()=>{const d=dialog.current,prior=document.activeElement;d?.showModal();return()=>{d?.close();if(prior instanceof HTMLElement&&prior.isConnected)prior.focus()}},[])
 useEffect(()=>{
  const controller=new AbortController();let objectUrl=''
  void fetch(url,{signal:controller.signal}).then(r=>{if(!r.ok)throw Error();return r.blob()}).then(blob=>new Promise<HTMLImageElement>((resolve,reject)=>{if(controller.signal.aborted){reject(Error('aborted'));return}objectUrl=URL.createObjectURL(blob);const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=objectUrl})).then(img=>{
   if(controller.signal.aborted||!canvas.current)return
   base.current=img;canvas.current.width=img.naturalWidth;canvas.current.height=img.naturalHeight;redraw();setReady(true)
  }).catch(()=>{if(!controller.signal.aborted)setError(t('تعذّر فتح الصورة. أغلق الأداة وحاول مرة أخرى.','Could not open the image. Close this tool and try again.'))})
  return()=>{controller.abort();if(objectUrl)URL.revokeObjectURL(objectUrl)}
 },[url])
 useEffect(()=>{if(!history.position)return;const warn=(e:BeforeUnloadEvent)=>e.preventDefault();window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn)},[history.position])
 function point(event:React.PointerEvent<HTMLCanvasElement>){const c=event.currentTarget,r=c.getBoundingClientRect();return {x:Math.max(0,Math.min(c.width-1,(event.clientX-r.left)*c.width/r.width)),y:Math.max(0,Math.min(c.height-1,(event.clientY-r.top)*c.height/r.height))}}
 function finish(){const stroke=draft.current;draft.current=null;if(!stroke)return;strokes.current=[...strokes.current.slice(0,cursor.current),stroke];cursor.current=strokes.current.length;setHistory({position:cursor.current,total:strokes.current.length})}
 async function save(){
  if(!canvas.current||busy||saveGate.current||!history.position)return
  saveGate.current=true
  setExporting(true);setError('');setCompare(false);redraw()
  try{const blob=await new Promise<Blob>((resolve,reject)=>canvas.current!.toBlob(value=>value?resolve(value):reject(Error()),'image/png'));setFile(new File([blob],'cleaned-question.png',{type:'image/png'}))}
  catch{saveGate.current=false;setExporting(false);setError(t('تعذّر تجهيز الصورة. حاول الحفظ مرة أخرى.','Could not prepare the image. Try saving again.'))}
 }
 return createPortal(<dialog ref={dialog} className={`asas ${styles.retouchDialog}`} aria-labelledby={title} dir={ar?'rtl':'ltr'} onCancel={e=>{e.preventDefault();close()}} onKeyDown={e=>{e.stopPropagation();if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();if(e.shiftKey)redo();else undo()}}}>
  <header className={styles.dialogHeader}><div><h2 id={title}>{t('نظّف الصورة','Clean image')}</h2><p id={help}>{t('التقط لونًا بجوار النص، ثم ارسم فوقه. هذه أداة تغطية وليست إزالة بالذكاء الاصطناعي.','Pick a colour beside a label, then brush over it. This covers pixels; it is not AI removal.')}</p></div><Button variant="quiet" disabled={busy} aria-label={t('إغلاق','Close')} onClick={close}><X size={20}/></Button></header>
  <fieldset disabled={!ready||busy} className={styles.paintTools}>
   <Button aria-pressed={tool==='sample'} icon={<Palette size={18}/>} onClick={()=>{setTool('sample');setCompare(false);redraw()}}>{t('التقط لونًا','Pick colour')}</Button>
   <Button aria-pressed={tool==='brush'} icon={<Brush size={18}/>} onClick={()=>{setTool('brush');setCompare(false);redraw()}}>{t('فرشاة','Brush')}</Button>
   <label className={styles.colourControl}><input type="color" aria-label={t('لون الفرشاة','Brush colour')} value={colour} onChange={e=>{setColour(e.target.value);setTool('brush')}}/><bdi>{colour.toUpperCase()}</bdi></label>
   <label className={styles.brushSize}>{t('حجم الفرشاة','Brush size')}<input type="range" min="4" max="120" value={size} onChange={e=>setSize(Number(e.target.value))}/><output>{size} px</output></label>
   <Button variant="quiet" aria-label={t('تراجع','Undo')} disabled={!history.position} icon={<Undo2 size={18}/>} onClick={undo}/>
   <Button variant="quiet" aria-label={t('إعادة','Redo')} disabled={history.position===history.total} icon={<Redo2 size={18}/>} onClick={redo}/>
   <Button variant="quiet" icon={<Eye size={18}/>} aria-pressed={compare} onClick={()=>{setCompare(!compare);redraw(!compare)}}>{t('الأصل','Original')}</Button>
  </fieldset>
  <div className={styles.paintStage} aria-busy={!ready||busy}>
   {!ready&&!error&&<p role="status">{t('جارٍ فتح الصورة…','Opening image…')}</p>}
   <canvas ref={canvas} className={styles.paintCanvas} data-tool={tool} aria-label={t('مساحة تنظيف الصورة','Image cleanup canvas')} aria-describedby={help} tabIndex={0}
    onPointerDown={e=>{if(!ready||busy||compare||e.button!==0)return;if(cursor.current>=500){setError(t('احفظ هذه التعديلات ثم افتح أداة التنظيف للمتابعة.','Save these edits, then reopen cleanup to continue.'));return}const ctx=e.currentTarget.getContext('2d');if(!ctx)return;const p=point(e);if(tool==='sample'){setColour(pixelColour(ctx.getImageData(Math.floor(p.x),Math.floor(p.y),1,1).data));setTool('brush');return}e.currentTarget.setPointerCapture(e.pointerId);draft.current={colour,size,points:[p]};paintStroke(ctx,draft.current)}}
    onPointerMove={e=>{if(!draft.current)return;const ctx=e.currentTarget.getContext('2d');if(!ctx)return;const p=point(e),last=draft.current.points.at(-1)!;draft.current.points.push(p);paintStroke(ctx,{...draft.current,points:[last,p]})}}
    onPointerUp={finish} onPointerCancel={()=>{draft.current=null;redraw()}} onLostPointerCapture={finish}/>
   <UploadBar state={upload.state} label={t('حفظ الصورة المنظّفة','Saving cleaned image')}/>
  </div>
  <ImageUpload compact showPreview={false} imageKey={imageKey} sourceFile={file} onProgress={upload.onProgress} onImage={key=>{onImage(key);onClose()}}/>
  {error&&<p className={styles.error} role="alert">{error}</p>}
  {confirmClose?<footer className={styles.dialogFooter}><p>{t('تجاهل تعديلات الفرشاة غير المحفوظة؟','Discard unsaved brush edits?')}</p><Button onClick={()=>setConfirmClose(false)}>{t('تابع التحرير','Keep editing')}</Button><Button onClick={onClose}>{t('تجاهل التعديلات','Discard edits')}</Button></footer>:<footer className={styles.dialogFooter}><p>{t('تبقى الصورة الحالية كما هي حتى يكتمل حفظ النسخة الجديدة.','Your current image stays unchanged until the new copy is saved.')}</p><Button disabled={busy} onClick={close}>{t('إلغاء','Cancel')}</Button><Button variant="primary" loading={busy} disabled={!ready||!history.position||busy} icon={<Check size={18}/>} onClick={()=>void save()}>{t('استخدم الصورة المنظّفة','Use cleaned image')}</Button></footer>}
 </dialog>,document.body)
}
