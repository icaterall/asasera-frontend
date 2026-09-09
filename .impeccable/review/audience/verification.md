# Audience verification

Implemented bilingual shared controls for one category, multiple stages and optional countries. Category/stage fields are required in the new forms. Countries use IP suggestion once for a new form; saved and explicitly cleared selections persist. Long names wrap, menus use portals, form rows collapse below 700px, the editor disclosure is bounded to half the viewport, and reduced motion comes from the existing shared dropdown styles.

Verified in isolated JSDOM: multi-selection, chip removal, clear/required validity, search with Arabic text, disabled choices, Escape/focus return, Arabic direction, country ordering, default suggestion, explicit clearing, late responses and editing. Together with existing dropdown tests: 22 pass. Frontend production build passes. The scoped lint check reports only the existing course-loading effect warning.

Static detector: existing shared Montserrat and 7px/12px radius findings are intentional incumbent design choices, documented in DESIGN.md. Removed the newly introduced literal border fallback in favor of the shared dropdown token.

Live browser rendering was not attempted: earlier computer-use access was denied by the environment's browser policy. These checks do not constitute screenshot approval of mobile/desktop, dark mode or zoomed layouts. No alternate browser path was used.
