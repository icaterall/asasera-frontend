import {FormattedInput} from './FormattedInput'
import {useId,useState} from 'react'
import {Check,ImagePlus,Plus,Trash2} from 'lucide-react'
import {useTranslation} from 'react-i18next'
import {ImageRemoveButton,ImageUpload,UploadBar,useImage,type UploadState} from './ImageUpload'
import {MediaField} from './MediaPicker'
import {Button,type AnswerSlot} from '@/design'
import {readInline} from './rich-document'
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
export function hasAnswerContent(option:McqOption):boolean {
  return !!option.image?.trim() || readInline(option.text).some(node=>!!(node.text??node.attrs?.latex??'').trim())
}

export const SLOT_TOKENS: Record<AnswerSlot, { fill: string; fg: string; ar: string; en:string }> = {
  1: { fill: 'var(--a1)', fg: 'var(--on-a1)', ar: 'مثلث', en:'triangle' },
  2: { fill: 'var(--a2)', fg: 'var(--on-a2)', ar: 'معيّن', en:'diamond' },
  3: { fill: 'var(--a3)', fg: 'var(--on-a3)', ar: 'دائرة', en:'circle' },
  4: { fill: 'var(--a4)', fg: 'var(--on-a4)', ar: 'مربع', en:'square' },
  5: { fill: 'var(--a5)', fg: 'var(--on-a5)', ar: 'خماسي', en:'pentagon' },
  6: { fill: 'var(--a6)', fg: 'var(--on-a6)', ar: 'مثلث مقلوب', en:'inverted triangle' },
}

export function Glyph({ slot }: { slot: AnswerSlot }) {
  const p = { className: styles.optionGlyph, viewBox: '0 0 24 24', 'aria-hidden': true as const }
  switch (slot) {
    case 1: return <svg {...p}><path d="M12 3 22 21H2Z" /></svg>
    case 2: return <svg {...p}><path d="M12 2 22 12 12 22 2 12Z" /></svg>
    case 3: return <svg {...p}><circle cx="12" cy="12" r="10" /></svg>
    case 4: return <svg {...p}><rect x="2.5" y="2.5" width="19" height="19" rx="1" /></svg>
    case 5: return <svg {...p}><path d="M12 2.5 22 9.8l-3.8 11.7H5.8L2 9.8Z" /></svg>
    case 6: return <svg {...p}><path d="M12 21 2 3h20Z" /></svg>
  }
}

export const MIN_OPTIONS=2, MAX_OPTIONS=6, DEFAULT_OPTIONS=4

export interface McqCanvasProps {
  onQuestionImageBusy?:(busy:boolean)=>void
  mediaKey: string | null
  onMediaChange: (key: string | null) => void
  options: McqOption[]
  correct: string
  onOptionImage:(key:string,image:string|undefined)=>void
  onOptionText: (key: string, text: string) => void
  onCorrect: (key: string) => void
  onAddOption?: () => void
  onRemoveOption?: (key: string) => void
}

export function McqCanvas({
  mediaKey, onMediaChange, onQuestionImageBusy, options, correct, onOptionText, onOptionImage, onCorrect, onAddOption, onRemoveOption,
}: McqCanvasProps) {
  const {i18n}=useTranslation(),ar=i18n.language.startsWith('ar')
  const optionsId=useId()
  const [uploads,setUploads]=useState<Record<string,UploadState>>({})
  const busyFor=(key:string)=>uploads[key]?.phase==='uploading'||uploads[key]?.phase==='checking'
  return (
    <>
    <MediaField onBusyChange={onQuestionImageBusy} label={ar?'صورة السؤال (اختياري)':'Question image (optional)'} imageKey={mediaKey} onImage={onMediaChange} onRemove={()=>onMediaChange(null)}/>
    <div id={optionsId} className={styles.options}>
      {options.map((option, index) => {
        const slot = (Math.min(index, 5) + 1) as AnswerSlot
        const token = SLOT_TOKENS[slot]
        const hasContent = hasAnswerContent(option)
        const isCorrect = hasContent && option.key === correct

        return (
          <div key={option.key} className={styles.optionCell} data-answer-cell="">
            <div
              className={`${styles.optionTile} ${styles.answerTile}`}
              data-empty={!hasContent}
              style={{ ['--tile' as string]: token.fill, ['--tileFg' as string]: token.fg }}
            >
              <span className={styles.answerLead}>
                <span className={styles.answerShape}><Glyph slot={slot} /></span>
                {onRemoveOption&&options.length>MIN_OPTIONS&&<button type="button" className={styles.answerRemove}
                  aria-label={ar?`احذف الإجابة ${index+1}`:`Remove answer ${index+1}`} title={ar?'احذف هذه الإجابة':'Remove this answer'}
                  onClick={()=>onRemoveOption(option.key)}><Trash2 size={17} aria-hidden="true"/></button>}
              </span>
              <div className={styles.answerContent}>
                {option.image&&<OptionImage imageKey={option.image} text={option.text}
                  onRemove={()=>onOptionImage(option.key,undefined)} label={ar?'احذف صورة الإجابة':'Remove answer image'}/>}
                <FormattedInput className={styles.optionText} value={option.text} maxLength={500} placeholder={option.image?(ar?'نص إضافي (اختياري)':'Text (optional)'):(ar?`أضف إجابة ${index+1}`:`Add answer ${index+1}`)} label={ar?`نص الإجابة ${index+1}`:`Answer ${index+1} text`} onChange={text=>onOptionText(option.key,text)}/>
              </div>
              <div className={styles.answerActions}>
            <label className={styles.correctCircle} data-disabled={!hasContent} title={!hasContent?(ar?'أضف نصًا أو صورة أولًا':'Add text or an image first'):(ar?'الإجابة الصحيحة':'Correct answer')}>
              <input
                type="radio"
                name={`correct-option-${optionsId}`}
                disabled={!hasContent}
                checked={isCorrect}
                aria-label={ar?`الإجابة ${index+1} هي الصحيحة`:`Answer ${index+1} is correct`}
                onChange={() => {if(hasContent)onCorrect(option.key)}}
              />
              <span aria-hidden="true">{isCorrect&&<Check strokeWidth={4}/>}</span>
            </label>
                <button type="button" className={styles.answerImageButton} disabled={busyFor(option.key)} aria-busy={busyFor(option.key)} aria-label={ar?'صورة الإجابة':'Answer image'} title={ar?'إضافة أو استبدال صورة':'Add or replace image'} onClick={event=>event.currentTarget.closest('[data-answer-cell]')?.querySelector<HTMLInputElement>('input[type=file]')?.click()}><ImagePlus size={24}/></button>
              </div>
              {/* One thin bar along the tile's own bottom edge — no status card
                  inside an answer the class is going to read. */}
              <UploadBar state={uploads[option.key]??{phase:'idle',progress:0,error:''}} label={ar?'رفع الصورة':'Image upload'}/>
            </div>
            {/* Headless — the file input only. The tile draws the indicator, and
                the picture carries its own delete. */}
            <ImageUpload compact onProgress={state=>setUploads(current=>({...current,[option.key]:state}))} imageKey={option.image??null} showPreview={false} onImage={image=>onOptionImage(option.key,image)}/>
          </div>
        )
      })}
    </div>
    {(onAddOption||onRemoveOption)&&<div className={styles.answerCount}>
      {onAddOption&&options.length<MAX_OPTIONS&&<Button variant="secondary" icon={<Plus size={17}/>} onClick={onAddOption}>
        {ar?'أضف إجابة أخرى':'Add more answers'}
      </Button>}
      {onRemoveOption&&options.length>DEFAULT_OPTIONS&&<Button variant="quiet" onClick={()=>{
        for(const extra of options.slice(DEFAULT_OPTIONS))onRemoveOption(extra.key)
      }}>{ar?'أزل الإجابات الإضافية':'Remove additional answers'}</Button>}
    </div>}
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
              <span className={styles.correctCircle}>
              <input
                type="radio"
                name="tf-correct"
                checked={isCorrect}
                onChange={() => onCorrect(value === 'true')}
                aria-label={ar?`${label} هي الإجابة الصحيحة`:`${label} is correct`}
              />
              <span aria-hidden="true">{isCorrect&&<Check strokeWidth={4}/>}</span>
              </span>
            </label>
          )
        })}
      </div>
    </>
  )
}

/**
 * The picture, with its own delete over it.
 *
 * Deleting the PICTURE and deleting the ANSWER are different acts with
 * different consequences, so they are different controls in different places:
 * this one sits on the image it removes, and the answer's own bin stays under
 * the shape.
 */
export function OptionImage({imageKey,text,onRemove,label}:{imageKey:string;text:string;onRemove:()=>void;label:string}){
  const url=useImage(imageKey)
  if(!url)return null
  return <span className={styles.optionImageWrap}>
    <img className={styles.optionImage} src={url} alt={text}/>
    <ImageRemoveButton className={styles.optionImageRemove} onRemove={onRemove} label={label}/>
  </span>
}
