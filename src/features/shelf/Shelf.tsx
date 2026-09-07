import {useEffect,useState} from 'react'
import {useQuery,useMutation,useQueryClient} from '@tanstack/react-query'
import {Link,useNavigate} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {BookOpen,Play,Copy,Plus} from 'lucide-react'
import {api,taxonomy,ApiError} from '@/lib/api'
import {Button,LoadingState,FailureState,Dialog} from '@/design'
import type {PublicQuestion} from '@/shared/session'
import {QuestionInput} from '@/features/session/QuestionInput'
import styles from './Workspace.module.css'

interface ShelfItem{id:number;title:string;subjectId:number;levelId:number;theme:string;authorName:string;questionCount:number;reuseCount:number}
interface ShelfResult{cursor:string;activities:ShelfItem[];ceiling:number;hasMore:boolean;neighbor:{levelId:number;count:number}|null;alternatives:{id:number;title:string;levelId:number}[]}
export default function Shelf(){
  const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),navigate=useNavigate(),client=useQueryClient()
  const t=(a:string,e:string)=>ar?a:e
  const [subject,setSubject]=useState(1),[level,setLevel]=useState(8),[unit,setUnit]=useState<number|null>(null),[page,setPage]=useState(0),[ceiling,setCeiling]=useState<number>(),[cursor,setCursor]=useState<string>(),[previewId,setPreviewId]=useState<number|null>(null),[index,setIndex]=useState(0),[notice,setNotice]=useState('')
  const [copyId,setCopyId]=useState<number|null>(null),[destination,setDestination]=useState('')
  const refs=useQuery({queryKey:['shelf-reference'],queryFn:async()=>{const [subjects,levels,units,preferences,purposes]=await Promise.all([taxonomy.subjects(),taxonomy.levels('SA'),api.get<{units:{id:number;titleAr:string;titleEn:string;subjectId:number;levelId:number}[]}>('/api/v1/discovery/units'),api.get<{preferences:{subjectId:number;levelId:number;unitId:number|null}|null}>('/api/v1/discovery/preferences'),taxonomy.purposes()]);return {purposes:purposes.purposes,subjects:subjects.subjects,levels:levels.levels,units:units.units,preferences:preferences.preferences}}})
  useEffect(()=>{if(refs.data?.preferences){setSubject(refs.data.preferences.subjectId);setLevel(refs.data.preferences.levelId);setUnit(refs.data.preferences.unitId)}},[refs.data])
  const data=useQuery({queryKey:['shelf',subject,level,unit,page,ceiling,cursor],queryFn:()=>api.get<ShelfResult>(`/api/v1/discovery/shelf?subjectId=${subject}&levelId=${level}&page=${page}${unit?`&unitId=${unit}`:''}${ceiling!==undefined?`&ceiling=${ceiling}`:''}${cursor?`&cursor=${cursor}`:''}`),staleTime:0})
  const preview=useQuery({queryKey:['preview',previewId],queryFn:()=>api.get<{id:number;title:string;authorName:string;questions:PublicQuestion[]}>(`/api/v1/discovery/activities/${previewId}/preview`),enabled:previewId!==null})
  const copy=useMutation({mutationFn:({id,placement}:{id:number;placement?:{subjectId:number;levelId:number;purposeId?:number;curriculumNodeId?:number}})=>api.post<{activity:{id:number}}>(`/api/v1/discovery/activities/${id}/fork`,{destination:placement}),onSuccess:r=>navigate(`/teacher/activities/${r.activity.id}`),onError:(error,variables)=>{if(error instanceof ApiError&&error.code==='choose_shelf'){setCopyId(variables.id);setDestination('')}}})
  function change(s:number,l:number){setSubject(s);setLevel(l);setUnit(null);setPage(0);setCeiling(undefined);setCursor(undefined);void api.put('/api/v1/discovery/preferences',{subjectId:s,levelId:l}).catch(()=>setNotice(t('تعذّر حفظ تفضيلات الرف','Could not save shelf preferences')))}
  return <main className={`asas ${styles.workspace}`}>
    <header className={styles.heading}><div><h1>{t('جاهز لحصتك القادمة','Ready for your next class')}</h1><p>{t('أنشطة يشاركها المعلّمون، وفق مادتك ومستواك.','Teacher-shared activities for your subject and level.')}</p></div><Button variant="primary" onClick={()=>navigate('/teacher/activities')}><Plus size={20}/>{t('أنشئ نشاطًا','Create activity')}</Button></header>
    <div className={styles.filters}>
      <label>{t('المادة','Subject')}<select value={subject} onChange={e=>change(Number(e.target.value),level)}>{refs.data?.subjects.map(s=><option key={s.id} value={s.id}>{ar?s.nameAr:s.nameEn}</option>)}</select></label>
      <label>{t('المستوى','Level')}<select value={level} onChange={e=>change(subject,Number(e.target.value))}>{refs.data?.levels.map(l=><option key={l.id} value={l.id}>{ar?l.label.ar:l.label.en}</option>)}</select></label>
      <Link to="/teacher/activities">{t('أنشطتي','My activities')}</Link><Link to="/teacher/reports">{t('تقارير الحصص','Class reports')}</Link>
    </div>
    {!!refs.data?.units.filter(u=>u.subjectId===subject&&u.levelId===level).length&&<nav className={styles.units} aria-label={t('وحدات المنهج','Curriculum units')}>{refs.data.units.filter(u=>u.subjectId===subject&&u.levelId===level).map(u=><button key={u.id} aria-pressed={unit===u.id} onClick={()=>{const unitId=unit===u.id?null:u.id;setUnit(unitId);setPage(0);setCursor(undefined);setCeiling(undefined);void api.put('/api/v1/discovery/preferences',{subjectId:subject,levelId:level,unitId}).catch(()=>setNotice(t('تعذّر حفظ الوحدة','Could not save the unit')))}}>{ar?u.titleAr:u.titleEn||u.titleAr}</button>)}</nav>}
    {(notice||copy.error)&&<p role="alert">{notice||copy.error?.message}</p>}
    {data.isPending?<LoadingState rows={4}/>:data.error?<FailureState title={t('تعذّر تحميل الرف','Could not load the shelf')} body={data.error.message} actions={<Button onClick={()=>{setCursor(undefined);setCeiling(undefined);setPage(0);void data.refetch()}}>{t('أعد المحاولة','Retry')}</Button>}/>:data.data.activities.length?<>
      <div className={styles.activityGrid}>{data.data.activities.map(a=><article key={a.id} className={styles.activity}>
        <div className={styles.cover} data-theme={a.theme}><BookOpen size={40}/><span>{a.questionCount} {t('أسئلة','questions')}</span></div>
        <h2>{a.title}</h2><p>{a.authorName}</p><p>{a.reuseCount?t(`أُعيد استخدامه ${a.reuseCount} مرات`,`${a.reuseCount} eligible reuses`):t('نشاط جديد','New activity')}</p>
        <div className={styles.actions}><Button onClick={()=>{setPreviewId(a.id);setIndex(0)}}>{t('معاينة','Preview')}</Button><Button variant="primary" onClick={()=>navigate(`/teacher/activities/${a.id}/play`)}><Play size={18}/>{t('شغّل','Play')}</Button><Button variant="quiet" aria-label={t('نسخ النشاط','Copy activity')} onClick={()=>copy.mutate({id:a.id})} disabled={copy.isPending}><Copy size={18}/></Button></div>
      </article>)}</div>
      <div className={styles.actions}><Button disabled={page===0} onClick={()=>setPage(p=>p-1)}>{t('السابق','Previous')}</Button><span>{page+1}</span><Button disabled={!data.data.hasMore} onClick={()=>{setCeiling(data.data.ceiling);setCursor(data.data.cursor);setPage(p=>p+1)}}>{t('التالي','Next')}</Button></div>
    </>:<section className={styles.empty}><BookOpen size={48}/><h2>{t('هذا الرف ينتظر أول نشاط','This shelf is waiting for its first activity')}</h2>
      <div className={styles.emptyExits}><div><h3>{t('مستوى قريب','A neighboring level')}</h3>{data.data.neighbor?<Button onClick={()=>change(subject,data.data.neighbor!.levelId)}>{t(`استكشف المستوى ${data.data.neighbor.levelId}`,`Explore level ${data.data.neighbor.levelId}`)}</Button>:<p>{t('لا يوجد رف قريب منشور بعد.','No neighboring shelf has published content yet.')}</p>}</div>
      <div><h3>{t('أنشطة لأغراض مختلفة','Activities for other purposes')}</h3>{data.data.alternatives.length?data.data.alternatives.map(a=><button className={styles.textButton} key={a.id} onClick={()=>{setPreviewId(a.id);setIndex(0)}}>{a.title}</button>):<p>{t('ستظهر هنا الأنشطة المعتمدة عند نشرها.','Approved activities will appear here when published.')}</p>}</div>
      <div><h3>{t('ابدأ الرف','Start the shelf')}</h3><Button variant="primary" onClick={()=>navigate('/teacher/activities')}>{t('كن أول من يؤلّف هنا','Be the first to create here')}</Button></div></div>
    </section>}
    {copyId!==null&&<Dialog open title={t('اختر رفًا للنسخة','Choose a shelf for your copy')} onClose={()=>{setCopyId(null);copy.reset()}}>
      <p>{t('وحدة النشاط الأصلية خاصة بمؤلفه. احفظ نسختك في رف متاح لك.','The original curriculum unit belongs to its author. Save your copy in an available shelf.')}</p>
      <label>{t('رف النسخة','Copy destination')}<select value={destination} onChange={e=>setDestination(e.target.value)}><option value="">{t('اختر رفًا','Choose a shelf')}</option><optgroup label={t('وحدات المنهج','Curriculum units')}>{refs.data?.units.filter(u=>u.subjectId===subject&&u.levelId===level).map(u=><option key={u.id} value={`unit:${u.id}`}>{ar?u.titleAr:u.titleEn||u.titleAr}</option>)}</optgroup><optgroup label={t('الأغراض التعليمية','Teaching purposes')}>{refs.data?.purposes.map(p=><option key={p.id} value={`purpose:${p.id}`}>{ar?p.nameAr:p.nameEn}</option>)}</optgroup></select></label>
      <Button variant="primary" disabled={!destination||copy.isPending} onClick={()=>{const [kind,id]=destination.split(':');copy.mutate({id:copyId,placement:{subjectId:subject,levelId:level,...(kind==='unit'?{curriculumNodeId:Number(id)}:{purposeId:Number(id)})}})}}>{t('احفظ نسختي','Save my copy')}</Button>
      {copy.error&&!(copy.error instanceof ApiError&&copy.error.code==='choose_shelf')&&<p role="alert">{copy.error.message}</p>}
    </Dialog>}
    {previewId!==null&&<Dialog open title={preview.data?.title??t('معاينة','Preview')} onClose={()=>{setPreviewId(null);void client.invalidateQueries({queryKey:['shelf']})}}>
      {preview.isPending?<LoadingState/>:preview.error?<p role="alert">{preview.error.message}</p>:preview.data&&<div className={styles.preview}>
        <p>{t('بواسطة','By')} {preview.data.authorName}</p><h2>{preview.data.questions[index]?.prompt}</h2>
        {preview.data.questions[index]&&<QuestionInput key={index} question={preview.data.questions[index]!} onAnswer={()=>{}} preview/>}
        <div className={styles.actions}><Button disabled={index===0} onClick={()=>setIndex(i=>i-1)}>{t('السابق','Previous')}</Button><span>{index+1}/{preview.data.questions.length}</span><Button disabled={index===preview.data.questions.length-1} onClick={()=>setIndex(i=>i+1)}>{t('التالي','Next')}</Button></div>
        <label>{t('الإبلاغ عن السؤال','Flag this question')}<select defaultValue="" onChange={e=>{if(e.target.value)void api.post(`/api/v1/discovery/activities/${previewId}/flag`,{questionId:preview.data!.questions[index]!.id,reason:e.target.value}).then(()=>setNotice(t('تم تسجيل البلاغ','Flag recorded'))).catch(e=>setNotice(e.message))}}><option value="">{t('اختر السبب','Choose a reason')}</option><option value="incorrect_answer">{t('إجابة غير صحيحة','Incorrect answer')}</option><option value="unclear_wording">{t('صياغة غير واضحة','Unclear wording')}</option><option value="inappropriate_content">{t('محتوى غير مناسب','Inappropriate content')}</option><option value="technical_problem">{t('مشكلة تقنية','Technical problem')}</option></select></label>
      </div>}
    </Dialog>}
  </main>
}
