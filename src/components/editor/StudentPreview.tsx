import { useTranslation } from 'react-i18next'

import { AnswerTile, slotFor } from '@/components/teaching/AnswerTile'
import type { Activity } from '@/lib/api'

/**
 * What a student sees, using the same tiles the class will meet.
 *
 * THE KEY IS NOT PASSED. `correctness` is deliberately never set here: the
 * whole point of a preview is to look at the question the way someone who does
 * not know the answer looks at it, and a preview that quietly marks the right
 * tile tells the teacher nothing about whether the question is answerable.
 *
 * It records nothing. Previewing is not an attempt, and the note says so.
 */
export function StudentPreview({ activity }: { activity: Activity }) {
  const { t } = useTranslation()

  return (
    <div className="ed-canvas ed-region">
      <p className="text-center text-sm font-semibold text-muted">
        {t('teaching.editor.previewNote')}
      </p>

      <h2 className="text-center text-[1.9rem] leading-tight font-bold text-fg">
        {activity.prompt}
      </h2>

      {activity.kind === 'explanation' ? (
        <p className="text-[1.05rem] leading-relaxed whitespace-pre-wrap text-fg">
          {activity.body}
        </p>
      ) : null}

      {activity.kind === 'multiple_choice' ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {activity.options.map((option, index) => (
            <AnswerTile key={option.id} slot={slotFor(index)} as="button">
              {option.text}
            </AnswerTile>
          ))}
        </div>
      ) : null}

      {activity.kind === 'true_false' ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[4, 1].map((slot, index) => (
            <AnswerTile key={slot} slot={slot as 1 | 4} as="button">
              {t(index === 0 ? 'teaching.editor.answerTrue' : 'teaching.editor.answerFalse')}
            </AnswerTile>
          ))}
        </div>
      ) : null}
    </div>
  )
}
