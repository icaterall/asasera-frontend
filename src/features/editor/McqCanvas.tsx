import {useId,useState} from 'react'
import {useTranslation} from 'react-i18next'
import {ImageUpload,useImage} from './ImageUpload'
import {Button,type AnswerSlot} from '@/design'
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
  mediaKey: string | null
  onMediaChange: (key: string | null) => void
  options: McqOption[]
  correct: string
  onOptionImage:(key:string,image:string|undefined)=>void
  onOptionText: (key: string, text: string) => void
  onCorrect: (key: string) => void
}

export function McqCanvas({
  mediaKey, onMediaChange, options, correct, onOptionText, onOptionImage, onCorrect,
}: McqCanvasProps) {
  const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar')
  const [imageTools,setImageTools]=useState(()=>options.some(option=>!!option.image))
  const optionsId=useId()
  return (
    <>
    <ImageUpload label={ar?'صورة السؤال (اختياري)':'Question image (optional)'} imageKey={mediaKey} onImage={onMediaChange} onRemove={()=>onMediaChange(null)} />
    <Button className={styles.answerImageToggle} variant="quiet" aria-expanded={imageTools} aria-controls={optionsId} onClick={()=>setImageTools(value=>!value)}>
      {imageTools?(ar?'إخفاء خيارات صور الإجابات':'Hide answer image options'):(ar?'خيارات صور الإجابات':'Answer image options')}
    </Button>
    <div id={optionsId} className={styles.options}>
      {options.map((option, index) => {
        const slot = ((index % 4) + 1) as AnswerSlot
        const token = SLOT_TOKENS[slot]
        const isCorrect = option.key === correct

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

            {imageTools&&<div className={styles.optionImageControls}><ImageUpload imageKey={option.image??null} showPreview={false} onImage={image=>onOptionImage(option.key,image)} onRemove={()=>onOptionImage(option.key,undefined)}/></div>}
            <label className={`${styles.correctPick} ${isCorrect ? styles.isCorrect : ''}`}>
              <input
                type="radio"
                name="correct-option"
                checked={isCorrect}
                onChange={() => onCorrect(option.key)}
              />
              {isCorrect ? (ar?'الإجابة الصحيحة':'Correct answer') : (ar?'اجعلها الصحيحة':'Mark correct')}
            </label>
          </div>
        )
      })}
    </div>
    </>
  )
}

export interface TfCanvasProps {
  correct: boolean
  onCorrect: (value: boolean) => void
}

export function TfCanvas({ correct, onCorrect }: TfCanvasProps) {
  const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar')
  /*
   * The wire value is the literal 'true' / 'false', never the rendered label.
   * A translation change must not be able to invert a question — which is
   * exactly what happens when «صح» is the stored answer.
   */

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
    </>
  )
}

function OptionImage({imageKey,text}:{imageKey:string;text:string}){const url=useImage(imageKey);return url?<img className={styles.optionImage} src={url} alt={text}/>:null}
