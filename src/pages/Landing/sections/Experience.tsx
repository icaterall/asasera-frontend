import { ArrowRight, Check, CircleHelp, FileText, Image, ListOrdered, MousePointer2, Sparkles, Users } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import studentPhoto from '@/assets/images/hero-media.jpg'
import { useCopy } from '@/copy/useCopy'
import { experienceAr, experienceEn } from '../experience.copy'
import { AnswerShape } from './Hero'
import styles from '../Landing.module.css'

export function Experience() {
  const { lang } = useCopy()
  const copy = lang === 'ar' ? experienceAr : experienceEn
  const [step, setStep] = useState(0)
  const icons = [CircleHelp, Check, ListOrdered, MousePointer2, Image]

  return <>
    <section id="how" className={styles.workflow} aria-labelledby="workflow-title">
      <div className={styles.container}>
        <div className={styles.sectionIntro}><h2 id="workflow-title">{copy.howTitle}</h2><p>{copy.howBody}</p></div>
        <div className={styles.workflowGrid}>
          <div className={styles.steps} aria-label={copy.workflow}>
            {copy.steps.map((item, i) => <button type="button" key={i} onClick={() => setStep(i)} aria-pressed={step === i} aria-controls="workflow-preview" className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">{i + 1}</span><span><strong>{item.title}</strong><span>{item.body}</span></span><ArrowRight size={20} className={styles.forward} />
            </button>)}
            <Link to="/register" className={`${styles.action} ${styles.blueAction}`}>{copy.steps[step]!.action}<ArrowRight size={18} className={styles.forward} /></Link>
          </div>
          <div id="workflow-preview" className={styles.workflowPreview} data-step={step} role="region" aria-label={`${copy.example}: ${copy.steps[step]!.title}`}>
            <div className={styles.previewLabel}><span>{copy.example}</span><span><bdi>{step + 1} / 3</bdi></span></div>
            {step === 0 ? <div className={styles.sourcePreview}>
              <div className={styles.sourceToolbar}><FileText size={22} /><span>{copy.sourceFile}</span><span className={styles.pdfBadge}>PDF</span></div>
              <div className={styles.sourcePage}>
                <div className={styles.sourcePageTop}><span>{copy.source}</span><span>{copy.sourcePage}</span></div>
                <h3>{copy.sourceHeading}</h3><p>{copy.sourceText}</p>
                <div className={styles.sourceLines} aria-hidden="true"><span /><span /><span /></div>
                <div className={styles.sourceFormula} aria-hidden="true"><span>6CO₂</span><b>+</b><span>6H₂O</span><b>→</b><span>C₆H₁₂O₆</span><b>+</b><span>6O₂</span></div>
              </div>
              <p className={styles.previewFoot}><Sparkles size={18} />{copy.sourceSelection}</p>
            </div> : step === 1 ? <div className={styles.editorPreview}>
              <p className={styles.sourceLinked}><FileText size={16} />{copy.sourceLink} · {copy.sourcePage}</p>
              <h3>{copy.editorTitle}</h3>
              <div className={styles.miniAnswers}>{copy.editorOptions.map((answer, i) => <div key={i} data-answer={i}><AnswerShape index={i} /><span>{answer}</span>{i === 0 && <Check size={18} />}</div>)}</div>
              <p className={styles.previewFoot}><Check size={18} />{copy.editorNote}</p>
            </div> : <div className={styles.livePreview}>
              <Users size={38} aria-hidden="true" /><h3>{copy.liveTitle}</h3><p>{copy.liveBody}</p>
              <div className={styles.codePreview}><span>{copy.liveCode}</span><bdi>A7K2M9</bdi></div>
              <p className={styles.previewFoot}>{copy.liveFooter}</p>
            </div>}
          </div>
        </div>
        <div id="types" className={styles.types}>
          <div><h3>{copy.typesTitle}</h3><p>{copy.typesBody}</p></div>
          <ul>{copy.types.map((type, i) => { const Icon = icons[i]!; return <li key={type}><Icon size={20} /><span>{type}</span></li> })}</ul>
        </div>
      </div>
    </section>
    <section className={styles.roles} aria-labelledby="roles-title"><div className={styles.container}>
      <h2 id="roles-title">{copy.rolesTitle}</h2>
      <div className={styles.roleGrid}>
        <article className={styles.teacherRole}>
          <div className={styles.teacherArt} aria-hidden="true"><div className={styles.teacherShapes}>{[0, 1, 2, 3].map(i => <span key={i} data-answer={i}><AnswerShape index={i} /></span>)}</div><strong>{copy.teacherArtTitle}</strong><span>{copy.teacherArtBody}</span></div>
          <div className={styles.roleContent}><h3>{copy.teacherTitle}</h3><p>{copy.teacherBody}</p><Link to="/register" className={`${styles.action} ${styles.blueAction}`}>{copy.teacherAction}<ArrowRight size={18} className={styles.forward} /></Link></div>
        </article>
        <article className={styles.studentRole}>
          <div className={styles.studentPhoto}><img src={studentPhoto} width="734" height="882" alt={copy.photoAlt} loading="lazy" /><span>{copy.studentTitle}</span></div>
          <div className={styles.roleContent}><h3>{copy.student}</h3><p>{copy.studentBody}</p><Link to="/register" className={`${styles.action} ${styles.blueAction}`}>{copy.studentAction}<ArrowRight size={18} className={styles.forward} /></Link></div>
        </article>
      </div>
    </div></section>
  </>
}
