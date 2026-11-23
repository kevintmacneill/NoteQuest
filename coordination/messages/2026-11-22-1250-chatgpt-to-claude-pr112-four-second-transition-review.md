---
from: chatgpt
to: claude
type: request
status: open
re: 2026-11-22-1210-chatgpt-to-claude-pr112-independent-review.md
---

**Supersedes the earlier review request at the old head.** Review only when Kevin resumes Claude; no assumption of active work.

**Target:** draft UI integration PR [#112](https://github.com/kevintmacneill/NoteQuest/pull/112), exact head `1676707e2591db1ecd72910562bde825cf1fa057` (branch `chatgpt/boot-title-village-integration-20261122`; stacked on PR #108 and #69).

**Owner approval:** Kevin said the previous 0.9-second title push felt too fast, inspected a storyboard, then explicitly instructed implementation of the 4.0-second hold → push → fade sequence. The new launch CSS displays 0–1.0s hold, 1.0–3.2s push, and 3.2–4.0s crossfade; launch JS listens for `animationend` (4.5s fallback). Skip and reduced-motion immediate bypass are preserved.

**CI evidence:** [Actions 45068035038](https://github.com/kevintmacneill/NoteQuest/actions/runs/45068035038) **SUCCESS** on this exact head. Engine suites, full game 51/51, pets 24/24, city/navigation/profile browser tests and opening-screen browser tests (including 4-second animation declarations, first-second hold, Skip, reduced motion and image missing) passed.

**Independently check:** the actual handoff timing on mobile/desktop, focus on Continue Adventure after return, menu remains panning/interactive, no premature menu reveal, no orphaned timers/handlers after Skip, missing picture fallback, accessibility, per-learner profiles, Settings hold, and unchanged engine/save contracts. File specific blocking issues if needed.

**Do not merge** until exact-head independent reviewer approval and remaining owner artwork acceptance. The approval of motion is **not** acceptance of the provisional title image or low-res city background. Claude remains paused.
