# Status

## Claude: engine
- **Main is engine 1.6.0.** **Engine 1.7 is complete on PR #46** (`claude/sanctuary`, head `e391343`, ready for review).
- **Doing:** Hourly runs at :30 (`engine/CLAUDE_HOURLY_RUN.md`)
- **Done (16:00, live session with Kevin):** re-checked #32 at the approved head `2603f6f`. #34–#38, #43 and #44 are fixed, but NQ-01 (now playable) has 3 blocking problems in scored checks: **#47** beats prints the answer, **#48** the p/f question is worded as a key question and prints `dyn-p`, and **#45**, raised to blocking, where `staff:'none'` notes are scored as guesses. Posted a superseding NOT APPROVED review at the same head; message `messages/2026-11-21-1600-claude-to-chatgpt-pr32-new-blockers.md`. Engine 1.7 was already built by the 15:30 run (#46), so I built nothing again.
- **Done (15:30 run):**
  - **Engine 1.7 part 2 (`95788f2`), contract v0.6 §D, §E, §F:**
    - One sanctuary pen: messes merge in, capped at 8, and keep zones so today's per-habitat screens still work. `pens.cleanMess(messId)`.
    - Hospital ward (`pet:ward`).
    - Informed neglect: `sanctuary.viewed()`, then the next adventure charges 1/2/4/8/8 once; a new view is needed before the next charge. Highest step per pet, no eggs or hospital pets on the dirty-pen list, floor 0, unlocks kept, care resets.
    - `display().ward` and `.frustration`, live `bond().atRisk`, `sanctuary.state()`.
  - **Tests:** new `sanctuary_node.js` 60/60 (G4c, G5–G15, G18 mess merge). Fuzz has neglect invariants (3000 steps, seeds 1–7). Every other suite green; browser 50/50 and 12/12. UI zone unchanged; two browser tests now seed mess via `p.sanctuary.pen.messT`.
  - Review request sent to ChatGPT: `messages/2026-11-21-1550-…`.
  - **Kevin chose B (C-B10): the pen is dirty at 3 or more messes.** Built at `e391343` (`sanctuary.DIRTY_AT = 3`; the issue resolves below 3). `sanctuary_node.js` is now 64/64, and fuzz checks the threshold.
  - No new ChatGPT messages or review issues since 15:00. #32's head is unchanged (`2603f6f`, still conflicting); #10 is unchanged.
- **Next:**
  - Fix ChatGPT's review findings on #46. Merge once it's APPROVED at the head (`e391343` or later).
  - Re-review #32's new head after its conflict fix, and #10 when it moves.
  - Plug in ChatGPT's §H data when it lands.
- **Blocked on:**
  - **ChatGPT:** review of #46 (full head) and interpretations 1–8; §H data (traits, fox and owl, activity → trait, unlocks); the sanctuary screen that calls `viewed()`; #32 conflict fix; #10 fixes.
  - **Kevin:** `teacher` skills (A/B/C, `messages/2026-11-21-1240-…`); curriculum v3.2 approval; a time to test listening on the real piano.
- **Updated:** 2026-11-21 16:02

## ChatGPT: curriculum + interface + visual design
- **Updated 2026-11-21 16:15 PT:** Read latest Claude messages and reviewed current contracts, PR #46 diff, open review issues and CI state. Engine 1.7 PR #46 head `e391343` is ready for independent review; current-head CI was still running, and no ChatGPT approval was issued. Dirty-pen threshold C-B10 is settled at 3 messes.
- **PR #32:** Claude superseded the earlier approval: new blocking #45/#47/#48 in scored NQ-01 exercises. Pushed UI fix `b8d6766`: numeric beats no longer printed; dynamic symbols p/f rendered instead of internal IDs; unsupported `staff:'none'` question cancels without scoring. The latter is fail-closed, not yet a finished visual solution. Requested exact-head Claude re-review in `messages/2026-11-21-1615-chatgpt-to-claude-pr32-three-fixes.md`. UI-head CI running; PR #32 remains conflicting and unmerged.
- **PR #10:** Draft with #17/#18 blocking. Single-companion selection must replace sidekick UI for engine 1.7.
- **Music Reference:** #15 merged, follow-up #20 (6/8 accents), #21 (back navigation).
- **Next:** Independently finish PR #46 engine review and contract tests before any approval; resolve PR #32 merge conflict and notation support; obtain fresh cross-review. No new owner decision requested.
