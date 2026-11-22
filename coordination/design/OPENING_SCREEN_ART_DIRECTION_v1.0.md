# NoteQuest — Opening Screen & Intro Art Direction v1.0

**Status:** Owner-selected concept reference for the loading/title screen (2026-11-22). The main menu uses a different picture. See **Screen requirements (owner, 2026-11-22)**. **Authority:** visual direction for future UI/art work, not a declaration that the pictured characters are final canon. **Owner:** ChatGPT (visual/UI); engine remains Claude-owned.

## Reference
Owner-provided concept image: **“NoteQuest: Musical Adventure Loading Screen.png”** (shared in ChatGPT on 2026-11-22). This document records its visual direction. The original raster image is in the repository at `coordination/design/reference/notequest-opening-screen-concept-v1.png` (added on Kevin's approval 2026-11-22). That file is the loading/title picture only.

## Screen requirements (owner, 2026-11-22)

Kevin decided the loading screen and the main menu are different pictures. The loading-screen concept is not menu art. The file PR #69 calls `assets/nq-painted-village.png` — that concept, with children overlooking a valley and “Loading Your Adventure...” baked in — is rejected as the menu background.

### Loading / title screen (issue #70)

Use `coordination/design/reference/notequest-opening-screen-concept-v1.png`: two children and the grey kitten on a rock overlooking the valley, floating castle island.

The screen shows the NoteQuest title, loading progress, then a **Tap to Play** prompt. Loading progress and Tap to Play stay real controls, as in the startup contract below. This image is never used as the menu.

### Main menu / village center (PR #69, issues #71 and #72)

The background is `coordination/design/reference/notequest-menu-village-plaza-v1.jpg`. Kevin approved this plate as the menu background on 2026-11-22: painted village plaza, blank signs, no text or UI. The PR author copies it into `assets/` as an optimized web image.

The layout target is `coordination/design/reference/notequest-menu-mockup-target-v1.webp`. It is the owner's mockup of labels and buttons drawn over that plate. The uploaded PNG was 3.2 MB, so the repository copy is a near-lossless WebP of the same 1672×941 picture. The mockup shows where the interface sits. It is not the runtime background, and the lettering painted on the mockup is not shipped as text inside the art.

Buildings are the learner's menu destinations. Code draws the labels over the blank painted signs. Real tappable buttons sit on each building:

- **Music Library** (left cottage) → `reference.html`
- **My Journey** (castle gate) → nqwHub
- **Practice Games** (striped-awning shop) → games
- **Lessons** (piano house, right) → Lessons
- **Pet pen** (lower right) → Pet Home / companion

Code-drawn overlays:

- NoteQuest title banner
- Welcome Back and the learner picker
- A large **Continue Adventure** button on the plaza
- A Choose Learner / Progress / Achievements row
- Settings, behind the 3-second grown-up hold (issue #74)

No baked-in text in the menu art. Tap targets must scale with the image at all screen sizes. Learner-facing copy has no developer wording.

A picture counts as approved art only when Kevin approves that picture explicitly.

## Required look and composition
- Bright, richly painted, polished storybook-fantasy landscape with a welcoming, child-friendly sense of scale and adventure.
- Big dimensional **NoteQuest** gold-and-purple logo with music-themed ornament and a parchment-style **“A Musical Adventure”** subtitle.
- Blue sky, soft clouds, sunlit green cliffs, floating islands, waterfalls, distant castle, bridges, glowing musical trails and small magical sparkles.
- Foreground framing with a leafy tree, hanging warm lantern, purple flowers and an inviting group of young adventurers with an animal companion. Characters are **concept placeholders** until the owner confirms permanent cast/identities; do not infer that the pictured cat replaces the selectable companion system.
- Strong foreground/midground/background depth, painterly detail, luminous accents, warm gold against cool blue/purple, and readable text overlays.
- Preserve this visual language across the title screen, the village menu, the adventure hub, and the nine-world map. The loading image and the menu plate are different pictures, as set in Screen requirements. Individual worlds may vary by locale without losing cohesion.

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
This owner-selected opening-scene reference **supersedes conflicting opening-screen aesthetic direction** in the earlier twilight-storybook visual guide, but does not replace its accessibility, notation legibility, interaction, curriculum, pet-care or nine-world requirements. **Screen requirements (owner, 2026-11-22)** decide which picture is the loading screen and which picture is the menu. Update related component/art guides when implementing. Existing merged startup navigation remains the behavioral baseline; do not regress it.

## Review and ownership
- ChatGPT authors UI and art changes on a ChatGPT UI branch, with PR and independent Claude exact-head cross-review before merge, unless owner explicitly authorizes a different exception.
- Claude owns engine and engine API; ask through coordination before any engine contract change.
- Do not assert the specific boy, girl, or cat are permanent story characters until the owner decides.
- This document is an **art-direction milestone**, not evidence that the actual illustrated loading screen has been implemented or deployed.
