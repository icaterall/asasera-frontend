import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * One answer, as a substantial coloured surface.
 *
 * THE SLOT IS PRESENTATION; THE ID IS IDENTITY. A tile knows which of four
 * colour/shape slots it is being drawn in, and nothing else about it. Scoring
 * compares answer ids and never looks at colour, shape, or array position — so
 * shuffling the rendered order cannot change which answer is correct, and a
 * stored attempt can record what the student actually saw without that
 * becoming the thing that grades them.
 *
 * COLOUR IS NEVER THE ONLY CHANNEL. Each slot pairs a fill with a shape, and
 * both sit beside the answer's own text. A student who cannot distinguish the
 * fills still has the shape; a student using a screen reader still has the
 * text, which is the actual label. Colour plus shape plus text is three
 * channels for one meaning, which is what makes it usable on a projector at
 * the back of a room.
 *
 * CORRECTNESS IS NOT A COLOUR. The four fills are answer identity, so they
 * cannot also mean right and wrong. Feedback comes as an explicit mark and a
 * word, layered on top.
 */

export type AnswerSlot = 1 | 2 | 3 | 4

const SHAPES: Record<AnswerSlot, ReactNode> = {
  1: (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 shrink-0">
      <path d="M12 3 22 21H2Z" fill="currentColor" />
    </svg>
  ),
  2: (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 shrink-0">
      <path d="M12 2 22 12 12 22 2 12Z" fill="currentColor" />
    </svg>
  ),
  3: (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 shrink-0">
      <circle cx="12" cy="12" r="10" fill="currentColor" />
    </svg>
  ),
  4: (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 shrink-0">
      <rect x="3" y="3" width="18" height="18" rx="1" fill="currentColor" />
    </svg>
  ),
}

/** Named for assistive technology, so the shape is not silent. */
const SHAPE_KEY: Record<AnswerSlot, string> = {
  1: 'teaching.answer.shapeTriangle',
  2: 'teaching.answer.shapeDiamond',
  3: 'teaching.answer.shapeCircle',
  4: 'teaching.answer.shapeSquare',
}

export function slotFor(index: number): AnswerSlot {
  return ((index % 4) + 1) as AnswerSlot
}

export function AnswerTile({
  slot,
  children,
  correctness,
  selected = false,
  onClick,
  as = 'div',
  disabled = false,
}: {
  slot: AnswerSlot
  children: ReactNode
  /** Shown only after an answer is revealed. Never implied by the fill. */
  correctness?: 'correct' | 'incorrect' | undefined
  selected?: boolean
  onClick?: (() => void) | undefined
  as?: 'div' | 'button'
  disabled?: boolean
}) {
  const { t } = useTranslation()

  const style = {
    background: `var(--tc-slot-${slot})`,
    color: `var(--tc-slot-${slot}-ink)`,
    /* Selection is a ring, not a colour change: recolouring would collide with
       the slot identity the student is using to find the answer. */
    boxShadow: selected
      ? '0 0 0 3px var(--fg), var(--tc-press-inset)'
      : 'var(--tc-press-lift), var(--tc-press-inset)',
  } as const

  const body = (
    <>
      <span aria-hidden="true">{SHAPES[slot]}</span>
      <span className="min-w-0 flex-1 text-start text-[1rem] leading-snug font-bold break-words">
        {children}
      </span>
      {/* The shape's name, for anyone who cannot see it. */}
      <span className="sr-only">{t(SHAPE_KEY[slot] as never)}</span>
      {correctness ? (
        <span className="flex shrink-0 items-center gap-1 text-sm font-bold">
          <span aria-hidden="true">{correctness === 'correct' ? '✓' : '✕'}</span>
          {t(
            correctness === 'correct'
              ? 'teaching.answer.correct'
              : ('teaching.answer.incorrect' as never),
          )}
        </span>
      ) : null}
    </>
  )

  const className =
    'tc-tactile flex min-h-[72px] w-full items-center gap-3 rounded-sm px-4 py-3 ' +
    (as === 'button' ? 'cursor-pointer disabled:cursor-not-allowed' : '')

  if (as === 'button') {
    return (
      <button type="button" onClick={onClick} disabled={disabled} className={className} style={style}>
        {body}
      </button>
    )
  }
  return (
    <div className={className} style={style}>
      {body}
    </div>
  )
}
