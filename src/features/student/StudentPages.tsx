import { Select } from '@/design'
import { useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, BookOpen, Check, Gamepad2, Play, Plus, Radio, Search, Sparkles } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { assignmentPath, normalizePin } from '@/lib/joinInput'
import { type LearningProfile, type StudentActivity } from '@/shared/student'
import { themeImage } from '@/features/activity-themes/catalog'
import { ThemeThumbnail } from '@/features/activity-themes/ActivityStage'
import { games } from '@/features/games/catalog'
import GamesPage from '@/features/games/GamesPage'
import { StageGradePicker } from './StageGradePicker'
import { studentApi, studentQueryKey } from './student-api'
import { useStudentWorkspace } from './useStudentWorkspace'
import styles from './Student.module.css'

function useCopy() { const { i18n } = useTranslation(); const ar = i18n.language.startsWith('ar'); return { ar, t: (a: string, e: string) => ar ? a : e } }
function PageHeading({ title, lead }: { title: string; lead: string }) { useDocumentTitle(title); return <div className={styles.heading}><h1>{title}</h1><p>{lead}</p></div> }
export function StudentHome() {
  const { data } = useStudentWorkspace(), { user } = useAuth(), { t } = useCopy()
  const little = data.profile.stage === 'kindergarten', university = data.profile.stage === 'university'
  const name = user?.name?.trim().split(/\s+/)[0]
  const theme = little ? 'garden' : university ? 'space' : 'sky'
  const active = data.activities.filter(a => a.status === 'active' || a.status === 'not_started')
  return <>
    <PageHeading title={name ? t(`أهلًا ${name}!`, `Hello, ${name}!`) : t('أهلًا بك في مساحة تعلّمك!', 'Welcome to your learning space!')} lead={little ? t('نلعب ونكتشف شيئًا جديدًا اليوم.', 'Let’s play and discover something new today.') : university ? t('أنشطتك وتقدّمك وتدريبك في مكان واحد.', 'Your activities, progress and practice in one place.') : t('خطوتك التالية تبدأ هنا. ماذا ستتعلّم اليوم؟', 'Your next step starts here. What will you learn today?')} />
    <div className={styles.heroGrid}>
      <section className={styles.hero}>
        <img src={themeImage(theme)} alt="" className={styles.heroArt} fetchPriority="high" />
        <div className={styles.heroContent}><h2>{little ? t('هيا نلعب ونتعلّم!', 'Big discoveries. Little steps.') : university ? t('وقت قصير. فكرة جديدة.', 'A short break. A fresh challenge.') : t('مع كل إجابة، مغامرة جديدة.', 'Every answer starts an adventure.')}</h2><p>{little ? t('أسئلة بسيطة عن الأرقام والأشكال، ثم جولة لعب تختارها.', 'Explore numbers and shapes, then play a game you choose.') : t('تحدٍّ قصير يناسب مرحلتك، مع ألعاب تتحكّم بها بنفسك.', 'A quick challenge for your stage, with games you control.')}</p><Link className={styles.heroButton} to="/student/practice"><Play size={20} fill="currentColor" aria-hidden="true" />{little ? t('هيا نلعب', 'Let’s play') : t('ابدأ التدريب', 'Start practicing')}<ArrowRight size={20} aria-hidden="true" /></Link></div>
      </section>
      <JoinClass />
    </div>
    <section className={styles.section}><div className={styles.sectionHeading}><h2>{little ? t('أنشطتك', 'Your activities') : t('تابع تعلّمك', 'Keep learning')}</h2><Link to="/student/activities">{t('كل الأنشطة', 'All activities')}<ArrowRight size={18} aria-hidden="true" /></Link></div>
      {active.length ? <ActivityList activities={active.slice(0, 3)} /> : <div className={styles.emptyInline}><BookOpen size={30} aria-hidden="true" /><div><h3>{t('ابدأ بنشاط من معلّمك', 'Start with an activity from your teacher')}</h3><p>{t('احفظ رابط النشاط لتجده هنا وتتابع تقدّمك.', 'Save an activity link to find it here and follow your progress.')}</p></div><Link className={styles.secondary} to="/student/activities"><Plus size={18} />{t('أضف نشاطًا', 'Add activity')}</Link></div>}
    </section>
    <section className={styles.section}><div className={styles.sectionHeading}><h2>{t('اختر مغامرتك', 'Pick your adventure')}</h2><span>{t('تدريب قصير · ٣ أسئلة', 'Quick practice · 3 questions')}</span></div><GameChoices /></section>
  </>
}
function JoinClass() {
  const { t } = useCopy(), navigate = useNavigate(), [pin, setPin] = useState(''), [error, setError] = useState('')
  function join(e: FormEvent) { e.preventDefault(); if (pin.length !== 6) { setError(t('أدخل الرمز المكوّن من ستة أرقام.', 'Enter the six-digit PIN.')); return }; navigate(`/join?pin=${pin}`) }
  return <section className={styles.join}><span className={styles.joinIcon}><Radio size={26} aria-hidden="true" /></span><h2>{t('انضمّ إلى الحصّة', 'Join the class')}</h2><p>{t('لديك رمز من معلّمك؟ هيا ننضمّ.', 'Got a PIN from your teacher? Let’s join in.')}</p><form onSubmit={join} noValidate><label htmlFor="student-pin">{t('رمز اللعبة', 'Game PIN')}</label><input id="student-pin" value={pin} onChange={e => { setPin(normalizePin(e.target.value)); setError('') }} inputMode="numeric" autoComplete="off" dir="ltr" placeholder="123 456" aria-invalid={!!error} aria-describedby={error ? 'pin-error' : undefined} />{error && <p id="pin-error" role="alert" className={styles.error}>{error}</p>}<button className={styles.primary} type="submit">{t('انضمّ الآن', 'Join now')}<ArrowRight size={20} aria-hidden="true" /></button></form></section>
}
function GameChoices() {
  const { ar, t } = useCopy()
  return <div className={styles.gameGrid}>{games.map(game => <Link key={game.id} to={`/student/practice?mode=${game.id}`} className={styles.gameCard}><ThemeThumbnail theme={game.theme} /><div><h3>{ar ? game.ar : game.en}<Play size={18} aria-hidden="true" /></h3><p>{ar ? game.description.ar : game.description.en}</p><span>{t('العب وتعلّم', 'Play & learn')}<ArrowRight size={16} aria-hidden="true" /></span></div></Link>)}</div>
}
function ActivityList({ activities }: { activities: StudentActivity[] }) {
  const { t, ar } = useCopy()
  const statuses = { not_started: t('جاهز للبدء', 'Ready to start'), active: t('قيد التقدّم', 'In progress'), submitted: t('تم التسليم', 'Submitted'), expired: t('مغلق', 'Closed') }
  return <ul className={styles.activityList}>{activities.map(a => <li key={a.id}><span className={styles.activityIcon}><BookOpen aria-hidden="true" /></span><div className={styles.activityDetail}><h3><Link to={`/learn/${a.id}`}>{a.title}</Link></h3><p>{a.mode === 'study' ? t('تعلّم ذاتي', 'Self-study') : t('واجب', 'Homework')} · {a.questionCount} {t('أسئلة', 'questions')} · {t('الموعد', 'Due')} {new Date(a.deadline).toLocaleDateString(ar ? 'ar' : 'en')}</p><div className={styles.activityProgress}><progress max={a.questionCount || 1} value={a.answered} aria-label={`${a.title}: ${t('الأسئلة المجابة', 'questions answered')}`} /><span>{a.answered}/{a.questionCount}</span></div></div><div className={styles.activityAction}><span data-status={a.status}>{statuses[a.status]}</span><Link className={styles.secondary} to={`/learn/${a.id}`}>{a.status === 'not_started' ? t('ابدأ', 'Start') : a.status === 'active' ? t('تابع', 'Continue') : t('عرض النشاط', 'View activity')}<ArrowRight size={18} aria-hidden="true" /></Link></div></li>)}</ul>
}
export function StudentActivities() {
  const { data, reload } = useStudentWorkspace(), { t } = useCopy(), navigate = useNavigate()
  const [link, setLink] = useState(''), [error, setError] = useState(''), [busy, setBusy] = useState(false), [filter, setFilter] = useState('all'), [search, setSearch] = useState(''), inFlight = useRef(false)
  async function add(e: FormEvent) { e.preventDefault(); if (inFlight.current) return; setError(''); const path = assignmentPath(link, window.location.origin)
    if (!path) { setError(t('الصق رابط نشاط أساسيرا الكامل من معلّمك.', 'Paste the full Asasera activity link from your teacher.')); return }
    const url = new URL(path, window.location.origin), id = url.pathname.split('/')[2]!
    if (!url.hash) { setError(t('اطلب الرابط الكامل من معلّمك، بما فيه رمز الوصول.', 'Ask your teacher for the full link, including its access key.')); return }
    inFlight.current = true; setBusy(true)
    try { await studentApi.save(id, url.hash.slice(1)); await reload(); navigate(`/learn/${id}`) } catch (e) { setError(e instanceof Error ? e.message : t('تعذّر فتح النشاط.', 'Could not open this activity.')) } finally { inFlight.current = false; setBusy(false) }
  }
  const shown = data.activities.filter(a => (filter === 'all' || (filter === 'active' ? ['not_started', 'active'].includes(a.status) : ['submitted', 'expired'].includes(a.status))) && a.title.toLocaleLowerCase().includes(search.toLocaleLowerCase()))
  return <><PageHeading title={t('أنشطتي', 'My activities')} lead={t('احفظ الأنشطة التي يشاركها معلّمك، وتابعها من أي جهاز بعد تسجيل الدخول.', 'Save activities your teacher shares, then continue on any device when signed in.')} /><form className={styles.addForm} onSubmit={add}><label htmlFor="student-link">{t('أضف رابط نشاط', 'Add an activity link')}</label><div><input id="student-link" value={link} onChange={e => setLink(e.target.value)} type="text" inputMode="url" dir="ltr" autoComplete="off" placeholder={`${window.location.origin}/learn/…#…`} required aria-invalid={!!error} aria-describedby={error ? 'link-error' : undefined} /><button className={styles.primary} disabled={busy}><Plus size={20} aria-hidden="true" />{busy ? t('جارٍ الفتح…', 'Opening…') : t('احفظ وافتح', 'Save & open')}</button></div>{error && <p role="alert" id="link-error" className={styles.error}>{error}</p>}</form>
    {data.activities.length > 0 ? <><div className={styles.filters}><label><Search size={18} aria-hidden="true" /><span className={styles.srOnly}>{t('ابحث في أنشطتك', 'Search your activities')}</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('ابحث في أنشطتك', 'Search activities')} /></label><Select value={filter} onValueChange={e => setFilter(e)} aria-label={t('حالة النشاط', 'Activity status')}><option value="all">{t('كل الأنشطة', 'All activities')}</option><option value="active">{t('لم تكتمل', 'To do')}</option><option value="finished">{t('مكتملة أو مغلقة', 'Completed or closed')}</option></Select></div>{shown.length ? <ActivityList activities={shown} /> : <p className={styles.empty}>{t('لا توجد أنشطة تطابق البحث.', 'No activities match this search.')}</p>}</> : <div className={styles.empty}><BookOpen size={44} aria-hidden="true" /><h2>{t('أول نشاط لك يبدأ برابط', 'Your first activity starts with a link')}</h2><p>{t('اطلب من معلّمك رابط واجب أو تعلّم ذاتي. يمكنك أيضًا التدرّب بالألعاب الآن.', 'Ask your teacher for a homework or self-study link. You can also practice with games now.')}</p><Link className={styles.secondary} to="/student/practice"><Gamepad2 size={20} />{t('العب وتعلّم', 'Play & learn')}</Link></div>}</>
}
export function StudentProgress() {
  const { data } = useStudentWorkspace(), { t } = useCopy(), started = data.activities.filter(a => a.attemptId), completed = started.filter(a => a.status === 'submitted')
  const reviewed = started.filter(a => a.feedbackAvailable && a.correctCount !== null)
  return <><PageHeading title={t('تقدّمي', 'My progress')} lead={t('إجاباتك المحفوظة في أنشطة المعلّم. تظهر النتائج بحسب وقت عرضها الذي اختاره المعلّم.', 'Your saved answers in teacher activities. Results appear when your teacher’s feedback settings allow.')} />
    <div className={styles.stats}><div><BookOpen aria-hidden="true" /><strong>{started.length}</strong><span>{t('أنشطة بدأت بها', 'Activities started')}</span></div><div><Check aria-hidden="true" /><strong>{completed.length}</strong><span>{t('أنشطة سلّمتها', 'Activities submitted')}</span></div><div><Sparkles aria-hidden="true" /><strong>{started.reduce((sum, a) => sum + a.answered, 0)}</strong><span>{t('إجابات محفوظة', 'Answers saved')}</span></div></div>
    <section className={styles.section}><h2>{t('نتائج الأنشطة', 'Activity results')}</h2>{started.length ? <ul className={styles.resultList}>{started.map(a => <li key={a.id}><div><Link to={`/learn/${a.id}`}>{a.title}</Link><span>{a.answered}/{a.questionCount} {t('إجابة محفوظة', 'answers saved')}</span></div><strong>{a.feedbackAvailable ? t(`${a.correctCount ?? 0} إجابات صحيحة`, `${a.correctCount ?? 0} correct`) : t('بانتظار التغذية الراجعة', 'Waiting for feedback')}</strong></li>)}</ul> : <div className={styles.empty}><h3>{t('كل إجابة خطوة إلى الأمام', 'Every answer is a step forward')}</h3><p>{t('ابدأ نشاطًا من معلّمك ليظهر تقدّمك هنا.', 'Start a teacher activity to see your progress here.')}</p><Link className={styles.primary} to="/student/activities">{t('اذهب إلى أنشطتي', 'Go to my activities')}</Link></div>}{reviewed.length > 0 && <p className={styles.hint}>{t('قد تتغيّر نتائج الأنشطة التي لا تزال قيد التقدّم.', 'Results for activities still in progress can change.')}</p>}</section><p className={styles.hint}>{t('التدريب بالألعاب مستقل عن تقارير أنشطة المعلّم.', 'Game practice is separate from teacher activity reports.')}</p></>
}
export function StudentProfile() {
  const { data } = useStudentWorkspace(), { t } = useCopy()
  return <><PageHeading title={t('تفضيلات التعلّم', 'Learning preferences')} lead={t('اختر ما يناسبك الآن. يمكنك تحديد صفك أو إبقاء التجربة عامة.', 'Choose what fits you now. Pick a grade or keep your experience general.')} /><ProfileForm initial={data.profile} /></>
}
function ProfileForm({ initial }: { initial: LearningProfile }) {
  const [profile, setProfile] = useState(initial), [busy, setBusy] = useState(false), [error, setError] = useState(''), [saved, setSaved] = useState(false)
  const [valid, setValid] = useState(initial.educationStageId == null)
  const { user } = useAuth(), client = useQueryClient(), { data } = useStudentWorkspace(), { ar, t } = useCopy(), inFlight = useRef(false)
  async function submit(e: FormEvent) { e.preventDefault(); if (inFlight.current || !valid) return; inFlight.current = true; setBusy(true); setError(''); setSaved(false)
    try { const result = await studentApi.profile(profile); setProfile(result.profile); client.setQueryData(studentQueryKey(user!.id), { ...data, profile: result.profile }); setSaved(true) } catch (e) { setError(e instanceof Error ? e.message : t('تعذّر الحفظ.', 'Could not save.')) } finally { setBusy(false); inFlight.current = false }
  }
  return <form className={`${styles.profileForm} ${styles.profilePanel}`} onSubmit={submit}><StageGradePicker value={profile} onChange={next => { setProfile(next); setSaved(false) }} ar={ar} disabled={busy} onValidityChange={setValid} /><p className={styles.hint}>{t('تؤثّر هذه التفضيلات في مساحة تعلّمك وأسئلة التدريب. تظل أنشطة المعلّم كما اختارها لك.', 'These preferences adjust your learning space and practice questions. Teacher activities use the questions your teacher chose.')} </p>{error && <p role="alert" className={styles.error}>{error}</p>}<div className={styles.formActions}><button className={styles.primary} disabled={busy || !valid}>{busy ? t('جارٍ الحفظ…', 'Saving…') : t('احفظ التفضيلات', 'Save preferences')}</button><Link to="/student">{t('العودة إلى الرئيسية', 'Back to home')}</Link></div>{saved && <p className={styles.success} role="status"><Check size={20} />{t('تم حفظ تفضيلات التعلّم.', 'Learning preferences saved.')}</p>}</form>
}
export function StudentPractice() {
  const { data } = useStudentWorkspace(), { user } = useAuth()
  return <GamesPage key={`${user!.id}:${data.profile.stage}:${data.profile.grade}`} learningProfile={data.profile} studentId={user!.id} />
}
