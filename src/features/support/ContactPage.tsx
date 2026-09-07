import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { ContactSection } from './ContactSection'
export default function ContactPage() {
  const { i18n } = useTranslation()
  useDocumentTitle(i18n.language.startsWith('ar') ? 'تواصل مع الدعم' : 'Contact support')
  return <ContactSection page />
}
