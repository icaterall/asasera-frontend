import { ArrowRight, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'

import { buttonStyles } from '@/components/ui/buttonStyles'
import { Container } from '@/components/ui/Container'
import { LanguageToggle } from '@/components/ui/LanguageToggle'
import { Logo } from '@/components/ui/Logo'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useScrollProgress } from '@/hooks/useScrollProgress'
import { cn } from '@/lib/cn'

const NAV_ITEMS = [
  { to: '/', labelKey: 'nav.home' },
  { to: '/#features', labelKey: 'nav.features' },
  { to: '/#platform', labelKey: 'nav.platform' },
  { to: '/about', labelKey: 'nav.about' },
] as const

export function Navbar() {
  const { t } = useTranslation()
  const location = useLocation()
  const { scrolled, progress } = useScrollProgress()
  const [menuOpen, setMenuOpen] = useState(false)
  const [lastLocationKey, setLastLocationKey] = useState(location.key)

  // A route change means the drawer has done its job. Adjusting state during
  // render (React's documented pattern for deriving from a changing prop)
  // closes it before paint, so the drawer never flashes over the new page —
  // and it covers back/forward navigation, not just taps on its own links.
  if (location.key !== lastLocationKey) {
    setLastLocationKey(location.key)
    setMenuOpen(false)
  }

  // Trap the page behind the drawer, and let Escape dismiss it.
  useEffect(() => {
    if (!menuOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  const isActive = (to: string) =>
    to.startsWith('/#') ? false : location.pathname === to

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-out-expo',
        scrolled ? 'py-2' : 'py-4',
      )}
    >
      {/* Reading-progress hairline */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px origin-[left] bg-linear-to-r from-accent via-accent-alt to-accent rtl:origin-[right]"
        style={{ transform: `scaleX(${progress})`, opacity: scrolled ? 1 : 0 }}
      />

      <Container>
        <nav
          className={cn(
            'flex h-16 items-center justify-between gap-4 rounded-2xl px-3 sm:px-4',
            'transition-all duration-500 ease-out-expo',
            scrolled
              ? 'glass shadow-[0_10px_40px_-24px_rgb(0_0_0/0.5)]'
              : 'border border-transparent bg-transparent',
          )}
        >
          <Link
            to="/"
            className="rounded-xl outline-offset-4"
            aria-label={t('brand.name')}
          >
            <Logo />
          </Link>

          {/* Desktop navigation */}
          <ul className="hidden items-center gap-1 lg:flex">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    'relative rounded-md px-4 py-2 text-sm font-semibold transition-colors duration-300',
                    isActive(item.to) ? 'text-fg' : 'text-muted hover:text-fg',
                  )}
                >
                  {t(item.labelKey)}
                  {isActive(item.to) && (
                    <span className="absolute inset-x-4 -bottom-px h-px bg-linear-to-r from-transparent via-accent to-transparent" />
                  )}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <LanguageToggle className="hidden sm:grid" />
            <ThemeToggle />

            {/*
              Sign in, not "get started".
              
              The old target was /#cta — an in-page anchor that scrolled to a
              section rather than doing anything. The primary action in the
              header should be the one a returning visitor came for, and it
              should go somewhere: /login is a real route with a real page
              behind it.
            */}
            <Link
              to="/login"
              className={buttonStyles({ size: 'sm', className: 'hidden lg:inline-flex' })}
            >
              {t('nav.signIn')}
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" />
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? t('common.closeMenu') : t('common.openMenu')}
              className="glass grid size-10 place-items-center rounded-md text-fg lg:hidden"
            >
              {menuOpen ? <X className="size-[18px]" /> : <Menu className="size-[18px]" />}
            </button>
          </div>
        </nav>
      </Container>

      {/* Mobile drawer */}
      <div
        id="mobile-menu"
        hidden={!menuOpen}
        className="fixed inset-0 top-0 z-50 lg:hidden"
      >
        <button
          type="button"
          aria-label={t('common.closeMenu')}
          onClick={() => setMenuOpen(false)}
          className="animate-fade-in absolute inset-0 bg-ink-950/50 backdrop-blur-sm"
        />

        {/*
          `bg-canvas/95` deliberately overrides the frosted fill: at drawer size
          the page below shows through too readably, and the scrim already
          supplies the sense of depth.
        */}
        <div className="animate-drawer glass absolute inset-x-3 top-3 rounded-3xl bg-canvas/95 p-5 shadow-2xl">
          <div className="flex items-center justify-between">
            <Logo />
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label={t('common.closeMenu')}
              className="grid size-10 place-items-center rounded-md text-muted hover:bg-raised hover:text-fg"
            >
              <X className="size-5" />
            </button>
          </div>

          <ul className="mt-6 flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="flex items-center justify-between rounded-2xl px-4 py-3.5 text-lg font-semibold text-fg transition-colors hover:bg-raised"
                >
                  {t(item.labelKey)}
                  <ArrowRight className="size-4 text-faint rtl:-scale-x-100" />
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-center justify-between gap-3 border-t border-line pt-5">
            <LanguageToggle />
            <Link to="/login" className={buttonStyles({ size: 'sm' })}>
              {t('nav.signIn')}
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
