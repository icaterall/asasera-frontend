import { useEffect, useId, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import logo from '@/assets/images/logo-box-loader.webp'
import styles from './LoadingIndicator.module.css'

/** Decorative mark: the surrounding status or button owns its accessible label. */
export function LoadingMark({ size = 'medium' }: { size?: 'small' | 'medium' | 'large' }) {
  const gradientId = useId()
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const mark = ref.current
    if (!mark) return
    let visible = true
    const sync = () => mark.style.setProperty('--loader-play-state', visible && !document.hidden ? 'running' : 'paused')
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      sync()
    })
    observer?.observe(mark)
    document.addEventListener('visibilitychange', sync)
    sync()
    return () => {
      observer?.disconnect()
      document.removeEventListener('visibilitychange', sync)
    }
  }, [])

  return <span ref={ref} className={`${styles.mark} ${styles[size]}`} aria-hidden="true">
    <span className={styles.core}>
      <img className={styles.logo} src={logo} width="384" height="384" alt="" draggable={false} decoding="async" />
    </span>
    <svg className={styles.orbit} viewBox="0 0 120 120" fill="none" focusable="false">
      <defs>
        <linearGradient id={gradientId} x1="16" y1="14" x2="102" y2="108" gradientUnits="userSpaceOnUse">
          <stop stopColor="#004ccc" />
          <stop offset=".48" stopColor="#009bd1" />
          <stop offset="1" stopColor="#16b985" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="50" pathLength="100" stroke={`url(#${gradientId})`}
        strokeWidth="4.5" strokeLinecap="round" strokeDasharray="38 10 20 10 8 14" transform="rotate(-90 60 60)" />
      <circle cx="81.13" cy="105.32" r="3.2" fill="#16b985" />
      <circle cx="10.19" cy="64.36" r="2.6" fill="#008fc5" />
      <circle cx="32.77" cy="18.07" r="3.2" fill="#004ccc" />
      <circle cx="44.55" cy="12.45" r="1.6" fill="#009bd1" />
    </svg>
  </span>
}

export interface LoadingIndicatorProps {
  label?: string
  layout?: 'page' | 'section' | 'inline'
  size?: 'small' | 'medium' | 'large'
  className?: string
}

/** Appears only while work is pending; never adds a minimum wait or fake progress. */
export function LoadingIndicator({ label, layout = 'section', size, className = '' }: LoadingIndicatorProps) {
  const { i18n } = useTranslation()
  const message = label ?? (i18n.language?.startsWith('ar') ? 'جارٍ التحميل…' : 'Loading…')
  return <div className={`${styles.status} ${styles[layout]} ${className}`} role="status" aria-live="polite" aria-atomic="true">
    <LoadingMark size={size ?? (layout === 'page' ? 'large' : layout === 'inline' ? 'small' : 'medium')} />
    <span className={styles.label} dir="auto">{message}</span>
  </div>
}
