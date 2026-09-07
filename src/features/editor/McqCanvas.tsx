import {useTranslation} from 'react-i18next'
import {ImageUpload,useImage} from './ImageUpload'
import type { AnswerSlot } from '@/design'
import styles from './Editor.module.css'

/**
 * The canvas for a multiple-choice or true/false question.
 *
 * §12: «السؤال ← الوسائط ← الخيارات، معروضة كما يراها الطالب» — prompt, then
 * media, then options, shown as the pupil sees them. So the option editor is
 * the answer tile itself: the teacher types onto the same red triangle the
 * class will see, rather than into a grey form field that turns into one later.
 */

export interface McqOption { key: string; text: string; image?:string }

const SLOT_TOKENS: Record<AnswerSlot, { fill: string; fg: string; ar: string; en:string }> = {
  1: { fill: 'var(--a1)', fg: 'var(--on-a1)', ar: 'مثلث', en:'triangle' },
  2: { fill: 'var(--a2)', fg: 'var(--on-a2)', ar: 'معيّن', en:'diamond' },
  3: { fill: 'var(--a3)', fg: 'var(--on-a3)', ar: 'دائرة', en:'circle' },
  4: { fill: 'var(--a4)', fg: 'var(--on-a4)', ar: 'مربع', en:'square' },
}

function Glyph({ slot }: { slot: AnswerSlot }) {
  const p = { className: styles.optionGlyph, viewBox: '0 0 24 24', 'aria-hidden': true as const }
  switch (slot) {
    case 1: return <svg {...p}><path d="M12 3 22 21H2Z" /></svg>
    case 2: return <svg {...p}><path d="M12 2 22 12 12 22 2 12Z" /></svg>
    case 3: return <svg {...p}><circle cx="12" cy="12" r="10" /></svg>
    case 4: return <svg {...p}><rect x="2.5" y="2.5" width="19" height="19" rx="1" /></svg>
  }
}

export interface McqCanvasProps {
  options: McqOption[]
  correct: string
  reasons: Record<string, string>
  onOptionImage:(key:string,image:string|undefined)=>void
  onOptionText: (key: string, text: string) => void
  onCorrect: (key: string) => void
  onReason: (key: string, reason: string) => void
  /** Highlights the options a failed publish attempt named. */
  flagged?: Set<string>
}

export function McqCanvas({
  options, correct, reasons, onOptionText, onOptionImage, onCorrect, onReason, flagged,
}: McqCanvasProps) {
  const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar')
  return (
    <div className={styles.options}>
      {options.map((option, index) => {
        const slot = ((index % 4) + 1) as AnswerSlot
        const token = SLOT_TOKENS[slot]
        const isCorrect = option.key === correct
        const reason = reasons[option.key] ?? ''
        const missing = !isCorrect && reason.trim().length === 0

        return (
          <div key={option.key} className={styles.optionCell}>
            <div
              className={styles.optionTile}
              style={{ ['--tile' as string]: token.fill, ['--tileFg' as string]: token.fg }}
            >
              <Glyph slot={slot} />
              {option.image&&<OptionImage imageKey={option.image} text={option.text}/>}
              <input
                className={styles.optionText}
                value={option.text}
                placeholder={ar?`إجابة ${token.ar}`:`Answer ${token.en}`}
                aria-label={ar?`نص الخيار ${token.ar}`:`Answer text ${token.en}`}
                onChange={(event) => onOptionText(option.key, event.target.value)}
              />
            </div>

            <details className={styles.optionImageControls}><summary>{ar?'صورة الخيار':'Answer image'}</summary><ImageUpload imageKey={option.image??null} showPreview={false} onImage={image=>onOptionImage(option.key,image)} onRemove={()=>onOptionImage(option.key,undefined)}/></details>
            <label className={`${styles.correctPick} ${isCorrect ? styles.isCorrect : ''}`}>
              <input
                type="radio"
                name="correct-option"
                checked={isCorrect}
                onChange={() => onCorrect(option.key)}
              />
              {isCorrect ? (ar?'الإجابة الصحيحة':'Correct answer') : (ar?'اجعلها الصحيحة':'Mark correct')}
            </label>

            {/*
              * The reason field appears only under a WRONG option, and it is
              * removed — not disabled — from the correct one. §12 asks «لماذا
              * قد يختار الطالب هذا؟», which has no meaning for the answer.
              * Marking a different option correct moves the field with it.
              */}
            {!isCorrect && (
              <div className={styles.reason}>
                <label className={styles.reasonLabel} htmlFor={`reason-${option.key}`}>
                  {ar?'لماذا قد يختار الطالب هذا؟':'Why might a learner choose this?'} {missing && <span style={{ color: 'var(--a3)' }}>{ar?'· مطلوب قبل النشر':'· Required before publication'}</span>}
                </label>
                <textarea
                  id={`reason-${option.key}`}
                  className={`${styles.reasonInput} ${missing || flagged?.has(option.key) ? styles.reasonMissing : ''}`}
                  value={reason}
                  rows={2}
                  onChange={(event) => onReason(option.key, event.target.value)}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export interface TfCanvasProps {
  correct: boolean
  reasons: Record<string, string>
  onCorrect: (value: boolean) => void
  onReason: (key: string, reason: string) => void
}

export function TfCanvas({ correct, reasons, onCorrect, onReason }: TfCanvasProps) {
  const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar')
  /*
   * The wire value is the literal 'true' / 'false', never the rendered label.
   * A translation change must not be able to invert a question — which is
   * exactly what happens when «صح» is the stored answer.
   */
  const wrongKey = correct ? 'false' : 'true'
  const reason = reasons[wrongKey] ?? ''

  return (
    <>
      <div className={styles.tfRow}>
        {([['true', ar?'صح':'True', 1], ['false', ar?'خطأ':'False', 2]] as const).map(([value, label, slot]) => {
          const token = SLOT_TOKENS[slot as AnswerSlot]
          const isCorrect = (value === 'true') === correct
          return (
            <label
              key={value}
              className={styles.optionTile}
              style={{ ['--tile' as string]: token.fill, ['--tileFg' as string]: token.fg, flex: '1 1 200px', cursor: 'pointer' }}
            >
              <Glyph slot={slot as AnswerSlot} />
              <span className={styles.optionText} style={{ fontWeight: 700 }}>{label}</span>
              <input
                type="radio"
                name="tf-correct"
                checked={isCorrect}
                onChange={() => onCorrect(value === 'true')}
                aria-label={ar?`${label} هي الإجابة الصحيحة`:`${label} is correct`}
              />
            </label>
          )
        })}
      </div>
      <div className={styles.reason}>
        <label className={styles.reasonLabel} htmlFor="reason-tf">
          {ar?`لماذا قد يختار الطالب «${wrongKey === 'true' ? 'صح' : 'خطأ'}»؟`:`Why might a learner choose ${wrongKey}?`}
          {reason.trim().length === 0 && <span style={{ color: 'var(--a3)' }}>{ar?' · مطلوب قبل النشر':' · Required before publication'}</span>}
        </label>
        <textarea
          id="reason-tf"
          className={`${styles.reasonInput} ${reason.trim().length === 0 ? styles.reasonMissing : ''}`}
          value={reason}
          rows={2}
          onChange={(event) => onReason(wrongKey, event.target.value)}
        />
      </div>
    </>
  )
}

function OptionImage({imageKey,text}:{imageKey:string;text:string}){const url=useImage(imageKey);return url?<img className={styles.optionImage} src={url} alt={text}/>:null}
