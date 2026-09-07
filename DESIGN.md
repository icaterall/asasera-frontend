---
name: Asasera
description: Familiar quiz authoring and a theatrical classroom, with Arabic-first content.
colors:
  brand: "#46178f"
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
  student-live-panel:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: "36px"
  student-join-button:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "10px 24px"
  account-avatar:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.ink}"
    rounded: "50%"
    size: "44px"
  account-avatar-open:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.surface}"
  account-menu:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "8px"
    width: "min(288px, calc(100vw - 32px))"
---

# Design System: Asasera

## Overview

**Creative North Star: "Familiar quiz authoring and a theatrical classroom"**

Asasera uses the user's Kahoot reference as its visual authority. Authoring is a compact working environment: white controls and rails, gray canvas, a centered question, and colored answer inputs. Classroom delivery expands that same vocabulary into a purple stage with large white question and PIN panels. The four answer colors remain recognizable across authoring, preview, classroom play, and homework.

Arabic leads the content and direction model; Latin uses Montserrat alongside the locally hosted Arabic face. Clear wording, shape, selection outlines, and a separate feedback row carry information alongside color. The interface supports the sequence of authoring, approval, delivery, play, and evidence without making each step a new visual identity.

**Key Characteristics:**

- Purple classroom ground and gray creator canvas.
- Fixed red triangle, blue diamond, yellow circle, and green square answer identities.
- Compact rectangular controls, softly rounded containers, and tactile answer presses.
- Large classroom type, wrapping answer text, and feedback in its own row.
- Mirrored interface chrome with stable image geometry and numeric identifiers.

Recorded from the current code on 7 September 2026. Primary evidence is [the v4 token layer](src/design/tokens.css), [shared components](src/design), [the current activity editor](src/features/editor/Editor.module.css), [session styles](src/features/session/Session.module.css), and [delivery styles](src/features/delivery/Delivery.module.css). [The direction contract](.impeccable/surfaces/asasera-v4.md) records the user's authority. [The earlier visual guide](docs/DESIGN.md) is preserved as history; its blue/teal palette, five-pixel-only geometry, and blanket shadow prohibition are superseded. Legacy lesson-editor files and the unimported `src/styles/design.css` are not the source of the current activity-editor system.

Reference work used the official brand guide and creator screenshots; current live reference access was blocked, so exact current Kahoot pixel parity is unverified. [The final correction verdict](.impeccable/review/verdict-pass-2.md) says ship for the six scored fixes and regression R1 only. It does not certify the whole surface. The refreshed [editor capture](.impeccable/review/editor-hotspot-1440.png) and [teacher capture](.impeccable/review/teacher-intervention.png) support the documented geometry and feedback treatment.

The account/student extension retains that identity in red Teacher and blue Student choices and a neutral learner workspace with a purple PIN panel. Its [surface brief](.impeccable/surfaces/student-account.md) records the built `/student` route and account states. The separate [journey verdict](.impeccable/review/journeys/verdict-pass-1.md) says ship for four scored fixes and corrected focus regression R1 only; it does not certify the whole app, every auth screen, backend behavior, or current Kahoot pixel parity.

The later [account/support extension](.impeccable/surfaces/account-support.md) adds a shared profile circle and dropdown, account settings, and a support form within this same world. The direct user request supersedes the earlier non-dropdown and mailto-only scope. Its [finish review](.impeccable/review/account-support/review.md) records **ship for the supplied account/support finish evidence only**. The nine captures and source review do not independently certify header integration outside AccountControl, backend/auth transport, or delivery into the real support inbox. PRODUCT.md's starter-era brand prose does not replace the user's Kahoot pin or this current design record.

## Colors

Saturated classroom colors sit beside neutral working surfaces; the frontmatter records their current values from the v4 token layer.

### Primary

- **Classroom Purple — brand:** classic session ground, activity cover, and identity accent.
- **Deep Purple — brand-dark:** cosmic session ground and the darker purple variation.

### Secondary

- **Action Blue — act / act-press:** primary teacher actions, selected controls, and the darker primary-button hover.
- **Answer Red, Blue, Yellow, Green — a1–a4:** the ordered answer slots; green also supplies the evidence outline. These fills identify options before they report any result.
- **Danger Ink — danger-ink / dark-danger-ink:** destructive action wording and invalid-field messages on the corresponding neutral surface.
- **Account roles:** Teacher reuses Answer Red; Student reuses Action Blue. These are role choices, with written labels and corner illustrations, rather than answer-slot identities.
- **Dark Accent — dark-accent:** the global theme's light purple `--accent`, used for the student footer link on the dark workspace. Light student footer links use Action Blue.

### Neutral

- **Working Ink and Muted Ink — ink / muted:** ordinary content and secondary labels.
- **White Surface and Creator Gray — surface / raised:** controls, cards, and the gray central workspace. The v4 raised and sunken roles share the same light gray.
- **Control Line — line:** field strokes, card edges, and rail separation.
- **Answer Dark Ink — answer-dark-ink:** yellow answer wording and the light-theme shared focus outline.
- **Dark Surface, Raised, Sunken, Ink, Muted, and Line:** theme-specific workspace equivalents. Answer slot fills retain their identity in both themes.

**The Paired Identity Rule.** Keep each answer slot's color and shape together: red triangle, blue diamond, yellow circle, green square. Use text and a mark to report correctness.

**The Foreground Rule.** Use white on red and blue answers and dark ink on yellow answers. White on the shared green answer tile requires a bold label of at least 20px; preserve the inherited classroom size when it is larger.

The green foreground safeguard is encoded in `AnswerTile.module.css` as `max(1.25rem, 1em)`. It describes that shared component, not a blanket contrast certificate for every green element in the app. Tonal ramps in the sidecar are swatch metadata; synthesized ramps are not additional UI tokens.

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

The student workspace intentionally scopes its hierarchy: a `clamp(28px, 4vw, 40px)` page title, a 32px live-action heading reduced to 28px at the phone breakpoint, and a 22px activity-link heading. Each requests weight 800; the existing font loading remains as described above. The PIN requests 24px/800; labels and errors use 14px. The 32px/22px sizes were review advisories, not rejected designs or additions to the shared type scale.

Account settings retain the student's fluid page-title range and use 24px section headings. Support uses a `clamp(28px, 3vw, 40px)` heading and an 18px introductory paragraph. The profile initial is 18px/700; the menu name is 16px, action labels are 14px/700, and identity metadata and form hints are 12px. The avatar and support-intro 18px notices were advisory in the scoped finish review; these are intentional local sizes, not a new shared scale step.

## Layout

The current activity editor fills the viewport and separates toolbar, question rail, canvas, and properties. Its desktop columns are 180px, a flexible center, and 280px; the center is capped internally at 1080px. Rails scroll independently. Below 1025px both rails become drawers, each capped at the smaller of 320px and 86vw; the canvas keeps the full working width. At 700px the toolbar wraps and canvas padding becomes compact. Answer inputs switch to two columns from 720px.

The legacy lesson editor still defines a separate 184px/288px rail composition with 1100px and 820px transitions. Those measurements are not the v4 activity-editor contract.

The classroom uses a centered play area capped at 1600px, a two-column answer grid, and a full purple background. Below 701px the answer gaps and question panel contract while the two-by-two choice structure remains. The PIN panel keeps the code and QR together at this breakpoint. Shape-only player controls use more of the phone height, retaining the full answer in the accessible name.

Delivery settings use three mode choices and a two-column settings group; both become single columns at 640px. Shared content uses the four-pixel spacing rhythm in the frontmatter. Source-specific dimensions remain local rather than becoming extra spacing tokens.

The student workspace has a wrapping neutral header and a centered main region capped at 1000px with 48px/28px/32px top/inline/bottom padding. Its purple live panel pairs explanation with a 280px PIN form using a 40px gap. The neutral activity-link panel follows, then help and optional study-level access. At 640px the live panel and link form stack, main padding becomes 28px/16px, panel padding becomes 24px, and the footer stacks. These dimensions belong to this surface; they do not replace editor rails or classroom geometry.

The account dropdown anchors to the circle's inline end, 8px below it. Its width is capped by the account-menu component token; an internal scroll region uses the measured space below the trigger, leaving 20px at the viewport edge with a 120px minimum. Identity text wraps anywhere and the menu contains overscroll. Signed-in public headers sit in sticky normal flow below the verification strip; the anonymous public header retains its fixed placement. This integration is recorded from implementation, outside the finish review's independent scope.

Settings center within 800px, with 40px/24px/64px top/inline/bottom padding and a 560px name form. Sections use 32px vertical spacing and horizontal dividers. At 640px the page padding becomes 24px/20px/48px and sections use 28px. Support centers within 1100px, pairing an introduction and form in .8fr/1.2fr columns separated by 64px. Name and email share a row. At 700px both grids stack, the outer padding becomes 48px/20px, and the main gap becomes 32px. Standalone contact pages reserve 152px above content for the anonymous header, or 48px when signed in; phone values are 128px and 32px respectively. These offsets and widths remain surface-specific.

**The Stable Geometry Rule.** Mirror interface chrome through logical start/end properties. Keep image regions and their coordinates in the same physical image frame; numeric PINs and coordinates retain left-to-right presentation.

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

## Shapes

Controls use the small radius and containers use the card radius. Current question previews and white stage panels also use the control radius; the distinction is not a command to round every rectangle identically. Fields and shared cards have a single neutral border. Active question previews use a stronger blue perimeter, and answer controls use a bottom edge.

**The Four Shapes Rule.** Draw the answer symbols as SVG geometry and keep their identities stable as they scale. They are answer markers, not general-purpose decorations.

Circular timer rings, QR content, and the stage's low-contrast circle/rotated square are local functional or scenic forms. They do not introduce pill controls or a second corner scale.

The account avatar is a deliberately circular identity control with a single border. The dropdown keeps the existing container corners and its rows keep the control corners. This local circle does not change the rectangular form language of actions and fields.

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

Purple fills the stage. Toolbar controls recede into translucent dark buttons, while white PIN and prompt panels carry dark wording. The prompt uses a fluid 40–72px scale on larger screens and a 32px mobile override; the stage answer's live scale is `clamp(24px, 2.7vw, 46px)` with a 22px mobile override. Feedback retains the small-label size independently. Timer and PIN use tabular numerals. The stage focus outline is white with a larger offset so it remains visible on purple.

### Delivery Choices and Dialogs

Mode choices are radio-backed, bordered rectangles with a stronger bottom edge; a selected choice adds an Action Blue border and a light blue tint. The settings grid collapses on phones. Shared dialogs use a neutral card surface over a scrim, a visible title, and grouped actions; the native delivery dialogs retain their own compact control-corner treatment. The named-dialog correction is covered by the scoped review verdict, not a general assertion about every dialog behavior.

### Account Choices and Student Workspace

Role choices keep a centered white label and a small illustration in the inline-start corner on their red/blue fills. The two-column grid has an 11px gap and a 112px minimum card height, becoming one column below 20em. Account controls continue the existing auth styles; their local geometry and hover behavior do not redefine shared button tokens.

The student PIN input remains white with dark, centered, left-to-right digits in both themes. Its example uses explicit Muted Ink at full opacity; ordinary student placeholders use theme-aware muted ink. Both forms have associated labels and written validation. PIN errors stay white on purple, while activity-link errors use theme-aware Danger Ink. The live input and Join button have white 3px focus outlines with 2px offsets. Neutral focus uses the shared theme tokens only within the main region and header; it must not override the verification banner's existing white 2px outline and 2px offset.

Student submits consume the shared press shadow, move down 4px when active, and retain a neutral one-pixel inset pressed edge. Hover slightly darkens them; reduced motion removes travel and transitions. Join stays white with dark wording, while Open activity uses Action Blue. The optional verification strip remains purple above the header, with resend/change-email panels and visible status text; on student phones its action targets have a 44px minimum height. No stored learning progress, grades, or activity history is claimed by this workspace.

The sidecar preserves the ten existing independent HTML/CSS examples and adds the student PIN panel. They require no React or utility-CSS runtime and use inherited custom properties with literal fallbacks.

### Account Menu and Settings

The profile circle shows the saved name's first grapheme, isolated for bidirectional text, or a neutral SVG person when no name is available. Hover and open states use Classroom Purple with a white foreground. The menu begins with name, wrapping email, and role. Teacher destinations are Workspace, My activities, Assignments, and Reports; student destinations are Your learning and Join a class. Both continue with Account settings, Reset password, and Contact support, then a separator and Sign out. Rows have 44px minimum targets and 10px/12px vertical/inline padding. Sign out stays a neutral menu row and changes to a disabled pending label while leaving.

Opening focuses the first item; Arrow Up from the trigger opens on the last. Up/Down wrap, Home/End jump, and Escape closes and returns focus to the circle. Tab, outside pointer interaction, focus leaving the control, and route changes dismiss the menu. Hover and focused rows use the raised surface. The account control and settings scope the shared 3px focus outline with a 2px offset to their own elements.

Settings place editable display name first, with a hint, written validation, save action, and persistent saved status until the next edit. Email verification and role follow as details, then profile-completion access, password recovery, support, and the existing deliberate deletion flow. Account and support forms use neutral 48px fields and theme-aware danger borders with written errors; their local error treatment does not require the shared field's SVG alert mark. Settings links use the global accent and an underline. Password recovery continues the existing emailed-token screens; visual documentation is not a transport certificate.

### Support Form

The landing contact section and `/contact` share labeled Name, Email address, optional Organization, and a vertically resizable message field. The support recipient stays visible beside the primary blue action. Labels, hints, inline errors, pending text, and the success panel communicate state in words. Validation focuses the first invalid field. While sending, fields are disabled and the form reports busy; failure preserves the draft and offers retry or direct email. API success replaces the form with a neutral bordered confirmation and a Send another message action. The UI's success copy follows API acceptance; inbox delivery remains outside the visual review.

Both surfaces inherit light and dark neutral tokens. Dark focus becomes white and invalid fields use the dark danger color; the profile's open purple and white state is unchanged. Logical alignment and wrapping support Arabic RTL; email inputs remain left-to-right while names and messages use automatic direction, and displayed identities use bidirectional isolation. The menu has no added entrance animation; support and settings actions inherit the shared button's motion and reduced-motion behavior. The sidecar extension retains all eleven prior examples and adds an independent support-form specimen for visual inspection; submission behavior remains in the application.

## Do's and Don'ts

### Do:

- **Do** keep answer color and shape paired across authoring, preview, classroom, and homework.
- **Do** use the neutral creator canvas and purple classroom ground for their established contexts.
- **Do** preserve the green shared-answer minimum and let classroom labels inherit the full tile size.
- **Do** keep feedback beneath the answer row and allow long Arabic wording to wrap.
- **Do** preserve visible keyboard focus, written state information, and reduced-motion feedback.
- **Do** use the two established corner roles and the shared spacing rhythm.

### Don't:

- **Don't** restore the historical blue/teal identity or five-pixel-only corner rule from the superseded guide.
- **Don't** use an answer fill alone to communicate correct, incorrect, selected, or pending state.
- **Don't** shrink the green classroom label to 20px when its tile is larger.
- **Don't** use yellow as small foreground wording on a neutral surface.
- **Don't** replace answer SVG shapes with emoji or font glyphs.
- **Don't** promote unconsumed motion tokens, legacy glyph controls, or the Arabic weight-file limitation into rules for future surfaces.
