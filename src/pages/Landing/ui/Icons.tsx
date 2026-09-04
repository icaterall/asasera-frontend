import type { SVGProps } from 'react'

/**
 * The page's whole icon set, drawn here rather than pulled from a package.
 *
 * One geometry for all of them: a 24×24 box, 1.5 stroke, round caps and
 * joins, `currentColor`. That consistency is the reason these read as a set;
 * mixing in a second library's optical weight is what makes an icon row look
 * assembled rather than drawn.
 *
 * Every icon is decorative — each sits beside a real text label — so they all
 * carry `aria-hidden` and are skipped by assistive technology instead of
 * being announced as an unnamed graphic.
 */
type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function Icon({ size = 24, children, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  )
}

export function IconPlay(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      {/* Solid triangle: a stroked one reads as an outline arrow at 20px. */}
      <path d="M10.4 8.8v6.4l5.2-3.2z" fill="currentColor" stroke="none" />
    </Icon>
  )
}

/**
 * Points toward the inline end of the line, in either direction.
 *
 * Drawn pointing right — the LTR case — and mirrored by the `rtl:` variant,
 * so it follows the reading direction when the language toggle flips the
 * document instead of pointing back at the text it came from.
 */
export function IconArrowEnd({ className, ...props }: IconProps) {
  return (
    <Icon className={['rtl:-scale-x-100', className].filter(Boolean).join(' ')} {...props}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </Icon>
  )
}

export function IconCheck(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m4.5 12.5 5 5 10-11" />
    </Icon>
  )
}

export function IconMenu(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Icon>
  )
}

export function IconClose(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Icon>
  )
}

/** Drag: a pointer with a motion path behind it. */
export function IconDrag(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 5c3.5 0 3 6 6.5 6" strokeDasharray="2.5 2.5" />
      <path d="M11.5 8.2 20 12l-3.6 1.4L15 17z" />
    </Icon>
  )
}

/** Interactive image: a frame with two marked regions. */
export function IconImageRegions(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="4.5" width="18" height="15" rx="2" />
      <circle cx="9" cy="10.5" r="2" />
      <path d="M14 9.5h4M14 13h4" strokeDasharray="2 2" />
      <path d="M3.5 17.5 8 13.5l2.5 2" />
    </Icon>
  )
}

/** Multiple choice: options with one selected. */
export function IconChoice(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="6" cy="7" r="2.2" />
      <circle cx="6" cy="16" r="2.2" fill="currentColor" stroke="none" />
      <path d="M11 7h9M11 16h9" />
    </Icon>
  )
}

/** True / false: a two-state switch. */
export function IconToggle(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="2.5" y="7" width="19" height="10" rx="5" />
      <circle cx="16.5" cy="12" r="2.6" fill="currentColor" stroke="none" />
    </Icon>
  )
}

/** Ordering: a ranked stack. */
export function IconOrdering(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9 6.5h11M9 12h11M9 17.5h11" />
      <path d="M4.5 5v3.5M3.4 5.9 4.5 5l1.1.9" />
      <path d="M4.5 19v-3.5M3.4 18.1l1.1.9 1.1-.9" />
    </Icon>
  )
}

export function IconTrash(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4.5 7h15M9.5 7V5.5h5V7M6.5 7l.8 11.5h9.4L17.5 7" />
    </Icon>
  )
}

export function IconPencil(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4.5 19.5h3l10-10-3-3-10 10z" />
      <path d="M13.5 5.5l3 3" />
    </Icon>
  )
}

export function IconCamera(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 8.5h3.5L8 6h8l1.5 2.5H21v10H3z" />
      <circle cx="12" cy="13" r="3.2" />
    </Icon>
  )
}

/** The system proposing something, without the magic-wand cliché. */
export function IconSuggest(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" strokeDasharray="3 2.5" />
      <path d="M8 12h8M12 8v8" />
    </Icon>
  )
}

export function IconMap(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 6.5 9 4.5l6 2 6-2v13l-6 2-6-2-6 2z" />
      <path d="M9 4.5v13M15 6.5v13" />
    </Icon>
  )
}

export function IconUsers(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="9" cy="8.5" r="3" />
      <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
      <path d="M16 6.2a3 3 0 0 1 0 5.6M17.5 19c0-2.2-.8-3.9-2-5" />
    </Icon>
  )
}

export function IconId(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <circle cx="9" cy="11" r="2" />
      <path d="M5.8 15.8c.5-1.4 1.7-2.2 3.2-2.2s2.7.8 3.2 2.2" />
      <path d="M15 10h3.5M15 13.5h3.5" />
    </Icon>
  )
}

/* Theme control glyphs, same 1.5 stroke as the rest of the set. */
export function IconSun(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M6 18l-1.4 1.4M19.4 4.6 18 6" />
    </Icon>
  )
}

export function IconMoon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M20.5 13.3A8.5 8.5 0 1 1 10.7 3.5a6.6 6.6 0 0 0 9.8 9.8z" />
    </Icon>
  )
}
