import { useCopy } from '@/copy/useCopy'
import type { LandingLanguage } from '@/copy/language-context'
import { cn } from '@/lib/cn'

/*
 * AR is always the first segment, in both languages.
 *
 * Reordering the segments to put the active language first would move the
 * target under the user's finger between renders — the control they just
 * pressed would no longer be where they pressed it. Order is a property of
 * the control, not of the state.
 */
const SEGMENTS = [
  { code: 'ar' as const, labelKey: 'nav.arabicShort' as const, ariaKey: 'nav.switchToArabic' as const },
  { code: 'en' as const, labelKey: 'nav.englishShort' as const, ariaKey: 'nav.switchToEnglish' as const },
]

/**
 * Segmented AR / EN control.
 *
 * A segmented control rather than a dropdown: with two options, a select
 * costs a tap to open and hides the alternative until then, and this is a
 * decision a visitor makes once, immediately, from the top of the page.
 *
 * Each segment is a real `<button>` inside `role="group"`, with
 * `aria-pressed` marking the active one — so the pair announces as two
 * toggles rather than as a listbox that never behaves like one.
 */
export function LanguageToggle({ className }: { className?: string }) {
  const { lang, t, setLanguage } = useCopy()

  return (
    <div
      role="group"
      aria-label={t('nav.language')}
      className={cn(
        'inline-flex h-[34px] shrink-0 items-center gap-0.5 rounded-asas border border-asas-line p-0.5',
        className,
      )}
    >
      {SEGMENTS.map(({ code, labelKey, ariaKey }) => {
        const isActive = code === lang
        return (
          <button
            key={code}
            type="button"
            lang={code}
            onClick={() => setLanguage(code as LandingLanguage)}
            aria-pressed={isActive}
            aria-label={t(ariaKey)}
            className={cn(
              'inline-flex h-[28px] min-w-[34px] items-center justify-center rounded-asas-sm px-2.5 text-asas-small transition-colors',
              isActive
                ? 'bg-asas-surface font-medium text-asas-accent'
                : 'bg-transparent font-normal text-asas-muted hover:text-asas-ink',
            )}
          >
            {/*
              Each segment is labelled in its own script — ع for Arabic, EN
              for English — so the label is legible to the reader who needs
              it without depending on their reading the other one. Neither is
              a direction hazard: a lone Arabic letter and a Latin pair each
              resolve on their own.

              OPTICAL ALIGNMENT. The two boxes already line up — measured,
              both spans sit at the same offset and the same height inside
              their buttons. What does not line up is the ink. "EN" is all
              cap-height above the baseline (ascent 12.0, descent 0.1) while
              "ع" straddles it (ascent 7.8, descent 4.2), so their visual
              centres sit 4.1px apart at 16px and the pair reads as two
              different rows.

              Centring the line box cannot fix that — the line box is already
              centred. So each label is nudged half the difference toward the
              other, in `em` so it holds at any size: Arabic up, Latin down.
              This is a property of the two scripts, not of these strings.
            */}
            <span className={code === 'ar' ? '-translate-y-[0.13em]' : 'translate-y-[0.13em]'}>
              {t(labelKey)}
            </span>
          </button>
        )
      })}
    </div>
  )
}
