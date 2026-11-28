# Avatar recolor plan v2 (Claude, 2026-11-28)

**Supersedes [v1](AVATAR_RECOLOR_PLAN_v1.md).** v2 answers ChatGPT's review of v1 ("Changes needed", shared by Kevin at 08:22 PT on 2026-11-28; see [the reply message](../messages/2026-11-28-0845-claude-to-chatgpt-grok-recolor-plan-v2.md)). It also accounts for the hair colors, which were finished overnight.

**Owner decisions:**
- **Recoloring approved** (Kevin, 2026-11-27 22:59 PT). Claude recolors approved art where only the color changes. ChatGPT or Grok approves Claude's recolors before Kevin sees them.
- **All hair colors approved** (Kevin, 2026-11-28 06:31 PT). 288 sets; hashes in `AVATAR_HAIR_COLORS_MANIFEST_2026-11-28.json`.

**ChatGPT's verdict on v1:**
- **Approved:** the recoloring strategy, the work split and the independent review process.
- **Go ahead:** R0 setup.
- **Changes requested:** the technical plan, which v2 fixes.
- **Not yet reviewed:** the script.
- **Not yet approved:** any production art.
- **Held:** runtime publication.

## 1. What's left

| Category | Recolored by Claude | Painted by ChatGPT | Status |
|---|---|---|---|
| Hair colors | 252 (plus 36 brown, cleaned) | 0 | **Done**, approved 06:31 |
| Skin tones 1, 3, 4, 5, 6 | 30 | 0 | R2 |
| Eye colors (7 non-brown) | 42 iris layers | 0 | R3 |
| Village outfit colors | 42 | 6 (teal recommended) | R5 |
| Goggle lenses | 42 | 6 | R5 |
| Activity outfits (6 styles) | 252 | 36 | R5 |
| Accessories | 0 | 36 | ChatGPT |
| **Left to do** | **408** | **84** | |

If brows follow hair color (question 2 in section 6), that adds **48 brow layers** (8 colors × 6 plates).

## 2. Tools: use the hair method that was just approved
The overnight hair redo already has an approved method and tools in the private package `NoteQuest_Hair_All_Colours_Redo.zip` (`0dd0a6ad…e9`): `clean.py` `5a61657e…`, `recolor.py` `d56ae34e…`, `verify.py` `e0413ee0…`.

The method:
- References cut from Kevin's approved painted color sheets.
- Lightness mapped by quantile into each color's painted range, with capped contrast.
- Hue and saturation taken from the painting at that lightness, plus each pixel's own texture.
- Shape identical, and bows untouched.

**v2 extends those tools to skin, eyes and outfits** instead of starting over from the v1 preview script. One method across all categories means the colors behave the same way everywhere.

## 3. Changes for ChatGPT's 7 findings

**F1. Cross-pose color consistency (High).** Calibration is **shared**, not computed per image:
- **Each skin tone:** one calibration from all 6 plates together, both bodies and all 3 poses, so the boy and girl match too.
- **Each eye color:** one calibration per color across all 6 iris masks.
- **Each outfit or goggles color:** one calibration per garment across its 3 poses.

Lighting differences that were painted on purpose, such as a turned-away cheek in the walk pose, carry over because they are in the source.

**Gate:** the spread across poses for the same item and color is at most ΔE76 6, the limit the hair met. Anything over 4 is listed on the review sheet.

**F2. Front and back layers (High).** Any item with `.front` and `.back` files (backpack, hoods, the scarf if split) is calibrated as one item, on the pixels of both layers together. Review sheets show the **assembled** look on the plate, not just the separate layers. The approved hair already met this: one calibration per style, shape identical.

**F3. Region masks (High).** Each category gets a **protection mask**, and the protected pixels stay **byte-identical** to the approved source, anti-aliased edges included. The protection mask is grown 1 px into the recolored area, and that boundary row is blended, never recolored outright.

| Category | Protected (never recolored) |
|---|---|
| Skin plates | eye whites, irises, pupils, eye shine, lashes, teeth and mouth interior, and the brows if they follow hair |
| Iris layers | pupil and shine (kept from the plate, drawn on top) |
| Hair (done) | pink bows and accents (already byte-identical in the approved set) |
| Outfits | zippers, pulls, prints (music-note tee), trims and laces not in the garment color |
| Goggles | frames and strap; only the lens is recolored |
| Accessories | all of them (painted, never recolored) |

An automated check confirms 0 changed bytes inside every protection mask.

**F4. Eye layers (High).**
- **Canonical iris masks:** Claude draws one iris mask per body and pose (6 total). ChatGPT or Grok reviews them, and **Kevin approves them before any eye color is made**. All 7 colors use exactly that mask, so every new iris layer has the same alpha.
- **Layering:** brown stays in the plate. A new color is a fully opaque layer over the iris mask, with the pupil and shine from the plate composited back on top.
- **No bleed-through:** after compositing, 0 pixels inside the iris mask may match the brown iris's colors. Each sheet shows the edge at 4× magnification.

**F5. Detail preservation (Medium).** Replaces v1's single 80% check:
- **Tile check:** the image is split into 8×8 px tiles. In every tile the lightness variation must be at least 60% of the source's, and the whole region at least 80%. Failing tiles are outlined on the sheet.
- **Clipping:** the share of pixels at L* ≥ 97 or ≤ 3 may grow by no more than 0.5 percentage points over the source. This catches platinum blowing out and black crushing.
- **Fine detail:** for skin, freckle and blush contrast is kept at 70% or more; for cloth, fold contrast likewise.
- **Magnified pairs:** every review sheet has 3×–4× before-and-after crops of the face, hairline and eyes, the hands, and garment folds.

**F6. Reproducibility (Medium).** A manifest is written next to every batch, `coordination/design/AVATAR_<CATEGORY>_MANIFEST_<date>.json`. Each output records:
- the approved source hash;
- the protection-mask and region-mask hashes;
- the exact ramp or reference values and their hash;
- the hash and version of the script;
- the Python, NumPy, scikit-image and Pillow versions;
- the output hash.

From that, any approved color can be rebuilt without relying on a chat. The hair manifest from 06:31 records output hashes only, so Claude will add the missing fields from the redo package when R0 starts.

**F7. Publication (High).** **Approving a recolor does not authorize runtime publication, and it does not release any hold.** #166, #175 and publication stay held until Kevin gives a separate, explicit go-ahead. This matches the 06:31 STATUS line. v1's wording about publishing with `--partial` after #166 merges is withdrawn.

## 4. Order (R0 to R5, approved by ChatGPT) with the expanded test

**R0 Setup:**
- **Kevin attaches** `NoteQuest_Hair_All_Colours_Redo.zip` (`0dd0a6ad…`) and the plates zip, `NoteQuest_New_Base_Poses_Candidate.zip` (`df204fb8…`, unless the plates are already in the redo package), plus the skin-tone study pictures and the 11-26 eye palette.
- **Claude:**
  - draws the 6 skin protection masks and the 6 canonical iris masks;
  - extends the hair tools to skin and eyes;
  - completes the hair manifest fields.
- **ChatGPT or Grok** reviews the tools and masks. **Kevin** approves the iris masks.

**R1 Expanded test** (ChatGPT's request):
- **Skin:** lightest (1) and darkest (6), on **both bodies in all 3 poses**, so 12 plates.
- **Eyes:** hazel and blue on all 12.
- **Hair:** the approved platinum and black hair composited on all 12 (no new hair).
- **Outfit:** black is added once the first outfit color is painted and approved.
- **Review:** ChatGPT or Grok, then Kevin.

**R2 Skin tones:** the remaining 3 tones (3, 4, 5) × 6 plates, since R1 already makes tones 1 and 6. One sheet per tone, showing all 12 hairstyles.

**R3 Eye colors:** the remaining 5 colors, with hazel and blue from R1. One sheet per color, on all 6 skins.

**R4 Hair:** done.

**R5 Outfits:**
- After ChatGPT paints the first village outfit color (6) and goggles (6) and Kevin approves them: 42 outfit recolors and 42 lens recolors.
- Activity outfits follow the same pattern as each style's first color is approved.

## 5. Review flow (unchanged except F7)
1. Claude makes the batch, privately, with its manifest and sheets.
2. ChatGPT or Grok reviews the tools once (and again after any change) and each batch, and records approval in coordination.
3. Kevin approves one sheet per color.
4. Claude records it in DECISIONS with hashes.
5. Art stays private. Publication is a separate Kevin decision (F7).

A single image that looks wrong can be hand-fixed by ChatGPT. The fixed image is then checked like a painting.

## 6. Questions for Kevin (with ChatGPT's recommendations, which are not decisions)

| # | Question | ChatGPT recommends | Claude recommends |
|---|---|---|---|
| 1 | Color targets | sample from approved artwork | same: it is what the hair redo did |
| 2 | Brows | follow the hair color, a slightly darker shade | follow hair (+48 small brow layers). Brows are in the plate now, so this needs a brow mask per plate |
| 3 | First painted outfit color | teal for both bodies | teal for both (the original color; pink and the others are recolored from it) |
| 4 | Hair: an after-the-fact review? | — | The 06:31 hair approval records Kevin's approval but no ChatGPT or Grok review. Kevin's 22:59 rule asks for one. Should ChatGPT or Grok review the hair manifest and package after the fact, or does Kevin's direct approval stand? |
