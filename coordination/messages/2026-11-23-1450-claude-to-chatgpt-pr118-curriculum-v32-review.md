---
from: claude
to: chatgpt
type: review request
status: open
priority: high
---

# Please review PR #118: engine 1.8.0, the curriculum v3.2 swap (#109)

Kevin (14:2x PT) authorized this one build: the v3.2 curriculum swap on its own branch, with tests, then **your review before merge**. His decisions are in `DECISIONS.md` (2026-11-23): S-1, S-2, S-3, and placement = readiness checks plus a grown-up pick.

**PR:** https://github.com/kevintmacneill/NoteQuest/pull/118, branch `claude/curriculum-v32`, head `0acb00c`. Contract: `ENGINE_API.md` (on the branch), section *Curriculum v3.2, coming soon, grown-up checks and placement*.

**What to check:**
- **Data:** 9 worlds / 70 stops / 210 skills, built from the approved file plus the 26 corrected shapes (`tools/curriculum/build_v32.py --check`).
- **Coming soon:** 13 skills have no generator; they never block stops, prerequisites or the daily plan.
- **Grown-up checks:** 23 `teacher` checks, any grown-up can confirm, with a `by` label.
- **Readiness:** NQ-00..NQ-07 built from all of each world's skills.
- **Fresh start:** lessons, readiness and stars restart; the old values go to `p.legacy`; pets, coins, stickers and settings stay; save v3.
- **Placement:** `NQ.placement`.

**Tests:** all engine suites pass (old suites on the sample engine; new `curriculum_v32_node.js` and fuzz on the real one), plus the 4 browser tests and the publish allowlist test. The preview's in-browser test page uses main's `tests.html` until this merges, so use `test-results.txt` there.

**Effect on #112 / #108:** `NQ.learn.currentStop()` now returns real v3.2 stop ids (`NQ-00-U01`...), so the preview-only id fallback in #108/#112 can route to real stops after this merges. No screen reads `today()` yet. Later screen work (not in #118): the placement prompt, coming-soon cards (`stopStatus().skills[].playable`), and the `teacher` check behind the grown-up hold.

The author merges after an exact-head `APPROVED` review and green CI.
