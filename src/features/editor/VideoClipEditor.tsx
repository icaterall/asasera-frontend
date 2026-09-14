import {useId,useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Clock,Play,RotateCcw} from 'lucide-react'
import {Button} from '@/design'
import {QuestionVideo} from '@/components/QuestionVideo'
import {formatVideoDuration,formatVideoTime,parseVideoTime} from './video-time'
import {useVideoDetails} from './useVideoDetails'
import styles from './VideoClipEditor.module.css'

export function VideoClipEditor({activityId,videoId,title,start=null,end=null,editing,onBack,onApply}:{
 activityId?:number;videoId:string;title:string;start?:number|null;end?:number|null;editing:boolean
 onBack:()=>void;onApply:(start:number|null,end:number|null)=>void
}){
 const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),id=useId()
 const [from,setFrom]=useState(formatVideoTime(start??0)),[to,setTo]=useState(end==null?'':formatVideoTime(end))
 const [preview,setPreview]=useState({start,end,version:0})
 const details=useVideoDetails(activityId,videoId)
 const total=details.data?.durationSeconds
 const fullDuration=formatVideoDuration(total,i18n.language)
 const first=parseVideoTime(from)??0,last=parseVideoTime(to)
 const validTimes=Number.isFinite(first)&&(last===null||(Number.isFinite(last)&&last>first))
 const withinVideo=total==null||(first<total&&(last===null||last<=total))
 const valid=validTimes&&withinVideo
 const effectiveEnd=last??total
 const selected=valid&&effectiveEnd!=null?formatVideoDuration(effectiveEnd-first,i18n.language):null
 const error=!validTimes?(ar?'أدخل وقتًا صحيحًا خلال 24 ساعة، واجعل النهاية بعد البداية.':'Enter valid times within 24 hours, with the end later than the start.')
  :!withinVideo?(ar?'يجب أن تكون البداية قبل نهاية الفيديو، وألا تتجاوز النهاية مدة الفيديو.':'Start before the video ends, and keep the end within the full video length.'):null
 return <section className={styles.clip} aria-label={ar?'تحديد وقت الفيديو':'Video timeframe'}>
  <div className={styles.intro}><h3>{ar?'اختر الجزء الذي سيشاهده المتعلم':'Choose the part learners will watch'}</h3>
   <p dir="auto">{title||details.data?.title}</p></div>
  <div className={styles.workspace}>
   <div className={styles.media}>
    <QuestionVideo key={preview.version} videoId={videoId} title={ar?'معاينة مقطع الفيديو':'Video clip preview'} start={preview.start} end={preview.end} showLink={false}/>
    <div className={styles.duration} data-full-video-length="" aria-live="polite">
     <Clock aria-hidden="true"/><div><span>{ar?'مدة الفيديو الكاملة':'Full video length'}</span>
      <strong>{fullDuration??(details.isFetching?(ar?'جارٍ التحميل…':'Loading…'):(ar?'المدة غير متاحة':'Length unavailable'))}</strong></div>
     {fullDuration&&<bdi>{formatVideoTime(total!)}</bdi>}
    </div>
    <a className={styles.youtubeLink} href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noopener noreferrer">{ar?'افتح في يوتيوب':'Open on YouTube'}</a>
   </div>
   <form onSubmit={event=>{event.preventDefault();if(valid)onApply(first||null,last)}}>
    <div className={styles.times}>
     <label>{ar?'بداية الفيديو':'Start video at'}<input autoFocus dir="ltr" value={from} maxLength={12} aria-invalid={!valid||undefined} aria-describedby={`${id}-help ${id}-error`} onChange={e=>setFrom(e.target.value)} placeholder="00:00"/></label>
     <label>{ar?'نهاية الفيديو':'End video at'}<input dir="ltr" value={to} maxLength={12} aria-invalid={!valid||undefined} aria-describedby={`${id}-help ${id}-error`} onChange={e=>setTo(e.target.value)} placeholder={fullDuration?formatVideoTime(total!):(ar?'نهاية المقطع':'End of video')}/></label>
    </div>
    <p id={`${id}-help`} className={styles.help}>{ar?'دقائق:ثوانٍ أو ساعات:دقائق:ثوانٍ. اترك النهاية فارغة لعرض بقية الفيديو.':'Use mm:ss or hh:mm:ss. Leave the end blank to play the rest of the video.'}</p>
    <p id={`${id}-error`} role={error?'alert':undefined} className={styles.error}>{error}</p>
    <div className={styles.selection} data-selected-clip="" aria-live="polite">
     <span>{ar?'سيشاهد المتعلم':'Learners will watch'}</span>
     <strong>{valid?(selected??(ar?'حتى نهاية الفيديو':'Until the end of the video')):(ar?'تحقق من التوقيت':'Check the timeframe')}</strong>
     {valid&&<bdi>{formatVideoTime(first)} — {effectiveEnd!=null?formatVideoTime(effectiveEnd):(ar?'نهاية الفيديو':'End of video')}</bdi>}
    </div>
    <div className={styles.previewRow}>
     <Button type="button" disabled={!valid} onClick={()=>setPreview({start:first,end:last,version:preview.version+1})}><Play size={16} aria-hidden="true"/>{ar?'معاينة هذا الجزء':'Preview clip'}</Button>
     <button type="button" className={styles.reset} onClick={()=>{setFrom('00:00');setTo('');setPreview({start:null,end:null,version:preview.version+1})}}><RotateCcw size={14} aria-hidden="true"/>{ar?'الفيديو كاملًا':'Use full video'}</button>
    </div>
    <footer><Button type="button" onClick={onBack}>{ar?'رجوع':'Back'}</Button><Button type="submit" variant="primary" disabled={!valid}>{editing?(ar?'حفظ التوقيت':'Save timeframe'):(ar?'إضافة الفيديو':'Add video')}</Button></footer>
   </form>
  </div>
 </section>
}
