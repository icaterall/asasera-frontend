import { ArrowRight } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCopy } from '@/copy/useCopy'
import { CODE_LENGTH, joinPath, normaliseCode } from '../ui/codeFormat'
import { experienceAr, experienceEn } from '../experience.copy'
import styles from '../Landing.module.css'

export function JoinStrip() {
  const { lang } = useCopy()
  const copy = lang === 'ar' ? experienceAr : experienceEn
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [error, setError] = useState<'empty' | 'short' | null>(null)
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (code.length < CODE_LENGTH) { setError(code.length ? 'short' : 'empty'); return }
    navigate(joinPath(code))
  }
  return <section id="join" className={styles.join} aria-labelledby="join-title"><div className={`${styles.container} ${styles.joinInner}`}>
    <div><h2 id="join-title">{copy.joinTitle}</h2><p>{copy.joinBody}</p></div>
    <form onSubmit={onSubmit} noValidate className={styles.joinForm}>
      <label className="sr-only" htmlFor="join-code">{copy.joinPlaceholder}</label>
      <input id="join-code" name="joinCode" dir="ltr" value={code} onChange={event => { setCode(normaliseCode(event.target.value)); setError(null) }} inputMode="numeric" autoComplete="one-time-code" spellCheck={false} placeholder={copy.joinPlaceholder} aria-invalid={error ? true : undefined} aria-describedby={error ? 'join-error' : undefined} />
      <button type="submit" className={`${styles.action} ${styles.blueAction}`}>{copy.join}<ArrowRight size={18} className={styles.forward} /></button>
      {error && <p id="join-error" role="alert">{error === 'empty' ? copy.joinEmpty : copy.joinShort}</p>}
    </form>
  </div></section>
}
