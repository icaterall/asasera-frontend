import type { ReactNode } from 'react'

type BdiProps = {
  children: ReactNode
  /** Forces a direction when the run's own strong characters would mislead. */
  dir?: 'ltr' | 'rtl' | 'auto'
  className?: string
}

/**
 * Isolates a run of foreign-script or numeric text inside an Arabic sentence.
 *
 * The bidirectional algorithm resolves a paragraph as a whole, so a Latin or
 * numeric run interpolated into RTL text is reordered against its neighbours
 * rather than treated as one opaque unit. The failure is not theoretical and
 * not rare — it is what puts the parenthesis on the wrong side, drags a
 * trailing digit to the far end of the line, or renders
 *
 *   يخلطون بين المفتاح الأساسي (Primary Key) والمفتاح الأجنبي (Foreign Key)
 *
 * with the brackets swapped around the wrong words. `<bdi>` opens its own
 * isolate: the run resolves internally, then takes part in the surrounding
 * paragraph as a single neutral character, which is exactly the guarantee the
 * sentence above needs.
 *
 * `dir="auto"` is the default because it lets the *content* decide: a Latin
 * term resolves LTR, an Arabic gloss inside the same component resolves RTL,
 * and neither needs the caller to know which it passed. Pass an explicit
 * direction only for a run whose first strong character lies about it — a
 * join code like `7K2M9P` is unambiguous, but one starting with digits
 * followed by Latin letters is not.
 *
 * `<bdi>` carries `unicode-bidi: isolate` from the UA stylesheet, so this is
 * the element doing the work rather than a class we could forget to apply.
 */
export function Bdi({ children, dir = 'auto', className }: BdiProps) {
  return (
    <bdi dir={dir} className={className}>
      {children}
    </bdi>
  )
}
