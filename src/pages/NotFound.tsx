import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { buttonStyles } from '@/components/ui/buttonStyles'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function NotFound() {
  const { t } = useTranslation()
  useDocumentTitle(t('notFound.code'))

  return (
    <section className="grid min-h-svh place-items-center py-32">
      <Container>
        <div className="mx-auto max-w-xl text-center">
          <Reveal>
            <p className="text-display leading-none font-black">
              <span className="text-gradient">{t('notFound.code')}</span>
            </p>
          </Reveal>

          <Reveal delay={90}>
            <h1 className="mt-6 text-title font-extrabold text-balance">{t('notFound.title')}</h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-5 text-lead text-muted text-pretty">{t('notFound.body')}</p>
          </Reveal>

          <Reveal delay={230}>
            <Link to="/" className={buttonStyles({ size: 'lg', className: 'mt-10' })}>
              {t('common.backHome')}
              <ArrowRight className="size-[18px] transition-transform duration-300 group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
            </Link>
          </Reveal>
        </div>
      </Container>
    </section>
  )
}
