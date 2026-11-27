#!/usr/bin/env python3
"""Hair candidate checker for NoteQuest avatar art.

Runs on a private hair candidate folder (never committed) laid out like the art pipeline's
sources:

    <candidate>/SRC/<pose>/<body>/skin/<skin>.png        approved base (any one skin tone)
    <candidate>/SRC/<pose>/<body>/scalp.png              approved scalp mask
    <candidate>/SRC/<pose>/<body>/hair/<style>/<color>.front.png
    <candidate>/SRC/<pose>/<body>/hair/<style>/<color>.back.png   (optional)
    <candidate>/rig.candidate.json  (or rig.json, or --rig)  zones in canvas px + sourceSize

It writes report.json, report.md and one review sheet per style (8 colors across, poses down,
zoomed on the head, with flagged spots outlined) and exits 1 if anything FAILs.

FAIL (reliable):  missing/mismatched files, bald scalp > 1%, a straight visible edge
                  >= 40 px (a ruler-straight cut), a color drawn a different size/shape from the
                  rest of its style (overlap < 0.80), a color that drifts from the same color
                  in the other styles (delta E > 12), two colors in a style that look alike
                  (delta E < 6).
WARN (look at the outlined spot): straight edge 30-39 px, overlap 0.80-0.88, background gap
                  between hair and head, flat painted patch, grey patch.

Usage: python tools/avatar-art/hair_check.py <candidate> --out <dir> [--rig rig.json]
Needs: pillow numpy scipy scikit-image
"""
import argparse, json, sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage
from skimage.color import rgb2hsv, rgb2lab
from skimage.transform import probabilistic_hough_line

POSES = ('front', 'wave', 'walk')
COLORS = ('hc-black', 'hc-darkbrown', 'hc-brown', 'hc-lightbrown', 'hc-auburn', 'hc-ginger', 'hc-blonde', 'hc-platinum')
SCALP_TOLERANCE = 1.0          # % of the scalp mask that may show
EDGE_FAIL, EDGE_WARN = 40, 30  # straight visible edge length, source px (1024 canvas)
IOU_FAIL, IOU_WARN = 0.80, 0.88
DRIFT_FAIL = 12.0              # delta E (CIE76) from the same color's median across styles
ALIKE_FAIL = 6.0               # delta E between two colors of one style
GAP_WARN, FLAT_WARN, GREY_WARN = 300, 300, 150   # component sizes, px


def rgba(path):
    return np.asarray(Image.open(path).convert('RGBA'))


def outline(mask, against):
    """Pixels of mask that touch a pixel of `against` (4-neighbourhood)."""
    out = np.zeros(mask.shape, bool)
    for dy, dx in ((0, 1), (1, 0), (0, -1), (-1, 0)):
        out |= mask & np.roll(np.roll(against, dy, 0), dx, 1)
    return out


def straight_edges(front_a, back_a, skin):
    """Straight segments on the hair edges a viewer can see: front-plane edges against skin
    or background, and back-plane edges against background. Returns [(length, (x0,y0), (x1,y1))]."""
    f, b = front_a >= 128, back_a >= 128
    visible = outline(f, ~f) | outline(b & ~f, ~skin & ~f & ~b)
    if not visible.any():
        return []
    segs = probabilistic_hough_line(visible, threshold=10, line_length=EDGE_WARN, line_gap=1, rng=0)
    out = [(int(round(np.hypot(x1 - x0, y1 - y0))), (int(x0), int(y0)), (int(x1), int(y1))) for (x0, y0), (x1, y1) in segs]
    return sorted(out, reverse=True)


def components(mask, minimum):
    lab, n = ndimage.label(mask)
    if not n:
        return []
    out = []
    for i, sl in enumerate(ndimage.find_objects(lab), 1):
        size = int((lab[sl] == i).sum())
        if size >= minimum:
            out.append((size, [sl[1].start, sl[0].start, sl[1].stop, sl[0].stop]))
    return sorted(out, reverse=True)


def check_combo(front, back, skin_a, scalp_a, head_zone, color):
    """All per-combination checks. Arrays are RGBA uint8 at source size. Returns a dict."""
    skin = skin_a[..., 3] >= 128
    fa = front[..., 3]
    ba = back[..., 3] if back is not None else np.zeros_like(fa)
    hair = (fa >= 128) | (ba >= 128)
    r = {'fail': [], 'warn': [], 'spots': []}

    scalp = scalp_a[..., 3] >= 128
    bald = 100.0 * (scalp & ~hair).sum() / max(scalp.sum(), 1)
    r['bald_pct'] = round(float(bald), 2)
    if bald > SCALP_TOLERANCE:
        ys, xs = np.nonzero(scalp & ~hair)
        r['fail'].append(f'bald scalp {bald:.1f}%')
        r['spots'].append(('fail', [int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1]))

    segs = straight_edges(fa, ba, skin)
    r['longest_edge'] = segs[0][0] if segs else 0
    for length, p0, p1 in segs:
        level = 'fail' if length >= EDGE_FAIL else 'warn'
        box = [min(p0[0], p1[0]) - 6, min(p0[1], p1[1]) - 6, max(p0[0], p1[0]) + 6, max(p0[1], p1[1]) + 6]
        r['spots'].append((level, box))
    if segs and segs[0][0] >= EDGE_FAIL:
        r['fail'].append(f'straight cut edge {segs[0][0]} px at {segs[0][1]}-{segs[0][2]}')
    elif segs:
        r['warn'].append(f'straightish edge {segs[0][0]} px at {segs[0][1]}-{segs[0][2]}')

    x0, y0, x1, y1 = head_zone
    zone = np.zeros(skin.shape, bool); zone[y0:y1, x0:x1] = True
    bg = ~skin & ~hair
    near = (ndimage.distance_transform_edt(~skin) <= 6) & (ndimage.distance_transform_edt(~hair) <= 6)
    gaps = components(bg & near & zone, GAP_WARN)
    if gaps:
        r['warn'].append(f'background gap between hair and head ({gaps[0][0]} px)')
        r['spots'] += [('warn', g[1]) for g in gaps]

    seen = np.where((fa >= 128)[..., None], front[..., :3], back[..., :3] if back is not None else front[..., :3]).astype(float)
    solid = (fa >= 250) | ((ba >= 250) & ~skin)
    inner = ndimage.binary_erosion(solid, iterations=5)
    lum = seen.mean(-1)
    m, m2 = ndimage.uniform_filter(lum, 9), ndimage.uniform_filter(lum * lum, 9)
    flat = components(inner & (np.sqrt(np.maximum(m2 - m * m, 0)) < 2.5) & (lum > 60), FLAT_WARN)
    if flat:
        r['warn'].append(f'flat painted patch ({flat[0][0]} px)')
        r['spots'] += [('warn', f[1]) for f in flat]
    if color != 'hc-platinum':
        hsv = rgb2hsv(seen / 255.0)
        grey = components(solid & (hsv[..., 1] < 0.12) & (hsv[..., 2] > 0.45), GREY_WARN)
        if grey:
            r['warn'].append(f'grey patch ({grey[0][0]} px)')
            r['spots'] += [('warn', g[1]) for g in grey]

    op = solid & (fa >= 128) | (solid & ~skin)
    px = seen[op] if op.any() else seen[hair]
    r['lab'] = [round(float(v), 2) for v in np.median(rgb2lab((px / 255.0)[None, :, :])[0], 0)] if len(px) else None
    r['_mask'] = hair
    return r


def iou(a, b):
    return float((a & b).sum()) / max(float((a | b).sum()), 1.0)


def size_consistency(masks):
    """masks: {color: bool array}. Reference = the color that overlaps the others best.
    Returns (reference, {color: overlap with reference})."""
    cols = list(masks)
    if len(cols) < 2:
        return (cols[0] if cols else None), {}
    ref = max(cols, key=lambda c: np.mean([iou(masks[c], masks[o]) for o in cols if o != c]))
    return ref, {c: round(iou(masks[ref], masks[c]), 3) for c in cols if c != ref}


def delta_e(a, b):
    return float(np.linalg.norm(np.asarray(a) - np.asarray(b)))


def load_rig(root, rig_path=None):
    for p in ([Path(rig_path)] if rig_path else [root / 'rig.candidate.json', root / 'rig.json']):
        if p.exists():
            rig = json.loads(p.read_text())
            k = rig.get('sourceSize', rig['canvas']) / rig['canvas']
            return {n: [int(round(v * k)) for v in z] for n, z in rig['zones'].items()}
    raise SystemExit('no rig: pass --rig or include rig.candidate.json / rig.json')


def find_skin(body_dir):
    skins = sorted((body_dir / 'skin').glob('*.png'))
    if not skins:
        raise SystemExit(f'no approved base under {body_dir}/skin')
    pref = [s for s in skins if s.stem == 'skin-2']
    return (pref or skins)[0]


def run(root, out, rig_path=None):
    root, out = Path(root), Path(out)
    src = root / 'SRC'
    zones = load_rig(root, rig_path)
    head = zones['head']
    results, structural = {}, []
    for pose in POSES:
        for body_dir in sorted(p for p in (src / pose).glob('*') if p.is_dir()) if (src / pose).exists() else []:
            body = body_dir.name
            skin_a = rgba(find_skin(body_dir))
            scalp_p = body_dir / 'scalp.png'
            if not scalp_p.exists():
                structural.append(f'{pose}/{body}: missing scalp.png'); continue
            scalp_a = rgba(scalp_p)
            for sd in sorted(p for p in (body_dir / 'hair').glob('*') if p.is_dir()):
                for fp in sorted(sd.glob('*.front.png')):
                    color = fp.name.split('.')[0]
                    key = f'{body}/{sd.name}/{pose}/{color}'
                    front = rgba(fp)
                    bp = fp.with_name(color + '.back.png')
                    back = rgba(bp) if bp.exists() else None
                    shapes = {front.shape, skin_a.shape, scalp_a.shape} | ({back.shape} if back is not None else set())
                    if len(shapes) != 1:
                        structural.append(f'{key}: size mismatch {sorted(shapes)}'); continue
                    results[key] = check_combo(front, back, skin_a, scalp_a, head, color)

    # Size consistency per body/style/pose, and color checks.
    groups = {}
    for key, r in results.items():
        body, style, pose, color = key.split('/')
        groups.setdefault((body, style, pose), {})[color] = r
    for (body, style, pose), cols in groups.items():
        ref, ov = size_consistency({c: r['_mask'] for c, r in cols.items()})
        for c, v in ov.items():
            cols[c]['overlap_with_ref'] = v
            if v < IOU_FAIL:
                cols[c]['fail'].append(f'different size/shape from {ref} (overlap {v:.2f})')
            elif v < IOU_WARN:
                cols[c]['warn'].append(f'size/shape differs a little from {ref} (overlap {v:.2f})')
        styles_missing = sorted(set(COLORS) - set(cols))
        if styles_missing:
            structural.append(f'{body}/{style}/{pose}: missing colors {styles_missing}')
        for i, a in enumerate(COLORS):
            for b in COLORS[i + 1:]:
                if a in cols and b in cols and cols[a]['lab'] and cols[b]['lab']:
                    d = delta_e(cols[a]['lab'], cols[b]['lab'])
                    if d < ALIKE_FAIL:
                        cols[b]['fail'].append(f'looks too much like {a} (delta E {d:.1f})')
    for color in COLORS:
        labs = {k: r['lab'] for k, r in results.items() if k.endswith('/' + color) and r['lab']}
        if len(labs) >= 3:
            med = np.median(np.array(list(labs.values())), 0)
            for k, lab in labs.items():
                d = delta_e(lab, med)
                results[k]['drift'] = round(d, 1)
                if d > DRIFT_FAIL:
                    results[k]['fail'].append(f'{color} drifts from the other styles (delta E {d:.1f})')

    out.mkdir(parents=True, exist_ok=True)
    sheets = write_sheets(src, out / 'sheets', results, head)
    for r in results.values():
        r.pop('_mask', None)
    summary = {}
    for key, r in results.items():
        body, style, _, _ = key.split('/')
        s = summary.setdefault(f'{body}/{style}', {'fail': 0, 'warn': 0, 'combos': 0})
        s['combos'] += 1; s['fail'] += bool(r['fail']); s['warn'] += bool(r['warn'])
    report = {'schema': 1, 'structural': structural, 'summary': summary, 'results': results,
              'thresholds': {'scalp_pct': SCALP_TOLERANCE, 'edge_fail': EDGE_FAIL, 'edge_warn': EDGE_WARN,
                             'overlap_fail': IOU_FAIL, 'overlap_warn': IOU_WARN, 'drift_fail': DRIFT_FAIL, 'alike_fail': ALIKE_FAIL}}
    (out / 'report.json').write_text(json.dumps(report, indent=1))
    (out / 'report.md').write_text(markdown(report, sheets))
    ok = not structural and not any(r['fail'] for r in results.values())
    return report, ok


def markdown(report, sheets):
    lines = ['# Hair candidate check', '']
    if report['structural']:
        lines += ['## File problems (FAIL)', ''] + [f'- {s}' for s in report['structural']] + ['']
    lines += ['| Style | Combos | Fail | Warn |', '|---|---|---|---|']
    for k, s in sorted(report['summary'].items()):
        lines.append(f"| {k} | {s['combos']} | {s['fail']} | {s['warn']} |")
    lines.append('')
    for k in sorted(report['summary']):
        rows = [(key, r) for key, r in sorted(report['results'].items()) if key.startswith(k + '/') and (r['fail'] or r['warn'])]
        if not rows:
            continue
        lines += [f'## {k}', '']
        for key, r in rows:
            _, _, pose, color = key.split('/')
            for f in r['fail']:
                lines.append(f'- FAIL {pose} {color}: {f}')
            for w in r['warn']:
                lines.append(f'- warn {pose} {color}: {w}')
        lines.append('')
    lines += ['Sheets: ' + ', '.join(sorted(sheets)), '']
    return '\n'.join(lines)


def write_sheets(src, out, results, head):
    out.mkdir(parents=True, exist_ok=True)
    x0, y0, x1, y1 = head
    w, h = x1 - x0, y1 - y0   # frame the head with a little room for hair that hangs past it
    crop = (max(x0 - int(w * 0.12), 0), max(y0 - int(h * 0.05), 0), x1 + int(w * 0.12), y1 + int(h * 0.15))
    cw = 280; ch = int(cw * (crop[3] - crop[1]) / (crop[2] - crop[0])); sx = cw / (crop[2] - crop[0])
    try:
        font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 18)
    except OSError:
        font = ImageFont.load_default()
    made = []
    styles = sorted({tuple(k.split('/')[:2]) for k in results})
    for body, style in styles:
        left, top = 90, 60
        sheet = Image.new('RGB', (left + cw * len(COLORS), top + ch * len(POSES)), 'white')
        d = ImageDraw.Draw(sheet)
        d.text((8, 8), f'{style}: red = FAIL, orange = warn', fill='black', font=font)
        for i, c in enumerate(COLORS):
            d.text((left + i * cw + 6, 34), c[3:], fill='black', font=font)
        for j, pose in enumerate(POSES):
            d.text((8, top + j * ch + ch // 2), pose, fill='black', font=font)
            for i, c in enumerate(COLORS):
                key = f'{body}/{style}/{pose}/{c}'
                if key not in results:
                    continue
                base = src / pose / body
                im = Image.new('RGBA', Image.open(find_skin(base)).size, (236, 244, 250, 255))
                bp = base / 'hair' / style / f'{c}.back.png'
                if bp.exists():
                    im.alpha_composite(Image.open(bp).convert('RGBA'))
                im.alpha_composite(Image.open(find_skin(base)).convert('RGBA'))
                im.alpha_composite(Image.open(base / 'hair' / style / f'{c}.front.png').convert('RGBA'))
                tile = im.crop(crop).resize((cw, ch), Image.LANCZOS).convert('RGB')
                td = ImageDraw.Draw(tile)
                for level, (bx0, by0, bx1, by1) in results[key]['spots']:
                    box = [(bx0 - crop[0]) * sx, (by0 - crop[1]) * sx, (bx1 - crop[0]) * sx, (by1 - crop[1]) * sx]
                    td.rectangle(box, outline=(220, 30, 30) if level == 'fail' else (245, 150, 20), width=2)
                if results[key]['fail']:
                    td.rectangle([0, 0, cw - 1, ch - 1], outline=(220, 30, 30), width=4)
                sheet.paste(tile, (left + i * cw, top + j * ch))
        name = f'{style}.png'
        sheet.save(out / name, optimize=True)
        made.append(name)
    return made


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('candidate'); ap.add_argument('--out', required=True); ap.add_argument('--rig')
    a = ap.parse_args(argv)
    report, ok = run(a.candidate, a.out, a.rig)
    fails = sum(s['fail'] for s in report['summary'].values())
    warns = sum(s['warn'] for s in report['summary'].values())
    print(f"{len(report['results'])} combinations: {fails} FAIL, {warns} warn, {len(report['structural'])} file problems")
    print(f"report: {Path(a.out) / 'report.md'}")
    return 0 if ok else 1


if __name__ == '__main__':
    sys.exit(main())
