# Activity sharing and feedback

Mode: Operate. Extend the current teacher library, discovery and reporting surfaces.
Authority: app-plan.pdf §§13–14, supplied Kahoot reference, current Teacher Home brief, and the user's explicit sharing/feedback request. The production origin is https://asasera.com.

THESIS: A published activity becomes a reusable teaching resource with a clear path back to its creator.
OWN-WORLD: Existing Asasera Blue, Montserrat/Neo Sans Arabic, theme-aware neutrals, tactile buttons, Lucide icons and existing activity-world thumbnails.
STORY: Preview an approved activity, share or copy it, leave private teacher feedback, then review and act on incoming suggestions.
FIRST VIEWPORT: Activity title and author above a large question preview; compact artwork and sharing/actions alongside. Feedback inbox uses filterable rows and an adjacent improvement panel.
FORM: Local extensions of the existing library and reports; no new visual identity or concept selection.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Guardrails: private drafts stay private; share only the published snapshot. Written teacher feedback is visible to its author and the activity creator. Public ratings are aggregates. Student evidence retains existing query-level privacy thresholds. Arabic/RTL, dark mode, keyboard operation, honest empty states and failure recovery are required. Existing browser access restriction forbids recapture through alternate tools; report that limitation rather than presenting old captures as current.

## Built scope — 9 September 2026

This is a source record of the completed community extension. [DESIGN.md](../../DESIGN.md), [Teacher Home](teacher-home.md) and the current implementation own the visual authority; PRODUCT.md's starter-era guidance does not replace them. The routes and local measurements below extend the teacher world without changing its global tokens. Production application-code deployment is pending, as recorded in [verification](../review/community/verification.md).

## Routes and entry points

| Route or integration | Built behavior |
| --- | --- |
| `/activities/:id` | Public published-activity preview. The header gives the authored title, creator, question count and published version. A question preview with Previous/Next sits beside the theme thumbnail, audience, rating totals, share-link field and role-appropriate actions. |
| `/teacher/feedback` | Teacher-only Feedback & ideas inbox. Activity selection defaults to all owned activities; All, New, Reviewed and Resolved filters show counts. Reviews and question reports share the list, with Previous/Next pagination for 20-item API pages. |
| `/teacher/feedback?activityId=:id` | Filters the inbox to an activity. A selected owned activity adds an adjacent improvement panel and audience-related recommendations. Published activities link to sharing; private ones link to the editor to publish. |
| Teacher sidebar | Adds Feedback & ideas as the sixth primary destination, following Class reports. This is the community extension to the earlier five-destination Home record. |
| Owned activity rows | Add Feedback for every owned activity and Share for published activities, alongside the established Edit and published Play actions. The shared row serves Home and My activities. |
| Activity editor | Feedback and published Share actions save through the existing editor operation before opening their destinations. Inbox edit links can target a reported question with `?question=:id`. |
| `/teacher/discover` | Adds a compact recommendation section before the existing discovery controls and results. Existing discovery behavior remains under the Home/discovery contract. |

Recommendations also appear below shared activities and the feedback inbox. They render for teachers only: up to six items on the shared page and up to three in compact discovery/inbox sections. Each linked item shows its existing theme thumbnail, authored title, creator, question count and at most two written relevance reasons. Links open `/activities/:id`; the empty state offers `/teacher/activities/new`. The section explains that category, stages, countries and eligible classroom reuse inform suggestions and that teacher ratings do not change reuse ranking.

## Sharing and feedback states

The share field is read-only, left-to-right and selects its value on focus. Copy link announces success; clipboard failure leaves the field available for manual copying with a written explanation. Guests receive Sign in to use this activity with a return destination to the same shared page. Signed-in students receive instructions to ask their teacher for a hosted activity or assignment. Teachers can open classroom play or make an attributed private editable copy, which opens in the editor. If copying requires a destination, a purpose selector appears; copy errors remain visible and failed purpose loading offers retry.

Only the activity creator sees the inbox link and Stop sharing and make private action on the shared page. Successful unpublishing replaces the page with a private-state explanation and an editor link. An unavailable, deleted or private activity has a failure message, retry and back link; loading and authentication/context loading have explicit states. Creator-context failure has its own retry action.

Other teachers receive a five-choice radio rating with visible numbers and stars, an optional recommendation checkbox, and optional What worked well / What could be improved text areas (2,000 characters each). One review per teacher can be updated or withdrawn. Submit requires a rating; pending requests disable the fieldset and prevent repeat submission. Failures preserve entered text. A review of an older published version displays a notice, and a version-change rejection offers Refresh activity to review. Saved changes are announced with a status message. The reviewing teacher can read the creator's reply and their own question-report statuses/replies below the activity; this page does not add a new question-report submission control.

Inbox rows show activity title, written status, reviewer, update date, any rating/recommendation and the supplied strengths, suggestion or report reason. Review and edit activity and Classroom evidence links lead to the existing editor and author report. A native Reply and update status disclosure contains an optional reply (2,000 characters), status select and Save response. Replies carry the item's expected revision; a stale update fails with a refresh action instead of overwriting changed feedback. Saving refreshes the inbox and announces the update. Inbox loading, activity-list failure, inbox failure, no feedback and no filter matches have distinct written states and relevant retry, sharing or Show all actions.

The selected activity's improvement panel distinguishes loading, retryable failure, sufficient evidence without a specific revision signal, and insufficient evidence. Available ideas identify a question and published version, quote its prompt and suggest reviewing an easy question, unclear wording/answer key, or unused distractor. Each idea links to that question in the editor; the panel also links to the author evidence report.

## Public and private content

**Published snapshot rule.** Sharing presents the immutable approved version. In-progress edits, source files, answer keys, error explanations, raw media keys and written teacher feedback are excluded from the public payload. The page displays the API's canonical share URL, configured for `https://asasera.com` in production.

**Private conversation rule.** Review text, question reports and creator replies stay between the reviewing teacher and creator. Public social proof consists only of average rating, review count and recommendation count, with an honest no-reviews message when empty. Students and guests cannot write teacher feedback; creators cannot review their own activity. Existing reviews remain in the creator inbox after unpublishing. API withdrawal remains available after unpublishing, while the current on-page withdrawal control requires an accessible shared page.

**Evidence boundary.** Improvement ideas reuse the existing author-report privacy rules: completed live runs hosted by other teachers, at least five participants per eligible class, at least three distinct classes, and suppression of small answer cells. Repeated runs do not create new class identities. The interface presents these as revision signals and explicitly excludes individual student data. These behavior facts are recorded in the [backend implementation note](../../../asasera-backend/docs/implementation/activity-community.md); they do not imply rendered or end-to-end browser approval.

## Source-defined layout, type and controls

The page caps at 1,180px, centers with logical margins and uses 32px/16px/64px top/horizontal/bottom padding. The shared activity pairs a flexible preview with a 310px action column and a 32px gap. An activity-filtered inbox pairs a flexible list with a 290px improvement column and the same gap; the unfiltered inbox has no empty sidebar. Feedback forms cap at 740px and begin after a 48px gap and a neutral top divider. Recommendations use three equal columns with 22px gaps and 16:9 thumbnails.

| Source breakpoint | Layout change |
| --- | --- |
| At or below 980px | Shared activity and filtered inbox stack. Sharing caps at 620px, its cover at 400px. The improvement panel replaces its inline divider/padding with a top divider and 24px top padding. Recommendations use two columns. |
| At or below 600px | Page padding becomes 24px/8px/40px. The header stacks; preview and inbox entries use 18px padding. Section headings and entry headers wrap. Recommendations use one column with 26px gaps. Rating gaps/padding and star size reduce while rating choices retain 48px minimum height. |

The page inherits Montserrat with the existing Neo Sans Arabic fallback. Its local title requests `clamp(26px, 3vw, 38px)`, weight 800 and 1.25 leading; section headings request 21px/750 at 1.4, inbox titles 19px, and question titles `clamp(22px, 2.5vw, 32px)`. Item headings use 17px/700; explanatory text and field labels use 14px, recommendation metadata and status labels use 13px, and relevance reasons use 12px. Page paragraphs use 1.75 leading. These are source-requested local sizes and weights, not additional font assets or changes to the global type ramp.

Neutral content uses `--ink`, `--muted`, `--line`, `--surface` and `--raised` from the existing `.asas` light/dark token layer. Links, focus, status and icons inherit the containing shell's `--accent`/`--accent-alt`; public and teacher shells retain their established values. Local primary links use `--color-brand-500`, white text, `--color-brand-600` on hover and the existing `--press` shadow. Shared Button, Select, LoadingState, FailureState and QuestionInput keep their existing treatments and semantics. Selected ratings pair native radio state and visible numbers with a raised background and `--a3` star fill; written status accompanies all status colors.

Preview, inbox-list and empty containers have flat neutral borders and local 12px corners. Covers use 12px corners; recommendation thumbnails use 8px. Local fields, rating choices and primary links use 6px corners, with 48px minimum field/action height. Forms and improvement content use neutral dividers rather than decorative elevation. The community stylesheet introduces no animation; shared controls retain their existing motion and reduced-motion handling. These local corner values remain surface facts and do not replace the global control/card tokens.

English/LTR and Arabic/RTL strings are present for labels and recovery states. Authored titles, question prompts, feedback and reply text use automatic direction, displayed teacher names use bidirectional isolation, and authored paragraphs preserve newlines and wrap long strings. Logical spacing and grid ordering support the inherited direction. Local links, buttons, inputs, text areas and summaries request a 3px accent focus outline with a 4px offset; native radios, checkbox labels and disclosure semantics remain. Real-browser focus visibility, traversal, wrapping and RTL geometry remain unverified.

## Asset provenance

Shared covers and recommendation art reuse [ThemeThumbnail](../../src/features/activity-themes/ActivityStage.tsx) and the [existing activity-world catalog](../../src/features/activity-themes/catalog.ts). The thumbnail component selects the existing 480×270 WebP derivative, loads lazily and falls back to catalog-colored Classic geometry when absent or failed. Artwork is decorative (`aria-hidden`, empty image alternative text); adjacent authored titles identify the activity.

No new raster, icon family, image-generation request or asset claim was introduced for this extension. The twelve original environments and their existing derivatives retain the [activity-world prompt/provenance manifest](../../src/assets/images/activity-themes/prompts.json) and per-raster sidecars. Classic remains color and geometry. Lucide SVG icons accompany labels or decorative headings and are hidden from assistive technology.

## Evidence and unfinished visual review

Sources: [community components, API adapter and styles](../../src/features/community/), [routes](../../src/App.tsx), [sidebar](../../src/components/teacher/TeacherSidebar.tsx), [owned rows](../../src/features/teacher-home/TeacherHome.tsx), [editor](../../src/features/editor/ActivityEditor.tsx), [discovery](../../src/features/shelf/Shelf.tsx), [design tokens](../../src/design/tokens.css) and the existing global/teacher accent layers.

[Verification](../review/community/verification.md) records the passing component, route, API and regression checks, builds and typechecks. The [single detector run](../review/community/detector.json) returned 15 advisory local type/radius differences and no non-advisory findings. Those advisories are neither new global tokens nor visual certification. This documentation pass changes no implementation and adds no test or browser evidence.

**Finish disposition: recapture.** The [fresh finish reviewer](../review/community/finish-review.md) stopped at evidence check 0: no current community captures exist, and the historical desktop/mobile screenshots show another surface. The outstanding capture matrix is desktop 1,440px and mobile 390px, each in English/LTR light, English/LTR dark, Arabic/RTL light and Arabic/RTL dark. Each combination must show the current shared page and feedback form, the feedback inbox with improvement panel, and relevant recommendations, including expanded feedback/reply controls, applicable empty/error states and visible keyboard focus. Captures must show the document top and settled, readable content.

The established administrator-enforced browser restriction blocks capture; no alternate browser, headless renderer, URL alias or indirect rendering workaround was used. Current appearance, responsive behavior, overflow, RTL layout and real-browser keyboard/focus interaction remain unverified. No fidelity matrix, craft verdict or visual approval is issued. A full finish re-review requires the complete current capture set through a permitted route or supplied by the user; a verdict-scoring pass cannot close this evidence failure.
