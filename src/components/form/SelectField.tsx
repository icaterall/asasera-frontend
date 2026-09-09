import { useId } from 'react'

import { useAuthCopy } from '@/copy/useAuthCopy'
import type { ReferenceOption } from '@/lib/api'
import {Select} from '@/design'

type SelectFieldProps = {
  label: string
  placeholder: string
  hint?: string
  value: string
  error?: string
  disabled?: boolean
  name: string
  autoComplete?: string
  options: ReferenceOption[]
  loading: boolean
  failed: boolean
  onRetry: () => void
  onValueChange: (value: string) => void
  onBlur: () => void
}

/** API-backed choices retain their IDs and switch labels with the active language. */
export function SelectField({
  label,
  placeholder,
  hint,
  value,
  error,
  disabled,
  name,
  autoComplete,
  options,
  loading,
  failed,
  onRetry,
  onValueChange,
  onBlur,
}: SelectFieldProps) {
  const { c, lang } = useAuthCopy()
  const id = useId()
  const errorId = `${id}-error`
  const statusId = `${id}-status`
  const hintId = `${id}-hint`

  const message = failed ? c.errors.loadFailed : loading ? c.common.loading : null

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
        {label}
      </label>

      <Select
        id={id}
        name={name}
        value={value}
        onValueChange={onValueChange}
        onBlur={onBlur}
        autoComplete={autoComplete}
        // Disabled while the list is in flight, so nobody can submit an empty
        // choice that would only come back as a server-side validation error.
        disabled={disabled || loading || failed}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          [hint ? hintId : null, message ? statusId : null, error ? errorId : null]
            .filter(Boolean)
            .join(' ') || undefined
        }
      >
        {/* An empty value, so "nothing chosen" is a state the validator can
            see rather than a first option silently counting as an answer. */}
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.id} value={String(option.id)} data-search-text={`${option.name_ar} ${option.name_en}`}>
            {lang === 'ar' ? option.name_ar : option.name_en}
          </option>
        ))}
      </Select>

      {hint ? (
        <p id={hintId} className="text-xs leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
          {hint}
        </p>
      ) : null}

      {message ? (
        <p id={statusId} className="flex items-center gap-2 text-xs" style={{ color: failed ? 'var(--danger)' : 'var(--ink-muted)' }} aria-live="polite">
          {message}
          {failed ? (
            <button type="button" onClick={onRetry} className="auth-link text-xs underline">
              {c.common.retry}
            </button>
          ) : null}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} role="alert" className="text-xs font-medium leading-relaxed" style={{ color: 'var(--danger)' }}>
          {error}
        </p>
      ) : null}
    </div>
  )
}
