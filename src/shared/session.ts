/*
 * GENERATED FILE — DO NOT EDIT.
 *
 * Mirrored from asasera-backend/packages/shared/src/session.ts.
 * Edit the source there and run `npm run sync:shared` in asasera-backend.
 * CI fails if this file and its source differ.
 */
import { z } from 'zod'
import { answerPayloadSchema, mcqPublicSchema, imageZoneSchema } from './questions.ts'
import {gameModeSchema,arcadeInputSchema,arcadeViewSchema,gameStandingSchema} from './arcade.ts'
import {wheelStateSchema,wheelCommandSchema} from './wheel.ts'

export const sessionStateSchema = z.enum(['lobby', 'question_open', 'question_locked', 'revealing', 'game_play', 'game_results', 'podium', 'ended'])
export type SessionState = z.infer<typeof sessionStateSchema>
const key = z.string().max(32)
const item = z.object({ key, text: z.string().max(500) })
// Explicit allowlists. Neither a stored payload nor an error pair can enter a snapshot.
export const publicPayloadSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('mcq'), ...mcqPublicSchema.shape }),
  z.object({ kind: z.literal('tf'), options: z.array(item) }),
  z.object({ kind: z.literal('order'), items: z.array(item) }),
  z.object({ kind: z.literal('match'), cards: z.array(item), targets: z.array(item) }),
  z.object({ kind: z.literal('hotspot'), mode: z.enum(['click_zone', 'card_to_zone']), zones: z.array(imageZoneSchema), cards: z.array(item) }),
])
export type PublicPayload = z.infer<typeof publicPayloadSchema>
export const publicQuestionSchema = z.object({
  id: z.number().int(), qIndex: z.number().int(), prompt: z.string(), media: z.string().nullable(),
  timeLimitS: z.number(), payload: publicPayloadSchema,
})
export type PublicQuestion = z.infer<typeof publicQuestionSchema>
const standing = z.object({ participantId: z.string(), name: z.string(), score: z.number(), correctCount: z.number(), rank: z.number(), tied: z.boolean() })
export const revealSchema = z.object({
  qIndex: z.number(), correct: z.union([z.string(), z.boolean(), z.array(z.string()), z.record(z.string(), z.string())]),
  distribution: z.array(z.object({ key: z.string(), count: z.number() })), topScores: z.array(standing),
})
export type Reveal = z.infer<typeof revealSchema>
export const snapshotSchema = z.object({
  runId: z.number(), pin: z.string(), title: z.string(), theme: z.string(), state: sessionStateSchema,
  gameMode:gameModeSchema.default('quiz'),arcade:arcadeViewSchema.nullable().default(null),gameScores:z.array(gameStandingSchema).default([]),
  wheel:wheelStateSchema.nullable().default(null),
  revision: z.number(), serverNow: z.number(), endsAt: z.number().nullable(), questionCount: z.number(),
  question: publicQuestionSchema.nullable(), participants: z.array(z.object({ id: z.string(), name: z.string(), connected: z.boolean() })),
  acceptedCount: z.number(), reveal: revealSchema.nullable(), top: z.array(standing),
  persistence: z.enum(['ready', 'pending', 'failed']), endReason: z.string().nullable(), hostConnected: z.boolean(),
  classId:z.number().nullable(),
  intervention:z.object({qIndex:z.number(),count:z.number(),total:z.number(),reason:z.string(),linkId:z.number()}).nullable(),
  self: z.object({ participantId: z.string(), name: z.string(), score: z.number(), correctCount: z.number(), answered: z.boolean(), result: z.enum(['correct', 'incorrect', 'unanswered']).nullable() }).nullable(),
})
export type SessionSnapshot = z.infer<typeof snapshotSchema>
export const requestIdSchema = z.string().min(8).max(80)
const runRequest = { runId: z.number().int().positive(), requestId: requestIdSchema }
export const commandSchemas = {
  'auth:refresh': z.object({accessToken:z.string().min(20).max(8192)}).strict(),
  'host:create': z.object({ activityId: z.number().int().positive(), requestId: requestIdSchema, classId: z.number().int().positive().optional(), speedWeighting: z.boolean().default(false),gameMode:gameModeSchema.default('quiz') }).strict(),
  'host:class': z.object({runId:z.number().int().positive(),classId:z.number().int().positive().nullable()}).strict(),
  'host:wheel':z.object({...runRequest,command:wheelCommandSchema}).strict(),
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
  'player:game':arcadeInputSchema.extend({runId:z.number().int().positive()}).strict(),
  'session:sync': z.object({}).strict(),
  'clock:sync': z.object({}).strict(),
} as const
export type CommandName = keyof typeof commandSchemas
export type CommandInput<K extends CommandName> = z.input<(typeof commandSchemas)[K]>
export type Reply = { ok: true; snapshot?: SessionSnapshot; resumeToken?: string; participantId?: string; projectorToken?: string; receivedAt?: number; serverNow?: number } | { ok: false; code: string; message: string }
export type ClientEvents = { [K in CommandName]: (input: CommandInput<K>, ack: (reply: Reply) => void) => void }
export interface ServerEvents {
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
