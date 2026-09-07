import { createContext, useContext } from 'react'

import type { GuideKey } from './guides'

/**
 * The handle any card uses to open a guide.
 *
 * In its own module rather than beside the panel component, because a file
 * that exports both a component and a hook breaks Fast Refresh — every edit to
 * the panel would remount the whole workspace instead of hot-swapping it.
 */
export type GuideApi = { open: (key: GuideKey) => void }

export const GuideContext = createContext<GuideApi | null>(null)

export function useGuidePanel(): GuideApi {
  const value = useContext(GuideContext)
  if (!value) throw new Error('useGuidePanel must be used inside <TeacherGuideProvider>')
  return value
}
