import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Search, Users, Wallet } from 'lucide-react'
import { Button, FailureState, LoadingState, Select } from '@/design'
import { useAuth } from '@/hooks/useAuth'
import { accountRoleLabel } from '@/lib/accountRole'
import { administration, creditUsd } from './api'
import styles from './Admin.module.css'

export default function AdminUsers() {
  const {i18n} = useTranslation(), {user} = useAuth(), ar=i18n.language.startsWith('ar'), t=(a:string,e:string)=>ar?a:e
  const [search,setSearch]=useState(''), [query,setQuery]=useState(''), [role,setRole]=useState(''), [page,setPage]=useState(1)
  const result=useQuery({queryKey:['admin-users',user?.id,query,role,page],queryFn:({signal})=>administration.users(query,role,page,signal),retry:1})
  return <>
    <div className={styles.pageHeading}><div><h1>{t('المستخدمون والأرصدة','Users & credit')}</h1><p>{t('ابحث عن مستخدم، وراجع حسابه، وأدر رصيد الذكاء الاصطناعي للمعلّمين.','Find a user, review their account, and manage instructor AI credit.')}</p></div><Users size={40} aria-hidden="true"/></div>
    <form className={styles.filters} onSubmit={e=>{e.preventDefault();setQuery(search.trim());setPage(1)}}>
      <label className={styles.search}>{t('البحث بالاسم أو البريد','Search by name or email')}<div><Search size={20} aria-hidden="true"/><input type="search" maxLength={200} value={search} onChange={e=>setSearch(e.target.value)} placeholder={t('الاسم أو البريد الإلكتروني','Name or email address')}/></div></label>
      <label>{t('نوع الحساب','Account type')}<Select value={role} onValueChange={value=>{setRole(value);setPage(1)}}><option value="">{t('كل المستخدمين','All users')}</option>{(['teacher','student','admin','support'] as const).map(value=><option key={value} value={value}>{accountRoleLabel(value,i18n.language)}</option>)}</Select></label>
      <Button type="submit" variant="primary">{t('بحث','Search')}</Button>
    </form>
    {result.isPending?<LoadingState rows={5}/>:result.error?<FailureState title={t('تعذّر تحميل المستخدمين','Users couldn’t load')} actions={<Button onClick={()=>void result.refetch()}>{t('إعادة المحاولة','Try again')}</Button>}/>:<>
      <p className={styles.resultCount} role="status">{result.data.total.toLocaleString(i18n.language)} {t('مستخدم','users')}</p>
      {!result.data.users.length?<div className={styles.empty}><Users size={36} aria-hidden="true"/><h2>{t('لم نعثر على مستخدمين','No users found')}</h2><p>{t('جرّب اسمًا آخر أو اختر كل أنواع الحسابات.','Try a different name or select all account types.')}</p></div>:<div className={styles.tableWrap}><table className={styles.table}>
        <caption className={styles.srOnly}>{t('المستخدمون وأرصدة الذكاء الاصطناعي','Users and AI credit balances')}</caption>
        <thead><tr><th>{t('المستخدم','User')}</th><th>{t('النوع والحالة','Role & status')}</th><th>{t('الرصيد المتاح','Available credit')}</th><th>{t('الحساب','Account')}</th></tr></thead>
        <tbody>{result.data.users.map(person=><tr key={person.id}>
          <td><strong dir="auto">{person.name||t('بدون اسم','No name yet')}</strong><span dir="ltr">{person.email||t('بدون بريد','No email')}</span></td>
          <td><span className={styles.role} data-role={person.role}>{accountRoleLabel(person.role,i18n.language)}</span><small>{statusLabel(person.status,ar)} · {person.emailVerified?t('بريد موثّق','Email verified'):t('بريد غير موثّق','Email unverified')}</small></td>
          <td className={styles.money}>{person.role==='teacher'?creditUsd(person.spendableMillicents,i18n.language):'—'}</td>
          <td><Link className={styles.rowLink} to={`/admin/users/${person.id}`}><Wallet size={17} aria-hidden="true"/>{person.role==='teacher'?t('إدارة الرصيد','Manage credit'):t('عرض الحساب','View account')}</Link></td>
        </tr>)}</tbody>
      </table></div>}
      <nav className={styles.pagination} aria-label={t('صفحات المستخدمين','User pages')}><Button disabled={page===1} onClick={()=>setPage(p=>p-1)}>{t('السابق','Previous')}</Button><span>{t('صفحة','Page')} {page} / {Math.max(1,Math.ceil(result.data.total/25))}</span><Button disabled={page*25>=result.data.total} onClick={()=>setPage(p=>p+1)}>{t('التالي','Next')}</Button></nav>
    </>}
  </>
}
export function statusLabel(status:string,ar:boolean) {
  const labels:Record<string,[string,string]>={active:['نشط','Active'],provisional:['بانتظار التحقق','Awaiting verification'],suspended:['موقوف','Suspended'],deleted:['محذوف','Deleted']}
  return labels[status]?.[ar?0:1]??status
}
