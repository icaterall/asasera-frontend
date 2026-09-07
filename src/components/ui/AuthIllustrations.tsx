/**
 * Duotone illustrations for the signup and sign-in chain.
 *
 * AUTHORED, NOT INSTALLED. The existing icon set (Landing/ui/Icons.tsx) is a
 * 1.5px outline family built for inline use at 16–20px; scaled to the 48px
 * these tiles need it reads as a hairline sketch, which is exactly the "tiny
 * generic outline icon" the direction rules out. Adding a second icon package
 * for six pictures would be a dependency for a dependency's sake.
 *
 * Each piece is two tones of ONE hue: a solid mass at full strength and a
 * wash at ~22% for the secondary form, plus white for cut-outs. That is what
 * makes them read as a family rather than six unrelated drawings, and it lets
 * a single `tone` prop restyle the whole set per accent without editing paths.
 *
 * `currentColor` is deliberately not used: duotone needs two values, so the
 * hue arrives as a prop and the wash is derived from it with color-mix. The
 * caller passes a token, never a literal.
 */
type IllustrationProps = {
  /** A CSS color — pass a token, e.g. `var(--acc-coral)`. */
  tone?: string
  className?: string
  /** Decorative by default: the tile's own label is the accessible name. */
  title?: string
}

function Frame({
  tone = 'var(--brand-blue)',
  className,
  title,
  children,
}: IllustrationProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      style={
        {
          '--t': tone,
          /* The wash. One derivation, so every piece agrees. */
          '--t-wash': `color-mix(in srgb, ${tone} 22%, transparent)`,
        } as React.CSSProperties
      }
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  )
}

const SOLID = { fill: 'var(--t)' }
const WASH = { fill: 'var(--t-wash)' }

/** Teacher: an educator beside a board. */
export function TeacherIllustration(props: IllustrationProps) {
  return (
    <Frame {...props}>
      {/* board */}
      <rect x="24" y="10" width="32" height="24" rx="3" style={WASH} />
      <rect x="29" y="17" width="18" height="2.5" rx="1.25" style={SOLID} />
      <rect x="29" y="23" width="12" height="2.5" rx="1.25" style={SOLID} />
      {/* educator */}
      <circle cx="16" cy="20" r="7" style={SOLID} />
      <path d="M4 50c0-7.2 5.4-12 12-12s12 4.8 12 12v4H4z" style={SOLID} />
      {/* raised arm toward the board */}
      <path d="M26 34c4-1.5 7-4 9-7" stroke="var(--t)" strokeWidth="3.5" strokeLinecap="round" fill="none" />
    </Frame>
  )
}

/** Student: a learner with an open book. */
export function StudentIllustration(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <circle cx="32" cy="17" r="8" style={SOLID} />
      <path d="M18 40c0-7.7 6.3-14 14-14s14 6.3 14 14z" style={SOLID} />
      {/* open book */}
      <path d="M8 42h20c2.2 0 4 1.8 4 4v10H12c-2.2 0-4-1.8-4-4z" style={WASH} />
      <path d="M56 42H36c-2.2 0-4 1.8-4 4v10h20c2.2 0 4-1.8 4-4z" style={WASH} />
      <path d="M32 46v10" stroke="var(--t)" strokeWidth="3" strokeLinecap="round" fill="none" />
    </Frame>
  )
}

/** Education level — graduation cap. */
export function GraduationIllustration(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <path d="M32 12 60 24 32 36 4 24z" style={SOLID} />
      <path d="M14 29v12c0 4.4 8 8 18 8s18-3.6 18-8V29l-18 7.7z" style={WASH} />
      <path d="M56 26v13" stroke="var(--t)" strokeWidth="3" strokeLinecap="round" fill="none" />
    </Frame>
  )
}

/** Education level — stacked books, for earlier levels. */
export function BooksIllustration(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <rect x="10" y="40" width="44" height="12" rx="2.5" style={SOLID} />
      <rect x="14" y="27" width="36" height="12" rx="2.5" style={WASH} />
      <rect x="18" y="14" width="28" height="12" rx="2.5" style={SOLID} />
      <rect x="24" y="44" width="10" height="4" rx="2" fill="#fff" opacity="0.9" />
    </Frame>
  )
}

/** Education level — a school building, for institution-shaped records. */
export function SchoolIllustration(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <path d="M32 8 58 22H6z" style={SOLID} />
      <rect x="12" y="22" width="40" height="30" rx="2.5" style={WASH} />
      <rect x="20" y="30" width="9" height="9" rx="1.5" style={SOLID} />
      <rect x="35" y="30" width="9" height="9" rx="1.5" style={SOLID} />
      <rect x="27" y="43" width="10" height="9" rx="1.5" style={SOLID} />
    </Frame>
  )
}

/** Email: an illustrated envelope. */
export function EnvelopeIllustration(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <rect x="6" y="16" width="52" height="34" rx="4" style={WASH} />
      <path d="M6 21 32 38 58 21" stroke="var(--t)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="6" y="16" width="52" height="34" rx="4" stroke="var(--t)" strokeWidth="3" fill="none" />
    </Frame>
  )
}

/** Password: a shield with a keyhole. */
export function ShieldIllustration(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <path d="M32 6 54 14v18c0 12.6-9 21.6-22 26-13-4.4-22-13.4-22-26V14z" style={WASH} />
      <path d="M32 6 54 14v18c0 12.6-9 21.6-22 26-13-4.4-22-13.4-22-26V14z" stroke="var(--t)" strokeWidth="3" fill="none" />
      <circle cx="32" cy="30" r="5" style={SOLID} />
      <path d="M32 34v7" stroke="var(--t)" strokeWidth="4" strokeLinecap="round" fill="none" />
    </Frame>
  )
}

/** Verification: an envelope carrying a confirmation mark. */
export function VerifiedIllustration(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <rect x="4" y="16" width="44" height="30" rx="4" style={WASH} />
      <path d="M4 20 26 35 48 20" stroke="var(--t)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="4" y="16" width="44" height="30" rx="4" stroke="var(--t)" strokeWidth="3" fill="none" />
      <circle cx="48" cy="44" r="13" style={SOLID} />
      <path d="M42 44l4.5 4.5L55 40" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Frame>
  )
}

/*
 * The two below are drawn for the workplace cards, where the picture sits ON
 * a saturated fill rather than on a pale wash. That changes one rule: neither
 * uses a hard `#fff` cut-out the way BooksIllustration and VerifiedIllustration
 * do. On those cards `tone` IS white, so a white cut-out would vanish into the
 * mark it is meant to cut. Solid, wash and stroke all derive from `tone`, so
 * these two read correctly at any tone on any ground.
 */

/** Business: a briefcase. */
export function BriefcaseIllustration(props: IllustrationProps) {
  return (
    <Frame {...props}>
      {/* handle */}
      <path
        d="M24 18v-4a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5v4"
        stroke="var(--t)"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      <rect x="6" y="18" width="52" height="34" rx="4" style={WASH} />
      <rect x="6" y="18" width="52" height="34" rx="4" stroke="var(--t)" strokeWidth="3" fill="none" />
      {/* the band across the case, and its clasp */}
      <rect x="6" y="30" width="52" height="7" style={SOLID} />
      <rect x="27" y="28" width="10" height="11" rx="2.5" style={SOLID} />
    </Frame>
  )
}

/** Other: a compass, for a place the first three do not name. */
export function CompassIllustration(props: IllustrationProps) {
  return (
    <Frame {...props}>
      {/*
        Ring only, no filled disc. The other three marks are mostly open —
        a roof, a cap, a case with a band — and a solid 25px circle made the
        compass the heaviest of the four on a card where all four should
        weigh the same.
      */}
      <circle cx="32" cy="32" r="25" stroke="var(--t)" strokeWidth="3.5" fill="none" />
      {/* the needle: one kite sweeping north-east to south-west */}
      <path d="M44 20 36 36 20 44 28 28z" style={SOLID} />
    </Frame>
  )
}
