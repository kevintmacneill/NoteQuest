# Avatar hair repaint brief v1 (Claude, 2026-11-27)

**Owner decision (Kevin, 2026-11-27 18:13 PT):** "I think we are going to have to repaint them." Kevin rejected all three standing brown ponytail fits: this morning's batch, ChatGPT's Studio fit, and Claude's uniform-scale fit of the original painting. His reasons (18:16): **"It was lopsided, it didn't sit right on the ears, just looked weird."**

This supersedes the "no redraws" constraint in `AVATAR_HAIR_REGISTRATION_STUDIO_v1.md` **for hair paintings only**. The approved body plates, the eight approved colors, the pink ponytail and braid bows and the twelve approved style designs stay. Fitting existing paintings stops; refits of the ponytail are no longer the path.

## Why fitting could not work (Claude's diagnosis, private files checked)
- The approved paintings are standalone hair sheets (three angles per color), painted without this body. Their hairline, temples and ear openings belong to a different head.
- The standing ponytail's starting image had already been stretched about 27% wider than the approved painting (aspect 1.145 vs 0.905). The Studio fit compressed it further (`sx` 0.93, `sy` 0.86), so its targets were placed by eye up to 24 px from the body landmarks.
- Even with no distortion at all (uniform scale 1.05, no warp), the painting is lopsided on this head:
  - left/right reach from the centerline differs by 64%;
  - the ears are treated differently (58% vs 19% covered);
  - one eyebrow is 88% covered.

  Position and gentle bending can't fix a painted asymmetry.

## Workflow (approved by Kevin with the ponytail, 2026-11-27 19:09 PT)
The first approved style was made this way; use it for the rest. Paint-on-template with standalone transparent hair failed in practice (regular chat draws standalone art at the wrong size), and erasing or masking a painting is banned (item 9).
1. **ChatGPT (regular chat) paints onto the child.** Attach the exact plain plate (`plates/<pose>/<body>/skin-2.png` from the kit) plus a reference for the style. Ask it to *edit that picture*: paint the hairstyle onto the child and return the **whole picture**, at the same size and framing, without moving or resizing the child. Use a fresh chat per style, so earlier attempts don't steer it. Its redrawn face and body don't matter, because they are discarded.
2. **Claude extracts:** `tools/extract_painted_hair.py` from the private **Hair Repaint Kit v2.1** (`NoteQuest_Hair_Repaint_Kit_v2_1.zip`, SHA-256 `3e455ae6606117b3c480af176c99cc75edb8c8f11e2becf0887b8acf2a91df46`; it supersedes v2 `be8d112c…f9dc`). Use only single full-frame pictures; side-by-side sheets can't be aligned. Flags: `--back-below-ear` for styles whose tail hangs behind the head (not Braids); `--max-y 720` for long styles; `--behind-body` (still experimental) for hair that passes behind the arms. It:
   - aligns the whole picture to the exact plate with **one** similarity transform from body features below the hair; it refuses if there are fewer than 20 matches or the median error is ≥ 2.5 px. The hair is never moved relative to the head it was painted on;
   - separates the hair and bow from the redrawn child by comparing with the exact plate;
   - splits front/back (hair groups starting below the ear tops are `back`);
   - shifts the non-bow hair median to the authorized brown (Lab [23.37, 17.10, 24.47]);
   - anti-aliases the hairline over skin.

   For the approved ponytail it reproduces both outputs byte for byte (with `--no-scalp-fill --straight-warp`, the behavior it was made with).
3. **Checks:** `hair_balance.py` and the unmodified `hair_check.py` must both pass.
4. **Review:** Claude's sheet (light and dark backgrounds, both ears, each layer alone, and a side-by-side with the approved design and the most similar style), then **Kevin's approval**.

## The rule that replaces fitting
**Paint each hairstyle directly on the exact approved plate, at 1024 × 1024, for each pose.** Use the private **Hair Repaint Kit** (`NoteQuest_Hair_Repaint_Kit.zip`, SHA-256 `c19e83d3cd00a6c29dfd3588569ec4e597b5c962691e21415ec7c550158039d0`, from Claude via Kevin). It has the six exact plates and scalp masks (the same hashes as the Studio handoff), six paint-on templates with guides, the six landmark maps, and `tools/hair_balance.py`. Nothing is resized, stretched, warped or moved after painting.

## What every painting must do
1. **Balanced on the head (front and wave poses).** Volume is even about the head centerline: left/right reach at temple, ear and jaw height within 10%. The part, crown and any bow sit on the centerline (a side part needs Kevin's explicit approval per style). No style is side-swept unless Kevin approves that style's sketch first.
2. **Sits right on the ears.** Each style declares one ear treatment, and both ears follow it:
   - **visible:** hair passes above and behind both ears;
   - **tucked:** hair rests on top of both ears, the lobe showing;
   - **covered:** hair falls over both ears.

   Ear coverage left vs right is within 15 points. Hair meets the head at the ear root on both sides, with no floating gap and no hair cutting through the ear.
3. **Face and eyebrows clear.** The green zone on the template (from just above the eyebrows to the chin) is ≤ 3% covered, and each eyebrow is ≤ 25% covered. Bangs that cover the brows need Kevin's approval for that style.
4. **Scalp covered.** The red zone is fully covered (front + back), with 0 failures from the unmodified `hair_check.py` (`d2187804…b3d3`) and no straight cut edges or gaps.
5. **Two layers.**
   - `front`: everything in front of the face, head and ears.
   - `back`: everything behind the head, neck and shoulders, such as the ponytail tail when it falls behind, or long hair behind the shoulders.

   Both are transparent 1024 RGBA PNGs in the existing naming (`hc-<color>.front.png` / `.back.png`).
6. **Same design across poses.** Wave matches front. Walk is the same hairstyle turned three-quarters with the plate's head: the near ear follows the style's ear treatment, and the far ear is hidden.
7. **Same design across colors.** Paint medium brown first. Other colors are the same painting recolored to the approved palette (shapes identical); bows keep their approved pink.
8. **Keep the approved design** (added 18:55 after Kevin returned repaints 1 and 2). A repaint must still read as its approved style at a glance, and must not look like another of the 12 styles. Repaint 1 of the ponytail fit perfectly but read as Long Hair with a bow; repaint 2 read as a top bun. For each style, compare the candidate side by side with its approved design sheet **and** with the most similar other style before asking for review.
9. **Paint, don't edit.** Each layer is a fresh painting. Never erase, mask, trim or cut a previous painting to change its shape. Strand ends must have natural tips and soft edges. A shape outlined by a mask (strands ending abruptly along a smooth curve) is a cut, even when `hair_check` passes.

## Order and gates
1. Girl ponytail, medium brown, standing front. Paint on `girl-front-template.png`, then run both checks, then Claude's independent review, then **Kevin's visual approval**. Nothing else starts until Kevin approves.
2. Then the other 11 styles, standing front, medium brown, one at a time, each approved by Kevin.
3. Then wave, then walk (all 12 each).
4. Then the seven other colors.

`hair_balance.py` must PASS before Claude or Kevin is asked to look. Its limits are drafts. Kevin can loosen or tighten any of them, and a style can get a recorded exception only from Kevin.

## Who does what
- **Painting:** ChatGPT (image generation) on the templates, or another tool Kevin chooses. Claude can't generate paintings.
- **Checks and review:** Claude runs `hair_check.py` and `hair_balance.py` on the exact PNGs, makes composites and ear close-ups, and reports to Kevin.
- **Approval:** Kevin only.
- **Held:** #166, #175 fitting work, runtime publication, and Braids and later styles, until the ponytail is approved.
