/*
 * GENERATED FILE — DO NOT EDIT.
 *
 * Mirrored from asasera-backend/packages/shared/src/live-wheel.ts.
 * Edit the source there and run `npm run sync:shared` in asasera-backend.
 * CI fails if this file and its source differ.
 */
import {z} from 'zod'
import {wheelCommandSchema} from './wheel.ts'

/** Live participant dispositions are not part of the standalone decorative wheel. */
export const liveWheelCommandSchema=z.discriminatedUnion('action',[
 ...wheelCommandSchema.options,
 z.object({action:z.literal('pass'),participantId:z.uuid(),drawId:z.uuid()}).strict(),
 z.object({action:z.literal('restore'),participantId:z.uuid()}).strict(),
])
export type LiveWheelCommand=z.input<typeof liveWheelCommandSchema>
export const liveWheelHistorySchema=z.object({
 id:z.uuid(),round:z.number().int().positive(),at:z.number(),action:z.enum(['selected','passed','restored','new-round']),
 participantId:z.string().max(80).nullable(),label:z.string().max(120).nullable(),drawId:z.string().max(80).nullable(),
}).strict()
export const LIVE_WHEEL_HISTORY_LIMIT=1000
export const liveWheelRoundSchema=z.object({
 round:z.number().int().positive().default(1),passedIds:z.array(z.uuid()).max(500).default([]),
 history:z.array(liveWheelHistorySchema).max(LIVE_WHEEL_HISTORY_LIMIT).default([]),earlierEvents:z.number().int().nonnegative().default(0),
}).strict()
export type LiveWheelRound=z.infer<typeof liveWheelRoundSchema>
export const newLiveWheelRound=():LiveWheelRound=>({round:1,passedIds:[],history:[],earlierEvents:0})
