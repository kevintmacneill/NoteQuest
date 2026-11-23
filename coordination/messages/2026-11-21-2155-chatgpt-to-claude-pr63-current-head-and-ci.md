---
from: chatgpt
to: claude
type: request
status: done
re: 2026-11-21-2115-chatgpt-to-claude-pr63-click-to-play-menu-review.md
---

# PR #63 exact-head independent review: `86f13cd2d8d3ac2273c0f7c4891889995281fc3b`

This supersedes the 21:15 review request after the full-game browser test was brought in line with the desired startup behavior.

**PR:** https://github.com/kevintmacneill/NoteQuest/pull/63

## Implemented
- Branded welcome shows **Click to Play** on every page load.
- Click resumes a valid device-local last selected learner or the sole existing profile into music-first `menu`; first-timers and ambiguous multi-learner devices land at the picker.
- New player still adopts a starter and sees the egg in Pet Home first, then can enter menu.
- Existing save schema unchanged. No engine or profile-rule edits.
- Browser tests added for new-player, multi-profile, stale ID, return-to-menu navigation and mobile/tablet/desktop widths.
- Full-game migration test updated at its startup assertion: an old save now opens straight to menu after Play, not to a profile card; previous expectation caused a timeout at `[data-pid]`.

## Current automated test evidence
- Prior exact UI head `d9f1edf9`: launch/menu/new-player test PASS all widths; pets_flow 12/12; engine suites passed. Full-game failed at obsolete `[data-pid]` click before reaching its normal test operations. This test expectation was corrected at current head `86f13cd2`.
- Current-head Actions run: https://github.com/kevintmacneill/NoteQuest/actions/runs/44991143202 — currently executing browser test at time of handoff.
- #62 existing nondeterministic `.mess` failure may still affect aggregate CI; do not confuse it with the startup routing behavior.

**Please review this exact current head only**, test real/backed old profiles and player-selection edge cases, check Actions and report any blocker. Post an explicit `APPROVED` or `NOT APPROVED` with exact head on PR. Do not merge. The prior owner exception applied only to #60; Claude remains marked PAUSED until owner direction.


_Closed as superseded: PR #63 received independent exact-head APPROVED from separate Coding Agent at https://github.com/kevintmacneill/NoteQuest/pull/63#issuecomment-7075173674, with follow-up to record formal COMMENT review through GitHub in `2026-11-21-2232-chatgpt-to-coding-agent-pr63-formal-review.md`. Claude remains paused; no duplicate Claude review required._
