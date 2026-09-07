import { useId } from 'react'

import { useAuthCopy } from '@/copy/useAuthCopy'
import type { ReferenceOption } from '@/lib/api'

type SelectFieldProps = {
  label: string
  placeholder: string
  /** A standing explanation of the list, distinct from a transient status. */
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
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
  onBlur: () => void
}

/**
 * A <select> whose options come from the API, never from a constant.
 *
 * The stage list in particular MUST be fetched: `education_stages` holds every
 * band from kindergarten up, and only `age_band = 'university'` is open for
 * registration. Hardcoding the options would put that filter in code the user
 * can edit — open devtools, add an <option> with a school stage id, submit.
 * The endpoint applies the same predicate the server enforces on write, so the
 * form and the gate cannot drift, and a crafted value earns a 422 rather than
 * an account.
 *
 * Names come bilingual from the API (`name_ar` / `name_en`) and the active
 * language picks one, so switching language relabels the options without a
 * refetch.
 */
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
  onChange,
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

      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
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
        className="auth-input auth-select"
      >
        {/* An empty value, so "nothing chosen" is a state the validator can
            see rather than a first option silently counting as an answer. */}
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.id} value={String(option.id)}>
            {lang === 'ar' ? option.name_ar : option.name_en}
          </option>
        ))}
      </select>

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
