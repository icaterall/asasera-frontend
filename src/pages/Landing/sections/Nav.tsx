import { useEffect, useId, useRef, useState } from 'react'

import logoLight from '@/assets/images/asas-logo-light.webp'
import logo from '@/assets/images/asas-logo.svg'
import { useCopy } from '@/copy/useCopy'

import { Button } from '../ui/Button'
import { LandingThemeToggle } from '../ui/HeaderControls'
import { IconClose, IconMenu } from '../ui/Icons'
import { LanguageToggle } from '../ui/LanguageToggle'

const links = [
  { href: '#how', key: 'nav.howItWorks' },
  { href: '#types', key: 'nav.types' },
  { href: '#pricing', key: 'nav.pricing' },
  { href: '#departments', key: 'nav.departments' },
] as const

/**
 * Sticky slim navigation.
 *
 * The language control stays on the bar at every width, never inside the
 * sheet. A visitor who needs the other language often cannot read the menu
 * button that would hide it, which makes "tap the hamburger to find English"
 * the one piece of navigation this page cannot afford to nest.
 *
 * The section links do collapse into a disclosure — a plain one, not a modal:
 * there is nothing behind it to protect, and a focus trap on a nav menu is a
 * keyboard dead end more often than a help. It closes on Escape and on
 * navigation.
 */
export function Nav() {
  const { t } = useCopy()
  const [open, setOpen] = useState(false)
  const sheetId = useId()
  const toggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  return (
    <header className="sticky top-0 z-50 border-b border-asas-line bg-asas-surface/92 backdrop-blur-sm">
      <nav
        aria-label={t('nav.menuLabel')}
        className="mx-auto flex max-w-[1200px] items-center gap-3 px-5 py-3 md:gap-4 md:px-8"
      >
        <a href="#top" className="flex shrink-0 items-center rounded-asas-sm" aria-label={t('nav.brandAlt')}>
          {/*
            The primary mark's wordmark is near-black and all but vanishes on
            the dark header, so both files ship and a CSS variant picks one —
            painted correctly on the first frame rather than flipped after
            hydration.
          */}
          <img
            src={logo}
            alt={t('nav.brandAlt')}
            width={132}
            height={34}
            className="h-8 w-auto md:h-[34px] dark:hidden"
          />
          <img
            src={logoLight}
            alt=""
            aria-hidden="true"
            width={132}
            height={34}
            className="hidden h-8 w-auto md:h-[34px] dark:block"
          />
        </a>

        <ul className="ms-4 hidden flex-1 items-center gap-7 lg:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="rounded-asas-sm text-asas-small font-medium text-asas-ink transition-colors hover:text-asas-accent"
              >
                {t(link.key)}
              </a>
            </li>
          ))}
        </ul>

        <div className="ms-auto flex items-center gap-2 lg:ms-0 lg:gap-3">
          {/* Start of the action cluster, before the login link. */}
          <LanguageToggle />

          <LandingThemeToggle className="hidden sm:grid" />

          <Button href="/login" variant="quiet" className="hidden lg:inline-flex">
            {t('nav.login')}
          </Button>

          <Button href="#join" variant="primary" className="hidden sm:inline-flex">
            {t('nav.cta')}
          </Button>

          <button
            ref={toggleRef}
            type="button"
            className="grid size-11 place-items-center rounded-asas text-asas-ink lg:hidden"
            aria-expanded={open}
            aria-controls={sheetId}
            aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <IconClose /> : <IconMenu />}
          </button>
        </div>
      </nav>

      <div id={sheetId} hidden={!open} className="border-t border-asas-line bg-asas-surface lg:hidden">
        <ul className="mx-auto flex max-w-[1200px] flex-col px-5 py-2">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                className="block min-h-12 rounded-asas-sm py-3 font-medium text-asas-ink"
              >
                {t(link.key)}
              </a>
            </li>
          ))}
          <li>
            <a href="/login" className="block min-h-12 border-t border-asas-line py-3 font-medium text-asas-ink">
              {t('nav.login')}
            </a>
          </li>
          {/* Only the controls the narrow bar could not fit. */}
          <li className="border-t border-asas-line py-3 sm:hidden">
            <Button href="#join" variant="primary" className="w-full">
              {t('nav.cta')}
            </Button>
          </li>
          <li className="flex items-center justify-between gap-3 border-t border-asas-line py-3 sm:hidden">
            <span className="font-medium text-asas-ink">{t('nav.toggleTheme')}</span>
            <LandingThemeToggle />
          </li>
        </ul>
      </div>
    </header>
  )
}
