import { Reveal } from './Reveal'
import { cn } from '@/lib/cn'

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  className,
}: {
  eyebrow: string
  title: string
  subtitle?: string
  className?: string
}) {
  return (
    <div className={cn('mx-auto max-w-3xl text-center', className)}>
      <Reveal>
        <span className="inline-flex items-center gap-2 rounded-md border border-line px-4 py-1.5 text-xs font-bold tracking-[0.14em] text-accent uppercase">
          {eyebrow}
        </span>
      </Reveal>

      <Reveal delay={80}>
        <h2 className="mt-6 text-title font-extrabold text-balance">{title}</h2>
      </Reveal>

      {subtitle && (
        <Reveal delay={150}>
          <p className="mt-5 text-lead text-muted text-pretty">{subtitle}</p>
        </Reveal>
      )}
    </div>
  )
}
