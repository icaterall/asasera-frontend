---
name: Asasera administration
description: Source record for the admin users and instructor AI credit surface.
colors:
  admin-canvas: "#f4f7fb"
  admin-heading: "#073579"
  admin-muted: "#56657b"
  admin-border: "#dce3ee"
  admin-table-heading: "#eaf0f9"
  admin-table-ink: "#344762"
  admin-field-border: "#9eabc0"
  admin-summary-label: "#d9e9ff"
  admin-dark-canvas: "#141d2a"
  admin-dark-heading: "#c6ddff"
  admin-dark-muted: "#bbc8da"
  admin-dark-border: "#43516a"
  admin-dark-table-heading: "#23324a"
  admin-dark-table-ink: "#d7e5fb"
  admin-dark-field-border: "#778ba9"
  admin-dark-link-focus: "#a3caff"
  admin-dark-link-hover: "#d7e8ff"
rounded:
  admin-field: "6px"
  admin-navigation: "8px"
  admin-panel: "12px"
spacing:
  admin-gap: "28px"
  admin-panel: "28px"
  admin-phone-inline: "16px"
components:
  admin-panel:
    rounded: "{rounded.admin-panel}"
    padding: "{spacing.admin-panel}"
  admin-field:
    rounded: "{rounded.admin-field}"
    padding: "12px"
  admin-summary:
    backgroundColor: "{colors.admin-heading}"
    textColor: "#ffffff"
    rounded: "{rounded.admin-panel}"
    padding: "{spacing.admin-panel}"
---

# Asasera admin interface

## Overview

Recorded on 9 September 2026 from [the admin components and styles](../src/features/admin/), [the shared design tokens](../src/design/tokens.css), and [the admin UI tests](../tests/admin.spec.tsx). This document applies to `/admin`, `/admin/users`, and `/admin/users/:id` only. It records the built surface; it does not redefine the global brand or replace [DESIGN.md](../DESIGN.md).

The restrained blue administration palette extends the established Asasera Blue identity. The existing logo, Montserrat/Neo Sans Arabic typography, shared controls, language switch, and account avatar connect administration to the rest of the application. [PRODUCT.md](../PRODUCT.md) supplies the bilingual and accessibility commitments; its historical starter layout, font, and corner descriptions are not the authority for the current implementation.

The operating contract is admin-only user lookup and instructor AI credit management. The reserved owner administrator uses Google sign-in. The frontend consumes the authenticated account's server-provided role; it does not hardcode the owner's email or establish that identity itself. Backend authorization, reservation enforcement, migrations, and runtime verification are separate concerns from this UI record.

**Verification and review scope:** the implementation/review handoff reports a passing source/JSDOM review with **9 UI tests passed**. The finish reviewer disposition is **ship for the three scored corrections only**: dark-theme contrast, exact-cent credit removal, and focus transitions. This is not whole-surface visual approval. Browser inspection and rendered visual verification were unavailable; no screenshots were supplied or captured, and no browser tools, capture tools, or alternative rendering paths were used in this documentation pass. Actual desktop/mobile appearance, RTL geometry, browser focus presentation, and dark-mode rendering remain unverified.

## Colors

The frontmatter records only the admin surface's observed local palette and geometry. Shared brand, action, text, and surface colors continue to come from the existing design system. The active navigation uses Asasera Blue with white text; the summary uses the deeper admin blue with white amounts and pale labels. Neutral panels separate account data, adjustment entry, and history.

Dark mode changes the canvas, headings, muted text, table header, borders, field outlines, links, and keyboard outlines. Local headings use a pale blue, links and focus outlines use the lighter link/focus token, and the active navigation retains a solid blue fill with white text. Shared panel backgrounds and body text inherit the dark design tokens.

Role badges combine text and color: instructor is green, administrator is deep blue, and other roles use pale blue. Success and error messages include written status; color alone does not carry the result. The summary retains its deep blue fill in both themes.

## Typography

The admin shell inherits the shared Montserrat and Neo Sans Arabic stack. Page titles are heavy (800) and fluid (`clamp(26px, 2.7vw, 38px)`). Section headings are compact (22px, 750), labels and table body are generally 14px, and metadata is 12–13px. Supporting paragraphs are capped at 72 characters per line where the component specifies a limit.

Monetary values and pagination use tabular numerals. Credit formatting uses the active locale, USD, and between two and five fractional digits, preserving the supported millicent precision. Names and free-form reasons use automatic text direction; email addresses use LTR or bidirectional isolation. The decimal amount input remains LTR in Arabic.

## Layout

The desktop header is at least 80px tall and contains the logo, administration label, language switch, and signed-in account control. The workspace has a 240px navigation rail and a flexible main column. Main content is capped at 1600px, centered, and padded fluidly from 20px to 52px. Logical inline spacing and the shell's explicit RTL/LTR direction support mirroring.

At 1100px and below the rail becomes 205px and the adjustment/history columns stack. At 760px and below the rail becomes wrapping horizontal navigation, the administration label and decorative page icon are hidden, the logo becomes smaller, and main padding is 24px vertically and 16px horizontally. Search occupies a full filter row. The credit summary changes from three columns to three label/value rows.

The user table retains semantic table structure and scrolls horizontally inside its bordered container when needed. Long names and emails wrap, while amounts, role badges, and row actions stay together. Account facts, pagination, and action buttons wrap. These responsive rules are verified in source only; they are not measurements of rendered overflow.

## Elevation & Depth

The local admin stylesheet adds no shadows. Neutral fills, one-pixel borders, spacing, and the solid summary panel establish hierarchy. Shared controls and the account dropdown retain their existing design-system behavior; this surface does not change their global elevation rules.

## Shapes

The built administration surface uses gently rounded fields, navigation items, and larger panels as recorded in frontmatter. Role badges have small corners (5px). The inherited account control remains circular. Tables sit inside one rounded container rather than placing each row in a separate card.

## Components

### Access and navigation

The layout waits for authentication before exposing the workspace. Anonymous users see the authorized-Google sign-in entry, with an unavailable-provider status when Google is disabled. A signed-in non-admin sees an access explanation and a link back to their own account; the admin navigation and nested user data views are not mounted. No password field is offered by this entry screen.

Authorized administrators get “Users & credit” and “My account” navigation. The shared avatar provides the administrator's dashboard destination, and administrator account controls omit password reset. `/admin` redirects to `/admin/users`; role-aware return handling preserves authorized admin detail destinations and returns non-admins to their own home.

### User search and table

Search by name or email is submitted explicitly and trimmed before querying. Account-type filtering includes teacher, student, admin, and support; changing the filter or submitting a search resets pagination to page one. Results use 25 users per page and show the total count as a status message.

Rows expose name, email, role, account state, email verification, and instructor available credit. Instructor rows link to “Manage credit”; other roles link to “View account” and display no credit amount. Loading, failed-query retry, and no-results states are explicit.

### User detail and balances

The detail page shows account state, verification, registration date, and last sign-in. Instructor accounts additionally show **available to spend**, **reserved for running jobs**, and **total balance** as separate values. Welcome-credit text states whether the one-time $0.50 grant has been claimed.

Only instructor accounts receive a credit form and credit history query. Deleted or suspended instructors retain their account/credit context but receive an explanation in place of adjustment controls. Other roles receive an instructor-only explanation.

### Amount entry, review, and focus

The form starts with “Add credit” and `0.50` USD. It accepts a plain decimal string with Western digits, a dot separator, and up to five fractional digits. The parser splits the whole and fractional strings and pads the fraction into integer millicents: **1 USD = 100,000 millicents**. It does not multiply a floating-point decimal. For example, `0.07` becomes exactly `7000`, and `0.00001` becomes `1`.

Before review, the form requires an amount greater than zero and at most $10,000, a trimmed reason of at least three characters, and a resulting total balance at least as large as the reserved balance. The reason field is capped at 500 characters. A removal can therefore consume all available credit while retaining reservations: a $0.12 total with $0.05 reserved permits an exact $0.07 removal.

“Review adjustment” creates a request key and opens a review within the panel; it sends no adjustment yet. Review displays the direction, amount, target account, reason, and expected total balance, and explains that the administrator and reason will be recorded. The final balance is checked on save.

Entering review moves focus to its heading (`tabIndex=-1`). “Edit details” restores the form and focuses the amount input. Successful saving also returns to the amount input and announces the saved balance through a status message. Errors use an alert. Links, buttons, inputs, and textareas have a visible local keyboard outline (3px with a 3px offset), with a lighter outline in dark mode; shared selects preserve their own focus behavior.

### Submission, retry, and history

Confirmation is a separate action; removal uses the shared danger variant. An in-flight guard prevents duplicate submissions, and the loading state disables confirmation. A connection failure or server error with an uncertain result keeps the reviewed payload and request key, disables editing, and offers **“Retry same adjustment.”** Retrying submits that same key, enabling the server's idempotent response. The UI does not invent a new adjustment to recover an uncertain one.

After success, the form clears the reason and review state and refreshes the user, user list, and credit history queries. History shows operation type, signed amount, reason, timestamp, administrator email when supplied, and balance after adjustment when supplied. Older entries load through an explicit action. Provider-cost entries are described as service cost rather than another instructor deduction. History includes its own loading, failure/retry, and empty states.

## Do's and Don'ts

- **Do** retain the Asasera logo, bilingual typography, language switch, and shared account control when extending administration.
- **Do** keep available, reserved, and total amounts distinct and preserve integer millicent comparisons.
- **Do** preserve explicit review, recorded reason, stable retry keys, duplicate-submit protection, and focus restoration.
- **Do** maintain semantic labels, table headings/caption, status/error announcements, bidirectional isolation, and theme-specific text/focus colors.
- **Do** describe the reported nine-test result as source/JSDOM evidence and the reviewer’s ship verdict as limited to its three scored fixes.
- **Don't** promote this restrained admin palette or panel geometry into a global brand redesign.
- **Don't** treat frontend role checks as proof of server authorization or the reserved owner's Google identity enforcement.
- **Don't** claim browser, screenshot, mobile/RTL rendering, visual accessibility certification, or complete application validation from this documentation or the isolated UI tests.
