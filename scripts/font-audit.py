"""
Read the real weight and Arabic coverage of every font file in the repo.

Filenames lie — `neosans-bold.ttf` reports usWeightClass 300 — so this parses
the OS/2 and cmap tables directly. No fontTools: pip cannot install in this
environment (libexpat mismatch), and an sfnt table directory is simple enough
to walk by hand. .ttf only; the .woff2 files are conversions of these.

Reproduces the table in docs/DESIGN.md section 1.
"""
import struct, pathlib, sys

ARABIC = set(range(0x0600, 0x0700))
PRESENTATION_B = set(range(0xFE70, 0xFF00))
SAMPLE = 'المحاضرة الجامعية تسجيل الدخول كلمة المرور'


def tables(data):
    n = struct.unpack('>H', data[4:6])[0]
    out = {}
    for i in range(n):
        off = 12 + i * 16
        tag = data[off:off + 4].decode('latin1')
        o, l = struct.unpack('>II', data[off + 8:off + 16])
        out[tag] = (o, l)
    return out


def weight(data, t):
    """usWeightClass lives 4 bytes into OS/2, in every version of the table."""
    if 'OS/2' not in t:
        return None
    o, _ = t['OS/2']
    return struct.unpack('>H', data[o + 4:o + 6])[0]


def codepoints(data, t):
    """Every codepoint the font claims, from the best Unicode cmap subtable."""
    if 'cmap' not in t:
        return set()
    o, _ = t['cmap']
    n = struct.unpack('>H', data[o + 2:o + 4])[0]
    best = None
    for i in range(n):
        pid, eid, off = struct.unpack('>HHI', data[o + 4 + i * 8:o + 12 + i * 8])
        if (pid, eid) in ((3, 1), (3, 10), (0, 3), (0, 4), (0, 6)):
            best = o + off
    if best is None:
        return set()
    fmt = struct.unpack('>H', data[best:best + 2])[0]
    cps = set()
    if fmt == 4:
        seg_x2 = struct.unpack('>H', data[best + 6:best + 8])[0]
        seg = seg_x2 // 2
        ends = struct.unpack('>%dH' % seg, data[best + 14:best + 14 + seg_x2])
        starts = struct.unpack('>%dH' % seg, data[best + 16 + seg_x2:best + 16 + 2 * seg_x2])
        for s, e in zip(starts, ends):
            if e != 0xFFFF:
                cps.update(range(s, e + 1))
    elif fmt == 12:
        groups = struct.unpack('>I', data[best + 12:best + 16])[0]
        for g in range(groups):
            s, e, _ = struct.unpack('>III', data[best + 16 + g * 12:best + 28 + g * 12])
            cps.update(range(s, min(e, s + 0x10000) + 1))
    return cps


def main():
    root = pathlib.Path(__file__).resolve().parent.parent / 'src/assets/fonts'
    files = sorted(root.rglob('*.ttf'))
    if not files:
        print('no .ttf files found under', root)
        return 1
    print(f"{'file':38s} {'usWeightClass':>13s} {'U+0600-06FF':>13s} {'FE70-FEFF':>10s}  sample")
    print('-' * 96)
    for p in files:
        d = p.read_bytes()
        t = tables(d)
        cps = codepoints(d, t)
        missing = [c for c in SAMPLE if c.strip() and ord(c) not in cps]
        note = 'all present' if not missing else 'MISSING ' + ''.join(sorted(set(missing)))
        print(f"{p.name:38s} {weight(d, t):>13} {len(cps & ARABIC):>9}/256 "
              f"{len(cps & PRESENTATION_B):>10}  {note}")
    return 0


if __name__ == '__main__':
    sys.exit(main())
