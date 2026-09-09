import { createContext } from 'react'
import type { LearningProfile } from '@/shared/student'

export type SignupRole = 'teacher' | 'student'

export type SignupDraft = {
  role: SignupRole
  /**
   * A row id from `workplace_types`. The teacher's first question.
   *
   * There is no `workplaceAnswered` beside it, unlike the stage below, and
   * that is the shape of the screen rather than an omission: the four cards
   * have no "choose later", so a workplace is either chosen — which advances
   * the step — or the person never left the step at all. Null means unanswered
   * and there is no second way to be unanswered.
   */
  workplaceId: number | null
  /** A row id from education_stages, or null for "Choose later". */
  stageId: number | null
  /** True once the person has actively answered the stage step either way. */
  learningProfile: LearningProfile
  stageAnswered: boolean
  email: string
}

export type SignupContextValue = {
  draft: SignupDraft | null
  begin: (role: SignupRole) => void
  setWorkplace: (workplaceId: number) => void
  setStage: (stageId: number | null) => void
  setLearningProfile: (profile: LearningProfile) => void
  setEmail: (email: string) => void
  clear: () => void
}

/**
 * Split from the provider so this module exports only a context — a file
 * exporting both a component and a value breaks React Fast Refresh.
 */
export const SignupContext = createContext<SignupContextValue | null>(null)
