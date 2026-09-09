/*
 * GENERATED FILE — DO NOT EDIT.
 *
 * Mirrored from asasera-backend/packages/shared/src/student.ts.
 * Edit the source there and run `npm run sync:shared` in asasera-backend.
 * CI fails if this file and its source differ.
 */
import { z } from 'zod'

export const studyStages = ['kindergarten', 'school', 'university', 'general'] as const
export type StudyStage = typeof studyStages[number]
export const stageNames: Record<StudyStage, { en: string; ar: string }> = {
  kindergarten: { en: 'Kindergarten', ar: 'رياض الأطفال' },
  school: { en: 'School', ar: 'المدرسة' },
  university: { en: 'University', ar: 'الجامعة' },
  general: { en: 'General learning', ar: 'تعلّم عام' },
}
export function gradesFor(stage: StudyStage): { id: string; en: string; ar: string }[] {
  if (stage === 'kindergarten') return [1, 2].map(n => ({ id: `kg${n}`, en: `Kindergarten ${n}`, ar: `الروضة ${n}` }))
  if (stage === 'school') return Array.from({ length: 12 }, (_, i) => ({ id: `grade${i + 1}`, en: `Grade ${i + 1}`, ar: `الصف ${i + 1}` }))
  if (stage === 'university') return [...Array.from({ length: 6 }, (_, i) => ({ id: `year${i + 1}`, en: `Year ${i + 1}`, ar: `السنة ${i + 1}` })), { id: 'postgraduate', en: 'Postgraduate', ar: 'دراسات عليا' }]
  return []
}
// Learning preferences describe a stage, never an exact age or consent status.
export const learningProfileSchema = z.object({
  stage: z.enum(studyStages), grade: z.string().nullable().default(null),
  // A database choice takes precedence over the legacy broad stage/grade.
  educationStageId: z.number().int().positive().nullable().optional(),
}).strict().superRefine((value, ctx) => {
  if (value.grade !== null && !gradesFor(value.stage).some(g => g.id === value.grade)) {
    ctx.addIssue({ code: 'custom', path: ['grade'], message: 'Choose a grade from your selected stage, or keep it general.' })
  }
})
export type LearningProfile = z.infer<typeof learningProfileSchema>
export type StudentLearningProfile = LearningProfile & {
  educationStage?: { id: number; name_en: string; name_ar: string }
}
export const generalLearning: LearningProfile = { stage: 'general', grade: null }
export function learningLabel(profile: StudentLearningProfile, lang: 'en' | 'ar'): string {
  if (profile.educationStage) return lang === 'ar' ? profile.educationStage.name_ar : profile.educationStage.name_en
  return gradesFor(profile.stage).find(g => g.id === profile.grade)?.[lang] ?? stageNames[profile.stage][lang]
}
export type StudentActivity = {
  id: string; title: string; mode: 'homework' | 'study'; gameMode: string;
  deadline: string; status: 'not_started' | 'active' | 'submitted' | 'expired';
  attemptId: string | null; questionCount: number; answered: number;
  correctCount: number | null; score: number | null; feedbackAvailable: boolean;
}
export type StudentOverview = { profile: StudentLearningProfile; activities: StudentActivity[] }
