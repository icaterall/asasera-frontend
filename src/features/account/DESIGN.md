---
name: Asasera instructor balance extension
description: Local visual contract for the teacher balance control and account usage dialog.
colors:
  muted-light: "#666666"
  positive-light: "#26712e"
  muted-dark: "#b7b7b7"
  action-dark: "#80b4ff"
  positive-dark: "#84d98c"
rounded:
  dialog: "16px"
  balance-group: "12px"
  control: "8px"
spacing:
  compact: "8px"
  small: "12px"
  mobile: "16px"
  balance: "20px"
  desktop: "24px"
---

# Design System: Instructor balance extension

## Overview

This is a bounded extension of the existing teacher workspace. It documents only `InstructorBalance.tsx` and `InstructorBalance.module.css`, including their placement in TeacherHeader and ActivityEditor. The root DESIGN.md continues to define the application system.

The established direction is a compact outlined balance control with a readable, neutral account dialog. The available amount is the first read; the dialog groups balances, usage, teaching totals and dated transactions without decorative imagery. All larger-radius decisions below are local accepted exceptions, not new global tokens.

## Colors

Inherit the existing surface, raised surface, ink, divider, action and danger roles from the application's scoped palette. Action blue identifies available balance and the sparkle icon; positive green identifies positive ledger entries and verified email. Meaning also appears in text and signed values.

The frontmatter records only this feature's local overrides: stronger muted text and positive green in light mode, plus muted text, lighter action blue and positive green in dark mode. Do not copy these overrides into global styles.

## Typography

Inherit the existing Montserrat/Neo Sans Arabic stack. Use localized tabular numerals for balances, usage and ledger amounts; isolate mixed-direction email and signed transaction values. Arabic receives no added letter spacing.

The normal trigger uses a bold value (16px) and caption (12px); the compact trigger places a smaller value (14px) beside its caption. Dialog titles use 24px on desktop and 20px on mobile. Balance values use 24px, reduced to the accepted 22px mobile size. Body explanations use 14px with 1.6 line height; section titles use 16px and weight 700.

## Layout

The trigger remains at least 44px tall and no wider than 220px. TeacherHeader places it among account controls; ActivityEditor uses its compact form on phones.

The dialog is centered, capped at 720px, and leaves a 16px viewport inset on each side. Its header and footer remain outside the internally scrolling body. Below 540px, the viewport inset becomes 8px, inner padding uses the mobile spacing token, identity stacks vertically, and the footer can wrap. Available balance spans the first row above held and total balance. Usage and teaching totals retain two columns.

Use start-aligned text, flexible wrapping and existing direction handling so Arabic mirrors structurally. Long names, email addresses and balance values wrap rather than enlarging the dialog.

## Elevation & Depth

The dialog uses a single shadow (`0 24px 80px rgb(0 20 55 / 24%)`) over a translucent navy backdrop (`rgb(8 22 44 / 55%)`). Inside, a raised neutral balance group and thin dividers establish hierarchy. These depth treatments belong to this feature only.

## Shapes

Use the local dialog and balance-group radii from the frontmatter. The trigger, close control and notices use the local control radius. These record the reviewed implementation; they do not change the brand-wide radius contract in PRODUCT.md or the root design system.

## Components

The balance trigger is an outlined action with a sparkle icon, available amount, short caption and a chevron in its standard form. Hover uses the raised surface and action-colored border. Zero balance gives the icon the danger role while preserving an explicit amount and explanatory dialog copy.

The account dialog is a native modal with an accessible title and description. Opening focuses its close button; keyboard focus stays inside, Escape closes it, and dismissal returns focus to the previous control. Route changes close the dialog. The backdrop has no click-to-dismiss behavior. All links and buttons retain visible focus outlines; close, refresh and account links provide at least 44px target height.

The balance group distinguishes available, held and total values. Supporting sections show net usage, owner-scoped teaching counts and dated signed ledger entries. Keep loading, stale/error, usage-limit, zero balance and empty history states visible and understandable. Refresh is disabled while either data source is fetching.

The entrance translates vertically by 8px over 160ms with ease-out only when the user has not requested reduced motion. There is no entrance animation under reduced motion.

## Do's and Don'ts

- Do keep the currently available allowance readable at the header level and full detail in the modal.
- Do preserve Arabic/English labels, localized numbers, mixed-direction isolation, keyboard access and theme-aware contrast together.
- Do retain the distinction between service AI Credits, temporary holds and model token counts in explanatory copy.
- Do describe participation counts as repeated joins/attempts, never unique learners.
- Don't promote these local radii, numeric sizes or backdrop treatment into global tokens.
- Don't treat fixture screenshots as production account evidence, complete editor-layout certification or proof of deployment.

Review scope, evidence locations and validation limitations are recorded in `.impeccable/surfaces/instructor-balance.md` at the project root. No root DESIGN.md or shared design sidecar was regenerated for this extension.

## Billing return and account destination — 13 September 2026

`/teacher/billing` now opens a persistent Balance & usage overview. Plans remain
at `?view=plans`, reached by the separate Plans & top-ups navigation and existing
upgrade control. The overview uses the established neutral surfaces, restrained
borders, type family, theme-aware ink and logical spacing. Available, held and
total balances remain distinct. Purchase rows show the plan/top-up, date, paid
amount/currency, and credit added; free grants are not presented as purchases.
Usage and teaching totals use the existing owner-scoped endpoints.

Checkout returns show the overview immediately, with an independent pending
notice until the server records the receipt. Confirmation replaces the notice
with the purchased-credit summary. No timer navigates the user away or blocks
the account. Confirmation refreshes the wallet, usage, plans and purchase history.
Pending/error states do not claim payment success and offer retry or support
without initiating another checkout. A missing session reference cannot prove
payment. Catalogue failures do not hide the wallet or purchase history.

Phone layouts stack the available balance above held/total and turn each purchase
into a compact two-row record. Arabic mirrors structurally; currency/credit
amounts are isolated for bidirectional display. Dark confirmation text uses the
normal readable foreground rather than the darker green status color.

Fixture verification lives in `e2e/billing-return.spec.ts` and
`tests/billing-return.spec.tsx`, with screenshots under
`.impeccable/review/billing-return/`. These render the actual components with a
synthetic account and intercepted requests. They do not certify a real payment,
production webhook delivery, or deployment. No shipping images were added.

### Unresolved-payment follow-up

An actual local checkout returned indefinitely pending because its Stripe test
session had completed but no corresponding event or purchase existed in the
configured database. Read-only Stripe inspection found no configured test
webhook endpoints. No event was replayed, no endpoint was created, and no balance
was manually changed. Connecting payment events to the intended isolated test
environment remains an operational prerequisite; an interface change does not
record or fulfill a payment.

The pending notice is now compact, exposes the payment reference for support,
and never disables the existing balance, purchase history, or usage overview.
After the bounded confirmation window it says "Payment confirmation delayed"
and offers Check again, Support and Dismiss notice. The pending-mobile browser
regression advances past that window and checks the dashboard is still usable.
