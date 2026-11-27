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
  prune    [--dry-run]          delete published files the manifest no longer uses
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
import argparse, hashlib, json, os, random, re, shutil, subprocess, sys, tempfile, time
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


# Outfit-matched accessories (owner, 2026-11-26): goggle lenses match the selected outfit,
# each color individually painted. Sources: SRC/<pose>/<body>/accessory/<id>/<outfit>.<plane>.png.
# The manifest entry is {"byOutfit": {"<outfit>": {"back", "front"}}}, with no shared plane.
OUTFIT_VARIANT_ACCESSORIES = ('acc-goggles',)
# Accessories stack back to front by spot, as in the game (engine 1.9.0).
ACC_SPOT = {'acc-backpack': 0, 'acc-music-pin': 1, 'acc-scarf': 2, 'acc-goggles': 3, 'acc-glasses': 3,
            'acc-hat': 4, 'acc-headphones': 4}


# Eye color (engine 1.10.0, owner 2026-11-26/27): the base color (brown) is painted into the
# bases; every other color is an iris layer over the skin.
# Sources: SRC/<pose>/<body>/eyes/<eyeColor>.png; manifest: poses.<pose>.bodies.<body>.eyes.<id>.
def eye_ids(cat):
    return [e for e in cat.get('eyeColor', []) if e != cat.get('eyeColorBase')]


SWATCH_FIELDS = ('skin', 'eyeColor', 'hairColor', 'outfit', 'accessory')


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
            for e in eye_ids(cat):
                items.append(('layer', f'{base}/eyes/{e}.png', f'{out}/eyes-{e}.webp', (pose, body, 'eyes', e)))
            for h in cat['hair'][body]:
                for c in cat['hairColor']:
                    for plane in ('back', 'front'):
                        items.append(('plane', f'{base}/hair/{h}/{c}.{plane}.png',
                                      f'{out}/hair-{h}-{c}-{plane}.webp', (pose, body, 'hair', h, c, plane)))
            for a in cat['accessory']:
                if a == 'acc-none':
                    continue
                for plane in ('back', 'front'):
                    if a in OUTFIT_VARIANT_ACCESSORIES:
                        for o in cat['outfit']:
                            items.append(('plane', f'{base}/accessory/{a}/{o}.{plane}.png',
                                          f'{out}/accessory-{a}-{o}-{plane}.webp', (pose, body, 'accessory', a, o, plane)))
                    else:
                        items.append(('plane', f'{base}/accessory/{a}.{plane}.png',
                                      f'{out}/accessory-{a}-{plane}.webp', (pose, body, 'accessory', a, plane)))
    for b in cat['body']:
        items.append(('swatch', f'swatches/body/{b}.png', f'{SWATCH_DIR}/body-{b}-256.webp', ('body', b)))
        for h in cat['hair'][b]:
            items.append(('swatch', f'swatches/hair/{b}/{h}.png', f'{SWATCH_DIR}/hair-{b}-{h}-256.webp', ('hair', b, h)))
    for field in SWATCH_FIELDS:
        for i in cat.get(field, []):
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


def zones_for(R, pose=None, body=None):
    return R.get('zonesBy', {}).get(f'{pose}/{body}', R['zones'])


def bbox_warnings(img, label, zone_name, R, pose=None, body=None):
    warns = []
    box = img.getchannel('A').point(lambda a: 255 if a > 24 else 0).getbbox()
    if not box:
        return [f'{label}: layer is empty']
    if box[0] == 0 or box[1] == 0 or box[2] == img.width or box[3] == img.height:
        warns.append(f'{label}: art touches the canvas edge (clipped?)')
    Z = zones_for(R, pose, body)
    if zone_name and zone_name in Z:
        z, t = Z[zone_name], R['tolerance']
        if box[0] < z[0] - t or box[1] < z[1] - t or box[2] > z[2] + t or box[3] > z[3] + t:
            warns.append(f'{label}: art {box} spills outside the {zone_name} zone {z}; check registration')
    return warns


def expected_zone(key, R):
    if len(key) >= 4 and key[2] == 'skin':
        return R['expect']['skin']
    if len(key) >= 4 and key[2] == 'outfit':
        return R['expect']['outfit']
    if len(key) >= 4 and key[2] == 'eyes':
        return 'eyes'
    if len(key) == 6 and key[2] == 'hair':
        return R['expect']['hair.' + key[5]]
    if len(key) in (5, 6) and key[2] == 'accessory':
        return R['expect'].get(key[3])
    return None


def save_webp(img, path, quality=86):
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, 'WEBP', quality=quality, method=4, exact=False)
    return path.stat().st_size


# ---------------------------------------------------------------- build
MIN_ART_PIXELS = 100            # fewer visible pixels than this is treated as blank art
PROTECTED = 'assets/avatars/swatches/approved-accessories.json'


class OutputLock:
    """One writer at a time per output root: build and prune take the same exclusive lock."""
    def __init__(self, repo, wait=True):
        self.path, self.wait, self.fh = Path(repo) / 'assets/avatars/.avatar-art.lock', wait, None

    def __enter__(self):
        import fcntl
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.fh = open(self.path, 'a+')
        try:
            fcntl.flock(self.fh, fcntl.LOCK_EX | (0 if self.wait else fcntl.LOCK_NB))
        except BlockingIOError:
            self.fh.close()
            print('another avatar-art build or prune is running on this output; try again when it finishes')
            sys.exit(3)
        return self

    def __exit__(self, *exc):
        import fcntl
        fcntl.flock(self.fh, fcntl.LOCK_UN)
        self.fh.close()


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
    with OutputLock(args.repo, wait=not args.no_wait):
        _build(args)


def _build(args):
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
        hair_planes = {}
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
                posed = key[0] in POSES
                warns += bbox_warnings(img, rel, expected_zone(key, R), R, *(key[:2] if posed else (None, None)))
            if kind == 'plane' and key[2] == 'hair':
                hair_planes[key[:5]] = hair_planes.get(key[:5], []) + [img]
            size = save_webp(img, stage / out)
            budget = SWATCH_BUDGET if kind == 'swatch' else LAYER_BUDGET
            if size > budget:
                warns.append(f'{out}: {size} bytes is over the {budget} budget')
            written[out] = size
        for planes in groups.values():
            if not any((src / s).exists() for s, _ in planes.values()):
                missing.append(planes['front'][0].replace('.front.png', '.{front|back}.png'))

        scalp_problems = scalp_coverage(src, R, overrides, hair_planes)
        (errors if args.approved_by else warns).extend(scalp_problems)

        if errors:
            print(f'{len(errors)} problems; nothing was published.')
            for e in errors[:60]:
                print('  ERROR', e)
            sys.exit(1)
        if missing and not (args.allow_missing or args.partial):
            print(f'{len(missing)} source files are missing (run `plan` for the list). Nothing was published.')
            for m in missing[:40]:
                print('  missing', m)
            sys.exit(1)

        # Content-addressed names: a published file is never overwritten, because new art gets
        # a new name. The active manifest keeps pointing at the old, untouched files until the
        # single atomic manifest switch at the very end.
        final, staged_for = {}, {}
        for out in written:
            if (stage / out).exists():
                digest = hashlib.sha256((stage / out).read_bytes()).hexdigest()[:12]
                final[out] = out[:-len('.webp')] + f'-{digest}.webp'
                staged_for[final[out]] = stage / out
            else:
                final[out] = out                              # reused owner-approved file
        resolve = lambda p: staged_for.get(p, repo / p)
        manifest = make_manifest(cat, R, items, groups, final, args, resolve)
        if old and old.get('status') == 'approved' and manifest['status'] != 'approved' and not args.replace_approved:
            print('The published manifest is approved and this build would not be. Nothing was published '
                  '(pass --replace-approved to replace it with a draft on purpose).')
            sys.exit(1)

        fail_after = int(os.environ.get('NQ_ART_FAIL_AFTER_WRITES', '-1'))   # tests only
        new_files, mine = 0, []
        token = f'{os.getpid()}-{os.urandom(4).hex()}'
        for path, staged in staged_for.items():           # commit phase 1: add new files only
            dest = repo / path
            data = staged.read_bytes()
            if dest.exists():
                if dest.read_bytes() != data:
                    raise RuntimeError(f'{path} exists with different content; refusing to overwrite')
                continue
            if new_files == fail_after:
                raise OSError(f'injected commit failure before writing {path}')
            dest.parent.mkdir(parents=True, exist_ok=True)
            tmp = dest.with_name(f'{dest.name}.partial-{token}')
            mine.append(tmp)
            tmp.write_bytes(data)
            os.replace(tmp, dest)                         # a brand-new name, never an active file
            new_files += 1
        mpath = repo / MANIFEST                           # commit phase 2: one atomic switch
        mpath.parent.mkdir(parents=True, exist_ok=True)
        tmp = stage / 'manifest.json'
        tmp.write_text(json.dumps(manifest, indent=1) + '\n')
        hold = os.environ.get('NQ_ART_HOLD_BEFORE_SWITCH')                 # tests only
        if hold:
            Path(hold + '.ready').touch()
            while not Path(hold).exists():
                time.sleep(0.05)
        os.replace(tmp, mpath)
    finally:
        shutil.rmtree(stage, ignore_errors=True)
        for leftover in mine if 'mine' in locals() else []:   # only this build's temporary files
            leftover.unlink(missing_ok=True)
    print(f'published {len(written)} files and {MANIFEST} (status {manifest["status"]})')
    for n in notes:
        print('  note', n)
    for w in warns:
        print('  WARN', w)
    if missing and manifest.get('scope') == 'partial':
        print(f'  {len(missing)} entries not painted yet; the game shows them as coming soon')
    elif missing:
        print(f'  {len(missing)} entries missing; the manifest stays a draft')


def make_manifest(cat, R, items, groups, final, args, resolve):
    have = lambda out: final.get(out)
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
        elif len(gkey) == 5:                       # outfit-matched accessory variant
            node = node.setdefault(gkey[3], {}).setdefault('byOutfit', {})
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
    partial = bool(getattr(args, 'partial', False))
    if partial:
        # A partial manifest lists only the art that exists. Missing entries are left out
        # (never null), so the game can tell "coming soon" from a broken file.
        body = drop_missing(body)
        body.setdefault('poses', {})
        body.setdefault('swatches', {})
    head = {'status': 'approved', 'scope': 'partial'} if partial else {'status': 'approved'}
    problems = check_manifest(dict(head, **body), cat, files=True, resolve=resolve)
    approved = bool(args.approved_by) and not problems
    if args.approved_by and problems:
        print(f'  refusing to mark approved: {len(problems)} problems, e.g. {problems[0]}')
    out = {'status': 'approved' if approved else 'draft'}
    if partial:
        out['scope'] = 'partial'
    out['approvedBy'] = args.approved_by if approved else None
    return dict(out, **body)


SCALP_TOLERANCE = 0.01      # at most 1% of the scalp area may show through (anti-aliased edges)


def scalp_coverage(src, R, overrides, hair_planes):
    """No bald scalp (owner, 2026-11-26: "make sure we don't see any of the bald head").

    Each base pose has a scalp mask, SRC/<pose>/<body>/scalp.png: opaque where the bare
    skull shows on the skin plate (temples, above and behind the ears, the crown), excluding
    forehead, face, ears and neck. Every hairstyle × color must cover it with its back and
    front planes together. A style that deliberately shows scalp is listed in overrides.json
    under "scalpExempt": {"<pose>/<body>/<style>": "why"}. Without a mask nothing can be
    verified, so approval is refused."""
    problems, masks = [], {}
    exempt = overrides.get('scalpExempt', {})
    for (pose, body, _, style, color), planes in sorted(hair_planes.items()):
        if f'{pose}/{body}/{style}' in exempt:
            continue
        mrel = f'{pose}/{body}/scalp.png'
        if mrel not in masks:
            mp = src / mrel
            masks[mrel] = None
            if mp.exists():
                img = to_canvas(Image.open(mp).convert('RGBA'), R['canvas'], {}, mrel)
                masks[mrel] = np.asarray(img)[..., 3] >= 128
        mask = masks[mrel]
        if mask is None:
            problems.append(f'{mrel}: no scalp mask, so bald spots under {style}/{color} can\'t be checked')
            continue
        area = int(mask.sum())
        if not area:
            problems.append(f'{mrel}: scalp mask is empty')
            continue
        hair = np.zeros(mask.shape, bool)
        for img in planes:
            hair |= np.asarray(img)[..., 3] >= 128
        bare = mask & ~hair
        n = int(bare.sum())
        if n > area * SCALP_TOLERANCE:
            ys, xs = np.nonzero(bare)
            problems.append(f'{pose}/{body}/hair/{style}/{color}: bald scalp shows ({n} px, {100 * n / area:.1f}% '
                            f'of the scalp) around x {xs.min()}–{xs.max()}, y {ys.min()}–{ys.max()} on the 512 canvas')
    return problems


def drop_missing(node):
    """Remove missing (None) entries; a {back, front} plane survives if either plane exists."""
    if not isinstance(node, dict):
        return node
    if set(node) == {'back', 'front'}:
        return node if any(v is not None for v in node.values()) else None
    out = {}
    for k, v in node.items():
        v = drop_missing(v)
        if v is None or (isinstance(v, dict) and not v):
            continue
        out[k] = v
    return out


def renderable(m, cat, body):
    """True when at least one complete look for `body` has front-pose art. Art is painted front pose
    first (owner sequence 2026-11-26); the game falls back to front until wave and walk exist."""
    get = lambda o, *ks: o if not ks else get(o.get(ks[0]) if isinstance(o, dict) else None, *ks[1:])
    ok_path = lambda p: isinstance(p, str) and bool(SAFE.match(p))
    ok_plane = lambda n: isinstance(n, dict) and set(n) >= {'back', 'front'} and \
        any(v is not None for v in (n['back'], n['front'])) and \
        all(v is None or ok_path(v) for v in (n['back'], n['front']))
    P = {pose: get(m, 'poses', pose, 'bodies', body) for pose in ('front',)}
    every = lambda f: all(f(b) for b in P.values())
    skin = any(every(lambda b, s=s: ok_path(get(b, 'skin', s))) for s in cat['skin'])
    outfit = any(every(lambda b, o=o: ok_path(get(b, 'outfit', o))) for o in cat['outfit'])
    hair = any(every(lambda b, h=h, c=c: ok_plane(get(b, 'hair', h, c)))
               for h in cat['hair'][body] for c in cat['hairColor'])
    return skin and outfit and hair


# ---------------------------------------------------------------- check
def check_manifest(m, cat, files=True, repo=Path('.'), resolve=None):
    """Mirror of validate() in assets/nq-avatar-art-factory.js, plus file checks."""
    errs = []
    if not m or m.get('status') != 'approved' or m.get('catalogVersion') != cat['v']:
        errs.append('manifest is not approved for this catalog version')
    if m and m.get('scope') == 'partial':
        return check_partial(m, cat, files, repo, resolve, errs)
    if m and 'scope' in m:
        errs.append('unknown manifest scope')
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
    for field in SWATCH_FIELDS:
        for i in cat.get(field, []):
            path(get(m, 'swatches', field, i), f'swatch/{field}/{i}')
    for pose in POSES:
        for b in cat['body']:
            P = get(m, 'poses', pose, 'bodies', b)
            for s in cat['skin']:
                path(get(P, 'skin', s), f'{pose}/{b}/{s}')
            for o in cat['outfit']:
                path(get(P, 'outfit', o), f'{pose}/{b}/{o}')
            for e in eye_ids(cat):
                path(get(P, 'eyes', e), f'{pose}/{b}/eyes/{e}')
            for h in cat['hair'][b]:
                for c in cat['hairColor']:
                    plane(get(P, 'hair', h, c), f'{pose}/{b}/{h}/{c}')
            for a in cat['accessory']:
                if a == 'acc-none':
                    continue
                node = get(P, 'accessory', a)
                if a in OUTFIT_VARIANT_ACCESSORIES:
                    if not isinstance(node, dict) or set(node) != {'byOutfit'}:
                        errs.append(f'{pose}/{b}/{a}: needs a painted variant per outfit')
                        continue
                    for o in cat['outfit']:
                        plane(get(node, 'byOutfit', o), f'{pose}/{b}/{a}/{o}')
                else:
                    plane(node, f'{pose}/{b}/{a}')
    if files:
        errs += file_errors(paths, repo, resolve)
    return errs


def check_partial(m, cat, files, repo, resolve, errs):
    """Mirror of validatePartial(): every listed entry must be valid; nothing else is required
    except one complete look per body. Unknown IDs are errors (no guessed filenames)."""
    paths = []

    def path(p, label):
        if isinstance(p, str) and SAFE.match(p):
            paths.append(p)
        else:
            errs.append(label)

    def plane(node, label):
        if not isinstance(node, dict) or set(node) != {'back', 'front'} or \
                all(v is None for v in node.values()):
            errs.append(label)
            return
        for v in node.values():
            if v is not None:
                path(v, label)

    def entries(node, allowed, label):
        if node is None:
            return {}
        if not isinstance(node, dict):
            errs.append(label)
            return {}
        for k in node:
            if k not in allowed:
                errs.append(f'{label}/{k}: not in the catalog')
        return {k: v for k, v in node.items() if k in allowed}

    if m.get('width') != 512 or m.get('height') != 512:
        errs.append('canvas dimensions')
    if m.get('silhouette') is not None:
        path(m.get('silhouette'), 'silhouette')
    crop = m.get('portrait') or {}
    vals = [crop.get(k) for k in ('x', 'y', 'width', 'height')]
    if not all(isinstance(v, int) for v in vals) or vals[0] < 0 or vals[1] < 0 or vals[2] <= 0 or vals[3] <= 0 \
            or vals[0] + vals[2] > 512 or vals[1] + vals[3] > 512:
        errs.append('portrait crop')
    sw = entries(m.get('swatches'), {'body', 'hair', *SWATCH_FIELDS}, 'swatches')
    for b, p in entries(sw.get('body'), set(cat['body']), 'swatch/body').items():
        path(p, f'swatch/body/{b}')
    for b, group in entries(sw.get('hair'), set(cat['body']), 'swatch/hair').items():
        for h, p in entries(group, set(cat['hair'][b]), f'swatch/hair/{b}').items():
            path(p, f'swatch/hair/{b}/{h}')
    for field in SWATCH_FIELDS:
        for i, p in entries(sw.get(field), set(cat.get(field, [])), f'swatch/{field}').items():
            path(p, f'swatch/{field}/{i}')
    for pose, node in entries(m.get('poses'), set(POSES), 'poses').items():
        bodies = entries(node.get('bodies') if isinstance(node, dict) else None, set(cat['body']), f'{pose}')
        for b, P in bodies.items():
            P = entries(P, {'skin', 'outfit', 'hair', 'accessory', 'eyes'}, f'{pose}/{b}')
            for e, p in entries(P.get('eyes'), set(eye_ids(cat)), f'{pose}/{b}/eyes').items():
                path(p, f'{pose}/{b}/eyes/{e}')
            for s, p in entries(P.get('skin'), set(cat['skin']), f'{pose}/{b}/skin').items():
                path(p, f'{pose}/{b}/{s}')
            for o, p in entries(P.get('outfit'), set(cat['outfit']), f'{pose}/{b}/outfit').items():
                path(p, f'{pose}/{b}/{o}')
            for h, colors in entries(P.get('hair'), set(cat['hair'][b]), f'{pose}/{b}/hair').items():
                for c, n in entries(colors, set(cat['hairColor']), f'{pose}/{b}/{h}').items():
                    plane(n, f'{pose}/{b}/{h}/{c}')
            accs = set(cat['accessory']) - {'acc-none'}
            for a, n in entries(P.get('accessory'), accs, f'{pose}/{b}/accessory').items():
                if a in OUTFIT_VARIANT_ACCESSORIES:
                    if not isinstance(n, dict) or set(n) != {'byOutfit'}:
                        errs.append(f'{pose}/{b}/{a}: needs a painted variant per outfit')
                        continue
                    variants = entries(n['byOutfit'], set(cat['outfit']), f'{pose}/{b}/{a}')
                    if not variants:
                        errs.append(f'{pose}/{b}/{a}: no outfit variants')
                    for o, v in variants.items():
                        plane(v, f'{pose}/{b}/{a}/{o}')
                else:
                    plane(n, f'{pose}/{b}/{a}')
    for b in cat['body']:
        if not renderable(m, cat, b):
            errs.append(f'{b}: no complete look has front-pose art')
    if files:
        errs += file_errors(paths, repo, resolve)
    return errs


def file_errors(paths, repo, resolve):
    errs = []
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
    scope = f' ({m["scope"]})' if m.get('scope') else ''
    print(f'{MANIFEST}: status {m.get("status")}{scope}, {len(set(walk_paths(m)))} files, {total/1e6:.1f} MB')
    for e in errs[:80]:
        print('  ERROR', e)
    if len(errs) > 80:
        print(f'  … and {len(errs) - 80} more')
    print('OK: ready for the art factory' if not errs else f'{len(errs)} problems')
    sys.exit(1 if errs else 0)


def prune(args):
    with OutputLock(args.repo, wait=not args.no_wait):
        _prune(args)


def _prune(args):
    """Delete published avatar files the current manifest no longer uses (never protected files)."""
    repo = Path(args.repo)
    m = json.loads((repo / MANIFEST).read_text())
    keep = set(walk_paths(m)) | protected_paths(repo)
    gone = 0
    for d in (LAYER_DIR, SWATCH_DIR):
        for f in (repo / d).rglob('*.webp'):
            rel = f.relative_to(repo).as_posix()
            if rel not in keep:
                if args.dry_run:
                    print('would delete', rel)
                else:
                    f.unlink()
                gone += 1
    print(f'{gone} unused files {"found" if args.dry_run else "deleted"}')


def walk_paths(node):
    if isinstance(node, str) and SAFE.match(node):
        yield node
    elif isinstance(node, dict):
        for v in node.values():
            yield from walk_paths(v)



# ---------------------------------------------------------------- board (measure the approved pose board)
BOARD_GRID = {   # cell boxes on the approved 1536×1024 "character pose and customization board"
    'rows': {'boy': (38, 418), 'girl': (424, 848)},
    'cols': {'front': (70, 566), 'wave': (572, 998), 'walk': (1004, 1475)},
    'blank': [(0, 0, 280, 82)],   # the NoteQuest logo in the top-left cell
}


def board_figures(path, grid=BOARD_GRID, threshold=50):
    """Cut each dressed figure out of the flattened board: (pose, body) -> (rgba crop, mask, box)."""
    from scipy import ndimage as nd
    rgb = np.asarray(Image.open(path).convert('RGB')).astype(np.int32)
    corner = rgb[grid['rows']['boy'][0] + 260:grid['rows']['boy'][0] + 300, 90:140].reshape(-1, 3)
    bg = np.median(corner, axis=0)
    dist = np.abs(rgb - bg).max(axis=2)
    for x0, y0, x1, y1 in grid.get('blank', []):
        dist[y0:y1, x0:x1] = 0
    out = {}
    for body, (y0, y1) in grid['rows'].items():
        for pose, (x0, x1) in grid['cols'].items():
            sub = nd.binary_opening(dist[y0:y1, x0:x1] > threshold, iterations=2)
            lab, n = nd.label(sub)
            sizes = nd.sum(sub, lab, range(1, n + 1))
            main = int(np.argmax(sizes)) + 1
            keep = lab == main
            ys, xs = np.nonzero(keep)
            bx = (xs.min(), ys.min(), xs.max(), ys.max())
            for i in range(1, n + 1):         # hands, braids and feet that touch the figure's box
                if i != main and sizes[i - 1] >= 40:
                    yy, xx = np.nonzero(lab == i)
                    if xx.min() >= bx[0] - 40 and xx.max() <= bx[2] + 40 and yy.min() >= bx[1] - 40 and yy.max() <= bx[3] + 10:
                        keep |= lab == i
            keep = nd.binary_dilation(keep, iterations=2)
            alpha = np.clip((dist[y0:y1, x0:x1] - 18) * 255 // 40, 0, 255) * keep
            crop = np.dstack([rgb[y0:y1, x0:x1], alpha]).astype(np.uint8)
            ys, xs = np.nonzero(keep)
            out[(pose, body)] = (crop, keep, (int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())))
    return out


def measure_board(path, canvas=512, top=20, ground=500):
    """One common scale for all six figures (bodies keep their relative heights), feet on one
    ground line, body axis centered. Returns {pose/body: zones} and registered RGBA underlays."""
    figs = board_figures(path)
    tallest = max(b[3] - b[1] for _, _, b in figs.values())
    k = (ground - top) / tallest
    zones, underlays = {}, {}
    for (pose, body), (crop, keep, (x0, y0, x1, y1)) in figs.items():
        h = y1 - y0
        legs = keep[y0 + int(h * 0.6):y1 + 1]
        axis = float(np.nonzero(legs)[1].mean())                 # body axis from the legs, not a waving arm
        band = keep[:, max(0, int(axis - h * 0.18)):int(axis + h * 0.18)]
        widths = band.sum(axis=1)
        search = range(y0 + int(h * 0.18), y0 + int(h * 0.42))
        neck = min(search, key=lambda y: widths[y])               # narrowest row between head and shoulders
        def cv(y):
            return round(ground - (y1 - y) * k)
        def cx(x):
            return round(canvas / 2 + (x - axis) * k)
        head_w = h * 0.19
        z = {
            'figure': [cx(x0), cv(y0), cx(x1), cv(y1)],
            'head': [cx(axis - head_w), cv(y0), cx(axis + head_w), cv(neck)],
            'eyes': [cx(axis - head_w * 0.75), cv(y0 + (neck - y0) * 0.48), cx(axis + head_w * 0.75), cv(y0 + (neck - y0) * 0.72)],
            'neck': [cx(axis - h * 0.08), cv(neck - h * 0.03), cx(axis + h * 0.08), cv(neck + h * 0.07)],
            'chest': [cx(axis - h * 0.13), cv(neck + h * 0.05), cx(axis + h * 0.13), cv(neck + h * 0.22)],
            'outfit': [cx(axis - h * 0.24), cv(neck), cx(axis + h * 0.24), cv(y1)],
            'back': [cx(axis - h * 0.24), cv(neck - h * 0.05), cx(axis + h * 0.24), cv(neck + h * 0.42)],
            'hairBack': [cx(axis - h * 0.25), cv(y0), cx(axis + h * 0.25), cv(neck + h * 0.42)],
        }
        zones[f'{pose}/{body}'] = {n: [max(0, min(canvas, v)) for v in box] for n, box in z.items()}
        img = Image.fromarray(crop, 'RGBA')
        img = img.resize((round(img.width * k), round(img.height * k)), Image.LANCZOS)
        under = Image.new('RGBA', (canvas, canvas))
        under.alpha_composite(img, (round(canvas / 2 - axis * k), round(ground - y1 * k)))
        underlays[(pose, body)] = under
    return zones, underlays, k


def cmd_board(args):
    zones, underlays, k = measure_board(args.image)
    out = Path(args.out)
    for (pose, body), im in underlays.items():
        (out / pose).mkdir(parents=True, exist_ok=True)
        im.resize((1024, 1024), Image.LANCZOS).save(out / pose / f'{body}.png')
    print(f'scale {k:.3f} board px per canvas px; underlays written to {out}')
    if args.write_rig:
        R = rig()
        R['zonesBy'] = zones
        R['note'] = ('Zones measured from the owner-approved pose board (all six figures at one common scale, '
                     'feet on one ground line, body axis centered). They drive the painting guides and the '
                     'alignment warnings only; the tool never moves or scales art to fit them.')
        (HERE / 'rig.json').write_text(json.dumps(R, indent=2) + '\n')
        print('rig.json updated with per-pose zones')
    else:
        print(json.dumps(zones, indent=1))

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
            underf = Path(args.underlay) / pose / f'{body}.png' if args.underlay else None
            if not (basef and basef.exists()) and underf and underf.exists():
                basef = underf     # the approved dressed figure, registered, until the base body exists
            if basef and basef.exists():
                base, _ = cut_out(Image.open(basef), str(basef))
                base = base.resize(g.size)
                base.putalpha(base.getchannel('A').point(lambda a: a * 90 // 255))
                g.alpha_composite(base)
            d = ImageDraw.Draw(g)
            for name, (x0, y0, x1, y1) in zones_for(R, pose, body).items():
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
    worn = look.get('accessories', [] if look['accessory'] == 'acc-none' else [look['accessory']])
    accs = []
    for a in sorted(worn, key=lambda a: ACC_SPOT.get(a, 9)):
        node = P['accessory'][a]
        accs.append(node['byOutfit'][look['outfit']] if 'byOutfit' in node else node)
    eye = look.get('eyeColor')
    eyes = P['eyes'][eye] if eye and eye in P.get('eyes', {}) else None   # base color: none needed
    order = [hair['back'], *(a['back'] for a in accs), P['skin'][look['skin']], eyes, P['outfit'][look['outfit']],
             hair['front'], *(a['front'] for a in accs)]
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
        if m.get('scope') == 'partial':
            # Show only what's painted (front pose decides; other poses may still be missing).
            B = [((m.get('poses') or {}).get('front') or {}).get('bodies', {}).get(body) or {}]
            common = lambda part: sorted(set.intersection(*(set(b.get(part) or {}) for b in B)))
            pairs = sorted(set.intersection(*({(h, c) for h, cs in (b.get('hair') or {}).items() for c in cs}
                                              for b in B)))
            if common('skin') and common('outfit') and pairs:
                look['hair'], look['hairColor'] = rnd.choice(pairs)
                look.update(skin=rnd.choice(common('skin')), outfit=rnd.choice(common('outfit')))
                fits = [a for a in common('accessory')
                        if 'byOutfit' not in B[0]['accessory'][a] or look['outfit'] in B[0]['accessory'][a]['byOutfit']]
                look['accessory'] = rnd.choice(['acc-none'] + fits)
                look['eyeColor'] = rnd.choice([None] + sorted((B[0].get('eyes') or {})))
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
    p.add_argument('--underlay', help='folder from `board` (registered approved figures)')
    p = sub.add_parser('board'); p.add_argument('--image', required=True); p.add_argument('--out', required=True)
    p.add_argument('--write-rig', action='store_true')
    p = sub.add_parser('build'); p.add_argument('--src', required=True); p.add_argument('--allow-missing', action='store_true')
    p.add_argument('--approved-by', default='')
    p.add_argument('--partial', action='store_true',
                   help='publish only the art that exists; the game shows the rest as "coming soon" '
                        '(implies --allow-missing)')
    p.add_argument('--no-wait', action='store_true', help='exit (code 3) instead of waiting for another writer')
    p.add_argument('--replace-approved', action='store_true',
                   help='allow a draft build to replace a published approved manifest')
    sub.add_parser('check')
    p = sub.add_parser('prune'); p.add_argument('--dry-run', action='store_true')
    p.add_argument('--no-wait', action='store_true', help='exit (code 3) instead of waiting for another writer')
    p = sub.add_parser('sheet'); p.add_argument('--out', required=True); p.add_argument('--looks', type=int, default=12)
    p.add_argument('--seed', type=int, default=1)
    a = ap.parse_args()
    global CATALOG_OVERRIDE
    CATALOG_OVERRIDE = a.catalog
    if a.cmd == 'catalog':
        print(json.dumps(load_catalog(Path(a.repo)), indent=1))
    else:
        {'plan': cmd_plan, 'guides': guides, 'build': build, 'check': check, 'sheet': sheet,
         'board': cmd_board, 'prune': prune}[a.cmd](a)


if __name__ == '__main__':
    main()
