import { forwardRef } from 'react'

import { cn } from '@/lib/cn'

import { CODE_LENGTH, normaliseCode } from './codeFormat'

type CodeInputProps = {
  id: string
  value: string
  onValueChange: (next: string) => void
  label: string
  hint?: string
  error?: string
  className?: string
}

/**
 * The join-code field.
 *
 * Two things here are direction work, not styling.
 *
 * 1. `dir="ltr"` on the input itself. The page is RTL, but a join code is a
 *    Latin-and-digit string whose first character is its first character —
 *    typed into an RTL field, the caret starts at the right and the code is
 *    entered and read in the wrong order. The field is an LTR island inside
 *    an RTL page, which is why the attribute sits on the input and not on an
 *    ancestor.
 *
 * 2. `text-align: center`. Once the field is LTR inside an RTL row, "start"
 *    and "end" refer to opposite edges for the field and its label, and any
 *    choice of edge looks like a bug to someone. Centring removes the
 *    question, and a six-character code reads well centred.
 *
 * The label is a real `<label>`, not a placeholder: a placeholder disappears
 * the moment a student starts typing, which is exactly when someone reading
 * a code off a projector needs to confirm what the field wanted.
 *
 * `inputMode` stays `text` rather than `numeric` — codes mix letters and
 * digits, and a numeric keypad would lock out half the alphabet. The tap
 * target and the wide tracking do the phone-friendliness instead.
 */
export const CodeInput = forwardRef<HTMLInputElement, CodeInputProps>(function CodeInput(
  { id, value, onValueChange, label, hint, error, className },
  ref,
) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined

  return (
    <div className={cn('w-full', className)}>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-fg">
        {label}
      </label>

      <input
        ref={ref}
        id={id}
        name="joinCode"
        type="text"
        dir="ltr"
        inputMode="text"
        autoComplete="one-time-code"
        autoCapitalize="characters"
        autoCorrect="off"
        spellCheck={false}
        maxLength={CODE_LENGTH}
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        onChange={(event) => onValueChange(normaliseCode(event.target.value))}
        className={cn(
          'min-h-12 w-full rounded-sm border bg-surface px-4 py-3',
          'text-center text-lg font-bold tracking-[0.35em] text-fg',
          'placeholder:tracking-normal placeholder:text-muted/70',
          error ? 'border-red-600' : 'border-line',
        )}
      />

      {hint ? (
        <p id={hintId} className="mt-2 text-sm text-muted">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} role="alert" className="mt-2 text-sm font-medium text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  )
})
