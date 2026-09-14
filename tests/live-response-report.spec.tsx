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
  runId: 42, title: 'Synthetic live evidence', mode: 'live', gameMode: 'quiz', endReason: 'completed', open: false, deadline: null,
  questionCount: 1, plannedQuestionCount: 2, sourceQuestionCount: 2, participantCount: 2, denominator: 'participants',
  presentation: { definitionId: 'open-box', definitionVersion: 1, adapterVersion: 1, contentVersionId: 71, semantics: 'scored', selectedQuestionIds: [11, 13] }, outcomeKind: 'scored-responses',
  participation: { total: 2, incomplete: 0, submitted: 0, inProgress: 0, notStarted: 0, expired: 0 },
  participants: [{ id: 'a', name: 'آمنة Smith', score: 0, gamePoints: 150, firstResponses: 1, assistedFirstResponses: 0, repeatResponses: 1, practiceRetries: 0, correctCount: 0, answered: 1, incorrect: 1, unanswered: 0, connected: false, status: 'participated', submittedAt: null, remedialAnswered: 0, remedialCorrect: 0, originalCorrect: 0 },
    { id: 'b', name: 'Synthetic second learner', score: 100, gamePoints: 300, firstResponses: 1, assistedFirstResponses: 1, repeatResponses: 1, practiceRetries: 0, correctCount: 1, answered: 1, incorrect: 0, unanswered: 0, connected: false, status: 'participated', submittedAt: null, remedialAnswered: 0, remedialCorrect: 0, originalCorrect: 1 }],
  questions: [{ index: 1, questionId: 13, kind: 'tf', prompt: 'The reviewed statement.', explanation: null, remedial: false, correctKey: 'true', correctLabel: 'True', answered: 2, correct: 1, incorrect: 1, correctPercent: 50, evidence: 'observed', needsReview: false, participation: { notAnswered: 0, notYetAnswered: 0, unanswered: 0 }, distribution: [{ key: 'true', label: 'True', count: 1, isCorrect: true }, { key: 'false', label: 'False', count: 1, isCorrect: false }], occurrenceIndices: [1, 2], repeatResponses: 2, assistedFirstResponses: 1, practiceRetries: 0 }],
  liveEvidence: { semantics: 'scored', totals: { firstResponses: 2, repeatResponses: 2, assistedFirstResponses: 1, practiceRetries: 0, gamePoints: 450 }, occurrences: [
    { id: 'not-opened', index: 0, canonicalIndex: 0, questionId: 11, pass: 1, status: 'skipped', openedAt: null, endsAt: null, responses: 0, firstResponses: 0, repeatResponses: 0, assistedResponses: 0, assistedFirstResponses: 0, gamePoints: 0, practiceRetries: 0 },
    { id: 'first', index: 1, canonicalIndex: 1, questionId: 13, pass: 1, status: 'completed', openedAt: '2026-09-14T00:01:00Z', endsAt: '2026-09-14T00:01:20Z', responses: 2, firstResponses: 2, repeatResponses: 0, assistedResponses: 1, assistedFirstResponses: 1, gamePoints: 100, practiceRetries: 0 },
    { id: 'repeat', index: 2, canonicalIndex: 1, questionId: 13, pass: 2, status: 'completed', openedAt: '2026-09-14T00:02:00Z', endsAt: '2026-09-14T00:02:20Z', responses: 2, firstResponses: 0, repeatResponses: 2, assistedResponses: 2, assistedFirstResponses: 0, gamePoints: 350, practiceRetries: 0 },
  ] }, pattern: null, followUps: [], followUpOf: null, closing: { kind: 'completed_review' }, evidenceNote: 'First responses only; no mastery claim.',
})
function show(data = fixture()) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } })
  client.setQueryData(['report', '42', false], data)
  render(<I18nextProvider i18n={language}><QueryClientProvider client={client}><MemoryRouter initialEntries={['/teacher/reports/runs/42']}><Routes><Route path="/teacher/reports/runs/:id" element={<Reports/>}/></Routes></MemoryRouter></QueryClientProvider></I18nextProvider>)
}

it('keeps first-response correctness separate from repeats, assistance and game points', () => {
  show()
  const first = screen.getByRole('table', { name: 'First-response evidence' })
  const row = within(first).getByRole('rowheader', { name: 'آمنة Smith' }).closest('tr')!
  expect(within(row).getAllByRole('cell').map(cell => cell.textContent)).toEqual(['1 of 1', '0 of 1', '0'])
  const practice = screen.getByRole('table', { name: 'Repeat practice and assistance' })
  expect(within(practice).getByRole('rowheader', { name: 'آمنة Smith' }).closest('tr')!.textContent).toContain('150')
  expect(screen.getByText(/Repeat responses never replace the first response/)).toBeTruthy()
  expect(screen.queryByText(/50%/)).toBeNull()
  expect(screen.getByRole('checkbox', { name: 'Select question 2 for practice' })).toBeTruthy()
  expect(screen.queryByRole('checkbox', { name: 'Select question 1 for practice' })).toBeNull()
  expect(screen.getByRole('button', { name: 'Export CSV' })).toBeTruthy()
})

it('shows selected-but-unopened questions only in occurrence history without missing-response claims', () => {
  show()
  const history = screen.getByRole('region', { name: 'Question delivery history' })
  const unopened = within(history).getByRole('heading', { name: 'Appearance 1 · Question 1 · Round 1' }).closest('li')!
  expect(within(unopened).getByText('Not opened — no response opportunity')).toBeTruthy()
  expect(within(unopened).queryByText('First responses')).toBeNull()
  expect(within(unopened).queryByRole('time')).toBeNull()
  expect(within(history).getByRole('heading', { name: 'Appearance 3 · Question 2 · Round 2' })).toBeTruthy()
  expect(screen.queryByText(/did not answer every question/)).toBeNull()
})

it('keeps practice response evidence ungraded and leaves follow-up selection manual', async () => {
  const data = fixture()
  data.outcomeKind = 'practice-responses'
  data.presentation!.semantics = 'practice'
  data.liveEvidence!.semantics = 'practice'
  data.participants = [{ ...data.participants[0]!, score: null, repeatResponses: 0, practiceRetries: 1 }]
  data.questions[0] = { ...data.questions[0]!, answered: 1, correct: 0, incorrect: 1, correctPercent: 0, practiceRetries: 1, repeatResponses: 0, needsReview: false }
  show(data)
  expect(screen.getByRole('heading', { name: 'Practice responses — not a grade' })).toBeTruthy()
  expect(screen.getByText('Practice responses')).toBeTruthy()
  expect(screen.queryByText('Observed responses')).toBeNull()
  expect(screen.queryByText(/Needs review|Correct rate|0%|Responses are complete/)).toBeNull()
  const create = screen.getByRole<HTMLButtonElement>('button', { name: 'Create practice for these points' })
  expect(create.disabled).toBe(true)
  await userEvent.click(screen.getByRole('checkbox', { name: 'Select question 2 for practice' }))
  expect(create.disabled).toBe(false)
  const row = within(screen.getByRole('table', { name: 'Repeat practice and assistance' })).getByRole('rowheader', { name: 'آمنة Smith' }).closest('tr')!
  expect(within(row).getAllByRole('cell').map(cell => cell.textContent)).toEqual(['0', '0', '1', '150'])
})

it('shows no correctness evidence when nothing was opened, without calling it failed participation', () => {
  const data = fixture()
  data.questionCount = 0; data.questions = []
  data.participants = data.participants.map(person => ({ ...person, firstResponses: 0, answered: 0, correctCount: 0, unanswered: 0 }))
  data.liveEvidence!.occurrences = [data.liveEvidence!.occurrences[0]!]
  show(data)
  expect(screen.getByText('No question was opened for responses. Correctness evidence is unavailable.')).toBeTruthy()
  expect(screen.queryByRole('checkbox')).toBeNull()
  expect(screen.queryByText(/Responses are complete|no answers yet|did not answer every question/)).toBeNull()
})

it('renders Arabic source-question identity and distinct evidence labels', async () => {
  await language.changeLanguage('ar')
  show()
  expect(screen.getByRole('region', { name: 'دليل الإجابات المباشرة' }).getAttribute('dir')).toBe('rtl')
  expect(screen.getByRole('table', { name: 'دليل الإجابات الأولى' })).toBeTruthy()
  expect(screen.getByRole('columnheader', { name: 'إجابات أولى بمساعدة' })).toBeTruthy()
  expect(screen.getByRole('checkbox', { name: 'اختر السؤال 2 للتدريب' })).toBeTruthy()
})

it('does not substitute a scored report when live-practice detail is unavailable', () => {
  const data = fixture(); data.outcomeKind = 'practice-responses'; data.liveEvidence = null
  show(data)
  expect(screen.getByText('Live practice evidence unavailable. Reload the report; no grade is substituted.')).toBeTruthy()
  expect(screen.queryByRole('columnheader', { name: 'Correct' })).toBeNull()
})

it('discloses server interruption without calling the saved response history a completed class', () => {
  const data = fixture(); data.endReason = 'server_interrupted'
  show(data)
  expect(screen.getByText('Run ending: Interrupted by the server. Saved responses are retained; this does not mean every question was completed.')).toBeTruthy()
})

it('discloses the recorded host ending in Arabic', async () => {
  await language.changeLanguage('ar')
  const data = fixture(); data.endReason = 'host_ended'
  show(data)
  expect(screen.getByText('نهاية الحصة: أنهاها المعلّم.')).toBeTruthy()
})
