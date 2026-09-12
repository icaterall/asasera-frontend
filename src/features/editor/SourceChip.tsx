import {useEffect,useRef,useState,type ReactNode,type RefObject} from 'react'
import {useQuery} from '@tanstack/react-query'
import {useTranslation} from 'react-i18next'
import {FileText,Lightbulb,Presentation,ScrollText,Unlink} from 'lucide-react'
import {ApiError,teaching,type MaterialSegment,type QuestionProvenance,type RevisionSummary} from '@/lib/api'
import {Button,LoadingIndicator} from '@/design'
import styles from './SourceChip.module.css'
import {mediaUrl} from './ImageUpload'

/**
 * A question's source chip (v5.1 C4).
 *
 * A citation records where a question came from — a file's pages, slides or
 * sections, or a topic with no file behind it — and nothing more. The chip
 * therefore names the source and opens its text; it never claims the question
 * was checked against it. The server decides what may be opened: the summary
 * and the segments are owner-scoped, and a revision id that arrived with a
 * copied question answers 404, which the chip reports as an unavailable source.
 * A question with no citation renders nothing.
 */

type LocatorKind=RevisionSummary['locatorKind']
const LOCATOR_ICON={page:FileText,slide:Presentation,section:ScrollText} as const

/** The citation the API returns beside a question, shape-checked because it is optional on the wire. */
export function readProvenance(question:unknown):QuestionProvenance|null{
 if(!question||typeof question!=='object'||!('provenance' in question))return null
 const value=(question as {provenance?:unknown}).provenance
 if(!value||typeof value!=='object')return null
 const {origin,materialRevisionId,segmentIndexes}=value as Record<string,unknown>
 if(origin!=='file'&&origin!=='topic')return null
 return {origin,materialRevisionId:typeof materialRevisionId==='number'?materialRevisionId:null,segmentIndexes:Array.isArray(segmentIndexes)?segmentIndexes.filter((n):n is number=>Number.isInteger(n)):[]}
}

/** "PDF p. 3, 4" · "Slide 2" · "Sections 4, 5" — Arabic «صفحة 3، 4» · «شريحة 2» · «مقطع 4، 5». A DOCX is never called a page. */
export function locatorLabel(ar:boolean,kind:LocatorKind,indexes:number[]):string{
 const list=indexes.join(ar?'، ':', '),many=indexes.length>1
 if(kind==='page')return list?(ar?`صفحة ${list}`:`PDF p. ${list}`):'PDF'
 if(kind==='slide')return list?(ar?`شريحة ${list}`:`${many?'Slides':'Slide'} ${list}`):(ar?'شرائح':'Slides')
 return list?(ar?`مقطع ${list}`:`${many?'Sections':'Section'} ${list}`):(ar?'مقاطع':'Sections')
}

/** One segment's own label inside the viewer, with the printed page number when the file has one that differs. */
function segmentLabel(ar:boolean,kind:LocatorKind,segment:MaterialSegment):string{
 const index=segment.pageIndex??segment.segmentIndex
 const base=locatorLabel(ar,kind,[index])
 return segment.printedLabel&&segment.printedLabel!==String(index)&&kind==='page'?`${base} (${segment.printedLabel})`:base
}

export type SourceEntry={key:string|number;label?:string;text:string;warning?:string|null;previewUrl?:string}

/**
 * The source viewer. Extracted from the generation panel, where it shows one
 * cited segment of a candidate; the editor shows every segment a question cites.
 * Text is rendered as text — it came out of an untrusted file.
 */
function SourcePage({entry}:{entry:SourceEntry}){
 const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar')
 const [state,setState]=useState<'loading'|'ready'|'error'>('loading')
 return <article className={styles.pageCard}>
  <h4 className={styles.sourceEntryLabel}>{entry.label}</h4>
  <div className={styles.pagePicture} aria-busy={state==='loading'}>
   {state==='loading'&&<LoadingIndicator label={ar?'جارٍ عرض الصفحة…':'Rendering page…'}/>}
   {state!=='error'&&<img src={mediaUrl(entry.previewUrl!)} alt={entry.label??(ar?'صفحة PDF':'PDF page')} loading="lazy" decoding="async" onLoad={()=>setState('ready')} onError={()=>setState('error')}/>}
   {state==='error'&&<p role="status">{ar?'تعذّر عرض صورة الصفحة. النص متاح أدناه.':'Page preview unavailable. The extracted text is available below.'}</p>}
  </div>
  <details open={state==='error'}><summary>{ar?'النص المستخرج':'Extracted text'}</summary><p dir="auto">{entry.text}</p></details>
 </article>
}

export function SourceText({title,entries,note,onClose,closeLabel,headingRef,children}:{title:string;entries:SourceEntry[];note?:ReactNode;onClose:()=>void;closeLabel:string;headingRef?:RefObject<HTMLHeadingElement|null>;children?:ReactNode}){
 const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar')
 const warningText=(warning:string)=>({empty:ar?'بلا نص':'no text',unreadable:ar?'غير مقروء':'unreadable',low_text:ar?'نص قليل':'little text'} as Record<string,string>)[warning]??warning
 return <section className={styles.sourceText} aria-label={title} data-source-panel="">
  <h3 ref={headingRef} tabIndex={-1}>{title}</h3>
  {entries.some(entry=>entry.previewUrl)&&<div className={styles.sourcePages}>{entries.filter(entry=>entry.previewUrl).map(entry=><SourcePage key={`${entry.key}:${entry.previewUrl}`} entry={entry}/>)}</div>}
  {entries.filter(entry=>!entry.previewUrl).map(entry=>entry.label
   ?<article key={entry.key} className={styles.sourceEntry}><h4 className={styles.sourceEntryLabel}><bdi>{entry.label}</bdi>{entry.warning?<span className={styles.sourceWarning}> · {warningText(entry.warning)}</span>:null}</h4><p dir="auto">{entry.text}</p></article>
   :<p key={entry.key}>{entry.text}</p>)}
  {children}
  {note&&<p className={styles.sourceNote}>{note}</p>}
  <Button onClick={onClose}>{closeLabel}</Button>
 </section>
}

/** The rail thumbnail's origin marker: static, because the thumbnail is itself a button. */
export function SourceMarker({provenance}:{provenance:QuestionProvenance|null}){
 const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar')
 if(!provenance)return null
 const topic=provenance.origin==='topic',Icon=topic?Lightbulb:FileText
 return <span className={styles.marker} data-source-marker={provenance.origin}><Icon size={12} aria-hidden="true"/>{topic?(ar?'موضوع':'Topic'):(ar?'مصدر':'Source')}</span>
}

type ChipStatus='manual'|'topic'|'loading'|'file'|'unavailable'|'unchecked'

/**
 * The chip and, when opened, the cited text beneath it. Mount it keyed by the
 * question id so a change of question closes the viewer.
 */
export function QuestionSource({provenance}:{provenance:QuestionProvenance|null}){
 const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),t=(a:string,e:string)=>ar?a:e
 const [open,setOpen]=useState(false)
 const chip=useRef<HTMLButtonElement>(null),heading=useRef<HTMLHeadingElement>(null)
 const revisionId=provenance?.origin==='file'?provenance.materialRevisionId:null
 const summary=useQuery({queryKey:['revision-summary',revisionId],queryFn:()=>teaching.revision(revisionId!),enabled:revisionId!==null,retry:false,staleTime:60_000})
 const segments=useQuery({queryKey:['generation-segments',revisionId],queryFn:()=>teaching.segments(revisionId!),enabled:open&&revisionId!==null&&summary.data?.revision.state==='ready'})
 const revision=summary.data?.revision??null
 const gone=summary.error instanceof ApiError&&[404,410].includes(summary.error.status)
 const status:ChipStatus=!provenance?'manual':provenance.origin==='topic'?'topic':revisionId===null||gone||(revision&&revision.state!=='ready')?'unavailable':summary.isPending?'loading':summary.isError?'unchecked':'file'
 useEffect(()=>{if(open)heading.current?.focus()},[open,segments.data])
 const close=()=>{setOpen(false);requestAnimationFrame(()=>chip.current?.focus())}
 const sourceWord=t('المصدر','Source')

 /* A question written by hand carries no chip at all. The absence IS the
    statement: a chip exists to name a source and open it, and "Manual" named
    nothing and opened nothing, so it was a label taking space on every
    hand-written question. A citation is still shown wherever one exists. */
 if(status==='manual')return null
 if(status==='topic')return <div className={styles.row}><span className={styles.chip} data-source-chip="topic" title={t('مولَّد من موضوع، بلا مرجع من ملف. راجعه قبل الاعتماد.','Generated from a topic, with no file citation. Review before approving.')}><Lightbulb size={14} aria-hidden="true"/><span className={styles.srOnly}>{sourceWord}: </span>{t('موضوع','Topic')}</span></div>

 const cited=provenance?.segmentIndexes??[]
 const locator=revision?locatorLabel(ar,revision.locatorKind,cited):''
 const unavailableLabel=t('المصدر غير متاح','Source unavailable')
 const label=status==='unavailable'?unavailableLabel:status==='file'&&revision?`${locator} · ${revision.title}`:sourceWord
 const Icon=status==='unavailable'?Unlink:revision?LOCATOR_ICON[revision.locatorKind]:FileText
 const onClick=()=>{if(status==='unchecked'){void summary.refetch();return}if(status==='loading')return;setOpen(value=>!value)}

 const found=(segments.data?.segments??[]).filter(s=>cited.includes(s.segmentIndex))
 const missing=cited.filter(index=>segments.isSuccess&&!found.some(s=>s.segmentIndex===index))
 const entries:SourceEntry[]=revision?found.map(s=>({key:s.segmentIndex,label:segmentLabel(ar,revision.locatorKind,s),text:s.text||'—',warning:s.warning,previewUrl:revision.sourceKind==='pdf'&&s.pageIndex&&segments.data?.previewToken?teaching.pageImage(revision.id,s.pageIndex,segments.data.previewToken):undefined})):[]
 const originNote=t('تسجّل الإشارة أصل السؤال فقط، ولا تعني أنه تحقّق منه.','A citation records where the question came from; it is not a check of the question.')

 return <div className={styles.row} data-source-status={status}>
  <button ref={chip} type="button" className={styles.chip} data-source-chip={status} aria-label={status==='unavailable'?unavailableLabel:`${sourceWord}: ${label}`} aria-expanded={status==='unchecked'?undefined:open} aria-busy={status==='loading'||undefined} title={status==='unchecked'?t('تعذّر التحقق من المصدر. انقر لإعادة المحاولة.','Could not check the source. Click to retry.'):undefined} onClick={onClick}>
   <Icon size={14} aria-hidden="true"/>
   {status==='file'&&revision?<><bdi>{locator}</bdi><span className={styles.chipSep} aria-hidden="true">·</span><bdi className={styles.chipTitle} dir="auto">{revision.title}</bdi></>:<span>{label}{status==='loading'?'…':''}</span>}
  </button>
  {open&&status==='unavailable'&&<SourceText title={unavailableLabel} entries={[]} headingRef={heading} onClose={close} closeLabel={t('أغلق المصدر','Close source')} note={t('حُذفت المادة المُستشهد بها أو تعذّرت قراءتها، فلا يمكن فتحها. تبقى الإشارة سجلًا لأصل السؤال.','The cited material was deleted or could not be read, so it cannot be opened. The citation stays as a record of where the question came from.')}/>}
  {open&&status==='file'&&revision&&<SourceText title={revision.title} entries={entries} headingRef={heading} onClose={close} closeLabel={t('أغلق المصدر','Close source')} note={<>{originNote}{missing.length>0?<> {t(`لم تُعثر على ${locatorLabel(ar,revision.locatorKind,missing)} في المادة الحالية.`,`${locatorLabel(ar,revision.locatorKind,missing)} could not be found in the current source.`)}</>:null}</>}>
   {segments.isPending&&<LoadingIndicator label={t('جارٍ تحميل المصدر…','Loading the source…')}/>}
   {segments.isError&&<p role="alert">{t('تعذّر تحميل نص المصدر.','The source text could not be loaded.')} <Button variant="quiet" onClick={()=>void segments.refetch()}>{t('أعد المحاولة','Retry')}</Button></p>}
  </SourceText>}
 </div>
}
