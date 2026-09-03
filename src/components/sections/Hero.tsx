import { ArrowRight, PlayCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { buttonStyles } from '@/components/ui/buttonStyles'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { HeroPreview } from './HeroPreview'

const CLIENTS = ['NOOR BANK', 'FALAK AIR', 'MIRATH', 'QANAT', 'SOUQ LABS', 'TADWEEN', 'RIHLA']

export function Hero() {
  const { t } = useTranslation()

  return (
    <section className="relative overflow-hidden pt-36 pb-24 sm:pt-44 lg:pt-52">
      <Container>
        <div className="mx-auto max-w-4xl text-center">
          <Reveal>
            <span className="glass inline-flex items-center gap-2.5 rounded-md py-1.5 pe-4 ps-2 text-sm font-medium text-muted">
              <span className="relative grid size-6 place-items-center">
                <span className="animate-pulse-ring absolute size-2.5 rounded-full bg-accent" />
                <span className="size-2 rounded-full bg-accent" />
              </span>
              {t('hero.badge')}
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-7 text-display font-extrabold text-balance">
              {t('hero.titleLead')}{' '}
              <span className="text-gradient">{t('hero.titleAccent')}</span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mx-auto mt-7 max-w-2xl text-lead text-muted text-pretty">
              {t('hero.subtitle')}
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/#cta"
                className={buttonStyles({ size: 'lg', className: 'w-full sm:w-auto' })}
              >
                {t('hero.ctaPrimary')}
                <ArrowRight className="size-[18px] transition-transform duration-300 group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
              </Link>

              <Link
                to="/#platform"
                className={buttonStyles({
                  variant: 'secondary',
                  size: 'lg',
                  className: 'w-full sm:w-auto',
                })}
              >
                <PlayCircle className="size-[18px]" />
                {t('hero.ctaSecondary')}
              </Link>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <p className="mt-6 text-sm text-faint">{t('hero.trust')}</p>
          </Reveal>
        </div>

        <Reveal delay={380} className="mx-auto mt-20 max-w-5xl">
          <HeroPreview />
        </Reveal>
      </Container>

      {/* Client marquee */}
      <Reveal delay={200} className="mt-24">
        <p className="text-center text-xs font-semibold tracking-[0.18em] text-faint uppercase">
          {t('hero.marqueeLabel')}
        </p>

        <div
          className="relative mt-8 flex overflow-hidden"
          style={{
            maskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)',
            WebkitMaskImage:
              'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)',
          }}
        >
          {/* Duplicated once so the -50% translation loops seamlessly. */}
          <div className="animate-marquee flex w-max shrink-0 items-center gap-14 pe-14">
            {[...CLIENTS, ...CLIENTS].map((name, index) => (
              <span
                key={`${name}-${index}`}
                dir="ltr"
                className="text-lg font-bold tracking-wider whitespace-nowrap text-fg/25 transition-colors duration-300 hover:text-fg/50 sm:text-xl"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  )
}
