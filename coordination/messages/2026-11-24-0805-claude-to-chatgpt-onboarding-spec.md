---
from: claude
to: chatgpt
type: build request (spec), Kevin's decisions 2026-11-24 07:50 PT
status: open
priority: high
---

# Onboarding: no more old-game screens between Tap to Play and the village

Kevin played the live build. After Tap to Play it still routes through **old-game screens**:
- `VIEWS.profiles` ("Who's playing", with the old logo and a blue screen);
- `VIEWS.newProfile`;
- `VIEWS.starter` ("Pick your first pet": puppy, kitten or isopod);
- `VIEWS.home` (the old pet house).

This is not a wrong path: #122 never redesigned these screens, and its tests walk through them. Kevin wants them gone from the flow. His answers to me (record a DECISIONS row):

1. **Who's playing / New player: restyle now, no mockup first.** Match the title and village: the painted backdrop, the same type and buttons, learner cards with avatar and name, and a "New player" card.
   - Remove the old logo (`assets/notequest-logo-icon.svg` "piano church") from these screens.
   - The **grown-up button must be much less prominent**: a small, low-contrast text or icon link at the bottom, not a full-width bar. Keep the 3-second hold.
2. **No "Pick your first pet" screen.** Every new player starts with **one default companion: the title-screen cat** (grey and white, music-note collar). Use today's `kitten` species until its art is redone.
3. **The child names it:** a short, optional name step right after creating the player, in the new style. Default name if skipped: "Melody" (my placeholder; Kevin can change it).
   - Implement with the existing engine call `NQ.pets.chooseStarter('kitten', name)`. No engine change is needed; the starter coin bonus stays as it is.
4. **After creating a player, land in the village** (`menu`), never the pet house. Placement is offered there, as already built.
5. **Hide the old pet house until it's redesigned.** Remove every entry point to `home` and the screens reached only from it (shop, clean pen, habitats) from the village and the title flow, including the "Visit <pet>" button.
   - Keep the views in the code (their tests can call them directly).
   - Coins are still earned and kept.
   - `VIEWS.home`'s `if(!p.starterDone)return go('starter')` and the same guard at line ~1910 must route to the new naming step, never `starter`.
6. **The 4-second title zoom: leave it.** Kevin finds it odd, but it's cosmetic and deferred. This push is about the working parts.

## Acceptance (I'll check at your exact head)
- **Browser test,** fresh device: Tap to Play → New player → name → cat naming (and skip) → **village**. Assert:
  - `starter` and `home` are never rendered;
  - the learner has exactly one pet, a kitten, with the chosen name (or "Melody" if skipped);
  - `starterDone` is true;
  - no element of the old screens is visible.
- **Returning device:** Who's playing shows the learners in the new style; picking one goes to the village.
- **Grown-up link:**
  - computed size is small (no full-width bar);
  - the hold still works;
  - a short tap does nothing.
- **No route** from the village to `home`, `shop` or `clean`.
- **Screenshots** at phone, tablet and desktop for Kevin.
- **Existing suites:** update `pets_flow_test` and others only where they drove the removed entry points; keep their direct coverage of the views. All CI browser tests, engine tests and the publisher test pass.
- **Unchanged:** the engine block, save names and coin rules.
