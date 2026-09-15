/*
 * GENERATED FILE — DO NOT EDIT.
 *
 * Mirrored from asasera-backend/packages/shared/src/presentation.ts.
 * Edit the source there and run `npm run sync:shared` in asasera-backend.
 * CI fails if this file and its source differ.
 */
import {z} from 'zod'
import {QUESTION_KINDS,type QuestionKind} from './questions.ts'

export const PRESENTATION_IDS=['name-wheel','question-wheel','flashcards','random-cards','speaking-cards','open-box','challenge-cards','match-up','memory','group-sort','sequence','sentence-completion','word-builder','word-search','crossword','class-competition'] as const
export const presentationIdSchema=z.enum(PRESENTATION_IDS)
export type PresentationId=z.infer<typeof presentationIdSchema>
export const deliveryContextSchema=z.enum(['live','practice','teacher-led','classroom-tool'])
export type DeliveryContext=z.infer<typeof deliveryContextSchema>
/** Compatibility contexts, not feature availability: launch still checks the server's rollout policy. */
export const PRESENTATION_CONTEXTS:Readonly<Record<PresentationId,readonly DeliveryContext[]>>={
 'name-wheel':['live','classroom-tool'],
 'question-wheel':['live','practice'],flashcards:['teacher-led','practice'],
 'random-cards':['live','teacher-led','practice'],'speaking-cards':['teacher-led','practice'],
 'open-box':['live','teacher-led','practice'],'challenge-cards':['live','practice'],
 'match-up':['live','practice'],memory:['teacher-led','practice'],'group-sort':['live','practice'],
 sequence:['live','practice'],'sentence-completion':['live','practice'],
 'word-builder':['practice'],'word-search':['practice'],crossword:['practice'],'class-competition':['live'],
}
/**
 * WHICH AUTHORED QUESTION KINDS EACH GAME CAN ACTUALLY PLAY.
 *
 * This mirrors `contentReason()` in the compatibility resolver, which is the
 * authority at launch — it inspects each stored question and excludes what the
 * game cannot render. Repeating the rule at the *kind* level is what lets the
 * authoring side use it: a teacher who chose "Sequence" when they created the
 * activity should be offered the ordering question and stopped from writing a
 * true/false one, rather than discovering at launch that none of their work
 * can be played. The two must stay in step; a kind listed here that the
 * resolver refuses would promise a teacher something the game drops.
 *
 * 'name-wheel' plays participant names, never authored questions, so it has no
 * kinds and is not offered as an activity's game.
 */
export const PRESENTATION_QUESTION_KINDS:Readonly<Record<PresentationId,readonly QuestionKind[]>>={
 'name-wheel':[],
 'question-wheel':['mcq','tf'],
 flashcards:['mcq','tf','match'],
 'random-cards':['mcq','tf'],
 'speaking-cards':['discussion'],
 'open-box':['mcq','tf'],
 'challenge-cards':['mcq','tf','order','match','hotspot','cloze','vocabulary'],
 'match-up':['match'],
 memory:['match'],
 'group-sort':['match'],
 sequence:['order'],
 'sentence-completion':['cloze'],
 'word-builder':['vocabulary'],
 'word-search':['vocabulary'],
 crossword:['vocabulary'],
 'class-competition':['mcq','tf','order','match','hotspot','cloze','vocabulary'],
}
/** The games a teacher can commit an activity to: those that play authored questions. */
export const AUTHORABLE_PRESENTATION_IDS=PRESENTATION_IDS.filter(id=>PRESENTATION_QUESTION_KINDS[id].length>0)
export const authorablePresentationIdSchema=z.enum(AUTHORABLE_PRESENTATION_IDS as unknown as [PresentationId,...PresentationId[]])
/** True when a question of this kind can be played by the chosen game. */
export function presentationAllowsKind(id:PresentationId,kind:QuestionKind):boolean{
 return PRESENTATION_QUESTION_KINDS[id].includes(kind)
}
/**
 * WHAT A SET OF GAMES WILL ACCEPT — a union, not an intersection.
 *
 * A teacher who chooses a question wheel AND matching pairs is not asking for
 * questions that work in both; there are none. They are saying "this lesson
 * runs as either", and the activity should accept the multiple-choice the
 * wheel needs and the pairs the matching needs. Which game plays which
 * question is still resolved per game at launch.
 *
 * An empty set means no commitment at all: every kind is allowed.
 */
export function playableKindsFor(ids:readonly PresentationId[]):readonly QuestionKind[]{
 if(!ids.length)return QUESTION_KINDS
 const seen=new Set<QuestionKind>()
 for(const id of ids)for(const kind of PRESENTATION_QUESTION_KINDS[id])seen.add(kind)
 return QUESTION_KINDS.filter(kind=>seen.has(kind))
}
/** The chosen games that can play this kind — the sentence a refusal needs. */
export function gamesPlaying(ids:readonly PresentationId[],kind:QuestionKind):readonly PresentationId[]{
 return ids.filter(id=>PRESENTATION_QUESTION_KINDS[id].includes(kind))
}
const questionIds=z.array(z.number().int().positive()).min(1).max(100).refine(ids=>new Set(ids).size===ids.length,'Question IDs must be unique.')
export const presentationCompatibilityRequestSchema=z.object({
 definitionId:presentationIdSchema,context:deliveryContextSchema,
 selectedQuestionIds:questionIds.optional(),useCompatibleSubset:z.boolean().default(false),
}).strict()
export type PresentationCompatibilityRequest=z.input<typeof presentationCompatibilityRequestSchema>
export const presentationItemRefSchema=z.object({questionId:z.number().int().positive(),contentVersionId:z.number().int().positive()}).strict()
export type PresentationItemRef=z.infer<typeof presentationItemRefSchema>
export const compatibilityReasonSchema=z.enum(['incompatible-content','unsupported-context','native-pairs-required','ambiguous-labels','native-groups-required','native-sequence-required','native-blanks-required','native-vocabulary-required','authored-board-required','reference-response-required','participant-content-required','unknown-question','explicit-subset-required','no-compatible-content'])
export type CompatibilityReason=z.infer<typeof compatibilityReasonSchema>
export const presentationCompatibilitySchema=z.object({
 definitionId:presentationIdSchema,definitionVersion:z.literal(1),adapterVersion:z.literal(1),contentVersionId:z.number().int().positive(),context:deliveryContextSchema,
 status:z.enum(['ready','requires-subset','unavailable']),
 compatibleItemRefs:z.array(presentationItemRefSchema).max(100),
 excludedItemRefs:z.array(presentationItemRefSchema.extend({reason:compatibilityReasonSchema})).max(100),
 selectedItemRefs:z.array(presentationItemRefSchema).max(100),reasons:z.array(compatibilityReasonSchema),
}).strict()
export type PresentationCompatibility=z.infer<typeof presentationCompatibilitySchema>

export const presentationConfigSchema=z.object({
 context:deliveryContextSchema,
 semantics:z.enum(['scored','self-rated','discussion','practice']),
 noRepeat:z.boolean().default(true),
 revealPolicy:z.enum(['host','on-request','after-answer','after-submission','after-deadline']),
}).strict().superRefine((config,ctx)=>{
 if(config.semantics==='scored'&&config.revealPolicy==='on-request')ctx.addIssue({code:'custom',path:['revealPolicy'],message:'Scored responses cannot reveal answers on request.'})
})
export type PresentationConfig=z.infer<typeof presentationConfigSchema>
/** Persist on the existing run/assignment. A launch also resolves compatibility and enforces assignment policy. */
export const presentationSelectionSchema=z.object({
 definitionId:presentationIdSchema,definitionVersion:z.literal(1),adapterVersion:z.literal(1),
 contentVersionId:z.number().int().positive(),selectedQuestionIds:questionIds,
 config:presentationConfigSchema,
}).strict().superRefine((selection,ctx)=>{
 if(!PRESENTATION_CONTEXTS[selection.definitionId].includes(selection.config.context))ctx.addIssue({code:'custom',path:['config','context'],message:'This presentation does not support that delivery context.'})
 if(['flashcards','speaking-cards','memory','word-search','crossword','name-wheel'].includes(selection.definitionId)&&selection.config.semantics==='scored')ctx.addIssue({code:'custom',path:['config','semantics'],message:'This presentation does not provide verified scored responses.'})
})
export type PresentationSelection=z.infer<typeof presentationSelectionSchema>
