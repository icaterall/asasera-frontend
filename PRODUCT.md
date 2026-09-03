# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Direct users — developers.** Teams who clone this repository as the starting
point for an Arabic/English product. They arrive wanting direction handling,
theming, and typed translations already solved, and they judge the starter by
how little of it they have to undo.

**Downstream audience the starter is tuned for — Arabic-speaking users in MENA.**
Arabic leads: it is the language a first-time visitor sees, and the script the
design is tuned against first. English is the fully-supported second language,
not an afterthought in either direction.

## Product Purpose

A production-ready base for bilingual Arabic/English web products, where
right-to-left is the default case rather than a retrofit.

Success is a team cloning this, replacing the content, and shipping without
rebuilding direction handling, theme persistence, translation typing, or the
responsive scale — and without discovering an RTL defect after launch.

## Positioning

Most bilingual starters are an LTR template with an RTL patch applied later.
This one inverts that: Arabic is the default language, layout is expressed in
logical properties so mirroring needs no overrides, and the Arabic message
bundle is typed against the English one so a missing key fails the build
instead of silently falling back at runtime.

## Operating Context

- Cloned or forked as a starting point, not installed as a dependency.
- `npm run dev` · `npm run build` (typecheck + build) · `npm run lint` (oxlint).
- The repository carries in-project agent configuration (`.claude/`, `.cursor/`)
  including the Impeccable design detector hook, so design checks run for anyone
  who clones it.

## Capabilities and Constraints

Confirmed and present in the code:

- Vite 8 · React 19 · TypeScript (strict) · Tailwind CSS v4 · React Router 7 ·
  i18next / react-i18next.
- Arabic and English bundles, with `ar.ts` typed as `typeof en` so the two
  cannot drift.
- `<html lang>` / `<html dir>` driven from i18next's event bus, applied before
  React mounts; an inline script in `index.html` applies the stored language and
  theme pre-paint so there is no flash of the wrong direction or theme.
- Light / dark / system theming, persisted, live against `prefers-color-scheme`.
- Routes: landing page, About, 404, with the non-landing routes code-split.

Constraints future work must respect:

- **The current marketing copy is illustrative demo content.** It was written to
  make the design real, not because it is true. It may be kept as demo text, but
  it must never be presented as fact about a real company.
- **Arabic strings are machine-written drafts.** They are not final until a
  native speaker reviews them. No pass may treat the existing Arabic as settled
  copy.
- **The visual identity is provisional.** See Brand Commitments.

## Brand Commitments

- Name: **Asasera** / **أساسيرا**, from Arabic *asas* (أساس) — foundation.

### Colour — confirmed, binding

| Role | Value | Token |
|---|---|---|
| Primary | `#004ccc` | `--color-brand-500` |
| Secondary | `#14bf96` | `--color-teal-500` |

Both are anchored exactly at the `500` step of their ramp in `src/index.css`;
every other step is derived from them by holding the hue and varying lightness.
No third brand hue exists — the warm accent the placeholder identity carried was
removed rather than reassigned.

`#004ccc` is dark. It reads at 7:1 as a foreground on the light canvas but only
~2.4:1 on the dark one, so **UI text, icons, hairlines and focus rings use the
theme-aware `--accent` / `--accent-alt` tokens, never a fixed ramp step.** Solid
fills that carry white text keep `brand-500`, where white clears 7.2:1.

### Corner radius — confirmed, binding

**Every button, box, card, input, panel and rectangle is `5px`.** This is a
brand rule, not a scale: the entire Tailwind radius scale is collapsed onto 5px
in `src/index.css`, so `rounded-sm` through `rounded-4xl` all resolve to it and
any future `rounded-*` is correct by construction. Do not reintroduce a scale,
and do not use arbitrary values like `rounded-[16px]`.

`rounded-full` remains available only for genuinely circular shapes — status
dots, spinners, avatars, the ambient background blobs. It is not a way to make
a pill.

### Still open

The typeface pairing (Plus Jakarta Sans + IBM Plex Sans Arabic) and the "A
resting on a bar" mark are **placeholders** until the rest of the brand kit
arrives. They are not design authority.

## Evidence on Hand

**None.** There are no real customers, metrics, testimonials, case studies, or
press for this product.

Everything of that shape currently in the repository is invented demo content:
the uptime / latency / region / rating figures, the client names in the logo
marquee (NOOR BANK, FALAK AIR, MIRATH, QANAT, SOUQ LABS, TADWEEN, RIHLA), the
2021 Amman founding story, the seed round, the "eleven countries" and "team of
fourteen" claims. Future work must not cite any of it as real, and must not
invent replacements.

## Product Principles

1. **Arabic is the default case, not the ported one.** Any feature that works in
   English must work in Arabic in the same commit, and Arabic is what a
   first-time visitor sees.
2. **Mirroring is structural, not conditional.** Reach for logical properties
   first; a `rtl:` override is an admission that something is genuinely physical
   and must be commented as such.
3. **Drift fails the build.** Translation keys, theme tokens, and route params
   are typed. A gap should surface in `tsc`, not in production.
4. **Placeholder content stays visibly placeholder.** Demo copy is fine; demo
   copy that reads as a factual claim is not.
5. **The floor is non-negotiable.** WCAG 2.2 AA, keyboard completeness, and
   reduced-motion support are baseline conditions, not a polish pass.

## Accessibility & Inclusion

- **WCAG 2.2 AA is a hard requirement**, confirmed by the owner — not a target.
  Body copy must clear 4.5:1 and large display type 3:1 in both themes and both
  languages.
- Reduced-motion preferences are honoured rather than approximated.
- Arabic typography needs script-correct handling: no letter-spacing on cursive
  joins, and enough leading for ascenders and diacritics.
- **Arabic copy requires native-speaker review** before it can be treated as
  final.
