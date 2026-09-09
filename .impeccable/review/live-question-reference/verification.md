# Live question reference adaptation — 8 September 2026

The user supplied two local videos and a screenshot following prior instructions for real Kahoot-like classroom games. No explanatory text accompanied these latest uploads. An optional scope question received no answer during the work; the implementation proceeded with the explicitly stated assumption of applying the live-question reference to the existing teacher, projector and student surfaces.

## Reference evidence

Visual frames sampled across both supplied videos were inspected: 29 frames from the 882-second lesson-creation recording and 16 frames from the 93-second game-selection/lobby/submarine recording. The screenshot shows the team question, white prompt, timer, PIN header and four large color/shape answers. These are third-party reference frames, not current Asasera captures. The audio was not transcribed, and no claim of continuous frame-by-frame review is made. No proprietary logos, media, team system or submarine gameplay were copied into Asasera.

## Implemented scope

- Compact join/PIN header, centered Asasera branding, real participant count, sound/fullscreen and native settings disclosure. Teacher-only projector/wheel/end actions remain gated. Outside click, Escape and focus leaving the menu close it; focus remains visible. Sound no longer forces fullscreen; fullscreen toggles both ways.
- Teacher progression stays prominent in yellow; the large administrative strip is removed from the question stage. Existing start, reveal, next, game-round, finish and private intervention commands remain connected to the same server.
- New shared live question stage with a white prompt, large answer keys, server response count and progress, prominent timer, pending/waiting/expired feedback, personalized result text and class answer bars. Correct option identity follows the payload order, independent of distribution order. Nonresponses remain visible and zero answers produce zero-length bars. No correctness is derived before the server reveal.
- Student choice controls retain shape-only presentation and full answer text in accessible names. Teacher-selected media remains optional. Ordering, matching and image-region inputs keep the existing component and submission contracts.
- Countdown uses the existing synchronized monotonic clock. It catches up after a suspended tab, stops at zero, marks the last five seconds, localizes its accessible label and disables the question locally on expiration. React timer updates are capped at 10 per second; this is a source limit, not a frame-rate measurement.
- Each current game has a native “How to play” panel below its lobby. Existing original world thumbnails accompany the objective, control instructions, answer resources and separate game-point explanation. No raster assets were generated for this refinement.

## Checks

- Frontend TypeScript/production build and bundle assertions pass. The existing lazy Three.js chunk size advisory remains.
- Nine new native frontend tests pass: delayed arrival, deadline expiration/zero duration, bounded timer, empty class, full response count, option-slot identity, nonresponses, localized true/false and advanced-question result semantics.
- Fifteen existing backend tests pass across `tests/v4/session.spec.ts` and `tests/v4/arcade.spec.ts`: classroom lifecycle, 300 accepted answers, grace/early-reveal timing, private disclosure, reconnect identity, idempotency, persistence retry, authorization and actual game mechanics. These use a synthetic repository and clock. They do not write application data or send email.
- New components, countdown, helper and SessionPage have clean scoped lint. Fourteen existing drag-and-drop ref warnings remain in unchanged QuestionInput internals; no lint errors. Git whitespace check passes.
- Twelve source color pairs were calculated. New navy/action/text pairs range from 7.10:1 to 14.25:1; pinned answer colors range from 4.50:1 to 7.45:1. Transparent navy panels were tested over white as the brightest underlying scene. This is source contrast evidence, not sampled rendered pixels.
- One static design-detector pass records 45 palette/type/radius advisories and two warnings. The width transition on native response progress was removed. The flagged inset bottom edge on the yellow action is intentional under the user's tactile quiz style and the existing pressed-key contract. The original detector output is retained; it was not rerun to imply a visual pass.

## Outstanding visual verification

Browser inspection remains blocked by the previously returned admin-enforced policy-verification denial, which explicitly prohibited alternative access paths. No alternate browser, page capture or renderer was used. Current host/projector/player layouts, responsive overflow, keyboard/touch interactions, Arabic mirroring and actual motion still need browser inspection. The build and native tests do not establish visual parity, perfect function across the application or approval to ship all game views. Recapture remains the disposition.
