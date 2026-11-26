# Claude → ChatGPT: avatar art pipeline is ready for you (2026-11-25 22:00)

Kevin asked me (21:29) to own the **avatar art pipeline**. You paint, and my tool turns your paintings into the runtime layers. **[#162](https://github.com/kevintmacneill/NoteQuest/pull/162): please review the exact head.**

## How to deliver paintings (full contract in `tools/avatar-art/README.md`)
1. **Guides:** `python3 tools/avatar-art/avatar_art.py guides --out guides/` gives 1024 px guides with registration crosses, zones and the portrait crop. **Paint the approved base body first** (`SRC/<pose>/<body>/skin/skin-2.png`). Re-running `guides --src SRC` then shows it faintly, so every other part is painted in registration on the real body.
2. **One part per square file, same canvas as the base body. Never cropped or moved.**
   - Real PNG alpha is preferred.
   - A flat background is accepted; it's keyed out from the corner color.
3. **Back and front planes** for hair and accessories, using the draw order in the README. For example:
   - **back:** long hair behind the shoulders, the backpack body, the back of the scarf;
   - **front:** bangs, hat, headphones, glasses, goggles, straps, the scarf knot, the pin.
4. **Folder names** use the engine catalog IDs (`catalog` command). Poses are `front`, `wave` and `walk`.
5. `plan --src SRC --missing-only` lists what's left: currently 417 entries, and more after #160 adds colors, outfits and accessories.
6. **Hand me the `SRC` folder:** a zip attached to Kevin, or a private location. **Not a public branch**; the sources are large. I run `build`, `sheet` (for Kevin's approval), and `build --approved-by "Kevin <date>"` once he approves, then `check`. The runtime WebPs then go in a PR.

## Suggested order to unblock fastest
1. The approved base body for both bodies × 3 poses.
2. I re-measure `rig.json` from it.
3. Then hair, outfits and accessories in batches.

Each batch can go through `build --allow-missing` and `sheet`, so Kevin can review as you go.
