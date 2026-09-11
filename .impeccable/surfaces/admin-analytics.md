# Admin analytics and AI routes

MODE: Operate. This is an authenticated administrator extension of the existing Asasera interface.
AUTHORITY: User request, 11 September 2026: the administrator needs operational analytics for activities and visitors, and must choose the AI route used for image, audio, and PDF-question work. The existing [app plan](../../../app-plan.md), especially its execution-policy and privacy requirements, limits what can be made configurable.

## Direction contract

THESIS: An administrator can understand recent platform activity, distinguish anonymous landing traffic from signed-in people, and configure only AI work that has a real, audited execution path.
OWN-WORLD: The established administrator shell remains right-aligned in Arabic, with a neutral working canvas, Asasera blue active navigation, compact 4px controls, 8px sections, Montserrat/Neo Sans Arabic typography, and the current light/dark tokens.
STORY: Open the overview → read accounts, teachers, activities, runs, landing traffic and AI job health → move to AI routes → choose a provider/model for PDF questions, images, or audio, or pause one route → resolve a save conflict by reloading. Image review remains visible as upload review; image/audio route choices remain visibly pending until their delivery workers are connected.
FIRST VIEWPORT: The overview leads with three operational numbers, then adjacent learning and visitor sections on desktop. On a phone, the same metrics stack below a wrapped 44px-minimum administrator navigation. AI routes starts with the PDF question policy before the capability list and change history.
FORM: Pinned continuation of the existing system; no new-world roll, concept selection, or generated composition. Seed/key: `admin-analytics-operate-2026-09-11`. Quality bar: DESIGN.md, existing administrator shell, truthful operational language, WCAG 2.2 AA, keyboard-visible focus, and responsive Arabic RTL composition.

## Built surface and truth boundaries

- `/admin/overview` is the default administrator landing route. Its values are live server aggregates for the last 30 days: accounts, teachers who signed in, saved activities, runs, learner seats, generation jobs/cost, and privacy-minimized landing traffic.
- Visitor traffic is deliberately separate from authenticated people. The browser sends a locally generated UUID only to record a landing visit; the server stores a daily SHA-256 digest, no account, IP address, URL query, prompt, lesson source, or private-page event. Daily digests expire after 30 days through the write path and worker retention sweep.
- `/admin/ai-settings` persists and audits the policy for question generation from text and PDFs, plus separate image and audio model choices. Teachers only experience the chosen generation capability; they never see provider/model controls.
- The model-pricing panel gives every selected question, image, and audio model its versioned Standard-tier reference rates, official source link, verification date, and lifecycle status. Where a provider publishes output-image references, those appear with the image model. These are current reference prices, never final charges: settlement depends on the provider's metered billable usage. [The pricing evidence](../../../asasera-backend/docs/implementation/admin-ai-model-pricing.md) records the model-specific source and verification boundary.
- Image upload review is an available moderation/analysis path, not image generation. A configured, enabled image or audio choice is saved independently with its own version and is labelled worker-pending until its delivery worker consumes that policy. A disabled media choice is paused; a choice whose provider credentials or runtime are not ready is unavailable. Selecting a model alone never makes media generation appear live.
- Form states are explicit: available (the configured, enabled PDF-question route and image review), worker-pending, paused, unavailable credentials/runtime, save failure, optimistic-version conflict with reload, and visible keyboard focus. Raw source documents, prompts, student information and browser identifiers never appear in the overview.

## Verification record

The existing capture set — `.impeccable/review/admin-overview-desktop.png`, `admin-overview-mobile.png`, `admin-ai-routes-desktop.png`, `admin-ai-routes-mobile.png`, and `admin-ai-routes-conflict.png` — uses synthetic operational values and does not prove production traffic or provider delivery. It predates the final available/worker-pending/paused/unavailable wording, so it is stale for that copy. A current browser recapture is blocked by enforced security policy; no alternate renderer or indirect capture was used. Backend tests establish authorization, aggregation, anonymization, retention, policy API behavior, and the route-state distinctions.
