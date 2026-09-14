import { afterEach, beforeAll, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createInstance } from 'i18next'
import { I18nextProvider } from 'react-i18next'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import Reports from '../src/features/reports/Reports'
import type { HostReportRecord } from '../src/lib/api'

const language = createInstance()
beforeAll(async () => { await language.init({ lng: 'en', resources: { en: { translation: {} }, ar: { translation: {} } } }) })
afterEach(() => { cleanup(); void language.changeLanguage('en') })
const fixture = (): HostReportRecord => ({
  runId: 42, title: 'Plant review', mode: 'study', endReason: null, open: true, deadline: null,
  questionCount: 2, plannedQuestionCount: 2, sourceQuestionCount: 8, participantCount: 1, denominator: 'attempts' as const,
  presentation: { definitionId: 'flashcards' as const, definitionVersion: 1, adapterVersion: 1, contentVersionId: 71, semantics: 'self-rated' as const, selectedQuestionIds: [11, 13] },
  outcomeKind: 'self-rated-practice' as const,
  participation: { total: 1, incomplete: 1, submitted: 0, inProgress: 1, notStarted: 0, expired: 0 },
  participants: [{ id: 'learner', name: 'آمنة Smith', score: null, correctCount: null, answered: 0, incorrect: null, unanswered: null, connected: false, status: 'in_progress', submittedAt: null, remedialAnswered: 0, remedialCorrect: 0, originalCorrect: 0,
    practice: { kind: 'self-rated' as const, total: 2, seen: 2, rated: 1, again: 1, learning: 0, known: 0, notRated: 1, completed: false } }],
  questions: [11, 13].map((questionId, index) => ({ index, questionId, kind: 'mcq' as const, prompt: index ? 'What do roots do?' : 'What do plants need?', explanation: null, remedial: false, correctKey: 'a', correctLabel: 'private answer', answered: 0, correct: 0, incorrect: 0, correctPercent: null, evidence: 'insufficient' as const, needsReview: false,
    participation: { notAnswered: 0, notYetAnswered: 0, unanswered: 0 }, distribution: [],
    practice: { kind: 'self-rated' as const, total: 1, seen: 1, rated: index ? 0 : 1, again: index ? 0 : 1, learning: 0, known: 0, notRated: index ? 1 : 0 } })),
  pattern: null, followUps: [], followUpOf: null, closing: { kind: 'practice_progress' as const }, evidenceNote: 'Self-reported practice, not assessment.',
})
function show(report: HostReportRecord = fixture()) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } })
  client.setQueryData(['report', '42', false], report)
  render(<I18nextProvider i18n={language}><QueryClientProvider client={client}><MemoryRouter initialEntries={['/teacher/reports/runs/42']}><Routes><Route path="/teacher/reports/runs/:id" element={<Reports/>}/></Routes></MemoryRouter></QueryClientProvider></I18nextProvider>)
  return client
}

it('shows self-rated card progress without assessment counts or understanding heuristics', () => {
  show()
  expect(screen.getByRole('heading', { name: 'Flashcard practice' })).toBeTruthy()
  const table = screen.getByRole('table', { name: 'Participant practice progress' })
  expect(within(table).getByRole('columnheader', { name: 'Viewed' })).toBeTruthy()
  expect(within(table).getByRole('columnheader', { name: 'Rated' })).toBeTruthy()
  expect(within(table).getByRole('rowheader', { name: /آمنة Smith/ })).toBeTruthy()
  expect(screen.queryByRole('columnheader', { name: 'Correct' })).toBeNull()
  expect(screen.queryByText(/Needs review/)).toBeNull()
  expect(screen.queryByText(/no answers/i)).toBeNull()
  expect(screen.queryByText('Answers support review. They are not a judgment of the learner.')).toBeNull()
  expect(screen.queryByText('private answer')).toBeNull()
  expect(screen.getByText('2 selected cards from 8 source questions')).toBeTruthy()
  expect(screen.getByText('Content version 71')).toBeTruthy()
  expect(screen.getByRole('button', { name: 'Export XLSX' })).toBeTruthy()
  expect(screen.getByRole('button', { name: 'Export CSV' })).toBeTruthy()
})

it('keeps follow-up selection teacher-controlled and preserves existing follow-up links', async () => {
  const data = fixture()
  data.followUpOf = { runId: 8, sharedParticipants: 1, totalParticipants: 1 }
  data.followUps = [{ id: 4, practiceActivityId: 93, title: 'Root review', approved: false, runs: 0, generationJobId: null, targetQuestionIds: [13], createdAt: '2026-09-14T00:00:00Z' }]
  show(data)
  const create = screen.getByRole<HTMLButtonElement>('button', { name: 'Create practice for these points' })
  expect(create.disabled).toBe(true)
  expect(screen.getAllByRole<HTMLInputElement>('checkbox').every(box => !box.checked)).toBe(true)
  await userEvent.click(screen.getByRole('checkbox', { name: 'Select card 2 for practice' }))
  expect(create.disabled).toBe(false)
  expect(screen.getByRole('link', { name: 'Open the original run report' }).getAttribute('href')).toBe('/teacher/reports/runs/8')
  expect(screen.getByRole('link', { name: 'Root review' }).getAttribute('href')).toBe('/teacher/activities/93')
})

it('preserves scored legacy reports when presentation metadata is absent', () => {
  const data = fixture()
  delete data.presentation
  delete data.outcomeKind
  delete data.sourceQuestionCount
  data.open = false
  data.closing = { kind: 'completed_review' }
  data.participants = data.participants.map(person => ({ ...person, practice: null, score: 100, correctCount: 1, answered: 1, incorrect: 0, unanswered: 1 }))
  data.questions = data.questions.map(question => ({ ...question, practice: null }))
  show(data)
  expect(screen.getByRole('columnheader', { name: 'Correct' })).toBeTruthy()
  expect(screen.getByRole('columnheader', { name: 'Incorrect' })).toBeTruthy()
  expect(screen.getByRole('checkbox', { name: 'Select question 1 for practice' })).toBeTruthy()
  expect(screen.queryByRole('heading', { name: 'Flashcard practice' })).toBeNull()
})

it('shows missing practice data honestly and does not turn a closed review into an assessment gap', () => {
  const data = fixture()
  data.open = false
  data.participants[0] = { ...data.participants[0]!, practice: null, status: 'submitted' }
  data.questions[0] = { ...data.questions[0]!, practice: null }
  show(data)
  expect(screen.getByText('Practice data unavailable; reload the report.')).toBeTruthy()
  expect(screen.getByText('Card practice details unavailable.')).toBeTruthy()
  expect(screen.queryByText(/shared error pattern/)).toBeNull()
  expect(screen.queryByText(/did not answer every question/)).toBeNull()
})

it('reports explicit speaking-card participation without scoring or flashcard ratings', () => {
  const data = fixture()
  data.presentation = { ...data.presentation!, definitionId: 'speaking-cards', semantics: 'discussion' }
  data.outcomeKind = 'discussion-practice'
  data.participants[0] = { ...data.participants[0]!, practice: { kind: 'discussion', total: 2, seen: 2, discussed: 1, notDiscussed: 1, completed: false } }
  data.questions = data.questions.map(question => ({ ...question, practice: { kind: 'discussion', total: 1, seen: 1, discussed: question.index ? 0 : 1, notDiscussed: question.index ? 1 : 0 } }))
  show(data)
  expect(screen.getByRole('heading', { name: 'Speaking-card practice' })).toBeTruthy()
  expect(screen.getByRole('columnheader', { name: 'Marked discussed' })).toBeTruthy()
  expect(screen.queryByRole('columnheader', { name: 'Rated' })).toBeNull()
  expect(screen.queryByRole('columnheader', { name: 'Correct' })).toBeNull()
  expect(screen.queryByText(/no answers/i)).toBeNull()
})

it('renders Arabic practice labels and an explicit empty state without invented zero evidence', async () => {
  await language.changeLanguage('ar')
  const data = fixture()
  data.participants = []
  data.participantCount = 0
  data.participation = { total: 0, incomplete: 0, submitted: 0, inProgress: 0, notStarted: 0, expired: 0 }
  show(data)
  expect(screen.getByRole('region', { name: 'تقدّم المراجعة الذاتية' }).getAttribute('dir')).toBe('rtl')
  expect(screen.getByText('لم تبدأ أي محاولة مراجعة بعد.')).toBeTruthy()
  expect(screen.queryByRole('columnheader', { name: 'صحيح' })).toBeNull()
  expect(screen.getByRole('checkbox', { name: 'اختر البطاقة 1 للتدريب' })).toBeTruthy()
})

it('renders memory boards, pairs and moves without assessment or recall-rating claims', async () => {
  const data = fixture()
  data.presentation = { ...data.presentation!, definitionId: 'memory', semantics: 'practice' }
  data.outcomeKind = 'memory-practice'
  data.participants[0] = { ...data.participants[0]!, practice: { kind: 'memory', total: 2, seen: 1, totalPairs: 8, pairsFound: 2, moves: 5, completedBoards: 0, completed: false } }
  data.questions = data.questions.map(question => ({ ...question, practice: { kind: 'memory', total: 1, seen: question.index ? 0 : 1, totalPairs: 4, pairsFound: question.index ? 0 : 2, moves: question.index ? 0 : 5, completedBoards: 0 } }))
  show(data)
  expect(screen.getByRole('heading', { name: 'Memory-pair practice' })).toBeTruthy()
  expect(screen.getByText('2 selected boards from 8 source questions')).toBeTruthy()
  const table = screen.getByRole('table', { name: 'Participant practice progress' })
  expect(within(table).getAllByRole('columnheader').map(cell => cell.textContent)).toEqual(['Participant', 'Boards opened', 'Pairs found', 'Two-card moves', 'Boards completed'])
  expect(within(table).getAllByRole('cell').map(cell => cell.textContent)).toEqual(['1 of 2', '2 of 8', '5', '0 of 2'])
  expect(screen.getByText(/Pair totals cover all selected boards/)).toBeTruthy()
  expect(screen.queryByRole('columnheader', { name: 'Correct' })).toBeNull()
  expect(screen.queryByRole('columnheader', { name: 'Rated' })).toBeNull()
  expect(screen.queryByText(/0%|no answers|Needs review/)).toBeNull()
  expect(screen.queryByText('private answer')).toBeNull()
  await userEvent.click(screen.getByRole('checkbox', { name: 'Select board 2 for practice' }))
  expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Create practice for these points' }).disabled).toBe(false)
})

it('renders Arabic memory progress and identifies unavailable pair totals', async () => {
  await language.changeLanguage('ar')
  const data = fixture()
  data.presentation = { ...data.presentation!, definitionId: 'memory', semantics: 'practice' }
  data.outcomeKind = 'memory-practice'
  data.participants[0] = { ...data.participants[0]!, status: 'not_started', practice: { kind: 'memory', total: 2, seen: 0, totalPairs: 0, pairsFound: 0, moves: 0, completedBoards: 0, completed: false } }
  data.questions = data.questions.map(question => ({ ...question, practice: null }))
  show(data)
  expect(screen.getByRole('region', { name: 'تقدّم تدريب أزواج الذاكرة' }).getAttribute('dir')).toBe('rtl')
  expect(screen.getByRole('columnheader', { name: 'أزواج مكتشفة' })).toBeTruthy()
  expect(screen.getByText('إجمالي الأزواج غير متاح')).toBeTruthy()
  expect(screen.getAllByText('تفاصيل تدريب اللوحة غير متاحة.')).toHaveLength(2)
  expect(screen.getByRole('checkbox', { name: 'اختر اللوحة 1 للتدريب' })).toBeTruthy()
  expect(screen.queryByRole('columnheader', { name: 'صحيح' })).toBeNull()
})

it('uses attempt denominators for per-board aggregate memory progress', () => {
  const data = fixture()
  data.presentation = { ...data.presentation!, definitionId: 'memory', semantics: 'practice' }
  data.outcomeKind = 'memory-practice'
  data.participants[0] = { ...data.participants[0]!, practice: null }
  data.questions[0] = { ...data.questions[0]!, practice: { kind: 'memory', total: 3, seen: 2, totalPairs: 8, pairsFound: 6, moves: 11, completedBoards: 1 } }
  data.questions[1] = { ...data.questions[1]!, practice: null }
  show(data)
  expect(screen.getByText('Practice data unavailable; reload the report.').getAttribute('colspan')).toBe('4')
  const board = screen.getByRole('checkbox', { name: 'Select board 1 for practice' }).closest('section')!
  expect(within(board).getAllByRole('definition').map(cell => cell.textContent)).toEqual(['2 of 3', '6 of 8', '11', '1 of 3'])
  expect(screen.getByText(/opened and completed counts use attempts as their denominator/)).toBeTruthy()
})

it.each(['word-search', 'crossword'] as const)('renders %s activity progress without vocabulary-mastery claims', kind => {
  const data = fixture()
  data.presentation = { ...data.presentation!, definitionId: kind, semantics: 'practice' }
  data.outcomeKind = 'word-grid-practice'
  data.participants[0] = { ...data.participants[0]!, practice: { kind, total: 2, seen: 1, totalWords: 12, wordsFound: 3, checks: 7, assistance: 0, completedBoards: 0, completed: false } }
  data.questions = data.questions.map(question => ({ ...question, practice: { kind, total: 1, seen: question.index ? 0 : 1, totalWords: 6, wordsFound: question.index ? 0 : 3, checks: question.index ? 0 : 7, assistance: 0, completedBoards: 0 } }))
  show(data)
  expect(screen.getByRole('heading', { name: kind === 'word-search' ? 'Word-search practice' : 'Crossword practice' })).toBeTruthy()
  const table = screen.getByRole('table', { name: 'Participant practice progress' })
  expect(within(table).getAllByRole('columnheader').map(cell => cell.textContent)).toEqual(['Participant', 'Boards opened', kind === 'word-search' ? 'Words found' : 'Entries matched', 'Checks', 'Assistance used', 'Boards completed'])
  expect(within(table).getAllByRole('cell').map(cell => cell.textContent)).toEqual(['1 of 2', '3 of 12', '7', '0', '0 of 2'])
  expect(screen.getByText(/Word totals cover all selected boards/)).toBeTruthy()
  expect(screen.getByText(/not a grade or evidence of vocabulary understanding or mastery/)).toBeTruthy()
  expect(screen.getByText('0 of 6')).toBeTruthy()
  expect(screen.getByRole('checkbox', { name: 'Select board 2 for practice' })).toBeTruthy()
  expect(screen.queryByRole('columnheader', { name: 'Correct' })).toBeNull()
  expect(screen.queryByText(/no answers|Needs review|0%/)).toBeNull()
  expect(screen.queryByText('private answer')).toBeNull()
})

it('renders Arabic crossword aggregate counts and completed boards', async () => {
  await language.changeLanguage('ar')
  const data = fixture()
  data.presentation = { ...data.presentation!, definitionId: 'crossword', semantics: 'practice' }
  data.outcomeKind = 'word-grid-practice'
  data.open = false
  data.participants = []
  data.questions = [{ ...data.questions[0]!, practice: { kind: 'crossword', total: 3, seen: 2, totalWords: 12, wordsFound: 8, checks: 14, assistance: 0, completedBoards: 1 } }]
  show(data)
  expect(screen.getByRole('region', { name: 'تقدّم تدريب شبكات الكلمات' }).getAttribute('dir')).toBe('rtl')
  expect(screen.getByRole('heading', { name: 'تدريب الكلمات المتقاطعة' })).toBeTruthy()
  const n = (value: number) => new Intl.NumberFormat('ar').format(value)
  expect(screen.getAllByRole('definition').map(cell => cell.textContent)).toEqual([`${n(2)} من ${n(3)}`, `${n(8)} من ${n(12)}`, n(14), n(0), `${n(1)} من ${n(3)}`])
  expect(screen.getByText('إجابات مطابقة')).toBeTruthy()
  expect(screen.getByRole('checkbox', { name: 'اختر اللوحة 1 للتدريب' })).toBeTruthy()
  expect(screen.queryByText(/نسبة الصحيح/)).toBeNull()
})

it('does not guess a grid kind when presentation metadata is missing', () => {
  const data = fixture()
  delete data.presentation
  data.outcomeKind = 'word-grid-practice'
  data.participants[0] = { ...data.participants[0]!, practice: null }
  data.questions = data.questions.map(question => ({ ...question, practice: null }))
  show(data)
  expect(screen.getByRole('heading', { name: 'Word-grid practice' })).toBeTruthy()
  expect(screen.getByText('Practice data unavailable; reload the report.').getAttribute('colspan')).toBe('5')
  expect(screen.getAllByText('Board practice details unavailable.')).toHaveLength(2)
  expect(screen.queryByRole('heading', { name: 'Word-search practice' })).toBeNull()
})

it('distinguishes unavailable word totals from a board with no attempts', () => {
  const data = fixture()
  data.presentation = { ...data.presentation!, definitionId: 'word-search', semantics: 'practice' }
  data.outcomeKind = 'word-grid-practice'
  data.participants[0] = { ...data.participants[0]!, practice: { kind: 'word-search', total: 2, seen: 0, totalWords: 0, wordsFound: 0, checks: 0, assistance: 0, completedBoards: 0, completed: false } }
  data.questions = [{ ...data.questions[0]!, practice: { kind: 'word-search', total: 0, seen: 0, totalWords: 0, wordsFound: 0, checks: 0, assistance: 0, completedBoards: 0 } }]
  show(data)
  expect(screen.getByText('Word total unavailable')).toBeTruthy()
  expect(screen.getByText('No attempts yet')).toBeTruthy()
  expect(screen.queryByText('No board opened yet')).toBeNull()
})
