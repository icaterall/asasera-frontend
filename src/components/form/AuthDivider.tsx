import { useAuthCopy } from '@/copy/useAuthCopy'

/**
 * The line between the form and the provider button.
 *
 * It is decorative: the rules are drawn with ::before/::after pseudo-elements
 * rather than as elements, so nothing empty lands in the accessibility tree
 * and a screen reader hears only the word.
 */
export function AuthDivider() {
  const { c } = useAuthCopy()

  return (
    <div className="auth-divider text-xs font-medium uppercase tracking-wide">
      <span>{c.common.or}</span>
    </div>
  )
}
