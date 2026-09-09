import { useRef, useState, type FormEvent } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { activities, taxonomy } from '@/lib/api'
import { Button, FailureState, LoadingState, Select } from '@/design'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import styles from '@/features/teacher-home/TeacherHome.module.css'

export default function CreateActivity() {
  const { i18n } = useTranslation(), ar = i18n.language.startsWith('ar'), navigate = useNavigate(), client = useQueryClient()
  const [title, setTitle] = useState(''), [subject, setSubject] = useState(''), [level, setLevel] = useState(''), [purpose, setPurpose] = useState('2')
  const [error, setError] = useState(''), [busy, setBusy] = useState(false), submitting = useRef(false)
  const refs = useQuery({ queryKey: ['activity-creation-reference'], queryFn: async () => {
    const [subjects, levels, purposes] = await Promise.all([taxonomy.subjects(), taxonomy.levels(), taxonomy.purposes()])
    return { subjects: subjects.subjects, levels: levels.levels, purposes: purposes.purposes }
  } })
  useDocumentTitle(ar ? 'إنشاء نشاط' : 'Create activity')
  async function create(event: FormEvent) {
    event.preventDefault()
    if (submitting.current || !title.trim() || !subject || level === '') return
    submitting.current = true; setBusy(true); setError('')
    try {
      const { activity } = await activities.create({ title: title.trim(), subjectId: Number(subject), levelId: Number(level), purposeId: Number(purpose) })
      void client.invalidateQueries({ queryKey: ['owned-activities'] })
      navigate(`/teacher/activities/${activity.id}`)
    } catch (e) { setError(e instanceof Error ? e.message : (ar ? 'تعذّر إنشاء النشاط. حاول مرة أخرى.' : 'Your activity couldn’t be created. Please try again.')) }
    finally { submitting.current = false; setBusy(false) }
  }
  return <div className={`asas ${styles.page} ${styles.formPage}`}>
    <Link className={styles.backLink} to="/teacher/activities">{ar ? 'العودة إلى أنشطتي' : 'Back to my activities'}</Link>
    <header className={styles.welcome}><div><h1>{ar ? 'لنبدأ بفكرتك' : 'Start with your idea'}</h1><p>{ar ? 'سمِّ نشاطك وحدّد جمهوره. ستضيف الأسئلة وتختار طريقة اللعب بعد ذلك.' : 'Give your activity a name and choose who it’s for. You’ll add questions and choose how to play next.'}</p></div></header>
    {refs.isPending ? <LoadingState rows={3} label={ar ? 'جارٍ التحميل' : 'Loading subjects and stages'} /> : refs.error ? <FailureState title={ar ? 'تعذّر تحميل المواد والمراحل' : 'Subjects and stages couldn’t load'} body={ar ? 'حاول مرة أخرى للبدء.' : 'Try again to get started.'} actions={<Button onClick={() => void refs.refetch()}>{ar ? 'إعادة المحاولة' : 'Try again'}</Button>} /> : <form className={styles.createForm} onSubmit={create} aria-busy={busy}>
      <label className={styles.field}>{ar ? 'اسم النشاط' : 'Activity name'}<input autoFocus required maxLength={200} value={title} onChange={e => setTitle(e.target.value)} placeholder={ar ? 'مثلًا: مغامرة الكسور' : 'For example: The fractions adventure'} disabled={busy} /></label>
      <div className={styles.formPair}>
        <label className={styles.field}>{ar ? 'المادة' : 'Subject'}<Select required value={subject} onValueChange={e => setSubject(e)} disabled={busy}><option value="">{ar ? 'اختر المادة' : 'Choose a subject'}</option>{refs.data.subjects.map(s => <option key={s.id} value={s.id}>{ar ? s.nameAr : s.nameEn}</option>)}</Select></label>
        <label className={styles.field}>{ar ? 'المرحلة أو الصف' : 'Stage or grade'}<Select required value={level} onValueChange={e => setLevel(e)} disabled={busy}><option value="">{ar ? 'اختر المرحلة' : 'Choose a stage'}</option>{refs.data.levels.map(l => <option key={l.id} value={l.id}>{ar ? l.label.ar : l.label.en}</option>)}</Select></label>
      </div>
      <details><summary>{ar ? 'المزيد من الإعدادات' : 'More settings'}</summary><label className={styles.field}>{ar ? 'الغرض التعليمي' : 'Teaching purpose'}<Select value={purpose} onValueChange={e => setPurpose(e)} disabled={busy}>{refs.data.purposes.map(p => <option key={p.id} value={p.id}>{ar ? p.nameAr : p.nameEn}</option>)}</Select></label></details>
      {error && <p role="alert">{error}</p>}
      <div className={styles.formActions}><Button type="submit" variant="primary" loading={busy} disabled={!title.trim() || !subject || level === ''}>{ar ? 'متابعة إلى الأسئلة' : 'Continue to questions'}</Button><Link to="/teacher/activities">{ar ? 'إلغاء' : 'Cancel'}</Link></div>
    </form>}
  </div>
}
