import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'

import { FacebookIcon, GoogleIcon } from '@/components/ui/BrandIcons'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { federatedSignInUrl } from '@/lib/api'
import { cn } from '@/lib/cn'

/*
 * One recipe, both buttons.
 *
 * Identical box: same min-height, same padding, same 5px radius (the global
 * scale collapses every `rounded-*` onto 5px — see index.css). Only the
 * surface colour differs, so neither provider reads as the recommended one.
 *
 * `min-h` rather than a fixed height, matching the landing buttons: an Arabic
 * label is taller than its English counterpart and must grow the control
 * rather than overflow it.
 */
const PROVIDER_BUTTON =
  'inline-flex w-full min-h-12 items-center justify-center gap-3 rounded-md px-5 py-3 ' +
  'text-[0.95rem] font-semibold transition-colors duration-200 motion-reduce:transition-none ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2'

/**
 * Sign in.
 *
 * Both controls are plain links, not buttons with an onClick. A federated
 * sign-in is a full-page navigation to our own backend, which then redirects
 * onward to the provider — so a link is what it actually is, and it reaches
 * the keyboard, the screen reader and "open in new tab" for free.
 *
 * No Facebook JavaScript SDK, no Meta pixel, no Google Identity script. The
 * entire flow is our backend and a redirect; a third-party script would add
 * tracking we do not want and code we do not control to the one page where a
 * user is about to type a credential.
 */
export default function SignIn() {
  const { t } = useTranslation()
  const [params] = useSearchParams()
  useDocumentTitle(t('signIn.title'))

  /*
   * The callback sends people here with a reason code from a fixed set. It is
   * looked up in the message table rather than displayed, so a crafted
   * `?error=` in the address bar cannot put arbitrary text on our own origin.
   */
  const reason = params.get('error')
  const messages: Record<string, string> = {
    cancelled: t('signIn.errors.cancelled'),
    account_exists: t('signIn.errors.accountExists'),
    bad_state: t('signIn.errors.badState'),
    expired: t('signIn.errors.expired'),
    unavailable: t('signIn.errors.unavailable'),
    failed: t('signIn.errors.failed'),
  }
  const message = reason ? (messages[reason] ?? t('signIn.errors.failed')) : null

  return (
    <section className="pt-36 pb-24 sm:pt-44">
      <Container>
        <div className="mx-auto w-full max-w-md">
          <Reveal>
            <h1 className="text-title font-extrabold text-balance">{t('signIn.title')}</h1>
            <p className="mt-4 text-muted text-pretty">{t('signIn.lead')}</p>
          </Reveal>

          {message ? (
            <Reveal delay={80}>
              {/*
                `alert` + `aria-live` so a screen reader announces it on
                arrival. The reason is carried in the URL, so this text is
                already on screen at first paint rather than after a fetch.
              */}
              <p
                role="alert"
                aria-live="polite"
                className="mt-6 rounded-md border border-line bg-raised px-4 py-3 text-sm leading-relaxed text-fg"
              >
                {message}
              </p>
            </Reveal>
          ) : null}

          {/*
            Google first, then Facebook. A fixed order, not a preference:
            people find a button by where it was last time, and reordering the
            list between visits is how someone signs in with the wrong one.
          */}
          <Reveal delay={140}>
            <div className="mt-8 flex flex-col gap-3">
              <a
                href={federatedSignInUrl('google')}
                className={cn(
                  PROVIDER_BUTTON,
                  // Google's terms want the four-colour G on a light surface,
                  // so this stays white in both themes rather than following
                  // the page's own surface token.
                  'border border-line bg-white text-[#1f1f1f] hover:bg-[#f7f8f8]',
                  'focus-visible:outline-accent',
                )}
              >
                <GoogleIcon className="size-5 shrink-0" />
                {t('signIn.google')}
              </a>

              <a
                href={federatedSignInUrl('facebook')}
                className={cn(
                  PROVIDER_BUTTON,
                  // #1877F2 is Meta's official brand blue; the hover is the
                  // same hue darkened, not a different colour. White on it is
                  // 3.7:1 -- below AA for body text, which is why the label is
                  // semibold at 0.95rem and so qualifies as large text.
                  'bg-[#1877F2] text-white hover:bg-[#0C63D4]',
                  'focus-visible:outline-[#1877F2]',
                )}
              >
                <FacebookIcon className="size-5 shrink-0" />
                {t('signIn.facebook')}
              </a>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  )
}
