import {useEffect,useId,useRef,useState} from 'react'
import {createPortal} from 'react-dom'
import {useQuery} from '@tanstack/react-query'
import {useTranslation} from 'react-i18next'
import {Link,useLocation} from 'react-router-dom'
import {ArrowUpRight,ChevronDown,RefreshCw,Sparkles,X,Zap} from 'lucide-react'
import {useAuth} from '@/hooks/useAuth'
import {teaching,type PublicUser} from '@/lib/api'
import {instructorAccount} from './instructor-account-api'
import styles from './InstructorBalance.module.css'

type Wallet=Awaited<ReturnType<typeof teaching.wallet>>
export function InstructorBalance({compact=false}:{compact?:boolean}){
 const {user}=useAuth()
 return user?.role==='teacher'?<Balance key={user.id} user={user} compact={compact}/>:null
}
function Balance({user,compact}:{user:PublicUser;compact:boolean}){
 const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),location=useLocation(),[open,setOpen]=useState(false)
 const wallet=useQuery({queryKey:['instructor-wallet',user.id],queryFn:()=>teaching.wallet(),staleTime:15_000,refetchInterval:open?10_000:30_000,refetchOnWindowFocus:'always',retry:1})
 const nf=new Intl.NumberFormat(ar?'ar':'en',{notation:compact?'compact':'standard',maximumFractionDigits:compact?1:0})
 useEffect(()=>setOpen(false),[location.key])
 const value=wallet.data?.usableAiCredits
 /*
  * Five activities' worth. Below this a teacher is one generation away from
  * being stopped mid-lesson-prep, which is the moment to say so — earlier is
  * nagging, later is too late.
  */
 const low=value!==undefined&&value<LOW_BALANCE_CREDITS
 const unavailable=wallet.isError,caption=unavailable?(ar?'تعذّر التحديث':'Refresh needed'):value===undefined?(ar?'تحميل الرصيد':'Loading balance'):ar?'رصيد':'Balance'
 return <>
  <button type="button" className={`asas ${styles.trigger}`} data-compact={compact} data-empty={value===0} data-low={low} aria-haspopup="dialog" aria-expanded={open}
   aria-label={unavailable?(ar?'الرصيد يحتاج إلى تحديث. فتح الحساب والاستخدام':'Balance needs refresh. Open account and usage'):value===undefined?(ar?'فتح الحساب ورصيد الذكاء الاصطناعي':'Open account and AI balance'):`${ar?'الرصيد المتاح':'Available balance'}: ${new Intl.NumberFormat(ar?'ar':'en').format(value)}. ${ar?'فتح الحساب والاستخدام':'Open account and usage'}`}
   onClick={()=>{setOpen(true);void wallet.refetch()}}>
   <Sparkles size={compact?16:18} aria-hidden="true"/>
   <span><strong>{value===undefined?'—':nf.format(value)}</strong><span>{low?(ar?'أضف رصيدًا':'Add credit'):caption}</span></span>
   {!compact&&<ChevronDown size={14} aria-hidden="true"/>}
  </button>
  {open&&<AccountDialog user={user} wallet={wallet.data} walletFailed={unavailable} walletBusy={wallet.isFetching} refreshWallet={()=>void wallet.refetch()} onClose={()=>setOpen(false)}/>}
 </>
}
/** Five activities' worth of credit, at the pessimistic rate the plans quote. */
export const LOW_BALANCE_CREDITS=10_000

function AccountDialog({user,wallet,walletFailed,walletBusy,refreshWallet,onClose}:{user:PublicUser;wallet:Wallet|undefined;walletFailed:boolean;walletBusy:boolean;refreshWallet:()=>void;onClose:()=>void}){
 const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),t=(a:string,e:string)=>ar?a:e
 const dialog=useRef<HTMLDialogElement>(null),id=useId()
 const overview=useQuery({queryKey:['instructor-account-overview',user.id],queryFn:()=>instructorAccount.overview(),staleTime:0,refetchInterval:30_000,retry:1})
 const nf=new Intl.NumberFormat(ar?'ar':'en'),number=(value:number|undefined)=>value===undefined?'—':nf.format(value)
 const date=new Intl.DateTimeFormat(ar?'ar':'en',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})
 useEffect(()=>{
  const previous=document.activeElement as HTMLElement|null,element=dialog.current,overflow=document.body.style.overflow
  document.body.style.overflow='hidden';element?.showModal();element?.querySelector<HTMLButtonElement>('button')?.focus()
  return()=>{element?.close();document.body.style.overflow=overflow;previous?.focus()}
 },[])
 const data=overview.data,busy=walletBusy||overview.isFetching
 const activityStats=data?[
  [t('الأنشطة','Activities'),data.workspace.activities,t(`${number(data.workspace.questions)} سؤال · ${number(data.workspace.materials)} مادة`,`${number(data.workspace.questions)} questions · ${number(data.workspace.materials)} materials`)],
  [t('الحصص المباشرة','Live sessions'),data.workspace.liveSessions,t('حصص استضفتها','Sessions you hosted')],
  [t('التكليفات','Assignments'),data.workspace.assignments,t('واجبات ودراسة ذاتية','Homework & self-study')],
  [t('مشاركات المتعلّمين','Learner participations'),data.workspace.participations,t('الحصص المباشرة والواجبات','Live sessions & homework')],
 ] as const:[]
 return createPortal(<dialog ref={dialog} className={`asas ${styles.dialog}`} dir={ar?'rtl':'ltr'} aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`} onCancel={event=>{event.preventDefault();onClose()}} onKeyDown={event=>{
  if(event.key!=='Tab')return
  const items=Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled),a[href]')),first=items[0],last=items.at(-1)
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}
 }}>
  <header className={styles.header}><div><h2 id={`${id}-title`}>{t('حسابك واستخدامك','Account & usage')}</h2><p id={`${id}-description`}>{t('رصيدك وعملك التعليمي، في مكان واحد.','Your AI balance and teaching activity, together.')}</p></div><button className={styles.iconButton} type="button" aria-label={t('إغلاق الحساب والاستخدام','Close account and usage')} onClick={onClose}><X size={22}/></button></header>
  <div className={styles.body}>
   <div className={styles.identity}><div><strong dir="auto">{user.name||t('حساب المعلّم','Instructor account')}</strong><bdi>{user.email}</bdi></div><span data-verified={user.emailVerified}>{user.emailVerified?t('بريد موثّق','Email verified'):t('البريد غير موثّق','Email not verified')}</span></div>
   <section className={styles.balance} aria-labelledby={`${id}-balance`}><h3 id={`${id}-balance`}><Sparkles size={20} aria-hidden="true"/>{t('رصيد الذكاء الاصطناعي','AI balance')}</h3>
    {walletFailed&&<p className={styles.notice} role="alert">{t('تعذّر تحديث الرصيد. قد تكون الأرقام المعروضة قديمة. أعد التحديث.','Balance could not refresh. Any displayed figures may be out of date. Please refresh.')}</p>}
    {!wallet&&!walletFailed&&<p role="status">{t('جارٍ تحميل الرصيد…','Loading balance…')}</p>}
    <dl className={styles.balances}>
     <div className={styles.available}><dt>{t('متاح الآن','Available now')}</dt><dd>{number(wallet?.usableAiCredits)}</dd></div>
     <div><dt>{t('محجوز مؤقتًا','On hold')}</dt><dd>{number(wallet?.reservedAiCredits)}</dd></div>
     <div><dt>{t('الرصيد الكلي','Total balance')}</dt><dd>{number(wallet?.balanceAiCredits)}</dd></div>
    </dl>
    {wallet&&wallet.reservedAiCredits>0&&<p className={styles.hint}>{t('المحجوز مخصّص لطلبات جارية أو قيد المراجعة. يُعاد الجزء غير المستخدم بعد التسوية.','Held balance covers requests in progress or under review. The unused amount returns after settlement.')}</p>}
    {wallet&&wallet.usableAiCredits<wallet.spendableAiCredits&&<p className={styles.notice}>{t('المتاح أقل من الرصيد بسبب حدّ استخدام الذكاء الاصطناعي للحساب. تواصل مع الدعم إذا احتجت للمساعدة.','Your account’s AI usage limit reduces the available amount below its balance. Contact support if you need help.')}</p>}
    {wallet?.usableAiCredits===0&&<p className={styles.notice}>{!user.emailVerified?t('وثّق بريدك للحصول على رصيد البداية المؤهّل. يمكنك مواصلة إنشاء الأنشطة يدويًا.','Verify your email to receive the eligible starter allowance. You can keep creating activities manually.'):wallet.reservedAiCredits>0?t('انتظر تسوية الطلبات المحجوزة أو تواصل مع الدعم.','Wait for held requests to settle, or contact support.'):t('لا يوجد رصيد متاح الآن. تواصل مع الدعم؛ الإنشاء اليدوي ما زال متاحًا.','No balance is available now. Contact support; manual creation is still available.')}</p>}
    <p className={styles.hint}>{t('رصيد أساسيرا مخصّص لخدمات الذكاء الاصطناعي (AI Credits). يظهر تقدير تكلفة كل طلب قبل التوليد.','Your Asasera balance covers AI services (AI Credits). Each request shows a cost estimate before generation.')}</p>
    {/* Always here, not only when the balance is low: a teacher deciding
        whether to build ten activities this week needs to know the option
        exists before they run out, not after. */}
    <Link className={styles.upgrade} to="/teacher/billing?view=plans" onClick={onClose}>
     <Zap size={18} aria-hidden="true"/>
     <span><strong>{t('ارفع خطتك أو أضف رصيدًا','Upgrade or add credit')}</strong>
      <small>{t('من ٤ دولارات شهريًا · وكل شهر رصيد مجاني','From $4 a month · plus free credit every month')}</small></span>
     <ArrowUpRight size={16} aria-hidden="true"/>
    </Link>
   </section>
   {overview.isError&&<p className={styles.notice} role="alert">{t('تعذّر تحديث الاستخدام والإحصاءات. أعد التحديث للمحاولة مجددًا.','Usage and analytics could not refresh. Refresh to try again.')}</p>}
   {overview.isPending?<p role="status">{t('جارٍ تحميل الاستخدام والإحصاءات…','Loading usage and analytics…')}</p>:data&&<>
    <section className={styles.section} aria-labelledby={`${id}-usage`}><h3 id={`${id}-usage`}>{t('استخدام الرصيد','Balance usage')}</h3><dl className={styles.usage}><div><dt>{t('آخر 30 يومًا','Last 30 days')}</dt><dd>{number(data.usage.last30DaysAiCredits)}</dd></div><div><dt>{t('منذ البداية','All time')}</dt><dd>{number(data.usage.allTimeAiCredits)}</dd></div></dl><p className={styles.hint}>{t('صافي الرصيد المستخدم بعد التصحيحات؛ لا يشمل الحجز المؤقت.','Net balance used after corrections; temporary holds are excluded.')}</p></section>
    <section className={styles.section} aria-labelledby={`${id}-workspace`}><div className={styles.sectionTitle}><h3 id={`${id}-workspace`}>{t('عملك التعليمي','Your teaching')}</h3><span>{t('منذ البداية','All time')}</span></div><dl className={styles.stats}>{activityStats.map(([label,value,hint])=><div key={label}><dt>{label}</dt><dd>{number(value)}</dd><small>{hint}</small></div>)}</dl><p className={styles.hint}>{t('المشاركات ليست عدد أشخاص فريدين؛ قد يشارك المتعلّم أكثر من مرة.','Participations are not unique people; a learner may participate more than once.')}</p></section>
    <section className={styles.section} aria-labelledby={`${id}-recent`}><h3 id={`${id}-recent`}>{t('آخر حركات الرصيد','Recent balance activity')}</h3>{data.recent.length?<ul className={styles.history}>{data.recent.map(entry=>{const amount=entry.kind==='settle'?-entry.amountAiCredits:entry.amountAiCredits;return <li key={entry.id}><div><strong>{entry.kind==='settle'?t('استخدام الذكاء الاصطناعي','AI usage'):entry.kind==='grant'?t('رصيد مضاف','Balance added'):entry.kind==='reversal'?t('تصحيح الرصيد','Balance correction'):t('تعديل الرصيد','Balance adjustment')}</strong><time dateTime={entry.createdAt}>{date.format(new Date(entry.createdAt))}</time></div><bdi data-positive={amount>0}>{amount>0?'+':''}{number(amount)}</bdi></li>})}</ul>:<p className={styles.hint}>{t('لا توجد حركات رصيد بعد. ستظهر هنا الإضافات والاستخدام.','No balance activity yet. Grants and usage will appear here.')}</p>}</section>
   </>}
  </div>
  <footer className={styles.footer}><button type="button" className={styles.refresh} disabled={busy} onClick={()=>{refreshWallet();void overview.refetch()}}><RefreshCw size={16} aria-hidden="true"/>{busy?t('تحديث…','Refreshing…'):t('تحديث','Refresh')}</button><nav aria-label={t('روابط الحساب','Account links')}><Link to="/contact" onClick={onClose}>{t('الدعم','Support')}</Link><Link to="/account" onClick={onClose}>{t('إعدادات الحساب','Account settings')}<ArrowUpRight size={16} aria-hidden="true"/></Link></nav></footer>
 </dialog>,document.body)
}
