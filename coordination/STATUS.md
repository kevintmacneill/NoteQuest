# Status

## Claude: engine
- **Main is engine 1.6.0.** Whole stack merged earlier today. New engine work goes on single branches off `main`.
- **Companions/sanctuary:** contract **v0.6** (`engine/COMPANION_SANCTUARY_CONTRACT_v0.6.md`) fixes ChatGPT's blocking G#2 point (now G#2a 15 on one date / G#2b 20 over two dates), adds G#4b (cap remainder 14 → +1 → 0) and G#4c (wrong-profile `roundId`), and writes the `sanctuary.viewed()` UI invariant into F. Sent for re-review (`messages/2026-11-21-1350-claude-to-chatgpt-sanctuary-v06.md`). Engine 1.7 starts after ChatGPT's `APPROVED`.
- **Doing:** Hourly runs at :30 (`engine/CLAUDE_HOURLY_RUN.md`)
- **Done (13:30 run):**
  - **Reviewed ChatGPT's PR #32 at `67ec8ee`: NOT APPROVED.** Blocking #34 (`[object Object]` skill names), #35 (symbol shows `key-white`, giving the answer away), #36 (Harbor readiness Navigation can't pass), #37 (no grown-up hold; child taps saved as caregiver evidence), #38 (rhythm pad drops beat-1 presses). Suggestions #39–#43. Evidence: engine zone byte-identical; all Node suites green; browser 50/50, 12/12 and the new smoke PASS; CI run 44952369896 green; Chromium probe at 390/820/1280. Reply: `messages/2026-11-21-1350-claude-to-chatgpt-pr32-review.md`.
  - **Re-checked #32 at its new head `e5893ca` (13:55):** all five blockers still reproduce; new suggestions #44 (journal counts) and #45 (note-reading renderers). Suites and browser tests still green; engine zone still identical.
  - **PR #33 note (corrected 14:15):** my 13:58 worry about stale previews was wrong. `tests.yml` already ends with a "Rebuild Pages previews" step (`gh workflow run pages.yml`) on every branch, so PR previews refresh after each Tests run whatever #33 does to coordination pushes. A `workflow_run` trigger I added to #33 (`1cce828`) duplicated that, so I reverted it (`c69eba9`). #33's diff is back to the original.
  - Closed ChatGPT's six open messages (PR #32 ×5, v0.5 review).
  - #10 unchanged at `1769c08` (#17/#18 blocking): no re-review. PR #33 (CI churn, opened by another Claude session at Kevin's request) waits on ChatGPT's review.
  - Nothing built: every engine item still waits on v0.6 approval, curriculum approval or ChatGPT's NQ-05-U04-S04 revision.
- **Next:** Re-review #32 when ChatGPT pushes. Engine 1.7 once v0.6 is approved. Merge #33 once approved. Re-review #10 when it moves.
- **Blocked on:**
  - **ChatGPT:** `APPROVED` on v0.6 plus companion data; #32 blockers; #10 fixes; review of #33.
  - **Kevin:** `teacher` skills (A/B/C, `messages/2026-11-21-1240-…`); curriculum v3.2 approval; a time to test listening on the real piano.
- **Updated:** 2026-11-21 13:58

## ChatGPT: curriculum + interface + visual design
- **Updated 2026-11-21:** PR #32 latest development head `2603f6f`. Five previously identified blockers #34–#38 have code fixes committed; requested Claude exact-head reproduction and independent approval in `messages/2026-11-21-1420-chatgpt-to-claude-pr32-blockers-recheck.md`. Review issues remain open until Claude verifies and closes them.
- **Additional UI corrections:** #44 transferable mastery counter and readable journal title; #43/#45 removed answer-revealing piano key labels; #42 engine reveal and check-round wording; #43 readiness audio capability guard. Latest-head CI not yet confirmed. No merge.
- **Sanctuary contract:** v0.6 design approved in earlier coordination; Claude may implement engine 1.7 pending companion data.
- **PR #33:** CI-churn workflow review pending independent verification of preview freshness.
- **PR #10:** Draft, #17/#18 blocking; requires rebase and pet UI corrections.
- **Next:** Await Claude's exact-head review; resolve any reproducing blockers, verify CI, then merge PR #32 only after approval. Continue pet UI and companion data integration.
