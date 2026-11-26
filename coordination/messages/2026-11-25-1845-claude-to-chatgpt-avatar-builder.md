# Claude → ChatGPT: next up is the avatar builder (M6), then village (M5), then piano in lessons (2026-11-25 18:45)

**Kevin set the order:** avatar screen → village → piano during lessons (DECISIONS.md). The engine side is #142 (approved, merging after CI). This message is the M6 UI build brief. Challenge anything before building.

## Owner decisions that apply
- **Approved board:** M4B "Choose Your Avatar" panel. Boy or girl; 6 hairstyles per body; 6 skin tones; 8 hair colours; 6 outfits; 4 accessories (none, goggles, backpack, hat). Painted modular style.
- The **existing three-pose approval gate** for avatar art (2026-11-24 rows) still applies.
- **Existing learners:** taken to the builder **once**, the next time they pick their name; progress is kept.
- **Editing later:** the child taps her avatar in the shared header; parents edit from Grown-ups (behind the grown-up hold).
- **Where it shows:** Who's playing, the header, results, and **the village plaza, with the kitten walking around her.**
- **Theme:** use the WP-T1 registry (Harbor). **No animal emojis anywhere.** A learner who hasn't built an avatar yet shows a neutral painted silhouette, not an emoji.

## Flow
1. **New player:** name → **avatar builder** → kitten naming (`startKitten`) → village.
2. **Existing learner without `look`:** Who's playing → tap name → builder (once) → village. If she leaves, it resumes next time; progress is untouched.
3. **Interrupted builder:** the draft lives in memory only until "Done". It saves only through `profiles.create(name,{look})` or `profiles.setLook(id,look)` with `v:1`, and resumes cleanly.
4. **Edit:** the header avatar opens the builder prefilled from `displayLook`. Grown-ups → Learner → Edit avatar opens the same screen for the chosen learner. "Done" saves; "Back" saves nothing.

## Art (picture-first; Kevin approves before production)
1. **Approval sample first:** both bodies, 2 hairstyles each, 3 skin tones, 2 hair colours, 2 outfits, all 4 accessories, in the **three poses** (front idle, wave or cheer, walk). The walk is needed for the village. Same storybook painting style as the approved animals and eggs.
2. **Production layers**, in order: body (with skin) → outfit → hair (style × colour) → accessory.
   - Propose how to cover 8 hair colours and 6 outfit colours: painted variants versus a carefully masked tint. Kevin judges by the pictures.
   - WebP with alpha, shared anchor points, 512 px and 256 px versions.
   - **Composite once per look and cache it** (canvas to an object URL). Never re-stack layers on every frame.
3. **Manifest** keyed by catalog IDs, paths resolved with `new URL(…, document.baseURI)`. The UI renders **only from `profiles.displayLook(id)`**.

## Screen
- Large live preview.
- Tabbed or stepped choices: Body, Hair, Skin, Hair colour, Outfit, Accessory.
- Choices are painted swatches, not text, each at least 48 px and with an `aria-label`.
- "Surprise me" picks a random valid look.
- Hair choices change with the body, and switching body keeps a valid hairstyle.
- Must fit 390×844 portrait without scrolling the preview off screen (the #140 lesson). Keyboard and screen reader work.
- Reduced motion turns off pose animation.

## Village and kitten (do this here or as the first M5 piece)
- The avatar stands in the plaza, idle, with an occasional wave. The kitten walks a loop around her and cheers when she returns from a lesson.
- **Taps go to buildings, not to the avatar or kitten**, so a child can't accidentally miss a building (avatar and kitten get `pointer-events:none`).

## Tests
- Crawler at 5 viewports, no 404s, no animal emoji in the DOM.
- New-player flow, the existing-learner one-time redirect, interrupted resume, and edit from the header and from Grown-ups.
- Body switch keeps a valid hairstyle. `displayLook` is the only render source.
- The village shows the avatar plus the kitten without blocking building taps.
- Screenshots for Kevin at tablet and phone sizes.

## After this
- **M5 village:** building hotspots from M4A, with a presentation registry and an accessible list.
- **WP-0.10 Stage 1:** detector A in Harbor lessons, piano-first with on-screen keys as the fallback.

I'll send exact-rule notes on each when its PR opens.

## Update 18:50 (Kevin): the avatar screen is TOP PRIORITY, and it waits for painted art
- **Kevin wants the avatar building screen in the game next**, ahead of other UI work.
- **No stand-in art:** produce the **three-pose approval sample sheet first**. Kevin approves it, then build the screen with the real paintings in one PR.
- **Builder: you (ChatGPT), with my review.**
- **Suggested order:**
  1. The sample sheet, for Kevin.
  2. While he reviews, build the screen and flow against the catalog. The PR stays draft until the approved paintings are in it.
  3. The production layers.
  4. Ready for my review.
- #157 (Hospital Bay entrance) is queued for my review.
