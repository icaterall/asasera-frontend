/*
 * GENERATED FILE — DO NOT EDIT.
 *
 * Mirrored from asasera-backend/packages/shared/src/zones.ts.
 * Edit the source there and run `npm run sync:shared` in asasera-backend.
 * CI fails if this file and its source differ.
 */
import type { ImageZone, ZoneShape } from './questions.ts'

/**
 * One definition of what a zone LOOKS like, shared by the editor, the player
 * and the host.
 *
 * WHY THIS FILE EXISTS AT ALL. A target on the player's screen is a real
 * element positioned on the zone's box, so the thing that decides whether a
 * tap counts is the browser's own hit testing, not arithmetic in our code.
 * Give that element a clip path and the hit area follows the shape for free —
 * a tap in the corner outside a circle misses it, exactly as the teacher drew
 * it. That is the whole trick, and it is why marking never needs geometry:
 * `markHotspot` compares zone keys, and the shape is a rendering concern.
 *
 * The danger in that arrangement is two implementations drifting — an editor
 * that draws a hexagon one way and a player that clips it another, so a target
 * is not where it was drawn. So the clip path is computed here, once, and both
 * sides import it. Everything is expressed in percentages of the zone's own
 * box, which makes a clip path independent of the image's size on screen.
 */

/** Points of a regular hexagon inscribed in the unit box, flat-top. */
const HEXAGON: readonly [number, number][] = [
  [25, 0], [75, 0], [100, 50], [75, 100], [25, 100], [0, 50],
]

const round = (n: number): number => Math.round(n * 1000) / 1000

/**
 * The CSS `clip-path` for a zone, or `undefined` for a plain rectangle.
 *
 * Undefined rather than `inset(0)` on purpose: a rectangle should carry no
 * clip path at all, so nothing changes for the thousands of zones that were
 * drawn before shapes existed.
 */
export function zoneClipPath(zone: Pick<ImageZone, 'shape' | 'points' | 'x' | 'y' | 'w' | 'h'>): string | undefined {
  const shape: ZoneShape = zone.shape ?? 'rect'
  if (shape === 'rect') return undefined
  if (shape === 'circle') return 'ellipse(50% 50% at 50% 50%)'
  if (shape === 'hexagon') return `polygon(${HEXAGON.map(([x, y]) => `${x}% ${y}%`).join(', ')})`

  const points = zone.points ?? []
  if (points.length < 3) return undefined
  /* Image coordinates become box-relative percentages. A zero-width box cannot
     happen (the schema rejects it), but dividing by it would produce NaN and a
     silently unclickable target, so it is guarded rather than assumed. */
  const width = zone.w || 1
  const height = zone.h || 1
  const pairs = points.map((point) => {
    const px = round(((point.x - zone.x) / width) * 100)
    const py = round(((point.y - zone.y) / height) * 100)
    return `${px}% ${py}%`
  })
  return `polygon(${pairs.join(', ')})`
}

/**
 * The same outline as SVG points, for the overlay the teacher and the class
 * see. Coordinates are in the image's own 0..1 space, to match the viewBox
 * the session overlay already uses.
 */
export function zoneOutlinePoints(zone: ImageZone): string {
  const shape: ZoneShape = zone.shape ?? 'rect'
  if (shape === 'polygon' && zone.points && zone.points.length >= 3) {
    return zone.points.map((p) => `${round(p.x)},${round(p.y)}`).join(' ')
  }
  if (shape === 'hexagon') {
    return HEXAGON.map(([x, y]) => `${round(zone.x + (x / 100) * zone.w)},${round(zone.y + (y / 100) * zone.h)}`).join(' ')
  }
  /* A rectangle, and also the fallback for a circle when the caller wants a
     polygon: an ellipse is drawn as an <ellipse>, not as points. */
  return [
    `${round(zone.x)},${round(zone.y)}`,
    `${round(zone.x + zone.w)},${round(zone.y)}`,
    `${round(zone.x + zone.w)},${round(zone.y + zone.h)}`,
    `${round(zone.x)},${round(zone.y + zone.h)}`,
  ].join(' ')
}

/** Whether a point in image coordinates falls inside the zone as drawn. */
export function zoneContains(zone: ImageZone, point: { x: number; y: number }): boolean {
  const shape: ZoneShape = zone.shape ?? 'rect'
  const insideBox =
    point.x >= zone.x && point.x <= zone.x + zone.w &&
    point.y >= zone.y && point.y <= zone.y + zone.h
  if (!insideBox) return false
  if (shape === 'rect') return true

  if (shape === 'circle') {
    /* Normalised to the box, so an ellipse in a non-square box is handled the
       same way the browser clips it. */
    const nx = (point.x - zone.x) / (zone.w || 1) - 0.5
    const ny = (point.y - zone.y) / (zone.h || 1) - 0.5
    return nx * nx + ny * ny <= 0.25
  }

  const polygon: { x: number; y: number }[] =
    shape === 'hexagon'
      ? HEXAGON.map(([x, y]) => ({ x: zone.x + (x / 100) * zone.w, y: zone.y + (y / 100) * zone.h }))
      : (zone.points ?? [])
  if (polygon.length < 3) return true

  /* Ray casting. Used by tests and by anything server-side that needs to know
     whether a proposed point lands in a zone; the player itself never calls
     it, because the browser does that job through the clip path. */
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i]!
    const b = polygon[j]!
    const straddles = a.y > point.y !== b.y > point.y
    if (straddles && point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y || 1e-12) + a.x) inside = !inside
  }
  return inside
}
