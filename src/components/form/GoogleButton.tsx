import { pendingLoginReturn } from '@/lib/loginReturn'
import { GoogleIcon } from '@/components/ui/BrandIcons'
import { useAuthCopy } from '@/copy/useAuthCopy'
import { federatedSignInUrl } from '@/lib/api'

/**
 * "Continue with Google" — a plain link, and nothing else.
 *
 * An <a> rather than a button with an onClick, because a federated sign-in is
 * a full-page navigation to our own backend, which then 302s onward to
 * Google. A link is what it actually is, so it reaches the keyboard, the
 * screen reader, middle-click and "open in new tab" for free.
 *
 * There is NO Google Identity Services script, no gapi, no One Tap. The whole
 * flow is a redirect to our backend and back; a third-party script would add
 * code we do not control and tracking we do not want to the one page where
 * someone is about to type a credential.
 */
export function GoogleButton({returnTo}: {returnTo?:string} = {}) {
  const { c } = useAuthCopy()

  return (
    <a onClick={() => {if (returnTo) pendingLoginReturn.remember(returnTo)}} href={federatedSignInUrl('google')} className="auth-button auth-button--provider">
      <GoogleIcon className="size-5 shrink-0" />
      {c.common.google}
    </a>
  )
}
