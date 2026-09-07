import { useState } from 'react'

import { Field } from './Field'
import { useAuthCopy } from '@/copy/useAuthCopy'

/** The server's floor, and the only password rule this product has. */
export const PASSWORD_MIN = 8

type PasswordFieldProps = {
  label: string
  value: string
  error?: string
  autoComplete: 'new-password' | 'current-password'
  placeholder?: string
  disabled?: boolean
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onBlur: () => void
  name?: string
}

/**
 * Password, with a show/hide toggle.
 *
 * LENGTH ONLY. No symbol rule, no mixed-case rule, because the server has
 * neither — composition rules do not produce strong passwords, they produce
 * `Passw0rd!`, and a form that demands more than the API does simply rejects
 * valid passwords. The floor is 8, and the screen that asks for a new
 * password states it once in a line of its own.
 *
 * NO LIVE CHARACTER COUNTER. There was one, updating on every keystroke, and
 * it is gone at the user's instruction. It also had nothing left to do: on
 * the screens that set a password the rule is already written directly under
 * the field, so the counter restated in numbers what the sentence beside it
 * said in words, and on the sign-in screen it counted the characters of a
 * password the person already has.
 *
 * The toggle is a real <button type="button"> — inside a form, a button
 * without an explicit type submits it, which here would post a half-filled
 * registration the moment someone checked their own typing.
 */
export function PasswordField({
  label,
  value,
  error,
  autoComplete,
  placeholder,
  disabled,
  onChange,
  onBlur,
  name = 'password',
}: PasswordFieldProps) {
  const { c } = useAuthCopy()
  const [visible, setVisible] = useState(false)

  return (
    <Field
      label={label}
      error={error}
      name={name}
      type={visible ? 'text' : 'password'}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled}
      placeholder={placeholder}
      autoComplete={autoComplete}
      /*
       * `text` rather than the default: a password field has no numeric or
       * email keyboard, and leaving inputMode unset on mobile has been known
       * to surface an autocapitalising keyboard, which silently changes the
       * first character of a password nobody can see.
       */
      inputMode="text"
      autoCapitalize="none"
      autoCorrect="off"
      spellCheck={false}
      adornment={
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          disabled={disabled}
          aria-pressed={visible}
          className="grid size-9 place-items-center rounded-sm text-sm font-semibold disabled:opacity-50"
          style={{ color: 'var(--ink-muted)' }}
          // The accessible name changes with the state, so a screen reader
          // announces what pressing it will do rather than only what it is.
          aria-label={visible ? c.common.hidePassword : c.common.showPassword}
          title={visible ? c.common.hidePassword : c.common.showPassword}
        >
          {visible ? <EyeOff /> : <Eye />}
        </button>
      }
    />
  )
}

/* Inline SVGs rather than an icon import: two glyphs, used in one place. */

function Eye() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3.2" />
    </svg>
  )
}

function EyeOff() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M2.5 12S6 5.5 12 5.5c1.6 0 3 .45 4.2 1.1M21.5 12s-1.3 2.4-3.8 4.1M4 4l16 16" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 9.7a3.2 3.2 0 0 0 4.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
