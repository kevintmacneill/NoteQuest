# Opening Screen Implementation Handoff v1.0

**Owner direction:** Use the owner-supplied painted NoteQuest loading-screen concept (2026-11-22), governed by [Opening Screen Art Direction](OPENING_SCREEN_ART_DIRECTION_v1.0.md).

**Implementation ownership:** ChatGPT UI branch; independent Claude exact-head review required before merge. Claude is paused until owner resumes; do not presume a reviewer is available. Do not modify Claude-owned engine logic.

## Verified baseline (2026-11-22)
- `assets/nq-launch-menu.js` on main currently mounts a branded **Click to Play** overlay and delegates entry to `window.NoteQuestEnter()`. It has no genuine asset-loading state and does not display the owner's painted scene.
- PR #69 independently replaces the flat menu with a responsive interactive village, edits `assets/nq-launch-menu.js` focus behavior, and is **open**, not merged. Coordinate its final version before editing this file to avoid clobbering focus fixes.
- The uploaded PNG exists in the owner's ChatGPT conversation, **not** in this GitHub repository. No claim of asset integration until the image is committed and read back.

## Next implementation task: painted startup experience
1. Import the supplied PNG (or an optimized visually faithful derivative) as a source-controlled asset in `assets/`, preserving the original outside the repository if necessary. Use explicit provenance in the PR.
2. Keep the logo, illustration and composition of the approved concept. Put accessible, interactive loading text, progress, and Play button **in DOM overlays**, not baked into an image.
3. Loading progress must represent real app/asset readiness. If exact percent cannot be measured, use an **indeterminate** progress indicator, not fabricated percentages. Provide image-load error/fallback handling.
4. On readiness show **Tap to Play**, retain it until the user acts, and call existing startup entry exactly once. Do not break the returning learner / profile picker / new learner routing introduced in PR #63.
5. On activation focus the main hub's **Continue Adventure** when present (PR #69), otherwise a meaningful first control. Escape must not bypass an unfinished loading state; keyboard, touch and screen readers must be supported.
6. Support 390px phone, 820px tablet and 1280px desktop; preserve primary call to action in portrait/landscape and respect reduced motion. Keep image dimensions/aspect ratio and avoid horizontal overflow.
7. Tests: initial loading state; success; missing/failed image; delayed asset; Play once; keyboard and focus; returning single learner; multiple learners; no learner; cloud refresh; narrow phone.
8. Do not change engine API, save schema, profile isolation, curriculum or pet mechanics. Do not merge another author's code.

## Sequencing
- PR #69 remains an independent review gate; do not merge it without exact-head independent review and green CI.
- Implement this loading/title change on a ChatGPT-owned UI branch based on a current main. Reconcile PR #69's focus change before review; do not overwrite it.
- Cross-review and CI are required before merge. Verify the GitHub Pages deployment separately after merge.
- When complete, update the status and close the corresponding opening-screen issues only after verifying the actual result.

## Acceptance criteria
- A learner sees the owner-selected painted scene on a fresh visit, then an actionable Tap to Play.
- A returning learner reaches the correct profile's menu without extra profile loss.
- The illustrated startup and the village feel like one visual experience.
- Every visual is source controlled, all controls remain accessible, and the test suite is green.
- The PR accurately distinguishes implemented functionality from mockups and unverified deployment.
