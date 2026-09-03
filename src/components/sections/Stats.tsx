import { useTranslation } from 'react-i18next'

import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { cn } from '@/lib/cn'

const KEYS = ['uptime', 'latency', 'regions', 'rating'] as const

export function Stats() {
  const { t } = useTranslation()
  const last = KEYS.length - 1

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="border-gradient panel grid grid-cols-2 overflow-hidden rounded-3xl lg:grid-cols-4">
          {KEYS.map((key, index) => (
            <Reveal
              key={key}
              delay={index * 90}
              className={cn(
                'px-5 py-9 text-center sm:px-8 sm:py-11',
                // Two columns on small screens, four from `lg` — the dividers
                // are placed by index so they never double up on a row edge.
                'border-line lg:border-b-0',
                index % 2 === 0 && 'border-e',
                index < 2 && 'border-b',
                index === last ? 'lg:border-e-0' : 'lg:border-e',
              )}
            >
              {/* `dir` isolation keeps signs and units on the correct side in RTL. */}
              <div dir="ltr" className="text-hero font-extrabold tabular-nums">
                <span className="text-gradient">{t(`stats.${key}.value`)}</span>
              </div>
              <div className="mt-3 text-sm text-muted text-balance">
                {t(`stats.${key}.label`)}
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
