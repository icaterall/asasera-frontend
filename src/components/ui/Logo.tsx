import { useTranslation } from 'react-i18next'

import logoLight from '@/assets/images/asas-logo-light.webp'
import logoMark from '@/assets/images/asas-logo.svg'
import { cn } from '@/lib/cn'

/**
 * The real logo files from src/assets/images, not a drawn approximation.
 *
 * Two files ship and CSS picks one, rather than a component reading the theme
 * in JavaScript: the correct mark is then painted on the first frame instead
 * of flipping after hydration, and it is also correct inside the footer,
 * which is dark in *both* themes and so cannot rely on the theme class at all.
 *
 *   asas-logo.svg        the primary mark — dark wordmark, for light grounds
 *   asas-logo-light.webp the light mark   — for dark grounds
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <>
      <img
        src={logoMark}
        alt=""
        aria-hidden="true"
        width={36}
        height={36}
        className={cn('size-9 shrink-0 object-contain object-left dark:hidden', className)}
      />
      <img
        src={logoLight}
        alt=""
        aria-hidden="true"
        width={36}
        height={36}
        className={cn('hidden size-9 shrink-0 object-contain object-left dark:block', className)}
      />
    </>
  )
}

/**
 * The full lockup — the supplied artwork already contains the wordmark, so
 * there is no separate text node beside it. Adding one would set the name
 * twice in two different typefaces.
 */
export function Logo({ className, onDark = false }: { className?: string; onDark?: boolean }) {
  const { t } = useTranslation()

  /*
   * `onDark` is for surfaces that are dark regardless of theme — the footer.
   * There the theme class is the wrong signal, because a light-theme page
   * still has a black footer and still needs the light mark.
   */
  if (onDark) {
    return (
      <img
        src={logoLight}
        alt={t('brand.name')}
        width={150}
        height={40}
        className={cn('h-10 w-auto object-contain', className)}
      />
    )
  }

  return (
    <span className={cn('inline-flex items-center', className)}>
      <img
        src={logoMark}
        alt={t('brand.name')}
        width={150}
        height={40}
        className="h-9 w-auto object-contain dark:hidden"
      />
      <img
        src={logoLight}
        alt=""
        aria-hidden="true"
        width={150}
        height={40}
        className="hidden h-9 w-auto object-contain dark:block"
      />
    </span>
  )
}
