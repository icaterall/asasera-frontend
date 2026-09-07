import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { slotFor, type AnswerSlot } from '@/components/teaching/AnswerTile'

/**
 * An answer the teacher edits in place, on the coloured surface itself.
 *
 * WHY THE TILE IS THE INPUT. The composition this replaces showed a coloured
 * preview and then, further down the page, a plain radio-and-textbox form
 * editing the same four answers. Two representations of one thing means the
 * teacher reads both, edits the quiet one, and checks the loud one — and the
 * page grows by the height of a whole second form. Typing into the tile
 * collapses that: what you edit is what the class will see.
 *
 * CORRECTNESS IS A SEPARATE CONTROL. The four fills are answer identity, so
 * they cannot also mean "this one is right". The check button carries that,
 * and it is a real button with a real accessible name rather than a coloured
 * outline nobody can read out.
 */
export function SlotShape({ slot, size = 22 }: { slot: AnswerSlot; size?: number }) {
  if (slot === 3) {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="currentColor" />
      </svg>
    )
  }
  if (slot === 4) {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="1" fill="currentColor" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d={slot === 1 ? 'M12 3 22 21H2Z' : 'M12 2 22 12 12 22 2 12Z'} fill="currentColor" />
    </svg>
  )
}

export function EditableAnswerTile({
  index,
  value,
  isCorrect,
  canRemove,
  onChange,
  onMarkCorrect,
  onRemove,
}: {
  index: number
  value: string
  isCorrect: boolean
  canRemove: boolean
  onChange: (next: string) => void
  onMarkCorrect: () => void
  onRemove: () => void
}) {
  const { t } = useTranslation()
  const slot: AnswerSlot = slotFor(index)
  const [text, setText] = useState(value)
  const area = useRef<HTMLTextAreaElement>(null)

  /* The server's copy wins when it changes underneath us; the local value is
     intentionally ahead between a keystroke and its blur. */
  useEffect(() => setText(value), [value])

  /* Grows with the answer instead of scrolling inside a fixed box — a long
     option is normal, and a two-line answer hidden behind a scrollbar is the
     kind of thing a teacher only discovers in front of a class. */
  useEffect(() => {
    const node = area.current
    if (!node) return
    node.style.height = 'auto'
    node.style.height = `${node.scrollHeight}px`
  }, [text])

  return (
    <div
      className="tc-tactile relative flex min-h-[104px] items-stretch gap-3 rounded-sm p-3"
      style={{
        background: `var(--tc-slot-${slot})`,
        color: `var(--tc-slot-${slot}-ink)`,
        boxShadow: isCorrect
          ? '0 0 0 3px var(--fg), var(--tc-press-inset)'
          : 'var(--tc-press-lift), var(--tc-press-inset)',
      }}
    >
      <span aria-hidden="true" className="mt-1 shrink-0">
        <SlotShape slot={slot} />
      </span>

      <textarea
        ref={area}
        value={text}
        onChange={(event) => setText(event.target.value)}
        onBlur={() => text !== value && onChange(text)}
        rows={1}
        placeholder={t('teaching.editor.answerPlaceholder')}
        aria-label={t('teaching.editor.answerNumber', { number: index + 1 })}
        className="min-w-0 flex-1 resize-none bg-transparent text-[1.15rem] leading-snug font-bold outline-none placeholder:opacity-60"
        style={{ color: 'inherit' }}
      />

      <div className="flex shrink-0 flex-col items-center gap-1">
        {/*
          Correct and not-correct must be legible at a glance on a coloured
          fill. A bordered box with a tick inside reads as "filled" either way
          once both are drawn in the ink colour, which is exactly what the
          first build did — three answers, three identical-looking ticks.
          Solid-and-opaque against hollow-and-dimmed separates them without
          adding a second hue to a tile that already carries one.
        */}
        <button
          type="button"
          onClick={onMarkCorrect}
          aria-pressed={isCorrect}
          title={t('teaching.editor.markCorrect')}
          className="flex size-9 items-center justify-center rounded-sm border-2 text-lg font-black transition-all duration-200 focus-visible:outline-3 focus-visible:outline-offset-2"
          style={{
            borderColor: 'currentColor',
            background: isCorrect ? 'currentColor' : 'transparent',
            opacity: isCorrect ? 1 : 0.45,
          }}
        >
          <span
            aria-hidden="true"
            style={{ color: isCorrect ? `var(--tc-slot-${slot})` : 'inherit' }}
          >
            ✓
          </span>
          <span className="sr-only">{t('teaching.editor.markCorrect')}</span>
        </button>
        {canRemove ? (
          <button
            type="button"
            onClick={onRemove}
            title={t('teaching.editor.removeAnswer')}
            className="flex size-9 items-center justify-center rounded-sm text-base font-bold opacity-80 transition-opacity duration-200 hover:opacity-100 focus-visible:outline-3 focus-visible:outline-offset-2"
            style={{ color: 'inherit' }}
          >
            <span aria-hidden="true">✕</span>
            <span className="sr-only">{t('teaching.editor.removeAnswer')}</span>
          </button>
        ) : null}
      </div>
    </div>
  )
}
