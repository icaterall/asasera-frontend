import { ArrowRight, Check, ImageOff, Play, RotateCcw, Shuffle, Trophy, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCopy } from '@/copy/useCopy'
import { experienceAr, experienceEn } from '../experience.copy'
import { localizeDemoCard, newDemoRound, rememberDemoRound } from '../demo-quiz'
import { demoMedia } from '../demo-media'
import styles from '../Landing.module.css'

export function AnswerShape({ index }: { index: number }) {
  return <svg viewBox="0 0 32 32" width="24" height="24" aria-hidden="true" className={styles.answerShape}>
    {index === 0 ? <path d="M16 3 30 28H2Z" fill="currentColor" />
      : index === 1 ? <path d="m16 1 15 15-15 15L1 16Z" fill="currentColor" />
        : index === 2 ? <circle cx="16" cy="16" r="14" fill="currentColor" />
          : <rect x="3" y="3" width="26" height="26" rx="1" fill="currentColor" />}
  </svg>
}

export function Hero() {
  const { lang } = useCopy()
  const copy = lang === 'ar' ? experienceAr : experienceEn
  const [round, setRound] = useState(() => newDemoRound())
  const questions = round.map(card => localizeDemoCard(card, lang === 'ar' ? 'ar' : 'en'))
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [complete, setComplete] = useState(false)
  const heading = useRef<HTMLHeadingElement>(null)
  const resultHeading = useRef<HTMLHeadingElement>(null)
  const focusNext = useRef(false)
  const question = questions[index]!

  useEffect(() => { rememberDemoRound(round) }, [round])

  useEffect(() => {
    if (!focusNext.current) return
    focusNext.current = false
    const target = complete ? resultHeading : heading
    target.current?.focus({ preventScroll: true })
  }, [index, complete, selected, round])

  function answer(choice: number) {
    if (selected !== null) return
    setSelected(choice)
    if (choice === question.correct) setScore(value => value + 1)
  }

  function advance() {
    focusNext.current = true
    if (index < questions.length - 1) {
      setIndex(value => value + 1)
      setSelected(null)
    } else {
      setComplete(true)
      if (score > 0 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        void import('canvas-confetti').then(({ default: confetti }) => {
          void confetti({ particleCount: 65, spread: 65, origin: { y: 0.6 }, ticks: 150, disableForReducedMotion: true,
            colors: ['#004ccc', '#e21b3c', '#ffcf36', '#26890c'] })
        }).catch(() => { /* Optional celebration must never block the result. */ })
      }
    }
  }

  function replay() {
    focusNext.current = true
    setComplete(false)
    setIndex(0)
    setSelected(null)
    setScore(0)
    setRound(newDemoRound(round))
  }

  function tryQuiz() {
    document.getElementById('demo')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center' })
    const target = complete ? resultHeading : heading
    target.current?.focus({ preventScroll: true })
  }

  return <section id="top" className={styles.hero} aria-labelledby="landing-title">
    <div className={styles.stageShapes} aria-hidden="true"><span /><span /><span /><span /></div>
    <div className={`${styles.container} ${styles.heroGrid}`}>
      <div className={styles.heroCopy}>
        <h1 id="landing-title">{copy.title}<br /><span>{copy.titleAccent}</span></h1>
        <p>{copy.intro}</p>
        <div className={styles.heroActions}>
          <Link to="/signup/teacher" className={`${styles.action} ${styles.yellowAction}`}>{copy.create}<ArrowRight className={styles.forward} size={20} /></Link>
          <button type="button" className={`${styles.action} ${styles.outlineAction}`} onClick={tryQuiz}><Play size={18} fill="currentColor" />{copy.try}</button>
        </div>
        <p className={styles.heroNote}>{copy.note} · <Link to="/games" className="underline">{copy.games}</Link></p>
        <div className={styles.roleLinks}>
          <Link to="/signup/teacher">{copy.teacher}<ArrowRight size={15} className={styles.forward} /></Link>
          <Link to="/signup/student">{copy.student}<ArrowRight size={15} className={styles.forward} /></Link>
        </div>
      </div>
      <div className={styles.demoWrap}>
        <section id="demo" className={styles.demo} aria-label={copy.demo} data-question-id={complete ? undefined : question.id}>
          <div className={styles.demoTop}><span>{copy.demoNote}</span><button type="button" className={styles.shuffleButton} onClick={replay}><Shuffle size={15} aria-hidden="true" />{copy.shuffle}</button></div>
          {complete ? <div className={styles.result}>
            <Trophy size={48} aria-hidden="true" />
            <h2 ref={resultHeading} tabIndex={-1}>{copy.complete}</h2>
            <p className={styles.score} aria-label={`${copy.scoreLabel}: ${score} ${copy.of} ${questions.length}`}><bdi>{score} / {questions.length}</bdi></p>
            <p>{copy.correctCount}</p><p>{copy.resultBody}</p>
            <div className={styles.resultActions}>
              <button onClick={replay} className={`${styles.action} ${styles.blueAction}`}><RotateCcw size={18} />{copy.replay}</button>
              <Link to="/signup/teacher" className={styles.textAction}>{copy.create}<ArrowRight size={18} className={styles.forward} /></Link>
            </div>
          </div> : <>
            <div className={styles.questionPanel}>
              <div className={styles.questionMeta}><span className={styles.questionCount}>{copy.question} <bdi>{index + 1}</bdi> {copy.of} <bdi>{questions.length}</bdi></span><span className={styles.demoProgress} aria-hidden="true">{questions.map((_, i) => <i key={i} data-active={i <= index} />)}</span></div>
              <div className={styles.photoQuestion}><h2 ref={heading} tabIndex={-1}>{question.title}</h2><QuizPhoto key={question.id} media={demoMedia[question.media]} lang={lang} label={copy.imageLabel} unavailable={copy.imageUnavailable} /></div>
            </div>
            <div className={styles.answers} role="group" aria-label={question.title}>
              {question.answers.map((option, i) => <button key={`${index}-${i}`} type="button" onClick={() => answer(i)}
                className={styles.answer} data-answer={i} data-selected={selected === i} data-muted={selected !== null && i !== question.correct && i !== selected}
                aria-pressed={selected === i} aria-disabled={selected !== null}>
                <AnswerShape index={i} /><span>{option}</span>
                {selected !== null && (i === question.correct ? <Check size={23} aria-label={copy.correct} /> : i === selected ? <X size={23} aria-label={copy.incorrect} /> : null)}
              </button>)}
            </div>
            <div className={styles.feedback} aria-live="polite" aria-atomic="true">
              {selected === null ? <p className={styles.choose}>{copy.choose}</p> : <>
                <div className={styles.feedbackCopy}><strong>{selected === question.correct ? copy.correct : copy.incorrect}</strong><p>{selected !== question.correct && <>{copy.correctAnswer} {question.answers[question.correct]}. </>}{question.explanation}</p></div>
                <button className={`${styles.action} ${styles.blueAction}`} type="button" onClick={advance}>{index === questions.length - 1 ? copy.results : copy.next}<ArrowRight size={17} className={styles.forward} /></button>
              </>}
            </div>
          </>}
        </section>
      </div>
    </div>
    <div className={styles.ribbon} aria-label={lang === 'ar' ? 'تعلّم مع أساسيرا' : 'Learn with Asasera'}>{copy.ribbon.map((label, i) => <span key={label}><AnswerShape index={i} />{label}</span>)}</div>
  </section>
}

function QuizPhoto({ media, lang, label, unavailable }: { media: (typeof demoMedia)[keyof typeof demoMedia]; lang: string; label: string; unavailable: string }) {
  const [failed, setFailed] = useState(false)
  return <figure className={styles.quizPhoto}>
    {failed ? <div className={styles.photoFallback} role="img" aria-label={media[lang === 'ar' ? 'ar' : 'en']}><ImageOff size={26} aria-hidden="true" /><span>{unavailable}</span></div>
      : <img src={media.src} alt={media[lang === 'ar' ? 'ar' : 'en']} width="960" height="640" decoding="async" onError={() => setFailed(true)} />}
    <figcaption>{label}</figcaption>
  </figure>
}
