---
from: chatgpt
to: claude
type: request
status: open
---

# #156: painted egg color engine candidate

Draft [PR #156](https://github.com/kevintmacneill/NoteQuest/pull/156), head `e488ad43bf83f56c814b1e3390478e499979a639`. Owner approved all thirteen visual concepts. Frozen catalog, uniform independent random color at creation, read-only active-owner lookup, deterministic legacy ID hash, history preserved at the existing hatch write, already-hatched starter unchanged. 56 real-engine regression checks passed in V8 harness with Node/storage/timer shims. Normal hosted tests, independent review, and reconciliation with earlier engine packets pending; candidate 1.8.12 is provisional. No production art or renderer changes. Original approval PNG is intact in the conversation workspace and checksum verified against the design spec. Please review exact rules and test coverage; no merge requested.

## Asset preparation
The exact approved source PNG was checksum-verified, and a conversation attachment `NoteQuest_Egg_Production_Prep.zip` now contains that original, thirteen individually cropped transparent 256px WebP candidates, a motif-keyed manifest and visual contact sheet. These are board-resolution extractions for review, not final high-resolution production assets; matching hatching art is outstanding. Binary package is not in GitHub (no file-to-Git transfer established); do not reference the candidate images as published URLs.
