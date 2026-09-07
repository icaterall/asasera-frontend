/**
 * Navigation and control icons for the teacher workspace.
 *
 * Inline SVG, per the project rule against icon packages. All on a 24x24 grid
 * with `currentColor`, so a nav item's colour comes from its own state rather
 * than from a fill written into each path.
 *
 * `aria-hidden` on every one: each is beside a real text label, and announcing
 * both means hearing the destination twice.
 */

type IconProps = { className?: string }

const base = 'size-5 shrink-0'

function Svg({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={`${base} ${className ?? ''}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  )
}

export function HomeIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M3.5 10.5 12 3.5l8.5 7" />
      <path d="M5.5 9.8V20h13V9.8" />
      <path d="M9.8 20v-5.4h4.4V20" />
    </Svg>
  )
}

export function GuidesIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4 4.5h5.2A2.8 2.8 0 0 1 12 7.3V20a2.4 2.4 0 0 0-2.4-2.4H4Z" />
      <path d="M20 4.5h-5.2A2.8 2.8 0 0 0 12 7.3V20a2.4 2.4 0 0 1 2.4-2.4H20Z" />
    </Svg>
  )
}

export function AccountIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="8.2" r="3.7" />
      <path d="M4.8 20c0-3.6 3.2-6.1 7.2-6.1s7.2 2.5 7.2 6.1" />
    </Svg>
  )
}

export function InfoIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 11v5.2" />
      <path d="M12 7.9h.01" />
    </Svg>
  )
}

export function MailIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="3.2" y="5.4" width="17.6" height="13.2" rx="2.2" />
      <path d="m3.8 7 8.2 5.6L20.2 7" />
    </Svg>
  )
}

export function BookmarkIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M6.4 4.2h11.2v16l-5.6-3.8-5.6 3.8Z" />
    </Svg>
  )
}

/** A document with a folded corner: the teacher's own source files. */
export function DocumentIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M13.6 3.4H6.6v17.2h10.8V7.2Z" />
      <path d="M13.6 3.4v3.8h3.8" />
      <path d="M9.4 12.4h5.2M9.4 16h3.6" />
    </Svg>
  )
}

/** Stacked cards: a course, which holds material and lessons together. */
export function StackIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 3.6 20.4 8 12 12.4 3.6 8Z" />
      <path d="M3.6 12.4 12 16.8l8.4-4.4" />
      <path d="M3.6 16.6 12 21l8.4-4.4" />
    </Svg>
  )
}

export function MenuIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Svg>
  )
}

export function CloseIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="m6.4 6.4 11.2 11.2M17.6 6.4 6.4 17.6" />
    </Svg>
  )
}

/**
 * The only physically directional glyph here, so the only one that may be
 * mirrored. `rtl:-scale-x-100` flips the arrowhead in Arabic; a chevron that
 * kept pointing right in an RTL page would point back the way the reader came.
 */
export function ForwardIcon({ className }: IconProps) {
  return (
    <Svg className={`rtl:-scale-x-100 ${className ?? ''}`}>
      <path d="M9 5.5 15.5 12 9 18.5" />
    </Svg>
  )
}

export function CheckIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="m5.5 12.5 4.2 4.2 8.8-9.4" />
    </Svg>
  )
}
