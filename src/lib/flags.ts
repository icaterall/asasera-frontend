/// <reference types="vite/client" />

/**
 * Build-time feature flags.
 *
 * Vite inlines `import.meta.env.VITE_*` as a string literal at build time —
 * there is no runtime lookup, so a flag is a compile-time constant and the
 * dead branch is dropped by the bundler. Two consequences worth knowing:
 * changing a flag needs a rebuild, and the value is always a string, never a
 * boolean, so `Boolean(import.meta.env.VITE_X)` is true even for "false".
 * Hence the explicit comparison.
 *
 * Default is OFF. An unset or misspelled variable hides the feature rather
 * than exposing it, which is the safe direction for a gate whose whole job is
 * to keep something out of sight.
 */
function enabled(value: unknown): boolean {
  return value === 'true'
}

/**
 * Facebook sign-in.
 *
 * The Meta app is in review. This hides the BUTTON and nothing else: the
 * backend `/auth/facebook` routes, the `facebook` value in the
 * `user_identities` provider CHECK, the signed_request data-deletion callback
 * and the privacy-policy text are all untouched, because the review depends
 * on them. Setting VITE_ENABLE_FACEBOOK_AUTH=true and rebuilding brings the
 * button back with no code change.
 */
export const FACEBOOK_AUTH_ENABLED = enabled(import.meta.env.VITE_ENABLE_FACEBOOK_AUTH)
