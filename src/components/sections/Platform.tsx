import { Blocks, type LucideIcon, Plug, Rocket } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Spotlight } from '@/components/ui/Spotlight'

const STEPS: { key: 'connect' | 'compose' | 'ship'; Icon: LucideIcon }[] = [
  { key: 'connect', Icon: Plug },
  { key: 'compose', Icon: Blocks },
  { key: 'ship', Icon: Rocket },
]

export function Platform() {
  const { t } = useTranslation()

  return (
    <section id="platform" className="scroll-mt-28 py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow={t('platform.eyebrow')}
          title={t('platform.title')}
          subtitle={t('platform.subtitle')}
        />

        <div className="relative mt-16">
          {/* Rail joining the three steps — decorative, desktop only. */}
          <div
            aria-hidden="true"
            className="absolute inset-x-16 top-[4.5rem] hidden h-px bg-linear-to-r from-transparent via-accent/35 to-transparent lg:block"
          />

          <ol className="relative grid grid-cols-1 gap-6 lg:grid-cols-3">
            {STEPS.map(({ key, Icon }, index) => (
              <Reveal key={key} delay={index * 120} as="li">
                <Spotlight className="panel h-full rounded-3xl p-8 transition-all duration-500 ease-out-expo hover:-translate-y-1 hover:border-line-strong">
                  <div className="flex items-start justify-between gap-4">
                    <span className="grid size-14 place-items-center rounded-2xl bg-canvas text-accent ring-1 ring-line">
                      <Icon className="size-6" />
                    </span>
                    <span className="text-4xl font-black text-fg/10 tabular-nums select-none">
                      {t(`platform.steps.${key}.number`)}
                    </span>
                  </div>

                  <h3 className="mt-7 text-xl font-bold text-balance">
                    {t(`platform.steps.${key}.title`)}
                  </h3>
                  <p className="mt-3 leading-relaxed text-muted text-pretty">
                    {t(`platform.steps.${key}.body`)}
                  </p>
                </Spotlight>
              </Reveal>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  )
}
