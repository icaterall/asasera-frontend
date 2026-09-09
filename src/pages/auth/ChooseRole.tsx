import { Link } from 'react-router-dom'
import { ArrowRight, GraduationCap, Presentation } from 'lucide-react'
import { useAuthCopy } from '@/copy/useAuthCopy'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import styles from './ChooseRole.module.css'

/** Registration starts with a deliberate role choice; each card opens its own signup flow. */
export default function ChooseRole() {
  const { c, dir } = useAuthCopy()
  useDocumentTitle(c.chooseRole.title)
  const options = [
    { role: 'teacher', copy: c.chooseRole.teacher, Icon: Presentation },
    { role: 'student', copy: c.chooseRole.student, Icon: GraduationCap },
  ] as const

  return <section className={`auth-scope auth-section ${styles.section}`} dir={dir} aria-labelledby="register-title">
    <div className={styles.content}>
      <header className={styles.heading}>
        <h1 id="register-title">{c.chooseRole.title}</h1>
        <p>{c.chooseRole.lead}</p>
      </header>
      <ul className={styles.cards}>
        {options.map(({ role, copy, Icon }) => <li key={role}>
          <Link to={`/signup/${role}`} className={styles.card} data-role={role} aria-labelledby={`${role}-action`} aria-describedby={`${role}-description`}>
            <Icon className={styles.icon} size={44} aria-hidden="true" />
            <h2>{copy.title}</h2>
            <p id={`${role}-description`}>{copy.body}</p>
            <span className={styles.action} id={`${role}-action`}>{copy.action}<ArrowRight size={22} aria-hidden="true" /></span>
          </Link>
        </li>)}
      </ul>
      <p className={styles.login}>{c.chooseRole.haveAccount} <Link to="/login" className="auth-link">{c.login.title}</Link></p>
    </div>
  </section>
}
