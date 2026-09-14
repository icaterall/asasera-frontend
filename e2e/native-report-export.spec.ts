import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { readZip } from '../../asasera-backend/src/lib/zip'

test.use({ trace: 'off' })

for (const language of ['en', 'ar'] as const) test(`same pinned dataset keeps native responses and self-ratings separate in report and exports ${language}`, async ({ page, request }) => {
  expect(new URL(process.env.PW_BASE_URL??'').hostname).toMatch(/^(127\.0\.0\.1|localhost)$/)
  const ar = language === 'ar', email = `native-report-${crypto.randomUUID()}@example.com`, password = crypto.randomUUID() + 'Aa1!'
  expect((await request.post('/api/v1/auth/register/teacher', { data: { name: 'Synthetic report instructor', email, password } })).ok()).toBe(true)
  const login = await request.post('/api/v1/auth/login', { data: { email, password } })
  const headers = { authorization: `Bearer ${(await login.json()).accessToken}` }
  const created = await request.post('/api/v1/activities', { headers, data: { title: ar ? 'تقرير الإجابة والتقييم الذاتي' : 'Native response and self-rating report', subjectId: 1, levelId: 8, purposeId: 2 } })
  expect(created.ok()).toBe(true); const { activity } = await created.json()
  const alternative = ar ? 'النهار' : 'daytime'
  const added = await request.post(`/api/v1/activities/${activity.id}/questions`, { headers, data: { kind: 'cloze', prompt: ar ? 'أكمل العبارة.' : 'Complete the sentence.', payload: { schemaVersion: 1, segments: [{ kind: 'text', text: ar ? 'نبدأ في ' : 'We begin in the ' }, { kind: 'blank', blankId: 'time' }], blanks: [{ id: 'time', acceptedAnswers: [ar ? 'الصباح' : 'morning', alternative] }], policy: { version: 1, language, diacritics: 'preserve', tatweel: 'preserve', case: 'preserve', spaces: 'preserve' }, trimBoundaryWhitespace: true } } })
  expect(added.ok()).toBe(true); const { question } = await added.json()
  const flashAdded = await request.post(`/api/v1/activities/${activity.id}/questions`, { headers, data: { kind: 'tf', prompt: ar ? 'نبدأ الدراسة في الصباح.' : 'We begin studying in the morning.', payload: { correct: true } } })
  expect(flashAdded.ok()).toBe(true); const flashQuestion = (await flashAdded.json()).question
  const published = await request.post(`/api/v1/activities/${activity.id}/publish`, { headers }); expect(published.ok()).toBe(true)
  const { versionId } = await published.json()
  await page.context().addCookies((await request.storageState()).cookies)
  await page.addInitScript(lang => localStorage.setItem('asasera.language', lang), language)
  await page.setViewportSize(ar ? { width: 390, height: 844 } : { width: 1440, height: 900 })
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message))
  for (const selfRated of [false, true]) {
    const selectedId = selfRated ? flashQuestion.id : question.id
    const create = await request.post('/api/v1/delivery/assignments', { headers, data: { activityId: activity.id, mode: 'study', feedback: 'immediate', deadline: new Date(Date.now() + 3600000).toISOString(), requestId: crypto.randomUUID(), presentation: { definitionId: selfRated ? 'flashcards' : 'sentence-completion', definitionVersion: 1, adapterVersion: 1, contentVersionId: versionId, selectedQuestionIds: [selectedId], config: { context: 'practice', semantics: selfRated ? 'self-rated' : 'scored', noRepeat: true, revealPolicy: selfRated ? 'on-request' : 'after-answer' } } } })
    expect(create.ok(), await create.text()).toBe(true); const assignment = await create.json()
    for (const correct of [true, false]) {
      const name = correct ? '=1+1' : ar ? 'متعلم تجريبي' : 'Synthetic wrong learner'
      const join = await request.post(`/api/v1/delivery/assignments/${assignment.id}/join`, { data: { accessToken: assignment.accessToken, name, requestId: crypto.randomUUID() } }); expect(join.ok()).toBe(true)
      const { attemptId, token } = await join.json(), path = `/api/v1/delivery/attempts/${attemptId}`
      const command = async (action: string, expectedRevision: number, extra = {}) => {
        const result = await request.post(`${path}/presentation`, { data: { token, requestId: crypto.randomUUID(), action, expectedRevision, ...extra } })
        expect(result.ok()).toBe(true); return result.json()
      }
      const drawn = await command('draw', 0)
      if (selfRated) { await command('flip', 1); await command('rate', 2, { rating: correct ? 'known' : 'again' }); await command('draw', 3) }
      else {
        const blank = drawn.question.payload.segments.find((segment: { kind: string }) => segment.kind === 'blank')
        const entered = ` ${correct ? alternative : ar ? 'المساء' : 'evening'} `
        const answered = await request.post(`${path}/answer`, { data: { token, position: 0, questionId: question.id, answer: { kind: 'cloze', values: { [blank.blankId]: entered } } } })
        expect(answered.ok()).toBe(true); const saved = await answered.json()
        expect(saved.submittedAnswer.values[blank.blankId]).toBe(entered); expect(saved.reveal.wasCorrect).toBe(correct)
        // A changed retry cannot replace the first saved native response.
        expect((await request.post(`${path}/answer`, { data: { token, position: 0, questionId: question.id, answer: { kind: 'cloze', values: { [blank.blankId]: alternative } } } })).ok()).toBe(true)
        const done = await command('draw', 1); expect(done.review[0].submittedAnswer.values[blank.blankId]).toBe(entered)
      }
    }
    const listing = await request.get('/api/v1/delivery/assignments', { headers })
    const runId = (await listing.json()).assignments.find((item: { id: string }) => item.id === assignment.id).runId
    const fetched = await request.get(`/api/v1/reports/runs/${runId}`, { headers }); expect(fetched.ok()).toBe(true)
    const report = await fetched.json()
    expect(report.presentation.contentVersionId).toBe(versionId); expect(report.presentation.selectedQuestionIds).toEqual([selectedId])
    expect(report.questionCount).toBe(1); expect(report.participantCount).toBe(2)
    expect(report.participation.submitted).toBe(2)
    expect(report.outcomeKind).toBe(selfRated ? 'self-rated-practice' : 'scored-responses')
    const first = report.participants.find((person: { name: string }) => person.name === '=1+1')
    const second = report.participants.find((person: { name: string }) => person.name !== '=1+1')
    if (selfRated) {
      expect(first).toMatchObject({ score: null, correctCount: null, incorrect: null, unanswered: null, answered: 0 })
      expect(first.practice).toMatchObject({ rated: 1, known: 1, again: 0 }); expect(second.practice).toMatchObject({ rated: 1, known: 0, again: 1 })
      expect(report.questions[0].correctPercent).toBeNull()
    } else {
      expect(first).toMatchObject({ answered: 1, correctCount: 1, incorrect: 0, unanswered: 0 })
      expect(second).toMatchObject({ answered: 1, correctCount: 0, incorrect: 1, unanswered: 0, score: 0 })
      expect(report.questions[0]).toMatchObject({ answered: 2, correct: 1, incorrect: 1, correctPercent: 50 })
    }
    await page.goto(`/teacher/reports/runs/${runId}`)
    const table = selfRated ? page.getByRole('table', { name: ar ? 'تقدّم مراجعة المشاركين' : 'Participant practice progress' }) : page.getByRole('table')
    const visibleFirst = table.getByRole('row').filter({ has: page.getByRole('rowheader').filter({ hasText: '=1+1' }) })
    const visibleSecond = table.getByRole('row').filter({ has: page.getByRole('rowheader').filter({ hasText: ar ? 'متعلم تجريبي' : 'Synthetic wrong learner' }) })
    await expect(visibleFirst.getByRole('cell')).toHaveText(selfRated ? [ar ? '1 من 1' : '1 of 1', ar ? '1 من 1' : '1 of 1', '0', '0', '1', '0'] : [ar ? '1 من 1' : '1 of 1', '1', '0', '0'])
    await expect(visibleSecond.getByRole('cell')).toHaveText(selfRated ? [ar ? '1 من 1' : '1 of 1', ar ? '1 من 1' : '1 of 1', '1', '0', '0', '0'] : [ar ? '1 من 1' : '1 of 1', '0', '1', '0'])
    for (const format of ['csv', 'xlsx']) {
      const downloading = page.waitForEvent('download'); await page.getByRole('button', { name: ar ? `تصدير ${format.toUpperCase()}` : `Export ${format.toUpperCase()}`, exact: true }).click()
      const download = await downloading, file = await download.path(); expect(file).not.toBeNull()
      const bytes = await readFile(file!)
      if (format === 'csv') {
        expect([...bytes.subarray(0, 3)]).toEqual([0xef, 0xbb, 0xbf])
        const rows = bytes.toString('utf8').replace(/^\uFEFF/, '').split('\r\n').filter(Boolean).map(line => [...line.matchAll(/"((?:[^"]|"")*)"/g)].map(match => match[1].replaceAll('""', '"')))
        const records = rows.slice(1).map(row => Object.fromEntries(rows[0].map((header, index) => [header, row[index]])))
        const exportedFirst = records.find(row => row[ar ? 'الاسم' : 'Name'] === "'=1+1")!
        const exportedSecond = records.find(row => row[ar ? 'الاسم' : 'Name'] === (ar ? 'متعلم تجريبي' : 'Synthetic wrong learner'))!
        expect(exportedFirst).toBeTruthy()
        if (selfRated) {
          expect(exportedFirst[ar ? 'قيّم' : 'Rated']).toBe('1'); expect(exportedFirst[ar ? 'أعرفها الآن (تقييم ذاتي)' : 'Ready for now (self-rated)']).toBe('1')
          expect(exportedFirst[ar ? 'صحيح' : 'Correct']).toBeUndefined(); expect(exportedFirst[ar ? 'النقاط' : 'Score']).toBeUndefined()
          expect(exportedSecond[ar ? 'أراجعها مرة أخرى (تقييم ذاتي)' : 'Review again (self-rated)']).toBe('1')
        } else {
          expect(exportedFirst[ar ? 'صحيح' : 'Correct']).toBe('1'); expect(exportedFirst[ar ? 'أجاب' : 'Answered']).toBe('1')
          expect(exportedFirst[ar ? 'نقاط اللعب' : 'Game points']).toBe(String(first.gamePoints))
          expect(exportedSecond[ar ? 'صحيح' : 'Correct']).toBe('0'); expect(exportedSecond[ar ? 'غير صحيح' : 'Incorrect']).toBe('1'); expect(exportedSecond[ar ? 'النقاط' : 'Score']).toBe('0')
        }
      } else {
        const sheets = readZip(bytes).filter(entry => /^xl\/worksheets\/sheet\d+\.xml$/.test(entry.name)).map(entry => entry.read().toString('utf8'))
        expect(sheets).toHaveLength(3); expect(sheets[0]).toContain("<t>'=1+1</t>"); expect(sheets.join('')).not.toContain('<f>')
        if (ar) expect(sheets[0]).toContain('rightToLeft="1"')
        expect(sheets[2]).toContain(ar ? 'نسخة المحتوى المعتمدة' : 'Approved content version')
        if (selfRated) expect(sheets[0]).toContain(ar ? 'تدريب بتقييم ذاتي — وليس درجة' : 'Self-rated practice — not a grade')
        const workbookRows = await page.evaluate(xml => [...new DOMParser().parseFromString(xml, 'application/xml').querySelectorAll('row')].map(row => [...row.querySelectorAll('c')].map(cell => cell.querySelector('t, v')?.textContent ?? '')), sheets[0])
        const workbookRecords = workbookRows.slice(1).map(row => Object.fromEntries(workbookRows[0].map((header, index) => [header, row[index]])))
        const workbookFirst = workbookRecords.find(row => row[ar ? 'الاسم' : 'Name'] === "'=1+1")!, workbookSecond = workbookRecords.find(row => row[ar ? 'الاسم' : 'Name'] === (ar ? 'متعلم تجريبي' : 'Synthetic wrong learner'))!
        expect(workbookFirst[ar ? selfRated ? 'أعرفها الآن (تقييم ذاتي)' : 'صحيح' : selfRated ? 'Ready for now (self-rated)' : 'Correct']).toBe('1')
        expect(workbookSecond[ar ? selfRated ? 'أراجعها مرة أخرى (تقييم ذاتي)' : 'غير صحيح' : selfRated ? 'Review again (self-rated)' : 'Incorrect']).toBe('1')
        expect(workbookSecond[ar ? 'النقاط' : 'Score']).toBe(selfRated ? undefined : '0')
      }
    }
    await page.evaluate(async () => { await document.fonts.ready; scrollTo({ top: 0, behavior: 'instant' }) })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.screenshot({ path: `../docs/evidence/interactive/native-report-export-${language}-${selfRated ? 'self-rated' : 'scored'}.png`, fullPage: true })
  }
  expect(errors).toEqual([])
})
