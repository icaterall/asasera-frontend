## verdict

1. **Resolved — Arabic mobile feedback:** homework-review-390-ar.png is now 390×2825; the detail crop shows complete badges on their own rows, contained within tiles and separate from answer text. The passed delivery test asserts viewport width equals scrollWidth and checks badge bounds and font size.
2. **Resolved — hover contrast:** AnswerTile hover now changes shadow without a brightness filter or fill change. The completed 20-test design suite includes measured hover fills, contrast, and actual label size/weight in both themes.
3. **Resolved — dialog names:** all three native dialogs use useId-backed aria-labelledby linked to their visible headings. Passed browser tests locate the generation, deletion, and shared-device dialogs by those exact accessible names.
4. **Partial — icon system:** refreshed mobile.png, generation-zones-390.png, and gallery captures show the new SVG controls and status icons, and the reviewed source removes the glyph substitutions. However editor-hotspot-390.png still shows the old tiny Unicode gear/menu and old toolbar layout; this capture must be refreshed before this fix is fully evidenced.
5. **Resolved — side accents:** teacher-intervention.png shows the stripe removed, and the reviewed delivery/generation error styles contain no thick side border; the meaningful unit strip and selected-thumbnail outline remain.
6. **Resolved — title hierarchy:** both delivery-setup captures show the activity title before its question-count metadata.

## remaining

- **Fix 4 evidence:** recapture editor-hotspot-390.png over the same path with the current SVG menu/settings controls; also refresh its desktop counterpart if it was copied from the prior build.
- **Regression R1, introduced by fix 1:** teacher-intervention.png now shows the green answer label at 20px while its peers are approximately 35px, and the answer labels wrap onto a different row from their shapes. Removing the broad span-size override exposed .s4 .label's fixed minimum; the new calc(100% - 3rem) basis cannot accommodate the larger stage glyph plus gap. Preserve the projector-sized label on every slot and keep each shape with its answer label, while retaining the separate, small, contained feedback row.
- No other fix-batch regression identified. This verdict scores the six listed fixes only.

disposition: fix
