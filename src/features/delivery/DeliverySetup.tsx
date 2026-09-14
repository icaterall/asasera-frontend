import {lazy,Suspense,useCallback,useMemo,useState,type ReactNode} from 'react'
import {Link,useNavigate,useParams,useSearchParams} from 'react-router-dom'
import {useQuery} from '@tanstack/react-query'
import {useTranslation} from 'react-i18next'
import {Copy,Check,Eye,Play} from 'lucide-react'
import {api} from '@/lib/api'
import {Button,LoadingState,FailureState, Select } from '@/design'
import {GameModePicker} from '../games/GameModePicker'
import type {GameMode} from '@/shared/arcade'
import type {PresentationSelection} from '@/shared/presentation'
import {PresentationPicker} from '../presentations/PresentationPicker'
import {LiveRulesSetup} from '../presentations/LiveRulesSetup'
import {liveRulesSchema} from '@/shared/live-rules'
import {deviceZone,describeInstant,resolveLocal,zoneOptions,type ZoneResolution} from './timezone'
import liveGameArt from '@/assets/images/presentation-modes/live-game.webp'
import homeworkArt from '@/assets/images/presentation-modes/assign-homework.webp'
import selfStudyArt from '@/assets/images/presentation-modes/self-study.webp'
import styles from './Delivery.module.css'
const PresentationPreview=lazy(()=>import('../presentations/PresentationPreview'))
const presentationNames:Record<string,[string,string]>={
 flashcards:['بطاقات المراجعة','Flashcards'],'question-wheel':['عجلة الأسئلة','Question wheel'],'random-cards':['بطاقات عشوائية','Random cards'],'open-box':['افتح الصندوق','Open the box'],'challenge-cards':['بطاقات التحدي','Challenge cards'],'class-competition':['مسابقة الصف','Class competition'],'match-up':['المطابقة','Match up'],memory:['الذاكرة','Memory'],'group-sort':['تصنيف المجموعات','Group sort'],sequence:['الترتيب','Sequence'],'sentence-completion':['إكمال الجملة','Complete the sentence'],
}
export const assignmentUrl=(id:string,accessToken:string)=>`${location.origin}/learn/${id}#${accessToken}`
export default function DeliverySetup(){
 const {id}=useParams(),navigate=useNavigate(),{i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),t=(a:string,e:string)=>ar?a:e
 const [params]=useSearchParams()
 /* v5 §08: the editor hands over the chosen path ("Start live" / "Assign as homework") in the URL. */
 const requested=params.get('mode'),initialMode=requested==='homework'||requested==='study'?requested:'live'
 const [gameMode,setGameMode]=useState<GameMode>('quiz')
 const [presentation,setPresentation]=useState<PresentationSelection|null>(null)
 const [presentationReady,setPresentationReady]=useState(true)
 const [previewOpen,setPreviewOpen]=useState(false)
 const [liveRules,setLiveRules]=useState(()=>liveRulesSchema.parse({}))
 const [mode,setMode]=useState<'live'|'homework'|'study'>(initialMode),[feedback,setFeedback]=useState(initialMode==='study'?'immediate':'after_deadline'),[classId,setClassId]=useState<number|null>(null)
 const [deadline,setDeadline]=useState(()=>{const d=new Date(Date.now()+7*86400000);d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,16)})
 /* v5.1 C2: the teacher types a WALL-CLOCK time and names its zone; the server turns the pair into an
    instant. The zone starts as this device's, but it is an explicit field because the person setting
    the homework is not always in the same zone as the class. */
 const [tz,setTz]=useState(deviceZone()),[opensAt,setOpensAt]=useState(''),[maxAttempts,setMaxAttempts]=useState(1),[resolution,setResolution]=useState<ZoneResolution|''>('')
 const zones=useMemo(()=>zoneOptions(tz),[tz])
 const [requestId,setRequestId]=useState(()=>crypto.randomUUID()),[busy,setBusy]=useState(false),[error,setError]=useState(''),[link,setLink]=useState(''),[copied,setCopied]=useState(false)
 const [created,setCreated]=useState<{deadline:string;opensAt:string|null;deadlineTz:string;maxAttempts:number}|null>(null)
 const choosePresentation=useCallback((value:PresentationSelection|null)=>{
  setPresentation(value);setPreviewOpen(false);setRequestId(crypto.randomUUID());setLink('');setCopied(false);setCreated(null)
  setLiveRules(previous=>value?.config.context==='teacher-led'?liveRulesSchema.parse({}):{...previous,bonus:{...previous.bonus,questionIds:previous.bonus.questionIds.filter(questionId=>value?.selectedQuestionIds.includes(questionId))}})
 },[])
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
 const start=async()=>{if((mode==='live'||mode==='study'&&feedback==='immediate')&&!presentationReady)return;if(mode==='live'){navigate(`/teacher/live/new?activityId=${id}&request=${requestId}&gameMode=${presentation?'quiz':gameMode}`,{state:presentation&&['live','teacher-led'].includes(presentation.config.context)?{presentation:{selection:presentation,rules:liveRules}}:null});return}setBusy(true);setError('');try{
  const r=await api.post<{id:string;accessToken:string;deadline:string;opensAt:string|null;deadlineTz:string;maxAttempts:number}>('/api/v1/delivery/assignments',{activityId:Number(id),mode,gameMode:mode==='study'&&feedback==='immediate'?gameMode:'quiz',
   deadlineLocal:deadline.slice(0,16),...(opensAt?{opensAtLocal:opensAt.slice(0,16)}:{}),deadlineTz:tz,maxAttempts,...(resolution?{resolution}:{}),feedback,classId,requestId,...(mode==='study'&&feedback==='immediate'&&presentation?{presentation,gameMode:'quiz'}:{})})
  setCreated(r);setServerEdge(null);setLink(assignmentUrl(r.id,r.accessToken))
 }catch(e){
  // The server owns the zone database; if it sees a DST edge this browser did not, ask the same question.
  const code=(e as {code?:string}).code
  if(code==='ambiguous_local_time'||code==='nonexistent_local_time')setServerEdge(code==='ambiguous_local_time'?'ambiguous':'nonexistent')
  setError(e instanceof Error?e.message:t('تعذّر إنشاء الرابط','Could not create the link'))
 }finally{setBusy(false)}}
 const deliveryModes=[
  {key:'live',art:liveGameArt,a:'حصة مباشرة',e:'Live game',body:t('قد الحصة، وانضم الطلاب برمز اللعبة.','Host together. Students join with a game PIN.')},
  {key:'homework',art:homeworkArt,a:'واجب',e:'Assign homework',body:t('موعد نهائي واضح. يتحكم المعلم بوقت ظهور الإجابات.','Set a deadline and choose when answers become visible.')},
  {key:'study',art:selfStudyArt,a:'تعلّم ذاتي',e:'Self-study',body:t('تدريب بالسرعة المناسبة للطالب مع تغذية راجعة.','Let learners practice at their own pace with feedback.')},
 ] as const
 const selectedMode=deliveryModes.find(item=>item.key===mode)!
 const selectedPresentation=presentation?presentationNames[presentation.definitionId]?.[ar?0:1]??t('عرض تفاعلي','Interactive presentation'):t('الأسئلة بالترتيب','Questions in order')
 return <section className={`asas ${styles.setup}`} dir={ar?'rtl':'ltr'}>
  <Link className={styles.backLink} to="/teacher/activities">← {t('أنشطتي','My activities')}</Link>
  {preview.isPending?<LoadingState/>:preview.error?<FailureState title={t('النشاط غير متاح','Activity unavailable')} body={preview.error.message} actions={<Button onClick={()=>void preview.refetch()}>{t('أعد المحاولة','Retry')}</Button>}/>:<>
   <header className={styles.activityHeader}>
    <div><h1>{preview.data.title}</h1><p>{t('اختر تجربة مناسبة لطلابك، ثم ابدأ عندما تكون مستعدًا.','Choose the experience that fits your learners, then launch when you are ready.')}</p></div>
    <div className={styles.questionCount} aria-label={`${preview.data.questions.length} ${t('أسئلة معتمدة','approved questions')}`}><strong>{preview.data.questions.length}</strong><span>{t('أسئلة معتمدة','Approved questions')}</span></div>
   </header>
   <div className={styles.sectionHeading}><span aria-hidden="true">1</span><div><h2>{t('كيف تريد تقديم النشاط؟','How would you like to play?')}</h2><p>{t('اختر طريقة واحدة. يمكنك العودة وتغييرها قبل البدء.','Choose one delivery mode. You can change it before launching.')}</p></div></div>
   <fieldset className={styles.modes} disabled={busy||!!link}><legend className="sr-only">{t('طريقة اللعب','Play mode')}</legend>
    {deliveryModes.map(m=><label key={m.key} className={styles.mode} data-mode={m.key} data-selected={mode===m.key}><input type="radio" name="mode" checked={mode===m.key} onChange={()=>{setMode(m.key);setFeedback(m.key==='study'?'immediate':'after_deadline');change()}}/><span className={styles.modeArtwork}><img src={m.art} alt="" width="256" height="256" draggable="false"/></span><span className={styles.modeCopy}><strong>{t(m.a,m.e)}</strong><span>{m.body}</span></span><span className={styles.selectionMark} aria-hidden="true"/></label>)}
   </fieldset>
   {(mode==='live'||mode==='study'&&feedback==='immediate')&&<PresentationPicker key={mode} activityId={Number(id)} context={mode==='live'?'live':'practice'} disabled={busy||!!link} onChange={choosePresentation} onReadyChange={setPresentationReady}/>}
   {mode==='live'&&presentationReady&&<div className={styles.sectionHeading}><span aria-hidden="true">3</span><div><h2>{t('راجع ثم ابدأ','Review and start')}</h2><p>{t('نشاطك جاهز بالإعدادات المقترحة. افتح الخيارات أدناه فقط إذا أردت تغييرها.','Your activity is ready with recommended settings. Open the options below only if you need to change them.')}</p></div></div>}
   {presentation&&presentationReady&&(mode==='live'||mode==='study'&&feedback==='immediate')&&<section className={styles.previewBar}><div><strong>{t('تحقق من المحتوى قبل البدء','Check the content before you start')}</strong><span>{t('راجع الأسئلة التي ستظهر للطلاب بهذا النمط.','See the questions learners will receive in this format.')}</span></div><Button icon={<Eye size={20}/>} aria-expanded={previewOpen} disabled={busy} onClick={()=>setPreviewOpen(value=>!value)}>{previewOpen?t('إغلاق المعاينة','Close preview'):t('معاينة الأسئلة','Preview questions')}</Button>{previewOpen&&<div className={styles.previewContent}><Suspense fallback={<LoadingState/>}><PresentationPreview activityId={Number(id)} selection={presentation}/></Suspense></div>}</section>}
   {mode==='live'&&presentation?.config.context==='live'&&<LiveRulesSetup activityId={Number(id)} selection={presentation} onSemantics={semantics=>{setPresentation({...presentation,config:{...presentation.config,semantics}});change()}} rules={liveRules} onChange={value=>{setLiveRules(value);change()}} disabled={busy}/>}
   {/* The quiz is the default; arcade worlds stay available behind "Advanced" rather than as a required choice (v5 §07). */}
   {((mode==='live'||mode==='study'&&feedback==='immediate')&&!presentation&&presentationReady)&&<details className={styles.advanced} open={gameMode!=='quiz'}><summary><span>{t('متقدم: تجربة اللعب','Advanced: game experience')}</span><em>{gameMode==='quiz'?t('المسابقة الكلاسيكية','Classic quiz'):t('عالم لعب','Game world')}</em></summary>
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
    <input readOnly aria-label={t('رابط النشاط','Assignment link')} value={link} dir="ltr" onFocus={e=>e.target.select()}/><Button variant="primary" onClick={()=>void navigator.clipboard.writeText(link).then(()=>setCopied(true)).catch(()=>setError(t('حدّد الرابط وانسخه يدويًا','Select the link and copy it manually')))}>{copied?<Check/>:<Copy/>}{copied?t('تم النسخ','Copied'):t('انسخ الرابط','Copy link')}</Button><Link to="/teacher/assignments">{t('متابعة الواجبات','Manage assignments')}</Link></section>:<footer className={styles.launchBar}><div><span>{t('جاهز للبدء','Ready to start')}</span><strong>{t(selectedMode.a,selectedMode.e)} · {selectedPresentation}</strong><small>{mode==='live'?t('سيفتح رمز انضمام الطلاب في الخطوة التالية.','A student join PIN will open next.'):t('راجع الجدول، ثم أنشئ رابط المشاركة.','Review the schedule, then create the share link.')}</small></div><Button icon={mode==='live'?<Play size={20}/>:undefined} variant="primary" loading={busy} disabled={mode==='live'?!presentationReady:!deadline||(!!edgeState&&!resolution)||mode==='study'&&feedback==='immediate'&&!presentationReady} onClick={()=>void start()}>{mode==='live'?t('ابدأ الحصة المباشرة','Start live game'):t('أنشئ رابط المشاركة','Create assignment link')}</Button></footer>}
  </>}
 </section>
}
