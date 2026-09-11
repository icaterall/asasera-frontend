import {BackLink,TitleRow} from '@/design/BackLink'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShieldCheck, Users, UserRound, Settings2, ChartNoAxesCombined } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { LanguageToggle } from '@/components/ui/LanguageToggle'
import { AccountControl } from '@/components/layout/AccountControl'
import { GoogleButton } from '@/components/form/GoogleButton'
import { useAuth } from '@/hooks/useAuth'
import { useAuthOptions } from '@/hooks/useAuthOptions'
import { homePathFor } from '@/lib/afterAuth'
import { LoadingState } from '@/design'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import styles from './Admin.module.css'

export default function AdminLayout() {
  const location = useLocation()
  const {user,status} = useAuth(), {i18n} = useTranslation(), providers = useAuthOptions()
  const ar = i18n.language.startsWith('ar'), t = (a:string,e:string)=>ar?a:e
  useDocumentTitle(t('إدارة أساسيرا','Asasera administration'))
  if(status==='loading') return <LoadingState layout="page"/>
  const header = <header className={styles.header}><Link to="/admin" aria-label="Asasera"><Logo className={styles.logo}/></Link><strong>{t('إدارة أساسيرا','Asasera admin')}</strong><div className={styles.headerActions}><LanguageToggle/>{user && <AccountControl/>}</div></header>
  if(!user || user.role!=='admin') return <div className={`asas ${styles.shell}`} dir={ar?'rtl':'ltr'}>{header}<main className={styles.signIn}>
    <ShieldCheck size={48} aria-hidden="true"/><TitleRow><h1>{t('دخول الإدارة','Admin sign-in')}</h1>{user&&<BackLink to={homePathFor(user)}>{t('العودة إلى حسابك','Back to your account')}</BackLink>}</TitleRow>
    <p>{user?t('هذا الحساب لا يملك صلاحية الإدارة. سجّل الخروج ثم ادخل بحساب Google المصرّح له.','This account does not have admin access. Sign out, then use the authorized Google account.'):t('استخدم حساب Google المصرّح له لإدارة المستخدمين ورصيد المعلّمين.','Use the authorized Google account to manage users and instructor credit.')}</p>
    {!user && (providers.google?<GoogleButton returnTo={location.pathname+location.search+location.hash}/>:<p role="status">{t('تسجيل Google غير متاح حاليًا. أعد المحاولة بعد قليل.','Google sign-in is currently unavailable. Please try again shortly.')}</p>)}
  </main></div>
  return <div className={`asas ${styles.shell}`} dir={ar?'rtl':'ltr'}>{header}<div className={styles.workspace}>
    <aside className={styles.sidebar}><nav aria-label={t('قائمة الإدارة','Admin navigation')}>
      <NavLink to="/admin/overview" className={({isActive})=>isActive?styles.active:undefined}><ChartNoAxesCombined size={21} aria-hidden="true"/>{t('نظرة عامة','Overview')}</NavLink>
      <NavLink to="/admin/users" className={({isActive})=>isActive?styles.active:undefined}><Users size={21} aria-hidden="true"/>{t('المستخدمون والأرصدة','Users & credit')}</NavLink>
      <NavLink to="/admin/ai-settings" className={({isActive})=>isActive?styles.active:undefined}><Settings2 size={21} aria-hidden="true"/>{t('إعدادات الذكاء الاصطناعي','AI settings')}</NavLink>
      <Link to="/account"><UserRound size={21} aria-hidden="true"/>{t('حسابي','My account')}</Link>
    </nav><p><ShieldCheck size={18} aria-hidden="true"/>{t('دخول آمن عبر Google','Google sign-in required')}</p></aside>
    <main id="admin-main" className={styles.main}><Outlet/></main>
  </div></div>
}
