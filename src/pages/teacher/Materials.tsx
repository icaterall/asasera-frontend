import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { MaterialArt } from '@/components/teacher/DashboardArt'
import { SectionHeader } from '@/components/teacher/DashboardCards'
import { Link } from 'react-router-dom'

import {
  ConfirmDialog,
  EmptyState,
  Field,
  PrimaryButton,
  QuietButton,
  SectionError,
  SourceSegments,
  StatusPill,
  inputClass,
} from '@/components/teaching/TeachingUI'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { teaching, type Material, type MaterialLimits } from '@/lib/api'

/**
 * The teacher's own materials: PDF, DOCX, PPTX and pasted text (v5 §12).
 *
 * THE LIMITS ARE SHOWN BEFORE THE UPLOAD, read from the server so the number
 * on screen is the number the server enforces. A teacher should not learn the
 * size cap by failing a two-minute upload.
 *
 * EXTRACTION IS A STATE MACHINE the page follows honestly: processing → ready
 * or failed. While anything is processing the list polls every two seconds; a
 * refresh does not lose the job because the state lives on the server.
 *
 * A FAILED EXTRACTION IS A FIRST-CLASS STATE, not an error toast. The file is
 * kept, the reason is named in the teacher's language, and the recovery — paste
 * the pages you need — is offered right there. Nothing is invented for a page
 * this reader could not open, and pages it could not read are counted out loud.
 */
const FALLBACK_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
}
const extensionOf = (name: string) => name.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1] ?? ''

export default function TeacherMaterials() {
  const { t, i18n } = useTranslation()
  const ar = i18n.language.startsWith('ar')
  const toMessage = useApiErrorMessage()
  useDocumentTitle(t('teaching.materials.title'))

  const [materials, setMaterials] = useState<Material[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [limits, setLimits] = useState<MaterialLimits | null>(null)
  const [mode, setMode] = useState<'none' | 'file' | 'text'>('none')
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [detail, setDetail] = useState<Material | null>(null)

  /* Deletion. `deleting` is the id of the request in flight, which is also the
     duplicate-submit guard: a second click on the same card is ignored while
     the first is unanswered, and other cards stay usable. */
  const [confirming, setConfirming] = useState<Material | null>(null)
  const [deleting, setDeleting] = useState<number | null>(null)
  /* Separate from formError, which is rendered inside the upload form and is
     therefore invisible when that form is closed — a delete that failed would
     have reported nothing at all. */
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [outcome, setOutcome] = useState<{
    kind: 'deleted' | 'blocked'
    queued: number
    retained: number
    unmanaged: number
  } | null>(null)
  const [cleanup, setCleanup] = useState<{ pendingCount: number; failedCount: number } | null>(null)

  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const acceptedKinds = limits?.acceptedKinds ?? (['pdf', 'docx', 'pptx'] as const)
  const acceptedTypes = limits?.acceptedContentTypes ?? FALLBACK_TYPES
  const accept = [...acceptedKinds.map((kind) => `.${kind}`), ...Object.values(acceptedTypes)].join(',')
  const formats = acceptedKinds.map((kind) => kind.toUpperCase()).join(', ')

  const load = useCallback(async () => {
    try {
      const { materials: rows } = await teaching.materials({ limit: 50 })
      setMaterials(rows)
      setFailed(false)
    } catch {
      setFailed(true)
    }
  }, [])

  const loadCleanup = useCallback(async () => {
    try {
      setCleanup(await teaching.cleanupStatus())
    } catch {
      /* A failed poll is not worth a message. The next one may succeed, and a
         cleanup banner that turns into an error banner is noise. */
    }
  }, [])

  useEffect(() => {
    void load()
    /* Read on load, not only after a delete, so "still erasing" survives a
       refresh rather than disappearing with the response that reported it. */
    void loadCleanup()
    /* Limits are advisory on the client and authoritative on the server; a
       failure here just means the hint line is not shown. */
    teaching.limits().then(setLimits).catch(() => {})
  }, [load, loadCleanup])

  /* Extraction in progress: poll every two seconds until no row is running. */
  const processing = materials?.some((material) => material.extractionStatus === 'running') ?? false
  useEffect(() => {
    if (!processing) return
    const timer = setInterval(() => void load(), 2000)
    return () => clearInterval(timer)
  }, [processing, load])

  /*
   * Poll only while something is actually pending, and not forever.
   *
   * Twenty checks at three seconds is a minute of watching, which is far longer
   * than a healthy queue takes. Past that the banner stays — the work is still
   * owed and saying otherwise would be a lie — but the page stops asking, so a
   * stuck queue cannot turn every open tab into a permanent poller.
   */
  useEffect(() => {
    if (!cleanup || cleanup.pendingCount === 0) return
    let attempts = 0
    const timer = setInterval(() => {
      attempts += 1
      if (attempts > 20) {
        clearInterval(timer)
        return
      }
      void loadCleanup()
    }, 3000)
    return () => clearInterval(timer)
  }, [cleanup, loadCleanup])

  async function confirmDelete() {
    const target = confirming
    if (!target || deleting !== null) return
    setDeleteError(null)
    setDeleting(target.id)
    try {
      const result = await teaching.deleteMaterial(target.id)
      setConfirming(null)
      setOutcome({
        kind: 'deleted',
        queued: result.filesQueuedForDeletion,
        retained: result.filesRetained,
        unmanaged: result.unmanagedFiles,
      })
      if (expanded === target.id) setExpanded(null)
      await load()
      await loadCleanup()
    } catch (error) {
      const code = (error as { code?: string })?.code
      if (code === 'material_in_published_version') {
        /* Refused, and the message says so. Reporting this as a successful
           deletion with files retained would be the wrong story entirely:
           nothing was deleted. */
        setConfirming(null)
        setOutcome({ kind: 'blocked', queued: 0, retained: 0, unmanaged: 0 })
      } else {
        setDeleteError(toMessage(error))
        setConfirming(null)
      }
    } finally {
      setDeleting(null)
    }
  }

  useEffect(() => {
    let live = true
    if (expanded === null) {
      /* Deferred so the collapse is not a synchronous setState inside the
         effect that observed it. */
      queueMicrotask(() => {
        if (live) setDetail(null)
      })
      return () => {
        live = false
      }
    }
    teaching
      .material(expanded)
      .then(({ material }) => {
        if (live) setDetail(material)
      })
      .catch(() => {})
    return () => {
      live = false
    }
  }, [expanded])

  /**
   * Checked here for a fast, clear message; the server checks the bytes again
   * and its answer is the one that counts. Extension AND declared type: a
   * `.pdf` that the browser says is a spreadsheet is refused before upload.
   */
  function validateFile(candidate: File): { contentType: string } | { error: string } {
    const extension = extensionOf(candidate.name)
    if (!(acceptedKinds as readonly string[]).includes(extension)) return { error: t('teaching.materials.unsupportedFile', { formats }) }
    const expected = acceptedTypes[extension] ?? FALLBACK_TYPES[extension]!
    const declared = candidate.type.trim().toLowerCase()
    if (declared && declared !== 'application/octet-stream' && declared !== expected) return { error: t('teaching.materials.mismatchedFile', { formats }) }
    if (limits && candidate.size > limits.maxBytes) return { error: t('teaching.materials.tooLarge') }
    return { contentType: expected }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setFormError(null)
    try {
      if (mode === 'text') {
        await teaching.createTextMaterial({ title: title.trim(), text })
      } else if (file) {
        const checked = validateFile(file)
        if ('error' in checked) {
          setFormError(checked.error)
          return
        }
        await teaching.uploadFile(title.trim(), file.name, checked.contentType, file)
      }
      setTitle('')
      setText('')
      setFile(null)
      setMode('none')
      await load()
    } catch (cause) {
      setFormError(toMessage(cause))
    } finally {
      setBusy(false)
    }
  }

  const failureText = (reason: string | null) =>
    reason === 'no_text'
      ? t('teaching.materials.failedNoText')
      : reason === 'encrypted'
        ? t('teaching.materials.failedEncrypted')
        : reason === 'too_large'
          ? t('teaching.materials.failedTooLarge')
          : reason === 'unsupported' || reason === 'not_a_pdf'
            ? t('teaching.materials.failedUnsupported', { formats })
            : reason === 'timeout'
              ? t('teaching.materials.failedTimeout')
              : reason === 'no_pages'
                ? t('teaching.materials.failedNoPages')
                : t('teaching.materials.failedCorrupt')

  const unitLabel = (material: Material) => {
    const count = material.pageCount ?? 0
    if (material.sourceKind === 'pdf') return t('teaching.materials.pages', { count })
    if (material.sourceKind === 'pptx') return t('teaching.materials.slides', { count })
    return t('teaching.materials.paragraphs', { count })
  }

  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-5" dir={ar ? 'rtl' : 'ltr'}>
      <SectionHeader
        level={1}
        title={t('teaching.materials.title')}
        lead={t('teaching.materials.lead')}
        action={
          mode === 'none' ? (
            <div className="flex shrink-0 gap-2">
              <PrimaryButton onClick={() => setMode('file')}>
                {t('teaching.materials.addFile')}
              </PrimaryButton>
              <QuietButton onClick={() => setMode('text')}>
                {t('teaching.materials.addText')}
              </QuietButton>
            </div>
          ) : undefined
        }
      />

      {/* The server's limits, before the teacher chooses a file (v5 §12). */}
      <p className="text-sm text-muted" role="note">
        {limits
          ? t('teaching.materials.limits', {
              mb: Math.round(limits.maxBytes / (1024 * 1024)),
              formats,
              chars: limits.maxPastedChars.toLocaleString(ar ? 'ar' : 'en'),
            })
          : t('teaching.materials.limitsLoading', { formats })}
      </p>

      {mode !== 'none' ? (
        <form onSubmit={submit} className="flex flex-col gap-4 rounded-sm border border-line bg-surface p-5">
          {/* The error belongs to the control that produced it. `formError` is set by
              validateFile (wrong extension, wrong declared type, too many bytes) and by
              the upload/paste request — never by the title — so it is rendered under the
              file or text field. Bound to the title it read "this name is invalid" to a
              screen reader while the file below it was the thing at fault. */}
          <Field label={t('teaching.materials.fieldTitle')} htmlFor="material-title">
            <input
              id="material-title"
              className={inputClass}
              value={title}
              required
              maxLength={300}
              dir="auto"
              onChange={(event) => setTitle(event.target.value)}
            />
          </Field>

          {mode === 'text' ? (
            <Field label={t('teaching.materials.fieldText')} htmlFor="material-text" error={formError}>
              <textarea
                id="material-text"
                className={`${inputClass} min-h-[180px] font-normal`}
                value={text}
                required
                dir="auto"
                maxLength={limits?.maxPastedChars ?? 200_000}
                onChange={(event) => setText(event.target.value)}
              />
            </Field>
          ) : (
            <Field label={t('teaching.materials.fieldFile', { formats })} htmlFor="material-file" error={formError}>
              <input
                id="material-file"
                type="file"
                accept={accept}
                required
                className={inputClass}
                onChange={(event) => {
                  const chosen = event.target.files?.[0] ?? null
                  setFile(chosen)
                  if (chosen) {
                    const checked = validateFile(chosen)
                    setFormError('error' in checked ? checked.error : null)
                  }
                }}
              />
            </Field>
          )}

          <div className="flex gap-2">
            <PrimaryButton type="submit" disabled={busy || title.trim().length === 0 || (mode === 'file' && (!file || formError !== null))}>
              {busy ? t('teaching.materials.uploading') : t('teaching.common.create')}
            </PrimaryButton>
            <QuietButton type="button" onClick={() => { setMode('none'); setFormError(null) }}>
              {t('teaching.common.cancel')}
            </QuietButton>
          </div>
        </form>
      ) : null}

      {/*
        What the server actually did, in the teacher's terms.

        The three cases are kept apart deliberately. "Removed, files being
        erased" is not "permanently deleted", and a refusal is not a deletion
        with files retained — collapsing any pair of them would tell the teacher
        something untrue about their own content.
      */}
      {deleteError ? (
        <div
          role="alert"
          className="mb-4 rounded-sm border p-3"
          style={{
            borderColor: 'color-mix(in oklab, var(--tc-coral) 45%, transparent)',
            background: 'color-mix(in oklab, var(--tc-coral) 6%, transparent)',
          }}
        >
          <p className="text-sm text-fg">{deleteError}</p>
        </div>
      ) : null}

      {outcome?.kind === 'deleted' ? (
        <div
          role="status"
          className="mb-4 rounded-sm border p-3"
          style={{
            borderColor: 'color-mix(in oklab, var(--tc-teal) 40%, transparent)',
            background: 'color-mix(in oklab, var(--tc-teal) 8%, transparent)',
          }}
        >
          <p className="text-sm font-semibold text-fg">
            {outcome.queued > 0
              ? t('teaching.materials.deletedCleanupPending')
              : t('teaching.materials.deleted')}
          </p>
          {outcome.retained > 0 ? (
            <p className="mt-1 text-sm text-muted">
              {t('teaching.materials.deletedRetained', { count: outcome.retained })}
            </p>
          ) : null}
          {outcome.unmanaged > 0 ? (
            <p className="mt-1 text-sm text-muted">
              {t('teaching.materials.deletedUnmanaged', { count: outcome.unmanaged })}
            </p>
          ) : null}
        </div>
      ) : null}

      {outcome?.kind === 'blocked' ? (
        <div
          role="status"
          className="mb-4 rounded-sm border p-3"
          style={{
            borderColor: 'color-mix(in oklab, var(--tc-amber) 45%, transparent)',
            background: 'color-mix(in oklab, var(--tc-amber) 8%, transparent)',
          }}
        >
          <p className="text-sm font-semibold text-fg">
            {t('teaching.materials.blockedTitle')}
          </p>
          <p className="mt-1 text-sm text-muted">{t('teaching.materials.blockedBody')}</p>
          <p className="mt-1 text-sm text-muted">{t('teaching.materials.blockedHint')}</p>
          <div className="mt-3">
            {/* A way forward, not just a refusal. */}
            <Link
              to="/teacher/lessons"
              className="inline-flex items-center gap-1.5 rounded-sm border border-line px-3 py-2 text-sm font-semibold text-fg focus-visible:outline-3 focus-visible:outline-accent"
            >
              {t('teaching.materials.blockedAction')}
            </Link>
          </div>
        </div>
      ) : null}

      {/*
        Cleanup that outlived the request that started it. Read on load, so a
        refresh does not make a pending erasure look finished.
      */}
      {cleanup && cleanup.pendingCount > 0 ? (
        <div role="status" className="mb-4 rounded-sm border border-line bg-surface p-3">
          <p className="text-sm font-semibold text-fg">{t('teaching.materials.cleanupPending')}</p>
          <p className="mt-1 text-sm text-muted">{t('teaching.materials.cleanupPendingBody')}</p>
        </div>
      ) : null}

      {cleanup && cleanup.failedCount > 0 ? (
        <div
          role="alert"
          className="mb-4 rounded-sm border p-3"
          style={{
            borderColor: 'color-mix(in oklab, var(--tc-coral) 45%, transparent)',
            background: 'color-mix(in oklab, var(--tc-coral) 6%, transparent)',
          }}
        >
          <p className="text-sm font-semibold text-fg">{t('teaching.materials.cleanupFailed')}</p>
          <p className="mt-1 text-sm text-muted">
            {t('teaching.materials.cleanupFailedBody', { count: cleanup.failedCount })}
          </p>
        </div>
      ) : null}

      {failed ? <SectionError onRetry={load} /> : null}
      {materials === null && !failed ? (
        <p className="text-sm text-muted">{t('teaching.common.loading')}</p>
      ) : null}

      {materials?.length === 0 ? (
        <EmptyState
          art={<MaterialArt />}
          title={t('teaching.materials.empty')}
          body={t('teaching.materials.emptyBody', { formats })}
          action={
            <PrimaryButton onClick={() => setMode('file')}>
              {t('teaching.materials.addFile')}
            </PrimaryButton>
          }
        />
      ) : null}

      {materials && materials.length > 0 ? (
        <ul className="flex flex-col gap-3" aria-live={processing ? 'polite' : undefined}>
          {materials.map((material) => {
            const ready = material.extractionStatus === 'ready'
            const running = material.extractionStatus === 'running'
            const unreadable = material.unreadableSegments ?? 0
            const readable = material.readableSegments ?? Math.max(0, (material.pageCount ?? 0) - unreadable)
            const total = material.pageCount ?? readable + unreadable
            return (
              <li key={material.id} className="rounded-sm border border-line bg-surface p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-[0.95rem] font-bold text-fg" dir="auto"><bdi>{material.title}</bdi></h2>
                    <p className="mt-0.5 text-sm text-muted">
                      {(material.sourceKind && material.sourceKind !== 'text') ? <><span dir="ltr">{material.sourceKind.toUpperCase()}</span> · </> : null}
                      {running ? t('teaching.materials.processingBody') : unitLabel(material)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill tone={ready ? 'teal' : running ? 'neutral' : 'coral'}>
                      {ready
                        ? t('teaching.materials.statusReady')
                        : running
                          ? t('teaching.materials.statusProcessing')
                          : t('teaching.materials.statusFailed')}
                    </StatusPill>
                    {ready && unreadable > 0 ? (
                      <StatusPill tone="amber">
                        {t('teaching.materials.statusPartial', { readable, total })}
                      </StatusPill>
                    ) : null}
                    {ready && material.revisionId ? (
                      <Link
                        to={`/teacher/activities/new?materialId=${material.id}&revisionId=${material.revisionId}`}
                        className="tc-tactile inline-flex min-h-[40px] items-center gap-2 rounded-sm bg-brand-500 px-4 text-sm font-bold text-white"
                        aria-label={`${t('teaching.materials.createQuiz')}: ${material.title}`}
                      >
                        {t('teaching.materials.createQuiz')}
                      </Link>
                    ) : null}
                    <QuietButton
                      onClick={() => setExpanded(expanded === material.id ? null : material.id)}
                      aria-expanded={expanded === material.id}
                      disabled={running}
                    >
                      {t('teaching.common.open')}
                    </QuietButton>
                    <QuietButton
                      tone="danger"
                      onClick={() => {
                        setOutcome(null)
                        setDeleteError(null)
                        setConfirming(material)
                      }}
                      disabled={deleting !== null}
                      aria-label={`${t('teaching.materials.delete')}: ${material.title}`}
                    >
                      {deleting === material.id
                        ? t('teaching.materials.deleteBusy')
                        : t('teaching.materials.delete')}
                    </QuietButton>
                  </div>
                </div>

                {ready && unreadable > 0 ? (
                  <p className="mt-2 text-sm text-muted">{t('teaching.materials.partialBody', { unreadable })}</p>
                ) : null}

                {/*
                  The failure, in place, with the recovery beside it. Not a
                  toast that disappears and not a retry that would fail the same
                  way — the file is unreadable, and pasting is the way forward.
                */}
                {!ready && !running ? (
                  <div
                    className="mt-3 rounded-sm border p-3"
                    style={{
                      borderColor: 'color-mix(in oklab, var(--tc-coral) 40%, transparent)',
                      background: 'color-mix(in oklab, var(--tc-coral) 6%, transparent)',
                    }}
                  >
                    <p className="text-sm text-fg">{t('teaching.materials.failedLead')}</p>
                    <p className="mt-1 text-sm text-muted">
                      {failureText(material.extractionError)}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {t('teaching.materials.failedRecovery')}
                    </p>
                    <div className="mt-3">
                      <QuietButton onClick={() => setMode('text')}>
                        {t('teaching.materials.addText')}
                      </QuietButton>
                    </div>
                  </div>
                ) : null}

                {expanded === material.id && detail?.segments ? (
                  <div className="mt-4">
                    <SourceSegments segments={detail.segments} />
                  </div>
                ) : null}
              </li>
            )
          })}
        </ul>
      ) : null}

      <ConfirmDialog
        open={confirming !== null}
        title={t('teaching.materials.deleteTitle')}
        busy={deleting !== null}
        confirmLabel={
          deleting !== null
            ? t('teaching.materials.deleteBusy')
            : t('teaching.materials.deleteConfirm')
        }
        body={
          <>
            <p className="font-semibold text-fg" dir="auto"><bdi>{confirming?.title}</bdi></p>
            <p>{t('teaching.materials.deleteBody')}</p>
            {/* Said before the click, not discovered after it. */}
            <p>{t('teaching.materials.deleteShared')}</p>
            <p>{t('teaching.materials.deleteIrreversible')}</p>
          </>
        }
        onConfirm={() => void confirmDelete()}
        onCancel={() => setConfirming(null)}
      />
    </div>
  )
}
