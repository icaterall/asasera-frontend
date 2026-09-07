import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { Bdi } from '@/components/Bdi'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/cn'

/**
 * The first character of a name, for the avatar.
 *
 * `Intl.Segmenter` rather than `name[0]`, because a string index returns a
 * UTF-16 code unit: an emoji or any astral character would be cut in half and
 * render as a replacement glyph. Arabic is inside the BMP so indexing would
 * happen to work for it, but "happens to work for the languages we tested" is
 * how that bug ships.
 *
 * No transformation beyond that — no uppercasing. Arabic has no case, and
 * `toUpperCase()` on an Arabic letter is a no-op that only makes the code read
 * as though Latin were the default.
 */
function initial(name: string | null): string {
  const trimmed = (name ?? '').trim()
  /*
   * A neutral mark, not a letter taken from the email address. An account can
   * exist before it has a name — signup is progressive — and deriving "l" from
   * layla@… would show the person a name they never gave us, and would leak a
   * fragment of their address into the header.
   */
  if (!trimmed) return '•'
  const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
  return [...segmenter.segment(trimmed)][0]?.segment ?? trimmed[0]!
}

/**
 * Who is signed in, and the way out.
 *
 * Deliberately NOT a dropdown menu. A popover needs focus trapping, an
 * outside-click listener, Escape handling and `aria-expanded` wiring, and it
 * would hide the one action behind an extra press — on a header whose only
 * authenticated action is "sign out". Two adjacent controls are fewer moving
 * parts and reach the keyboard for free.
 *
 * The avatar is an identity marker, not a link. There is no profile page to
 * send anyone to and building one was explicitly out of scope, so making it
 * clickable would promise a destination that does not exist.
 */
export function AccountControl({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [leaving, setLeaving] = useState(false)

  if (!user) return null

  async function handleSignOut() {
    if (leaving) return
    setLeaving(true)
    try {
      /*
       * Always leave, even if the call fails.
       *
       * `signOut` asks the server to revoke the refresh token, which is the
       * part that matters — clearing client state alone leaves a live 30-day
       * credential in the cookie. But if the request fails, staying signed in
       * on screen is the worse outcome: the person pressed sign out, and the
       * provider clears its in-memory token either way.
       */
      await signOut()
    } finally {
      navigate('/')
    }
  }

  return (
    <div className={cn('flex items-center gap-2', compact && 'w-full justify-between')}>
      <div className="flex items-center gap-2">
        {/*
          A true circle, which is the one shape `rounded-full` is allowed on.
          Hairline and a tint rather than a fill: the header's filled element
          is the primary action, and an avatar competing with it would make
          both quieter. `aria-hidden` because the name sits beside it — a
          screen reader reading "أ" then "أشرف قحمان" is noise.
        */}
        <span
          aria-hidden="true"
          className="grid size-9 shrink-0 place-items-center rounded-full border border-line bg-raised text-sm font-bold text-fg"
        >
          {initial(user.name)}
        </span>

        {/*
          <bdi> because a Latin name inside an RTL header, or an Arabic name
          inside an LTR one, reorders against the controls around it without
          isolation. Hidden below `lg` on the desktop bar where space is tight;
          the mobile sheet passes `compact` and keeps it.
        */}
        <span
          className={cn(
            'max-w-[12ch] truncate text-sm font-semibold text-fg',
            compact ? 'inline-block' : 'hidden xl:inline-block',
          )}
        >
          <Bdi>{user.name ?? t('nav.unnamedAccount')}</Bdi>
        </span>
      </div>

      <button
        type="button"
        onClick={handleSignOut}
        disabled={leaving}
        className={cn(
          'rounded-sm px-3 py-2 text-sm font-semibold transition-colors duration-150',
          'text-muted hover:text-fg disabled:cursor-not-allowed disabled:opacity-60',
        )}
      >
        {leaving ? t('nav.signingOut') : t('nav.signOut')}
      </button>
    </div>
  )
}
