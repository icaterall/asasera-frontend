import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/design'
import { activities, teaching, type Lesson } from '@/lib/api'
import { encodeGenerationDraft } from '@/features/editor/session-drafts'

/** Keep historic lesson results reviewable; all new paid work uses the shared
 * activity creator, its server policy, source scope and reviewed quote. */
export function GenerationPanel({lesson,onReview}:{lesson:Lesson;onReview:(jobId:number)=>void}) {
  const {t}=useTranslation('adminAi'),navigate=useNavigate()
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[previous,setPrevious]=useState<number|null>(null)
  const pending=useRef(false),created=useRef<number|null>(null)
  useEffect(()=>{
    let live=true
    void teaching.generationForLesson(lesson.id).then(({job})=>{
      if(live&&job?.state==='succeeded'&&!job.appliedToDraft)setPrevious(job.id)
    }).catch(()=>{})
    return()=>{live=false}
  },[lesson.id])
  async function openCreator() {
    if(pending.current)return
    pending.current=true;setBusy(true);setError('')
    try {
      if(!created.current)created.current=(await activities.create({title:lesson.title})).activity.id
      const revision=lesson.material?.revisionId
      const draft=encodeGenerationDraft({task:'questions',origin:revision?'file':'topic',
        ...(revision?{materialRevisionId:revision,segments:lesson.scopeSegments??[]}:{objective:lesson.objective||lesson.title}),
        language:lesson.contentLanguage==='ar'||lesson.contentLanguage==='en'?lesson.contentLanguage:undefined,count:5,kinds:['mcq','tf'],difficulty:'medium'})
      navigate(`/teacher/activities/${created.current}?generate=1&draft=${draft}`)
    } catch {setError(t('legacyFailed'))}
    finally {pending.current=false;setBusy(false)}
  }
  return <section className="p-5 text-fg">
    <p className="mb-5 leading-relaxed">{t('legacyLead')}</p>
    {error&&<p role="alert" className="mb-4">{error}</p>}
    <div className="flex flex-wrap gap-3"><Button variant="primary" loading={busy} onClick={()=>void openCreator()}>{t('legacyOpen')}</Button>
      {previous!==null&&<Button onClick={()=>onReview(previous)}>{t('legacyReview')}</Button>}
    </div>
  </section>
}
