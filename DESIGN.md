---
name: Asasera
description: Familiar quiz authoring and a theatrical classroom, with Arabic-first content.
colors:
  brand: "#004ccc"
  brand-dark: "#25076b"
  act: "#1368ce"
  act-press: "#105cb4"
  a1: "#e21b3c"
  a2: "#1368ce"
  a3: "#d89e00"
  a4: "#26890c"
  ink: "#333333"
  muted: "#6e6e6e"
  line: "#cccccc"
  surface: "#ffffff"
  raised: "#f2f2f2"
  answer-dark-ink: "#141821"
  danger-ink: "#b8122f"
  dark-surface: "#222222"
  dark-raised: "#333333"
  dark-sunken: "#171717"
  dark-ink: "#f2f2f2"
  dark-muted: "#b2b2b2"
  dark-line: "#414141"
  dark-danger-ink: "#ff8b9d"
  dark-accent: "#c4a2f2"
  landing-yellow: "#ffcf36"
  landing-yellow-hover: "#ffda63"
  landing-deep: "#002f88"
  landing-tint: "#edf4ff"
  landing-dark-tint: "#1c2c45"
  game-panel: "#102840"
  game-control-ink: "#12304e"
typography:
  display:
    fontFamily: "Montserrat, Neo Sans Arabic, sans-serif"
    fontSize: "clamp(2.5rem, 5.2vw, 4.5rem)"
    fontWeight: 700
    lineHeight: 1.1
  headline:
    fontFamily: "Montserrat, Neo Sans Arabic, sans-serif"
    fontSize: "clamp(1.75rem, 3.2vw, 2.5rem)"
  title:
    fontFamily: "Montserrat, Neo Sans Arabic, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.25
  heading:
    fontFamily: "Montserrat, Neo Sans Arabic, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
  body:
    fontFamily: "Montserrat, Neo Sans Arabic, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "Montserrat, Neo Sans Arabic, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
  caption:
    fontFamily: "Montserrat, Neo Sans Arabic, sans-serif"
    fontSize: "0.75rem"
  landing-headline:
    fontFamily: "Montserrat, Neo Sans Arabic, sans-serif"
    fontSize: "clamp(30px, 3.1vw, 44px)"
    fontWeight: 800
    lineHeight: 1.22
    letterSpacing: "-0.025em"
  landing-action:
    fontFamily: "Montserrat, Neo Sans Arabic, sans-serif"
    fontSize: "15px"
    fontWeight: 700
    lineHeight: 1.4
rounded:
  control: "4px"
  card: "8px"
spacing:
  s-1: "4px"
  s-2: "8px"
  s-3: "12px"
  s-4: "16px"
  s-5: "24px"
  s-6: "32px"
  s-7: "48px"
components:
  button-primary:
    backgroundColor: "{colors.act}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "0 24px"
  button-primary-hover:
    backgroundColor: "{colors.act-press}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 24px"
  button-quiet:
    backgroundColor: transparent
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 24px"
  button-danger:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.danger-ink}"
    rounded: "{rounded.control}"
    padding: "0 24px"
  field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 12px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "24px"
  question-navigation:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "8px"
  feedback-badge:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "2px 8px"
  answer-tile:
    backgroundColor: "{colors.a1}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "12px 16px"
  classroom-stage:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.surface}"
  account-role-teacher:
    backgroundColor: "{colors.a1}"
    textColor: "{colors.surface}"
    padding: "14px 12px"
  account-role-student:
    backgroundColor: "{colors.act}"
    textColor: "{colors.surface}"
    padding: "14px 12px"
  student-join-panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "24px"
  student-join-button:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "12px 18px"
  student-navigation-active:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "12px"
  student-stage-option:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "20px 16px"
  account-avatar:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.ink}"
    rounded: "50%"
    size: "48px"
  account-avatar-open:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.surface}"
  account-menu:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "8px"
    width: "min(288px, calc(100vw - 32px))"
  landing-action-yellow:
    backgroundColor: "{colors.landing-yellow}"
    textColor: "{colors.answer-dark-ink}"
    typography: "{typography.landing-action}"
    rounded: "{rounded.control}"
    padding: "14px 24px 17px"
  landing-action-yellow-hover:
    backgroundColor: "{colors.landing-yellow-hover}"
  landing-action-blue:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.surface}"
    typography: "{typography.landing-action}"
    rounded: "{rounded.control}"
    padding: "14px 24px 17px"
  landing-action-blue-hover:
    backgroundColor: "{colors.landing-deep}"
  landing-action-outline:
    backgroundColor: transparent
    textColor: "{colors.surface}"
    typography: "{typography.landing-action}"
    rounded: "{rounded.control}"
    padding: "14px 24px 17px"
  landing-demo:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
  landing-workflow-step:
    backgroundColor: transparent
    rounded: "{rounded.card}"
    padding: "22px 18px"
  landing-workflow-step-selected:
    backgroundColor: "{colors.landing-tint}"
  activity-theme-apply:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "10px 18px"
  activity-theme-cancel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "10px 18px"
  activity-theme-motion:
    backgroundColor: transparent
    rounded: "{rounded.control}"
    padding: "8px 10px"
  game-control:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.game-control-ink}"
    rounded: "{rounded.control}"
    padding: "12px 18px"
  game-view-control:
    backgroundColor: "{colors.game-panel}"
    textColor: "{colors.surface}"
    typography: "{typography.caption}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
  game-hud:
    backgroundColor: "{colors.game-panel}"
    textColor: "{colors.surface}"
    padding: "12px 20px"
  teacher-create-action:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.surface}"
    rounded: "6px"
    padding: "14px 22px"
  teacher-owned-list:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "12px"
  teacher-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "6px"
    padding: "12px"
  teacher-discovery-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "12px"
---

# Design System: Asasera

## Overview

On 8 September 2026 the user restored the main brand color to Asasera Blue `#004CCC`, replacing `#46178F` throughout the application. All of those live uses now resolve through `--color-brand-500`. Earlier purple classroom descriptions and review captures below document the previous color; this explicit color update takes precedence. The existing layout, answer colors, other theme variants and type system continue to apply.

**Creative North Star: "Familiar quiz authoring and a theatrical classroom"**

Asasera uses the user's Kahoot reference as its visual authority. Authoring is a compact working environment: white controls and rails, gray canvas, a centered question, and colored answer inputs. Classroom delivery expands that same vocabulary into a purple stage with large white question and PIN panels. The four answer colors remain recognizable across authoring, preview, classroom play, and homework.

Arabic leads the content and direction model; Latin uses Montserrat alongside the locally hosted Arabic face. Clear wording, shape, selection outlines, and a separate feedback row carry information alongside color. The interface supports the sequence of authoring, approval, delivery, play, and evidence without making each step a new visual identity.

**Key Characteristics:**

- Asasera Blue Classic or a selected scenic activity world, with a quiet creator canvas.
- Fixed red triangle, blue diamond, yellow circle, and green square answer identities.
- Compact rectangular controls, softly rounded containers, and tactile answer presses.
- Large classroom type, wrapping answer text, and feedback in its own row.
- Mirrored interface chrome with stable image geometry and numeric identifiers.

Recorded from the current code on 7 September 2026. Primary evidence is [the v4 token layer](src/design/tokens.css), [shared components](src/design), [the current activity editor](src/features/editor/Editor.module.css), [session styles](src/features/session/Session.module.css), and [delivery styles](src/features/delivery/Delivery.module.css). [The direction contract](.impeccable/surfaces/asasera-v4.md) records the user's authority. [The earlier visual guide](docs/DESIGN.md) is preserved as history; its blue/teal palette, five-pixel-only geometry, and blanket shadow prohibition are superseded. Legacy lesson-editor files and the unimported `src/styles/design.css` are not the source of the current activity-editor system.

Reference work used the official brand guide and creator screenshots; current live reference access was blocked, so exact current Kahoot pixel parity is unverified. [The final correction verdict](.impeccable/review/verdict-pass-2.md) says ship for the six scored fixes and regression R1 only. It does not certify the whole surface. The refreshed [editor capture](.impeccable/review/editor-hotspot-1440.png) and [teacher capture](.impeccable/review/teacher-intervention.png) support the documented geometry and feedback treatment.

The earlier account/student extension retained that identity in red Teacher and blue Student choices. Its [surface brief](.impeccable/surfaces/student-account.md) records the former single-column `/student` page and account states; the student workspace extension below supersedes that page's composition and behavior. The separate [journey verdict](.impeccable/review/journeys/verdict-pass-1.md) says ship for four scored fixes and corrected focus regression R1 only; it does not certify the current student dashboard, the whole app, every auth screen, backend behavior, or current Kahoot pixel parity.

The later [account/support extension](.impeccable/surfaces/account-support.md) adds a shared profile circle and dropdown, account settings, and a support form within this same world. The direct user request supersedes the earlier non-dropdown and mailto-only scope. Its [finish review](.impeccable/review/account-support/review.md) records **ship for the supplied account/support finish evidence only**. The nine captures and source review do not independently certify header integration outside AccountControl, backend/auth transport, or delivery into the real support inbox. PRODUCT.md's starter-era brand prose does not replace the user's Kahoot pin or this current design record.

### Public landing extension — 8 September 2026

The public landing extends the existing quiz world with a solid Asasera-blue stage, yellow creation action, emphatic bilingual headings, and a playable four-color demonstration. The user's pinned playful Kahoot direction and current Asasera primary remain its authority. This addition applies to `/` and its homepage navigation treatment; it preserves the authoring, classroom, student, and account guidance above. PRODUCT.md remains starter-era context rather than authority for this extension's palette, corners, or typography.

Recorded from [the landing stylesheet](src/pages/Landing/Landing.module.css), [Hero](src/pages/Landing/sections/Hero.tsx), [Experience](src/pages/Landing/sections/Experience.tsx), the landing composition, join and pricing sections, and homepage-only Layout/Navbar changes. The [surface brief](.impeccable/surfaces/landing-playful.md) owns the visitor path, demonstration content, asset provenance, and evidence coverage. The [finish verdict](.impeccable/review/landing-playful/verdict.md) says **ship for its single scored correction only**, removing the redundant standalone demo label; it retains the [original landing review's scope](.impeccable/review/landing-playful/review.md).

### Activity worlds extension — 8 September 2026

Activity worlds extend the established quiz identity with original dimensional scenery around a stable reading and answer plane. Asasera Blue remains Classic and the primary apply action; the four answer colors and SVG shapes, bilingual type, and host/projector/player roles remain stable. The editor presents the chosen scene as a quiet wash, while previews, live play, homework and self-study share its full scenic treatment. This scoped record supersedes the earlier purple-only stage, flat forest/cosmic/coral theme descriptions, and unconsumed-podium observation for these activity-world surfaces; it does not replace the landing, account or other historical records above.

Recorded from [the activity-world components and catalog](src/features/activity-themes/), the current editor, session, delivery and shelf integrations, and [the scoped surface brief](.impeccable/surfaces/activity-themes.md). [Verification](.impeccable/review/activity-themes/verification.md) records five feature checks, four existing editor checks, one advanced editor check and a passing production build. [The finish review](.impeccable/review/activity-themes/finish-review.md) and [its verdict](.impeccable/review/activity-themes/verdict-pass-1.md) say **ship for the two scored picker contrast fixes only**. The supplied desktop, tablet and phone captures support this extension; they do not certify every app flow or benchmark real-device frame rates.

### Educational-games extension — 8 September 2026

Educational games extend the same bilingual quiz world with controllable Three.js arenas between reviewed questions. Jungle Dash, Sky Builders and Treasure Quest reuse the existing jungle, sky and island artwork around original geometric game objects. Asasera Blue remains the pinned brand; solid reading surfaces, the four answer identities and separate written feedback continue through the learning steps. This addition applies to public practice, live classroom games and immediate-feedback self-study; it preserves the preceding landing, authoring and activity-world records.

Recorded from [the game components, catalog and renderer](src/features/games/), [live-session integration](src/features/session/SessionPage.tsx), [delivery setup](src/features/delivery/DeliverySetup.tsx), [self-study](src/features/delivery/LearnPage.tsx) and the [shared game rules](../asasera-backend/packages/shared/src/arcade.ts). The [surface brief](.impeccable/surfaces/educational-games.md) owns the playable sequence and mechanics. [Verification](.impeccable/review/educational-games/verification.md) records 21 passing backend tests, four passing local transport flows and passing frontend/backend builds. The [finish review](.impeccable/review/educational-games/finish-review.md) returns **recapture**: no current-game browser playtesting or visual captures were permitted. Actual WebGL rendering, desktop/mobile presentation, touch behavior, Arabic layout and frame rates remain unverified; historical world captures are not evidence for this renderer. This source record is not visual ship approval or exact Kahoot parity.

### Student workspace extension — 8 September 2026

The student workspace extends the same Asasera Blue identity into a persistent navigation rail, neutral account header and stage-aware learning pages. Kindergarten uses the existing garden artwork, larger actions and simpler wording; school uses a sky adventure; university uses a quieter space image and concise task language. General learning retains the sky image with general learning preferences. These are scoped learner presentations, not separate brands or inferred ages.

Recorded from [the student layout, pages, picker and styles](src/features/student/), [signup stage selection](src/pages/signup/StageStep.tsx), [practice](src/features/games/GamesPage.tsx) and [account-aware self-study](src/features/delivery/LearnPage.tsx). The [surface brief](.impeccable/surfaces/student-workspace.md) owns the student routes, selected stage/optional grade, saved activities and separation of teacher progress from free practice. [Verification](.impeccable/review/student-workspace/verification.md) records passing source builds and API tests. The [finish review](.impeccable/review/student-workspace/finish-review.md) returns **recapture**: browser security policy denied localhost access and no valid student captures were supplied. Old desktop/mobile captures show the teacher editor. This is an implemented-source record; rendered stage variants, EN/AR layouts, focus interactions and phone presentation remain unverified.

### Teacher Home extension — 8 September 2026

Teacher Home extends the existing identity into a colorful, illustrated instructor workspace with readable owned-activity rows and a separate shared-discovery destination. The latest user direction explicitly asks for color, organization, expressive icons and pictures. Asasera Blue, theme-aware neutrals, Montserrat and Neo Sans Arabic remain its visual authority. PRODUCT.md retains the name and bilingual commitments; its starter-era corner and typography guidance does not replace this scoped implementation. The user's rejected screenshot establishes the density problem, not a replacement brand.

Recorded from [teacher Home and its styles](src/features/teacher-home/), [the owned library](src/features/editor/ActivityList.tsx), [creation](src/features/editor/CreateActivity.tsx), [shared discovery](src/features/shelf/Shelf.tsx) and the teacher sidebar/header. The [surface brief](.impeccable/surfaces/teacher-home.md) owns routes, task sequence and content boundaries. [Verification](.impeccable/review/teacher-home/verification.md) records 52 targeted tests, frontend/backend builds, scoped lint and schema/whitespace checks as code validation only. The [finish review](.impeccable/review/teacher-home/finish-review.md) returns **recapture**: current desktop/mobile English and Arabic screenshots are absent because browser access is denied by enforced security policy. Rendered layout, overflow, focus interaction and responsive presentation remain unverified. The 14 advisory detector findings describe local type/radius steps; they do not establish visual approval or change the global token scales. The subsequent [colorful refinement](.impeccable/review/teacher-home-colorful/verification.md) adds an original generated 3D classroom illustration with responsive WebP sources, a blue/yellow creation hero, four colored icon shortcuts and an existing jungle-world image. The earlier recapture limitation still applies; no current rendered capture has been obtained.

## Colors

Saturated classroom colors sit beside neutral working surfaces; the frontmatter records their current values from the v4 token layer.

### Primary

- **Asasera Blue — brand:** classic session ground, activity cover, and identity accent.
- **Deep Purple — brand-dark:** cosmic session ground and the darker purple variation.

### Secondary

- **Action Blue — act / act-press:** primary teacher actions, selected controls, and the darker primary-button hover.
- **Answer Red, Blue, Yellow, Green — a1–a4:** the ordered answer slots; green also supplies the evidence outline. These fills identify options before they report any result.
- **Danger Ink — danger-ink / dark-danger-ink:** destructive action wording and invalid-field messages on the corresponding neutral surface.
- **Registration role cards:** Teacher reuses Answer Red; Student uses Asasera Blue. Each has a large written role, a Lucide icon, a short description and a Continue-as action. Profile-circle role frames follow their separate account-control specification.
- **Dark Accent — dark-accent:** the global theme's light purple `--accent`, retained by account links and historical learner-footer styling. The current student workspace uses its scoped brand and neutral roles below.

### Neutral

- **Working Ink and Muted Ink — ink / muted:** ordinary content and secondary labels.
- **White Surface and Creator Gray — surface / raised:** controls, cards, and the gray central workspace. The v4 raised and sunken roles share the same light gray.
- **Control Line — line:** field strokes, card edges, and rail separation.
- **Answer Dark Ink — answer-dark-ink:** yellow answer wording and the light-theme shared focus outline.
- **Dark Surface, Raised, Sunken, Ink, Muted, and Line:** theme-specific workspace equivalents. Answer slot fills retain their identity in both themes.

**The Paired Identity Rule.** Keep each answer slot's color and shape together: red triangle, blue diamond, yellow circle, green square. Use text and a mark to report correctness.

**The Foreground Rule.** Use white on red and blue answers and dark ink on yellow answers. White on the shared green answer tile requires a bold label of at least 20px; preserve the inherited classroom size when it is larger.

The green foreground safeguard is encoded in `AnswerTile.module.css` as `max(1.25rem, 1em)`. It describes that shared component, not a blanket contrast certificate for every green element in the app. Tonal ramps in the sidecar are swatch metadata; synthesized ramps are not additional UI tokens.

### Public landing palette

The landing reuses Asasera Blue for the hero, teacher illustration, classroom example, and blue actions. **Play Yellow — landing-yellow / landing-yellow-hover** supplies the main creation action, headline emphasis, and selected illustration details; it is separate from the established yellow answer fill. **Stage Blue — landing-deep** deepens the ribbon, blue-action hover, and feedback emphasis. **Lesson Tint — landing-tint / landing-dark-tint** groups joining, selected workflow steps, role cards, and the featured plan with their theme-appropriate ground.

The playable demo stays white with dark wording and stable answer colors in both themes. The source/editor example retains a light readable document ground in dark mode, while the surrounding page inherits theme-aware neutral surfaces. These local presentation surfaces do not redefine dark application cards.

**The Landing Color Roles Rule.** On the public landing, reserve Play Yellow for creation and emphasis; keep the answer-slot yellow and its circle identity unchanged.

### Activity-world palette

Each catalog entry owns a fallback scene color and a decorative particle accent through local `--world-color` and `--world-accent` properties. These environment colors do not replace global brand, action, answer or correctness roles. The catalog is authoritative rather than a second palette duplicated here. Live and preview art use a dark blue veil (`#061324ad`); discovery covers use a lighter veil (`#06132480`). Authoring uses a pale veil (`#edf2f7de`) or its dark counterpart (`#081627d9`), with a solid sunken inner working surface for non-Classic dark editing.

The picker inherits Surface, Raised, Ink, Muted and Line in both themes. Selected gallery options deliberately retain a pale blue ground (`#eaf1ff`) and dark blue wording (`#172e56`), a brand border and a check mark. Its neutral keyboard outlines use the existing `--focus-colour` (Answer Dark Ink in light mode, white in dark mode); save-error wording uses the existing theme-aware `--danger-ink`. Preview answer focus remains white. These corrected picker states do not establish a fixed brand-blue focus rule for dark neutral surfaces.

**The Stable Game Plane Rule.** Change the environment around the question, while retaining solid reading surfaces, the four paired answer identities, written feedback and deliberate progression.

### Educational-game palette

**Game Panel — game-panel** provides the repeated dark ground for the arena HUD, viewing controls, leaderboard and connection notice. **Game Control Ink — game-control-ink** labels white gameplay and practice navigation actions. White wording sits on the panel; the public practice's main action and the tower Drop control reuse Play Yellow. These are scoped game roles, not replacements for the shared teacher-action palette.

The robot, terrain, crystals, traps and tower blocks use local material colors in the renderer. These identify objects and environments; they do not introduce global brand or answer-slot colors. The same game state is also conveyed through resource labels, written event feedback, objective instructions and the simplified board. The current detector's additional palette notices remain scoped advisories, not a reason to turn every scene material into a system token.

### Student workspace palette

Asasera Blue identifies active navigation, primary student actions and inline learning links. The hero practice action reuses Play Yellow; the class PIN panel, saved activities, results and preferences use theme-aware Surface, Raised, Ink, Muted and Line. Progress metrics have neutral one-pixel borders, without decorative colored edges. Generated garden, sky and space scenery remains local imagery; the dark directional hero veil and its hover shades are not global palette additions. Current student neutral focus uses a brand outline, with white focus on the hero action. Source-defined focus and fixed local error colors still require permitted light/dark inspection; they are not a contrast certificate.

### Teacher Home palette

Home uses a solid Asasera Blue hero with white heading, pale-blue support copy, and a Play Yellow creation action with dark wording. Its pale-blue illustration panel displays original classroom artwork. Blue, teal, yellow and red tinted icon blocks distinguish My activities, Explore, Homework and Reports; darker theme-specific tints keep their labels readable. The discovery invitation is teal and the wheel invitation is yellow. Library creation links and published-row Play actions retain Asasera Blue with white wording and the existing darker brand hover. Shared form submission and discovery copy actions retain the shared Action Blue button. Owned rows, creation forms and discovery cards use the theme-aware surface, ink, muted and line roles; text links and keyboard outlines use the theme-aware accent. Published status pairs the alternate accent with a written label and dot. The discovery question-count overlay's dark ground (`#102444`) is a local image-label treatment, not a new brand token.

## Typography

**Display and Body Font:** Montserrat for Latin, with locally hosted Neo Sans Arabic for Arabic, then a sans-serif fallback. `main.tsx` loads Latin weights 400, 700, and 900; `src/styles/tokens.css` declares the Arabic files.

**Character:** Latin is broad, geometric, and emphatic. Arabic remains script-specific with normal letter spacing. The working scale is compact; the classroom scale increases the question and answer mass.

### Hierarchy

- **Display:** the shared stage ramp, used for a projector variant. Live session answers have their own responsive size and pass that size through to their labels.
- **Headline:** the fluid activity-list heading step.
- **Title:** dialog and prompt hierarchy; the current creator prompt also has a larger fluid override.
- **Heading:** section titles, state titles, and property-group emphasis.
- **Body:** running content and shared inputs, with the Arabic-friendly body leading where applied.
- **Label / Caption:** control labels, hints, counters, and metadata. The smaller steps do not replace answer wording.

**The Inherited Answer Size Rule.** An answer label inherits its tile's size. The green minimum may enlarge a small label, but it must never reduce a classroom label to the minimum.

**The Separate Feedback Rule.** Answer glyph and wording share the main row. Correctness text and trailing feedback wrap into a contained row beneath them at the small-label size.

Current limitation: Neo Sans Arabic's heaviest declared file is a real 500 cut mapped to requested weights 500–700. The build disables synthetic weight. This mapping is an implementation constraint, not proof of a genuine Arabic bold or a rule to reproduce when better font assets become available. The earlier guide's Noto Sans Arabic/HK Grotesk pairing is historical.

The student workspace scopes its page title to `clamp(28px, 2.5vw, 40px)` at requested weight 800. The illustrated heading uses `clamp(28px, 3vw, 40px)` at 900; join and section headings use 24px and 22px. PIN digits use 26px/800. Body and action wording use 14px, with 12px metadata and hints. Kindergarten requests larger headings and 15px action/hero wording; university uses a 36px illustrated heading. The 640px phone rules and Arabic leading overrides remain local in the student stylesheet. Small text was raised during the static pass; remaining contextual type advisories and the existing font-file limits are not visual legibility approval or new global scale steps.

Account settings retain the student's fluid page-title range and use 24px section headings. Support uses a `clamp(28px, 3vw, 40px)` heading and an 18px introductory paragraph. The profile initial is 18px/700; the menu name is 16px, action labels are 14px/700, and identity metadata and form hints are 12px. The avatar and support-intro 18px notices were advisory in the scoped finish review; these are intentional local sizes, not a new shared scale step.

### Public landing hierarchy

The landing inherits Montserrat and Neo Sans Arabic and requests emphatic 800-weight headings. Its repeated section-heading and action roles are scoped frontmatter additions. Hero lettering has a local fluid range (`clamp(40px, 4.65vw, 68px)`), tight Latin leading (1.08), and a phone size (39px); Arabic removes heading tracking and increases hero leading (1.3). Section headings reduce to 29px on phones. These overrides describe the landing, not the creator's type ramp or a newly supplied font weight.

The playable answers stay large (21px, 20px on phones), while explanatory feedback sits below the answer grid. The workflow editor's miniature answers retain 20px wording and use full-width rows on phones. Buttons, short metadata, and explanatory paragraphs remain subordinate to the question and answer text.

### Activity-world hierarchy

Worlds retain the inherited Latin/Arabic family and classroom scale. Picker titles request 24px/800, reducing to 21px at tablet width and 18px on phones; the illustrated world's name uses 22px/800, reducing to 20px on phones. Sample answers remain 20px/800 in every picker layout, while the phone prompt uses 18px with 1.4 leading. Gallery labels are 13px/700; descriptions, provenance and footer status remain subordinate. These are local picker roles, not additions to the app-wide font scale or new font assets.

### Educational-game hierarchy

Games retain Montserrat and Neo Sans Arabic. The arena heading requests a fluid 24–38px size at weight 900; gameplay numbers use tabular figures, and the HUD's supporting labels remain at the existing 12px caption step, including at phone width. Instructions and event text sit outside the canvas, with 1.7–1.8 leading on explanatory paragraphs. Public practice answers request 24px/800, reducing to 20px on phones, and allow wording to wrap. Arabic practice introductory headings increase leading to 1.4.

Other local game sizes and requested weights describe this implementation rather than a new shared ramp or newly supplied font assets. The detector's pinned Montserrat warning and type advisories do not establish a visual or Arabic legibility verdict. The existing Arabic weight-file limitation remains applicable.

### Teacher Home hierarchy

Home, library, creation and discovery share the inherited bilingual font family. The colorful Home greeting uses 24–30px and its hero headline uses 28–38px at weight 800; recent-work and inspiration headings use 20px, dropping to 18px on phones. Shortcut titles use 14px, dropping to 13px on small phones, with 12px supporting labels on larger screens. Library, creation and discovery retain a fluid heading size (`clamp(26px, 2.6vw, 38px)`), weight (800) and leading (1.25); section headings request (21px/750), becoming (19px) on phones. Owned titles use (17px/700), becoming (16px), while metadata uses (12px), field/action labels use (14px), and supporting copy uses (16px) with generous leading (1.65). Empty-state titles (23px), discovery titles (20px) and the discovery invitation (18px) are local roles. These requested sizes and weights are intentional scoped facts, not new shared type steps or font assets; Arabic rendering still awaits current captures.

## Layout

The current activity editor fills the viewport and separates toolbar, question rail, canvas, and properties. Its desktop columns are 180px, a flexible center, and 280px; the center is capped internally at 1080px. Rails scroll independently. Below 1025px both rails become drawers, each capped at the smaller of 320px and 86vw; the canvas keeps the full working width. At 700px the toolbar wraps and canvas padding becomes compact. Answer inputs switch to two columns from 720px.

The legacy lesson editor still defines a separate 184px/288px rail composition with 1100px and 820px transitions. Those measurements are not the v4 activity-editor contract.

The classroom uses a centered play area capped at 1600px, a two-column answer grid, and a full purple background. Below 701px the answer gaps and question panel contract while the two-by-two choice structure remains. The PIN panel keeps the code and QR together at this breakpoint. Shape-only player controls use more of the phone height, retaining the full answer in the accessible name.

Delivery settings use three mode choices and a two-column settings group; both become single columns at 640px. Shared content uses the four-pixel spacing rhythm in the frontmatter. Source-specific dimensions remain local rather than becoming extra spacing tokens.

The student workspace uses a sticky, viewport-height 232px rail beside a flexible page and an 80px neutral account header. At 1120px and below the rail narrows to 200px; at 900px and below it becomes normal-flow, horizontally scrollable navigation above the header. Main content centers within 1520px with 32px top, fluid 20–48px inline and 60px bottom padding. The home page pairs a wide illustrated practice invitation with a neutral PIN panel in 1.8fr/1fr columns, then begins real saved work and three game choices. At 640px the hero/PIN pair stacks, game choices become thumbnail/text rows, activity actions wrap below their details, forms and stage options become one column, and main padding becomes 24px/16px/40px. Preferences cap at 820px. Kindergarten increases navigation/action targets. These source-defined dimensions belong to the learner surface and await permitted responsive captures.

The account dropdown anchors to the circle's inline end, 10px below it. Its width is capped at 296px and the viewport minus 32px; an internal scroll region uses the measured space below the trigger, leaving 20px at the viewport edge with a 120px minimum. Identity text wraps anywhere and the menu contains overscroll. Signed-in public headers sit in sticky normal flow below the verification strip; the anonymous public header retains its fixed placement. This integration is recorded from implementation, outside the finish review's independent scope.

### Shared dropdowns

The user's September 8 dropdown reference supersedes the browser-native open-menu treatment. [Select](src/design/Select.tsx) and [Dropdown styles](src/design/Dropdown.module.css) now own selections across creation, editing, discovery, delivery, reports, student preferences and account registration. Account and live-session action menus share the palette, shadow and row treatment. The earlier role-gradient profile frames stay in place.

Closed controls have a 48px minimum height, 8px corners, a visible chevron and a two-pixel blue focus ring. Open lists align to the field with an 8px gap, 12px viewport collision margin, 12px corners and a soft shadow. Rows have seven-pixel corners and at least 44px height, increasing to 48px on phones. Selected rows combine a blue tint, stronger text and a checkmark. These are scoped dropdown radii, not a replacement for the other component scales. Long text wraps, the list scrolls within the available height, and menus stay inside native dialogs or fullscreen containers when needed.

The light palette is white with navy #24364f text, #5e6c80 supporting text, #7d91ac boundaries, #eef4ff hover and #e6efff selected fill with Asasera #004ccc accents. Dark equivalents are #222a38, #f0f5ff, #b2c0d5, #7286a3, #2d3c53, #263f65 and #a8ccff. Shared `--dropdown-*` variables keep the menus consistent. Montserrat and the local Arabic face remain unchanged; labels use 16px/600 and list items use 16px/500, rising to 700 when selected.

Lists with eight or more entries expose search; registration reference fields always expose it. Search supports Arabic diacritics and supplied bilingual keywords. Base UI supplies selection, focus, dismissal and form inputs; existing API IDs, disabled options, grouping, required fields and validation callbacks remain connected. Entry uses a 140ms opacity/4px transition and respects reduced motion. [Verification](.impeccable/review/dropdowns/verification.md) records synthetic interaction checks and source checks. Browser policy still prevents current rendered desktop/mobile approval.

Settings center within 800px, with 40px/24px/64px top/inline/bottom padding and a 560px name form. Sections use 32px vertical spacing and horizontal dividers. At 640px the page padding becomes 24px/20px/48px and sections use 28px. Support centers within 1100px, pairing an introduction and form in .8fr/1.2fr columns separated by 64px. Name and email share a row. At 700px both grids stack, the outer padding becomes 48px/20px, and the main gap becomes 32px. Standalone contact pages reserve 152px above content for the anonymous header, or 48px when signed in; phone values are 128px and 32px respectively. These offsets and widths remain surface-specific.

**The Stable Geometry Rule.** Mirror interface chrome through logical start/end properties. Keep image regions and their coordinates in the same physical image frame; numeric PINs and coordinates retain left-to-right presentation.

### Public landing layout

Landing content centers in a 1240px maximum container with 32px side gutters. At 800px and below the gutters become 20px; hero and workflow columns stack, the join strip centers, and teacher/student cards become one column. The hero uses .95fr/1.05fr columns and a 64px gap on desktop, contracting to 32px at 1100px. The stacked demo is capped at 580px. Its playable answers retain two columns on phones; only the workflow's editor example becomes one column at 480px. Pricing moves from four columns to two at 1100px and one at 480px. The join field and action also stack at 480px.

Within the demo, question wording and its photo share two equal columns above the answer grid. At 480px and below they stack, with a centered photo capped at 280px and centered question wording. The photo keeps its full 3:2 frame with contained fitting; its generated-image caption remains beneath it. Question count and progress share a metadata row above this pair. These photo dimensions remain local to the landing demo.

The homepage's solid neutral header is 80px tall, with a separator and no glass or floating navigation shadow. Anonymous landing content reserves that height; authenticated content uses the existing sticky header flow. The homepage omits the anonymous Aurora background. These route-scoped adaptations retain the shared header's language, theme, navigation, and account controls. Logical alignment mirrors Arabic structure; join codes, example codes, formulas, and score values preserve their intended reading direction.

### Activity-world layout

The native picker dialog is capped at 1160px and 94dvh, with 16px outer gutters, a 1.5fr/1fr preview/gallery split and a sticky action footer. At 800px and below it stacks the preview over a three-column gallery, uses 10px outer gutters and lets footer status occupy a full row. At 480px and below the gallery becomes a horizontally scrollable strip of 132px options, preserving the two-column sample answer grid and a compact 250px minimum preview. Native radio controls retain keyboard selection in Arabic RTL; text alignment and footer positioning use logical direction.

Scene images cover a centered frame and may crop at the sides. The responsive picture uses the mobile derivative through 700px; gallery and discovery images use 16:9 thumbnails. Live scenery is fixed behind the viewport, with controls and content above it. The editor retains its existing rails and canvas geometry, and scene changes never alter question-image coordinates. Preview PINs retain left-to-right digits. On live phones the motion control keeps its accessible name while its visible wording is hidden.

### Educational-game layout

The arena centers within 1440px. Its play column sits beside a 260px leaderboard with a 24px gap; without a leaderboard the play area uses one column. At 1000px and below the sidebar becomes 210px and the gap 16px. At 720px and below the header and main layout stack, the leaderboard displays up to four entries in two columns, and the game viewport uses a 360px height. Above that breakpoint the viewport uses `clamp(330px, 48vw, 520px)`.

The HUD precedes the viewport; written events, touch actions and objective instructions follow it. Setup offers four game-mode radio options in a grid that becomes two columns at 1000px. Public practice offers three options, stacking them as thumbnail/text rows at 720px; its two-column answer grid remains intact. These are source-defined responsive behaviors awaiting current-game captures.

**The Physical Game Controls Rule.** Mirror bilingual interface wording while retaining left-to-right physical controls and board coordinates, so Left and Right continue to describe movement in the arena.

### Teacher Home layout

The shared teacher page centers within (1180px), with (28px/12px/48px) top/inline/bottom padding. Colorful Home overrides top padding to 12px. A greeting precedes the blue hero, whose text and illustration use 1.05fr/1fr columns. Four shortcuts form one horizontal navigation group below it. Recent work and classroom inspiration use a flexible/290px grid with a 28px gap, narrowing to 260px/20px at 1190px. At 800px the hero and content stack; the inspiration area uses two columns until 520px, when it becomes one and shortcuts become a two-by-two group. The illustration uses contain framing, not subject cropping. Shared activity rows still wrap at 1150px; at 760px they use 16px padding and thumbnails shrink from 84×64px to 64×56px. Creation caps at 760px and stacks its subject/stage fields at the same breakpoint.

Discovery caps at (1120px), with a three-column card grid and (24px) gaps. The grid becomes two columns at (1200px) and one at (640px); filters use an automatically fitting grid with a (220px) preferred minimum. Its covers keep a (16:9) frame. Owned rows remain title-led, and discovery cards remain preview-led. These local dimensions do not extend the global spacing scale. The existing teacher shell and mobile drawer continue to host the simplified navigation; source-defined wrapping and mirroring remain unverified in a browser.

## Elevation & Depth

Depth is functional and tactile. Shared cards use a border without ambient elevation. Primary actions and answer tiles have a bottom inset edge; pressing moves a control down by that edge's depth. The creator adds a small toolbar and preview shadow, and the classroom uses a short bottom shadow under white question/PIN panels. These are native to the requested quiz interface; the historical no-shadow rule does not apply.

### Shadow Vocabulary

- **Press:** `0 2px 4px rgba(0,0,0,.15), inset 0 -4px 0 rgba(0,0,0,.25)` — shared primary controls and answer tiles.
- **Answer hover:** `0 4px 8px #0003, inset 0 -4px 0 #0004` — shared tile hover without changing the answer fill.
- **Stage answer edge:** `inset 0 -4px 0 #0003` — creator and live session answer treatment.
- **Creator toolbar:** `0 2px 4px #0000001a` — toolbar separation from the canvas.
- **Question panel:** `0 4px 0 #0002` — the classroom's white question surface.
- **Drawer separation:** `0 0 40px rgba(0,0,0,.25)` — the current editor's temporary rails.
- **Account menu:** `0 8px 24px #0003` — a temporary menu above the neutral page, with no corresponding elevation on ordinary settings sections.

**The Pressed Key Rule.** Primary actions and shared answer tiles move down by 4px on press as their inset edge disappears; avoid an unrelated lift or bounce for that same state.

Shared selection changes use 100ms, ordinary states 200ms, and dialogs 300ms with the standard decelerating curve. The live distribution bars grow over 600ms with an 80ms step between bars; the direction contract retains a 400ms reveal pause. The declared podium spring is not recorded as a shipped motion rule because the sampled session implementation does not consume it. Reduced-motion rules suppress travel and animation while keeping state text and feedback visible.

### Public landing depth and motion

Landing actions reuse the shared press shadow, with a local 3px downward active movement and a residual one-pixel inset edge. This is a landing-specific variant of the shared pressed-key behavior. Demo answer buttons use a five-pixel inset edge, a slight hover lift, and the same three-pixel press. The white demo has a diffuse stage shadow (`0 18px 46px #00194a55`); the source-paper example has a smaller document shadow (`0 7px 18px #002f8814`). Role and plan containers remain flat.

The stage entrance runs once (650ms, `cubic-bezier(.16,1,.3,1)`); feedback has a short reveal (240ms, ease-out). Action states use 160ms and workflow selection 180ms. Completion may trigger a finite confetti burst after user advancement and a positive score; loading that optional effect cannot block results. Reduced motion removes landing animations and transitions and suppresses confetti. Content stays visible throughout.

### Activity-world depth and motion

Original raster environments supply the dimensional material. The scene fades in over 450ms after loading; a slow 30-second alternating camera transform provides depth. The camera rests during the live `question_open` phase, including homework and self-study. A marked question surface settles from a small perspective offset in 380ms using `cubic-bezier(.16,1,.3,1)`; the preview uses the same arrival when the selected world or preview phase changes. This is CSS motion over generated scenery, not a real-time 3D engine.

Atmosphere is bounded to twelve decorative particles per scene, with transform/opacity animation lasting 14–26 seconds. Catalog ambience selects motes, clouds, bubbles, stars, snow or embers. Editor motion is always off. The stage suppresses its CSS animation and transitions when offscreen, hidden, paused or reduced; scenery falls back to a still frame. The shared Pause/Resume motion preference persists in browser storage and synchronizes within and across tabs. If storage writes fail it still works in the current tab. Device reduced motion overrides the preference and disables the toggle with an explanatory label.

Preview answers have an inset five-pixel edge and a 130ms state transition, pressing down 3px with a slight tilt. Live themed answer presses also move 3px with a smaller tilt; these scoped variants supersede the shared four-pixel press for those controls. Preview podium blocks rise over 550ms with a short stagger (0/120/60ms in display order). The existing live podium now consumes a 1200ms vertical entrance and finite 90-particle confetti burst when motion is enabled; disabling the preference cancels the podium animation and resets confetti. The source's hidden/offscreen suppression applies to stage CSS, while this live JavaScript effect is gated by the preference and reduced-motion state. No frame-rate measurement is implied.

**The Resting Challenge Rule.** Keep authoring still, settle question arrival quickly, pause the scenic camera during open live questions, and let the motion preference or reduced-motion setting suppress travel without hiding learning state.

### Educational-game depth and motion

The new arenas use Three.js geometry, lighting and shadows; the surrounding activity-world artwork remains the earlier raster scenery. Gameplay controls have a five-pixel inset edge and move down 3px over 100ms ease-out when pressed. Device reduced motion removes that press travel and transitions, initially selects the simplified board, and suppresses decorative foot motion, crystal rotation/bobbing, hit wobble and chest wobble in 3D. Essential moving blocks and player-position feedback remain when the learner chooses 3D view.

The renderer loads on demand and uses reusable native geometry with cached materials, a pixel ratio capped at 1.5 and one 1024px directional shadow map. A slow-frame heuristic reduces the pixel ratio to 1 and disables shadows; rendering pauses while hidden or offscreen. Teardown disconnects observers and disposes geometry, materials and the renderer. WebGL failure selects the functional board, with an explicit 3D retry action. These are implementation bounds, not measured frame-rate or device-performance claims. Sound is off until the user enables it.

### Student workspace depth and motion

The student hero uses still scenic artwork beneath a directional dark veil. Blue and yellow student actions retain a four-pixel inset edge and move down 2px on press over 140ms; active navigation uses a three-pixel inset edge. Game-choice cards lift 4px and gain a small shadow on hover over 180ms. Other panels remain flat with neutral borders. Reduced motion removes student transitions and press/hover travel while keeping controls and content available. These local behaviors extend the shared tactile vocabulary without replacing its four-pixel press elsewhere.

### Teacher Home depth and motion

Owned lists, creation forms and discovery cards stay flat with neutral borders. The library creation link has a small shadow (`0 3px 5px #003b9e30`) and lifts (1px) on hover over (180ms). The Home hero action lifts 2px over 180ms; its jungle preview zooms to 1.035 on hover over 500ms. No dashboard animation runs continuously. Reduced motion removes these transitions and travel. Row actions change their background without movement. Shared submission/copy buttons retain their existing tactile treatment. These local creation-link states do not replace the shared pressed-key rule.

## Shapes

Controls use the small radius and containers use the card radius. Current question previews and white stage panels also use the control radius; the distinction is not a command to round every rectangle identically. Fields and shared cards have a single neutral border. Active question previews use a stronger blue perimeter, and answer controls use a bottom edge.

**The Four Shapes Rule.** Draw the answer symbols as SVG geometry and keep their identities stable as they scale. They are answer markers, not general-purpose decorations.

Circular timer rings, QR content, and the stage's low-contrast circle/rotated square are local functional or scenic forms. They do not introduce pill controls or a second corner scale.

The account avatar is a deliberately circular identity control with a single border. The dropdown keeps the existing container corners and its rows keep the control corners. This local circle does not change the rectangular form language of actions and fields.

The public landing retains the control/card corner roles. Its quiz and workflow examples pair the four SVG answer shapes with their colors; the teacher illustration and ribbon repeat that same quiz vocabulary. Low-opacity circles and rotated squares are local stage scenery, while workflow ordinals are circular labels. These surface-specific illustrations do not replace the shared answer-marker rules or introduce a new control geometry.

Activity-world thumbnails, scene viewports and controls retain the existing control/card corner roles. Classic thumbnails use quiet rectangular and circular scenery; particle circles and preview podium silhouettes are local environmental forms. Generated landscapes remain images rather than replacement answer symbols.

Educational-game controls, mode options, panels and simple-board tiles use the existing control radius. The HUD's top corners and viewport's bottom corners form one joined frame. The robot, crystals, tower and island use native box, octahedron and low-poly rock geometry; these are game objects, while answer symbols retain their established SVG identities. No new raster assets were created for the games.

Teacher Home's component tokens record local corners: softly rounded owned lists, empty states, forms and discovery cards (12px), creation links, fields and small thumbnails (6px), and Edit/Play row actions (5px). The question-count overlay retains (4px) corners. The colorful Home hero and greeting/empty icon holders add local 16px corners; shortcut icons use 12px (10px on small phones), while the wheel icon is circular. These are scoped implementation facts behind the detector advisories, not replacements for the global control/card radius roles. Theme-thumbnail artwork remains the existing catalog asset or Classic geometry.

## Components

### Buttons

Compact, tactile actions with centered labels. Shared buttons have a 48px minimum height, control radius, and horizontal spacing from the large inner-spacing step. Primary is Action Blue with a darker hover and press edge; secondary is a bordered neutral surface; quiet is transparent until hover; danger uses Danger Ink and changes to the red answer fill on hover. Focus is a 3px outline with a 2px offset. Disabled buttons reduce opacity and use an unavailable cursor. Loading retains the label and marks the button busy.

### Inputs / Fields

Neutral surfaces with visible labels, a 48px minimum height, a single border, and control corners. Hover strengthens the border; keyboard focus adds the offset outline and blue field border. Invalid fields pair the danger border with a written error and an SVG alert mark. Disabled fields use the sunken surface. Compact editor subfields have local sizes; the shared field is the canonical input.

### Cards / Containers

White or dark theme surfaces, card corners, neutral border, and 24px internal padding. Shared cards rest flat. Lesson covers and stage panels have their own evidence-backed treatments. Do not reintroduce removed decorative side accents into ordinary evidence or feedback containers.

### Navigation

The editor's question rail uses rectangular previews with an ordinal, up to two lines of prompt, and a miniature four-color strip. Active previews gain a blue perimeter and pale blue fill; hover changes the neutral ground. Keyboard focus remains visible. At the drawer breakpoint the same ordered navigation moves into a dismissible side region rather than reducing the canvas width.

### Chips / Feedback Badges

The recurring badge is answer feedback: small bold dark text on a neutral surface with control corners, an SVG check or cross, and compact padding. Within an answer tile it occupies its own full-width row and wraps long text. It is a result label, not an independent clickable filter.

### Answer Tiles

Each slot binds fill, foreground, and SVG shape. The shared tile wraps long wording and has the control press behavior. Idle, selected, pending, correct, and incorrect are distinct states; selection is not correctness. A correct response adds a mark, words, and outline. An incorrect response dims its slot and still names the result. The green label has its contrast-driven minimum while inheriting a larger stage size. Shape-only phone tiles keep a name containing both shape and answer text.

### Classroom Stage

Classic uses Asasera blue (#004ccc); selected activity worlds retain their original scenery. A compact dark-blue header keeps the join address/PIN, centered brand, participant count, sound, fullscreen and native options disclosure available. The teacher's yellow progression action is separate from secondary controls. Projector and student views receive no teacher actions. Sound and fullscreen have independent controls.

The live question has a centered white prompt panel, live response count, large deadline timer and a two-column answer grid toward the bottom of the available screen. The prompt scales from 28–64px, with a 25px narrow-phone override; answer labels scale from 22–48px and use 20px on narrow screens. Long content may grow the page instead of clipping. Student choice questions retain large shape-only keys with full accessible names. Correctness, pending submission, received answers and expired time have written feedback. Result bars use the option's existing color identity, real counts and the whole class as the denominator; zero responses have zero-length bars. Timer and PIN use tabular numerals, and interface mirroring preserves physical answer identities.

Scoped navy surfaces, blue-tinted secondary text and the yellow next action support the existing brand and answer tokens. The hard bottom edge on that action follows the established pressed-key rule. Existing question arrival motion and reduced-motion controls remain. A native “How to play” disclosure below the lobby explains each selected game's actual controls, resources and separate game points, using existing world thumbnails. The [reference adaptation record](.impeccable/review/live-question-reference/verification.md) distinguishes the supplied Kahoot reference frames, passing functional checks and the outstanding browser inspection; this source contract is not visual approval.

### Delivery Choices and Dialogs

Mode choices are radio-backed, bordered rectangles with a stronger bottom edge; a selected choice adds an Action Blue border and a light blue tint. The settings grid collapses on phones. Shared dialogs use a neutral card surface over a scrim, a visible title, and grouped actions; the native delivery dialogs retain their own compact control-corner treatment. The named-dialog correction is covered by the scoped review verdict, not a general assertion about every dialog behavior.

### Account Choices and Student Workspace

Role choices keep a centered white label and a small illustration in the inline-start corner on their red/blue fills. The two-column grid has an 11px gap and a 112px minimum card height, becoming one column below 20em. Account controls continue the existing auth styles; their local geometry and hover behavior do not redefine shared button tokens.

The student navigation contains Home, My activities, My progress, Play & learn and Learning preferences, with icons, labels and the current route state. Account settings and help sit at the rail foot on desktop; the account header retains language, theme and profile controls. The workspace has a skip link, account/loading gates, an overview error with retry, and the existing verification banner below its header. Native navigation replaces the former standalone learner page; its legacy screenshots are not current evidence.

The neutral class panel uses a labeled, centered, left-to-right numeric PIN input and blue Join now action. It normalizes Arabic/Persian digits and reports invalid six-digit input in words. The activities page saves a complete teacher link, shows written failures, and presents search, status filtering, native answer-count progress and Start/Continue/View activity links. Empty states offer a next action without inventing work. Progress reports actual started/submitted activities and saved answers; correctness appears only when feedback is released, otherwise the row says Waiting for feedback. Free game practice stays explicitly separate from teacher reports.

Signup and Learning preferences share a native radio group for Kindergarten, School, University and General learning. Selected cards pair a brand border with a check mark; keyboard selection remains native. An optional grade/year select belongs to the chosen stage, and switching stage clears it. Saving preferences updates the workspace presentation and stage/grade practice bank; teacher-chosen questions remain unchanged. Grade can be cleared and General learning is available. No birth date, age or consent inference belongs to this control. Pending, error and saved states use visible wording.

The sidecar replaces the obsolete purple student PIN specimen with the current neutral panel and adds scoped student navigation and native-stage specimens, retaining the other existing examples. They require no React or utility-CSS runtime; application routing, profile persistence and grade-reset behavior remain in the source.

### Account Menu and Settings

The profile circle shows the saved name's first grapheme, isolated for bidirectional text, or a neutral SVG person when no name is available. Hover and open states use Classroom Purple with a white foreground. The menu begins with name, wrapping email, and role. Teacher destinations are Workspace, My activities, Assignments, and Reports; student destinations are Your learning and Join a class. Both continue with Account settings, Reset password, and Contact support, then a separator and Sign out. Rows have 44px minimum targets and 10px/12px vertical/inline padding. Sign out stays a neutral menu row and changes to a disabled pending label while leaving.

Opening focuses the first item; Arrow Up from the trigger opens on the last. Up/Down wrap, Home/End jump, and Escape closes and returns focus to the circle. Tab, outside pointer interaction, focus leaving the control, and route changes dismiss the menu. Hover and focused rows use the raised surface. The account control and settings scope the shared 3px focus outline with a 2px offset to their own elements.

Settings place editable display name first, with a hint, written validation, save action, and persistent saved status until the next edit. Email verification and role follow as details, then profile-completion access, password recovery, support, and the existing deliberate deletion flow. Student stage/grade editing now opens `/student/profile`; the teacher continuation remains `/complete-profile`. Account and support forms use neutral 48px fields and theme-aware danger borders with written errors; their local error treatment does not require the shared field's SVG alert mark. Settings links use the global accent and an underline. Password recovery continues the existing emailed-token screens; visual documentation is not a transport certificate.

### Support Form

The landing contact section and `/contact` share labeled Name, Email address, optional Organization, and a vertically resizable message field. The support recipient stays visible beside the primary blue action. Labels, hints, inline errors, pending text, and the success panel communicate state in words. Validation focuses the first invalid field. While sending, fields are disabled and the form reports busy; failure preserves the draft and offers retry or direct email. API success replaces the form with a neutral bordered confirmation and a Send another message action. The UI's success copy follows API acceptance; inbox delivery remains outside the visual review.

Both surfaces inherit light and dark neutral tokens. Dark focus becomes white and invalid fields use the dark danger color; the profile's open purple and white state is unchanged. Logical alignment and wrapping support Arabic RTL; email inputs remain left-to-right while names and messages use automatic direction, and displayed identities use bidirectional isolation. The menu has no added entrance animation; support and settings actions inherit the shared button's motion and reduced-motion behavior. The sidecar extension retains all eleven prior examples and adds an independent support-form specimen for visual inspection; submission behavior remains in the application.

### Public Landing: Playable Demo and Workflow Explorer

The landing's yellow, blue, and outline actions share the control radius, a 52px minimum height, and the landing-action type role. Yellow leads creation; the white outline action scrolls to and focuses the demo. Blue actions continue workflow, replay, join, signup, and contact paths. Focus uses a three-pixel outline with a four-pixel offset, changing to yellow on the stage and blue inside its white demo. Compact feedback and plan actions have local 44px and 46px minimum heights.

The demo identifies itself once in its top bar as three sample questions requiring no account, alongside a compact New questions control (36px minimum height). Each round draws from 80 bilingual questions across eight photo topics, choosing three distinct topics and shuffling answer positions while keeping each slot's color and shape paired. The most recent 24 question IDs are retained in browser storage to avoid immediate repeats; an in-memory fallback keeps variation usable when storage is unavailable or invalid. New questions and the completion action, Try another round, explicitly reset the score and selection and draw a fresh round.

Eight local generated WebP photos (960 × 640) accompany the questions. Each uses relevant bilingual alternative text and a visible AI-generated image caption. A failed image is replaced with a labeled fallback in the same frame while the question and answers remain playable. Asset provenance and prompts live with [the photo assets](src/assets/images/landing-quiz/); the [photo extension review](.impeccable/review/landing-photo-quiz/review.md) and [verification record](.impeccable/review/landing-photo-quiz/verification.md) define the supplied evidence and its scope.

Answer selection locks further changes, preserves a clear selected outline, marks the correct answer, and presents a written explanation in a polite live region below the grid. Explicit advancement focuses the next question or result heading without stealing focus at page load. Completion shows the user's score and offers another round or teacher signup. Language and theme changes preserve the current questions, answer order, score, and selection. Demo play and history stay local; the quiz needs no provider API or secrets and neither starts a classroom session nor submits results.

Workflow choices are actual buttons with pressed state and a controlled preview region. Selection updates the source, editor, or classroom example and the teacher-signup action wording. The selected button uses Lesson Tint, a blue border, and a blue numbered circle. The examples stay visibly identified as examples, including the classroom code. The join strip retains its labeled left-to-right field, normalization, six-character validation, written error, and join-route handoff. Teacher/student links, existing price facts, and the shared support form keep their established destinations.

**The Demonstration Identity Rule.** Keep the public landing's sample quiz and workflow previews visibly identified, and retain written feedback alongside their color and shape states.

The sidecar preserves all twelve prior component specimens and adds the three landing action variants, a demo specimen, and a selected workflow step. These standalone HTML/CSS examples show the current visual states; the application owns quiz scoring, focus management, navigation, and preview switching.

### Activity Worlds, Picker and Saved Themes

The authoritative [catalog](src/features/activity-themes/catalog.ts) contains Asasera Classic plus Jungle, Sky Islands, Tropical Island, Coral Ocean, Golden Desert, Deep Space, Northern Lights, Volcano Valley, Candy Valley, Arctic Adventure, Castle Quest and Secret Garden, with Arabic names alongside them. Legacy `forest`, `cosmic` and `coral` values resolve to Jungle, Deep Space and Coral Ocean; absent or unknown values resolve to Classic.

The native modal opens from Themes or the editor's current-world thumbnail. Lobby, Question and Podium are explicit pressed-state preview buttons; the question sample accepts one answer, reports its result in a polite live region, and offers Try again. Example PIN and sample wording stay identified. A fieldset of native radios gives each world an image, name and selected check. Selecting previews only; Use this theme applies. Cancel, close and Escape discard the pending choice and return focus to the opening control. During save, close/cancel, gallery selection and repeated apply are disabled, and Escape cannot dismiss. A failed save leaves the dialog and choice intact, restores the actions and announces a theme-aware error for retry; selecting another world clears that error.

Applying first flushes pending question and title edits, reloads the current revision and saves the theme to the activity draft. The editor updates its activity data after success. An already-published activity must be republished for the changed theme to appear in new games and assignment links; existing publication snapshots retain their theme. That status belongs beside the apply action, so previewing and saving are not confused with republishing.

The selected scene carries through the stationary editor canvas, discovery covers, live host/projector/player stages and homework/self-study. Full scene images are decorative and hidden from assistive technology; their content does not carry instructions. A failed scene leaves the catalog's stable fallback color beneath the veil; a failed thumbnail uses the same color with quiet Classic geometry. No image failure blocks the question or controls.

Twelve original environments were made with built-in `image_gen`. Shipped WebPs are native 1672 × 941, with 1280 × 720 mobile and 480 × 270 thumbnail derivatives; they are not native 2560 × 1440 images despite that ideal size in the generation prompt. The visible picker label identifies generated HD art. [The prompt/provenance manifest](src/assets/images/activity-themes/prompts.json) preserves exact prompts, source paths, dimensions and output sizes, with a sidecar for every raster. Classic uses color and geometry without generated scenery.

The sidecar adds standalone motion-control and apply/retry specimens while preserving all existing component examples. These specimens show scoped neutral/focus/error treatments; native modal behavior, image loading, selection and persistence remain in the application.

### Educational-game arena and mode picker

The shared arena makes the current objective, game points, remaining resources and time available outside the canvas. Countdown, round results, connection status and action errors have written treatments. Gameplay buttons are at least 56px high; view and sound controls are at least 44px high. The interactive viewport receives focus at a new round, and arrow/WASD/Space mappings accompany the mode-specific touch buttons. Arena focus uses a white three-pixel outline with a four-pixel offset; neutral mode options retain the theme-aware shared focus color and indicate selection with both a border and a check mark.

The mode picker uses native radio inputs with bilingual descriptions and reused world thumbnails. The arena's Simple view and 3D view controls switch presentation while retaining the same underlying state and actions. Spectator views identify the watched learner and omit gameplay buttons. The leaderboard shows game points alongside correct-answer counts and connection state; the round result and final podium preserve those separate meanings.

**The Learning and Play Rule.** Keep reviewed answer feedback, game points and academic correctness distinct; present game resources as the bridge from a question to an actively controlled round.

The sidecar's game-control and HUD specimens document static interface patterns only. They do not simulate game rules, persistence, keyboard handling or 3D rendering. Not canonized: incidental terrain colors, local type outliers, the simplified treasure board's text-glyph trap marker, or unverified contrast and layout as design-system precedents. The marker is an implementation limitation, not a replacement for the established SVG icon vocabulary.

### Optional random wheel

The teacher menu and tools page link to `/teacher/wheel`; live classroom controls offer the wheel in the lobby and between questions or rounds. The wheel is opt-in. Its server-selected live spin is shared with students and the projector; it does not alter learning or game scores. A standalone teacher list can hold up to 100 names, topics or questions and is saved in this browser under that teacher's account identifier. No-repeat selection is the default, with explicit reset and repeat controls.

The rotor is SVG geometry with a fixed top pointer, using one 4.8-second rotation and deliberate deceleration. The result appears in full outside the graphic; long sector labels shorten and large groups use numbers or plain sectors with the full entry list alongside. Live reconnect seeks the same frozen draw. Reduced/paused motion suppresses rotation, and a teacher who spins with motion paused requests an immediate selection. Body text and controls use theme-aware neutral tokens, a blue primary action, 48px actions, and visible focus; the wheel's darker green is a local small-label contrast treatment. The two-column wheel/list layout becomes one column below 850px.

**The Optional Wheel Rule.** Keep selection separate from assessment, preserve the selected result across reconnect, and let the teacher decide when to open, spin, reset and close the wheel. Full names remain readable outside the rotating graphic.

The [verification record](.impeccable/review/random-wheel/verification.md) documents code and transport checks. Browser capture remains blocked by the existing enforced-policy verification failure; desktop/mobile appearance, Arabic wheel lettering and rendered motion have not been visually verified. This source record is not visual approval.

### Teacher Home, owned rows and shared discovery

Home groups an illustrated creation hero, a four-link colored shortcut bar, up to four recent owned activities, a teal discovery invitation and a narrow classroom-inspiration area. The latter pairs a jungle image with a themed-activity creation link, a yellow Random wheel link and a teacher-guide link. Icons use the existing Lucide family at 24–40px with text labels; decorative icons are hidden from assistive technology. The classroom illustration is identified as an illustration in bilingual alt text. The new hero does not create demo activities or make progress claims. The shared owned row combines the existing theme thumbnail, a wrapping authored title, written Draft/Published status, edited date and Edit action; Play appears only for published work. My activities adds labeled search and status selects. Loading, failed loading, no owned work and no filter matches have distinct written states and a relevant recovery action. The surface brief records the destinations and content boundary.

Creation uses a title field and native subject/stage selects, with teaching purpose inside a More settings disclosure. Required fields, disabled pending controls, an alert on failure and a loading submit state precede handoff to the existing editor. Local fields have a minimum height (46px); row actions have a minimum height (40px). Home/library focus is an accent outline (3px) with (4px) offset.

Discovery uses subject/stage selects and an optional priority-unit select, theme previews, author attribution, question counts, explicit Preview/Make a copy actions and pagination. A missing English unit title becomes “Unit” plus its stored order; authored activity titles retain their language with automatic direction, and author names use bidirectional isolation. Saved preferences may initialize selection; absent preferences do not impose a subject or stage. Failed preference saves retain working filters and offer retry. Preview and destination-choice flows use the existing dialog and question components.

The teacher sidebar keeps five primary destinations and a native Tools & resources disclosure, which opens for an active nested resource route. Help remains separate. The neutral header retains language, theme and account controls; its creation link uses the same dedicated route and is omitted on Home, My activities and Create activity. Mobile uses the existing menu trigger, logo and drawer. Navigation retains filled current-route state, visible keyboard focus and reduced-motion treatment.

## Do's and Don'ts

### Do:

- **Do** keep answer color and shape paired across authoring, preview, classroom, and homework.
- **Do** use Classic blue or the selected scenic activity world for play and keep the corresponding authoring surface quiet.
- **Do** preserve the green shared-answer minimum and let classroom labels inherit the full tile size.
- **Do** keep feedback beneath the answer row and allow long Arabic wording to wrap.
- **Do** preserve visible keyboard focus, written state information, and reduced-motion feedback.
- **Do** use the two established corner roles and the shared spacing rhythm.
- **Do** scope the public landing's yellow actions, blue tonal surfaces, type overrides, and responsive layout to that surface.
- **Do** retain visible demo identification, written explanations, deliberate advancement, and replay on the public landing.
- **Do** use the catalog for world names, aliases, scene colors and image selection.
- **Do** keep preview, saved draft and republished delivery states distinct in the theme picker.
- **Do** retain theme-aware neutral focus and save-error colors in both picker themes.
- **Do** keep game objectives, resources, timer and written event feedback outside the canvas, with the same actions available in the simplified view.
- **Do** retain separate academic correctness and game-point displays, physical directional controls and explicit sound opt-in in educational games.
- **Do** use the student's selected learning stage and optional grade for dashboard presentation and free practice, preserving teacher-chosen activity content and released-feedback rules.
- **Do** retain real saved-work counts, written empty/error states and neutral metric borders in the student workspace.
- **Do** keep teacher Home's personal-work rows, separate shared discovery, written recovery states and localized interface labels within their scoped surface contract.

### Don't:

- **Don't** restore the historical blue/teal identity or five-pixel-only corner rule from the superseded guide.
- **Don't** use an answer fill alone to communicate correct, incorrect, selected, or pending state.
- **Don't** shrink the green classroom label to 20px when its tile is larger.
- **Don't** use yellow as small foreground wording on a neutral surface.
- **Don't** replace answer SVG shapes with emoji or font glyphs.
- **Don't** promote unconsumed motion tokens, legacy glyph controls, or the Arabic weight-file limitation into rules for future surfaces.
- **Don't** treat the public landing's examples or sample classroom code as real session activity or verified customer evidence.
- **Don't** carry the removed standalone demo label into new landing components; the existing demo top bar owns that identification.
- **Don't** animate the authoring scene or move question-image coordinates when changing worlds.
- **Don't** turn scenery, particle colors or preview podium geometry into new global answer or brand roles.
- **Don't** claim native 1440p art, a real-time 3D engine or benchmarked frame rates for the activity worlds.
- **Don't** use historical activity-world captures as visual approval for the new Three.js games, or treat source-defined responsive behavior as completed browser, phone or Arabic validation.
- **Don't** turn the games' local terrain materials, incidental glyph marker or detector advisories into new global brand, icon or typography rules.
- **Don't** infer age or consent from learning stage, require a birth date, or present free practice as teacher-assignment progress.
- **Don't** use historical teacher-editor or single-column learner captures as approval for the current student workspace; its finish disposition remains recapture.
- **Don't** treat teacher Home's local type/radius advisories, passing code checks or historical editor captures as current desktop/mobile English/Arabic visual approval; its finish disposition remains recapture.


### Registration entry refinement — 8 September 2026

Public registration actions now open `/register`, with `/signup` retained as a compatible entry. The first screen presents exactly two prominent role cards. Teacher opens the workplace/signup flow; Student opens the stage-and-optional-grade/signup flow. The login footer has one Create your account link, and the public header calls the action Register (إنشاء حساب).

The dedicated choice surface caps at760px and places two flat8px-radius colored cards side by side. Each card has a44px icon,32px role label,14px explanation and an explicit Continue-as link action. Cards have a300px minimum height on desktop; at600px or narrower they stack, with36px icons and28px role labels. Keyboard focus is outlined, Arabic arrows mirror, and reduced motion removes press/hover movement. This scoped choice surface replaces the earlier470px role panel; other authentication panels keep their existing sizes. Source/build/navigation checks passed; browser-security restrictions still prevent rendered visual verification.
