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
import {presentationSelectionSchema,presentationIdSchema} from './presentation.ts'
import {wheelSpinSchema} from './wheel.ts'
import {attemptWordGridSchema,wordGridProgressSchema,wordCellSchema} from './word-board-contract.ts'
import {memoryProgressSchema,memoryViewSchema} from './memory.ts'
import {contentLanguageSchema} from './content-language.ts'
export {memoryProgressSchema} from './memory.ts'
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
export const assignmentCreateSchema=z.object({activityId:z.number().int().positive(),mode:z.enum(['homework','study']),gameMode:gameModeSchema.default('quiz'),presentation:presentationSelectionSchema.optional(),deadline:z.iso.datetime().optional(),deadlineLocal:localDateTimeSchema.optional(),opensAt:z.iso.datetime().nullable().optional(),opensAtLocal:localDateTimeSchema.nullable().optional(),deadlineTz:timeZoneSchema.optional(),resolution:dstResolutionSchema.optional(),maxAttempts:z.number().int().min(1).max(10).default(1),feedback:z.enum(['after_deadline','after_submission','immediate']),classId:z.number().int().positive().nullable().default(null),requestId:z.uuid()}).strict().superRefine((v,ctx)=>{
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
export const practiceRatingSchema=z.enum(['again','learning','known'])
export const attemptWordBuilderSchema=z.object({entries:z.array(z.object({id:z.string(),clue:z.string(),tiles:z.array(z.object({id:z.string(),text:z.string()}).strict()).min(1).max(128)}).strict()).min(1).max(40)}).strict()
export const attemptMemorySchema=memoryViewSchema
export const attemptPresentationSchema=z.object({definitionId:presentationIdSchema,revision:z.number().int().nonnegative(),order:z.array(z.number().int().min(0).max(99)).max(100),drawn:z.array(z.number().int().min(0).max(99)).max(100).default([]),activeIndex:z.number().int().min(0).max(99).nullable(),revealed:z.boolean(),ratings:z.record(z.string().regex(/^\d{1,2}$/),practiceRatingSchema),discussed:z.array(z.number().int().min(0).max(99)).max(100).default([]),reviewing:z.boolean().default(false),reviewOrder:z.array(z.number().int().min(0).max(99)).max(100).default([]),reviewed:z.array(z.number().int().min(0).max(99)).max(100).default([]),wordBuilder:attemptWordBuilderSchema.optional(),memory:attemptMemorySchema.optional(),memoryProgress:z.record(z.string().regex(/^\d{1,2}$/),memoryProgressSchema).default({}),questionWheel:wheelSpinSchema.optional(),wordGrid:attemptWordGridSchema.optional(),wordGridProgress:z.record(z.string().regex(/^\d{1,2}$/),wordGridProgressSchema).default({})}).strict()
export type AttemptPresentation=z.infer<typeof attemptPresentationSchema>
export const attemptPresentationCommandSchema=attemptCommandSchema.extend({requestId:z.uuid(),expectedRevision:z.number().int().nonnegative(),action:z.enum(['draw','flip','rate','previous','review-again','discussed','memory-flip','memory-continue','word-search-select','crossword-entry','crossword-check']),entryId:z.string().regex(/^clue_[1-9][0-9]?$/).optional(),value:z.string().max(1024).optional(),start:wordCellSchema.optional(),end:wordCellSchema.optional(),cardId:z.string().regex(/^[a-f0-9]{32}$/).optional(),index:z.number().int().min(0).max(99).optional(),rating:practiceRatingSchema.optional()}).strict().superRefine((command,ctx)=>{
 if(command.action==='crossword-entry'?command.entryId===undefined||command.value===undefined:command.entryId!==undefined||command.value!==undefined)ctx.addIssue({code:'custom',path:['entryId'],message:'A crossword entry requires its clue ID and current value.'})
 if(command.action==='word-search-select'?!(command.start&&command.end):command.start!==undefined||command.end!==undefined)ctx.addIssue({code:'custom',path:['start'],message:'A word-search selection requires start and end cells.'})
 if((command.action==='memory-flip')!==(command.cardId!==undefined))ctx.addIssue({code:'custom',path:['cardId'],message:'A memory flip requires one opaque card ID.'})
 if(command.action==='rate'&&command.rating===undefined)ctx.addIssue({code:'custom',path:['rating'],message:'Choose a self-rating.'})
 if(command.action!=='rate'&&command.rating!==undefined)ctx.addIssue({code:'custom',path:['rating'],message:'A rating belongs to a rate command.'})
 if(command.action!=='draw'&&command.index!==undefined)ctx.addIssue({code:'custom',path:['index'],message:'A box index belongs to a draw command.'})
})
export type AttemptPresentationCommand=z.infer<typeof attemptPresentationCommandSchema>
/* Window and attempt fields carry defaults so a client can still parse a view from a server that predates v5.1. */
export const attemptViewSchema=z.object({submittedAnswer:answerPayloadSchema.nullable().default(null),contentLanguage:contentLanguageSchema.optional(),gameMode:gameModeSchema.default('quiz'),gamePoints:z.number().default(0),game:arcadeStateSchema.nullable().default(null),presentation:attemptPresentationSchema.nullable().optional(),id:z.uuid(),assignmentId:z.uuid(),title:z.string(),theme:z.string(),mode:z.enum(['homework','study']),deadline:z.string(),opensAt:z.string().nullable().default(null),deadlineTz:z.string().default('UTC'),windowState:assignmentWindowStateSchema.default('open'),serverNow:z.number(),status:z.enum(['active','submitted','expired']),attemptNumber:z.number().int().min(1).default(1),maxAttempts:z.number().int().min(1).max(10).default(1),attemptsRemaining:z.number().int().min(0).default(0),position:z.number(),questionCount:z.number(),answered:z.boolean(),score:z.number().nullable(),correctCount:z.number().nullable(),feedbackAvailable:z.boolean(),feedbackPolicy:z.enum(['after_deadline','after_submission','immediate']),question:publicQuestionSchema.nullable(),reveal:z.object({correct:z.unknown(),wasCorrect:z.boolean().nullable(),explanation:z.string().nullable().optional()}).nullable(),review:z.array(z.object({submittedAnswer:answerPayloadSchema.nullable().default(null),question:publicQuestionSchema,correct:z.unknown(),wasCorrect:z.boolean().nullable(),explanation:z.string().nullable().optional()}))}).strict()
export type AttemptView=z.infer<typeof attemptViewSchema>
