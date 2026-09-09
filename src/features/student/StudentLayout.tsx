import { useTranslation } from 'react-i18next'
import { LoadingState } from '@/design/LoadingState'
import { Link, NavLink, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Home, BookOpen, ChartNoAxesColumn, Gamepad2, SlidersHorizontal, Settings, CircleHelp } from 'lucide-react'
import { AccountControl } from '@/components/layout/AccountControl'
import { VerifyEmailBanner } from '@/components/layout/VerifyEmailBanner'
import { Logo } from '@/components/ui/Logo'
import { LanguageToggle } from '@/components/ui/LanguageToggle'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useAuth } from '@/hooks/useAuth'
import { homePathFor, loginStateFor } from '@/lib/afterAuth'
import { learningLabel } from '@/shared/student'
import { studentApi, studentQueryKey } from './student-api'
import styles from './Student.module.css'

export default function StudentLayout() {
  const { user, status } = useAuth(), location = useLocation()
  const { i18n } = useTranslation(), ar = i18n.language.startsWith('ar'), t = (a: string, e: string) => ar ? a : e
  const query = useQuery({ queryKey: studentQueryKey(user?.id ?? 0), queryFn: studentApi.overview, enabled: user?.role === 'student', staleTime: 15000 })
  if (status === 'loading') return <main><LoadingState layout="page" variant="dashboard" label={t('جارٍ فتح حسابك…', 'Opening your account…')} /></main>
  if (!user) return <Navigate to="/login" state={loginStateFor(location)} replace />
  if (user.role !== 'student') return <Navigate to={homePathFor(user)} replace />
  const stage = query.data?.profile.stage ?? 'general'
  const links = [
    { to: '/student', label: t('الرئيسية', 'Home'), Icon: Home, end: true },
    { to: '/student/activities', label: t('أنشطتي', 'My activities'), Icon: BookOpen },
    { to: '/student/progress', label: t('تقدّمي', 'My progress'), Icon: ChartNoAxesColumn },
    { to: '/student/practice', label: t('العب وتعلّم', 'Play & learn'), Icon: Gamepad2 },
    { to: '/student/profile', label: t('تفضيلات التعلّم', 'Learning preferences'), Icon: SlidersHorizontal },
  ]
  return <div className={`asas ${styles.workspace}`} data-stage={stage} dir={ar ? 'rtl' : 'ltr'}>
    <a className={styles.skip} href="#student-main">{t('انتقل إلى المحتوى', 'Skip to content')}</a>
    <aside className={styles.sidebar}>
      <Link className={styles.logo} to="/student" aria-label={t('أساسيرا — الرئيسية', 'Asasera — home')}><Logo /></Link>
      <p className={styles.navTitle}>{t('مساحة تعلّمك', 'YOUR LEARNING SPACE')}</p>
      <nav aria-label={t('التنقل في مساحة الطالب', 'Student navigation')} className={styles.nav}>{links.map(({ to, label, Icon, end }) => <NavLink to={to} end={end} key={to} className={({ isActive }) => isActive ? styles.active : undefined}><Icon size={22} aria-hidden="true" /><span>{label}</span></NavLink>)}</nav>
      <div className={styles.railBottom}><Link to="/account"><Settings size={20} aria-hidden="true" />{t('إعدادات الحساب', 'Account settings')}</Link><Link to="/contact"><CircleHelp size={20} aria-hidden="true" />{t('المساعدة', 'Help & support')}</Link></div>
    </aside>
    <div className={styles.body}>
      <header className={styles.header}><span>{query.data ? learningLabel(query.data.profile, ar ? 'ar' : 'en') : t('مساحة التعلّم', 'Learning space')}</span><div className={styles.headerControls}><LanguageToggle /><ThemeToggle /><AccountControl /></div></header>
      <VerifyEmailBanner />
      <main className={styles.main} id="student-main" tabIndex={-1}>
        {query.isPending ? <LoadingState variant="dashboard" label={t('نجهّز مساحة تعلّمك…', 'Loading your learning space…')} /> : query.isError ? <div className={styles.empty}><h1>{t('تعذّر فتح مساحة التعلّم', 'Your learning space could not load')}</h1><p role="alert">{t('تحقق من الاتصال ثم حاول مجددًا.', 'Check your connection and try again.')}</p><button className={styles.primary} onClick={() => void query.refetch()}>{t('حاول مجددًا', 'Try again')}</button></div> : <Outlet context={{ data: query.data, reload: query.refetch }} />}
      </main>
    </div>
  </div>
}
