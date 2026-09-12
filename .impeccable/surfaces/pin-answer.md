# Pin-answer image workspace

Mode: Operate. Arabic/English instructors prepare a picture and place answer targets.
Scope: the existing activity editor's pin-answer canvas, not a new app identity.
Primary target: src/features/editor/HotspotCanvas.tsx.

## Direction contract

THESIS: Prepare the picture, then place answers directly on it; keep geometry controls secondary.
OWN-WORLD: Existing Asasera blue actions, neutral canvas, Montserrat/Neo Sans Arabic, established control tokens.
STORY: Write a question; upload/create an image; cover unwanted labels; draw targets or review AI suggestions; try the learner interaction.
FIRST VIEWPORT: Question title above a wide image; compact tool strip above it; numbered answers beside it, stacked below on mobile. Add answer is the primary manual action.
FORM: Code-led extension of the user-specified image workflow; no seed or identity tournament. Signature: sample a picture colour and immediately paint over a label, with undo.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Built surface — 12 September 2026

This code-led extension inherits the current [DESIGN.md](../../DESIGN.md) and its [sidecar](../design.json). The finish documentation is this surface-specific addition: no global identity, token, PRODUCT.md, or root design-file change was requested or made. There was no approved raster composition and no newly shipped raster asset; the review pictures are synthetic test images, not application artwork.

### Workflow

1. The existing question-title field precedes the workspace. An empty image question offers upload or AI image creation. New pin questions default to draggable answer labels; existing questions retain their saved answer mode and geometry.
2. “Clean image” opens a separate editing dialog. Picking a pixel colour switches immediately to the brush; the colour field, brush-size control, undo/redo and original comparison remain available. Round strokes paint at the original image resolution. This is pixel covering, not AI inpainting.
3. Instructors draw boxes or circles on the image, then select, drag or resize an area. A primary “Add answer area” action inserts an editable box. Numbered image badges correspond to the answer rows; editing a label selects its area. Shape and percentage-position inputs stay in a secondary disclosure, including the existing hexagon/polygon support.
4. Drag-label mode maps written answers to areas. Click mode supports multiple correct areas. Switching from labels to clicks requires confirmation because the labels are removed; the image areas remain. The editor retains at least one area and caps areas and label cards at twelve each.
5. AI suggestions first show an estimate, then require a deliberate generation action. Instructors select proposals and append their areas and matching labels without replacing manual areas. Applied suggestions remain unconfirmed until instructor review.
6. Learner preview uses the question interaction, including dragging or selecting a label and tapping its area. Preview answers remain local to the preview and “Try again” resets it. “Confirm answer areas” sends confirmation for saving; subsequent workspace edits clear the local confirmation state.

### Layout and visual treatment

The bordered neutral workspace uses inherited surface, text, action, focus and corner tokens, shared Button/Select controls, and Montserrat/Neo Sans Arabic. The image leads; tool labels, selected outlines and numbered badges connect actions to answers. Neutral dashed outlines mark inactive areas; the active area has a stronger blue outline and corner handle. Geometry badges and selection do not indicate correctness.

On wide viewports the flexible image column sits beside a 210–260px answer column. At 1100px and below the answer panel moves beneath the image and its rows use two columns; at 600px and below those rows become one column. The toolbar wraps, header and confirmation footer stack, and precise-coordinate fields become two columns. Cleanup, creation and suggestion dialogs scroll within the viewport; phone dialogs leave an 8px outer margin. These are local dimensions, not additions to the global token scales.

Arabic mirrors the surrounding interface and panel borders through logical layout. Image stages and suggestion overlays explicitly retain a left-to-right physical coordinate frame; changing language must not mirror target positions. Answer text and the image description use automatic text direction, while counts and request identifiers use bidirectional isolation. Long proposal labels wrap. Areas are keyboard-focusable, arrow keys move them, and precise fields offer direct geometry editing. Native modal dialogs restore the prior focus on close. These observed controls do not establish a complete accessibility certification.

### Recovery and review requirements

- Preserve the attached image until a cleaned replacement passes the existing upload and moderation path. Save progress blocks conflicting canvas edits. Unsaved brush edits require an explicit discard choice; undo/redo and original comparison remain inside that editing session.
- Image creation shows the selected model, estimated cost and maximum AI Credit reservation before submission. A generated image cannot be attached until it loads and the instructor checks the accuracy, suitability and media-policy review box.
- Retain the exact pending image/suggestion request in session storage so closing and reopening a dialog or recovering a lost response resumes the same request. An uncertain provider result stays in review and must not automatically trigger another paid generation.
- Empty or exhausted completed suggestions offer a fresh estimate. When the image or question revision changes, hide old proposal geometry and selection, block its application and offer a fresh estimate. Re-estimation itself does not start a paid job; the user must submit again.
- Reset the canvas image-failure state on every image-key replacement, including upload, AI creation and cleanup. A failed image link has written recovery guidance; the prior failure must not conceal a replacement image.
- Keep image review, answer-area confirmation and question approval distinct. AI output remains a proposal, and visual review does not establish factual accuracy or provider quality.

### Evidence and release boundary

Observed implementation: [HotspotCanvas](../../src/features/editor/HotspotCanvas.tsx), [workspace styles](../../src/features/editor/HotspotCanvas.module.css), [ImageCreator](../../src/features/editor/ImageCreator.tsx), [ImageRetouch](../../src/features/editor/ImageRetouch.tsx) and [ZoneSuggestions](../../src/features/editor/ZoneSuggestions.tsx).

The finish reviewer returned **ship for the reviewed local UI** after confirming two corrections: safe re-estimation with hidden stale suggestion geometry, and image-failure reset on image replacement. Evidence includes [English desktop](../review/pin-desktop.png), [desktop cleanup](../review/pin-cleanup-desktop.png), [AI creation](../review/pin-ai-desktop.png), Arabic mobile [top](../review/pin-mobile-ar.png), [tools](../review/pin-mobile-tools-ar.png), [image](../review/pin-mobile-image-ar.png), [answers](../review/pin-mobile-answers-ar.png) and [cleanup](../review/pin-cleanup-mobile-ar.png), plus [empty suggestions](../review/pin-suggestions-empty.png), [stale desktop suggestions](../review/pin-suggestions-stale.png) and [stale mobile suggestions](../review/pin-suggestions-stale-mobile.png).

Focused component/backend checks, isolated browser flows, production builds/typechecks, shared-contract synchronization and the isolated schema-drift gate passed. Browser checks used synthetic bitmaps and mocked paid endpoints. No paid provider inference was performed; these results do not certify live provider quality or every theme/device combination.

See the [implementation and release record](../../../asasera-backend/docs/implementation/pin-answer-workspace-2026-09-12.md) for backend details. Migration 0033 and the matching API/worker release are not applied on the shared server; approval remains pending, and the prior 0032 approval does not cover 0033. A read-only readiness check on the shared-database-connected local API returned unavailable with database connectivity healthy and schema readiness failed. Isolated test success therefore does not make that development backend activation-ready. The local UI ship verdict is not deployment approval.
