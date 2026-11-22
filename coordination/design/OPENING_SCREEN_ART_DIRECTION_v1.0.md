# NoteQuest — Opening Screen & Intro Art Direction v1.0

**Status:** Owner-selected concept reference (2026-11-22). **Authority:** visual direction for future UI/art work, not a declaration that the pictured characters are final canon. **Owner:** ChatGPT (visual/UI); engine remains Claude-owned.

## Reference
Owner-provided concept image: **“NoteQuest: Musical Adventure Loading Screen.png”** (shared in ChatGPT on 2026-11-22). This document records its visual direction; the original raster image has **not yet been added to the repository**, so do not mistake this text for a pixel-exact source asset. Request the original image when implementing pixel-accurate artwork.

## Required look and composition
- Bright, richly painted, polished storybook-fantasy landscape with a welcoming, child-friendly sense of scale and adventure.
- Big dimensional **NoteQuest** gold-and-purple logo with music-themed ornament and a parchment-style **“A Musical Adventure”** subtitle.
- Blue sky, soft clouds, sunlit green cliffs, floating islands, waterfalls, distant castle, bridges, glowing musical trails and small magical sparkles.
- Foreground framing with a leafy tree, hanging warm lantern, purple flowers and an inviting group of young adventurers with an animal companion. Characters are **concept placeholders** until the owner confirms permanent cast/identities; do not infer that the pictured cat replaces the selectable companion system.
- Strong foreground/midground/background depth, painterly detail, luminous accents, warm gold against cool blue/purple, and readable text overlays.
- Preserve this visual language in title, main menu, adventure hub and nine-world map; individual worlds may vary by locale without losing cohesion.

## Startup interaction contract (UI)
1. **Loading:** full-bleed illustrated backdrop, branded logo, “Loading Your Adventure…” and a progress indicator tied to genuine asset/app initialization state. Never imply fake percent completion.
2. **Ready:** loading indicator resolves into a clear large **Tap to Play** action; remain here until player interaction. Provide keyboard and pointer support.
3. **Play:** transition to the returning learner's main menu if a valid profile is known; otherwise show the existing profile selection / new-learner onboarding flow. Preserve profile isolation and existing save behavior.
4. **Main menu:** visually connected to the title scene, with music/adventure actions prominent; animal care and Music Reference discoverable, without obscuring the primary learning journey.
5. **Adventure hub:** islands/paths communicate travel between worlds; locked and available locations remain distinguishable without color alone. Journey Readiness remains a mastery gate, not merely a visual transition.

## UI / accessibility / performance
- Phone, tablet, desktop; safe areas, portrait and landscape crops must preserve logo, primary action and important characters.
- Maintain legible contrast over busy art using local shadows/overlays; minimum comfortable touch targets and visible focus state; reduced-motion alternative.
- Loading/ready state must work when images are slow or unavailable, with fallback background and readable action.
- Use optimized image assets loaded on demand. No new engine behavior or save-schema changes are authorized by this design note.
- Avoid turning the scene into a non-interactive splash image: controls and loading state remain real DOM/UI elements.

## Relationship to existing documents
This owner-selected opening-scene reference **supersedes conflicting opening-screen aesthetic direction** in the earlier twilight-storybook visual guide, but does not replace its accessibility, notation legibility, interaction, curriculum, pet-care or nine-world requirements. Update related component/art guides when implementing. Existing merged startup navigation remains the behavioral baseline; do not regress it.

## Review and ownership
- ChatGPT authors UI and art changes on a ChatGPT UI branch, with PR and independent Claude exact-head cross-review before merge, unless owner explicitly authorizes a different exception.
- Claude owns engine and engine API; ask through coordination before any engine contract change.
- Do not assert the specific boy, girl, or cat are permanent story characters until the owner decides.
- This document is an **art-direction milestone**, not evidence that the actual illustrated loading screen has been implemented or deployed.
