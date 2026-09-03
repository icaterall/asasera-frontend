import { useCallback, type PointerEvent, type ReactNode } from 'react'

import { cn } from '@/lib/cn'

/**
 * Writes the pointer position into `--mx`/`--my` so the `.spotlight` glow in
 * index.css can follow the cursor. Purely decorative: with no pointer the
 * gradient falls back to the element's centre.
 */
export function Spotlight({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const handlePointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const target = event.currentTarget
    const rect = target.getBoundingClientRect()
    target.style.setProperty('--mx', `${event.clientX - rect.left}px`)
    target.style.setProperty('--my', `${event.clientY - rect.top}px`)
  }, [])

  return (
    <div className={cn('spotlight', className)} onPointerMove={handlePointerMove}>
      {children}
    </div>
  )
}
