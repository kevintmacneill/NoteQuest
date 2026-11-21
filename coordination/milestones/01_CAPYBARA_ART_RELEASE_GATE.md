# Milestone 1/10 — Capybara v0.4 source-of-truth and art review package

**Date:** 2026-11-20 · **Owner:** ChatGPT (art) · **Status:** REVIEWABLE DESIGN, NOT APPROVED PRODUCTION RASTER

## Immutable owner visual requirements
- **No scarf, bandana, collar, neckwear, logo jewelry or costumes** on any capybara variant. The light tan/cream region on the neck and upper chest is **natural fur**, with irregular strand edges and continuity into the body. Target base #EACD96; painted highlights/occlusion stay species-coherent.
- Recognizable species profile: blunt muzzle, round high ears, stout body, small tail not visible; eyes scaled appropriately by stage. The reference stock capybara is generic style inspiration only—no copying.
- **Egg, Baby, Adolescent, Adult, Sleeping, Sick, Tired, Excited, Dirty, Bath Time** are ten distinct presentations; egg is magical fiction for mammals, not biology.
- Baby defaults to open round neutral-happy eyes, Excited has open sparkly eyes and lifted pose, Tired has heavy eyelids and yawn, Sleeping curls peacefully, Sick sits/leans with gentle olive-green cheek tint and different mauve blanket, never a frightening/graphic illness.
- Distinct **Bath Time** (pet washing) and **Clean Pen** (habitat poop/cleanup). Never remove pet grime by scooping a pen or remove mess by bathing an animal.
- Capybara footprints have **4 slightly webbed front toes** and **3 hind toes**, separated impressions, modest sole shape, not dog/cat-style big round pads.

## Source inventory and evidence
| Artifact | Actual status | Use |
|---|---|---|
| [Painted v0.2 concept](../design/assets/capybara-character-sheet-v0.2.webp) | Committed, reviewed as concept by Claude | Visual reference, not source layers |
| [v0.4 layer study](../design/assets/capybara-layer-study-v0.4.svg) | Committed construction study | Shape/ruff/pivot reference |
| [v0.4 footprint study](../design/assets/capybara-tracks-v0.4.svg) | Committed source illustration | Review toe count, isolate from character sprites |
| [v0.4 source manifest](../design/assets/capybara-asset-manifest-v0.4.json) | Committed declared layer plan | Not proof sprites exist |
| **Painted scarf-free v0.4 concept bitmap** | Generated in conversation; **not committed to GitHub** | Needs user/author upload before Claude can inspect it |
| Painted transparent rig sprites, full 10 poses | Not produced | Requires original exports and independent review |

### Manual export acceptance: 12 independent checks
1. No costume, including on bath/pen panels.
2. Natural tan fur visible from baby through adult, not rigid bib/bandana.
3. Baby neutral open eyes.
4. Excited distinguished by face **and** silhouette.
5. Sleeping and Sick distinct when labels, blankets and color are hidden.
6. Sick expression calm and non-punitive; subtle olive cast only.
7. Front footprint shows 4 separated blunt digits; hind shows 3.
8. No paw print borrowed from cat or dog.
9. Animal and habitat hygiene separate.
10. No baked game labels, logo, text or background on final transparent sprites.
11. At 512, 256, 120 and 64 px, key expressions remain readable.
12. All production assets have documented authorship, pivots and neutral fallback.

**Release gate:** This commit specifies a real artwork review. It does **not** claim all ten production-state bitmap exports or the uncommitted generated artwork exist in the repository. Claude review must use actual image pixels after a separate upload.
