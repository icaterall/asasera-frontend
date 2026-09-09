import { demoQuestionBank, type DemoQuestion, type DemoLocale } from '../../pages/Landing/demo-question-bank.ts'
import type { DemoCard } from '../../pages/Landing/demo-quiz'
import type { LearningProfile } from '../../shared/student'

function numeric(id: string, en: string, ar: string, answer: number, explanation: string, explanationAr: string): DemoQuestion {
  const choices = [answer, answer + 1, Math.max(0, answer - 1), answer + 2, answer + 3]
  const unique = [...new Set(choices)].slice(0, 4).map(String) as [string, string, string, string]
  return { id, media: 'seedling', correct: 0, en: { title: en, answers: unique, explanation }, ar: { title: ar, answers: unique, explanation: explanationAr } }
}
export function practiceBand(profile: LearningProfile): 'early' | 'beginner' | 'primary' | 'middle' | 'senior' | 'university' | 'general' {
  if (profile.stage === 'kindergarten') return 'early'
  if (profile.stage === 'university') return 'university'
  if (profile.stage === 'general') return 'general'
  const grade = Number(profile.grade?.replace('grade', '') ?? 4)
  return grade <= 3 ? 'beginner' : grade <= 6 ? 'primary' : grade <= 9 ? 'middle' : 'senior'
}
/** Authored quick practice, not a claim of matching a particular national curriculum. */
export function practiceQuestionBank(profile: LearningProfile): DemoQuestion[] {
  const band = practiceBand(profile)
  if (band === 'general') return demoQuestionBank
  const questions: DemoQuestion[] = []
  for (let n = 1; n <= 30; n++) {
    const a = n % 9 + 1, b = n % 5 + 1
    if (band === 'early') {
      const count = profile.grade === 'kg1' ? n % 5 + 1 : n % 10 + 1
      if (n <= 20) questions.push(numeric(`early-count-${n}`, `How many stars? ${'★ '.repeat(count).trim()}`, `كم نجمة؟ ${'★ '.repeat(count).trim()}`, count, `There are ${count} stars. Count each star once.`, `هناك ${count} نجوم. نعدّ كل نجمة مرة واحدة.`))
      else if (n <= 25) questions.push(numeric(`early-next-${n}`, `What comes after ${a}?`, `ما العدد الذي يأتي بعد ${a}؟`, a + 1, `${a}, ${a + 1}. We add one.`, `${a}، ${a + 1}. نضيف واحدًا.`))
      else questions.push({ id: `early-shape-${n}`, media: 'balloon', correct: 0, en: { title: n % 2 ? 'Which shape has three sides?' : 'Which shape has no corners?', answers: n % 2 ? ['Triangle', 'Circle', 'Square', 'Rectangle'] : ['Circle', 'Triangle', 'Square', 'Rectangle'], explanation: n % 2 ? 'A triangle has three straight sides.' : 'A circle is round and has no corners.' }, ar: { title: n % 2 ? 'أي شكل له ثلاثة أضلاع؟' : 'أي شكل ليس له زوايا؟', answers: n % 2 ? ['المثلث', 'الدائرة', 'المربع', 'المستطيل'] : ['الدائرة', 'المثلث', 'المربع', 'المستطيل'], explanation: n % 2 ? 'للمثلث ثلاثة أضلاع مستقيمة.' : 'الدائرة مستديرة وليس لها زوايا.' } })
    } else if (band === 'beginner') {
      const step = profile.grade === 'grade3' ? 10 : profile.grade === 'grade2' ? 5 : 1, x = a * step
      const subtract = n % 2 === 0, result = subtract ? x : x + b, left = subtract ? x + b : x, op = subtract ? '−' : '+'
      questions.push(numeric(`beginner-${n}`, `${left} ${op} ${b} = ?`, `${left} ${op} ${b} = ؟`, result, `${left} ${op} ${b} = ${result}.`, `${left} ${op} ${b} = ${result}.`))
    } else if (band === 'primary') {
      const divide = n % 2 === 0, left = divide ? a * b : a, result = divide ? a : a * b, op = divide ? '÷' : '×'
      questions.push(numeric(`primary-${n}`, `${left} ${op} ${b} = ?`, `${left} ${op} ${b} = ؟`, result, `${left} ${op} ${b} = ${result}. Multiplication and division undo each other.`, `${left} ${op} ${b} = ${result}. الضرب والقسمة عمليتان عكسيتان.`))
    } else if (band === 'middle') {
      const result = a * b + n, left = b * result
      questions.push(numeric(`middle-${n}`, `Solve for x: ${b}x + ${a} = ${left + a}`, `أوجد x: ${b}x + ${a} = ${left + a}`, result, `Subtract ${a}, then divide by ${b}: x = ${result}.`, `نطرح ${a} ثم نقسم على ${b}: x = ${result}.`))
    } else if (band === 'senior') {
      const slope = a + 1, intercept = b, x = n + 1, result = slope * x + intercept
      questions.push(numeric(`senior-${n}`, `If f(x) = ${slope}x + ${intercept}, what is f(${x})?`, `إذا كانت f(x) = ${slope}x + ${intercept}، فما قيمة f(${x})؟`, result, `Substitute ${x}: ${slope} × ${x} + ${intercept} = ${result}.`, `نعوّض عن x بالقيمة ${x}: ${slope} × ${x} + ${intercept} = ${result}.`))
    } else {
      const mean = n * 3, delta = b + 2
      if (n % 2) questions.push(numeric(`university-${n}`, `What is the arithmetic mean of ${mean - delta}, ${mean}, and ${mean + delta}?`, `ما المتوسط الحسابي للأعداد ${mean - delta}، ${mean}، ${mean + delta}؟`, mean, `The sum is ${mean * 3}. Divide by 3 to get ${mean}.`, `المجموع ${mean * 3}. نقسم على 3 فنحصل على ${mean}.`))
      else questions.push(numeric(`university-${n}`, `An independent event has probability 1/${b + 1}. In ${(b + 1) * n} trials, what is the expected number of occurrences?`, `احتمال حدث مستقل هو 1/${b + 1}. في ${(b + 1) * n} تجربة، ما العدد المتوقع لحدوثه؟`, n, `Expected count = trials × probability = ${(b + 1) * n} × 1/${b + 1} = ${n}.`, `العدد المتوقع = عدد التجارب × الاحتمال = ${(b + 1) * n} × 1/${b + 1} = ${n}.`))
    }
  }
  return questions
}
function shuffle<T>(values: readonly T[], random = Math.random): T[] {
  const copy = [...values]
  for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [copy[i], copy[j]] = [copy[j]!, copy[i]!] }
  return copy
}
export function practiceRound(bank: readonly DemoQuestion[], recent: string[] = [], random = Math.random): DemoCard[] {
  let available = bank.filter(q => !recent.slice(-12).includes(q.id))
  if (available.length < 3) available = [...bank]
  return shuffle(available, random).slice(0, 3).map(q => ({ questionId: q.id, answerOrder: shuffle([0, 1, 2, 3], random) }))
}
export function practiceCard(card: DemoCard, lang: DemoLocale, bank: readonly DemoQuestion[]) {
  const q = bank.find(q => q.id === card.questionId)
  if (!q) throw new Error('Practice question not found')
  return { ...q[lang], answers: card.answerOrder.map(i => q[lang].answers[i]!), correct: card.answerOrder.indexOf(q.correct) }
}
