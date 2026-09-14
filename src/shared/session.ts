/*
 * GENERATED FILE — DO NOT EDIT.
 *
 * Mirrored from asasera-backend/packages/shared/src/session.ts.
 * Edit the source there and run `npm run sync:shared` in asasera-backend.
 * CI fails if this file and its source differ.
 */
import { z } from 'zod'
import {practiceSourceContextSchema} from './practice-source.ts'
import { answerPayloadSchema, mcqPublicSchema, imageZoneSchema, clozePublicSchema, vocabularyPublicSchema, discussionPublicSchema } from './questions.ts'
import {gameModeSchema,arcadeInputSchema,arcadeViewSchema,gameStandingSchema} from './arcade.ts'
import {wheelStateSchema,type WheelState} from './wheel.ts'
import {liveWheelCommandSchema,liveWheelRoundSchema,type LiveWheelRound} from './live-wheel.ts'
import {liveLaunchSchema,livePresentationCommandSchema,livePresentationViewSchema,type LivePresentationView} from './live-presentation.ts'
import {contentLanguageSchema} from './content-language.ts'

export const sessionStateSchema = z.enum(['lobby', 'question_open', 'question_locked', 'revealing', 'game_play', 'game_results', 'podium', 'ended'])
export type SessionState = z.infer<typeof sessionStateSchema>
const key = z.string().max(32)
const item = z.object({ key, text: z.string().max(500) })
/* An item a learner can be shown as a picture. The value is a resolved URL,
   put there by `publicQuestion`; the stored object key never leaves the server. */
const mediaItem = item.extend({ image: z.string().max(500).optional() })
// Explicit allowlists. Neither a stored payload nor an error pair can enter a snapshot.
export const publicPayloadSchema = z.discriminatedUnion('kind', [
  clozePublicSchema.extend({kind:z.literal('cloze')}),
  vocabularyPublicSchema.extend({kind:z.literal('vocabulary')}),
  discussionPublicSchema.extend({kind:z.literal('discussion')}),
  z.object({ kind: z.literal('mcq'), ...mcqPublicSchema.shape }),
  z.object({ kind: z.literal('tf'), options: z.array(item) }),
  z.object({ kind: z.literal('order'), items: z.array(mediaItem) }),
  z.object({ kind: z.literal('match'), cards: z.array(item), targets: z.array(item) }),
  z.object({ kind: z.literal('hotspot'), mode: z.enum(['click_zone', 'card_to_zone']), zones: z.array(imageZoneSchema), cards: z.array(item) }),
])
export type PublicPayload = z.infer<typeof publicPayloadSchema>
export const publicQuestionSchema = z.object({
  sourceContext:practiceSourceContextSchema.optional(),
  id: z.number().int(), qIndex: z.number().int(), prompt: z.string(), media: z.string().nullable(),
  timeLimitS: z.number(), payload: publicPayloadSchema,
  videoId:z.string().regex(/^[A-Za-z0-9_-]{11}$/).nullish(),
  videoStartS:z.number().int().min(0).max(86400).nullish(),
  videoEndS:z.number().int().min(1).max(86400).nullish(),
})
export type PublicQuestion = z.infer<typeof publicQuestionSchema>
const standing = z.object({ participantId: z.string(), name: z.string(), score: z.number(), correctCount: z.number(), rank: z.number(), tied: z.boolean() })
// v5 §19 "reveal + explanation": the explanation travels ONLY inside the reveal,
// which the engine builds after the answer window closes. It is never part of
// publicQuestionSchema or any pre-lock payload.
export const revealSchema = z.object({
  qIndex: z.number(), correct: z.union([z.string(), z.boolean(), z.array(z.string()), z.record(z.string(), z.string())]),
  distribution: z.array(z.object({ key: z.string(), count: z.number() })), topScores: z.array(standing),
  explanation: z.string().max(1000).nullable().optional(),
})
export type Reveal = z.infer<typeof revealSchema>
export const snapshotSchema = z.object({
  contentLanguage:contentLanguageSchema.nullable().default(null),
  presentation:livePresentationViewSchema.nullable().default(null),
  runId: z.number(), pin: z.string(), title: z.string(), theme: z.string(), state: sessionStateSchema,
  gameMode:gameModeSchema.default('quiz'),arcade:arcadeViewSchema.nullable().default(null),gameScores:z.array(gameStandingSchema).default([]),
  wheel:wheelStateSchema.nullable().default(null),
  wheelRound:liveWheelRoundSchema.nullable().optional(),
  wheelRevision:z.number().int().nonnegative().default(0),
  revision: z.number(), serverNow: z.number(), endsAt: z.number().nullable(), questionCount: z.number(),
  question: publicQuestionSchema.nullable(), participants: z.array(z.object({ id: z.string(), name: z.string(), connected: z.boolean(), status:z.enum(['active','removed']).optional(),wheelExcluded:z.boolean().optional() })),
  acceptedCount: z.number(), reveal: revealSchema.nullable(), top: z.array(standing),
  persistence: z.enum(['ready', 'pending', 'failed']), endReason: z.string().nullable(), hostConnected: z.boolean(),
  classId:z.number().nullable(),
  /*
   * The one decision a teacher is asked to make mid-class.
   *
   * `mistake` is always present: it is the shared wrong answer in the learners'
   * own words, derived from the question itself, so the offer can be made
   * without anything having been configured beforehand. `reason` is the
   * explanation when one exists and empty when it does not — it enriches the
   * decision, it no longer gates it. `linkId` is null when the verification
   * question was matched automatically rather than hand-picked.
   */
  intervention:z.object({qIndex:z.number(),count:z.number(),total:z.number(),mistake:z.string(),reason:z.string(),linkId:z.number().nullable()}).nullable(),
  self: z.object({ participantId: z.string(), name: z.string(), score: z.number(), correctCount: z.number(), answered: z.boolean(), result: z.enum(['correct', 'incorrect', 'unanswered']).nullable(),practiceRetry:z.object({used:z.boolean(),correct:z.boolean().nullable()}).optional() }).nullable(),
})
export type SessionSnapshot = z.infer<typeof snapshotSchema>
export const requestIdSchema = z.string().min(8).max(80)
const runRequest = { runId: z.number().int().positive(), requestId: requestIdSchema }
export const participantCommandSchema=z.discriminatedUnion('action',[
  z.object({action:z.literal('rename'),name:z.string().max(120).transform(value=>value.replace(/[\p{Cc}\p{Cf}<>]/gu,'').trim()).pipe(z.string().min(1).max(40))}).strict(),
  z.object({action:z.literal('exclude'),excluded:z.boolean()}).strict(),
  z.object({action:z.literal('remove')}).strict(),
])
export type ParticipantCommand=z.infer<typeof participantCommandSchema>
export const participantOutcomeSchema=z.object({participantId:z.uuid(),name:z.string().min(1).max(40),status:z.enum(['active','removed']),wheelExcluded:z.boolean(),revision:z.number().int().positive(),replayed:z.boolean()})
export type ParticipantOutcome=z.infer<typeof participantOutcomeSchema>
export const commandSchemas = {
  'auth:refresh': z.object({accessToken:z.string().min(20).max(8192)}).strict(),
  'host:create': z.object({ activityId: z.number().int().positive(), requestId: requestIdSchema, classId: z.number().int().positive().optional(), speedWeighting: z.boolean().default(false),gameMode:gameModeSchema.default('quiz'),presentation:liveLaunchSchema.optional() }).strict(),
  'host:presentation':z.object({...runRequest,expectedRevision:z.number().int().nonnegative(),command:livePresentationCommandSchema}).strict(),
  'host:class': z.object({runId:z.number().int().positive(),classId:z.number().int().positive().nullable()}).strict(),
  'host:wheel':z.object({...runRequest,expectedRevision:z.number().int().nonnegative().optional(),command:liveWheelCommandSchema}).strict(),
  'host:participant':z.object({...runRequest,participantId:z.uuid(),command:participantCommandSchema}).strict(),
  'host:decision': z.object({...runRequest,choice:z.enum(['treat','continue'])}).strict(),
  'host:resume': z.object({ runId: z.number().int().positive() }).strict(),
  'host:start': z.object(runRequest).strict(),
  'host:next': z.object(runRequest).strict(),
  'host:reveal': z.object(runRequest).strict(),
  'host:end': z.object(runRequest).strict(),
  'host:projector': z.object({ runId: z.number().int().positive() }).strict(),
  'player:join': z.object({ pin: z.string().regex(/^\d{6}$/), name: z.string().trim().min(1).max(40), requestId: requestIdSchema }).strict(),
  'player:resume': z.object({ runId: z.number().int().positive(), resumeToken: z.string().min(32).max(80) }).strict(),
  'projector:join': z.object({ runId: z.number().int().positive(), token: z.string().min(32).max(80) }).strict(),
  'player:answer': z.object({ ...runRequest, qIndex: z.number().int().nonnegative(), questionId: z.number().int().positive(), payload: answerPayloadSchema }).strict(),
  'player:retry': z.object({ ...runRequest, qIndex: z.number().int().nonnegative(), questionId: z.number().int().positive(), payload: answerPayloadSchema }).strict(),
  'player:game':arcadeInputSchema.extend({runId:z.number().int().positive()}).strict(),
  'session:sync': z.object({}).strict(),
  'clock:sync': z.object({}).strict(),
} as const
export type CommandName = keyof typeof commandSchemas
export type CommandInput<K extends CommandName> = z.input<(typeof commandSchemas)[K]>
/**
 * `persisted` on an answer acknowledgement is true only after the answer row
 * committed to storage; false means "accepted in memory, written at question
 * close" (v5 §19: the ACK states the persistence level honestly).
 * `endReason` accompanies code 'session_interrupted' when a resume finds the
 * run already ended in storage (for example after a process restart).
 */
export type Reply = { ok: true; snapshot?: SessionSnapshot; presentationOutcome?:{state:LivePresentationView;replayed:boolean}; participantOutcome?:ParticipantOutcome; wheelOutcome?: {wheel:WheelState;round?:LiveWheelRound;revision:number;replayed:boolean}; resumeToken?: string; participantId?: string; projectorToken?: string; receivedAt?: number; persisted?: boolean; persistedAt?: number; serverNow?: number } | { ok: false; code: string; message: string; endReason?: string | null }
export type ClientEvents = { [K in CommandName]: (input: CommandInput<K>, ack: (reply: Reply) => void) => void }
export interface ServerEvents {
  'participant:removed': (payload:{runId:number;participantId:string})=>void
  'session:snapshot': (snapshot: SessionSnapshot) => void
  'lobby:update': (snapshot: SessionSnapshot) => void
  'question:show': (snapshot: SessionSnapshot) => void
  'question:lock': (snapshot: SessionSnapshot) => void
  'answer:reveal': (snapshot: SessionSnapshot) => void
  'session:podium': (snapshot: SessionSnapshot) => void
  'session:ended': (snapshot: SessionSnapshot) => void
  'join:ok': (reply: Reply) => void
  'answer:ack': (reply: Reply) => void
  'clock:probe': (ack: () => void) => void
}
