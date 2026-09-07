# Student and account surface brief

Audience: Arabic-first learners creating an account and returning to a teacher's live or assigned activity; teachers choosing their own account route.
Mode: Operate for account entry; Experience begins when the learner opens the live or assigned activity.
Authority: 7 September 2026 direct user requirement for Kahoot colors/styles, extended from the existing Asasera system in [DESIGN.md](../../DESIGN.md). This is a code-led extension with no alternative style selection, seed, or approved composition. Current live creator access was blocked; official written guides and historical screenshots informed the work. Exact current Kahoot pixel parity remains unverified. Asasera's logo and name remain the identity; no new assets were added.

## Direction contract

THESIS: A student can immediately join a class or open a teacher's activity, with account maintenance available around those tasks.
OWN-WORLD: Purple play emphasis, red Teacher and blue Student choices, gray/white working surfaces, Montserrat with the existing Arabic font coverage, compact controls, and restrained tactile press depth. Canonical color values remain in root DESIGN.md.
STORY: Choose a role, answer or skip the relevant optional signup question, create/sign into the account, then join by PIN or open a teacher's homework/study link. Optional study-level and email-verification controls remain available.
FIRST VIEWPORT: A compact neutral header above a centered learner workspace. The page title leads into a purple live-class panel containing the PIN form, followed by the neutral activity-link panel. The phone composition stacks the same actions in that order.
FORM: The user's prescribed Kahoot vocabulary continues the existing Asasera system; historical screenshots are style evidence, not approved current compositions.
FINISH: The journey verdict covers the four original scored corrections and focus regression R1 only. It does not certify the entire application or every account state.

## Built surface

- `/student` shows an account-loading status while identity resolves, sends anonymous visitors to sign-in, and directs non-student accounts to the teacher dashboard. The header exposes language, theme, and account/sign-out controls, with a skip link into the main content.
- The live form accepts six digits, normalizes Arabic and Persian digits, and opens `/join` with the entered PIN. The numeric input stays left-to-right inside either language direction. It names the missing/invalid PIN in a written alert.
- The activity form accepts the app's own `/learn/<activity-id>` link, preserving its query and fragment when opening the activity. It rejects other origins and unsupported paths with a written error. Copy asks for the teacher's homework or self-study link rather than implying a saved activity library.
- The footer offers `/complete-profile` as optional study-level maintenance. No progress count, grades, activity history, or persistence of learning progress is presented.
- An unverified account can use the existing sticky purple strip to open resend or change-email controls; opening a panel does not itself send email. The strip follows the account's reported verification state. The workspace remains usable while unverified.

## Scoped visual details

The main region is capped at 1000px. Desktop uses a two-column purple panel with a 280px form, while the activity link and action share a row in the neutral panel. At 640px both forms stack; the header wraps and verification actions gain a 44px minimum height. The surface retains 4px input/button corners and 8px panel corners.

The title uses `clamp(28px, 4vw, 40px)`; the live heading is 32px and becomes 28px on phones; the activity heading is 22px. These locally requested weight-800 sizes intentionally extend the shared hierarchy without creating new global type tokens. The supplied font files still constrain the actual available weights. The reviewer treated 32px/22px as advisories rather than rejected type choices.

The white PIN input has dark wording and an explicit full-opacity gray example in both themes. Other placeholders use theme-aware muted ink. Neutral assignment errors use `--danger-ink`; the dark footer link uses `--accent`. Live controls use a white 3px focus outline with 2px offset. Neutral controls use the shared focus tokens only inside the header/main region. The existing verification controls retain their white 2px outline and 2px offset on purple.

Student submit buttons use `--press` at rest, 4px active travel, and a neutral one-pixel inset active edge. Hover applies a slight brightness change; reduced motion removes travel and transition. Join remains white with dark text and does not gain a blue edge. The action heading carries the purple panel without a redundant eyebrow.

## Account continuation

Teacher/Student choices use the current red/blue fills in `auth.css`, centered white labels, and existing corner illustrations. Signup continues into the selected role's real flow. Student stage selection remains optional, is carried into account creation when selected, and can be edited through profile completion. This describes the implemented account request and UI continuation, not a claim about stored learning progress. Available Google entry is shown only when the server reports that provider as available. After a successful password reset, the completion state offers sign-in and clears the previous client session. These are source-grounded behavior notes; the visual journey review does not independently certify all provider or backend paths.

## Evidence and disposition

Sources: [StudentHome.tsx](../../src/pages/student/StudentHome.tsx), [student styles](../../src/pages/student/StudentHome.module.css), [auth styles](../../src/styles/auth.css), [shared tokens](../../src/design/tokens.css), [join input handling](../../src/lib/joinInput.ts), and the signup/account continuation source.

The [initial review](../review/journeys/review.md) requested four fixes: focus, contrast, redundant eyebrow removal, and shared control behavior. The [final verdict](../review/journeys/verdict-pass-1.md) resolves those plus regression R1, where an overly broad student focus rule recolored verification-banner focus. Disposition: **ship for that correction batch only**.

The reviewed capture set is [signup desktop English](../review/journeys/signup-desktop-en.png), [signup mobile Arabic](../review/journeys/signup-mobile-ar.png), [student desktop English](../review/journeys/student-desktop-en.png), [student mobile Arabic](../review/journeys/student-mobile-ar.png), [student mobile dark English](../review/journeys/student-mobile-en-dark.png), and [teacher editor desktop dark English](../review/journeys/teacher-editor-desktop-en-dark.png). Teacher editor capture supplies visible continuity only. The [control-state record](../review/journeys/control-states.json) supplies white focus/placeholder, pressed, reduced-motion, and verification-focus evidence. Historical tutorials remain reference evidence; none of these captures establishes exact current Kahoot parity.
