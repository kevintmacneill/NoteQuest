#!/usr/bin/env python3
"""End-to-end check of tools/avatar-art with synthetic source art (no real paintings)."""
import json, shutil, subprocess, sys, tempfile
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
TOOL = ROOT / 'tools' / 'avatar-art' / 'avatar_art.py'
SIZE = 96  # small square sources keep the test fast; the tool only needs them square


CATALOG = None


def run(repo, *args, ok=True):
    extra = ['--catalog', str(CATALOG)] if CATALOG else []
    r = subprocess.run([sys.executable, str(TOOL), '--repo', str(repo), *extra, *args], capture_output=True, text=True)
    if ok and r.returncode != 0:
        raise AssertionError(f'{args} failed:\n{r.stdout}\n{r.stderr}')
    if not ok and r.returncode == 0:
        raise AssertionError(f'{args} should have failed:\n{r.stdout}')
    return r.stdout


def shape(path, box, color, opaque_bg=None):
    path.parent.mkdir(parents=True, exist_ok=True)
    img = Image.new('RGBA', (SIZE, SIZE), opaque_bg or (0, 0, 0, 0))
    k = SIZE / 512
    ImageDraw.Draw(img).ellipse([v * k for v in box], fill=color)
    img.save(path)


def main():
    rig = json.loads((ROOT / 'tools' / 'avatar-art' / 'rig.json').read_text())
    Z = rig['zones']
    inset = lambda z, m=12: [z[0] + m, z[1] + m, z[2] - m, z[3] - m]
    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        repo, src = tmp / 'repo', tmp / 'src'
        repo.mkdir()
        shutil.copy(ROOT / 'index.html', repo / 'index.html')
        real = json.loads(run(repo, 'catalog'))
        assert {'body', 'hair', 'skin', 'hairColor', 'outfit', 'accessory', 'v'} <= set(real)
        # The real catalog's plan is listed in full; the build runs on a trimmed catalog to stay fast.
        total = run(repo, 'plan').strip().splitlines()[-1]
        assert total.startswith('0/'), total
        cat = {'v': real['v'], 'body': real['body'], 'hair': {b: real['hair'][b][:2] for b in real['body']},
               'skin': real['skin'][:2], 'hairColor': real['hairColor'][:2], 'outfit': real['outfit'][:2],
               'accessory': ['acc-none', 'acc-backpack', 'acc-hat']}
        global CATALOG
        CATALOG = tmp / 'catalog.json'
        CATALOG.write_text(json.dumps(cat))

        # Synthetic source art: one shape per layer, inside the zone its part belongs to.
        zone_for = {'acc-goggles': 'eyes', 'acc-glasses': 'eyes', 'acc-hat': 'head', 'acc-headphones': 'head',
                    'acc-scarf': 'neck', 'acc-backpack': 'back', 'acc-music-pin': 'chest'}
        shape(src / 'silhouette.png', inset(Z['figure']), (120, 120, 140, 255))
        for pose in ('front', 'wave', 'walk'):
            for b in cat['body']:
                base = src / pose / b
                for s in cat['skin']:
                    shape(base / 'skin' / f'{s}.png', inset(Z['figure']), (230, 190, 160, 255))
                for o in cat['outfit']:
                    shape(base / 'outfit' / f'{o}.png', inset(Z['outfit']), (40, 120, 200, 255))
                for h in cat['hair'][b]:
                    for c in cat['hairColor']:
                        shape(base / 'hair' / h / f'{c}.front.png', inset(Z['head']), (90, 60, 30, 255))
                        if h.endswith(('ponytail', 'long')):
                            shape(base / 'hair' / h / f'{c}.back.png', inset(Z['hairBack']), (80, 50, 25, 255))
                for a in cat['accessory']:
                    if a == 'acc-none':
                        continue
                    z = inset(Z.get(zone_for.get(a, 'chest'), Z['chest']))
                    shape(base / 'accessory' / f'{a}.front.png', z, (200, 40, 120, 255))
                    if a == 'acc-backpack':
                        shape(base / 'accessory' / f'{a}.back.png', inset(Z['back']), (150, 30, 90, 255))
        for b in cat['body']:
            shape(src / 'swatches' / 'body' / f'{b}.png', [64, 64, 448, 448], (200, 200, 200, 255))
            for h in cat['hair'][b]:
                shape(src / 'swatches' / 'hair' / b / f'{h}.png', [64, 64, 448, 448], (90, 60, 30, 255))
        for field in ('skin', 'hairColor', 'outfit', 'accessory'):
            for i in cat[field]:
                shape(src / 'swatches' / field / f'{i}.png', [64, 64, 448, 448], (10, 200, 120, 255))
        # One source delivered on a flat background instead of transparency: the tool keys it out.
        first_skin = src / 'front' / cat['body'][0] / 'skin' / f'{cat["skin"][0]}.png'
        shape(first_skin, inset(Z['figure']), (230, 190, 160, 255), opaque_bg=(0, 255, 0, 255))

        out = run(repo, 'plan', '--src', str(src))
        assert out.strip().splitlines()[-1].startswith(tuple(f'{n}/{n} ' for n in range(1, 2000))), out[-300:]

        out = run(repo, 'build', '--src', str(src), '--approved-by', 'TEST owner')
        assert 'keyed background 00ff00' in out, out
        assert 'WARN' not in out, out
        m = json.loads((repo / 'assets/avatars/avatar-art-manifest.json').read_text())
        assert m['status'] == 'approved' and m['approvedBy'] == 'TEST owner'
        b0, h0, c0 = cat['body'][0], cat['hair'][cat['body'][0]][0], cat['hairColor'][0]
        plane = m['poses']['walk']['bodies'][b0]['hair'][h0][c0]
        assert set(plane) == {'back', 'front'} and plane['front'].endswith('-front.webp')
        keyed = Image.open(repo / m['poses']['front']['bodies'][b0]['skin'][cat['skin'][0]])
        assert keyed.size == (512, 512) and keyed.getpixel((2, 2))[3] == 0, 'flat background was not removed'
        assert 'OK: ready' in run(repo, 'check')
        run(repo, 'sheet', '--out', str(tmp / 'sheet.png'), '--looks', '4')
        assert Image.open(tmp / 'sheet.png').size[0] == 600

        # A misregistered hair layer (painted at the feet) is reported, not silently moved.
        bad = src / 'front' / b0 / 'hair' / h0 / f'{c0}.front.png'
        shape(bad, [180, 430, 330, 500], (90, 60, 30, 255))
        assert 'spills outside the head zone' in run(repo, 'build', '--src', str(src))

        # Missing art: refused without --allow-missing; a draft otherwise; never approved.
        (src / 'front' / b0 / 'outfit' / f'{cat["outfit"][0]}.png').unlink()
        run(repo, 'build', '--src', str(src), ok=False)
        out = run(repo, 'build', '--src', str(src), '--allow-missing', '--approved-by', 'TEST owner')
        assert 'refusing to mark approved' in out, out
        assert json.loads((repo / 'assets/avatars/avatar-art-manifest.json').read_text())['status'] == 'draft'
        run(repo, 'check', ok=False)
    print('PASS avatar art pipeline: plan, keying, build, manifest, check, sheet, misregistration, missing art')


if __name__ == '__main__':
    main()
