import { useTranslation } from 'react-i18next'
import { FormattedText } from '@/components/formatted-text/FormattedText'
import type { HostReportRecord } from '@/lib/api'
import styles from './LiveResponseEvidence.module.css'

export function LiveResponseEvidence({ report, selected, onToggle }: { report: HostReportRecord; selected: readonly number[]; onToggle: (id: number) => void }) {
  const { i18n } = useTranslation(), ar = i18n.language.startsWith('ar'), t = (a: string, e: string) => ar ? a : e
  const n = (value: number | null | undefined) => value == null ? t('غير متاح', 'Unavailable') : new Intl.NumberFormat(ar ? 'ar' : 'en').format(value)
  const ratio = (value: number | null | undefined, total: number) => value == null ? n(value) : t(`${n(value)} من ${n(total)}`, `${n(value)} of ${n(total)}`)
  const time = (value: string | null) => value ? <time dateTime={value}>{new Date(value).toLocaleString(ar ? 'ar' : 'en')}</time> : t('غير متاح', 'Unavailable')
  const evidence = report.liveEvidence, practice = report.outcomeKind === 'practice-responses' || evidence?.semantics === 'practice'
  if (!evidence) return <p role="status">{t('تفاصيل التدريب المباشر غير متاحة. أعد تحميل التقرير؛ لا تُعرض درجة بدلًا منها.', 'Live practice evidence unavailable. Reload the report; no grade is substituted.')}</p>
  return <section className={styles.evidence} dir={ar ? 'rtl' : 'ltr'} aria-label={t('دليل الإجابات المباشرة', 'Live response evidence')}>
    <h3>{practice ? t('إجابات تدريب — ليست درجة', 'Practice responses — not a grade') : t('الإجابات الأولى', 'First responses')}</h3>
    <p>{t('نحتفظ بأول إجابة مسجّلة لكل متعلّم ولكل سؤال معتمد، حتى عبر الجولات. الإجابات المتكررة لا تستبدل الإجابة الأولى. المطابقة لمفتاح الإجابة دليل للمراجعة، وليست درجة أكاديمية أو إثباتًا للإتقان.', 'We retain the first recorded response per learner and approved question, across rounds. Repeat responses never replace the first response. Matching the answer key supports review; it is not an academic grade or proof of mastery.')}</p>
    <p>{t(`فُتح ${n(report.questionCount)} من ${n(report.plannedQuestionCount)} أسئلة مختارة. السؤال الذي لم يُفتح ليس إجابة مفقودة.`, `${n(report.questionCount)} of ${n(report.plannedQuestionCount)} selected questions were opened. A question never opened is not a missing response.`)}</p>
    {report.participants.length > 0 ? <>
      <p className={styles.scrollHint}>{t('مرّر الجدول أفقيًا لرؤية جميع أعمدة الدليل.', 'Scroll the table horizontally to see all evidence columns.')}</p>
      <div className={styles.scroll} tabIndex={0} role="region" aria-label={t('جدول الإجابات الأولى؛ مرّر لعرض الأعمدة', 'First-response table; scroll to view columns')}><table aria-label={t('دليل الإجابات الأولى', 'First-response evidence')}><thead><tr><th scope="col">{t('المشارك', 'Participant')}</th><th scope="col">{t('إجابات أولى / أسئلة مفتوحة', 'First responses / opened questions')}</th><th scope="col">{t('مطابقة المفتاح / إجابات أولى', 'Key matches / first responses')}</th><th scope="col">{t('أسئلة مفتوحة بلا إجابة أولى', 'Opened questions without a first response')}</th></tr></thead><tbody>{report.participants.map(person => <tr key={person.id}><th scope="row"><bdi>{person.name}</bdi></th><td>{ratio(person.firstResponses, report.questionCount)}</td><td>{person.firstResponses ? ratio(person.correctCount, person.firstResponses) : t('لا إجابات أولى', 'No first responses')}</td><td>{n(person.unanswered)}</td></tr>)}</tbody></table></div>
      <h3>{t('التكرار والمساعدة في التدريب', 'Repeat practice and assistance')}</h3>
      <p>{t('الإجابات الأولى بمساعدة جزء من الإجابات الأولى أعلاه، وليست إجابات إضافية. التكرار في جولة أخرى والمحاولات التدريبية الإضافية ونقاط اللعبة تُعرض منفصلة؛ لا تغيّر صحة الإجابة الأولى.', 'Assisted first responses are a subset of the first responses above, not additional responses. Responses in later rounds, extra practice attempts, and game points are separate; they do not change first-response correctness.')}</p>
      <p className={styles.scrollHint}>{t('مرّر الجدول أفقيًا لرؤية جميع أعمدة الدليل.', 'Scroll the table horizontally to see all evidence columns.')}</p>
      <div className={styles.scroll} tabIndex={0} role="region" aria-label={t('جدول التكرار والمساعدة؛ مرّر لعرض الأعمدة', 'Repeat and assistance table; scroll to view columns')}><table aria-label={t('التكرار والمساعدة في التدريب', 'Repeat practice and assistance')}><thead><tr><th scope="col">{t('المشارك', 'Participant')}</th><th scope="col">{t('إجابات مكررة', 'Repeat responses')}</th><th scope="col">{t('إجابات أولى بمساعدة', 'Assisted first responses')}</th><th scope="col">{t('محاولات تدريب إضافية', 'Extra practice attempts')}</th><th scope="col">{t('نقاط اللعبة', 'Game points')}</th></tr></thead><tbody>{report.participants.map(person => <tr key={person.id}><th scope="row"><bdi>{person.name}</bdi></th><td>{n(person.repeatResponses)}</td><td>{n(person.assistedFirstResponses)}</td><td>{n(person.practiceRetries)}</td><td>{n(person.gamePoints)}</td></tr>)}</tbody></table></div>
    </> : <p>{t('لا مشاركين في هذه الحصة.', 'No participants in this run.')}</p>}
    <h3>{t('الإجابات الأولى بحسب السؤال', 'First responses by question')}</h3>
    {report.questions.length === 0 && <p>{t('لم يُفتح أي سؤال للإجابة. لا يوجد دليل على صحة الإجابات.', 'No question was opened for responses. Correctness evidence is unavailable.')}</p>}
    {report.questions.map(question => <section className={styles.question} key={question.questionId}>
      <label className={styles.selection}><input type="checkbox" checked={selected.includes(question.questionId)} onChange={() => onToggle(question.questionId)} aria-label={t(`اختر السؤال ${question.index + 1} للتدريب`, `Select question ${question.index + 1} for practice`)}/><h4>{question.index + 1}. <bdi><FormattedText text={question.prompt}/></bdi></h4></label>
      <p>{t('إجابات أولى من المشاركين', 'First responses from participants')}: {ratio(question.answered, report.participantCount)} · {t('مطابقة مفتاح الإجابة', 'Answer-key matches')}: {question.answered ? ratio(question.correct, question.answered) : t('غير متاح — لا إجابات أولى', 'Unavailable — no first responses')}</p>
      <p>{t('إجابات أولى بمساعدة', 'Assisted first responses')}: {n(question.assistedFirstResponses)} · {t('إجابات مكررة', 'Repeat responses')}: {n(question.repeatResponses)} · {t('محاولات تدريب إضافية', 'Extra practice attempts')}: {n(question.practiceRetries)}</p>
      {question.distribution.length > 0 && <details><summary>{t('اختيارات الإجابة الأولى', 'First-response choices')}</summary><ul>{question.distribution.map(entry => <li key={entry.key}><bdi>{entry.label}</bdi>: {n(entry.count)}{entry.isCorrect && <> · {t('مفتاح الإجابة', 'Answer key')}</>}</li>)}</ul></details>}
      {question.explanation && <p>{t('الشرح', 'Explanation')}: <bdi><FormattedText text={question.explanation}/></bdi></p>}
    </section>)}
    <section aria-label={t('سجل عرض الأسئلة', 'Question delivery history')}>
      <h3>{t('سجل عرض الأسئلة', 'Question delivery history')}</h3>
      <p>{t('كل ظهور للسؤال مسجّل على حدة. أرقام الأسئلة تشير إلى المصدر المعتمد؛ تكرار السؤال لا ينشئ سؤالًا جديدًا.', 'Each appearance is recorded separately. Question numbers refer to the approved source; repeating a question does not create a new question.')}</p>
      {evidence.occurrences.length === 0 && <p>{t('لم يُختر أي سؤال للعرض.', 'No question was selected for delivery.')}</p>}
      <ol className={styles.history}>{evidence.occurrences.map(occurrence => <li key={occurrence.id}>
        <h4>{t(`الظهور ${n(occurrence.index + 1)} · السؤال ${n(occurrence.canonicalIndex + 1)} · الجولة ${n(occurrence.pass)}`, `Appearance ${n(occurrence.index + 1)} · Question ${n(occurrence.canonicalIndex + 1)} · Round ${n(occurrence.pass)}`)}</h4>
        <p>{({ selected: t('اختير', 'Selected'), open: t('مفتوح', 'Open'), completed: t('اكتمل', 'Completed'), skipped: t('تُخطي', 'Skipped') })[occurrence.status]}</p>
        {occurrence.openedAt === null ? <p>{t('لم يُفتح — لا فرصة للإجابة', 'Not opened — no response opportunity')}</p> : <>
          <p>{t('فُتح', 'Opened')}: {time(occurrence.openedAt)} · {t('موعد انتهاء الإجابة', 'Response deadline')}: {time(occurrence.endsAt)}</p>
          <dl className={styles.counts}>{[
            [t('إجابات أولى', 'First responses'), occurrence.firstResponses], [t('إجابات مكررة', 'Repeat responses'), occurrence.repeatResponses],
            [t('إجابات بمساعدة، بما فيها المكررة', 'Assisted responses, including repeats'), occurrence.assistedResponses],
            [t('منها إجابات أولى بمساعدة', 'Of these, assisted first responses'), occurrence.assistedFirstResponses],
            [t('محاولات تدريب إضافية', 'Extra practice attempts'), occurrence.practiceRetries], [t('نقاط اللعبة', 'Game points'), occurrence.gamePoints],
          ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{n(Number(value))}</dd></div>)}</dl>
        </>}
      </li>)}</ol>
    </section>
  </section>
}
