import {useEffect,useRef,useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Brush,Check,Circle,Eye,ImagePlus,MousePointer2,Plus,RotateCcw,Shuffle,Sparkles,Square,Trash2} from 'lucide-react'
import {Button,LoadingIndicator,Select} from '@/design'
import type {QuestionRecord} from '@/lib/api'
import type {HotspotPayload,ImageZone} from '@/shared/questions'
import {zoneOutlinePoints} from '@/shared/zones'
import {markAnswer} from '@/shared/scoring'
import {QuestionInput} from '@/features/session/QuestionInput'
import {ImageUpload,UploadBar,useImage,useUploadProgress} from './ImageUpload'
import {ImageRetouch} from './ImageRetouch'
import {ImageCreator} from './ImageCreator'
import {ConfirmDialog} from '@/components/teaching/TeachingUI'
import {ZoneSuggestions} from './ZoneSuggestions'
import {elementKey,transformZone,addAnswerZone,removeAnswerZone} from './hotspot-editing'
import styles from './HotspotCanvas.module.css'

export function ZoneOutline({zone,...props}:{zone:ImageZone}&React.SVGProps<SVGElement>){
 if(zone.shape==='circle')return <ellipse {...props as React.SVGProps<SVGEllipseElement>} cx={(zone.x+zone.w/2)*100} cy={(zone.y+zone.h/2)*100} rx={zone.w*50} ry={zone.h*50}/>
 if(zone.shape==='polygon'||zone.shape==='hexagon')return <polygon {...props as React.SVGProps<SVGPolygonElement>} points={zoneOutlinePoints(zone).split(' ').map(pair=>pair.split(',').map(n=>Number(n)*100).join(',')).join(' ')}/>
 return <rect {...props as React.SVGProps<SVGRectElement>} x={zone.x*100} y={zone.y*100} width={zone.w*100} height={zone.h*100}/>
}
type Gesture={start:{x:number;y:number};zone:ImageZone;kind:'draw'|'move'|'resize'}
export function HotspotCanvas({activityId,question,p,onChange,onConfirm,onPrepare,onApplied}:{activityId:number;question:QuestionRecord;p:HotspotPayload;onChange:(p:HotspotPayload)=>void;onConfirm:()=>void;onPrepare:()=>Promise<QuestionRecord>;onApplied:()=>Promise<void>}){
 const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),t=(a:string,e:string)=>ar?a:e,url=useImage(p.imageKey)
 /*
  * Two waits, not one: resolving the signed URL, then downloading the picture.
  * Only the first was covered, so the stage went blank-to-image with nothing to
  * look at in between — and on a large image that gap is the longer half.
  */
 const [imageReady,setImageReady]=useState(false)
 useEffect(()=>{setImageReady(false)},[url])
 const [active,setActive]=useState(p.zones[0]!.key),[tool,setTool]=useState<'select'|'rect'|'circle'>('select'),[preview,setPreview]=useState(false),[retouch,setRetouch]=useState(false),[suggest,setSuggest]=useState(false),[confirmed,setConfirmed]=useState(false),[create,setCreate]=useState(false),[switchMode,setSwitchMode]=useState(false)
 const [drawing,setDrawing]=useState<ImageZone|null>(null),[previewKey,setPreviewKey]=useState(0),[imageFailed,setImageFailed]=useState(false)
 const gesture=useRef<Gesture|null>(null),latestDrawing=useRef<ImageZone|null>(null),uploader=useRef<HTMLDivElement>(null),upload=useUploadProgress()
 useEffect(()=>setImageFailed(false),[p.imageKey])
 const selected=p.zones.find(z=>z.key===active)??p.zones[0]!,full=p.zones.length>=12||(p.mode==='card_to_zone'&&p.cards.length>=12)
 function change(next:HotspotPayload){setConfirmed(false);onChange(next)}
 function update(zone:ImageZone){change({...p,zones:p.zones.map(z=>z.key===zone.key?zone:z)})}
 function point(e:React.PointerEvent<SVGSVGElement>){const r=e.currentTarget.getBoundingClientRect();return {x:Math.max(0,Math.min(.99,(e.clientX-r.left)/r.width)),y:Math.max(0,Math.min(.99,(e.clientY-r.top)/r.height))}}
 function down(e:React.PointerEvent<SVGSVGElement>){
  if(e.button!==0||upload.busy)return
  const start=point(e),target=e.target as Element,zone=p.zones.find(z=>z.key===target.getAttribute('data-zone'))
  if(tool==='select'&&!zone)return
  if(tool!=='select'&&full)return
  /* The tool is the shape. Only a box and a circle can be drawn; a hexagon or a
     free polygon is chosen per area in the precision panel, which is also where
     an existing one stays editable. */
  const drawnShape=tool==='circle'?'circle' as const:'rect' as const
  const next=zone&&tool==='select'?zone:{key:elementKey('zone'),...start,w:.02,h:.02,shape:drawnShape}
  gesture.current={start,zone:next,kind:tool==='select'?(target.getAttribute('data-resize')?'resize':'move'):'draw'}
  latestDrawing.current=next;setActive(next.key);setDrawing(next);e.currentTarget.setPointerCapture(e.pointerId)
 }
 function move(e:React.PointerEvent<SVGSVGElement>){
  const g=gesture.current;if(!g)return;const end=point(e),dx=end.x-g.start.x,dy=end.y-g.start.y
  const next=g.kind==='draw'?transformZone(g.zone,{x:Math.min(end.x,g.start.x),y:Math.min(end.y,g.start.y),w:Math.max(.02,Math.abs(dx)),h:Math.max(.02,Math.abs(dy))}):g.kind==='resize'?transformZone(g.zone,{w:g.zone.w+dx,h:g.zone.h+dy}):transformZone(g.zone,{x:Math.max(0,Math.min(1-g.zone.w,g.zone.x+dx)),y:Math.max(0,Math.min(1-g.zone.h,g.zone.y+dy))})
  latestDrawing.current=next;setDrawing(next)
 }
 function finish(){const g=gesture.current,next=latestDrawing.current;gesture.current=null;latestDrawing.current=null;if(g&&next){if(g.kind==='draw')change(addAnswerZone(p,next));else update(next)}setDrawing(null);setTool('select')}
 function add(){if(full)return;const zone:ImageZone={key:elementKey('zone'),x:.35,y:.35,w:.25,h:.2,shape:'rect'};change(addAnswerZone(p,zone));setActive(zone.key)}
 const zones=drawing?[...p.zones.map(z=>z.key===drawing.key?drawing:z),...(!p.zones.some(z=>z.key===drawing.key)?[drawing]:[])]:p.zones
 const current=drawing?.key===selected.key?drawing:selected
 /*
  * Until the picture is on screen there is nothing here to act on: the areas
  * are drawn in its coordinates, and a click on an empty stage would place one
  * against a size that is about to change. So the whole editor waits, inert,
  * behind the application's own spinner — not just the image slot.
  */
 const loading=(!url||!imageReady)&&!imageFailed
 return <section className={styles.workspace} data-learner-preview={preview||undefined} aria-label={t('محرر إجابات الصورة','Image answer editor')} aria-busy={loading||undefined}>
  {loading&&<div className={styles.workspaceLoading} role="status"><LoadingIndicator label={t('جارٍ تحميل الصورة…','Loading image…')}/></div>}
  <div className={styles.workspaceBody} inert={loading}>
  <div className={styles.workspaceHeader}><div><h2>{t('حوّل الصورة إلى سؤال','Make the image a question')}</h2>{/* This describes EDITING; in preview the learner's own instruction below is the one that applies. */}
   {!preview&&<p>{t('غطِّ التسميات، وحدّد أماكن الإجابات، ثم جرّب السؤال.','Cover labels, place answer areas, then try your question.')}</p>}</div><Button icon={<Eye size={18}/>} aria-pressed={preview} onClick={()=>{setPreview(!preview);setPreviewKey(k=>k+1)}}>{preview?t('تابع التحرير','Back to editing'):t('معاينة الطالب','Learner preview')}</Button></div>
  <div ref={uploader}><ImageUpload compact showPreview={false} imageKey={p.imageKey} onProgress={upload.onProgress} onImage={imageKey=>{setImageFailed(false);change({...p,imageKey})}}/></div>
  {!preview&&<div className={styles.toolbar}>
   <div className={styles.toolGroup} aria-label={t('أدوات الصورة','Image tools')}><span className={styles.toolLabel}>{t('الصورة','Image')}</span><Button icon={<ImagePlus size={18}/>} disabled={upload.busy} onClick={()=>uploader.current?.querySelector('input')?.click()}>{t('استبدل الصورة','Replace image')}</Button><Button icon={<Sparkles size={18}/>} disabled={upload.busy} onClick={()=>setCreate(true)}>{t('صورة بالذكاء الاصطناعي','AI image')}</Button><Button icon={<Brush size={18}/>} disabled={!url||upload.busy} onClick={()=>setRetouch(true)}>{t('نظّف الصورة','Clean image')}</Button></div>
   <div className={`${styles.toolGroup} ${styles.modeGroup}`} aria-label={t('أدوات المناطق','Area tools')}><span className={styles.toolLabel}>{t('الأداة','Tool')}</span>{/* One of three modes, so it is labelled like the other two: an unlabelled
       arrow beside "Box" and "Circle" reads as a stray control rather than the
       mode you are in when you are not drawing. */}
   <Button variant="quiet" icon={<MousePointer2 size={18}/>} aria-label={t('تحديد وتحريك','Select and move')} aria-pressed={tool==='select'} onClick={()=>setTool('select')}>{t('تحديد','Select')}</Button><Button icon={<Square size={18}/>} aria-pressed={tool==='rect'} disabled={full||upload.busy} onClick={()=>setTool(tool==='rect'?'select':'rect')}>{t('مستطيل','Box')}</Button><Button icon={<Circle size={18}/>} aria-pressed={tool==='circle'} disabled={full||upload.busy} onClick={()=>setTool(tool==='circle'?'select':'circle')}>{t('دائرة','Circle')}</Button></div>
  </div>}
  {preview?<div className={styles.preview}>
   {url&&<QuestionInput key={previewKey} question={{id:question.id,qIndex:0,prompt:question.prompt,media:url,timeLimitS:question.timeLimitS,payload:{kind:'hotspot',mode:p.mode,zones:p.zones,cards:p.mode==='card_to_zone'?p.cards:[]}}} onAnswer={()=>undefined} preview interactivePreview evaluatePreview={answer=>markAnswer('hotspot',p,answer)}/>}
   <Button variant="secondary" icon={<RotateCcw size={18}/>} onClick={()=>setPreviewKey(k=>k+1)}>{t('جرّب من جديد','Try again')}</Button>
  </div>:<div className={styles.workbench} inert={upload.busy}>
   <div className={styles.pictureColumn}>
    <p className={styles.canvasHint} role="status">{tool==='select'?t('انقر على منطقة لتحديدها. اسحبها لتحريكها أو اسحب الزاوية لتغيير الحجم.','Select an area. Drag to move it, or drag its corner to resize.'):t('اسحب على الصورة لرسم منطقة إجابة جديدة.','Drag on the image to draw a new answer area.')}</p>
    {/*
      * The labels, where the learner meets them: above the picture, as the
      * chips they will drag.
      *
      * In the side list they sit in a numbered column against Area 1..4, which
      * reads as an order the teacher is setting — it is not. The server shuffles
      * them per learner, so this strip shows them as a set and says so, and the
      * numbering in the list goes back to meaning "which area", not "which
      * label comes first".
      */}
    {p.mode==='card_to_zone'&&<div className={styles.labelStrip}>
      <p><Shuffle size={15} aria-hidden="true"/>{t('يرى كل طالب هذه التسميات بترتيب مختلف، فترتيبها هنا لا يهم.','Every learner sees these in a different order, so their order here does not matter.')}</p>
      {/*
        * Written here, beside the picture they describe — not in the side list.
        * A label and the area it names are read together, and the teacher is
        * looking at the image while deciding what to call each part.
        *
        * Walks the ZONES, not the cards: every area gets a field whether or not
        * a label exists yet, and the number carries the pairing that the side
        * list used to carry by position.
        */}
      <ul>{p.zones.map((zone,index)=>{
        const card=p.cards.find(c=>p.map[c.key]===zone.key)
        return <li key={zone.key} data-selected={zone.key===active||undefined}>
          <span className={styles.labelNumber} aria-hidden="true">{index+1}</span>
          <input aria-label={`${t('إجابة المنطقة','Answer for area')} ${index+1}`} placeholder={t('اكتب التسمية الصحيحة','Type the correct label')}
            maxLength={300} dir="auto" value={card?.text??''} onFocus={()=>setActive(zone.key)}
            onChange={e=>{
              if(card){change({...p,cards:p.cards.map(c=>c.key===card.key?{...c,text:e.target.value}:c)});return}
              /* No card for this area yet: the first keystroke creates one. */
              const made={key:elementKey('card'),text:e.target.value}
              change({...p,cards:[...p.cards,made],map:{...p.map,[made.key]:zone.key}})
            }}/>
        </li>})}</ul>
    </div>}

    {/* The stage carries the tool too, so drawing mode can be shown on the
        picture itself rather than only in the toolbar and the hint line. */}
    <div className={styles.imageStage} dir="ltr" data-tool={tool} aria-busy={upload.busy||!url}>
     {url&&!imageFailed&&<><img src={url} alt={t('صورة السؤال','Question image')} draggable={false} onLoad={()=>setImageReady(true)} onError={()=>setImageFailed(true)}/><svg className={styles.zoneEditor} viewBox="0 0 100 100" preserveAspectRatio="none" aria-label={t('مناطق الإجابة القابلة للتحرير','Editable answer areas')} data-tool={tool} onPointerDown={down} onPointerMove={move} onPointerUp={finish} onPointerCancel={()=>{gesture.current=null;setDrawing(null)}}>
      {zones.map((z,index)=><g key={z.key} className={z.key===active?styles.activeZone:styles.zone}>
       <ZoneOutline zone={z} data-zone={z.key} role="button" tabIndex={0} aria-label={`${t('منطقة','Area')} ${index+1}`} aria-pressed={z.key===active} onFocus={()=>setActive(z.key)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setActive(z.key)}const d=e.shiftKey?.02:.005;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();update(transformZone(z,{x:z.x+(e.key==='ArrowLeft'?-d:e.key==='ArrowRight'?d:0),y:z.y+(e.key==='ArrowUp'?-d:e.key==='ArrowDown'?d:0)}))}}}/>
       {z.key===active&&tool==='select'&&<rect className={styles.resizeHandle} data-zone={z.key} data-resize="true" x={(z.x+z.w)*100-1} y={(z.y+z.h)*100-1} width="2" height="2"/>}
      </g>)}
     </svg>{zones.map((z,index)=><span key={z.key} aria-hidden="true" className={styles.zoneBadge} data-selected={z.key===active} style={{left:`${(z.x+z.w/2)*100}%`,top:`${(z.y+z.h/2)*100}%`}}>{index+1}</span>)}</>}
     {imageFailed&&<p role="alert">{t('تعذّر تحميل الصورة. أعد فتح السؤال لتحديث رابطها.','Could not load the image. Reopen the question to refresh its link.')}</p>}
     <UploadBar state={upload.state} label={t('تحديث الصورة','Updating image')}/>
    </div>
    <details className={styles.precision}><summary>{t('الشكل والموضع الدقيق','Shape and precise position')}</summary><label>{t('الشكل','Shape')}<Select aria-label={t('الشكل','Shape')} value={selected.shape??'rect'} onValueChange={shape=>{const {points:oldPoints,...rest}=selected;update(shape==='polygon'?{...rest,shape,points:oldPoints??[{x:selected.x,y:selected.y+selected.h},{x:selected.x+selected.w/2,y:selected.y},{x:selected.x+selected.w,y:selected.y+selected.h}]}:{...rest,shape:shape as 'rect'|'circle'|'hexagon'})}}><option value="rect">{t('مستطيل','Rectangle')}</option><option value="circle">{t('دائرة','Circle')}</option><option value="hexagon">{t('سداسي','Hexagon')}</option><option value="polygon">{t('مضلّع','Polygon')}</option></Select></label><div className={styles.coordinates}>{(['x','y','w','h'] as const).map(axis=><label key={axis}>{({x:t('أفقي %','Horizontal %'),y:t('رأسي %','Vertical %'),w:t('عرض %','Width %'),h:t('ارتفاع %','Height %')})[axis]}<input type="number" min={axis==='x'||axis==='y'?0:1} max={100} value={Math.round(current[axis]*100)} onChange={e=>update(transformZone(selected,{[axis]:Number(e.target.value)/100}))}/></label>)}</div></details>
   </div>
   <aside className={styles.answers} aria-label={t('الإجابات ومناطقها','Answers and their areas')}>
    <div className={styles.answersHeading}><h3>{t('الإجابات','Answers')}</h3><span><bdi>{p.zones.length}/12</bdi></span></div>
    <label className={styles.answerMode}>{t('طريقة الإجابة','Answer mode')}<Select value={p.mode} onValueChange={mode=>{if(mode===p.mode)return;if(mode==='click_zone')setSwitchMode(true);else{const cards=p.zones.map(()=>({key:elementKey('card'),text:''}));change({mode:'card_to_zone',imageKey:p.imageKey,zones:p.zones,cards,map:Object.fromEntries(cards.map((c,i)=>[c.key,p.zones[i]!.key]))})}}}><option value="card_to_zone">{t('اسحب التسميات','Drag labels')}</option><option value="click_zone">{t('انقر على الإجابات','Pin answers')}</option></Select></label>
    <ol className={styles.answerList}>{p.zones.map((zone,index)=><li key={zone.key} data-selected={zone.key===active}>
     <div className={styles.answerRow}><button type="button" className={styles.answerNumber} aria-label={`${t('حدد المنطقة','Select area')} ${index+1}`} aria-pressed={zone.key===active} onClick={()=>setActive(zone.key)}>{index+1}</button><strong>{t('المنطقة','Area')} {index+1}</strong><Button variant="quiet" disabled={p.zones.length===1} aria-label={`${t('احذف المنطقة','Delete area')} ${index+1}`} onClick={()=>{change(removeAnswerZone(p,zone.key));if(active===zone.key)setActive(p.zones.find(z=>z.key!==zone.key)!.key)}}><Trash2 size={16}/></Button></div>
     {p.mode==='click_zone'&&<label className={styles.correctCheck}><input type="checkbox" checked={p.correct.includes(zone.key)} onChange={e=>{const correct=e.target.checked?[...p.correct,zone.key]:p.correct.filter(k=>k!==zone.key);if(correct.length)change({...p,correct})}}/>{t('إجابة صحيحة','Correct answer')}</label>}
    </li>)}</ol>
    {/* Moved out of the image toolbar: it produces ANSWERS, and it belongs
        beside the list it adds to rather than among the tools that change the
        picture. */}
    <div className={styles.answerActions}>
     <Button variant="primary" full icon={<Plus size={18}/>} disabled={full} onClick={add}>{t('أضف منطقة إجابة','Add answer area')}</Button>
     <Button variant="secondary" full icon={<Sparkles size={18}/>} disabled={full||upload.busy} onClick={()=>setSuggest(true)}>{t('اقترح الإجابات بالذكاء الاصطناعي','Suggest answers with AI')}</Button>
    </div>
    <p className={styles.answerHint}>{p.mode==='card_to_zone'?t('يرى الطالب التسميات ويسحب كل تسمية إلى مكانها.','Learners drag each label to its matching area.'):t('يمكنك تحديد أكثر من منطقة صحيحة.','You can mark more than one area correct.')}</p>
   </aside>
  </div>}
  {!preview&&<footer className={styles.workspaceFooter}><p>{t('راجع مواضع الإجابات وتسمياتها ثم أكّدها. لا يمكن اعتماد السؤال قبل تأكيدها.','Check the areas and their answers, then confirm them. The question cannot be approved until you do.')}</p><Button icon={<Check size={18}/>} disabled={upload.busy} onClick={()=>{onConfirm();setConfirmed(true)}}>{confirmed?t('تم تأكيد مناطق الإجابة','Answer areas confirmed'):t('تأكيد مناطق الإجابة','Confirm answer areas')}</Button></footer>}
  </div>
  {switchMode&&<ConfirmDialog open title={t('تبديل طريقة الإجابة؟','Switch answer mode?')} body={t('ستُحذف تسميات السحب، وتبقى المناطق على الصورة.','This removes the draggable labels but keeps the image areas.')} confirmLabel={t('بدّل إلى النقر','Switch to pins')} onConfirm={()=>{change({mode:'click_zone',imageKey:p.imageKey,zones:p.zones,correct:[selected.key]});setSwitchMode(false)}} onCancel={()=>setSwitchMode(false)}/>}
  {create&&<ImageCreator activityId={activityId} questionId={question.id} onPrepare={onPrepare} onImage={imageKey=>change({...p,imageKey})} onClose={()=>setCreate(false)}/>}
  {retouch&&url&&<ImageRetouch url={url} imageKey={p.imageKey} onImage={imageKey=>change({...p,imageKey})} onClose={()=>setRetouch(false)}/>}
  {suggest&&<ZoneSuggestions activityId={activityId} question={question} imageUrl={url} onPrepare={onPrepare} onApplied={onApplied} onClose={()=>setSuggest(false)}/>}
 </section>
}
