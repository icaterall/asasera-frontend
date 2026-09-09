import { useAuth } from '@/hooks/useAuth'
import { Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Aurora } from '@/components/ui/Aurora'
import { VerifyEmailBanner } from './VerifyEmailBanner'
import { Footer } from './Footer'
import { Navbar } from './Navbar'
import { ScrollManager } from './ScrollManager'

export function Layout() {
  const { t } = useTranslation()
  const { status } = useAuth()
  const { pathname } = useLocation()

  return (
    <>
      <ScrollManager />
      {status === 'anonymous' && pathname !== '/' && <Aurora />}

      <a
        href="#main"
        className="glass fixed start-4 top-4 z-100 -translate-y-24 rounded-md px-5 py-3 text-sm font-semibold transition-transform duration-300 focus-visible:translate-y-0"
      >
        {t('common.skipToContent')}
      </a>

      {/*
        Above the header, in the flow. It renders nothing at all unless the
        signed-in account is a teacher whose address is still unproven, so
        every other visitor sees the shell exactly as before.
      */}
      <VerifyEmailBanner />

      <Navbar />

      <main id="main" className="relative">
        <Outlet />
      </main>

      <Footer />
    </>
  )
}
