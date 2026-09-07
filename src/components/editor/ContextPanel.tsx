import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { SaveIndicator } from '@/components/teaching/TeachingUI'
import type { Activity, Lesson } from '@/lib/api'

/**
 * Properties and source, in one contextual column.
 *
 * TABBED, NOT STACKED. The layout this replaces gave the source its own
 * permanent column, which meant a two-sentence passage reserved a full-height
 * document panel while the canvas stayed narrow. Source is contextual: it
 * matters when the teacher is checking a citation and not otherwise, so it
 * shares a column with properties instead of holding one open.
 *
 * ONLY WHAT THE ACTIVITY SUPPORTS. No time limit, no speed scoring, no
 * "apply to all" for settings the player does not read. An empty control that
 * looks configurable is worse than a shorter panel.
 */
export function ContextPanel({
  lesson,
  activity,
  saveState,
  onCommit,
}: {
  lesson: Lesson
  activity: Activity | null
  saveState: React.ComponentProps<typeof SaveIndicator>['state']
  onCommit: (next: Activity) => void
}) {
  const { t } = useTranslation()
  const [tab, setTab] = useState<'properties' | 'source'>('properties')

  /* The passages this activity actually cites, resolved against the lesson's
     own segments — not every segment the teacher owns. */
  const cited = activity
    ? lesson.segments.filter((segment) => activity.sourceSegments.includes(segment.segmentIndex))
    : []

  return (
    <div className="ed-panel ed-region flex flex-col">
      <div className="flex border-b border-line" role="tablist">
        {(['properties', 'source'] as const).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className="flex-1 border-b-2 px-3 py-3 text-sm font-bold transition-colors duration-200 focus-visible:outline-3 focus-visible:outline-accent focus-visible:-outline-offset-2"
            style={{
              borderColor: tab === key ? 'var(--accent)' : 'transparent',
              color: tab === key ? 'var(--fg)' : 'var(--muted)',
            }}
          >
            {t(key === 'properties' ? 'teaching.editor.tabProperties' : 'teaching.editor.tabSource')}
            {key === 'source' && cited.length > 0 ? (
              <span className="ms-1.5 text-xs opacity-70">{cited.length}</span>
            ) : null}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4 p-4">
        {tab === 'properties' ? (
          activity ? (
            <>
              <Row label={t('teaching.editor.activityType')}>{kindLabel(activity.kind, t)}</Row>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-muted">
                  {t('teaching.editor.points')}
                </span>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={activity.points}
                  onChange={(event) =>
                    onCommit({ ...activity, points: Number(event.target.value) })
                  }
                  className="min-h-[44px] rounded-sm border border-line bg-surface px-3 text-fg outline-none focus-visible:outline-3 focus-visible:outline-accent focus-visible:outline-offset-2"
                />
              </label>
              <Row label={t('teaching.editor.contentLanguage')}>
                {lesson.contentLanguage.toUpperCase()}
              </Row>
              <div className="border-t border-line pt-3">
                <SaveIndicator state={saveState} />
              </div>
            </>
          ) : (
            <p className="text-sm text-muted">{t('teaching.editor.emptyBody')}</p>
          )
        ) : null}

        {tab === 'source' ? (
          cited.length > 0 ? (
            <>
              {cited.map((segment) => (
                <article key={segment.segmentIndex} className="flex flex-col gap-1.5">
                  <p className="text-xs font-bold text-accent">
                    {t('teaching.materials.pages', { count: segment.pageIndex ?? segment.segmentIndex })}
                  </p>
                  <p className="text-sm leading-relaxed text-fg">{segment.text}</p>
                </article>
              ))}
              {lesson.material ? (
                <a
                  href={`/api/v1/teaching/revisions/${lesson.material.revisionId}/file`}
                  target="_blank"
                  rel="noreferrer"
                  className="min-h-[44px] rounded-sm border border-line px-3 py-2.5 text-center text-sm font-semibold text-fg transition-colors duration-200 hover:border-accent focus-visible:outline-3 focus-visible:outline-accent focus-visible:outline-offset-2"
                >
                  {t('teaching.editor.openSource')}
                </a>
              ) : null}
            </>
          ) : (
            /* Honest: no citation is a real state for a teacher-written
               activity, not a failure to render. */
            <p className="text-sm text-muted">{t('teaching.editor.noSourceForActivity')}</p>
          )
        ) : null}
      </div>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-semibold text-muted">{label}</span>
      <span className="text-[0.95rem] font-semibold text-fg">{children}</span>
    </div>
  )
}

function kindLabel(kind: string, t: (key: never) => string): string {
  if (kind === 'multiple_choice') return t('teaching.editor.kindMultipleChoice' as never)
  if (kind === 'true_false') return t('teaching.editor.kindTrueFalse' as never)
  return t('teaching.editor.kindExplanation' as never)
}
