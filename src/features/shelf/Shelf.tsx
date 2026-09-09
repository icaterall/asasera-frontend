import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BookOpen, Compass, Copy, Play } from 'lucide-react'
import { api, taxonomy, ApiError } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { Button, LoadingState, FailureState, Dialog, Select } from '@/design'
import type { PublicQuestion } from '@/shared/session'
import { QuestionInput } from '@/features/session/QuestionInput'
import { ThemeThumbnail } from '../activity-themes/ActivityStage'
import { unitLabel, type CurriculumUnitLabel } from './unitLabel'
import base from '../teacher-home/TeacherHome.module.css'
import styles from './Shelf.module.css'

interface ShelfItem { id: number; title: string; theme: string; authorName: string; questionCount: number }
interface ShelfResult { cursor: string; activities: ShelfItem[]; ceiling: number; hasMore: boolean; neighbor: { levelId: number; count: number } | null }
interface Unit extends CurriculumUnitLabel { id: number; subjectId: number; levelId: number }
interface Preferences { subjectId: number; levelId: number; unitId: number | null }

export default function Shelf() {
  const { i18n } = useTranslation(), ar = i18n.language.startsWith('ar'), navigate = useNavigate(), { user } = useAuth()
  const t = (a: string, e: string) => ar ? a : e
  const [selection, setSelection] = useState<{ subjectId: number | null; levelId: number | null; unitId: number | null } | null>(null)
  const [page, setPage] = useState(0), [ceiling, setCeiling] = useState<number>(), [cursor, setCursor] = useState<string>()
  const [previewId, setPreviewId] = useState<number | null>(null), [index, setIndex] = useState(0), [notice, setNotice] = useState('')
  const [copyId, setCopyId] = useState<number | null>(null), [destination, setDestination] = useState('')
  useDocumentTitle(t('استكشاف الأنشطة', 'Explore activities'))
  const refs = useQuery({ queryKey: ['shelf-reference', user?.id], queryFn: async () => {
    const [subjects, levels, units, preferences, purposes] = await Promise.all([
      taxonomy.subjects(), taxonomy.levels(), api.get<{ units: Unit[] }>('/api/v1/discovery/units'),
      api.get<{ preferences: Preferences | null }>('/api/v1/discovery/preferences'), taxonomy.purposes(),
    ])
    return { subjects: subjects.subjects, levels: levels.levels, units: units.units, preferences: preferences.preferences, purposes: purposes.purposes }
  }, refetchOnWindowFocus: false })
  const subject = selection ? selection.subjectId : refs.data?.preferences?.subjectId ?? null
  const level = selection ? selection.levelId : refs.data?.preferences?.levelId ?? null
  const unit = selection ? selection.unitId : refs.data?.preferences?.unitId ?? null
  const data = useQuery({ queryKey: ['shelf', user?.id, subject, level, unit, page, ceiling, cursor], queryFn: () => api.get<ShelfResult>(`/api/v1/discovery/shelf?subjectId=${subject}&levelId=${level}&page=${page}${unit ? `&unitId=${unit}` : ''}${ceiling !== undefined ? `&ceiling=${ceiling}` : ''}${cursor ? `&cursor=${cursor}` : ''}`), enabled: !!subject && level !== null && !!refs.data })
  const save = useMutation({ mutationFn: (preferences: Preferences) => api.put('/api/v1/discovery/preferences', preferences) })
  const preview = useQuery({ queryKey: ['preview', previewId], queryFn: () => api.get<{ id: number; title: string; authorName: string; questions: PublicQuestion[] }>(`/api/v1/discovery/activities/${previewId}/preview`), enabled: previewId !== null })
  const copy = useMutation({ mutationFn: ({ id, placement }: { id: number; placement?: { subjectId: number; levelId: number; purposeId?: number; curriculumNodeId?: number } }) => api.post<{ activity: { id: number } }>(`/api/v1/discovery/activities/${id}/fork`, { destination: placement }), onSuccess: r => navigate(`/teacher/activities/${r.activity.id}`), onError: (error, variables) => {
    if (error instanceof ApiError && error.code === 'choose_shelf') { setPreviewId(null); setCopyId(variables.id); setDestination('') }
  } })
  function change(s: number | null, l: number | null, u: number | null = null) {
    setSelection({ subjectId: s, levelId: l, unitId: u }); setPage(0); setCeiling(undefined); setCursor(undefined); save.reset()
    if (s && l !== null) save.mutate({ subjectId: s, levelId: l, unitId: u })
  }
  function openPreview(id: number) { setPreviewId(id); setIndex(0); setNotice(''); copy.reset() }
  const units = refs.data?.units.filter(u => u.subjectId === subject && u.levelId === level) ?? []
  return <div className={`asas ${base.page} ${styles.catalog}`}>
    <header className={base.welcome}><div><h1>{t('استكشاف الأنشطة', 'Explore activities')}</h1><p>{t('أفكار يشاركها المعلّمون. عاين النشاط واحفظ نسخة لتجعلها مناسبة لطلابك.', 'Ideas shared by teachers. Preview an activity and make a copy for your class.')}</p></div></header>
    {refs.isPending ? <LoadingState label={t('جارٍ التحميل', 'Loading subjects and stages')} /> : refs.error ? <FailureState title={t('تعذّر تحميل خيارات البحث', 'Search options couldn’t load')} actions={<Button onClick={() => void refs.refetch()}>{t('إعادة المحاولة', 'Try again')}</Button>} /> : <>
      <div className={styles.filters}>
        <label className={base.field}>{t('المادة', 'Subject')}<Select value={subject ?? ''} onValueChange={e => change(e ? Number(e) : null, level)}><option value="">{t('اختر المادة', 'Choose a subject')}</option>{refs.data.subjects.map(s => <option key={s.id} value={s.id}>{ar ? s.nameAr : s.nameEn}</option>)}</Select></label>
        <label className={base.field}>{t('المرحلة أو الصف', 'Stage or grade')}<Select value={level ?? ''} onValueChange={e => change(subject, e === '' ? null : Number(e))}><option value="">{t('اختر المرحلة', 'Choose a stage')}</option>{refs.data.levels.map(l => <option key={l.id} value={l.id}>{ar ? l.label.ar : l.label.en}</option>)}</Select></label>
        {units.length > 0 && <label className={base.field}>{t('اعرض هذه الوحدة أولًا (اختياري)', 'Show this unit first (optional)')}<Select value={unit ?? ''} onValueChange={e => change(subject, level, e ? Number(e) : null)}><option value="">{t('دون أولوية', 'No preference')}</option>{units.map(u => <option key={u.id} value={u.id}>{unitLabel(u, i18n.language)}</option>)}</Select></label>}
      </div>
      {save.error && <p role="alert" className={styles.notice}>{t('تعمل التصفية، لكن تعذّر حفظ تفضيلاتك.', 'Your filters work, but your preferences couldn’t be saved.')} <Button variant="quiet" onClick={() => subject && level !== null && save.mutate({ subjectId: subject, levelId: level, unitId: unit })}>{t('إعادة المحاولة', 'Try again')}</Button></p>}
      {copy.error && copyId === null && <p role="alert">{copy.error.message}</p>}
      {!subject || level === null ? <div className={base.empty}><Compass size={40} aria-hidden="true" /><h2>{t('ماذا تدرّس اليوم؟', 'What are you teaching today?')}</h2><p>{t('اختر المادة والمرحلة للعثور على أفكار مناسبة.', 'Choose a subject and stage to find relevant ideas.')}</p></div> : data.isPending ? <LoadingState rows={4} label={t('جارٍ تحميل الأنشطة', 'Loading activities')} /> : data.error ? <FailureState title={t('تعذّر تحميل الأنشطة', 'Activities couldn’t load')} body={t('حاول تحديث النتائج.', 'Try refreshing the results.')} actions={<Button onClick={() => { setCursor(undefined); setCeiling(undefined); setPage(0); void data.refetch() }}>{t('إعادة المحاولة', 'Try again')}</Button>} /> : data.data.activities.length ? <>
        <div className={styles.grid}>{data.data.activities.map(a => <article className={styles.activity} key={a.id}>
          <button className={styles.cover} onClick={() => openPreview(a.id)} aria-label={`${t('معاينة', 'Preview')}: ${a.title}`}><ThemeThumbnail theme={a.theme} className={styles.coverImage} /><span>{a.questionCount} {ar ? (a.questionCount === 1 ? 'سؤال' : 'أسئلة') : (a.questionCount === 1 ? 'question' : 'questions')}</span></button>
          <div className={styles.cardBody}><h2 dir="auto">{a.title}</h2><p>{t('بواسطة', 'By')} <bdi>{a.authorName}</bdi></p><div className={styles.actions}><Button onClick={() => openPreview(a.id)}>{t('معاينة', 'Preview')}</Button><Button variant="primary" onClick={() => copy.mutate({ id: a.id })} disabled={copy.isPending}><Copy size={16} aria-hidden="true" />{t('احفظ نسخة', 'Make a copy')}</Button></div></div>
        </article>)}</div>
        {(page > 0 || data.data.hasMore) && <nav className={styles.pagination} aria-label={t('صفحات الأنشطة', 'Activity pages')}><Button disabled={page === 0} onClick={() => setPage(p => p - 1)}>{t('السابق', 'Previous')}</Button><span>{t('صفحة', 'Page')} {page + 1}</span><Button disabled={!data.data.hasMore} onClick={() => { setCeiling(data.data.ceiling); setCursor(data.data.cursor); setPage(p => p + 1) }}>{t('التالي', 'Next')}</Button></nav>}
      </> : <div className={base.empty}><BookOpen size={40} aria-hidden="true" /><h2>{t('لا توجد أنشطة مشتركة هنا بعد', 'Nothing shared here just yet')}</h2><p>{t('جرّب مادة أو مرحلة أخرى، أو أنشئ نشاطك الخاص.', 'Try another subject or stage, or create an activity of your own.')}</p><Link to="/teacher/activities/new">{t('إنشاء نشاط', 'Create activity')}</Link>{data.data.neighbor && <p><Button onClick={() => change(subject, data.data.neighbor!.levelId)}>{t('استكشف', 'Explore')} {refs.data.levels.find(l => l.id === data.data.neighbor!.levelId)?.label[ar ? 'ar' : 'en']}</Button></p>}</div>}
    </>}
    {copyId !== null && <Dialog open title={t('احفظ نسختك', 'Save your copy')} onClose={() => { setCopyId(null); copy.reset() }} actions={<Button onClick={() => { setCopyId(null); copy.reset() }}>{t('إلغاء', 'Cancel')}</Button>}>
      <p>{t('الوحدة الأصلية غير متاحة. اختر غرضًا تعليميًا أو وحدة لنسختك.', 'The original unit isn’t available. Choose a teaching purpose or a unit for your copy.')}</p>
      <label className={base.field}>{t('تنظيم النشاط', 'Organize your activity')}<Select value={destination} onValueChange={e => setDestination(e)}><option value="">{t('اختر وجهة', 'Choose a destination')}</option>{units.length > 0 && <optgroup label={t('وحدات المنهج', 'Curriculum units')}>{units.map(u => <option key={u.id} value={`unit:${u.id}`}>{unitLabel(u, i18n.language)}</option>)}</optgroup>}<optgroup label={t('الغرض التعليمي', 'Teaching purpose')}>{refs.data?.purposes.map(p => <option key={p.id} value={`purpose:${p.id}`}>{ar ? p.nameAr : p.nameEn}</option>)}</optgroup></Select></label>
      <Button variant="primary" disabled={!destination || !subject || level === null} loading={copy.isPending} onClick={() => { const [kind, id] = destination.split(':'); if (subject && level !== null) copy.mutate({ id: copyId, placement: { subjectId: subject, levelId: level, ...(kind === 'unit' ? { curriculumNodeId: Number(id) } : { purposeId: Number(id) }) } }) }}>{t('احفظ نسخة', 'Save copy')}</Button>
      {copy.error && !(copy.error instanceof ApiError && copy.error.code === 'choose_shelf') && <p role="alert">{copy.error.message}</p>}
    </Dialog>}
    {previewId !== null && <Dialog open title={preview.data?.title ?? t('معاينة', 'Preview')} onClose={() => setPreviewId(null)} actions={<div className={styles.actions}><Button onClick={() => setPreviewId(null)}>{t('إغلاق', 'Close')}</Button>{preview.data && <Button variant="primary" onClick={() => navigate(`/teacher/activities/${previewId}/play`)}><Play size={16} />{t('تشغيل النشاط', 'Play activity')}</Button>}</div>}>
      {preview.isPending ? <LoadingState label={t('جارٍ التحميل', 'Loading preview')} /> : preview.error ? <p role="alert">{preview.error.message}</p> : preview.data && <div className={styles.preview}>
        <p>{t('بواسطة', 'By')} <bdi>{preview.data.authorName}</bdi></p><h2 dir="auto">{preview.data.questions[index]?.prompt}</h2>
        {preview.data.questions[index] && <QuestionInput key={`${previewId}-${index}`} question={preview.data.questions[index]!} onAnswer={() => {}} preview />}
        <div className={styles.pagination}><Button disabled={index === 0} onClick={() => { setIndex(i => i - 1); setNotice('') }}>{t('السابق', 'Previous')}</Button><span>{index + 1} / {preview.data.questions.length}</span><Button disabled={index >= preview.data.questions.length - 1} onClick={() => { setIndex(i => i + 1); setNotice('') }}>{t('التالي', 'Next')}</Button></div>
        <details><summary>{t('الإبلاغ عن مشكلة', 'Report a problem')}</summary><label className={base.field}>{t('السبب', 'Reason')}<Select key={index} defaultValue="" onValueChange={e => { if (e && preview.data.questions[index]) void api.post(`/api/v1/discovery/activities/${previewId}/flag`, { questionId: preview.data.questions[index]!.id, reason: e }).then(() => setNotice(t('تم إرسال البلاغ.', 'Report sent.'))).catch(() => setNotice(t('تعذّر إرسال البلاغ. حاول مرة أخرى.', 'Your report couldn’t be sent. Please try again.'))) }}><option value="">{t('اختر السبب', 'Choose a reason')}</option><option value="incorrect_answer">{t('إجابة غير صحيحة', 'Incorrect answer')}</option><option value="unclear_wording">{t('صياغة غير واضحة', 'Unclear wording')}</option><option value="inappropriate_content">{t('محتوى غير مناسب', 'Inappropriate content')}</option><option value="technical_problem">{t('مشكلة تقنية', 'Technical problem')}</option></Select></label>{notice && <p role="status">{notice}</p>}</details>
      </div>}
    </Dialog>}
  </div>
}
