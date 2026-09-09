# Shared dropdown refinement

Request: “improve all dropdown list, style it with nice way.” The supplied image shows the native subject picker in activity creation. It is reference evidence, not a specification to change activity data or taxonomy.

Scope: replace native selection menus throughout the frontend with a consistent Asasera treatment. Reuse the same palette and row treatment for the account menu and live-session settings. Preserve existing navigation, role frames, choices, IDs and API actions. No backend, production-data, account creation or email action is part of this refinement.

Direction: blue accents, readable navy text, softly elevated open lists, generous rows, chevrons, checkmarks and restrained motion. Long lists gain search; bilingual labels, disabled/required/error states and dialogs retain their behavior. The shared Select component owns the implementation rather than each screen drawing a different menu.

Evidence: supplied screenshot; installed Base UI source and [official Select documentation](https://base-ui.com/react/components/select); isolated component tests and production build. Current visual captures remain unavailable because browser access was denied by the environment's policy. Source and interaction verification must not be described as rendered approval.
