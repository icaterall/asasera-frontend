import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Bdi } from '@/components/Bdi'
import { LanguageToggle } from '@/components/ui/LanguageToggle'
import { Logo } from '@/components/ui/Logo'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useAuth } from '@/hooks/useAuth'
import { MenuIcon } from './TeacherIcons'

/**
 * The application header.
 *
 * NO SEARCH FIELD, and that is a decision rather than an omission. Search here
 * would have to search lessons and materials; this codebase has neither table
 * nor endpoint, so the input could only ever return nothing. A decorative
 * search box is worse than no search box — it is the control a teacher reaches
 * for first, and it teaches them the product does not work.
 *
 * NO NOTIFICATION BELL for the same reason: nothing generates notifications,
 * so a bell could only ever be empty or, worse, carry an invented badge.
 *
 * THE PRIMARY ACTION IS THE REAL ONE. It used to open a written guide, because
 * lesson creation did not exist. It does now, so the button goes to the
 * creation journey and the guide has gone back to being help.
 */

function initial(name: string | null, email: string | null): string {
  const source = (name ?? '').trim()
  /* A neutral mark rather than a letter lifted from the address: signup is
     progressive, so an account can genuinely have no name yet, and deriving
     one from the email shows a person an identity they never gave. */
  if (!source) return email ? '•' : '•'
  const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
  return [...segmenter.segment(source)][0]?.segment ?? source[0]!
}

export function TeacherHeader({ onOpenNav }: { onOpenNav: () => void }) {
  const { t } = useTranslation()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  /* An open menu closes on Escape and on a click outside it. Both are what a
     person expects; neither is free with a plain <div>. */
  useEffect(() => {
    if (!menuOpen) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    function onPointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [menuOpen])

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

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-label={t('teacher.header.accountMenu')}
            className="grid size-10 place-items-center rounded-full border border-line bg-canvas text-sm font-bold text-fg focus-visible:outline-3 focus-visible:outline-accent"
          >
            <span aria-hidden="true">{initial(user?.name ?? null, user?.email ?? null)}</span>
          </button>

          {menuOpen ? (
            <div
              role="menu"
              className="absolute end-0 top-full z-50 mt-2 w-60 rounded-sm border border-line bg-surface p-2 shadow-lg"
            >
              <div className="border-b border-line px-3 pt-2 pb-3">
                <p className="text-sm font-bold text-fg">
                  {user?.name ?? t('teacher.header.account')}
                </p>
                {user?.email ? (
                  /* An address is a Latin run inside an Arabic page; without
                     the isolate the bidi algorithm reorders it. */
                  <Bdi className="mt-0.5 block truncate text-xs text-muted">{user.email}</Bdi>
                ) : null}
              </div>

              <Link
                to="/complete-profile"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
                className="mt-1 block rounded-sm px-3 py-2.5 text-sm font-semibold text-fg hover:bg-canvas focus-visible:outline-3 focus-visible:outline-accent"
              >
                {t('teacher.header.profile')}
              </Link>

              <button
                type="button"
                role="menuitem"
                onClick={async () => {
                  setMenuOpen(false)
                  /*
                    Leave either way. `signOut` revokes the refresh family
                    server-side, which is the part that matters, but if the
                    request fails the person still pressed sign out — staying
                    on screen as though nothing happened is the worse outcome.
                  */
                  await signOut().catch(() => {})
                  navigate('/login', { replace: true })
                }}
                className="block w-full rounded-sm px-3 py-2.5 text-start text-sm font-semibold text-fg hover:bg-canvas focus-visible:outline-3 focus-visible:outline-accent"
              >
                {t('teacher.header.signOut')}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
