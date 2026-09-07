import { expect, test, type Page } from '@playwright/test'

/**
 * W02 acceptance — §16 p25:
 * «صفحة عرض تُظهر كل مكوّن في كل حالاته، في الوضعين الفاتح والداكن،
 *  وباتجاهين، بتباين مطابق للمعيار.»
 *
 * Run against the dev server; the gallery route exists only there.
 *
 * WHY PLAYWRIGHT AND NOT THE BROWSER EXTENSION: the extension's resize
 * reported success and left `window.innerWidth` at 1728. A responsive claim
 * made from a viewport that never changed is worse than no claim, so every
 * width below is asserted before anything is measured at it.
 */

const VIEWPORTS = [
  { name: 'wide desktop', width: 1920, height: 1080 },
  { name: 'laptop', width: 1440, height: 900 },
  { name: 'short laptop', width: 1280, height: 720 },
  { name: 'phone 390', width: 390, height: 844 },
  { name: 'phone 360', width: 360, height: 740 },
  { name: 'projector 2560', width: 2560, height: 1440 },
]

test('answer hover retains exact fills and readable labels in both themes',async({page})=>{
 for(const dark of [false,true]){
  await openGallery(page,{dark,rtl:true})
  for(const slot of [1,2,3,4]){
   const tile=page.locator(`button[class*="_s${slot}_"]`).first()
   const fill=await tile.evaluate(el=>getComputedStyle(el).backgroundColor)
   await tile.hover();await page.waitForTimeout(250)
   const measured=await tile.evaluate(el=>{
    const c=getComputedStyle(el),label=getComputedStyle(el.querySelector('span[class*=label]')!)
    const lum=(color:string)=>{const rgb=color.match(/[\d.]+/g)!.slice(0,3).map(Number).map(n=>{const v=n/255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4});return rgb[0]!*.2126+rgb[1]!*.7152+rgb[2]!*.0722}
    const a=lum(c.backgroundColor),b=lum(label.color)
    return {fill:c.backgroundColor,filter:c.filter,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05),large:parseFloat(label.fontSize)>=18.667&&Number(label.fontWeight)>=700}
   })
   expect(measured.fill).toBe(fill);expect(measured.filter).toBe('none');expect(measured.ratio).toBeGreaterThanOrEqual(measured.large?3:4.5)
  }
 }
})

async function openGallery(page: Page, { dark, rtl }: { dark: boolean; rtl: boolean }) {
  await page.goto('/__design')
  await page.waitForSelector('.asas')
  await page.evaluate(
    ([d, r]) => {
      document.documentElement.classList.toggle('dark', d as boolean)
      document.documentElement.dir = (r as boolean) ? 'rtl' : 'ltr'
    },
    [dark, rtl],
  )
  // The contrast readouts observe <html>; give the observer a frame to fire.
  await page.waitForTimeout(250)
}

test.describe('the owner-approved Kahoot token contract', () => {
  test('the seventeen baseline tokens resolve to the Kahoot override values', async ({ page }) => {
    await openGallery(page, { dark: false, rtl: true })
    const tokens = await page.evaluate(() => {
      const host = document.querySelector('.asas')!
      const read = (n: string) => getComputedStyle(host).getPropertyValue(n).trim()
      return {
        act: read('--act'), actPress: read('--act-press'), evidence: read('--evidence'),
        a1: read('--a1'), a2: read('--a2'), a3: read('--a3'), a4: read('--a4'),
        ink: read('--ink'), muted: read('--muted'), line: read('--line'), surface: read('--surface'),
        rControl: read('--r-control'), rCard: read('--r-card'), hControl: read('--h-control'),
        tState: read('--t-state'), tSelect: read('--t-select'), tPanel: read('--t-panel'),
      }
    })
    expect(tokens).toEqual({
      act: '#1368ce', actPress: '#105cb4', evidence: '#26890c',
      a1: '#e21b3c', a2: '#1368ce', a3: '#d89e00', a4: '#26890c',
      ink: '#333333', muted: '#6e6e6e', line: '#cccccc', surface: '#ffffff',
      rControl: '4px', rCard: '8px', hControl: '48px',
      tState: '200ms', tSelect: '100ms', tPanel: '300ms',
    })
  })

  test('radius encodes hierarchy — a control is 4px and a card is 8px, never one value', async ({ page }) => {
    await openGallery(page, { dark: false, rtl: true })
    const control = await page.locator('button[class*="btn"]').first().evaluate((el) => getComputedStyle(el).borderRadius)
    const card = await page.locator('div[class*="card"]').first().evaluate((el) => getComputedStyle(el).borderRadius)
    expect(control).toBe('4px')
    expect(card).toBe('8px')
    expect(control).not.toBe(card)
  })

  test('legacy screens inherit the current control geometry', async ({ page }) => {
    await page.goto('/')
    const legacy = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--radius-sm').trim(),
    )
    // Owner styling override applies to the legacy shell as well.
    expect(legacy === '4px').toBeTruthy()
  })
})

test.describe('answer slots bind colour to shape, permanently', () => {
  for (const dark of [false, true]) {
    test(`the four slots keep their shape and hue pairing (${dark ? 'dark' : 'light'})`, async ({ page }) => {
      await openGallery(page, { dark, rtl: true })
      const tiles = page.locator('button[class*="tile"]')
      const slots = await tiles.evaluateAll((els) =>
        els.slice(0, 4).map((el) => {
          const shape = el.querySelector('svg path, svg circle, svg rect')!.tagName.toLowerCase()
          return { fill: getComputedStyle(el).backgroundColor, shape }
        }),
      )
      expect(slots).toHaveLength(4)
      // Shape order is fixed: triangle, diamond, circle, square.
      expect(slots.map((s) => s.shape)).toEqual(['path', 'path', 'circle', 'rect'])
      // Four distinct fills — a duplicate would make two slots indistinguishable.
      expect(new Set(slots.map((s) => s.fill)).size).toBe(4)
    })
  }

  test('classroom mode hides the wording on screen but keeps it in the accessible name', async ({ page }) => {
    await openGallery(page, { dark: false, rtl: true })
    const shapeOnly = page.locator('button[class*="shapeOnly"]').first()
    const name = await shapeOnly.getAttribute('aria-label')
    // The shape AND the option text: a screen-reader user gets what the room
    // gets from the projector, not less.
    expect(name).toContain('مثلث')
    expect(name).toContain('باريس')
    // The text is not painted on the control itself.
    await expect(shapeOnly.locator('span[class*="label"]')).toHaveCount(0)
  })

  test('correct and incorrect are announced as words, not only as colour', async ({ page }) => {
    await openGallery(page, { dark: false, rtl: true })
    await expect(page.getByText('إجابة صحيحة').first()).toBeVisible()
    await expect(page.getByText('إجابة خاطئة').first()).toBeVisible()
  })
})

test.describe('contrast meets the standard, measured in the browser', () => {
  for (const dark of [false, true]) {
    test(`no token pair fails AA in the ${dark ? 'dark' : 'light'} theme`, async ({ page }) => {
      await openGallery(page, { dark, rtl: true })
      const failures = await page.evaluate(() => {
        const host = document.querySelector('.asas')!
        const tok = (n: string) => {
          const p = document.createElement('span')
          p.style.color = `var(${n})`; p.style.display = 'none'
          host.appendChild(p); const v = getComputedStyle(p).color; p.remove(); return v
        }
        const parse = (c: string) => {
          const m = c.match(/rgba?\(([^)]+)\)/)!
          const a = m[1]!.split(/[\s,/]+/).filter(Boolean).map(Number)
          return [a[0]!, a[1]!, a[2]!] as [number, number, number]
        }
        const lin = (c: number) => { const s = c / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4 }
        const lum = ([r, g, b]: [number, number, number]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
        const ratio = (a: string, b: string) => {
          const la = lum(parse(a)), lb = lum(parse(b))
          return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
        }
        /* --a4 is documented as large-text-only: white on #1f8a37 is 4.42,
           and the plan fixes the fill exactly. Its bar is AA large. */
        const pairs: Array<[string, string, number]> = [
          ['--on-act', '--act', 4.5], ['--on-evidence', '--evidence', 4.5],
          ['--on-a1', '--a1', 4.5], ['--on-a2', '--a2', 4.5], ['--on-a3', '--a3', 4.5],
          ['--on-a4', '--a4', 3.0],
          ['--ink', '--surface', 4.5], ['--muted', '--surface', 4.5],
        ]
        return pairs
          .map(([f, b, bar]) => ({ pair: `${f} on ${b}`, ratio: +ratio(tok(f), tok(b)).toFixed(2), bar }))
          .filter((r) => r.ratio < r.bar)
      })
      expect(failures, `contrast failures: ${JSON.stringify(failures)}`).toEqual([])
    })
  }
})

test.describe('responsive — the viewport is asserted before anything is measured', () => {
  for (const vp of VIEWPORTS) {
    test(`${vp.name} (${vp.width}x${vp.height}): no horizontal overflow`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await openGallery(page, { dark: false, rtl: true })

      const measured = await page.evaluate(() => ({
        w: window.innerWidth,
        h: window.innerHeight,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }))

      // The resize must have actually happened. This is the assertion that
      // stops a desktop measurement being reported as a phone one.
      expect(measured.w, 'the viewport did not actually resize').toBe(vp.width)

      expect(
        measured.scrollWidth,
        `the page scrolls horizontally at ${vp.width}px (${measured.scrollWidth} > ${measured.clientWidth})`,
      ).toBeLessThanOrEqual(measured.clientWidth + 1)
    })
  }

  test('the stage type reaches the 40–72px band across viewports (§4 #4)', async ({ page }) => {
    const sizes: Record<number, number> = {}
    for (const width of [360, 1440, 2560]) {
      await page.setViewportSize({ width, height: 900 })
      await openGallery(page, { dark: false, rtl: true })
      expect(await page.evaluate(() => window.innerWidth)).toBe(width)
      sizes[width] = await page
        .locator('p[class*="stageText"]')
        .evaluate((el) => Number.parseFloat(getComputedStyle(el).fontSize))
    }
    // Clamped at both ends, and monotonically larger on a wider viewport.
    expect(sizes[360]).toBeGreaterThanOrEqual(40)
    expect(sizes[2560]).toBeLessThanOrEqual(72)
    expect(sizes[2560]).toBeGreaterThan(sizes[360]!)
    expect(sizes[2560]).toBe(72)
  })
})

test.describe('direction', () => {
  test('the chrome mirrors but the numbers do not', async ({ page }) => {
    await openGallery(page, { dark: false, rtl: true })
    const rtlReadout = await page.getByTestId('viewport').textContent()
    await openGallery(page, { dark: false, rtl: false })
    const ltrReadout = await page.getByTestId('viewport').textContent()

    // Both directions must report the SAME width first. Without dir="ltr" on
    // the readout the RTL one reads «846×1728» — the bidi algorithm reorders
    // the two number runs around the separator.
    const first = (s: string | null) => s?.trim().split('×')[0]
    expect(first(rtlReadout)).toBe(first(ltrReadout))
  })

  test('both directions render the gallery without overflow', async ({ page }) => {
    for (const rtl of [true, false]) {
      await page.setViewportSize({ width: 1280, height: 720 })
      await openGallery(page, { dark: false, rtl })
      const overflow = await page.evaluate(() =>
        document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)
      expect(overflow, `overflow in ${rtl ? 'rtl' : 'ltr'}`).toBe(false)
    }
  })
})

test.describe('focus is visible and is not colour alone', () => {
  test('a keyboard-focused control gets a solid outline with an offset', async ({ page }) => {
    await openGallery(page, { dark: false, rtl: true })
    const button = page.locator('button[class*="btn"]').first()
    await button.focus()
    const focus = await button.evaluate((el) => {
      const cs = getComputedStyle(el)
      return { style: cs.outlineStyle, width: cs.outlineWidth, offset: cs.outlineOffset }
    })
    expect(focus.style).toBe('solid')
    expect(Number.parseFloat(focus.width)).toBeGreaterThanOrEqual(2)
    expect(Number.parseFloat(focus.offset)).toBeGreaterThan(0)
  })
})
