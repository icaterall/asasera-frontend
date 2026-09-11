# Creation methods — owner reference update

The owner's September10 screenshots supersede the earlier all-in-one compact creation surface. The active editor now opens a method chooser with File, Topic, Text and manual editing. A selected method opens a full-screen workspace, retaining the same authenticated editor, generation services and approval/cost controls. Back returns to the choices; selecting the same method retains its draft. Preselected sources, contextual replacement and saved jobs bypass unnecessary choices.

Supported file upload includes drag/drop and the existing file input, current server limits and saved material selection. No unsupported URL import, templates, premium upgrades or new services were added. Manual editing returns to the current activity; it does not create a duplicate activity.

English/Arabic copy, responsive card stacking and RTL arrows follow current Asasera colors. Pending paid requests keep locked inputs/recovery identity. No backend policy, pricing, production database, worker or deployment change was made. The existing RDS migration/cutover blockers remain as recorded in QUESTION_CREATION_REPORT.md.

Changed: GenerationPanel.tsx/module.css, ActivityEditor.tsx focus target, en/ar translations, unit and browser journeys. Draft recovery stores whether a method was chosen. The close handler resolves the current editor trigger rather than a possibly detached element after data reload.

Verification: typecheck and development build passed. Focused40 unit tests cover creation/recovery, including no fields or quotes before source choice and same-method Back preservation. The first13 browser journeys had12 pass and one tablet focus-restoration failure; corrected by resolving the current trigger. Final browser results are appended after confirmation. Local paid responses use fixtures; intake/authentication use isolated API4393/PostgreSQL. Zero new provider calls. Preview5394 serves this development build.

Screenshots: ../screenshots/creation-methods/ in the Web-App root. Earlier compact-dialog evidence remains in ../screenshots/simplified-generation/.

Final browser confirmation:13/13 passed in48.4seconds, including the tablet focus correction. No visual/layout issues remained in the checked desktop/Arabic/mobile screenshots. A final defensive upload guard also rejects drop events during an uncertain paid request (native disabled fieldsets do not suppress custom drop handlers); typecheck/build and generation unit tests verify that final change. Final browser log: `screenshots/creation-methods/playwright-final.log` in Web-App. Impeccable layout scan returned no findings.

## Exact new-quiz entry follow-up

`/teacher/activities/new` now renders three shared Asasera cards immediately: PDF or slides, Topic, Blank canvas. Clicking creates a private starter activity and opens the chosen mode; no mandatory naming form intervenes. Name/audience remain optional and editable, with existing session recovery. Blank canvas opens the manual editor without a generation request.

The file screen is capped at960px and fits its upload contents; PDF/DOCX/PPTX reuse the existing extractor, and settings appear after a source is selected. Topic mode includes example prompts, topic/text input modes, a desktop settings column and stacked mobile controls. No templates or separate slide-import card. Connected Google Slides synchronization, URL/Wikipedia import and premium upgrades are not implemented or advertised; slide support is file upload.

New shared component: CreationChoices.tsx; route implementation: CreateActivity.tsx. Existing GenerationPanel uses the same cards. Backend/accounting/provider policy are unchanged. Screenshots for the exact entry route: Web-App/screenshots/quiz-entry/. New browser suite: e2e/quiz-entry.spec.ts.

Verification follow-up:40 creation/recovery unit tests passed; typecheck/build/diff check passed. Exact route browser tests pass for English desktop, Arabic phone, real PDF then PowerPoint upload, and blank manual creation. The broader suite initially retained an obsolete Arabic choice label and was interrupted/corrected; its rerun had a test-account seed fetch failure before the tablet UI opened. This is recorded separately from UI behavior; remaining results and the targeted tablet rerun are retained in the evidence logs.

Final verification:40 focused unit tests passed. Browser suite14/16 passed, with one transient account-seeding failure and one outdated material-launcher test interaction. The material test now uses the requested card entry; the targeted tablet and material/legacy rerun passed2/2. All16 scenarios therefore passed across the full and targeted runs. Logs are retained at Web-App/screenshots/quiz-entry/browser-suite.log and browser-targeted.log. Typecheck, build and diff check passed. No production-code change was needed for these final two browser failures.

## Color and hierarchy refinement

The new-quiz page now uses blue, teal and warm-gold visual panels with educational icons, distinct action strips and an Asasera heading panel. Shared choice styles live in CreationChoices.module.css, separate from generation-workspace layout. Phone cards become compact horizontal rows; Arabic direction, focus states, reduced motion and dark action colors are supported. No creation logic or backend changed. Typecheck/build passed; the three exact-route browser journeys passed, including English desktop, Arabic phone, PDF/PowerPoint and manual entry. Updated screenshots remain in Web-App/screenshots/quiz-entry/.

## Compact back navigation

Page-level back links now use the shared secondary-button BackLink and sit beside the title on quiz creation, account, reports, shared activity, standalone wheel and admin account screens. Narrow layouts show the directional arrow with the complete accessible label/title, preserving a44px target and RTL direction. Navigation remains a real link. Typecheck/build and the3 exact-entry browser journeys passed; quiz desktop/Arabic phone screenshots confirm the title-row layout. Modal cancellation and workflow completion actions remain in their existing action areas.


### Details before creation choices — 2026-09-10
The new-quiz route now opens Quiz details first. Next saves the title and optional audience, then opens the three creation cards as a modal over the editor. PDF/slides and Topic continue to their existing source workflows; Blank canvas closes the modal. Material context is retained, failed saves retain the session draft, and successful saves clear it. Existing direct generation links keep their behavior. The cards and entry hero retain 5px corners and the back button remains in the title row.

Validation: 41 focused unit tests passed (19 generation + 22 activity/recovery); four Chromium checks passed covering desktop English, Arabic mobile, real PDF/PPTX intake, blank canvas, and material/legacy launchers. Type checking and development preview build passed. Paid AI responses were mocked; no production database changes or deployment were performed. Screenshots: screenshots/quiz-entry/details-ar-390.png and screenshots/quiz-entry/choices-en-1440.png.


### File extraction and editable review — 2026-09-11
- Source pages now show selectable extracted-text previews, with range and select-all controls. These are text previews, not raster reproductions of PDF pages.
- Teachers choose Generate new questions or Extract existing questions. Extraction preserves original wording/language; generation offers language, difficulty, tone, format and count. Both require an explicit AI action under the existing quote/credit approval.
- Mode and tone are persisted in the existing job request and bound to the quote; no new application tables are needed. Extraction prompts prohibit inventing questions/options, and server validation rejects prompts/options absent from cited selected text. Teacher edits are validated separately so intentional rewrites remain possible.
- Review shows a vertical stack of large question previews, correct-answer markers, edit fields and optional confirmed image uploads. Individual adding, selected adding and adding all remaining share the existing idempotent apply transaction. Unapplied edits survive adding another candidate. Image ownership/reference checks use the existing authoring media path. Adding is disabled while a picture uploads.
- Empty extraction results show a useful message. No image generation or paid provider call was made for this UI validation; owner media rules remain unchanged.
- Validation: 11 backend generation integration tests and provider schema test pass; 43 frontend generation/recovery tests; desktop English and Arabic mobile browser review plus real PDF upload/extraction-intent/edit/single-add/add-remaining scenario. Paid results are fixtures; backend storage/validation tests use an isolated PostgreSQL database. Type checks, development preview build and media policy check pass.
- Isolated QA database needed its existing generation_quotes.accepted_job_id column restored to match migration 0026. No production schema change or deployment performed.


### Visual question-type picker — 2026-09-11
Replaced the editor's native-like question format selector with a two-column, grouped visual drawer matching the supplied reference. Quiz, True or false, Pin answer, Puzzle and Matching retain existing editor behavior. Type answer, Slider, Poll, Scale and Drop pin are shown with explicit disabled “Not available yet” labels; these require new end-to-end content/player/scoring contracts and are not represented as working or paid features. Scope question sent to owner. Drawer supports RTL, native modal focus containment, Escape, backdrop dismissal and focus restoration. Two isolated browser checks passed at 1440px and 390px, including selecting True or false; frontend typecheck and preview build passed.


### Question and answer formatting toolbar — 2026-09-11
Added reusable formatting inputs to the editor question, multiple-choice answers and AI-review edits: bold, italic, subscript, superscript, symbol palette and a dedicated LaTeX equation editor. The equation button opens a keyboard-accessible modal with a live preview, Math and Greek tabs, and common fraction/root/power/set/calculus symbols; it only enables insertion after content is entered. Existing optional image controls remain accessible from the toolbar. Supported markup is stored in the existing prompt/option strings, so autosave, session recovery, publication and old plain-text content retain their contracts; no database migration required. Editable source uses **bold**, *italic*, ~{subscript}, ^{superscript} and LaTeX inline delimiters; a live preview displays the result and the idle field shows formatted wording.

The same safe renderer is used by question thumbnails, AI candidate previews, host questions, answer tiles, homework, shared-activity previews and report question headings. Raw HTML is React-escaped. KaTeX uses trust=false, strict validation and bounded expansion/size; invalid formulas remain readable text. Formula content is isolated LTR inside Arabic text. KaTeX options reference: https://katex.org/docs/options.html.

Validation: frontend typecheck and preview build; 4 formatting/safety tests (including focus preservation when moving between fields), 21 generation tests and 22 activity recovery tests; isolated Chromium save/reload tests at 1440px and 390px. Dependency install reports zero vulnerabilities; media policy check passes. No deployment or production database changes.

### Visual equation entry — 2026-09-11
Replaced the equation source-code input with a lazily loaded MathLive field. Teachers choose named Fraction, Power, Square root, Subscript or Brackets controls and fill the visual boxes using their keyboard or the on-screen numbers, symbols, Greek letters and alphabet. Cursor arrows, Next box, Undo/Redo, Delete and Clear equation are available. Empty placeholders, overlong formulas and content unsupported by the existing safe renderer block insertion with a plain-language message. Clicking a rendered equation reopens it for visual replacement; Cancel and Escape preserve the stored answer. MathLive fonts are bundled by Vite and its sound effects are disabled. Storage continues to use the existing inline equation representation, with no schema change.

Browser checks use real UI button/keyboard interaction to create a fraction and power, replace an existing formula with a root, save/reload and cancel edits. They run against isolated PostgreSQL at desktop/mobile sizes, with an additional Arabic mobile capture. No paid AI calls or production writes are used. Primary integration reference: https://mathlive.io/mathfield/guides/react/.

### Direct visual text formatting — 2026-09-11
Replaced the textarea/source-and-preview pair with a constrained Tiptap rich text field in questions, answers and AI candidate edits. Bold, italic, subscript and superscript now alter the selected text directly while it is being edited; the toolbar remains hidden until hover/focus. Equations render as inline objects and open the visual equation dialog when clicked. The existing stored string format is parsed into text marks and serialized on edits, preserving API/autosave compatibility without a database migration. External paste uses plain text. Only the supported text marks and equation node are enabled, and stored length limits are enforced before applying a change. Question changes remount the editor to isolate undo history.

Regression coverage checks direct formatting without visible syntax, toggling between subscript and superscript, combined bold/italic, undo, save/reload and equation editing. Unit coverage checks compatibility with existing text and safe rendering; AI review tests retain candidate edits. Integration reference: https://tiptap.dev/docs/editor/getting-started/install/react.
