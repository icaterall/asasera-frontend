import { useEffect, useState } from 'react'

export type ScrollState = {
  /** True once the page has moved far enough to warrant a solid header. */
  scrolled: boolean
  /** 0–1 progress through the scrollable height. */
  progress: number
}

/** Single rAF-throttled scroll listener shared by the header. */
export function useScrollProgress(threshold = 12): ScrollState {
  const [state, setState] = useState<ScrollState>({ scrolled: false, progress: 0 })

  useEffect(() => {
    let frame = 0

    const measure = () => {
      frame = 0
      const top = window.scrollY
      const max = document.documentElement.scrollHeight - window.innerHeight
      setState({
        scrolled: top > threshold,
        progress: max > 0 ? Math.min(top / max, 1) : 0,
      })
    }

    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [threshold])

  return state
}
