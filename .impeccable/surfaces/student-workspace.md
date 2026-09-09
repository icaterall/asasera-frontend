# Student workspace surface brief

Audience: Arabic-first students returning to teacher activities or choosing stage-appropriate free practice.
Mode: Operate for account, saved work and preferences; Experience for the existing educational games.
Authority: The user's request for a real sidebar dashboard adapted to kindergarten, school or university, with stage and optional grade selected during registration and editable later. General learning is available; no birth date is collected. [DESIGN.md](../../DESIGN.md) remains the visual authority: Asasera Blue `#004ccc`, existing Montserrat/Neo Sans Arabic, 4px controls and 8px surfaces. Existing role choices, teacher frames and game-answer identities remain intact.

This extension supersedes the single-column student page described in [student-account.md](student-account.md). That earlier account/journey review remains historical evidence for its own scope. The current implementation is recorded from source; it has no visual ship approval.

## Direction and first viewport

The desktop composition has a sticky 232px navigation rail, compact neutral account header, personalized heading, wide illustrated practice invitation and adjacent class PIN form. Real saved work begins immediately below, followed by the three existing game choices. The rail narrows to 200px at 1120px and becomes horizontal, scrollable navigation at 900px. At 640px the practice invitation and PIN panel stack, game choices become image/text rows, activity actions wrap below details and forms become one column. The main region caps at 1520px; preferences cap at 820px.

| Learning selection | Implemented presentation |
| --- | --- |
| Kindergarten | Existing garden art, simpler discovery wording, larger navigation/action targets and heading overrides. Optional Kindergarten 1 or 2. |
| School | Existing sky art and adventure wording. Optional grades 1–12. |
| University | Existing space art with reduced image opacity, concise task wording and calmer presentation. Optional years 1–6 or postgraduate. |
| General learning | Existing sky art with general learning preferences and no grade selector; no age inferred. |

Scenery uses the existing generated activity-world assets. The hero uses a still image and directional dark veil; it introduces no new brand hue or artwork. Neutral panels use the existing theme roles, and the practice action reuses yellow. Metric cards have neutral one-pixel borders. The selected navigation and primary actions use Asasera Blue.

## Routes and built behavior

- `/student`: stage-aware home, six-digit class PIN entry, up to three unfinished saved activities and links into Jungle Dash, Sky Builders and Treasure Quest. PIN normalization accepts Arabic and Persian digits and retains left-to-right display. Empty saved work offers Add activity.
- `/student/activities`: validates a same-origin teacher activity link with its access key, saves it to the signed-in account and opens the activity. Search and status filters operate on the saved list. Rows show title, mode, due date, answered/total progress, written status and Start/Continue/View activity actions.
- `/student/progress`: shows actual counts of activities started, activities submitted and answers saved. Each result shows saved answer progress and either released correctness or Waiting for feedback. Free practice is explicitly separate from teacher reports; there are no invented attendance, achievements, class membership or grades.
- `/student/practice`: uses the existing playable game engine with stage/grade question bands and shuffled questions/answers. Three-question rounds retain separate game points and academic correctness, keyboard controls and the existing simplified/reduced-motion alternatives. Student practice state is separated by account and learning profile; public free practice remains available outside this workspace.
- `/student/profile`: edits the same learning preferences selected during email or Google registration. Native radios offer all four stages; an optional grade/year select only offers values for that stage. Switching stage clears grade. Saving updates the workspace and practice bank; the selected teacher's questions remain unchanged. General learning and an empty grade remain valid choices. Account settings route students here for stage/grade editing.

The layout sends anonymous visitors to sign-in with their return destination, directs other account roles to their own home, and displays identity/loading states. An overview failure presents a written alert and retry action. Navigation includes route state, labels and icons; the header retains language, theme and account controls. A skip link leads into the main content. The email-verification banner remains available below the account header.

## Owned work and feedback

Saving an assignment first proves access with the teacher's complete link. Started attempts belong to the signed-in account rather than a matching display name. Account start is atomic, and resume returns private access only to the owner, including across devices. The overview does not expose those private capabilities. Local assignment keys are separated per student on shared devices. Source/API verification covers ownership isolation and concurrent starts; this brief records the behavior rather than independently certifying backend security.

Availability, deadlines and teacher feedback settings govern activity status and released correctness. The learner-facing report uses saved teacher-assignment answers; free practice results do not populate it. Learning stage is a preference, not exact age or consent status, and no date-of-birth question is added.

## Controls and responsive details

Student actions have a 48px minimum height, 4px corners and a four-pixel inset edge; blue/yellow actions travel down 2px on press. Kindergarten increases those actions to 56px. Game-choice cards lift 4px with a small hover shadow. Reduced motion removes these transitions and transforms. Neutral panels and preference cards use 8px corners.

The title uses `clamp(28px, 2.5vw, 40px)` and the illustrated heading uses `clamp(28px, 3vw, 40px)`, with stage and phone overrides. PIN digits use 26px; ordinary action/body copy uses 14px and metadata/hints use 12px. Arabic heading tracking is removed and leading increases. Requested weights remain subject to the existing font-file limits.

The native stage cards show a selected border and check mark. Forms expose associated labels, disabled pending controls and written error/saved status. Student focus is a 3px brand outline with a 3px offset; the hero action uses white. Forced-colors rules retain borders and a solid hero ground. These source provisions still require actual keyboard, contrast, Arabic and phone inspection; they do not establish accessibility conformance by themselves.

## Evidence and disposition

Sources: [StudentLayout](../../src/features/student/StudentLayout.tsx), [student pages](../../src/features/student/StudentPages.tsx), [stylesheet](../../src/features/student/Student.module.css), [native stage picker](../../src/features/student/StageGradePicker.tsx), [signup stage](../../src/pages/signup/StageStep.tsx), [shared learning contract](../../src/shared/student.ts), [practice](../../src/features/games/GamesPage.tsx), [self-study](../../src/features/delivery/LearnPage.tsx), [routes](../../src/App.tsx) and [account settings](../../src/features/account/AccountPage.tsx).

[The direction contract](../review/student-workspace/direction.md) and [verification record](../review/student-workspace/verification.md) document the authorized implementation and checks. The final source/API verification reports 71 unique passing tests: 19 frontend, 5 student API, 16 Google, 25 existing auth/workplace and 6 delivery/game. Frontend/backend builds passed. The configured development migration and both new tables were confirmed, and local frontend/API readiness returned HTTP 200. These checks support implemented behavior, not visual approval.

The static design-detector pass led to removing the thick decorative metric border, increasing small text and aligning fluid headings. Remaining scene-overlay color and contextual type notices are scoped advisories, not additions to the global system or proof of visual acceptance.

**Disposition: recapture.** [The independent finish review](../review/student-workspace/finish-review.md) found no valid current student captures. Existing desktop/mobile files show the teacher activity editor. Browser security policy denied localhost access; no alternate browser, headless capture or indirect workaround was used. A permitted capture must cover the actual student desktop/phone layouts, stage/optional-grade signup and preferences, all four stage variants, EN/AR presentation and control states. Until then, rendered appearance, focus interaction and responsive stage adaptation remain unverified.
