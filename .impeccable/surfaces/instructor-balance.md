# Instructor AI balance

MODE: Operate. A local extension of the existing teacher header and account controls.
Primary target: src/features/account/InstructorBalance.tsx
Related: src/components/teacher/TeacherHeader.tsx; src/components/layout/AccountControl.tsx; src/features/editor/ActivityEditor.tsx.

## Direction contract

THESIS: Available AI allowance is visible while teaching; details open without abandoning unsaved work.
OWN-WORLD: Existing Asasera blue, neutral surfaces, Montserrat/Neo Sans Arabic, restrained borders and familiar controls.
STORY: Read available tokens, open account overview, distinguish held from spent, inspect own participation and recent transactions, return to work.
FIRST VIEWPORT: Compact outlined balance beside the avatar; modal has identity, a flat balance breakdown, workspace totals and dated transactions. Mobile stacks the sections and keeps dismissal visible.
FORM: Precisely scoped code-led extension; no concept seed or comp required. Native dialog provides focus containment and return; one short entrance honors reduced motion.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Counts are owner-scoped. Participations are joins/attempts, not unique people. The instructor-facing term is “Balance / رصيد”, backed by existing AI Credits rather than raw model tokens. No provider call, new billing model or migration.

## Implemented contract

- Teacher accounts see the available amount from the existing wallet's `usableAiCredits`. The teacher header uses the standard control; the editor uses the standard control on desktop and its compact variant on phones.
- Opening the native dialog preserves the current workspace and unsaved editor state. It shows account identity, available/held/total balances, usage, workspace totals, and the latest eight ledger transactions. Explicit account/support links navigate away.
- Usage is net settlements less reversals. Temporary holds are separate. Workspace totals belong to the signed-in instructor; learner participations count joins/attempts, not distinct people.
- Wallet refresh runs every 30 seconds while closed, every 10 seconds while open, and on window focus. Opening also refreshes the wallet. The read-only account overview is loaded when the dialog opens and refreshes every 30 seconds while open. Manual refresh updates both sources.
- Loading, stale/error, zero balance, held balance, account-limit and empty history states have explicit copy. The UI calls the allowance “Balance / رصيد” and explains that it covers AI services (AI Credits). Calculations make no AI requests and require no migration.
- Native dialog dismissal, keyboard focus containment/return, body scroll locking, bilingual labels, localized numbers/dates, RTL and reduced-motion handling are part of the component contract.

## Local visual decisions

The implemented extension is documented in `src/features/account/DESIGN.md`. Existing blue/neutral roles and Montserrat/Neo Sans Arabic remain the source of visual direction. The review accepted the dialog radius (16px), balance-group radius (12px), translucent navy backdrop, and mobile balance numerals (22px) as feature-local exceptions. They do not amend root design tokens or PRODUCT.md brand commitments.

## Finish review and evidence

Disposition: **ship for the supplied instructor-balance and TeacherHeader evidence**.

Twelve validated fixture captures are stored in `.impeccable/review/instructor-balance/`: `desktop`, `mobile`, `mobile-ar`, and `desktop-dark`, each with the base `.png`, `-header.png`, and `-history.png` views. They render the actual component and TeacherHeader with synthetic account data and intercepted requests. These are review evidence, not shipping raster assets; no shipping rasters were added.

Validation reported for this feature: seven browser tests and two backend owner-only tests pass; the frontend production build and both frontend/backend typechecks pass. The broader preexisting editor suites fail 15 of 23 tests on contenteditable value setters, multiple banners, old language expectations, and missing `matchMedia`. This disposition does not certify the full editor layout, a fully passing application suite, or production deployment.
