import { Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/cn'

/** Sun and moon are stacked and cross-rotated so the swap reads as one motion. */
export function ThemeToggle({ className }: { className?: string }) {
  const { t } = useTranslation()
  const { resolved, toggle } = useTheme()
  const isDark = resolved === 'dark'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t('common.toggleTheme')}
      title={isDark ? t('common.lightMode') : t('common.darkMode')}
      className={cn(
        'glass group relative grid size-10 place-items-center overflow-hidden rounded-md',
        'text-muted transition-colors duration-300 hover:text-fg',
        className,
      )}
    >
      <Sun
        aria-hidden="true"
        className={cn(
          'col-start-1 row-start-1 size-[18px] transition-all duration-500 ease-out-quart',
          isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100',
        )}
      />
      <Moon
        aria-hidden="true"
        className={cn(
          'col-start-1 row-start-1 size-[18px] transition-all duration-500 ease-out-quart',
          isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0',
        )}
      />
    </button>
  )
}
