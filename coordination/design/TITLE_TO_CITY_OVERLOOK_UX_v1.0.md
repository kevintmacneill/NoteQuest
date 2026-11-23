# NoteQuest — Title-to-City Overlook UX v1.0

**Owner direction (2026-11-22). Status:** Approved product/interaction direction; implementation not yet verified. This specification supplements `OPENING_SCREEN_ART_DIRECTION_v1.0.md` and supersedes any implication that the village menu is a static plaza or the title illustration is reused as its background.

## Experience
1. **Title:** Two child adventurers and their companion stand in the foreground, overlooking the distant musical city. Show the NoteQuest logo and real loading state, then an actionable **Tap to Play**. Children/companion shown in concept art are not yet canonically assigned to learner profiles.
2. **Entering:** On Play, animate a camera push toward and past the children, shifting from third-person framing to a **first-person overlook**, as though the player becomes one of the adventurers. This should feel like continuous movement into the same world, not an unrelated page swap. Use matched perspective/landmarks and layered parallax/crossfade; do not simply zoom into baked-in title text.
3. **Main menu:** The player stands at an elevated overlook, looking down over an explorable **village/city**. The city itself is the navigation system. Buildings/landmarks are tappable, with live accessible labels and controls separate from the background art.
4. **Explore:** The scene may extend beyond the viewport and support touch swipe/drag, pointer drag and keyboard pan, with a visible accessible alternative to dragging. Return-to-center is available. Never hide the primary piano-learning path behind panning.

## Priority hierarchy
**Immediately visible, central, most visually prominent:** Continue Adventure (default focus), Music Journey/World Map, Lessons, Practice Games, Music Reference. They are the primary mission: learning piano.

**Secondary, peripheral and discoverable by exploration/panning:** Companion/pet home and care, achievements/stickers, shop, decorations/collections, other optional engagement systems and gated grown-up settings. These are engagement supports, not substitutes for learning. Progress may be accessible from the central learning district as a learner feedback tool.

## Responsive behavior and safety
- Start centered on the learning district for each visit, on phone/tablet/desktop; show core destinations without needing to pan. In portrait, use a compact fixed learning-action dock if city scale prevents all core buildings from being readable simultaneously.
- Hotspot positions must remain anchored to landmarks while scaling/panning; avoid baked-in text, collisions, clipped names and covered characters. Keep touch targets >=44 CSS px and visible keyboard focus.
- Respect reduced motion: immediate or brief crossfade to the overlook; no forced camera motion. Provide Skip Transition. The camera must never block controls for prolonged asset loading.
- Preserve existing `window.NoteQuestEnter`, profile selection, separate learner saves, 3-second grown-up hold, Music Progress routing, companion API and Journey Readiness gates. No engine/schema changes.
- For screen readers, offer a semantic list/nav of all destinations regardless of current pan position; panning is not a prerequisite for access.
- Load city art progressively and provide a readable fallback if imagery fails.

## Art and implementation
- **Title art** remains `coordination/design/reference/notequest-opening-screen-concept-v1.png`.
- **Previously approved plaza plate** `coordination/design/reference/notequest-menu-village-plaza-v1.jpg` is a *visual reference*, not necessarily the final camera composition. New owner direction requires a coherent elevated overlook of a wider city. Do not claim a plaza-level image satisfies that requirement.
- PR #69 currently points at `assets/nq-painted-village.png`, which the owner explicitly rejected as the menu image because it belongs to the title/loading scene. Replace that runtime menu use with a distinct panoramic city-overlook plate before release.
- Build UI on ChatGPT-owned branch, PR, independent exact-head cross-review and green CI. Claude engine ownership and pause remain unchanged.

## Acceptance tests
1. On load, two children and companion are visible at the title vista, and Play is actionable after readiness.
2. Play triggers the intended viewpoint transition, or a reduced-motion equivalent; profile routing remains correct.
3. First visible menu view contains all five learning-first destinations and Continue Adventure receives first actionable focus.
4. Panning reveals secondary districts; keyboard and touch can reach them; screen readers have equivalent direct navigation.
5. At 390px, 820px, and 1280px, hotspots align with buildings and no essential label/control clips.
6. Settings always requires the grown-up hold, Progress opens music progress and returns to village, and active companion routes correctly.
7. No regressions in profile isolation, startup, world progression, or existing browser tests.

**Do not merge PR #69 merely because its current tests pass.** This visual/interaction direction is a release acceptance gate, not a claim that code is already built.
