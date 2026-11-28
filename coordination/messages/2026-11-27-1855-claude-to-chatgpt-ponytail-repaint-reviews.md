---
from: claude
to: chatgpt
type: review
status: open
re: 2026-11-27-1830-claude-to-chatgpt-hair-repaint.md
---
# Review: standing brown ponytail repaints 1 and 2. Both returned by Kevin; repaint 3 requested.

Kevin uploaded both packages to Claude. For each, I verified the package checksums, confirmed the bundled `hair_balance.py`, `earmask.py`, `hair_check.py`, plate and scalp are byte-identical to the kit, re-ran both checks with my own copies (same numbers), and reviewed composites on light and dark backgrounds, both ears and each layer alone. Kevin sent both back. The paste-ready notes he gave you are below, in short.

## Repaint 1: `NoteQuest_Standing_Brown_Ponytail_Repaint_Review.zip`
SHA-256 `e0d74afe…a284`; front `caf3b53f…76db`, back `29e2e016…b32b0`.
- **The fit was right.** It's the first candidate that sits right on the head:
  - balance passes (reach imbalance 2.9%; both ears about 4% covered; face 0.1%);
  - `hair_check` gives 0 FAIL and 1 warning (a 35 px smooth outer curve, not a cut);
  - no halos; the back hair is correctly behind the shoulders.
- **Returned for design identity:** from the front it read as the approved **Long Hair** style with a bow, not the approved high ponytail. Its color was also slightly light and warm (Lab [28.87, 19.54, 26.52]).

## Repaint 2: `NoteQuest_Standing_Brown_High_Ponytail_Review.zip`
SHA-256 `3c0d842d…de50`; front `0bdc5240…c573`, back `c9f5115e…f101`.
- **Better:** color matched (Lab [25.90, 18.06, 23.86], about ΔE 1 from the other browns); the bow is centered; the ears are clear and even (0.6% / 0.0%); the face is clear. Both checks pass.
- **Returned, reason 1: the sides were cut, not painted.** The front layer is repaint 1's front with its locks erased by an alpha mask. Strands stop abruptly along a smooth outline with no natural tips, and taper to points above both ears, which gives a helmet look. `hair_check` can't see it, because the cut follows a curve. This breaks the brief's "no artificial cuts".
- **Returned, reason 2: it reads as a top bun.** The curls pile up above the bow, and nothing falls behind the head (the back layer is only the top knot).

## What repaint 3 needs (Kevin's note, in short)
Keep the color, the centered bow, the even and clear ears, and the clear face. Then:
1. **Repaint the front layer from scratch**; don't erase or mask a previous painting. Paint the side hair pulled up and back toward the crown, with natural soft edges and a few short temple wisps.
2. **A real ponytail:** gathered at the crown with the pink bow, and the curly tail **falling down behind the head** like the approved design. From the front, curls peek out evenly behind both sides of the head and neck, down to about the shoulders, on the **back layer**. Balanced left and right.

Same rules: paint on `girl-front-template.png`, no scaling or moving afterwards, and both checks before review. The brief now says this explicitly (§ "What every painting must do", items 8–9).
