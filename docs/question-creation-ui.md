# Question creation correction

The existing activity-editor launch opens `src/features/editor/GenerationPanel.tsx`; it is now the compact teacher surface, rather than a new unused component. The editor's question properties also contain **Suggest another question**.

Teacher creation offers file upload, pasted lesson text and topic. File upload uses the existing PDF/DOCX/PPTX endpoint and server limits. Pasted text becomes an owned text material before quoting; it is never submitted as general knowledge. A saved-file chooser is secondary. A provided material revision or source-backed question is preselected, with readable scope selected only when the complete readable scope fits the server limits. Oversized documents require narrowing the selection; unreadable sources cannot silently become topics. Material metadata supplies question language unless the draft or teacher explicitly chose a language.

Five questions, medium difficulty and mixed multiple-choice/true-or-false are defaults. Language, difficulty and format are behind Question settings. Quotes expose only useful costs and an opaque approval ID. Locale-aware USD values with up to five decimals avoid turning a nonzero amount into zero or understating a maximum. Provider, model, task, label and scheduled-review UI/data hooks were removed from this surface. The recent-results list filters to question-generation jobs.

Accepted jobs, uncertain request fingerprints/idempotency keys, source selection, count, language, review edits and selected questions survive closing/reloading in the same browser tab. The recovery key includes author, activity and contextual target. Legacy URL drafts strip obsolete routing fields while preserving lesson inputs. An uncertain submission retries its original authorized request; explicit stale-quote rejection obtains fresh approval. Session storage is not the authority for job state or payment. Backend polling and idempotent apply remain authoritative.

Replacement captures the target ID/revision after editor autosave, shows the original, generates one alternative, and only applies after explicit selection and Replace question. Closing or cancelling leaves the original unchanged. Applying edits does not make another AI request. The backend validates edited questions and unchanged citations. Fully added results clear the local recovery entry after acknowledgement.

The native dialog has a fixed heading/action footer, independently scrolling body, explicit keyboard boundaries, Escape handling, focus restoration, logical RTL spacing, shared controls, and existing light/dark tokens. Browser evidence is recorded centrally by the browser reviewer.

## Executed fixture verification

- `npx vitest run tests/activity-recovery.spec.tsx tests/generation-loading.spec.tsx`: 38 passed.
- `npm run typecheck`: passed.
- `npm run lint`: no errors; existing React effect/export warnings remain, including the asynchronous quote/scope effects.
- No paid generation, production policy change or RDS data mutation was performed by this implementation slice.

Coverage includes source-backed file upload and pasted text, material preselection, explicit language in Arabic UI, unreadable-file blocking, source-switch invalidation, default intent without provider/labels, disabled logo-free loading button, double-click suppression, exact uncertain-request retry, job recovery, explicit target replacement, existing editor autosave/recovery, and legacy routing-preference removal.

Pending/ambiguous submissions lock source/settings and recent-result navigation until the existing request is recovered or the server definitively rejects it. The request snapshot and idempotency key are immutable across this recovery. Definite 4xx validation rejection unlocks correction; unsubmitted replacement drafts refresh from the current question revision. Mobile close restores the original drawer and opener after native dialog cancellation.
