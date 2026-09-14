/*
 * GENERATED FILE — DO NOT EDIT.
 *
 * Mirrored from asasera-backend/packages/shared/src/presentation-preview.ts.
 * Edit the source there and run `npm run sync:shared` in asasera-backend.
 * CI fails if this file and its source differ.
 */
import {z} from 'zod'
import {publicQuestionSchema} from './session.ts'
import {presentationSelectionSchema} from './presentation.ts'
import {memoryBoardSchema} from './memory.ts'
import {attemptWordBuilderSchema} from './delivery.ts'
import {publicWordBoardSchema} from './word-board-contract.ts'
import {parsePayload} from './questions.ts'
import {contentLanguageSchema} from './content-language.ts'

/** Teacher-owner-only DTO. Reviewed keys are intentional here, never a learner/projector response. */
export const presentationPreviewItemSchema=z.object({
 question:publicQuestionSchema,reviewedPayload:z.unknown(),referenceAnswer:z.unknown(),explanation:z.string().nullable(),
 memory:memoryBoardSchema.optional(),wordBuilder:attemptWordBuilderSchema.optional(),
 wordGrid:z.object({board:publicWordBoardSchema,referenceValues:z.record(z.string(),z.string()),referencePaths:z.array(z.object({id:z.string(),cells:z.array(z.object({row:z.number(),column:z.number()}))}))}).optional(),
}).strict().superRefine((item,context)=>{if(!parsePayload(item.question.payload.kind,item.reviewedPayload).success)context.addIssue({code:'custom',message:'Invalid reviewed preview content'})})
export const presentationPreviewSchema=z.object({
 previewOnly:z.literal(true),activityId:z.number().int().positive(),title:z.string(),contentLanguage:contentLanguageSchema.nullable(),
 contentVersionId:z.number().int().positive(),sourceQuestionCount:z.number().int().min(1).max(100),selection:presentationSelectionSchema,
 items:z.array(presentationPreviewItemSchema).min(1).max(100),
}).strict()
export type PresentationPreview=z.infer<typeof presentationPreviewSchema>
export type PresentationPreviewItem=z.infer<typeof presentationPreviewItemSchema>
