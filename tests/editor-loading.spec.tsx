import { afterEach, beforeAll, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { createInstance } from 'i18next'
import { I18nextProvider } from 'react-i18next'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ActivityEditor from '../src/features/editor/ActivityEditor'
import { activities } from '../src/lib/api'

vi.mock('@/hooks/useAuth', () => ({useAuth: () => ({user: {id: 73}, status: 'authenticated'})}))
const language = createInstance()
beforeAll(async () => { await language.init({ lng: 'en', resources: { en: { translation: {} } } }) })
afterEach(cleanup)

it('reserves the full editor while its activity is loading instead of using an inline spinner', () => {
  vi.spyOn(activities, 'load').mockReturnValue(new Promise(() => {}))
  render(<I18nextProvider i18n={language}><MemoryRouter initialEntries={['/teacher/activities/42']}>
    <Routes><Route path="/teacher/activities/:id" element={<ActivityEditor />} /></Routes>
  </MemoryRouter></I18nextProvider>)
  const status = screen.getByRole('status')
  const frame = status.closest('[data-loading-layout="page"]')
  expect(frame).not.toBeNull()
  expect(frame?.getAttribute('data-loading-variant')).toBe('editor')
  expect(screen.getAllByRole('status')).toHaveLength(1)
  expect(screen.queryByRole('button')).toBeNull()
})
