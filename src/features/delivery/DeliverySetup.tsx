import {useState} from 'react'
import {Link,useNavigate,useParams} from 'react-router-dom'
import {useQuery} from '@tanstack/react-query'
import {useTranslation} from 'react-i18next'
import {Radio,BookOpen,Clock,Copy,Check} from 'lucide-react'
import {api} from '@/lib/api'
import {Button,LoadingState,FailureState} from '@/design'
import styles from './Delivery.module.css'
export const assignmentUrl=(id:string,accessToken:string)=>`${location.origin}/learn/${id}#${accessToken}`
export default function DeliverySetup(){
 const {id}=useParams(),navigate=useNavigate(),{i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),t=(a:string,e:string)=>ar?a:e
 const [mode,setMode]=useState<'live'|'homework'|'study'>('live'),[feedback,setFeedback]=useState('after_deadline'),[classId,setClassId]=useState<number|null>(null)
 const [deadline,setDeadline]=useState(()=>{const d=new Date(Date.now()+7*86400000);d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,16)})
 const [requestId,setRequestId]=useState(()=>crypto.randomUUID()),[busy,setBusy]=useState(false),[error,setError]=useState(''),[link,setLink]=useState(''),[copied,setCopied]=useState(false)
 const preview=useQuery({queryKey:['play-preview',id],queryFn:()=>api.get<{title:string;questions:unknown[]}>(`/api/v1/discovery/activities/${id}/preview`)})
 const classes=useQuery({queryKey:['teaching-classes'],queryFn:()=>api.get<{classes:{id:number;name:string}[]}>('/api/v1/discovery/classes')})
 const change=()=>{setRequestId(crypto.randomUUID());setLink('');setCopied(false)}
 const start=async()=>{if(mode==='live'){navigate(`/teacher/live/new?activityId=${id}&request=${requestId}`);return}setBusy(true);setError('');try{const r=await api.post<{id:string;accessToken:string}>('/api/v1/delivery/assignments',{activityId:Number(id),mode,deadline:new Date(deadline).toISOString(),feedback,classId,requestId});setLink(assignmentUrl(r.id,r.accessToken))}catch(e){setError(e instanceof Error?e.message:t('تعذّر إنشاء الرابط','Could not create the link'))}finally{setBusy(false)}}
 return <main className={`asas ${styles.setup}`} dir={ar?'rtl':'ltr'}>
  <Link to="/teacher/activities">← {t('أنشطتي','My activities')}</Link>
  {preview.isPending?<LoadingState/>:preview.error?<FailureState title={t('النشاط غير متاح','Activity unavailable')} body={preview.error.message} actions={<Button onClick={()=>void preview.refetch()}>{t('أعد المحاولة','Retry')}</Button>}/>:<>
   <header><h1>{preview.data.title}</h1><p>{preview.data.questions.length} {t('أسئلة في النسخة المعتمدة','questions in the approved version')}</p><h2>{t('كيف تريد تقديم النشاط؟','How would you like to play?')}</h2></header>
   <fieldset className={styles.modes} disabled={busy||!!link}><legend className="sr-only">{t('طريقة اللعب','Play mode')}</legend>
    {([{key:'live',icon:Radio,a:'حصة مباشرة',e:'Live game',body:t('قد الحصة، وانضم الطلاب برمز اللعبة.','Host together. Students join with a game PIN.')},{key:'homework',icon:Clock,a:'واجب',e:'Assign homework',body:t('موعد نهائي واضح. يتحكم المعلم بوقت ظهور الإجابات.','Set a deadline and choose when answers become visible.')},{key:'study',icon:BookOpen,a:'تعلّم ذاتي',e:'Self-study',body:t('تدريب بالسرعة المناسبة للطالب مع تغذية راجعة.','Let learners practice at their own pace with feedback.')} ] as const).map(m=><label key={m.key} className={styles.mode} data-selected={mode===m.key}><input type="radio" name="mode" checked={mode===m.key} onChange={()=>{setMode(m.key);setFeedback(m.key==='study'?'immediate':'after_deadline');change()}}/><m.icon size={32}/><strong>{t(m.a,m.e)}</strong><span>{m.body}</span></label>)}
   </fieldset>
   {mode!=='live'&&<fieldset className={styles.settings} disabled={busy||!!link}>
    <legend>{t('إعدادات المشاركة','Assignment settings')}</legend>
    <label>{t('الموعد النهائي بالتوقيت المحلي','Deadline in your local time')}<input type="datetime-local" value={deadline} required onChange={e=>{setDeadline(e.target.value);change()}}/></label>
    <label>{t('عرض الإجابات الصحيحة','Show correct answers')}<select value={feedback} onChange={e=>{setFeedback(e.target.value);change()}}>{mode==='study'&&<option value="immediate">{t('بعد كل إجابة','After each answer')}</option>}<option value="after_submission">{t('بعد تسليم النشاط كاملًا','After submitting the whole activity')}</option><option value="after_deadline">{t('بعد انتهاء الموعد','After the deadline')}</option></select></label>
    <label>{t('الصف','Class')}<select value={classId??''} onChange={e=>{setClassId(Number(e.target.value)||null);change()}}><option value="">{t('دون صف محفوظ','No saved class')}</option>{classes.data?.classes.map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select></label>
    <p>{t('يُحفظ التقدّم في المتصفح نفسه. تظهر النتائج في تقاريرك ولا تدخل ترتيب الرف العام.','Progress resumes in the same browser. Results appear in your reports and do not affect public shelf rankings.')}</p>
   </fieldset>}
   {error&&<p role="alert">{error}</p>}
   {link?<section className={styles.share}><h2>{t('الرابط جاهز للمشاركة','Your link is ready to share')}</h2><p>{t('انسخه وشاركه مع الطلاب بالطريقة المعتادة.','Copy it and share it with your learners.')}</p><input readOnly aria-label={t('رابط النشاط','Assignment link')} value={link} dir="ltr" onFocus={e=>e.target.select()}/><Button variant="primary" onClick={()=>void navigator.clipboard.writeText(link).then(()=>setCopied(true)).catch(()=>setError(t('حدّد الرابط وانسخه يدويًا','Select the link and copy it manually')))}>{copied?<Check/>:<Copy/>}{copied?t('تم النسخ','Copied'):t('انسخ الرابط','Copy link')}</Button><Link to="/teacher/assignments">{t('متابعة الواجبات','Manage assignments')}</Link></section>:<Button variant="primary" loading={busy} disabled={mode!=='live'&&!deadline} onClick={()=>void start()}>{mode==='live'?t('ابدأ الحصة المباشرة','Start live game'):t('أنشئ رابط المشاركة','Create assignment link')}</Button>}
  </>}
 </main>
}
