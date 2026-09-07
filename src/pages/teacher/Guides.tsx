import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import {
  ActivityArt,
  ClassArt,
  MaterialArt,
  ReportArt,
  ReviewArt,
  ReuseArt,
} from '@/components/teacher/DashboardArt'
import { IllustratedActionCard, SectionHeader } from '@/components/teacher/DashboardCards'
import { useGuidePanel } from '@/components/teacher/guide-context'
import { ForwardIcon } from '@/components/teacher/TeacherIcons'
import { useGuides, type GuideKey } from '@/components/teacher/guides'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

/**
 * Every written guide in one place.
 *
 * The sidebar needs a second real destination and this is it — not a
 * placeholder screen, but the six guides the dashboard cards open, listed so
 * they can be found without hunting for the card that happens to link to each.
 *
 * The titles come from the guides themselves rather than being retyped here,
 * so a guide renamed in the locale file is renamed on this page too.
 */

const ORDER: ReadonlyArray<{ key: GuideKey; tone: 'sky' | 'amber' | 'teal' | 'coral' | 'violet' | 'brand'; art: React.ReactNode }> = [
  { key: 'material', tone: 'sky', art: <MaterialArt /> },
  { key: 'activity', tone: 'amber', art: <ActivityArt /> },
  { key: 'teach', tone: 'teal', art: <ClassArt /> },
  { key: 'results', tone: 'coral', art: <ReportArt /> },
  { key: 'review', tone: 'violet', art: <ReviewArt /> },
  { key: 'reuse', tone: 'brand', art: <ReuseArt /> },
]

export default function TeacherGuides() {
  const { t } = useTranslation()
  const guideFor = useGuides()
  const panel = useGuidePanel()

  useDocumentTitle(t('teacher.guidesPage.title'))

  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-6">
      <SectionHeader
        level={1}
        title={t('teacher.guidesPage.title')}
        lead={t('teacher.guidesPage.lead')}
        action={
          <Link
            to="/teacher/dashboard"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-sm text-sm font-bold text-accent focus-visible:outline-3 focus-visible:outline-accent"
          >
            {t('teacher.guidesPage.back')}
            <ForwardIcon className="size-4" />
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {ORDER.map(({ key, tone, art }) => {
          const guide = guideFor(key)
          return (
            <IllustratedActionCard
              key={key}
              tone={tone}
              art={art}
              chip={t('teacher.guideChip')}
              title={guide.title}
              body={guide.lead}
              action={t('teacher.resources.prepare.action')}
              onClick={() => panel.open(key)}
            />
          )
        })}
      </div>
    </div>
  )
}
