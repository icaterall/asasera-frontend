import { twMerge } from 'tailwind-merge'

type ClassValue = string | number | false | null | undefined

/**
 * Joins class names and resolves Tailwind conflicts in favour of the last one.
 *
 * This matters because our components ship base classes that a caller may need
 * to override: `<Button className="hidden lg:inline-flex">` has to beat the
 * `inline-flex` in the button recipe. Plain concatenation cannot do that —
 * whichever utility Tailwind emits later in the stylesheet wins, regardless of
 * the order in the attribute — which silently leaves elements visible at
 * breakpoints where they should be hidden.
 */
export function cn(...values: ClassValue[]): string {
  return twMerge(values.filter(Boolean).join(' '))
}
