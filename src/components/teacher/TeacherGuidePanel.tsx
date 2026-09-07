import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { GuideContext } from './guide-context'
import { CloseIcon } from './TeacherIcons'
import { useGuides, type GuideKey } from './guides'

/**
 * The guide sheet, and the way anything on the dashboard opens one.
 *
 * WHY THIS EXISTS AT ALL. Most of the teacher workflow — building a lesson,
 * running a session, collecting results — is not implemented. A card that
 * pretended otherwise would be the worst thing on this page, and a card
 * labelled "coming soon" would be the second worst: it takes a click and
 * returns nothing. So the cards for unbuilt workflows open this, which holds
 * real, written guidance about the teaching work itself. It is marked as a
 * guide on the card, in the panel's own eyebrow, and once more in the closing
 * note, so nobody can mistake it for the tool.
 *
 * FOCUS AND ESCAPE. Opening moves focus into the panel and closing returns it
 * to the control that opened it, because losing your place on a long page is
 * how a keyboard user ends up scrolling from the top again. Escape closes.
 * Focus is contained by cycling on Tab rather than by hiding the rest of the
 * page from assistive technology.
 */

export function TeacherGuideProvider({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation()
  const guideFor = useGuides()
  const [openKey, setOpenKey] = useState<GuideKey | null>(null)

  /* The element that opened the panel, so focus can go back to it. */
  const opener = useRef<HTMLElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const headingRef = useRef<HTMLHeadingElement | null>(null)

  const open = useCallback((key: GuideKey) => {
    opener.current = document.activeElement as HTMLElement | null
    setOpenKey(key)
  }, [])

  const close = useCallback(() => {
    setOpenKey(null)
    opener.current?.focus?.()
  }, [])

  useEffect(() => {
    if (!openKey) return

    /* The heading, not the close button: a screen reader then reads what this
       panel is before it reads the way out of it. */
    headingRef.current?.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
        return
      }
      if (event.key !== 'Tab' || !panelRef.current) return

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (!first || !last) return

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [openKey, close])

  const api = useMemo(() => ({ open }), [open])
  const guide = openKey ? guideFor(openKey) : null

  return (
    <GuideContext value={api}>
      {children}

      {guide ? (
        <>
          <div className="teacher-panel-backdrop" onClick={close} aria-hidden="true" />
          <div
            ref={panelRef}
            className="teacher-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="teacher-guide-title"
          >
            <div className="flex items-start justify-between gap-4 border-b border-line p-6">
              <div>
                <p className="text-xs font-bold tracking-wide text-accent uppercase">
                  {t('teacher.panel.label')}
                </p>
                <h2
                  id="teacher-guide-title"
                  ref={headingRef}
                  tabIndex={-1}
                  className="mt-1.5 text-xl font-bold text-balance text-fg outline-none"
                >
                  {guide.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label={t('teacher.panel.close')}
                className="grid size-9 shrink-0 place-items-center rounded-sm border border-line text-muted hover:text-fg focus-visible:outline-3 focus-visible:outline-accent"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="p-6">
              <p className="text-[0.95rem] leading-relaxed text-pretty text-muted">{guide.lead}</p>

              <ol className="mt-6 flex flex-col gap-5">
                {guide.steps.map((step, index) => (
                  <li key={step.title} className="flex gap-4">
                    {/*
                      A circle is the one shape the radius rule exempts, and a
                      step number is genuinely one. The numeral is Western in
                      both languages, per the project's numeral rule.
                    */}
                    <span
                      aria-hidden="true"
                      className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-500 text-sm font-bold text-white"
                    >
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="text-[0.95rem] font-bold text-fg">{step.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-pretty text-muted">
                        {step.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              <p className="mt-7 rounded-sm border border-line bg-canvas p-4 text-sm leading-relaxed text-pretty text-muted">
                {guide.note}
              </p>

              {/*
                Said once more, in the panel, in plain words. The card that
                opened this was labelled a guide, but somebody arriving here
                from a keyboard shortcut or a deep scroll did not see that
                label, and the one thing they must not walk away believing is
                that the tool exists.
              */}
              <p className="mt-3 text-xs leading-relaxed text-pretty text-faint">
                {t('teacher.panel.notYet')}
              </p>
            </div>
          </div>
        </>
      ) : null}
    </GuideContext>
  )
}
