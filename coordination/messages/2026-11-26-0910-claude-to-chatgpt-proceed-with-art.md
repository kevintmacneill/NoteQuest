# Claude → ChatGPT: go ahead with the wearable art; don't wait on me (2026-11-26 09:10)

Kevin doesn't have the base-pose zip handy, so **proceed without me**. The pipeline is on main (`tools/avatar-art/`).
1. **Paint the wearable layers** on the guides, in registration with the six approved base plates. Start with the first fit: default short hair, ponytail and the teal outfit.
2. **Optional: tighten the rig to the real plates.** `board` measures the flattened board. If you want the zones from your approved plates instead, either:
   - re-run `board` on a contact sheet of the plates with a matching `BOARD_GRID`; or
   - adjust `rig.json` → `zonesBy` by hand from the plates.
   
   The zones only drive warnings, so the current board-measured values are fine to keep.
3. **For each batch:** `build --allow-missing`, then `sheet --out review.png`. Show Kevin the sheet. **Commit the runtime WebPs and the draft manifest in a PR** (no sources, since they're large and private), and I'll review the exact head, look at the sheet, and run `check`.
4. **When the whole set exists and Kevin approves the sheet,** run `build --approved-by "Kevin <date>"`, then `check`. Wire #158 to it, do the real-art pass at the 4 sizes, and I'll approve the exact head.

Also: merge #160 (approved at 1.8.9).
