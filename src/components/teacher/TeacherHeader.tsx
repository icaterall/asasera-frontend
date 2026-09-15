import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { LanguageToggle } from '@/components/ui/LanguageToggle'
import { Logo } from '@/components/ui/Logo'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { AccountControl } from '@/components/layout/AccountControl'
import { MenuIcon } from './TeacherIcons'
import {InstructorBalance} from '@/features/account/InstructorBalance'

export function TeacherHeader({ onOpenNav }: { onOpenNav: () => void }) {
  const { t, i18n } = useTranslation()
  const { pathname } = useLocation()
  // Creating is the primary classroom action in the supplied product direction.
  // Keep it visible everywhere a teacher can safely start a new activity.
  const showCreate = pathname !== '/teacher/activities/new'
  /*
   * ONE ROW, AT EVERY WIDTH.
   *
   * The header used to wrap: on a phone the balance, the language switch and
   * the theme toggle fell onto a second line and took a third of the screen
   * before any of the teacher's own work appeared. They are not header
   * material on a phone — the balance, the language and the theme now live in
   * the menu, which is where someone goes looking for them anyway, and the
   * header keeps only what must always be one tap away.
   */
  return (
    <header className="teacher-header flex flex-nowrap items-center gap-3 border-b border-line bg-surface px-4 py-2 sm:px-6">
      <button
        type="button"
        onClick={onOpenNav}
        aria-label={t('teacher.nav.openMenu')}
        className="grid size-10 shrink-0 place-items-center rounded-sm border border-line text-fg focus-visible:outline-3 focus-visible:outline-accent lg:hidden"
      >
        <MenuIcon />
      </button>

      {/* The rail carries the logo on desktop; below `lg` there is no rail, so
          the header carries it instead of leaving the corner empty. */}
      <Link to="/teacher/dashboard" className="shrink-0 rounded-sm lg:hidden">
        <Logo className="h-7 w-auto" />
      </Link>

      <p className="hidden truncate text-sm font-semibold text-muted lg:block">
        {t('teacher.header.workspace')}
      </p>

      <div className="ms-auto flex flex-wrap items-center justify-end gap-2">
        {showCreate && <Link
          to="/teacher/activities/new"
          className="teacher-create-activity hidden rounded-sm bg-brand-500 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-600 focus-visible:outline-3 focus-visible:outline-accent focus-visible:outline-offset-2 sm:block"
        >
          {i18n.language.startsWith('ar') ? 'إنشاء نشاط' : 'Create activity'}
        </Link>}

        <div className="hidden items-center gap-2 lg:flex">
          <InstructorBalance />
          <LanguageToggle />
          <ThemeToggle />
        </div>

        <AccountControl />
      </div>
    </header>
  )
}
