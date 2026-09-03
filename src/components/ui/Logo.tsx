import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/cn'

/**
 * The mark is an "A" resting on a bar — the literal reading of *asas*
 * (أساس), "foundation".
 */
export function LogoMark({ className }: { className?: string }) {
  const gradientId = useId()

  return (
    <svg
      viewBox="0 0 32 32"
      className={cn('size-9 shrink-0', className)}
      role="presentation"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--color-brand-400)" />
          <stop offset="55%" stopColor="var(--color-brand-600)" />
          <stop offset="100%" stopColor="var(--color-teal-500)" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="4.4" fill={`url(#${gradientId})`} />
      <path
        d="M16 6.4 26 25.6h-5.1L16 16.2l-4.9 9.4H6z"
        fill="#fff"
        fillOpacity="0.96"
      />
      <rect x="11.5" y="19.3" width="9" height="2.5" rx="1.25" fill="#fff" fillOpacity="0.55" />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  const { t } = useTranslation()

  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark />
      <span className="text-xl font-extrabold tracking-tight">{t('brand.name')}</span>
    </span>
  )
}
