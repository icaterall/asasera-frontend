# Asasera

A bilingual (Arabic / English) React starter with a full design system, working
right-to-left support, light and dark themes, and a responsive landing page +
routing shell to build on.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + production build to dist/
npm run lint
npm run preview
```

## Stack

| | |
|---|---|
| Build | Vite 8 + `@vitejs/plugin-react` |
| UI | React 19, TypeScript (strict) |
| Styling | Tailwind CSS v4 (CSS-first config, no `tailwind.config.js`) |
| Routing | React Router 7 |
| i18n | i18next + react-i18next + browser language detector |
| Icons | lucide-react (brand marks are hand-drawn in `ui/BrandIcons.tsx`) |

## Layout

```
src/
├─ i18n/
│  ├─ index.ts            i18next init + <html lang/dir> syncing
│  ├─ languages.ts        the language registry (code, endonym, dir, Intl locale)
│  ├─ i18next.d.ts        makes t() reject keys that do not exist
│  └─ locales/
│     ├─ en.ts            source of truth for the message shape
│     └─ ar.ts            typed as `typeof en` — cannot drift
├─ context/               ThemeProvider (light / dark / system)
├─ hooks/                 useTheme, useLanguage, useScrollProgress, useDocumentTitle
├─ components/
│  ├─ layout/             Navbar (+ mobile drawer), Footer, Layout, ScrollManager
│  ├─ sections/           Hero, HeroPreview, Stats, Features, Platform, CallToAction
│  └─ ui/                 Button, Container, Reveal, Spotlight, Logo, toggles, Aurora
├─ pages/                 Home, About, NotFound
├─ lib/cn.ts              class joiner with Tailwind conflict resolution
├─ index.css              design tokens, theme variables, composite classes
└─ App.tsx                routes (About and NotFound are lazy-loaded)

Dockerfile                two-stage build; nginx plus the contents of dist/
nginx.conf                /healthz, the SPA fallback, and cache headers
kubernetes/               the Deployment and Service applied by CI
scripts/check-k8s.ts      `npm run check:k8s` — the manifest contract
```

## How the bilingual part works

**Arabic leads.** A first-time visitor gets Arabic regardless of their browser
locale — `navigator` is deliberately absent from the i18next detector order, and
`index.html` ships `lang="ar" dir="rtl"`. A returning visitor's stored choice
wins. To make this English-first instead, set `DEFAULT_LANGUAGE` in
`src/i18n/languages.ts`, reorder `LANGUAGES`, and flip the fallback in the
inline script in `index.html`.

**Direction lives on `<html>`.** `src/i18n/index.ts` subscribes to i18next's
`languageChanged` event and writes `lang` and `dir`. Because that sits on the
event bus rather than in a component, the document is correct before React
mounts and stays correct no matter what triggers the change. `index.html` also
applies the stored language and theme in a tiny inline script, so there is no
flash of the wrong direction or the wrong theme on first paint.

**Layout mirrors itself.** Components use logical Tailwind utilities — `ps-`/`pe-`,
`ms-`/`me-`, `start-`/`end-`, `border-s`/`border-e`, `text-start` — so nothing
needs a `[dir="rtl"]` override. The handful of genuinely physical things
(a sliding toggle indicator, an arrow glyph) use the `rtl:` variant and are
commented where they appear.

**Typography is script-aware.** Latin text uses Plus Jakarta Sans, Arabic uses
IBM Plex Sans Arabic. `index.css` swaps the stack on `[dir="rtl"]`, and also on
any `[lang]`-marked subtree — so an Arabic chip inside an English page still
gets the Arabic face. Two RTL-specific rules matter:

- letter-spacing is reset to `normal`, because Arabic is cursive and tracking
  shears the joins apart;
- headings get more line-height to clear ascenders and diacritics.

**Numbers are isolated.** Strings like `+8%` flip their sign to the wrong side
when they inherit RTL, so numeric runs carry `dir="ltr"`.

### Adding a language

1. Copy `src/i18n/locales/en.ts`, translate it, and type it as `typeof en` —
   `tsc` will now list every key you missed.
2. Add an entry to `LANGUAGES` in `src/i18n/languages.ts`.
3. Register the bundle in `resources` in `src/i18n/index.ts`.

`LanguageToggle` renders a segment per registered language, so a third one
appears on its own — adjust its `grid-cols-2` if you go past two.

## Design system

### Brand rules (binding — see `PRODUCT.md`)

- **Primary `#004ccc`, secondary `#14bf96`.** Anchored at the `500` step of
  `--color-brand-*` and `--color-teal-*`. There is no third brand hue.
  Because `#004ccc` is dark, anything that renders as *text* uses the
  theme-aware `--accent` / `--accent-alt` tokens (`text-accent`,
  `text-accent-alt`) rather than a fixed ramp step; solid fills carrying white
  text keep `brand-500`.
- **Every box is `5px`.** The whole radius scale is collapsed onto 5px, so
  `rounded-sm` … `rounded-4xl` are all 5px and any `rounded-*` you write is
  already right. `rounded-full` is reserved for real circles — dots, spinners,
  the background blobs — not for pills.

### Tokens

All tokens live in `src/index.css`:

- `@theme` holds the brand ramps, the fluid type scale (`text-display`,
  `text-hero`, `text-title`, `text-lead`), easings and keyframes.
- `@theme inline` maps semantic names (`canvas`, `surface`, `line`, `fg`,
  `muted`, `faint`) onto CSS variables that the `.dark` class swaps, so
  `bg-surface` and `text-fg` re-resolve the instant the theme changes.
- Composite classes that are awkward as utilities: `.glass`, `.panel`,
  `.text-gradient`, `.border-gradient`, `.spotlight`, `.grid-backdrop`.

`.glass` (backdrop blur) is reserved for elements that float over scrolling
content — the header, the drawer, the toggles. Everything else uses `.panel`,
which skips `backdrop-filter`; each blurred layer costs a compositing pass and
the page backdrop is already a soft gradient.

Dark mode is class-based (`@custom-variant dark`) with three states — light,
dark, and system — persisted to `localStorage` and kept live against
`prefers-color-scheme`.

## Product context and design tooling

`PRODUCT.md` holds the durable product record — who this is for, what is
confirmed, and what must never be claimed. Read it before changing content or
identity. Two things it pins down:

- the marketing copy, metrics, client names and company history in this repo are
  **invented demo content** and must not be presented as fact;
- the Arabic strings are **machine-written drafts** pending native-speaker
  review, and the violet/cyan identity is a **placeholder** until the real brand
  kit lands.

[Impeccable](https://impeccable.style) is installed in-project (`.claude/`,
`.cursor/`). `.claude/settings.local.json` registers its design detector as a
hook: a fast check after edits to UI files, and a deeper pass when a turn ends.
Run `/impeccable hooks off` to disable it, or `npx impeccable detect src/` on
demand.

## Deployment

A push to `main` builds the image, pushes it to ECR, and rolls it out to EKS
(`.github/workflows/main.yml`). The image is two-stage: `tsc -b && vite build`
runs against the full dependency tree, and what ships is nginx plus the
contents of `dist/` — no npm, no source, no lockfile.

`nginx.conf` carries three things the default config does not:

- **`/healthz`**, answered from the config with a literal `200`. All three
  probes in the manifest call it.
- **The SPA fallback.** `App.tsx` uses `BrowserRouter`, so `/about` is a route
  the client owns and not a file that exists. Without `try_files $uri $uri/
  /index.html`, following a link works and reloading on it returns nginx's 404.
- **Cache headers.** Everything under `/assets/` is fingerprinted by Vite and
  is immutable for a year; `index.html` is `no-cache`, because it names the
  hashed bundles and the routes are lazy-loaded — a stale shell asks for chunks
  that no longer exist, which breaks navigation rather than just looking old.

### `npm run check:k8s`

The manifest, `nginx.conf` and the workflow are edited separately and nothing
reconciles them, so `scripts/check-k8s.ts` asserts they agree before CI touches
the cluster: `containerPort` against `targetPort` against nginx's `listen`, the
ECR repository the workflow pushes to against the image the pod pulls, and the
Deployment and container names against the ones the workflow's `set image` and
jsonpath hard-code.

The probe check is the subtle one. Because the SPA fallback answers *any* path
with `index.html` and a 200, a probe pointed at a path nginx does not
explicitly handle passes forever — so every probe path must have its own
`location =` block, not merely return 200.

Coverage is enforced rather than listed: the script enumerates `kubernetes/`
and fails on any file that has neither a contract nor a written-down
exclusion.

## Notes

- `cn()` wraps `tailwind-merge`. This is load-bearing: component recipes ship
  base classes like `inline-flex`, and a caller passing `hidden lg:inline-flex`
  has to win. Plain string concatenation cannot do that, because the winner is
  decided by stylesheet order, not attribute order.
- Every grid declares a base `grid-cols-*`. Without one, the single implicit
  track is sized `auto` and can resolve to max-content, overflowing narrow
  viewports.
- `Reveal` honours `prefers-reduced-motion` and decides during the first render,
  so those users never see hidden content.
- The design targets WCAG 2.2 AA: body copy clears 4.5:1 in both themes, and the
  gradient display type clears the 3:1 large-text threshold.
