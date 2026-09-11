/*
 * GENERATED FILE — DO NOT EDIT.
 *
 * Mirrored from asasera-backend/packages/shared/src/questions.ts.
 * Edit the source there and run `npm run sync:shared` in asasera-backend.
 * CI fails if this file and its source differ.
 */
import { z } from 'zod'

/**
 * The five question kinds — plan §12 (pp20–21).
 *
 * TWO FAMILIES OF TYPE, ON PURPOSE.
 *
 *   *Payload  — what is stored. Carries the correct answer.
 *   *Public   — what a player's device may receive. Has no answer field AT ALL.
 *
 * The public shape is a separate schema rather than the stored one with a key
 * deleted. A `delete payload.correct` is one forgotten line away from shipping
 * the answer to every phone in the room, and §10 (p18) makes that a
 * launch-blocking failure: «الإجابة الصحيحة لا تُرسل إلى عميل الطالب أبدًا قبل
 * القفل — وإلا قُرئت من أدوات المطوّر خلال ثوانٍ». If the field is not in the
 * type, it cannot be forgotten.
 */

export const QUESTION_KINDS = ['mcq', 'tf', 'order', 'match', 'hotspot'] as const
export type QuestionKind = (typeof QUESTION_KINDS)[number]

/** Element keys address options, cards, targets and zones in `error_pairs`. */
const elementKey = z.string().regex(/^[a-z0-9_]{1,32}$/, 'element keys are lowercase, digits and _')

/** Rejects duplicates in a key list — silently deduping would drop an option. */
const uniqueKeys = <T extends { key: string }>(items: T[], ctx: z.RefinementCtx, label: string) => {
  const seen = new Set<string>()
  for (const item of items) {
    if (seen.has(item.key)) {
      ctx.addIssue({ code: 'custom', message: `duplicate ${label} key: ${item.key}` })
    }
    seen.add(item.key)
  }
}

/* ---- multiple choice --------------------------------------------------- */

/*
 * Option text may be EMPTY in storage.
 *
 * A new question is created before it is written: the editor inserts four
 * blank slots and the teacher fills them in. Requiring text here made adding
 * a question fail with a validation error before the teacher had typed
 * anything — the draft could not exist.
 *
 * Emptiness is a PUBLICATION concern, exactly like the reason field (§12:
 * «إلزامي قبل النشر، اختياري قبل الحفظ كمسوّدة»), and `validateForPublication`
 * refuses a blank option by name.
 */
const mcqOption = z.object({
  key: elementKey,
  text: z.string().max(500),
  image: z.string().max(500).optional(),
})

/**
 * Four slots is the presentation (§4 #3: colour permanently bound to shape),
 * but the stored contract allows 2..6 so a legacy question with three or five
 * options is readable rather than silently truncated. Publication narrows it;
 * see `publishableMcq`.
 */
// Stored with each question and frozen in its approved version. Missing means standard.
const pointsMultiplier = z.union([z.literal(0), z.literal(1), z.literal(2)]).optional()

export const mcqPayloadSchema = z
  .object({
    options: z.array(mcqOption).min(2).max(6),
    pointsMultiplier,
    correct: elementKey,
  })
  .superRefine((value, ctx) => {
    uniqueKeys(value.options, ctx, 'option')
    if (!value.options.some((o) => o.key === value.correct)) {
      ctx.addIssue({ code: 'custom', path: ['correct'], message: `correct key "${value.correct}" is not one of the options` })
    }
  })
export type McqPayload = z.infer<typeof mcqPayloadSchema>

export const mcqPublicSchema = z.object({
  options: z.array(mcqOption.omit({ text: true }).extend({ text: z.string() })).min(2).max(6),
})

/* ---- true / false ------------------------------------------------------ */

/**
 * `correct` is a boolean in storage; the wire value is the literal string
 * `'true'` or `'false'`. Translated button text («صح» / «خطأ») is never the
 * answer identity — that is how a localisation change silently inverts a
 * question.
 */
export const tfPayloadSchema = z.object({ correct: z.boolean(), pointsMultiplier })
export type TfPayload = z.infer<typeof tfPayloadSchema>

export const TF_CHOICES = ['true', 'false'] as const
export const tfChoiceSchema = z.enum(TF_CHOICES)
export const tfChoiceToBoolean = (choice: 'true' | 'false'): boolean => choice === 'true'
export const booleanToTfChoice = (value: boolean): 'true' | 'false' => (value ? 'true' : 'false')

/* ---- ordering ---------------------------------------------------------- */

/* Empty while drafting; required at publication. See mcqOption above. */
const orderItem = z.object({ key: elementKey, text: z.string().max(300) })

/**
 * `correct` is the logical order. §12: «الترتيب يُخزَّن منطقيًا ويُعرض حسب
 * الاتجاه» — stored logically, displayed by direction. "First" means first
 * logically, and it is drawn on the right in Arabic and the left in English.
 * Nothing reverses the stored array because the UI direction changed.
 */
export const orderPayloadSchema = z
  .object({
    items: z.array(orderItem).min(2).max(8),
    pointsMultiplier,
    correct: z.array(elementKey).min(2).max(8),
  })
  .superRefine((value, ctx) => {
    uniqueKeys(value.items, ctx, 'item')
    const itemKeys = new Set(value.items.map((i) => i.key))
    const correctSet = new Set(value.correct)
    if (correctSet.size !== value.correct.length) {
      ctx.addIssue({ code: 'custom', path: ['correct'], message: 'correct order repeats a key' })
    }
    if (value.correct.length !== value.items.length) {
      ctx.addIssue({ code: 'custom', path: ['correct'], message: 'correct order must list every item exactly once' })
    }
    for (const key of value.correct) {
      if (!itemKeys.has(key)) {
        ctx.addIssue({ code: 'custom', path: ['correct'], message: `correct order names unknown item "${key}"` })
      }
    }
  })
export type OrderPayload = z.infer<typeof orderPayloadSchema>

/* ---- matching ---------------------------------------------------------- */

/* Empty while drafting; required at publication. See mcqOption above. */
const matchCard = z.object({ key: elementKey, text: z.string().max(300) })

/**
 * CARDINALITY, stated rather than implied: every card maps to exactly one
 * target; a target may receive more than one card; a target may receive none.
 * Completion requires every card placed. Scoring is all-or-nothing per
 * question (see `scoreMatch`) — partial credit is a per-section setting the
 * plan does not define, so it is not invented here.
 */
export const matchPayloadSchema = z
  .object({
    cards: z.array(matchCard).min(2).max(8),
    pointsMultiplier,
    targets: z.array(matchCard).min(2).max(8),
    map: z.record(elementKey, elementKey),
  })
  .superRefine((value, ctx) => {
    uniqueKeys(value.cards, ctx, 'card')
    uniqueKeys(value.targets, ctx, 'target')
    const cardKeys = new Set(value.cards.map((c) => c.key))
    const targetKeys = new Set(value.targets.map((t) => t.key))
    for (const [card, target] of Object.entries(value.map)) {
      if (!cardKeys.has(card)) ctx.addIssue({ code: 'custom', path: ['map'], message: `map names unknown card "${card}"` })
      if (!targetKeys.has(target)) ctx.addIssue({ code: 'custom', path: ['map'], message: `map names unknown target "${target}"` })
    }
    for (const card of cardKeys) {
      if (!(card in value.map)) {
        ctx.addIssue({ code: 'custom', path: ['map'], message: `card "${card}" has no target` })
      }
    }
  })
export type MatchPayload = z.infer<typeof matchPayloadSchema>

/* ---- image hotspots ---------------------------------------------------- */

/**
 * Normalised 0..1 coordinates, never pixels (§3 p8). The two sum constraints
 * are what keep a zone inside the image at every viewport from 360px to
 * 2560px; the database repeats them as CHECKs.
 *
 * A zero-sized zone is rejected rather than tolerated: an invisible target is
 * unhittable, and a question that publishes with one is broken in a way no
 * pupil can report.
 */
export const imageZoneSchema = z
  .object({
    key: elementKey,
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1),
    w: z.number().gt(0).max(1),
    h: z.number().gt(0).max(1),
  })
  .refine((z_) => z_.x + z_.w <= 1 + 1e-9, { message: 'zone extends past the right edge (x + w > 1)' })
  .refine((z_) => z_.y + z_.h <= 1 + 1e-9, { message: 'zone extends past the bottom edge (y + h > 1)' })
export type ImageZone = z.infer<typeof imageZoneSchema>

const zoneList = z.array(imageZoneSchema).min(1).max(12)

/**
 * Two play modes (§16 W09: «النقر على منطقة، وسحب البطاقات إلى مناطقها»).
 *
 * The plan's sketch shows `map:{card→zone}` but never defines the cards. Rather
 * than leave the key space undefined, the modes are discriminated and the
 * card-dragging mode declares its own cards.
 */
export const hotspotClickPayloadSchema = z
  .object({
    mode: z.literal('click_zone'),
    pointsMultiplier,
    imageKey: z.string().min(1).max(500),
    zones: zoneList,
    /** Zone keys that count as correct. More than one is allowed ("click all …"). */
    correct: z.array(elementKey).min(1),
  })
  .superRefine((value, ctx) => {
    uniqueKeys(value.zones, ctx, 'zone')
    const zoneKeys = new Set(value.zones.map((z_) => z_.key))
    for (const key of value.correct) {
      if (!zoneKeys.has(key)) ctx.addIssue({ code: 'custom', path: ['correct'], message: `unknown zone "${key}"` })
    }
  })

export const hotspotCardPayloadSchema = z
  .object({
    mode: z.literal('card_to_zone'),
    pointsMultiplier,
    imageKey: z.string().min(1).max(500),
    zones: zoneList,
    cards: z.array(matchCard).min(1).max(12),
    map: z.record(elementKey, elementKey),
  })
  .superRefine((value, ctx) => {
    uniqueKeys(value.zones, ctx, 'zone')
    uniqueKeys(value.cards, ctx, 'card')
    const zoneKeys = new Set(value.zones.map((z_) => z_.key))
    const cardKeys = new Set(value.cards.map((c) => c.key))
    for (const [card, zone] of Object.entries(value.map)) {
      if (!cardKeys.has(card)) ctx.addIssue({ code: 'custom', path: ['map'], message: `map names unknown card "${card}"` })
      if (!zoneKeys.has(zone)) ctx.addIssue({ code: 'custom', path: ['map'], message: `map names unknown zone "${zone}"` })
    }
    for (const card of cardKeys) {
      if (!(card in value.map)) ctx.addIssue({ code: 'custom', path: ['map'], message: `card "${card}" has no zone` })
    }
  })

export const hotspotPayloadSchema = z.discriminatedUnion('mode', [
  hotspotClickPayloadSchema,
  hotspotCardPayloadSchema,
])
export type HotspotPayload = z.infer<typeof hotspotPayloadSchema>

/* ---- the discriminated whole ------------------------------------------- */

export const questionPayloadSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('mcq'), payload: mcqPayloadSchema }),
  z.object({ kind: z.literal('tf'), payload: tfPayloadSchema }),
  z.object({ kind: z.literal('order'), payload: orderPayloadSchema }),
  z.object({ kind: z.literal('match'), payload: matchPayloadSchema }),
  z.object({ kind: z.literal('hotspot'), payload: hotspotPayloadSchema }),
])

/** Parses a stored payload against the schema for its kind. */
export function parsePayload(kind: QuestionKind, payload: unknown) {
  switch (kind) {
    case 'mcq': return mcqPayloadSchema.safeParse(payload)
    case 'tf': return tfPayloadSchema.safeParse(payload)
    case 'order': return orderPayloadSchema.safeParse(payload)
    case 'match': return matchPayloadSchema.safeParse(payload)
    case 'hotspot': return hotspotPayloadSchema.safeParse(payload)
  }
}

/* ---- the answer union — plan §10 (p18), verbatim event shape ----------- */

/**
 * `[sourceKey, targetKey]` pairs for hotspot.
 *
 * In `card_to_zone` the source is a card. In `click_zone` there are no cards,
 * so the source is the canonical single slot `'*'` — a click answer is
 * `[['*', 'zone_2']]`. Spelled out because an undefined key space is how a
 * validator ends up accepting anything.
 */
export const HOTSPOT_CLICK_SOURCE = '*'

export const answerPayloadSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('mcq'), choice: elementKey }),
  z.object({ kind: z.literal('tf'), choice: tfChoiceSchema }),
  z.object({ kind: z.literal('order'), sequence: z.array(elementKey).min(1).max(8) }),
  z.object({ kind: z.literal('match'), pairs: z.array(z.tuple([elementKey, elementKey])).min(1).max(8) }),
  z.object({
    kind: z.literal('hotspot'),
    picks: z.array(z.tuple([z.union([z.literal(HOTSPOT_CLICK_SOURCE), elementKey]), elementKey])).min(1).max(12),
  }),
])
export type AnswerPayload = z.infer<typeof answerPayloadSchema>
