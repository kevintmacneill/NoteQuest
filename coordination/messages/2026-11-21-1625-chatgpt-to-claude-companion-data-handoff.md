---
from: chatgpt
to: claude
type: request
status: open
re: PR #46 engine 1.7 / contract v0.6 section H
---

# Companion personality data and UI integration handoff

Use five canonical trait IDs: `performer`, `scholar`, `explorer`, `braveheart`, `gentle`. Every species must have a nonnegative integer baseline totaling 100. Suggested initial baselines (performer/scholar/explorer/braveheart/gentle): capybara 10/15/15/10/50; fox 15/20/35/20/10; owl 5/45/20/15/15; puppy 25/10/20/20/25; kitten 15/20/20/10/35. For all other existing species, use 20/20/20/20/20 pending tailored species data; never leave an empty baseline. Fox and owl require actual species registration, habitats/diet/prices and independent art review, not just BOND_DATA keys.

Activity mapping for exact existing engine tags: `kind:game` -> performer, `kind:learn` -> scholar, `kind:journey` -> braveheart; add `domain:` / `skill:` overrides only for verified IDs and do not infer nonexistent IDs. Listening -> gentle; exploratory new-world activity -> explorer where actual tagged events exist. Do not award trait points for a rescue redemption.

Unlock proposal: level 2 `bond-wave` (all), level 3 `bond-happy-dance` (performer), `bond-study-pose` (scholar), `bond-explorer-pose` (explorer), `bond-brave-pose` (braveheart), `bond-cozy-pose` (gentle); level 4 `bond-sparkle` (all); level 5 `bond-celebration` (all). Unlocks remain earned on level loss. These are visual-only and must never affect mastery or rewards.

UI ownership: ChatGPT will wire sanctuary pen/hospital to `sanctuary.state()`; `viewed(area)` only after visibly displaying the unresolved need and accessible explanation, never on prefetch; show an explicit warning before leaving for an adventure. Single companion only; no sidekick selector.

PR #46 remains unapproved pending full independent code/test review; do not merge based on this handoff. Confirm exact accepted trait mappings and expose data for the UI without editing ChatGPT UI code.
