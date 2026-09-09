import { afterEach, beforeAll, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createInstance } from 'i18next'
import { I18nextProvider } from 'react-i18next'
import type { ReactNode } from 'react'
import { LoadingIndicator, LoadingMark } from '../src/design/LoadingIndicator'
import { LoadingState } from '../src/design/States'
import { loadingVariantForPath, type LoadingVariant } from '../src/design/loadingVariant'
import { Button } from '../src/design/Button'

const language = createInstance()
beforeAll(async () => { await language.init({ lng: 'en', resources: { en: { translation: {} }, ar: { translation: {} } } }) })
afterEach(() => { cleanup(); vi.unstubAllGlobals() })
const show = (ui: ReactNode) => render(<I18nextProvider i18n={language}>{ui}</I18nextProvider>)

it.each([['en', 'Loading…'], ['ar', 'جارٍ التحميل…']])('announces loading once in %s without reading decorative media', async (locale, label) => {
  await language.changeLanguage(locale)
  show(<LoadingIndicator />)
  const status = screen.getByRole('status')
  expect(status.textContent).toBe(label)
  expect(status.getAttribute('aria-live')).toBe('polite')
  expect(status.getAttribute('aria-atomic')).toBe('true')
  expect(screen.queryByRole('img')).toBeNull()
})

it('keeps a single descriptive status alongside the content placeholders', () => {
  show(<LoadingState label="Loading your activities…" />)
  expect(screen.getAllByRole('status')).toHaveLength(1)
  expect(screen.getByRole('status').textContent).toBe('Loading your activities…')
})

it.each<LoadingVariant>(['list', 'cards', 'form', 'dashboard', 'editor'])('keeps %s placeholders decorative and out of keyboard navigation', variant => {
  const { container } = show(<LoadingState variant={variant} layout="page" label="Loading your activity…" />)
  expect(screen.getAllByRole('status')).toHaveLength(1)
  expect(screen.getByRole('status').textContent).toBe('Loading your activity…')
  expect(screen.queryByRole('button')).toBeNull()
  expect(screen.queryByRole('textbox')).toBeNull()
  expect(container.querySelector('[tabindex]')).toBeNull()
})

it.each([
  ['/teacher/activities/42', 'editor'], ['/teacher/activities/42/', 'editor'],
  ['/teacher/activities/new', 'form'], ['/teacher/activities', 'list'],
  ['/teacher/dashboard', 'dashboard'], ['/teacher', 'dashboard'], ['/student', 'dashboard'],
  ['/student/profile', 'form'], ['/signup/student', 'form'], ['/teacher/discover', 'cards'], ['/', 'cards'],
])('uses the appropriate loading shape for %s', (path, variant) => {
  expect(loadingVariantForPath(path)).toBe(variant)
})

it('prevents duplicate actions while loading, then restores the same labelled control', async () => {
  const onClick = vi.fn(), user = userEvent.setup()
  const { rerender } = render(<Button loading onClick={onClick}>Save activity</Button>)
  const button = screen.getByRole('button', { name: 'Save activity' })
  expect(button.getAttribute('aria-busy')).toBe('true')
  await user.click(button)
  expect(onClick).not.toHaveBeenCalled()
  rerender(<Button onClick={onClick}>Save activity</Button>)
  await user.click(button)
  expect(onClick).toHaveBeenCalledOnce()
  expect(button.hasAttribute('aria-busy')).toBe(false)
})

it('pauses offscreen and in hidden tabs, and disconnects when loading ends', () => {
  let intersect: (entries: { isIntersecting: boolean }[]) => void = () => {}
  const disconnect = vi.fn()
  vi.stubGlobal('IntersectionObserver', class {
    constructor(callback: typeof intersect) { intersect = callback }
    observe() {}
    disconnect = disconnect
  })
  const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(false)
  const { container, unmount } = render(<LoadingMark />)
  const mark = container.querySelector('span')!
  const playState = () => mark.style.getPropertyValue('--loader-play-state')
  expect(playState()).toBe('running')
  intersect([{ isIntersecting: false }])
  expect(playState()).toBe('paused')
  intersect([{ isIntersecting: true }])
  expect(playState()).toBe('running')
  hidden.mockReturnValue(true)
  document.dispatchEvent(new Event('visibilitychange'))
  expect(playState()).toBe('paused')
  hidden.mockReturnValue(false)
  document.dispatchEvent(new Event('visibilitychange'))
  expect(playState()).toBe('running')
  unmount()
  expect(disconnect).toHaveBeenCalledOnce()
})
