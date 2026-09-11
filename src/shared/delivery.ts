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
import {gameModeSchema,arcadeStateSchema,arcadeInputSchema} from './arcade.ts'
/** An IANA zone name as the client sent it. Shape only: the server validates it against Intl and answers 422 invalid_timezone. */
export const timeZoneSchema=z.string().trim().min(1).max(64).regex(/^[A-Za-z][A-Za-z0-9_+\-]*(?:\/[A-Za-z0-9_+\-]+)*$/)
/** A wall-clock time with no zone or offset, minute precision, resolved on the server in `deadlineTz`. */
export const localDateTimeSchema=z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
/** Chosen by the client only after a 422 ambiguous_local_time / nonexistent_local_time; the server never picks silently. */
export const dstResolutionSchema=z.enum(['earlier','later'])
export const assignmentWindowStateSchema=z.enum(['scheduled','open','closed'])
/* v5.1 window (C2): exactly one of `deadline` (a UTC instant — the pre-v5.1 contract, still accepted) or `deadlineLocal`
   + `deadlineTz` (a wall-clock time the server resolves in that zone). `opensAt`/`opensAtLocal` follow the same rule and
   are optional: absent means the assignment opens at creation, exactly as before. `deadlineTz` alone with an instant is
   display-only. `maxAttempts` defaults to 1, the pre-v5.1 behaviour. */
export const assignmentCreateSchema=z.object({activityId:z.number().int().positive(),mode:z.enum(['homework','study']),gameMode:gameModeSchema.default('quiz'),deadline:z.iso.datetime().optional(),deadlineLocal:localDateTimeSchema.optional(),opensAt:z.iso.datetime().nullable().optional(),opensAtLocal:localDateTimeSchema.nullable().optional(),deadlineTz:timeZoneSchema.optional(),resolution:dstResolutionSchema.optional(),maxAttempts:z.number().int().min(1).max(10).default(1),feedback:z.enum(['after_deadline','after_submission','immediate']),classId:z.number().int().positive().nullable().default(null),requestId:z.uuid()}).strict().superRefine((v,ctx)=>{
 if((v.deadline===undefined)===(v.deadlineLocal===undefined))ctx.addIssue({code:'custom',path:['deadline'],message:'Send either deadline (instant) or deadlineLocal (wall-clock time).'})
 if(v.opensAt!=null&&v.opensAtLocal!=null)ctx.addIssue({code:'custom',path:['opensAt'],message:'Send either opensAt or opensAtLocal, not both.'})
 if((v.deadlineLocal!==undefined||v.opensAtLocal!=null)&&v.deadlineTz===undefined)ctx.addIssue({code:'custom',path:['deadlineTz'],message:'A wall-clock time needs its time zone.'})
})
export type AssignmentCreate=z.infer<typeof assignmentCreateSchema>
export const assignmentAccessSchema=z.object({accessToken:z.string().min(32).max(100)}).strict()
export const attemptJoinSchema=assignmentAccessSchema.extend({name:z.string().trim().min(1).max(40),requestId:z.uuid()}).strict()
export const attemptCommandSchema=z.object({token:z.string().min(32).max(100)}).strict()
/** A new attempt for the SAME identity: the previous attempt's resume key proves it (browser-storage identity for guests). */
export const attemptRetrySchema=attemptCommandSchema.extend({requestId:z.uuid()}).strict()
export const attemptNextSchema=attemptCommandSchema.extend({position:z.number().int().min(0)}).strict()
export const attemptAnswerSchema=attemptCommandSchema.extend({questionId:z.number().int().positive(),position:z.number().int().min(0),answer:answerPayloadSchema}).strict()
export const attemptGameSchema=attemptCommandSchema.extend({position:z.number().int().nonnegative(),action:z.enum(['start','input','sync','finish']),input:arcadeInputSchema.optional()}).strict()
/* Window and attempt fields carry defaults so a client can still parse a view from a server that predates v5.1. */
export const attemptViewSchema=z.object({gameMode:gameModeSchema.default('quiz'),gamePoints:z.number().default(0),game:arcadeStateSchema.nullable().default(null),id:z.uuid(),assignmentId:z.uuid(),title:z.string(),theme:z.string(),mode:z.enum(['homework','study']),deadline:z.string(),opensAt:z.string().nullable().default(null),deadlineTz:z.string().default('UTC'),windowState:assignmentWindowStateSchema.default('open'),serverNow:z.number(),status:z.enum(['active','submitted','expired']),attemptNumber:z.number().int().min(1).default(1),maxAttempts:z.number().int().min(1).max(10).default(1),attemptsRemaining:z.number().int().min(0).default(0),position:z.number(),questionCount:z.number(),answered:z.boolean(),score:z.number().nullable(),correctCount:z.number().nullable(),feedbackAvailable:z.boolean(),feedbackPolicy:z.enum(['after_deadline','after_submission','immediate']),question:publicQuestionSchema.nullable(),reveal:z.object({correct:z.unknown(),wasCorrect:z.boolean(),explanation:z.string().nullable().optional()}).nullable(),review:z.array(z.object({question:publicQuestionSchema,correct:z.unknown(),wasCorrect:z.boolean().nullable(),explanation:z.string().nullable().optional()}))}).strict()
export type AttemptView=z.infer<typeof attemptViewSchema>
