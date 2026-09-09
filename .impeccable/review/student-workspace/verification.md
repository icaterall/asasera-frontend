# Student learning workspace verification

Implemented: sidebar workspace with home, saved activities, progress, practice and learning preferences; responsive rail/navigation; kindergarten/school/university/general presentation. Stage and optional grade/year collected at email or Google registration, editable and clearable later, with no DOB or inferred consent/age. Uses existing generated game-world artwork and real playable game engine. Practice banks use stage/grade bands and shuffled questions/answers. Public landing practice remains available.

Data: student-only profile and saved-assignment endpoints. Activities must first prove their teacher-link capability; attempts are owned by an account, not matched by display name. Atomic starts return the same attempt across devices. Resume issues private capabilities only to that owner; overview never includes them. Readiness, expiry and teacher feedback rules determine progress and released scores. Activity keys are separated per signed-in student on shared devices. Practice scores are explicitly separate from teacher reports.

Checks completed:
- Frontend production build and bundle assertions; backend typecheck/build/assertions.
- 19 frontend tests: stage/grade validation, learning bands, bilingual question banks, shuffled correct answers, question arithmetic, existing login-return and role navigation.
- 21 backend tests: registration/profile persistence/clearing, invalid combinations, role boundaries, legacy fallback, saved activity authorization, ownership isolation, cross-device resume, delayed feedback, concurrent account start, plus Google handshake/sign-up/login checks.
- Additional regression suites: 25 existing auth/workplace tests and 6 delivery/game-persistence tests passed. Combined unique automated tests: 71.
- Scoped lint clean after async effect cleanup; whitespace checks clean.
- Shared contracts synchronized (11 files).
- Migration 0017 applied and both tables present in the configured development database, verified read-only. Schema snapshot regenerated from fresh migrations using native PostgreSQL16 on a separate local scratch database. Integration fixtures use the isolated local test database, not the SSH-forwarded development connection.
- Local frontend responds HTTP200, API readiness HTTP200, student overview rejects unauthenticated access with401.
- One static design-detector run: thick decorative metric border removed; small text raised to12/14px and fluid headings aligned. Remaining scene-overlay color and contextual type advisories are intentional continuation of the game-world system.

Visual evidence limitation: CUA repeatedly denied localhost access because admin-enforced browser security policy could not be verified. No alternative browser, Playwright, headless rendering or indirect workaround was used. The independent finish reviewer returned `recapture`; older captures belong to the teacher editor and cannot approve this surface. Responsive EN/AR appearance, focus interaction and actual rendered stage variants require permitted browser verification. Builds and API tests are not a visual approval.
