import { useId, useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { api, ApiError } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/design'
import styles from './Support.module.css'

type Values = { name: string; email: string; company: string; message: string; website: string }
type Errors = Partial<Record<keyof Values, string>>

export function ContactForm() {
  const { user } = useAuth()
  const { i18n } = useTranslation()
  const t = (ar: string, en: string) => i18n.language.startsWith('ar') ? ar : en
  const id = useId()
  const inFlight = useRef(false)
  const form = useRef<HTMLFormElement>(null)
  const [values, setValues] = useState<Values>({ name: user?.name ?? '', email: user?.email ?? '', company: '', message: '', website: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [failure, setFailure] = useState('')

  function change(key: keyof Values, value: string) {
    setValues(current => ({ ...current, [key]: value }))
    setErrors(current => ({ ...current, [key]: undefined }))
    setFailure('')
  }
  function validate(input: Values): Errors {
    const found: Errors = {}
    if (input.name.length < 2 || input.name.length > 120 || /[\r\n]/.test(input.name)) found.name = t('أدخل اسمًا من حرفين إلى 120 حرفًا.', 'Enter a name between 2 and 120 characters.')
    if (!z.email().max(254).safeParse(input.email).success) found.email = t('أدخل عنوان بريد إلكتروني صالحًا.', 'Enter a valid email address.')
    if (input.company.length > 160 || /[\r\n]/.test(input.company)) found.company = t('أدخل اسم جهة لا يزيد على 160 حرفًا.', 'Use an organization name of 160 characters or fewer.')
    if (input.message.length < 10 || input.message.length > 5000) found.message = t('اكتب رسالة من 10 إلى 5000 حرف.', 'Write a message between 10 and 5,000 characters.')
    return found
  }
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (inFlight.current) return
    const input = { ...values, name: values.name.trim(), email: values.email.trim().toLowerCase(), company: values.company.trim(), message: values.message.trim() }
    const found = validate(input)
    setValues(input); setErrors(found); setFailure('')
    if (Object.keys(found).length) {
      form.current?.querySelector<HTMLElement>(`[name="${Object.keys(found)[0]}"]`)?.focus()
      return
    }
    inFlight.current = true; setBusy(true)
    try {
      await api.post('/api/v1/contact', input, { anonymous: true, signal: AbortSignal.timeout(30_000) })
      setSent(true); setValues(current => ({ ...current, message: '' }))
    } catch (error) {
      setFailure(error instanceof ApiError && error.status === 429
        ? t('أرسلت عدة رسائل مؤخرًا. حاول لاحقًا أو راسل support@asasera.com مباشرةً.', 'You have sent several messages recently. Try later or email support@asasera.com directly.')
        : t('تعذّر تأكيد إرسال رسالتك. احتفظنا بالنص هنا؛ حاول مرة أخرى أو راسل support@asasera.com.', 'We could not confirm your message was sent. Your text is still here; try again or email support@asasera.com.'))
    } finally { inFlight.current = false; setBusy(false) }
  }

  if (sent) return <div className={styles.success} role="status">
    <h3>{t('تم إرسال رسالتك', 'Your message has been sent')}</h3>
    <p>{t('شكرًا لتواصلك. أُرسلت رسالتك إلى support@asasera.com، وسنستخدم بريدك للرد.', 'Thank you for getting in touch. Your message was sent to support@asasera.com. We’ll use your email address to reply.')}</p>
    <Button onClick={() => setSent(false)}>{t('إرسال رسالة أخرى', 'Send another message')}</Button>
  </div>

  function input(key: 'name' | 'email' | 'company', label: string, maxLength: number, autoComplete: string) {
    return <div className={styles.field}>
      <label htmlFor={`${id}-${key}`}>{label}</label>
      <input id={`${id}-${key}`} name={key} value={values[key]} onChange={event => change(key, event.target.value)} maxLength={maxLength}
        type={key === 'email' ? 'email' : 'text'} autoComplete={autoComplete} dir={key === 'email' ? 'ltr' : 'auto'}
        required={key !== 'company'} disabled={busy} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `${id}-${key}-error` : undefined} />
      {errors[key] && <p id={`${id}-${key}-error`} className={styles.error}>{errors[key]}</p>}
    </div>
  }
  return <form ref={form} onSubmit={submit} noValidate className={styles.form} aria-label={t('نموذج التواصل', 'Contact form')} aria-busy={busy}>
    <div className={styles.pair}>
      {input('name', t('الاسم', 'Name'), 120, 'name')}
      {input('email', t('البريد الإلكتروني', 'Email address'), 254, 'email')}
    </div>
    {input('company', t('الجهة (اختياري)', 'Organization (optional)'), 160, 'organization')}
    <div className={styles.field}>
      <label htmlFor={`${id}-message`}>{t('كيف نساعدك؟', 'How can we help?')}</label>
      <textarea id={`${id}-message`} name="message" value={values.message} rows={6} maxLength={5000} required disabled={busy} dir="auto"
        onChange={event => change('message', event.target.value)} aria-invalid={!!errors.message} aria-describedby={`${id}-hint${errors.message ? ` ${id}-message-error` : ''}`} />
      <p id={`${id}-hint`} className={styles.hint}>{t('من 10 إلى 5000 حرف. لا ترسل كلمات مرور أو بيانات دفع.', '10–5,000 characters. Keep passwords and payment details out of your message.')}</p>
      {errors.message && <p id={`${id}-message-error`} className={styles.error}>{errors.message}</p>}
    </div>
    <div className={styles.honeypot} aria-hidden="true"><label htmlFor={`${id}-website`}>Website</label><input id={`${id}-website`} name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={event => change('website', event.target.value)} /></div>
    {failure && <p className={styles.error} role="alert">{failure}</p>}
    <div className={styles.actions}><Button type="submit" variant="primary" loading={busy}>{busy ? t('جارٍ الإرسال…', 'Sending…') : t('إرسال الرسالة', 'Send message')}</Button>
      <p>{t('إلى فريق أساسيرا على', 'To the Asasera team at')} <a href="mailto:support@asasera.com"><bdi>support@asasera.com</bdi></a></p></div>
  </form>
}
