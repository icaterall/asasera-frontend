/*
 * GENERATED FILE — DO NOT EDIT.
 *
 * Mirrored from asasera-backend/packages/shared/src/live-presentation.ts.
 * Edit the source there and run `npm run sync:shared` in asasera-backend.
 * CI fails if this file and its source differ.
 */
import {z} from 'zod'
import {presentationSelectionSchema} from './presentation.ts'
import {liveRulesSchema} from './live-rules.ts'
import {wheelStateSchema} from './wheel.ts'
import {memoryBoardSchema,memoryViewSchema,projectMemoryBoard} from './memory.ts'

export const liveLaunchSchema=z.object({selection:presentationSelectionSchema,rules:liveRulesSchema}).strict()
export type LiveLaunch=z.infer<typeof liveLaunchSchema>
export const liveTeamSchema=z.object({id:z.string().min(1).max(40),name:z.string().trim().min(1).max(40),participantIds:z.array(z.uuid()).max(500)}).strict()
export const liveTeamsSchema=z.array(liveTeamSchema).max(6).refine(teams=>teams.length===0||teams.length>=2,{message:'Use two to six teams, or no teams.'}).refine(teams=>new Set(teams.map(t=>t.id)).size===teams.length,{message:'Team identities must be unique.'}).refine(teams=>{const ids=teams.flatMap(t=>t.participantIds);return new Set(ids).size===ids.length},{message:'A participant may join only one team.'})
export const liveTeamStandingSchema=z.object({id:z.string(),name:z.string(),memberCount:z.number().int().nonnegative(),points:z.number().nonnegative(),rank:z.number().int().positive(),tied:z.boolean()}).strict()
export const livePresentationItemSchema=z.object({elementId:z.string().max(64),number:z.number().int().positive(),canonicalIndex:z.number().int().nonnegative(),questionId:z.number().int().positive(),status:z.enum(['closed','selected','open','completed','skipped'])}).strict()
export const liveOccurrenceSchema=z.object({id:z.uuid(),qIndex:z.number().int().nonnegative(),canonicalIndex:z.number().int().nonnegative(),questionId:z.number().int().positive(),pass:z.number().int().min(1).max(10),position:z.number().int().positive(),status:z.enum(['selected','open','completed','skipped']),openedAt:z.number().nullable(),endsAt:z.number().nullable(),challenge:z.boolean().default(false),bonusPoints:z.number().int().min(0).max(500).default(0),hintAvailable:z.boolean().default(false),hint:z.string().max(1000).nullable().default(null),thinkingAdded:z.boolean().default(false),teamRoster:liveTeamsSchema.default([]),teamStandings:z.array(liveTeamStandingSchema).max(6).default([]),memoryBoard:memoryBoardSchema.nullable().default(null)}).strict()
export const livePresentationStateSchema=z.object({schemaVersion:z.literal(1),selection:presentationSelectionSchema,rules:liveRulesSchema,revision:z.number().int().nonnegative(),pass:z.number().int().min(1).max(10),items:z.array(livePresentationItemSchema).max(100),active:liveOccurrenceSchema.nullable(),occurrences:z.array(liveOccurrenceSchema).max(1000),wheel:wheelStateSchema.nullable(),teams:liveTeamsSchema.default([]),decidedQIndices:z.array(z.number().int().nonnegative()).max(1000).default([])}).strict()
export type LivePresentationState=z.infer<typeof livePresentationStateSchema>
export const livePresentationViewSchema=livePresentationStateSchema.omit({occurrences:true,teams:true,active:true,decidedQIndices:true}).extend({active:liveOccurrenceSchema.omit({teamRoster:true,memoryBoard:true}).extend({memory:memoryViewSchema.nullable().default(null)}).nullable(),teamAssignments:liveTeamsSchema.optional(),teamStandings:z.array(liveTeamStandingSchema).default([])})
export type LivePresentationView=z.infer<typeof livePresentationViewSchema>
/** The same privacy boundary applies to snapshots and lost-ACK replay outcomes. */
export function projectLivePresentation(state:LivePresentationState,host=false):LivePresentationView{
 return livePresentationViewSchema.strip().parse({...state,active:state.active?livePresentationViewSchema.shape.active.unwrap().strip().parse({...state.active,memory:state.active.memoryBoard?projectMemoryBoard(state.active.memoryBoard):null}):null,teamStandings:state.active?.teamStandings??[],...(host?{teamAssignments:state.teams}:{})})
}
export const livePresentationCommandSchema=z.discriminatedUnion('action',[
 z.object({action:z.literal('draw'),animate:z.boolean().default(true)}).strict(),
 z.object({action:z.literal('select-box'),elementId:z.string().max(64)}).strict(),
 z.object({action:z.literal('begin')}).strict(),
 z.object({action:z.literal('skip')}).strict(),
 z.object({action:z.literal('review-mistake')}).strict(),
 z.object({action:z.literal('continue')}).strict(),
 z.object({action:z.literal('next-pass')}).strict(),
 z.object({action:z.literal('hint')}).strict(),
 z.object({action:z.literal('think-together')}).strict(),
 z.object({action:z.literal('teams'),teams:liveTeamsSchema}).strict(),
 z.object({action:z.literal('memory-flip'),cardId:memoryBoardSchema.shape.cards.element.shape.id}).strict(),
 z.object({action:z.literal('memory-continue')}).strict(),
])
export type LivePresentationCommand=z.input<typeof livePresentationCommandSchema>
export const livePresentationOutcomeSchema=z.object({state:livePresentationStateSchema,replayed:z.boolean()}).strict()
export type LivePresentationOutcome=z.infer<typeof livePresentationOutcomeSchema>
