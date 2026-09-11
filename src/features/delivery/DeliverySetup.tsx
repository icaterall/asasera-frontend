import {useMemo,useState,type ReactNode} from 'react'
import {Link,useNavigate,useParams,useSearchParams} from 'react-router-dom'
import {useQuery} from '@tanstack/react-query'
import {useTranslation} from 'react-i18next'
import {Radio,BookOpen,Clock,Copy,Check} from 'lucide-react'
import {api} from '@/lib/api'
import {Button,LoadingState,FailureState, Select } from '@/design'
import {GameModePicker} from '../games/GameModePicker'
import type {GameMode} from '@/shared/arcade'
import {deviceZone,describeInstant,resolveLocal,zoneOptions,type ZoneResolution} from './timezone'
import styles from './Delivery.module.css'
export const assignmentUrl=(id:string,accessToken:string)=>`${location.origin}/learn/${id}#${accessToken}`
export default function DeliverySetup(){
 const {id}=useParams(),navigate=useNavigate(),{i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),t=(a:string,e:string)=>ar?a:e
 const [params]=useSearchParams()
 /* v5 §08: the editor hands over the chosen path ("Start live" / "Assign as homework") in the URL. */
 const requested=params.get('mode'),initialMode=requested==='homework'||requested==='study'?requested:'live'
 const [gameMode,setGameMode]=useState<GameMode>('quiz')
 const [mode,setMode]=useState<'live'|'homework'|'study'>(initialMode),[feedback,setFeedback]=useState(initialMode==='study'?'immediate':'after_deadline'),[classId,setClassId]=useState<number|null>(null)
 const [deadline,setDeadline]=useState(()=>{const d=new Date(Date.now()+7*86400000);d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,16)})
 /* v5.1 C2: the teacher types a WALL-CLOCK time and names its zone; the server turns the pair into an
    instant. The zone starts as this device's, but it is an explicit field because the person setting
    the homework is not always in the same zone as the class. */
 const [tz,setTz]=useState(deviceZone()),[opensAt,setOpensAt]=useState(''),[maxAttempts,setMaxAttempts]=useState(1),[resolution,setResolution]=useState<ZoneResolution|''>('')
 const zones=useMemo(()=>zoneOptions(tz),[tz])
 const [requestId,setRequestId]=useState(()=>crypto.randomUUID()),[busy,setBusy]=useState(false),[error,setError]=useState(''),[link,setLink]=useState(''),[copied,setCopied]=useState(false)
 const [created,setCreated]=useState<{deadline:string;opensAt:string|null;deadlineTz:string;maxAttempts:number}|null>(null)
 const [serverEdge,setServerEdge]=useState<'ambiguous'|'nonexistent'|null>(null)
 const locale=ar?'ar':'en'
 const deadlineAt=resolveLocal(deadline,tz,resolution),opensAtAt=resolveLocal(opensAt,tz,resolution)
 /* The daylight-saving question is asked about the wall time itself, so the choice stays on screen
    after it is answered. `serverEdge` covers a server whose zone data disagrees with this browser's. */
 const raw=[resolveLocal(deadline,tz),resolveLocal(opensAt,tz)].find(r=>r.state==='ambiguous'||r.state==='nonexistent')
 const edgeState=raw?raw.state as 'ambiguous'|'nonexistent':serverEdge
 /* Only ever a preview. The server resolves these values again and is the one that decides. */
 const windowLine=(label:string,resolved:ReturnType<typeof resolveLocal>)=>{
  if(resolved.state!=='ok')return null
  const shown=describeInstant(resolved.instant,tz,locale)
  return <span key={label}>{label}: <bdi>{shown.zoned}</bdi>{shown.sameZone?null:<> · <bdi>{t(`${shown.device} بتوقيت جهازك`,`${shown.device} on this device`)}</bdi></>} · <bdi dir="auto">{shown.utc} UTC</bdi></span>
 }
 /* v5: approval is private. Read the owner's approved version first; a shared
    activity hosted by another teacher still comes through the library preview. */
 const preview=useQuery({queryKey:['play-preview',id],queryFn:async()=>{
  try{const own=await api.get<{title:string;questionCount:number;version:number}>(`/api/v1/activities/${id}/approved`);return {title:own.title,questions:Array.from({length:own.questionCount})}}
  catch(error){if((error as {status?:number}).status!==404)throw error;return api.get<{title:string;questions:unknown[]}>(`/api/v1/discovery/activities/${id}/preview`)}
 }})
 const classes=useQuery({queryKey:['teaching-classes'],queryFn:()=>api.get<{classes:{id:number;name:string}[]}>('/api/v1/discovery/classes')})
 const change=()=>{setRequestId(crypto.randomUUID());setLink('');setCopied(false);setCreated(null)}
 const start=async()=>{if(mode==='live'){navigate(`/teacher/live/new?activityId=${id}&request=${requestId}&gameMode=${gameMode}`);return}setBusy(true);setError('');try{
  const r=await api.post<{id:string;accessToken:string;deadline:string;opensAt:string|null;deadlineTz:string;maxAttempts:number}>('/api/v1/delivery/assignments',{activityId:Number(id),mode,gameMode:mode==='study'&&feedback==='immediate'?gameMode:'quiz',
   deadlineLocal:deadline.slice(0,16),...(opensAt?{opensAtLocal:opensAt.slice(0,16)}:{}),deadlineTz:tz,maxAttempts,...(resolution?{resolution}:{}),feedback,classId,requestId})
  setCreated(r);setServerEdge(null);setLink(assignmentUrl(r.id,r.accessToken))
 }catch(e){
  // The server owns the zone database; if it sees a DST edge this browser did not, ask the same question.
  const code=(e as {code?:string}).code
  if(code==='ambiguous_local_time'||code==='nonexistent_local_time')setServerEdge(code==='ambiguous_local_time'?'ambiguous':'nonexistent')
  setError(e instanceof Error?e.message:t('تعذّر إنشاء الرابط','Could not create the link'))
 }finally{setBusy(false)}}
 return <section className={`asas ${styles.setup}`} dir={ar?'rtl':'ltr'}>
  <Link to="/teacher/activities">← {t('أنشطتي','My activities')}</Link>
  {preview.isPending?<LoadingState/>:preview.error?<FailureState title={t('النشاط غير متاح','Activity unavailable')} body={preview.error.message} actions={<Button onClick={()=>void preview.refetch()}>{t('أعد المحاولة','Retry')}</Button>}/>:<>
   <header><h1>{preview.data.title}</h1><p>{preview.data.questions.length} {t('أسئلة في النسخة المعتمدة','questions in the approved version')}</p><h2>{t('كيف تريد تقديم النشاط؟','How would you like to play?')}</h2></header>
   <fieldset className={styles.modes} disabled={busy||!!link}><legend className="sr-only">{t('طريقة اللعب','Play mode')}</legend>
    {([{key:'live',icon:Radio,a:'حصة مباشرة',e:'Live game',body:t('قد الحصة، وانضم الطلاب برمز اللعبة.','Host together. Students join with a game PIN.')},{key:'homework',icon:Clock,a:'واجب',e:'Assign homework',body:t('موعد نهائي واضح. يتحكم المعلم بوقت ظهور الإجابات.','Set a deadline and choose when answers become visible.')},{key:'study',icon:BookOpen,a:'تعلّم ذاتي',e:'Self-study',body:t('تدريب بالسرعة المناسبة للطالب مع تغذية راجعة.','Let learners practice at their own pace with feedback.')} ] as const).map(m=><label key={m.key} className={styles.mode} data-selected={mode===m.key}><input type="radio" name="mode" checked={mode===m.key} onChange={()=>{setMode(m.key);setFeedback(m.key==='study'?'immediate':'after_deadline');change()}}/><m.icon size={32}/><strong>{t(m.a,m.e)}</strong><span>{m.body}</span></label>)}
   </fieldset>
   {/* The quiz is the default; arcade worlds stay available behind "Advanced" rather than as a required choice (v5 §07). */}
   {(mode==='live'||(mode==='study'&&feedback==='immediate'))&&<details open={gameMode!=='quiz'} style={{marginBlock:24}}><summary style={{cursor:'pointer',fontWeight:700,minHeight:44,display:'flex',alignItems:'center'}}>{t('متقدم: تجربة اللعب','Advanced: game experience')}{gameMode==='quiz'?` · ${t('المسابقة الكلاسيكية','Classic quiz')}`:''}</summary>
    <GameModePicker value={gameMode} onChange={value=>{setGameMode(value);change()}} disabled={busy||!!link}/>
    {gameMode!=='quiz'&&mode==='live'&&<p>{t('حتى 100 لاعب. كل سؤال يتبعه تحدٍّ قابل للعب. تبقى درجات التعلّم مستقلة عن نقاط اللعبة.','Up to 100 players. Each question unlocks a playable challenge. Learning marks stay separate from game points.')}</p>}
   </details>}
   {mode!=='live'&&<fieldset className={styles.settings} disabled={busy||!!link}>
    <legend>{t('إعدادات المشاركة','Assignment settings')}</legend>
    <label>{t('المنطقة الزمنية','Time zone')}<Select searchable disabled={busy||!!link} value={tz} onValueChange={value=>{setTz(value);setResolution('');change()}}>{zones.map(zone=><option value={zone} key={zone}>{zone.replace(/_/g,' ')}</option>)}</Select></label>
    <label>{t('يفتح في (اختياري)','Opens at (optional)')}<input type="datetime-local" value={opensAt} onChange={e=>{setOpensAt(e.target.value);setResolution('');change()}}/></label>
    <label>{t('الموعد النهائي','Deadline')}<input type="datetime-local" value={deadline} required onChange={e=>{setDeadline(e.target.value);setResolution('');change()}}/></label>
    <label>{t('عدد المحاولات المسموح بها','Attempts allowed')}<Select disabled={busy||!!link} value={maxAttempts} onValueChange={value=>{setMaxAttempts(Number(value));change()}}>{[1,2,3,4,5,6,7,8,9,10].map(n=><option value={n} key={n}>{n===1?t('محاولة واحدة','1 attempt'):t(`${n} محاولات`,`${n} attempts`)}</option>)}</Select></label>
    <label>{t('عرض الإجابات الصحيحة','Show correct answers')}<Select disabled={busy||!!link} value={feedback} onValueChange={e=>{setFeedback(e);change()}}>{mode==='study'&&<option value="immediate">{t('بعد كل إجابة','After each answer')}</option>}<option value="after_submission">{t('بعد تسليم النشاط كاملًا','After submitting the whole activity')}</option><option value="after_deadline">{t('بعد انتهاء الموعد','After the deadline')}</option></Select></label>
    <label>{t('الصف','Class')}<Select disabled={busy||!!link} value={classId??''} onValueChange={e=>{setClassId(Number(e)||null);change()}}><option value="">{t('دون صف محفوظ','No saved class')}</option>{classes.data?.classes.map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</Select></label>
    {/* The exact instants, so "17:00" is never read in the wrong zone. */}
    <p data-resolved-window="">{[windowLine(t('يفتح','Opens'),opensAtAt),windowLine(t('ينتهي','Closes'),deadlineAt)].filter(Boolean).reduce<ReactNode[]>((all,node,index)=>index?[...all,' — ',node]:[node],[])} · <bdi dir="ltr">{tz.replace(/_/g,' ')}</bdi></p>
    {edgeState&&<label data-dst-choice="">{edgeState==='nonexistent'?t('هذا الوقت لا وجود له في هذه المنطقة عند تقديم الساعة. اختر القراءة المقصودة.','This time is skipped in that zone when clocks go forward. Choose which reading you mean.'):t('هذا الوقت يتكرّر مرتين في هذه المنطقة عند تأخير الساعة. اختر المقصود.','This time happens twice in that zone when clocks go back. Choose which one you mean.')}
     <Select disabled={busy||!!link} value={resolution} onValueChange={value=>{setResolution(value as ZoneResolution);setLink('');setCopied(false);setCreated(null)}}><option value="">{t('اختر…','Choose…')}</option><option value="earlier">{t('الأبكر','The earlier one')}</option><option value="later">{t('الأحدث','The later one')}</option></Select></label>}
    <p>{t('يُحفظ التقدّم في المتصفح نفسه. تظهر النتائج في تقاريرك ولا تدخل ترتيب الرف العام.','Progress resumes in the same browser. Results appear in your reports and do not affect public shelf rankings.')}{maxAttempts>1?' '+t('تُحسب محاولات الضيف لكل متصفح — وهي هوية تخزين في المتصفح، لا شخص موثّق.','Guest attempts are counted per browser — that is a browser-storage identity, not a verified person.'):''}</p>
   </fieldset>}
   {error&&<p role="alert">{error}</p>}
   {link?<section className={styles.share}><h2>{t('الرابط جاهز للمشاركة','Your link is ready to share')}</h2><p>{t('انسخه وشاركه مع الطلاب بالطريقة المعتادة.','Copy it and share it with your learners.')}</p>
    {/* What the SERVER stored, not what the form guessed. */}
    {created&&<p data-created-window="">{[created.opensAt?windowLine(t('يفتح','Opens'),{state:'ok',instant:new Date(created.opensAt)}):null,windowLine(t('ينتهي','Closes'),{state:'ok',instant:new Date(created.deadline)})].filter(Boolean).reduce<ReactNode[]>((all,node,index)=>index?[...all,' — ',node]:[node],[])} · <bdi dir="ltr">{created.deadlineTz.replace(/_/g,' ')}</bdi> · {created.maxAttempts===1?t('محاولة واحدة','1 attempt'):t(`${created.maxAttempts} محاولات`,`${created.maxAttempts} attempts`)}</p>}
    <input readOnly aria-label={t('رابط النشاط','Assignment link')} value={link} dir="ltr" onFocus={e=>e.target.select()}/><Button variant="primary" onClick={()=>void navigator.clipboard.writeText(link).then(()=>setCopied(true)).catch(()=>setError(t('حدّد الرابط وانسخه يدويًا','Select the link and copy it manually')))}>{copied?<Check/>:<Copy/>}{copied?t('تم النسخ','Copied'):t('انسخ الرابط','Copy link')}</Button><Link to="/teacher/assignments">{t('متابعة الواجبات','Manage assignments')}</Link></section>:<Button variant="primary" loading={busy} disabled={mode!=='live'&&(!deadline||(!!edgeState&&!resolution))} onClick={()=>void start()}>{mode==='live'?t('ابدأ الحصة المباشرة','Start live game'):t('أنشئ رابط المشاركة','Create assignment link')}</Button>}
  </>}
 </section>
}
