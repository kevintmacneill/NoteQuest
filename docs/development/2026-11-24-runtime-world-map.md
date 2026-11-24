# Runtime curriculum in the World Map

November 24, 2026 · Codex sprint checkpoint

The base is the source tree on NoteQuest main after the #123 merge (`d87c41b`). The public v3.2 atlas previously counted and displayed the old prototype stops, so it could disagree with the six live Harbor stops and label the Amazon path a generic preview even after a learner earned the unlock.

The v3.2 World Map now uses `NQ.learn.stops` and `stopStatus` for names, counts, completed stops and locks, without writing progress. The six Harbor stops show learner-readable status and each unlocked stop opens its exact engine lesson. Amazon uses its eight authoritative titles and explains the previous-world readiness lock. Reading the map does not start a lesson. After passing Harbor readiness, the Amazon map shows earned access and clearly identifies its upcoming lessons. The existing world art and sample-curriculum test fallback are retained.

Changed `assets/nq-worlds-v0.1.js`, `tests/browser/journey_readiness_test.py` and the existing workflow artifact upload. Reused the existing readiness suite so the fresh learner and the learner who passed the actual assessment are exercised together.

| Local command | Exit | Passed | Failed |
| --- | ---: | ---: | ---: |
| `python -u tests/browser/journey_readiness_test.py` | 0 | 17 | 0 |
| `python -u tests/browser/music_reference_test.py` | 0 | 8 | 0 |
| `node tests/worlds_node.js` | 0 | 92 | 0 |
| `bash tools/preview/test_build_site.sh` | 0 | 34 | 0 |
| `git diff --check` | 0 | — | — |

Environment: Debian 13, Node 24.22.3, Python 3.12.14, Playwright with the local Chromium 153.0.8010.0 executable. The readiness suite used a 390 × 844 touch-enabled viewport. Set `NQ_SCREENSHOTS` for the locked and unlocked Amazon map captures. The branch workflow attaches the captures to its test-results artifact. Physical Android and acoustic-piano verification remain open. Changes are implemented and locally tested, pending branch CI and independent review.

Actual Amazon lesson activation remains separate. [#124](https://github.com/kevintmacneill/NoteQuest/issues/124) lists mismatches between curriculum performance objectives and runtime question shapes. No substitute scores or engine changes are in this branch. [#119](https://github.com/kevintmacneill/NoteQuest/issues/119) tracks the engine-owned start guard. [#121](https://github.com/kevintmacneill/NoteQuest/issues/121)'s navigation race is already corrected by the URL and destination waits on the current branch base. The eight Music Reference checks confirmed all three return paths.

For independent review, open the atlas as a fresh learner, confirm the Harbor card has six stops and the Amazon card has eight, then finish Harbor Readiness and revisit Amazon. Browse both maps before and after the check and confirm that opening the map alone does not start or score a lesson.
