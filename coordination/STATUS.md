# Status

## Claude: engine
- **Main is engine 1.6.0.** Whole stack merged earlier today. New engine work goes on single branches off `main`.
- **Companions/sanctuary:** contract **v0.6** (`engine/COMPANION_SANCTUARY_CONTRACT_v0.6.md`) fixes ChatGPT's blocking G#2 point (now G#2a 15 on one date / G#2b 20 over two dates), adds G#4b (cap remainder 14 → +1 → 0) and G#4c (wrong-profile `roundId`), and writes the `sanctuary.viewed()` UI invariant into F. Sent for re-review (`messages/2026-11-21-1350-claude-to-chatgpt-sanctuary-v06.md`). Engine 1.7 starts after ChatGPT's `APPROVED`.
- **Doing:** Hourly runs at :30 (`engine/CLAUDE_HOURLY_RUN.md`)
- **Done (13:30 run):**
  - **Reviewed ChatGPT's PR #32 at `67ec8ee`: NOT APPROVED.** Blocking #34 (`[object Object]` skill names), #35 (symbol shows `key-white`, giving the answer away), #36 (Harbor readiness Navigation can't pass), #37 (no grown-up hold; child taps saved as caregiver evidence), #38 (rhythm pad drops beat-1 presses). Suggestions #39–#43. Evidence: engine zone byte-identical; all Node suites green; browser 50/50, 12/12 and the new smoke PASS; CI run 44952369896 green; Chromium probe at 390/820/1280. Reply: `messages/2026-11-21-1350-claude-to-chatgpt-pr32-review.md`.
  - **Re-checked #32 at its new head `e5893ca` (13:55):** all five blockers still reproduce; new suggestions #44 (journal counts) and #45 (note-reading renderers). Suites and browser tests still green; engine zone still identical.
  - **PR #33 note:** Pages only runs on pushes to `main` (plus a 6-hourly cron), so today coordination pushes were also what refreshed PR previews. With #33's `paths-ignore`, previews of ChatGPT's branches would go stale for up to 6 hours. Raised with Kevin before #33 merges.
  - Closed ChatGPT's six open messages (PR #32 ×5, v0.5 review).
  - #10 unchanged at `1769c08` (#17/#18 blocking): no re-review. PR #33 (CI churn, opened by another Claude session at Kevin's request) waits on ChatGPT's review.
  - Nothing built: every engine item still waits on v0.6 approval, curriculum approval or ChatGPT's NQ-05-U04-S04 revision.
- **Next:** Re-review #32 when ChatGPT pushes. Engine 1.7 once v0.6 is approved. Merge #33 once approved. Re-review #10 when it moves.
- **Blocked on:**
  - **ChatGPT:** `APPROVED` on v0.6 plus companion data; #32 blockers; #10 fixes; review of #33.
  - **Kevin:** `teacher` skills (A/B/C, `messages/2026-11-21-1240-…`); curriculum v3.2 approval; a time to test listening on the real piano.
- **Updated:** 2026-11-21 13:58

## ChatGPT: curriculum + interface + visual design
- **Updated 2026-11-21 12:58 PT:** Read current coordination and engine contract; confirmed all eight engine PRs #4/#6/#11/#24/#25/#26/#28/#31 merged, main engine 1.6.0. Reviewed companion/sanctuary v0.5; sent specific NEEDS CORRECTION to Claude: test G#2 expects +20 over ten rounds despite +15 daily cap. Requested single-day cap boundary test and corrected expectation; no approval until fixed. Message: `messages/2026-11-21-1258-chatgpt-to-claude-sanctuary-v05-review.md`.
- **Owner priority:** Visible game UI catch-up. Rebase/repair ChatGPT UI PR #10 (stale at `1769c08`, blocking #17/#18, remove sidekick); its missing test runner makes Pages preview gate red even though main build/deploy succeeds. Then build a complete first-world vertical slice on ChatGPT UI branch, using existing engine 1.6 APIs, with Claude independent cross-review.
- **Already merged UI:** #14 Music Journey, #15 Music Reference. Reference improvements #20/#21 and world wording #23 remain nonblocking.
- **Curriculum:** v3.2 candidate remains unaccepted; Journey Readiness J1–J4 are implemented. Teacher-checked skills in worlds 6–9 await owner decision A/B/C. Music Reference glossary/scales/chords/metronome must be verified in actual learner navigation.
- **Next:** Fix PR #10, submit UI review; verify visual-first journey on published site; review revised sanctuary contract when Claude responds.
