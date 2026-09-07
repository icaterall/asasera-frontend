import { Outlet, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Aurora } from '@/components/ui/Aurora'
import { AuthBackdrop } from '@/components/ui/AuthBackdrop'
import { LanguageToggle } from '@/components/ui/LanguageToggle'
import { Logo } from '@/components/ui/Logo'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { ScrollManager } from './ScrollManager'

/**
 * Chevron pointing at the inline start. Inline SVG — no icon package.
 *
 * `rtl:-scale-x-100` is a physical flip, and one of the few places this
 * project allows one. The house rule is that mirroring should be structural —
 * logical properties, no direction-conditional CSS — because layout mirrors
 * on its own when it is expressed that way. An arrowhead does not: its
 * meaning IS a physical direction, "the way you came from", and in Arabic
 * that is to the right. There is no logical property for the shape of a path,
 * so the glyph is mirrored explicitly and the reason is written down.
 *
 * Stroke is `currentColor`, so it takes the button's white without knowing
 * anything about the button.
 */
function BackChevron() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4 shrink-0 rtl:-scale-x-100">
      <path
        d="M10 3L5 8l5 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * The shell for signing in and signing up. One task per screen, nothing else.
 *
 * The marketing navigation is deliberately absent. On the shared Layout a
 * person part-way through creating an account can see Home, How it works,
 * Pricing and About — four ways to lose the thing they were doing, on a screen
 * whose entire job is one decision. What stays is what they may legitimately
 * need mid-flow: the logo as a way out, the language and theme controls, and
 * the legal links.
 *
 * `showBack` is opt-in per screen rather than automatic: the first step of a
 * flow has nowhere to go back TO, and a back control that lands on the
 * marketing site mid-signup reads as an escape hatch rather than a step.
 */
export function AuthLayout({ showBack = true }: { showBack?: boolean }) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    /*
     * A min-height column, so the footer settles at the bottom of a short
     * viewport and scrolls normally on a tall one.
     *
     * The flex-1 is on <main>, NOT a `justify-center` on the column. That
     * distinction is the point: centring would push the panel down by half
     * the leftover space, which is exactly the 274px drop this replaces.
     * Growing the main lets the leftover space fall BELOW the panel, so the
     * footer moves and the panel does not.
     *
     * `dvh` rather than `vh` because a mobile browser's toolbar makes `vh`
     * taller than the visible viewport, which would put the footer just off
     * the bottom of every phone screen.
     */
    <div className="flex min-h-dvh flex-col">
      <ScrollManager />
      {/*
        Two backdrop layers, in this order. `Aurora` is the app-wide colour
        wash and paints first; the geometric shapes sit on top of it and
        below everything else. Both are fixed at z-index -10, so the DOM
        order is what stacks them.

        Both are rendered HERE rather than inside the routed screen, and
        that is the whole reason the animation survives moving from one
        signup step to the next: AuthLayout is the parent route element, so
        React keeps it mounted while the <Outlet/> beneath swaps.
      */}
      <Aurora dim />
      <AuthBackdrop />

      <a
        href="#main"
        className="glass fixed start-4 top-4 z-100 -translate-y-24 rounded-md px-5 py-3 text-sm font-semibold transition-transform duration-300 focus-visible:translate-y-0"
      >
        {t('common.skipToContent')}
      </a>

      <header className="relative z-10">
        {/*
          Full width, not a centred container.
          
          The reference puts the logo hard against the top-left corner and the
          language control against the top-right. `max-w-6xl mx-auto` centred
          both, so on a wide screen they floated ~470px in from the edges and
          the page lost the frame the reference gets from them.
        */}
        <div className="flex w-full items-center justify-between gap-4 px-5 py-4 sm:px-6">
          {/* The logo is a link home — the one deliberate way out of the flow. */}
          <a href="/" aria-label={t('nav.home')} className="rounded-sm">
            <Logo className="h-8 w-auto" />
          </a>

          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>

        {showBack ? (
          <div className="w-full px-5 sm:px-6">
            {/*
              `navigate(-1)` rather than a fixed path: these screens form a
              chain, and each one's previous step differs depending on whether
              the person arrived from the landing page, a direct link, or the
              step before it.
            */}
            <button type="button" onClick={() => navigate(-1)} className="auth-back">
              <BackChevron />
              {t('common.back')}
            </button>
          </div>
        ) : null}
      </header>

      <main id="main" className="relative z-10 flex-1 px-5 pb-16 sm:px-8">
        <Outlet />
      </main>

      {/*
        The legal links stay, because this is the screen where consent is
        actually given. Everything else the marketing footer carries is noise
        here.
      */}
      <footer className="relative z-10 px-5 pb-10 text-center sm:px-8">
        <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
          <a href="/privacy" className="underline underline-offset-2">
            {t('footer.legal.privacy')}
          </a>
          {' · '}
          <a href="/data-deletion" className="underline underline-offset-2">
            {t('footer.legal.dataDeletion')}
          </a>
        </p>
      </footer>
    </div>
  )
}
