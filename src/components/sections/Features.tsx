import {
  Accessibility,
  Braces,
  Languages,
  type LucideIcon,
  MonitorSmartphone,
  Palette,
  Zap,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Spotlight } from '@/components/ui/Spotlight'
import { cn } from '@/lib/cn'

type FeatureKey = 'bidi' | 'responsive' | 'a11y' | 'tokens' | 'speed' | 'types'

// Bento layout: 1 column on phones, 2 from `sm`, a 6-track grid from `lg`.
const FEATURES: { key: FeatureKey; Icon: LucideIcon; span: string }[] = [
  { key: 'bidi', Icon: Languages, span: 'sm:col-span-2 lg:col-span-4' },
  { key: 'responsive', Icon: MonitorSmartphone, span: 'sm:col-span-1 lg:col-span-2' },
  { key: 'a11y', Icon: Accessibility, span: 'sm:col-span-1 lg:col-span-2' },
  { key: 'tokens', Icon: Palette, span: 'sm:col-span-1 lg:col-span-2' },
  { key: 'speed', Icon: Zap, span: 'sm:col-span-1 lg:col-span-2' },
  { key: 'types', Icon: Braces, span: 'sm:col-span-2 lg:col-span-6' },
]

const TYPED_SNIPPET = `t('features.bidi.title')   // ✓ resolves
t('features.bidi.titel')   // ✗ Error: not a key`

function FeatureCard({
  Icon,
  title,
  body,
  className,
  horizontal = false,
  children,
}: {
  Icon: LucideIcon
  title: string
  body: string
  className?: string
  horizontal?: boolean
  children?: ReactNode
}) {
  return (
    <Spotlight
      className={cn(
        'group panel h-full rounded-3xl p-7 transition-all duration-500 ease-out-expo',
        'hover:-translate-y-1 hover:border-line-strong sm:p-8',
        className,
      )}
    >
      <div className={cn('flex h-full gap-7', horizontal ? 'flex-col lg:flex-row lg:items-center' : 'flex-col')}>
        <div className="flex-1">
          <span className="grid size-12 place-items-center rounded-2xl bg-linear-120 from-accent/15 to-accent-alt/15 text-accent ring-1 ring-accent/25 transition-transform duration-500 ease-out-quart group-hover:scale-110">
            <Icon className="size-[21px]" />
          </span>

          <h3 className="mt-6 text-xl font-bold text-balance">{title}</h3>
          <p className="mt-3 leading-relaxed text-muted text-pretty">{body}</p>
        </div>

        {children}
      </div>
    </Spotlight>
  )
}

/** Shows the product's core claim rather than describing it. */
function MirrorDemo() {
  return (
    <div className="mt-7 grid grid-cols-1 gap-3 lg:grid-cols-2">
      {(
        [
          { dir: 'ltr', lang: 'en', label: 'English', line: 'Get started' },
          { dir: 'rtl', lang: 'ar', label: 'العربية', line: 'ابدأ الآن' },
        ] as const
      ).map((sample) => (
        <div
          key={sample.dir}
          dir={sample.dir}
          lang={sample.lang}
          className="rounded-2xl border border-line bg-canvas/60 p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-widest text-faint uppercase">
              {sample.dir}
            </span>
            <span className="text-[11px] font-semibold text-muted">{sample.label}</span>
          </div>

          <div className="mt-3 flex items-center gap-2.5">
            <span className="size-7 shrink-0 rounded-lg bg-linear-120 from-brand-500 to-brand-700" />
            <span className="h-2 flex-1 rounded-md bg-fg/12" />
          </div>

          <div className="mt-3 inline-flex rounded-md bg-brand-500 px-3 py-1.5 text-[11px] font-bold text-white">
            {sample.line}
          </div>
        </div>
      ))}
    </div>
  )
}

export function Features() {
  const { t } = useTranslation()

  return (
    <section id="features" className="scroll-mt-28 py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow={t('features.eyebrow')}
          title={t('features.title')}
          subtitle={t('features.subtitle')}
        />

        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6">
          {FEATURES.map(({ key, Icon, span }, index) => (
            <Reveal key={key} delay={index * 70} className={span}>
              <FeatureCard
                Icon={Icon}
                title={t(`features.items.${key}.title`)}
                body={t(`features.items.${key}.body`)}
                horizontal={key === 'types'}
              >
                {key === 'bidi' && <MirrorDemo />}

                {key === 'types' && (
                  <pre
                    dir="ltr"
                    className="w-full overflow-x-auto rounded-2xl border border-line bg-canvas/60 p-4 font-mono text-[12px] leading-relaxed text-muted lg:w-[26rem] lg:shrink-0"
                  >
                    <code>{TYPED_SNIPPET}</code>
                  </pre>
                )}
              </FeatureCard>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
