import type { ButtonHTMLAttributes, ReactNode } from 'react'

import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'secondary' | 'quiet' | 'danger'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  full?: boolean
  loading?: boolean
  /** Icon before the label. Never an arrow appended after it — §5 forbids that. */
  icon?: ReactNode
}

export function Button({
  variant = 'secondary', full = false, loading = false, icon,
  children, className, disabled, ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      className={[styles.btn, styles[variant], full ? styles.full : '', className ?? '']
        .filter(Boolean).join(' ')}
      /* A loading button is not clickable, and says why rather than just
         looking dim: `aria-busy` is what a screen reader announces. */
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <span className={styles.spinner} aria-hidden="true" /> : icon}
      {children}
    </button>
  )
}
