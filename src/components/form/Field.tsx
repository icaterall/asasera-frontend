import { useId, type InputHTMLAttributes, type ReactNode } from 'react'

import { cn } from '@/lib/cn'

export type FieldProps = {
  label: string
  /*
   * A node, not a string. Almost every message here is one sentence, but the
   * duplicate-address one carries a link inside it ("… Sign in instead."),
   * and rendering that as text with a separate link underneath splits one
   * thought into two. Callers passing a string are unaffected.
   */
  error?: ReactNode
  hint?: ReactNode
  /** Rendered inside the input's inline-end edge — the password toggle. */
  adornment?: ReactNode
  /**
   * Pins the VALUE left-to-right inside an RTL page. For email only: an
   * address is a Latin run, and typed into an RTL field the bidi algorithm
   * leaves its @ and dots in positions that make a correct value look wrong.
   * The field itself stays in the RTL flow; only its content is isolated.
   */
  ltr?: boolean
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'className'>

/**
 * One labelled input.
 *
 * The <label> is a real element, above the input, and always present. A
 * placeholder is not a label: it disappears the moment someone types, so the
 * field loses its name exactly when a person is most likely to be
 * interrupted; it is invisible to some screen readers; and its contrast is
 * low by convention. Placeholders here carry an EXAMPLE or a hint, never the
 * field's name.
 *
 * `aria-describedby` is assembled from whichever of hint and error exist, so
 * a screen reader reads the constraint and the failure together with the
 * field rather than as loose text somewhere after it.
 */
export function Field({ label, error, hint, adornment, ltr, ...input }: FieldProps) {
  const id = useId()
  const errorId = `${id}-error`
  const hintId = `${id}-hint`

  const describedBy = [hint ? hintId : null, error ? errorId : null]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
        {label}
      </label>

      <div className="relative">
        <input
          {...input}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          className={cn('auth-input', ltr && 'auth-input--ltr', adornment ? 'pe-12' : undefined)}
        />
        {adornment ? (
          // Positioned on the inline-end edge, so it sits left in Arabic and
          // right in English with no direction-specific rule.
          <div className="absolute inset-y-0 end-0 flex items-center pe-1">{adornment}</div>
        ) : null}
      </div>

      {hint ? (
        <p id={hintId} className="text-xs leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
          {hint}
        </p>
      ) : null}

      {error ? (
        /*
         * `role="alert"` so the message is announced when it appears. It
         * appears on blur or after a submit, never mid-keystroke, so this
         * does not interrupt someone who is still typing.
         */
        <p id={errorId} role="alert" className="text-xs font-medium leading-relaxed" style={{ color: 'var(--danger)' }}>
          {error}
        </p>
      ) : null}
    </div>
  )
}
