import { ArrowRight, Mail } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { buttonStyles } from '@/components/ui/buttonStyles'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'

export function CallToAction() {
  const { t } = useTranslation()

  return (
    <section id="cta" className="scroll-mt-28 py-20 sm:py-28">
      <Container>
        <Reveal>
          <div className="border-gradient relative isolate overflow-hidden rounded-md px-6 py-16 text-center sm:px-12 sm:py-20">
            {/* Panel-local glow, clipped by the rounded container. */}
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-linear-140 from-brand-500/18 via-transparent to-teal-500/18"
            />
            <div
              aria-hidden="true"
              className="animate-drift absolute -bottom-40 start-1/2 -z-10 size-[34rem] -translate-x-1/2 rounded-full blur-[110px]"
              style={{ background: 'radial-gradient(circle, var(--glow-a), transparent 70%)' }}
            />
            <div aria-hidden="true" className="panel absolute inset-0 -z-20 rounded-md" />

            <h2 className="mx-auto max-w-2xl text-title font-extrabold text-balance">
              {t('cta.title')}
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-lead text-muted text-pretty">
              {t('cta.subtitle')}
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/about"
                className={buttonStyles({ size: 'lg', className: 'w-full sm:w-auto' })}
              >
                {t('cta.primary')}
                <ArrowRight className="size-[18px] transition-transform duration-300 group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
              </Link>

              <Link
                to="/about"
                className={buttonStyles({
                  variant: 'secondary',
                  size: 'lg',
                  className: 'w-full sm:w-auto',
                })}
              >
                <Mail className="size-[18px]" />
                {t('cta.secondary')}
              </Link>
            </div>

            <p className="mt-8 text-sm text-faint">{t('cta.note')}</p>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
