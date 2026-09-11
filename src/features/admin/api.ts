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
export type AiPolicy = {version:number;provider:AiProvider;model:string;enabled:boolean}
export type AiRouteCapability = 'pdf_questions'|'image_generation'|'audio_generation'
export type AiRoutePolicy = AiPolicy&{capability:AiRouteCapability;configured:boolean;execution:'active'|'pending'}
export type AiPriceRateKind = 'input_text'|'cached_input_text'|'input_image'|'cached_input_image'|'input_text_or_image'|'output_text'|'output_audio'|'output_image'
export type AiModelPrice = {
  catalogVersion:string;currency:'USD';serviceTier:'standard';lifecycle:'stable'|'preview'|'deprecated';verifiedAt:string;source:string;
  components:{kind:AiPriceRateKind;amountMillicents:number}[];
  imageOutputReferences?:{size:string;quality:'low'|'medium'|'high'|null;amountMillicents:number}[]
}
export type AiRouteModel = {id:string;provider:AiProvider;configured:boolean;price?:AiModelPrice}
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
