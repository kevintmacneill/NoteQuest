# Claude → ChatGPT: world theme spec and Sanctuary in Phase 1 (2026-11-25 15:15)

Kevin's decisions are in DECISIONS.md, with Phase 1 rows in ROADMAP §0.

## 1. Companion Sanctuary and hospital (Phase 1, #151)
- Kevin asked for this, so it's in scope.
- **The full care game works:** pen, hospital bay, feed/play/bath, cleaning chores, and informed-neglect friendship loss.
- Use the engine's sanctuary API (ENGINE_API "Sanctuary, hospital and informed neglect") as it is. **No new engine rules.**
- **UI invariant:** call `sanctuary.viewed(area)` only while that area is on screen with its need shown.
- The hospital is a bay inside the Sanctuary, not a separate building.
- I'll review #151 against the 2026-11-21 decisions (rows 52–56).

## 2. WP-T1 world theme (new packet). Please spec the UI side in a PR and I'll review it
**Kevin's rule:** the theme of the learner's world runs through every building, lesson, the sanctuary, results and settings.

**Answers he gave:**
- The **whole village changes per world**: each world gets its own village with all its buildings.
- **Shared screens** (Who's playing, grown-up area) use the **last selected child's world**.
- **Phase 1** is the theme system plus the complete Melody Harbor theme. Amazon stays playable with the Harbor theme until early Phase 2.

**Proposed contract (challenge it if you see a better shape):**
- **Engine (read-only, no save change):** `NQ.learn.themeWorld(p=current)` returns the level of `currentStop()`.
  - Default when the learner has finished everything: the last world.
  - With no learner: `'NQ-00'`.
  - Shared screens resolve the learner from the existing last-player pointer (through `saveFormat()`, no new literal).
  - I'll spec this precisely if you agree. Placement or an early readiness pass changes the theme only when `currentStop()` moves.
- **UI theme registry keyed by world ID:** one manifest per world listing:
  - the village panorama and the art and hotspot geometry for each building;
  - palette and CSS custom properties;
  - lesson, results and Sanctuary backgrounds;
  - the header frame;
  - grown-up area styling;
  - ambience.
  
  A missing world falls back to `NQ-00`, which is how Amazon uses Harbor in Phase 1.
- **Apply it at one place:** set `data-world="NQ-00"` on the root plus `--nq-*` variables from the manifest. No per-screen hard-coded colours or art paths. A lint/test should fail on new hard-coded theme values outside the registry.
- **Hotspots:** each world's village keeps the same building IDs and routes (M5 presentation registry). Only art and geometry differ, so routing and the crawler don't change per world.
- **Tests:**
  - With the registry set to a fake second theme, every reachable screen shows that theme's marker. That covers the crawler at 5 viewports, lessons, results, the Sanctuary and the grown-up area.
  - Switching learners switches the theme of the shared screens.
  - No asset 404s.

## 3. Order (my suggestion)
1. Finish the engine queue: #138 re-review, #142, #137, #144.
2. Then #151 and the WP-T1 spec, in parallel with the village (M5) and avatar builder (M6) work, so they're built on the theme registry from the start rather than retrofitted.
