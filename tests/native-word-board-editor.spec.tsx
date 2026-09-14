import { afterEach, beforeAll, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { createInstance } from 'i18next'
import { I18nextProvider } from 'react-i18next'
import { NativeQuestionEditor, nativeQuestionDefault, type NativeWordBoardTools } from '../src/features/editor/NativeQuestionEditor'
import type { AuthoredWordBoards } from '../src/shared/word-board-contract'

const language = createInstance()
beforeAll(async () => { await language.init({ lng: 'en', resources: { en: { translation: {} }, ar: { translation: {} } } }) })
afterEach(() => { cleanup(); void language.changeLanguage('en') })
function Editor({ generate, boards = {} }: { generate: NativeWordBoardTools['generate']; boards?: AuthoredWordBoards }) {
  const [payload, setPayload] = useState(nativeQuestionDefault('vocabulary', 'en'))
  return <I18nextProvider i18n={language}><NativeQuestionEditor kind="vocabulary" payload={payload} onChange={setPayload} wordBoards={{ boards, generate }}/></I18nextProvider>
}

it('offers bounded board settings and explicitly requests a saved word-search without approval', async () => {
  const requests: Parameters<NativeWordBoardTools['generate']>[0][] = []
  render(<Editor generate={async request => { requests.push(request) }}/>)
  await userEvent.click(screen.getByText('Word boards'))
  const section = screen.getByRole('group', { name: 'Word-board settings' })
  expect(within(section).getByRole<HTMLInputElement>('spinbutton', { name: 'Rows' }).max).toBe('20')
  await userEvent.click(screen.getByRole('button', { name: 'Generate and save board' }))
  expect(requests).toHaveLength(1)
  expect(requests[0]).toMatchObject({ kind: 'word-search', config: { seed: 41, rows: 8, columns: 8, allowReverse: false, allowDiagonal: false, maxWork: 50000 } })
  expect(requests[0]!.requestId).toMatch(/^[a-f0-9-]{36}$/)
  expect(screen.getByText(/does not approve the activity/)).toBeTruthy()
})

const partialBoards = (): AuthoredWordBoards => ({ crossword: { requestId: '12345678-1234-4123-8123-123456789012', fingerprint: 'a'.repeat(64), sourceHash: 'b'.repeat(64), revision: 4,
  board: { algorithmVersion: 1, kind: 'crossword', policy: nativeQuestionDefault('vocabulary', 'en').policy,
    config: { seed: 41, rows: 1, columns: 3, allowReverse: false, allowDiagonal: false, maxWork: 50000 }, matrix: [['c', 'a', 't']],
    placements: [{ entryId: 'cat', word: 'cat', clue: 'A feline', number: 1, direction: { rowStep: 0, columnStep: 1 }, cells: [{ row: 0, column: 0 }, { row: 0, column: 1 }, { row: 0, column: 2 }], equivalentPaths: [] }],
    unplaced: [{ entryId: 'dog', word: 'dog', reason: 'no-placement' }], status: 'partial', workUsed: 10 } } })

it('shows every unplaced word and separates the saved learner board from the instructor solution', async () => {
  render(<Editor boards={partialBoards()} generate={async () => {}}/>)
  await userEvent.click(screen.getByText('Word boards'))
  expect(screen.getByRole('alert').textContent).toContain('Approval is blocked')
  expect(screen.getByText('dog')).toBeTruthy()
  expect(screen.getByText('No connecting placement')).toBeTruthy()
  const grid = screen.getByRole('table', { name: 'Saved board preview' })
  expect(within(grid).getAllByRole('cell').map(cell => cell.textContent)).toEqual(['1', '', ''])
  await userEvent.click(screen.getByRole('checkbox', { name: 'Show instructor solution' }))
  expect(within(grid).getAllByRole('cell').map(cell => cell.textContent)).toEqual(['1c', 'a', 't'])
  expect(screen.getByText(/1 of 2 words placed/)).toBeTruthy()
})

it('retries an uncertain generation with the same UUID and uses a new UUID after settings change', async () => {
  const requests: Parameters<NativeWordBoardTools['generate']>[0][] = []
  render(<Editor generate={async request => { requests.push(request); throw new Error('Synthetic network interruption') }}/>)
  await userEvent.click(screen.getByText('Word boards'))
  await userEvent.click(screen.getByRole('button', { name: 'Generate and save board' }))
  await userEvent.click(screen.getByRole('button', { name: 'Retry generating and saving board' }))
  expect(requests[1]).toEqual(requests[0])
  fireEvent.change(screen.getByRole('spinbutton', { name: 'Rows' }), { target: { value: '10' } })
  await userEvent.click(screen.getByRole('button', { name: 'Retry generating and saving board' }))
  expect(requests[2]!.requestId).not.toBe(requests[0]!.requestId)
  expect(requests[2]!.config.rows).toBe(10)
})

it('keeps Arabic graphemes and saved coordinates intact in the preview and blocks out-of-range dimensions', async () => {
  await language.changeLanguage('ar')
  const boards = partialBoards()
  boards.crossword!.board.matrix = [['ت', 'ي', 'بَ']]
  render(<Editor boards={boards} generate={async () => { throw new Error('Must stay disabled') }}/>)
  await userEvent.click(screen.getByText('لوحات الكلمات'))
  await userEvent.click(screen.getByRole('checkbox', { name: 'أظهر حل المعلّم' }))
  const grid = screen.getByRole('table', { name: 'معاينة اللوحة المحفوظة' })
  expect(grid.getAttribute('dir')).toBe('ltr')
  expect(within(grid).getByRole('cell', { name: 'صف 1 عمود 3: بَ' }).textContent).toBe('بَ')
  fireEvent.change(screen.getByRole('spinbutton', { name: 'الصفوف' }), { target: { value: '21' } })
  expect(screen.getByRole<HTMLButtonElement>('button', { name: 'أنشئ اللوحة واحفظها' }).disabled).toBe(true)
})
