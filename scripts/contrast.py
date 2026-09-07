"""
WCAG 2.1 contrast for every colour role, against every surface it can land on.

Reproduces the table in docs/DESIGN.md section 4. Run it after changing any
token — the two numbers that matter most are --warn (fails as text, by design,
and must stay a non-text indicator) and --brand-blue against itself, which is
1.00 and is why the focus ring carries an outline-offset.
"""
import sys

SURFACES = {'#FFFFFF': 'white', '#FBFBFE': 'canvas', '#F5F7FB': 'raised'}

ROLES = [
    ('--ink', '#10233D'),
    ('--ink-muted', '#55657D'),
    ('--brand-blue', '#0B5FD0'),
    ('--blue-hover', '#0A4FAF'),
    ('--blue-active', '#08428F'),
    ('--success (brand-teal)', '#00806B'),
    ('--error', '#C4362B'),
    ('--disabled-fg', '#7B8595'),
    ('--warn', '#E8A33D'),
]


def _lin(c):
    c /= 255
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def luminance(hex_):
    h = hex_.lstrip('#')
    r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    return 0.2126 * _lin(r) + 0.7152 * _lin(g) + 0.0722 * _lin(b)


def ratio(a, b):
    la, lb = luminance(a), luminance(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


def verdict(worst):
    if worst >= 4.5:
        return 'AA body'
    if worst >= 3.0:
        return 'AA large / non-text only'
    return 'FAILS - never text'


def main():
    head = ' '.join(f'{n:>9s}' for n in SURFACES.values())
    print(f"{'role':26s} {head}   worst  verdict")
    print('-' * 78)
    for name, hex_ in ROLES:
        rs = [ratio(hex_, s) for s in SURFACES]
        worst = min(rs)
        cells = ' '.join(f'{r:>9.2f}' for r in rs)
        print(f'{name + " " + hex_:26s} {cells}  {worst:6.2f}  {verdict(worst)}')

    print()
    print('white text on filled controls:')
    for name, bg in [('brand-blue', '#0B5FD0'), ('blue-hover', '#0A4FAF'), ('brand-teal', '#00806B')]:
        r = ratio('#FFFFFF', bg)
        print(f'  {name:12s} {r:.2f}  {"AA body" if r >= 4.5 else "large only"}')

    print()
    print('why the focus ring needs outline-offset:')
    print(f'  brand-blue vs canvas      {ratio("#0B5FD0", "#FBFBFE"):.2f}')
    print(f'  brand-blue vs brand-blue  {ratio("#0B5FD0", "#0B5FD0"):.2f}  <- a tight ring on the '
          'primary button is invisible')
    return 0


if __name__ == '__main__':
    sys.exit(main())
