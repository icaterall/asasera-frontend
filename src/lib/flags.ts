/// <reference types="vite/client" />

/**
 * Build-time feature flags.
 *
 * ── Why the comparison is written out, once per flag ─────────────────────
 * Vite replaces `import.meta.env.VITE_X` with a string literal before
 * bundling, so `import.meta.env.VITE_X === 'true'` becomes `'false' === 'true'`
 * and Rollup folds it to `false`, then drops any `if`/ternary branch guarded
 * by it. Routing the same value through a helper — `enabled(import.meta.env.X)`
 * — defeats that: a function call is not a constant Rollup can evaluate, so
 * the branch survives into the bundle and is only decided at runtime.
 *
 * The first version of this file did exactly that, and the Facebook markup
 * shipped in the bundle while appearing to be gated. It was never rendered,
 * but "not rendered" and "not present" are different claims, and only the
 * second one survives someone opening devtools.
 *
 * The `=== 'true'` also matters on its own: Vite inlines the value as a
 * STRING, so `Boolean(import.meta.env.VITE_X)` is true even for "false".
 *
 * Default is OFF — an unset or misspelled variable hides the feature rather
 * than exposing it, which is the safe direction for a gate whose job is to
 * keep something out of sight.
 */

/**
 * Facebook sign-in.
 *
 * The Meta app is in review. This hides the BUTTON and nothing else: the
 * backend `/auth/facebook` routes, the `facebook` value in the
 * `user_identities` provider CHECK, the signed_request data-deletion callback
 * and the privacy-policy text are all untouched, because the review depends
 * on them and the reviewer follows that policy text to the callback.
 *
 * Set VITE_ENABLE_FACEBOOK_AUTH=true and rebuild to bring the button back.
 * No component change is needed.
 */
export const FACEBOOK_AUTH_ENABLED = import.meta.env.VITE_ENABLE_FACEBOOK_AUTH === 'true'

/**
 * Apple sign-in.
 *
 * NOT CONFIGURED. There is no Apple Services ID, key, team id or callback in
 * this project, so the provider cannot complete a sign-in and must never look
 * as though it could.
 *
 * The flag governs whether the (disabled, "Coming soon") control is rendered
 * at all. It defaults to OFF, which is what production ships: an unavailable
 * provider is hidden from the signup and login choices entirely rather than
 * shown greyed out to every visitor. Set VITE_ENABLE_APPLE_AUTH=true in a
 * development preview to see the placement while the integration is built.
 *
 * When the real credentials arrive this flag is NOT the switch that turns the
 * provider on — the backend route is. See the activation checklist in the
 * report: the button stays inert until a verified `/auth/apple` exists.
 */
export const APPLE_AUTH_ENABLED = import.meta.env.VITE_ENABLE_APPLE_AUTH === 'true'
