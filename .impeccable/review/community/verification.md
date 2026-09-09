# Community feature verification — 2026-09-09

The feature extends the current teacher interface using the existing Asasera Blue, tokens, shared controls, Lucide icons and activity-world thumbnails. No new image assets or illustrative claims were introduced.

## Functional evidence

- `tests/community.spec.tsx`: 10 passing JSDOM tests covering rating/feedback submission, error preservation, safe text, withdrawal, Arabic labels, creator replies with revision/status, conflict recovery, guest login return, clipboard failure recovery, turning sharing off and copying to an editable activity.
- Existing audience/dropdown suites: 22 passing component tests.
- `tests/community-routes.test.ts` plus login-return tests: 17 passing tests. Direct share/feedback/discovery/creation routes match deployed SPA routing; unknown/API/asset paths retain separate handling.
- Backend: 12 new community tests, 31 audience/discovery/configuration regression tests, and 11 discovery/delivery/erasure tests pass. These use isolated test PostgreSQL, never the configured application's SSH-tunnel connection.
- Both builds, build assertions and typechecks pass. Backend and frontend deployment manifests and whitespace checks pass. Scoped lint has two existing `ActivityEditor` effect warnings; there are no new community lint warnings. The existing game-renderer chunk warning remains.
- Migration 0020 applied to the configured application database after isolated validation; zero fixture feedback rows exist there. The local API and Vite proxy are ready and enforce anonymous-inbox denial. Production application code deployment remains pending.

## Source-defined presentation

Shared preview uses a flexible column plus 310px action panel; inbox uses a flexible list plus a 290px improvement panel. Both stack at 980px. Recommendations change from three to two to one column; at 600px headings/actions/entries wrap and paddings reduce. Authored text has automatic direction and teacher names use bidi isolation. Local semantic colors inherit dark-mode tokens. These statements describe source, not a rendered observation.

The detector ran once on changed UI targets. [detector.json](detector.json) contains 15 advisory type/radius differences against global DESIGN metadata, all in the new local CSS. They follow the established teacher-home local type/corner language. No non-advisory findings were reported; do not mistake the advisory report for a visual pass.

## Finish evidence boundary

[The fresh finish reviewer](finish-review.md) returned **recapture** because no current community screenshots exist. Required captures are desktop 1440px and mobile 390px, English/LTR and Arabic/RTL, light and dark, including expanded feedback/reply states. The historical screenshots show other surfaces and were not submitted as current proof.

The existing administrator-enforced browser restriction prevents new captures and forbids alternate browser/headless/alias/indirect rendering workarounds. No visual approval is issued. Real-browser responsive appearance, focus presentation and overflow require a full finish re-review once current captures can be obtained through a permitted route. Functional code checks do not close that visual gate.
