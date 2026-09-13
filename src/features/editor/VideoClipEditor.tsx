import {useId,useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Button} from '@/design'
import {QuestionVideo} from '@/components/QuestionVideo'
import {formatVideoTime,parseVideoTime} from './video-time'
import styles from './VideoClipEditor.module.css'

export function VideoClipEditor({videoId,title,start=null,end=null,editing,onBack,onApply}:{
 videoId:string;title:string;start?:number|null;end?:number|null;editing:boolean
 onBack:()=>void;onApply:(start:number|null,end:number|null)=>void
}){
 const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),id=useId()
 const [from,setFrom]=useState(formatVideoTime(start??0)),[to,setTo]=useState(end==null?'':formatVideoTime(end))
 const [preview,setPreview]=useState({start,end,version:0})
 const first=parseVideoTime(from)??0,last=parseVideoTime(to)
 const valid=Number.isFinite(first)&&(last===null||(Number.isFinite(last)&&last>first))
 return <section className={styles.clip} aria-label={ar?'تحديد وقت الفيديو':'Video timeframe'}>
  <div className={styles.intro}><h3>{ar?'اختر الجزء الذي سيشاهده المتعلم':'Choose the part learners will watch'}</h3>
   <p dir="auto">{title}</p></div>
  <QuestionVideo key={preview.version} videoId={videoId} title={ar?'معاينة مقطع الفيديو':'Video clip preview'} start={preview.start} end={preview.end}/>
  <form onSubmit={event=>{event.preventDefault();if(valid)onApply(first||null,last)}}>
   <div className={styles.times}>
    <label>{ar?'بداية الفيديو':'Start video at'}<input autoFocus dir="ltr" value={from} maxLength={12} aria-invalid={!valid||undefined} aria-describedby={`${id}-help ${id}-error`} onChange={e=>setFrom(e.target.value)} placeholder="00:00"/></label>
    <label>{ar?'نهاية الفيديو':'End video at'}<input dir="ltr" value={to} maxLength={12} aria-invalid={!valid||undefined} aria-describedby={`${id}-help ${id}-error`} onChange={e=>setTo(e.target.value)} placeholder={ar?'نهاية المقطع':'End of video'}/></label>
   </div>
   <p id={`${id}-help`} className={styles.help}>{ar?'اكتب دقائق:ثوانٍ أو ساعات:دقائق:ثوانٍ. اترك النهاية فارغة لعرض بقية الفيديو.':'Use minutes:seconds or hours:minutes:seconds. Leave the end blank to play the rest of the video.'}</p>
   <p id={`${id}-error`} role={!valid?'alert':undefined} className={styles.error}>{!valid?(ar?'أدخل وقتًا صحيحًا خلال 24 ساعة، واجعل النهاية بعد البداية.':'Enter valid times within 24 hours, with the end later than the start.'):null}</p>
   <div className={styles.previewRow}><Button type="button" disabled={!valid} onClick={()=>setPreview({start:first,end:last,version:preview.version+1})}>{ar?'معاينة هذا الجزء':'Preview clip'}</Button>
    {valid&&<span dir="auto">{last===null?(ar?'حتى نهاية الفيديو':'Plays to the end'):`${ar?'مدة المقطع:':'Clip length:'} ${formatVideoTime(last-first)}`}</span>}</div>
   <footer><Button type="button" onClick={onBack}>{ar?'رجوع':'Back'}</Button><Button type="submit" variant="primary" disabled={!valid}>{editing?(ar?'حفظ التوقيت':'Save timeframe'):(ar?'إضافة الفيديو':'Add video')}</Button></footer>
  </form>
 </section>
}
