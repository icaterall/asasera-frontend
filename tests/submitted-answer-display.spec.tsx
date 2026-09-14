import { afterEach, beforeAll, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createInstance } from 'i18next'
import { I18nextProvider } from 'react-i18next'
import { QuestionInput } from '../src/features/session/QuestionInput'
import type { PublicQuestion } from '../src/shared/session'

const language = createInstance()
beforeAll(async () => { await language.init({ lng: 'en', resources: { en: { translation: {} }, ar: { translation: {} } } }) })
afterEach(() => { cleanup(); void language.changeLanguage('en') })
const question: PublicQuestion = { id: 1, qIndex: 0, prompt: 'Classify.', timeLimitS: 20, payload: { kind: 'match', cards: [{ key: 'c1', text: 'Apple' }, { key: 'c2', text: 'Pear' }], targets: [{ key: 't1', text: 'Fruit' }, { key: 't2', text: 'Food' }] } }

it('labels older snapshots without an actual response as reference only', () => {
  render(<I18nextProvider i18n={language}><QuestionInput question={question} disabled onAnswer={() => {}} submittedAnswer={null} revealed={{ c1: 't1', c2: 't1' }}/></I18nextProvider>)
  expect(screen.getByRole('group', { name: 'Reference answer' })).toBeTruthy()
  expect(screen.queryByRole('group', { name: 'Your submitted answer' })).toBeNull()
})

it('restores the actual grouping response and places the reference in separately labelled feedback', async () => {
  render(<I18nextProvider i18n={language}><QuestionInput question={question} disabled onAnswer={() => {}} submittedAnswer={{ kind: 'match', pairs: [['c1', 't2'], ['c2', 't2']] }} revealed={{ c1: 't1', c2: 't1' }}/></I18nextProvider>)
  const own = screen.getByRole('group', { name: 'Your submitted answer' })
  expect(within(own).getByRole('button', { name: 'Food' }).textContent).toContain('Apple')
  expect(within(own).getByRole('button', { name: 'Fruit' }).textContent).not.toContain('Apple')
  await userEvent.click(screen.getByText('Reference answer', { exact: true }))
  const reference = screen.getByRole('group', { name: 'Reference answer' })
  expect(within(reference).getByRole('button', { name: 'Fruit' }).textContent).toContain('Apple')
  expect(within(own).getByRole('button', { name: 'Food' }).textContent).toContain('Apple')
})

it('keeps wrong sequence and MCQ choices distinct from the correct feedback', async () => {
  const order: PublicQuestion = { ...question, payload: { kind: 'order', items: [{ key: 'a', text: 'Start' }, { key: 'b', text: 'End' }] } }
  const rendered = render(<I18nextProvider i18n={language}><QuestionInput question={order} disabled onAnswer={() => {}} submittedAnswer={{ kind: 'order', sequence: ['b', 'a'] }} revealed={['a', 'b']}/></I18nextProvider>)
  const own = screen.getByRole('group', { name: 'Your submitted answer' })
  expect(within(own).getAllByRole('listitem').map(item => item.querySelector('span[dir="auto"]')?.textContent)).toEqual(['End', 'Start'])
  await userEvent.click(screen.getByText('Reference answer', { exact: true }))
  expect(within(screen.getByRole('group', { name: 'Reference answer' })).getAllByRole('listitem').map(item => item.querySelector('span[dir="auto"]')?.textContent)).toEqual(['Start', 'End'])
  rendered.unmount()
  const mcq: PublicQuestion = { ...question, payload: { kind: 'mcq', options: [{ key: 'a', text: 'First' }, { key: 'b', text: 'Second' }] } }
  render(<I18nextProvider i18n={language}><QuestionInput question={mcq} disabled onAnswer={() => {}} submittedAnswer={{ kind: 'mcq', choice: 'b' }}/></I18nextProvider>)
  expect(screen.getByRole('button', { name: 'Second، selected' }).getAttribute('aria-pressed')).toBe('true')
  expect(screen.queryByText('Reference answer', { exact: true })).toBeNull()
})

it.each(['cloze', 'vocabulary'] as const)('restores exact submitted Arabic %s wording after remount and late ACK without substituting a model', async kind => {
  await language.changeLanguage('ar')
  const policy = { version: 1, language: 'ar', diacritics: 'preserve', tatweel: 'preserve', case: 'preserve', spaces: 'preserve' } as const
  const native: PublicQuestion = { ...question, payload: kind === 'cloze' ? { kind, schemaVersion: 1, policy, trimBoundaryWhitespace: true, segments: [{ kind: 'blank', blankId: 'visible_blank' }] } : { kind, schemaVersion: 1, policy, entries: [{ id: 'visible_blank', clue: 'وقت الدراسة' }] } }
  const renderInput = (saved: boolean) => <I18nextProvider i18n={language}><QuestionInput question={native} disabled onAnswer={() => {}} submittedAnswer={saved ? { kind, values: { visible_blank: ' النَّهار ' } } : null} revealed={{ visible_blank: 'الصباح' }}/></I18nextProvider>
  const view = render(renderInput(false)); view.rerender(renderInput(true))
  const own = screen.getByRole('group', { name: 'إجابتك المرسلة' })
  expect(within(own).getByRole<HTMLInputElement>('textbox').value).toBe(' النَّهار ')
  await userEvent.click(screen.getByText('إجابة مرجعية', { exact: true }))
  expect(within(screen.getByRole('group', { name: 'إجابة مرجعية' })).getByRole<HTMLInputElement>('textbox').value).toBe('الصباح')
  expect(within(own).getByRole<HTMLInputElement>('textbox').value).toBe(' النَّهار ')
})
