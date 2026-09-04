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

/*
 * The root is fetched once so the legal pages can be compared against it.
 * Byte-equality with the SPA shell is the precise signal that a path fell
 * through the fallback — a status-code check cannot see it.
 */
const shell = await fetch(BASE).then((r) => r.text()).catch(() => '')

for (const [path, needle] of [['/privacy', 'Privacy'], ['/data-deletion', 'deletion']]) {
  await check(`${path} is a real page, not the SPA shell`, async () => {
    const r = await fetch(`${BASE}${path}`)
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
  const r = await fetch(`${BASE}/api/v1/anything`)
  const type = r.headers.get('content-type') ?? ''
  if (r.status === 200 && type.includes('text/html')) {
    return { ok: false, detail: '200 text/html — the SPA fallback is masking API failures' }
  }
  return { ok: true, detail: `HTTP ${r.status} ${type.split(';')[0]}` }
})

await check('/version.json reports the deployed commit', async () => {
  const r = await fetch(`${BASE}/version.json`)
  if (r.status !== 200) return { ok: false, detail: `HTTP ${r.status}` }
  const body = await r.json().catch(() => ({}))
  if (!EXPECTED_COMMIT) return { ok: true, detail: `commit=${body.commit}` }
  const ok = body.commit === EXPECTED_COMMIT
  return { ok, detail: ok ? `commit=${body.commit}` : `serving ${body.commit}, expected ${EXPECTED_COMMIT}` }
})

const failed = results.filter((r) => !r.ok).length
console.log(`\n  ${results.length - failed}/${results.length} passed\n`)
if (failed > 0) { console.error('  DEPLOY FAILED SMOKE TEST\n'); process.exit(1) }
