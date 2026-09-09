# Random wheel — 8 September 2026

The optional tool is implemented locally at http://localhost:5173/teacher/wheel, in the teacher navigation and tools page, and in live classroom controls. No production deployment was performed.

## Behavior

- Standalone lists support 1–100 names, topics or questions, one per line. Lists and picks are saved by teacher account in this browser. Saving failures retain the in-memory tool with a clear status; clear removes the active list and picks.
- The live wheel defaults to connected classroom participants. Teachers can switch to a custom list. The server picks the winner with cryptographic randomness, freezes the eligible entries and spin timing, and sends the same draw to teacher, students and projector. Clients cannot supply a winner.
- No repeats is on by default. Reset picks restores eligibility. Turning repeats on keeps every entry eligible. Editing a custom list or changing the source begins a fresh selection round.
- Only teachers control live spins. Overlapping spins, mid-spin resets/configuration and duplicate requests are handled. The wheel is offered before a question or after results; it must be closed before progressing to the next question. It never changes academic marks or game points.
- A fixed pointer and one rotating SVG use 250ms lead time and 4.8 seconds of deceleration. The winner remains hidden in normal interface feedback until the spin ends. Full labels and the chosen result sit outside the rotating graphic. Reduced/paused motion removes rotation; a teacher spinning with motion disabled requests an immediate result for everyone.
- Live draws resume across socket reconnect while the class remains in the running server. This does not promise uninterrupted state recovery after an abrupt backend process loss.

## Checks

- **20 automated tests passed:** five wheel tests plus the existing classroom/game lifecycle tests. Wheel coverage includes pointer alignment at every selected index for pool sizes 1, 2, 3, 7, 16, 30, 100 and 500; rejection sampling; empty/oversized pools; reduced-motion timing; input validation; teacher ownership; no client-selected winner; synchronization; reconnect-safe frozen entries; idempotency; no repeats; reset; custom lists; connected-student filtering; and unchanged marks.
- **Real local API/Socket.IO flow passed:** teacher and two synthetic students, projector, animated-spin timing, identical draws across roles, student reconnect, duplicate/overlapping spin handling, exhausted pool, reset, custom bilingual topics, immediate selection, close and unchanged report marks. This is transport verification, not rendered animation testing. Fixture registration disabled outbound services; no email was sent.
- Frontend and backend production builds and build assertions passed. Backend type checking passed; all ten shared contract files are synchronized. Scoped frontend lint and whitespace checks passed.
- One static Impeccable detector pass found four scoped type-size advisories and no material warning. It was not rerun.

Repeat from `asasera-backend`: `npm run test:v4 -- tests/v4/wheel.spec.ts tests/v4/session.spec.ts tests/v4/arcade.spec.ts`. With the local API on port 4000 and development PostgreSQL on port 55432, run `npm run verify:wheel:local`. The transport script creates synthetic local records; it does not isolate all service records in a disposable schema.

## Visual verification outstanding

Earlier CUA requests to this local site were denied because the admin-enforced browser policy could not be verified, with an explicit prohibition on indirect workarounds. No alternative browser, URL alias or automation path was used for this feature. Current desktop/mobile browser rendering, keyboard/touch interaction, Arabic sector lettering, reduced-motion presentation and actual frame smoothness remain unverified. Existing game/theme captures are not evidence for this new wheel.

The animation implementation follows the documented [Animation.currentTime](https://developer.mozilla.org/en-US/docs/Web/API/Animation/currentTime) mechanism for seeking into the shared spin and [SVG transform-origin](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/transform-origin) for the rotor's center. These references support the implementation choice, not a browser compatibility test of this application.
