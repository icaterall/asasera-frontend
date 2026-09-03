import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Aurora } from '@/components/ui/Aurora'
import { Footer } from './Footer'
import { Navbar } from './Navbar'
import { ScrollManager } from './ScrollManager'

export function Layout() {
  const { t } = useTranslation()

  return (
    <>
      <ScrollManager />
      <Aurora />

      <a
        href="#main"
        className="glass fixed start-4 top-4 z-100 -translate-y-24 rounded-md px-5 py-3 text-sm font-semibold transition-transform duration-300 focus-visible:translate-y-0"
      >
        {t('common.skipToContent')}
      </a>

      <Navbar />

      <main id="main" className="relative">
        <Outlet />
      </main>

      <Footer />
    </>
  )
}
