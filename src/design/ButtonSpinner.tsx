import styles from './ButtonSpinner.module.css'

/** Decorative: the button keeps its label and announces its busy state. */
export function ButtonSpinner() {
  return <svg className={styles.spinner} data-button-spinner="" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true" focusable="false">
    <circle cx="12" cy="12" r="9" opacity=".22" />
    <circle cx="12" cy="12" r="9" pathLength="100" strokeDasharray="72 28" strokeLinecap="round" />
  </svg>
}
