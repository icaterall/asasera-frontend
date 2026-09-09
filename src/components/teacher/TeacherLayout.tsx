import { useEffect, useRef, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { VerifyEmailBanner } from '@/components/layout/VerifyEmailBanner'
import { Logo } from '@/components/ui/Logo'
import { useAuth } from '@/hooks/useAuth'
import { homePathFor } from '@/lib/afterAuth'
import { TeacherGuideProvider } from './TeacherGuidePanel'
import { TeacherHeader } from './TeacherHeader'
import { TeacherSidebar, TeacherSidebarNav } from './TeacherSidebar'
import { CloseIcon } from './TeacherIcons'

/**
 * The signed-in teacher shell: verification banner, rail, header, content.
 *
 * THE BANNER'S HEIGHT IS MEASURED, NOT ASSUMED. It is sticky at the top of the
 * page and the header is sticky underneath it, so the header's offset has to
 * equal the banner's height exactly. That height is not a constant: the
 * message wraps to two lines on a tablet and three on a phone, and it becomes
 * zero the moment the server confirms the address. A hardcoded 38px produces a
 * header sitting on top of the banner on every phone. A ResizeObserver writes
 * the real value into `--tc-banner`, and every sticky offset in teacher.css is
 * derived from it.
 *
 * WHO GETS IN. Teachers, verified or not — entering before verification is
 * approved behaviour and the banner is what carries the reminder. Students and
 * anyone signed out are sent somewhere that makes sense for them rather than
 * shown an empty teacher workspace.
 */
export function TeacherLayout() {
  const { t } = useTranslation()
  const { status, user } = useAuth()
  const location = useLocation()

  const bannerRef = useRef<HTMLDivElement | null>(null)
  const shellRef = useRef<HTMLDivElement | null>(null)
  const [navOpen, setNavOpen] = useState(false)

  useEffect(() => {
    const banner = bannerRef.current
    const shell = shellRef.current
    if (!banner || !shell) return

    const sync = () => {
      /* offsetHeight, not a class name: this is the rendered height including
         however many lines the sentence took at this width. */
      shell.style.setProperty('--tc-banner', `${banner.offsetHeight}px`)
    }

    sync()
    const observer = new ResizeObserver(sync)
    observer.observe(banner)
    window.addEventListener('resize', sync)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', sync)
    }
  }, [status, user?.emailVerified])

  useEffect(() => {
    if (!navOpen) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setNavOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [navOpen])

  if (status === 'loading') {
    return (
      <div className="grid min-h-dvh place-items-center bg-canvas" role="status" aria-live="polite">
        <span className="size-8 animate-spin rounded-full border-2 border-line border-t-accent motion-reduce:animate-none" />
        <span className="sr-only">{t('teacher.section.loading')}</span>
      </div>
    )
  }

  if (status !== 'authenticated' || !user) {
    /*
     * `state` carries where they were going, so signing in returns them here
     * rather than dropping them on the dashboard root. `replace` keeps the
     * protected URL out of history — pressing Back from the login page should
     * not bounce off this redirect again.
     */
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search + location.hash }} />
  }

  /* Student accounts return to their own learning workspace. */
  if (user.role !== 'teacher') return <Navigate to={homePathFor(user)} replace />

  return (
    <TeacherGuideProvider>
      <div ref={shellRef} className="teacher-scope teacher-shell">
        <a
          href="#teacher-main"
          className="fixed start-4 top-4 z-100 -translate-y-24 rounded-sm bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition-transform duration-300 focus-visible:translate-y-0"
        >
          {t('common.skipToContent')}
        </a>

        {/* Wrapped rather than modified: VerifyEmailBanner renders null for a
            verified account, and this div is what gets measured either way. */}
        <div ref={bannerRef} className="teacher-banner">
          <VerifyEmailBanner />
        </div>

        <div className="flex">
          <TeacherSidebar />

          <div className="min-w-0 flex-1">
            <TeacherHeader onOpenNav={() => setNavOpen(true)} />
            <main id="teacher-main" className="p-4 sm:p-6">
              <Outlet />
            </main>
          </div>
        </div>

        {navOpen ? (
          <>
            <div
              className="teacher-panel-backdrop lg:hidden"
              onClick={() => setNavOpen(false)}
              aria-hidden="true"
            />
            <div
              className="teacher-drawer lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-label={t('teacher.nav.label')}
            >
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <Logo className="h-7 w-auto" />
                <button
                  type="button"
                  onClick={() => setNavOpen(false)}
                  aria-label={t('teacher.nav.closeMenu')}
                  className="grid size-9 place-items-center rounded-sm border border-line text-muted focus-visible:outline-3 focus-visible:outline-accent"
                >
                  <CloseIcon />
                </button>
              </div>
              <TeacherSidebarNav onNavigate={() => setNavOpen(false)} />
            </div>
          </>
        ) : null}
      </div>
    </TeacherGuideProvider>
  )
}
