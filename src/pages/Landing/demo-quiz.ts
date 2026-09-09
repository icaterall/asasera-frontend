import { demoQuestionBank, type DemoLocale } from './demo-question-bank'

export const DEMO_ROUND_SIZE = 3
export const DEMO_HISTORY_LIMIT = 24
export const DEMO_HISTORY_KEY = 'asasera.demo.recent.v1'
export type DemoCard = { questionId: string; answerOrder: number[] }
const questionsById = new Map(demoQuestionBank.map(question => [question.id, question]))
let memoryHistory: string[] = []

function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const shuffled = [...items]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!]
  }
  return shuffled
}

/** A short round samples distinct photos and avoids the previous eight rounds. */
export function dealDemoRound(recentIds: readonly string[] = [], random = Math.random): DemoCard[] {
  const recent = new Set(recentIds.slice(-DEMO_HISTORY_LIMIT))
  const available = shuffle(demoQuestionBank.filter(question => !recent.has(question.id)), random)
  const selected: typeof demoQuestionBank = []
  for (let i = 0; i < DEMO_ROUND_SIZE; i++) {
    const freshPhoto = available.findIndex(question => !selected.some(previous => previous.media === question.media))
    const [next] = available.splice(Math.max(0, freshPhoto), 1)
    if (!next) throw new Error('The demo question bank cannot fill a round')
    selected.push(next)
  }
  return selected.map(question => ({ questionId: question.id, answerOrder: shuffle([0, 1, 2, 3], random) }))
}

export function readDemoHistory(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(DEMO_HISTORY_KEY) ?? '[]')
    if (Array.isArray(parsed)) {
      return [...parsed, ...memoryHistory]
        .filter((id): id is string => typeof id === 'string' && questionsById.has(id))
        .filter((id, index, all) => all.lastIndexOf(id) === index)
        .slice(-DEMO_HISTORY_LIMIT)
    }
  } catch { /* Private browsing or corrupted history must never block the quiz. */ }
  return [...memoryHistory]
}

/** Write only after React commits a round; StrictMode render probes consume no history. */
export function rememberDemoRound(cards: readonly DemoCard[]) {
  const ids = cards.map(card => card.questionId)
  memoryHistory = [...readDemoHistory().filter(id => !ids.includes(id)), ...ids].slice(-DEMO_HISTORY_LIMIT)
  try { localStorage.setItem(DEMO_HISTORY_KEY, JSON.stringify(memoryHistory)) } catch { /* In-memory variation still works. */ }
}

export function newDemoRound(current: readonly DemoCard[] = []): DemoCard[] {
  const currentIds = current.map(card => card.questionId)
  return dealDemoRound([...readDemoHistory().filter(id => !currentIds.includes(id)), ...currentIds])
}

export function localizeDemoCard(card: DemoCard, locale: DemoLocale) {
  const original = questionsById.get(card.questionId)
  if (!original) throw new Error('Unknown demo question')
  const text = original[locale]
  return { ...text, id: original.id, media: original.media,
    answers: card.answerOrder.map(index => text.answers[index]!),
    correct: card.answerOrder.indexOf(original.correct) }
}
