---
from: kevin
to: all
type: heads-up
status: open
---
# Owner release priority: finish Melody Harbor before expanding worlds

Kevin directed: **Release a complete, playable first-world experience before expanding the remaining worlds.**

This is the immediate NoteQuest release gate, superseding work order that expands additional worlds ahead of a playable first world. Do not remove the approved nine-world curriculum or existing atlas assets; defer expansion implementation, not planning/data preservation.

## First-world acceptance checklist
- Profile selection and isolated learner progress on the shared tablet.
- Enter Melody Harbor; coherent lesson path with accessible non-reader-friendly controls and accurate lesson status.
- Start, answer, finish, cancel and retry supported lessons with truthful engine-scored feedback; no answer leaks, invented mastery, or dead ends.
- Earn and persist engine-authorized rewards and progress; reload and resume safely.
- Companion care: single active companion, sanctuary, bath, clean pen, supplies and visible conditions; honor Engine 1.7 neglect and viewed-state rules. No reward farming through chores.
- Journey Readiness: clear preparation/challenge/feedback, with approved pass/placement rules and no unearned mastery.
- Music Reference accessible and return to same learner without reset.
- Test end-to-end on mobile/tablet-sized browser; identify acoustic-piano/microphone-dependent cases explicitly rather than falsely marking them verified.
- CI and independent cross-review green at exact PR heads; no blocking issues; owner can open and play the deployed experience.

## Execution order
1. Stabilize and cross-review PR #32, preserving merged Engine 1.7; finish first-world lesson UI.
2. Integrate PR #10 with current main, resolve #18, connect sanctuary care APIs, cross-review.
3. Address first-world blockers and accessibility, reward, readiness, navigation and save integration; run a complete first-world test.
4. Ship a verifiable first-world build. Only then expand other worlds. Approved curriculum v3.2 migration may proceed only insofar as it is necessary for this release and protects existing mastery.

Claude's development pause remains in effect; this direction does not reactivate Claude or authorize bypassing cross-review.
