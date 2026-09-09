import { api, API_PREFIX } from '@/lib/api'
import type { PublicUser } from '@/lib/api'

export type AdminUser = {
  id:number;name:string|null;email:string|null;role:PublicUser['role'];status:string;locale:string;
  createdAt:string;lastLoginAt:string|null;emailVerified:boolean;balanceMillicents:number;
  reservedMillicents:number;spendableMillicents:number;welcomeGrantClaimed:boolean
}
export type CreditEntry = {id:number;kind:string;amountMillicents:number;reason:string|null;
  createdAt:string;actorEmail:string|null;balanceAfterMillicents:number|null}
export type Adjustment = {direction:'add'|'remove';amountUsd:string;reason:string;requestKey:string}
const root = `${API_PREFIX}/admin/users`
export const administration = {
  users:(search:string,role:string,page:number,signal?:AbortSignal)=>api.get<{users:AdminUser[];total:number;page:number;limit:number}>(
    `${root}?${new URLSearchParams({search,role,page:String(page),limit:'25'})}`,{...(signal?{signal}:{})}),
  user:(id:string,signal?:AbortSignal)=>api.get<AdminUser>(`${root}/${id}`,{...(signal?{signal}:{})}),
  history:(id:string,before?:number)=>api.get<{entries:CreditEntry[];nextBefore:number|null}>(`${root}/${id}/credits${before?`?before=${before}`:''}`),
  adjust:(id:string,input:Adjustment)=>api.post<{adjustmentId:number;balanceMillicents:number;replayed:boolean}>(`${root}/${id}/credits`,input),
}
export const creditUsd = (amount:number,locale='en') => new Intl.NumberFormat(locale,{style:'currency',currency:'USD',minimumFractionDigits:2,maximumFractionDigits:5}).format(amount/100000)
export function creditMillicents(usd:string):number|null {
  if(!/^(0|[1-9]\d{0,4})(\.\d{1,5})?$/.test(usd)) return null
  const [whole,fraction='']=usd.split('.')
  return Number(whole)*100000+Number(fraction.padEnd(5,'0'))
}
