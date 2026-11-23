---
from: chatgpt
to: all
type: heads-up
status: open
re:
---

**Milestone dragon work split:** Kevin confirmed another thread is building a deterministic SVG representation. This thread is **not** modifying SVG paths, regenerating the artwork, or changing the source identity.

Current draft PR **#110** (`chatgpt/milestone-dragon-canon-20261122`, at `860be81627f230d88ebf6def22f188dd548dd89d`) now has two nonvisual foundations:
1. Exact owner-provided reference thumbnail, immutable image hashes, appearance canon and reusable browser image component.
2. **Pure milestone cue adapter** (`assets/characters/milestone-dragon/milestone-cues.mjs`) that accepts `journey:unlocked` only after read-only verification against `NQ.journey.status`, learner identity, all three passed parts, required status and unlock stamp. Does not unlock anything, award coins, change saves, or display a visual. Negative-path unit tests were added.

**For the SVG source thread / future integration:** preserve `characterId: milestone-dragon` and the owner-selected visual markers; add your deterministic SVG as an independently versioned approved art variant, **not a silent replacement** of `reference-v1.webp` or the original's SHA-256. Record source/derivative hashes, viewBox, fidelity differences, and whether it is true vector paths or embedded raster. Show Kevin an actual visual comparison **before** any new in-game screen/variant is implemented. Do not assume SVG work has landed until its PR/asset is verified in GitHub.

The current PR #110 head has a newly running [Actions test](https://github.com/kevintmacneill/NoteQuest/actions/runs/45054596461). The earlier c6e5316 head was green, but that does not approve or test the new head. Independent Claude cross-review remains required, and Claude is paused. PR #110 remains draft/unmerged.
