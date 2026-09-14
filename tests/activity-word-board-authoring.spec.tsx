import { afterEach, beforeAll, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createInstance } from 'i18next'
import { I18nextProvider } from 'react-i18next'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthContext } from '../src/context/auth-context'
import ActivityEditor from '../src/features/editor/ActivityEditor'
import { nativeQuestionDefault } from '../src/features/editor/NativeQuestionEditor'
import type { ActivityRecord, QuestionRecord } from '../src/lib/api'
import type { AuthoredWordBoards, WordBoardGenerate } from '../src/shared/word-board-contract'

const language = createInstance()
beforeAll(async () => { await language.init({ lng: 'en', resources: { en: { translation: {} } } }) })
afterEach(() => { cleanup(); sessionStorage.clear(); vi.unstubAllGlobals() })
const activity: ActivityRecord = { id: 42, authorId: 73, title: 'Synthetic vocabulary', contentLanguage: 'en', subjectId: 1, levelId: 8, curriculumNodeId: null, purposeId: 2, visibility: 'private', theme: 'classic', revision: 1, currentVersionId: null, createdAt: '', updatedAt: '', categoryId: null, educationStageIds: [], countryIds: [] }

it.each([false, true])('flushes vocabulary before generation, resumes revisions and clears stale previews (lost response: %s)', async lostResponse => {
  let question: QuestionRecord & { presentationBoards: AuthoredWordBoards } = { id: 7, ordinal: 1, kind: 'vocabulary', prompt: 'Find the reviewed words.', payload: nativeQuestionDefault('vocabulary', 'en'), mediaKey: null, timeLimitS: 20, revision: 1, presentationBoards: {} }
  const requests: { path: string; method: string; body: Record<string, unknown> }[] = []
  let interrupted = false
  vi.stubGlobal('fetch', async (input: string, init: RequestInit = {}) => {
    const path = String(input), method = init.method ?? 'GET', body = typeof init.body === 'string' ? JSON.parse(init.body) : {}
    if (method !== 'GET') requests.push({ path, method, body })
    if (path.endsWith('/activities/42')) return Response.json({ activity, questions: [question], errorPairs: [] })
    if (path.endsWith('/questions/7') && method === 'PATCH') { question = { ...question, ...body, revision: question.revision + 1, presentationBoards: {} }; return Response.json({ question }) }
    if (path.endsWith('/questions/7/word-board')) {
      const request = body as WordBoardGenerate
      if (question.presentationBoards['word-search']?.requestId === request.requestId) return Response.json({ question, board: question.presentationBoards['word-search'].board })
      const board: NonNullable<AuthoredWordBoards['word-search']>['board'] = { algorithmVersion: 1, kind: 'word-search', policy: nativeQuestionDefault('vocabulary', 'en').policy, config: request.config, matrix: [['m', 'o', 'o', 'n']], placements: [{ entryId: 'word_a', word: 'moon', clue: 'Plants need this.', number: 1, direction: { rowStep: 0, columnStep: 1 }, cells: [{ row: 0, column: 0 }, { row: 0, column: 1 }, { row: 0, column: 2 }, { row: 0, column: 3 }], equivalentPaths: [] }], unplaced: [], status: 'ready', workUsed: 1 }
      question = { ...question, revision: question.revision + 1, presentationBoards: { 'word-search': { requestId: request.requestId, fingerprint: 'a'.repeat(64), sourceHash: 'b'.repeat(64), revision: question.revision + 1, board } } }
      if (lostResponse && !interrupted) { interrupted = true; throw new TypeError('Synthetic lost response after save') }
      return Response.json({ question, board })
    }
    return Response.json({})
  })
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(<AuthContext value={{ status: 'authenticated', user: null, accessToken: null, needsProfile: false, signIn: async () => { throw new Error('Not in scope') }, signOut: async () => {}, forgetSession: () => {}, applyUser: () => {} }}><I18nextProvider i18n={language}><QueryClientProvider client={client}><MemoryRouter initialEntries={['/teacher/activities/42']}><Routes><Route path="/teacher/activities/:id" element={<ActivityEditor/>}/></Routes></MemoryRouter></QueryClientProvider></I18nextProvider></AuthContext>)
  fireEvent.change(await screen.findByRole('textbox', { name: 'Word 1' }), { target: { value: 'moon' } })
  await userEvent.click(screen.getByText('Word boards'))
  await userEvent.click(screen.getByRole('button', { name: 'Generate and save board' }))
  if (lostResponse) await userEvent.click(await screen.findByRole('button', { name: 'Retry generating and saving board' }))
  expect(await screen.findByText('All words placed. Review the board, then use the existing activity approval button.')).toBeTruthy()
  expect(requests.map(request => request.method)).toEqual(lostResponse ? ['PATCH', 'POST', 'POST'] : ['PATCH', 'POST'])
  if (lostResponse) expect(requests[2]!.body).toEqual(requests[1]!.body)
  expect(requests[0]!.body).toMatchObject({ expectedRevision: 1, payload: { entries: [{ word: 'moon' }] } })
  expect(requests[1]!.body).toMatchObject({ expectedRevision: 2, kind: 'word-search' })
  expect(requests.some(request => request.path.endsWith('/publish'))).toBe(false)
  fireEvent.change(screen.getByRole('textbox', { name: 'Word 1' }), { target: { value: 'sun' } })
  expect(screen.queryByRole('table', { name: 'Saved board preview' })).toBeNull()
  await userEvent.click(screen.getByRole('button', { name: 'Generate and save board' }))
  expect(await screen.findByRole('table', { name: 'Saved board preview' })).toBeTruthy()
  expect(requests.at(-2)!.body.expectedRevision).toBe(3)
  expect(requests.at(-1)!.body.expectedRevision).toBe(4)
  client.clear()
})
