import {useEffect,useState} from 'react'
import {useQuery,useQueryClient} from '@tanstack/react-query'
import {useTranslation} from 'react-i18next'
import {Link} from 'react-router-dom'
import {ArrowUpRight,Check,Sparkles,Wand2} from 'lucide-react'
import {LoadingIndicator} from '@/design'
import {useAuth} from '@/hooks/useAuth'
import {billing,type BillingPlanId,type CheckoutReceipt as Receipt} from './instructor-account-api'
import styles from './CheckoutReceipt.module.css'

/**
 * What a teacher sees in the seconds after paying.
 *
 * Two facts matter here and nothing else does: how much was added, and what
 * the balance is now. Everything on this card is arranged around those two
 * numbers — the old total, the addition, the new total — because the question
 * a person actually has after a payment is "did it work, and what have I got
 * now", and a page that answers it in small print answers it badly.
 *
 * The card also has to survive the gap. Stripe returns the browser the moment
 * the card clears, which is routinely BEFORE the webhook that credits the
 * wallet arrives. So the waiting state is a real, designed state rather than
 * an empty box: it says the payment is in, names what is still happening, and
 * never claims a number it does not yet have.
 */
export function CheckoutReceipt({session,onDone,onRecorded,compact=false}:{session:string;onDone:()=>void;onRecorded?:(receipt:Extract<Receipt,{state:'recorded'}>)=>void;compact?:boolean}){
 const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),t=(a:string,e:string)=>ar?a:e
 const {user}=useAuth()
 const [waited,setWaited]=useState(0)
 const client=useQueryClient()
 const query=useQuery({
  queryKey:['checkout-receipt',user?.id,session],
  queryFn:({signal})=>billing.receipt(session,signal),
  enabled:user?.role==='teacher',
  retry:1,
  // Polls only while the webhook is outstanding, and gives up after half a
  // minute: an event that never arrives is an operator problem, not something
  // to keep asking the API about for the rest of the visit.
  refetchInterval:query=>query.state.data?.state==='recorded'||query.state.status==='error'||waited>=30?false:2_000,
 })
 useEffect(()=>{if(query.data?.state==='recorded'||query.isError||waited>=30)return;const timer=setTimeout(()=>setWaited(30),30_000);return()=>clearTimeout(timer)},[waited,query.data?.state,query.isError])

 /*
  * The balance elsewhere is refreshed HERE, when the purchase is confirmed —
  * not when this page opened. Stripe returns the browser before the webhook
  * lands, so an invalidation on mount re-reads the OLD balance and the header
  * chip then sits on it until its own thirty-second poll comes round. A
  * teacher who has just paid and sees their previous balance concludes the
  * payment failed.
  */
 const recordedState=query.data?.state
 useEffect(()=>{
  if(recordedState!=='recorded')return
  void client.invalidateQueries({queryKey:['instructor-wallet']})
  void client.invalidateQueries({queryKey:['instructor-account-overview']})
  void client.invalidateQueries({queryKey:['billing-plans']})
  void client.invalidateQueries({queryKey:['billing-purchases']})
 },[recordedState,client])
 useEffect(()=>{if(query.data?.state==='recorded')onRecorded?.(query.data)},[query.data,onRecorded])

 const data=query.data
 const nf=new Intl.NumberFormat(ar?'ar':'en')
 const money=(millicents:number,currency:string)=>new Intl.NumberFormat(ar?'ar':'en',{style:'currency',currency:currency.toUpperCase(),maximumFractionDigits:2}).format(millicents/100_000)
 const planName=(plan:BillingPlanId)=>({day_pass:t('بطاقة يوم','Day pass'),monthly:t('الخطة الشهرية','Monthly plan'),yearly:t('الخطة السنوية','Yearly plan'),
  topup_small:t('شحنة رصيد','Credit top-up'),topup_medium:t('شحنة رصيد','Credit top-up'),topup_large:t('شحنة رصيد','Credit top-up')})[plan]
 const quality=(value:'low'|'medium'|'high')=>value==='high'?t('عالية','High'):value==='medium'?t('متوسطة','Medium'):t('منخفضة','Low')

 const recorded=data?.state==='recorded'?data:null
 const before=recorded?recorded.balanceAiCredits-recorded.addedAiCredits:null
 if(compact&&recorded)return null

 // Payment verification must never lock access to the existing account. The
 // dashboard remains usable while this independent notice waits or retries.
 if(compact&&!recorded)return <section className={styles.inline} aria-live="polite">
  <div><h2>{query.isError?t('تعذّر التحقق من الدفع','Payment confirmation unavailable'):waited>=30?t('تأخر تأكيد الدفع','Payment confirmation delayed'):t('جارٍ التحقق من الدفع','Confirming your payment')}</h2>
   <p>{waited>=30||query.isError?t('لم تُسجّل إضافة الرصيد بعد. لا تدفع مرة أخرى. يمكنك مراجعة رصيدك ومشترياتك أدناه أثناء التحقق.','The credit addition is not recorded yet. Don’t pay again. You can review your balance and purchases below while we check.'):t('ننتظر تسجيل عملية الدفع. رصيدك الحالي ومشترياتك متاحان أدناه.','We’re waiting for the payment to be recorded. Your current balance and purchases remain available below.')}</p>
   <details><summary>{t('مرجع الدفع','Payment reference')}</summary><bdi>{session}</bdi></details>
  </div>
  <div className={styles.actions}>
   {(waited>=30||query.isError)&&<button type="button" className={styles.secondary} disabled={query.isFetching} onClick={()=>{setWaited(0);void query.refetch()}}>{t('تحقق مجددًا','Check again')}</button>}
   <Link to="/contact" className={styles.secondary}>{t('الدعم','Support')}</Link>
   <button type="button" className={styles.secondary} onClick={onDone}>{t('إخفاء التنبيه','Dismiss notice')}</button>
  </div>
 </section>

 return <section className={styles.receipt} aria-live="polite">
  {recorded&&<div className={styles.badge}><Check size={22} aria-hidden="true"/></div>}
  <h2>{recorded?t('رصيدك جاهز','Your credit is ready'):query.isError?t('تعذّر التحقق من الدفع','Payment confirmation unavailable'):t('جارٍ التحقق من الدفع','Confirming your payment')}</h2>
  <p className={styles.lead}>
   {recorded?t(`${planName(recorded.plan)} · ${money(recorded.paidMillicents,recorded.currency)}`,`${planName(recorded.plan)} · ${money(recorded.paidMillicents,recorded.currency)}`)
    :t('ننتظر تسجيل عملية الدفع قبل تحديث رصيدك.','We’re waiting for the payment to be recorded before updating your balance.')}
  </p>

  {/* Old → added → new. The arithmetic a person does in their head anyway,
      done for them, so nothing has to be taken on trust. */}
  {recorded?<div className={styles.ledger}>
   <div><dt>{t('كان لديك','You had')}</dt><dd>{nf.format(before ?? 0)}</dd></div>
   <div className={styles.added}><dt>{t('أُضيف','Added')}</dt><dd>+{nf.format(recorded.addedAiCredits)}</dd></div>
   <div className={styles.total}><dt>{t('رصيدك الآن','Your balance now')}</dt><dd>{nf.format(recorded.balanceAiCredits)}</dd></div>
  </div>:!query.isError&&waited<30&&<div className={styles.waiting}><LoadingIndicator label={t('لحظات…','One moment…')}/></div>}

  {recorded&&<p className={styles.enough}>
   <Sparkles size={17} aria-hidden="true"/>
   {t(`يكفي لنحو ${nf.format(recorded.addedActivities)} نشاطًا مولّدًا`,`Enough for about ${nf.format(recorded.addedActivities)} generated activities`)}
  </p>}

  {recorded&&recorded.subscription&&<ul className={styles.unlocked}>
   <li><Check size={15} aria-hidden="true"/>{t(`جودة صور حتى ${quality(recorded.imageQualityCeiling)}`,`Image quality up to ${quality(recorded.imageQualityCeiling)}`)}</li>
   <li><Check size={15} aria-hidden="true"/>{t(`${recorded.maxOpenJobs} طلبات توليد في وقت واحد`,`${recorded.maxOpenJobs} generations at once`)}</li>
   <li><Check size={15} aria-hidden="true"/>{t(`سارية حتى ${new Date(recorded.subscription.currentPeriodEnd).toLocaleDateString(ar?'ar':'en')}`,`Active until ${new Date(recorded.subscription.currentPeriodEnd).toLocaleDateString(ar?'ar':'en')}`)}</li>
  </ul>}

  {!recorded&&(waited>=30||query.isError)&&<div className={styles.slow} role="status">
   <p>{t('لم نتمكن من تأكيد إضافة الرصيد بعد. لا تدفع مرة أخرى؛ أعد التحقق أو تواصل مع الدعم مع مرجع الدفع.','We haven’t confirmed the credit yet. Don’t pay again; check again or contact support with your payment reference.')}</p>
   <button type="button" className={styles.secondary} disabled={query.isFetching} onClick={()=>{setWaited(0);void query.refetch()}}>{t('تحقق مجددًا','Check again')}</button>
   <Link to="/contact">{t('الدعم','Support')}</Link>
  </div>}

  <div className={styles.actions}>
   {/* A link, not a button wrapping one: an anchor inside a button is invalid
       HTML, and the keyboard and screen-reader behaviour of the pair is
       undefined. This is navigation, so it is an anchor that looks the part. */}
   <Link to="/teacher/activities/new" className={styles.primary} aria-disabled={!recorded}
     onClick={event=>{if(!recorded)event.preventDefault()}}>
    <Wand2 size={18} aria-hidden="true"/>{t('ابدأ نشاطًا جديدًا','Start a new activity')}
   </Link>
   <button type="button" className={styles.secondary} onClick={onDone}>
    {t('الرصيد والاستخدام','Balance & usage')}<ArrowUpRight size={15} aria-hidden="true"/>
   </button>
  </div>
 </section>
}
export type {Receipt}
