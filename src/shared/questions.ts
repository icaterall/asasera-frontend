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

/*
 * Empty while drafting; required at publication. See mcqOption above.
 *
 * An item may be a PICTURE rather than words — ordering four photographs of a
 * process, or four diagrams, is the same skill as ordering four sentences, and
 * for a learner who is still building the language it is a fairer test of it.
 * So `image` is carried here on the same terms as an MCQ option's: optional in
 * storage, and at publication an item needs text or an image, not both.
 */
const orderItem = z.object({ key: elementKey, text: z.string().max(300), image: z.string().max(500).optional() })

/**
 * How an ordering is judged.
 *
 *   exact     one complete sequence is correct.
 *   flexible  several complete sequences are correct.
 *   partial   only the declared dependencies matter; anything they leave
 *             unconstrained is free.
 *
 * ABSENT MEANS EXACT. Every question written before these modes existed
 * carries no `mode`, and must keep marking identically — a stored question
 * whose meaning changes because the schema grew is a silent regression across
 * every past run and report.
 */
export const ORDER_MODES = ['exact', 'flexible', 'partial'] as const
export const orderModeSchema = z.enum(ORDER_MODES)
export type OrderMode = (typeof ORDER_MODES)[number]

/**
 * One dependency: `before` must appear somewhere earlier than `after`.
 *
 * A dependency is a RELATIONSHIP, not a position. That is the whole point —
 * "validate before save" is true whether validation is step 1 of 4 or step 3
 * of 9, and a learner who has that relationship right has understood
 * something that a position check cannot see.
 *
 * No misconception code here. A diagnosis lives in `error_pairs`, which
 * already has `reason` and `misconception_id` and is already frozen into the
 * published version. Carrying a second copy in the payload would be a
 * parallel system that can disagree with the first.
 */
const orderConstraint = z.object({ before: elementKey, after: elementKey })
export type OrderConstraint = z.infer<typeof orderConstraint>

/**
 * `correct` is the logical order. §12: «الترتيب يُخزَّن منطقيًا ويُعرض حسب
 * الاتجاه» — stored logically, displayed by direction. "First" means first
 * logically, and it is drawn on the right in Arabic and the left in English.
 * Nothing reverses the stored array because the UI direction changed.
 *
 * `correct` stays REQUIRED in every mode. It is the sequence the teacher
 * actually typed, it is what the reveal shows the class, and in `partial` it
 * is the reference the dependencies are checked against for consistency. A
 * mode that had no reference sequence would leave the reveal with nothing to
 * display.
 */
export const orderPayloadSchema = z
  .object({
    items: z.array(orderItem).min(2).max(8),
    pointsMultiplier,
    correct: z.array(elementKey).min(2).max(8),
    mode: orderModeSchema.optional(),
    /** `flexible` only: further complete sequences accepted besides `correct`. */
    alternates: z.array(z.array(elementKey).min(2).max(8)).max(8).optional(),
    /** `partial` only: the dependencies that decide correctness. */
    constraints: z.array(orderConstraint).max(32).optional(),
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

    const mode = value.mode ?? 'exact'

    /*
     * An alternate is a COMPLETE sequence, held to the same rules as `correct`.
     * A three-of-four "alternate" would be accepted by marking as a full
     * answer and quietly ignore the missing item.
     */
    value.alternates?.forEach((sequence, index) => {
      const path = ['alternates', index] as (string | number)[]
      if (new Set(sequence).size !== sequence.length) {
        ctx.addIssue({ code: 'custom', path, message: 'an alternate sequence repeats a key' })
      }
      if (sequence.length !== value.items.length) {
        ctx.addIssue({ code: 'custom', path, message: 'an alternate sequence must list every item exactly once' })
      }
      for (const key of sequence) {
        if (!itemKeys.has(key)) ctx.addIssue({ code: 'custom', path, message: `an alternate sequence names unknown item "${key}"` })
      }
      if (sequence.length === value.correct.length && sequence.every((key, i) => key === value.correct[i])) {
        ctx.addIssue({ code: 'custom', path, message: 'an alternate sequence repeats the correct order' })
      }
    })

    const seenConstraints = new Set<string>()
    for (const [index, constraint] of (value.constraints ?? []).entries()) {
      const path = ['constraints', index] as (string | number)[]
      if (!itemKeys.has(constraint.before)) ctx.addIssue({ code: 'custom', path, message: `constraint names unknown item "${constraint.before}"` })
      if (!itemKeys.has(constraint.after)) ctx.addIssue({ code: 'custom', path, message: `constraint names unknown item "${constraint.after}"` })
      if (constraint.before === constraint.after) ctx.addIssue({ code: 'custom', path, message: 'a constraint cannot order an item against itself' })
      const id = `${constraint.before}>${constraint.after}`
      if (seenConstraints.has(id)) ctx.addIssue({ code: 'custom', path, message: 'duplicate constraint' })
      seenConstraints.add(id)
    }

    /*
     * INTERNAL CONSISTENCY (§9). The dependencies must be satisfiable, and the
     * sequence the teacher typed must satisfy them. Both failures produce the
     * same symptom in a classroom — every learner marked wrong, with no way to
     * be right — and neither is visible by reading the list.
     *
     * Contradictory dependencies show up as a cycle; `correct` is checked by
     * simply reading positions off it.
     */
    if (mode === 'partial') {
      const position = new Map(value.correct.map((key, index) => [key, index]))
      for (const [index, constraint] of (value.constraints ?? []).entries()) {
        const before = position.get(constraint.before)
        const after = position.get(constraint.after)
        if (before !== undefined && after !== undefined && before > after) {
          ctx.addIssue({
            code: 'custom',
            path: ['constraints', index],
            message: `constraint "${constraint.before} before ${constraint.after}" contradicts the order written above it`,
          })
        }
      }
      if (orderConstraintCycle(value.constraints ?? [])) {
        ctx.addIssue({ code: 'custom', path: ['constraints'], message: 'these constraints contradict each other — no order can satisfy them all' })
      }
    }
  })
export type OrderPayload = z.infer<typeof orderPayloadSchema>

/**
 * Whether a set of dependencies contains a cycle — A before B before A.
 *
 * Iterative depth-first search with an explicit stack. Eight items is small,
 * but a recursive walk over attacker-supplied edges is a stack overflow
 * waiting to happen, and this runs on the server against submitted content.
 */
export function orderConstraintCycle(constraints: readonly OrderConstraint[]): boolean {
  const edges = new Map<string, string[]>()
  for (const { before, after } of constraints) edges.set(before, [...(edges.get(before) ?? []), after])
  const done = new Set<string>()
  const onPath = new Set<string>()
  for (const root of edges.keys()) {
    if (done.has(root)) continue
    const stack: Array<{ node: string; step: number }> = [{ node: root, step: 0 }]
    onPath.add(root)
    while (stack.length) {
      const frame = stack[stack.length - 1]!
      const next = (edges.get(frame.node) ?? [])[frame.step]
      if (next === undefined) {
        onPath.delete(frame.node)
        done.add(frame.node)
        stack.pop()
        continue
      }
      frame.step += 1
      if (onPath.has(next)) return true
      if (done.has(next)) continue
      onPath.add(next)
      stack.push({ node: next, step: 0 })
    }
  }
  return false
}

/**
 * The dependencies an ordering actually asserts, in the modes that do not
 * declare them.
 *
 * ADJACENT PAIRS ONLY. A four-item sequence implies six "x before y" facts,
 * and a learner who reverses the whole list violates all six — which reads as
 * six separate misunderstandings rather than one. Adjacent pairs give at most
 * n−1 relationships, and for the case that matters (two neighbouring steps
 * swapped) it yields exactly one: the relationship the learner actually got
 * wrong.
 */
export function impliedOrderConstraints(sequence: readonly string[]): OrderConstraint[] {
  return sequence.slice(0, -1).map((before, index) => ({ before, after: sequence[index + 1]! }))
}

/**
 * How a violated dependency is addressed in `error_pairs` and `wrongElements`.
 *
 * Positions are recorded as a bare index (`"2"`), so prefixing with `after:`
 * keeps the two families of order evidence in one column without either being
 * mistaken for the other.
 */
export const ORDER_RELATION_PREFIX = 'after:'
export const orderRelationKey = (after: string): string => `${ORDER_RELATION_PREFIX}${after}`
export const readOrderRelationKey = (wrongTargetKey: string | null): string | null =>
  wrongTargetKey?.startsWith(ORDER_RELATION_PREFIX) ? wrongTargetKey.slice(ORDER_RELATION_PREFIX.length) : null

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

/**
 * What a learner DID while ordering, as opposed to what they ended up with.
 *
 * §4: a submitted sequence is worth more than a boolean, and the route to it
 * is worth more again — a learner who dragged one card once and a learner who
 * rearranged all six twice can hand in the same wrong answer for very
 * different reasons.
 *
 * DELIBERATELY COARSE. `moves` are committed reorders, not pointer samples:
 * one entry per item that changed place, capped, with no coordinates and no
 * timestamps per move. That is enough to tell a confident ordering from a
 * hesitant one, and it is not a recording of a child using a screen.
 *
 * There is no submission timestamp here. The server writes `received_at` on
 * the row; a clock the learner's device controls is not evidence.
 */
export const orderEvidenceSchema = z.object({
  /** The randomised order this learner was shown — different for each of them. */
  shown: z.array(elementKey).max(8),
  moves: z
    .array(z.object({ item: elementKey, from: z.number().int().min(0).max(7), to: z.number().int().min(0).max(7) }))
    .max(60),
  /** Milliseconds from the question appearing to the learner pressing Check. */
  durationMs: z.number().int().min(0).max(3_600_000),
  /** 1 for the first go; 2+ after a targeted hint sent them back in. */
  attempt: z.number().int().min(1).max(10),
})
export type OrderEvidence = z.infer<typeof orderEvidenceSchema>

export const answerPayloadSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('mcq'), choice: elementKey }),
  z.object({ kind: z.literal('tf'), choice: tfChoiceSchema }),
  z.object({ kind: z.literal('order'), sequence: z.array(elementKey).min(1).max(8), evidence: orderEvidenceSchema.optional() }),
  z.object({ kind: z.literal('match'), pairs: z.array(z.tuple([elementKey, elementKey])).min(1).max(8) }),
  z.object({
    kind: z.literal('hotspot'),
    picks: z.array(z.tuple([z.union([z.literal(HOTSPOT_CLICK_SOURCE), elementKey]), elementKey])).min(1).max(12),
  }),
])
export type AnswerPayload = z.infer<typeof answerPayloadSchema>
