import {useState,type FormEvent} from 'react'
import {useQuery,useQueryClient} from '@tanstack/react-query'
import {useTranslation} from 'react-i18next'
import {AlertTriangle, CheckCircle2, CreditCard, Download, RefreshCw} from 'lucide-react'
import {Button, FailureState, LoadingState, Select} from '@/design'
import {useAuth} from '@/hooks/useAuth'
import {ApiError} from '@/lib/api'
import {adminBilling, type AdminBilling as Settings, type AdminBillingPlan, type BillingPlanId} from './api'
import styles from './Admin.module.css'

/**
 * Billing configuration.
 *
 * The three credentials live in the environment and are shown here only as
 * present / absent — a key's value never leaves the server, so there is
 * nothing on this page to steal. Everything else is a business decision made
 * here, audited with the administrator's name.
 *
 * A price is never typed as a number. An administrator pastes a Stripe price
 * id and the server asks Stripe what it is; the amount, currency, interval and
 * mode shown below are Stripe's answer, not ours. That is why each row reports
 * the margin split it produces: the consequence of the choice is on the same
 * line as the choice.
 */
export default function AdminBillingPage() {
  const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),t=(a:string,e:string)=>ar?a:e
  const {user}=useAuth()
  const query=useQuery({queryKey:['admin-billing',user?.id],queryFn:({signal})=>adminBilling.get(signal),retry:1,enabled:user?.role==='admin'})
  if(user?.role!=='admin')return null
  return <>
    <header className={styles.pageHeading}><div>
      <h1>{t('الدفع والخطط','Payments and plans')}</h1>
      <p>{t('المفاتيح الثلاثة في البيئة، وكل ما عداها يُضبط هنا. الأسعار تُقرأ من Stripe ولا تُكتب يدويًا.','The three keys live in the environment; everything else is set here. Prices are read from Stripe, never typed.')}</p>
    </div><CreditCard size={30} aria-hidden="true"/></header>
    {query.isPending?<LoadingState label={t('جارٍ التحميل','Loading')} variant="form" rows={4}/>
     :query.error||!query.data?<FailureState title={t('تعذّر تحميل إعدادات الدفع','Billing settings could not load')} actions={<Button onClick={()=>void query.refetch()}>{t('إعادة المحاولة','Try again')}</Button>}/>
     :<BillingForm key={query.data.policy.version} data={query.data}/>}
  </>
}

function BillingForm({data}:{data:Settings}) {
  const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar'),t=(a:string,e:string)=>ar?a:e
  const {user}=useAuth(),client=useQueryClient()
  const [policy,setPolicy]=useState(data.policy)
  const [busy,setBusy]=useState(''),[error,setError]=useState(''),[saved,setSaved]=useState('')
  const cache=(next:Settings)=>client.setQueryData(['admin-billing',user?.id],next)
  const money=(millicents:number|null,currency:string|null)=>millicents===null?'—':new Intl.NumberFormat(ar?'ar':'en',{style:'currency',currency:(currency??policy.currency).toUpperCase(),maximumFractionDigits:2}).format(millicents/100_000)
  const nf=new Intl.NumberFormat(ar?'ar':'en')

  const blocked:Record<string,string>={
    no_secret_key:t('لا يوجد مفتاح سري في البيئة','No secret key in the environment'),
    no_webhook_secret:t('لا يوجد سر webhook في البيئة','No webhook secret in the environment'),
    price_not_set:t('لم يُربط سعر Stripe بعد','No Stripe price installed yet'),
    price_archived:t('السعر مؤرشف في Stripe','Archived in Stripe'),
    mode_mismatch:t('السعر من وضع مختلف عن المفتاح','Price belongs to the other Stripe mode'),
    currency_mismatch:t('عملة السعر تخالف عملة المنصة','Currency differs from the platform currency'),
    interval_mismatch:t('دورية السعر لا تناسب هذه الخطة','Billing interval does not match this plan'),
    price_uneconomic:t('الرسوم تلتهم نسبة كبيرة من هذا المبلغ','Fees take too much of a charge this size'),
  }
  const planName=(plan:BillingPlanId)=>({day_pass:t('بطاقة يوم','Day pass'),monthly:t('شهري','Monthly'),yearly:t('سنوي','Yearly'),
    topup_small:t('شحنة صغيرة','Small top-up'),topup_medium:t('شحنة متوسطة','Medium top-up'),topup_large:t('شحنة كبيرة','Large top-up')})[plan]

  const changed=policy.currency!==data.policy.currency||policy.marginBasisPoints!==data.policy.marginBasisPoints
    ||policy.feeBasisPoints!==data.policy.feeBasisPoints||policy.feeFixedMillicents!==data.policy.feeFixedMillicents||policy.enabled!==data.policy.enabled

  async function savePolicy(event:FormEvent){
    event.preventDefault()
    if(busy||!changed)return
    setBusy('policy');setError('');setSaved('')
    // Only the fields the endpoint accepts. `policy` also carries `version`,
    // and the schema is strict — spreading it whole was rejected as a bad body.
    try{cache(await adminBilling.savePolicy({currency:policy.currency,marginBasisPoints:policy.marginBasisPoints,
      feeBasisPoints:policy.feeBasisPoints,feeFixedMillicents:policy.feeFixedMillicents,freeMonthlyMillicents:policy.freeMonthlyMillicents,
      enabled:policy.enabled,expectedVersion:data.policy.version}));setSaved(t('حُفظت الإعدادات.','Settings saved.'))}
    catch(e){setError(e instanceof ApiError?e.message:t('تعذّر الحفظ.','Could not save.'))}
    finally{setBusy('')}
  }
  async function savePrice(plan:BillingPlanId,raw:string){
    if(busy)return
    setBusy(plan);setError('');setSaved('')
    try{cache(await adminBilling.savePrice({plan,stripePriceId:raw.trim()||null,expectedVersion:data.policy.version}));setSaved(t('تم التحقق من السعر مع Stripe وحفظه.','Price verified with Stripe and saved.'))}
    catch(e){setError(e instanceof ApiError?e.message:t('تعذّر حفظ السعر.','Could not save the price.'))}
    finally{setBusy('')}
  }
  /* One button instead of six copied ids. The server still runs every check
     on each price; this only removes the copying, and the swap it invites. */
  async function discover(){
    if(busy)return
    setBusy('discover');setError('');setSaved('')
    try{
      const result=await adminBilling.discover();cache(result.settings)
      const installed=result.results.filter(r=>r.status==='installed').length
      const rejected=result.results.filter(r=>r.status==='rejected')
      setSaved(t(`رُبطت ${installed} خطة من Stripe.`,`Installed ${installed} plan(s) from Stripe.`))
      if(rejected.length)setError(rejected.map(r=>`${r.plan}: ${r.detail??''}`).join(' · '))
    }catch(e){setError(e instanceof ApiError?e.message:t('تعذّر الجلب من Stripe.','Could not fetch from Stripe.'))}
    finally{setBusy('')}
  }
  async function reverify(){
    if(busy)return
    setBusy('reverify');setError('');setSaved('')
    try{const result=await adminBilling.reverify();cache(result.settings);setSaved(t('أُعيد التحقق من كل الأسعار.','Every price was re-checked with Stripe.'))}
    catch(e){setError(e instanceof ApiError?e.message:t('تعذّرت إعادة التحقق.','Re-check failed.'))}
    finally{setBusy('')}
  }

  const sellable=data.plans.filter(plan=>!plan.blockedBy).length
  return <div className={styles.aiSettings}>
    {saved&&<p className={styles.success} role="status">{saved}</p>}
    {error&&<p className={styles.error} role="alert">{error}</p>}

    <section className={styles.section} aria-labelledby="billing-credentials">
      <h2 id="billing-credentials">{t('بيانات الاعتماد','Credentials')}</h2>
      <p>{t('تُقرأ من البيئة ولا تُعرض قيمتها هنا أبدًا. غيّرها في الأسرار وأعد التشغيل.','Read from the environment; their values are never shown here. Change them in Secrets and restart.')}</p>
      <ul className={styles.capabilities}>
        {([['STRIPE_SECRET_KEY',data.credentials.secretKey],['STRIPE_WEBHOOK_SECRET',data.credentials.webhookSecret],['STRIPE_PUBLISHABLE_KEY',data.credentials.publishableKey]] as const).map(([name,present])=>
          <li key={name}><CreditCard size={20} aria-hidden="true"/><div><strong dir="ltr">{name}</strong></div>
            <span className={styles.capabilityStatus} data-status={present?'available':'not_available'}>
              {present?<CheckCircle2 size={16} aria-hidden="true"/>:<AlertTriangle size={16} aria-hidden="true"/>}
              {present?t('موجود','Present'):t('غير موجود','Missing')}</span></li>)}
      </ul>
      {data.credentials.mode&&<p role="status">{t(`الوضع: ${data.credentials.mode==='live'?'مباشر':'اختبار'}`,`Mode: ${data.credentials.mode}`)}</p>}
      {data.credentials.modeMismatch&&<p className={styles.error} role="alert">
        {t('المفتاح السري والمفتاح العلني من وضعين مختلفين. صحّح أحدهما قبل التفعيل.','The secret and publishable keys belong to different Stripe modes. Fix one before enabling payment.')}</p>}
    </section>

    <section className={styles.section} aria-labelledby="billing-policy">
      <h2 id="billing-policy">{t('الهامش والرسوم','Margin and fees')}</h2>
      <form className={styles.creditForm} onSubmit={savePolicy} aria-busy={busy==='policy'}>
        <label>{t('العملة','Currency')}
          <Select value={policy.currency} disabled={!!busy} onValueChange={value=>setPolicy(p=>({...p,currency:value}))}>
            {['usd','aed','eur','gbp','sar'].map(code=><option key={code} value={code}>{code.toUpperCase()}</option>)}
          </Select></label>
        <label>{t('هامش أساسيرا','Asasera margin')}
          <Select value={String(policy.marginBasisPoints)} disabled={!!busy} onValueChange={value=>setPolicy(p=>({...p,marginBasisPoints:Number(value)}))}>
            {[3000,4000,5000,6000,7000].map(bp=><option key={bp} value={bp}>{bp/100}%</option>)}
          </Select>
          <small>{t('يُحسب بعد رسوم البطاقة، لا قبلها.','Taken after the card fee, not before.')}</small></label>
        <label>{t('نسبة رسوم المزوّد','Processor percentage')}
          <input type="number" min={0} max={2000} step={1} value={policy.feeBasisPoints} disabled={!!busy}
            onChange={event=>setPolicy(p=>({...p,feeBasisPoints:Number(event.target.value)}))}/>
          <small>{t(`نقطة أساس · ${(policy.feeBasisPoints/100).toFixed(2)}٪`,`basis points · ${(policy.feeBasisPoints/100).toFixed(2)}%`)}</small></label>
        <label>{t('الرسوم الثابتة لكل عملية','Fixed fee per charge')}
          <input type="number" min={0} max={1000000} step={1000} value={policy.feeFixedMillicents} disabled={!!busy}
            onChange={event=>setPolicy(p=>({...p,feeFixedMillicents:Number(event.target.value)}))}/>
          <small dir="ltr">{money(policy.feeFixedMillicents,policy.currency)}</small></label>
        <label>{t('المنحة الشهرية المجانية','Free monthly allowance')}
          <input type="number" min={0} max={10000000} step={1000} value={policy.freeMonthlyMillicents} disabled={!!busy}
            onChange={event=>setPolicy(p=>({...p,freeMonthlyMillicents:Number(event.target.value)}))}/>
          <small dir="ltr">{money(policy.freeMonthlyMillicents,policy.currency)} · {t('صفر يعني لا منحة','0 means no free tier')}</small></label>
        <label className={styles.aiToggle}>
          <input type="checkbox" checked={policy.enabled} disabled={!!busy} onChange={event=>setPolicy(p=>({...p,enabled:event.target.checked}))}/>
          {t('تفعيل الدفع للمدرّسين','Enable payment for teachers')}</label>
        <p role="status">{sellable?t(`${sellable} خطة جاهزة للبيع.`,`${sellable} plan(s) ready to sell.`):t('لا توجد خطة جاهزة بعد. لا يمكن التفعيل.','No plan is ready yet. Payment cannot be enabled.')}</p>
        <div className={styles.actions}><Button variant="primary" type="submit" loading={busy==='policy'} disabled={!changed||!!busy}>{t('حفظ','Save')}</Button></div>
      </form>
    </section>

    <section className={styles.section} aria-labelledby="billing-plans">
      <div className={styles.catalogHeading}>
        <div><h2 id="billing-plans">{t('الخطط وأسعارها','Plans and prices')}</h2>
          <p>{t('شغّل npm run stripe:plan -- --all ثم اضغط «اجلب الأسعار» — يجدها الخادم بمفتاح البحث ويفحصها قبل ربطها. أو الصق أي معرّف يدويًا أدناه.','Run npm run stripe:plan -- --all, then press Fetch — the server finds each price by its lookup key and runs every check before installing it. Or paste any id by hand below.')}</p></div>
        <div className={styles.actions}>
          <Button variant="primary" icon={<Download size={16} aria-hidden="true"/>} loading={busy==='discover'} disabled={!!busy} onClick={()=>void discover()}>{t('اجلب الأسعار من Stripe','Fetch prices from Stripe')}</Button>
          <Button variant="secondary" icon={<RefreshCw size={16} aria-hidden="true"/>} loading={busy==='reverify'} disabled={!!busy} onClick={()=>void reverify()}>{t('إعادة التحقق','Re-check all')}</Button>
        </div>
      </div>
      {([['subscription',t('اشتراكات','Subscriptions')],['topup',t('شحنات رصيد','Credit top-ups')]] as const).map(([group,heading])=>{
        const rows=data.plans.filter(plan=>(plan.period===null)===(group==='topup'))
        return <div key={group} className={styles.planGroup}>
          <h3>{heading}</h3>
          <ul className={styles.planRows}>{rows.map(plan=>
            <PlanRow key={plan.plan} plan={plan} name={planName(plan.plan)} busy={busy===plan.plan} disabled={!!busy}
              blockedLabel={plan.blockedBy?blocked[plan.blockedBy]??plan.blockedBy:null} money={money} nf={nf} t={t} onSave={savePrice}/>)}
          </ul>
        </div>
      })}
    </section>
  </div>
}

/*
 * One plan, one row.
 *
 * The first draft reused the AI-route card, which was built for two items and
 * became six screens of scrolling here. Worse, it painted "no price installed
 * yet" in the error style — that is the state every plan starts in, so the
 * page opened looking broken. An empty slot is a hint; only a price that has
 * failed a check is an error.
 */
function PlanRow({plan,name,busy,disabled,blockedLabel,money,nf,t,onSave}:{
  plan:AdminBillingPlan; name:string; busy:boolean; disabled:boolean; blockedLabel:string|null
  money:(m:number|null,c:string|null)=>string; nf:Intl.NumberFormat; t:(a:string,e:string)=>string
  onSave:(plan:BillingPlanId,raw:string)=>Promise<void>
}) {
  const [value,setValue]=useState(plan.stripePriceId??'')
  const edited=value.trim()!==(plan.stripePriceId??'')
  const pending=plan.blockedBy==='price_not_set'
  return <li className={styles.planRow} data-ready={!plan.blockedBy}>
    <div className={styles.planTop}>
      <strong>{name}</strong>
      <span className={styles.planNeed}>
        {plan.requiredInterval?t(`متكرر كل ${plan.requiredInterval==='month'?'شهر':'سنة'}`,`recurring / ${plan.requiredInterval}`)
          :t('دفعة واحدة','one-time')} · {t('المقترح','suggested')} {money(plan.suggestedPriceMillicents,null)}
      </span>
      <span className={styles.planState} data-state={plan.blockedBy?(pending?'pending':'blocked'):'ready'}>
        {plan.blockedBy?(pending?t('بانتظار السعر','Awaiting price'):t('غير جاهزة','Not ready')):t('جاهزة','Ready')}
      </span>
    </div>
    <form className={styles.planForm} onSubmit={event=>{event.preventDefault();void onSave(plan.plan,value)}} aria-busy={busy}>
      <input value={value} dir="ltr" placeholder="price_…" spellCheck={false} autoComplete="off" disabled={disabled}
        aria-label={`${t('معرّف السعر','Price id')} — ${name}`} onChange={event=>setValue(event.target.value)}/>
      <Button variant="primary" type="submit" loading={busy} disabled={disabled||!edited}>{t('تحقّق','Verify')}</Button>
    </form>
    {plan.priceMillicents!==null&&<dl className={styles.planFigures}>
      <div><dt>{t('السعر','Price')}</dt><dd dir="ltr">{money(plan.priceMillicents,plan.currency)}</dd></div>
      <div><dt>{t('الرسوم','Fee')}</dt><dd dir="ltr">{money(plan.processorFeeMillicents,plan.currency)} · {((plan.processorShareBasisPoints??0)/100).toFixed(1)}%</dd></div>
      <div><dt>{t('يكفي لـ','Buys')}</dt><dd dir="ltr">{plan.activities===null?'—':`${nf.format(plan.activities)} ${t('نشاط','activities')}`}</dd></div>
      <div><dt>{t('ربحك','Margin')}</dt><dd dir="ltr">{money(plan.marginMillicents,plan.currency)}</dd></div>
    </dl>}
    {blockedLabel&&!pending&&<p className={styles.planBlocked} role="status">{blockedLabel}</p>}
    {plan.verifiedAt&&<small className={styles.planVerified}>{t('تُحقّق مع Stripe','Verified with Stripe')} · {new Date(plan.verifiedAt).toLocaleDateString()} · {plan.livemode?'live':'test'}</small>}
  </li>
}
