import { useQuery } from '@tanstack/react-query'
import { Activity, Bot, ChartNoAxesCombined, CircleAlert, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Button, FailureState, LoadingState } from '@/design'
import { useAuth } from '@/hooks/useAuth'
import { adminAnalytics } from './api'
import styles from './Admin.module.css'

function Metric({label,value,detail}:{label:string;value:string;detail?:string}) {
  return <div className={styles.metric}><dt>{label}</dt><dd>{value}</dd>{detail&&<small>{detail}</small>}</div>
}

export default function AdminOverview() {
  const {i18n}=useTranslation(),{user}=useAuth(),ar=i18n.language.startsWith('ar'),t=(arabic:string,english:string)=>ar?arabic:english
  const query=useQuery({queryKey:['admin-overview',user?.id],queryFn:({signal})=>adminAnalytics.overview(signal),retry:1,enabled:user?.role==='admin'})
  if(user?.role!=='admin') return null
  if(query.isPending) return <LoadingState label={t('جارٍ تحميل نظرة عامة على الإدارة','Loading administration overview')} variant="form" rows={5}/>
  if(query.error) return <FailureState title={t('تعذّر تحميل نظرة عامة على الإدارة','Administration overview couldn’t load')} actions={<Button onClick={()=>void query.refetch()}>{t('إعادة المحاولة','Try again')}</Button>}/>
  const data=query.data,days=data.periodDays,lastSeven=data.traffic.daily.slice(-7)
  const number=(value:number)=>value.toLocaleString(i18n.language)
  return <>
    <header className={styles.pageHeading}><div><h1>{t('نظرة عامة على الإدارة','Administration overview')}</h1><p>{t(`ملخص تشغيلي لآخر ${days} يومًا. الأرقام تُعرض كما تسجّلها المنصة، لا كتوقعات.`,`An operational view of the last ${days} days. Counts are recorded platform activity, not estimates.`)}</p></div><ChartNoAxesCombined size={30} aria-hidden="true"/></header>

    <section className={styles.overviewSummary} aria-label={t('الملخص التشغيلي','Operational summary')}>
      <dl><Metric label={t('الحسابات','Accounts')} value={number(data.people.accounts)} detail={t(`${number(data.people.newAccounts)} جديدة خلال ${days} يومًا`,`${number(data.people.newAccounts)} new in ${days} days`)}/></dl>
      <dl><Metric label={t('المعلّمون','Teachers')} value={number(data.people.teachers)} detail={t(`${number(data.people.activeTeachers)} معلّمًا سجّل الدخول خلال ${days} يومًا`,`${number(data.people.activeTeachers)} teachers signed in during the last ${days} days`)}/></dl>
      <dl><Metric label={t('زوار الصفحة الرئيسية','Landing visitors')} value={number(data.traffic.uniqueVisitors)} detail={t(`${number(data.traffic.visits)} زيارة في الجلسات المرصودة`,`${number(data.traffic.visits)} recorded session visits`)}/></dl>
    </section>

    <div className={styles.overviewGrid}>
      <section className={styles.section} aria-labelledby="teaching-activity"><h2 id="teaching-activity"><Activity size={21} aria-hidden="true"/>{t('نشاط التعلّم','Teaching activity')}</h2>
        <dl className={styles.metricGrid}>
          <Metric label={t('الأنشطة المحفوظة','Saved activities')} value={number(data.teaching.activities)} detail={t(`${number(data.teaching.activitiesCreated)} أُنشئت خلال ${days} يومًا`,`${number(data.teaching.activitiesCreated)} created in ${days} days`)}/>
          <Metric label={t('التشغيلات المكتملة','Completed runs')} value={number(data.teaching.completedRuns)} detail={t(`${number(data.teaching.runs)} إجمالي التشغيلات`,`${number(data.teaching.runs)} total runs`)}/>
          <Metric label={t('مقاعد المتعلمين','Learner seats')} value={number(data.teaching.learnerSeats)} detail={t(`تم الانضمام إليها خلال ${days} يومًا`,`Joined during the last ${days} days`)}/>
        </dl>
      </section>

      <section className={styles.section} aria-labelledby="visitor-traffic"><h2 id="visitor-traffic"><UsersRound size={21} aria-hidden="true"/>{t('حركة الزوار','Visitor traffic')}</h2>
        {data.traffic.trackingStartedAt ? <>
          <p>{t('يقيس هذا العدد زيارات الصفحة الرئيسية المجهّلة. لا يتتبع النظام عناوين IP أو أسماء المستخدمين أو صفحاتهم الخاصة.','This counts privacy-minimized landing-page visits. It does not store IP addresses, account names, or private-page activity.')}</p>
          <div className={styles.tableWrap}><table className={styles.compactTable}><caption>{t('آخر سبعة أيام مسجلة','Latest seven recorded days')}</caption><thead><tr><th>{t('التاريخ','Date')}</th><th>{t('الزوار','Visitors')}</th><th>{t('الزيارات','Visits')}</th></tr></thead><tbody>{lastSeven.map(day=><tr key={day.date}><td><time dateTime={day.date}>{new Date(`${day.date}T00:00:00Z`).toLocaleDateString(i18n.language,{month:'short',day:'numeric'})}</time></td><td>{number(day.visitors)}</td><td>{number(day.visits)}</td></tr>)}</tbody></table></div>
        </> : <div className={styles.empty}><UsersRound size={36} aria-hidden="true"/><h3>{t('لم تُسجّل أي زيارة بعد','No landing visits recorded yet')}</h3><p>{t('سيبدأ هذا المقياس عند زيارة الصفحة الرئيسية في نسخة التطبيق التي تشمل هذا التحديث.','This metric begins when the landing page is visited in an app release that includes this update.')}</p></div>}
      </section>
    </div>

    <section className={styles.section} aria-labelledby="generation-health"><div className={styles.sectionHeading}><div><h2 id="generation-health"><Bot size={21} aria-hidden="true"/>{t('سلامة إنشاء الذكاء الاصطناعي','AI generation health')}</h2><p>{t('تُبقي هذه المؤشرات تكاليف المزوّد ونتائج المهام مرئية دون عرض مصادر الدروس أو مطالبات المعلّمين.','These indicators make provider cost and job outcomes visible without exposing lesson sources or teacher prompts.')}</p></div><Link className={styles.rowLink} to="/admin/ai-settings">{t('إعدادات المسار','Configure routes')}</Link></div>
      <dl className={styles.metricGrid}>
        <Metric label={t('المهام التي بدأت','Jobs started')} value={number(data.generation.jobsStarted)} detail={t(`خلال ${days} يومًا`,`During the last ${days} days`)}/>
        <Metric label={t('المهام الناجحة','Succeeded')} value={number(data.generation.jobsSucceeded)} detail={t(`${number(data.generation.jobsFailed)} فشلت`,`${number(data.generation.jobsFailed)} failed`)}/>
        <Metric label={t('بانتظار نتيجة مؤكدة','Awaiting outcome')} value={number(data.generation.jobsAwaitingOutcome)} detail={t('تحتاج متابعة تشغيلية فقط عند ظهورها.','Needs operational follow-up only when present.')}/>
        <Metric label={t('تكلفة المزوّد المسجّلة','Recorded provider cost')} value={new Intl.NumberFormat(i18n.language,{style:'currency',currency:'USD',minimumFractionDigits:2,maximumFractionDigits:5}).format(data.generation.providerCostMillicents/100000)} detail={t(`للمهام المنتهية خلال ${days} يومًا`,`For jobs finished in the last ${days} days`)}/>
      </dl>
      {data.generation.jobsAwaitingOutcome>0&&<p className={styles.warning}><CircleAlert size={18} aria-hidden="true"/>{t('توجد مهام بدأ فيها طلب للمزوّد لكن لم تسجّل نتيجة نهائية بعد. راجع معالجة المهام قبل أي تسوية مالية.','Some jobs reached a provider attempt without a final result. Review job handling before any financial reconciliation.')}</p>}
    </section>
  </>
}
