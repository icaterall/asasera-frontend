import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * The interface language reaches the server (v5.1).
 *
 * The account's stored locale and the language of the verification email are
 * negotiated from `Accept-Language`. Sending nothing meant the browser decided,
 * and an Arabic signup produced an English account with an English link. This
 * asserts the header travels and follows the toggle, because the failure is
 * invisible in every screen the developer looks at.
 */
describe('the request carries the language on screen', () => {
  let calls: { url: string; headers: Headers }[]

  beforeEach(async () => {
    calls = []
    vi.stubGlobal('fetch', async (url: string, init: RequestInit) => {
      calls.push({ url: String(url), headers: new Headers(init.headers) })
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } })
    })
  })
  afterEach(() => vi.unstubAllGlobals())

  it('sends the document language, and follows the toggle', async () => {
    const { api } = await import('@/lib/api')

    document.documentElement.lang = 'ar'
    await api.get('/api/v1/reference/levels')
    expect(calls.at(-1)?.headers.get('accept-language')).toBe('ar')

    document.documentElement.lang = 'en'
    await api.get('/api/v1/reference/levels')
    expect(calls.at(-1)?.headers.get('accept-language')).toBe('en')
  })

  it('omits the header rather than guessing when no language is set', async () => {
    const { api } = await import('@/lib/api')
    document.documentElement.lang = ''
    await api.get('/api/v1/reference/levels')
    expect(calls.at(-1)?.headers.has('accept-language')).toBe(false)
  })
})
