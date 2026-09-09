import { NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BookOpen, ChartNoAxesCombined, Compass, Disc3, FileText, GraduationCap, House, Layers, LifeBuoy } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'

const linkClass = 'teacher-nav-item rounded-sm'
export function TeacherSidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { t, i18n } = useTranslation(), ar = i18n.language.startsWith('ar'), { pathname } = useLocation()
  const resources = [
    { to: '/teacher/wheel', Icon: Disc3, label: ar ? 'العجلة العشوائية' : 'Random wheel' },
    { to: '/teacher/lessons', Icon: BookOpen, label: t('teaching.nav.lessons') },
    { to: '/teacher/materials', Icon: FileText, label: t('teaching.nav.materials') },
    { to: '/teacher/courses', Icon: GraduationCap, label: t('teaching.nav.courses') },
    { to: '/teacher/tools', Icon: Layers, label: ar ? 'كل الأدوات' : 'All tools' },
  ]
  const resourceActive = resources.some(r => pathname === r.to || pathname.startsWith(r.to + '/'))
  return <nav aria-label={t('teacher.nav.label')} className="flex flex-col gap-1 p-3">
    <NavLink to="/teacher/dashboard" end className={linkClass} onClick={onNavigate}><House size={20} aria-hidden="true" />{t('teacher.nav.home')}</NavLink>
    <NavLink to="/teacher/activities" className={linkClass} onClick={onNavigate}><Layers size={20} aria-hidden="true" />{ar ? 'أنشطتي' : 'My activities'}</NavLink>
    <NavLink to="/teacher/discover" className={linkClass} onClick={onNavigate}><Compass size={20} aria-hidden="true" />{ar ? 'استكشاف الأنشطة' : 'Explore activities'}</NavLink>
    <NavLink to="/teacher/assignments" className={linkClass} onClick={onNavigate}><BookOpen size={20} aria-hidden="true" />{ar ? 'الواجبات والتعلّم الذاتي' : 'Homework & study'}</NavLink>
    <NavLink to="/teacher/reports" className={linkClass} onClick={onNavigate}><ChartNoAxesCombined size={20} aria-hidden="true" />{ar ? 'تقارير الحصص' : 'Class reports'}</NavLink>
    <details className="teacher-resource-nav mt-4 border-t border-line pt-3" key={resourceActive ? 'active' : 'other'} open={resourceActive || undefined}>
      <summary className="cursor-pointer rounded-sm px-3 py-3 text-sm font-semibold text-muted focus-visible:outline-3 focus-visible:outline-accent">{ar ? 'الأدوات والموارد' : 'Tools & resources'}</summary>
      <div className="flex flex-col gap-1 pt-1">{resources.map(({ to, Icon, label }) => <NavLink to={to} key={to} className={linkClass} onClick={onNavigate}><Icon size={20} aria-hidden="true" />{label}</NavLink>)}</div>
    </details>
    <NavLink to="/teacher/guides" className={`${linkClass} mt-4`} onClick={onNavigate}><LifeBuoy size={20} aria-hidden="true" />{ar ? 'المساعدة والأدلة' : 'Help & guides'}</NavLink>
  </nav>
}

export function TeacherSidebar() {
  return <aside className="teacher-rail hidden border-e border-line bg-surface lg:block">
    <div className="flex h-[68px] items-center px-5"><a href="/" className="rounded-sm focus-visible:outline-3 focus-visible:outline-accent"><Logo className="h-8 w-auto" /></a></div>
    <TeacherSidebarNav />
  </aside>
}
