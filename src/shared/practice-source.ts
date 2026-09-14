/*
 * GENERATED FILE — DO NOT EDIT.
 *
 * Mirrored from asasera-backend/packages/shared/src/practice-source.ts.
 * Edit the source there and run `npm run sync:shared` in asasera-backend.
 * CI fails if this file and its source differ.
 */
import {z} from 'zod'

/** A citation label, never a source-file capability or a generated answer excerpt. */
export const practiceSourceContextSchema=z.object({origin:z.enum(['file','topic']),sections:z.array(z.number().int().positive()).max(1000)}).strict()
export type PracticeSourceContext=z.infer<typeof practiceSourceContextSchema>
const provenance=z.object({origin:z.enum(['file','topic']),segmentIndexes:z.array(z.number().int().positive()).max(1000)})

/** Stored material_segments use positive one-based indexes (including Office i+1).
 * They are source-section references, not inferred printed pages or slide numbers.
 * Read only pinned provenance; do not resolve private source titles/bytes here. */
export function practiceSourceContext(value:unknown):PracticeSourceContext|undefined{
 const parsed=provenance.safeParse(value)
 if(!parsed.success)return undefined
 return {origin:parsed.data.origin,sections:parsed.data.origin==='file'?[...new Set(parsed.data.segmentIndexes)].sort((a,b)=>a-b):[]}
}
