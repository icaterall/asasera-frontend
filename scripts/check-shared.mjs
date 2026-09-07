#!/usr/bin/env node
/**
 * Guards `src/shared/` — the generated mirror of
 * `asasera-backend/packages/shared/src`.
 *
 * Two checks, because this repository usually cannot see the other one in CI:
 *
 * 1. ALWAYS: every mirrored file still carries its generated banner. That is
 *    what catches the realistic failure — somebody fixes a type here because
 *    it is the file the error pointed at, and the fix is silently reverted by
 *    the next sync. A hand-edit removes or displaces the banner.
 *
 * 2. WHEN THE BACKEND IS CHECKED OUT: a byte comparison against the source.
 *
 * See asasera-backend/docs/implementation/decisions-v4.md D-V4-001.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

const MIRROR = path.resolve('src/shared')
const SOURCE = path.resolve('..', 'asasera-backend', 'packages', 'shared', 'src')

if (!existsSync(MIRROR)) {
  console.error(`No shared mirror at ${MIRROR}. Run \`npm run sync:shared\` in asasera-backend.`)
  process.exit(1)
}

const files = readdirSync(MIRROR).filter((f) => f.endsWith('.ts')).sort()
const problems = []

if (files.length === 0) problems.push('the mirror is empty')

for (const file of files) {
  const body = readFileSync(path.join(MIRROR, file), 'utf8')
  if (!body.startsWith('/*\n * GENERATED FILE — DO NOT EDIT.')) {
    problems.push(`${file}: the generated banner is missing or displaced — this file was hand-edited`)
  }
}

let compared = false
if (existsSync(SOURCE)) {
  compared = true
  const sourceFiles = readdirSync(SOURCE).filter((f) => f.endsWith('.ts')).sort()
  for (const extra of files) {
    if (!sourceFiles.includes(extra)) problems.push(`${extra}: in the mirror but not in the source`)
  }
  for (const file of sourceFiles) {
    if (!files.includes(file)) { problems.push(`${file}: missing from the mirror`); continue }
    const source = readFileSync(path.join(SOURCE, file), 'utf8')
    const mirrored = readFileSync(path.join(MIRROR, file), 'utf8')
    // The mirror is the source with a banner prepended, nothing else.
    if (!mirrored.endsWith(source)) problems.push(`${file}: mirror content differs from the source`)
  }
}

if (problems.length > 0) {
  console.error('SHARED CONTRACT DRIFT:\n' + problems.map((p) => `  - ${p}`).join('\n'))
  console.error('\n  Edit asasera-backend/packages/shared/src, then run `npm run sync:shared` there.')
  process.exit(1)
}

console.log(
  `Shared contract OK (${files.length} files, ` +
    `${compared ? 'compared against the source' : 'banner check only — backend not checked out'}).`,
)
