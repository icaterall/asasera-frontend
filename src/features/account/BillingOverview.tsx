import {useQuery,type UseQueryResult} from '@tanstack/react-query'
import {useTranslation} from 'react-i18next'
import {Link} from 'react-router-dom'
import {RefreshCw} from 'lucide-react'
import {Button} from '@/design'
import {teaching} from '@/lib/api'
import {billing,instructorAccount,type BillingCatalogue,type BillingPlanId} from './instructor-account-api'
import styles from './BillingPlans.module.css'

/** Read-only account destination, including returns from checkout and the portal.
 * Each section can fail independently: a catalogue outage must not hide money. */
export function BillingOverview({userId,catalogue,onManage,managing,error}:{
 userId:number;catalogue:UseQueryResult<BillingCatalogue>;onManage:()=>void;managing:boolean;error:string
}){
 const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),t=(a:string,e:string)=>ar?a:e
 const wallet=useQuery({queryKey:['instructor-wallet',userId],queryFn:()=>teaching.wallet(),staleTime:0,refetchInterval:30_000,retry:1})
 const usage=useQuery({queryKey:['instructor-account-overview',userId],queryFn:()=>instructorAccount.overview(),staleTime:0,retry:1})
 const purchases=useQuery({queryKey:['billing-purchases',userId],queryFn:({signal})=>billing.purchases(signal),staleTime:0,retry:1})
 const nf=new Intl.NumberFormat(ar?'ar':'en'),number=(value:number|undefined)=>value===undefined?'—':nf.format(value)
 const date=new Intl.DateTimeFormat(ar?'ar':'en',{year:'numeric',month:'short',day:'numeric'})
 const name=(plan:BillingPlanId)=>({day_pass:t('بطاقة يوم','Day pass'),monthly:t('الخطة الشهرية','Monthly plan'),yearly:t('الخطة السنوية','Yearly plan'),topup_small:t('شحنة صغيرة','Small top-up'),topup_medium:t('شحنة متوسطة','Medium top-up'),topup_large:t('شحنة كبيرة','Large top-up')})[plan]
 const money=(value:number,currency:string)=>new Intl.NumberFormat(ar?'ar':'en',{style:'currency',currency:currency.toUpperCase()}).format(value/100_000)
 const sources=[wallet,usage,purchases,catalogue],busy=sources.some(query=>query.isFetching)
 const subscription=catalogue.data?.subscription
 const workspace=usage.data?.workspace
 const stats=workspace?[
  [t('الأنشطة','Activities'),workspace.activities], [t('الأسئلة','Questions'),workspace.questions],
  [t('الحصص المباشرة','Live sessions'),workspace.liveSessions], [t('التكليفات','Assignments'),workspace.assignments],
  [t('المواد','Materials'),workspace.materials], [t('مشاركات المتعلّمين','Learner participations'),workspace.participations],
 ] as const:[]
 return <>
  <header className={styles.head}><div><h1>{t('الرصيد والاستخدام','Balance & usage')}</h1><p>{t('رصيدك الحالي، مشترياتك، واستخدامك للذكاء الاصطناعي في مكان واحد.','Your current balance, purchases, and AI usage in one place.')}</p></div>
   <Button variant="secondary" icon={<RefreshCw size={16}/>} disabled={busy} onClick={()=>{for(const query of sources)void query.refetch()}}>{busy?t('جارٍ التحديث…','Refreshing…'):t('تحديث','Refresh')}</Button>
  </header>
  <section className={styles.accountSection} aria-labelledby="billing-balance-title">
   <div className={styles.sectionHead}><h2 id="billing-balance-title">{t('رصيد الذكاء الاصطناعي','AI balance')}</h2><Link to="/teacher/billing?view=plans">{t('أضف رصيدًا','Add credit')}</Link></div>
   {wallet.isError&&<p className={styles.error} role="alert">{t('تعذّر تحديث الرصيد. قد تكون الأرقام المعروضة قديمة؛ اضغط تحديث للمحاولة مجددًا.','Balance could not refresh. Displayed figures may be outdated; use Refresh to try again.')}</p>}
   {wallet.isPending&&<p role="status">{t('جارٍ تحميل الرصيد…','Loading balance…')}</p>}
   <dl className={styles.balanceMetrics}>
    <div><dt>{t('متاح الآن','Available now')}</dt><dd>{number(wallet.data?.usableAiCredits)}</dd></div>
    <div><dt>{t('محجوز مؤقتًا','On hold')}</dt><dd>{number(wallet.data?.reservedAiCredits)}</dd></div>
    <div><dt>{t('الرصيد الكلي','Total balance')}</dt><dd>{number(wallet.data?.balanceAiCredits)}</dd></div>
   </dl>
   <p className={styles.hint}>{t('الرصيد المحجوز مخصّص لطلبات جارية أو قيد المراجعة. يُعاد الجزء غير المستخدم بعد التسوية.','Held balance covers requests in progress or under review. Unused credit returns after settlement.')}</p>
   {wallet.data&&wallet.data.usableAiCredits<wallet.data.spendableAiCredits&&<p className={styles.note}>{t('حدّ استخدام حسابك يقلّل الرصيد المتاح. تواصل مع الدعم للمساعدة.','Your account usage limit reduces the available balance. Contact support for help.')}</p>}
  </section>
  <section className={styles.accountSection} aria-labelledby="billing-plan-title">
   <div className={styles.sectionHead}><h2 id="billing-plan-title">{t('خطتك الحالية','Current plan')}</h2>{subscription&&<Button variant="secondary" loading={managing} onClick={onManage}>{t('إدارة الاشتراك','Manage plan')}</Button>}</div>
   {catalogue.isPending?<p role="status">{t('جارٍ تحميل الخطة…','Loading plan…')}</p>:catalogue.isError?<p className={styles.error} role="alert">{t('تعذّر تحديث الخطة. أعد التحديث.','Plan could not refresh. Please refresh.')}</p>:<>
    <p className={styles.planName}>{subscription?name(subscription.plan):t('الخطة المجانية','Free plan')}</p>
    <p className={styles.hint}>{subscription?t(`سارية حتى ${date.format(new Date(subscription.currentPeriodEnd))}${subscription.cancelAtPeriodEnd?' · لن تُجدّد':''}`,`Active until ${date.format(new Date(subscription.currentPeriodEnd))}${subscription.cancelAtPeriodEnd?' · will not renew':''}`):t('يمكنك شحن الرصيد دون اشتراك.','You can add credit without a subscription.')}</p>
   </>}
   {error&&<p className={styles.error} role="alert">{error}</p>}
  </section>
  <section className={styles.accountSection} aria-labelledby="billing-usage-title">
   <h2 id="billing-usage-title">{t('استخدام الرصيد','Balance usage')}</h2>
   {usage.isError&&<p className={styles.error} role="alert">{t('تعذّر تحديث الاستخدام والإحصاءات. أعد التحديث.','Usage and analytics could not refresh. Please refresh.')}</p>}
   {usage.isPending&&<p role="status">{t('جارٍ تحميل الاستخدام…','Loading usage…')}</p>}
   <dl className={styles.metrics}><div><dt>{t('آخر 30 يومًا','Last 30 days')}</dt><dd>{number(usage.data?.usage.last30DaysAiCredits)}</dd></div><div><dt>{t('منذ البداية','All time')}</dt><dd>{number(usage.data?.usage.allTimeAiCredits)}</dd></div></dl>
   <p className={styles.hint}>{t('صافي الرصيد المستخدم بعد التصحيحات؛ لا يشمل الحجز المؤقت.','Net balance used after corrections; temporary holds are excluded.')}</p>
  </section>
  <section className={styles.accountSection} aria-labelledby="billing-purchases-title">
   <h2 id="billing-purchases-title">{t('سجل المشتريات','Purchase history')}</h2>
   <p className={styles.hint}>{t('آخر المشتريات المسجّلة: المبلغ المدفوع والرصيد المضاف لكل عملية.','Recent recorded purchases: the amount paid and credit added for each purchase.')}</p>
   {purchases.isError&&<p className={styles.error} role="alert">{t('تعذّر تحديث المشتريات. أعد التحديث قبل محاولة الدفع مجددًا.','Purchases could not refresh. Refresh before trying to pay again.')}</p>}
   {purchases.isPending?<p role="status">{t('جارٍ تحميل المشتريات…','Loading purchases…')}</p>:purchases.data?.length?
    <ul className={styles.purchases}>{purchases.data.map((purchase,index)=><li key={`${purchase.createdAt}-${index}`}>
     <div><strong>{name(purchase.plan)}</strong><time dateTime={purchase.createdAt}>{date.format(new Date(purchase.createdAt))}</time></div>
     <dl><div><dt>{t('المدفوع','Paid')}</dt><dd><bdi>{money(purchase.paidMillicents,purchase.currency)}</bdi></dd></div><div><dt>{t('الرصيد المضاف','Credit added')}</dt><dd><bdi>+{number(purchase.aiCredits)}</bdi></dd></div></dl>
    </li>)}</ul>:!purchases.isError&&<p className={styles.hint}>{t('لا توجد مشتريات مسجّلة بعد. الرصيد المجاني ليس عملية شراء.','No recorded purchases yet. Free allowances are not purchases.')}</p>}
  </section>
  {workspace&&<section className={styles.accountSection} aria-labelledby="billing-teaching-title"><h2 id="billing-teaching-title">{t('عملك التعليمي','Your teaching')}</h2><dl className={styles.metrics}>{stats.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{number(value)}</dd></div>)}</dl><p className={styles.hint}>{t('المشاركات ليست عدد أشخاص فريدين؛ قد يشارك المتعلّم أكثر من مرة.','Participations are not unique people; a learner may participate more than once.')}</p></section>}
 </>
}
