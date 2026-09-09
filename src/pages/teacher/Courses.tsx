import {AudienceFields} from '@/features/audience/AudienceFields'
import {useAudienceForm} from '@/features/audience/useAudienceForm'
import { Select } from '@/design'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { LibraryArt } from '@/components/teacher/DashboardArt'
import { SectionHeader } from '@/components/teacher/DashboardCards'
import {
  EmptyState,
  Field,
  PrimaryButton,
  QuietButton,
  SectionError,
  StatusPill,
  inputClass,
} from '@/components/teaching/TeachingUI'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { teaching, type Course } from '@/lib/api'

/** Courses share the activity audience references and support editing in place. */
export default function TeacherCourses() {
  const { t, i18n } = useTranslation()
  const ar=i18n.language.startsWith('ar')
  useDocumentTitle(t('teaching.courses.title'))

  const [courses, setCourses] = useState<Course[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [showArchived, setShowArchived] = useState(false)
  const [open, setOpen] = useState(false)
  const [editing,setEditing]=useState<Course|null>(null)

  const load = useCallback(async () => {
    try {
      const { courses: rows } = await teaching.courses({ includeArchived: showArchived })
      setCourses(rows)
      /* Cleared on success rather than before the request: resetting it up
         front is a synchronous setState inside the mount effect, and it also
         blanks a visible error for the whole round trip. */
      setFailed(false)
    } catch {
      setFailed(true)
    }
  }, [showArchived])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-5">
      <SectionHeader
        level={1}
        title={t('teaching.courses.title')}
        lead={t('teaching.courses.lead')}
        action={
          !open ? (
            <PrimaryButton onClick={() => {setEditing(null);setOpen(true)}}>
              {t('teaching.courses.newTitle')}
            </PrimaryButton>
          ) : undefined
        }
      />

      {open&&<CourseForm key={editing?.id??'new'} course={editing} onCancel={()=>setOpen(false)} onSaved={async()=>{setOpen(false);await load()}}/>}

      <label className="flex w-fit items-center gap-2 text-sm text-muted">
        <input
          type="checkbox"
          checked={showArchived}
          onChange={(event) => setShowArchived(event.target.checked)}
          className="size-4 accent-brand-500"
        />
        {t('teaching.courses.showArchived')}
      </label>

      {failed ? <SectionError onRetry={load} /> : null}

      {courses === null && !failed ? (
        <p className="text-sm text-muted">{t('teaching.common.loading')}</p>
      ) : null}

      {courses?.length === 0 ? (
        <EmptyState
          art={<LibraryArt />}
          title={t('teaching.courses.empty')}
          body={t('teaching.courses.emptyBody')}
          action={
            <PrimaryButton onClick={() => {setEditing(null);setOpen(true)}}>
              {t('teaching.courses.newTitle')}
            </PrimaryButton>
          }
        />
      ) : null}

      {courses && courses.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <li
              key={course.id}
              className="flex flex-col gap-2 rounded-sm border border-line bg-surface p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-[0.95rem] font-bold text-balance text-fg">{course.title}</h2>
                {course.archivedAt ? (
                  <StatusPill tone="neutral">{t('teaching.courses.archived')}</StatusPill>
                ) : null}
              </div>
              <p className="text-sm text-muted">
                {t('teaching.courses.counts', {
                  lessons: course.lessonCount ?? 0,
                  materials: course.materialCount ?? 0,
                })}
              </p>
              <div className="mt-1 flex flex-wrap gap-2">
                <QuietButton onClick={()=>{setEditing(course);setOpen(true);window.scrollTo({top:0,behavior:'instant'})}}>{ar?'تعديل التفاصيل والجمهور':'Edit details & audience'}</QuietButton>
                {course.archivedAt ? (
                  <QuietButton
                    onClick={async () => {
                      await teaching.restoreCourse(course.id)
                      await load()
                    }}
                  >
                    {t('teaching.courses.restore')}
                  </QuietButton>
                ) : (
                  <QuietButton
                    onClick={async () => {
                      await teaching.archiveCourse(course.id)
                      await load()
                    }}
                  >
                    {t('teaching.courses.archive')}
                  </QuietButton>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function CourseForm({course,onCancel,onSaved}:{course:Course|null;onCancel:()=>void;onSaved:()=>Promise<void>}) {
  const {t,i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),toMessage=useApiErrorMessage()
  const [title,setTitle]=useState(course?.title??''),[language,setLanguage]=useState(course?.contentLanguage??(ar?'ar':'en'))
  const [busy,setBusy]=useState(false),[error,setError]=useState<string|null>(null)
  const audience=useAudienceForm(course?{categoryId:course.categoryId,educationStageIds:course.educationStageIds??(course.educationStageId?[course.educationStageId]:[]),countryIds:course.countryIds??[]}:undefined)
  async function save(event:React.FormEvent) {
    event.preventDefault();if(busy||!audience.ready||!title.trim())return
    setBusy(true);setError(null)
    try{
      const input={title:title.trim(),content_language:language,category_id:audience.value.categoryId!,education_stage_ids:audience.value.educationStageIds,country_ids:audience.value.countryIds}
      if(course)await teaching.updateCourse(course.id,input);else await teaching.createCourse(input)
      await onSaved()
    }catch(cause){setError(toMessage(cause))}finally{setBusy(false)}
  }
  return <form onSubmit={save} className="flex flex-col gap-5 rounded-sm border border-line bg-surface p-5" aria-busy={busy}>
    <h2 className="text-lg font-bold">{course?(ar?'تعديل تفاصيل المقرر':'Edit course details'):t('teaching.courses.newTitle')}</h2>
    <fieldset disabled={busy} className="flex min-w-0 flex-col gap-5">
      <Field label={t('teaching.courses.fieldTitle')} htmlFor="course-title"><input id="course-title" className={inputClass} value={title} required maxLength={200} onChange={event=>setTitle(event.target.value)}/></Field>
      <Field label={t('teaching.courses.fieldLanguage')} htmlFor="course-language"><Select id="course-language" value={language} onValueChange={setLanguage}><option value="ar">{t('teaching.courses.languageAr')}</option><option value="en">{t('teaching.courses.languageEn')}</option></Select></Field>
      <AudienceFields form={audience} disabled={busy}/>
    </fieldset>
    {error&&<p role="alert">{error}</p>}
    <div className="flex flex-wrap gap-2"><PrimaryButton type="submit" disabled={busy||!title.trim()||!audience.ready}>{busy?t('teaching.common.saving'):course?(ar?'حفظ التغييرات':'Save changes'):t('teaching.common.create')}</PrimaryButton><QuietButton type="button" disabled={busy} onClick={onCancel}>{t('teaching.common.cancel')}</QuietButton></div>
  </form>
}
