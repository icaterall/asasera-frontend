import { useEffect, useId, useMemo, useRef, useState } from 'react'

import { useAuthCopy } from '@/copy/useAuthCopy'
import type { ReferenceOption } from '@/lib/api'

type ComboSelectProps = {
  label: string
  placeholder: string
  value: string
  error?: string
  disabled?: boolean
  name: string
  options: ReferenceOption[]
  loading: boolean
  failed: boolean
  onRetry: () => void
  /** Reports the chosen id, or '' when cleared. */
  onChange: (value: string) => void
  onBlur: () => void
}

/** Chevron. Inline SVG — no icon package, per the project rules. */
function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className="size-4 shrink-0 transition-transform duration-150"
      style={{ transform: open ? 'rotate(180deg)' : undefined, color: 'var(--ink-muted)' }}
    >
      <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/**
 * A searchable dropdown — the ng-select shape, built rather than installed.
 *
 * WHY NOT A NATIVE <select>. It cannot be typed into. `categories` is already
 * long enough that finding a subject means scrolling a list you cannot filter,
 * and a native listbox on a phone is an OS wheel with no search at all. This
 * keeps the one thing the native control is genuinely better at — the value is
 * still mirrored into a real <input> below, so the form serialises and
 * autofills the same way — and adds the filtering it lacks.
 *
 * ACCESSIBILITY. This is the WAI-ARIA 1.2 combobox pattern, not a div with a
 * click handler:
 *   - the text box is `role="combobox"` with `aria-expanded` and
 *     `aria-controls`, and owns the focus the whole time
 *   - the panel is `role="listbox"`, each row `role="option"`
 *   - the active row is tracked by `aria-activedescendant`, so focus never
 *     leaves the input and a screen reader still announces the highlighted row
 *   - ArrowDown/Up move, Enter selects, Escape closes, Tab commits and leaves
 * Keeping focus on the input is what makes it usable one-handed on a phone:
 * the keyboard never dismisses itself mid-search.
 *
 * DIRECTION. No `left`/`right` anywhere — the panel is positioned with
 * `inset-inline`, so it mirrors under RTL with no per-direction override.
 */
export function ComboSelect({
  label,
  placeholder,
  value,
  error,
  disabled,
  name,
  options,
  loading,
  failed,
  onRetry,
  onChange,
  onBlur,
}: ComboSelectProps) {
  const id = useId()
  const listId = `${id}-list`
  const errorId = `${id}-error`
  const { c, lang } = useAuthCopy()

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const labelOf = (o: ReferenceOption) => (lang === 'ar' ? o.name_ar : o.name_en)
  const selected = options.find((o) => String(o.id) === value) ?? null

  /*
   * Filter on both scripts regardless of interface language. A teacher whose
   * keyboard is in English should still find "الفيزياء" by typing "phys", and
   * the reverse holds for someone typing Arabic on an English interface.
   */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter(
      (o) => o.name_ar.toLowerCase().includes(q) || o.name_en.toLowerCase().includes(q),
    )
  }, [options, query])

  useEffect(() => setActive(0), [query, open])

  /* Close on an outside press. `pointerdown`, not `click`: a click fires after
     the input has already taken focus back, which reopens what we just shut. */
  useEffect(() => {
    if (!open) return
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
        setQuery('')
        onBlur()
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open, onBlur])

  function commit(option: ReferenceOption) {
    onChange(String(option.id))
    setQuery('')
    setOpen(false)
    onBlur()
    inputRef.current?.focus()
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!open) return setOpen(true)
      const step = event.key === 'ArrowDown' ? 1 : -1
      setActive((i) => (filtered.length === 0 ? 0 : (i + step + filtered.length) % filtered.length))
      return
    }
    if (event.key === 'Enter' && open) {
      event.preventDefault()
      const option = filtered[active]
      if (option) commit(option)
      return
    }
    if (event.key === 'Escape' && open) {
      event.preventDefault()
      setOpen(false)
      setQuery('')
    }
  }

  /*
   * Four states, and the field must never look ready in three of them.
   *
   * An empty list is the one worth naming separately. A list that loaded fine
   * and simply has no rows yet is not an error, but it must not present as a
   * working dropdown either — opening it to "no match" implies the reader
   * typed something wrong. It says so, and the field is disabled so nothing
   * can be chosen that would fail server validation anyway.
   */
  const empty = !loading && !failed && options.length === 0
  const busy = disabled || loading || failed || empty
  const shown = open ? query : selected ? labelOf(selected) : ''

  const statusText = loading
    ? c.common.loading
    : failed
      ? c.common.loadError
      : empty
        ? c.common.unavailable
        : placeholder

  return (
    <div className="flex flex-col gap-1.5" ref={rootRef}>
      <label htmlFor={id} className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && filtered[active] ? `${id}-opt-${filtered[active]!.id}` : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          autoComplete="off"
          disabled={busy}
          value={shown}
          placeholder={statusText}
          onChange={(event) => {
            setQuery(event.target.value)
            if (!open) setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="auth-input w-full pe-10"
        />

        {/* Decorative: the input owns the interaction, so this is not a button. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 end-3 grid place-items-center"
        >
          <Chevron open={open} />
        </span>

        {/*
          The real form value. The combobox input holds a human-readable label
          and must never be what submits — this hidden input carries the id, so
          the field serialises exactly as the native <select> it replaced did.
        */}
        <input type="hidden" name={name} value={value} />

        {open && !busy ? (
          <ul
            id={listId}
            role="listbox"
            aria-label={label}
            /* `start-0 end-0`, not `inset-x-0` — logical properties, so the panel
               pins to the field edges under RTL without an override. */
            className="absolute start-0 end-0 z-20 mt-1 max-h-60 overflow-y-auto border bg-white py-1 shadow-none"
            style={{ borderColor: 'var(--line)', borderRadius: 'var(--radius, 5px)' }}
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm" style={{ color: 'var(--ink-muted)' }}>
                {c.common.noResults}
              </li>
            ) : (
              filtered.map((option, index) => {
                const isActive = index === active
                const isSelected = String(option.id) === value
                return (
                  <li
                    key={option.id}
                    id={`${id}-opt-${option.id}`}
                    role="option"
                    aria-selected={isSelected}
                    /* pointerdown, not click: click lands after the input's
                       blur and the panel would already be closing. */
                    onPointerDown={(event) => {
                      event.preventDefault()
                      commit(option)
                    }}
                    onMouseEnter={() => setActive(index)}
                    className="cursor-pointer px-3 py-2 text-sm"
                    style={{
                      background: isActive ? 'var(--raised, #f5f7fb)' : undefined,
                      color: 'var(--ink)',
                      fontWeight: isSelected ? 600 : 400,
                    }}
                  >
                    {labelOf(option)}
                  </li>
                )
              })
            )}
          </ul>
        ) : null}
      </div>

      {/*
        A failed fetch must never leave a control that looks populated, so the
        field is disabled above and the way out is stated here rather than
        left to the reader to guess.
      */}
      {failed ? (
        <button
          type="button"
          onClick={onRetry}
          className="self-start text-xs font-semibold underline"
          style={{ color: 'var(--brand-blue)' }}
        >
          {c.common.retry}
        </button>
      ) : null}

      {error ? (
        <p id={errorId} role="alert" className="text-xs font-medium leading-relaxed" style={{ color: 'var(--danger)' }}>
          {error}
        </p>
      ) : null}
    </div>
  )
}
