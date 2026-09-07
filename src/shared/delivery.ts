/*
 * GENERATED FILE — DO NOT EDIT.
 *
 * Mirrored from asasera-backend/packages/shared/src/delivery.ts.
 * Edit the source there and run `npm run sync:shared` in asasera-backend.
 * CI fails if this file and its source differ.
 */
import {z} from 'zod'
import {answerPayloadSchema} from './questions.ts'
import {publicQuestionSchema} from './session.ts'
export const assignmentCreateSchema=z.object({activityId:z.number().int().positive(),mode:z.enum(['homework','study']),deadline:z.iso.datetime(),feedback:z.enum(['after_deadline','after_submission','immediate']),classId:z.number().int().positive().nullable().default(null),requestId:z.uuid()}).strict()
export const assignmentAccessSchema=z.object({accessToken:z.string().min(32).max(100)}).strict()
export const attemptJoinSchema=assignmentAccessSchema.extend({name:z.string().trim().min(1).max(40),requestId:z.uuid()}).strict()
export const attemptCommandSchema=z.object({token:z.string().min(32).max(100)}).strict()
export const attemptNextSchema=attemptCommandSchema.extend({position:z.number().int().min(0)}).strict()
export const attemptAnswerSchema=attemptCommandSchema.extend({questionId:z.number().int().positive(),position:z.number().int().min(0),answer:answerPayloadSchema}).strict()
export const attemptViewSchema=z.object({id:z.uuid(),assignmentId:z.uuid(),title:z.string(),theme:z.string(),mode:z.enum(['homework','study']),deadline:z.string(),serverNow:z.number(),status:z.enum(['active','submitted','expired']),position:z.number(),questionCount:z.number(),answered:z.boolean(),score:z.number().nullable(),correctCount:z.number().nullable(),feedbackAvailable:z.boolean(),feedbackPolicy:z.enum(['after_deadline','after_submission','immediate']),question:publicQuestionSchema.nullable(),reveal:z.object({correct:z.unknown(),wasCorrect:z.boolean()}).nullable(),review:z.array(z.object({question:publicQuestionSchema,correct:z.unknown(),wasCorrect:z.boolean().nullable()}))}).strict()
export type AttemptView=z.infer<typeof attemptViewSchema>
