"""
WCAG 2.1 contrast for the app-plan v4 §5 token set.

The plan fixes the four answer colours exactly. It does NOT say what text goes
on them, and «assume white» is wrong for at least one of them — which is the
whole reason this script exists rather than a convention.

Run after changing any value in src/design/tokens.css.
    python3 scripts/contrast-v4.py
"""

# §5, p11 — verbatim from the plan.
ACT         = '#004CCC'
ACT_PRESS   = '#00329A'
EVIDENCE    = '#14BF96'
A1          = '#E21B3C'  # triangle
A2          = '#1368CE'  # diamond
A3          = '#C68400'  # circle
A4          = '#1F8A37'  # square
INK         = '#141821'
MUTED       = '#697080'
LINE        = '#E3E6EC'
SURFACE     = '#FFFFFF'

WHITE = '#FFFFFF'


def _lin(c):
    c /= 255
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def luminance(hex_colour):
    h = hex_colour.lstrip('#')
    r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    return 0.2126 * _lin(r) + 0.7152 * _lin(g) + 0.0722 * _lin(b)


def ratio(a, b):
    la, lb = luminance(a), luminance(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


def verdict(r, large=False):
    if large:
        return 'AA large' if r >= 3.0 else 'FAILS'
    if r >= 7.0:
        return 'AAA'
    if r >= 4.5:
        return 'AA body'
    if r >= 3.0:
        return 'AA large only'
    return 'FAILS'


print('Foreground on each answer tile — the plan fixes the fill, not the text.')
print(f"{'tile':<26}{'on white':>10}{'on ink':>10}  chosen")
print('-' * 68)

CHOSEN = {}
for name, fill in [('--a1 triangle', A1), ('--a2 diamond', A2), ('--a3 circle', A3), ('--a4 square', A4)]:
    on_white = ratio(fill, WHITE)
    on_ink = ratio(fill, INK)
    # Pick whichever foreground actually reads. Answer text on a projector is
    # large, but the player's accessible name and the editor's inline label are
    # body size, so AA body is the bar.
    pick = WHITE if on_white >= on_ink else INK
    best = max(on_white, on_ink)
    CHOSEN[name] = (pick, best)
    flag = '' if best >= 4.5 else '   <-- below AA body'
    print(f'{name:<26}{on_white:>10.2f}{on_ink:>10.2f}  {pick} {best:.2f} {verdict(best)}{flag}')

print()
print('Actions and evidence on the light surface')
print('-' * 68)
for name, colour in [('--act', ACT), ('--act-press', ACT_PRESS), ('--evidence', EVIDENCE)]:
    r = ratio(colour, SURFACE)
    print(f'{name:<26}{r:>10.2f}  as text: {verdict(r)}')
print(f"{'white on --act':<26}{ratio(WHITE, ACT):>10.2f}  {verdict(ratio(WHITE, ACT))}")
print(f"{'white on --act-press':<26}{ratio(WHITE, ACT_PRESS):>10.2f}  {verdict(ratio(WHITE, ACT_PRESS))}")
print(f"{'ink on --evidence':<26}{ratio(INK, EVIDENCE):>10.2f}  {verdict(ratio(INK, EVIDENCE))}")
print(f"{'white on --evidence':<26}{ratio(WHITE, EVIDENCE):>10.2f}  {verdict(ratio(WHITE, EVIDENCE))}")

print()
print('Ink and muted on the light surface')
print('-' * 68)
for name, colour in [('--ink', INK), ('--muted', MUTED)]:
    r = ratio(colour, SURFACE)
    print(f'{name:<26}{r:>10.2f}  {verdict(r)}')
r_line = ratio(LINE, SURFACE)
print(f"{'--line (hairline)':<26}{r_line:>10.2f}  non-text; UI components want >= 3.0"
      f"{'   <-- decorative only' if r_line < 3.0 else ''}")


# ---------------------------------------------------------------------------
# Dark counterparts.
#
# The plan says «أزواج فاتح وداكن لكل قيمة» — a light and a dark pair for every
# value — and nothing more. These are derived, then measured here; none is a
# guess left unchecked.
#
# The four answer fills keep their HUE and their shape binding. They are
# lightened only enough to stay distinguishable against a dark ground, because
# an answer colour that shifts hue between themes breaks the one thing §4 #3
# calls permanent.
# ---------------------------------------------------------------------------
D_SURFACE   = '#12151C'
D_RAISED    = '#1A1F29'
D_INK       = '#EDEFF4'
D_MUTED     = '#9BA3B4'
D_LINE      = '#2A303C'
D_ACT       = '#5B93FF'
D_ACT_PRESS = '#8AB2FF'
D_EVIDENCE  = '#2FD8AE'
D_A1        = '#FF4D68'
D_A2        = '#4D93F0'
D_A3        = '#E8A62B'
D_A4        = '#35B457'

print()
print('=' * 68)
print('DARK THEME')
print('=' * 68)
print(f"{'role':<26}{'on dark surface':>18}  verdict")
print('-' * 68)
for name, colour in [
    ('--ink', D_INK), ('--muted', D_MUTED), ('--act', D_ACT),
    ('--act-press', D_ACT_PRESS), ('--evidence', D_EVIDENCE),
]:
    r = ratio(colour, D_SURFACE)
    print(f'{name:<26}{r:>18.2f}  as text: {verdict(r)}')
r = ratio(D_LINE, D_SURFACE)
print(f"{'--line (hairline)':<26}{r:>18.2f}  non-text separator")

print()
print('Dark answer tiles — fill against the dark ground, and the text on them')
print(f"{'tile':<26}{'fill vs ground':>16}{'white':>9}{'ink':>9}  chosen")
print('-' * 68)
for name, fill in [('--a1 triangle', D_A1), ('--a2 diamond', D_A2), ('--a3 circle', D_A3), ('--a4 square', D_A4)]:
    vs_ground = ratio(fill, D_SURFACE)
    on_white = ratio(fill, WHITE)
    on_ink = ratio(fill, INK)
    pick = WHITE if on_white >= on_ink else INK
    best = max(on_white, on_ink)
    flag = '' if best >= 4.5 else '  <-- large text only'
    print(f'{name:<26}{vs_ground:>16.2f}{on_white:>9.2f}{on_ink:>9.2f}  {pick} {best:.2f}{flag}')

print()
print('Answer hues stay bound to their shapes across themes:')
for light, dark, shape in [(A1, D_A1, 'triangle'), (A2, D_A2, 'diamond'), (A3, D_A3, 'circle'), (A4, D_A4, 'square')]:
    def hue(h):
        h = h.lstrip('#')
        r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
        mx, mn = max(r, g, b), min(r, g, b)
        d = mx - mn
        if d == 0:
            return 0.0
        if mx == r:
            return (60 * ((g - b) / d) + 360) % 360
        if mx == g:
            return (60 * ((b - r) / d) + 120) % 360
        return (60 * ((r - g) / d) + 240) % 360
    hl, hd = hue(light), hue(dark)
    drift = min(abs(hl - hd), 360 - abs(hl - hd))
    print(f'  {shape:<10} {light} -> {dark}   hue {hl:6.1f}° -> {hd:6.1f}°   drift {drift:4.1f}°'
          f"{'  <-- too far' if drift > 20 else ''}")
