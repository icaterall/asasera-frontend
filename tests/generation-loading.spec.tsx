import {afterEach, beforeAll, beforeEach, expect, it, vi} from 'vitest'
import {act, cleanup, fireEvent, render, screen, waitFor} from '@testing-library/react'
import {createInstance} from 'i18next'
import {I18nextProvider} from 'react-i18next'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {GenerationPanel} from '../src/features/editor/GenerationPanel'
import {api, type ActivityRecord} from '../src/lib/api'

const language = createInstance()
const activity: ActivityRecord = {id: 42, title: 'Fractions', theme: 'classic', revision: 1, currentVersionId: null, visibility: 'private', ownerId: 73, subjectId: null, levelId: null, curriculumNodeId: null, purposeId: 2, createdAt: '', updatedAt: '', categoryId: 1, educationStageIds: [8], countryIds: [1]}
const quote = {maxAuthorizedMillicents: 100, spendableMillicents: 1000, affordable: true, pricingAvailable: true, providerConfigured: true}
const job = {id: 90, activityId: 42, task: 'questions', state: 'queued', imageKey: null, questionId: null, settlementComplete: false, origin: 'topic', maxAuthorizedMillicents: 100, settledMillicents: 0, errorCode: null, result: null}
function deferred<T>() {
  let resolve!: (value: T) => void, reject!: (reason: Error) => void
  const promise = new Promise<T>((accept, fail) => {resolve = accept; reject = fail})
  return {promise, resolve, reject}
}
function show() {
  const client = new QueryClient({defaultOptions: {queries: {retry: false}}})
  render(<I18nextProvider i18n={language}><QueryClientProvider client={client}><GenerationPanel activity={activity} question={null} onClose={vi.fn()} onApplied={async () => {}}/></QueryClientProvider></I18nextProvider>)
  fireEvent.change(screen.getByLabelText('What should learners practice?'), {target: {value: 'Compare fractions'}})
  return client
}
beforeAll(async () => {
  await language.init({lng: 'en', resources: {en: {translation: {}}}})
  vi.stubGlobal('ResizeObserver', class {observe() {} unobserve() {} disconnect() {}})
  vi.stubGlobal('matchMedia', vi.fn(() => ({matches: false, addEventListener() {}, removeEventListener() {}})))
  HTMLDialogElement.prototype.showModal = function () {this.setAttribute('open', '')}
  HTMLDialogElement.prototype.close = function () {this.removeAttribute('open')}
})
beforeEach(() => {
  vi.spyOn(api, 'get').mockImplementation(async path => {
    if (path.endsWith('/labels')) return {labels: [], pairs: [], decisions: [], schedule: null}
    if (path.endsWith('/jobs/90')) return {job}
    return {jobs: []}
  })
})
afterEach(() => {cleanup(); vi.restoreAllMocks()})

it('shows loading for cost and generation requests, then for queued/running AI work until candidates arrive', async () => {
  const cost = deferred<typeof quote>(), generation = deferred<{job: typeof job}>()
  const post = vi.spyOn(api, 'post').mockImplementation(path => path.endsWith('/quote') ? cost.promise : generation.promise)
  const client = show()
  const costButton = screen.getByRole('button', {name: 'Show the cost cap'})
  fireEvent.click(costButton)
  expect(costButton.getAttribute('aria-busy')).toBe('true')
  expect(costButton.querySelector('img')).not.toBeNull()
  await act(async () => {cost.resolve(quote)})
  const generate = await screen.findByRole('button', {name: 'Generate within this cap'})
  expect(costButton.getAttribute('aria-busy')).toBeNull()
  fireEvent.click(generate)
  expect(generate.getAttribute('aria-busy')).toBe('true')
  expect(generate.querySelector('img')).not.toBeNull()
  expect(generate.hasAttribute('disabled')).toBe(true)
  fireEvent.click(generate)
  expect(post).toHaveBeenCalledTimes(2)
  await act(async () => {generation.resolve({job})})
  await screen.findByText('Waiting for AI…')
  expect(screen.getByText('Waiting for AI…').closest('[role="status"]')?.querySelector('img')).not.toBeNull()
  await waitFor(() => expect(client.isFetching()).toBe(0))
  await act(async () => {client.setQueryData(['activity-generation-job', 90], {job: {...job, state: 'running'}})})
  await screen.findByText('AI is preparing your questions…')
  expect(screen.getByRole('button', {name: 'Cancel and release credit'}).hasAttribute('disabled')).toBe(false)
  await act(async () => {client.setQueryData(['activity-generation-job', 90], {job: {...job, state: 'succeeded', result: {candidates: [{kind: 'tf', prompt: 'One half equals two quarters?', payloadJson: '{"correct":true}'}], appliedIndexes: [], rejected: 0, nextRevision: 1}}})})
  await screen.findByText('One half equals two quarters?')
  expect(screen.queryByText('AI is preparing your questions…')).toBeNull()
  expect(screen.queryByText('Waiting for AI…')).toBeNull()
})

it('releases the busy button after a rejected generation request so the teacher can retry', async () => {
  const generation = deferred<never>()
  vi.spyOn(api, 'post').mockImplementation(path => path.endsWith('/quote') ? Promise.resolve(quote) : generation.promise)
  show()
  fireEvent.click(screen.getByRole('button', {name: 'Show the cost cap'}))
  const generate = await screen.findByRole('button', {name: 'Generate within this cap'})
  fireEvent.click(generate)
  expect(generate.getAttribute('aria-busy')).toBe('true')
  await act(async () => {generation.reject(new Error('Generation is unavailable'))})
  await waitFor(() => expect(generate.getAttribute('aria-busy')).toBeNull())
  expect(generate.hasAttribute('disabled')).toBe(false)
  expect(screen.getByRole('alert').textContent).toBe('Generation is unavailable')
})
