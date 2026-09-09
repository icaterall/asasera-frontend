import assert from 'node:assert/strict'
import { test } from 'node:test'
import { unitLabel } from '../src/features/shelf/unitLabel.ts'

test('English unit labels never fall back to an untranslated Arabic title', () => {
  assert.equal(unitLabel({ titleAr: 'الوحدة الأولى — الكسور', titleEn: null, unitOrder: 1 }, 'en'), 'Unit 1')
  assert.equal(unitLabel({ titleAr: 'الكسور', titleEn: '  ', unitOrder: 2 }, 'en-US'), 'Unit 2')
})
test('available translations remain intact in the selected language', () => {
  const unit = { titleAr: 'الكسور', titleEn: 'Fractions', unitOrder: 1 }
  assert.equal(unitLabel(unit, 'en'), 'Fractions')
  assert.equal(unitLabel(unit, 'ar-OM'), 'الكسور')
  assert.equal(unitLabel({ ...unit, titleAr: null }, 'ar'), 'الوحدة 1')
})
