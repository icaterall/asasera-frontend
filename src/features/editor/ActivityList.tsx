import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { Button, FailureState, LoadingState, Select } from '@/design'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { ActivityRows } from '@/features/teacher-home/TeacherHome'
import { useOwnedActivities } from '@/features/teacher-home/useOwnedActivities'
import styles from '@/features/teacher-home/TeacherHome.module.css'

export default function ActivityList() {
  const { i18n } = useTranslation(), ar = i18n.language.startsWith('ar')
  const [search, setSearch] = useState(''), [status, setStatus] = useState('all')
  const data = useOwnedActivities()
  const items = data.data?.activities.filter(a => (status === 'all' || a.visibility === status) && a.title.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())) ?? []
  useDocumentTitle(ar ? 'أنشطتي' : 'My activities')
  return <div className={`asas ${styles.page}`}>
    <header className={styles.welcome}><div><h1>{ar ? 'أنشطتي' : 'My activities'}</h1><p>{ar ? 'كل أفكارك، جاهزة للتعديل أو اللعب.' : 'Your ideas, ready to edit or play.'}</p></div><Link className={styles.primaryAction} to="/teacher/activities/new"><Plus size={20} aria-hidden="true" />{ar ? 'إنشاء نشاط' : 'Create activity'}</Link></header>
    <div className={styles.search}>
      <label className={styles.field}>{ar ? 'البحث في أنشطتي' : 'Search my activities'}<input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder={ar ? 'اسم النشاط' : 'Activity name'} /></label>
      <label className={styles.field}>{ar ? 'الحالة' : 'Status'}<Select value={status} onValueChange={e => setStatus(e)}><option value="all">{ar ? 'الكل' : 'All activities'}</option><option value="private">{ar ? 'مسودات' : 'Drafts'}</option><option value="published">{ar ? 'منشورة' : 'Published'}</option></Select></label>
    </div>
    {data.isPending ? <LoadingState rows={4} label={ar ? 'جارٍ التحميل' : 'Loading activities'} /> : data.error ? <FailureState title={ar ? 'تعذّر تحميل أنشطتك' : 'Your activities couldn’t load'} body={ar ? 'حاول مرة أخرى.' : 'Please try again.'} actions={<Button onClick={() => void data.refetch()}>{ar ? 'إعادة المحاولة' : 'Try again'}</Button>} /> : items.length ? <ActivityRows items={items} /> : <div className={styles.empty}><h2>{data.data.activities.length ? (ar ? 'لا توجد نتائج مطابقة' : 'No matching activities') : (ar ? 'لننشئ نشاطك الأول' : 'Let’s create your first activity')}</h2><p>{data.data.activities.length ? (ar ? 'جرّب اسمًا مختلفًا أو غيّر الحالة.' : 'Try a different name or change the status filter.') : (ar ? 'ابدأ بفكرة، ثم أضف أسئلتك.' : 'Start with an idea, then add your questions.')}</p>{data.data.activities.length ? <Button onClick={() => { setSearch(''); setStatus('all') }}>{ar ? 'مسح التصفية' : 'Clear filters'}</Button> : <Link to="/teacher/activities/new">{ar ? 'إنشاء نشاط' : 'Create activity'}</Link>}</div>}
  </div>
}
