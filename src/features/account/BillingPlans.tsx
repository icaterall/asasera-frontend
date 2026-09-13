import {useEffect,useState} from 'react'
import {useQuery} from '@tanstack/react-query'
import {useTranslation} from 'react-i18next'
import {useSearchParams} from 'react-router-dom'
import {Check,CreditCard,Sparkles} from 'lucide-react'
import {Button,FailureState,LoadingState} from '@/design'
import {useAuth} from '@/hooks/useAuth'
import {billing,type BillingPlan,type BillingPlanId} from './instructor-account-api'
import {CheckoutReceipt} from './CheckoutReceipt'
import styles from './BillingPlans.module.css'

/**
 * What a teacher is being asked to buy.
 *
 * Priced against what they actually get, in the same unit the editor quotes:
 * a plan card says how many AI Credits it carries, not "unlimited" and not a
 * feature list that quietly runs out. Every figure comes from the server,
 * which derives it from one margin formula — nothing here computes a price.
 *
 * The top-ups are deliberately below the subscriptions on the page. A teacher
 * who does not yet know how much they use should land on a plan; a teacher who
 * has run out already knows what they are looking for.
 */
export default function BillingPlans(){
 const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),{user}=useAuth()
 const label=(a:string,e:string)=>ar?a:e
 const [params,setParams]=useSearchParams()
 const [busy,setBusy]=useState<BillingPlanId|'portal'|null>(null),[error,setError]=useState('')
 const [settling,setSettling]=useState(0)
 const ready=user?.role==='teacher'
 const checkout=params.get('checkout'),session=params.get('session')
 const query=useQuery({queryKey:['billing-plans',user?.id],queryFn:({signal})=>billing.plans(signal),retry:1,enabled:ready,
  // Stripe redirects the browser back before its webhook necessarily lands, so
  // the plan a teacher just bought may not be recorded for another second or
  // two. Poll briefly rather than showing them the old state and letting them
  // wonder whether the payment worked.
  refetchInterval:checkout==='done'&&settling>0?2_000:false})

 /*
  * WAITS FOR THE SESSION. Returning from Stripe is a full page load, so the
  * access token is gone and `AuthProvider` is still recovering it from the
  * refresh cookie. `refetch()` ignores `enabled`, so firing here on mount sent
  * an unauthenticated request, and a 401 whose replay also failed would have
  * signed the teacher out in the same second they paid. Gating on `ready`
  * means nothing is requested before there is a session to request it with.
  */
 useEffect(()=>{
  if(checkout!=='done'||!ready)return
  setSettling(1)
  // Stops polling either way: a webhook that never arrives is an operator
  // problem, not something to hammer the API about for the rest of the visit.
  const stop=setTimeout(()=>setSettling(0),20_000)
  const clear=setTimeout(()=>{params.delete('checkout');setParams(params,{replace:true})},20_000)
  return()=>{clearTimeout(stop);clearTimeout(clear)}
 },[checkout,ready])

 /* The wait ends the moment the purchase shows up. */
 useEffect(()=>{
  if(settling&&query.data?.subscription)setSettling(0)
 },[query.data?.subscription,settling])

 if(user?.role!=='teacher')return null
 async function start(plan:BillingPlanId){
  if(busy)return
  setBusy(plan);setError('')
  try{const {url}=await billing.checkout(plan);window.location.assign(url)}
  catch{setError(label('تعذّر بدء الدفع. حاول مرة أخرى.','Checkout could not start. Try again.'));setBusy(null)}
 }
 async function manage(){
  if(busy)return
  setBusy('portal');setError('')
  try{const {url}=await billing.portal();window.location.assign(url)}
  catch{setError(label('تعذّر فتح إدارة الاشتراك.','Billing settings could not open.'));setBusy(null)}
 }

 const money=(millicents:number,currency:string)=>new Intl.NumberFormat(ar?'ar':'en',{style:'currency',currency:currency.toUpperCase(),maximumFractionDigits:2}).format(millicents/100_000)
 const credits=(value:number)=>new Intl.NumberFormat(ar?'ar':'en',{notation:value>=100_000?'compact':'standard',maximumFractionDigits:1}).format(value)
 const name=(id:BillingPlanId)=>({
  day_pass:label('بطاقة يوم','Day pass'),monthly:label('شهري','Monthly'),yearly:label('سنوي','Yearly'),
  topup_small:label('شحنة صغيرة','Small top-up'),topup_medium:label('شحنة متوسطة','Medium top-up'),topup_large:label('شحنة كبيرة','Large top-up'),
 })[id]
 const per=(plan:BillingPlan)=>plan.period==='day'?label('ليوم واحد','for one day'):plan.period==='month'?label('شهريًا','per month'):plan.period==='year'?label('سنويًا','per year'):label('دفعة واحدة','one payment')
 const quality=(value:BillingPlan['imageQualityCeiling'])=>value==='high'?label('عالية','High'):value==='medium'?label('متوسطة','Medium'):label('منخفضة','Low')

 function dismiss(){params.delete('checkout');params.delete('session');setParams(params,{replace:true})}
 if(checkout==='done'&&session)return <section className={`asas ${styles.billing}`} dir={ar?'rtl':'ltr'}>
  <CheckoutReceipt session={session} onDone={dismiss}/>
 </section>

 if(query.isPending)return <LoadingState label={label('جارٍ تحميل الخطط','Loading plans')} variant="form" rows={3}/>
 if(query.error||!query.data)return <FailureState title={label('تعذّر تحميل الخطط','Plans could not load')} actions={<Button onClick={()=>void query.refetch()}>{label('إعادة المحاولة','Try again')}</Button>}/>

 const {plans,subscription,configured,free}=query.data
 const subscriptions=plans.filter(plan=>!plan.topUp),topUps=plans.filter(plan=>plan.topUp)

 return <section className={`asas ${styles.billing}`} dir={ar?'rtl':'ltr'}>
  <header className={styles.head}>
   <div>
    <h1>{label('الرصيد والخطط','Credit and plans')}</h1>
    <p>{label('ادفع مقابل ما تستخدمه فقط. كل خطة تحمل رصيد ذكاء اصطناعي، وتبقى كتابة الأسئلة يدويًا والجلسات المباشرة مجانية دائمًا.','Pay only for what you use. Every plan carries AI Credits — writing questions by hand and running live sessions stay free.')}</p>
   </div>
   {subscription&&<Button variant="secondary" icon={<CreditCard size={16}/>} loading={busy==='portal'} onClick={()=>void manage()}>{label('إدارة الاشتراك','Manage plan')}</Button>}
  </header>

  {checkout==='done'&&<p className={styles.done} role="status"><Check size={18} aria-hidden="true"/>
   {label('تم الدفع. سيظهر رصيدك خلال لحظات.','Payment received. Your credit will appear in a moment.')}</p>}
  {checkout==='cancelled'&&<p className={styles.note} role="status">{label('أُلغيت عملية الدفع. لم يُخصم شيء.','Checkout was cancelled. Nothing was charged.')}</p>}
  {!configured&&<p className={styles.note} role="status">{label('الدفع غير مُفعّل بعد. رصيدك التجريبي كما هو.','Payment is not enabled yet. Your trial credit is unaffected.')}</p>}
  {error&&<p className={styles.error} role="alert">{error}</p>}

  {subscription&&<p className={styles.current} role="status">
   {label(`خطتك الحالية: ${name(subscription.plan)} — حتى ${new Date(subscription.currentPeriodEnd).toLocaleDateString(ar?'ar':'en')}`,`Your plan: ${name(subscription.plan)} — until ${new Date(subscription.currentPeriodEnd).toLocaleDateString(ar?'ar':'en')}`)}
   {subscription.cancelAtPeriodEnd&&` · ${label('لن يُجدَّد','will not renew')}`}
  </p>}

  {free.activities>0&&<p className={styles.note} role="status">
   <Sparkles size={16} aria-hidden="true"/>
   {label(`كل شهر تحصل مجانًا على ما يكفي لنحو ${new Intl.NumberFormat('ar').format(free.activities)} نشاطًا. الخطط أدناه لمن يحتاج أكثر.`,`Every month you get enough free for about ${new Intl.NumberFormat('en').format(free.activities)} activities. The plans below are for when you need more.`)}
  </p>}

  <ul className={styles.plans}>{subscriptions.map(plan=><li key={plan.id} data-current={subscription?.plan===plan.id}>
   <h2>{name(plan.id)}</h2>
   <p className={styles.price}><strong>{money(plan.priceMillicents,plan.currency)}</strong><span>{per(plan)}</span></p>
   <ul className={styles.features}>
    <li><Sparkles size={15} aria-hidden="true"/>{label(`نحو ${new Intl.NumberFormat('ar').format(plan.activities)} نشاطًا مولّدًا`,`About ${new Intl.NumberFormat('en').format(plan.activities)} generated activities`)}</li>
    <li><Check size={15} aria-hidden="true"/>{label(`جودة صور حتى ${quality(plan.imageQualityCeiling)}`,`Image quality up to ${quality(plan.imageQualityCeiling)}`)}</li>
    <li><Check size={15} aria-hidden="true"/>{label(`${plan.maxOpenJobs} طلبات توليد في وقت واحد`,`${plan.maxOpenJobs} generations at once`)}</li>
    {plan.period==='year'&&<li><Check size={15} aria-hidden="true"/>{label('رصيد السنة كاملًا من أول يوم','The whole year’s credit from day one')}</li>}
   </ul>
   <Button variant={plan.period==='year'?'primary':'secondary'} loading={busy===plan.id} disabled={!plan.available||!!busy||subscription?.plan===plan.id}
    onClick={()=>void start(plan.id)}>{subscription?.plan===plan.id?label('خطتك الحالية','Your plan'):label('اختر','Choose')}</Button>
  </li>)}</ul>

  <h2 className={styles.topUpHeading}>{label('نفد رصيدك؟','Run out early?')}</h2>
  <p className={styles.topUpLead}>{label('أضف رصيدًا دون تغيير خطتك. لا ينتهي الرصيد المشترى بتاريخ.','Add credit without changing your plan. Purchased credit does not expire.')}</p>
  <ul className={styles.topUps}>{topUps.map(plan=><li key={plan.id}>
   <div><strong>{money(plan.priceMillicents,plan.currency)}</strong><span>{label(`${credits(plan.includedAiCredits)} رصيد`,`${credits(plan.includedAiCredits)} credits`)}</span></div>
   <Button variant="quiet" loading={busy===plan.id} disabled={!plan.available||!!busy} onClick={()=>void start(plan.id)}>{label('أضف','Add')}</Button>
  </li>)}</ul>
 </section>
}
