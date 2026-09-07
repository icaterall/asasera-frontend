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

/**
 * Field-keyed messages from a 422, when the server sent them.
 *
 * The backend answers a validation failure with both a flat `message` (one
 * sentence, for a log) and `details.fields` (the same failures keyed by field
 * name, for a form). A form needs the second: "Enter a valid email address."
 * belongs under the email input, not in a banner above the card.
 */
export type FieldErrors = Record<string, string>

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly requestId: string | undefined
  /** Present on a 422 the server keyed by field; empty otherwise. */
  readonly fields: FieldErrors
  /**
   * The rest of the server's `details`, untouched.
   *
   * `fields` used to be the only thing kept, and everything else on the
   * envelope was dropped on the floor — which was fine while every detail WAS
   * a field error. The resend cooldown answers with `retryAfterSeconds`, and a
   * caller that cannot read it has to either parse the sentence or run its own
   * timer, and a client-side timer disagrees with the server the first time a
   * request is slow. Kept as `unknown`: a caller that wants a value narrows it
   * at the point of use rather than this type growing a field per endpoint.
   */
  readonly details: unknown

  constructor(
    status: number,
    code: string,
    message: string,
    requestId?: string,
    fields: FieldErrors = {},
    details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.requestId = requestId
    this.fields = fields
    this.details = details
  }
}

/* ------------------------------------------------------------------ *
 * The access token
 * ------------------------------------------------------------------ */

/**
 * In memory, and only in memory.
 *
 * Not localStorage and not sessionStorage: any script that runs on the page
 * can read both, so an XSS becomes a stolen session that outlives the tab. A
 * module-scoped variable dies with the page, and the refresh cookie —
 * httpOnly, so script cannot touch it — is what survives a reload.
 *
 * It lives here rather than in React state because the interceptor below has
 * to *write* it from outside any component, after a background refresh. The
 * subscription makes it readable from React through `useSyncExternalStore`,
 * so the context exposes exactly this value with no second copy to drift.
 */
let accessToken: string | null = null
const listeners = new Set<() => void>()

export function setAccessToken(token: string | null): void {
  if (token === accessToken) return
  accessToken = token
  for (const listener of listeners) listener()
}

export function getAccessToken(): string | null {
  return accessToken
}

/** For `useSyncExternalStore`. Returns the unsubscribe. */
export function subscribeToAccessToken(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/**
 * Called when a refresh has failed and the session is genuinely over.
 *
 * A callback rather than `window.location = '/login'` because this module has
 * no router: a hard navigation would reload the whole bundle and lose the
 * route the person was on. `AuthProvider` registers React Router's `navigate`
 * here at mount.
 */
let onSessionLost: (() => void) | null = null

export function setSessionLostHandler(handler: (() => void) | null): void {
  onSessionLost = handler
}

/* ------------------------------------------------------------------ *
 * The request pipeline
 * ------------------------------------------------------------------ */

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
  /*
   * Bytes sent as-is, with `rawContentType` instead of application/json. Used
   * by the PDF upload, where the file is the whole request body — no
   * multipart, so no boundary parser is needed on either side.
   */
  rawBody?: BodyInit
  rawContentType?: string
  /**
   * Skips the Authorization header, and with it the 401 refresh-and-replay
   * below. Both follow from the same fact: this call is not made as a signed-in
   * user, so a 401 from it is an answer, not an expired token.
   */
  anonymous?: boolean
  signal?: AbortSignal
}

async function send(path: string, options: RequestOptions): Promise<Response> {
  const { method = 'GET', body, rawBody, rawContentType, anonymous = false, signal } = options

  const headers: Record<string, string> = { Accept: 'application/json' }
  if (rawBody !== undefined) headers['Content-Type'] = rawContentType ?? 'application/octet-stream'
  else if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (accessToken && !anonymous) headers.Authorization = `Bearer ${accessToken}`

  return fetch(`${BASE}${path}`, {
    method,
    headers,
    /*
     * Required for the refresh cookie to travel at all. It is httpOnly and
     * SameSite=Lax, and the deployed front end is on a different host from
     * the API, so without this the browser silently omits it and every
     * refresh looks like an expired session.
     */
    credentials: 'include',
    ...(rawBody !== undefined
      ? { body: rawBody }
      : body !== undefined
        ? { body: JSON.stringify(body) }
        : {}),
    ...(signal ? { signal } : {}),
  })
}

/**
 * One refresh at a time, shared by every caller waiting on it.
 *
 * Without this, a screen that fires three requests on mount and gets three
 * 401s starts three refreshes. They race: the backend rotates the refresh
 * token family on each one, so the second and third present a token the first
 * has already replaced, and a rotation-reuse check reads that as a stolen
 * token and kills the session. The single-flight promise is what turns three
 * concurrent 401s into one refresh and three replays.
 */
let refreshInFlight: Promise<SessionResponse | null> | null = null

async function doRefresh(): Promise<SessionResponse | null> {
  try {
    const response = await send(`${API_PREFIX}/auth/refresh`, {
      method: 'POST',
      body: {},
      // Anonymous, so a 401 from the refresh endpoint itself can never
      // re-enter this function. That is the loop guard, and it is structural
      // rather than a counter someone could forget to reset.
      anonymous: true,
    })
    if (!response.ok) return null
    const payload = (await response.json()) as SessionResponse
    setAccessToken(payload.accessToken)
    return payload
  } catch {
    // Offline, DNS, a refused preflight. Not a valid session either way.
    return null
  }
}

/**
 * The ONLY way anything in this app refreshes a session.
 *
 * It must stay the only way, because the backend ROTATES the refresh token on
 * every use and treats a second presentation of an already-rotated token as
 * theft: it revokes the whole token family and signs the person out. So two
 * refreshes racing do not merely waste a request, they destroy the session
 * they were trying to preserve.
 *
 * That is not hypothetical. `AuthProvider`'s boot refresh used to call the
 * endpoint directly, and React StrictMode double-invokes effects in
 * development — two calls, one cookie, "refresh token reuse detected: family
 * revoked", and a login that worked once and never again after a reload. Two
 * tabs waking together, or two 401s from different screens, reproduce it in
 * production with no StrictMode involved.
 *
 * Every caller therefore awaits the SAME promise. The slot is cleared once,
 * when it settles, so the next refresh after that starts fresh rather than
 * resolving against a stale answer.
 */
export function refreshSession(): Promise<SessionResponse | null> {
  refreshInFlight ??= doRefresh().finally(() => {
    refreshInFlight = null
  })
  return refreshInFlight
}

async function parse<T>(response: Response): Promise<T> {
  if (response.status === 204) return undefined as T

  const isJson = response.headers.get('content-type')?.includes('application/json')
  const payload = isJson ? await response.json().catch(() => null) : null

  if (!response.ok) {
    const error = (
      payload as {
        error?: {
          code?: string
          message?: string
          requestId?: string
          details?: { fields?: FieldErrors } & Record<string, unknown>
        }
      }
    )?.error
    throw new ApiError(
      response.status,
      error?.code ?? 'http_error',
      error?.message ?? `Request failed (${response.status}).`,
      error?.requestId,
      error?.details?.fields ?? {},
      error?.details,
    )
  }

  return payload as T
}

/**
 * Every call goes through here, and a 401 is handled in exactly one place.
 *
 * On a 401 from an authenticated call: refresh once, replay once. If the
 * replay also 401s, or the refresh itself failed, the session is over — the
 * token is cleared and the app is told to route to /login.
 *
 * The replay is issued with `retry: false`, so a second 401 cannot start a
 * second refresh. Together with the anonymous refresh call above, that is two
 * independent reasons an infinite loop cannot form: the retry flag bounds the
 * depth at one, and the anonymous flag keeps the refresh endpoint out of the
 * path entirely.
 */
async function request<T>(
  path: string,
  options: RequestOptions = {},
  retry = true,
): Promise<T> {
  let response: Response
  try {
    response = await send(path, options)
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

  if (response.status === 401 && retry && !options.anonymous) {
    if (await refreshSession()) return request<T>(path, options, false)

    setAccessToken(null)
    onSessionLost?.()
  }

  return parse<T>(response)
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PUT', body }),
  /* `del`, not `delete`: a reserved word cannot be a method name shorthand. */
  del: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
  /*
   * A body that is already bytes, sent with its own content type instead of
   * being JSON-encoded. The one caller is the PDF upload, where the file IS
   * the request body.
   */
  postRaw: <T>(path: string, body: BodyInit, contentType: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', rawBody: body, rawContentType: contentType }),
}

/* ------------------------------------------------------------------ *
 * Typed endpoints
 * ------------------------------------------------------------------ */

export type HealthResponse = { status: string; uptime?: number }

export type PublicUser = {
  id: number
  /* Null until profile completion collects it — signup creates the account
     from an email and a password alone. */
  name: string | null
  email: string | null
  role: 'teacher' | 'student' | 'admin' | 'support'
  status: string
  locale: string
  emailVerified: boolean
  /**
   * Both null on an account created by a federated sign-in, which carries no
   * teaching context. `role === 'teacher' && educationStageId === null` is
   * what sends someone to the profile-completion screen — read from the user
   * object rather than from a URL parameter anyone could set.
   */
  categoryId: number | null
  educationStageId: number | null
  /** Where a teacher works. Null for a student, who is never asked. */
  workplaceTypeId: number | null
}

export type SessionResponse = { user: PublicUser; accessToken: string; refreshToken?: string }

/** A row from any of the name-only reference lists. */
export type ReferenceOption = { id: number; name_ar: string; name_en: string }

/**
 * A workplace type, which carries one field the other lists do not: `code`.
 *
 * The four cards each need an icon and a colour, and that mapping has to key
 * on something stable. Ids come from a sequence and differ between databases;
 * the names are editorial. The code is pinned by a database constraint, so it
 * is the only field safe to switch on. See `lib/workplaceArt.ts`.
 */
export type WorkplaceOption = ReferenceOption & { code: string }

/*
 * The reference lists.
 *
 * Anonymous: each is needed to RENDER a signup step, which is by definition a
 * page nobody is signed in on. None of them is hardcoded here — every list is
 * served from the same rows the write path validates against, so a client that
 * invents an option only earns itself a 422.
 */
export const reference = {
  educationStages: (signal?: AbortSignal) =>
    api
      .get<{ stages: ReferenceOption[] }>(`${API_PREFIX}/education-stages`, {
        anonymous: true,
        signal,
      })
      .then((payload) => payload.stages),

  categories: (signal?: AbortSignal) =>
    api
      .get<{ categories: ReferenceOption[] }>(`${API_PREFIX}/categories`, {
        anonymous: true,
        signal,
      })
      .then((payload) => payload.categories),

  workplaceTypes: (signal?: AbortSignal) =>
    api
      .get<{ workplaceTypes: WorkplaceOption[] }>(`${API_PREFIX}/workplace-types`, {
        anonymous: true,
        signal,
      })
      .then((payload) => payload.workplaceTypes),

  salutations: (signal?: AbortSignal) =>
    api
      .get<{ salutations: ReferenceOption[] }>(`${API_PREFIX}/salutations`, {
        anonymous: true,
        signal,
      })
      .then((payload) => payload.salutations),
}

export type RegisterResponse = { ok: boolean; message: string }

export const auth = {
  /*
   * Two endpoints, and the role is decided by WHICH ONE the route calls.
   * There is no `role` key in either body — not stripped downstream, never
   * sent. The server takes the same view: its schemas do not declare the
   * field, so one arriving from anywhere is dropped before a handler runs.
   */
  /*
   * No `education_stage_id`. A teacher no longer picks a stage at signup —
   * the server stamps audience_age_band itself — and the field is absent from
   * the type so no caller can start sending one again by accident.
   */
  registerTeacher: (input: {
    name?: string
    email: string
    password: string
    category_id?: number
    salutation_id?: number
    workplace_type_id?: number
  }) =>
    api.post<RegisterResponse>(`${API_PREFIX}/auth/register/teacher`, input, {
      anonymous: true,
    }),

  /**
   * Is this address free to register? One boolean, nothing else.
   *
   * Anonymous, and `POST` rather than `GET` so the address never lands in a
   * URL — which is where query strings end up in access logs, proxies and
   * `Referer` headers. It is a read, but the body is the point.
   *
   * NOT authoritative. The answer can be stale by the time the account is
   * submitted; `registerTeacher`/`registerStudent` still answer `email_taken`
   * and that is what settles it.
   */
  emailAvailable: (email: string) =>
    api.post<{ available: boolean }>(
      `${API_PREFIX}/auth/email-available`,
      { email },
      { anonymous: true },
    ),

  registerStudent: (input: { name?: string; email: string; password: string; education_stage_id?:number }) =>
    api.post<RegisterResponse>(`${API_PREFIX}/auth/register/student`, input, {
      anonymous: true,
    }),

  login: async (email: string, password: string): Promise<SessionResponse> => {
    const session = await api.post<SessionResponse>(
      `${API_PREFIX}/auth/login`,
      { email, password, device_kind: 'web' },
      { anonymous: true },
    )
    setAccessToken(session.accessToken)
    return session
  },

  /**
   * Exchanges the httpOnly refresh cookie for a new access token.
   *
   * Delegates to the shared single-flight rather than posting itself, so the
   * boot refresh and the 401 interceptor can never be in flight at the same
   * time with the same cookie. See `refreshSession`.
   */
  refresh: refreshSession,

  /*
   * The backend call is the point, not a courtesy. Dropping the in-memory
   * token would end the session in this tab only: the refresh cookie would
   * still be valid, and the next reload would silently sign the person back
   * in. The server revokes the refresh family and clears the cookie.
   */
  logout: async (): Promise<void> => {
    try {
      await api.post(`${API_PREFIX}/auth/logout`, {}, { anonymous: true })
    } finally {
      // Even if the call failed, this tab must stop acting signed in.
      setAccessToken(null)
    }
  },

  me: () => api.get<{ user: PublicUser }>(`${API_PREFIX}/auth/me`),

  /** Display name and optional education/workplace settings. Privileges stay server-owned. */
  updateProfile: (patch: {
    name?: string
    category_id?: number
    education_stage_id?: number
    workplace_type_id?: number
  }) =>
    api.patch<{ user: PublicUser }>(`${API_PREFIX}/auth/me`, patch),

  /**
   * Ask for the verification email again.
   *
   * The server owns the cooldown and answers 429 with a countdown when one is
   * in force — including immediately after registration, which already sent
   * one. Nothing here tries to predict that; a client-side timer would only
   * disagree with the server on a slow connection.
   */
  resendVerification: () =>
    api.post<{ ok: boolean; alreadyVerified: boolean }>(
      `${API_PREFIX}/auth/verify-email/resend`,
    ),

  /** Move an unverified account to a different address. */
  changeEmail: (email: string) =>
    api.patch<{ user: PublicUser }>(`${API_PREFIX}/auth/email`, { email }),

  /**
   * Complete verification from the link.
   *
   * Anonymous: the link is opened from an inbox, which may be a different
   * browser from the one that signed up, and requiring a session there would
   * make the message useless to anyone who reads mail on their phone.
   */
  verifyEmail: (token: string) =>
    api.post<{ ok: boolean }>(`${API_PREFIX}/auth/verify-email`, { token }, { anonymous: true }),

  forgot: (email: string) =>
    api.post<{ ok: boolean; message: string }>(
      `${API_PREFIX}/auth/forgot`,
      { email },
      { anonymous: true },
    ),

  reset: (token: string, password: string) =>
    api.post<{ ok: boolean }>(
      `${API_PREFIX}/auth/reset`,
      { token, password },
      { anonymous: true },
    ),
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
 * link at all — only to the XHR calls above. It is also why there is no Google
 * JavaScript SDK anywhere in this bundle: the entire flow is a redirect to our
 * own backend, and a third-party script on the one page where someone is about
 * to type a credential would be code we do not control.
 */
export function federatedSignInUrl(
  provider: 'google' | 'facebook',
  /*
   * Signup intent, for the signup entry points only.
   *
   * These are HINTS handed to our own backend, which copies them into the
   * signed, expiring handshake cookie and applies them ONLY to an account it
   * has just created. They are query parameters on a link the user can edit,
   * so nothing here is trusted: the role cannot promote an existing account
   * and every id is validated against its own table server-side.
   */
  intent?: {
    role?: 'teacher' | 'student'
    /** A teacher's answer. */
    workplaceId?: number | null
    /** A student's answer. */
    stageId?: number | null
  },
): string {
  const path = provider === 'google' ? `${API_PREFIX}/auth/google` : '/auth/facebook'
  const params = new URLSearchParams()
  if (intent?.role) params.set('role', intent.role)
  if (intent?.workplaceId != null) params.set('workplace_id', String(intent.workplaceId))
  if (intent?.stageId != null) params.set('stage_id', String(intent.stageId))
  const query = params.toString()
  return `${BASE}${path}${query ? `?${query}` : ''}`
}

/* ------------------------------------------------------------------ *
 * The instructor journey
 * ------------------------------------------------------------------ */

export type Course = {
  id: number
  title: string
  contentLanguage: string
  categoryId: number | null
  educationStageId: number | null
  description: string | null
  archivedAt: string | null
  lessonCount?: number
  materialCount?: number
  createdAt: string
  updatedAt: string
}

export type MaterialSegment = {
  segmentIndex: number
  pageIndex: number | null
  printedLabel: string | null
  text: string
  charCount: number
  warning: string | null
}

export type Material = {
  id: number
  title: string
  courseId: number | null
  courseTitle: string | null
  revisionId: number | null
  revisionNo: number | null
  sourceKind: string | null
  extractionStatus: string | null
  extractionError: string | null
  pageCount: number | null
  originalFilename: string | null
  createdAt: string
  updatedAt: string
  segments?: MaterialSegment[]
}

export type ActivityKind = 'explanation' | 'multiple_choice' | 'true_false'

export type Activity = {
  id: number
  position: number
  kind: ActivityKind
  prompt: string
  body: string | null
  options: { id: string; text: string }[]
  /** The teacher's view carries the key. A student read model must not. */
  answerKey: { optionId?: string; value?: boolean } | null
  explanation: string | null
  sourceSegments: number[]
  points: number
}

export type LessonSummary = {
  id: number
  title: string
  status: string
  courseId: number
  courseTitle: string | null
  objective: string | null
  purpose: string | null
  durationMinutes: number | null
  materialRevisionId: number | null
  activityCount?: number
  createdAt: string
  updatedAt: string
}

export type Lesson = LessonSummary & {
  contentLanguage: string
  draftId: number
  /** Sent back on every write; a mismatch is a 409 rather than an overwrite. */
  draftRevision: number
  draftUpdatedAt: string
  scopeSegments: number[]
  material: {
    id: number
    title: string
    revisionId: number
    sourceKind: string
    extractionStatus: string
    pageCount: number | null
  } | null
  segments: MaterialSegment[]
  activities: Activity[]
}

const TEACHING = `${API_PREFIX}/teaching`

/**
 * Everything under /teaching is private and owner-scoped on the server. None
 * of these calls sends an owner id, because the server takes it from the
 * access token — a client-supplied owner is exactly the thing that turns an
 * id into an authorization bypass.
 */
export type GenerationJob = {
  id: number
  state: 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled' | 'needs_review'
  lessonId: number
  activityCount: number
  createdAt: string
  startedAt: string | null
  finishedAt: string | null
  maxAuthorizedMillicents: number
  settledMillicents: number
  errorCode: string | null
  resultActivities: number | null
  appliedCount: number
  appliedToDraft: boolean
  cancelRequested: boolean
}

export const teaching = {
  courses: (params: { page?: number; includeArchived?: boolean } = {}) =>
    api.get<{ courses: Course[]; total: number }>(
      `${TEACHING}/courses?page=${params.page ?? 1}` +
        (params.includeArchived ? '&include_archived=true' : ''),
    ),

  createCourse: (input: {
    title: string
    content_language?: string
    category_id?: number
    education_stage_id?: number
    description?: string
  }) => api.post<{ course: Course }>(`${TEACHING}/courses`, input),

  course: (id: number) => api.get<{ course: Course }>(`${TEACHING}/courses/${id}`),

  updateCourse: (id: number, patch: Record<string, unknown>) =>
    api.patch<{ course: Course }>(`${TEACHING}/courses/${id}`, patch),

  archiveCourse: (id: number) =>
    api.post<{ course: Course }>(`${TEACHING}/courses/${id}/archive`, {}),

  restoreCourse: (id: number) =>
    api.post<{ course: Course }>(`${TEACHING}/courses/${id}/restore`, {}),

  materialLimits: () =>
    api.get<{ maxBytes: number; acceptedKinds: string[]; maxPastedChars: number }>(
      `${TEACHING}/materials/limits`,
    ),

  materials: (params: { page?: number; courseId?: number } = {}) =>
    api.get<{ materials: Material[]; total: number }>(
      `${TEACHING}/materials?page=${params.page ?? 1}` +
        (params.courseId ? `&course_id=${params.courseId}` : ''),
    ),

  material: (id: number) => api.get<{ material: Material }>(`${TEACHING}/materials/${id}`),

  createTextMaterial: (input: { title: string; text: string; course_id?: number }) =>
    api.post<{ material: Material }>(`${TEACHING}/materials/text`, input),

  /**
   * The file IS the body. No multipart, so no boundary parser on the server and
   * no FormData here — the metadata rides in the query string and the bytes go
   * straight through. `send` is used directly because `api.post` JSON-encodes.
   */
  uploadPdf: async (input: { title: string; file: File; courseId?: number }) => {
    const search = new URLSearchParams({ title: input.title, filename: input.file.name })
    if (input.courseId) search.set('course_id', String(input.courseId))
    return api.postRaw<{ material: Material }>(
      `${TEACHING}/materials/pdf?${search.toString()}`,
      input.file,
      'application/pdf',
    )
  },

  /**
   * Delete a material.
   *
   * The reply distinguishes what actually happened, because the interface has
   * to: files queued for erasure, files kept because something else still uses
   * them, and files this application does not manage and therefore cannot
   * erase. A 409 means an approved lesson still cites the source and nothing
   * was deleted.
   */
  deleteMaterial: (id: number) =>
    api.del<{
      deleted: boolean
      filesQueuedForDeletion: number
      filesRetained: number
      unmanagedFiles: number
    }>(`${TEACHING}/materials/${id}`),

  /** Counts of this teacher's files still being cleaned up, or stuck. Read on
   *  load so a pending cleanup survives a refresh. */
  cleanupStatus: () =>
    api.get<{ pendingCount: number; failedCount: number }>(`${TEACHING}/storage/cleanup`),

  /* ---- Wallet and AI generation ---------------------------------------- */

  wallet: () =>
    api.get<{
      balanceMillicents: number
      reservedMillicents: number
      spendableMillicents: number
      welcomeGrantClaimed: boolean
    }>(`${TEACHING}/wallet`),

  claimWelcomeGrant: () =>
    api.post<{ balanceMillicents: number; welcomeGrantClaimed: boolean }>(
      `${TEACHING}/wallet/welcome-grant`,
      {},
    ),

  /** The ceiling, shown before the teacher commits to anything. */
  generationQuote: (activityCount: number, segmentCount: number) =>
    api.get<{
      activityCount: number
      maxAuthorizedMillicents: number
      pricingAvailable: boolean
      pricingPolicy: string
      spendableMillicents: number
      affordable: boolean
      welcomeGrantClaimed: boolean
      supportedKinds: string[]
      maxActivities: number
    }>(`${TEACHING}/generation/quote?activity_count=${activityCount}&segment_count=${segmentCount}`),

  startGeneration: (input: {
    lesson_id: number
    material_revision_id: number
    segments: number[]
    objective: string
    language: string
    activity_count: number
    kinds?: string[]
    draft_revision: number
    idempotency_key: string
  }) => api.post<{ job: GenerationJob }>(`${TEACHING}/generation/jobs`, input),

  generationJob: (id: number) =>
    api.get<{ job: GenerationJob }>(`${TEACHING}/generation/jobs/${id}`),

  /** The latest job for a lesson — how a reopened editor finds its own work. */
  generationForLesson: (lessonId: number) =>
    api.get<{ job: GenerationJob | null }>(`${TEACHING}/lessons/${lessonId}/generation`),

  generationResult: (id: number) =>
    api.get<{
      state: string
      appliedIndexes: number[]
      activities: {
        kind: string
        prompt: string
        options: { id: string; text: string }[]
        answerKey: unknown
        explanation: string
        sourceSegments: number[]
      }[]
      rejected: { reason: string; count: number }[]
    }>(`${TEACHING}/generation/jobs/${id}/result`),

  /** `selected` omitted means every candidate not yet added. */
  applyGeneration: (id: number, selected?: number[]) =>
    api.post<{
      applied: number
      skippedAlreadyApplied: number
      draftMovedSinceRequest: boolean
      lessonId: number
      remaining: number
    }>(`${TEACHING}/generation/jobs/${id}/apply`, selected ? { selected } : {}),

  cancelGeneration: (id: number) =>
    api.post<{ job: GenerationJob }>(`${TEACHING}/generation/jobs/${id}/cancel`, {}),

  openGenerationJobs: () =>
    api.get<{ jobs: GenerationJob[] }>(`${TEACHING}/generation/jobs/open`),

  segments: (revisionId: number) =>
    api.get<{ segments: MaterialSegment[] }>(`${TEACHING}/revisions/${revisionId}/segments`),

  /** The original file, for the source viewer. Authorized server-side. */
  revisionFileUrl: (revisionId: number) => `${TEACHING}/revisions/${revisionId}/file`,

  lessons: (params: { page?: number; courseId?: number; status?: string; q?: string } = {}) => {
    const search = new URLSearchParams({ page: String(params.page ?? 1) })
    if (params.courseId) search.set('course_id', String(params.courseId))
    if (params.status) search.set('status', params.status)
    if (params.q) search.set('q', params.q)
    return api.get<{ lessons: LessonSummary[]; total: number }>(
      `${TEACHING}/lessons?${search.toString()}`,
    )
  },

  createLesson: (input: {
    title: string
    course_id?: number
    new_course_title?: string
    material_revision_id?: number
    scope_segments?: number[]
  }) => api.post<{ lesson: Lesson }>(`${TEACHING}/lessons`, input),

  lesson: (id: number) => api.get<{ lesson: Lesson }>(`${TEACHING}/lessons/${id}`),

  updateDraft: (id: number, patch: Record<string, unknown> & { draft_revision: number }) =>
    api.patch<{ lesson: Lesson }>(`${TEACHING}/lessons/${id}`, patch),

  addActivity: (lessonId: number, input: Record<string, unknown>) =>
    api.post<{ lesson: Lesson }>(`${TEACHING}/lessons/${lessonId}/activities`, input),

  updateActivity: (lessonId: number, activityId: number, input: Record<string, unknown>) =>
    api.put<{ lesson: Lesson }>(`${TEACHING}/lessons/${lessonId}/activities/${activityId}`, input),

  /** Blocking issues stop publication; warnings need a deliberate acknowledgement. */
  reviewLesson: (lessonId: number) =>
    api.get<{
      issues: { severity: 'blocking' | 'warning'; code: string; activityId: number | null }[]
    }>(`${TEACHING}/lessons/${lessonId}/review`),

  approveLesson: (lessonId: number, input: { draft_revision: number; acknowledged_warnings: string[] }) =>
    api.post<{ version: { id: number; versionNo: number } }>(
      `${TEACHING}/lessons/${lessonId}/approve`,
      input,
    ),

  deleteActivity: (lessonId: number, activityId: number) =>
    api.del<{ lesson: Lesson }>(`${TEACHING}/lessons/${lessonId}/activities/${activityId}`),

  reorderActivities: (lessonId: number, input: { draft_revision: number; activity_ids: number[] }) =>
    api.post<{ lesson: Lesson }>(`${TEACHING}/lessons/${lessonId}/activities/order`, input),
}

/* ------------------------------------------------------------------ *
 * Activities — app-plan v4 §12, W03
 * ------------------------------------------------------------------ */

const ACTIVITIES = `${API_PREFIX}/activities`

export type QuestionKindWire = 'mcq' | 'tf' | 'order' | 'match' | 'hotspot'

export type ActivityRecord = {
  id: number
  authorId: number
  title: string
  subjectId: number
  levelId: number
  curriculumNodeId: number | null
  purposeId: number | null
  visibility: 'private' | 'published'
  theme: string
  revision: number
  currentVersionId: number | null
  createdAt: string
  updatedAt: string
}

export type QuestionRecord = {
  revision: number
  id: number
  ordinal: number
  kind: QuestionKindWire
  prompt: string
  mediaKey: string | null
  timeLimitS: number
  payload: unknown
}

export type ErrorPairRecord = {
  questionId: number
  elementKey: string
  wrongTargetKey: string | null
  reason: string
}

/** What `POST /publish` returns when the activity is not ready. */
export type PublicationProblem = {
  code: string
  questionId?: number
  questionOrdinal?: number
  elementKey?: string
  field?: string
  message: string
  messageAr: string
}

export type LevelRecord = {
  id: number
  code: string
  ageFrom: number
  ageTo: number
  label: { ar: string; en: string }
  labelSource: 'country' | 'generic'
}

export type SubjectRecord = { id: number; code: string; nameAr: string; nameEn: string }

export const taxonomy = {
  levels: (country?: string) =>
    api.get<{ country: string | null; levels: LevelRecord[] }>(
      `${API_PREFIX}/levels${country ? `?country=${encodeURIComponent(country)}` : ''}`,
    ),
  subjects: () => api.get<{ subjects: SubjectRecord[] }>(`${API_PREFIX}/subjects`),
  purposes: () => api.get<{ purposes: SubjectRecord[] }>(`${API_PREFIX}/purposes`),
}

export const activities = {
  list: () => api.get<{ activities: ActivityRecord[] }>(ACTIVITIES),

  create: (input: {
    title: string
    subjectId: number
    levelId: number
    curriculumNodeId?: number | null
    purposeId?: number | null
    theme?: string
  }) => api.post<{ activity: ActivityRecord }>(ACTIVITIES, input),

  /* One request for the whole editing surface: three round trips would show
     the teacher three loading states for one screen. */
  load: (id: number) =>
    api.get<{ activity: ActivityRecord; questions: QuestionRecord[]; errorPairs: ErrorPairRecord[] }>(
      `${ACTIVITIES}/${id}`,
    ),

  update: (id: number, patch: Record<string, unknown>) =>
    api.patch<{ activity: ActivityRecord }>(`${ACTIVITIES}/${id}`, patch),

  remove: (id: number) => api.del<void>(`${ACTIVITIES}/${id}`),

  addQuestion: (activityId: number, input: Record<string, unknown>) =>
    api.post<{ question: QuestionRecord }>(`${ACTIVITIES}/${activityId}/questions`, input),

  updateQuestion: (questionId: number, patch: Record<string, unknown>) =>
    api.patch<{ question: QuestionRecord }>(`${ACTIVITIES}/questions/${questionId}`, patch),

  deleteQuestion: (questionId: number) => api.del<void>(`${ACTIVITIES}/questions/${questionId}`),

  duplicateQuestion: (questionId: number) =>
    api.post<{ question: QuestionRecord }>(`${ACTIVITIES}/questions/${questionId}/duplicate`, {}),

  /* Ordered ids, never indices — §12 requires stable keys. */
  reorder: (activityId: number, order: number[]) =>
    api.put<{ questions: QuestionRecord[] }>(`${ACTIVITIES}/${activityId}/order`, { order }),

  /* An empty reason removes the pair rather than storing a blank one. */
  setReason: (questionId: number, input: { elementKey: string; wrongTargetKey?: string | null; reason: string }) =>
    api.put<void>(`${ACTIVITIES}/questions/${questionId}/reasons`, input),

  publish: (id: number) =>
    api.post<{ activity: ActivityRecord; version: number; versionId: number }>(
      `${ACTIVITIES}/${id}/publish`, {},
    ),

  unpublish: (id: number) =>
    api.post<{ activity: ActivityRecord }>(`${ACTIVITIES}/${id}/unpublish`, {}),
}
