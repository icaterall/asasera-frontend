import { Bdi } from '@/components/Bdi'
import type { LandingCopyKey } from '@/copy/landing.ar'
import { useCopy } from '@/copy/useCopy'

import { IconCheck, IconPencil, IconTrash } from '../ui/Icons'
import { SectionShell } from '../ui/SectionShell'

const steps = [1, 2, 3] as const

/**
 * The editor state the section argues about: regions already proposed, each
 * one a thing to accept or remove rather than a thing to draw.
 *
 * The dashed outlines do the persuading — they read as *proposed* rather
 * than committed, which is the whole claim of "the system draws and the
 * teacher deletes". A solid box would look like something already made.
 *
 * No card around it: the drawing has its own frame, and a border around a
 * bordered illustration was one frame too many.
 */
function EditorPreview() {
  const { t } = useCopy()

  return (
    <div>
      <svg viewBox="0 0 420 210" className="h-auto w-full" role="presentation">
        <rect x="1" y="1" width="418" height="208" rx="3" fill="var(--raised)" stroke="var(--line)" />
        <ellipse cx="200" cy="105" rx="132" ry="82" fill="var(--surface)" stroke="var(--line)" />

        <circle cx="176" cy="92" r="34" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeDasharray="5 4" />
        <rect x="150" y="46" width="70" height="22" rx="2" fill="var(--surface)" stroke="var(--accent)" strokeWidth="1.2" />
        <text x="185" y="61" textAnchor="middle" fontSize="12" fill="var(--fg)" fontFamily="inherit">
          {t('editor.regionOne')}
        </text>

        <path d="M68 105a132 82 0 0 1 264 0" fill="none" stroke="var(--accent-alt)" strokeWidth="1.8" strokeDasharray="5 4" />
        <rect x="286" y="124" width="72" height="22" rx="2" fill="var(--surface)" stroke="var(--accent-alt)" strokeWidth="1.2" />
        <text x="322" y="139" textAnchor="middle" fontSize="12" fill="var(--fg)" fontFamily="inherit">
          {t('editor.regionTwo')}
        </text>

        <circle cx="252" cy="140" r="24" fill="none" stroke="var(--muted)" strokeWidth="1.6" strokeDasharray="5 4" />
      </svg>

      {/* The three actions, as plain labelled icons rather than chips. */}
      <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
        {[
          { key: 'editor.actionDelete', Icon: IconTrash },
          { key: 'editor.actionRename', Icon: IconPencil },
          { key: 'editor.actionApprove', Icon: IconCheck },
        ].map(({ key, Icon }) => (
          <li key={key} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted">
            <Icon size={16} />
            {t(key as LandingCopyKey)}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Editor() {
  const { t } = useCopy()

  return (
    <SectionShell id="editor" tone="tint" title={t('editor.title')}>
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-center lg:gap-16">
        <EditorPreview />

        <div>
          <ol className="flex flex-col gap-7">
            {steps.map((n) => (
              <li key={n}>
                <h3 className="mb-1 text-xl font-semibold text-fg">
                  <span className="text-muted">
                    <Bdi dir="ltr">{t(`editor.${n}.index` as LandingCopyKey)}</Bdi>{' '}
                  </span>
                  {t(`editor.${n}.title` as LandingCopyKey)}
                </h3>
                <p className="text-[0.9375rem] leading-[1.8] text-muted">
                  {t(`editor.${n}.body` as LandingCopyKey)}
                </p>
              </li>
            ))}
          </ol>

          <p className="mt-8 border-t border-line pt-6 text-xl font-semibold text-accent-alt">
            {t('editor.closing')}
          </p>
        </div>
      </div>
    </SectionShell>
  )
}
