/**
 * Post-build assertions. Any failure here fails the build.
 *
 * Both checks exist because their absence already cost a production incident:
 * an empty VITE_API_URL produced a bundle that called its own origin, hit the
 * SPA fallback, and surfaced as a JSON parse error that looked like a backend
 * fault. Nothing in the build said anything was wrong.
 *
 * A build that cannot reach the API is not a build worth shipping, so these
 * are errors, not warnings.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const DIST = path.join(ROOT, 'dist/assets')
const failures = []

/**
 * Resolve VITE_API_URL the way Vite does, not the way a shell does.
 *
 * Vite loads .env.production into `import.meta.env` for the bundle; it does
 * NOT put it in `process.env` for a sibling Node script. Reading only
 * `process.env` here made this script fail every ordinary `npm run build` —
 * the assertion would have broken the Docker build it exists to protect.
 * A real environment variable still wins, because that is what CI passes.
 */
function resolveApiUrl() {
  const fromEnv = (process.env.VITE_API_URL ?? '').trim()
  if (fromEnv) return { value: fromEnv, source: 'process.env' }
  if (process.env.VITE_API_URL === '') return { value: '', source: 'process.env (empty)' }

  const file = path.join(ROOT, '.env.production')
  if (!existsSync(file)) return { value: '', source: '.env.production (missing)' }

  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*VITE_API_URL\s*=\s*(.*)$/)
    if (m) return { value: m[1].trim().replace(/^["']|["']$/g, ''), source: '.env.production' }
  }
  return { value: '', source: '.env.production (key absent)' }
}

const { value: apiUrl, source } = resolveApiUrl()
const mode = process.env.NODE_ENV ?? 'production'

/* 1. The variable itself must be set for a production build. */
if (!apiUrl) {
  failures.push(
    `VITE_API_URL is empty or unset (checked: ${source}).\n` +
      '      Vite inlines this at build time; empty means every request goes to the\n' +
      '      front end\'s own origin, hits the SPA fallback, and returns HTML.\n' +
      '      Ensure .env.production exists and reaches the Docker build context.',
  )
}

/* 2. And it must actually be present in the emitted JavaScript. */
let bundles = []
try {
  bundles = readdirSync(DIST).filter((f) => f.endsWith('.js'))
} catch {
  failures.push(`No build output at ${DIST}. Did "vite build" run?`)
}

if (apiUrl && bundles.length > 0) {
  const found = bundles.some((f) => readFileSync(path.join(DIST, f), 'utf8').includes(apiUrl))
  if (!found) {
    failures.push(
      `"${apiUrl}" does not appear in any emitted bundle.\n` +
        '      Either the API client is not imported by any reachable code (so it was\n' +
        '      tree-shaken away), or the value did not reach Vite at build time.\n' +
        '      A deployed front end that never mentions its API cannot call it.',
    )
  }
}

if (failures.length > 0) {
  console.error(`\n  Build assertions failed (${failures.length}):\n`)
  for (const f of failures) console.error(`    - ${f}\n`)
  process.exit(1)
}

/*
 * A machine-readable stamp the post-deploy smoke test can fetch over HTTP.
 * Reading a commit out of a JavaScript bundle is guesswork; reading it from a
 * fixed URL is not.
 */
writeFileSync(
  path.join(ROOT, 'dist/version.json'),
  JSON.stringify({ commit: process.env.VITE_BUILD_COMMIT ?? 'unknown', apiUrl, builtAt: new Date().toISOString() }, null, 2),
)

console.log(
  `  build assertions passed — VITE_API_URL="${apiUrl}" (from ${source}) present in the bundle (mode: ${mode})`,
)
