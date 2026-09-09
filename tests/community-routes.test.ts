import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const config = readFileSync(new URL('../nginx.conf', import.meta.url), 'utf8')
const route = config.match(/location ~ (\^\S+) \{/)
assert.ok(route, 'The deployed server must explicitly allow registered SPA routes')
const matcher = new RegExp(route[1]!)

test('direct share, feedback, discovery and authoring links reach the application', () => {
  for (const path of ['/activities/123', '/teacher/feedback', '/teacher/discover', '/teacher/activities/new', '/teacher/activities/123', '/teacher/activities/123/play', '/register', '/auth/callback', '/student/activities']) assert.equal(matcher.test(path), true, path)
})
test('the share route cannot make API, asset or arbitrary paths return the SPA', () => {
  for (const path of ['/activities/private-secret', '/api/v1/community/activities/123', '/assets/missing.js', '/unknown', '/teacher/feedback/private', '/activities/123/private']) assert.equal(matcher.test(path), false, path)
})
