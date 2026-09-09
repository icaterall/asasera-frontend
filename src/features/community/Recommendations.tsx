import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Compass } from 'lucide-react'
import { Button, LoadingState } from '@/design'
import { useAuth } from '@/hooks/useAuth'
import { ThemeThumbnail } from '@/features/activity-themes/ActivityStage'
import { community } from './api'
import styles from './Community.module.css'

export function Recommendations({ activityId, compact = false }: { activityId?: number | undefined; compact?: boolean }) {
  const { user } = useAuth(), { i18n } = useTranslation(), ar = i18n.language.startsWith('ar'), t = (a: string, e: string) => ar ? a : e
  const data = useQuery({ queryKey: ['community-recommendations', user?.id, activityId], queryFn: () => community.recommendations(activityId), enabled: user?.role === 'teacher' })
  if (user?.role !== 'teacher') return null
  const reasons: Record<string, string> = { same_category: t('نفس التصنيف', 'Same category'), matching_stage: t('مرحلة مناسبة', 'Matching stage'), matching_country: t('مناسب لدولتك', 'Matching country'), classroom_reuse: t('أُعيد استخدامه في حصص', 'Reused in classrooms'), new_activity: t('نشاط جديد للمجتمع', 'New to the community') }
  return <section className={styles.recommendations} aria-label={t('أنشطة مقترحة', 'Suggested activities')}>
    <div className={styles.sectionHeading}><Compass size={24} aria-hidden="true" /><h2>{activityId ? t('أفكار لنفس الجمهور', 'Ideas for the same audience') : t('أفكار لحصتك القادمة', 'Ideas for your next class')}</h2></div>
    <p className={styles.muted}>{t('اقتراحات حسب التصنيف والمراحل والدول، مع استخدامات صفّية مؤهلة. التقييمات لا تغيّر ترتيب الاستخدام.', 'Suggestions use category, stages, countries and eligible classroom reuse. Ratings do not change reuse ranking.')}</p>
    {data.isPending ? <LoadingState rows={2} /> : data.error ? <div role="alert"><p>{t('تعذّر تحميل الاقتراحات.', 'Suggestions couldn’t load.')}</p><Button onClick={() => void data.refetch()}>{t('إعادة المحاولة', 'Try again')}</Button></div> : !data.data.activities.length ? <p className={styles.emptyLine}>{t('لا توجد أنشطة مناسبة بعد. شارك نشاطًا ليبدأ الآخرون منه.', 'No matching activities yet. Share an activity to give other teachers a starting point.')} <Link to="/teacher/activities/new">{t('إنشاء نشاط', 'Create activity')}</Link></p> : <ul className={styles.suggestions}>{data.data.activities.slice(0, compact ? 3 : 6).map(a => <li key={a.id}>
      <Link className={styles.suggestionLink} to={`/activities/${a.id}`}><ThemeThumbnail theme={a.theme} className={styles.suggestionImage} /><div><h3 dir="auto">{a.title}</h3><p>{t('بواسطة', 'By')} <bdi>{a.authorName}</bdi> · {a.questionCount} {t('أسئلة', 'questions')}</p><div className={styles.reasons}>{a.reasons.slice(0, 2).map(reason => <span key={reason}>{reasons[reason] ?? reason}</span>)}</div></div></Link>
    </li>)}</ul>}
  </section>
}
