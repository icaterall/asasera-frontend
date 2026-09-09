import { LoadingIndicator } from './LoadingIndicator'
import type { LoadingVariant } from './loadingVariant'
import styles from './LoadingState.module.css'

export interface LoadingStateProps {
  rows?: number
  label?: string
  variant?: LoadingVariant
  layout?: 'page' | 'section'
}

function Lines({ short = false }: { short?: boolean }) {
  return <div className={styles.lines}><span className={styles.line} /><span className={`${styles.line} ${short ? styles.short : styles.medium}`} /></div>
}

function ListSkeleton({ count }: { count: number }) {
  return <div className={styles.list}>{Array.from({ length: count }, (_, index) => <div className={styles.row} key={index}>
    <span className={styles.thumbnail} /><Lines /><span className={styles.rowAction} />
  </div>)}</div>
}

function CardSkeleton({ count }: { count: number }) {
  return <div className={styles.cards}>{Array.from({ length: count }, (_, index) => <div className={styles.card} key={index}>
    <span className={styles.cover} /><div className={styles.cardBody}><Lines short /><span className={styles.rowAction} /></div>
  </div>)}</div>
}

function FormSkeleton({ count }: { count: number }) {
  return <div className={styles.fields}>{Array.from({ length: count }, (_, index) => <div className={styles.field} key={index}>
    <span className={`${styles.line} ${styles.short}`} /><span className={styles.input} />
  </div>)}</div>
}

/** Page-shaped, non-interactive placeholders. Only the loading message is announced. */
export function LoadingState({ rows = 3, label, variant = 'list', layout = 'section' }: LoadingStateProps) {
  const count = Math.min(8, Math.max(1, Math.floor(rows) || 3))
  const status = <LoadingIndicator size={layout === 'page' ? 'large' : 'medium'} label={label} />
  return <div className={`${styles.root} ${styles[layout]} ${variant === 'editor' ? styles.editor : ''}`}
    data-loading-layout={layout} data-loading-variant={variant}>
    {variant === 'editor' ? <>
      <div className={styles.toolbar} aria-hidden="true"><span className={styles.title} /><span className={styles.rowAction} /></div>
      <div className={styles.editorBody}>
        <div className={styles.editorRail} aria-hidden="true"><Lines short />{[0, 1, 2].map(index => <span className={styles.questionThumb} key={index} />)}</div>
        <div className={styles.editorCanvas}>
          <div className={styles.prompt} aria-hidden="true"><Lines /></div>
          <div className={styles.well}>{status}</div>
          <div className={styles.answers} aria-hidden="true">{[0, 1, 2, 3].map(index => <span className={styles.answer} key={index} />)}</div>
        </div>
        <div className={styles.editorProperties} aria-hidden="true"><Lines short /><FormSkeleton count={4} /></div>
      </div>
    </> : <div className={styles.content}>
      <div className={styles.well}>{status}</div>
      <div aria-hidden="true" className={styles.placeholders}>
        {variant === 'cards' ? <CardSkeleton count={count} /> : variant === 'form' ? <FormSkeleton count={count} /> : variant === 'dashboard' ?
          <><div className={styles.dashboardHeading}><Lines short /></div><CardSkeleton count={3} /><ListSkeleton count={2} /></> : <ListSkeleton count={count} />}
      </div>
    </div>}
  </div>
}
