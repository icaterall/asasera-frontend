import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react'

import { cn } from '@/lib/cn'

type RevealProps = {
  children: ReactNode
  className?: string
  /** Stagger, in milliseconds. */
  delay?: number
  as?: ElementType
}

/**
 * Skip the animation entirely when the user asked for reduced motion, or when
 * the browser has no IntersectionObserver. Deciding this during the initial
 * render (rather than in an effect) means those users never see a flash of
 * hidden content.
 */
function shouldSkipAnimation() {
  return (
    typeof IntersectionObserver === 'undefined' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/**
 * Fades and lifts its children into view once, the first time they cross the
 * viewport.
 */
export function Reveal({ children, className, delay = 0, as: Tag = 'div' }: RevealProps) {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(shouldSkipAnimation)

  useEffect(() => {
    const node = ref.current
    if (!node || visible) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -6% 0px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [visible])

  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        'transition-[opacity,transform,filter] duration-[650ms] ease-out-expo',
        visible ? 'translate-y-0 opacity-100 blur-none' : 'translate-y-5 opacity-0 blur-[4px]',
        className,
      )}
    >
      {children}
    </Tag>
  )
}
