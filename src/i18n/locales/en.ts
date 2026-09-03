/**
 * English is the source of truth for the message shape.
 * `ar.ts` is typed as `typeof en`, so a missing or misspelled Arabic key
 * is a compile error rather than a runtime fallback.
 */
const en = {
  brand: {
    name: 'Asasera',
    tagline: 'Foundations for bilingual products',
  },

  common: {
    skipToContent: 'Skip to content',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    switchToArabic: 'التبديل إلى العربية',
    switchToEnglish: 'Switch to English',
    toggleTheme: 'Toggle colour theme',
    lightMode: 'Light',
    darkMode: 'Dark',
    language: 'Language',
    backHome: 'Back to home',
    new: 'New',
  },

  nav: {
    home: 'Home',
    features: 'Features',
    platform: 'Platform',
    about: 'About',
    signIn: 'Sign in',
    getStarted: 'Get started',
  },

  hero: {
    badge: 'Asasera 1.0 is in public beta',
    titleLead: 'Build products that feel',
    titleAccent: 'native everywhere',
    subtitle:
      'Asasera is the foundation layer for teams shipping bilingual interfaces. Arabic and English are first-class from the very first commit — layout, type and motion mirror themselves, so you never maintain two front ends.',
    ctaPrimary: 'Start building',
    ctaSecondary: 'See how it works',
    trust: 'No credit card required · Free forever for open source',
    marqueeLabel: 'Trusted by teams building across the region',
  },

  stats: {
    uptime: { value: '99.98%', label: 'Uptime last 12 months' },
    latency: { value: '12ms', label: 'Median edge response' },
    regions: { value: '38', label: 'Regions worldwide' },
    rating: { value: '4.9/5', label: 'Average customer rating' },
  },

  features: {
    eyebrow: 'Why Asasera',
    title: 'Everything a bilingual product needs, on day one',
    subtitle:
      'Most stacks treat right-to-left as a retrofit. Asasera treats it as the default case, which means less code, fewer regressions and interfaces that read naturally in both directions.',
    items: {
      bidi: {
        title: 'Bidirectional by default',
        body: 'Layout, iconography and scroll direction mirror automatically. One component tree serves both Arabic and English — no forked templates, no duplicated stylesheets.',
      },
      responsive: {
        title: 'Responsive without caveats',
        body: 'A fluid scale that holds from a 320px handset to an ultrawide desktop, with container queries where breakpoints fall short.',
      },
      a11y: {
        title: 'Accessible by construction',
        body: 'WCAG 2.2 AA as the baseline. Keyboard-complete, screen-reader annotated, and respectful of reduced-motion preferences.',
      },
      tokens: {
        title: 'One set of design tokens',
        body: 'Colour, type, spacing and motion live in a single source of truth that compiles to CSS, Swift and Kotlin.',
      },
      speed: {
        title: 'Fast at the edge',
        body: 'Rendered close to your users across 38 regions, with fonts subset per script so Arabic pages stay as light as Latin ones.',
      },
      types: {
        title: 'Typed end to end',
        body: 'Translation keys, theme tokens and route params are all typed. If a string is missing in one language, the build tells you.',
      },
    },
  },

  platform: {
    eyebrow: 'How it works',
    title: 'Three steps from empty repository to shipped product',
    subtitle:
      'Asasera meets your team where it already works — no rewrite, no proprietary runtime, no lock-in.',
    steps: {
      connect: {
        number: '01',
        title: 'Connect your repository',
        body: 'Point Asasera at an existing codebase or start from a blank slate. The CLI reads your framework, package manager and CI setup, then configures itself around them.',
      },
      compose: {
        number: '02',
        title: 'Compose from primitives',
        body: 'Assemble screens from tokenised, direction-aware primitives. Preview any surface in Arabic and English side by side before it reaches review.',
      },
      ship: {
        number: '03',
        title: 'Ship and measure',
        body: 'Deploy globally in a single command, then watch per-locale performance, error rates and translation coverage from one dashboard.',
      },
    },
  },

  cta: {
    title: 'Ready to lay the foundation?',
    subtitle:
      'Spin up a fully bilingual, fully responsive front end in under five minutes. Bring your own design system or start with ours.',
    primary: 'Get started free',
    secondary: 'Talk to the team',
    note: 'Open source projects and non-profits get Asasera Pro at no cost.',
  },

  footer: {
    blurb:
      'The foundation layer for teams building bilingual, accessible products for the region and the world.',
    product: {
      heading: 'Product',
      features: 'Features',
      platform: 'Platform',
      pricing: 'Pricing',
      changelog: 'Changelog',
    },
    company: {
      heading: 'Company',
      about: 'About',
      careers: 'Careers',
      blog: 'Blog',
      contact: 'Contact',
    },
    resources: {
      heading: 'Resources',
      docs: 'Documentation',
      guides: 'Guides',
      status: 'Status',
      support: 'Support',
    },
    rights: 'All rights reserved.',
    privacy: 'Privacy',
    terms: 'Terms',
  },

  about: {
    eyebrow: 'About us',
    title: 'We build the layer other teams keep rebuilding',
    lead: 'Asasera began with a frustration every team in the region knows: shipping an Arabic interface that feels as considered as its English counterpart usually means building the whole thing twice.',
    body: 'We started in 2021 as a two-person consultancy untangling right-to-left bugs for banks and airlines. The same six problems came up on every engagement, so we stopped patching them one client at a time and built the foundation instead. Today Asasera is used by product teams in eleven countries, and every feature we ship is tested in both directions before it merges.',
    values: {
      heading: 'What we hold to',
      craft: {
        title: 'Craft over volume',
        body: 'We would rather ship six primitives that are genuinely right than sixty that are almost right.',
      },
      parity: {
        title: 'Parity, not translation',
        body: 'An Arabic interface is not an English one with swapped strings. Rhythm, weight and spacing all change — and we account for that.',
      },
      openness: {
        title: 'Open by default',
        body: 'Our token spec, direction primitives and audit tooling are open source, and they always will be.',
      },
    },
    timeline: {
      heading: 'How we got here',
      items: {
        founded: { year: '2021', title: 'Founded in Amman', body: 'Two engineers, one contract, and a very long list of RTL bugs.' },
        opensource: { year: '2022', title: 'Tokens go open source', body: 'The direction-aware token spec is published and adopted by nine teams in its first quarter.' },
        seed: { year: '2024', title: 'Seed round', body: 'Raised to build the hosted platform and grow the team to fourteen.' },
        beta: { year: '2026', title: 'Asasera 1.0 beta', body: 'The full platform opens to the public with 38 edge regions.' },
      },
    },
  },

  notFound: {
    code: '404',
    title: 'This page has no foundation',
    body: 'The link you followed may be broken, or the page may have been moved.',
  },
} satisfies Record<string, unknown>

export default en
