import assert from 'node:assert/strict'
import { test } from 'node:test'
import { compactCredits } from '../src/lib/credits.ts'

/* Intl separates the number from its word with a non-breaking space. */
const shown = (value: number, locale?: string) =>
  compactCredits(value, locale).replace(/ /g, ' ')

test('English shortens with K and M', () => {
  assert.equal(shown(30_122_913), '30.1M')
  assert.equal(shown(122_913), '122K')
  assert.equal(shown(1_234), '1.2K')
  assert.equal(shown(842), '842')
  assert.equal(shown(0), '0')
})

test('Arabic uses its own words, with the plural agreement Arabic needs', () => {
  assert.equal(shown(30_122_913, 'ar'), '30.1 مليون')
  assert.equal(shown(999_999, 'ar'), '999 ألف')
  assert.equal(shown(1_234, 'ar'), '1.2 ألف')
  /* 3 to 10 takes the broken plural: آلاف, not ألف. */
  assert.equal(shown(5_000, 'ar'), '5 آلاف')
})

test('Arabic keeps Western digits', () => {
  assert.match(shown(842, 'ar'), /^\d+$/)
  assert.match(shown(30_122_913, 'ar'), /^30\.1 /)
})

test('never shows more credit than the teacher has', () => {
  /* Intl's compact notation rounds this to "1M" on its own. A balance that
     reads larger than it is would send a teacher into a generation they
     cannot afford. */
  assert.equal(shown(999_999), '999K')
  assert.equal(shown(1_999), '1.9K')
  assert.equal(shown(9_999_999), '9.9M')
})

test('a whole number carries no trailing zero', () => {
  assert.equal(shown(30_000_000), '30M')
  assert.equal(shown(5_000), '5K')
})
