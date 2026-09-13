import {api,API_PREFIX} from '@/lib/api'
export type AccountOverview={
 updatedAt:string;creditPolicyVersion:number
 usage:{allTimeAiCredits:number;last30DaysAiCredits:number}
 workspace:{activities:number;questions:number;liveSessions:number;assignments:number;participations:number;materials:number}
 recent:Array<{id:number;kind:'grant'|'adjustment'|'settle'|'reversal';amountAiCredits:number;createdAt:string}>
}
export const instructorAccount={overview:()=>api.get<AccountOverview>(`${API_PREFIX}/teaching/account-overview`)}

export type BillingPlanId='day_pass'|'monthly'|'yearly'|'topup_small'|'topup_medium'|'topup_large'
export type BillingPlan={
 id:BillingPlanId;kind:'one_time'|'subscription';period:'day'|'month'|'year'|null
 priceMillicents:number;currency:string;includedAiCredits:number;activities:number
 processorShareBasisPoints:number;sound:boolean;available:boolean
 imageQualityCeiling:'low'|'medium'|'high';maxOpenJobs:number;topUp:boolean
}
export type BillingCatalogue={
 configured:boolean;currency:string;plans:BillingPlan[]
 free:{millicents:number;aiCredits:number;activities:number}
 subscription:{plan:BillingPlanId;status:string;currentPeriodEnd:string;cancelAtPeriodEnd:boolean}|null
}
export type Purchase={plan:BillingPlanId;currency:string;paidMillicents:number;aiCredits:number;createdAt:string}
export type CheckoutReceipt=
 |{state:'pending';balanceAiCredits:number;usableAiCredits:number}
 |{state:'recorded';plan:BillingPlanId;paidMillicents:number;currency:string
   addedAiCredits:number;addedActivities:number;balanceAiCredits:number;usableAiCredits:number
   imageQualityCeiling:'low'|'medium'|'high';maxOpenJobs:number
   subscription:{plan:BillingPlanId;status:string;currentPeriodEnd:string;cancelAtPeriodEnd:boolean}|null
   purchasedAt:string}
export const billing={
 receipt:(session:string,signal?:AbortSignal)=>api.get<CheckoutReceipt>(`${API_PREFIX}/billing/checkout/${encodeURIComponent(session)}`,{signal}),
 plans:(signal?:AbortSignal)=>api.get<BillingCatalogue>(`${API_PREFIX}/billing/plans`,{signal}),
 purchases:(signal?:AbortSignal)=>api.get<Purchase[]>(`${API_PREFIX}/billing/purchases`,{signal}),
 checkout:(plan:BillingPlanId)=>api.post<{url:string}>(`${API_PREFIX}/billing/checkout`,{plan}),
 portal:()=>api.post<{url:string}>(`${API_PREFIX}/billing/portal`,{}),
}
