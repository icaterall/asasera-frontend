import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { LibraryArt } from '@/components/teacher/DashboardArt'
import { SectionHeader } from '@/components/teacher/DashboardCards'
import {
  EmptyState,
  QuietButton,
  SectionError,
  StatusPill,
  inputClass,
} from '@/components/teaching/TeachingUI'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { teaching, type Course, type LessonSummary } from '@/lib/api'

/**
 * The lesson library: everything the teacher has prepared.
 *
 * Search, course filter and status come from the server rather than being
 * applied to a page of results in the browser — filtering client-side would
 * mean a search that only searches whatever happened to be on page one, which
 * is worse than no search because it looks like it worked.
 */
export default function TeacherLessons() {
  const { t } = useTranslation()
  useDocumentTitle(t('teaching.lessons.title'))

  const [lessons, setLessons] = useState<LessonSummary[] | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [failed, setFailed] = useState(false)
  const [q, setQ] = useState('')
  const [courseId, setCourseId] = useState('')
  const [status, setStatus] = useState('')

  const load = useCallback(async () => {
    try {
      const { lessons: rows } = await teaching.lessons({
        ...(q ? { q } : {}),
        ...(courseId ? { courseId: Number(courseId) } : {}),
        ...(status ? { status } : {}),
      })
      setLessons(rows)
      setFailed(false)
    } catch {
      setFailed(true)
    }
  }, [q, courseId, status])

  useEffect(() => {
    /* Debounced, so typing a query is one request rather than one per letter. */
    const timer = setTimeout(() => void load(), 250)
    return () => clearTimeout(timer)
  }, [load])

  useEffect(() => {
    teaching
      .courses()
      .then(({ courses: rows }) => setCourses(rows))
      .catch(() => {})
  }, [])

  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-5">
      <SectionHeader
        level={1}
        title={t('teaching.lessons.title')}
        lead={t('teaching.lessons.lead')}
        action={
          <Link
            to="/teacher/lessons/new"
            className="shrink-0 rounded-sm bg-brand-500 px-4 py-2.5 text-sm font-bold text-white focus-visible:outline-3 focus-visible:outline-accent focus-visible:outline-offset-2"
          >
            {t('teaching.lessons.newLesson')}
          </Link>
        }
      />

      <div className="flex flex-wrap gap-3">
        <input
          className={`${inputClass} max-w-[280px]`}
          placeholder={t('teaching.lessons.search')}
          value={q}
          onChange={(event) => setQ(event.target.value)}
          aria-label={t('teaching.lessons.search')}
        />
        <select
          className={`${inputClass} max-w-[220px]`}
          value={courseId}
          onChange={(event) => setCourseId(event.target.value)}
          aria-label={t('teaching.create.fieldCourse')}
        >
          <option value="">{t('teaching.lessons.allCourses')}</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
        <select
          className={`${inputClass} max-w-[180px]`}
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          aria-label={t('teaching.lessons.statusDraft')}
        >
          <option value="">{t('teaching.lessons.allCourses')}</option>
          <option value="draft">{t('teaching.lessons.statusDraft')}</option>
          <option value="approved">{t('teaching.lessons.statusApproved')}</option>
          <option value="archived">{t('teaching.lessons.statusArchived')}</option>
        </select>
      </div>

      {failed ? <SectionError onRetry={load} /> : null}
      {lessons === null && !failed ? (
        <p className="text-sm text-muted">{t('teaching.common.loading')}</p>
      ) : null}

      {lessons?.length === 0 ? (
        <EmptyState
          art={<LibraryArt />}
          title={t('teaching.lessons.empty')}
          body={t('teaching.lessons.emptyBody')}
          action={
            <Link
              to="/teacher/lessons/new"
              className="rounded-sm bg-brand-500 px-4 py-2.5 text-sm font-bold text-white"
            >
              {t('teaching.lessons.newLesson')}
            </Link>
          }
        />
      ) : null}

      {lessons && lessons.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {lessons.map((lesson) => (
            <li
              key={lesson.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-line bg-surface p-4"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-[0.95rem] font-bold text-fg">{lesson.title}</h2>
                  <StatusPill tone={lesson.status === 'approved' ? 'teal' : 'neutral'}>
                    {lesson.status === 'approved'
                      ? t('teaching.lessons.statusApproved')
                      : lesson.status === 'archived'
                        ? t('teaching.lessons.statusArchived')
                        : t('teaching.lessons.statusDraft')}
                  </StatusPill>
                </div>
                <p className="mt-0.5 text-sm text-muted">
                  {lesson.courseTitle}
                  {' · '}
                  {t('teaching.lessons.activities', { count: lesson.activityCount ?? 0 })}
                </p>
              </div>
              <Link to={`/teacher/lessons/${lesson.id}`}>
                <QuietButton>{t('teaching.lessons.continueEditing')}</QuietButton>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
