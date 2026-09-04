import { cn } from '@/lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

const BASE =
  'group relative inline-flex items-center justify-center gap-2 rounded-md font-semibold ' +
  'whitespace-nowrap transition-all duration-300 ease-out-expo ' +
  'disabled:pointer-events-none disabled:opacity-50'

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'master-button text-white ' +
    'hover:-translate-y-0.5 hover:brightness-95 ' +
    'active:translate-y-0',
  secondary:
    'glass text-fg hover:border-line-strong hover:-translate-y-0.5 ' +
    'hover:bg-[color-mix(in_oklab,var(--surface)_92%,transparent)] active:translate-y-0',
  ghost: 'text-muted hover:text-fg hover:bg-raised',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6 text-[0.95rem]',
  lg: 'h-13 px-8 text-base',
}

/**
 * The class recipe on its own, so router `<Link>`s and anchors can look
 * identical to a `<Button>` without duplicating the variant table.
 *
 * `cn` resolves conflicts last-wins, so a caller can pass `hidden lg:inline-flex`
 * and have it beat the `inline-flex` in BASE.
 */
export function buttonStyles({
  variant = 'primary',
  size = 'md',
  className,
}: {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
} = {}) {
  return cn(BASE, VARIANTS[variant], SIZES[size], className)
}
