import { afterEach, beforeAll, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { createInstance } from 'i18next'
import { I18nextProvider } from 'react-i18next'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'

import AdminOverview from '../src/features/admin/AdminOverview'
import { adminAnalytics, type AdminOverview as Overview } from '../src/features/admin/api'

const auth = vi.hoisted(() => ({ user: { id: 7, role: 'admin' } }))
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => auth }))

const language = createInstance()
const overview: Overview = {
  periodDays: 30,
  traffic: { uniqueVisitors: 18, visits: 31, trackingStartedAt: '2026-09-11T10:00:00.000Z', daily: [{ date: '2026-09-10', visitors: 7, visits: 9 }] },
  people: { accounts: 44, teachers: 21, newAccounts: 5, activeTeachers: 16 },
  teaching: { activities: 39, activitiesCreated: 8, runs: 28, completedRuns: 19, learnerSeats: 127 },
  generation: { jobsStarted: 11, jobsSucceeded: 9, jobsFailed: 1, jobsAwaitingOutcome: 1, providerCostMillicents: 421 },
}

function show() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
  render(<I18nextProvider i18n={language}><QueryClientProvider client={client}><MemoryRouter><AdminOverview/></MemoryRouter></QueryClientProvider></I18nextProvider>)
}

beforeAll(async () => {
  await language.init({ lng: 'en', resources: { en: { translation: {} }, ar: { translation: {} } } })
})
afterEach(() => { cleanup(); vi.restoreAllMocks() })

it('shows traffic separately from signed-in people and exposes generation health', async () => {
  vi.spyOn(adminAnalytics, 'overview').mockResolvedValue(overview)
  show()
  await screen.findByRole('heading', { name: 'Administration overview' })
  expect(screen.getByText('Landing visitors')).toBeTruthy()
  expect(screen.getByText('18')).toBeTruthy()
  expect(screen.getByText('16 teachers signed in during the last 30 days')).toBeTruthy()
  expect(screen.getByRole('link', { name: 'Configure routes' }).getAttribute('href')).toBe('/admin/ai-settings')
  expect(screen.getByText(/Some jobs reached a provider attempt/)).toBeTruthy()
})
