import {useTranslation} from 'react-i18next'
import {useEditorText} from './useEditorText'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button, Card, EmptyState, FailureState, Field, LoadingState } from '@/design'
import {
  activities,
  taxonomy,
  type ActivityRecord,
  type LevelRecord,
  type SubjectRecord,
} from '@/lib/api'

/**
 * The teacher's activities, and the one place a new one is created.
 *
 * §3's `one_shelf_only` means an activity cannot exist without exactly one of
 * a curriculum unit or a purpose. §12 says the creation UI collects that
 * «unobtrusively». So the choice is on this form, pre-selected to a sensible
 * purpose, and a teacher who ignores it still gets a valid activity — rather
 * than a wizard, or a row that is created invalid and repaired later.
 */
export default function ActivityList() {
  const t=useEditorText()
  const {i18n}=useTranslation()
  const ar=i18n.language.startsWith('ar')
  const navigate = useNavigate()
  const [list, setList] = useState<ActivityRecord[] | null>(null)
  const [subjects, setSubjects] = useState<SubjectRecord[]>([])
  const [purposes, setPurposes] = useState<SubjectRecord[]>([])
  const [levels, setLevels] = useState<LevelRecord[]>([])
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const [title, setTitle] = useState('')
  const [subjectId, setSubjectId] = useState<number | null>(null)
  const [levelId, setLevelId] = useState<number>(8)
  const [purposeId, setPurposeId] = useState<number>(2)

  const load = useCallback(async () => {
    try {
      const [a, s, p, l] = await Promise.all([
        activities.list(), taxonomy.subjects(), taxonomy.purposes(), taxonomy.levels('SA'),
      ])
      setList(a.activities)
      setSubjects(s.subjects)
      setPurposes(p.purposes)
      setLevels(l.levels)
      setSubjectId((current) => current ?? s.subjects[0]?.id ?? null)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : t("تعذّر التحميل"))
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const create = useCallback(async () => {
    if (!subjectId || title.trim().length === 0) return
    setCreating(true)
    try {
      const { activity } = await activities.create({
        title: title.trim(), subjectId, levelId, purposeId,
      })
      navigate(`/teacher/activities/${activity.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : t("تعذّر إنشاء النشاط"))
    } finally {
      setCreating(false)
    }
  }, [subjectId, title, levelId, purposeId, navigate])

  if (error && !list) {
    return (
      <div className="asas" style={{ padding: 'var(--s-6)' }}>
        <FailureState title={t("تعذّر التحميل")} body={error}
          actions={<Button variant="primary" onClick={() => void load()}>{t("أعد المحاولة")}</Button>} />
      </div>
    )
  }

  return (
    <div className="asas" style={{ padding: 'var(--s-6)', display: 'flex', flexDirection: 'column', gap: 'var(--s-5)' }}>
      <h1 style={{ fontSize: 'var(--f-hero)', margin: 0 }}>{t("الأنشطة")}</h1>

      <Card>
        <h2 style={{ fontSize: 'var(--f-heading)', marginTop: 0 }}>{t("نشاط جديد")}</h2>
        <div style={{ display: 'grid', gap: 'var(--s-3)', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', alignItems: 'end' }}>
          <Field label={t("العنوان")} value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder={t("مثال: جمع الكسور")} />

          <label style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
            <span style={{ fontSize: 'var(--f-small)', fontWeight: 500 }}>{t("المادة")}</span>
            <select style={{ minHeight: 'var(--h-control)', borderRadius: 'var(--r-control)', border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)', padding: '0 var(--s-3)', font: 'inherit' }}
              value={subjectId ?? ''} onChange={(e) => setSubjectId(Number(e.target.value))}>
              {subjects.map((s) => <option key={s.id} value={s.id}>{ar?s.nameAr:s.nameEn}</option>)}
            </select>
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
            <span style={{ fontSize: 'var(--f-small)', fontWeight: 500 }}>{t("المستوى")}</span>
            <select style={{ minHeight: 'var(--h-control)', borderRadius: 'var(--r-control)', border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)', padding: '0 var(--s-3)', font: 'inherit' }}
              value={levelId} onChange={(e) => setLevelId(Number(e.target.value))}>
              {levels.map((l) => <option key={l.id} value={l.id}>{ar?l.label.ar:l.label.en}</option>)}
            </select>
          </label>

          {/* The shelf. Pre-selected, so a teacher who does not care never has
              to think about it — but the row is still valid. */}
          <label style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
            <span style={{ fontSize: 'var(--f-small)', fontWeight: 500 }}>{t("الرفّ")}</span>
            <select style={{ minHeight: 'var(--h-control)', borderRadius: 'var(--r-control)', border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)', padding: '0 var(--s-3)', font: 'inherit' }}
              value={purposeId} onChange={(e) => setPurposeId(Number(e.target.value))}>
              {purposes.map((p) => <option key={p.id} value={p.id}>{ar?p.nameAr:p.nameEn}</option>)}
            </select>
          </label>

          <Button variant="primary" loading={creating} disabled={title.trim().length === 0}
            onClick={() => void create()}>
            {t("أنشئ وابدأ التأليف")}
          </Button>
        </div>
      </Card>

      {list === null ? <LoadingState rows={3} />
        : list.length === 0 ? (
          <EmptyState title={t("لا أنشطة بعد")} body={t("أنشئ نشاطك الأول من النموذج أعلاه.")} />
        ) : (
          <div style={{ display: 'grid', gap: 'var(--s-3)', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
            {list.map((activity) => (
              <Card key={activity.id} strip={activity.visibility === 'published' ? 'var(--evidence)' : 'var(--muted)'}>
                <strong style={{ display: 'block', marginBottom: 'var(--s-2)' }}>{activity.title}</strong>
                <span style={{ fontSize: 'var(--f-small)', color: 'var(--muted)' }}>
                  {activity.visibility === 'published' ? t("منشور") : t("مسوّدة")}
                </span>
                <div style={{ marginTop: 'var(--s-3)' }}>
                  <Button onClick={() => navigate(`/teacher/activities/${activity.id}`)}>{t("افتح المحرّر")}</Button>
                </div>
              </Card>
            ))}
          </div>
        )}
    </div>
  )
}
