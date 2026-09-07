import {Inbox,TriangleAlert,CircleCheck} from 'lucide-react'
import type { ReactNode } from 'react'

import styles from './States.module.css'

/**
 * The four shared states — §16 W02.
 *
 * Each takes an action, and the prop is not optional by accident: an empty
 * shelf with no way out is the failure §13 calls «أخطر حالة في المنتج» — the
 * most dangerous state in the product.
 */

interface BaseProps {
  title: string
  body?: string
  actions?: ReactNode
}

export function EmptyState({ title, body, actions }: BaseProps) {
  return (
    <div className={`${styles.state} ${styles.empty}`}>
      <Inbox className={styles.icon} size={32} aria-hidden="true"/>
      <h3 className={styles.title}>{title}</h3>
      {body && <p className={styles.body}>{body}</p>}
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  )
}

export function FailureState({ title, body, actions }: BaseProps) {
  return (
    /* `role="alert"` — a failure that appears after an action must be
       announced, not merely rendered. */
    <div className={`${styles.state} ${styles.failure}`} role="alert">
      <TriangleAlert className={styles.icon} size={32} aria-hidden="true"/>
      <h3 className={styles.title}>{title}</h3>
      {body && <p className={styles.body}>{body}</p>}
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  )
}

export function SuccessState({ title, body, actions }: BaseProps) {
  return (
    <div className={`${styles.state} ${styles.success}`} role="status">
      <CircleCheck className={styles.icon} size={32} aria-hidden="true"/>
      <h3 className={styles.title}>{title}</h3>
      {body && <p className={styles.body}>{body}</p>}
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  )
}

/**
 * Skeleton rather than a spinner wherever the shape of the result is known:
 * a spinner says "wait", a skeleton says "wait, and here is what is coming".
 * `aria-busy` plus a live label is what a screen reader gets instead.
 */
export function LoadingState({ rows = 3, label = 'جارٍ التحميل' }: { rows?: number; label?: string }) {
  return (
    <div className={styles.skeletonWrap} aria-busy="true" aria-live="polite" aria-label={label}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className={styles.bar} style={{ width: `${100 - i * 12}%` }} />
      ))}
    </div>
  )
}
