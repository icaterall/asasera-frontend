import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, History, Wallet } from 'lucide-react'
import { Button, FailureState, LoadingState, Select } from '@/design'
import { useAuth } from '@/hooks/useAuth'
import { ApiError } from '@/lib/api'
import { accountRoleLabel } from '@/lib/accountRole'
import { administration, creditMillicents, creditUsd, type AdminUser, type Adjustment } from './api'
import { statusLabel } from './AdminUsers'
import styles from './Admin.module.css'

export default function AdminUserDetail() {
  const {id=''}=useParams(), {user:actor}=useAuth(), {i18n}=useTranslation(), ar=i18n.language.startsWith('ar'), t=(a:string,e:string)=>ar?a:e
  const user=useQuery({queryKey:['admin-user',actor?.id,id],queryFn:({signal})=>administration.user(id,signal),retry:1})
  const history=useInfiniteQuery({queryKey:['admin-credit-history',actor?.id,id],queryFn:({pageParam})=>administration.history(id,pageParam),initialPageParam:undefined as number|undefined,
    getNextPageParam:page=>page.nextBefore??undefined,retry:1,enabled:!!user.data && user.data.role==='teacher'})
  const date=(value:string|null)=>value?new Date(value).toLocaleString(i18n.language):t('لم يسجل الدخول بعد','Not signed in yet')
  return <><Link className={styles.back} to="/admin/users"><ArrowLeft size={18} aria-hidden="true"/>{t('كل المستخدمين','All users')}</Link>
    {user.isPending?<LoadingState rows={5}/>:user.error?<FailureState title={t('تعذّر تحميل الحساب','Account couldn’t load')} actions={<Button onClick={()=>void user.refetch()}>{t('إعادة المحاولة','Try again')}</Button>}/>:<>
      <div className={styles.pageHeading}><div><h1 dir="auto">{user.data.name||t('حساب المستخدم','User account')}</h1><p dir="ltr">{user.data.email||t('بدون بريد','No email')}</p></div><span className={styles.role} data-role={user.data.role}>{accountRoleLabel(user.data.role,i18n.language)}</span></div>
      <dl className={styles.accountFacts}><div><dt>{t('حالة الحساب','Account status')}</dt><dd>{statusLabel(user.data.status,ar)}</dd></div><div><dt>{t('البريد الإلكتروني','Email')}</dt><dd>{user.data.emailVerified?t('تم التحقق','Verified'):t('غير موثّق','Unverified')}</dd></div><div><dt>{t('تاريخ التسجيل','Joined')}</dt><dd>{date(user.data.createdAt)}</dd></div><div><dt>{t('آخر دخول','Last sign-in')}</dt><dd>{date(user.data.lastLoginAt)}</dd></div></dl>
      {user.data.role==='teacher'?<>
        <section className={styles.creditSummary} aria-labelledby="credit-heading"><h2 id="credit-heading"><Wallet size={24} aria-hidden="true"/>{t('رصيد الذكاء الاصطناعي','AI credit')}</h2>
          <dl><div><dt>{t('متاح للاستخدام','Available to spend')}</dt><dd>{creditUsd(user.data.spendableMillicents,i18n.language)}</dd></div><div><dt>{t('محجوز للمهام الجارية','Reserved for running jobs')}</dt><dd>{creditUsd(user.data.reservedMillicents,i18n.language)}</dd></div><div><dt>{t('إجمالي الرصيد','Total balance')}</dt><dd>{creditUsd(user.data.balanceMillicents,i18n.language)}</dd></div></dl>
          <p>{user.data.welcomeGrantClaimed?t('تم استلام الرصيد الترحيبي البالغ 0.50 دولار.','The $0.50 welcome credit has been claimed.'):t('لم يُستلم الرصيد الترحيبي بعد. يمكن للمعلّم الموثّق استلام 0.50 دولار مرة واحدة.','Welcome credit has not been claimed. A verified teacher can claim $0.50 once.')}</p>
        </section>
        <div className={styles.detailColumns}><section className={styles.section} aria-labelledby="adjust-heading"><h2 id="adjust-heading">{t('تعديل الرصيد','Adjust credit')}</h2>
          {['deleted','suspended'].includes(user.data.status)?<p>{t('لا يمكن تعديل رصيد حساب محذوف أو موقوف.','Credit cannot be adjusted for a deleted or suspended account.')}</p>:<CreditForm key={id} person={user.data}/>}
        </section><section className={styles.section} aria-labelledby="history-heading"><h2 id="history-heading"><History size={23} aria-hidden="true"/>{t('سجل الرصيد','Credit history')}</h2>
          <p>{t('الإضافات والخصومات والحجوزات محفوظة للمراجعة.','Additions, deductions and reservations are kept for review.')}</p>
          {history.isPending?<LoadingState rows={3}/>:history.error?<FailureState title={t('تعذّر تحميل السجل','History couldn’t load')} actions={<Button onClick={()=>void history.refetch()}>{t('إعادة المحاولة','Try again')}</Button>}/>:<>
            {!history.data?.pages[0]?.entries.length?<p className={styles.empty}>{t('لا توجد عمليات رصيد بعد.','No credit transactions yet.')}</p>:<ol className={styles.history}>{history.data.pages.flatMap(p=>p.entries).map(entry=><li key={entry.id}>
              <div><strong>{entryLabel(entry.kind,entry.amountMillicents,ar)}</strong><strong className={styles.money}>{entry.kind==='adjustment'&&entry.amountMillicents>0?'+':''}{creditUsd(entry.amountMillicents,i18n.language)}</strong></div>
              {entry.reason && <p dir="auto">{entry.kind==='adjustment'?entry.reason:reasonLabel(entry.reason,ar)}</p>}
              <small>{date(entry.createdAt)}{entry.actorEmail && <><br/><bdi>{entry.actorEmail}</bdi></>}</small>
              {entry.balanceAfterMillicents!==null && <small>{t('الرصيد بعد التعديل: ','Balance after adjustment: ')}{creditUsd(entry.balanceAfterMillicents,i18n.language)}</small>}
            </li>)}</ol>}
            {history.hasNextPage && <Button loading={history.isFetchingNextPage} onClick={()=>void history.fetchNextPage()}>{t('عرض عمليات أقدم','Show older transactions')}</Button>}
          </>}
        </section></div>
      </>:<section className={styles.section}><h2>{t('رصيد المعلّمين','Instructor credit')}</h2><p>{t('هذا الحساب ليس حساب معلّم؛ لا تتاح له تعديلات رصيد الذكاء الاصطناعي.','This is not an instructor account. AI credit adjustments are unavailable.')}</p></section>}
    </>}
  </>
}

export function CreditForm({person}:{person:AdminUser}) {
  const {i18n}=useTranslation(), ar=i18n.language.startsWith('ar'), t=(a:string,e:string)=>ar?a:e, queries=useQueryClient(), {user:actor}=useAuth()
  const [direction,setDirection]=useState<'add'|'remove'>('add'), [amount,setAmount]=useState('0.50'), [reason,setReason]=useState('')
  const [review,setReview]=useState<Adjustment|null>(null), [pending,setPending]=useState(false), [error,setError]=useState(''), [notice,setNotice]=useState(''), [uncertain,setUncertain]=useState(false)
  const inFlight=useRef(false)
  const reviewHeading=useRef<HTMLHeadingElement>(null), amountInput=useRef<HTMLInputElement>(null), returnFocus=useRef(false)
  useEffect(()=>{
    if(review) {reviewHeading.current?.focus();returnFocus.current=true}
    else if(returnFocus.current) {amountInput.current?.focus();returnFocus.current=false}
  },[review])
  const parsedAmount=creditMillicents(amount), numericAmount=parsedAmount??0, resulting=person.balanceMillicents+(direction==='add'?numericAmount:-numericAmount)
  async function save() {
    if(!review || inFlight.current) return
    inFlight.current=true;setPending(true);setError('')
    try {
      const result=await administration.adjust(String(person.id),review)
      setNotice(t('حُفظ التعديل. الرصيد بعد العملية: ','Adjustment saved. Balance after this transaction: ')+creditUsd(result.balanceMillicents,i18n.language))
      setReview(null);setReason('');setUncertain(false)
      await Promise.all([queries.invalidateQueries({queryKey:['admin-user',actor?.id,String(person.id)]}),queries.invalidateQueries({queryKey:['admin-users',actor?.id]}),queries.invalidateQueries({queryKey:['admin-credit-history',actor?.id,String(person.id)]})])
    } catch(cause) {
      const ambiguous=!(cause instanceof ApiError) || cause.status>=500
      setUncertain(ambiguous)
      setError(ambiguous?t('لم نتأكد من النتيجة. أعد المحاولة بنفس العملية؛ لن يُحتسب التعديل مرتين.','We could not confirm the result. Retry this same adjustment; it will not be applied twice.'):ar?t('تعذّر التعديل. تحقّق من الرصيد المتاح وحالة الحساب ثم أعد المحاولة.',''):cause.message)
      void queries.invalidateQueries({queryKey:['admin-user',actor?.id,String(person.id)]})
    } finally {inFlight.current=false;setPending(false)}
  }
  return <form className={styles.creditForm} onSubmit={e=>{e.preventDefault();setError('');setNotice('')
    if(parsedAmount===null||numericAmount<=0||numericAmount>1_000_000_000) {setError(t('أدخل مبلغًا أكبر من صفر ولا يتجاوز 10,000 دولار.','Enter an amount greater than zero and no more than $10,000.'));return}
    if(resulting<person.reservedMillicents){setError(t('لا يمكن خصم رصيد أكثر من المتاح.','You cannot remove more than the available credit.'));return}
    if(reason.trim().length<3){setError(t('أدخل سببًا واضحًا للتعديل.','Enter a clear reason for this adjustment.'));return}
    setReview({direction,amountUsd:amount,reason:reason.trim(),requestKey:crypto.randomUUID()})
  }}>
    {notice && <p className={styles.success} role="status">{notice}</p>}
    {review?<div className={styles.review}><h3 ref={reviewHeading} tabIndex={-1}>{t('مراجعة التعديل','Review adjustment')}</h3><p>{direction==='add'?t('إضافة','Add'):t('خصم','Remove')} <strong>{creditUsd(numericAmount,i18n.language)}</strong> {t('لحساب','for')} <bdi>{person.email||person.name}</bdi></p><p dir="auto">{review.reason}</p><p>{t('الرصيد المتوقع بعد التعديل: ','Expected balance after adjustment: ')}<strong>{creditUsd(resulting,i18n.language)}</strong></p><p>{t('سيُحفظ اسم المسؤول والسبب في السجل. الرصيد النهائي يُراجع عند الحفظ.','Your admin account and reason will be recorded. The final balance is checked when saving.')}</p>
      <div className={styles.actions}><Button variant={direction==='remove'?'danger':'primary'} loading={pending} onClick={()=>void save()}>{uncertain?t('إعادة محاولة نفس التعديل','Retry same adjustment'):t('تأكيد التعديل','Confirm adjustment')}</Button><Button disabled={pending||uncertain} onClick={()=>{setReview(null);setError('')}}>{t('تعديل التفاصيل','Edit details')}</Button></div>
    </div>:<>
      <label>{t('نوع التعديل','Action')}<Select value={direction} onValueChange={value=>setDirection(value as 'add'|'remove')}><option value="add">{t('إضافة رصيد','Add credit')}</option><option value="remove">{t('خصم رصيد','Remove credit')}</option></Select></label>
      <label>{t('المبلغ بالدولار الأمريكي','Amount in USD')}<input ref={amountInput} inputMode="decimal" dir="ltr" value={amount} onChange={e=>setAmount(e.target.value)} maxLength={12} required aria-describedby="credit-amount-hint"/></label>
      <small id="credit-amount-hint">{t('مثال: 0.50 تعني خمسين سنتًا. الرصيد يُقاس بالدولار وليس بعدد كلمات النموذج.','For example, 0.50 means fifty cents. Credit is measured in USD, not model token counts.')}</small>
      <label>{t('سبب التعديل','Reason for adjustment')}<textarea rows={3} value={reason} onChange={e=>setReason(e.target.value)} minLength={3} maxLength={500} required placeholder={t('مثال: رصيد إضافي لإعداد الدروس','For example: additional credit for lesson preparation')}/></label>
      <Button type="submit" variant="primary">{t('مراجعة التعديل','Review adjustment')}</Button>
    </>}
    {error && <p className={styles.error} role="alert">{error}</p>}
  </form>
}
function entryLabel(kind:string,amount:number,ar:boolean) {
  const labels:Record<string,[string,string]>={grant:['رصيد ترحيبي','Welcome credit'],reserve:['حجز للإنشاء','Reserved for generation'],settle:['تكلفة الإنشاء','Generation charge'],release:['إلغاء الحجز','Reservation released'],reversal:['استرداد','Refund'],provider_cost:['تكلفة المزوّد','Provider cost'],adjustment:amount<0?['خصم بواسطة المسؤول','Admin deduction']:['إضافة بواسطة المسؤول','Admin credit']}
  return labels[kind]?.[ar?0:1]??kind
}
function reasonLabel(reason:string,ar:boolean) {
  const labels:Record<string,[string,string]>={welcome_grant:['الرصيد الترحيبي للمعلّم','Teacher welcome credit'],generation:['إنشاء محتوى بالذكاء الاصطناعي','AI content generation'],unused_reservation:['إعادة الرصيد المحجوز غير المستخدم','Unused reserved credit returned'],released_no_delivery:['لم يُسلّم محتوى قابل للاستخدام','No usable content delivered'],provider:['تكلفة الخدمة على أساسيرا؛ ليست خصمًا إضافيًا','Asasera service cost; not an additional deduction']}
  return labels[reason]?.[ar?0:1]??reason
}
