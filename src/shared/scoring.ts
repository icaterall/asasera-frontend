/*
 * GENERATED FILE — DO NOT EDIT.
 *
 * Mirrored from asasera-backend/packages/shared/src/scoring.ts.
 * Edit the source there and run `npm run sync:shared` in asasera-backend.
 * CI fails if this file and its source differ.
 */
import {
  HOTSPOT_CLICK_SOURCE,
  type AnswerPayload,
  type HotspotPayload,
  type MatchPayload,
  type McqPayload,
  type OrderPayload,
  type QuestionKind,
  type TfPayload,
  tfChoiceToBoolean,
} from './questions.ts'

/**
 * Marking — plan §11 (p19), §16 W04.
 *
 * PURE. No clock, no socket, no database, no React. Everything time-related
 * arrives as a number that the *server* measured. §17 (p31) makes the five
 * marking functions a mandatory unit target, and a function that reaches for
 * `Date.now()` cannot be tested at a boundary instant.
 */

/** Awarded for a correct answer when speed weighting is off. */
export const POINTS_CORRECT = 1000

/**
 * Floor of the speed multiplier when weighting IS on: an answer at the very
 * last instant still scores half, not nothing. PROVISIONAL — the plan states
 * that speed weighting exists, is per-section and is off by default, but gives
 * no curve. See decisions-v4.md D-V4-012.
 */
export const SPEED_FLOOR = 0.5

/**
 * §11: «مهلة سماح 300 مللي بعد endsAt تُقبل فيها الإجابات المتأخرة بسبب الشبكة».
 * The server's acceptance cutoff is `endsAt + GRACE_MS`, inclusive.
 */
export const GRACE_MS = 300

/** §7/§8: the still beat between lock and reveal. Reveal may not begin sooner. */
export const REVEAL_PAUSE_MS = 400

/**
 * Upper bound on the half-RTT the server will subtract from a response time.
 *
 * §11 says to subtract half the measured round trip so a pupil on a slow
 * network does not lose speed points they did not deserve. Unbounded, that is
 * a lever: inflate your measured RTT and every answer looks instant. Clamped,
 * a bad connection is compensated and a lie is capped.
 *
 * This REDUCES a bias. It does not make latency fair — a claim the product
 * should not make.
 */
export const MAX_RTT_COMPENSATION_MS = 400

export interface MarkResult {
  /** Whether the submission is correct. Never null: an invalid answer is wrong, not absent. */
  correct: boolean
  /** Why it was rejected, when it could not be marked at all. */
  invalid?: string
  /** Element keys the learner got wrong — what an error pair is looked up by. */
  wrongElements: Array<{ elementKey: string; wrongTargetKey?: string }>
}

const invalid = (reason: string): MarkResult => ({ correct: false, invalid: reason, wrongElements: [] })

/* ---- the five markers -------------------------------------------------- */

export function markMcq(payload: McqPayload, answer: Extract<AnswerPayload, { kind: 'mcq' }>): MarkResult {
  if (!payload.options.some((o) => o.key === answer.choice)) {
    return invalid(`choice "${answer.choice}" is not an option on this question`)
  }
  const correct = answer.choice === payload.correct
  return { correct, wrongElements: correct ? [] : [{ elementKey: answer.choice }] }
}

export function markTf(payload: TfPayload, answer: Extract<AnswerPayload, { kind: 'tf' }>): MarkResult {
  const chosen = tfChoiceToBoolean(answer.choice)
  const correct = chosen === payload.correct
  // The element key is the canonical wire value, not the rendered label, so an
  // error pair recorded in Arabic still resolves in English.
  return { correct, wrongElements: correct ? [] : [{ elementKey: answer.choice }] }
}

/**
 * Ordering. The submitted sequence must be a permutation of exactly the item
 * keys — missing, extra and repeated are all rejected rather than scored as a
 * near miss, because a partial sequence is not an ordering.
 */
export function markOrder(payload: OrderPayload, answer: Extract<AnswerPayload, { kind: 'order' }>): MarkResult {
  const expected = payload.correct
  const got = answer.sequence

  if (got.length !== expected.length) {
    return invalid(`sequence has ${got.length} items, expected ${expected.length}`)
  }
  if (new Set(got).size !== got.length) {
    return invalid('sequence repeats an item')
  }
  const allowed = new Set(payload.items.map((i) => i.key))
  for (const key of got) {
    if (!allowed.has(key)) return invalid(`sequence names unknown item "${key}"`)
  }

  const wrongElements: MarkResult['wrongElements'] = []
  for (let i = 0; i < expected.length; i += 1) {
    if (got[i] !== expected[i]) wrongElements.push({ elementKey: got[i]!, wrongTargetKey: String(i) })
  }
  return { correct: wrongElements.length === 0, wrongElements }
}

/**
 * Matching. All-or-nothing: every card must be on its declared target.
 *
 * `wrongElements` names the specific card→wrong-target combinations, which is
 * exactly what an `error_pairs` row describes. Combinations the author never
 * wrote a reason for simply have no reason — the product does not imply that
 * every permutation has a diagnosed cause.
 */
export function markMatch(payload: MatchPayload, answer: Extract<AnswerPayload, { kind: 'match' }>): MarkResult {
  const cardKeys = new Set(payload.cards.map((c) => c.key))
  const targetKeys = new Set(payload.targets.map((t) => t.key))
  const submitted = new Map<string, string>()

  for (const [card, target] of answer.pairs) {
    if (!cardKeys.has(card)) return invalid(`pairs name unknown card "${card}"`)
    if (!targetKeys.has(target)) return invalid(`pairs name unknown target "${target}"`)
    if (submitted.has(card)) return invalid(`card "${card}" is placed twice`)
    submitted.set(card, target)
  }
  if (submitted.size !== cardKeys.size) {
    return invalid(`${submitted.size} of ${cardKeys.size} cards placed`)
  }

  const wrongElements: MarkResult['wrongElements'] = []
  for (const [card, target] of submitted) {
    if (payload.map[card] !== target) wrongElements.push({ elementKey: card, wrongTargetKey: target })
  }
  return { correct: wrongElements.length === 0, wrongElements }
}

export function markHotspot(
  payload: HotspotPayload,
  answer: Extract<AnswerPayload, { kind: 'hotspot' }>,
): MarkResult {
  const zoneKeys = new Set(payload.zones.map((z) => z.key))

  if (payload.mode === 'click_zone') {
    const picked: string[] = []
    for (const [source, zone] of answer.picks) {
      if (source !== HOTSPOT_CLICK_SOURCE) {
        return invalid(`click-mode picks must use the "${HOTSPOT_CLICK_SOURCE}" source, got "${source}"`)
      }
      if (!zoneKeys.has(zone)) return invalid(`picks name unknown zone "${zone}"`)
      if (picked.includes(zone)) return invalid(`zone "${zone}" is picked twice`)
      picked.push(zone)
    }
    const expected = new Set(payload.correct)
    if (picked.length !== expected.size) {
      return {
        correct: false,
        wrongElements: picked.filter((z) => !expected.has(z)).map((z) => ({ elementKey: z })),
      }
    }
    const wrongElements = picked.filter((z) => !expected.has(z)).map((z) => ({ elementKey: z }))
    return { correct: wrongElements.length === 0, wrongElements }
  }

  const cardKeys = new Set(payload.cards.map((c) => c.key))
  const submitted = new Map<string, string>()
  for (const [card, zone] of answer.picks) {
    if (!cardKeys.has(card)) return invalid(`picks name unknown card "${card}"`)
    if (!zoneKeys.has(zone)) return invalid(`picks name unknown zone "${zone}"`)
    if (submitted.has(card)) return invalid(`card "${card}" is placed twice`)
    submitted.set(card, zone)
  }
  if (submitted.size !== cardKeys.size) {
    return invalid(`${submitted.size} of ${cardKeys.size} cards placed`)
  }
  const wrongElements: MarkResult['wrongElements'] = []
  for (const [card, zone] of submitted) {
    if (payload.map[card] !== zone) wrongElements.push({ elementKey: card, wrongTargetKey: zone })
  }
  return { correct: wrongElements.length === 0, wrongElements }
}

/** Dispatches on kind, and refuses an answer whose kind is not the question's. */
export function markAnswer(kind: QuestionKind, payload: unknown, answer: AnswerPayload): MarkResult {
  if (answer.kind !== kind) return invalid(`answer kind "${answer.kind}" does not match question kind "${kind}"`)
  switch (kind) {
    case 'mcq': return markMcq(payload as McqPayload, answer as never)
    case 'tf': return markTf(payload as TfPayload, answer as never)
    case 'order': return markOrder(payload as OrderPayload, answer as never)
    case 'match': return markMatch(payload as MatchPayload, answer as never)
    case 'hotspot': return markHotspot(payload as HotspotPayload, answer as never)
  }
}

/* ---- acceptance window ------------------------------------------------- */

export type AcceptanceOutcome = 'accepted' | 'late' | 'closed'

/**
 * Whether the server accepts a submission, given ONLY server-measured times.
 *
 * `closed` is not the same as `late`: closed means the host revealed early and
 * the window was shut by an explicit transition, so a submission that would
 * have been inside the grace period is still refused. Reveal may never begin
 * while a valid submission window is open.
 */
export function acceptance(args: {
  receivedAt: number
  endsAt: number
  windowClosedAt?: number | null
}): AcceptanceOutcome {
  if (args.windowClosedAt != null && args.receivedAt >= args.windowClosedAt) return 'closed'
  if (args.receivedAt <= args.endsAt) return 'accepted'
  if (args.receivedAt <= args.endsAt + GRACE_MS) return 'late'
  return 'closed'
}

/* ---- points ------------------------------------------------------------ */

export interface ScoreInput {
  /** Teacher-selected multiplier from the server-owned question snapshot. */
  pointsMultiplier?: 0 | 1 | 2

  correct: boolean
  /** Server clock. */
  receivedAt: number
  questionOpenedAt: number
  endsAt: number
  /** Per-section, OFF by default (§11). */
  speedWeighting?: boolean
  /** Server-measured round trip for this participant, in ms. */
  rttMs?: number
}

/**
 * Points for one answer.
 *
 * With speed weighting off — the default — a correct answer is worth exactly
 * `POINTS_CORRECT` and nothing else enters the calculation. That is what makes
 * «أجاب عن 4 من 5» (§14) and the podium ordering the same fact, and it is why
 * ties are real ties rather than an artefact of millisecond noise.
 */
export function scoreAnswer(input: ScoreInput): number {
  if (!input.correct) return 0
  const multiplier = input.pointsMultiplier === 0 ? 0 : input.pointsMultiplier === 2 ? 2 : 1
  if (!input.speedWeighting) return POINTS_CORRECT * multiplier

  const limit = Math.max(1, input.endsAt - input.questionOpenedAt)
  const compensation = Math.min(Math.max(0, (input.rttMs ?? 0) / 2), MAX_RTT_COMPENSATION_MS)
  // Clamped at 0: compensation larger than the elapsed time would otherwise
  // produce a negative duration and a multiplier above 1.
  const elapsed = Math.max(0, input.receivedAt - input.questionOpenedAt - compensation)
  const fraction = Math.min(1, elapsed / limit)
  return Math.round(POINTS_CORRECT * (1 - (1 - SPEED_FLOOR) * fraction)) * multiplier
}

/* ---- ranking ----------------------------------------------------------- */

export interface Standing {
  participantId: string
  name: string
  score: number
  correctCount: number
}

export interface RankedStanding extends Standing {
  /** Competition ranking: equal scores share a rank and the next rank skips. */
  rank: number
  tied: boolean
}

/**
 * Orders standings and marks ties honestly.
 *
 * Two pupils on the same score are both first; there is no tiebreak on
 * response time, because with speed weighting off the server has no basis for
 * one, and inventing it would rank pupils by network quality. The podium (§8)
 * shows however many people there actually are — one, two, or four in a
 * three-way tie for second — and never pads to three.
 */
export function rankStandings(standings: Standing[]): RankedStanding[] {
  const sorted = [...standings].sort(
    (a, b) => b.score - a.score || a.name.localeCompare(b.name, 'ar') || a.participantId.localeCompare(b.participantId),
  )
  const out: RankedStanding[] = []
  let rank = 0
  let previousScore: number | null = null
  sorted.forEach((standing, index) => {
    if (previousScore === null || standing.score !== previousScore) rank = index + 1
    previousScore = standing.score
    out.push({ ...standing, rank, tied: false })
  })
  const countByRank = new Map<number, number>()
  for (const s of out) countByRank.set(s.rank, (countByRank.get(s.rank) ?? 0) + 1)
  return out.map((s) => ({ ...s, tied: (countByRank.get(s.rank) ?? 0) > 1 }))
}

/** Everyone whose rank is 1..3. A three-way tie for first returns three people and no second. */
export function podium(standings: Standing[]): RankedStanding[] {
  return rankStandings(standings).filter((s) => s.rank <= 3)
}
