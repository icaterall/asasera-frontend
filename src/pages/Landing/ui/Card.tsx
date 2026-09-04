import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

type CardProps = {
  children: ReactNode
  className?: string
  /** Lifts the card off a tinted section without reaching for a heavy shadow. */
  raised?: boolean
  as?: 'div' | 'li' | 'article'
}

/**
 * A soft-bordered panel.
 *
 * Border first, shadow second, and the shadow carries a real offset and blur
 * rather than a zero-offset halo. On the tinted sections the white fill is
 * what separates the card from the ground; the border only defines its edge.
 */
export function Card({ children, className, raised = false, as: Tag = 'div' }: CardProps) {
  return (
    <Tag
      className={cn(
        'rounded-asas border border-asas-line bg-asas-surface',
        raised && 'shadow-[0_1px_2px_rgb(16_35_61/0.04),0_10px_30px_-18px_rgb(16_35_61/0.28)]',
        className,
      )}
    >
      {children}
    </Tag>
  )
}
