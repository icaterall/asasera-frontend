import { afterEach, beforeAll, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createInstance } from 'i18next'
import { I18nextProvider } from 'react-i18next'
import { StageGradePicker } from '../src/features/student/StageGradePicker'
import { reference, federatedSignInUrl, type ReferenceOption } from '../src/lib/api'
import { generalLearning, learningLabel, type LearningProfile } from '../src/shared/student'
import { SignupProvider } from '../src/context/SignupProvider'
import { useSignup } from '../src/hooks/useSignup'

const language = createInstance()
const rows: ReferenceOption[] = [
  { id: 82, name_en: 'Foundation year from database', name_ar: 'السنة التأسيسية من قاعدة البيانات' },
  { id: 37, name_en: 'Secondary school from database', name_ar: 'المرحلة الثانوية من قاعدة البيانات' },
]
beforeAll(async () => {
  await language.init({ lng: 'en', resources: { en: { translation: {} }, ar: { translation: {} } } })
  Element.prototype.scrollIntoView = vi.fn()
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} })
})
afterEach(() => { cleanup(); vi.restoreAllMocks(); void language.changeLanguage('en') })
function Form({ initial = generalLearning, ar = false }: { initial?: LearningProfile; ar?: boolean }) {
  const [value, setValue] = useState(initial), [valid, setValid] = useState(initial.educationStageId == null)
  return <form><StageGradePicker value={value} onChange={setValue} onValidityChange={setValid} ar={ar} />
    <output aria-label="Selection">{JSON.stringify(value)}</output><button disabled={!valid}>Continue</button></form>
}
function show(initial?: LearningProfile, ar = false) {
  return render(<I18nextProvider i18n={language}><QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    <Form initial={initial} ar={ar} /></QueryClientProvider></I18nextProvider>)
}
const selection = () => JSON.parse(screen.getByLabelText('Selection').textContent!)

it('loads exact database rows in server order, saves the row ID and allows general learning', async () => {
  vi.spyOn(reference, 'educationStages').mockResolvedValue(rows)
  const user = userEvent.setup(); show()
  await waitFor(() => expect(screen.queryByText('Loading education stages…')).toBeNull())
  await user.click(screen.getByRole('combobox', { name: 'Education stage' }))
  await screen.findByRole('option', { name: rows[0]!.name_en })
  expect(screen.getAllByRole('option').map(option => option.textContent)).toEqual(['General learning — no specific stage', ...rows.map(row => row.name_en)])
  expect(screen.queryByRole('option', { name: 'Grade 1' })).toBeNull()
  await user.click(screen.getByRole('option', { name: rows[0]!.name_en }))
  expect(selection()).toEqual({ stage: 'general', grade: null, educationStageId: 82 })
  await user.click(screen.getByRole('combobox', { name: 'Education stage' }))
  await user.click(await screen.findByRole('option', { name: 'General learning — no specific stage' }))
  expect(selection().educationStageId).toBeNull()
})

it('uses Arabic database names and lets search match either language', async () => {
  await language.changeLanguage('ar')
  vi.spyOn(reference, 'educationStages').mockResolvedValue(rows)
  const user = userEvent.setup(); show(undefined, true)
  await waitFor(() => expect(screen.queryByText('جارٍ تحميل المراحل التعليمية…')).toBeNull())
  await user.click(screen.getByRole('combobox', { name: 'المرحلة التعليمية' }))
  await user.type(await screen.findByRole('combobox', { name: 'ابحث في الخيارات' }), 'Foundation')
  await user.click(await screen.findByRole('option', { name: rows[0]!.name_ar }))
  expect(selection().educationStageId).toBe(82)
  expect(learningLabel({ stage: 'university', grade: null, educationStageId: 82, educationStage: rows[0]! }, 'ar')).toBe(rows[0]!.name_ar)
})

it('retains the saved stage during loading and recovers from a failed request', async () => {
  vi.spyOn(reference, 'educationStages').mockRejectedValueOnce(new Error('Offline')).mockResolvedValue(rows)
  const user = userEvent.setup(); show({ stage: 'university', grade: null, educationStageId: 82 })
  expect(screen.getByRole('button', { name: 'Continue' }).hasAttribute('disabled')).toBe(true)
  await screen.findByRole('alert')
  expect(selection().educationStageId).toBe(82)
  await user.click(screen.getByRole('button', { name: 'Try again' }))
  await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' }).hasAttribute('disabled')).toBe(false))
  expect(screen.getByRole('combobox', { name: 'Education stage' }).textContent).toContain(rows[0]!.name_en)
})

it('does not silently replace a removed stage and lets the student explicitly clear it', async () => {
  vi.spyOn(reference, 'educationStages').mockResolvedValue(rows)
  const user = userEvent.setup(); show({ stage: 'school', grade: null, educationStageId: 999 })
  await screen.findByRole('alert')
  expect(screen.getByRole('button', { name: 'Continue' }).hasAttribute('disabled')).toBe(true)
  expect(selection().educationStageId).toBe(999)
  await user.click(screen.getByRole('combobox', { name: 'Education stage' }))
  await user.click(await screen.findByRole('option', { name: 'General learning — no specific stage' }))
  expect(screen.getByRole('button', { name: 'Continue' }).hasAttribute('disabled')).toBe(false)
})

it('keeps general learning available for an empty database list', async () => {
  vi.spyOn(reference, 'educationStages').mockResolvedValue([]); show()
  await screen.findByText('No stages are available yet. You can continue with general learning.')
  expect(screen.getByRole('button', { name: 'Continue' }).hasAttribute('disabled')).toBe(false)
})

it('preserves existing grade preferences until the student chooses a database stage', async () => {
  vi.spyOn(reference, 'educationStages').mockResolvedValue(rows)
  const old = { stage: 'school', grade: 'grade6' } as const
  const user = userEvent.setup(); show(old)
  await waitFor(() => expect(screen.queryByText('Loading education stages…')).toBeNull())
  expect(selection()).toEqual(old)
  expect(screen.getByRole('combobox', { name: 'Education stage' }).textContent).toContain('Grade 6 (current preference)')
  await user.click(screen.getByRole('combobox', { name: 'Education stage' }))
  await user.click(await screen.findByRole('option', { name: rows[1]!.name_en }))
  expect(selection()).toEqual({ stage: 'general', grade: null, educationStageId: 37 })
})

function SignupDraftCheck() {
  const signup = useSignup()
  return <><button onClick={() => signup.begin('student')}>Start</button>
    <button onClick={() => signup.setLearningProfile({ stage: 'general', grade: null, educationStageId: 82 })}>Choose</button>
    <output aria-label="Draft">{JSON.stringify(signup.draft)}</output></>
}
it('keeps the database stage in the signup draft and Google redirect', async () => {
  const user = userEvent.setup(); render(<SignupProvider><SignupDraftCheck /></SignupProvider>)
  await user.click(screen.getByRole('button', { name: 'Start' })); await user.click(screen.getByRole('button', { name: 'Choose' }))
  const draft = JSON.parse(screen.getByLabelText('Draft').textContent!)
  expect(draft.stageId).toBe(82); expect(draft.stageAnswered).toBe(true)
  const url = new URL(federatedSignInUrl('google', { role: 'student', learningProfile: draft.learningProfile }), 'http://localhost')
  expect(url.searchParams.get('stage_id')).toBe('82')
  expect(url.searchParams.get('study_stage')).toBe('general')
})
