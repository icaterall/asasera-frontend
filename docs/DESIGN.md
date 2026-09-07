# Asasera — visual language (historical)

> **Superseded on 7 September 2026.** The user's later instruction to clone
> Kahoot colors and styles replaces this guide's palette, geometry, font pairing,
> and blanket shadow restrictions. Use [the current design system](../DESIGN.md)
> and its [component sidecar](../.impeccable/design.json) for new work. The original
> text below is retained as historical rationale and font-audit evidence; its
> old prescriptions and measured ratios are not current visual authority.

The reader is a department head deciding on an annual contract, or a lecturer
opening this two minutes before class with a projector behind them. Both want
the same thing from the interface: to believe someone was in charge of it.

That rules out two directions. Not a consumer app — no rounded pills, no
mascot, no celebratory colour. Not a generic SaaS template — no card grid, no
drop shadow standing in for hierarchy. What is left is the look of good
institutional print: precise edges, real type, generous space, and one thing
per screen that is obviously the point.

Every number below was measured, not chosen by eye. The commands are in the
appendix.

---

## 1. Type

### The faces, and why these

| Role | Face | Weights | Source |
|---|---|---|---|
| Arabic | **Noto Sans Arabic** | 400, 700 | `src/assets/fonts/noto/`, self-hosted woff2 |
| Latin + numerals | **HK Grotesk** | 400, 500, 600, 700 | `src/assets/fonts/`, self-hosted woff2 |

This replaces Neo Sans Arabic for running text, and the reason is measured
rather than aesthetic. Reading the `OS/2` and `cmap` tables directly:

```
file                          usWeightClass   U+0600–06FF   FE70–FEFF
NotoSansArabic-Regular.ttf            400        255/256          140
NotoSansArabic-Bold.ttf               700        255/256          140
neosans-roman.ttf                     400         97/256          125
neosans-medium.ttf                    500         97/256          125
neosans-bold.ttf                      300         97/256          125   <-- LIGHT
```

Two disqualifying facts. Neo Sans covers **97 of 256** codepoints in the
Arabic block — barely more than a third — so any text straying into Persian
letterforms, honorifics or extended punctuation silently falls back to a
system face mid-word, which breaks the cursive join. And the file named
`neosans-bold.ttf` reports `usWeightClass 300`: it is a **Light**. There is no
bold cut of Neo Sans Arabic in this repository at all.

That second fact is fatal for this particular design. Section 3 removes
shadows from the system, which leaves size, weight and space as the only
tools for hierarchy. A face with no bold discards one of the three. Noto Sans
Arabic has a genuine 700 and near-complete coverage, and it is already
converted to woff2 and sitting in the repo unused.

Neo Sans keeps exactly one job: the wordmark. That is shipped as artwork
(`asas-logo.svg`), so it costs no font file and creates no second face in
running text.

HK Grotesk carries Latin and the digits. It is also already in the repo and
was also never declared — the current app runs Latin through Neo Sans's Latin
glyphs. A grotesque with a high x-height sits better beside Noto's open
Arabic counters than Neo Sans's narrower Latin does, and it gives four real
weights where Neo Sans gives two.

The two are joined by `unicode-range`, so a mixed line is two chosen faces
rather than one face plus whatever the OS supplies:

```css
@font-face { font-family: 'Asasera Sans'; src: url('…/hkgrotesk-regular.woff2') format('woff2');
             font-weight: 400; font-display: swap;
             unicode-range: U+0000-024F, U+2000-206F, U+20A0-20CF; }
@font-face { font-family: 'Asasera Sans'; src: url('…/noto/NotoSansArabic-Regular.woff2') format('woff2');
             font-weight: 400; font-display: swap;
             unicode-range: U+0600-06FF, U+0750-077F, U+FB50-FDFF, U+FE70-FEFF; }
```

`font-synthesis: none` everywhere. A synthesised Arabic bold is a smeared
regular and it wrecks the join; better to get a real weight or none.

### The scale

Major third, **ratio 1.25**, anchored at 16px and rounded to whole pixels. A
1.25 ratio is wide enough that two adjacent steps are unmistakably different —
the failure in the current screens is a type range of about 14–20px, where
every step is arguable — and tight enough that seven steps still fit a phone.

| Token | Size | Line height | Weight | Use |
|---|---|---|---|---|
| `--fs-hero` | `clamp(31px, 6vw, 39px)` | 1.15 | 700 | One per screen, at most |
| `--fs-title` | `clamp(25px, 4vw, 31px)` | 1.2 | 700 | Screen heading |
| `--fs-heading` | 20px | 1.35 | 600 | Section heading |
| `--fs-lead` | 18px | 1.7 | 400 | Standfirst under a title |
| `--fs-body` | 16px | **1.75** | 400 | Running text, inputs |
| `--fs-small` | 14px | 1.6 | 400/500 | Labels, help text |
| `--fs-caption` | 12px | 1.5 | 500 | Meta, counters, legal |

**Line height is one value per step, not one per script.** The rule is that
Arabic body never drops below 1.7; the constraint is that nothing may be
overridden per direction. Both are satisfied by setting body to 1.75 for
everyone. Arabic needs it — the ascenders and the dot clusters below the
baseline collide at 1.5 — and Latin at 1.75 reads as unhurried rather than
loose, which suits a page someone reads once and acts on. A direction-specific
line height would drift the moment a translated string wrapped differently.

Inputs are **16px, never smaller**. Below 16px iOS Safari zooms the viewport
on focus, and on a 375px screen that zoom is a layout break, not a nuisance.

---

## 2. Space

Base unit **4px**, scale `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96`. It is a
4pt grid with the awkward middle steps removed, so there is one obvious answer
for any gap rather than three plausible ones.

| Gap | Value |
|---|---|
| Label → input | 8 |
| Field → field | 20 |
| Field group → action | 32 |
| Card padding | 24 mobile / 32 desktop |
| Section → section | 64 mobile / 96 desktop |

Vertical rhythm between sections is the **only** thing that separates one
block of content from the next on a long page. Not a rule, not a tint — space.
A hairline between every section turns a page into a ledger.

---

## 3. Elevation — hairline, and only hairline

There are no shadows and corners stop at 5px, so "raised" cannot be signalled
the usual way. Three candidates were available: a shadow (excluded), a tint
shift, or a hairline. **The primary method is the hairline: `1px solid
var(--line)` at `border-radius: 5px`.**

Why not tint. On the near-white canvas this product uses, a surface tint is a
difference of two or three percent luminance. That survives a designer's
monitor and does not survive a lecture theatre projector, a phone at half
brightness, or the glare the actual user is sitting in. A 1px line at 15.8:1
against the page survives all three.

Why the hairline is also the right *look*. A 5px radius with a drawn edge is
the strongest signal in this system — it reads as something ruled and printed,
which is exactly the institutional register the audience expects. Tight
corners plus a visible edge is a form; tight corners plus a soft fill is a
disabled button.

So, one method, three jobs, and no overlap:

- **Hairline** — *this is a surface.* Cards, inputs, selects.
- **Tint** (`--raised`) — *these belong together.* Grouping only, and never
  on the same element as a hairline. A tinted, bordered box is two claims
  about the same edge.
- **Space** — *this is a new subject.* Section separation. Nothing else.

Consequence to hold to: a bordered box inside a bordered box is a bug. The
auth screens get **one card**, and everything inside it is separated by space.

---

## 4. Colour

Brand tokens are fixed by the project rules. What follows are the interaction
roles derived from them, with the measured contrast against the three surfaces
they can appear on (`#FFFFFF`, `--canvas #FBFBFE`, `--raised #F5F7FB`).

| Role | Value | Worst ratio | Verdict |
|---|---|---|---|
| `--ink` | `#10233D` | 14.72 | AA body |
| `--ink-muted` | `#55657D` | 5.52 | AA body |
| `--brand-blue` | `#0B5FD0` | 5.50 | AA body |
| `--blue-hover` | `#0A4FAF` | 7.12 | AA body |
| `--blue-active` | `#08428F` | 8.96 | AA body |
| `--success` | `#00806B` (brand-teal) | 4.55 | AA body |
| `--error` | `#C4362B` | 5.01 | AA body |
| `--disabled-fg` | `#7B8595` | 3.48 | see below |
| `--warn` | `#E8A33D` | **2.01** | **never text** |

Four things worth stating rather than assuming.

**`--warn` cannot carry text.** At 2.01:1 it fails even the large-text floor.
It is a non-text indicator only: a left border on a notice, a dot, a fill
behind ink. Any warning *words* are `--ink` on a `--warn`-bordered surface.

**Hover and active go darker, not lighter.** Both stay above the body-text
floor, so a link that is hovered never becomes less readable than one that is
not — which is what happens with the usual "lighten on hover".

**Disabled is deliberately below AA.** 3.48:1 is the point of a disabled
control: WCAG exempts them precisely because they must read as inert. Pairing
it with `cursor: not-allowed` and `aria-disabled` means the state is carried
by three signals, not by colour alone.

**Error is `#C4362B`, a brick rather than a fire-engine red.** `#D14343`
measured 4.26 on the raised surface and misses the body floor; this one clears
it on all three, and the lower chroma sits better next to a navy ink than a
saturated red does.

### Focus

```css
:focus-visible {
  outline: 2px solid var(--brand-blue);
  outline-offset: 2px;
}
```

The offset is load-bearing, not decoration. `--brand-blue` measured against
itself is **1.00:1** — a blue ring drawn tight on the primary button, which is
blue, is invisible. The 2px offset puts the page surface between the control
and the ring, so the ring is always seen against `--canvas` at 5.71:1 no
matter what colour the control is. One rule, every surface, no per-component
override.

`:focus-visible`, not `:focus`, so a mouse click on a button does not leave a
ring behind while a keyboard tab still does.

---

## 5. The one emphatic moment

Each screen gets exactly one, and it is achieved by **mass and colour, not
depth**: a single filled `--brand-blue` button at full container width, 48px
tall, 16px semibold white — the only filled element on the screen. Everything
else is ink on white inside hairlines.

That works because of scarcity. On a screen where nothing else is filled, one
filled rectangle is unmissable without needing a shadow to lift it or a
gradient to decorate it. Add a second filled button and both stop working —
which is the real reason the secondary action on every auth screen is a text
link, not an outlined button.

**The gradient** (blue → teal, from the logo) appears at most twice per screen
and never behind text. On the auth screens it appears **once**: a 3px rule
above the card heading. It is the only ornament in the system and it earns its
place by being the one thing carried over from the mark.

---

## 6. Motion

| Token | Value | Use |
|---|---|---|
| `--dur-fast` | 120ms | Colour changes: hover, active, focus |
| `--dur-base` | 200ms | Element state: error appearing, button → spinner |
| `--ease` | `cubic-bezier(0.2, 0, 0, 1)` | Everything |

Nothing enters, nothing slides, nothing staggers. The longest duration in the
system is 200ms, which is below the threshold at which a transition reads as
an animation rather than as responsiveness. A person opening this two minutes
before a lecture should never wait for the interface to finish expressing
itself.

One easing curve, decelerating: fast at the start so the response feels
immediate, settling at the end so it does not feel abrupt.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important;
                           transition-duration: 0.01ms !important; }
}
```

The spinner inside a submitting button is the sole exception and it is a
genuine one: it reports that a network request is in flight, so removing it
would remove information rather than decoration. Under reduced motion it stops
rotating and the button label carries the state in words instead.

---

## 7. Direction

Every rule above is direction-neutral by construction. Logical properties only
— `margin-inline`, `padding-inline`, `border-inline-start`, `inset-inline`,
`text-align: start`. There is not one `left` or `right` in layout CSS and
therefore not one per-direction override.

Two places need explicit handling, and both are content rather than layout:

- **Email inputs** are `dir="ltr"` with `text-align: start`. An address is
  LTR text; typed into an RTL field the `@` and the dots reorder and the user
  cannot tell whether what they typed is what will be sent.
- **Latin inside Arabic prose** is wrapped in `<bdi>`. Without it, a Latin
  word or a number at the end of an Arabic sentence jumps to the wrong end of
  the line. Where a count sits inside a sentence, the copy is written with the
  number as its own interpolation so it can be isolated at render.

Numerals are Western `0-9` in both languages, and `font-variant-numeric:
lining-nums tabular-nums` with `"anum" 0` prevents any Arabic face from
substituting Arabic-Indic digits under `lang="ar"`.

---

## Appendix — how the numbers were obtained

Font weights and Arabic coverage, read from the `OS/2` and `cmap` tables of
each file with a direct binary parse (no fontTools in this environment):

```
python3 scripts/font-audit.py
```

Contrast ratios, WCAG 2.1 relative luminance:

```
python3 scripts/contrast.py
```

Both print the tables reproduced above.
