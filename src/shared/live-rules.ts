/*
 * GENERATED FILE — DO NOT EDIT.
 *
 * Mirrored from asasera-backend/packages/shared/src/live-rules.ts.
 * Edit the source there and run `npm run sync:shared` in asasera-backend.
 * CI fails if this file and its source differ.
 */
import {z} from 'zod'

/** Authored and reviewed with a question; neither field may be invented at launch. */
export const reviewedQuestionSupportSchema=z.object({
 challenge:z.boolean().default(false),
 hint:z.string().trim().min(1).max(1000).nullable().default(null),
}).strict()
const ids=z.array(z.number().int().positive()).max(100).refine(values=>new Set(values).size===values.length)
export const liveRulesSchema=z.object({
 schemaVersion:z.literal(1).default(1),
 timing:z.enum(['host-paced','timed']).default('host-paced'),
 speedWeighting:z.boolean().default(false),
 hints:z.boolean().default(false),
 thinkTogether:z.boolean().default(false),
 extraPracticeAttempt:z.boolean().default(false),
 baseGamePoints:z.literal(100).default(100),
 bonus:z.object({questionIds:ids,points:z.number().int().min(0).max(500)}).strict().default({questionIds:[],points:0}),
}).strict().superRefine((rules,ctx)=>{
 if(rules.speedWeighting&&rules.timing!=='timed')ctx.addIssue({code:'custom',path:['speedWeighting'],message:'Speed scoring requires an explicit timed run.'})
})
export type LiveRules=z.infer<typeof liveRulesSchema>
