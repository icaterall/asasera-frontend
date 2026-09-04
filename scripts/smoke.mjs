/**
 * Post-deploy smoke test for the front end host.
 *
 * The checks mirror the two failures this host actually produced: a /privacy
 * that answered 200 with the SPA shell and no policy text in it, and an API
 * path that answered 200 with a web page instead of failing.
 *
 * Usage: node scripts/smoke.mjs <base-url> [expected-commit]
 */
const [, , BASE, EXPECTED_COMMIT] = process.argv
if (!BASE) {
  console.error('usage: node scripts/smoke.mjs <base-url> [expected-commit]')
  process.exit(2)
}


/*
 * The same rollout race the backend test hit.
 *
 * A deploy is not live when the pod is Ready — it is live when the load
 * balancer is serving it. Between those two moments requests split across the
 * old and new targets, and asserting there fails a deploy that worked.
 */
const READY_TIMEOUT_MS = 180_000
const RETRY_STATUSES = new Set([502, 503, 504])
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function waitForDeploy() {
  if (!EXPECTED_COMMIT) return { ok: true, detail: 'no commit expectation given' }
  const deadline = Date.now() + READY_TIMEOUT_MS
  let last = 'no response'
  while (Date.now() < deadline) {
    try {
      const r = await fetch(`${BASE}/version.json`)
      if (r.status === 200) {
        const body = await r.json().catch(() => ({}))
        if (body.commit === EXPECTED_COMMIT) return { ok: true, detail: `commit=${body.commit}` }
        last = `serving ${body.commit}`
      } else last = `HTTP ${r.status}`
    } catch (e) { last = e.message }
    await sleep(3000)
  }
  return { ok: false, detail: `${last} — the new build never appeared within ${READY_TIMEOUT_MS / 1000}s` }
}

async function stableFetch(url, init, attempts = 6) {
  let response
  for (let i = 0; i < attempts; i++) {
    response = await fetch(url, init)
    if (!RETRY_STATUSES.has(response.status)) return response
    await sleep(2500)
  }
  return response
}

const results = []
const record = (name, ok, detail) => {
  results.push({ ok })
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}
async function check(name, fn) {
  try { const { ok, detail } = await fn(); record(name, ok, detail) }
  catch (e) { record(name, false, `threw: ${e.message}`) }
}

console.log(`\nSmoke test against ${BASE}\n`)

await check('the new build is live behind the load balancer', waitForDeploy)

/*
 * The root is fetched once so the legal pages can be compared against it.
 * Byte-equality with the SPA shell is the precise signal that a path fell
 * through the fallback — a status-code check cannot see it.
 */
const shell = await stableFetch(BASE).then((r) => r.text()).catch(() => '')

for (const [path, needle] of [['/privacy', 'Privacy'], ['/data-deletion', 'deletion']]) {
  await check(`${path} is a real page, not the SPA shell`, async () => {
    const r = await stableFetch(`${BASE}${path}`)
    const text = await r.text()
    if (r.status !== 200) return { ok: false, detail: `HTTP ${r.status}` }
    if (shell && text === shell) return { ok: false, detail: '200 but byte-identical to the SPA shell' }
    if (!text.toLowerCase().includes(needle.toLowerCase())) {
      return { ok: false, detail: `200 but "${needle}" absent` }
    }
    return { ok: true, detail: `HTTP 200, ${text.length} bytes` }
  })
}

await check('an /api/ path does not return 200-with-HTML', async () => {
  const r = await stableFetch(`${BASE}/api/v1/anything`)
  const type = r.headers.get('content-type') ?? ''
  if (r.status === 200 && type.includes('text/html')) {
    return { ok: false, detail: '200 text/html — the SPA fallback is masking API failures' }
  }
  return { ok: true, detail: `HTTP ${r.status} ${type.split(';')[0]}` }
})

await check('/version.json reports the deployed commit', async () => {
  const r = await stableFetch(`${BASE}/version.json`)
  if (r.status !== 200) return { ok: false, detail: `HTTP ${r.status}` }
  const body = await r.json().catch(() => ({}))
  if (!EXPECTED_COMMIT) return { ok: true, detail: `commit=${body.commit}` }
  const ok = body.commit === EXPECTED_COMMIT
  return { ok, detail: ok ? `commit=${body.commit}` : `serving ${body.commit}, expected ${EXPECTED_COMMIT}` }
})

const failed = results.filter((r) => !r.ok).length
console.log(`\n  ${results.length - failed}/${results.length} passed\n`)
if (failed > 0) { console.error('  DEPLOY FAILED SMOKE TEST\n'); process.exit(1) }
