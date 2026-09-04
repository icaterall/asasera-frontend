/**
 * The one place the front end talks to the API.
 *
 * ── Where the base URL comes from ────────────────────────────────────────
 * In development it is empty, so every call is a same-origin path like
 * `/api/v1/health`, which Vite's dev server proxies to the local backend.
 * That means development has no CORS at all: the browser never sees a
 * cross-origin request, so a misconfigured allowlist cannot break local work
 * and, more usefully, cannot hide a real CORS bug until deploy either — the
 * deployed build is the only one making cross-origin calls, and it is the one
 * the allowlist is written for.
 *
 * In production `VITE_API_URL` is baked in at build time (Vite inlines it;
 * there is no runtime lookup), pointing at https://backend.asasera.com.
 */
const BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

/** Versioned API surface. The auth cookie is scoped to `/api/v1/auth`. */
export const API_PREFIX = '/api/v1'

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly requestId: string | undefined

  constructor(status: number, code: string, message: string, requestId?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.requestId = requestId
  }
}

/**
 * The access token lives in memory, and only in memory.
 *
 * Not localStorage and not sessionStorage: any script that runs on the page
 * can read both, so an XSS becomes a stolen session that outlives the tab.
 * A module-scoped variable dies with the page, and the refresh cookie —
 * httpOnly, so script cannot touch it — is what survives a reload.
 */
let accessToken: string | null = null

export function setAccessToken(token: string | null): void {
  accessToken = token
}

export function getAccessToken(): string | null {
  return accessToken
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  /** Skips the Authorization header for endpoints that must stay anonymous. */
  anonymous?: boolean
  signal?: AbortSignal
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, anonymous = false, signal } = options

  const headers: Record<string, string> = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (accessToken && !anonymous) headers.Authorization = `Bearer ${accessToken}`

  let response: Response
  try {
    response = await fetch(`${BASE}${path}`, {
      method,
      headers,
      /*
       * Required for the refresh cookie to travel at all. It is httpOnly and
       * SameSite=Lax, and the deployed front end is on a different host from
       * the API, so without this the browser silently omits it and every
       * refresh looks like an expired session.
       */
      credentials: 'include',
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      ...(signal ? { signal } : {}),
    })
  } catch (cause) {
    /*
     * fetch rejects only on a network-level failure — DNS, TLS, offline, or a
     * CORS preflight the browser refused. It never rejects on a 4xx or 5xx,
     * so this branch is genuinely "the request never happened", and saying so
     * is more useful than a generic error.
     */
    if ((cause as Error).name === 'AbortError') throw cause
    throw new ApiError(0, 'network_error', 'Could not reach the server.')
  }

  if (response.status === 204) return undefined as T

  const isJson = response.headers.get('content-type')?.includes('application/json')
  const payload = isJson ? await response.json().catch(() => null) : null

  if (!response.ok) {
    const error = (payload as { error?: { code?: string; message?: string; requestId?: string } })?.error
    throw new ApiError(
      response.status,
      error?.code ?? 'http_error',
      error?.message ?? `Request failed (${response.status}).`,
      error?.requestId,
    )
  }

  return payload as T
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),
}

/* ------------------------------------------------------------------ *
 * Typed endpoints
 *
 * Only endpoints whose tables exist are declared here. `/api/v1/contact`
 * and `/api/v1/stats` are deliberately absent: the backend routes exist but
 * the tables they read do not, so calling them returns a 500. Adding them
 * here would put a broken call one import away from being used.
 * ------------------------------------------------------------------ */

export type HealthResponse = { status: string; uptime?: number }

export type PublicUser = {
  id: number
  name: string
  email: string | null
  role: 'teacher' | 'student' | 'admin' | 'support'
  status: string
  locale: string
  emailVerified: boolean
}

export type SessionResponse = { user: PublicUser; accessToken: string; refreshToken?: string }

export const auth = {
  registerTeacher: (input: {
    name: string
    email: string
    password: string
    education_stage_id: number
    category_id?: number
  }) => api.post<{ ok: boolean; message: string }>(`${API_PREFIX}/auth/register/teacher`, input, { anonymous: true }),

  registerStudent: (input: { name: string; email: string; password: string }) =>
    api.post<{ ok: boolean; message: string }>(`${API_PREFIX}/auth/register/student`, input, { anonymous: true }),

  login: async (email: string, password: string): Promise<SessionResponse> => {
    const session = await api.post<SessionResponse>(
      `${API_PREFIX}/auth/login`,
      { email, password, device_kind: 'web' },
      { anonymous: true },
    )
    setAccessToken(session.accessToken)
    return session
  },

  /** Exchanges the httpOnly refresh cookie for a new access token. */
  refresh: async (): Promise<SessionResponse> => {
    const session = await api.post<SessionResponse>(`${API_PREFIX}/auth/refresh`, {}, { anonymous: true })
    setAccessToken(session.accessToken)
    return session
  },

  logout: async (): Promise<void> => {
    await api.post(`${API_PREFIX}/auth/logout`, {}, { anonymous: true })
    setAccessToken(null)
  },

  me: () => api.get<{ user: PublicUser }>(`${API_PREFIX}/auth/me`),
}

export const health = {
  check: () => api.get<HealthResponse>(`${API_PREFIX}/health`, { anonymous: true }),
}

/** The API origin actually in use, for diagnostics and the connectivity check. */
export const apiOrigin = BASE || window.location.origin

/* ------------------------------------------------------------------ *
 * Federated sign-in
 * ------------------------------------------------------------------ */

/**
 * The URL a "Continue with ..." link points at.
 *
 * Note the two paths are NOT parallel, and that is deliberate rather than an
 * oversight to be tidied up:
 *
 *   Google    /api/v1/auth/google   — versioned with the rest of the API
 *   Facebook  /auth/facebook        — at the root of the backend host
 *
 * Facebook's redirect URI is registered in Meta's app console and is
 * byte-matched by Facebook on the token exchange, so it must not move when the
 * API version does. Changing it here means changing it in the console too, and
 * a mismatch fails the exchange rather than degrading quietly.
 *
 * These are full-page navigations to the backend, never fetch() calls: the
 * response is a 302 to the provider, and following that in JavaScript is both
 * blocked by CORS and pointless. Which also means CORS does not apply to this
 * link at all — only to the XHR calls above.
 */
export function federatedSignInUrl(provider: 'google' | 'facebook'): string {
  const path = provider === 'google' ? `${API_PREFIX}/auth/google` : '/auth/facebook'
  return `${BASE}${path}`
}
