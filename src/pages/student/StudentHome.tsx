import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AccountControl } from '@/components/layout/AccountControl'
import { VerifyEmailBanner } from '@/components/layout/VerifyEmailBanner'
import { Logo } from '@/components/ui/Logo'
import { LanguageToggle } from '@/components/ui/LanguageToggle'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useAuth } from '@/hooks/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { assignmentPath, normalizePin } from '@/lib/joinInput'
import styles from './StudentHome.module.css'

export default function StudentHome() {
  const { status, user } = useAuth()
  const { i18n } = useTranslation()
  const ar = i18n.language.startsWith('ar')
  const t = (arabic: string, english: string) => ar ? arabic : english
  const navigate = useNavigate()
  const [pin, setPin] = useState('')
  const [link, setLink] = useState('')
  const [pinError, setPinError] = useState('')
  const [linkError, setLinkError] = useState('')
  useDocumentTitle(t('تعلّمك', 'Your learning'))

  if (status === 'loading') return <main className={styles.loading} role="status">{t('جارٍ فتح حسابك…', 'Opening your account…')}</main>
  if (!user) return <Navigate to="/login" replace state={{ from: '/student' }} />
  if (user.role !== 'student') return <Navigate to="/teacher/dashboard" replace />

  function join(event: FormEvent) {
    event.preventDefault()
    if (pin.length !== 6) { setPinError(t('أدخل الرمز المكوّن من ستة أرقام الذي يعرضه معلّمك.', 'Enter the six-digit PIN shown by your teacher.')); return }
    navigate(`/join?pin=${pin}`)
  }
  function open(event: FormEvent) {
    event.preventDefault()
    const path = assignmentPath(link, window.location.origin)
    if (!link.trim() || !path) { setLinkError(t('الصق رابط نشاط أساسيرا الكامل الذي شاركه معلّمك.', 'Paste the full Asasera activity link shared by your teacher.')); return }
    navigate(path)
  }

  return <div className={`asas ${styles.shell}`}>
    <a className={styles.skip} href="#student-main">{t('انتقل إلى المحتوى', 'Skip to content')}</a>
    <VerifyEmailBanner />
    <header className={styles.header}>
      <Link to="/student" aria-label={t('الرئيسية', 'Home')}><Logo /></Link>
      <div className={styles.controls}><LanguageToggle /><ThemeToggle /><AccountControl /></div>
    </header>
    <main id="student-main" className={styles.main}>
      <div className={styles.intro}><h1>{t('تعلّمك', 'Your learning')}</h1><p>{t('جاهز؟ انضمّ إلى حصّة مباشرة أو افتح نشاطًا شاركه معلّمك.', 'Ready? Join a live class or open an activity your teacher shared.')}</p></div>
      <section className={styles.live} aria-labelledby="live-title">
        <div><h2 id="live-title">{t('انضمّ إلى الحصّة', 'Join the class')}</h2><p>{t('سيعرض معلّمك الرمز عند بدء الحصّة.', 'Your teacher will show a PIN when the class is ready.')}</p></div>
        <form onSubmit={join} noValidate>
          <label htmlFor="student-pin">{t('رمز اللعبة', 'Game PIN')}</label>
          <input id="student-pin" value={pin} onChange={event => { setPin(normalizePin(event.target.value)); setPinError('') }} inputMode="numeric" autoComplete="off" dir="ltr" placeholder="123 456" aria-invalid={!!pinError} aria-describedby={pinError ? 'pin-error' : undefined} />
          {pinError && <p id="pin-error" className={styles.error} role="alert">{pinError}</p>}
          <button type="submit" className={styles.join}>{t('انضمّ', 'Join')}</button>
        </form>
      </section>
      <section className={styles.assignment} aria-labelledby="assignment-title">
        <h2 id="assignment-title">{t('لديك رابط نشاط؟', 'Have an activity link?')}</h2>
        <p>{t('الصق رابط الواجب أو التعلّم الذاتي الذي أرسله معلّمك.', 'Paste a homework or self-study link from your teacher.')}</p>
        <form onSubmit={open} noValidate>
          <label htmlFor="student-link">{t('رابط النشاط', 'Activity link')}</label>
          <div className={styles.linkRow}><input id="student-link" value={link} onChange={event => { setLink(event.target.value); setLinkError('') }} autoComplete="off" inputMode="url" dir="ltr" placeholder={`${window.location.origin}/learn/…`} aria-invalid={!!linkError} aria-describedby={linkError ? 'link-error' : undefined} /><button type="submit">{t('افتح النشاط', 'Open activity')}</button></div>
          {linkError && <p id="link-error" className={styles.error} role="alert">{linkError}</p>}
        </form>
      </section>
      <footer className={styles.footer}><p>{t('تحتاج مساعدة؟ اطلب الرمز أو الرابط من معلّمك.', 'Need a hand? Ask your teacher for a PIN or activity link.')}</p><Link to="/complete-profile">{t('مستواك الدراسي', 'Your study level')}</Link></footer>
    </main>
  </div>
}
