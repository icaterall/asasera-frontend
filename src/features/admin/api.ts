import { api, API_PREFIX } from '@/lib/api'
import type { PublicUser } from '@/lib/api'

export type AdminUser = {
  id:number;name:string|null;email:string|null;role:PublicUser['role'];status:string;locale:string;
  createdAt:string;lastLoginAt:string|null;emailVerified:boolean;balanceMillicents:number;
  reservedMillicents:number;spendableMillicents:number;welcomeGrantClaimed:boolean;
  creditPolicyVersion:number;creditUnit:'AI Credits';balanceAiCredits:number;
  reservedAiCredits:number;spendableAiCredits:number
}
export type CreditEntry = {id:number;kind:string;amountMillicents:number;reason:string|null;
  createdAt:string;actorEmail:string|null;balanceAfterMillicents:number|null;amountAiCredits:number;
  balanceAfterAiCredits:number|null}
export type Adjustment = {direction:'add'|'remove';amountAiCredits:number;reason:string;requestKey:string}
const root = `${API_PREFIX}/admin/users`
export const administration = {
  users:(search:string,role:string,page:number,signal?:AbortSignal)=>api.get<{users:AdminUser[];total:number;page:number;limit:number}>(
    `${root}?${new URLSearchParams({search,role,page:String(page),limit:'25'})}`,{...(signal?{signal}:{})}),
  user:(id:string,signal?:AbortSignal)=>api.get<AdminUser>(`${root}/${id}`,{...(signal?{signal}:{})}),
  history:(id:string,before?:number)=>api.get<{entries:CreditEntry[];nextBefore:number|null}>(`${root}/${id}/credits${before?`?before=${before}`:''}`),
  adjust:(id:string,input:Adjustment)=>api.post<{adjustmentId:number;balanceMillicents:number;balanceAiCredits:number;replayed:boolean}>(`${root}/${id}/credits`,input),
}
export const creditUsd = (amount:number,locale='en') => new Intl.NumberFormat(locale,{style:'currency',currency:'USD',minimumFractionDigits:2,maximumFractionDigits:5}).format(amount/100000)
export const aiCredits = (amount:number,locale='en') => new Intl.NumberFormat(locale,{maximumFractionDigits:0}).format(amount)
export function parseAiCredits(value:string):number|null {
  if(!/^[1-9]\d{0,9}$/.test(value)) return null
  const credits=Number(value)
  return Number.isSafeInteger(credits)&&credits<=1_000_000_000?credits:null
}
export function creditMillicents(usd:string):number|null {
  if(!/^(0|[1-9]\d{0,4})(\.\d{1,5})?$/.test(usd)) return null
  const [whole,fraction='']=usd.split('.')
  return Number(whole)*100000+Number(fraction.padEnd(5,'0'))
}

export type AiProvider = 'openai'|'gemini'
export type ImageQuality = 'low'|'medium'|'high'
/** `imageQuality` is the administrator's ceiling — the dearest tier a teacher may pick. */
export type AiPolicy = {version:number;provider:AiProvider;model:string;enabled:boolean;imageQuality?:ImageQuality|null}
export type AiRouteCapability = 'pdf_questions'|'image_generation'|'audio_generation'
export type AiRoutePolicy = AiPolicy&{capability:AiRouteCapability;configured:boolean;execution:'active'|'pending'}
export type AiPriceRateKind = 'input_text'|'cached_input_text'|'input_image'|'cached_input_image'|'input_text_or_image'|'output_text'|'output_audio'|'output_image'
export type AiModelPrice = {
  catalogVersion:string;currency:'USD';serviceTier:'standard';lifecycle:'stable'|'preview'|'deprecated';verifiedAt:string;source:string;
  components:{kind:AiPriceRateKind;amountMillicents:number}[];
  imageOutputReferences?:{size:string;quality:ImageQuality|null;amountMillicents:number}[]
}
export type ImageQualityOption = {quality:ImageQuality;outputTokens:number;amountMillicents:number}
/** Empty when the model prices image output by resolution — then no ceiling applies. */
export type AiRouteModel = {id:string;provider:AiProvider;configured:boolean;price?:AiModelPrice;imageQualityOptions?:ImageQualityOption[]}
export type AiCatalogCandidate = {provider:AiProvider;id:string;firstSeenAt:string;lastSeenAt:string;verification:'approved'|'needs_verification'}
export type AiCatalogProviderStatus = {provider:AiProvider;status:'updated'|'not_configured'|'unavailable'|'not_fetched';modelCount:number;fetchedAt:string|null}
export type AiModelCatalog = {candidates:AiCatalogCandidate[];providers:AiCatalogProviderStatus[]}
export type AiSettings = {
  policy:AiPolicy;
  models:{id:string;provider:AiPolicy['provider'];configured:boolean;structuredOutput:boolean;pricingAvailable:boolean;price?:AiModelPrice}[];
  ready:boolean;
  capabilities?:{id:'pdf_questions'|'image_review'|'image_generation'|'audio_generation';status:'available'|'configured_pending'|'paused'|'not_available';provider:string|null;model:string|null}[];
  routes?:AiRoutePolicy[];
  routeModels?:Partial<Record<AiRouteCapability,AiRouteModel[]>>;
  modelCatalog?:AiModelCatalog;
  history:(Omit<AiPolicy,'version'> & {version:number;actorUserId:number|null;createdAt:string})[]
}
export const aiAdministration = {
  get:(signal?:AbortSignal)=>api.get<AiSettings>(`${API_PREFIX}/admin/ai-settings`,{signal}),
  save:(input:Omit<AiPolicy,'version'> & {expectedVersion:number})=>api.put<AiSettings>(`${API_PREFIX}/admin/ai-settings`,input),
  saveRoute:(capability:Exclude<AiRouteCapability,'pdf_questions'>,input:Omit<AiPolicy,'version'> & {expectedVersion:number})=>api.put<AiSettings>(`${API_PREFIX}/admin/ai-settings/routes/${capability}`,input),
  refreshModelCatalog:()=>api.post<AiSettings>(`${API_PREFIX}/admin/ai-settings/model-catalog/refresh`,{}),
}

export type AdminOverview = {
  periodDays:number;
  traffic:{uniqueVisitors:number;visits:number;trackingStartedAt:string|null;daily:{date:string;visitors:number;visits:number}[]};
  people:{accounts:number;teachers:number;newAccounts:number;activeTeachers:number};
  teaching:{activities:number;activitiesCreated:number;runs:number;completedRuns:number;learnerSeats:number};
  generation:{jobsStarted:number;jobsSucceeded:number;jobsFailed:number;jobsAwaitingOutcome:number;providerCostMillicents:number};
}
export const adminAnalytics = {
  overview:(signal?:AbortSignal)=>api.get<AdminOverview>(`${API_PREFIX}/admin/overview`,{...(signal?{signal}:{})}),
}

export type AiUsageRow = {jobs:number;failed:number;costMillicents:number}
export type AiUsage = {
  filters:{from:string|null;to:string|null;userId:number|null}
  totals:{jobs:number;succeeded:number;failed:number;cancelled:number;needsReview:number;teachers:number
    settledMillicents:number;costMillicents:number;heldMillicents:number;inputTokens:number;outputTokens:number}
  daily:{date:string;jobs:number;settledMillicents:number;costMillicents:number}[]
  byTeacher:(AiUsageRow&{userId:number;name:string|null;email:string|null;settledMillicents:number;tokens:number;lastAt:string|null})[]
  byModel:(AiUsageRow&{provider:string;model:string;inputTokens:number;outputTokens:number;latencyMs:number})[]
  byTask:(AiUsageRow&{task:string;settledMillicents:number})[]
  recent:{createdAt:string;finishedAt:string|null;state:string;errorCode:string|null;task:string;provider:string;model:string
    userId:number;name:string|null;email:string|null;settledMillicents:number;costMillicents:number;inputTokens:number;outputTokens:number}[]
}
export const adminAiUsage = {
  load:(params:{from?:string;to?:string;userId?:number},signal?:AbortSignal)=>{
    const query=new URLSearchParams()
    if(params.from)query.set('from',params.from)
    if(params.to)query.set('to',params.to)
    if(params.userId)query.set('userId',String(params.userId))
    const suffix=query.toString()
    return api.get<AiUsage>(`${API_PREFIX}/admin/ai-usage${suffix?`?${suffix}`:''}`,{...(signal?{signal}:{})})
  },
}

export type BillingPlanId = 'day_pass'|'monthly'|'yearly'|'topup_small'|'topup_medium'|'topup_large'
export type BillingBlockReason = 'no_secret_key'|'no_webhook_secret'|'price_not_set'|'price_archived'|'mode_mismatch'|'currency_mismatch'|'interval_mismatch'|'price_uneconomic'
export type AdminBillingPlan = {
  plan:BillingPlanId; kind:'one_time'|'subscription'; period:'day'|'month'|'year'|null
  suggestedPriceMillicents:number; requiredInterval:'month'|'year'|null
  imageQualityCeiling:'low'|'medium'|'high'; maxOpenJobs:number
  stripePriceId:string|null; priceMillicents:number|null; currency:string|null
  recurringInterval:string|null; livemode:boolean|null; active:boolean|null; verifiedAt:string|null
  processorFeeMillicents:number|null; processorShareBasisPoints:number|null
  allowanceMillicents:number|null; includedAiCredits:number|null; activities:number|null; marginMillicents:number|null
  blockedBy:BillingBlockReason|null
}
export type AdminBilling = {
  policy:{version:number;enabled:boolean;currency:string;marginBasisPoints:number;feeBasisPoints:number;feeFixedMillicents:number;freeMonthlyMillicents:number}
  /** Presence only. A key's value never leaves the server. */
  credentials:{secretKey:boolean;webhookSecret:boolean;publishableKey:boolean;mode:'live'|'test'|null;modeMismatch:boolean}
  plans:AdminBillingPlan[]
}
export const adminBilling = {
  get:(signal?:AbortSignal)=>api.get<AdminBilling>(`${API_PREFIX}/admin/billing`,{signal}),
  savePolicy:(input:{currency:string;marginBasisPoints:number;feeBasisPoints:number;feeFixedMillicents:number;freeMonthlyMillicents:number;enabled:boolean;expectedVersion:number})=>
    api.put<AdminBilling>(`${API_PREFIX}/admin/billing`,input),
  savePrice:(input:{plan:BillingPlanId;stripePriceId:string|null;expectedVersion:number})=>
    api.put<AdminBilling>(`${API_PREFIX}/admin/billing/price`,input),
  reverify:()=>api.post<{results:{plan:BillingPlanId;status:string}[];settings:AdminBilling}>(`${API_PREFIX}/admin/billing/reverify`,{}),
  discover:()=>api.post<{results:{plan:BillingPlanId;status:'installed'|'not_found'|'rejected';detail?:string}[];settings:AdminBilling}>(`${API_PREFIX}/admin/billing/discover`,{}),
}
