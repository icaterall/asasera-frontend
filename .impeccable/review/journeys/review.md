disposition: fix

Scope and inputs: fresh subagent review of the supplied signup/student captures and sampled source, with the teacher editor used only for visible continuity. No approved comp or separate QUALITY BAR card was supplied; the pinned DESIGN.md, v4 surface brief, and calling brief's quality bar are the authority. Other auth screens, interactive states, and backend behavior were not independently rendered or certified. The degraded reviewer contract was applied by a separate reviewer, so no inline-role substitution was necessary.

## persistence

Pass. PRODUCT.md exists. Its starter audience and former blue/teal brand rules are explicitly marked stale by `.impeccable/surfaces/asasera-v4.md`; DESIGN.md and the sidecar record the incumbent purple, neutral surfaces, Montserrat/Arabic pairing, and compact controls. This is a code-led extension, so comp-state, comp approval, and raster-diff obligations do not apply. FORM records the user's prescribed Kahoot direction and no alternative selection or seed; that explicit direction is sufficient here.

Evidence passes: all six named required captures exist, show their claimed content, include valid document tops, and have coherent viewport dimensions. The signup pair is 1440×900 and 390×844; the student pair and dark mobile capture show complete, unbroken layouts; the 1440×900 editor capture shows the editor. The two 2021 tutorial images are historical style evidence, not approved compositions. Current live Kahoot pixel parity remains unproven.

## fidelity

| Element or promise | State | Evidence |
|---|---|---|
| TYPE | adaptation | Montserrat retains the broad, emphatic Latin voice and the supplied Arabic face remains legible. Mobile heading reduction follows the bilingual/mobile requirement. The 22px/32px local sizes are detector advisories, not a demonstrated lettering contradiction; 13px belongs to the removable eyebrow. |
| MATERIAL | match | Flat working panels, saturated role choices, neutral fields, and modest tactile button edges fit the pinned quiz interface. No invented physical material or missing raster promise. |
| GROUND / OWN-WORLD | match | Student play panel uses #46178f; working grounds remain neutral #f2f2f2/#171717 and fields/panels white/#222222. Signup red/blue choices and the editor's four answer identities retain the pinned system. |
| THESIS | match | The first student viewport makes joining a class the strongest action, and the teacher continuation retains question rail, canvas, and properties. |
| STORY | adaptation | Registration routes to actual teacher/student flows; the student surface offers PIN play and a shared homework/study link. This is the requested learner extension of the existing author→delivery sequence, not a new progress dashboard. |
| FIRST VIEWPORT | adaptation | A student has no editor rails; the purple PIN panel supplies the classroom vocabulary while the compact neutral header carries account controls. This follows the role-specific request. Desktop fits both main actions; mobile keeps a clear vertical reading order. |
| FORM | match | The surface continues the user-prescribed Kahoot style vocabulary while retaining the Asasera logo. Historical tutorials do not establish literal current composition parity. |
| Keyboard focus | contradicted | StudentHome defines no local focus treatment. The inherited light-theme outline is #46178f, the exact live-panel ground, so the offset ring around its input and Join button disappears there. |
| Input and status contrast | contradicted | Captured light placeholders sample to #999999 on white (2.85:1), below both the 3:1 large PIN and 4.5:1 ordinary placeholder floors. The dark footer's #1368ce on #171717 is 3.33:1; the source uses #e21b3c error text on #222222 at 3.38:1. |
| Main-action eyebrow | contradicted | “WITH YOUR CLASS” / “مع صفّك” repeats context above “Join the class” and violates the craft-floor eyebrow ban. It also consumes scarce mobile height. |
| Control states | contradicted | Student submit controls bypass the documented shared press recipe: 2px travel and a hard blue drop edge replace the 4px inset-edge behavior. The more-specific active rule also turns the white Join control's edge blue. There is no hover treatment or reduced-motion travel override for these controls. |
| Truth and next actions | match | Copy asks for a teacher's PIN/link and claims no stored progress, grades, or activity history. Sample editor content is explicitly synthetic. Source exposes associated labels and written validation, normalizes Arabic/Persian digits, preserves assignment-link query/hash data, and gates Google rendering on server availability. These observations do not certify backend execution. |

## ceiling

The pinned interface's useful native devices are present: strong role colors, compact rectangles, neutral working ground, purple play emphasis, and broad type. Additional ornament or illustrative media would not improve these short tasks. Commitment is limited by inconsistent focus/press states and faint field examples, not by a missing decorative device. Responsive Arabic and English captures show no clipping or overlap.

## material_fixes

1. **Accessible focus:** add a visible white focus outline on the live PIN input and Join button, and use the documented theme-aware focus recipe on the neutral student controls; `src/pages/student/StudentHome.module.css:13` currently inherits a purple-on-purple light-theme ring. Verify keyboard focus in both themes.
2. **Contrast:** explicitly style the white PIN placeholder and ordinary activity-link placeholder to meet the respective 3:1/4.5:1 floors; use a theme-aware legible footer link and `--danger-ink` for assignment errors instead of fixed `--act`/`--a1` (`StudentHome.module.css:13`, `:22`, `:23`). Keep the PIN's white surface readable in dark mode too, and inspect the visible invalid-link state.
3. **Craft floor:** remove the eyebrow span and its styling from `src/pages/student/StudentHome.tsx:52` and `StudentHome.module.css:8`; let the action heading carry the panel and rebalance its spacing in both languages.
4. **Shared control behavior:** align both student submit buttons with the pinned 4px press/inset-edge system, provide hover feedback, preserve the Join control's neutral edge, and suppress travel for reduced motion (`StudentHome.module.css:15`–`:17`). Resolve the derived blue-shadow advisory through shared tokens rather than adding another local recipe.

## keep

Keep the direct PIN/link choices, honest account verification status, Arabic/LTR numeric handling, Asasera logo, purple play emphasis, neutral work surfaces, and existing teacher-editor continuity.
