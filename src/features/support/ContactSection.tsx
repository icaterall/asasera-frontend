import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'
import { ContactForm } from './ContactForm'
import styles from './Support.module.css'

export function ContactSection({ page = false }: { page?: boolean }) {
  const { i18n } = useTranslation()
  const { user } = useAuth()
  const ar = i18n.language.startsWith('ar')
  const Heading = page ? 'h1' : 'h2'
  return <section id="departments" aria-labelledby="contact-title" className={`asas ${styles.section} ${page ? styles.page : ''} ${page && user ? styles.signedIn : ''}`}>
    <div className={styles.content}>
      <div className={styles.intro}>
        <Heading id="contact-title">{ar ? 'لنتحدث' : 'Let’s talk'}</Heading>
        <p>{ar ? 'لديك سؤال عن حسابك، أو تحتاج مساعدة في نشاط، أو تريد استخدام أساسيرا مع فريقك؟ أرسل لنا رسالة.' : 'Have a question about your account, need help with an activity, or want to use Asasera with your team? Send us a message.'}</p>
      </div>
      <ContactForm />
    </div>
  </section>
}
