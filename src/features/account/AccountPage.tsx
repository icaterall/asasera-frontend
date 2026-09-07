import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate } from 'react-router-dom'
import { Bdi } from '@/components/Bdi'
import { Button } from '@/design'
import { DeleteAccount } from '@/features/delivery/DeleteAccount'
import { useAuth } from '@/hooks/useAuth'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import { useAuthForm } from '@/hooks/useAuthForm'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { auth, type PublicUser } from '@/lib/api'
import { homePathFor } from '@/lib/afterAuth'
import styles from './AccountPage.module.css'

export default function AccountPage() {
  const { user, status } = useAuth()
  const { i18n } = useTranslation()
  const title = i18n.language.startsWith('ar') ? 'إعدادات الحساب' : 'Account settings'
  useDocumentTitle(title)
  if (status === 'loading') return <p role="status">{i18n.language.startsWith('ar') ? 'جارٍ التحميل…' : 'Loading…'}</p>
  if (!user) return <Navigate to="/login" replace state={{ from: '/account' }} />
  return <Settings key={user.id} user={user} title={title} />
}

function Settings({ user, title }: { user: PublicUser; title: string }) {
  const { i18n } = useTranslation()
  const t = (ar: string, en: string) => i18n.language.startsWith('ar') ? ar : en
  const { applyUser } = useAuth()
  const toMessage = useApiErrorMessage()
  const [saved, setSaved] = useState(false)
  const form = useAuthForm({
    initial: { name: user.name ?? '' },
    validators: { name: value => value.trim().length >= 2 && value.trim().length <= 120 ? null : t('أدخل اسمًا من حرفين إلى 120 حرفًا.', 'Enter a name between 2 and 120 characters.') },
    normalizers: { name: value => value.trim() },
    onError: toMessage,
    onSubmit: async values => { setSaved(false); const result = await auth.updateProfile(values); applyUser(result.user); setSaved(true) },
  })
  return <section className={`asas ${styles.page}`} aria-labelledby="account-heading">
    <Link className={styles.back} to={homePathFor(user)}>{t('العودة إلى مساحتك', 'Back to your workspace')}</Link>
    <h1 id="account-heading">{title}</h1>
    <p className={styles.lead}>{t('حدّث ملفك الشخصي وأدر الوصول إلى حسابك.', 'Update your profile and manage access to your account.')}</p>
    <section className={styles.section} aria-labelledby="profile-heading">
      <h2 id="profile-heading">{t('الملف الشخصي', 'Profile')}</h2>
      <form onSubmit={form.handleSubmit} noValidate className={styles.form}>
        <label htmlFor="account-name">{t('اسم العرض', 'Display name')}</label>
        <input id="account-name" name="name" autoComplete="name" dir="auto" maxLength={120} value={form.values.name} disabled={form.submitting}
          aria-invalid={!!form.errors.name} aria-describedby={form.errors.name ? 'name-error' : 'name-hint'}
          onChange={event => { setSaved(false); form.setValue('name', event.target.value) }} onBlur={form.field('name').onBlur} />
        <p id="name-hint" className={styles.hint}>{t('يظهر هذا الاسم في حسابك، ويُستخدم حرفه الأول في صورة الملف الشخصي.', 'This name appears in your account. Its first letter becomes your profile avatar.')}</p>
        {form.errors.name && <p id="name-error" role="alert" className={styles.error}>{form.errors.name}</p>}
        {form.formError && <p role="alert" className={styles.error}>{form.formError}</p>}
        <div className={styles.actions}><Button type="submit" variant="primary" loading={form.submitting}>{t('حفظ التغييرات', 'Save changes')}</Button>
          {saved && <p role="status">{t('تم حفظ التغييرات.', 'Changes saved.')}</p>}</div>
      </form>
      <dl className={styles.details}>
        <div><dt>{t('البريد الإلكتروني', 'Email address')}</dt><dd><Bdi>{user.email}</Bdi><span>{user.emailVerified ? t('تم التحقق', 'Verified') : t('بانتظار التحقق — استخدم الشريط أعلى الصفحة.', 'Awaiting verification — use the banner above.')}</span></dd></div>
        <div><dt>{t('نوع الحساب', 'Account type')}</dt><dd>{user.role === 'teacher' ? t('معلّم', 'Teacher') : t('طالب', 'Student')}</dd></div>
      </dl>
      <Link className={styles.link} to="/complete-profile">{user.role === 'teacher' ? t('تعديل المادة وجهة العمل', 'Edit subject and workplace') : t('تعديل المادة والمستوى الدراسي', 'Edit subject and study level')}</Link>
    </section>
    <section className={styles.section} aria-labelledby="security-heading">
      <h2 id="security-heading">{t('كلمة المرور والأمان', 'Password and security')}</h2>
      <p>{t('اطلب رابطًا عبر البريد لاختيار كلمة مرور جديدة. إعادة التعيين تنهي جلسات تسجيل الدخول الحالية.', 'Request an email link to choose a new password. Resetting your password ends your current sign-in sessions.')}</p>
      <Link className={styles.link} to="/forgot">{t('إعادة تعيين كلمة المرور', 'Reset password')}</Link>
    </section>
    <section className={`${styles.section} ${styles.help}`} aria-labelledby="help-heading">
      <h2 id="help-heading">{t('هل تحتاج مساعدة؟', 'Need help?')}</h2>
      <Link className={styles.link} to="/contact">{t('تواصل مع الدعم', 'Contact support')}</Link>
    </section>
    <DeleteAccount />
  </section>
}
