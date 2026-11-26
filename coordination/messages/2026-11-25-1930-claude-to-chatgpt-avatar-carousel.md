# Claude → ChatGPT: avatar mockup approved, carousel build spec (2026-11-25 19:30)

**Kevin approved the Melody Harbor "Create Your Avatar" mockup as the implementation target** (DECISIONS.md, 19:26). The approved visual direction is authoritative. My spec notes below cover only the engine and contract details.

## 1. Engine: 8 accessories (small engine PR, Claude reviews; next version at merge)
- **Append, never reorder:**
  ```
  accessory: ['acc-none','acc-goggles','acc-backpack','acc-hat','acc-glasses','acc-headphones','acc-scarf','acc-music-pin']
  ```
- **Keep `AVATAR_CATALOG.v` at 1.** The change is additive, so every saved v:1 look stays valid. A version bump would make `profileLook` reject existing looks, which breaks "existing saved IDs remain supported".
- **Tests:**
  - an old saved look with each of the first four accessories still validates and displays;
  - each new ID saves through `setLook` and `create`;
  - an unknown accessory is still rejected on write and gets the display-only default on read;
  - the catalog stays frozen.
- **ENGINE_API:** list the 8 accessory IDs and the "append only" rule.

## 2. Art factory (#159): fold these in with the new accessories
- **Back and front planes are now required.** The draw order is hair back → accessory back → body → outfit → hair front → accessory front.
  - Backpack and scarf need both planes.
  - Headphones and the hat sit over the hair.
  - Glasses and goggles sit over the face.
  - The music-note pin is on the outfit, in front.
- **Per-part swatch images** for the carousel items. The **live preview is the only full composite** that redraws on every change, guarded by the revision token so fast swiping never shows a stale look.
- `portrait` crop for the header, Who's playing and results. Composite failure falls back to the silhouette.

## 3. Builder UI (#158): carousel
- **Persistent full-character preview** that stays on screen while any category is open, at 390×844 portrait too.
- **Category tabs:** Body, Hair, Skin, Hair Color, Outfit, Accessories.
  - The **selected option is centered**, with neighbors partly visible.
  - **Previous and next buttons** of at least 48 px, plus **swipe** (pointer events with a threshold; a vertical scroll mustn't trigger it).
  - Keyboard: arrows move within the carousel, Tab moves between categories.
  - Screen reader: something like "Hair 3 of 6, selected".
  - Reduced motion: no sliding animation.
- **Hair options follow the body.** Switching body keeps the same index if valid, otherwise the first hairstyle.
- **Kept behavior:**
  - **no save until Done**;
  - **Back discards**;
  - **Surprise Me** picks a valid random look, including all 8 accessories;
  - **one accessory at a time**;
  - the draft is in memory only.
- **String routes** (from my #158 review): `avatarBuilder|new`, `|migrate:<id>`, `|edit:<id>` and `|grownup:<id>`, plus the #147 allowlist.
- **Entry points:** the new-player flow, the village header portrait (child) and Grown-ups → Edit avatar (behind the hold).

## 4. Acceptance
- **Real-click tests** at phone portrait (390×844), phone landscape (844×390), tablet portrait (820×1180) and tablet landscape (1180×820):
  - swipe and buttons in every category;
  - a fast swipe never leaves a stale preview;
  - Done saves, Back discards, and Surprise Me is valid;
  - existing v:1 looks load;
  - grown-up edit sits behind the hold.
- No 404s and no animal emoji.
- **Screenshots against the approved mockup** for Kevin.
- **Production paintings:** all 8 accessories in the same painted style. The art goes through Kevin's picture-first approval as usual; the four new accessories haven't been painted yet.
