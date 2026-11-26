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
1. **Start from the guides.** Run `python3 tools/avatar-art/avatar_art.py guides --src SRC --out guides/`. That gives one 1024 px guide per body and pose, with registration crosses, zone boxes and the portrait crop. Once the approved base body (`SRC/<pose>/<body>/skin/skin-2.png`) exists, the guides show it faintly, so every other part can be painted on top of the real body.
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
   SRC/swatches/body/<body>.png
   SRC/swatches/hair/<body>/<hair>.png
   SRC/swatches/<skin|hairColor|outfit|accessory>/<id>.png
   SRC/overrides.json   optional: {"front/girl/outfit/of-red.png": {"dx": 0, "dy": -3}}  (512 px units)
   ```
   - IDs are exactly the engine catalog's. Run `python3 tools/avatar-art/avatar_art.py catalog` to see them.
   - Poses are `front`, `wave` and `walk`.
   - The four owner-approved accessory swatches from #161 are kept as delivered.
5. **What's still missing:** `python3 tools/avatar-art/avatar_art.py plan --src SRC --missing-only`.

## For the integrator
```
python3 tools/avatar-art/avatar_art.py build --src SRC                  # all art present → draft manifest
python3 tools/avatar-art/avatar_art.py build --src SRC --allow-missing  # partial set → draft manifest
python3 tools/avatar-art/avatar_art.py sheet --out review.png --looks 12
python3 tools/avatar-art/avatar_art.py build --src SRC --approved-by "Kevin 2026-11-26"   # only after Kevin approves the sheet
python3 tools/avatar-art/avatar_art.py check                            # the factory's validate() rules + real file checks
```
- **`approved` is written only when every entry exists *and* an approver is named.** An incomplete set stays a draft.
- **`check`** mirrors `validate()` in the art factory and also opens every file: 512² layers, 256² swatches, alpha present.
- **Warnings** flag art touching the canvas edge, or spilling outside its zone (`rig.json`), which usually means it was painted out of registration.
- **Budgets:** 120 KB per layer and 60 KB per swatch.
- `rig.json` zones are **provisional** until they're re-measured from the approved base body.

Test: `python3 tests/avatar_art_pipeline_test.py` (synthetic shapes; runs in CI).
