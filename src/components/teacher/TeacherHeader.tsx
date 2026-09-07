import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { LanguageToggle } from '@/components/ui/LanguageToggle'
import { Logo } from '@/components/ui/Logo'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { AccountControl } from '@/components/layout/AccountControl'
import { MenuIcon } from './TeacherIcons'

export function TeacherHeader({ onOpenNav }: { onOpenNav: () => void }) {
  const { t } = useTranslation()
  return (
    <header className="teacher-header flex items-center gap-3 border-b border-line bg-surface px-4 sm:px-6">
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

      <p className="hidden text-sm font-semibold text-muted lg:block">
        {t('teacher.header.workspace')}
      </p>

      <div className="ms-auto flex items-center gap-2">
        {/* The principal action, and it now opens the real creation journey
            rather than a written guide. */}
        <Link
          to="/teacher/lessons/new"
          className="hidden rounded-sm bg-brand-500 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-600 focus-visible:outline-3 focus-visible:outline-accent focus-visible:outline-offset-2 sm:block"
        >
          {t('teaching.lessons.newLesson')}
        </Link>

        <LanguageToggle />
        <ThemeToggle />

        <AccountControl />
      </div>
    </header>
  )
}
