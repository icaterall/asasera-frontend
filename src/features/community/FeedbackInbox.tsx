import { useState } from 'react'
import { z } from 'zod'
import { useSessionDraft } from '@/features/editor/useSessionDraft'
import { draftKey } from '@/features/editor/session-drafts'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MessageSquare, Lightbulb, CheckCheck, Share2 } from 'lucide-react'
import { Button, FailureState, LoadingState, Select } from '@/design'
import { useAuth } from '@/hooks/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useOwnedActivities } from '@/features/teacher-home/useOwnedActivities'
import { community, type FeedbackStatus, type InboxItem } from './api'
import { Recommendations } from './Recommendations'
import styles from './Community.module.css'

const replySchema = z.object({status: z.enum(['open', 'reviewed', 'resolved']), response: z.string()})
type ReviewInEditor = (questionId: number | null) => void
export function InboxEntry({ item, onSaved, onReview, onRefresh }: { item: InboxItem; onSaved: () => void; onReview?: ReviewInEditor; onRefresh?: () => void }) {
  const { i18n } = useTranslation(), ar = i18n.language.startsWith('ar'), t = (a: string, e: string) => ar ? a : e
  const {user} = useAuth()
  const draft = useSessionDraft(draftKey(user?.id, `activity:${item.activityId}:reply:${item.kind}:${item.id}`), {status: item.status, response: item.response}, replySchema)
  const {status, response} = draft.value
  const setStatus = (status: FeedbackStatus) => draft.update(current => ({...current, status}))
  const setResponse = (response: string) => draft.update(current => ({...current, response}))
  const save = useMutation({ mutationFn: (snapshot: typeof draft.value) => community.respond(item, snapshot.status, snapshot.response), onSuccess: (_result, snapshot) => {draft.clear(snapshot); onSaved()} })
  const reasons: Record<string, string> = { incorrect_answer: t('إجابة تحتاج مراجعة', 'Check the answer'), unclear_wording: t('صياغة غير واضحة', 'Unclear wording'), inappropriate_content: t('محتوى غير مناسب', 'Inappropriate content'), technical_problem: t('مشكلة تقنية', 'Technical problem') }
  const statuses = { open: t('جديد', 'New'), reviewed: t('تمت المراجعة', 'Reviewed'), resolved: t('تمت المعالجة', 'Resolved') }
  return <article className={styles.inboxEntry}>
    <div className={styles.entryHeader}><h2 dir="auto">{item.activityTitle}</h2><span className={styles.status} data-status={item.status}>{statuses[item.status]}</span></div>
    <p className={styles.muted}><bdi>{item.reviewerName}</bdi> · <time dateTime={item.updatedAt}>{new Date(item.updatedAt).toLocaleDateString(ar ? 'ar' : 'en')}</time>{item.rating && ` · ${item.rating} / 5`}{item.recommend && ` · ${t('يوصي بالنشاط', 'Recommends this activity')}`}</p>
    {item.reason && <strong>{reasons[item.reason] ?? item.reason}</strong>}
    {item.strengths && <div className={styles.feedbackText}><h3>{t('ما أعجبه', 'What worked well')}</h3><p dir="auto">{item.strengths}</p></div>}
    {item.suggestion && <div className={styles.feedbackText}><h3>{t('اقتراح التحسين', 'Suggested improvement')}</h3><p dir="auto">{item.suggestion}</p></div>}
    <div className={styles.actions}>{onReview ? <Button onClick={() => onReview(item.questionId)}>{t('راجع النشاط وعدّله', 'Review and edit activity')}</Button> : <><Link to={`/teacher/activities/${item.activityId}${item.questionId ? `?question=${item.questionId}` : ''}`}>{t('راجع النشاط وعدّله', 'Review and edit activity')}</Link><Link to={`/teacher/reports/authors/${item.activityId}`}>{t('الدليل الصفّي', 'Classroom evidence')}</Link></>}</div>
    <details className={styles.respond}><summary>{t('الردّ وتحديث الحالة', 'Reply and update status')}</summary>
      <form onSubmit={e => { e.preventDefault(); if (!save.isPending) save.mutate(draft.value) }}>
        <label className={styles.field}>{t('ردّك للمعلّم (اختياري)', 'Your reply to the teacher (optional)')}<textarea dir="auto" rows={3} value={response} maxLength={2000} disabled={save.isPending} onChange={e => setResponse(e.target.value)} /></label>
        <label className={styles.field}>{t('حالة الملاحظة', 'Feedback status')}<Select value={status} disabled={save.isPending} onValueChange={v => setStatus(v as FeedbackStatus)}>{Object.entries(statuses).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</Select></label>
        <Button type="submit" variant="primary" loading={save.isPending}><CheckCheck size={18} aria-hidden="true" />{t('حفظ الردّ', 'Save response')}</Button>
        {draft.storageError && <p role="alert">{t('تعذّر الاحتفاظ بنسخة من الردّ في هذا المتصفح.', 'This browser could not keep a recovery copy of your reply.')}</p>}
        {save.error && <p role="alert">{save.error.message} <Button variant="quiet" onClick={onRefresh ?? onSaved}>{t('تحديث الملاحظات', 'Refresh feedback')}</Button></p>}
      </form>
    </details>
  </article>
}

export function ImprovementIdeas({ activityId, onReview }: { activityId: number; onReview?: ReviewInEditor }) {
  const { user } = useAuth(), { i18n } = useTranslation(), ar = i18n.language.startsWith('ar'), t = (a: string, e: string) => ar ? a : e
  const data = useQuery({ queryKey: ['community-insights', user?.id, activityId], queryFn: () => community.insights(activityId) })
  const copy: Record<string, [string, string]> = {
    too_easy: ['جرّب سؤال تطبيق أو تفسير، إذا كان هدفك تحدّيًا أعمق.', 'Consider an application or explanation question if your goal is a deeper challenge.'],
    needs_review: ['راجع صياغة السؤال ومفتاح الإجابة، وأضف مثالًا يوضّح الفكرة.', 'Check the wording and answer key, and consider adding a worked example.'],
    inactive_distractor: ['راجع الخيار الذي لم يُختر: هل يمثّل خطأً شائعًا فعلًا؟', 'Review the unused answer option: does it represent a plausible misconception?'],
  }
  return <section className={styles.insights}><div className={styles.sectionHeading}><Lightbulb size={24} aria-hidden="true" /><h2>{t('خطوتك التالية', 'Your next improvement')}</h2></div>
    {data.isPending ? <LoadingState rows={1} /> : data.error ? <div role="alert"><p>{t('تعذّر تحميل الدليل.', 'Evidence couldn’t load.')}</p><Button onClick={() => void data.refetch()}>{t('إعادة المحاولة', 'Try again')}</Button></div> : data.data.ideas.length ? <ul className={styles.ideaList}>{data.data.ideas.map(idea => <li key={`${idea.version}-${idea.questionId}`}>
      <strong>{t('السؤال', 'Question')} {idea.questionNumber} · {t('النسخة', 'Version')} {idea.version}</strong><p dir="auto">{idea.prompt}</p><p>{copy[idea.code]?.[ar ? 0 : 1]}</p>{onReview ? <Button onClick={() => onReview(idea.questionId)}>{t('راجع هذا السؤال', 'Review this question')}</Button> : <Link to={`/teacher/activities/${activityId}?question=${idea.questionId}`}>{t('راجع هذا السؤال', 'Review this question')}</Link>}
    </li>)}</ul> : <p>{data.data.status === 'aggregate' ? t('لم تظهر إشارة تستدعي تعديلًا محدّدًا. راجع ملاحظات المعلّمين قبل اختيار خطوتك التالية.', 'No specific revision signal has appeared. Read the teacher feedback before choosing your next change.') : t('شارك النشاط ليجرّبه معلّمون آخرون. تحتاج الاقتراحات الصفّية إلى دليل كافٍ من ثلاثة صفوف، مع استبعاد الصفوف الصغيرة.', 'Share the activity for other teachers to try. Classroom suggestions need enough evidence from three distinct classes, excluding small classes.')}</p>}
    <p className={styles.muted}>{t('هذه إشارات لمراجعة النشاط، وليست حكمًا على فهم الطالب. لا تُعرض بيانات الطلاب الفردية هنا.', 'These are signals for reviewing the activity, not judgments about a learner. Individual student data is not shown here.')}</p>
    {!onReview && <Link to={`/teacher/reports/authors/${activityId}`}>{t('فتح تقرير المؤلّف', 'Open author evidence')}</Link>}
  </section>
}

export default function FeedbackInbox() {
  const { user } = useAuth(), { i18n } = useTranslation(), ar = i18n.language.startsWith('ar'), t = (a: string, e: string) => ar ? a : e
  const [params, setParams] = useSearchParams(), activityId = params.get('activityId') ?? ''
  const [status, setStatus] = useState(''), [page, setPage] = useState(0), [notice, setNotice] = useState('')
  const owned = useOwnedActivities(), queries = useQueryClient()
  const data = useQuery({ queryKey: ['community-inbox', user?.id, activityId, status, page], queryFn: () => community.inbox(activityId, status, page) })
  const selected = owned.data?.activities.find(a => String(a.id) === activityId)
  useDocumentTitle(t('الملاحظات وأفكار التحسين', 'Feedback & ideas'))
  function saved() { setNotice(t('تم تحديث الملاحظات.', 'Feedback updated.')); void queries.invalidateQueries({ queryKey: ['community-inbox', user?.id] }) }
  return <div className={`asas ${styles.page}`}>
    <header className={styles.heading}><div className={styles.titleGroup}><MessageSquare size={36} aria-hidden="true" /><div><h1>{t('الملاحظات وأفكار التحسين', 'Feedback & ideas')}</h1><p>{t('استمع للمعلّمين، راجع الدليل، واجعل نشاطك أفضل مع كل حصة.', 'Listen to teachers, review the evidence, and improve your next class.')}</p></div></div><Link to="/teacher/activities">{t('أنشطتي', 'My activities')}</Link></header>
    <div className={styles.toolbar}><label className={styles.field}>{t('النشاط', 'Activity')}<Select value={activityId} onValueChange={value => { setParams(value ? { activityId: value } : {}); setPage(0); setNotice('') }}><option value="">{t('كل أنشطتي', 'All my activities')}</option>{owned.data?.activities.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}</Select></label>
      {selected?.visibility === 'published' && <Link className={styles.primaryLink} to={`/activities/${activityId}`}><Share2 size={18} aria-hidden="true" />{t('مشاركة النشاط', 'Share activity')}</Link>}
      {selected?.visibility === 'private' && <Link to={`/teacher/activities/${activityId}`}>{t('افتح المحرّر لنشر النشاط', 'Open the editor to publish this activity')}</Link>}
    </div>
    {owned.error && <p role="alert">{t('تعذّر تحميل قائمة الأنشطة.', 'The activity list couldn’t load.')} <Button onClick={() => void owned.refetch()}>{t('إعادة المحاولة', 'Try again')}</Button></p>}
    <div className={styles.filters} aria-label={t('تصفية الملاحظات', 'Filter feedback')}>{[['', t('الكل', 'All'), 'total'], ['open', t('جديد', 'New'), 'open'], ['reviewed', t('تمت المراجعة', 'Reviewed'), 'reviewed'], ['resolved', t('تمت المعالجة', 'Resolved'), 'resolved']].map(([value, label, count]) => <Button key={value} variant={status === value ? 'primary' : 'secondary'} aria-pressed={status === value} onClick={() => { setStatus(value!); setPage(0) }}>{label}{data.data && ` (${data.data.summary[count as 'total']})`}</Button>)}</div>
    {notice && <p role="status" className={styles.notice}>{notice}</p>}
    <div className={activityId ? styles.inboxLayout : ''}>
      <section aria-label={t('ملاحظات المعلّمين', 'Teacher feedback')}>
        {data.isPending ? <LoadingState rows={3} /> : data.error ? <FailureState title={t('تعذّر تحميل الملاحظات', 'Feedback couldn’t load')} actions={<Button onClick={() => void data.refetch()}>{t('إعادة المحاولة', 'Try again')}</Button>} /> : data.data.items.length ? <div className={styles.inboxList}>{data.data.items.map(item => <InboxEntry key={`${item.kind}-${item.id}-${item.revision}`} item={item} onSaved={saved} />)}</div> : <div className={styles.empty}><MessageSquare size={42} aria-hidden="true" /><h2>{status ? t('لا توجد ملاحظات بهذه الحالة', 'No feedback with this status') : t('تبدأ الأفكار بمشاركة نشاط', 'Good ideas start with a shared activity')}</h2><p>{status ? t('جرّب عرض كل الملاحظات.', 'Try showing all feedback.') : t('شارك رابط نشاطك المنشور مع معلّم آخر. ستجد تقييمه واقتراحاته وبلاغات الأسئلة هنا.', 'Share a published activity link with another teacher. Their reviews, suggestions and question reports will appear here.')}</p>{status ? <Button onClick={() => { setStatus(''); setPage(0) }}>{t('عرض الكل', 'Show all')}</Button> : <Link to={selected?.visibility === 'published' ? `/activities/${activityId}` : '/teacher/activities'}>{t('اختر نشاطًا لمشاركته', 'Choose an activity to share')}</Link>}</div>}
        {(page > 0 || data.data?.hasMore) && <nav className={styles.pagination} aria-label={t('صفحات الملاحظات', 'Feedback pages')}><Button disabled={page === 0 || data.isPending} onClick={() => setPage(p => p - 1)}>{t('السابق', 'Previous')}</Button><span>{page + 1}</span><Button disabled={!data.data?.hasMore || data.isPending} onClick={() => setPage(p => p + 1)}>{t('التالي', 'Next')}</Button></nav>}
      </section>
      {selected && <ImprovementIdeas activityId={selected.id} />}
    </div>
    <Recommendations activityId={selected?.id} compact />
  </div>
}
