import { useTranslation } from 'react-i18next'

import { useLanguage } from '@/hooks/useLanguage'
import { cn } from '@/lib/cn'

const SHORT_LABEL: Record<string, string> = { en: 'EN', ar: 'ع' }

/**
 * Segmented EN / ع control. The sliding indicator is offset with a physical
 * transform, so it needs the `rtl:` flip — everything else is laid out with
 * logical properties and mirrors on its own.
 */
export function LanguageToggle({ className }: { className?: string }) {
  const { t } = useTranslation()
  const { current, languages, setLanguage } = useLanguage()
  const activeIndex = languages.findIndex((l) => l.code === current.code)

  return (
    <div
      role="group"
      aria-label={t('common.language')}
      className={cn(
        'glass relative grid h-10 grid-cols-2 items-center rounded-md p-1',
        // Last, so a surface that is dark in both themes (the footer) can
        // restate the ground rather than inheriting a light panel.
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-y-1 start-1 w-[calc(50%-0.25rem)] rounded-md',
          'bg-linear-120 from-brand-500 to-brand-700',
          'shadow-[0_6px_18px_-6px_var(--color-brand-600)]',
          'transition-transform duration-500 ease-out-quart',
          activeIndex === 1 && 'translate-x-full rtl:-translate-x-full',
        )}
      />
      {languages.map((language) => {
        const isActive = language.code === current.code
        return (
          <button
            key={language.code}
            type="button"
            lang={language.code}
            onClick={() => setLanguage(language.code)}
            aria-pressed={isActive}
            aria-label={
              language.code === 'ar' ? t('common.switchToArabic') : t('common.switchToEnglish')
            }
            className={cn(
              'relative z-10 h-8 rounded-md px-3 text-sm font-bold transition-colors duration-300',
              isActive ? 'text-white' : 'text-muted hover:text-fg',
            )}
          >
            {SHORT_LABEL[language.code] ?? language.code.toUpperCase()}
          </button>
        )
      })}
    </div>
  )
}
