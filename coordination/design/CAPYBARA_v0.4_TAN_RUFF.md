# Capybara v0.4 — Natural tan ruff, no costume
**Date:** 2026-11-20 · **Owner direction:** Remove scarf/bandana entirely and restore lighter tan chest/neck fur · **Status:** design revision and source-layer study, not production approval.

## Changed by owner
- **No neck clothing:** no scarf, bandana, collar or detachable neck accessory in any stage or condition, including clean-pen and bath scenes.
- **Natural tan fur:** chest and neck ruff are a lighter warm cream/tan (#EACD96) integrated into the body silhouette, with paint-like edge variation and hair strands. This is part of anatomy/coat, **not** apparel.
- Preserve baby **open, round eyes**, excited wide bright eyes, tired droopy-lid yawn, sick subtle gentle olive-green hue and a separate upright pose, sleeping curled.
- Keep Bath Time (wash animal) and Clean Pen (remove mess from habitat) entirely distinct.
- Paw reference: capybaras have 4 front and 3 hind toes with slight webbing; use original separated-toe tracks, not a dog/cat paw pad. Source check: [San Diego Zoo](https://animals.sandiegozoo.org/animals/capybara).

## Deliverables in this commit
- [Original layered SVG prototype](assets/capybara-layer-study-v0.4.svg): groups for body, neck ruff, head, limbs, eyes and optional props. **A construction study, not the finished raster rig.**
- [Capybara footprint SVG v0.4](assets/capybara-tracks-v0.4.svg): revised separated four-front/three-hind toe impressions, small sole, no huge pad.
- [Artist manifest](assets/capybara-asset-manifest-v0.4.json): candidate layers, palettes, asset naming, and ten-state acceptance inventory.

## Actual painted v0.4 character-sheet preview
A new rendered concept image **was generated during the active ChatGPT conversation**, showing all ten presentations with a tan neck ruff and no scarf. It is provided to the owner as a downloadable image in that conversation. **Its binary is not contained in this GitHub commit.** Do not claim that the painted sheet or ten transparent raster animations are deployed. Publishing the actual bitmap and separated painted production assets remains an outstanding upload/export step.

## Production acceptance criteria
1. Original full-res painted art in the GitHub `assets/` directory, lazy-loaded with a neutral fallback.
2. No baked-in text, logos, apparel, or incorrect tracks.
3. Ten visual states per species (egg, baby, adolescent, adult, sleeping, sick, tired, excited, dirty, bath); independent pen-cleanup scene.
4. Each body part/layer individually exportable, predictable pivots and baseline, transparent edges, optimized WebP or PNG as needed. This SVG is a *design guide*, not a substitute for painted layer exports.
5. Validate at 512, 256, 120 and 64 pixels; Claude can review art direction when the full raster is actually accessible in GitHub.

**Engineering boundary:** coordination/design assets only; no engine or UI changes in this commit.
