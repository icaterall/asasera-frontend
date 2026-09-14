import { useTranslation } from 'react-i18next'
import { FormattedText } from '@/components/formatted-text/FormattedText'
import type { HostReportRecord, ReportPracticeCounts } from '@/lib/api'
import styles from './PresentationPracticeReport.module.css'

/** Version and subset identity apply equally to scored and self-rated runs. */
export function PresentationReportContext({ report }: { report: HostReportRecord }) {
  const { i18n } = useTranslation(), ar = i18n.language.startsWith('ar')
  const presentation = report.presentation
  if (!presentation) return null
  const labels: Record<string, [string, string]> = {
    flashcards: ['بطاقات المراجعة', 'Flashcards'], 'question-wheel': ['عجلة الأسئلة', 'Question wheel'],
    'random-cards': ['بطاقات عشوائية', 'Random cards'], 'open-box': ['افتح الصندوق', 'Open the box'],
    'speaking-cards': ['بطاقات الحوار', 'Speaking cards'], memory: ['أزواج الذاكرة', 'Memory pairs'],
    'word-search': ['البحث عن الكلمات', 'Word search'], crossword: ['الكلمات المتقاطعة', 'Crossword'],
    'class-competition':['مسابقة الصف','Class competition'],'challenge-cards':['بطاقات التحدي','Challenge cards'],
    'match-up':['المطابقة','Match up'],'group-sort':['تصنيف المجموعات','Group sort'],sequence:['الترتيب','Sequence'],
    'sentence-completion':['إكمال الجملة','Complete the sentence'],'word-builder':['بناء الكلمات','Word builder'],
  }
  const label = labels[presentation.definitionId]?.[ar ? 0 : 1] ?? presentation.definitionId
  const selfRated = report.outcomeKind === 'self-rated-practice', discussion = report.outcomeKind === 'discussion-practice', boards = report.outcomeKind === 'memory-practice' || report.outcomeKind === 'word-grid-practice'
  return <div className={styles.context}>
    <p><strong>{label}</strong> · <span>{selfRated ? ar ? 'مراجعة بتقييم ذاتي' : 'Self-rated practice' : discussion ? ar ? 'مشاركة في الحوار' : 'Discussion participation' : boards ? ar ? 'تقدّم التدريب' : 'Practice progress' : report.outcomeKind === 'practice-responses' ? ar ? 'إجابات تدريب' : 'Practice responses' : ar ? 'إجابات مرصودة' : 'Observed responses'}</span></p>
    <p>{report.sourceQuestionCount !== undefined
      ? boards ? ar ? `${report.plannedQuestionCount} لوحات مختارة من ${report.sourceQuestionCount} أسئلة في المصدر` : `${report.plannedQuestionCount} selected boards from ${report.sourceQuestionCount} source questions`
        : selfRated || discussion ? ar ? `${report.plannedQuestionCount} بطاقات مختارة من ${report.sourceQuestionCount} أسئلة في المصدر` : `${report.plannedQuestionCount} selected cards from ${report.sourceQuestionCount} source questions`
        : ar ? `${report.plannedQuestionCount} أسئلة مختارة من ${report.sourceQuestionCount} أسئلة في المصدر` : `${report.plannedQuestionCount} selected questions from ${report.sourceQuestionCount} source questions`
      : ar ? `${report.plannedQuestionCount} عناصر مختارة` : `${report.plannedQuestionCount} selected items`}</p>
    <p>{ar ? `نسخة المحتوى ${presentation.contentVersionId}` : `Content version ${presentation.contentVersionId}`}</p>
  </div>
}

export function PresentationPracticeReport({ report, selected, onToggle }: { report: HostReportRecord; selected: readonly number[]; onToggle: (questionId: number) => void }) {
  const { i18n } = useTranslation(), ar = i18n.language.startsWith('ar'), t = (arabic: string, english: string) => ar ? arabic : english
  const count = (value: number) => new Intl.NumberFormat(ar ? 'ar' : 'en').format(value)
  const ratio = (value: number, total: number) => t(`${count(value)} من ${count(total)}`, `${count(value)} of ${count(total)}`)
  const discussion = report.outcomeKind === 'discussion-practice', memory = report.outcomeKind === 'memory-practice'
  const wordGrid = report.outcomeKind === 'word-grid-practice', boards = memory || wordGrid
  const gridKind = report.presentation?.definitionId === 'word-search' || report.presentation?.definitionId === 'crossword' ? report.presentation.definitionId : 'unavailable'
  const kind = wordGrid ? gridKind : memory ? 'memory' : discussion ? 'discussion' : 'self-rated'
  const gridTitle = kind === 'crossword' ? t('تدريب الكلمات المتقاطعة', 'Crossword practice') : kind === 'word-search' ? t('تدريب البحث عن الكلمات', 'Word-search practice') : t('تدريب شبكات الكلمات', 'Word-grid practice')
  const headings = wordGrid ? [t('لوحات مفتوحة', 'Boards opened'), kind === 'crossword' ? t('إجابات مطابقة', 'Entries matched') : t('كلمات مكتشفة', 'Words found'), t('عمليات تحقق', 'Checks'), t('مساعدات مستخدمة', 'Assistance used'), t('لوحات مكتملة', 'Boards completed')]
    : memory ? [t('لوحات مفتوحة', 'Boards opened'), t('أزواج مكتشفة', 'Pairs found'), t('محاولات من بطاقتين', 'Two-card moves'), t('لوحات مكتملة', 'Boards completed')]
    : discussion ? [t('شاهد', 'Viewed'), t('سجّل أنه ناقش', 'Marked discussed'), t('لم يُسجّل كمُناقش', 'Not marked discussed')]
      : [t('شاهد', 'Viewed'), t('قيّم', 'Rated'), t('أراجع مرة أخرى', 'Review again'), t('أتعلمها', 'Learning'), t('أتذكرها', 'Remembered'), t('لم يقيّم', 'Not rated')]
  const metrics = (progress: ReportPracticeCounts): string[] => {
    const seen = ratio(progress.seen, progress.total)
    if (progress.kind === 'memory') return [seen, progress.totalPairs ? ratio(progress.pairsFound, progress.totalPairs) : progress.total === 0 ? t('لا محاولات بعد', 'No attempts yet') : t('إجمالي الأزواج غير متاح', 'Pair total unavailable'), count(progress.moves), ratio(progress.completedBoards, progress.total)]
    if (progress.kind === 'discussion') return [seen, ratio(progress.discussed, progress.total), count(progress.notDiscussed)]
    if (progress.kind === 'self-rated') return [seen, ratio(progress.rated, progress.total), count(progress.again), count(progress.learning), count(progress.known), count(progress.notRated)]
    return [seen, progress.totalWords ? ratio(progress.wordsFound, progress.totalWords) : progress.total === 0 ? t('لا محاولات بعد', 'No attempts yet') : t('إجمالي الكلمات غير متاح', 'Word total unavailable'), count(progress.checks), count(progress.assistance), ratio(progress.completedBoards, progress.total)]
  }
  const status = (value: string) => ({ submitted: t('سُلّمت المراجعة', 'Review submitted'), in_progress: t('قيد المراجعة', 'Review in progress'), not_started: t('لم تبدأ المراجعة', 'Review not started'), expired: t('أُغلقت دون تسليم', 'Closed without submitting') }[value] ?? t('حالة المشاركة غير متاحة', 'Participation status unavailable'))
  return <section className={styles.practice} dir={ar ? 'rtl' : 'ltr'} aria-label={wordGrid ? t('تقدّم تدريب شبكات الكلمات', 'Word-grid practice progress') : memory ? t('تقدّم تدريب أزواج الذاكرة', 'Memory-pair practice progress') : discussion ? t('تقدّم المشاركة في الحوار', 'Discussion participation progress') : t('تقدّم المراجعة الذاتية', 'Self-rated practice progress')}>
    <h3>{wordGrid ? gridTitle : memory ? t('تدريب أزواج الذاكرة', 'Memory-pair practice') : discussion ? t('ممارسة ببطاقات الحوار', 'Speaking-card practice') : t('مراجعة بالبطاقات', 'Flashcard practice')}</h3>
    <p className={styles.note}>{wordGrid ? t('نعدّ الكلمات المكتشفة في البحث أو الإجابات المطابقة بعد التحقق في الكلمات المتقاطعة. إجمالي الكلمات يشمل كل اللوحات المختارة. هذه أفعال تدريب، وليست درجة أو دليلًا على فهم المفردات أو إتقانها. عمليات التحقق تشمل الاختيارات والتحقق الصريح، ولا تتوفر مساعدات في هذا الإصدار.', 'Counts record located search words or crossword entries that matched after checking. Word totals cover all selected boards. These are practice actions, not a grade or evidence of vocabulary understanding or mastery. Checks count explicit selections or checks; assistance is not available in this version.') : memory ? t('نعدّ الأزواج المكتشفة والمحاولات من بطاقتين واللوحات المكتملة. إجمالي الأزواج يشمل كل اللوحات المختارة. تذكّر المواقع ليس درجة أو دليلًا على فهم الدرس أو إتقانه، والأزواج المتبقية تدريب غير مكتمل وليست إجابات تقييم مفقودة.', 'Counts record found pairs, two-card moves, and completed boards. Pair totals cover all selected boards. Remembering locations is not a grade or evidence of lesson understanding or mastery; remaining pairs are unfinished practice, not missing assessment answers.') : discussion ? t('يسجّل المتعلّم بنفسه أنه ناقش البطاقة. عرض البطاقة أو كشف الإجابة المرجعية لا يُحتسب مناقشة. هذه مشاركة مُبلّغ عنها، وليست تسجيلًا للكلام أو تقييمًا للصحة أو الإتقان.', 'Learners explicitly mark a card as discussed. Viewing it or revealing the reference response does not count as discussion. This records reported participation, not speech, correctness, or mastery.') : t('هذه اختيارات يبلّغ عنها الطالب عن تذكّره، وليست درجات أو تحققًا من صحة الإجابات أو الإتقان. البطاقات غير المقيّمة تعني مراجعة غير مكتملة.', 'These are learners’ self-reported recall choices, not grades, verified correctness, or mastery. Unrated cards mean unfinished practice.')}</p>
    {report.open && <p>{t('المراجعة ما زالت مفتوحة؛ يتحدّث هذا التقرير تلقائيًا.', 'Practice is still open; this report refreshes automatically.')}{report.deadline && <> {t('الموعد النهائي', 'Deadline')}: <time dateTime={report.deadline}>{new Date(report.deadline).toLocaleString(ar ? 'ar' : 'en')}</time></>}</p>}
    <p>{t(`محاولات مسلّمة: ${count(report.participation.submitted)} · قيد المراجعة: ${count(report.participation.inProgress)} · لم تبدأ: ${count(report.participation.notStarted)}`, `Submitted attempts: ${count(report.participation.submitted)} · In progress: ${count(report.participation.inProgress)} · Not started: ${count(report.participation.notStarted)}`)}{report.participation.expired > 0 && <> · {t(`أُغلقت دون تسليم: ${count(report.participation.expired)}`, `Closed without submitting: ${count(report.participation.expired)}`)}</>}</p>
    {report.participants.length ? <div className={styles.tableWrap} role="region" tabIndex={0} aria-label={t('جدول تقدّم المشاركين؛ مرّر لعرض الأعمدة', 'Participant progress table; scroll to view columns')}><table data-kind={kind} aria-label={t('تقدّم مراجعة المشاركين', 'Participant practice progress')}>
      <thead><tr><th scope="col">{t('المشارك', 'Participant')}</th>{headings.map(label => <th key={label} scope="col">{label}</th>)}</tr></thead>
      <tbody>{report.participants.map(person => <tr key={person.id}><th scope="row"><bdi>{person.name}</bdi><small>{status(person.status)}{person.submittedAt && <> · <time dateTime={person.submittedAt}>{new Date(person.submittedAt).toLocaleString(ar ? 'ar' : 'en')}</time></>}</small></th>
        {person.practice?.kind === kind ? metrics(person.practice).map((value, index) => <td key={headings[index]}>{value}</td>) : <td colSpan={headings.length}>{t('بيانات المراجعة غير متاحة؛ أعد تحميل التقرير.', 'Practice data unavailable; reload the report.')}</td>}
      </tr>)}</tbody>
    </table></div> : <p>{t('لم تبدأ أي محاولة مراجعة بعد.', 'No practice attempts have started yet.')}</p>}
    <h3>{boards ? t('التدريب بحسب اللوحة', 'Practice by board') : t('المراجعة بحسب البطاقة', 'Practice by card')}</h3>
    <p>{wordGrid ? t('تُجمع الكلمات وعمليات التحقق لكل لوحة عبر محاولات المتعلّمين، وتُقارن اللوحات المفتوحة والمكتملة بعدد المحاولات. اختر لوحات المتابعة بنفسك؛ لا نختار تلقائيًا من التقدّم.', 'Words and checks are summed across learner attempts for each board; opened and completed counts use attempts as their denominator. Choose follow-up boards yourself; progress does not select them for you.') : memory ? t('تُجمع الأزواج والمحاولات لكل لوحة عبر محاولات المتعلّمين، وتُقارن اللوحات المفتوحة والمكتملة بعدد المحاولات. اختر لوحات المتابعة بنفسك؛ لا نختار تلقائيًا من التقدّم.', 'Pairs and moves are summed across learner attempts for each board; opened and completed counts use attempts as their denominator. Choose follow-up boards yourself; progress does not select them for you.') : discussion ? t('تصف الأعداد المشاركة المُسجّلة لكل بطاقة. اختر بنفسك ما تريد متابعته؛ لا نختار بناءً على عدم المشاركة.', 'Counts describe recorded participation for each card. Choose follow-up cards yourself; missing participation does not select them for you.') : t('كل عدد أدناه هو عدد المحاولات التي سجّلت ذلك الاختيار. اختر بنفسك أي بطاقة لتدريب متابعة؛ لا نختار بناءً على التقييمات الذاتية.', 'Each count below represents attempts that recorded that choice. Select any cards for follow-up yourself; self-ratings do not select them for you.')}</p>
    {report.questions.map((question, index) => <section key={question.index} className={styles.cardRow}>
      <label className={styles.selection}><input type="checkbox" checked={selected.includes(question.questionId)} onChange={() => onToggle(question.questionId)} aria-label={boards ? t(`اختر اللوحة ${index + 1} للتدريب`, `Select board ${index + 1} for practice`) : t(`اختر البطاقة ${index + 1} للتدريب`, `Select card ${index + 1} for practice`)}/><h4>{index + 1}. <bdi><FormattedText text={question.prompt}/></bdi></h4></label>
      {question.practice?.kind === kind ? <dl className={styles.counts}>
        {metrics(question.practice).map((value, index) => <div key={headings[index]}><dt>{headings[index]}</dt><dd>{value}</dd></div>)}
      </dl> : <p>{boards ? t('تفاصيل تدريب اللوحة غير متاحة.', 'Board practice details unavailable.') : t('تفاصيل مراجعة البطاقة غير متاحة.', 'Card practice details unavailable.')}</p>}
    </section>)}
  </section>
}
