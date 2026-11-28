# Avatar recolor plan v1 (Claude, 2026-11-27)

**Owner decision (Kevin, 2026-11-27 22:59 PT):** "I approve the recoloring decision. Yes, if claude does the recoloring, chatgpt or grok had to approve." See DECISIONS 2026-11-27. Where only the color changes, Claude recolors approved art. Where the shape changes, ChatGPT paints. This replaces the "no recoloring" part of the 2026-11-26 10:35 decision. Approved plates and approved geometry, the pink bows and the order rules all stay.

## What gets recolored and what gets painted

| Category | Source (approved art) | Recolored outputs | Still painted |
|---|---|---|---|
| Skin tones 1, 3, 4, 5, 6 | the 6 approved skin-2 plates | 5 × 6 = **30** | — |
| Eye colors (7; brown is already in the plates) | the plates' own brown irises | 7 × 6 = **42** iris layers | — |
| Hair colors (7 other than medium brown) | the 36 approved medium-brown sets | 7 × 36 = **252** sets | — |
| Village outfit colors | one approved painted color per body and pose | 7 × 6 = **42** | **6** (one color, both bodies, 3 poses) |
| Goggle lenses | one approved painted goggles per body and pose | 7 × 6 = **42** | **6** |
| Activity outfits (6 styles besides village) | one approved painted color per style, body and pose | 6 × 7 × 6 = **252** | **36** |
| Accessories (glasses, headphones, scarf, music pin, hat, backpack) | — | — | **36** |
| **Total** | | **≈660** | **≈84** |

Six = 2 bodies × 3 poses (standing, wave, walk). Some items have a `.front` and a `.back` file. The counts are looks, not files. Any new hairstyle, garment style or pose is painted, never recolored: the rejected 19:58 wave batch showed that moving art between poses doesn't work.

## How the recolor works
- **Method:** a lightness-anchored gradient map in Lab color space (`recolor.py`, Claude). The region's own 2nd, 50th and 98th percentile lightness are pinned to the target ramp's shadow, middle and highlight. Each target color is a 5-stop ramp. Painted shading, strand detail, folds, freckles and blush carry over. A set share of the source's local color variation is kept (`keep_var`: skin 0.35, hair 0.15, cloth 0.10).
- **Never changed:** shape, alpha, canvas size and position. Every output's alpha channel must be **byte-identical** to its source's, which is checked automatically. All fits, scalp coverage and ear checks therefore stay valid without re-fitting.
- **Deterministic:** the same input, ramp and script version give the same bytes. Each output's SHA-256 is recorded next to its source hash, ramp ID and script hash.
- **Target colors come from approved pictures, not invented values:**
  - **Hair:** each style's 11-26 approved 8-color sheet, e.g. Shaggy `86d2dede…`.
  - **Eyes:** the 11-26 eye palette.
  - **Skin:** the skin-tone study pictures, which were approved as palette references only.
  - **Outfits:** the 8 catalog colors.

  Claude samples ramps from those pictures and shows them as swatch strips for approval before any batch.
- **Region masks, drawn once per plate (6 total), reviewed like any other art:**
  - **Skin plate:** skin to recolor; eye whites, irises, lashes, mouth interior and teeth kept as painted. Brows and outlines follow the skin ramp, which runs darker past the shadow end, so line art stays dark.
  - **Iris:** used for eye colors. Hazel and other two-tone colors blend from inner to outer by distance from the pupil.
  - **Hair:** bows and other pink accents masked out and kept pink, per the 09:08 decision.
  - **Outfit:** zippers, prints and trims that aren't the garment color are masked out.
- **Touch-ups:** if one recolor looks wrong in one spot, ChatGPT may hand-fix that one image only, painting on the recolor without changing the shape. The fixed image is checked and approved like a painting.

## Checks on every output (before anyone is asked to look)
1. Alpha byte-identical to the source; same canvas and registration.
2. No changed pixels outside the region mask (bow, eyes, prints).
3. Detail kept: local lightness variation in the region is at least 80% of the source's. This catches flat or blown-out results such as platinum highlights clipping to white or black hair losing strands.
4. **Composites:**
   - hair and eyes on the lightest and darkest skin;
   - every new skin under all 12 approved hairstyles;
   - outfit colors against all 6 skin tones.
5. For hair: `hair_check.py` and `hair_balance.py` results unchanged from the medium-brown source (shape is identical, so this is a sanity check).

## Review and approval flow
1. Claude makes a batch, privately: outputs plus `SHA256SUMS.txt` and review sheets.
2. **ChatGPT or Grok** reviews the recolor script (once, and again after any change) and each batch's outputs, and records approval in coordination (Kevin's rule: Claude never reviews Claude).
3. **Kevin** approves visually, **one sheet per color** (for example "skin tone 5, all 6 plates" or "platinum, all 36 sets").
4. Claude records each approval in DECISIONS with exact hashes. The art stays private until publication. Each approved color is published with `--partial` after #166 merges; until then "coming soon" shows.

## Order
- **R0 Setup:**
  - Kevin attaches one zip: the 6 plates (`NoteQuest_New_Base_Poses_Candidate.zip` `df204fb8…`) and all 36 approved medium-brown hair sets (exact hashes in DECISIONS), plus the approved color sheets and skin-tone references.
  - Claude draws the 6 plates' region masks. ChatGPT or Grok reviews the script and masks.
- **R1 Test sheet (hardest cases):**
  - Standing girl: skin 6, hazel eyes, platinum hair (black outfit once an outfit exists on the new bases).
  - It calibrates the ramps. Kevin approves the look and the ramps.
  - A technique preview on the approved mockup girl is already done: `NoteQuest_Recolor_Preview_Hardest_Cases.png`, private, 23:05. It is not real art and not for approval.
- **R2 Skin tones:** 30 plates, one sheet per tone. Skin first, because every later check composites onto it.
- **R3 Eye colors:** 42 iris layers (`SRC/<pose>/<body>/eyes/<id>.png`, per the 06:40 spec), one sheet per color, shown on all skins.
- **R4 Hair colors:** 252 sets, one sheet per color (36 sets), shown on the lightest and darkest skin.
- **R5 Outfits:**
  - After ChatGPT paints and Kevin approves one village outfit color on the new bases: 42 recolors, plus 42 goggle lenses.
  - Activity outfits follow the same pattern as each style's first color is approved.

R2 to R4 need no new paintings, so they can run while ChatGPT paints the 6 village outfits and the 36 accessories.

## Questions for Kevin
1. **Color targets:** sample the ramps from the approved pictures (the 11-26 hair color sheets, eye palette and skin-tone studies)? Claude recommends yes, so every color is one you already approved.
2. **Brows:** follow the skin tone, the way they are painted into the plate, or follow the hair color, with lighter brows for blonde and platinum?
3. **First painted outfit color:** teal, the original color, or each body's default (girl pink, boy teal)?

## Who does what
- **Recoloring, masks, checks and sheets:** Claude.
- **Review of Claude's script and outputs:** ChatGPT or Grok.
- **Paintings** (6 village outfits, 6 goggles, 36 accessories, 36 activity outfits, any touch-ups): ChatGPT.
- **Approval:** Kevin only.
- **Held:** #166, #175 and runtime publication, as before.
