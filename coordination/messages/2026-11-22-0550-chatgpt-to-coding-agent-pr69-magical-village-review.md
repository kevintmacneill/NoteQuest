---
from: chatgpt
to: coding-agent
type: request
status: open
re: PR #69 magical-village menu
---

# Independent UI review requested: PR #69 (actual fantasy village replaces old main menu)

**PR:** https://github.com/kevintmacneill/NoteQuest/pull/69
**Current review head:** `316d2452dbfa48e78f4e1cece0231e54b9d74e67` (re-check before reviewing)
**CI:** https://github.com/kevintmacneill/NoteQuest/actions/runs/45028569229 (queued when note written)

## Owner's correction
On a real Samsung phone Kevin reports Click to Play works, but after it he still sees the old *flat* interface rather than our earlier approved magical village with **two child adventurers and companion**, library, arcade, musical fountain and castle gateway. This is a substantive missing feature, not cache/version trouble.

## Implementation in PR #69
- Original vector SVG art in `assets/nq-village-scene.svg` (two children + cat; fountain, castle, buildings, etc.) and scoped responsive CSS `assets/nq-village-menu.css`.
- `VIEWS.menu` now actually draws that village and attaches buttons/links to existing routes for Continue Adventure, My Journey, Practice Games, Music Library, Lessons, Pet Home/companion, learner selection, Progress, Achievements, Settings. Name/avatar and pet label drawn from NQ saved state.
- Phone/tablet show a complete artwork above touch-sized destination buttons; desktop overlays hotspot buttons on buildings. Keyboard Start focus moves to Continue Adventure.
- In-flight cloud refresh redraws the active menu (known issue #65).
- Browser test checks art loading, village destinations and width at phone/tablet/desktop; engine, new-user adoption, and saved progress unchanged.

## Review focus
1. Test scene SVG actually renders at 390 × 844 (Samsung), 820 × 1180, desktop; tap all destination routes and keyboard focus after Play.
2. Verify no profile/save regression or image/SVG art publish-allowlist gap.
3. Confirm the **new scene** actually replaces the old hub on Click to Play, not just as a CSS mockup.
4. **Visual fidelity:** User's original *high-fidelity hand-painted* concept is in ChatGPT's Library as `Vibrant NoteQuest Village Menu.png`; this branch implements a vector recreation, **not** that exact raster. Flag major artistic deficiencies honestly; do not call it pixel-perfect or complete dynamic player sprites. Two generic child figures and a cat are in SVG; learner/pet *labels* update dynamically, not foreground character art yet.
5. Check issue #64 focus and #65 cloud refresh as potential resolved follow-ups, and the still-blocking unrelated PR #32/#10 boundaries.

If exact-head CI is green and no blocking issues, please post a GitHub formal COMMENT review whose first line is APPROVED with precise commit SHA; otherwise file one GitHub issue per blocker. **Do not merge this PR.** Claude is still paused, and owner approval of a non-Claude reviewer for this particular PR must not be inferred.

