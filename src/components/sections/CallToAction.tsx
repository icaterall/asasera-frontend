import { useTranslation } from 'react-i18next'

import { buttonStyles } from '@/components/ui/buttonStyles'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'

/**
 * The address a department writes to.
 *
 * Same mailbox as the footer's "contact", and deliberately not the
 * `privacy@asasera.com` published on /privacy and /data-deletion — that one is
 * the data-protection contact named in the policy and quoted to Meta, and
 * merging them would put deletion requests in the sales queue.
 */
const CONTACT_EMAIL = 'support@asasera.com'

/**
 * One call to action.
 *
 * There were two buttons here, "Get started free" and "Talk to the team", and
 * both pointed at /about — two routes to the same nothing, on a product with
 * nothing to sign up for yet. There is one thing a reader can actually do
 * today, so there is one button.
 */
export function CallToAction() {
  const { t } = useTranslation()

  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Asasera — my course')}`

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
            {/* A true circle, so `rounded-full` is the honest value here. */}
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

            {/*
              An <a>, not a router <Link>: react-router would treat a mailto:
              as a route and push a history entry instead of opening a mail
              client.
            */}
            <div className="mt-10 flex justify-center">
              <a href={mailto} className={buttonStyles({ size: 'lg' })}>
                {t('cta.primary')}
              </a>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
