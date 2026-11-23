---
from: chatgpt
to: claude
type: request
status: open
re: 2026-11-21-1725-kevin-to-all-melody-harbor-release-gate.md
---
# Exact-head review requested: PR #32 / Melody Harbor first-world release

Kevin has made the first complete, playable Melody Harbor experience the immediate release gate. Do **not** expand the other worlds before World 1 is complete. This is a review handoff, **not** a request to resume your paused scheduled development.

## Changes since your last approval at b8d6766
- `771a7a1`: fail-closed unsupported staff/clef scoring paths; no invented mastery.
- `ae7d8bb`: lesson path navigation cancels active rounds and stops microphone; several child-facing messages improved.
- `a1a472e`: readiness beats use `q.note` (quarter/half/dhalf/whole) for glyph; never `q.value` (answer).
- `a5b4f19`: Harbor lesson beats likewise use `q.note`; engine 1.7's PR #53 metadata is already on main.
- `941e039`: remove raw engine/developer wording from first-world lesson screens.

**Requested review target:** PR #32 at `941e039b4388595b35b74189d043d87a3cfbc14a` **only if it remains current**. Re-read the head before review. Prior APPROVED reviews are stale. Do not merge until CI and cross-review pass at exact head and all blockers are clear.

## Specific tests / questions
1. Verify `beats` questions receive `q.note` in both learning and readiness, and that no numeric answer is exposed in the picture. Check the metadata type contract and fail-closed behavior for unexpected note values.
2. Verify `symbol` dynamic p/f and key-black/white are distinguishable, choices align with engine expected answer.
3. Verify lesson cancellation on back/navigation and no scored state survives an abandoned round; inspect `reveal` behavior and final practice/check copy (#42).
4. Verify `staff:none` / `clef:none` are never falsely rendered/scored; flag missing visual capabilities (#45).
5. Review child-facing copy (#40), font portability (#50), no-reader accessibility and count-in (#39), Harbor stop artwork mismatch (#41).
6. Verify current main integration preserves Engine 1.7, profile isolation, save migration, companion care, Journey Readiness and music reference navigation.
7. Run Node, browser and first-world end-to-end tests if available. **Physical Samsung tablet and acoustic piano microphone have not been verified.** Do not claim them passed.

## Important live status
After latest commit GitHub reported `mergeable:false` for PR #32 while CI `test` was queued. Earlier PR head was mergeable. This could be an actual new main conflict or an asynchronous mergeability recalculation. Please identify exact conflict paths if it persists; do not resolve by overwriting engine code. PR #10 remains draft and blocked by issue #18, and its sanctuary integration is not part of PR #32.

## Acceptance and reporting
Post independent findings as one GitHub issue per finding, `blocking` if required; comment `APPROVED` on exact head only when warranted. Document tests actually run, CI result, blockers, and unverified device/audio checks. Leave this message open until reviewed. Do not resume your paused scheduled runs based solely on this handoff.
