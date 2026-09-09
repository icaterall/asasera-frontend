# Landing photo quiz verification — 8 September 2026

Scope: extend the existing public landing quiz with generated photographs and a large bilingual sample bank. No deployment or backend changes were made for this extension.

## Delivered

- Eight generated 960×640 WebP images across reef, bee, space, desert, balloon, waterfall, bicycle and seedling themes. Combined asset size: 800,522 bytes. The current photo loads on demand; no image provider call is made during play.
- 80 authored questions, each with aligned Arabic/English options, a correct answer and a short explanation. Three distinct photo topics per round, with shuffled answer positions.
- New visits, New questions and replay deal a fresh round. The previous 24 selected question IDs are excluded. Corrupt or denied storage falls back safely to in-memory history; persistence across browser restarts naturally requires available storage.
- Language changes preserve the same round, shuffled positions, score and selection. Photos have descriptive alternative text, a generated-image label, fixed dimensions and a usable missing-image state.

## Checks

- 16 full Playwright checks passed: bank integrity, 1,000 seeded rounds covering all 80 questions and all four correct-answer slots, quiz scoring/answer locking/replay, keyboard focus, language and theme switching, desktop/mobile/tablet layouts, reduced motion, refresh and ten shuffle rounds, malformed/denied storage and image failure, workflow/signup/join/contact-form regression, and delayed-session startup.
- One additional regression passed in the three-test bank suite: 1,000 new rounds with the current round already recorded preserve the full 24-question exclusion window. Total: 17 distinct checks passed. This catches the duplicate-current-round truncation defect fixed during testing.
- Production build and production API bundle assertions passed. Existing lint warnings are outside this landing extension; no landing lint findings were emitted. Whitespace checks passed.
- One scoped design detector scan emitted 71 advisory token-value findings. The landing retains its existing local visual roles; this is not a clean-detector certification.
- Generated-image provenance scan: eight rasters, zero missing prompts. Exact prompts and built-in generation method are in src/assets/images/landing-quiz/prompts.json and per-image JSON sidecars; original generation PNG paths are retained there.

## Visual evidence

Desktop English/Arabic, mobile English/Arabic, tablet Arabic, and dark screenshots are saved here. The final demo captures show whole uncropped subjects and wrapping answer labels. The mobile Arabic feedback image was recaptured from a document-top full-page screenshot and extracted to the card bounds to avoid element-screenshot viewport clipping and sticky-header overlap. No UI change was required for that capture correction.

The contact test intercepted API success and sent no email. This extension's checks do not certify SMTP delivery, account registration or production deployment. Earlier work on those paths is outside this verification record.

## Independent finish review

Disposition: **ship** for this photo quiz extension. The reviewer inspected all required captures after the feedback recapture, the 80 bilingual rows, assets/provenance, and test evidence. No material fixes were requested. See review.md for the exact five-part verdict and coverage.
