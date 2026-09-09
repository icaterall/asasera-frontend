import {useEffect, useId, useRef, useState} from 'react'
import {createPortal} from 'react-dom'
import {useQuery, useQueryClient} from '@tanstack/react-query'
import {useTranslation} from 'react-i18next'
import {MessageSquare, X} from 'lucide-react'
import {Button, FailureState, LoadingState} from '@/design'
import {useAuth} from '@/hooks/useAuth'
import {community} from './api'
import {InboxEntry, ImprovementIdeas} from './FeedbackInbox'
import styles from './Community.module.css'
import modal from './ActivityFeedbackModal.module.css'

export function ActivityFeedbackModal({activityId, title, onClose, onReview}: {
  activityId: number; title: string; onClose: () => void; onReview: (questionId: number | null) => Promise<void>
}) {
  const {user} = useAuth(), {i18n} = useTranslation(), ar = i18n.language.startsWith('ar')
  const t = (a: string, e: string) => ar ? a : e
  const dialog = useRef<HTMLDialogElement>(null), headingId = useId(), descriptionId = useId()
  const [status, setStatus] = useState(''), [page, setPage] = useState(0), [notice, setNotice] = useState(''), [error, setError] = useState('')
  const queries = useQueryClient()
  const data = useQuery({queryKey: ['community-inbox', user?.id, String(activityId), status, page], queryFn: () => community.inbox(String(activityId), status, page)})
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null, element = dialog.current
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    element?.showModal()
    element?.querySelector<HTMLButtonElement>('button')?.focus()
    return () => {element?.close(); document.body.style.overflow = overflow; previous?.focus()}
  }, [])
  function saved() {
    setNotice(t('تم حفظ الردّ.', 'Response saved.'))
    void queries.invalidateQueries({queryKey: ['community-inbox', user?.id]})
  }
  function review(questionId: number | null) {
    setError('')
    void onReview(questionId).catch(cause => setError(cause instanceof Error ? cause.message : t('تعذّر فتح السؤال.', 'Could not open this question.')))
  }
  const filters = [['', t('الكل', 'All'), 'total'], ['open', t('جديد', 'New'), 'open'], ['reviewed', t('تمت المراجعة', 'Reviewed'), 'reviewed'], ['resolved', t('تمت المعالجة', 'Resolved'), 'resolved']] as const
  return createPortal(<dialog ref={dialog} className={`asas ${modal.dialog}`} dir={ar ? 'rtl' : 'ltr'} aria-labelledby={headingId} aria-describedby={descriptionId} onCancel={event => {event.preventDefault(); onClose()}}>
    <header className={modal.header}>
      <div><MessageSquare size={26} aria-hidden="true"/><div><h2 id={headingId}>{t('الملاحظات وأفكار التحسين', 'Feedback & ideas')}</h2><p id={descriptionId} dir="auto">{title}</p></div></div>
      <Button variant="quiet" aria-label={t('إغلاق الملاحظات', 'Close feedback')} onClick={onClose}><X size={22} aria-hidden="true"/></Button>
    </header>
    <div className={modal.body}>
      <div className={styles.filters} aria-label={t('تصفية الملاحظات', 'Filter feedback')}>{filters.map(([value, label, count]) => <Button key={value} variant={status === value ? 'primary' : 'secondary'} aria-pressed={status === value} onClick={() => {setStatus(value); setPage(0); setNotice('')}}>{label}{data.data && ` (${data.data.summary[count]})`}</Button>)}</div>
      {notice && <p role="status" className={styles.notice}>{notice}</p>}
      {error && <p role="alert">{error}</p>}
      <div className={modal.columns}>
        <section aria-label={t('ملاحظات المعلّمين', 'Teacher feedback')}>
          {data.isPending ? <LoadingState rows={3}/> : data.error ? <FailureState title={t('تعذّر تحميل الملاحظات', 'Feedback couldn’t load')} actions={<Button onClick={() => void data.refetch()}>{t('إعادة المحاولة', 'Try again')}</Button>}/> : data.data.items.length ? <div className={styles.inboxList}>{data.data.items.map(item => <InboxEntry key={`${item.kind}-${item.id}-${item.revision}`} item={item} onSaved={saved} onReview={review} onRefresh={() => {setNotice(''); void data.refetch()}}/>)}</div> : <div className={styles.empty}><MessageSquare size={38} aria-hidden="true"/><h3>{status ? t('لا توجد ملاحظات بهذه الحالة', 'No feedback with this status') : t('لا توجد ملاحظات بعد', 'No feedback yet')}</h3><p>{status ? t('اختر «الكل» لعرض بقية الملاحظات.', 'Choose All to see the other feedback.') : t('بعد نشر النشاط ومشاركته، ستظهر هنا ملاحظات المعلّمين واقتراحاتهم.', 'After you publish and share this activity, teacher feedback and suggestions will appear here.')}</p></div>}
          {(page > 0 || data.data?.hasMore) && <nav className={styles.pagination} aria-label={t('صفحات الملاحظات', 'Feedback pages')}><Button disabled={page === 0 || data.isPending} onClick={() => setPage(p => p - 1)}>{t('السابق', 'Previous')}</Button><span>{page + 1}</span><Button disabled={!data.data?.hasMore || data.isPending} onClick={() => setPage(p => p + 1)}>{t('التالي', 'Next')}</Button></nav>}
        </section>
        <ImprovementIdeas activityId={activityId} onReview={review}/>
      </div>
    </div>
    <footer className={modal.footer}><Button variant="primary" onClick={onClose}>{t('العودة إلى نشاطي', 'Back to my activity')}</Button></footer>
  </dialog>, document.body)
}
