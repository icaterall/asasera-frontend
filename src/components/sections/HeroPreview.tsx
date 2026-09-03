import { Compass, LayoutGrid, Layers, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { LogoMark } from '@/components/ui/Logo'
import { useLanguage } from '@/hooks/useLanguage'
import { cn } from '@/lib/cn'

const BARS = [38, 55, 44, 72, 61, 88, 70, 96, 82, 64, 91, 76]

const SIDEBAR_ICONS = [LayoutGrid, Layers, Compass, Settings]

// Deltas are all positive, so they all read in the secondary green.
const TILES = [
  { value: '12ms', delta: '+8%' },
  { value: '38', delta: '+2' },
  { value: '99.98%', delta: '+0.1' },
]

/**
 * A stylised product surface rather than a screenshot: everything is real
 * markup, so it mirrors with `dir` and re-themes along with the page.
 */
export function HeroPreview() {
  const { t } = useTranslation()
  const { current } = useLanguage()

  return (
    <div className="relative">
      <div className="border-gradient panel rounded-md p-2 shadow-[0_40px_120px_-40px_rgb(0_0_0/0.55)]">
        <div className="overflow-hidden rounded-md bg-raised">
          {/* Window chrome */}
          <div className="flex items-center gap-2 border-b border-line px-4 py-3">
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
            <div className="mx-auto rounded-md bg-canvas px-3 py-1 font-mono text-[11px] text-faint">
              app.asasera.com
            </div>
          </div>

          <div className="flex">
            {/* Rail */}
            <aside className="hidden flex-col items-center gap-4 border-e border-line px-3 py-5 sm:flex">
              <LogoMark className="size-7" />
              <div className="mt-2 flex flex-col gap-4">
                {SIDEBAR_ICONS.map((Icon, index) => (
                  <span
                    key={Icon.displayName ?? index}
                    className={
                      index === 0
                        ? 'grid size-8 place-items-center rounded-lg bg-accent/15 text-accent'
                        : 'grid size-8 place-items-center rounded-lg text-faint'
                    }
                  >
                    <Icon className="size-[15px]" />
                  </span>
                ))}
              </div>
            </aside>

            <div className="min-w-0 flex-1 p-4 sm:p-5">
              {/* Header row */}
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="h-2.5 w-28 rounded-md bg-fg/15" />
                  <div className="mt-2 h-2 w-20 rounded-md bg-fg/8" />
                </div>
                {/* The mock's own switch tracks the real one. */}
                <div className="flex shrink-0 items-center gap-1 rounded-md border border-line p-0.5">
                  {(['en', 'ar'] as const).map((code) => (
                    <span
                      key={code}
                      lang={code}
                      className={cn(
                        'rounded-md px-2.5 py-1 text-[10px] font-bold',
                        current.code === code ? 'bg-brand-500 text-white' : 'text-faint',
                      )}
                    >
                      {code === 'en' ? 'EN' : 'ع'}
                    </span>
                  ))}
                </div>
              </div>

              {/* Metric tiles */}
              <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
                {TILES.map((tile) => (
                  <div key={tile.value} className="rounded-xl border border-line p-2.5 sm:p-3">
                    <div
                      dir="ltr"
                      className="truncate text-sm font-bold tabular-nums sm:text-base"
                    >
                      {tile.value}
                    </div>
                    <div dir="ltr" className="mt-1 text-[10px] font-semibold text-accent-alt">
                      {tile.delta}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chart */}
              <div className="mt-4 flex h-28 items-end gap-1.5 sm:h-32 sm:gap-2">
                {BARS.map((height, index) => (
                  <div
                    key={height}
                    className="animate-grow flex-1 origin-bottom rounded-t-md bg-linear-to-t from-brand-600/25 to-brand-400"
                    style={{ height: `${height}%`, animationDelay: `${300 + index * 55}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating chips — the whole point of the product, stated visually. */}
      <div
        className="animate-float glass absolute -top-5 -end-2 rounded-2xl px-4 py-2.5 shadow-xl sm:-end-9"
        style={{ animationDelay: '0.6s' }}
      >
        <div className="text-[10px] font-bold tracking-widest text-faint uppercase">RTL</div>
        <div lang="ar" dir="rtl" className="text-sm font-bold">
          العربية
        </div>
      </div>

      <div
        className="animate-float glass absolute -bottom-9 -start-2 rounded-2xl px-4 py-2.5 shadow-xl sm:-start-8"
        style={{ animationDelay: '1.4s' }}
      >
        <div className="text-[10px] font-bold tracking-widest text-faint uppercase">LTR</div>
        <div lang="en" dir="ltr" className="text-sm font-bold">
          English
        </div>
      </div>

      <span className="sr-only">{t('hero.marqueeLabel')}</span>
    </div>
  )
}
