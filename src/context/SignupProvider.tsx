import { useCallback, useMemo, useState, type ReactNode } from 'react'

import { SignupContext, type SignupDraft, type SignupRole } from './signup-context'

/**
 * What the signup chain has gathered so far, held in memory only.
 *
 * IN MEMORY, DELIBERATELY. Nothing here goes to localStorage, sessionStorage,
 * a cookie or the URL. The draft carries an email address and a role, and the
 * password step keeps its own field in local state that this provider never
 * sees — so a password cannot be persisted by a bug here, because it never
 * arrives here in the first place.
 *
 * The cost is that a refresh empties the draft, and that is handled rather
 * than hidden: each step checks what it needs and sends the person back to
 * the earliest step whose answer is missing, instead of rendering a form that
 * would submit an incomplete request. See `useSignupStep`.
 *
 * The teacher's workplace needs no such flag — its screen has no "choose
 * later", so null is unambiguous. `stageAnswered` is separate from `stageId`
 * because on the student's step "Choose later" is a real answer that stores
 * nothing. Without it, a deliberate skip and an untouched
 * step are indistinguishable, and the chain would bounce someone back to a
 * question they already declined.
 */
export function SignupProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<SignupDraft | null>(null)

  const begin = useCallback((role: SignupRole) => {
    setDraft((current) =>
      /* Re-entering the same role keeps what was already answered, so going
         back to the role step and forward again does not wipe a stage. */
      current?.role === role
        ? current
        : { role, workplaceId: null, stageId: null, stageAnswered: false, email: '' },
    )
  }, [])

  const setWorkplace = useCallback((workplaceId: number) => {
    setDraft((current) => (current ? { ...current, workplaceId } : current))
  }, [])

  const setStage = useCallback((stageId: number | null) => {
    setDraft((current) => (current ? { ...current, stageId, stageAnswered: true } : current))
  }, [])

  const setEmail = useCallback((email: string) => {
    setDraft((current) => (current ? { ...current, email } : current))
  }, [])

  const clear = useCallback(() => setDraft(null), [])

  const value = useMemo(
    () => ({ draft, begin, setWorkplace, setStage, setEmail, clear }),
    [draft, begin, setWorkplace, setStage, setEmail, clear],
  )

  return <SignupContext.Provider value={value}>{children}</SignupContext.Provider>
}
