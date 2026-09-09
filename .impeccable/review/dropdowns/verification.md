# Dropdown refinement — 9 September 2026

## Implemented

- Shared Base UI selection control replaces the frontend's native select elements. Short lists support keyboard navigation/typeahead; eight or more entries gain search. Registration reference fields always use search. Grouped options, bilingual keywords, Arabic direction, disabled options, numeric zero IDs and form values are preserved.
- White/navy or dark surfaces, Asasera blue focus/selection, checkmarks, chevrons, scrollable lists, 48px triggers and mobile rows, subtle 140ms entry, reduced-motion and forced-color rules. Portals anchor to the document, native dialog or fullscreen container as appropriate.
- Account and live-session menus share the visual treatment. Account entries now have Lucide icons. Profile role frames and action destinations remain unchanged.
- Existing field callbacks now receive the selected string directly. Required fields and form blur validation remain connected. Removed the previous registration-only combobox and obsolete native chevron styles.
- Existing E2E selection helpers were adapted to interact with visible options. Those browser tests were not executed in this environment.

## Checks

- Fourteen isolated React/JSDOM tests pass: pointer selection, form values, keyboard navigation, disabled option rejection, Escape/focus restoration, search/no-results/recovery, Arabic diacritic lookup, outside dismissal, disabled controls and dismissal when an open field becomes disabled, required validation including zero IDs, Tab/blur validation for both list types, dialog containment/grouping, Arabic direction and option parsing. Some tests cover several of these behaviors. Run with `npm run test:dropdowns`.
- The checks caught and corrected a null portal container that suppressed ordinary-page menus, a generic caption replacing empty-option wording, and missing blur validation when leaving an open menu. Tests wait for popup focus before subsequent keystrokes; disabled items may receive keyboard focus but cannot be selected.
- Frontend TypeScript/production build and bundle assertions pass. The pre-existing lazy Three.js chunk size advisory remains. Scoped lint on the new shared component, option helpers, auth fields, account control and test helpers passes without warnings. A broader scan of all migrated screens has no errors and seven pre-existing hook/export warnings. Git whitespace check passes.
- Source contrast calculations: ten text/focus pairs range from 5.34:1 to 13.19:1. Default control boundaries measure 3.22:1 against white and 3.88:1 against the dark surface. These are declared color calculations, not sampled rendered pixels.
- One static detector pass reports six radius/typography advisories and one font warning. The 7px/12px menu radii are intentional scoped refinements documented in DESIGN.md; Montserrat is the user's existing pinned font. Original detector output is retained without rerunning it as a visual approval.

## Verification limit

The existing admin-enforced browser policy-verification denial expressly prohibited alternative access paths. No alternate browser, localhost request, screenshot renderer or live application fixture was used. JSDOM only rendered isolated synthetic components and made no application API requests. Desktop/mobile spacing, actual collision positioning, zoom, touch, screen-reader output, dark-theme rendering and complete real-app journeys still need permitted browser inspection. This record is implementation and synthetic-interaction evidence; visual recapture remains outstanding. No deployment or production-data changes were made.
