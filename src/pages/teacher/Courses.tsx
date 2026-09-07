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
import { useReferenceList } from '@/hooks/useReferenceList'
import { reference, teaching, type Course } from '@/lib/api'

const loadCategories = (signal?: AbortSignal) => reference.categories(signal)

/**
 * The course list, and creating one without leaving the page.
 *
 * A COURSE IS A NAME, and the form says so by requiring nothing else. Subject
 * and stage come from the shared reference lists and are optional; there is no
 * institution, no department, no term, and no country, because none of them
 * was ever asked for and each one would be another thing standing between a
 * teacher and their first lesson.
 *
 * The inline form rather than a separate route: creating a course is a
 * ten-second act, and a page transition either side of it is most of the cost.
 */
export default function TeacherCourses() {
  const { t, i18n } = useTranslation()
  const toMessage = useApiErrorMessage()
  useDocumentTitle(t('teaching.courses.title'))

  const [courses, setCourses] = useState<Course[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [showArchived, setShowArchived] = useState(false)
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [language, setLanguage] = useState<'ar' | 'en'>('ar')
  const [categoryId, setCategoryId] = useState('')

  const categories = useReferenceList(loadCategories)

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

  async function create(event: React.FormEvent) {
    event.preventDefault()
    /* The guard, not the disabled attribute: a second submit can land before
       React has re-rendered the button. */
    if (busy) return
    setBusy(true)
    setFormError(null)
    try {
      await teaching.createCourse({
        title: title.trim(),
        content_language: language,
        ...(categoryId ? { category_id: Number(categoryId) } : {}),
      })
      setTitle('')
      setCategoryId('')
      setOpen(false)
      await load()
    } catch (cause) {
      setFormError(toMessage(cause))
    } finally {
      setBusy(false)
    }
  }

  const name = (option: { name_en: string; name_ar: string }) =>
    i18n.resolvedLanguage === 'en' ? option.name_en : option.name_ar

  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-5">
      <SectionHeader
        level={1}
        title={t('teaching.courses.title')}
        lead={t('teaching.courses.lead')}
        action={
          !open ? (
            <PrimaryButton onClick={() => setOpen(true)}>
              {t('teaching.courses.newTitle')}
            </PrimaryButton>
          ) : undefined
        }
      />

      {open ? (
        <form
          onSubmit={create}
          className="grid grid-cols-1 gap-4 rounded-sm border border-line bg-surface p-5 sm:grid-cols-3"
        >
          <div className="sm:col-span-3">
            <Field label={t('teaching.courses.fieldTitle')} htmlFor="course-title" error={formError}>
              <input
                id="course-title"
                className={inputClass}
                value={title}
                required
                maxLength={200}
                onChange={(event) => setTitle(event.target.value)}
              />
            </Field>
          </div>

          <Field label={t('teaching.courses.fieldLanguage')} htmlFor="course-language">
            <select
              id="course-language"
              className={inputClass}
              value={language}
              onChange={(event) => setLanguage(event.target.value as 'ar' | 'en')}
            >
              <option value="ar">{t('teaching.courses.languageAr')}</option>
              <option value="en">{t('teaching.courses.languageEn')}</option>
            </select>
          </Field>

          <Field
            label={t('teaching.courses.fieldCategory')}
            hint={t('teaching.common.optional')}
            htmlFor="course-category"
          >
            <select
              id="course-category"
              className={inputClass}
              value={categoryId}
              disabled={categories.loading || categories.failed}
              onChange={(event) => setCategoryId(event.target.value)}
            >
              <option value="">{t('teaching.common.none')}</option>
              {categories.options.map((option) => (
                <option key={option.id} value={option.id}>
                  {name(option)}
                </option>
              ))}
            </select>
          </Field>

          <div className="flex items-end gap-2">
            <PrimaryButton type="submit" disabled={busy || title.trim().length === 0}>
              {busy ? t('teaching.common.saving') : t('teaching.common.create')}
            </PrimaryButton>
            <QuietButton type="button" onClick={() => setOpen(false)}>
              {t('teaching.common.cancel')}
            </QuietButton>
          </div>

          {/* The reference list failing must not block creating a course: the
              subject is optional, so the form stays usable without it. */}
          {categories.failed ? (
            <div className="sm:col-span-3">
              <SectionError onRetry={categories.reload} />
            </div>
          ) : null}
        </form>
      ) : null}

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
            <PrimaryButton onClick={() => setOpen(true)}>
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
              <div className="mt-1 flex gap-2">
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
