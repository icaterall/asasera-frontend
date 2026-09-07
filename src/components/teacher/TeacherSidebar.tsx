import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Logo } from '@/components/ui/Logo'
import {
  AccountIcon,
  BookmarkIcon,
  DocumentIcon,
  GuidesIcon,
  HomeIcon,
  InfoIcon,
  StackIcon,
} from './TeacherIcons'

/**
 * The workspace navigation.
 *
 * ONE RULE: EVERY ENTRY OPENS A WORKING SCREEN BACKED BY REAL DATA.
 *
 * Lessons, Materials and Courses were absent from this rail until the tables,
 * the endpoints and the screens behind them existed; they are here now because
 * they persist through the backend and enforce ownership. Classes, Sessions
 * and Reports are still absent for the same reason they were before — there is
 * no table, no endpoint and no screen — and they stay out until there is,
 * rather than routing to a page that apologises.
 *
 * Every entry below resolves to a working page:
 *   Home       the dashboard
 *   Lessons    the library, from `lessons`
 *   Materials  the teacher's own sources, from `materials`
 *   Courses    from `courses`
 *   Guides     the written guides
 *   Account    the profile screen, which writes through PATCH /auth/me
 *   About      the existing marketing page
 *
 * MIRRORING IS FREE. Nothing here uses left or right — the rail is a flex item
 * in document order, so it lands leading-side in both directions, and the
 * padding is logical. There is no `dir` branch in this file.
 */

const linkClass = 'teacher-nav-item rounded-sm'

export function TeacherSidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { t,i18n } = useTranslation()

  return (
    <nav aria-label={t('teacher.nav.label')} className="flex h-full flex-col gap-1 p-3">
      <p className="px-3 pt-2 pb-1 text-xs font-bold tracking-wide text-faint uppercase">
        {t('teacher.nav.groupWorkspace')}
      </p>

      {/*
        `end` on the index route only. Without it the Home item stays active on
        /teacher/guides, because that path starts with the dashboard's own.
      */}
      <NavLink to="/teacher/dashboard" end className={linkClass} onClick={onNavigate}>
        <HomeIcon />
        {t('teacher.nav.home')}
      </NavLink>

      <NavLink to="/teacher/activities" className={linkClass} onClick={onNavigate}>
        <StackIcon />{i18n.language.startsWith('ar')?'أنشطتي':'My activities'}
      </NavLink>
      <NavLink to="/teacher/assignments" className={linkClass} onClick={onNavigate}><BookmarkIcon/>{i18n.language.startsWith('ar')?'الواجبات والتعلّم الذاتي':'Homework & study'}</NavLink>
      <NavLink to="/teacher/reports" className={linkClass} onClick={onNavigate}>
        <DocumentIcon />{i18n.language.startsWith('ar')?'تقارير الحصص':'Class reports'}
      </NavLink>
      <NavLink to="/teacher/tools" className={linkClass} onClick={onNavigate}>
        <GuidesIcon />{i18n.language.startsWith('ar')?'أدوات المعلّم':'Teacher tools'}
      </NavLink>
      <NavLink to="/teacher/lessons" className={linkClass} onClick={onNavigate}>
        <BookmarkIcon />
        {t('teaching.nav.lessons')}
      </NavLink>

      <NavLink to="/teacher/materials" className={linkClass} onClick={onNavigate}>
        <DocumentIcon />
        {t('teaching.nav.materials')}
      </NavLink>

      <NavLink to="/teacher/courses" className={linkClass} onClick={onNavigate}>
        <StackIcon />
        {t('teaching.nav.courses')}
      </NavLink>

      <NavLink to="/teacher/guides" className={linkClass} onClick={onNavigate}>
        <GuidesIcon />
        {t('teacher.nav.guides')}
      </NavLink>

      <p className="mt-4 px-3 pt-2 pb-1 text-xs font-bold tracking-wide text-faint uppercase">
        {t('teacher.nav.groupSupport')}
      </p>

      <NavLink to="/account" className={linkClass} onClick={onNavigate}>
        <AccountIcon />
        {t('teacher.nav.account')}
      </NavLink>

      <NavLink to="/about" className={linkClass} onClick={onNavigate}>
        <InfoIcon />
        {t('teacher.nav.about')}
      </NavLink>
    </nav>
  )
}

/** The desktop rail. Hidden below `lg`, where the drawer takes over. */
export function TeacherSidebar() {
  return (
    <aside className="teacher-rail hidden border-e border-line bg-surface lg:block">
      <div className="flex h-[68px] items-center px-5">
        <a href="/" className="rounded-sm focus-visible:outline-3 focus-visible:outline-accent">
          <Logo className="h-8 w-auto" />
        </a>
      </div>
      <TeacherSidebarNav />
    </aside>
  )
}
