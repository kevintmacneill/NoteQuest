# Avatar art pipeline (M6)

Turns the painted avatar sources into the runtime files the art factory
(`assets/nq-avatar-art-factory.js`, #159) reads:
- 512 px WebP layers under `assets/avatars/layers/`;
- 256 px swatches under `assets/avatars/swatches/`;
- `assets/avatars/avatar-art-manifest.json`.

The tool **never paints, recolors or invents art**. It only:
- cuts out a flat background;
- resizes the registered square source to 512 px;
- applies explicit nudges;
- names and exports the files;
- reports what is missing or misaligned;
- draws review sheets.

The approved paintings are the authority.

## For the painter (ChatGPT): how to deliver art
0. **Measure the approved pose board (done once).**
   ```
   python3 tools/avatar-art/avatar_art.py board --image "NoteQuest character pose and customization board.png" --out underlay/ --write-rig
   ```
   This cuts the six approved dressed figures out of the flattened board. It puts all six at **one common scale** (the bodies keep their relative heights), feet on **one ground line** and the body axis centered, then writes registered underlays and per-pose zones (`rig.json` → `zonesBy`). It needs `scipy`.
1. **Start from the guides.** Run `python3 tools/avatar-art/avatar_art.py guides --src SRC --underlay underlay/ --out guides/`. That gives one 1024 px guide per body and pose, with registration crosses, zone boxes and the portrait crop. Once the approved base body (`SRC/<pose>/<body>/skin/skin-2.png`) exists, the guides show it faintly, so every other part can be painted on top of the real body.
2. **One part per file, on the same square canvas as the base body.**
   - Prefer **real transparency (PNG alpha)**.
   - A flat background is accepted: the tool keys it out from the corner color and softens the edge. Pick a color the part never uses.
   - Never move or crop: a part must sit exactly where it belongs on the base body.
3. **Planes.**
   - Hair and accessories have `.front` and/or `.back` files.
   - **Back** is anything behind the body: long hair behind the shoulders, the backpack body, the back of a scarf.
   - **Front** is everything over the body and outfit: bangs, hat, headphones, glasses, goggles, backpack straps, the scarf knot, the pin.
   - Draw order at runtime is **hair back → accessory back → body/skin → outfit → hair front → accessory front**.
4. **Folder layout** (`SRC` lives outside the repo; sources are large):
   ```
   SRC/silhouette.png
   SRC/<pose>/<body>/skin/<skin>.png
   SRC/<pose>/<body>/outfit/<outfit>.png
   SRC/<pose>/<body>/hair/<hair>/<hairColor>.front.png   (+ .back.png)
   SRC/<pose>/<body>/accessory/<accessory>.front.png     (+ .back.png)
   SRC/<pose>/<body>/eyes/<eyeColor>.png                 iris only, over the skin; not for ec-brown
   SRC/swatches/body/<body>.png
   SRC/swatches/hair/<body>/<hair>.png
   SRC/swatches/<skin|eyeColor|hairColor|outfit|accessory>/<id>.png
   SRC/overrides.json   optional: {"front/girl/outfit/of-red.png": {"dx": 0, "dy": -3}}  (512 px units)
   ```
   - IDs are exactly the engine catalog's. Run `python3 tools/avatar-art/avatar_art.py catalog` to see them.
   - Poses are `front`, `wave` and `walk`.
   - The four owner-approved accessory swatches from #161 are kept as delivered.
   - **Eye color (engine 1.10.0):** brown (`ec-brown`, the catalog's `eyeColorBase`) is painted into the approved bases, so it has no layer. Each other color is one layer per pose and body, holding only the colored irises (with their shine), registered to the base's eyes. It's drawn over the skin and under the hair fringe and glasses. An unpainted color shows as coming soon.
5. **What's still missing:** `python3 tools/avatar-art/avatar_art.py plan --src SRC --missing-only`.

## For the integrator
```
python3 tools/avatar-art/avatar_art.py build --src SRC                  # all art present → draft manifest
python3 tools/avatar-art/avatar_art.py build --src SRC --allow-missing  # partial set → draft manifest
python3 tools/avatar-art/avatar_art.py sheet --out review.png --looks 12
python3 tools/avatar-art/avatar_art.py build --src SRC --approved-by "Kevin 2026-11-26"   # only after Kevin approves the sheet
python3 tools/avatar-art/avatar_art.py check                            # the factory's validate() rules + real file checks
```

### Partial rollout: publish approved art as it's approved (owner decision 2026-11-26)
```
python3 tools/avatar-art/avatar_art.py build --src SRC --partial --approved-by "Kevin 2026-11-26 default fit v1"
```
- `SRC` must contain **only owner-approved art**. Every file in it goes live.
- The manifest is written with `"scope": "partial"`. It lists only the entries that exist; missing ones are **left out, never `null`**. The game shows every unlisted choice greyed out as **Coming soon**.
- It's approved only when every listed file passes the usual checks, every ID is in the catalog, and **each body has at least one complete look in the front pose**. Art is painted front pose first (owner sequence 2026-11-26), so a choice becomes available as soon as its front pose is approved. Until its wave and walk art exist, the game shows the front pose in their place. There's no silhouette yet; the game leaves the slot empty rather than draw a placeholder.
- **Each new approved batch:** add it to the same approved `SRC` folder, rebuild with `--partial --approved-by`, then `prune`. Open a PR and merge it to main once it's reviewed and CI is green. When every choice is painted, build without `--partial`. The full manifest also switches on the builder for existing learners on their next visit.
- **Nothing is published until the whole candidate passes.** Every file is built and validated in a staging folder first.
- **Published files are never overwritten.** Each output gets a content-addressed name (`…-<sha256 prefix>.webp`), so new art lands beside the old. The manifest is then switched in **one atomic replace**. A failure at any point, including while writing files, leaves the active manifest and every file it references byte for byte.
- **`prune`** (with `--dry-run` to preview) deletes the old files the current manifest no longer uses, but never owner-approved files.
- **One writer at a time:** `build` and `prune` take the same exclusive lock on the output (`assets/avatars/.avatar-art.lock`). A second writer waits, or with `--no-wait` exits with code 3, so a prune can never remove art that a build is about to activate. Temporary files are named per build (`.partial-<pid>-<random>`), and each build only cleans up its own.
- **`approved` is written only when every entry exists, every file opens at the right size with visible (non-blank) art, *and* an approver is named.** An incomplete or blank set stays a draft.
- **A draft can't silently replace an approved manifest.** Doing it on purpose needs `--replace-approved`.
- **Owner-approved files listed in `assets/avatars/swatches/approved-accessories.json` (#161) are never rewritten.** They're reused byte for byte, after a size and blank check.
- **`check`** mirrors `validate()` in the art factory and also opens every file: 512² layers, 256² swatches, alpha present.
- **Warnings** flag art touching the canvas edge, or spilling outside its zone (`rig.json`), which usually means it was painted out of registration.
- **Budgets:** 120 KB per layer and 60 KB per swatch.
- `rig.json` zones are measured from the approved pose board. Re-measure them if the base bodies are repainted with different proportions.

Test: `python3 tests/avatar_art_pipeline_test.py` (synthetic shapes; runs in CI).

### Cream starter outfit (owner decision 2026-11-28)
`of-cream` is the cream T-shirt that is painted into the approved skin-2 bases. Its outfit layer (`SRC/<pose>/<body>/outfit/of-cream.png`) is that T-shirt cut out of each base plate, pixel for pixel: no new painting. It lets the avatar go live before the eight colored outfits exist on the new bases.

### Published hair (2026-11-28)
All 288 owner-approved hair sets (12 styles × 3 poses × 8 colors) are published with `--partial`. Hair with no back plane simply has no `.back.png` in `SRC` (an empty file would be rejected as blank). Every fit was approved by eye; where the pose's scalp mask reaches below the approved hairline (forehead, temples, the far temple of a turned head, see-through stubble), the style is listed under `scalpExempt` in `SRC/overrides.json` with the measured share and the approval. The rig zones in `rig.json` still come from the old pose board, so the "spills outside the head zone" warnings are expected until the zones are re-measured from the new bases.

### Outfit-matched goggles (owner decision 2026-11-26)
Goggle lenses match the selected outfit, and **each color is painted individually** (no recoloring). Source layout:
```
SRC/<pose>/<body>/accessory/acc-goggles/<outfit>.front.png   (and .back.png if needed)
```
- **One painting per outfit color.** There's no shared goggles plane.
- The manifest entry is `{"byOutfit": {"of-teal": {"back", "front"}, …}}`.
- The game shows goggles only with an outfit that has a painted variant. Until then that pairing is "coming soon", and switching to such an outfit takes the goggles off.
- A complete set needs all 8 colors in every pose. The list of outfit-matched accessories is `OUTFIT_VARIANT_ACCESSORIES` in `avatar_art.py`.

### Several accessories (engine 1.9.0)
A look can wear one accessory per spot: face (glasses or goggles), head (hat or headphones), back (backpack), neck (scarf) and chest (pin). Paint each accessory as its own layer, so they combine. They stack back to front: backpack, pin, scarf, glasses or goggles, then the hat or headphones on top. Check combinations on the review sheet, for example glasses under the hat brim and backpack straps over the hoodie.
