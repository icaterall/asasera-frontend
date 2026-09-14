import {useCallback,useEffect,useRef,useState,type KeyboardEvent} from 'react'
import {useTranslation} from 'react-i18next'
import {Check} from 'lucide-react'
import {Button} from '@/design'
import type {AttemptPresentation,AttemptPresentationCommand} from '@/shared/delivery'
import type {WordCell} from '@/shared/word-boards'
import styles from './WordGridInput.module.css'

type Grid=NonNullable<AttemptPresentation['wordGrid']>
type Action=Pick<AttemptPresentationCommand,'action'|'start'|'end'|'entryId'|'value'>
const key=(cell:WordCell)=>`${cell.row}:${cell.column}`
const same=(a:WordCell|null,b:WordCell)=>!!a&&a.row===b.row&&a.column===b.column
function selectionCells(start:WordCell,end:WordCell){
 const rows=end.row-start.row,columns=end.column-start.column
 if(rows&&columns&&Math.abs(rows)!==Math.abs(columns))return []
 return Array.from({length:Math.max(Math.abs(rows),Math.abs(columns))+1},(_,i)=>({row:start.row+Math.sign(rows)*i,column:start.column+Math.sign(columns)*i}))
}
function clueCells(clue:Grid['board']['clues'][number],language:string){return Array.from({length:clue.length},(_,i)=>({row:clue.start.row+(clue.direction==='down'?i:0),column:clue.start.column+(clue.direction==='across'?(language==='ar'?-i:i):0)}))}

export function WordGridInput({grid,busy,onCommand,previewOnly=false}:{grid:Grid;busy:boolean;onCommand:(command:Action)=>void;previewOnly?:boolean}){
 const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),t=(a:string,e:string)=>ar?a:e
 const {board}=grid,search=board.kind==='word-search'
 const [start,setStart]=useState<WordCell|null>(null),[selected,setSelected]=useState(board.clues[0]?.id??''),[drafts,setDrafts]=useState<Record<string,string>>({})
 const [preview,setPreview]=useState<{start:WordCell;end:WordCell}|null>(null)
 const drag=useRef<WordCell|null>(null),ignoreClick=useRef(false),container=useRef<HTMLDivElement>(null)
 const scroller=useRef<HTMLDivElement>(null)
 const showClue=useCallback((id:string)=>{
  const frame=scroller.current,clue=board.clues.find(item=>item.id===id)
  if(!frame||!clue)return
  const cells=clueCells(clue,board.language).flatMap(cell=>{
   const button=container.current?.querySelector<HTMLButtonElement>(`button[data-row="${cell.row}"][data-column="${cell.column}"]`)
   return button?[button.getBoundingClientRect()]:[]
  })
  if(!cells.length)return
  const bounds=frame.getBoundingClientRect()
  // Move only the board viewport; never scroll the document or steal clue/input focus.
  frame.scrollLeft+=(Math.min(...cells.map(cell=>cell.left))+Math.max(...cells.map(cell=>cell.right)))/2-bounds.left-frame.clientWidth/2
  frame.scrollTop+=(Math.min(...cells.map(cell=>cell.top))+Math.max(...cells.map(cell=>cell.bottom)))/2-bounds.top-frame.clientHeight/2
 },[board.clues,board.language])
 useEffect(()=>{
  if(search)return
  const center=()=>showClue(selected)
  center();window.addEventListener('resize',center)
  return()=>window.removeEventListener('resize',center)
 },[search,selected,showClue])
 const active=board.clues.find(clue=>clue.id===selected),activeCells=new Set(active?clueCells(active,board.language).map(key):[])
 const foundCells=new Set(grid.found.flatMap(found=>found.cells.map(key))),conflicts=new Set(grid.conflicts.map(key))
 const letters=new Map<string,string>(),numbers=new Map<string,number>()
 for(const clue of board.clues){
  numbers.set(key(clue.start),clue.number)
  const chars=Array.from(new Intl.Segmenter(board.language,{granularity:'grapheme'}).segment(grid.values[clue.id]??''),part=>part.segment)
  clueCells(clue,board.language).forEach((cell,i)=>{if(chars[i])letters.set(key(cell),chars[i])})
 }
 const dirty=board.clues.some(clue=>drafts[clue.id]!==undefined&&drafts[clue.id]!==(grid.values[clue.id]??''))
 const path=preview?selectionCells(preview.start,preview.end):start?[start]:[],previewCells=new Set(path.map(key))
 const selectedText=path.map(cell=>board.matrix[cell.row]?.[cell.column]??'').join('')
 function choose(cell:WordCell){
  if(previewOnly||busy||grid.complete)return
  if(!search){const options=board.clues.filter(clue=>clueCells(clue,board.language).some(at=>same(at,cell)));setSelected((options.find(clue=>clue.id!==selected)??options[0])?.id??selected);return}
  if(start){onCommand({action:'word-search-select',start,end:cell});setStart(null);setPreview(null)}else{setStart(cell);setPreview({start:cell,end:cell})}
 }
 function keyboard(event:KeyboardEvent<HTMLButtonElement>,cell:WordCell){
  const offset:Record<string,[number,number]>={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1]}
  if(event.key==='Escape'){setStart(null);setPreview(null);return}
  const delta=offset[event.key];if(!delta)return
  event.preventDefault();let row=cell.row+delta[0],column=cell.column+delta[1]
  while(row>=0&&row<board.rows&&column>=0&&column<board.columns){const target=container.current?.querySelector<HTMLButtonElement>(`button[data-row="${row}"][data-column="${column}"]`);if(target){target.focus();if(search&&start)setPreview({start,end:{row,column}});return}row+=delta[0];column+=delta[1]}
 }
 return <section className={styles.root} aria-label={t(search?'البحث عن الكلمات':'الكلمات المتقاطعة',search?'Word search':'Crossword')}>
  {!previewOnly&&<p>{search?t('اسحب فوق كلمة أو اختر أول حرف وآخر حرف. استخدم الأسهم للتنقل وEnter للاختيار.','Drag over a word, or select its first and last cells. Use arrow keys to move and Enter to select.'):t('اختر تلميحًا ثم اكتب الكلمة في الحقل الكبير. احفظها قبل التحقق.','Choose a clue and use the large answer field. Save your word before checking.')}</p>}
  <p className={styles.geometryNote}>{t('يمكن تمرير اللوحة داخل الإطار؛ لا تتغير مواقع الحروف مع لغة الواجهة.','The board scrolls inside this frame; cell positions do not change with the interface language.')}</p>
  {search&&<ul className={styles.targets} aria-label={t('الكلمات المطلوبة','Words to find')}>{board.targets?.map(target=><li key={target.id} data-found={grid.found.some(found=>found.id===target.id)}><span dir="auto">{target.text}</span>{grid.found.some(found=>found.id===target.id)&&<Check size={18} aria-label={t('تم العثور عليها','Found')}/>}</li>)}</ul>}
  <div ref={scroller} className={styles.scroller} dir="ltr" tabIndex={0} role="region" aria-label={t('لوحة كلمات قابلة للتمرير','Scrollable word board')}>
   <div ref={container} className={styles.grid} dir="ltr" lang={board.language} style={{gridTemplateColumns:`repeat(${board.columns},44px)`}} data-search={search} onPointerUp={event=>{
    const first=drag.current;drag.current=null;setPreview(null)
    const target=(document.elementFromPoint?.(event.clientX,event.clientY)??(event.target instanceof Element?event.target:null))?.closest<HTMLButtonElement>('button[data-row]')
    if(previewOnly||!first||!target||!container.current?.contains(target))return
    const end={row:Number(target.dataset.row),column:Number(target.dataset.column)}
    if(!same(first,end)){ignoreClick.current=true;setStart(null);onCommand({action:'word-search-select',start:first,end})}
   }} onPointerMove={event=>{
    const first=drag.current??start;if(previewOnly||!search||!first)return
    const target=document.elementFromPoint?.(event.clientX,event.clientY)?.closest<HTMLButtonElement>('button[data-row]')
    if(target&&container.current?.contains(target))setPreview({start:first,end:{row:Number(target.dataset.row),column:Number(target.dataset.column)}})
   }} onPointerCancel={()=>{drag.current=null;setPreview(null)}}>
    {board.matrix.flatMap((row,r)=>row.map((letter,c)=>{const cell={row:r,column:c},id=key(cell),shown=search?letter:letters.get(id)??''
     return letter===null?<span key={id} className={styles.block} aria-hidden="true"/>:<button type="button" key={id} data-row={r} data-column={c} data-found={foundCells.has(id)} data-active={activeCells.has(id)||same(start,cell)} data-preview={previewCells.has(id)} data-conflict={conflicts.has(id)} disabled={previewOnly||busy||grid.complete} aria-label={t(`الصف ${r+1}، العمود ${c+1}: ${shown||'فارغ'}`,`Row ${r+1}, column ${c+1}: ${shown||'empty'}`)} onPointerDown={event=>{if(!previewOnly&&search&&!busy&&!grid.complete){ignoreClick.current=false;drag.current=cell;setPreview({start:cell,end:cell});event.currentTarget.setPointerCapture?.(event.pointerId)}}} onClick={()=>{if(ignoreClick.current){ignoreClick.current=false;return}choose(cell)}} onKeyDown={event=>keyboard(event,cell)}>{numbers.has(id)&&<small aria-hidden="true">{numbers.get(id)}</small>}<span>{shown}</span></button>
    }))}
   </div>
  </div>
  {search&&(start||preview)&&<div className={styles.selection}><span>{t('الحروف المحددة:','Selected letters:')} <output dir={board.language==='ar'?'rtl':'ltr'} lang={board.language}>{selectedText||t('اختر مسارًا مستقيمًا','Choose a straight path')}</output></span><Button onClick={()=>{setStart(null);setPreview(null)}}>{t('إلغاء التحديد','Cancel selection')}</Button></div>}
  {!search&&<>
   <div className={styles.clues}>{(['across','down'] as const).map(direction=><section key={direction}><h2>{direction==='across'?t('أفقي','Across'):t('رأسي','Down')}</h2>{board.clues.filter(clue=>clue.direction===direction).map(clue=><button type="button" key={clue.id} aria-pressed={selected===clue.id} disabled={busy&&!previewOnly} onClick={()=>{setSelected(clue.id);showClue(clue.id)}}><strong>{clue.number}</strong><span dir="auto">{clue.text}</span><span>({clue.length})</span>{grid.feedback[clue.id]==='correct'&&<Check size={18} aria-label={t('صحيح','Correct')}/>}</button>)}</section>)}</div>
   {active&&<form className={styles.entry} onSubmit={event=>{event.preventDefault();if(!previewOnly&&!busy&&!grid.complete)onCommand({action:'crossword-entry',entryId:active.id,value:drafts[active.id]??grid.values[active.id]??''})}}><label htmlFor={`answer-${active.id}`}>{t(`إجابة التلميح ${active.number}`,`Answer to clue ${active.number}`)}</label><input id={`answer-${active.id}`} dir={board.language==='ar'?'rtl':'ltr'} lang={board.language} value={drafts[active.id]??grid.values[active.id]??''} onChange={event=>setDrafts(value=>({...value,[active.id]:event.target.value}))} disabled={previewOnly||busy||grid.complete} maxLength={1024} autoComplete="off"/>{!previewOnly&&<><Button type="submit" disabled={busy||grid.complete}>{t('احفظ الكلمة','Save word')}</Button><p role="status">{drafts[active.id]!==undefined&&drafts[active.id]!==grid.values[active.id]?t('تعديل غير محفوظ بعد','Not saved yet'):t('محفوظ','Saved')}</p></>}</form>}
   {grid.conflicts.length>0&&<p role="status">{t('تختلف حروف بعض التقاطعات. راجع الكلمات المحفوظة.','Some intersection letters disagree. Review your saved words.')}</p>}
   {!previewOnly&&<div className={styles.selection}><Button variant="primary" disabled={busy||dirty||grid.complete||grid.checks>=grid.maxChecks||!Object.values(grid.values).some(Boolean)} onClick={()=>onCommand({action:'crossword-check'})}>{t('تحقق من الكلمات','Check words')}</Button><span>{t(`مرات التحقق: ${grid.checks} من ${grid.maxChecks}`,`Checks: ${grid.checks} of ${grid.maxChecks}`)}</span></div>}
   {dirty&&<p>{t('احفظ الكلمات المعدّلة أولًا.','Save edited words first.')}</p>}
   {grid.checks>=grid.maxChecks&&!grid.complete&&<p role="status">{t('بلغت حد التحقق لهذه اللوحة. يمكنك مراجعة المحاولات المحفوظة.','This board’s check limit has been reached. Your saved attempts remain available.')}</p>}
   {Object.values(grid.feedback).includes('incorrect')&&<p role="status">{t('بعض الكلمات تحتاج مراجعة؛ يمكنك تعديلها والتحقق مجددًا.','Some words need another look. You can edit them and check again.')}</p>}
  </>}
  {grid.complete&&<p role="status">{t('اكتملت اللوحة. يُحفظ هذا كتدريب كلمات، وليس دليلًا على فهم المعاني.','Board complete. This records word practice, not mastery of the meanings.')}</p>}
 </section>
}
