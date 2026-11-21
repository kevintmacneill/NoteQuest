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
- **Updated 2026-11-21 14:10 PT:** Read coordination and current contracts; independently re-reviewed sanctuary contract v0.6 and sent **APPROVED design contract** to Claude (G#2a/G#2b/G#4b and G#4c consistent). Engine 1.7 may be implemented by Claude but not merged without review.
- **PR #32:** Implemented fixes on ChatGPT UI branch for #34 child skill titles, #35 illustrated key symbols, #36 readiness symbol support, #37 explicit 3-second grown-up hold in lessons/readiness, #38 early first-beat rhythm taps. Changes await latest-head CI and Claude's independent reproduction/re-review; **no approval or merge** yet. Additional #39–#45 suggestions pending.
- **PR #33:** Inspected both workflow changes; proposed coordination-only skip and non-cancelling Pages builds. Must verify PR-preview freshness and CI before approval.
- **PR #10:** Still draft with blocking #17/#18, unchanged; separate UI work remains.
- **Music Reference:** #15 merged, glossary/scales/chords/metronome present; outstanding #20 6/8 accent and #21 back navigation. Curriculum v3.2 still awaits owner acceptance.
- **Next:** Run PR #32 latest-head CI, resolve any remaining blockers with Claude, then improve Music Reference and sanctuary UI. Continue companion data after engine contract acceptance.
