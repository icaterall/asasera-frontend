# Playful Asasera landing — 8 September 2026

Mode: Persuade. Route: `/`, signed-out marketing entry; authenticated role redirects remain intact.

The user explicitly pins Kahoot's playful game experience, with Asasera primary `#004ccc`, and asks to replace the traditional, inactive landing. This is a new composition within the already approved quiz world, not an open brand exercise. Proceed code-led with real interactive UI; no generated page comp or additional direction approval. Existing student/teacher application surfaces remain governed by DESIGN.md.

FIRST VIEWPORT: a solid Asasera-blue classroom stage immediately below a solid navigation bar, generous white display lettering with yellow emphasis, tactile yellow creation action, and a large playable four-color quiz. The quiz must be usable immediately, and must identify itself as a demo, not imply a live classroom or fabricated user count. Four answer identities pair color with triangle/diamond/circle/square. At 1440px the teacher message and quiz sit side by side; at 390px the quiz follows the introduction with no clipping. Arabic mirrors the composition structurally; Arabic headings have script-appropriate leading.

Signature interaction: Play a three-question taster directly in the hero, receive explanatory feedback, advance deliberately, see a personal result, and replay. No login, network calls, pretend buttons, timer pressure, or unexpected audio. Confetti is a brief optional celebration respecting reduced motion. Focus follows deliberate advancement, never page load. A secondary workflow explorer changes the visible source / editor / classroom example on click. Both interactions work by keyboard.

Visitor path: feel the learning game → join an existing session or start creating → inspect the source-to-question-to-classroom workflow → choose teacher or student → compare the existing plans → contact real support. Keep join validation, teacher/student signup, account menu, language/theme controls, support form and all existing section-anchor destinations operational. Existing product facts and pricing remain; new copy describes implemented capabilities and examples rather than unsupported outcomes or invented social proof.

Motion grammar: one brief stage entrance, tactile pressed answers, a short feedback reveal and user-triggered celebration. No endless decorative animation. Content is visible by default and reduced-motion removes motion.

Quality reference: official https://kahoot.com/ inspected 8 September 2026, screenshot in `.impeccable/review/landing-playful/kahoot-reference.png`. Borrow the saturated game identity, confident type, clear primary actions and product demonstration, retaining Asasera branding and actual features. No Kahoot logos, claims, pricing, or fake customer metrics.

Verification: one batched desktop/mobile + Arabic/English + dark/reduced-motion inspection, one correction round if needed; automated quiz/replay, keyboard focus, workflow, join, navigation and support-presence checks. Finish review uses rendered captures plus source; documentation follows corrections.

## Built record

The implementation retains the solid blue stage, yellow creation action, local three-question quiz with explanation/score/replay, selectable PDF-to-question-to-classroom examples, bilingual teacher/student links, existing join validation, price facts, and shared support form. Demo identification is in the quiz's top bar; the redundant standalone label above it was removed after finish review. Workflow content, the sample code, and quiz data remain explicitly illustrative. Arabic uses structural mirroring with script-specific heading leading. The hero remains blue in dark mode, while surrounding neutral and tinted surfaces adapt; reduced motion suppresses entrance, feedback motion, and optional completion confetti.

The build is code-led under the user's pinned direction. No approved image comp or concept tournament applies. The teacher artwork is built from the existing answer geometry; the student panel reuses `src/assets/images/hero-media.jpg` with its existing provenance. No new shipping raster was introduced. Homepage-only Navbar/Layout adaptations provide the solid header and omit Aurora without extending that treatment to other routes.

Final evidence is in [the landing review directory](../review/landing-playful/): [review.md](../review/landing-playful/review.md), [verdict.md](../review/landing-playful/verdict.md), [verification.md](../review/landing-playful/verification.md), and [tests.log](../review/landing-playful/tests.log). The reviewer scored the single requested label correction resolved and returned **ship for that fix only**. Original supplied-screenshot coverage remains binding: completion and incorrect-answer visuals, mobile drawer/account-menu states, and real support inbox delivery were not independently certified. The verification record reports all 12 browser checks, the production build, and postbuild assertions passing; lint has existing warnings outside the landing, and whitespace checks passed. Support submission testing intercepted success and sent no new email.

The durable landing additions are merged into [DESIGN.md](../../DESIGN.md) and [.impeccable/design.json](../design.json), preserving the pre-existing authoring, classroom, student, and account sections and component specimens. The older PRODUCT.md remains historical starter context where it conflicts with direct user authority. This record captures the finished landing and does not reopen visual review or introduce additional UI work.

## Photo question bank extension — 8 September 2026

The user now asks for generated photos alongside sample questions and many different questions on every visit. Keep the existing blue game world and three-question session length. Add eight generated nature, science and everyday-life images, and 80 authored bilingual questions (ten per photo topic). Each round uses three different photo topics, shuffles answer positions, and excludes the 24 most recently selected questions stored locally. No provider calls or API keys are needed to play; only chosen image assets are requested. Language/theme changes preserve the same questions, order, score and selection. “New questions” and the end-of-round action create another round. Storage denial/corruption and image failure must leave the quiz usable.

Delight thesis: a returning visitor discovers a fresh piece of the world every time, with a photo and a short explanation turning an answer into a small learning moment.

Photos are genuine generated raster assets, not CSS placeholders, and explicitly labeled AI-generated images. Questions and photos remain illustrative sample material, not claimed classroom records. Full images fit without cropping important subjects. Assets, exact prompts, generation method and origin are persisted under `src/assets/images/landing-quiz/`. Preserve all prior sections and production connections.

### Extension verification

The photo quiz extension is implemented and independently reviewed with disposition **ship** at this narrow scope; no material fixes remain in that review. The final packet is [review.md](../review/landing-photo-quiz/review.md), with [verification.md](../review/landing-photo-quiz/verification.md) and saved test/build logs. Seventeen distinct checks passed, including two 1,000-round simulations, reload/replay/history behavior, aligned bilingual scoring, image/storage failure, and existing landing entry paths. The production build passed. The feedback screenshot was corrected for capture clipping; no UI change was needed. This approval does not extend to backend delivery or unrelated application flows.
