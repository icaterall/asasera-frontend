import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { ActivityArt, MaterialArt } from '@/components/teacher/DashboardArt'
import { IllustratedActionCard, SectionHeader } from '@/components/teacher/DashboardCards'
import {
  EmptyState,
  Field,
  PrimaryButton,
  QuietButton,
  SourceSegments,
  inputClass,
} from '@/components/teaching/TeachingUI'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { teaching, type Course, type Material, type MaterialSegment } from '@/lib/api'

/**
 * Creating a lesson, with as few decisions as the record actually needs.
 *
 * TWO ENTRY POINTS, both of which end in a saved lesson. "From your material"
 * asks for a source and the pages it covers; "from scratch" asks for a name.
 * Neither asks for a class, a roster, a term, or anything from the profile —
 * the first useful outcome is a saved lesson tied to real material, and every
 * extra question is something between the teacher and that outcome.
 *
 * THE COURSE IS CREATED INLINE. A teacher with no courses types a name here
 * and a real course row is written as part of the same request. They are not
 * sent to a settings screen and back.
 *
 * NOTHING IS KEPT ONLY IN THE BROWSER. The moment the form is submitted the
 * lesson exists on the server; the editor it lands in autosaves from there.
 * There is no localStorage draft that a cleared cache would take with it.
 */
export default function NewLesson() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const toMessage = useApiErrorMessage()
  useDocumentTitle(t('teaching.create.title'))

  const [path, setPath] = useState<'choose' | 'material' | 'manual'>('choose')
  const [courses, setCourses] = useState<Course[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)

  const [materialId, setMaterialId] = useState<number | null>(null)
  const [segments, setSegments] = useState<MaterialSegment[]>([])
  const [revisionId, setRevisionId] = useState<number | null>(null)
  const [scope, setScope] = useState<number[]>([])

  const [title, setTitle] = useState('')
  const [courseId, setCourseId] = useState('')
  const [newCourseTitle, setNewCourseTitle] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([teaching.courses(), teaching.materials()])
      .then(([c, m]) => {
        setCourses(c.courses)
        /* Only sources a lesson can actually be built from. A failed
           extraction has no segments to scope, and offering it would lead to
           an empty picker with no explanation. */
        setMaterials(m.materials.filter((material) => material.extractionStatus === 'ready'))
        /* Suggest the most recent course rather than forcing a choice. */
        if (c.courses.length > 0) setCourseId(String(c.courses[0]!.id))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function pickMaterial(material: Material) {
    setMaterialId(material.id)
    setRevisionId(material.revisionId)
    setTitle((current) => current || material.title)
    if (material.revisionId) {
      const { segments: rows } = await teaching.segments(material.revisionId)
      setSegments(rows)
      setScope([])
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (busy) return
    if (path === 'material' && scope.length === 0) {
      setError(t('teaching.create.selectAtLeastOne'))
      return
    }
    setBusy(true)
    setError(null)
    try {
      const { lesson } = await teaching.createLesson({
        title: title.trim(),
        ...(courseId ? { course_id: Number(courseId) } : { new_course_title: newCourseTitle.trim() }),
        ...(path === 'material' && revisionId
          ? { material_revision_id: revisionId, scope_segments: scope }
          : {}),
      })
      /* `replace`, so Back from the editor does not return to a form that
         would create a second lesson. */
      navigate(`/teacher/lessons/${lesson.id}`, { replace: true })
    } catch (cause) {
      setError(toMessage(cause))
      setBusy(false)
    }
  }

  const canSubmit =
    title.trim().length > 0 && (courseId !== '' || newCourseTitle.trim().length > 0)

  if (path === 'choose') {
    return (
      <div className="mx-auto flex max-w-[1180px] flex-col gap-5">
        <SectionHeader level={1} title={t('teaching.create.title')} lead={t('teaching.create.lead')} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <IllustratedActionCard
            tone="sky"
            art={<MaterialArt />}
            title={t('teaching.create.fromMaterial')}
            body={t('teaching.create.fromMaterialBody')}
            action={t('teaching.common.open')}
            onClick={() => setPath('material')}
          />
          <IllustratedActionCard
            tone="teal"
            art={<ActivityArt />}
            title={t('teaching.create.manual')}
            body={t('teaching.create.manualBody')}
            action={t('teaching.common.open')}
            onClick={() => setPath('manual')}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-5">
      <SectionHeader
        level={1}
        title={t('teaching.create.title')}
        action={
          <QuietButton onClick={() => setPath('choose')}>{t('teaching.common.back')}</QuietButton>
        }
      />

      <form onSubmit={submit} className="flex flex-col gap-5">
        {path === 'material' ? (
          <section className="rounded-sm border border-line bg-surface p-5">
            <h2 className="text-sm font-bold text-fg">{t('teaching.create.stepSource')}</h2>

            {loading ? <p className="mt-2 text-sm text-muted">{t('teaching.common.loading')}</p> : null}

            {!loading && materials.length === 0 ? (
              <div className="mt-3">
                <EmptyState
                  art={<MaterialArt />}
                  title={t('teaching.create.noMaterials')}
                  body={t('teaching.materials.emptyBody')}
                  action={
                    <Link
                      to="/teacher/materials"
                      className="rounded-sm bg-brand-500 px-4 py-2.5 text-sm font-bold text-white"
                    >
                      {t('teaching.create.addMaterialFirst')}
                    </Link>
                  }
                />
              </div>
            ) : null}

            {materials.length > 0 ? (
              <ul className="mt-3 flex flex-wrap gap-2">
                {materials.map((material) => (
                  <li key={material.id}>
                    <button
                      type="button"
                      onClick={() => void pickMaterial(material)}
                      aria-pressed={materialId === material.id}
                      className="rounded-sm border px-3 py-2 text-sm font-semibold focus-visible:outline-3 focus-visible:outline-accent"
                      style={{
                        borderColor: materialId === material.id ? 'var(--tc-brand)' : 'var(--line)',
                        background:
                          materialId === material.id
                            ? 'color-mix(in oklab, var(--tc-brand) 8%, var(--surface))'
                            : 'var(--surface)',
                        color: 'var(--fg)',
                      }}
                    >
                      {material.title}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}

            {segments.length > 0 ? (
              <div className="mt-5">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-fg">{t('teaching.create.stepScope')}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted">
                      {t('teaching.create.selected', { count: scope.length })}
                    </span>
                    <QuietButton
                      type="button"
                      onClick={() => setScope(segments.map((s) => s.segmentIndex))}
                    >
                      {t('teaching.create.pickAll')}
                    </QuietButton>
                    <QuietButton type="button" onClick={() => setScope([])}>
                      {t('teaching.create.pickNone')}
                    </QuietButton>
                  </div>
                </div>
                <div className="max-h-[380px] overflow-y-auto pe-1">
                  <SourceSegments
                    segments={segments}
                    selected={scope}
                    onToggle={(index) =>
                      setScope((current) =>
                        current.includes(index)
                          ? current.filter((value) => value !== index)
                          : [...current, index].sort((a, b) => a - b),
                      )
                    }
                  />
                </div>
              </div>
            ) : null}
          </section>
        ) : null}

        <section className="grid grid-cols-1 gap-4 rounded-sm border border-line bg-surface p-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <h2 className="mb-2 text-sm font-bold text-fg">{t('teaching.create.stepDetails')}</h2>
          </div>

          <Field label={t('teaching.create.fieldTitle')} htmlFor="lesson-title" error={error}>
            <input
              id="lesson-title"
              className={inputClass}
              value={title}
              required
              maxLength={300}
              onChange={(event) => setTitle(event.target.value)}
            />
          </Field>

          <Field label={t('teaching.create.fieldCourse')} htmlFor="lesson-course">
            <select
              id="lesson-course"
              className={inputClass}
              value={courseId}
              onChange={(event) => setCourseId(event.target.value)}
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
              <option value="">{t('teaching.create.newCourse')}</option>
            </select>
          </Field>

          {/* Only when they chose to make one. A teacher with courses never
              sees this field. */}
          {courseId === '' ? (
            <div className="sm:col-span-2">
              <Field label={t('teaching.create.newCourseName')} htmlFor="new-course">
                <input
                  id="new-course"
                  className={inputClass}
                  value={newCourseTitle}
                  required
                  maxLength={200}
                  onChange={(event) => setNewCourseTitle(event.target.value)}
                />
              </Field>
            </div>
          ) : null}

          <div className="sm:col-span-2">
            <PrimaryButton type="submit" disabled={busy || !canSubmit}>
              {busy ? t('teaching.create.creating') : t('teaching.create.submit')}
            </PrimaryButton>
          </div>
        </section>
      </form>
    </div>
  )
}
