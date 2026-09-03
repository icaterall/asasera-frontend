import { Heart, type LucideIcon, Scale, Unlock } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { CallToAction } from '@/components/sections/CallToAction'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { Spotlight } from '@/components/ui/Spotlight'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const VALUES: { key: 'craft' | 'parity' | 'openness'; Icon: LucideIcon }[] = [
  { key: 'craft', Icon: Heart },
  { key: 'parity', Icon: Scale },
  { key: 'openness', Icon: Unlock },
]

const MILESTONES = ['founded', 'opensource', 'seed', 'beta'] as const

export default function About() {
  const { t } = useTranslation()
  useDocumentTitle(t('nav.about'))

  return (
    <>
      <section className="pt-36 pb-16 sm:pt-44">
        <Container>
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <span className="inline-flex items-center rounded-md border border-line px-4 py-1.5 text-xs font-bold tracking-[0.14em] text-accent uppercase">
                {t('about.eyebrow')}
              </span>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="mt-6 text-hero font-extrabold text-balance">{t('about.title')}</h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="mt-7 text-lead text-muted text-pretty">{t('about.lead')}</p>
            </Reveal>

            <Reveal delay={220}>
              <p className="mt-5 leading-relaxed text-muted text-pretty">{t('about.body')}</p>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Values */}
      <section className="py-16 sm:py-20">
        <Container>
          <Reveal>
            <h2 className="text-title font-extrabold text-balance">{t('about.values.heading')}</h2>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
            {VALUES.map(({ key, Icon }, index) => (
              <Reveal key={key} delay={index * 100}>
                <Spotlight className="panel h-full rounded-3xl p-8 transition-all duration-500 ease-out-expo hover:-translate-y-1 hover:border-line-strong">
                  <span className="grid size-12 place-items-center rounded-2xl bg-linear-120 from-accent/15 to-accent-alt/15 text-accent ring-1 ring-accent/25">
                    <Icon className="size-[21px]" />
                  </span>
                  <h3 className="mt-6 text-xl font-bold text-balance">
                    {t(`about.values.${key}.title`)}
                  </h3>
                  <p className="mt-3 leading-relaxed text-muted text-pretty">
                    {t(`about.values.${key}.body`)}
                  </p>
                </Spotlight>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Timeline — the rail sits on the inline-start edge, so it mirrors. */}
      <section className="py-16 sm:py-20">
        <Container>
          <Reveal>
            <h2 className="text-title font-extrabold text-balance">
              {t('about.timeline.heading')}
            </h2>
          </Reveal>

          <ol className="relative mt-12 ms-3 border-s border-line ps-8 sm:ps-10">
            {MILESTONES.map((key, index) => (
              <Reveal key={key} delay={index * 90} as="li" className="relative pb-11 last:pb-0">
                <span
                  aria-hidden="true"
                  className="absolute -start-[2.3rem] top-1.5 grid size-4 place-items-center rounded-full bg-canvas ring-1 ring-line sm:-start-[2.8rem]"
                >
                  <span className="size-2 rounded-full bg-linear-120 from-accent to-accent-alt" />
                </span>

                <span className="font-mono text-sm font-bold text-accent tabular-nums">
                  {t(`about.timeline.items.${key}.year`)}
                </span>
                <h3 className="mt-1.5 text-lg font-bold text-balance">
                  {t(`about.timeline.items.${key}.title`)}
                </h3>
                <p className="mt-2 max-w-xl leading-relaxed text-muted text-pretty">
                  {t(`about.timeline.items.${key}.body`)}
                </p>
              </Reveal>
            ))}
          </ol>
        </Container>
      </section>

      <CallToAction />
    </>
  )
}
