## verdict

The same six required captures were reopened and pass the evidence check. Resting screenshots show the current layout; `.impeccable/review/journeys/control-states.json` and the final student source supply the focused, pressed, and reduced-motion evidence.

1. **Accessible focus — resolved.** The live controls now use a white 3px outline with 2px offset; the browser-state record confirms those values. Neutral focus consumes the shared theme tokens and is scoped to the main content/header.
2. **Contrast — resolved.** Both light student captures now show clearly darker input examples, and the white PIN remains readable in the dark capture. Its measured placeholder is rgb(110,110,110), opacity 1. Ordinary placeholders use theme-aware muted ink, the dark footer link visibly uses the light accent, and assignment errors consume the existing theme-aware `--danger-ink` token.
3. **Eyebrow — resolved.** The redundant label is absent in desktop English, mobile Arabic, and mobile dark English. The action heading leads the purple panel; spacing and wrapping remain coherent.
4. **Shared control behavior — resolved.** Captures show the neutral inset edge on Join and the shared tactile action treatment. Source consumes `--press`, adds hover feedback, and suppresses reduced-motion travel. Browser-state evidence confirms 4px press travel, a neutral inset pressed shadow, and `transform: none` under reduced motion.

Regression R1 — resolved: the initial broad neutral-focus selector also recolored verification-banner focus. The final selector is restricted to `.main`/`.header`, and the updated browser-state record confirms the banner's outline is white. No other regression from this fix batch is visible in the supplied captures or sampled changes.

## remaining

Clear. Ship covers the four scored fixes and corrected focus regression R1 only; it does not certify the entire application, backend, every auth screen, or exact current Kahoot pixel parity.

disposition: ship
