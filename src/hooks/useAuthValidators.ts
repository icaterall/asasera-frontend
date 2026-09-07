import { useMemo } from 'react'

import { PASSWORD_MIN } from '@/components/form/PasswordField'
import { useAuthCopy } from '@/copy/useAuthCopy'

/*
 * Deliberately permissive: one @, something before it, a dot-something after.
 *
 * A stricter pattern is the wrong tool. RFC 5322 permits addresses that look
 * wrong and forbids none that a person is likely to type by accident, so a
 * tight regex mostly rejects valid mail — plus-addressing, new TLDs, IDN
 * hosts. The real check is the confirmation email, which the server sends and
 * nothing here can fake. This only catches "you forgot the @".
 */
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Lowercased and trimmed, matching what the server canonicalises to. */
export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase()
}

/**
 * The client-side rules, in the active language.
 *
 * They mirror the server's and never exceed them — 8 characters, no
 * composition rule — because a form that demands more than the API does
 * rejects passwords the API would have accepted, and the person has no way to
 * discover which of the two is lying.
 */
export function useAuthValidators() {
  const { c } = useAuthCopy()

  return useMemo(
    () => ({
      name: (value: string) => (value.trim() ? null : c.errors.nameRequired),

      email: (value: string) => {
        const trimmed = value.trim()
        if (!trimmed) return c.errors.emailRequired
        if (!EMAIL_SHAPE.test(trimmed)) return c.errors.emailInvalid
        return null
      },

      newPassword: (value: string) => {
        if (!value) return c.errors.passwordRequired
        if (value.length < PASSWORD_MIN) return c.errors.passwordShort
        return null
      },

      /*
       * Sign-in checks only that something was typed. Applying the length
       * rule here would lock out anyone whose password predates it, and would
       * leak the rule to someone guessing at the form.
       */
      currentPassword: (value: string) => (value ? null : c.errors.passwordRequired),

      subject: (value: string) => (value ? null : c.errors.categoryRequired),
      stage: (value: string) => (value ? null : c.errors.stageRequired),
    }),
    [c],
  )
}
