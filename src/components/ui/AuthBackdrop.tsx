import type { CSSProperties } from 'react'

/**
 * One shape in the composition.
 *
 * Positions are percentages and `rem`, never pixels, and several are
 * NEGATIVE on purpose — that is what crops a shape against the edge of the
 * screen. `inset-inline-start` / `-end` rather than left / right, so the
 * whole composition mirrors with the document instead of drifting to the
 * wrong side in Arabic.
 */
type Shape = {
  /** Which family: filled circle, ring, rounded box, outlined box, square. */
  kind: 'sh-circle' | 'sh-ring' | 'sh-box' | 'sh-box-line' | 'sh-square'
  /* One neutral now — see the note in auth-backdrop.css. */
  hue: 'neutral'
  size: string
  /** Any of the four, in any unit; negatives crop against that edge. */
  top?: string
  bottom?: string
  start?: string
  end?: string
  motion?: 'sh-float-y' | 'sh-float-xy' | 'sh-drift-fade' | 'sh-turn' | 'sh-float-turn'
  /** Degrees. `from` is also the angle a reduced-motion viewer sees. */
  turnFrom?: number
  turnTo?: number
  /** Negative, so the shape starts part-way through its own cycle. */
  delay?: string
  /** Dropped below 640px — see the note in auth-backdrop.css. */
  desktopOnly?: boolean
}

/*
 * THE COMPOSITION.
 *
 * Read it as a ring around the form rather than a scatter: the two biggest
 * shapes are cropped into opposite corners (top-start, bottom-end) and set
 * the diagonal; the rest hang off that line at uneven distances, with the
 * middle of the screen left alone because the form goes there.
 *
 * Nothing is mirrored, nothing is evenly spaced, and no two neighbours
 * share a hue — a symmetrical arrangement of decorative shapes reads as a
 * pattern, and a pattern reads as a texture rather than as a place.
 */
const SHAPES: Shape[] = [
  /*
   * REBUILT AGAINST THE REFERENCE, which carries exactly two shapes and
   * almost no colour: one enormous circle cropped into the bottom-start
   * corner, and one rotated square cropped into the top-end. Both are a pale
   * neutral grey, barely separated from the page.
   *
   * What was here was eight shapes in four brand tints. Beside the flat,
   * saturated cards that is a second thing competing for attention, and the
   * screens read as busy rather than focused. Two shapes, no colour, is the
   * reference — and it is also the right call, because the cards are the only
   * thing on these screens that should be loud.
   */
  {
    kind: 'sh-circle', hue: 'neutral', size: '46rem',
    bottom: '-16rem', start: '-14rem',
    motion: 'sh-float-y', delay: '-6s',
  },
  {
    kind: 'sh-square', hue: 'neutral', size: '34rem',
    top: '-13rem', end: '-11rem',
    motion: 'sh-float-turn', turnFrom: 45, turnTo: 51, delay: '-15s',
    desktopOnly: true,
  },
]

/**
 * The geometric backdrop behind the sign-in and signup screens.
 *
 * WHERE IT LIVES, AND WHY THAT MATTERS. It is rendered by `AuthLayout`,
 * which is the parent route element for the whole auth chain — so React
 * keeps this component mounted while someone moves from the workplace step
 * to the email step to the password step. The animations therefore keep
 * running across those navigations instead of snapping back to frame zero
 * on every screen, which is the difference between a background and a
 * transition effect.
 *
 * Decorative in every sense the platform recognises: `aria-hidden` so no
 * screen reader announces eight nameless boxes, `pointer-events: none` so
 * nothing here can intercept a click meant for the form, and a negative
 * z-index so it stays behind every interactive thing on the page.
 */
export function AuthBackdrop() {
  return (
    <div aria-hidden="true" className="auth-backdrop">
      {SHAPES.map((shape, index) => (
        <div
          key={index}
          className={[
            shape.kind,
            shape.motion ?? '',
            shape.desktopOnly ? 'sh-desktop-only' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={
            {
              '--sh-hue': `var(--sh-${shape.hue})`,
              '--sh-turn-from': `${shape.turnFrom ?? 0}deg`,
              '--sh-turn-to': `${shape.turnTo ?? 0}deg`,
              width: shape.size,
              height: shape.size,
              insetBlockStart: shape.top,
              insetBlockEnd: shape.bottom,
              insetInlineStart: shape.start,
              insetInlineEnd: shape.end,
              animationDelay: shape.delay,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}
