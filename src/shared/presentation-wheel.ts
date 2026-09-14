/*
 * GENERATED FILE — DO NOT EDIT.
 *
 * Mirrored from asasera-backend/packages/shared/src/presentation-wheel.ts.
 * Edit the source there and run `npm run sync:shared` in asasera-backend.
 * CI fails if this file and its source differ.
 */
import {z} from 'zod'
import {wheelEntrySchema,wheelStateSchema} from './wheel.ts'
const identity={requestId:z.uuid(),expectedRevision:z.number().int().nonnegative()}
export const persistentWheelCommandSchema=z.discriminatedUnion('action',[
 z.object({...identity,action:z.literal('configure'),entries:z.array(wheelEntrySchema).max(500),avoidRepeats:z.boolean()}).strict(),
 z.object({...identity,action:z.literal('spin'),animate:z.boolean().default(true)}).strict(),
 z.object({...identity,action:z.literal('reset')}).strict(),
 z.object({...identity,action:z.literal('exclude'),entryId:z.string().max(80),excluded:z.boolean()}).strict(),
])
export type PersistentWheelCommand=z.infer<typeof persistentWheelCommandSchema>
export const persistentWheelViewSchema=z.object({
 id:z.uuid(),revision:z.number().int().nonnegative(),serverNow:z.number(),roundId:z.uuid(),
 wheel:wheelStateSchema,excludedIds:z.array(z.string()).max(500),
 history:z.array(z.object({id:z.uuid(),roundId:z.uuid(),entry:wheelEntrySchema,entryNumber:z.number().int().min(1).max(500).optional(),at:z.number()})).max(500),
})
export type PersistentWheelView=z.infer<typeof persistentWheelViewSchema>
