import { useCopy } from '@/copy/useCopy'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/cn'

import { IconMoon, IconSun } from './Icons'

/**
 * Theme control, in the landing page's own clothes.
 *
 * It wraps the app's shared `useTheme` hook rather than re-implementing
 * state, so the header switches the theme for the whole application and a
 * visitor moving between routes keeps their choice.
 *
 * What is not reused is the presentation: the shared `ThemeToggle` is drawn
 * with the starter's `glass` panel, `text-muted`/`text-fg` tokens and
 * lucide-react icons, and importing it would pull an icon package into a page
 * whose brief bans one. Behaviour shared, skin local.
 */
export function LandingThemeToggle({ className }: { className?: string }) {
  const { t } = useCopy()
  const { resolved, toggle } = useTheme()
  const isDark = resolved === 'dark'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t('nav.toggleTheme')}
      title={isDark ? t('nav.lightMode') : t('nav.darkMode')}
      className={cn(
        'grid size-[34px] shrink-0 place-items-center rounded-asas border border-asas-line',
        'text-asas-muted transition-colors hover:text-asas-ink',
        className,
      )}
    >
      {/*
        Both glyphs render and cross-fade, so the control never reflows as it
        swaps. `motion-reduce` drops the transition, not the swap — the icon
        still changes, it just does not animate.
      */}
      <IconSun
        size={17}
        className={cn(
          'col-start-1 row-start-1 transition-opacity duration-300 motion-reduce:transition-none',
          isDark ? 'opacity-0' : 'opacity-100',
        )}
      />
      <IconMoon
        size={17}
        className={cn(
          'col-start-1 row-start-1 transition-opacity duration-300 motion-reduce:transition-none',
          isDark ? 'opacity-100' : 'opacity-0',
        )}
      />
    </button>
  )
}
