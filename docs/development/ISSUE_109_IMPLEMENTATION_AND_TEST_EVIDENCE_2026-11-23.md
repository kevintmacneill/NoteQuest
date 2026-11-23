# Issue #109 — implementation and test evidence

**Updated:** 2026-11-23 00:56 PT. **Status:** in progress; NOT a playable lesson, NOT independently approved, NOT merged.

## Authority and constraints
- Coordination: `coordination/README.md`, `STATUS.md`, `DECISIONS.md`, `ENGINE_API.md` on main.
- Claude owns engine/mastery/persistence. ChatGPT owns UI/curriculum/design; do not merge without independent cross-review.
- User has not approved the proposed new lesson-screen artwork. Existing approved UI components only.
- Preview curriculum IDs `NQ-00-U01` and engine IDs `NQ-00-S1` are not interchangeable.

## Implementation ledger (ChatGPT branch)
| Commit | Change | Verification |
| --- | --- | --- |
| `ea258ad0` | Add pure engine-authoritative route guard and initial 10-assertion Node test file | GitHub file read-back; no runtime execution evidence |
| `a4706bbc` | Load route guard in index.html and consult it from Continue Adventure | GitHub read-back; no browser execution evidence |
| `003786c5` | Extend guard tests to 16 assertions | GitHub read-back; not executed |
| `1d91e15c` | Guard accepts `stopStatus().skills` objects with `id`, not string skill IDs | GitHub read-back; not executed |
| `c2194cb3d1bdd2a4e5bc691ccade3fea9d08d3f1` | Fix test fixture to mirror actual engine `skills:[{id,state},...]`; reject string-only status skill arrays; 17 assertions | GitHub read-back verified; not executed |

## Engine observations from current branch
- `NQ.learn.currentStop()` selects the first engine stop not complete.
- `stopStatus(id)` returns `{id,level,title,unlocked,complete,step,skills:[{id,state}],gate}`.
- `markLearned(id)` persists the Learn phase, but must only be invoked after actual learner action.
- `start(skillId, mode)` creates an engine-owned round and returns `{ok,roundId,total,question}`; `answer(roundId,value)` owns correctness and progression.
- Engine check progression can require successful assessments on separate days; UI must not award secure status after one passing check.
- First stop `NQ-00-S1` includes `k-blackwhite` (symbol) and `e-highlow` (audio high/low). UI needs supported renderers and truthful fallback.

## Test evidence
| Check | Result | Evidence |
| --- | --- | --- |
| GitHub file read-back of updated route guard and index.html | VERIFIED | GitHub fetch after commits |
| GitHub file read-back of 17-assertion fixture update | VERIFIED | Fetched content matched submitted content |
| `node tests/lesson_route_test.cjs` | **PASS — exit 0, 17 assertions** | 2026-11-23 00:56 PT, Node.js v22.16.0; exact GitHub blob bytes reconstructed in isolated `/mnt/data/nq109`, independently matched using `git hash-object`: route `3deaeb4f9a918391b1777495d7aa6cbeb1214e68`, test `2be851a2a2c5fe6ce75e0fd819c5a740cb8d2caa`; stdout `lesson route: 17 assertions passed`; this is a pure unit test, not a full-repository build or browser test |
| Browser fresh learner → lesson → answer → refresh | **NOT RUN** | Browser environment not attached |
| Wrong answer, locks, unsupported question type, profile isolation | **NOT RUN** | Pending engine-backed lesson UI |
| CI at commit `c2194cb3` | **NO PR-TRIGGERED RUN RETURNED** | GitHub workflow-run lookup returned empty array |

The Node test was actually executed on independently hash-verified exact source bytes; the process returned exit code 0. This verifies only the pure routing adapter assertions. No browser or end-to-end gameplay verification has been performed.

## Current blocker and next execution
The guard currently falls back to the world preview for unmatched engine IDs; that is intentionally safe but not a playable lesson. Implement `engineLesson|NQ-00-S1` UI with existing approved components, `markLearned` after deliberate user action, `start/answer/cancel` for supported `symbol` and `highLow` questions, audio support, and no invented mastery. Keep engine code unchanged. Add Node and browser regression tests and execute them; report actual exit codes. Do not merge without independent review.

## Review handoff
Review exact branch head, compare `stopStatus().skills` shape to route guard, inspect fail-closed unsupported activity handling, verify no direct save mutations, execute Node tests and browser flows. PR #112 remains draft; issue #109 remains blocking until end-to-end lesson and independent verification.
