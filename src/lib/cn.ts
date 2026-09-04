import { extendTailwindMerge } from 'tailwind-merge'

type ClassValue = string | number | false | null | undefined

/**
 * tailwind-merge, taught about the landing page's custom type scale.
 *
 * Without this it silently deletes font sizes. `twMerge` groups utilities by
 * the property they set, and it infers that from the class name: it knows
 * `text-sm` is a size and `text-red-500` is a colour, so it keeps both. It
 * cannot know that about *custom* tokens — `text-asas-small` and
 * `text-asas-accent` are both just `text-<something>`, so it files them in
 * one group, decides they conflict, and keeps only the last:
 *
 *     twMerge('text-asas-h2 text-asas-ink')  ->  'text-asas-ink'
 *
 * The size vanishes. There is no warning and no error; the element simply
 * inherits its parent's size, and a 40px section heading renders at 16px
 * while still reading `font-bold`. Registering the six scale tokens as
 * font-size classes is what keeps `cn('text-asas-h2', 'text-asas-ink')`
 * returning both.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        'text-asas-hero',
        'text-asas-h2',
        'text-asas-h3',
        'text-asas-lead',
        'text-asas-body',
        'text-asas-small',
      ],
    },
  },
})

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
