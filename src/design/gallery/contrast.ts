/**
 * WCAG 2.1 contrast, computed in the browser from the COMPUTED token values.
 *
 * Not from a table of hex strings copied out of the CSS — that would pass
 * while the stylesheet said something else entirely, which is the failure mode
 * a contrast check exists to catch. `getComputedStyle` reads what the browser
 * actually resolved, including whatever the current theme swapped in.
 */

function parse(colour: string): [number, number, number] | null {
  const m = colour.match(/rgba?\(([^)]+)\)/)
  if (!m) return null
  const parts = m[1]!.split(/[\s,/]+/).filter(Boolean).map(Number)
  if (parts.length < 3 || parts.slice(0, 3).some(Number.isNaN)) return null
  return [parts[0]!, parts[1]!, parts[2]!]
}

const lin = (c: number) => {
  const s = c / 255
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

const luminance = ([r, g, b]: [number, number, number]) =>
  0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)

/** Resolves a custom property against `element` and returns it as rgb(). */
export function tokenColour(element: Element, name: string): string {
  const probe = document.createElement('span')
  probe.style.color = `var(${name})`
  probe.style.display = 'none'
  element.appendChild(probe)
  const value = getComputedStyle(probe).color
  probe.remove()
  return value
}

export function contrast(a: string, b: string): number | null {
  const ca = parse(a)
  const cb = parse(b)
  if (!ca || !cb) return null
  const la = luminance(ca)
  const lb = luminance(cb)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

export function verdict(ratio: number | null, large = false): string {
  if (ratio == null) return '—'
  if (large) return ratio >= 3 ? 'AA large' : 'FAILS'
  if (ratio >= 7) return 'AAA'
  if (ratio >= 4.5) return 'AA'
  if (ratio >= 3) return 'AA large only'
  return 'FAILS'
}
