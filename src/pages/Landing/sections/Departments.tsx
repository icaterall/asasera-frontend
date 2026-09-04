import facesLarge from '@/assets/images/faces_success-1210.webp'
import facesMedium from '@/assets/images/faces_success-960.webp'
import facesSmall from '@/assets/images/faces_success-640.webp'
import facesFallback from '@/assets/images/faces_success.png'
import { useCopy } from '@/copy/useCopy'

import { Button } from '../ui/Button'
import { SectionShell } from '../ui/SectionShell'

/**
 * The buying section.
 *
 * This was a four-field contact form. It is now a mailto link, and that is a
 * deliberate downgrade rather than an unfinished one.
 *
 * The form posted nowhere. Its backend counterpart reads `contact_messages`
 * and `subscribers`, neither of which exists in the database, and the service
 * behind it keys them on UUIDs — which this project bans outright. Building
 * those tables to make the form work would mean creating a mailbox nobody
 * reads, for a product with no users, and adding UUIDs to a schema that has
 * none of them.
 *
 * A form that silently discards what a head of department typed is worse than
 * no form: it costs them their time and us the lead, and it does so
 * invisibly. A mailto link reaches a real person today.
 */
export function Departments() {
  const { t } = useCopy()

  const mailto = `mailto:${t('dept.email')}?subject=${encodeURIComponent(t('dept.emailSubject'))}`

  return (
    <SectionShell id="departments" tone="tint" labelledBy="departments-title">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          {/* Gradient use 2 of 2: a short rule opening the buying section. */}
          <span
            aria-hidden="true"
            className="mb-6 block h-[3px] w-16 rounded-sm bg-gradient-to-l from-brand-500 to-teal-500"
          />

          <h2 id="departments-title" className="text-title font-bold text-fg">
            {t('dept.title')}
          </h2>

          <p className="mt-4 max-w-[52ch] text-lead text-muted">{t('dept.body')}</p>

          {/*
            `Button` renders an <a> when given href, so this stays a link to
            the keyboard and to a screen reader rather than a button that
            happens to navigate.
          */}
          <div className="mt-8">
            <Button href={mailto} variant="primary" size="lg">
              {t('dept.cta')}
            </Button>
            <p className="mt-3 text-sm text-muted">{t('dept.emailHint')}</p>
          </div>
        </div>

        <picture>
          <source media="(min-width: 1024px)" srcSet={facesLarge} type="image/webp" />
          <source media="(min-width: 640px)" srcSet={facesMedium} type="image/webp" />
          <source srcSet={facesSmall} type="image/webp" />
          <img
            src={facesFallback}
            alt={t('dept.imageAlt')}
            width={1210}
            height={999}
            loading="lazy"
            decoding="async"
            sizes="(min-width: 1024px) 34rem, 100vw"
            className="aspect-[1210/999] w-full rounded-md border border-line object-cover"
          />
        </picture>
      </div>
    </SectionShell>
  )
}
