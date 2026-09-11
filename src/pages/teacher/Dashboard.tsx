import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {Disc3} from 'lucide-react'

import {
  ActivityArt,
  ClassArt,
  HeroArt,
  LibraryArt,
  MaterialArt,
  ReportArt,
  ReviewArt,
  ReuseArt,
} from '@/components/teacher/DashboardArt'
import {
  IllustratedActionCard,
  SectionError,
  SectionHeader,
  TeacherToolCard,
} from '@/components/teacher/DashboardCards'
import { useGuidePanel } from '@/components/teacher/guide-context'
import {
  AccountIcon,
  BookmarkIcon,
  CheckIcon,
  ForwardIcon,
  GuidesIcon,
  InfoIcon,
  MailIcon,
  StackIcon,
} from '@/components/teacher/TeacherIcons'
import { useEffect, useState } from 'react'

import { useAuth } from '@/hooks/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useReferenceList } from '@/hooks/useReferenceList'
import { reference, teaching, type LessonSummary } from '@/lib/api'

/* Module level, so the identity is stable and the hook's effect does not
   re-run on every render of this page. */
const loadCategories = (signal?: AbortSignal) => reference.categories(signal)

/**
 * The teacher's home.
 *
 * WHAT IS REAL AND WHAT IS WRITTEN. Every action on this page is one of two
 * things, and it is always obvious which: it either navigates to a working
 * part of the application (the profile screen, the About page, the guides
 * page) or it opens a written guide, marked with a "Guide" chip on the card
 * and again inside the panel. There is no third category. Nothing here
 * simulates uploading, generating, launching, or scoring — the modules that
 * would do those things are not built, and a card that mimed them would be
 * the one dishonest thing on an otherwise honest page.
 *
 * NO INVENTED NUMBERS. There is no statistics strip, no activity feed, no
 * "3 lessons this week". The account has none of that data and the product
 * has nowhere to get it. The one chart-shaped drawing on the page lives in a
 * card illustration and is explicitly decorative.
 *
 * THE NEXT STEPS ARE DERIVED FROM THE ACCOUNT, not from a list. `emailVerified`
 * and `categoryId` come off the authenticated user; each row disappears when
 * its condition stops being true.
 */
export default function TeacherDashboard() {
  const { t,i18n } = useTranslation()
  const { user } = useAuth()
  const guide = useGuidePanel()

  useDocumentTitle(t('teacher.header.workspace'))

  const unverified = user ? !user.emailVerified : false
  const needsSubject = user ? user.categoryId === null : false


  /*
   * Hands the verify action back to the component that owns it.
   *
   * The banner holds the resend cooldown, the change-email form and the
   * server's own error text. Reimplementing any of that here would give the
   * teacher two controls that disagree the first time a request is slow, so
   * this scrolls the banner into view and presses its own button.
   */
  function openVerification() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    const button = document.querySelector<HTMLButtonElement>('.verify-banner .verify-btn-solid')
    button?.focus()
    button?.click()
  }

  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-6">
      {/* ---------------- A. the banner ---------------- */}
      <section
        className="relative overflow-hidden rounded-sm px-6 py-6 sm:px-8"
        style={{
          background: 'var(--color-brand-500)',
        }}
      >
        <div className="relative z-10 flex flex-col items-start gap-5 lg:flex-row lg:items-center">
          <div className="max-w-[38rem]">
            <h1 className="text-2xl font-bold text-balance text-white sm:text-3xl">
              {t('teacher.hero.title')}
            </h1>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-pretty text-white/85">
              {t('teacher.hero.body')}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {/* The v5 workflow: a quiz generated from the teacher's own material.
                  The legacy lesson builder stays reachable from the cards below. */}
              <Link
                to="/teacher/activities/new"
                className="rounded-sm bg-white px-5 py-2.5 text-sm font-bold text-brand-600 focus-visible:outline-3 focus-visible:outline-white focus-visible:outline-offset-2"
              >
                {t('teacher.hero.createQuiz')}
              </Link>
              <Link
                to="/teacher/materials"
                className="rounded-sm border border-white/45 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10 focus-visible:outline-3 focus-visible:outline-white focus-visible:outline-offset-2"
              >
                {t('teacher.hero.uploadMaterial')}
              </Link>
            </div>
          </div>

          {/* Decorative, and it gives up its space entirely below `lg` rather
              than shrinking into an unreadable smudge beside the text. */}
          <div className="hidden h-[132px] w-[280px] shrink-0 lg:block lg:ms-auto">
            <HeroArt />
          </div>
        </div>
      </section>

      {/* ---------------- B. the four starting points ---------------- */}
      <section>
        <SectionHeader title={t('teacher.start.title')} lead={t('teacher.start.lead')} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/*
            These two are built, so they no longer carry the Guide chip and no
            longer open a written explanation — they open the screens.
          */}
          <IllustratedActionCard
            tone="sky"
            art={<MaterialArt />}
            title={t('teacher.start.material.title')}
            body={t('teacher.start.material.body')}
            action={t('teaching.materials.title')}
            to="/teacher/materials"
          />
          <IllustratedActionCard
            tone="amber"
            art={<ActivityArt />}
            title={t('teacher.start.activity.title')}
            body={t('teacher.start.activity.body')}
            action={t('teaching.lessons.newLesson')}
            to="/teacher/lessons/new"
          />
          <IllustratedActionCard
            tone="teal"
            art={<ClassArt />}
            chip={t('teacher.guideChip')}
            title={t('teacher.start.teach.title')}
            body={t('teacher.start.teach.body')}
            action={t('teacher.start.teach.action')}
            onClick={() => guide.open('teach')}
          />
          <IllustratedActionCard
            tone="coral"
            art={<ReportArt />}
            chip={t('teacher.guideChip')}
            title={t('teacher.start.results.title')}
            body={t('teacher.start.results.body')}
            action={t('teacher.start.results.action')}
            onClick={() => guide.open('results')}
          />
        </div>
      </section>

      {/* ---------------- C. what the account can do today ---------------- */}
      <section>
        <SectionHeader title={t('teacher.tools.title')} lead={t('teacher.tools.lead')} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <TeacherToolCard tone="sky" icon={<Disc3 className="size-6"/>} title={i18n.language.startsWith('ar')?'العجلة العشوائية':'Random wheel'} body={i18n.language.startsWith('ar')?'اختر اسمًا أو موضوعًا أو سؤالًا من قائمتك، مع إمكانية منع التكرار.':'Spin to choose a name, topic or question from your list, with optional no-repeat picks.'} action={i18n.language.startsWith('ar')?'افتح العجلة':'Open wheel'} to="/teacher/wheel"/>
          {/*
            The first tile answers whichever question the account currently
            has. An unverified teacher needs the verify action; a verified one
            does not, and showing it anyway would be a control that does
            nothing.
          */}
          {unverified ? (
            <TeacherToolCard
              tone="brand"
              icon={<MailIcon className="size-6" />}
              title={t('teacher.tools.verify.title')}
              body={t('teacher.tools.verify.body')}
              action={t('teacher.tools.verify.action')}
              onClick={openVerification}
            />
          ) : (
            <TeacherToolCard
              tone="brand"
              icon={<AccountIcon className="size-6" />}
              title={t('teacher.tools.accountReady.title')}
              body={t('teacher.tools.accountReady.body')}
              action={t('teacher.tools.accountReady.action')}
              to="/complete-profile"
            />
          )}

          <TeacherToolCard
            tone="violet"
            icon={<BookmarkIcon className="size-6" />}
            title={t('teacher.tools.subject.title')}
            body={t('teacher.tools.subject.body')}
            action={t('teacher.tools.subject.action')}
            to="/complete-profile"
          />
          <TeacherToolCard
            tone="teal"
            icon={<StackIcon className="size-6" />}
            title={t('teaching.courses.title')}
            body={t('teaching.courses.lead')}
            action={t('teaching.common.open')}
            to="/teacher/courses"
          />
          <TeacherToolCard
            tone="amber"
            icon={<InfoIcon className="size-6" />}
            title={t('teacher.tools.about.title')}
            body={t('teacher.tools.about.body')}
            action={t('teacher.tools.about.action')}
            to="/about"
          />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* ---------------- D. next steps, from real state ---------------- */}
        <section>
          <SectionHeader title={t('teacher.steps.title')} lead={t('teacher.steps.lead')} />
          <ul className="flex flex-col rounded-sm border border-line bg-surface">
            {unverified ? (
              <StepRow
                tone="var(--tc-brand)"
                icon={<MailIcon className="size-5 text-white" />}
                title={t('teacher.steps.verify.title')}
                body={t('teacher.steps.verify.body')}
                action={t('teacher.steps.verify.action')}
                onClick={openVerification}
              />
            ) : null}

            {needsSubject ? (
              <StepRow
                tone="var(--tc-violet)"
                icon={<BookmarkIcon className="size-5 text-white" />}
                title={t('teacher.steps.subject.title')}
                body={t('teacher.steps.subject.body')}
                action={t('teacher.steps.subject.action')}
                to="/complete-profile"
              />
            ) : null}

            <StepRow
              tone="var(--tc-teal)"
              icon={<GuidesIcon className="size-5 text-white" />}
              title={t('teacher.steps.guide.title')}
              body={t('teacher.steps.guide.body')}
              action={t('teacher.steps.guide.action')}
              onClick={() => guide.open('material')}
            />

            {/*
              Rendered only when the account HAS a subject, which is what
              keeps the reference request from firing for a teacher who has
              not chosen one. The fetch lives inside the child rather than
              here because a hook cannot be called conditionally.
            */}
            {user?.categoryId ? <SubjectRow categoryId={user.categoryId} /> : null}

            {/* Everything optional already answered: say so, once, and stop
                manufacturing tasks to fill the panel. */}
            {!unverified && !needsSubject ? (
              <li className="flex items-center gap-3 border-t border-line px-4 py-3.5">
                <span
                  aria-hidden="true"
                  className="grid size-8 shrink-0 place-items-center rounded-sm"
                  style={{ background: 'var(--tc-teal)' }}
                >
                  <CheckIcon className="size-5 text-white" />
                </span>
                <p className="text-sm text-pretty text-muted">{t('teacher.steps.allDone')}</p>
              </li>
            ) : null}
          </ul>
        </section>

        {/* ---------------- E. lessons, from real records ---------------- */}
        <RecentLessons />
      </div>

      {/* ---------------- F. guidance resources ---------------- */}
      <section>
        <SectionHeader title={t('teacher.resources.title')} lead={t('teacher.resources.lead')} />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <IllustratedActionCard
            tone="brand"
            art={<MaterialArt />}
            title={t('teacher.resources.prepare.title')}
            body={t('teacher.resources.prepare.body')}
            action={t('teacher.resources.prepare.action')}
            onClick={() => guide.open('material')}
          />
          <IllustratedActionCard
            tone="violet"
            art={<ReviewArt />}
            title={t('teacher.resources.review.title')}
            body={t('teacher.resources.review.body')}
            action={t('teacher.resources.review.action')}
            onClick={() => guide.open('review')}
          />
          <IllustratedActionCard
            tone="teal"
            art={<ReuseArt />}
            title={t('teacher.resources.reuse.title')}
            body={t('teacher.resources.reuse.body')}
            action={t('teacher.resources.reuse.action')}
            onClick={() => guide.open('reuse')}
          />
        </div>
      </section>
    </div>
  )
}

/**
 * The subject this account actually holds, resolved to its name.
 *
 * The account stores `category_id`, a number. The name lives in the shared
 * reference list, fetched rather than shipped as a map in the bundle — that
 * list is edited server-side and a copy here would be wrong the first time a
 * subject is renamed.
 *
 * A failure is reported in this row, with a retry, and the rest of the panel
 * keeps rendering. The name is never guessed at: a confidently wrong subject
 * is worse than no subject.
 */
function SubjectRow({ categoryId }: { categoryId: number }) {
  const { t, i18n } = useTranslation()
  const categories = useReferenceList(loadCategories)

  if (categories.failed) {
    return (
      <li className="border-t border-line p-3">
        <SectionError onRetry={categories.reload} />
      </li>
    )
  }

  const subject = categories.options.find((option) => option.id === categoryId)
  if (!subject) return null

  return (
    <StepRow
      tone="var(--tc-sky)"
      icon={<BookmarkIcon className="size-5 text-white" />}
      title={t('teacher.steps.subjectSet.title')}
      body={i18n.resolvedLanguage === 'en' ? subject.name_en : subject.name_ar}
      action={t('teacher.steps.subjectSet.action')}
      to="/complete-profile"
    />
  )
}

/** One row of the next-steps panel. */
function StepRow({
  tone,
  icon,
  title,
  body,
  action,
  onClick,
  to,
}: {
  tone: string
  icon: React.ReactNode
  title: string
  body: string
  action: string
  onClick?: () => void
  to?: string
}) {
  const label = (
    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-accent">
      {action}
      <ForwardIcon className="size-4" />
    </span>
  )

  return (
    <li className="flex items-center gap-3 border-t border-line px-4 py-3.5 first:border-t-0">
      <span
        aria-hidden="true"
        className="grid size-9 shrink-0 place-items-center rounded-sm"
        style={{ background: tone }}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-bold text-balance text-fg">{title}</h3>
        <p className="mt-0.5 text-sm leading-snug text-pretty text-muted">{body}</p>
      </div>
      {to ? (
        <Link to={to} className="shrink-0 rounded-sm focus-visible:outline-3 focus-visible:outline-accent">
          {label}
        </Link>
      ) : (
        <button
          type="button"
          onClick={onClick}
          className="shrink-0 rounded-sm focus-visible:outline-3 focus-visible:outline-accent"
        >
          {label}
        </button>
      )}
    </li>
  )
}

/**
 * The teacher's actual recent lessons.
 *
 * WHAT THIS REPLACED. A panel explaining that lesson building did not exist.
 * It does now, so the panel reads from `lessons` — and when the list is empty
 * it says the account has none, which is a fact about the account rather than
 * a fact about the product.
 *
 * NOTHING IS INVENTED HERE. No sample lessons, no "recent activity", no
 * counters. An empty account shows an empty state with the real create action.
 */
function RecentLessons() {
  const { t } = useTranslation()
  const [lessons, setLessons] = useState<LessonSummary[] | null>(null)
  const [failed, setFailed] = useState(false)

  const load = () => {
    teaching
      .lessons({ page: 1 })
      .then(({ lessons: rows }) => {
        setLessons(rows.slice(0, 4))
        setFailed(false)
      })
      .catch(() => setFailed(true))
  }

  useEffect(load, [])

  return (
    <section>
      <SectionHeader
        title={t('teacher.lessons.title')}
        action={
          <Link
            to="/teacher/lessons"
            className="shrink-0 text-sm font-bold text-accent focus-visible:outline-3 focus-visible:outline-accent"
          >
            {t('teacher.lessons.viewAll')}
          </Link>
        }
      />

      {failed ? <SectionError onRetry={load} /> : null}

      {lessons?.length === 0 ? (
        <div className="overflow-hidden rounded-sm border border-line bg-surface">
          <div
            className="h-[132px] px-6 py-4"
            style={{ background: 'color-mix(in oklab, var(--tc-brand) 10%, var(--surface))' }}
          >
            <LibraryArt />
          </div>
          <div className="p-5">
            <h3 className="text-base font-bold text-balance text-fg">
              {t('teaching.lessons.empty')}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-pretty text-muted">
              {t('teaching.lessons.emptyBody')}
            </p>
            <Link
              to="/teacher/lessons/new"
              className="mt-4 inline-flex items-center gap-1.5 rounded-sm bg-brand-500 px-4 py-2.5 text-sm font-bold text-white focus-visible:outline-3 focus-visible:outline-accent"
            >
              {t('teaching.lessons.newLesson')}
              <ForwardIcon className="size-4" />
            </Link>
          </div>
        </div>
      ) : null}

      {lessons && lessons.length > 0 ? (
        <ul className="flex flex-col rounded-sm border border-line bg-surface">
          {lessons.map((lesson) => (
            <li
              key={lesson.id}
              className="flex items-center justify-between gap-3 border-t border-line px-4 py-3.5 first:border-t-0"
            >
              <div className="min-w-0">
                <h3 className="truncate text-sm font-bold text-fg">{lesson.title}</h3>
                <p className="mt-0.5 text-sm text-muted">
                  {lesson.courseTitle}
                  {' \u00b7 '}
                  {t('teaching.lessons.activities', { count: lesson.activityCount ?? 0 })}
                </p>
              </div>
              <Link
                to={`/teacher/lessons/${lesson.id}`}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-sm text-sm font-bold text-accent focus-visible:outline-3 focus-visible:outline-accent"
              >
                {t('teaching.lessons.continueEditing')}
                <ForwardIcon className="size-4" />
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
