import {FormattedText,plainFormattedText} from '@/components/formatted-text/FormattedText'
import {Check,X} from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

import styles from './AnswerTile.module.css'

/**
 * One of the four answer slots — plan §4 #3, §5, §8.
 *
 * The slot index is the ONLY input that picks appearance. Colour and shape
 * travel together by construction, so the same slot is the same red triangle
 * in the editor preview, on the projector and on the player's phone. There is
 * deliberately no `colour` prop and no `shape` prop.
 */

export const ANSWER_SLOTS = [1, 2, 3, 4] as const
export type AnswerSlot = (typeof ANSWER_SLOTS)[number]

/** Shape names in both languages, for the accessible name. */
const SHAPE_NAMES: Record<AnswerSlot, { ar: string; en: string }> = {
  1: { ar: 'مثلث', en: 'triangle' },
  2: { ar: 'معيّن', en: 'diamond' },
  3: { ar: 'دائرة', en: 'circle' },
  4: { ar: 'مربع', en: 'square' },
}

const SLOT_CLASS: Record<AnswerSlot, string> = {
  1: styles.s1!, 2: styles.s2!, 3: styles.s3!, 4: styles.s4!,
}

/*
 * Geometry only — no stroke, no gradient. Drawn in a 24-box so a slot can be
 * scaled by font-size alone and stay aligned with the label's baseline.
 */
function Glyph({ slot }: { slot: AnswerSlot }) {
  const common = { className: styles.glyph, viewBox: '0 0 24 24', 'aria-hidden': true as const }
  switch (slot) {
    case 1: return <svg {...common}><path d="M12 3 22 21H2Z" /></svg>
    case 2: return <svg {...common}><path d="M12 2 22 12 12 22 2 12Z" /></svg>
    case 3: return <svg {...common}><circle cx="12" cy="12" r="10" /></svg>
    case 4: return <svg {...common}><rect x="2.5" y="2.5" width="19" height="19" rx="1" /></svg>
  }
}

export type AnswerState = 'idle' | 'selected' | 'pending' | 'correct' | 'incorrect'

/* `slot` shadows the HTML slot attribute, which is a string. Ours is the
   answer position, so the DOM one is omitted rather than widened — nothing
   here is ever placed in a shadow-DOM slot. */
export interface AnswerTileProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'slot'> {
  slot: AnswerSlot
  /** The option text. Required even when `shapeOnly` — it becomes the accessible name. */
  label: string
  state?: AnswerState
  /**
   * Classroom mode: the phone shows shape and colour only and the wording is
   * on the projector (§8). The text stays in the accessible name.
   */
  shapeOnly?: boolean
  /** Projector scale, 40–72px (§4 #4). */
  stage?: boolean
  locale?: 'ar' | 'en'
  /** Distribution count etc., shown on reveal. */
  trailing?: ReactNode
}

export function AnswerTile({
  slot, label, state = 'idle', shapeOnly = false, stage = false,
  locale = 'ar', trailing, className, disabled, ...rest
}: AnswerTileProps) {
  const shape = SHAPE_NAMES[slot][locale]

  /*
   * The accessible name always carries the shape, then the wording. A pupil
   * using a screen reader in classroom mode hears «مثلث: باريس» while the
   * screen shows only the triangle — which is the same information the room
   * gets from the projector, not less.
   */
  const wording = plainFormattedText(label).trim()
  const accessibleName = wording ? (shapeOnly ? `${shape}: ${wording}` : wording) : `${locale === 'ar' ? 'إجابة بصورة' : 'Image answer'}: ${shape}`

  /*
   * State is announced as text, never left to colour. `.correct` also draws an
   * outline and a mark; this is what a colour-blind user and a screen-reader
   * user get, and they get the same thing.
   */
  const stateWord =
    state === 'correct' ? (locale === 'ar' ? 'إجابة صحيحة' : 'correct answer')
    : state === 'incorrect' ? (locale === 'ar' ? 'إجابة خاطئة' : 'incorrect answer')
    : state === 'selected' ? (locale === 'ar' ? 'مختار' : 'selected')
    : state === 'pending' ? (locale === 'ar' ? 'قيد الإرسال' : 'sending')
    : null

  return (
    <button
      type="button"
      className={[
        styles.tile, SLOT_CLASS[slot],
        stage ? styles.stage : '',
        shapeOnly ? styles.shapeOnly : '',
        state === 'correct' ? styles.correct : '',
        state === 'incorrect' ? styles.incorrect : '',
        state === 'selected' ? styles.selected : '',
        state === 'pending' ? styles.pending : '',
        className ?? '',
      ].filter(Boolean).join(' ')}
      aria-label={shapeOnly || stateWord || !wording ? `${accessibleName}${stateWord ? `، ${stateWord}` : ''}` : undefined}
      aria-pressed={state === 'selected' ? true : undefined}
      disabled={disabled}
      {...rest}
    >
      <Glyph slot={slot} />
      {!shapeOnly && <span className={styles.label}><FormattedText text={label}/></span>}
      {stateWord && !shapeOnly && state !== 'selected' && state !== 'pending' && (
        <span className={styles.mark}>
          {state === 'correct' ? <Check size={16} aria-hidden="true"/> : <X size={16} aria-hidden="true"/>}
          {stateWord}
        </span>
      )}
      {trailing != null && <span className={styles.mark}>{trailing}</span>}
    </button>
  )
}
