import { z } from 'zod'

// Recovery within the current browser tab, scoped to the authenticated owner.
// Keep uploaded media keys, never File objects. The API remains the source of
// truth: writes happen at input time; cleanup happens only on acknowledgement
// of that snapshot, or an explicit discard. Closing a tab ends its session.
const prefix = 'asasera:activity-draft:v1:'
export const draftKey = (userId: number | undefined, scope: string) => userId ? `${prefix}${userId}:${scope}` : null
export function readDraft<T>(key: string | null, schema: z.ZodType<T>): T | null {
  if (!key) return null
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    const parsed = schema.safeParse(JSON.parse(raw))
    if (parsed.success) return parsed.data
    sessionStorage.removeItem(key)
  } catch { /* A blocked store must not prevent opening the editor. */ }
  return null
}
export function writeDraft(key: string | null, value: unknown): boolean {
  if (!key) return true
  try { sessionStorage.setItem(key, JSON.stringify(value)); return true } catch { return false }
}
export function clearDraft(key: string | null, expected?: unknown): boolean {
  if (!key) return true
  try {
    if (expected !== undefined && sessionStorage.getItem(key) !== JSON.stringify(expected)) return true
    sessionStorage.removeItem(key); return true
  } catch { return false }
}

export const audienceDraftSchema = z.object({ categoryId: z.number().int().nullable(), educationStageIds: z.array(z.number().int()), countryIds: z.array(z.number().int()) })
export const creationDraftSchema = z.object({ title: z.string(), purpose: z.string(), audience: audienceDraftSchema.nullable() })
export const questionPatchSchema = z.object({
  kind: z.enum(['mcq', 'tf', 'order', 'match', 'hotspot']), prompt: z.string(),
  payload: z.record(z.string(), z.unknown()), timeLimitS: z.number(),
  mediaKey: z.string().nullable(), confirmZones: z.boolean(),
  errorPairs: z.array(z.object({ elementKey: z.string(), wrongTargetKey: z.string().nullable(), reason: z.string() })),
})
const questionDraftSchema = z.object({ baseRevision: z.number(), patch: questionPatchSchema })
export const editorDraftSchema = z.object({
  title: z.object({ value: z.string(), base: z.string() }).optional(),
  questions: z.record(z.string(), questionDraftSchema),
  activeQuestionId: z.number().nullable(),
})
export type EditorDraft = z.infer<typeof editorDraftSchema>
export const emptyEditorDraft = (): EditorDraft => ({ questions: {}, activeQuestionId: null })
export function hasEditorChanges(draft: EditorDraft) { return !!draft.title || Object.keys(draft.questions).length > 0 }
export function storeEditorDraft(key: string | null, draft: EditorDraft) {
  return hasEditorChanges(draft) ? writeDraft(key, draft) : clearDraft(key)
}

/** A late save may acknowledge an older edit; never remove its newer replacement. */
export function acknowledgeQuestion(draft: EditorDraft, id: number, patch: Record<string, unknown>, revision: number): EditorDraft {
  const questions = { ...draft.questions }, pending = questions[id]
  if (pending) {
    if (JSON.stringify(pending.patch) === JSON.stringify(patch)) delete questions[id]
    else questions[id] = { ...pending, baseRevision: revision }
  }
  return { ...draft, questions }
}

export function acknowledgeTitle(draft: EditorDraft, title: string): EditorDraft {
  if (!draft.title) return draft
  if (draft.title.value !== title) return { ...draft, title: { ...draft.title, base: title } }
  const { title: _title, ...rest } = draft
  return rest
}
