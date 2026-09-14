import { afterEach, beforeAll, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { createInstance } from 'i18next'
import { I18nextProvider } from 'react-i18next'
import { NativeQuestionEditor, nativeQuestionDefault, type NativeQuestionKind } from '../src/features/editor/NativeQuestionEditor'
import { clozePayloadSchema, discussionPayloadSchema, vocabularyPayloadSchema } from '../src/shared/questions'
import { QuestionTypeDialog } from '../src/features/editor/QuestionTypePicker'

const language = createInstance()
beforeAll(async () => { await language.init({ lng: 'en', resources: { en: { translation: {} }, ar: { translation: {} } } }) })
afterEach(() => { cleanup(); void language.changeLanguage('en') })
function Editor({ kind, initial }: { kind: NativeQuestionKind; initial?: unknown }) {
  const [payload, setPayload] = useState(initial ?? nativeQuestionDefault(kind, 'en'))
  return <I18nextProvider i18n={language}><NativeQuestionEditor kind={kind} payload={payload} onChange={setPayload}/><output aria-label="Saved payload">{JSON.stringify(payload)}</output></I18nextProvider>
}

it('makes selected passage text a stable blank without replacing existing answers', async () => {
  const policy = nativeQuestionDefault('vocabulary', 'en').policy
  render(<Editor kind="cloze" initial={{ schemaVersion: 1, policy, trimBoundaryWhitespace: true, segments: [{ kind: 'text', text: 'Plants need ' }, { kind: 'blank', blankId: 'water' }, { kind: 'text', text: ' and light.' }], blanks: [{ id: 'water', acceptedAnswers: ['water'] }] }}/>)
  const passage = screen.getByRole<HTMLTextAreaElement>('textbox', { name: 'Passage text 2' })
  passage.setSelectionRange(5, 10)
  fireEvent.select(passage)
  await userEvent.click(screen.getByRole('button', { name: 'Make selected text a blank' }))
  const saved = clozePayloadSchema.parse(JSON.parse(screen.getByLabelText('Saved payload').textContent!))
  expect(saved.blanks).toHaveLength(2)
  expect(saved.blanks[0]).toEqual({ id: 'water', acceptedAnswers: ['water'] })
  expect(saved.blanks[1]?.acceptedAnswers).toEqual(['light'])
  expect(saved.segments.filter(segment => segment.kind === 'text').map(segment => segment.text)).toEqual(['Plants need ', ' and ', '.'])
})

it('edits vocabulary rows and explicitly changes spelling policy without changing word identities', async () => {
  render(<Editor kind="vocabulary"/>)
  const user = userEvent.setup()
  await user.clear(screen.getByRole('textbox', { name: 'Word 1' }))
  await user.type(screen.getByRole('textbox', { name: 'Word 1' }), 'moon')
  await user.clear(screen.getByRole('textbox', { name: 'Clue 1' }))
  await user.type(screen.getByRole('textbox', { name: 'Clue 1' }), 'Earth’s satellite')
  await user.click(screen.getByText('Spelling rules'))
  await user.click(screen.getByRole('checkbox', { name: 'Ignore letter case' }))
  const saved = vocabularyPayloadSchema.parse(JSON.parse(screen.getByLabelText('Saved payload').textContent!))
  expect(saved.entries[0]).toEqual({ id: 'word_a', word: 'moon', clue: 'Earth’s satellite' })
  expect(saved.policy.case).toBe('ignore')
  expect(saved.policy.diacritics).toBe('preserve')
  await user.click(screen.getByRole('button', { name: 'Add word' }))
  expect(screen.getByRole('textbox', { name: 'Word 2' })).toBeTruthy()
  await user.click(screen.getByRole('button', { name: 'Remove word 2' }))
  expect(screen.queryByRole('textbox', { name: 'Word 2' })).toBeNull()
})

it('keeps discussion reference responses optional and explicitly unscored', async () => {
  render(<Editor kind="discussion"/>)
  const user = userEvent.setup()
  expect(screen.getByText('Discussion responses are not automatically graded.')).toBeTruthy()
  const field = screen.getByRole('textbox', { name: 'Reference response (optional)' })
  await user.type(field, 'Invite different explanations.')
  expect(discussionPayloadSchema.parse(JSON.parse(screen.getByLabelText('Saved payload').textContent!)).referenceResponse).toBe('Invite different explanations.')
  await user.clear(field)
  expect(discussionPayloadSchema.parse(JSON.parse(screen.getByLabelText('Saved payload').textContent!))).toEqual({ schemaVersion: 1, pointsMultiplier: 0 })
})

it('offers all native kinds in the existing question chooser', async () => {
  const chosen: string[] = []
  render(<I18nextProvider i18n={language}><QuestionTypeDialog onChange={kind => chosen.push(kind)} onClose={() => {}}/></I18nextProvider>)
  for (const name of ['Complete the sentence', 'Vocabulary', 'Discussion']) await userEvent.click(screen.getByRole('button', { name }))
  expect(chosen).toEqual(['cloze', 'vocabulary', 'discussion'])
})

it('does not cut Arabic combining marks away from their letter when inserting a blank', async () => {
  await language.changeLanguage('ar')
  const initial = nativeQuestionDefault('cloze', 'ar')
  initial.segments[0] = { kind: 'text', text: 'مَاء ' }
  render(<Editor kind="cloze" initial={initial}/>)
  const passage = screen.getByRole<HTMLTextAreaElement>('textbox', { name: 'جزء النص 1' })
  passage.setSelectionRange(0, 1)
  fireEvent.select(passage)
  expect(screen.getByRole<HTMLButtonElement>('button', { name: 'حوّل النص المحدد إلى فراغ' }).disabled).toBe(true)
  passage.setSelectionRange(0, 4)
  fireEvent.select(passage)
  await userEvent.click(screen.getByRole('button', { name: 'حوّل النص المحدد إلى فراغ' }))
  const saved = clozePayloadSchema.parse(JSON.parse(screen.getByLabelText('Saved payload').textContent!))
  expect(saved.blanks[1]?.acceptedAnswers).toEqual(['مَاء'])
  expect(saved.policy.diacritics).toBe('preserve')
})

it('restores removed blank text and keeps explicit alternatives and word-bank tiles editable', async () => {
  const initial = nativeQuestionDefault('cloze', 'en')
  initial.segments.push({ kind: 'blank', blankId: 'light' }, { kind: 'text', text: ' grows plants.' })
  initial.blanks.push({ id: 'light', acceptedAnswers: ['Sunlight'] })
  render(<Editor kind="cloze" initial={initial}/>)
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: 'Remove blank 2' }))
  let saved = clozePayloadSchema.parse(JSON.parse(screen.getByLabelText('Saved payload').textContent!))
  expect(saved.blanks).toEqual([{ id: 'blank_a', acceptedAnswers: ['water'] }])
  expect(saved.segments.at(-1)).toEqual({ kind: 'text', text: '.Sunlight grows plants.' })
  const answers = screen.getByRole('textbox', { name: 'Accepted answers for blank 1' })
  await user.type(answers, '\nWater')
  await user.click(screen.getByRole('checkbox', { name: 'Offer a word bank' }))
  await user.type(screen.getByRole('textbox', { name: 'Word-bank tiles' }), '\nsoil')
  saved = clozePayloadSchema.parse(JSON.parse(screen.getByLabelText('Saved payload').textContent!))
  expect(saved.blanks[0]?.acceptedAnswers).toEqual(['water', 'Water'])
  expect(saved.wordBank).toEqual(['water', 'soil'])
  await user.click(screen.getByRole('checkbox', { name: 'Offer a word bank' }))
  expect(JSON.parse(screen.getByLabelText('Saved payload').textContent!).wordBank).toBeUndefined()
})

it('clearly identifies starter content as an example until the instructor replaces it', async () => {
  render(<Editor kind="vocabulary"/>)
  expect(screen.getByText('Example content — replace it with your own reviewed material before approval.')).toBeTruthy()
  fireEvent.change(screen.getByRole('textbox', { name: 'Word 1' }), { target: { value: 'moon' } })
  expect(screen.queryByText('Example content — replace it with your own reviewed material before approval.')).toBeNull()
})
