/**
 * The dashboard's illustrations.
 *
 * ORIGINAL, AND DELIBERATELY NOT ICONS. Each one fills its card's thumbnail
 * rather than sitting in the middle of it as a 20px glyph, because a card whose
 * top half is empty colour reads as unfinished. They are drawn on a 240x140
 * viewBox and stretched with `preserveAspectRatio="none"` disabled — the box
 * scales, the drawing keeps its proportions.
 *
 * FIVE DIFFERENT PICTURES, one per concept. Repeating one silhouette across a
 * row is the thing that makes a dashboard look generated, so the document, the
 * question cards, the class, the report and the shelf share only a palette.
 *
 * NO REAL NUMBERS ANYWHERE. The bars in `ReportArt` are a drawing. They are not
 * derived from anything, they are not labelled with values, and they must never
 * be swapped for live data — a decorative chart that looks like a score is how
 * a teacher ends up believing a number nobody measured. Everything here is
 * `aria-hidden` and `pointer-events-none` so it is invisible to a screen reader
 * and cannot swallow a click meant for the card beneath it.
 */

type ArtProps = { className?: string }

/** Shared wrapper: same box, same accessibility treatment, every time. */
function Art({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 240 140"
      role="presentation"
      aria-hidden="true"
      focusable="false"
      className={`pointer-events-none h-full w-full ${className ?? ''}`}
    >
      {children}
    </svg>
  )
}

/** A page of material becoming a lesson: sheet, lines, a spark leaving it. */
export function MaterialArt({ className }: ArtProps) {
  return (
    <Art className={className}>
      <rect x="34" y="18" width="86" height="106" rx="5" fill="#ffffff" opacity="0.28" />
      <rect x="42" y="26" width="86" height="106" rx="5" fill="#ffffff" />
      <rect x="54" y="42" width="62" height="7" rx="3.5" fill="#46178f" opacity="0.85" />
      <rect x="54" y="58" width="46" height="5" rx="2.5" fill="#10101d" opacity="0.28" />
      <rect x="54" y="70" width="58" height="5" rx="2.5" fill="#10101d" opacity="0.28" />
      <rect x="54" y="82" width="38" height="5" rx="2.5" fill="#10101d" opacity="0.28" />
      <rect x="54" y="100" width="30" height="14" rx="5" fill="#14bf96" />
      {/* The lesson the page turns into. */}
      <rect x="140" y="46" width="72" height="60" rx="5" fill="#ffffff" opacity="0.94" />
      <rect x="140" y="46" width="72" height="18" rx="5" fill="#46178f" />
      <rect x="150" y="74" width="52" height="5" rx="2.5" fill="#10101d" opacity="0.3" />
      <rect x="150" y="86" width="34" height="5" rx="2.5" fill="#10101d" opacity="0.3" />
      <path
        d="M126 70 L138 70 M133 64 L139 70 L133 76"
        stroke="#ffffff"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Art>
  )
}

/** Question cards, one turned face-up with its choices. */
export function ActivityArt({ className }: ArtProps) {
  return (
    <Art className={className}>
      <rect x="28" y="34" width="78" height="82" rx="5" fill="#ffffff" opacity="0.35" transform="rotate(-8 67 75)" />
      <rect x="46" y="26" width="78" height="82" rx="5" fill="#ffffff" opacity="0.6" transform="rotate(-3 85 67)" />
      <rect x="66" y="20" width="108" height="100" rx="5" fill="#ffffff" />
      <rect x="80" y="34" width="66" height="7" rx="3.5" fill="#10101d" opacity="0.55" />
      {/* Four answer tiles — the shape of a question, not a real one. */}
      <rect x="80" y="52" width="38" height="26" rx="5" fill="#e8453c" />
      <rect x="124" y="52" width="38" height="26" rx="5" fill="#1e88e5" />
      <rect x="80" y="84" width="38" height="26" rx="5" fill="#f5a524" />
      <rect x="124" y="84" width="38" height="26" rx="5" fill="#0c9777" />
      <path
        d="M133 95 l6 6 l12 -13"
        stroke="#ffffff"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Art>
  )
}

/** A teacher at a board with a class in front of it. */
export function ClassArt({ className }: ArtProps) {
  return (
    <Art className={className}>
      <rect x="72" y="14" width="130" height="76" rx="5" fill="#ffffff" />
      <rect x="86" y="30" width="60" height="7" rx="3.5" fill="#46178f" opacity="0.8" />
      <rect x="86" y="46" width="90" height="5" rx="2.5" fill="#10101d" opacity="0.25" />
      <rect x="86" y="58" width="70" height="5" rx="2.5" fill="#10101d" opacity="0.25" />
      <rect x="130" y="90" width="14" height="16" rx="3" fill="#ffffff" opacity="0.55" />
      <rect x="96" y="106" width="82" height="6" rx="3" fill="#ffffff" opacity="0.55" />
      {/* The teacher, standing apart from the group. */}
      <circle cx="40" cy="52" r="15" fill="#ffffff" />
      <path d="M18 108 c0 -16 10 -28 22 -28 s22 12 22 28 z" fill="#ffffff" />
      {/* Three students. */}
      <circle cx="94" cy="118" r="11" fill="#ffffff" opacity="0.9" />
      <circle cx="128" cy="124" r="11" fill="#ffffff" opacity="0.75" />
      <circle cx="162" cy="118" r="11" fill="#ffffff" opacity="0.9" />
    </Art>
  )
}

/** A report: bars and a progress ring. Decorative, and no values on it. */
export function ReportArt({ className }: ArtProps) {
  return (
    <Art className={className}>
      <rect x="24" y="16" width="118" height="110" rx="5" fill="#ffffff" />
      <rect x="38" y="30" width="48" height="6" rx="3" fill="#10101d" opacity="0.45" />
      {/* Bars of no particular height, in no particular unit. */}
      <rect x="38" y="86" width="16" height="26" rx="4" fill="#1e88e5" />
      <rect x="60" y="70" width="16" height="42" rx="4" fill="#14bf96" />
      <rect x="82" y="56" width="16" height="56" rx="4" fill="#f5a524" />
      <rect x="104" y="76" width="16" height="36" rx="4" fill="#e8453c" />
      {/* The ring, drawn as an arc rather than a computed percentage. */}
      <circle cx="180" cy="72" r="34" fill="#ffffff" opacity="0.28" />
      <circle cx="180" cy="72" r="34" fill="none" stroke="#ffffff" strokeWidth="10" opacity="0.45" />
      <path
        d="M180 38 a34 34 0 0 1 26 55"
        fill="none"
        stroke="#ffffff"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <circle cx="180" cy="72" r="14" fill="#ffffff" />
    </Art>
  )
}

/** A shelf of prepared lessons — the empty-state picture. */
export function LibraryArt({ className }: ArtProps) {
  return (
    <Art className={className}>
      <rect x="30" y="24" width="52" height="76" rx="5" fill="#46178f" />
      <rect x="38" y="38" width="34" height="5" rx="2.5" fill="#ffffff" opacity="0.8" />
      <rect x="38" y="50" width="24" height="5" rx="2.5" fill="#ffffff" opacity="0.5" />
      <rect x="90" y="14" width="52" height="86" rx="5" fill="#14bf96" />
      <rect x="98" y="28" width="34" height="5" rx="2.5" fill="#ffffff" opacity="0.85" />
      <rect x="98" y="40" width="24" height="5" rx="2.5" fill="#ffffff" opacity="0.55" />
      <rect x="150" y="34" width="52" height="66" rx="5" fill="#f5a524" />
      <rect x="158" y="48" width="34" height="5" rx="2.5" fill="#ffffff" opacity="0.85" />
      <rect x="158" y="60" width="24" height="5" rx="2.5" fill="#ffffff" opacity="0.55" />
      <rect x="22" y="100" width="188" height="8" rx="4" fill="#10101d" opacity="0.35" />
    </Art>
  )
}

/** Reading and marking up a set of questions — the review guide. */
export function ReviewArt({ className }: ArtProps) {
  return (
    <Art className={className}>
      <rect x="46" y="16" width="112" height="108" rx="5" fill="#ffffff" />
      <rect x="60" y="32" width="60" height="6" rx="3" fill="#10101d" opacity="0.5" />
      <circle cx="66" cy="56" r="7" fill="#0c9777" />
      <rect x="80" y="52" width="62" height="6" rx="3" fill="#10101d" opacity="0.25" />
      <circle cx="66" cy="78" r="7" fill="#f5a524" />
      <rect x="80" y="74" width="48" height="6" rx="3" fill="#10101d" opacity="0.25" />
      <circle cx="66" cy="100" r="7" fill="#e8453c" />
      <rect x="80" y="96" width="54" height="6" rx="3" fill="#10101d" opacity="0.25" />
      {/* A lens over the middle question. */}
      <circle cx="176" cy="66" r="26" fill="#ffffff" opacity="0.35" stroke="#ffffff" strokeWidth="6" />
      <path d="M195 85 l16 16" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" />
    </Art>
  )
}

/** One lesson handed to a second group — the reuse guide. */
export function ReuseArt({ className }: ArtProps) {
  return (
    <Art className={className}>
      <rect x="26" y="34" width="70" height="72" rx="5" fill="#ffffff" />
      <rect x="38" y="48" width="42" height="6" rx="3" fill="#46178f" opacity="0.8" />
      <rect x="38" y="62" width="32" height="5" rx="2.5" fill="#10101d" opacity="0.25" />
      <rect x="38" y="74" width="38" height="5" rx="2.5" fill="#10101d" opacity="0.25" />
      <rect x="144" y="34" width="70" height="72" rx="5" fill="#ffffff" opacity="0.92" />
      <rect x="156" y="48" width="42" height="6" rx="3" fill="#0c9777" />
      <rect x="156" y="62" width="32" height="5" rx="2.5" fill="#10101d" opacity="0.25" />
      <rect x="156" y="74" width="38" height="5" rx="2.5" fill="#10101d" opacity="0.25" />
      <path
        d="M104 60 h30 M126 52 l10 8 l-10 8"
        stroke="#ffffff"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M136 86 h-30 M114 78 l-10 8 l10 8"
        stroke="#ffffff"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.6"
      />
    </Art>
  )
}

/**
 * The banner's own drawing — wider box, so it gets its own viewBox rather than
 * being squeezed into the card one.
 */
export function HeroArt({ className }: ArtProps) {
  return (
    <svg
      viewBox="0 0 320 170"
      role="presentation"
      aria-hidden="true"
      focusable="false"
      className={`pointer-events-none h-full w-full ${className ?? ''}`}
    >
      <circle cx="266" cy="42" r="58" fill="#ffffff" opacity="0.08" />
      <circle cx="70" cy="150" r="46" fill="#ffffff" opacity="0.07" />
      {/* Material on the leading side. */}
      <rect x="44" y="30" width="74" height="94" rx="5" fill="#ffffff" opacity="0.95" />
      <rect x="56" y="46" width="44" height="6" rx="3" fill="#46178f" />
      <rect x="56" y="60" width="50" height="5" rx="2.5" fill="#10101d" opacity="0.25" />
      <rect x="56" y="72" width="36" height="5" rx="2.5" fill="#10101d" opacity="0.25" />
      <rect x="56" y="84" width="46" height="5" rx="2.5" fill="#10101d" opacity="0.25" />
      <rect x="56" y="102" width="28" height="12" rx="5" fill="#14bf96" />
      {/* Arrow across. */}
      <path
        d="M132 76 h34 M158 66 l12 10 l-12 10"
        stroke="#ffffff"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* The prepared lesson on the trailing side. */}
      <rect x="182" y="22" width="96" height="66" rx="5" fill="#ffffff" opacity="0.96" />
      <rect x="182" y="22" width="96" height="16" rx="5" fill="#46178f" />
      <rect x="194" y="50" width="40" height="18" rx="5" fill="#f5a524" />
      <rect x="238" y="50" width="28" height="18" rx="5" fill="#1e88e5" />
      {/* And the class it reaches. */}
      <circle cx="200" cy="118" r="14" fill="#ffffff" opacity="0.9" />
      <circle cx="234" cy="126" r="14" fill="#ffffff" opacity="0.72" />
      <circle cx="268" cy="118" r="14" fill="#ffffff" opacity="0.9" />
    </svg>
  )
}
