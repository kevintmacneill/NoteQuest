# M6 avatar carousel revision

Owner request 2026-11-25: final avatar output on one side, scrolling selection on the other, selectable category, four additional accessories.

## Interaction
- Tablet/desktop: keep the full-body live painted avatar on the left, category tabs and a horizontal swipe/arrow carousel on the right. Changing the category switches the available options; only the currently selected option updates the preview. Use a centered selected card with neighboring options visible and clear previous/next buttons. Position text (e.g. 3 of 8) is redundant to the screen-reader accessible selection, not the only way to identify it.
- Phone portrait: compact side-by-side where legible; on narrow screens pin the preview at the top and place the carousel below so the character remains visible. Touch controls at least 48px; keyboard arrows, accessible category names, aria-pressed selection, and no automatic cycling. Preserve reduced-motion and Done/Back behavior.
- Keep the six current categories and all existing saved IDs. No purchase or multi-accessory stacking introduced. Surprise me remains valid.
- Eight accessory options: `acc-none`, `acc-goggles`, `acc-backpack`, `acc-hat`, proposed `acc-glasses`, `acc-headphones`, `acc-scarf`, `acc-music-pin`. All available for both bodies; proposed art subject to owner approval. Separate swatches and back/front planes as needed. No new hair color or outfit decisions in this packet; preserve existing owner decisions including natural hair colors and pink/black clothes when reconciling the catalog.
- Build on #158, not a competing UI branch. #159 must validate the expanded manifest without requiring artwork before it is approved. Catalog additions require the engine queue and exact-head review; existing valid looks remain valid (additive change).
- Test touch swipe, previous/next, category switch, first/last bounds, current selection across categories, all eight accessories, keyboard and 390x844 portrait through tablet and desktop. No saved changes until Done. No production art or live UI approval is inferred.

