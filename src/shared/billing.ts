/*
 * GENERATED FILE — DO NOT EDIT.
 *
 * Mirrored from asasera-backend/packages/shared/src/billing.ts.
 * Edit the source there and run `npm run sync:shared` in asasera-backend.
 * CI fails if this file and its source differ.
 */
/**
 * What a payment buys.
 *
 * ONE FORMULA, DERIVED FROM THE MONEY ACTUALLY RECEIVED. A teacher pays a
 * price; a card processor takes its cut; the business keeps its margin; what
 * remains is the provider spend the teacher may consume. Every figure shown on
 * a plan card, and every credit granted after a payment, comes out of the
 * single function below — so the margin cannot drift from the prices, and a
 * price edited in the Stripe dashboard cannot grant more than it paid for.
 *
 * The margin is taken AFTER the processor's cut, which matters far more than
 * it sounds. A fixed fee per charge is a rounding error on a yearly invoice
 * and a third of a daily one, so a margin defined before fees quietly collapses
 * on exactly the small, frequent payments a low-priced product depends on.
 */

/** Basis points: 10,000 = 100%. Integers throughout; money is never a float. */
export type ProcessorFee = { percentBasisPoints: number; fixedMillicents: number }

export const MILLICENTS_PER_USD = 100_000

/** What the processor takes from one charge of this size. */
export function processorCutMillicents(priceMillicents: number, fee: ProcessorFee): number {
  if (priceMillicents <= 0) return 0
  return Math.ceil((priceMillicents * fee.percentBasisPoints) / 10_000) + fee.fixedMillicents
}

/**
 * The provider spend a price carries, after the processor and the margin.
 *
 * Rounded DOWN: a rounding error must never be paid for by the business, and
 * one millicent is a hundred-thousandth of a dollar — invisible to a teacher,
 * decisive only in that it always falls on the safe side.
 */
export function providerAllowanceMillicents(priceMillicents: number, fee: ProcessorFee, marginBasisPoints: number): number {
  const net = priceMillicents - processorCutMillicents(priceMillicents, fee)
  if (net <= 0) return 0
  return Math.floor((net * (10_000 - marginBasisPoints)) / 10_000)
}

/** The share of a charge that never reaches the business. Small prices hurt. */
export function processorShareBasisPoints(priceMillicents: number, fee: ProcessorFee): number {
  if (priceMillicents <= 0) return 0
  return Math.round((processorCutMillicents(priceMillicents, fee) * 10_000) / priceMillicents)
}

/**
 * A charge below this is mostly fee. Used to refuse a plan price that would
 * quietly invert the economics rather than discovering it in a month's report.
 */
export const MAX_SANE_PROCESSOR_SHARE_BASIS_POINTS = 2_000 // 20%
export function priceIsSane(priceMillicents: number, fee: ProcessorFee, marginBasisPoints: number): boolean {
  return providerAllowanceMillicents(priceMillicents, fee, marginBasisPoints) > 0
    && processorShareBasisPoints(priceMillicents, fee) <= MAX_SANE_PROCESSOR_SHARE_BASIS_POINTS
}

export const BILLING_PLANS = ['day_pass', 'monthly', 'yearly', 'topup_small', 'topup_medium', 'topup_large'] as const
export type BillingPlanId = (typeof BILLING_PLANS)[number]
export function isBillingPlan(value: unknown): value is BillingPlanId {
  return typeof value === 'string' && (BILLING_PLANS as readonly string[]).includes(value)
}

export type BillingKind = 'one_time' | 'subscription'
export type BillingPeriod = 'day' | 'month' | 'year' | null

/**
 * Display metadata only. The AMOUNT is whatever Stripe reports having
 * collected — listing a price here too would create a second source of truth,
 * and the one that granted credit would not be the one the teacher paid.
 */
export type PlanShape = {
  id: BillingPlanId
  kind: BillingKind
  /** How long access lasts. A top-up is credit with no clock. */
  period: BillingPeriod
  /**
   * What to charge, as a RECOMMENDATION to whoever creates the Stripe Price.
   * It is never what a teacher is shown or billed: that comes back from Stripe
   * with the price object, so a figure here cannot become a figure charged.
   */
  suggestedPriceMillicents: number
  /** Everything the plan unlocks beyond credit. */
  imageQualityCeiling: 'low' | 'medium' | 'high'
  maxOpenJobs: number
}

/**
 * The billing interval a Stripe price MUST have to back this plan. A one-time
 * price installed as the monthly subscription would charge once and entitle
 * for ever; the reverse would bill a day pass every month.
 */
export function requiredInterval(plan: BillingPlanId): 'month' | 'year' | null {
  return PLAN_SHAPES[plan].kind === 'subscription' ? (PLAN_SHAPES[plan].period as 'month' | 'year') : null
}

/*
 * Deliberately under every Kahoot tier. Their entry plan is USD 19 a month and
 * AI question generation sits in the USD 49 tiers (kahoot360.com/pricing,
 * checked 13 September 2026). A teacher's realistic provider spend here is
 * under two dollars a month, so a five-dollar plan keeps the margin and still
 * costs a quarter of the cheapest thing they could switch from.
 */
export const PLAN_SHAPES: Readonly<Record<BillingPlanId, PlanShape>> = {
  day_pass:      { id: 'day_pass',      kind: 'one_time',     period: 'day',   suggestedPriceMillicents:   200_000, imageQualityCeiling: 'medium', maxOpenJobs: 2 },
  monthly:       { id: 'monthly',       kind: 'subscription', period: 'month', suggestedPriceMillicents:   400_000, imageQualityCeiling: 'medium', maxOpenJobs: 3 },
  yearly:        { id: 'yearly',        kind: 'subscription', period: 'year',  suggestedPriceMillicents: 2_900_000, imageQualityCeiling: 'high',   maxOpenJobs: 4 },
  topup_small:   { id: 'topup_small',   kind: 'one_time',     period: null,    suggestedPriceMillicents:   300_000, imageQualityCeiling: 'low',    maxOpenJobs: 2 },
  topup_medium:  { id: 'topup_medium',  kind: 'one_time',     period: null,    suggestedPriceMillicents:   900_000, imageQualityCeiling: 'low',    maxOpenJobs: 2 },
  topup_large:   { id: 'topup_large',   kind: 'one_time',     period: null,    suggestedPriceMillicents: 1_900_000, imageQualityCeiling: 'low',    maxOpenJobs: 2 },
}

/*
 * THE UNIT A TEACHER UNDERSTANDS.
 *
 * "229,250 AI Credits" is a number nobody can act on. "About ninety activities
 * a month" is a decision. Both come from the same allowance; only one of them
 * belongs on a plan card.
 *
 * The figure below is deliberately PESSIMISTIC — the top of the observed range
 * for a generated activity plus an illustration, not the average — so the
 * count a teacher is shown is one they will beat rather than miss. Promising
 * ninety and delivering sixty is how a cheap plan earns a refund request.
 */
export const TYPICAL_ACTIVITY_MILLICENTS = 2_000  // USD 0.02: generation + one low-quality image
export function activitiesForAllowance(allowanceMillicents: number): number {
  return Math.floor(allowanceMillicents / TYPICAL_ACTIVITY_MILLICENTS)
}

/** A top-up adds credit to whatever plan the teacher is on; it grants no features. */
export function isTopUp(plan: BillingPlanId): boolean {
  return PLAN_SHAPES[plan].period === null
}
