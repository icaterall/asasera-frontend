import {afterEach, beforeAll, beforeEach, expect, it, vi} from 'vitest'
import {act, cleanup, fireEvent, render, screen, waitFor, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {createInstance} from 'i18next'
import {I18nextProvider} from 'react-i18next'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {MemoryRouter, Route, Routes, useLocation} from 'react-router-dom'
import type {ReactNode} from 'react'
import ActivityEditor from '../src/features/editor/ActivityEditor'
import CreateActivity from '../src/features/editor/CreateActivity'
import {ActivityAudience} from '../src/features/audience/ActivityAudience'
import {activities, api, reference, taxonomy, type ActivityRecord, type QuestionRecord} from '../src/lib/api'
import {community, type InboxItem} from '../src/features/community/api'
import {acknowledgeQuestion, clearDraft, draftKey, editorDraftSchema, emptyEditorDraft, readDraft, storeEditorDraft, writeDraft} from '../src/features/editor/session-drafts'

const session = vi.hoisted(() => ({user: {id: 73, name: 'Teacher A', role: 'teacher', email: 'teacher@example.test'}, status: 'authenticated', signOut: vi.fn()}))
vi.mock('@/hooks/useAuth', () => ({useAuth: () => session}))
vi.mock('@/features/activity-themes/ActivityStage', () => ({ActivityStage: ({children, ...props}: {children: ReactNode}) => <main {...props}>{children}</main>, ThemeThumbnail: () => <span/>}))
const language = createInstance()
const key = draftKey(73, 'activity:42')!
const activity: ActivityRecord = {id: 42, title: 'Fractions', theme: 'classic', revision: 1, currentVersionId: null, visibility: 'private', ownerId: 73, subjectId: null, levelId: null, curriculumNodeId: null, purposeId: 2, createdAt: '', updatedAt: '', categoryId: 1, educationStageIds: [8], countryIds: [1]}
const q1: QuestionRecord = {id: 5, ordinal: 1, kind: 'tf', prompt: 'One half equals two quarters?', mediaKey: null, timeLimitS: 20, payload: {correct: true}, revision: 3}
const q2: QuestionRecord = {...q1, id: 6, ordinal: 2, prompt: 'Is a quarter greater than a half?'}
const patch = (prompt: string) => ({kind: 'tf' as const, prompt, payload: {correct: true}, timeLimitS: 20, mediaKey: null, confirmZones: false, errorPairs: []})
const item: InboxItem = {id: 9, activityId: 42, activityTitle: 'Fractions', questionId: 6, kind: 'flag', reviewerName: 'Teacher', reason: 'unclear_wording', strengths: '', suggestion: 'Please clarify this question', status: 'open', response: '', revision: 2, rating: null, recommend: null, versionId: 7, createdAt: '2026-09-09', updatedAt: '2026-09-09'}
function load(questions = [q1, q2]) {return {activity: {...activity}, questions: questions.map(q => ({...q})), errorPairs: []}}
function Location() {const location = useLocation(); return <output aria-label="Current URL">{location.pathname}{location.search}</output>}
function show(ui: ReactNode, path = '/teacher/activities/42') {
  return render(<I18nextProvider i18n={language}><QueryClientProvider client={new QueryClient({defaultOptions: {queries: {retry: false}, mutations: {retry: false}}})}><MemoryRouter initialEntries={[path]}><Routes><Route path="/teacher/activities/:id" element={ui}/><Route path="*" element={<p>Another page</p>}/></Routes><Location/></MemoryRouter></QueryClientProvider></I18nextProvider>)
}
async function editor() {const result = show(<ActivityEditor/>); await screen.findByLabelText('Question text'); return result}
function references() {
  vi.spyOn(reference, 'categories').mockResolvedValue([{id: 1, name_en: 'Science', name_ar: 'العلوم'}])
  vi.spyOn(reference, 'educationStages').mockResolvedValue([{id: 8, name_en: 'Kindergarten', name_ar: 'رياض الأطفال'}, {id: 9, name_en: 'Grade 1', name_ar: 'الصف الأول'}])
  vi.spyOn(reference, 'countries').mockResolvedValue({countries: [{id: 1, name_en: 'Oman', name_ar: 'عمان', iso_code: 'OM', iso_alpha2: 'OM', is_arab: true}], detectedCountryId: 1})
  vi.spyOn(taxonomy, 'purposes').mockResolvedValue({purposes: [{id: 2, nameEn: 'Practice', nameAr: 'تدريب'}]})
}
beforeAll(async () => {
  await language.init({lng: 'en', resources: {en: {translation: {brand: {name: 'Asasera'}, common: {language: 'Language', switchToArabic: 'Switch to Arabic', switchToEnglish: 'Switch to English'}}}, ar: {translation: {brand: {name: 'أساسيرا'}, common: {language: 'اللغة', switchToArabic: 'التبديل إلى العربية', switchToEnglish: 'التبديل إلى الإنجليزية'}}}}})
  Element.prototype.scrollIntoView = vi.fn()
  vi.stubGlobal('ResizeObserver', class {observe() {} unobserve() {} disconnect() {}})
  vi.stubGlobal('matchMedia', vi.fn(() => ({matches: false, addEventListener() {}, removeEventListener() {}})))
  HTMLDialogElement.prototype.showModal = function () {this.setAttribute('open', ''); this.querySelector<HTMLElement>('[autofocus]')?.focus()}
  HTMLDialogElement.prototype.close = function () {this.removeAttribute('open')}
})
beforeEach(() => {
  sessionStorage.clear(); session.user.id = 73
  vi.spyOn(activities, 'load').mockImplementation(async () => load())
  vi.spyOn(activities, 'updateQuestion').mockImplementation(async (id, changes) => ({question: {...(id === 5 ? q1 : q2), ...changes, revision: Number(changes.expectedRevision) + 1}}))
  vi.spyOn(activities, 'update').mockImplementation(async (_id, changes) => ({activity: {...activity, ...changes, revision: 2}}))
  vi.spyOn(community, 'inbox').mockResolvedValue({items: [item], hasMore: false, summary: {total: 1, open: 1, reviewed: 0, resolved: 0}})
  vi.spyOn(community, 'insights').mockResolvedValue({status: 'insufficient', totalParticipation: null, ideas: []})
})
afterEach(() => {cleanup(); vi.restoreAllMocks(); sessionStorage.clear(); void language.changeLanguage('en')})

it('shows the branded spinner immediately while preparing the AI dialog and stops once it opens', async () => {
  await editor()
  let finish!: (value: ReturnType<typeof load>) => void
  vi.mocked(activities.load).mockReturnValueOnce(new Promise(resolve => {finish = resolve}))
  vi.spyOn(api, 'get').mockImplementation(async path => path.endsWith('/labels') ? {labels: [], pairs: [], decisions: [], schedule: null} : {jobs: []})
  const trigger = screen.getByRole('button', {name: 'Generate with AI'})
  fireEvent.click(trigger)
  expect(trigger.getAttribute('aria-busy')).toBe('true')
  expect(trigger.querySelector('img')).not.toBeNull()
  expect(trigger.hasAttribute('disabled')).toBe(true)
  expect(screen.queryByRole('dialog')).toBeNull()
  await waitFor(() => expect(activities.load).toHaveBeenCalledTimes(2))
  await act(async () => {finish(load())})
  await screen.findByRole('dialog', {name: 'Generate with AI'})
  expect(trigger.getAttribute('aria-busy')).toBeNull()
})

it('stops the Generate spinner after a failed save and retains the instructor’s draft', async () => {
  await editor()
  let fail!: (reason: Error) => void
  vi.mocked(activities.updateQuestion).mockReturnValueOnce(new Promise((_resolve, reject) => {fail = reject}))
  fireEvent.change(screen.getByLabelText('Question text'), {target: {value: 'Keep this question'}})
  const trigger = screen.getByRole('button', {name: 'Generate with AI'})
  fireEvent.click(trigger)
  expect(trigger.getAttribute('aria-busy')).toBe('true')
  await waitFor(() => expect(activities.updateQuestion).toHaveBeenCalledOnce())
  await act(async () => {fail(new Error('Connection interrupted'))})
  await waitFor(() => expect(trigger.getAttribute('aria-busy')).toBeNull())
  expect(trigger.hasAttribute('disabled')).toBe(false)
  expect(screen.queryByRole('dialog')).toBeNull()
  expect(sessionStorage.getItem(key)).toContain('Keep this question')
})

it('stores typing before the network debounce, restores title and question after remount, and clears only after saving', async () => {
  const view = await editor()
  fireEvent.change(screen.getByLabelText('Activity title'), {target: {value: 'My unfinished lesson'}})
  fireEvent.change(screen.getByLabelText('Question text'), {target: {value: 'Unsaved question text'}})
  expect(activities.updateQuestion).not.toHaveBeenCalled()
  expect(readDraft(key, editorDraftSchema)?.questions[5]?.patch.prompt).toBe('Unsaved question text')
  view.unmount(); await editor()
  expect((screen.getByLabelText('Activity title') as HTMLInputElement).value).toBe('My unfinished lesson')
  expect((screen.getByLabelText('Question text') as HTMLTextAreaElement).value).toBe('Unsaved question text')
  expect(screen.getByRole('region', {name: 'Recovered edits'})).toBeTruthy()
  fireEvent.click(screen.getByRole('button', {name: 'Save recovered edits'}))
  await waitFor(() => expect(sessionStorage.getItem(key)).toBeNull())
  expect(activities.updateQuestion).toHaveBeenCalledWith(5, expect.objectContaining({prompt: 'Unsaved question text', expectedRevision: 3}))
  expect(activities.update).toHaveBeenCalledWith(42, {title: 'My unfinished lesson', expectedTitle: 'Fractions'})
})

it('retains a failed save through interruption and retries the recovered copy', async () => {
  vi.mocked(activities.updateQuestion).mockRejectedValueOnce(new Error('Connection interrupted'))
  const view = await editor()
  fireEvent.change(screen.getByLabelText('Question text'), {target: {value: 'Keep my work'}})
  await waitFor(() => expect(screen.getByRole('button', {name: 'Retry'})).toBeTruthy(), {timeout: 2500})
  expect(sessionStorage.getItem(key)).toContain('Keep my work')
  view.unmount(); await editor()
  fireEvent.click(screen.getByRole('button', {name: 'Save recovered edits'}))
  await waitFor(() => expect(sessionStorage.getItem(key)).toBeNull())
})

it('an older acknowledgement cannot clear a newer edit, including after the editor remounts', async () => {
  let finish!: (result: {question: QuestionRecord}) => void
  vi.mocked(activities.updateQuestion).mockReturnValueOnce(new Promise(resolve => {finish = resolve}))
  const view = await editor()
  fireEvent.change(screen.getByLabelText('Question text'), {target: {value: 'First draft'}})
  await waitFor(() => expect(activities.updateQuestion).toHaveBeenCalledOnce(), {timeout: 2500})
  view.unmount(); await editor()
  fireEvent.change(screen.getByLabelText('Question text'), {target: {value: 'Newer draft'}})
  await act(async () => {finish({question: {...q1, prompt: 'First draft', revision: 4}})})
  expect(readDraft(key, editorDraftSchema)?.questions[5]).toMatchObject({baseRevision: 4, patch: {prompt: 'Newer draft'}})
  fireEvent.click(screen.getByRole('button', {name: 'Save recovered edits'}))
  await waitFor(() => expect(sessionStorage.getItem(key)).toBeNull())
  expect(activities.updateQuestion).toHaveBeenLastCalledWith(5, expect.objectContaining({prompt: 'Newer draft', expectedRevision: 4}))
})

it('warns before recovered edits can replace a changed database revision and never publishes them implicitly', async () => {
  storeEditorDraft(key, {...emptyEditorDraft(), activeQuestionId: 6, questions: {6: {baseRevision: 1, patch: patch('My recovered second question')}}})
  const publish = vi.spyOn(activities, 'publish')
  await editor()
  expect((screen.getByLabelText('Question text') as HTMLTextAreaElement).value).toBe('My recovered second question')
  expect(screen.getByText(/saved version has changed/)).toBeTruthy()
  fireEvent.click(screen.getByRole('button', {name: 'Publish'}))
  expect(publish).not.toHaveBeenCalled(); expect(activities.updateQuestion).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', {name: 'Use saved version'}))
  await waitFor(() => expect(screen.queryByRole('region', {name: 'Recovered edits'})).toBeNull())
  expect(sessionStorage.getItem(key)).toBeNull()
  expect((screen.getByLabelText('Question text') as HTMLTextAreaElement).value).toBe(q2.prompt)
})

it('retains recovery if explicit saving fails and clears each question independently after confirmation', async () => {
  storeEditorDraft(key, {...emptyEditorDraft(), activeQuestionId: 5, questions: {5: {baseRevision: 3, patch: patch('First')}, 6: {baseRevision: 3, patch: patch('Second')}}})
  vi.mocked(activities.updateQuestion).mockResolvedValueOnce({question: {...q1, revision: 4}}).mockRejectedValueOnce(new Error('Second save failed'))
  await editor(); fireEvent.click(screen.getByRole('button', {name: 'Save recovered edits'}))
  await screen.findByText('Second save failed')
  expect(readDraft(key, editorDraftSchema)?.questions[5]).toBeUndefined()
  expect(readDraft(key, editorDraftSchema)?.questions[6]?.patch.prompt).toBe('Second')
})

it('keeps feedback in a dialog on the current URL, retains reply drafts, and returns to the referenced question', async () => {
  const user = userEvent.setup(); await editor()
  fireEvent.change(screen.getByLabelText('Question text'), {target: {value: 'Work in progress'}})
  const trigger = screen.getByRole('button', {name: 'Feedback'})
  await user.click(trigger)
  const dialog = screen.getByRole('dialog', {name: 'Feedback & ideas'})
  expect(screen.getByLabelText('Current URL').textContent).toBe('/teacher/activities/42')
  await within(dialog).findByText('Please clarify this question')
  expect(within(dialog).queryByRole('link')).toBeNull()
  await user.click(within(dialog).getByText('Reply and update status'))
  fireEvent.change(within(dialog).getByLabelText('Your reply to the teacher (optional)'), {target: {value: 'An unfinished reply'}})
  await user.click(within(dialog).getByRole('button', {name: 'Close feedback'}))
  expect(screen.queryByRole('dialog')).toBeNull(); expect(document.activeElement).toBe(trigger)
  expect((screen.getByLabelText('Question text') as HTMLTextAreaElement).value).toBe('Work in progress')
  await user.click(trigger)
  await screen.findByText('Please clarify this question')
  await user.click(screen.getByText('Reply and update status'))
  expect((screen.getByLabelText('Your reply to the teacher (optional)') as HTMLTextAreaElement).value).toBe('An unfinished reply')
  await user.click(screen.getByRole('combobox', {name: 'Feedback status'}))
  expect((await screen.findByRole('option', {name: 'Reviewed'})).closest('dialog')).not.toBeNull()
  await user.click(screen.getByRole('option', {name: 'Reviewed'}))
  const respond = vi.spyOn(community, 'respond').mockResolvedValue({ok: true})
  await user.click(screen.getByRole('button', {name: 'Save response'}))
  await waitFor(() => expect(respond).toHaveBeenCalledWith(item, 'reviewed', 'An unfinished reply'))
  expect(sessionStorage.getItem(draftKey(73, 'activity:42:reply:flag:9')!)).toBeNull()
  await user.click(screen.getByRole('button', {name: 'Review and edit activity'}))
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  expect((screen.getByLabelText('Question text') as HTMLTextAreaElement).value).toBe(q2.prompt)
  expect(screen.getByLabelText('Current URL').textContent).toBe('/teacher/activities/42?question=6')
})

it('feedback can open even when question saving fails, and Escape returns to the editor', async () => {
  vi.mocked(activities.updateQuestion).mockRejectedValue(new Error('Offline'))
  await editor()
  fireEvent.change(screen.getByLabelText('Question text'), {target: {value: 'Offline work'}})
  fireEvent.click(screen.getByRole('button', {name: 'Feedback'}))
  const dialog = screen.getByRole('dialog')
  fireEvent(dialog, new Event('cancel', {cancelable: true}))
  expect(screen.queryByRole('dialog')).toBeNull()
  expect((screen.getByLabelText('Question text') as HTMLTextAreaElement).value).toBe('Offline work')
  expect(sessionStorage.getItem(key)).toContain('Offline work')
})

it('does not restore another instructor’s draft and handles malformed or blocked session storage', async () => {
  writeDraft(key, {...emptyEditorDraft(), title: {value: 'Private draft', base: 'Fractions'}})
  session.user.id = 74; const view = await editor()
  expect((screen.getByLabelText('Activity title') as HTMLInputElement).value).toBe('Fractions')
  view.unmount(); session.user.id = 73
  sessionStorage.setItem(key, 'malformed')
  await editor()
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {throw new Error('Quota exceeded')})
  fireEvent.change(screen.getByLabelText('Question text'), {target: {value: 'Still editable'}})
  expect(screen.getByText(/could not keep a recovery copy/)).toBeTruthy()
  expect((screen.getByLabelText('Question text') as HTMLTextAreaElement).value).toBe('Still editable')
})

it('keeps new activity details and multiple audience stages across remounts, retains failed creation, and clears a successful creation', async () => {
  references()
  const newKey = draftKey(73, 'new')!
  const user = userEvent.setup(), view = show(<CreateActivity/>)
  const input = await screen.findByLabelText('Activity name')
  fireEvent.change(input, {target: {value: 'My science game'}})
  await user.click(screen.getByRole('combobox', {name: 'Category'})); await user.click(await screen.findByRole('option', {name: 'Science'}))
  await user.click(screen.getByRole('combobox', {name: 'Education stages'})); await user.click(await screen.findByRole('option', {name: 'Kindergarten'})); await user.click(screen.getByRole('option', {name: 'Grade 1'})); await user.click(screen.getByRole('button', {name: 'Done'}))
  expect(JSON.parse(sessionStorage.getItem(newKey)!).audience.educationStageIds).toEqual([8, 9])
  view.unmount(); show(<CreateActivity/>)
  expect((await screen.findByLabelText('Activity name') as HTMLInputElement).value).toBe('My science game')
  const create = vi.spyOn(activities, 'create').mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce({activity})
  await user.click(screen.getByRole('button', {name: 'Continue to questions'})); await screen.findByText('Offline')
  expect(sessionStorage.getItem(newKey)).toContain('My science game')
  await user.click(screen.getByRole('button', {name: 'Continue to questions'}))
  await waitFor(() => expect(sessionStorage.getItem(newKey)).toBeNull())
  expect(create).toHaveBeenLastCalledWith(expect.objectContaining({title: 'My science game', categoryId: 1, educationStageIds: [8, 9], countryIds: [1]}))
})

it('restores audience selections when reopening the section and removes them only after a successful save', async () => {
  references(); const user = userEvent.setup(), save = vi.fn().mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce(undefined)
  const audienceKey = draftKey(73, 'activity:42:audience')!
  const view = show(<ActivityAudience activity={activity} onSave={save}/>)
  await user.click(screen.getByText('Category & audience'))
  await user.click(await screen.findByRole('combobox', {name: 'Education stages'}))
  await user.click(await screen.findByRole('option', {name: 'Grade 1'})); await user.click(screen.getByRole('button', {name: 'Done'}))
  view.unmount(); show(<ActivityAudience activity={activity} onSave={save}/>)
  expect(await screen.findByRole('button', {name: 'Remove Grade 1'})).toBeTruthy()
  await user.click(screen.getByRole('button', {name: 'Save audience'})); await screen.findByText('Offline')
  expect(sessionStorage.getItem(audienceKey)).not.toBeNull()
  await user.click(screen.getByRole('button', {name: 'Save audience'}))
  await waitFor(() => expect(sessionStorage.getItem(audienceKey)).toBeNull())
})

it('clears confirmed question deletion without resurrecting its session data', async () => {
  const remove = vi.spyOn(activities, 'deleteQuestion').mockResolvedValue(undefined)
  await editor(); fireEvent.change(screen.getByLabelText('Question text'), {target: {value: 'Will be deleted'}})
  vi.mocked(activities.load).mockImplementation(async () => load([q2]))
  fireEvent.click(screen.getByRole('button', {name: 'Delete question'}))
  await waitFor(() => expect(remove).toHaveBeenCalledWith(5))
  await waitFor(() => expect((screen.getByLabelText('Question text') as HTMLTextAreaElement).value).toBe(q2.prompt))
  expect(sessionStorage.getItem(key)).toBeNull()
})

it('snapshot cleanup preserves newer form drafts and strips unexpected question fields on recovery', () => {
  writeDraft(key, {title: 'New'}); clearDraft(key, {title: 'Old'})
  expect(sessionStorage.getItem(key)).toBe('{"title":"New"}')
  const draft = {...emptyEditorDraft(), questions: {5: {baseRevision: 3, patch: {...patch('Safe'), id: 999, revision: 999, ownerId: 999}}}}
  writeDraft(key, draft)
  const parsed = readDraft(key, editorDraftSchema)!
  expect(parsed.questions[5]?.patch).not.toHaveProperty('id')
  const newer = {...parsed, questions: {5: {baseRevision: 3, patch: patch('Newer')}}}
  expect(acknowledgeQuestion(newer, 5, patch('Safe'), 4).questions[5]).toMatchObject({baseRevision: 4, patch: {prompt: 'Newer'}})
})


it('supports Arabic feedback, an empty inbox and retrying an inbox failure without leaving the editor', async () => {
  await language.changeLanguage('ar')
  vi.mocked(community.inbox).mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce({items: [], hasMore: false, summary: {total: 0, open: 0, reviewed: 0, resolved: 0}})
  show(<ActivityEditor/>); await screen.findByLabelText('نص السؤال')
  fireEvent.click(screen.getByRole('button', {name: 'الملاحظات'}))
  const dialog = screen.getByRole('dialog', {name: 'الملاحظات وأفكار التحسين'})
  expect(dialog.getAttribute('dir')).toBe('rtl')
  await within(dialog).findByText('تعذّر تحميل الملاحظات')
  fireEvent.click(within(dialog).getByRole('button', {name: 'إعادة المحاولة'}))
  await within(dialog).findByText('لا توجد ملاحظات بعد')
  expect(screen.getByLabelText('Current URL').textContent).toBe('/teacher/activities/42')
})

it('discards only the unfinished new activity and keeps another activity’s recovery', async () => {
  references()
  writeDraft(key, {...emptyEditorDraft(), title: {value: 'Existing activity draft', base: 'Fractions'}})
  show(<CreateActivity/>)
  fireEvent.change(await screen.findByLabelText('Activity name'), {target: {value: 'Discard this new one'}})
  fireEvent.click(screen.getByRole('button', {name: 'Discard draft'}))
  expect(sessionStorage.getItem(draftKey(73, 'new')!)).toBeNull()
  expect(sessionStorage.getItem(key)).toContain('Existing activity draft')
})

it('saving normally clears the recovery after acknowledgement and question selection survives a clean refresh in the URL', async () => {
  const view = await editor()
  fireEvent.change(screen.getByLabelText('Question text'), {target: {value: 'Normal autosave'}})
  await waitFor(() => expect(sessionStorage.getItem(key)).toBeNull(), {timeout: 2500})
  fireEvent.click(screen.getByRole('button', {name: /Is a quarter greater/}))
  await waitFor(() => expect(screen.getByLabelText('Current URL').textContent).toBe('/teacher/activities/42?question=6'))
  expect(sessionStorage.getItem(key)).toBeNull()
  view.unmount(); show(<ActivityEditor/>, '/teacher/activities/42?question=6')
  await waitFor(() => expect((screen.getByLabelText('Question text') as HTMLTextAreaElement).value).toBe(q2.prompt))
})


it('keeps the logo, language choices and working role-framed account menu in the editor header', async () => {
  const user = userEvent.setup(); await editor()
  const header = screen.getByRole('banner')
  expect(within(header).getByRole('link', {name: 'Asasera — dashboard'}).getAttribute('href')).toBe('/teacher/dashboard')
  expect(within(header).getByRole('img', {name: 'Asasera'})).toBeTruthy()
  expect(within(header).getByRole('group', {name: 'Language'})).toBeTruthy()
  const avatar = within(header).getByRole('button', {name: 'Account menu — Teacher'})
  expect(avatar.getAttribute('data-account-role')).toBe('teacher')
  expect(avatar.textContent).toBe('T')
  await user.click(avatar)
  const menu = within(header).getByRole('menu', {name: 'Account menu'})
  expect(within(menu).getByRole('menuitem', {name: 'Account settings'}).getAttribute('href')).toBe('/account')
  expect(within(menu).getByRole('menuitem', {name: 'Sign out'})).toBeTruthy()
  await user.keyboard('{Escape}')
  expect(within(header).queryByRole('menu')).toBeNull()
  expect(document.activeElement).toBe(avatar)
})

it('switches the editor language without reloading, losing unsaved text or changing the selected question', async () => {
  const user = userEvent.setup(); await editor()
  await user.click(screen.getByRole('button', {name: /Is a quarter greater/}))
  fireEvent.change(screen.getByLabelText('Activity title'), {target: {value: 'My bilingual activity'}})
  fireEvent.change(screen.getByLabelText('Question text'), {target: {value: 'Keep this question exactly'}})
  await user.click(screen.getByRole('button', {name: 'Switch to Arabic'}))
  expect((screen.getByLabelText('عنوان النشاط') as HTMLInputElement).value).toBe('My bilingual activity')
  expect((screen.getByLabelText('نص السؤال') as HTMLTextAreaElement).value).toBe('Keep this question exactly')
  expect(screen.getByRole('banner').closest('[dir]')?.getAttribute('dir')).toBe('rtl')
  expect(screen.getByRole('button', {name: 'التبديل إلى العربية'}).getAttribute('aria-pressed')).toBe('true')
  expect(screen.getByLabelText('Current URL').textContent).toBe('/teacher/activities/42?question=6')
  expect(activities.load).toHaveBeenCalledOnce()
  expect(screen.queryByRole('button', {name: 'حفظ التعديلات المستعادة'})).toBeNull()
  await user.click(screen.getByRole('button', {name: 'التبديل إلى الإنجليزية'}))
  expect((screen.getByLabelText('Question text') as HTMLTextAreaElement).value).toBe('Keep this question exactly')
  expect(screen.getByRole('banner').closest('[dir]')?.getAttribute('dir')).toBe('ltr')
  expect(activities.load).toHaveBeenCalledOnce()
})
