/*
 * GENERATED FILE — DO NOT EDIT.
 *
 * Mirrored from asasera-backend/packages/shared/src/generation.ts.
 * Edit the source there and run `npm run sync:shared` in asasera-backend.
 * CI fails if this file and its source differ.
 */
import {z} from 'zod'
export const generationTaskSchema=z.enum(['questions','reasons','zones','merges','verification'])
export type GenerationTask=z.infer<typeof generationTaskSchema>
/** Automatic routing by default; an explicit provider is honoured and never silently switched (v5 §13). */
export const generationProviderSchema=z.enum(['auto','openai','gemini'])
export type GenerationProvider=z.infer<typeof generationProviderSchema>
export const generationDifficultySchema=z.enum(['easy','medium','hard'])
export const generationInputSchema=z.object({
 activityId:z.number().int().positive(),task:generationTaskSchema,
 origin:z.enum(['topic','file']).default('topic'),
 /* Optional for file-grounded questions: the selected pages are the objective. Required (≥3 chars) for topic origin; checked by the service. */
 objective:z.string().trim().max(1000).default(''),language:z.enum(['ar','en']).default('ar'),
 count:z.number().int().min(1).max(10).default(5),kinds:z.array(z.enum(['mcq','tf','order','match'])).min(1).max(4).default(['mcq','tf']),
 mode:z.enum(['generate','extract']).default('generate'),tone:z.enum(['clear','conversational','formal']).default('clear'),
 difficulty:generationDifficultySchema.default('medium'),quoteId:z.uuid().optional(),
 materialRevisionId:z.number().int().positive().nullable().default(null),segments:z.array(z.number().int().positive()).max(30).default([]),
 questionId:z.number().int().positive().nullable().default(null),expectedRevision:z.number().int().positive(),
 /* Follow-up practice: the run whose difficult questions this generation targets (v5 §21). */
 sourceRunId:z.number().int().positive().nullable().default(null),
 maxAuthorizedMillicents:z.number().int().positive(),idempotencyKey:z.string().min(10).max(100),
}).strict()
export type GenerationInput=z.infer<typeof generationInputSchema>
const reason=z.object({elementKey:z.string().max(32),wrongTargetKey:z.string().max(32).nullable(),reason:z.string().trim().min(3).max(1000)}).strict()
export const generatedQuestionSchema=z.object({kind:z.enum(['mcq','tf','order','match']),prompt:z.string().trim().min(3).max(2000),payloadJson:z.string().max(12000),
 /** One or two sentences explaining why the key is correct; shown only after the answer window closes. */
 explanation:z.string().trim().max(600),
 /** Short concept label from the material, e.g. "photosynthesis inputs". Empty when not applicable. */
 concept:z.string().trim().max(120),
 reasons:z.array(reason).max(64),sourceSegments:z.array(z.number().int().positive()).max(30)}).strict()
/**
 * A zone the model proposes. `x/y/w/h` is the bounding box of whatever shape it
 * chooses, exactly as in `imageZoneSchema`, so a proposal is applied without
 * translation. `label` is what the part is called: for a drag-the-label
 * question the teacher needs the name as much as the outline, and asking for it
 * in the same call costs nothing extra.
 */
export const proposedZoneSchema=z.object({key:z.string().regex(/^[a-z0-9_]{1,32}$/),x:z.number().min(0).max(1),y:z.number().min(0).max(1),w:z.number().gt(0).max(1),h:z.number().gt(0).max(1),shape:z.enum(['rect','circle','hexagon','polygon']).default('rect'),points:z.array(z.object({x:z.number().min(0).max(1),y:z.number().min(0).max(1)}).strict()).min(3).max(24).nullish(),label:z.string().trim().max(60).nullish()}).strict()
/**
 * A proposed verification link, whole.
 *
 * Three parts, always together: WHICH mistake (a slot the question actually
 * has), WHY a learner makes it, and WHICH existing question proves the gap
 * closed. The reason is not decoration — the remediation engine fires only on
 * `link && reason`, so a suggestion that carried a target and no reason would
 * create a link that can never run. The model is therefore never asked for
 * half of one.
 *
 * `rationale` is for the teacher, not the engine: one sentence saying why that
 * question tests the same understanding without being the same item. It is
 * what they read before approving, and it is never stored.
 */
export const verificationSuggestionSchema=z.object({
 elementKey:z.string().max(32),wrongTargetKey:z.string().max(32).nullable(),
 reason:z.string().trim().min(3).max(1000),
 versionId:z.number().int().positive(),questionId:z.number().int().positive(),
 rationale:z.string().trim().min(3).max(400),
}).strict()
/**
 * Does this wording point at material the learner cannot see?
 *
 * The prompt already forbids it, but a prompt is a request and this is a rule:
 * the learner answers on their own screen with the source nowhere in front of
 * them, so «ما هو التعريف الصحيح لعملية Decryption كما وردت في المادة؟» asks
 * them to consult something that does not exist. The model is asked to drop
 * such a question; this is what makes sure it did.
 *
 * Only unambiguous pointers are listed. "in the text" on its own is not one —
 * a question about a text field in a form says exactly that — so every pattern
 * names both the pointing verb and the thing pointed at. Extraction mode is
 * exempt by the caller: there the wording is the source's own, copied
 * deliberately, and rewriting it would break the copy.
 */
const SOURCE_POINTERS:RegExp[]=[
 /\b(?:according to|as (?:stated|mentioned|described|shown|given|defined|explained|discussed) in)\s+(?:the\s+)?(?:text|passage|source|lesson|material|article|chapter|unit|book|slide|page|figure|table|reading|document|paragraph)\b/i,
 /\bmentioned\s+(?:above|below|earlier|previously)\b/i,
 /\bin\s+the\s+(?:passage|reading|lesson|material)\b/i,
 /\bas\s+(?:the\s+)?(?:author|writer|text|lesson)\s+(?:states|mentions|says|describes|explains)\b/i,
 /* Arabic has no \b that helps here: «احسب نصف المحيط» contains حسب followed
    by نص, and deleting that question would be far worse than letting a
    pointing one through. So each Arabic pattern is fenced by Arabic-letter
    lookarounds — the preposition may not continue a longer word, and the noun
    may not be the start of one. */
 /(?<![ء-ي])كما\s+ورد(?:ت|ا)?\s+في\s+(?:ال)?(?:مادة|نص|درس|وحدة|فقرة|مصدر|كتاب|مقال|شرح)(?![ء-ي])/,
 /(?<![ء-ي])(?:حسب|بحسب|وفق|وفقًا|وفقا|طبقًا|طبقا)\s*(?:لل|ال|ل)?\s*(?:نص|مادة|درس|مصدر|كتاب|فقرة|مقال)(?![ء-ي])/,
 /(?<![ء-ي])المذكور(?:ة)?\s+(?:أعلاه|أدناه|سابقًا|سابقا|في\s+(?:ال)?(?:نص|مادة|درس))(?![ء-ي])/,
 /(?<![ء-ي])كما\s+(?:ذكر|أشار|جاء)\s+(?:في\s+)?(?:ال)?(?:كاتب|مؤلف|نص|درس|مادة)(?![ء-ي])/,
]
export function pointsAtSource(text:string):boolean{return SOURCE_POINTERS.some(pattern=>pattern.test(text))}

export const mergeCandidateSchema=z.object({sourceId:z.number().int().positive(),targetId:z.number().int().positive(),reason:z.string().min(3).max(1000)}).strict()
export const outputSchemas={
 questions:z.object({candidates:z.array(generatedQuestionSchema).max(10)}).strict(),
 reasons:z.object({candidates:z.array(reason).max(64)}).strict(),
 /* `prompt` is the question the picture is asking, proposed alongside the
    regions because the model has just looked at the image and a pin-answer
    question with no prompt is unfinished. Nullish: it is only used when the
    teacher has not written one, and a model that has nothing to say should
    say nothing rather than invent. */
 zones:z.object({candidates:z.array(proposedZoneSchema).max(12),prompt:z.string().trim().max(300).nullish()}).strict(),
 merges:z.object({candidates:z.array(mergeCandidateSchema).max(10)}).strict(),
 verification:z.object({candidates:z.array(verificationSuggestionSchema).max(12)}).strict(),
}
export type GeneratedQuestion=z.infer<typeof generatedQuestionSchema>
export const generationApplySchema=z.object({selected:z.array(z.number().int().min(0).max(63)).min(1).max(64),expectedRevision:z.number().int().positive(),edits:z.array(z.object({index:z.number().int().min(0).max(63),question:generatedQuestionSchema,mediaKey:z.string().min(1).max(500).nullable().optional()}).strict()).max(10).optional()}).strict()
/** What the client sees before it pays: the estimate, the ceiling it authorises, and the teacher's usable credit. */
export const generationQuoteSchema=z.object({
 estimateMillicents:z.number().int().nonnegative(),maxAuthorizedMillicents:z.number().int().nonnegative(),
 estimateAiCredits:z.number().int().nonnegative(),maxAuthorizedAiCredits:z.number().int().nonnegative(),usableAiCredits:z.number().int().nonnegative(),creditPolicyVersion:z.number().int().positive(),creditUnit:z.literal('AI Credits'),
 spendableMillicents:z.number().int(),usableMillicents:z.number().int(),allowanceMillicents:z.number().int(),exposureMillicents:z.number().int(),
 affordable:z.boolean(),pricingAvailable:z.boolean(),generationAvailable:z.boolean(),
 quoteId:z.uuid(),quoteExpiresAt:z.string(),
 grant:z.object({trialMillicents:z.number().int(),trialAiCredits:z.number().int().nonnegative(),claimed:z.boolean(),eligible:z.boolean(),reason:z.string().nullable()}),
 delivery:z.string(),
})
export type GenerationQuote=z.infer<typeof generationQuoteSchema>
