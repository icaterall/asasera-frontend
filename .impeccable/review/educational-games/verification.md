# Educational games — implementation and verification

8 September 2026. Local implementation; no production deployment.

## Try it

- Public practice: http://localhost:5173/games. Choose Jungle Dash, Sky Builders or Treasure Quest, answer a question, and press **Play game round**. Each practice lesson contains three randomly selected questions from the bilingual sample bank.
- Teacher: open a published activity's **Play** setup, choose a game experience and start a live class. Students join with the existing PIN. The teacher reveals the answer, launches the game round, then advances to the next question or podium.
- Self-study: choose **Self-study** with immediate feedback, select a game and create the assignment link. A student answers, plays and submits through the existing learning flow.

## Implemented behavior

| Game | Player controls and objective | Correct-answer resources |
| --- | --- | --- |
| Jungle Dash | Steer across three lanes, jump over logs, collect crystals. Collisions affect shields or points. | Two shields; every student can run. |
| Sky Builders | Time moving block drops along alternating axes. Overlap determines the remaining block width/depth and points. | Four blocks; an incorrect answer gives two. |
| Treasure Quest | Navigate a seven-by-seven island, collect three gems, avoid traps, then reach the chest. Steps consume energy; gems replenish some. | 24 energy; an incorrect answer gives 16. |

Every round has a three-second countdown and up to 24 seconds of play. Three.js renders original geometry: a robot explorer, lanes, obstacles, floating blocks, island tiles, gems and a chest. Keyboard and touch buttons control game actions. A functional simplified board uses the same rules when WebGL is unavailable or reduced motion is selected. Sound starts only after explicit opt-in.

Live and self-study scores are computed on the server from discrete input actions and server time. Clients cannot submit positions, resources or points. Sequences reject old rounds, ignore duplicates and limit control frequency. Classroom broadcasts are bounded to five per second during play; the acting player's acknowledgement updates immediately. Learning marks and game points are separate, including teacher reports. Self-study stores the round state and credits it once, including retries and resume. Live student reconnect resumes the current in-memory classroom round; this is not a claim of uninterrupted recovery after an abrupt server process loss.

Public practice is explicitly labeled practice and runs the same deterministic rules locally. It does not claim to save a teacher report. Existing themed artwork is reused; all new 3D objects are code-generated geometry. No new raster images were needed for this extension.

## Verification performed

- **21 automated tests passed** across `arcade.spec.ts`, `session.spec.ts`, `arcade-delivery.spec.ts`, and `delivery.spec.ts` in the backend. Coverage includes collision scoring, jumping, tower overlap, reachable treasure/chest completion, correct-answer resources, forged-score rejection, duplicate inputs, finite resources, question/play transitions, bounded broadcasts, persistence failures/retries, single credit, assignment resume, submission and separate academic/game reporting.
- **Four real local transport flows passed:** live Jungle Dash, live Sky Builders, live Treasure Quest, and self-study Sky Builders. These used the running API and Socket.IO with synthetic local accounts, genuine published questions, teacher/player/projector roles, reconnect, resume and persisted reports. Outbound integrations were disabled for fixture registration; no email was sent.
- Frontend production build and build assertions passed. The Three.js renderer is loaded on demand; its production chunk triggers Vite's large-chunk advisory.
- Backend production build and build assertions passed. Backend type checking passed. All nine shared contract files are synchronized. Database schema generation from migrations passed.
- Scoped frontend lint passed with two existing integration-file warnings (Fast Refresh exports and an effect used to refresh data); new game modules produced no lint warnings after correction.
- Whitespace checks passed. One static Impeccable detector pass recorded the pinned Montserrat warning and scoped palette/type/radius advisories. Small labels and corners were adjusted; no second detector pass was run.

To repeat the backend tests, run `npm run test:v4 -- tests/v4/arcade.spec.ts tests/v4/session.spec.ts tests/v4/arcade-delivery.spec.ts tests/v4/delivery.spec.ts` in `asasera-backend`. With the local API running on port 4000 and the development database on port 55432, run `npm run verify:games:local` for the actual transport checks. These create synthetic records in the local development database; they do not isolate all service records in a temporary schema.

## Outstanding verification

The browser tool twice refused access to http://localhost:5173/games because it could not verify the admin-enforced browser policy. It explicitly prohibited indirect workarounds. No alternate browser, automation path or URL was used to bypass that denial.

Consequently, **current-game browser playtesting, desktop/mobile screenshots, Arabic layout inspection, actual WebGL rendering, touch behavior and measured frame rates remain unverified**. The independent visual finish reviewer returned **recapture**, not a visual shipping approval. Its required capture matrix is in `finish-review.md`. Previous theme screenshots do not validate the new game renderer. The live limit is enforced at 100 players; a 100-device network/GPU performance benchmark has not been performed.

This delivers three working Asasera game modes inspired by Kahoot's answer-to-arcade loop. It is not a claim of exact feature or visual parity with the entire Kahoot product.
