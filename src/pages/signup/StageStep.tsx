import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthCard } from '@/components/form/AuthCard'
import { useAuthCopy } from '@/copy/useAuthCopy'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSignup } from '@/hooks/useSignup'
import { StageGradePicker } from '@/features/student/StageGradePicker'
import { generalLearning } from '@/shared/student'
import styles from '@/features/student/Student.module.css'

export default function StageStep() {
  const { lang } = useAuthCopy(), ar = lang === 'ar'
  const { draft, begin, setLearningProfile } = useSignup(), navigate = useNavigate()
  const [profile, setProfile] = useState(draft?.learningProfile ?? generalLearning)
  const [valid, setValid] = useState(profile.educationStageId == null)
  useEffect(() => { begin('student') }, [begin])
  const title = ar ? 'تعلّم يناسب مرحلتك' : 'Learning that fits your stage'
  useDocumentTitle(title)
  return <AuthCard title={title} lead={ar ? 'اختر مرحلتك لنجهّز مساحة تعلّم تناسبك، أو اختر تعلّمًا عامًا.' : 'Choose your stage to personalize your learning space, or keep it general.'} width="choice">
    <form className={`asas ${styles.profileForm}`} onSubmit={event => { event.preventDefault(); if (!valid) return; setLearningProfile(profile); navigate('/signup/student/method') }}>
      <StageGradePicker value={profile} onChange={setProfile} ar={ar} onValidityChange={setValid} />
      <button className={styles.primary} type="submit" disabled={!valid}>{ar ? 'متابعة' : 'Continue'}</button>
    </form>
  </AuthCard>
}
