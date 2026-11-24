# Layered overlook fit and loading check

This UI-only branch starts at #108 head `60b8678`. The painted prototype's four WebP layers are aligned at 2172 × 724. Previously the renderer stretched the city itself past the track edges and could switch to the layered scene before all four images had decoded. The Adventure Gate and other destinations now use positions measured from the city layer. The scene holds the source aspect ratio, caps the prototype at its display geometry, and uses extra width only for layers that move.

The static panorama stays visible and clickable until all four layers decode successfully and match the source geometry. The layered scene retains the current pan position on activation. A missing or differently sized image keeps the static scene. The sky drift is disabled when reduced motion is requested.

## Local verification

Copy the four `nq-overlook-*-v2.webp` files from the owner-reviewed `NoteQuest_Layered_Village_v2_Prototype.zip` into a local checkout's `assets/` directory. The prototype images are distributed separately from this code branch.

- `node tests/city_parallax_node.cjs` — 10/10, exit 0.
- `python tests/browser/city_parallax_test.py` — 8/8, exit 0 in Linux headless Chromium 153. Tests cover 390×844, 820×1180, 1366×900 and 2560×1440, plus reduced motion, late decode, missing asset and mismatched geometry.
- `python tests/browser/launch_menu_test.py` — the app launch and village regression runs with the prototype loaded. In the local sandbox, Chromium is relaunched per context to work around its single-process constraint.

The existing art remains a prototype. Its intrinsic dimensions and CSS display size do not certify high-DPI sharpness or visual acceptance. The prototype still uses one gently drifting sky painting. Independent cloud layers and a final frame on actual devices remain open under #115. No new artwork, engine rules, or saves are part of this patch.
