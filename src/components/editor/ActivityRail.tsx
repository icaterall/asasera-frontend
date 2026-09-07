import { useTranslation } from 'react-i18next'

import { SlotShape } from './EditableAnswerTile'
import { slotFor } from '@/components/teaching/AnswerTile'
import type { Activity, Lesson } from '@/lib/api'

/**
 * The lesson, as an ordered strip of thumbnails.
 *
 * A THUMBNAIL IS A PICTURE, NOT A LIST ROW. Each one carries the miniature
 * answer layout in its real colours, so the teacher recognises question three
 * by its shape before reading a word of it. That is the whole reason the rail
 * beats a dropdown: recognition instead of reading.
 *
 * Reorder is buttons, not drag. Drag with no keyboard equivalent excludes
 * anyone not using a mouse, and the existing reorder contract takes an array of
 * ids — which is exactly what two buttons produce.
 */
export function ActivityRail({
  lesson,
  activeId,
  onSelect,
  onAdd,
  onGenerate,
  onMove,
  onDelete,
}: {
  lesson: Lesson
  activeId: number | null
  onSelect: (id: number) => void
  onAdd: (kind: 'multiple_choice' | 'true_false' | 'explanation') => void
  onGenerate: () => void
  onMove: (index: number, direction: -1 | 1) => void
  onDelete: (id: number) => void
}) {
  const { t } = useTranslation()

  return (
    <div className="ed-panel ed-region flex flex-col">
      <ul className="flex flex-col gap-2 p-2">
        {lesson.activities.map((activity, index) => (
          <li key={activity.id}>
            <button
              type="button"
              className="ed-thumb"
              aria-current={activity.id === activeId}
              onClick={() => onSelect(activity.id)}
            >
              <span className="flex items-center gap-1.5 text-[0.7rem] font-bold text-muted">
                <span>{index + 1}</span>
                <span className="truncate">{kindLabel(activity.kind, t)}</span>
              </span>
              <span className="mt-1 line-clamp-2 block text-[0.78rem] leading-snug font-semibold text-fg">
                {activity.prompt || t('teaching.editor.untitled')}
              </span>
              <Miniature activity={activity} />
            </button>

            {activity.id === activeId ? (
              <div className="mt-1 flex items-center gap-1 px-1">
                <RailIcon
                  label={t('teaching.editor.moveUp')}
                  disabled={index === 0}
                  onClick={() => onMove(index, -1)}
                >
                  ↑
                </RailIcon>
                <RailIcon
                  label={t('teaching.editor.moveDown')}
                  disabled={index === lesson.activities.length - 1}
                  onClick={() => onMove(index, 1)}
                >
                  ↓
                </RailIcon>
                <RailIcon
                  label={t('teaching.editor.removeActivity')}
                  tone="danger"
                  onClick={() => onDelete(activity.id)}
                >
                  ✕
                </RailIcon>
              </div>
            ) : null}
          </li>
        ))}
      </ul>

      {/* Pinned to the bottom of the rail, so the two ways to get another
          activity are always in the same place regardless of lesson length. */}
      <div className="mt-auto flex flex-col gap-2 border-t border-line p-2">
        <div className="flex flex-col gap-1">
          {(['multiple_choice', 'true_false', 'explanation'] as const).map((kind) => (
            <button
              key={kind}
              type="button"
              onClick={() => onAdd(kind)}
              className="rounded-sm border border-line px-2 py-2 text-start text-[0.78rem] font-semibold text-fg transition-colors duration-200 hover:border-accent focus-visible:outline-3 focus-visible:outline-accent focus-visible:outline-offset-2"
            >
              + {kindLabel(kind, t)}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onGenerate}
          className="tc-tactile rounded-sm px-2 py-2.5 text-[0.8rem] font-bold text-white"
          style={{ background: 'var(--tc-violet)' }}
        >
          ✦ {t('teaching.editor.generateWithAi')}
        </button>
      </div>
    </div>
  )
}

function RailIcon({
  children,
  label,
  onClick,
  disabled = false,
  tone = 'neutral',
}: {
  children: React.ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
  tone?: 'neutral' | 'danger'
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      className="flex size-7 items-center justify-center rounded-sm border border-line text-xs transition-colors duration-200 hover:border-line-strong disabled:opacity-40 focus-visible:outline-3 focus-visible:outline-accent focus-visible:outline-offset-2"
      style={{ color: tone === 'danger' ? 'var(--tc-coral)' : 'var(--fg)' }}
    >
      <span aria-hidden="true">{children}</span>
      <span className="sr-only">{label}</span>
    </button>
  )
}

/** The answer layout in miniature, in its real slot colours. */
function Miniature({ activity }: { activity: Activity }) {
  if (activity.kind === 'explanation') {
    return (
      <span className="mt-1.5 block space-y-1">
        {[100, 80, 60].map((width) => (
          <span
            key={width}
            className="block h-1 rounded-sm bg-line-strong"
            style={{ width: `${width}%` }}
          />
        ))}
      </span>
    )
  }

  const count = activity.kind === 'true_false' ? 2 : Math.max(2, activity.options.length)
  return (
    <span className="mt-1.5 grid grid-cols-2 gap-1">
      {Array.from({ length: Math.min(count, 6) }, (_, index) => (
        <span
          key={index}
          className="flex h-4 items-center justify-center rounded-sm"
          style={{
            background:
              activity.kind === 'true_false'
                ? `var(--tc-slot-${index === 0 ? 4 : 1})`
                : `var(--tc-slot-${slotFor(index)})`,
            color:
              activity.kind === 'true_false'
                ? `var(--tc-slot-${index === 0 ? 4 : 1}-ink)`
                : `var(--tc-slot-${slotFor(index)}-ink)`,
          }}
        >
          <SlotShape
            slot={activity.kind === 'true_false' ? (index === 0 ? 4 : 1) : slotFor(index)}
            size={8}
          />
        </span>
      ))}
    </span>
  )
}

function kindLabel(kind: string, t: (key: never) => string): string {
  if (kind === 'multiple_choice') return t('teaching.editor.kindMultipleChoice' as never)
  if (kind === 'true_false') return t('teaching.editor.kindTrueFalse' as never)
  return t('teaching.editor.kindExplanation' as never)
}
