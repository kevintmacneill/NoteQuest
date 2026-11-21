# Status

## Claude: engine
- **Main is engine 1.6.0.** **Engine 1.7 is in progress on PR #46** (`claude/sanctuary`, draft, one branch off `main`).
- **Doing:** Hourly runs at :30 (`engine/CLAUDE_HOURLY_RUN.md`)
- **Done (14:30 run):**
  - **PR #32 APPROVED at `2603f6f`.** Reproduced all five blocker fixes (#34–#38) in a Chromium probe and closed them, and closed #43/#44. Open non-blocking: #45 (fix before NQ-01), #42, #39–#41. Evidence: engine zone identical; all Node suites green; browser 50/50, 12/12 and the smoke PASS; CI 44956999126 green. GitHub reports #32 unmergeable (likely `tests.yml` against #33), so its new head needs a quick re-review.
  - **PR #33** was merged at its approved head `c69eba9` (`2682f6c`).
  - **Engine 1.7 part 1 (PR #46, `2c44b24`):**
    - One companion (sidekick retired; old primary becomes the companion).
    - Friendship: +2 per finished music adventure, 15/day with a +1 remainder, levels 0/50/120/210/320, once per completion, wrong-profile credits nothing, rescues give nothing.
    - `bond()`, `personality()`, and the data hook for ChatGPT's traits, species and unlocks.
    - New `companions_node.js` 38/38; fuzz has friendship invariants; everything else green. UI zone unchanged.
    - Review request: `messages/2026-11-21-1500-…`.
- **Next:**
  - Engine 1.7 part 2 on the same branch: one pen and decor zones, hospital ward, informed neglect (1/2/4/8), frustration and `atRisk`, the per-habitat mess merge, and G rows 5–8, 10–12, 14, 15.
  - Re-review #32's new head after its conflict fix.
  - Re-review #10 when it moves.
- **Blocked on:**
  - **ChatGPT:** review of #46 part 1 and the four interpretations in it; §H data (traits, fox and owl, activity → trait, unlocks); #32 conflict fix; #10 fixes.
  - **Kevin:** `teacher` skills (A/B/C, `messages/2026-11-21-1240-…`); curriculum v3.2 approval; a time to test listening on the real piano.
- **Updated:** 2026-11-21 15:00

## ChatGPT: curriculum + interface + visual design
- **Updated 2026-11-21 14:55 PT:** Claude's independent exact-head review **APPROVED PR #32** at `2603f6f`, all five blocking issues #34–#38 closed, and CI 44956999126 green. Marked #32 ready for review; GitHub reports `mergeable:false` against current main, so **not merged**. Must resolve integration conflict and request fresh exact-head review if code changes.
- **PR #33:** Independently reviewed two workflow-file patch at `c69eba9`; posted `APPROVED` review 6008726251. Claude owns merge. Coordination sent in `messages/2026-11-21-1455-chatgpt-to-claude-pr33-approved-pr32-merge-gate.md`.
- **Remaining UI suggestions:** #39–#42 and #45, especially note-reading `staff:'none'` before NQ-01. #43/#44 resolved.
- **PR #10:** Still draft and blocked by #17/#18; pet care integration pending.
- **Music Reference:** Already merged as #15; follow-ups #20 (6/8 accent), #21 (back navigation).
- **Engine:** Main v1.6.0; sanctuary v0.6 design approved. Claude's engine 1.7 remains Claude-owned and subject to independent review.
- **Next:** Resolve #32 integration conflict without rewriting approved evidence, then re-review as needed; verify #33 post-merge workflows and continue remaining UI issues.
