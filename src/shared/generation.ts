/*
 * GENERATED FILE — DO NOT EDIT.
 *
 * Mirrored from asasera-backend/packages/shared/src/generation.ts.
 * Edit the source there and run `npm run sync:shared` in asasera-backend.
 * CI fails if this file and its source differ.
 */
import {z} from 'zod'
export const generationTaskSchema=z.enum(['questions','reasons','zones','merges'])
export type GenerationTask=z.infer<typeof generationTaskSchema>
/** Automatic routing by default; an explicit provider is honoured and never silently switched (v5 §13). */
export const generationProviderSchema=z.enum(['auto','openai','gemini'])
export type GenerationProvider=z.infer<typeof generationProviderSchema>
export const generationDifficultySchema=z.enum(['easy','medium','hard'])
export const generationInputSchema=z.object({
 activityId:z.number().int().positive(),task:generationTaskSchema,
 origin:z.enum(['topic','file']).default('topic'),
 /* Optional for file-grounded questions: the selected pages are the objective. Required (≥3 chars) for topic origin; checked by the service. */
 objective:z.string().trim().max(1000).default(''),language:z.enum(['ar','en']).default('ar'),
 count:z.number().int().min(1).max(10).default(5),kinds:z.array(z.enum(['mcq','tf','order','match'])).min(1).max(4).default(['mcq','tf']),
 mode:z.enum(['generate','extract']).default('generate'),tone:z.enum(['clear','conversational','formal']).default('clear'),
 difficulty:generationDifficultySchema.default('medium'),quoteId:z.uuid().optional(),
 materialRevisionId:z.number().int().positive().nullable().default(null),segments:z.array(z.number().int().positive()).max(30).default([]),
 questionId:z.number().int().positive().nullable().default(null),expectedRevision:z.number().int().positive(),
 /* Follow-up practice: the run whose difficult questions this generation targets (v5 §21). */
 sourceRunId:z.number().int().positive().nullable().default(null),
 maxAuthorizedMillicents:z.number().int().positive(),idempotencyKey:z.string().min(10).max(100),
}).strict()
export type GenerationInput=z.infer<typeof generationInputSchema>
const reason=z.object({elementKey:z.string().max(32),wrongTargetKey:z.string().max(32).nullable(),reason:z.string().trim().min(3).max(1000)}).strict()
export const generatedQuestionSchema=z.object({kind:z.enum(['mcq','tf','order','match']),prompt:z.string().trim().min(3).max(2000),payloadJson:z.string().max(12000),
 /** One or two sentences explaining why the key is correct; shown only after the answer window closes. */
 explanation:z.string().trim().max(600),
 /** Short concept label from the material, e.g. "photosynthesis inputs". Empty when not applicable. */
 concept:z.string().trim().max(120),
 reasons:z.array(reason).max(64),sourceSegments:z.array(z.number().int().positive()).max(30)}).strict()
export const proposedZoneSchema=z.object({key:z.string().regex(/^[a-z0-9_]{1,32}$/),x:z.number().min(0).max(1),y:z.number().min(0).max(1),w:z.number().gt(0).max(1),h:z.number().gt(0).max(1)}).strict()
export const mergeCandidateSchema=z.object({sourceId:z.number().int().positive(),targetId:z.number().int().positive(),reason:z.string().min(3).max(1000)}).strict()
export const outputSchemas={
 questions:z.object({candidates:z.array(generatedQuestionSchema).max(10)}).strict(),
 reasons:z.object({candidates:z.array(reason).max(64)}).strict(),
 zones:z.object({candidates:z.array(proposedZoneSchema).max(12)}).strict(),
 merges:z.object({candidates:z.array(mergeCandidateSchema).max(10)}).strict(),
}
export type GeneratedQuestion=z.infer<typeof generatedQuestionSchema>
export const generationApplySchema=z.object({selected:z.array(z.number().int().min(0).max(63)).min(1).max(64),expectedRevision:z.number().int().positive(),edits:z.array(z.object({index:z.number().int().min(0).max(63),question:generatedQuestionSchema,mediaKey:z.string().min(1).max(500).nullable().optional()}).strict()).max(10).optional()}).strict()
/** What the client sees before it pays: the estimate, the ceiling it authorises, and the teacher's usable credit. */
export const generationQuoteSchema=z.object({
 estimateMillicents:z.number().int().nonnegative(),maxAuthorizedMillicents:z.number().int().nonnegative(),
 spendableMillicents:z.number().int(),usableMillicents:z.number().int(),allowanceMillicents:z.number().int(),exposureMillicents:z.number().int(),
 affordable:z.boolean(),pricingAvailable:z.boolean(),generationAvailable:z.boolean(),
 quoteId:z.uuid(),quoteExpiresAt:z.string(),
 grant:z.object({trialMillicents:z.number().int(),claimed:z.boolean(),eligible:z.boolean(),reason:z.string().nullable()}),
 delivery:z.string(),
})
export type GenerationQuote=z.infer<typeof generationQuoteSchema>
