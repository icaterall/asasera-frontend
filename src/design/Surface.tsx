import {TriangleAlert} from 'lucide-react'
import type { HTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'
import { useEffect, useId, useRef } from 'react'

import styles from './Surface.module.css'
import { Button } from './Button.tsx'

/* ---- card ---- */

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Colour of the leading strip. Only pass one when it MEANS something —
      the subject, the unit, the state. §5 forbids decoration for its own sake. */
  strip?: string
}

export function Card({ strip, className, style, children, ...rest }: CardProps) {
  return (
    <div
      className={[styles.card, strip ? styles.strip : '', className ?? ''].filter(Boolean).join(' ')}
      style={strip ? { ...style, ['--strip' as string]: strip } : style}
      {...rest}
    >
      {children}
    </div>
  )
}

/* ---- field ---- */

export interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string
  hint?: string
  /** When set, the field is invalid AND says why. A red border alone is
      colour-only, which §5 and WCAG both rule out. */
  error?: string
}

export function Field({ label, hint, error, className, ...rest }: FieldProps) {
  const id = useId()
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  return (
    <div className={[styles.field, className ?? ''].filter(Boolean).join(' ')}>
      <label className={styles.label} htmlFor={id}>{label}</label>
      <input
        id={id}
        className={[styles.input, error ? styles.invalid : ''].filter(Boolean).join(' ')}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined}
        {...rest}
      />
      {hint && !error && <span id={hintId} className={styles.hint}>{hint}</span>}
      {/* `role="alert"` so a validation failure is announced when it appears,
          not only when focus happens to land on the field. */}
      {error && <span id={errorId} className={styles.error} role="alert"><TriangleAlert size={16} aria-hidden="true"/>{error}</span>}
    </div>
  )
}

/* ---- dialog ---- */

export interface DialogProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  actions?: ReactNode
}

export function Dialog({ open, title, onClose, children, actions }: DialogProps) {
  const ref = useRef<HTMLDivElement>(null)
  const titleId = useId()

  /*
   * Escape closes, and focus moves into the dialog when it opens. Without the
   * second part, a keyboard user's focus stays on the page behind and tabbing
   * walks the content they cannot see.
   */
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    ref.current?.focus()
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className={styles.backdrop}
      /* Only a click that both starts and ends on the backdrop closes; a drag
         that began inside the dialog and released outside must not. */
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}
    >
      <div
        ref={ref}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <h2 id={titleId} className={styles.dialogTitle}>{title}</h2>
        {children}
        <div className={styles.dialogActions}>
          {actions ?? <Button onClick={onClose}>إغلاق</Button>}
        </div>
      </div>
    </div>
  )
}
