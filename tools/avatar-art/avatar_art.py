#!/usr/bin/env python3
"""NoteQuest avatar art pipeline (M6).

Takes the painted source files and produces the runtime WebP layers, swatches and
the manifest read by assets/nq-avatar-art-factory.js (#159).

The tool never paints, recolors or invents art. It only:
  * cuts out a flat background (or keeps real transparency);
  * resizes the registered square source to the 512 px runtime canvas;
  * applies explicit per-file nudges from overrides.json;
  * names, exports and lists every file;
  * reports what is missing or misaligned;
  * draws contact sheets for review.

Commands
  catalog                       print the engine's avatar catalog
  plan     --src DIR            list every source file the catalog needs (and which exist)
  guides   --src DIR --out DIR  1024 px painting guides per body and pose
  build    --src DIR [--repo .] [--allow-missing] [--approved-by "Kevin 2026-11-26"]
  check    [--repo .]           validate the built manifest and files
  sheet    [--repo .] --out PNG [--looks 12] [--seed 1]

Source layout (all square PNGs, same size per pose, registered to the base body):
  SRC/silhouette.png
  SRC/<pose>/<body>/skin/<skin>.png
  SRC/<pose>/<body>/outfit/<outfit>.png
  SRC/<pose>/<body>/hair/<hair>/<hairColor>.front.png  (and/or .back.png)
  SRC/<pose>/<body>/accessory/<accessory>.front.png    (and/or .back.png)
  SRC/swatches/body/<body>.png
  SRC/swatches/hair/<body>/<hair>.png
  SRC/swatches/<skin|hairColor|outfit|accessory>/<id>.png
  SRC/overrides.json   optional {"<relative source path>": {"dx": 0, "dy": 0}}  (512 px units)
"""
import argparse, json, os, random, re, shutil, subprocess, sys, tempfile
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
POSES = ('front', 'wave', 'walk')
SAFE = re.compile(r'^assets/(?:[A-Za-z0-9_-]+/)*[A-Za-z0-9_-]+\.webp$')
LAYER_DIR = 'assets/avatars/layers'
SWATCH_DIR = 'assets/avatars/swatches'
MANIFEST = 'assets/avatars/avatar-art-manifest.json'
LAYER_BUDGET = 120_000   # bytes per 512 px layer
SWATCH_BUDGET = 60_000   # bytes per 256 px swatch


def rig():
    return json.loads((HERE / 'rig.json').read_text())


# ---------------------------------------------------------------- catalog
CATALOG_OVERRIDE = None   # tests only: --catalog FILE


def load_catalog(repo):
    """Read AVATAR_CATALOG from the engine in index.html (the single source of truth)."""
    if CATALOG_OVERRIDE:
        return json.loads(Path(CATALOG_OVERRIDE).read_text())
    js = r'''
const fs=require('fs'),vm=require('vm');
const h=fs.readFileSync(process.argv[1],'utf8');
const m=h.match(/<script id="nq-engine">\n([\s\S]*?)\n<\/script>/);
if(!m){console.error('engine not found');process.exit(2)}
const store={};global.localStorage={getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=String(v)},removeItem:k=>{delete store[k]}};
global.window=global;global.navigator={};global.btoa=s=>Buffer.from(s,'binary').toString('base64');global.atob=s=>Buffer.from(s,'base64').toString('binary');
vm.runInThisContext(m[1]);
process.stdout.write(JSON.stringify(window.NQ.profiles.avatarCatalog));
'''
    out = subprocess.run(['node', '-e', js, str(Path(repo) / 'index.html')],
                         capture_output=True, text=True, check=True)
    return json.loads(out.stdout)


# ---------------------------------------------------------------- the plan
def plan(cat):
    """Every source file the catalog needs: (kind, rel_source, out_rel, key path)."""
    items = [('silhouette', 'silhouette.png', f'{LAYER_DIR}/silhouette.webp', ('silhouette',))]
    for pose in POSES:
        for body in cat['body']:
            base = f'{pose}/{body}'
            out = f'{LAYER_DIR}/{pose}/{body}'
            for s in cat['skin']:
                items.append(('layer', f'{base}/skin/{s}.png', f'{out}/skin-{s}.webp', (pose, body, 'skin', s)))
            for o in cat['outfit']:
                items.append(('layer', f'{base}/outfit/{o}.png', f'{out}/outfit-{o}.webp', (pose, body, 'outfit', o)))
            for h in cat['hair'][body]:
                for c in cat['hairColor']:
                    for plane in ('back', 'front'):
                        items.append(('plane', f'{base}/hair/{h}/{c}.{plane}.png',
                                      f'{out}/hair-{h}-{c}-{plane}.webp', (pose, body, 'hair', h, c, plane)))
            for a in cat['accessory']:
                if a == 'acc-none':
                    continue
                for plane in ('back', 'front'):
                    items.append(('plane', f'{base}/accessory/{a}.{plane}.png',
                                  f'{out}/accessory-{a}-{plane}.webp', (pose, body, 'accessory', a, plane)))
    for b in cat['body']:
        items.append(('swatch', f'swatches/body/{b}.png', f'{SWATCH_DIR}/body-{b}-256.webp', ('body', b)))
        for h in cat['hair'][b]:
            items.append(('swatch', f'swatches/hair/{b}/{h}.png', f'{SWATCH_DIR}/hair-{b}-{h}-256.webp', ('hair', b, h)))
    for field in ('skin', 'hairColor', 'outfit', 'accessory'):
        for i in cat[field]:
            # The four owner-approved accessory swatches (#161) keep their existing names.
            name = f'{i}-256.webp' if field == 'accessory' else f'{field}-{i}-256.webp'
            items.append(('swatch', f'swatches/{field}/{i}.png', f'{SWATCH_DIR}/{name}', (field, i)))
    return items


def plane_groups(items):
    """Hair/accessory entries need at least one of back/front."""
    groups = {}
    for kind, src, out, key in items:
        if kind == 'plane':
            groups.setdefault(key[:-1], {})[key[-1]] = (src, out)
    return groups


# ---------------------------------------------------------------- image work
def cut_out(img, label, tol=18):
    """Keep real transparency; otherwise key out a flat background sampled from the corners."""
    img = img.convert('RGBA')
    alpha = img.getchannel('A')
    if alpha.getextrema()[0] < 250:
        return img, None
    w, h = img.size
    px = img.load()
    corners = [px[0, 0], px[w - 1, 0], px[0, h - 1], px[w - 1, h - 1]]
    ref = corners[0]
    if any(max(abs(c[i] - ref[i]) for i in range(3)) > tol for c in corners):
        raise ValueError(f'{label}: no transparency and the background is not one flat color')
    a = np.asarray(img).astype(np.int32)
    d = np.abs(a[..., :3] - np.array(ref[:3], dtype=np.int32)).max(axis=2)
    # Inside tol: background. Up to 3×tol: soft edge, faded instead of a hard fringe.
    alpha = np.clip((d - tol) * 255 // (tol * 2), 0, 255).astype(np.uint8)
    out = a.astype(np.uint8)
    out[..., 3] = np.minimum(out[..., 3], alpha)
    return Image.fromarray(out, 'RGBA'), 'keyed background %02x%02x%02x' % ref[:3]


def to_canvas(img, size, nudge, label):
    if img.width != img.height:
        raise ValueError(f'{label}: source must be square (got {img.width}x{img.height})')
    out = img.resize((size, size), Image.LANCZOS)
    dx, dy = int(nudge.get('dx', 0)), int(nudge.get('dy', 0))
    if dx or dy:
        moved = Image.new('RGBA', (size, size))
        moved.alpha_composite(out, (dx, dy))
        out = moved
    return out


def bbox_warnings(img, label, zone_name, R):
    warns = []
    box = img.getchannel('A').point(lambda a: 255 if a > 24 else 0).getbbox()
    if not box:
        return [f'{label}: layer is empty']
    if box[0] == 0 or box[1] == 0 or box[2] == img.width or box[3] == img.height:
        warns.append(f'{label}: art touches the canvas edge (clipped?)')
    if zone_name and zone_name in R['zones']:
        z, t = R['zones'][zone_name], R['tolerance']
        if box[0] < z[0] - t or box[1] < z[1] - t or box[2] > z[2] + t or box[3] > z[3] + t:
            warns.append(f'{label}: art {box} spills outside the {zone_name} zone {z}; check registration')
    return warns


def expected_zone(key, R):
    if len(key) >= 4 and key[2] == 'skin':
        return R['expect']['skin']
    if len(key) >= 4 and key[2] == 'outfit':
        return R['expect']['outfit']
    if len(key) == 6 and key[2] == 'hair':
        return R['expect']['hair.' + key[5]]
    if len(key) == 5 and key[2] == 'accessory':
        return R['expect'].get(key[3])
    return None


def save_webp(img, path, quality=86):
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, 'WEBP', quality=quality, method=4, exact=False)
    return path.stat().st_size


# ---------------------------------------------------------------- build
MIN_ART_PIXELS = 100            # fewer visible pixels than this is treated as blank art
PROTECTED = 'assets/avatars/swatches/approved-accessories.json'


def visible_pixels(img):
    return int((np.asarray(img.getchannel('A')) > 24).sum())


def protected_paths(repo):
    """Owner-approved files that a build must never rewrite (e.g. the #161 swatches)."""
    f = repo / PROTECTED
    if not f.exists():
        return set()
    return {v['path'] for v in json.loads(f.read_text()).get('assets', {}).values() if 'path' in v}


def existing_asset_errors(path, want):
    try:
        with Image.open(path) as im:
            im = im.convert('RGBA')
            if im.size != (want, want):
                return [f'{path.name}: {im.size[0]}x{im.size[1]}, expected {want}x{want}']
            if visible_pixels(im) < MIN_ART_PIXELS:
                return [f'{path.name}: artwork is blank']
    except Exception as e:
        return [f'{path.name}: unreadable ({type(e).__name__})']
    return []


def build(args):
    """Everything is staged and validated first. Published files and the manifest are
    only replaced after the whole candidate passes, so a failed or partial build never
    changes art that an approved manifest points at."""
    repo, src = Path(args.repo), Path(args.src)
    cat, R = load_catalog(repo), rig()
    overrides = json.loads((src / 'overrides.json').read_text()) if (src / 'overrides.json').exists() else {}
    items = plan(cat)
    groups = plane_groups(items)
    keep = protected_paths(repo)
    old = json.loads((repo / MANIFEST).read_text()) if (repo / MANIFEST).exists() else None
    stage = Path(tempfile.mkdtemp(prefix='.avatar-art-stage-', dir=repo))
    try:
        missing, errors, warns, notes, written = [], [], [], [], {}
        for kind, rel, out, key in items:
            sp, dest = src / rel, repo / out
            if out in keep or (kind == 'swatch' and key[0] == 'accessory' and dest.exists() and not sp.exists()):
                if not dest.exists():
                    missing.append(rel)
                    continue
                errors += existing_asset_errors(dest, 256)      # reused, never rewritten
                if sp.exists():
                    notes.append(f'{rel}: ignored; {out} is owner-approved and kept byte for byte')
                written[out] = dest.stat().st_size
                continue
            if not sp.exists():
                if kind != 'plane':
                    missing.append(rel)
                continue
            try:
                img, note = cut_out(Image.open(sp), rel)
                if note:
                    notes.append(f'{rel}: {note}')
                if kind == 'swatch':
                    if img.width != img.height:
                        raise ValueError(f'{rel}: swatch must be square')
                    img = img.resize((256, 256), Image.LANCZOS)
                else:
                    img = to_canvas(img, R['canvas'], overrides.get(rel, {}), rel)
            except Exception as e:
                errors.append(str(e) if isinstance(e, ValueError) else f'{rel}: unreadable ({type(e).__name__})')
                continue
            if visible_pixels(img) < MIN_ART_PIXELS:
                errors.append(f'{rel}: artwork is blank (fully or almost fully transparent)')
                continue
            if kind != 'swatch':
                warns += bbox_warnings(img, rel, expected_zone(key, R), R)
            size = save_webp(img, stage / out)
            budget = SWATCH_BUDGET if kind == 'swatch' else LAYER_BUDGET
            if size > budget:
                warns.append(f'{out}: {size} bytes is over the {budget} budget')
            written[out] = size
        for planes in groups.values():
            if not any((src / s).exists() for s, _ in planes.values()):
                missing.append(planes['front'][0].replace('.front.png', '.{front|back}.png'))

        if errors:
            print(f'{len(errors)} problems; nothing was published.')
            for e in errors[:60]:
                print('  ERROR', e)
            sys.exit(1)
        if missing and not args.allow_missing:
            print(f'{len(missing)} source files are missing (run `plan` for the list). Nothing was published.')
            for m in missing[:40]:
                print('  missing', m)
            sys.exit(1)

        resolve = lambda p: stage / p if (stage / p).exists() else repo / p
        manifest = make_manifest(cat, R, items, groups, written, args, resolve)
        if old and old.get('status') == 'approved' and manifest['status'] != 'approved' and not args.replace_approved:
            print('The published manifest is approved and this build would not be. Nothing was published '
                  '(pass --replace-approved to replace it with a draft on purpose).')
            sys.exit(1)

        for out in written:                               # publish: files first, manifest last
            if (stage / out).exists():
                (repo / out).parent.mkdir(parents=True, exist_ok=True)
                os.replace(stage / out, repo / out)
        mpath = repo / MANIFEST
        mpath.parent.mkdir(parents=True, exist_ok=True)
        tmp = stage / 'manifest.json'
        tmp.write_text(json.dumps(manifest, indent=1) + '\n')
        os.replace(tmp, mpath)
    finally:
        shutil.rmtree(stage, ignore_errors=True)
    print(f'published {len(written)} files and {MANIFEST} (status {manifest["status"]})')
    for n in notes:
        print('  note', n)
    for w in warns:
        print('  WARN', w)
    if missing:
        print(f'  {len(missing)} entries missing; the manifest stays a draft')


def make_manifest(cat, R, items, groups, written, args, resolve):
    have = lambda out: out if out in written else None
    poses = {}
    for kind, rel, out, key in items:
        if kind == 'layer':
            pose, body, part, i = key
            poses.setdefault(pose, {'bodies': {}})['bodies'].setdefault(body, {}).setdefault(part, {})[i] = have(out)
    for gkey, planes in groups.items():
        pose, body, part = gkey[:3]
        node = poses.setdefault(pose, {'bodies': {}})['bodies'].setdefault(body, {}).setdefault(part, {})
        if part == 'hair':
            node = node.setdefault(gkey[3], {})
            leaf = gkey[4]
        else:
            leaf = gkey[3]
        node[leaf] = {p: have(planes[p][1]) for p in ('back', 'front')}
    swatches = {}
    for kind, rel, out, key in items:
        if kind != 'swatch':
            continue
        if key[0] == 'hair':
            swatches.setdefault('hair', {}).setdefault(key[1], {})[key[2]] = have(out)
        else:
            swatches.setdefault(key[0], {})[key[1]] = have(out)
    body = {'catalogVersion': cat['v'], 'width': R['canvas'], 'height': R['canvas'],
            'silhouette': have(f'{LAYER_DIR}/silhouette.webp'), 'portrait': R['portrait'],
            'poses': poses, 'swatches': swatches}
    problems = check_manifest(dict(body, status='approved'), cat, files=True, resolve=resolve)
    approved = bool(args.approved_by) and not problems
    if args.approved_by and problems:
        print(f'  refusing to mark approved: {len(problems)} problems, e.g. {problems[0]}')
    return dict({'status': 'approved' if approved else 'draft',
                 'approvedBy': args.approved_by if approved else None}, **body)


# ---------------------------------------------------------------- check
def check_manifest(m, cat, files=True, repo=Path('.'), resolve=None):
    """Mirror of validate() in assets/nq-avatar-art-factory.js, plus file checks."""
    errs = []
    if not m or m.get('status') != 'approved' or m.get('catalogVersion') != cat['v']:
        errs.append('manifest is not approved for this catalog version')
    if m.get('width') != 512 or m.get('height') != 512:
        errs.append('canvas dimensions')
    paths = []

    def path(p, label):
        if not (isinstance(p, str) and SAFE.match(p)):
            errs.append(label)
            return
        paths.append(p)

    def plane(node, label):
        if not isinstance(node, dict) or 'back' not in node or 'front' not in node:
            errs.append(label)
            return
        vals = [node['back'], node['front']]
        if all(v is None for v in vals):
            errs.append(label)
        for v in vals:
            if v is not None:
                path(v, label)

    get = lambda o, *ks: (o.get(ks[0]) if isinstance(o, dict) else None) if len(ks) == 1 else get(o.get(ks[0]) if isinstance(o, dict) else None, *ks[1:])
    path(m.get('silhouette'), 'silhouette')
    crop = m.get('portrait') or {}
    vals = [crop.get(k) for k in ('x', 'y', 'width', 'height')]
    if not all(isinstance(v, int) for v in vals) or vals[0] < 0 or vals[1] < 0 or vals[2] <= 0 or vals[3] <= 0 \
            or vals[0] + vals[2] > 512 or vals[1] + vals[3] > 512:
        errs.append('portrait crop')
    for b in cat['body']:
        path(get(m, 'swatches', 'body', b), f'swatch/body/{b}')
        for h in cat['hair'][b]:
            path(get(m, 'swatches', 'hair', b, h), f'swatch/hair/{b}/{h}')
    for field in ('skin', 'hairColor', 'outfit', 'accessory'):
        for i in cat[field]:
            path(get(m, 'swatches', field, i), f'swatch/{field}/{i}')
    for pose in POSES:
        for b in cat['body']:
            P = get(m, 'poses', pose, 'bodies', b)
            for s in cat['skin']:
                path(get(P, 'skin', s), f'{pose}/{b}/{s}')
            for o in cat['outfit']:
                path(get(P, 'outfit', o), f'{pose}/{b}/{o}')
            for h in cat['hair'][b]:
                for c in cat['hairColor']:
                    plane(get(P, 'hair', h, c), f'{pose}/{b}/{h}/{c}')
            for a in cat['accessory']:
                if a != 'acc-none':
                    plane(get(P, 'accessory', a), f'{pose}/{b}/{a}')
    if files:
        resolve = resolve or (lambda p: repo / p)
        for p in sorted(set(paths)):
            f = resolve(p)
            if not f.exists():
                errs.append(f'file missing: {p}')
                continue
            try:
                with Image.open(f) as im:
                    want = 256 if p.startswith(SWATCH_DIR) else 512
                    if im.size != (want, want):
                        errs.append(f'{p}: {im.size[0]}x{im.size[1]}, expected {want}x{want}')
                    if im.mode not in ('RGBA', 'LA') and 'transparency' not in im.info:
                        errs.append(f'{p}: no alpha channel')
                    elif visible_pixels(im.convert('RGBA')) < MIN_ART_PIXELS:
                        errs.append(f'{p}: artwork is blank')
            except Exception as e:
                errs.append(f'{p}: unreadable ({type(e).__name__})')
    return errs


def check(args):
    repo = Path(args.repo)
    cat = load_catalog(repo)
    m = json.loads((repo / MANIFEST).read_text())
    errs = check_manifest(m, cat, files=True, repo=repo)
    total = sum((repo / p).stat().st_size for p in walk_paths(m) if (repo / p).exists())
    print(f'{MANIFEST}: status {m.get("status")}, {len(set(walk_paths(m)))} files, {total/1e6:.1f} MB')
    for e in errs[:80]:
        print('  ERROR', e)
    if len(errs) > 80:
        print(f'  … and {len(errs) - 80} more')
    print('OK: ready for the art factory' if not errs else f'{len(errs)} problems')
    sys.exit(1 if errs else 0)


def walk_paths(node):
    if isinstance(node, str) and SAFE.match(node):
        yield node
    elif isinstance(node, dict):
        for v in node.values():
            yield from walk_paths(v)


# ---------------------------------------------------------------- plan / guides / sheet
def cmd_plan(args):
    cat, src = load_catalog(Path(args.repo)), Path(args.src) if args.src else None
    items = plan(cat)
    groups = plane_groups(items)
    need = [rel for k, rel, _, _ in items if k != 'plane'] + \
           [p['front'][0].replace('.front.png', '.{front|back}.png') for p in groups.values()]
    have = 0
    for rel in need:
        exists = src and (any((src / rel.replace('{front|back}', x)).exists() for x in ('front', 'back'))
                          if '{front|back}' in rel else (src / rel).exists())
        have += bool(exists)
        if args.missing_only and exists:
            continue
        print(('have  ' if exists else 'need  ') + rel)
    print(f'{have}/{len(need)} entries present  (catalog v{cat["v"]}: {len(cat["body"])} bodies, '
          f'{sum(len(v) for v in cat["hair"].values())} hairstyles, {len(cat["skin"])} skins, '
          f'{len(cat["hairColor"])} hair colors, {len(cat["outfit"])} outfits, {len(cat["accessory"])} accessories)')


def guides(args):
    """1024 px guides: registration marks, zones, and the approved base body if it exists."""
    cat, R, src, out = load_catalog(Path(args.repo)), rig(), Path(args.src) if args.src else None, Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    k = R['sourceSize'] / R['canvas']
    for pose in POSES:
        for body in cat['body']:
            g = Image.new('RGBA', (R['sourceSize'],) * 2, (0, 0, 0, 0))
            basef = src / pose / body / 'skin' / 'skin-2.png' if src else None
            if basef and basef.exists():
                base, _ = cut_out(Image.open(basef), str(basef))
                base = base.resize(g.size)
                base.putalpha(base.getchannel('A').point(lambda a: a * 90 // 255))
                g.alpha_composite(base)
            d = ImageDraw.Draw(g)
            for name, (x0, y0, x1, y1) in R['zones'].items():
                d.rectangle([x0 * k, y0 * k, x1 * k, y1 * k], outline=(0, 160, 255, 200), width=2)
                d.text((x0 * k + 6, y0 * k + 4), name, fill=(0, 120, 220, 255))
            for x, y in R['registration']:
                x, y = x * k, y * k
                d.line([x - 24, y, x + 24, y], fill=(255, 0, 128, 255), width=3)
                d.line([x, y - 24, x, y + 24], fill=(255, 0, 128, 255), width=3)
            c = R['portrait']
            d.rectangle([c['x'] * k, c['y'] * k, (c['x'] + c['width']) * k, (c['y'] + c['height']) * k],
                        outline=(255, 170, 0, 220), width=2)
            d.text((c['x'] * k + 6, (c['y'] + c['height']) * k - 18), 'portrait crop', fill=(200, 120, 0, 255))
            g.save(out / f'guide-{pose}-{body}.png')
    print(f'wrote {len(POSES) * len(cat["body"])} guides to {out}')


def compose(repo, m, look, pose):
    P = m['poses'][pose]['bodies'][look['body']]
    hair = P['hair'][look['hair']][look['hairColor']]
    acc = {'back': None, 'front': None} if look['accessory'] == 'acc-none' else P['accessory'][look['accessory']]
    order = [hair['back'], acc['back'], P['skin'][look['skin']], P['outfit'][look['outfit']], hair['front'], acc['front']]
    canvas = Image.new('RGBA', (512, 512))
    for p in order:
        if p:
            with Image.open(repo / p) as im:
                canvas.alpha_composite(im.convert('RGBA'))
    return canvas


def sheet(args):
    repo = Path(args.repo)
    cat = load_catalog(repo)
    m = json.loads((repo / MANIFEST).read_text())
    rnd = random.Random(args.seed)
    cell, cols = 200, len(POSES)
    rows = args.looks
    img = Image.new('RGB', (cell * cols, (cell + 18) * rows), (246, 239, 226))
    d = ImageDraw.Draw(img)
    for r in range(rows):
        body = cat['body'][r % len(cat['body'])]
        look = {'body': body, 'hair': rnd.choice(cat['hair'][body]), 'skin': rnd.choice(cat['skin']),
                'hairColor': rnd.choice(cat['hairColor']), 'outfit': rnd.choice(cat['outfit']),
                'accessory': rnd.choice(cat['accessory'])}
        label = ' '.join(look[k] for k in ('hair', 'skin', 'hairColor', 'outfit', 'accessory'))
        d.text((4, r * (cell + 18) + 2), label, fill=(60, 50, 40))
        for ci, pose in enumerate(POSES):
            try:
                c = compose(repo, m, look, pose).resize((cell, cell), Image.LANCZOS)
                img.paste(c, (ci * cell, r * (cell + 18) + 18), c)
            except Exception as e:  # missing entries in a draft manifest
                d.text((ci * cell + 8, r * (cell + 18) + 90), f'missing ({type(e).__name__})', fill=(180, 40, 40))
    img.save(args.out)
    print(f'wrote {args.out}')


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--repo', default=str(HERE.parent.parent))
    ap.add_argument('--catalog', help='tests only: use this catalog JSON instead of the engine')
    sub = ap.add_subparsers(dest='cmd', required=True)
    sub.add_parser('catalog')
    p = sub.add_parser('plan'); p.add_argument('--src'); p.add_argument('--missing-only', action='store_true')
    p = sub.add_parser('guides'); p.add_argument('--src'); p.add_argument('--out', required=True)
    p = sub.add_parser('build'); p.add_argument('--src', required=True); p.add_argument('--allow-missing', action='store_true')
    p.add_argument('--approved-by', default='')
    p.add_argument('--replace-approved', action='store_true',
                   help='allow a draft build to replace a published approved manifest')
    sub.add_parser('check')
    p = sub.add_parser('sheet'); p.add_argument('--out', required=True); p.add_argument('--looks', type=int, default=12)
    p.add_argument('--seed', type=int, default=1)
    a = ap.parse_args()
    global CATALOG_OVERRIDE
    CATALOG_OVERRIDE = a.catalog
    if a.cmd == 'catalog':
        print(json.dumps(load_catalog(Path(a.repo)), indent=1))
    else:
        {'plan': cmd_plan, 'guides': guides, 'build': build, 'check': check, 'sheet': sheet}[a.cmd](a)


if __name__ == '__main__':
    main()
