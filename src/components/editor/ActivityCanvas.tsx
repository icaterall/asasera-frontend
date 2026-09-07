import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { EditableAnswerTile } from './EditableAnswerTile'
import type { Activity } from '@/lib/api'

/**
 * The one activity the teacher is working on.
 *
 * ONE, NOT ALL. The page this replaces rendered a full edit form for every
 * activity in the lesson, so a six-question lesson was six stacked forms and
 * the question you were editing was wherever you last scrolled to. Here the
 * rail selects and the canvas shows exactly one.
 *
 * NO MEDIA WELL. The activity schema has no media field, so there is nothing
 * to attach and a large "drop an image here" box would be a control that
 * cannot work. When media lands in the contract this is where it goes.
 */
export function ActivityCanvas({
  activity,
  onCommit,
}: {
  activity: Activity
  onCommit: (next: Activity) => void
}) {
  const { t } = useTranslation()
  const [prompt, setPrompt] = useState(activity.prompt)
  const [explanation, setExplanation] = useState(activity.explanation ?? '')
  const [body, setBody] = useState(activity.body ?? '')
  const promptRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setPrompt(activity.prompt)
    setExplanation(activity.explanation ?? '')
    setBody(activity.body ?? '')
  }, [activity])

  useEffect(() => {
    const node = promptRef.current
    if (!node) return
    node.style.height = 'auto'
    node.style.height = `${node.scrollHeight}px`
  }, [prompt])

  const isChoice = activity.kind === 'multiple_choice'
  const isTrueFalse = activity.kind === 'true_false'
  const isExplanation = activity.kind === 'explanation'

  function commit(patch: Partial<Activity>) {
    onCommit({ ...activity, ...patch })
  }

  /* True/false is two fixed tiles bound to a boolean, not two rows of a list.
     Inventing option rows for it would put editable text on answers whose
     wording the player does not use. */
  const trueFalseValue = activity.answerKey?.value === true

  return (
    <div className="ed-canvas ed-region">
      <textarea
        ref={promptRef}
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        onBlur={() => prompt !== activity.prompt && commit({ prompt })}
        rows={1}
        placeholder={
          isExplanation
            ? t('teaching.editor.explanationTitlePlaceholder')
            : t('teaching.editor.questionPlaceholder')
        }
        aria-label={t('teaching.editor.activityPrompt')}
        className="w-full resize-none border-0 bg-transparent text-[1.75rem] leading-tight font-bold text-fg outline-none placeholder:text-muted placeholder:opacity-70 focus-visible:outline-3 focus-visible:outline-accent focus-visible:outline-offset-4"
      />

      {isChoice ? (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {activity.options.map((option, index) => (
              <EditableAnswerTile
                key={option.id}
                index={index}
                value={option.text}
                isCorrect={activity.answerKey?.optionId === option.id}
                /* Two answers is the floor for a choice question; below that it
                   is not a choice. */
                canRemove={activity.options.length > 2}
                onChange={(text) =>
                  commit({
                    options: activity.options.map((current) =>
                      current.id === option.id ? { ...current, text } : current,
                    ),
                  })
                }
                onMarkCorrect={() => commit({ answerKey: { optionId: option.id } })}
                onRemove={() => {
                  const options = activity.options.filter((current) => current.id !== option.id)
                  commit({
                    options,
                    /* Removing the correct answer must not leave a key pointing
                       at nothing — validation would block approval later with a
                       message about a question the teacher thought was fine. */
                    answerKey:
                      activity.answerKey?.optionId === option.id
                        ? { optionId: options[0]?.id ?? '' }
                        : activity.answerKey,
                  })
                }}
              />
            ))}
          </div>

          {activity.options.length < 6 ? (
            <button
              type="button"
              onClick={() =>
                commit({
                  options: [
                    ...activity.options,
                    { id: `o${Date.now().toString(36)}`, text: '' },
                  ],
                })
              }
              className="self-start rounded-sm border border-dashed border-line-strong px-4 py-2.5 text-sm font-semibold text-muted transition-colors duration-200 hover:border-accent hover:text-fg focus-visible:outline-3 focus-visible:outline-accent focus-visible:outline-offset-2"
            >
              {t('teaching.editor.addAnswer')}
            </button>
          ) : null}
        </>
      ) : null}

      {isTrueFalse ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[true, false].map((value, index) => {
            const selected = trueFalseValue === value
            return (
              <button
                key={String(value)}
                type="button"
                onClick={() => commit({ answerKey: { value } })}
                aria-pressed={selected}
                className="tc-tactile flex min-h-[104px] items-center gap-3 rounded-sm px-5 text-start"
                style={{
                  background: `var(--tc-slot-${index === 0 ? 4 : 1})`,
                  color: `var(--tc-slot-${index === 0 ? 4 : 1}-ink)`,
                  boxShadow: selected
                    ? '0 0 0 3px var(--fg), var(--tc-press-inset)'
                    : 'var(--tc-press-lift), var(--tc-press-inset)',
                }}
              >
                <span aria-hidden="true" className="text-2xl">
                  {index === 0 ? '✓' : '✕'}
                </span>
                <span className="flex-1 text-[1.25rem] font-bold">
                  {t(value ? 'teaching.editor.answerTrue' : 'teaching.editor.answerFalse')}
                </span>
                {selected ? (
                  <span className="text-sm font-bold">{t('teaching.editor.isCorrect')}</span>
                ) : null}
              </button>
            )
          })}
        </div>
      ) : null}

      {isExplanation ? (
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          onBlur={() => body !== (activity.body ?? '') && commit({ body })}
          placeholder={t('teaching.editor.explanationBodyPlaceholder')}
          aria-label={t('teaching.editor.explanationBody')}
          className="min-h-[220px] w-full rounded-sm border border-line bg-surface p-4 text-[1.05rem] leading-relaxed text-fg outline-none focus-visible:outline-3 focus-visible:outline-accent focus-visible:outline-offset-2"
        />
      ) : null}

      {/* Why the answer is the answer. Quiet next to the tiles, because it is
          teacher-facing reasoning rather than something a class reads first. */}
      {!isExplanation ? (
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-muted">
            {t('teaching.editor.explanationField')}
          </span>
          <textarea
            value={explanation}
            onChange={(event) => setExplanation(event.target.value)}
            onBlur={() =>
              explanation !== (activity.explanation ?? '') && commit({ explanation })
            }
            rows={2}
            className="w-full rounded-sm border border-line bg-surface p-3 text-[0.95rem] text-fg outline-none focus-visible:outline-3 focus-visible:outline-accent focus-visible:outline-offset-2"
          />
        </label>
      ) : null}
    </div>
  )
}
