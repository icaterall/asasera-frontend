import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { readZip } from '../../asasera-backend/src/lib/zip'
import { io, type Socket } from 'socket.io-client'
import type { Reply } from '../src/shared/session'
import type { LivePresentationCommand } from '../src/shared/live-presentation'

for (const [language, semantics] of [['en', 'scored'], ['ar', 'practice']] as const) for (const ending of ['host', 'disconnect'] as const) {
  test(`owner reads real live response evidence ${language} ${semantics} ${ending}`, async ({ page, request }) => {
    test.setTimeout(120000)
    expect(new URL(process.env.PW_BASE_URL??'').hostname).toMatch(/^(127\.0\.0\.1|localhost)$/)
    const email = `live-report-${crypto.randomUUID()}@example.com`, password = crypto.randomUUID() + 'Aa1!'
    expect((await request.post('/api/v1/auth/register/teacher', { data: { name: 'Synthetic report instructor', email, password } })).ok()).toBe(true)
    const login = await request.post('/api/v1/auth/login', { data: { email, password } }), { accessToken } = await login.json(), headers = { authorization: `Bearer ${accessToken}` }
    const created = await request.post('/api/v1/activities', { headers, data: { title: language === 'ar' ? 'دليل حصة تجريبية' : 'Synthetic live response evidence', subjectId: 1, levelId: 8, purposeId: 2 } }), { activity } = await created.json()
    const questions = []
    for (const prompt of ['Selected but never opened', 'The moon is a star.']) {
      const added = await request.post(`/api/v1/activities/${activity.id}/questions`, { headers, data: { kind: 'tf', prompt, payload: { correct: false }, hint: 'Think about where moonlight comes from.', challenge: true } })
      expect(added.ok()).toBe(true); questions.push((await added.json()).question)
    }
    const published = await request.post(`/api/v1/activities/${activity.id}/publish`, { headers }); expect(published.ok()).toBe(true)
    const { versionId } = await published.json(), sockets: Socket[] = []
    async function connect(token?: string) {
      const socket = io(process.env.PW_BASE_URL!, { transports: ['websocket'], autoConnect: false, reconnection: false, auth: token ? { accessToken: token } : {} }); sockets.push(socket)
      await new Promise<void>((resolve, reject) => { socket.once('connect', resolve); socket.once('connect_error', reject); socket.connect() })
      return socket
    }
    async function ask(socket: Socket, event: string, payload: unknown) {
      const reply: Reply = await socket.timeout(5000).emitWithAck(event, payload)
      if (!reply.ok) throw new Error(`${reply.code}: ${reply.message}`)
      return reply
    }
    try {
      const host = await connect(accessToken)
      const started = await ask(host, 'host:create', { activityId: activity.id, requestId: crypto.randomUUID(), presentation: { selection: { definitionId: 'open-box', definitionVersion: 1, adapterVersion: 1, contentVersionId: versionId, selectedQuestionIds: questions.map(question => question.id), config: { context: 'live', semantics, noRepeat: true, revealPolicy: 'host' } }, rules: { hints: true, extraPracticeAttempt: semantics === 'practice', bonus: { questionIds: [questions[1].id], points: 50 } } } })
      const runId = started.snapshot!.runId, learner = await connect()
      await ask(learner, 'player:join', { pin: started.snapshot!.pin, name: 'Synthetic learner · متعلّم', requestId: crypto.randomUUID() })
      async function command(command: LivePresentationCommand) {
        const current = await ask(host, 'session:sync', {})
        return ask(host, 'host:presentation', { runId, requestId: crypto.randomUUID(), expectedRevision: current.snapshot!.presentation!.revision, command })
      }
      async function answer(choice: string, retry = false) {
        const current = await ask(host, 'session:sync', {})
        return ask(learner, retry ? 'player:retry' : 'player:answer', { runId, requestId: crypto.randomUUID(), qIndex: current.snapshot!.presentation!.active!.qIndex, questionId: questions[1].id, payload: { kind: 'tf', choice } })
      }
      await command({ action: 'select-box', elementId: `question:${questions[0].id}` }); await command({ action: 'skip' })
      await command({ action: 'select-box', elementId: `question:${questions[1].id}` }); await command({ action: 'begin' })
      await command({ action: 'hint' }); await answer('true')
      if (semantics === 'practice') await answer('false', true)
      else {
        const revealed = new Promise<void>(resolve => host.once('answer:reveal', () => resolve()))
        await ask(host, 'host:reveal', { runId, requestId: crypto.randomUUID() }); await revealed
        await command({ action: 'next-pass' }); await command({ action: 'select-box', elementId: `question:${questions[1].id}` }); await command({ action: 'begin' }); await answer('false')
      }
      if (ending === 'host') await ask(host, 'host:end', { runId, requestId: crypto.randomUUID() })
      else {
        host.disconnect()
        // Actual configured 90-second host grace, not a clock mock or database mutation.
        await expect.poll(async () => (await (await request.get(`/api/v1/reports/runs/${runId}`, { headers })).json()).endReason, { timeout: 100000, intervals: [1000] }).toBe('host_disconnected')
      }
      const report = await request.get(`/api/v1/reports/runs/${runId}`, { headers }); expect(report.ok()).toBe(true)
      const evidence = await report.json(); expect(evidence.liveEvidence.semantics).toBe(semantics)
      expect(evidence.questionCount).toBe(1); expect(evidence.questions[0].correct).toBe(0)
      expect(evidence.endReason).toBe(ending === 'host' ? 'host_ended' : 'host_disconnected')
      expect(evidence.participants[0]).toMatchObject({ answered: 1, correctCount: 0, incorrect: 1, unanswered: 0, score: semantics === 'practice' ? null : 0, gamePoints: semantics === 'practice' ? 0 : 150, assistedFirstResponses: 1, repeatResponses: semantics === 'practice' ? 0 : 1, practiceRetries: semantics === 'practice' ? 1 : 0 })
      await page.context().addCookies((await request.storageState()).cookies)
      await page.addInitScript(lang => localStorage.setItem('asasera.language', lang), language)
      await page.setViewportSize(language === 'ar' ? { width: 390, height: 844 } : { width: 1440, height: 900 })
      const errors: string[] = []; page.on('pageerror', error => errors.push(error.message))
      await page.goto(`/teacher/reports/runs/${runId}`)
      await expect(page.getByRole('table', { name: language === 'ar' ? 'دليل الإجابات الأولى' : 'First-response evidence' })).toBeVisible()
      await expect(page.getByRole('checkbox', { name: language === 'ar' ? 'اختر السؤال 1 للتدريب' : 'Select question 1 for practice' })).toHaveCount(0)
      await expect(page.getByText(language === 'ar' ? 'لم يُفتح — لا فرصة للإجابة' : 'Not opened — no response opportunity', { exact: true })).toBeVisible()
      await expect(page.getByText(ending === 'host' ? language === 'ar' ? 'نهاية الحصة: أنهاها المعلّم.' : 'Run ending: Ended by the teacher.' : language === 'ar' ? 'نهاية الحصة: انقطع اتصال المعلّم وانتهت مهلة العودة. الإجابات المحفوظة باقية.' : 'Run ending: The teacher disconnected and the return window expired. Saved responses are retained.', { exact: true })).toBeVisible()
      const first = page.getByRole('table', { name: language === 'ar' ? 'دليل الإجابات الأولى' : 'First-response evidence' }).getByRole('row').nth(1)
      await expect(first.getByRole('cell')).toHaveText(language === 'ar' ? ['1 من 1', '0 من 1', '0'] : ['1 of 1', '0 of 1', '0'])
      const separate = page.getByRole('table', { name: language === 'ar' ? 'التكرار والمساعدة في التدريب' : 'Repeat practice and assistance' }).getByRole('row').nth(1)
      await expect(separate.getByRole('cell')).toHaveText(language === 'ar' ? ['0', '1', '1', '0'] : ['1', '1', '0', '150'])
      const downloading = page.waitForEvent('download')
      await page.getByRole('button', { name: language === 'ar' ? 'تصدير CSV' : 'Export CSV', exact: true }).click()
      const download = await downloading, path = await download.path(); expect(path).not.toBeNull()
      const csv = await readFile(path!, 'utf8')
      // Each public CSV field is quoted; this fixture contains no embedded newlines.
      const rows = csv.replace(/^\uFEFF/, '').split('\r\n').filter(Boolean).map(line => [...line.matchAll(/"((?:[^"]|"")*)"/g)].map(match => match[1].replaceAll('""', '"')))
      const row = Object.fromEntries(rows[0].map((header, index) => [header, rows[1][index]]))
      const arExport = language === 'ar'
      expect(row[arExport ? 'الإجابات الأولى' : 'First responses']).toBe('1')
      expect(row[arExport ? 'الإجابات الأولى الصحيحة' : 'Correct first responses']).toBe('0')
      expect(row[arExport ? 'الإجابات الأولى غير الصحيحة' : 'Incorrect first responses']).toBe('1')
      expect(row[arExport ? 'نقاط اللعب' : 'Game points']).toBe(semantics === 'practice' ? '0' : '150')
      expect(row[arExport ? 'إجابات أولى بمساعدة' : 'Assisted first responses']).toBe('1')
      expect(row[arExport ? 'محاولات تدريب إضافية' : 'Extra practice attempts']).toBe(semantics === 'practice' ? '1' : '0')
      expect(row[arExport ? 'إجابات الجولات المتكررة' : 'Repeat responses']).toBe(semantics === 'practice' ? '0' : '1')
      expect(row[arExport ? 'النقاط' : 'Score']).toBe(semantics === 'practice' ? undefined : '0')
      expect(row[arExport ? 'رمز سبب النهاية المسجّل' : 'Recorded ending code']).toBe(evidence.endReason)
      expect(csv).toContain(arExport ? 'سجل عرض الأسئلة' : 'Question delivery history')
      expect(csv).toContain(arExport ? 'لم يُفتح — لا فرصة للإجابة' : 'Not opened — no response opportunity')
      const historyIndex = rows.findIndex(row => row[0] === (arExport ? 'سجل عرض الأسئلة' : 'Question delivery history'))
      expect(rows.slice(historyIndex + 1).map(row => [row[0], row[1], row[2], row[7], row[8], row[10], row[11], row[12]])).toEqual(evidence.liveEvidence.occurrences.map((occurrence: { index: number; canonicalIndex: number; pass: number; firstResponses: number; repeatResponses: number; assistedFirstResponses: number; practiceRetries: number; gamePoints: number }) => [occurrence.index + 1, occurrence.canonicalIndex + 1, occurrence.pass, occurrence.firstResponses, occurrence.repeatResponses, occurrence.assistedFirstResponses, occurrence.practiceRetries, occurrence.gamePoints].map(String)))
      const workbookDownload = page.waitForEvent('download')
      await page.getByRole('button', { name: language === 'ar' ? 'تصدير XLSX' : 'Export XLSX', exact: true }).click()
      const workbook = await workbookDownload, workbookPath = await workbook.path(); expect(workbookPath).not.toBeNull()
      const sheets = readZip(await readFile(workbookPath!)).filter(entry => /^xl\/worksheets\/sheet\d+\.xml$/.test(entry.name)).map(entry => entry.read().toString('utf8'))
      expect(sheets).toHaveLength(4); expect(sheets[3]).toContain(arExport ? 'سجل عرض الأسئلة' : 'Question delivery history')
      expect(sheets[2]).toContain(evidence.endReason)
      const foreignEmail = `foreign-report-${crypto.randomUUID()}@example.com`
      expect((await request.post('/api/v1/auth/register/teacher', { data: { name: 'Foreign synthetic instructor', email: foreignEmail, password } })).ok()).toBe(true)
      const foreignLogin = await request.post('/api/v1/auth/login', { data: { email: foreignEmail, password } })
      const foreignHeaders = { authorization: `Bearer ${(await foreignLogin.json()).accessToken}` }
      for (const suffix of ['', '/export.csv?sheet=all', '/export.xlsx']) expect((await request.get(`/api/v1/reports/runs/${runId}${suffix}`, { headers: foreignHeaders })).status()).toBe(404)
      await page.evaluate(async () => { await document.fonts.ready; scrollTo(0, 0) })
      await page.screenshot({ path: `../docs/evidence/interactive/live-response-report-${language}${ending === 'disconnect' ? '-interrupted' : ''}.png`, fullPage: true })
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      expect(errors).toEqual([])
    } finally { sockets.forEach(socket => socket.disconnect()) }
  })
}
