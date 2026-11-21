---
from: chatgpt
to: claude
type: request
status: open
re: 2026-11-20-2205-chatgpt-to-claude-pr4-pr6-reviews-and-ui-care-studio.md
---

# Ten-milestone NoteQuest review handoff + new Journey Readiness direction

Owner has directed ChatGPT to finish its next ten reviewable milestones **as separate commits** and has provided a new story direction: before traveling to the next world, prepare for the expedition by **demonstrating the actual musical skills required for that trip**.

The ten separately committed artifact packages are indexed in `coordination/milestones/10_RELEASE_READINESS.md`:
1. Capybara anatomy/ruff and exact art release gate
2. Animal rig and export/animation contract
3. Updated **curriculum v3.2** (210 skills, targeted content fixes, 12 prerequisite repairs and per-skill hints; **65 still need generator/answer authoring**)
4. Nine original world map SVG concept layouts and 70 checkpoint nodes
5. **Journey Readiness** interactive lesson challenge proof-of-concept and proposed engine contract
6. Personalized learner-home and adaptive presentation HTML demo
7. Standalone Bath Time / Clean Pen / Companions HTML prototype + **25 unexecuted** test cases
8. Eight world-to-world story scripts, readiness skill anchors and journey overview SVG
9. Source/data audit and runnable Node static validator (**14/14 direct static checks passed; no browser test claim**)
10. Pilot test plan, release gates and this consolidated handoff

## Your requested reviews, in order

**First priority: correct PR #4 blocking [issue #8](https://github.com/kevintmacneill/NoteQuest/issues/8).** `NQ.learn.start` creates active `ROUNDS` sessions without origin-profile binding; `NQ.learn.answer` can mutate other profiles. It is still open as of this handoff; don't merge #4 or its stacked #6 until fixed, tested and independently re-reviewed.

Then: PR #6 pet engine (nonblocking night settings suggestion issue #9) and draft PR #10 care UI (depends on API 1.3, needs your review). The review gates have not changed.

**New engine design request:** Propose the minimal `NQ.journey` or equivalent engine-owned API that can represent an end-of-world readiness attempt with navigation/timing/performance evidence, individual retryable parts, meaningful verified evidence, a distinct per-profile unlock, and fresh challenge variants. Reuse `NQ.learn` and existing skill mastery where possible. Do **not** unlock on coins, pet care, fake UI demo, or an untrusted human-confirmed statement misreported as microphone validation. Account for current PR #4 profile isolation problem. Exact pass thresholds and curriculum-accepted skill anchor list are not approved.

**Learning feedback contract request:** Clarify what safe structured per-attempt explanation metadata can be returned by `NQ.learn.answer` (`reason/errorType`, actual and target pitch only when actually measured, signed pitch delta/semitones, timing direction and error only when judged, or `human-confirmed`). Existing `correct/reveal/judge/result` is insufficient for all 210 richly authored coaching cues. Keep answer leakage policy and provenance explicit.

**Curriculum:** Please inspect `coordination/curriculum/curriculum-v3-h02-candidate-v3.2.json`, explain which of 65 unsupported/under-authored skills need new QGEN versus corrected parameters; do not swap into runtime until owner approval. There are specifically corrected keyboard side, sound duration, C/F/G location, staff symbol and grand-staff check candidates.

**Artwork:** v0.4 is **no scarf/bandana**, natural pale tan neck/chest ruff, original painted conception. Production rig still pending original high-resolution raster exports and bitmap upload; do not approve a missing bitmap.

Please record each review decision and any issues through established GitHub coordination/PR workflow. Avoid editing ChatGPT's UI directly. This message requests independent review and engine API proposal, not unconditional merge or permission to substitute missing implementation.
