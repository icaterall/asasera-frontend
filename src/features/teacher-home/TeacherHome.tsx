import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Compass, Disc3, Plus, ChartNoAxesCombined, Play, Layers, Sun, NotebookPen, LifeBuoy, Sparkles } from 'lucide-react'
import { type ActivityRecord } from '@/lib/api'
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
  return <ul className={styles.activityList}>{items.map(activity => <li className={styles.activityRow} key={activity.id}>
    <ThemeThumbnail theme={activity.theme} className={styles.thumbnail} />
    <div className={styles.activityInfo}>
      <Link className={styles.activityTitle} dir="auto" to={`/teacher/activities/${activity.id}`}>{activity.title}</Link>
      <div className={styles.metadata}>
        <span className={styles.status} data-published={activity.visibility === 'published'}>{activity.visibility === 'published' ? (ar ? 'منشور' : 'Published') : (ar ? 'مسودة' : 'Draft')}</span>
        <span>{ar ? 'آخر تعديل' : 'Edited'} <time dateTime={activity.updatedAt}>{new Intl.DateTimeFormat(ar ? 'ar' : 'en', { day: 'numeric', month: 'short' }).format(new Date(activity.updatedAt))}</time></span>
      </div>
    </div>
    <div className={styles.rowActions}>
      <Link className={styles.smallAction} to={`/teacher/activities/${activity.id}`} aria-label={`${ar ? 'تعديل' : 'Edit'}: ${activity.title}`}>{ar ? 'تعديل' : 'Edit'}</Link>
      <Link className={styles.smallAction} to={`/teacher/feedback?activityId=${activity.id}`} aria-label={`${ar ? 'الملاحظات' : 'Feedback'}: ${activity.title}`}>{ar ? 'الملاحظات' : 'Feedback'}</Link>
      {activity.visibility === 'published' && <Link className={styles.smallAction} to={`/activities/${activity.id}`} aria-label={`${ar ? 'مشاركة' : 'Share'}: ${activity.title}`}>{ar ? 'مشاركة' : 'Share'}</Link>}
      {activity.visibility === 'published' && <Link className={styles.playAction} to={`/teacher/activities/${activity.id}/play`} aria-label={`${ar ? 'تشغيل' : 'Play'}: ${activity.title}`}><Play size={16} aria-hidden="true" />{ar ? 'تشغيل' : 'Play'}</Link>}
    </div>
  </li>)}</ul>
}

export default function TeacherHome() {
  const { i18n } = useTranslation(), ar = i18n.language.startsWith('ar'), { user } = useAuth()
  const data = useOwnedActivities(), name = user?.name?.trim().split(/\s+/)[0]
  useDocumentTitle(ar ? 'الرئيسية' : 'Home')
  const shortcuts = [
    { to: '/teacher/activities', Icon: Layers, tone: 'blue', title: ar ? 'أنشطتي' : 'My activities', description: ar ? 'عدّل وشغّل' : 'Edit & play' },
    { to: '/teacher/discover', Icon: Compass, tone: 'teal', title: ar ? 'استكشاف' : 'Explore', description: ar ? 'ابحث عن فكرة' : 'Find an idea' },
    { to: '/teacher/assignments', Icon: NotebookPen, tone: 'yellow', title: ar ? 'الواجبات' : 'Homework', description: ar ? 'تعلّم خارج الحصة' : 'Learning beyond class' },
    { to: '/teacher/reports', Icon: ChartNoAxesCombined, tone: 'red', title: ar ? 'التقارير' : 'Reports', description: ar ? 'افهم تقدّم طلابك' : 'Understand progress' },
  ]
  return <div className={`asas ${styles.page} ${home.dashboard}`}>
    <header className={home.greeting}>
      <span className={home.greetingIcon}><Sun size={28} strokeWidth={2} aria-hidden="true" /></span>
      <div><h1>{ar ? 'أهلًا بعودتك' : 'Welcome back'}{name ? <>, <bdi>{name}</bdi></> : ''}!</h1><p>{ar ? 'كل ما تحتاجه لحصة مميزة، في مكان واحد.' : 'Everything for a great class, all in one place.'}</p></div>
    </header>

    <section className={home.hero} aria-labelledby="create-next-activity">
      <div className={home.heroCopy}><h2 id="create-next-activity">{ar ? 'حوّل درسك إلى مغامرة تعلّم.' : 'Turn your next lesson into an adventure.'}</h2><p>{ar ? 'أضف أسئلتك، اختر عالم اللعب، واجعل طلابك جزءًا من التجربة.' : 'Add your questions, choose a game world, and bring your class into the action.'}</p><Link className={home.heroAction} to="/teacher/activities/new"><Plus size={21} aria-hidden="true" />{ar ? 'إنشاء نشاط' : 'Create activity'}</Link></div>
      <div className={home.heroArtwork}><img src={classroomImage} srcSet={`${classroomImageSmall} 768w, ${classroomImage} 1536w`} sizes="(max-width: 800px) 90vw, (max-width: 1200px) 45vw, 560px" width={1536} height={1024} fetchPriority="high" decoding="async" alt={ar ? 'فصل تعليمي ملون مع لوحة وأشكال هندسية وكتب وكرة أرضية' : 'A colorful learning studio with a board, geometric shapes, books and a globe'} /></div>
    </section>

    <nav className={home.shortcuts} aria-label={ar ? 'اختصارات المعلّم' : 'Teaching shortcuts'}>{shortcuts.map(({ to, Icon, tone, title, description }) => <Link to={to} className={home.shortcut} key={to}><span className={home.iconBlock} data-tone={tone}><Icon size={28} strokeWidth={2} aria-hidden="true" /></span><span className={home.shortcutCopy}><strong>{title}</strong><small>{description}</small></span></Link>)}</nav>

    <div className={home.content}>
      <section aria-labelledby="recent-activities">
        <div className={home.sectionHeading}><div className={home.sectionTitle}><Layers size={24} aria-hidden="true" /><h2 id="recent-activities">{ar ? 'أنشطتك الأخيرة' : 'Your recent activities'}</h2></div><Link to="/teacher/activities">{ar ? 'عرض الكل' : 'View all'}</Link></div>
        {data.isPending ? <LoadingState rows={3} label={ar ? 'جارٍ التحميل' : 'Loading activities'} /> : data.error ? <FailureState title={ar ? 'تعذّر تحميل أنشطتك' : 'Your activities couldn’t load'} body={ar ? 'حاول مرة أخرى للعودة إلى عملك.' : 'Try again to get back to your work.'} actions={<Button onClick={() => void data.refetch()}>{ar ? 'إعادة المحاولة' : 'Try again'}</Button>} /> : data.data.activities.length ? <ActivityRows items={data.data.activities.slice(0, 4)} /> : <div className={home.empty}>
          <span className={home.emptyIcon}><NotebookPen size={40} strokeWidth={1.8} aria-hidden="true" /></span><div><h3>{ar ? 'فكرتك الأولى تبدأ هنا' : 'Your first idea starts here'}</h3><p>{ar ? 'أنشئ نشاطًا، أضف أسئلتك، ثم العب مع طلابك. ستجد عملك الأخير هنا.' : 'Create an activity, add your questions, then play with your class. Your recent work will appear here.'}</p><Link to="/teacher/activities/new">{ar ? 'إنشاء أول نشاط' : 'Create your first activity'}</Link></div>
        </div>}
        <Link className={home.discoveryLink} to="/teacher/discover"><Compass size={32} aria-hidden="true" /><span><strong>{ar ? 'فكرة جديدة لحصتك القادمة' : 'A fresh idea for your next class'}</strong><span>{ar ? 'استكشف أنشطة المعلّمين واجعلها مناسبة لطلابك.' : 'Explore teacher-shared activities and make them your own.'}</span></span></Link>
      </section>

      <aside aria-labelledby="classroom-inspiration">
        <div className={home.sectionHeading}><div className={home.sectionTitle}><Sparkles size={24} aria-hidden="true" /><h2 id="classroom-inspiration">{ar ? 'أضف متعة إلى حصتك' : 'Make room for fun'}</h2></div></div>
        <div className={home.playful}>
          <article className={home.worlds}><div className={home.worldImage}><img src={themeImage('jungle', 'thumb')} width={480} height={270} loading="lazy" decoding="async" alt={ar ? 'عالم الغابة مع شلال وأشجار استوائية' : 'A lush jungle game world with a waterfall and tropical trees'} /><div className={home.worldNames} aria-hidden="true"><span>{ar ? 'الغابة' : 'Jungle'}</span><span>{ar ? 'السماء' : 'Sky'}</span><span>{ar ? 'الجزر' : 'Islands'}</span></div></div><div className={home.worldCopy}><h3>{ar ? 'أسئلتك، في عالم جديد' : 'Your questions. A whole new world.'}</h3><p>{ar ? 'غابات وجزر وفضاء… اختر المشهد الذي يناسب نشاطك.' : 'Jungles, islands, outer space… set the scene for your next activity.'}</p><Link to="/teacher/activities/new">{ar ? 'إنشاء نشاط بطابعك' : 'Create a themed activity'}</Link></div></article>
          <Link className={home.wheel} to="/teacher/wheel"><span className={home.wheelIcon}><Disc3 size={40} strokeWidth={1.8} aria-hidden="true" /></span><span><strong>{ar ? 'العجلة العشوائية' : 'Random wheel'}</strong><span>{ar ? 'أسماء أو أسئلة؟ دع العجلة تختار.' : 'Names or questions? Let the wheel choose.'}</span></span></Link>
          <div className={home.guide}><LifeBuoy size={24} aria-hidden="true" /><span>{ar ? 'أول مرة هنا؟ ' : 'New around here? '}<Link to="/teacher/guides">{ar ? 'افتح دليل المعلّم' : 'Open the teacher guide'}</Link></span></div>
        </div>
      </aside>
    </div>
  </div>
}
