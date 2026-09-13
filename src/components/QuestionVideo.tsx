import {useTranslation} from 'react-i18next'
import styles from './QuestionVideo.module.css'

/** Store only the video ID, never arbitrary iframe markup or an external URL. */
export function QuestionVideo({videoId,title,start,end,showLink=true}:{videoId?:string|null;title?:string;start?:number|null;end?:number|null;showLink?:boolean}){
 const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar')
 if(!videoId||!/^[A-Za-z0-9_-]{11}$/.test(videoId))return null
 const params=new URLSearchParams({rel:'0'})
 if(typeof start==='number'&&Number.isInteger(start)&&start>=0&&start<=86400)params.set('start',String(start))
 if(typeof end==='number'&&Number.isInteger(end)&&end>0&&end<=86400)params.set('end',String(end))
 return <figure className={styles.video} data-question-video="">
  <iframe key={videoId} src={`https://www.youtube-nocookie.com/embed/${videoId}?${params}`}
   title={title??(ar?'الفيديو المرفق':'Attached video')} allowFullScreen
   allow="encrypted-media; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin"/>
  {showLink&&<figcaption><a href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noopener noreferrer">{ar?'افتح في يوتيوب':'Open on YouTube'}</a></figcaption>}
 </figure>
}
