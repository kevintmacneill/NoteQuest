#!/usr/bin/env python3
"""Synthetic tests for tools/avatar-art/hair_check.py (no real art: it is private)."""
import json, sys, tempfile
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tools/avatar-art'))
import hair_check as hc  # noqa: E402

N = 256  # source size; rig canvas 128
CX, CY, R = 128, 104, 60
RGB = {'hc-black': (30, 26, 28), 'hc-darkbrown': (70, 42, 28), 'hc-brown': (112, 66, 38), 'hc-lightbrown': (150, 104, 66),
       'hc-auburn': (140, 50, 32), 'hc-ginger': (214, 104, 34), 'hc-blonde': (222, 182, 104), 'hc-platinum': (236, 226, 204)}
yy, xx = np.mgrid[0:N, 0:N]
ang = np.arctan2(yy - CY, xx - CX)
dist = np.hypot(xx - CX, yy - CY)


def disc(r):
    return dist <= r


def save(path, mask, rgb, seed):
    path.parent.mkdir(parents=True, exist_ok=True)
    rng = np.random.default_rng(seed)
    a = np.zeros((N, N, 4), np.uint8)
    noise = rng.integers(-28, 29, (N, N, 1))           # painted texture: never a flat patch
    a[..., :3] = np.clip(np.array(rgb)[None, None, :] + noise, 0, 255)
    a[..., 3] = np.where(mask, 255, 0)
    Image.fromarray(a).save(path)


def hair_mask(scale=1.0, cut=False):
    """A cap of hair over the head: wobbly outer edge, wavy fringe; `cut` = ruler-straight fringe."""
    outer = dist <= (R + 7 + 3 * np.sin(ang * 9) + 2 * np.sin(ang * 23)) * scale
    fringe = yy < (CY - 18 + 7 * np.sin(xx / 6.0) + 4 * np.sin(xx / 2.3)) if not cut else yy < CY - 18
    sides = (np.abs(xx - CX) > (R - 10 + 4 * np.sin(yy / 4.0) + 2 * np.sin(yy / 1.7)) * scale) & (yy < CY + 20 + 5 * np.sin(xx / 3.0))
    return outer & (fringe | sides)


def build(root, styles, colors=RGB, mutate=None):
    src = root / 'SRC'
    for pose in hc.POSES:
        for body in ('girl',):
            b = src / pose / body
            skin = disc(R) | ((np.abs(xx - CX) < 45) & (yy > CY + 40))
            save(b / 'skin/skin-2.png', skin, (232, 170, 140), 1)
            save(b / 'scalp.png', disc(R) & (yy < CY - 30), (0, 0, 0), 2)
            for si, style in enumerate(styles):
                for ci, (color, rgb) in enumerate(colors.items()):
                    m = hair_mask()
                    if mutate:
                        m, rgb = mutate(style, color, m, rgb)
                    save(b / 'hair' / style / f'{color}.front.png', m, rgb, 10 + si * 10 + ci)
    (root / 'rig.json').write_text(json.dumps({'canvas': 128, 'sourceSize': N, 'zones': {'head': [30, 4, 100, 70]}}))


def check(mutate=None, styles=('s-one', 's-two', 's-three'), colors=RGB):
    with tempfile.TemporaryDirectory() as t:
        root = Path(t)
        build(root, styles, colors, mutate)
        report, ok = hc.run(root, root / 'out')
        assert (root / 'out/report.md').exists() and (root / 'out/report.json').exists()
        assert sorted(p.name for p in (root / 'out/sheets').iterdir()) == sorted(f'{s}.png' for s in styles)
        return report, ok


def fails(report, needle):
    return sorted(k for k, r in report['results'].items() for f in r['fail'] if needle in f)


passed = 0
def ok(name):
    global passed; passed += 1; print('ok', name)


# 1. Clean hair passes every check.
report, good = check()
bad = {k: r['fail'] for k, r in report['results'].items() if r['fail']}
assert good and not bad and not report['structural'], (bad, report['structural'])
assert len(report['results']) == 3 * 3 * 8
assert all(r['bald_pct'] <= hc.SCALP_TOLERANCE for r in report['results'].values())
ok('clean candidate passes')

# 2. A ruler-straight fringe fails as a straight cut, only where it happens.
report, good = check(lambda s, c, m, rgb: (hair_mask(cut=True) if s == 's-two' else m, rgb))
hits = fails(report, 'straight cut edge')
assert not good and hits and all('/s-two/' in k for k in hits) and len(hits) == 24, hits
ok('straight cut detected')

# 3. A bald spot over the scalp fails.
def bald(s, c, m, rgb):
    if s == 's-one' and c == 'hc-ginger':
        m = m & ~((np.abs(xx - CX) < 22) & (yy < CY - 32))
    return m, rgb
report, good = check(bald)
assert not good and fails(report, 'bald scalp') == [f'girl/s-one/{p}/hc-ginger' for p in ('front', 'walk', 'wave')], fails(report, 'bald scalp')
ok('bald scalp detected')

# 4. One color drawn a different size fails size consistency.
report, good = check(lambda s, c, m, rgb: (hair_mask(scale=0.72) if (s, c) == ('s-three', 'hc-brown') else m, rgb))
assert fails(report, 'different size/shape') == [f'girl/s-three/{p}/hc-brown' for p in ('front', 'walk', 'wave')], fails(report, 'different size/shape')
ok('size mismatch detected')

# 5. Auburn painted the same as brown fails as look-alike.
report, good = check(lambda s, c, m, rgb: (m, RGB['hc-brown'] if (s, c) == ('s-one', 'hc-auburn') else rgb))
assert fails(report, 'looks too much like hc-brown') == [f'girl/s-one/{p}/hc-auburn' for p in ('front', 'walk', 'wave')]
ok('look-alike colors detected')

# 6. A color that drifts from the same color in the other styles fails.
report, good = check(lambda s, c, m, rgb: (m, (190, 120, 40) if (s, c) == ('s-two', 'hc-ginger') else rgb))
assert fails(report, 'hc-ginger drifts') == [f'girl/s-two/{p}/hc-ginger' for p in ('front', 'walk', 'wave')], fails(report, 'drifts')
ok('color drift detected')

# 7. A gap between hair and head is a warning with an outlined spot, not a failure.
def gap(s, c, m, rgb):
    if s == 's-three':
        arc = np.abs(ang + 0.2) < 0.5                                  # the right side of the head
        m = m & ~(arc & (dist > R - 14))                               # hair pulled away from the head...
        m = m | (arc & (dist >= R + 8) & (dist < R + 20))              # ...leaving an 8 px background gap
    return m, rgb
report, good = check(gap)
warned = [k for k, r in report['results'].items() if any('background gap' in w for w in r['warn'])]
assert warned and all('/s-three/' in k for k in warned), warned
assert all(any(lvl == 'warn' for lvl, _ in report['results'][k]['spots']) for k in warned)
ok('gap warned')

# 8. Missing colors and mismatched sizes are file problems.
def shrink(root):
    p = root / 'SRC/front/girl/hair/s-one/hc-black.front.png'
    Image.open(p).resize((128, 128)).save(p)
with tempfile.TemporaryDirectory() as t:
    root = Path(t)
    build(root, ('s-one',), {k: v for k, v in RGB.items() if k != 'hc-platinum'})
    shrink(root)
    report, good = hc.run(root, root / 'out')
    assert not good
    assert any('size mismatch' in s for s in report['structural']), report['structural']
    assert any("missing colors ['hc-platinum']" in s for s in report['structural']), report['structural']
    assert hc.main([str(root), '--out', str(root / 'out2')]) == 1
ok('file problems reported')

# 9. One color at a time (--colors): only the listed colors are expected; every quality check still runs.
with tempfile.TemporaryDirectory() as t:
    root = Path(t)
    build(root, ('s-one', 's-two', 's-three'), {'hc-brown': RGB['hc-brown']},
          lambda s, c, m, rgb: (hair_mask(cut=True) if s == 's-two' else m, rgb))
    report, good = hc.run(root, root / 'out', colors=['hc-brown'])
    assert not report['structural'], report['structural']
    assert report['colors'] == ['hc-brown'] and len(report['results']) == 9
    assert not good and fails(report, 'straight cut edge') == [f'girl/s-two/{p}/hc-brown' for p in ('front', 'walk', 'wave')]
    full, _ = hc.run(root, root / 'out3')
    assert any('missing colors' in s for s in full['structural'])       # default still wants all 8
    assert hc.main([str(root), '--out', str(root / 'out4'), '--colors', 'hc-brown']) == 1
    try:
        hc.run(root, root / 'out5', colors=['hc-purple']); raise AssertionError('unknown color accepted')
    except SystemExit:
        pass
with tempfile.TemporaryDirectory() as t:
    root = Path(t)
    build(root, ('s-one', 's-two', 's-three'), RGB)
    report, good = hc.run(root, root / 'out', colors=['hc-brown'])
    assert good and not report['structural'] and len(report['results']) == 9   # other colors ignored
ok('single-color mode')

print(f'{passed} passed, 0 failed')
