import { afterEach, beforeAll, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { createInstance } from 'i18next'
import { I18nextProvider } from 'react-i18next'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AdvancedCanvas } from '../src/features/editor/AdvancedCanvas'
import { OrderCanvas } from '../src/features/editor/OrderCanvas'
import type { QuestionRecord } from '../src/lib/api'
import { matchPayloadSchema, orderPayloadSchema, type MatchPayload, type OrderPayload } from '../src/shared/questions'
import { markMatch, markOrder } from '../src/shared/scoring'

const language = createInstance()
beforeAll(async () => { await language.init({ lng: 'en', resources: { en: { translation: {} }, ar: { translation: {} } } }) })
afterEach(() => { cleanup(); void language.changeLanguage('en') })
const pairs = (): MatchPayload => ({ cards: [{ key: 'apple', text: 'Apple' }, { key: 'pear', text: 'Pear' }], targets: [{ key: 'fruit', text: 'Fruit' }, { key: 'food', text: 'Food' }, { key: 'plant', text: 'Plant' }], map: { apple: 'fruit', pear: 'fruit' } })
function MatchEditor({ initial = pairs() }: { initial?: MatchPayload }) {
  const [question, setQuestion] = useState<QuestionRecord>({ id: 1, revision: 1, ordinal: 0, kind: 'match', prompt: 'Classify these foods.', mediaKey: null, timeLimitS: 30, payload: initial })
  return <I18nextProvider i18n={language}><AdvancedCanvas activityId={1} question={question} onPatch={patch => setQuestion(previous => ({ ...previous, ...patch }))} onPrepare={async () => question} onApplied={async () => {}}/><output aria-label="Saved payload">{JSON.stringify(question.payload)}</output></I18nextProvider>
}
const savedMatch = () => matchPayloadSchema.parse(JSON.parse(screen.getByLabelText('Saved payload').textContent!))

it('opts into extra accepted targets per card while retaining the reference answer and stable identities', async () => {
  render(<MatchEditor/>)
  const user = userEvent.setup()
  await user.click(screen.getByText('Accepted alternatives'))
  await user.click(screen.getByRole('checkbox', { name: 'Accept equivalent labels and additional targets' }))
  const card = screen.getByRole('group', { name: 'Accepted targets for card 1: Apple' })
  expect(within(card).getByRole<HTMLInputElement>('checkbox', { name: 'Fruit — reference target' }).disabled).toBe(true)
  await user.click(within(card).getByRole('checkbox', { name: 'Food' }))
  const saved = savedMatch()
  expect(saved.equivalenceVersion).toBe(1)
  expect(saved.acceptedTargets).toEqual({ apple: ['fruit', 'food'] })
  expect(saved.map).toEqual(pairs().map)
  expect(saved.cards).toEqual(pairs().cards)
  expect(markMatch(saved, { kind: 'match', pairs: [['apple', 'food'], ['pear', 'fruit']] }).correct).toBe(true)
  expect(markMatch(saved, { kind: 'match', pairs: [['apple', 'food'], ['pear', 'food']] }).correct).toBe(false)
})

it('keeps accepted target sets valid when changing the reference or deleting targets and cards', async () => {
  render(<MatchEditor initial={{ ...pairs(), cards: [...pairs().cards, { key: 'plum', text: 'Plum' }], map: { ...pairs().map, plum: 'fruit' }, equivalenceVersion: 1, acceptedTargets: { apple: ['fruit', 'food'], plum: ['fruit', 'food'] } }}/>)
  const user = userEvent.setup()
  await user.click(screen.getByRole('combobox', { name: 'Target for card 1' }))
  await user.click(await screen.findByRole('option', { name: 'Plant' }))
  expect(savedMatch().acceptedTargets?.apple).toEqual(['fruit', 'food', 'plant'])
  await user.click(screen.getAllByRole('button', { name: 'Delete target' })[0]!)
  expect(savedMatch().acceptedTargets).toEqual({ apple: ['food', 'plant'], plum: ['food'] })
  await user.click(screen.getAllByRole('button', { name: 'Delete card' })[2]!)
  expect(savedMatch().acceptedTargets).toEqual({ apple: ['food', 'plant'] })
})

const repeated = (): OrderPayload => ({ items: [{ key: 'a', text: 'very' }, { key: 'b', text: 'very' }, { key: 'c', text: 'good' }], correct: ['a', 'b', 'c'] })
function OrderEditor({ initial = repeated() }: { initial?: OrderPayload }) {
  const [payload, setPayload] = useState(initial)
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: false } } }))
  return <QueryClientProvider client={client}><I18nextProvider i18n={language}><OrderCanvas payload={payload} mediaKey={null} onMediaChange={() => {}} onChange={setPayload}/><output aria-label="Saved payload">{JSON.stringify(payload)}</output></I18nextProvider></QueryClientProvider>
}
const savedOrder = () => orderPayloadSchema.parse(JSON.parse(screen.getByLabelText('Saved payload').textContent!))

it('explicitly accepts interchangeable repeated sequence tiles without changing their IDs or logical order', async () => {
  render(<OrderEditor/>)
  const user = userEvent.setup()
  await user.click(screen.getByText('Advanced settings'))
  const toggle = screen.getByRole('checkbox', { name: 'Accept swaps of identical tiles' })
  expect(markOrder(savedOrder(), { kind: 'order', sequence: ['b', 'a', 'c'] }).correct).toBe(false)
  await user.click(toggle)
  expect(savedOrder()).toEqual({ ...repeated(), equivalenceVersion: 1 })
  expect(markOrder(savedOrder(), { kind: 'order', sequence: ['b', 'a', 'c'] }).correct).toBe(true)
  expect(markOrder(savedOrder(), { kind: 'order', sequence: ['c', 'a', 'b'] }).correct).toBe(false)
  await user.click(toggle)
  expect(savedOrder().equivalenceVersion).toBeUndefined()
})

it('removes equivalence on switching to dependency-only grading and explains its disabled control', async () => {
  render(<OrderEditor initial={{ ...repeated(), equivalenceVersion: 1 }}/>)
  const user = userEvent.setup()
  await user.click(screen.getByText('Advanced settings'))
  await user.click(screen.getByRole('combobox', { name: 'How the order is judged' }))
  await user.click(await screen.findByRole('option', { name: 'Only these dependencies matter' }))
  expect(savedOrder().mode).toBe('partial')
  expect(savedOrder().equivalenceVersion).toBeUndefined()
  expect(screen.getByRole<HTMLInputElement>('checkbox', { name: 'Accept swaps of identical tiles' }).disabled).toBe(true)
  expect(screen.getByText('Available for exact or accepted orders, not dependency-only grading.')).toBeTruthy()
})

it('exposes saved matching alternatives in Arabic and removes them only through explicit opt-out', async () => {
  await language.changeLanguage('ar')
  render(<MatchEditor initial={{ ...pairs(), equivalenceVersion: 1, acceptedTargets: { apple: ['fruit', 'food'] } }}/>)
  const user = userEvent.setup()
  await user.click(screen.getByText('البدائل المقبولة'))
  expect(within(screen.getByRole('group', { name: 'الأهداف المقبولة للبطاقة 1: Apple' })).getByRole<HTMLInputElement>('checkbox', { name: 'Food' }).checked).toBe(true)
  await user.click(screen.getByRole('checkbox', { name: 'اقبل النصوص المتطابقة والأهداف الإضافية' }))
  expect(savedMatch().acceptedTargets).toBeUndefined()
  expect(savedMatch().equivalenceVersion).toBeUndefined()
  expect(savedMatch().map).toEqual(pairs().map)
})
