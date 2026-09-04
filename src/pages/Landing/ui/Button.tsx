import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/cn'

export type ButtonVariant = 'primary' | 'ghost' | 'teal' | 'quiet'
export type ButtonSize = 'md' | 'lg'

/*
 * `min-h` rather than a fixed height: an Arabic label with a descender or a
 * two-line label on a 375px screen must grow the control, not overflow it.
 * 48px is the floor everywhere — the join strip is used by students standing
 * up in a lecture hall holding a phone one-handed.
 */
const base =
  'inline-flex items-center justify-center gap-2 rounded-md font-bold ' +
  'transition-[background-color,border-color,color,box-shadow,filter] duration-200 ' +
  'motion-reduce:transition-none select-none text-center'

const variants: Record<ButtonVariant, string> = {
  /* The shared brand gradient marks the page's primary action. */
  primary: 'master-button text-white hover:brightness-95',

  /* White on --brand-teal: 4.88:1. Above AA, but the tightest pair on the page. */
  teal: 'bg-teal-700 text-white hover:bg-[#006E5C]',

  /*
   * A 1px line, not a tinted fill: the ghost button sits beside the primary in
   * the hero and must read as the quieter of the two without becoming a
   * disabled-looking control.
   */
  ghost:
    'border border-line bg-surface text-fg ' +
    'hover:border-accent hover:text-accent',

  quiet: 'text-fg hover:text-accent font-medium',
}

const sizes: Record<ButtonSize, string> = {
  md: 'min-h-12 px-5 py-3 text-[0.95rem]',
  lg: 'min-h-14 px-7 py-3.5 text-base',
}

type SharedProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  children: ReactNode
}

type ButtonAsButton = SharedProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof SharedProps> & { href?: never }

type ButtonAsLink = SharedProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof SharedProps> & { href: string }

/**
 * Renders an `<a>` when given `href` and a `<button>` otherwise.
 *
 * The distinction is not cosmetic: a control that navigates must be a link so
 * it reaches the keyboard and the screen reader as one, and a control that
 * acts must be a button so Space activates it. Styling one to look like the
 * other is where landing pages usually break their own keyboard support.
 */
export function Button({ variant = 'primary', size = 'md', className, ...rest }: ButtonAsButton | ButtonAsLink) {
  const classes = cn(base, variants[variant], sizes[size], className)

  if ('href' in rest && rest.href !== undefined) {
    const { children, ...anchor } = rest as ButtonAsLink
    return (
      <a className={classes} {...anchor}>
        {children}
      </a>
    )
  }

  const { children, ...button } = rest as ButtonAsButton
  return (
    <button className={classes} {...button}>
      {children}
    </button>
  )
}
