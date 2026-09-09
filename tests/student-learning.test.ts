import assert from 'node:assert/strict'
import { it } from 'node:test'
import { studyStages, gradesFor, learningProfileSchema, learningLabel, type LearningProfile } from '../src/shared/student.ts'
import { practiceBand, practiceQuestionBank, practiceRound, practiceCard } from '../src/features/student/practice-questions.ts'

it('accepts every offered stage/grade and an optional general view; rejects mismatches', () => {
  for (const stage of studyStages) {
    assert.equal(learningProfileSchema.safeParse({ stage, grade: null }).success, true)
    for (const grade of gradesFor(stage)) {
      assert.equal(learningProfileSchema.safeParse({ stage, grade: grade.id }).success, true)
      assert.equal(learningLabel({ stage, grade: grade.id }, 'ar'), grade.ar)
    }
  }
  assert.equal(gradesFor('school').length, 12)
  assert.equal(gradesFor('general').length, 0)
  for (const value of [{ stage: 'general', grade: 'kg1' }, { stage: 'school', grade: 'year1' }, { stage: 'kindergarten', grade: 'grade1' }]) assert.equal(learningProfileSchema.safeParse(value).success, false)
})
it('adjusts practice difficulty without inferring an exact age', () => {
  const profiles: [LearningProfile, string][] = [
    [{ stage: 'kindergarten', grade: null }, 'early'], [{ stage: 'school', grade: 'grade1' }, 'beginner'],
    [{ stage: 'school', grade: 'grade6' }, 'primary'], [{ stage: 'school', grade: 'grade9' }, 'middle'],
    [{ stage: 'school', grade: 'grade12' }, 'senior'], [{ stage: 'university', grade: 'year3' }, 'university'], [{ stage: 'general', grade: null }, 'general'],
  ]
  for (const [profile, band] of profiles) assert.equal(practiceBand(profile), band)
})
it('offers complete bilingual question banks and preserves the correct answer after shuffling', () => {
  for (const stage of studyStages) for (const grade of [null, ...gradesFor(stage).map(g => g.id)]) {
    const profile = { stage, grade }, bank = practiceQuestionBank(profile)
    assert.ok(bank.length >= 30)
    assert.equal(new Set(bank.map(q => q.id)).size, bank.length)
    for (const q of bank) for (const lang of ['en', 'ar'] as const) {
      assert.equal(q[lang].answers.length, 4)
      assert.equal(new Set(q[lang].answers).size, 4)
      const card = practiceCard({ questionId: q.id, answerOrder: [3, 1, 0, 2] }, lang, bank)
      assert.equal(card.answers[card.correct], q[lang].answers[q.correct])
      assert.ok(card.title && card.explanation)
    }
    const first = practiceRound(bank, [], () => .42), second = practiceRound(bank, first.map(c => c.questionId), () => .42)
    assert.equal(first.length, 3)
    assert.equal(new Set(first.map(c => c.questionId)).size, 3)
    assert.ok(second.every(c => !first.some(before => before.questionId === c.questionId)))
  }
})
it('kindergarten counting and quantitative practice have mathematically correct answers', () => {
  for (const q of practiceQuestionBank({ stage: 'kindergarten', grade: 'kg1' }).filter(q => q.id.includes('count'))) {
    assert.equal(Number(q.en.answers[q.correct]), [...q.en.title].filter(c => c === '★').length)
    assert.ok(Number(q.en.answers[q.correct]) <= 5)
  }
  for (const grade of ['grade1', 'grade3', 'grade4', 'grade6']) for (const q of practiceQuestionBank({ stage: 'school', grade })) {
    const match = q.en.title.match(/^(\d+) ([+−×÷]) (\d+)/)!
    const a = Number(match[1]), b = Number(match[3])
    const expected = match[2] === '+' ? a + b : match[2] === '−' ? a - b : match[2] === '×' ? a * b : a / b
    assert.equal(Number(q.en.answers[q.correct]), expected)
  }
})
