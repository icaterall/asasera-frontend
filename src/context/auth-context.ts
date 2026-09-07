import { createContext } from 'react'

import type { PublicUser } from '@/lib/api'

/**
 * `loading` is the state that exists only until the boot refresh settles.
 *
 * It is a distinct value rather than `user === null`, because those two mean
 * opposite things to a guarded route: "we do not know yet" must render a
 * spinner, while "nobody is signed in" must redirect. Collapsing them is how
 * a reload bounces a signed-in person to /login for a frame before snapping
 * back.
 */
export type AuthStatus = 'loading' | 'authenticated' | 'anonymous'

export type AuthContextValue = {
  status: AuthStatus
  user: PublicUser | null
  /**
   * The access token, in memory, mirrored out of the api module's store.
   * Exposed for completeness; nothing needs to read it to make a request,
   * because `api` attaches it itself.
   */
  accessToken: string | null
  /** True while a teacher has told us neither a subject nor a workplace. */
  needsProfile: boolean
  signIn: (email: string, password: string) => Promise<PublicUser>
  signOut: () => Promise<void>
  /** Clear browser session state after server-side revocation. */
  forgetSession: () => void
  /** Replaces the cached user after a profile update. */
  applyUser: (user: PublicUser) => void
}

/*
 * Split from the provider component so this module exports only a context — a
 * file exporting both a component and a value breaks React Fast Refresh. Same
 * split the repo already makes in `theme-context.ts` and `language-context.ts`.
 */
export const AuthContext = createContext<AuthContextValue | null>(null)
