import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Compass, Disc3, Plus, ChartNoAxesCombined, FileText, Play, Layers, Sun, NotebookPen, LifeBuoy, Sparkles, Clock, Copy, X } from 'lucide-react'
import { type ActivityRecord, ApiError, activities } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { Button, FailureState, LoadingState } from '@/design'
import { ThemeThumbnail } from '@/features/activity-themes/ActivityStage'
import styles from './TeacherHome.module.css'
import home from './Dashboard.module.css'
import classroomImage from '@/assets/images/teacher-dashboard/classroom-studio.webp'
import classroomImageSmall from '@/assets/images/teacher-dashboard/classroom-studio-small.webp'
import { themeImage } from '@/features/activity-themes/catalog'
import { useOwnedActivities } from './useOwnedActivities'

export function ActivityRows({ items }: { items: ActivityRecord[] }) {
  const { i18n } = useTranslation(), ar = i18n.language.startsWith('ar')
  /* v5 §18: runnable/assignable means an APPROVED version exists (currentVersionId), not that the activity is public. */
  return <ul className={styles.activityList}>{items.map(activity => {
    const approved = activity.currentVersionId !== null, shared = activity.visibility === 'published'
    return <li className={styles.activityRow} key={activity.id}>
    <ThemeThumbnail theme={activity.theme} className={styles.thumbnail} />
    <div className={styles.activityInfo}>
      <Link className={styles.activityTitle} dir="auto" to={`/teacher/activities/${activity.id}`}>{activity.title}</Link>
      <div className={styles.metadata}>
        <span className={styles.status} data-published={approved}>{shared ? (ar ? 'مُشارَك في المكتبة' : 'Shared') : approved ? (ar ? 'معتمد' : 'Approved') : (ar ? 'مسودة' : 'Draft')}</span>
        <span>{ar ? 'آخر تعديل' : 'Edited'} <time dateTime={activity.updatedAt}>{new Intl.DateTimeFormat(ar ? 'ar' : 'en', { day: 'numeric', month: 'short' }).format(new Date(activity.updatedAt))}</time></span>
      </div>
    </div>
    <div className={styles.rowActions}>
      <Link className={styles.smallAction} to={`/teacher/activities/${activity.id}`} aria-label={`${ar ? 'تعديل' : 'Edit'}: ${activity.title}`}>{ar ? 'تعديل' : 'Edit'}</Link>
      <Link className={styles.smallAction} to={`/teacher/feedback?activityId=${activity.id}`} aria-label={`${ar ? 'الملاحظات' : 'Feedback'}: ${activity.title}`}>{ar ? 'الملاحظات' : 'Feedback'}</Link>
      {shared && <Link className={styles.smallAction} to={`/activities/${activity.id}`} aria-label={`${ar ? 'الصفحة العامة' : 'Public page'}: ${activity.title}`}>{ar ? 'الصفحة العامة' : 'Public page'}</Link>}
      {approved && <Link className={styles.smallAction} to={`/teacher/activities/${activity.id}/play?mode=homework`} aria-label={`${ar ? 'كلّف كواجب' : 'Assign as homework'}: ${activity.title}`}><Clock size={16} aria-hidden="true" />{ar ? 'واجب' : 'Assign'}</Link>}
      {approved && <Link className={styles.playAction} to={`/teacher/activities/${activity.id}/play?mode=live`} aria-label={`${ar ? 'ابدأ حصة مباشرة' : 'Start live'}: ${activity.title}`}><Play size={16} aria-hidden="true" />{ar ? 'مباشر' : 'Start live'}</Link>}
      <DuplicateAction activity={activity} ar={ar} />
    </div>
  </li>})}</ul>
}

type DuplicateSource = 'draft' | 'approved'

/**
 * "Duplicate" for one owned row (v5.1 C3).
 *
 * A draft-only activity is copied at once. An approved one first asks, inline
 * in the row, which content to copy — the live draft or the approved version —
 * so the teacher never leaves the list. `requestId` is fixed for the life of
 * one attempt: a double-click or a retry after a failure yields one copy, not
 * two. Success opens the copy in the editor.
 */
function DuplicateAction({ activity, ar }: { activity: ActivityRecord; ar: boolean }) {
  const navigate = useNavigate(), queryClient = useQueryClient()
  const approved = activity.currentVersionId !== null
  /* Non-null while a duplicate is being chosen, sent or has failed. */
  const [requestId, setRequestId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const mutation = useMutation({
    mutationFn: (input: { source: DuplicateSource; requestId: string }) => activities.duplicate(activity.id, input),
    onSuccess: async ({ activity: copy }) => {
      await queryClient.invalidateQueries({ queryKey: ['owned-activities'] })
      navigate(`/teacher/activities/${copy.id}`)
    },
    onError: (cause: unknown) => setError(describeDuplicateError(cause, ar)),
  })
  const busy = mutation.isPending, sending = busy ? mutation.variables?.source : undefined
  const copying = ar ? 'جارٍ النسخ…' : 'Copying…'

  const send = (source: DuplicateSource, id: string) => { setError(''); mutation.mutate({ source, requestId: id }) }
  const start = () => {
    const id = crypto.randomUUID()
    setRequestId(id)
    setError('')
    if (!approved) send('draft', id)
  }
  const cancel = () => { setRequestId(null); setError(''); mutation.reset() }

  if (requestId === null) {
    return <button type="button" className={`${styles.smallAction} ${styles.actionButton}`} onClick={start} aria-label={`${ar ? 'نسخ' : 'Duplicate'}: ${activity.title}`}><Copy size={16} aria-hidden="true" />{ar ? 'نسخ' : 'Duplicate'}</button>
  }
  return <div className={styles.duplicateChoice} role="group" aria-label={`${ar ? 'نسخ' : 'Duplicate'}: ${activity.title}`} aria-busy={busy}>
    {approved ? <>
      <span className={styles.choiceLabel}>{ar ? 'انسخ من:' : 'Copy from:'}</span>
      <button type="button" className={`${styles.smallAction} ${styles.actionButton}`} disabled={busy} onClick={() => send('draft', requestId)}>{sending === 'draft' ? copying : (ar ? 'المسودة الحالية' : 'Current draft')}</button>
      <button type="button" className={`${styles.smallAction} ${styles.actionButton}`} disabled={busy} onClick={() => send('approved', requestId)}>{sending === 'approved' ? copying : (ar ? 'النسخة المعتمدة' : 'Approved version')}</button>
    </> : <>
      <span className={styles.choiceLabel}>{busy ? copying : (ar ? 'لم تُنشأ النسخة.' : 'The copy was not made.')}</span>
      {!busy && <button type="button" className={`${styles.smallAction} ${styles.actionButton}`} onClick={() => send('draft', requestId)}>{ar ? 'إعادة المحاولة' : 'Try again'}</button>}
    </>}
    <button type="button" className={styles.cancelChoice} disabled={busy} onClick={cancel} aria-label={ar ? 'إلغاء النسخ' : 'Cancel duplicating'}><X size={16} aria-hidden="true" /></button>
    {error && <p className={styles.rowError} role="alert">{error}</p>}
  </div>
}

function describeDuplicateError(cause: unknown, ar: boolean): string {
  if (cause instanceof ApiError) {
    if (cause.code === 'no_approved_version') return ar ? 'لا توجد نسخة معتمدة بعد. انسخ المسودة الحالية.' : 'Nothing is approved yet. Copy the current draft instead.'
    if (cause.code === 'network_error') return ar ? 'تعذّر الوصول إلى الخادم. حاول مرة أخرى.' : 'Could not reach the server. Try again.'
    if (cause.status === 404) return ar ? 'هذا النشاط لم يعد موجودًا.' : 'This activity is no longer available.'
  }
  return ar ? 'تعذّر إنشاء النسخة. حاول مرة أخرى.' : 'The copy could not be made. Try again.'
}

export default function TeacherHome() {
  const { i18n } = useTranslation(), ar = i18n.language.startsWith('ar'), { user } = useAuth()
  const data = useOwnedActivities(), name = user?.name?.trim().split(/\s+/)[0]
  useDocumentTitle(ar ? 'الرئيسية' : 'Home')
  const shortcuts = [
    { to: '/teacher/activities', Icon: Layers, tone: 'blue', title: ar ? 'أنشطتي' : 'My activities', description: ar ? 'عدّل وشغّل' : 'Edit & play' },
    { to: '/teacher/materials', Icon: FileText, tone: 'teal', title: ar ? 'موادي' : 'My materials', description: ar ? 'ارفع وأعد الاستخدام' : 'Upload & reuse' },
    { to: '/teacher/assignments', Icon: NotebookPen, tone: 'yellow', title: ar ? 'الواجبات' : 'Homework', description: ar ? 'تعلّم خارج الحصة' : 'Learning beyond class' },
    { to: '/teacher/reports', Icon: ChartNoAxesCombined, tone: 'red', title: ar ? 'التقارير' : 'Reports', description: ar ? 'افهم تقدّم طلابك' : 'Understand progress' },
  ]
  return <div className={`asas ${styles.page} ${home.dashboard}`}>
    <header className={home.greeting}>
      <span className={home.greetingIcon}><Sun size={28} strokeWidth={2} aria-hidden="true" /></span>
      <div><h1>{ar ? 'أهلًا بعودتك' : 'Welcome back'}{name ? <>, <bdi>{name}</bdi></> : ''}!</h1><p>{ar ? 'كل ما تحتاجه لحصة مميزة، في مكان واحد.' : 'Everything for a great class, all in one place.'}</p></div>
    </header>

    <section className={home.hero} aria-labelledby="create-next-activity">
      <div className={home.heroCopy}>
        <h2 id="create-next-activity">{ar ? 'ارفع ما تدرّسه. حوّله إلى اختبار.' : 'Upload what you teach. Turn it into a quiz.'}</h2>
        <p>{ar ? 'ارفع درسك، ولّد أسئلة منه، راجعها، ثم شغّلها مباشرة مع طلابك أو كلّفهم بها كواجب، واكتشف ما يحتاج إلى مراجعة.' : 'Upload a lesson, generate questions from it, review them, then run it live with your students or assign it as homework and see what needs review.'}</p>
        <Link className={home.heroAction} to="/teacher/activities/new"><Plus size={21} aria-hidden="true" />{ar ? 'أنشئ اختبارًا من درسك' : 'Create a quiz from your lesson'}</Link>
      </div>
      <div className={home.heroArtwork}><img src={classroomImage} srcSet={`${classroomImageSmall} 768w, ${classroomImage} 1536w`} sizes="(max-width: 800px) 90vw, (max-width: 1200px) 45vw, 560px" width={1536} height={1024} fetchPriority="high" decoding="async" alt={ar ? 'فصل تعليمي ملون مع لوحة وأشكال هندسية وكتب وكرة أرضية' : 'A colorful learning studio with a board, geometric shapes, books and a globe'} /></div>
    </section>

    <nav className={home.shortcuts} aria-label={ar ? 'اختصارات المعلّم' : 'Teaching shortcuts'}>{shortcuts.map(({ to, Icon, tone, title, description }) => <Link to={to} className={home.shortcut} key={to}><span className={home.iconBlock} data-tone={tone}><Icon size={28} strokeWidth={2} aria-hidden="true" /></span><span className={home.shortcutCopy}><strong>{title}</strong><small>{description}</small></span></Link>)}</nav>

    <section aria-labelledby="recent-activities">
      <div className={home.sectionHeading}><div className={home.sectionTitle}><Layers size={24} aria-hidden="true" /><h2 id="recent-activities">{ar ? 'أنشطتك الأخيرة' : 'Your recent activities'}</h2></div><Link to="/teacher/activities">{ar ? 'عرض الكل' : 'View all'}</Link></div>
      {data.isPending ? <LoadingState rows={3} label={ar ? 'جارٍ التحميل' : 'Loading activities'} /> : data.error ? <FailureState title={ar ? 'تعذّر تحميل أنشطتك' : 'Your activities couldn’t load'} body={ar ? 'حاول مرة أخرى للعودة إلى عملك.' : 'Try again to get back to your work.'} actions={<Button onClick={() => void data.refetch()}>{ar ? 'إعادة المحاولة' : 'Try again'}</Button>} /> : data.data.activities.length ? <ActivityRows items={data.data.activities.slice(0, 4)} /> : <div className={home.empty}>
        <span className={home.emptyIcon}><NotebookPen size={40} strokeWidth={1.8} aria-hidden="true" /></span><div><h3>{ar ? 'اختبارك الأول يبدأ هنا' : 'Your first quiz starts here'}</h3><p>{ar ? 'ارفع درسًا أو الصق نصًا، ولّد الأسئلة، راجعها، ثم شغّلها مباشرة أو كلّف بها كواجب. ستجد عملك الأخير هنا.' : 'Upload a lesson or paste text, generate questions, review them, then run it live or assign it as homework. Your recent work will appear here.'}</p><Link to="/teacher/activities/new">{ar ? 'أنشئ اختبارك الأول' : 'Create your first quiz'}</Link></div>
      </div>}
    </section>

    {/* Game worlds, the wheel and shared activities stay available, but below the
        teacher's own work rather than beside it: they are extras, not the workflow. */}
    <aside className="mt-9" aria-labelledby="classroom-inspiration">
      <div className={home.sectionHeading}><div className={home.sectionTitle}><Sparkles size={24} aria-hidden="true" /><h2 id="classroom-inspiration">{ar ? 'أضف متعة إلى حصتك' : 'Make room for fun'}</h2></div></div>
      <div className={`${home.playful} lg:grid-cols-3`}>
        <article className={home.worlds}><div className={home.worldImage}><img src={themeImage('jungle', 'thumb')} width={480} height={270} loading="lazy" decoding="async" alt={ar ? 'عالم الغابة مع شلال وأشجار استوائية' : 'A lush jungle game world with a waterfall and tropical trees'} /><div className={home.worldNames} aria-hidden="true"><span>{ar ? 'الغابة' : 'Jungle'}</span><span>{ar ? 'السماء' : 'Sky'}</span><span>{ar ? 'الجزر' : 'Islands'}</span></div></div><div className={home.worldCopy}><h3>{ar ? 'أسئلتك، في عالم جديد' : 'Your questions. A whole new world.'}</h3><p>{ar ? 'غابات وجزر وفضاء… اختر المشهد الذي يناسب نشاطك.' : 'Jungles, islands, outer space… set the scene for your next activity.'}</p><Link to="/teacher/activities/new">{ar ? 'إنشاء نشاط بطابعك' : 'Create a themed activity'}</Link></div></article>
        <Link className={home.wheel} to="/teacher/wheel"><span className={home.wheelIcon}><Disc3 size={40} strokeWidth={1.8} aria-hidden="true" /></span><span><strong>{ar ? 'العجلة العشوائية' : 'Random wheel'}</strong><span>{ar ? 'أسماء أو أسئلة؟ دع العجلة تختار.' : 'Names or questions? Let the wheel choose.'}</span></span></Link>
        <Link className={`${home.discoveryLink} mt-0!`} to="/teacher/discover"><Compass size={32} aria-hidden="true" /><span><strong>{ar ? 'فكرة جديدة لحصتك القادمة' : 'A fresh idea for your next class'}</strong><span>{ar ? 'استكشف أنشطة المعلّمين واجعلها مناسبة لطلابك.' : 'Explore teacher-shared activities and make them your own.'}</span></span></Link>
      </div>
      <div className={home.guide}><LifeBuoy size={24} aria-hidden="true" /><span>{ar ? 'أول مرة هنا؟ ' : 'New around here? '}<Link to="/teacher/guides">{ar ? 'افتح دليل المعلّم' : 'Open the teacher guide'}</Link></span></div>
    </aside>
  </div>
}
