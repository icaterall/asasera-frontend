import { expect, test } from '@playwright/test'
import { demoQuestionBank } from '../src/pages/Landing/demo-question-bank'
import { dealDemoRound, localizeDemoCard, newDemoRound, readDemoHistory, rememberDemoRound, DEMO_HISTORY_LIMIT } from '../src/pages/Landing/demo-quiz'

function seeded(seed: number) {
  return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296 }
}

test('80 complete bilingual questions have unique ids, titles and four distinct choices', () => {
  expect(demoQuestionBank).toHaveLength(80)
  expect(new Set(demoQuestionBank.map(question => question.id)).size).toBe(80)
  const photos = new Set(demoQuestionBank.map(question => question.media))
  expect(photos.size).toBe(8)
  for (const photo of photos) expect(demoQuestionBank.filter(question => question.media === photo)).toHaveLength(10)
  for (const lang of ['en', 'ar'] as const) {
    expect(new Set(demoQuestionBank.map(question => question[lang].title)).size).toBe(80)
    for (const question of demoQuestionBank) {
      const text = question[lang]
      expect(text.title.trim()).not.toBe('')
      expect(text.explanation.trim()).not.toBe('')
      expect(text.answers).toHaveLength(4)
      expect(new Set(text.answers.map(answer => answer.trim())).size).toBe(4)
      expect(text.answers.every(answer => answer.trim().length > 0)).toBe(true)
      expect(Number.isInteger(question.correct) && question.correct >= 0 && question.correct < 4).toBe(true)
    }
  }
})

test('1000 rounds use different images, avoid recent questions, and reach the whole bank', () => {
  const random = seeded(71)
  let recent: string[] = []
  const seen = new Set<string>()
  const positions = new Set<number>()
  for (let i = 0; i < 1000; i++) {
    const cards = dealDemoRound(recent, random)
    expect(cards).toHaveLength(3)
    expect(new Set(cards.map(card => card.questionId)).size).toBe(3)
    const questions = cards.map(card => localizeDemoCard(card, 'en'))
    expect(new Set(questions.map(question => question.media)).size).toBe(3)
    for (const card of cards) {
      expect(recent).not.toContain(card.questionId)
      expect([...card.answerOrder].sort()).toEqual([0, 1, 2, 3])
      const original = demoQuestionBank.find(question => question.id === card.questionId)!
      for (const lang of ['en', 'ar'] as const) {
        const localized = localizeDemoCard(card, lang)
        expect(localized.answers[localized.correct]).toBe(original[lang].answers[original.correct])
        positions.add(localized.correct)
      }
      seen.add(card.questionId)
    }
    recent = [...recent, ...cards.map(card => card.questionId)].slice(-DEMO_HISTORY_LIMIT)
  }
  expect(seen.size).toBe(80)
  expect(positions.size).toBe(4)
})

test('a current round already in history never displaces older questions from the exclusion window', () => {
  const cards = demoQuestionBank.slice(0, DEMO_HISTORY_LIMIT).map(question => ({ questionId: question.id, answerOrder: [0, 1, 2, 3] }))
  for (let i = 0; i < cards.length; i += 3) rememberDemoRound(cards.slice(i, i + 3))
  const recent = readDemoHistory()
  expect(recent).toEqual(cards.map(card => card.questionId))
  const current = cards.slice(-3)
  for (let i = 0; i < 1000; i++) {
    for (const card of newDemoRound(current)) expect(recent).not.toContain(card.questionId)
  }
})
