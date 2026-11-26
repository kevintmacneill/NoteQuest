#!/usr/bin/env python3
"""End-to-end check of tools/avatar-art with synthetic source art (no real paintings)."""
import hashlib, json, os, re, shutil, subprocess, sys, tempfile, time
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
TOOL = ROOT / 'tools' / 'avatar-art' / 'avatar_art.py'
SIZE = 96  # small square sources keep the test fast; the tool only needs them square


CATALOG = None


def run(repo, *args, ok=True, env=None):
    extra = ['--catalog', str(CATALOG)] if CATALOG else []
    r = subprocess.run([sys.executable, str(TOOL), '--repo', str(repo), *extra, *args], capture_output=True, text=True,
                       env=dict(os.environ, **(env or {})))
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


def walk(node):
    if isinstance(node, str) and node.startswith('assets/'):
        yield node
    elif isinstance(node, dict):
        for v in node.values():
            yield from walk(v)


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
                Z = rig.get('zonesBy', {}).get(f'{pose}/{b}', rig['zones'])
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
        Zf = rig.get('zonesBy', {}).get(f'front/{cat["body"][0]}', rig['zones'])
        first_skin = src / 'front' / cat['body'][0] / 'skin' / f'{cat["skin"][0]}.png'
        shape(first_skin, inset(Zf['figure']), (230, 190, 160, 255), opaque_bg=(0, 255, 0, 255))

        out = run(repo, 'plan', '--src', str(src))
        assert out.strip().splitlines()[-1].startswith(tuple(f'{n}/{n} ' for n in range(1, 2000))), out[-300:]

        out = run(repo, 'build', '--src', str(src), '--approved-by', 'TEST owner')
        assert 'keyed background 00ff00' in out, out
        assert 'WARN' not in out, out
        m = json.loads((repo / 'assets/avatars/avatar-art-manifest.json').read_text())
        assert m['status'] == 'approved' and m['approvedBy'] == 'TEST owner'
        b0, h0, c0 = cat['body'][0], cat['hair'][cat['body'][0]][0], cat['hairColor'][0]
        plane = m['poses']['walk']['bodies'][b0]['hair'][h0][c0]
        assert set(plane) == {'back', 'front'} and re.search(r'-front-[0-9a-f]{12}\.webp$', plane['front'])
        keyed = Image.open(repo / m['poses']['front']['bodies'][b0]['skin'][cat['skin'][0]])
        assert keyed.size == (512, 512) and keyed.getpixel((2, 2))[3] == 0, 'flat background was not removed'
        assert 'OK: ready' in run(repo, 'check')
        run(repo, 'sheet', '--out', str(tmp / 'sheet.png'), '--looks', '4')
        assert Image.open(tmp / 'sheet.png').size[0] == 600

        mpath = repo / 'assets/avatars/avatar-art-manifest.json'
        early_src = src / 'front' / b0 / 'skin' / f'{cat["skin"][0]}.png'
        early_out = repo / m['poses']['front']['bodies'][b0]['skin'][cat['skin'][0]]
        late_src = src / 'walk' / cat['body'][-1] / 'outfit' / f'{cat["outfit"][-1]}.png'

        # (#163) A failed build publishes nothing: earlier layers and the approved manifest stay byte for byte.
        before_layer, before_manifest = early_out.read_bytes(), mpath.read_bytes()
        shape(early_src, inset(Zf['figure']), (20, 200, 60, 255))            # changed early source
        late_bytes = late_src.read_bytes()
        late_src.unlink()                                                    # missing later source
        run(repo, 'build', '--src', str(src), '--approved-by', 'TEST owner', ok=False)
        assert early_out.read_bytes() == before_layer, 'failed build overwrote a published layer'
        assert mpath.read_bytes() == before_manifest, 'failed build touched the manifest'
        assert not list(repo.glob('.avatar-art-stage-*')), 'staging directory left behind'
        # A draft can't silently replace the approved manifest either.
        run(repo, 'build', '--src', str(src), '--allow-missing', ok=False)
        assert early_out.read_bytes() == before_layer and mpath.read_bytes() == before_manifest
        late_src.write_bytes(late_bytes)

        # A misregistered hair layer (painted at the feet) is reported, not silently moved.
        bad = src / 'front' / b0 / 'hair' / h0 / f'{c0}.front.png'
        good = bad.read_bytes()
        shape(bad, [180, 430, 330, 500], (90, 60, 30, 255))
        assert 'spills outside the head zone' in run(repo, 'build', '--src', str(src), '--approved-by', 'TEST owner')
        bad.write_bytes(good)

        # (#163) Owner-approved swatches are reused byte for byte, even when a source is supplied.
        acc = 'acc-hat'
        prot = repo / 'assets/avatars/swatches' / f'{acc}-256.webp'
        shutil.copy(repo / json.loads(mpath.read_text())['swatches']['accessory'][acc], prot)
        prot_bytes = prot.read_bytes()
        (repo / 'assets/avatars/swatches/approved-accessories.json').write_text(json.dumps(
            {'status': 'owner-approved', 'assets': {prot.name: {'path': f'assets/avatars/swatches/{prot.name}'}}}))
        shape(src / 'swatches' / 'accessory' / f'{acc}.png', [10, 10, 500, 500], (255, 0, 0, 255))
        out = run(repo, 'build', '--src', str(src), '--approved-by', 'TEST owner')
        assert 'kept byte for byte' in out and prot.read_bytes() == prot_bytes, 'approved swatch was rewritten'
        assert json.loads(mpath.read_text())['swatches']['accessory'][acc] == f'assets/avatars/swatches/{prot.name}'

        # (#163 re-review) A failure in the commit phase leaves the active manifest and every file it
        # references untouched: new art gets new content-addressed names and the manifest switches last.
        def snapshot():
            man = json.loads(mpath.read_text())
            return mpath.read_bytes(), {p: hashlib.sha256((repo / p).read_bytes()).hexdigest() for p in walk(man)}
        before = snapshot()
        shape(early_src, inset(Zf['figure']), (200, 30, 200, 255))
        shape(src / 'walk' / cat['body'][-1] / 'skin' / f'{cat["skin"][-1]}.png', inset(Zf['figure']), (10, 10, 200, 255))
        for n in ('0', '1'):
            run(repo, 'build', '--src', str(src), '--approved-by', 'TEST owner', ok=False, env={'NQ_ART_FAIL_AFTER_WRITES': n})
            assert snapshot() == before, 'commit-phase failure changed the active manifest or its files'
            assert 'OK: ready' in run(repo, 'check')
        assert not list(repo.glob('assets/avatars/**/*.partial*'))
        run(repo, 'build', '--src', str(src), '--approved-by', 'TEST owner')
        after = snapshot()
        assert after[0] != before[0] and all(hashlib.sha256((repo / p).read_bytes()).hexdigest() == h
                                              for p, h in before[1].items()), 'old files must stay until pruned'
        out = run(repo, 'prune')
        assert ' deleted' in out and 'OK: ready' in run(repo, 'check')

        # (#164) build and prune never interleave: a build paused just before its manifest switch
        # holds the output lock; prune --no-wait is refused, and a waiting prune runs only after the switch.
        hold = tmp / 'hold'
        shape(early_src, inset(Zf['figure']), (250, 120, 0, 255))
        extra = ['--catalog', str(CATALOG)]
        bproc = subprocess.Popen([sys.executable, str(TOOL), '--repo', str(repo), *extra, 'build', '--src', str(src),
                                  '--approved-by', 'TEST owner'], env=dict(os.environ, NQ_ART_HOLD_BEFORE_SWITCH=str(hold)),
                                 stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
        for _ in range(600):
            if (tmp / 'hold.ready').exists():
                break
            time.sleep(0.05)
        assert (tmp / 'hold.ready').exists(), 'build never reached its manifest switch'
        busy = subprocess.run([sys.executable, str(TOOL), '--repo', str(repo), *extra, 'prune', '--no-wait'],
                              capture_output=True, text=True)
        assert busy.returncode == 3 and 'another avatar-art build or prune is running' in busy.stdout, busy.stdout
        pproc = subprocess.Popen([sys.executable, str(TOOL), '--repo', str(repo), *extra, 'prune'],
                                 stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
        time.sleep(0.5)
        assert pproc.poll() is None, 'prune ran while a build held the lock'
        hold.touch()
        assert bproc.wait(60) == 0, bproc.stdout.read()
        assert pproc.wait(60) == 0, pproc.stdout.read()
        man = json.loads(mpath.read_text())
        assert man['status'] == 'approved' and all((repo / p).exists() for p in walk(man)), 'approved manifest lost a file'
        assert 'OK: ready' in run(repo, 'check')
        assert prot.read_bytes() == prot_bytes, 'prune removed an owner-approved file'

        # Missing art: refused without --allow-missing; a deliberate draft needs --replace-approved; never approved.
        (src / 'front' / b0 / 'outfit' / f'{cat["outfit"][0]}.png').unlink()
        run(repo, 'build', '--src', str(src), ok=False)
        out = run(repo, 'build', '--src', str(src), '--allow-missing', '--approved-by', 'TEST owner', '--replace-approved')
        assert 'refusing to mark approved' in out, out
        assert json.loads(mpath.read_text())['status'] == 'draft'
        run(repo, 'check', ok=False)

        # (#163) A complete but blank (fully transparent) set can never be approved.
        repo2, src2 = tmp / 'repo2', tmp / 'src2'
        repo2.mkdir()
        shutil.copy(ROOT / 'index.html', repo2 / 'index.html')
        for f in src.rglob('*.png'):
            dest = src2 / f.relative_to(src)
            dest.parent.mkdir(parents=True, exist_ok=True)
            Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0)).save(dest)
        out = run(repo2, 'build', '--src', str(src2), '--approved-by', 'TEST owner', ok=False)
        assert 'artwork is blank' in out, out
        assert not (repo2 / 'assets/avatars/avatar-art-manifest.json').exists()
        # …and `check` rejects an approved manifest whose files are blank, however it was produced.
        blank = json.loads(mpath.read_text())
        blank['status'] = 'approved'
        for p in walk(blank):
            f = repo2 / p
            f.parent.mkdir(parents=True, exist_ok=True)
            Image.new('RGBA', (256, 256) if 'swatches' in p else (512, 512), (0, 0, 0, 0)).save(f, 'WEBP')
        (repo2 / 'assets/avatars/avatar-art-manifest.json').write_text(json.dumps(blank))
        assert 'artwork is blank' in run(repo2, 'check', ok=False)

        # Partial rollout: only the default look per body is painted. --partial publishes exactly those
        # entries (missing ones are left out, never null), approves them, and the rest stays "coming soon".
        repo3, src3 = tmp / 'repo3', tmp / 'src3'
        repo3.mkdir()
        shutil.copy(ROOT / 'index.html', repo3 / 'index.html')
        Zb = rig.get('zonesBy', {}).get(f'front/{b0}', rig['zones'])
        shape(src / 'front' / b0 / 'outfit' / f'{cat["outfit"][0]}.png', inset(Zb['outfit']), (40, 120, 200, 255))
        keep = []
        for pose in ('front', 'wave', 'walk'):
            for b in cat['body']:
                h = cat['hair'][b][0]
                keep += [f'{pose}/{b}/skin/{cat["skin"][0]}.png', f'{pose}/{b}/outfit/{cat["outfit"][0]}.png',
                         f'{pose}/{b}/hair/{h}/{cat["hairColor"][0]}.front.png',
                         f'{pose}/{b}/hair/{h}/{cat["hairColor"][0]}.back.png']
        for rel in keep:
            if (src / rel).exists():
                (src3 / rel).parent.mkdir(parents=True, exist_ok=True)
                shutil.copy(src / rel, src3 / rel)
        mpath3 = repo3 / 'assets/avatars/avatar-art-manifest.json'
        run(repo3, 'build', '--src', str(src3), '--approved-by', 'TEST owner', ok=False)   # not without --partial
        out = run(repo3, 'build', '--src', str(src3), '--partial', '--approved-by', 'TEST owner')
        pm = json.loads(mpath3.read_text())
        assert pm['status'] == 'approved' and pm['scope'] == 'partial' and pm['approvedBy'] == 'TEST owner', out

        def nulls(node):
            if isinstance(node, dict):
                if set(node) == {'back', 'front'}:
                    return 0
                return sum(nulls(v) for v in node.values())
            return int(node is None)
        assert nulls(pm) == 0 and 'silhouette' not in pm, 'partial manifest must omit missing entries'
        for b in cat['body']:
            P = pm['poses']['walk']['bodies'][b]
            assert list(P['skin']) == [cat['skin'][0]] and list(P['outfit']) == [cat['outfit'][0]]
            assert list(P['hair']) == [cat['hair'][b][0]] and 'accessory' not in P
        assert 'OK: ready' in (c := run(repo3, 'check')) and '(partial)' in c, c
        run(repo3, 'sheet', '--out', str(tmp / 'partial-sheet.png'), '--looks', '4')
        sheet_px = Image.open(tmp / 'partial-sheet.png').convert('RGB')
        assert not any(sheet_px.getpixel((x, y)) == (180, 40, 40) for x in range(0, 600, 3) for y in range(0, 870, 3)), \
            'partial sheet should only show painted looks'
        # Missing a whole pose for one body: still publishable as a draft, never approved.
        gone = src3 / 'walk' / cat['body'][-1] / 'outfit' / f'{cat["outfit"][0]}.png'
        gone_bytes = gone.read_bytes()
        gone.unlink()
        out = run(repo3, 'build', '--src', str(src3), '--partial', '--approved-by', 'TEST owner', ok=False)
        assert 'approved' in out and json.loads(mpath3.read_text())['status'] == 'approved', out
        out = run(repo3, 'build', '--src', str(src3), '--partial', '--approved-by', 'TEST owner', '--replace-approved')
        assert 'no complete look has art in all three poses' in out and json.loads(mpath3.read_text())['status'] == 'draft'
        gone.write_bytes(gone_bytes)
        run(repo3, 'build', '--src', str(src3), '--partial', '--approved-by', 'TEST owner')
        # Unknown IDs and blank art are rejected by `check`, whatever produced the manifest.
        bad = json.loads(mpath3.read_text())
        bad['poses']['front']['bodies'][cat['body'][0]]['skin']['skin-99'] = bad['poses']['front']['bodies'][cat['body'][0]]['skin'][cat['skin'][0]]
        mpath3.write_text(json.dumps(bad))
        assert 'skin-99: not in the catalog' in run(repo3, 'check', ok=False)
        bad['poses']['front']['bodies'][cat['body'][0]]['skin'].pop('skin-99')
        bad['scope'] = 'whatever'
        mpath3.write_text(json.dumps(bad))
        assert 'unknown manifest scope' in run(repo3, 'check', ok=False)
        bad['scope'] = 'partial'
        blank_layer = repo3 / bad['poses']['wave']['bodies'][cat['body'][0]]['outfit'][cat['outfit'][0]]
        Image.new('RGBA', (512, 512), (0, 0, 0, 0)).save(blank_layer, 'WEBP')
        mpath3.write_text(json.dumps(bad))
        assert 'artwork is blank' in run(repo3, 'check', ok=False)
    print('PASS avatar art pipeline: plan, keying, build, check, sheet, misregistration, failed build preserves '
          'published art, protected swatches, commit-phase failure keeps the active set, prune, build/prune lock, '
          'draft-over-approved refused, blank art rejected, partial approved manifest')


if __name__ == '__main__':
    main()
