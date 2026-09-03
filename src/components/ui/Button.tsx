import type { ButtonHTMLAttributes } from 'react'

import { buttonStyles, type ButtonSize, type ButtonVariant } from './buttonStyles'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
}

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return <button className={buttonStyles({ variant, size, className })} {...props} />
}
