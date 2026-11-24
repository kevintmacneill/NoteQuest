# Layered Village v2 — implementation checkpoint (2026-11-23)
Owner-approved direction: four individually editable storybook layers, sky/mountains/city/foreground; sky can drift much more widely and should never visibly tile. No live 3D. Preserve existing 4-second launch cinematic and keyboard-first learning actions.

## Committed on the UI city branch
- `assets/nq-city-parallax.js`: optional four-layer asset loader, independent movement, midground position held fixed for existing hotspots, safe original-art fallback if any layer fails, teardown on navigation.
- `assets/nq-city-parallax.css`: layer stack, preserved z-index of destination controls, gentle 140-second sky drift, reduced-motion fallback.
- `assets/nq-city-overlook.js` and `index.html`: opt-in integration with the existing menu. No `NQ` engine/save API changes.
- `tests/city_parallax_node.cjs`: read-only source contract checks.

## Independently executed local visual prototype
A separate full-asset ZIP was assembled from the approved work-in-progress panorama and its four aligned 2172×724 WebP components. Local Chromium (via Playwright set_content and inlined images, because browser navigation to localhost/file is sandbox-blocked) completed tests at **390×844, 820×1180, 1280×800**: four layers loaded, no page JS errors, functional tap on Adventure Gate and pan controls, no horizontal document overflow. Reduced-motion browser test verified static parallax transforms. Node `--check` passed.

## IMPORTANT limitations / merge hold
**The 4 WebP binaries are supplied as a conversation ZIP, not uploaded to the GitHub repository.** The city branch intentionally **falls back to the existing static art** when those optional layer paths are missing, so this commit is non-breaking and is not a deployed layered-art claim. Upload and verify the actual image assets before completing #115.
- 2172×724 is a prototype resolution, not validated as sharp enough at all production devices or 4K desktops; avoid calling it high-resolution final.
- The sky currently drifts as a single illustration, not animated independent cloud objects; unique cloud cutouts are a future refinement.
- Existing #112 launch cinematic was not rewritten or independently exercised in this visual prototype.
- Existing hotspot-to-building placement needs final image-alignment review.
- Full NoteQuest combined app suites and actual Samsung hardware have not been run locally here.
- PR #108 remains draft until complete asset integration, production-resolution tests, exact-head independent cross-review, and owner acceptance. PR #118 clean-slate engine correction remains a separate blocker for #109.
