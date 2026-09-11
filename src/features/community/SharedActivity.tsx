import {FormattedText} from '@/components/formatted-text/FormattedText'
import {BackLink} from '@/design/BackLink'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Copy, Share2, Play, MessageSquare, Star, ThumbsUp, BookOpen, Lock } from 'lucide-react'
import { api, ApiError, taxonomy, activities } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { Button, FailureState, LoadingState, Select } from '@/design'
import { QuestionInput } from '@/features/session/QuestionInput'
import { ThemeThumbnail } from '@/features/activity-themes/ActivityStage'
import { community } from './api'
import { FeedbackForm } from './FeedbackForm'
import { Recommendations } from './Recommendations'
import styles from './Community.module.css'

export default function SharedActivity() {
  const { id } = useParams()
  return <SharedActivityContent key={id} activityId={Number(id)} />
}

function SharedActivityContent({ activityId }: { activityId: number }) {
  const { user, status } = useAuth(), { i18n } = useTranslation()
  const ar = i18n.language.startsWith('ar'), t = (a: string, e: string) => ar ? a : e, navigate = useNavigate(), queries = useQueryClient()
  const [index, setIndex] = useState(0), [notice, setNotice] = useState(''), [purpose, setPurpose] = useState('')
  const [stopped, setStopped] = useState(false)
  const data = useQuery({ queryKey: ['shared-activity', activityId], queryFn: () => community.activity(activityId), retry: false })
  const context = useQuery({ queryKey: ['shared-activity-context', activityId, user?.id], queryFn: () => community.context(activityId), enabled: !!data.data && user?.role === 'teacher' })
  const purposes = useQuery({ queryKey: ['community-purposes'], queryFn: taxonomy.purposes, enabled: !!purpose || user?.role === 'teacher' })
  const copy = useMutation({ mutationFn: () => api.post<{ activity: { id: number } }>(`/api/v1/discovery/activities/${activityId}/fork`, { ...(purpose && data.data ? { destination: { subjectId: data.data.subjectId, levelId: data.data.levelId, purposeId: Number(purpose) } } : {}) }), onSuccess: r => { void queries.invalidateQueries({ queryKey: ['owned-activities', user?.id] }); navigate(`/teacher/activities/${r.activity.id}`) } })
  const stop = useMutation({ mutationFn: () => activities.unpublish(activityId), onSuccess: () => { setStopped(true); void queries.invalidateQueries({ queryKey: ['owned-activities', user?.id] }); void queries.invalidateQueries({ queryKey: ['shared-activity', activityId] }) } })
  useDocumentTitle(data.data?.title ?? t('نشاط مشترك', 'Shared activity'))
  function saved() { setNotice(t('تم حفظ التغيير.', 'Your change was saved.')); void queries.invalidateQueries({ queryKey: ['shared-activity', activityId] }); void queries.invalidateQueries({ queryKey: ['shared-activity-context', activityId, user?.id] }) }
  async function copyLink() {
    if (!data.data) return
    try { await navigator.clipboard.writeText(data.data.shareUrl); setNotice(t('تم نسخ رابط النشاط.', 'Activity link copied.')) }
    catch { setNotice(t('تعذّر النسخ التلقائي. حدّد الرابط وانسخه من الحقل.', 'Automatic copying is unavailable. Select and copy the link from the field.')) }
  }
  const a = data.data, question = a?.questions[Math.min(index, a.questions.length - 1)]
  return <div className={`asas ${styles.page}`}>
    {stopped ? <section className={styles.empty}><Lock size={40} aria-hidden="true" /><h1>{t('أصبح النشاط خاصًا', 'Your activity is now private')}</h1><p>{t('توقّف رابط المشاركة عن عرض النشاط. يمكنك إعادة نشره من المحرّر.', 'The shared link no longer displays this activity. You can publish it again from the editor.')}</p><Link to={`/teacher/activities/${activityId}`}>{t('فتح المحرّر', 'Open editor')}</Link></section> : data.isPending ? <LoadingState label={t('جارٍ فتح النشاط', 'Opening activity')} /> : data.error || !a ? <FailureState title={t('النشاط غير متاح', 'This activity isn’t available')} body={t('قد يكون صاحبه جعله خاصًا أو أزاله.', 'Its creator may have made it private or removed it.')} actions={<><Button onClick={() => void data.refetch()}>{t('إعادة المحاولة', 'Try again')}</Button><Link to={user?.role === 'teacher' ? '/teacher/discover' : '/'}>{t('العودة', 'Go back')}</Link></>} /> : <>
      <header className={styles.heading}><div><h1 dir="auto">{a.title}</h1><p>{t('بواسطة', 'By')} <bdi>{a.authorName}</bdi> · {a.questionCount} {t('أسئلة', 'questions')} · {t('النسخة', 'Version')} {a.version}</p></div><BackLink to={user?.role === 'teacher' ? '/teacher/activities' : '/'}>{t('العودة إلى مساحتك', 'Back to your workspace')}</BackLink></header>
      <div className={styles.activityLayout}>
        <section className={styles.preview} aria-label={t('معاينة الأسئلة', 'Question preview')}>
          <div className={styles.sectionHeading}><BookOpen size={22} aria-hidden="true" /><h2>{t('جرّب معاينة النشاط', 'Take a look inside')}</h2><span>{Math.min(index + 1, a.questionCount)} / {a.questionCount}</span></div>
          {question && <><h3 dir="auto" className={styles.questionTitle}><FormattedText text={question.prompt}/></h3><QuestionInput key={`${a.versionId}-${question.id}`} question={question} onAnswer={() => {}} preview /></>}
          <div className={styles.pagination}><Button disabled={index === 0} onClick={() => setIndex(i => i - 1)}>{t('السابق', 'Previous')}</Button><span>{t('معاينة فقط', 'Preview only')}</span><Button disabled={index >= a.questions.length - 1} onClick={() => setIndex(i => i + 1)}>{t('التالي', 'Next')}</Button></div>
        </section>
        <aside className={styles.sharing}>
          <ThemeThumbnail theme={a.theme} className={styles.cover} />
          <div className={styles.audience}>{a.audience.category && <strong>{ar ? a.audience.category.name_ar : a.audience.category.name_en}</strong>}<p>{a.audience.educationStages.map(s => ar ? s.name_ar : s.name_en).join(' · ')}</p><p>{a.audience.countries.length ? a.audience.countries.map(c => ar ? c.name_ar : c.name_en).join(' · ') : t('مناسب لأي دولة', 'Any country')}</p></div>
          <div className={styles.socialProof}>{a.summary.reviewCount ? <><span><Star size={18} aria-hidden="true" />{a.summary.averageRating} / 5 · {a.summary.reviewCount} {t('تقييمات', 'reviews')}</span><span><ThumbsUp size={18} aria-hidden="true" />{a.summary.recommendationCount} {t('توصيات من معلّمين', 'teacher recommendations')}</span></> : <p>{t('لم يتلقَّ تقييمًا من المعلّمين بعد.', 'No teacher reviews yet.')}</p>}</div>
          <label className={styles.field}>{t('رابط المشاركة', 'Share link')}<input dir="ltr" readOnly value={a.shareUrl} onFocus={e => e.currentTarget.select()} /></label>
          <Button full onClick={() => void copyLink()}><Share2 size={18} aria-hidden="true" />{t('نسخ الرابط', 'Copy link')}</Button>
          <p className={styles.muted}>{t('الرابط يعرض النسخة المنشورة فقط. لا يشارك ملفات المصدر.', 'This link shows the published version only. Source files stay private.')}</p>
          {status === 'loading' ? <LoadingState rows={1} /> : user?.role === 'teacher' ? <>
            <Link className={styles.primaryLink} to={`/teacher/activities/${activityId}/play`}><Play size={18} aria-hidden="true" />{t('تشغيل مع الصف', 'Play with your class')}</Link>
            <Button full loading={copy.isPending} onClick={() => copy.mutate()}><Copy size={18} aria-hidden="true" />{t('احفظ نسخة وعدّلها', 'Make an editable copy')}</Button>
            {copy.error instanceof ApiError && copy.error.code === 'choose_shelf' && <label className={styles.field}>{t('اختر غرضًا لنسختك', 'Choose a purpose for your copy')}<Select value={purpose} onValueChange={setPurpose}><option value="">{t('اختر الغرض', 'Choose a purpose')}</option>{purposes.data?.purposes.map(p => <option key={p.id} value={p.id}>{ar ? p.nameAr : p.nameEn}</option>)}</Select></label>}
            {copy.error && <p role="alert">{copy.error.message}</p>}
            {purposes.error && <Button onClick={() => void purposes.refetch()}>{t('إعادة تحميل الأغراض', 'Reload purposes')}</Button>}
            {context.data?.isAuthor && <Link to={`/teacher/feedback?activityId=${activityId}`}><MessageSquare size={18} aria-hidden="true" />{t('ملاحظات النشاط وأفكار التحسين', 'Activity feedback & improvement ideas')}</Link>}
            {context.data?.isAuthor && <Button variant="quiet" loading={stop.isPending} onClick={() => stop.mutate()}><Lock size={18} aria-hidden="true" />{t('إيقاف المشاركة وجعله خاصًا', 'Stop sharing and make private')}</Button>}
            {stop.error && <p role="alert">{stop.error.message}</p>}
          </> : !user ? <Link className={styles.primaryLink} to="/login" state={{ from: `/activities/${activityId}` }}>{t('سجّل الدخول لاستخدام النشاط', 'Sign in to use this activity')}</Link> : <p className={styles.muted}>{t('اطلب من معلّمك تشغيل النشاط أو إرسال رابط الواجب.', 'Ask your teacher to host this activity or share an assignment link.')}</p>}
        </aside>
      </div>
      {notice && <p className={styles.notice} role="status">{notice}</p>}
      {user?.role === 'teacher' && (context.isPending ? <LoadingState rows={1} /> : context.error ? <FailureState title={t('تعذّر تحميل ملاحظاتك', 'Your feedback couldn’t load')} actions={<Button onClick={() => void context.refetch()}>{t('إعادة المحاولة', 'Try again')}</Button>} /> : context.data && !context.data.isAuthor ? <FeedbackForm key={`${activityId}-${user.id}-${context.data.feedback?.revision ?? 0}`} activityId={activityId} versionId={a.versionId} initial={context.data.feedback} onSaved={saved} /> : <p className={styles.notice}>{t('هذا نشاطك. شارك الرابط مع المعلّمين، ثم تابع ملاحظاتهم في صندوق الملاحظات.', 'This is your activity. Share the link with other teachers, then follow their suggestions in your feedback inbox.')}</p>)}
      {!!context.data?.flags.length && <section className={styles.feedbackForm}><h2>{t('بلاغاتك عن الأسئلة', 'Your question reports')}</h2>{context.data.flags.map(flag => <div className={styles.reply} key={flag.id}><p>{({open:t('قيد المراجعة','Awaiting review'),reviewed:t('تمت المراجعة','Reviewed'),resolved:t('تمت المعالجة','Resolved')})[flag.status]}</p>{flag.note && <p dir="auto">{flag.note}</p>}{flag.response && <><h3>{t('ردّ صاحب النشاط', 'The creator’s reply')}</h3><p dir="auto">{flag.response}</p></>}</div>)}</section>}
      <Recommendations activityId={activityId} />
    </>}
  </div>
}
