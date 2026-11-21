# Status

## Claude: engine
- **Main is engine 1.6.0.** **Engine 1.7 is complete on PR #46** (`claude/sanctuary`, head `95788f2`, now ready for review).
- **Doing:** Hourly runs at :30 (`engine/CLAUDE_HOURLY_RUN.md`)
- **Done (15:30 run):**
  - **Engine 1.7 part 2 (`95788f2`), contract v0.6 §D, §E, §F:**
    - One sanctuary pen: messes merge in, capped at 8, and keep zones so today's per-habitat screens still work. `pens.cleanMess(messId)`.
    - Hospital ward (`pet:ward`).
    - Informed neglect: `sanctuary.viewed()`, then the next adventure charges 1/2/4/8/8 once; a new view is needed before the next charge. Highest step per pet, no eggs or hospital pets on the dirty-pen list, floor 0, unlocks kept, care resets.
    - `display().ward` and `.frustration`, live `bond().atRisk`, `sanctuary.state()`.
  - **Tests:** new `sanctuary_node.js` 60/60 (G4c, G5–G15, G18 mess merge). Fuzz has neglect invariants (3000 steps, seeds 1–7). Every other suite green; browser 50/50 and 12/12. UI zone unchanged; two browser tests now seed mess via `p.sanctuary.pen.messT`.
  - Review request sent to ChatGPT: `messages/2026-11-21-1550-…`. Decision for Kevin: when the pen counts as dirty (`messages/2026-11-21-1550-claude-to-kevin-dirty-pen-threshold.md`; built at 1 mess).
  - No new ChatGPT messages or review issues since 15:00. #32's head is unchanged (`2603f6f`, still conflicting); #10 is unchanged.
- **Next:**
  - Fix ChatGPT's review findings on #46. Merge once it's APPROVED at the head and the dirty-pen threshold is settled.
  - Re-review #32's new head after its conflict fix, and #10 when it moves.
  - Plug in ChatGPT's §H data when it lands.
- **Blocked on:**
  - **ChatGPT:** review of #46 (full head) and interpretations 1–8; §H data (traits, fox and owl, activity → trait, unlocks); the sanctuary screen that calls `viewed()`; #32 conflict fix; #10 fixes.
  - **Kevin:** dirty-pen threshold (A/B/C); `teacher` skills (A/B/C, `messages/2026-11-21-1240-…`); curriculum v3.2 approval; a time to test listening on the real piano.
- **Updated:** 2026-11-21 15:55

## ChatGPT: curriculum + interface + visual design
- **Updated 2026-11-21 14:55 PT:** Claude's independent exact-head review **APPROVED PR #32** at `2603f6f`, all five blocking issues #34–#38 closed, and CI 44956999126 green. Marked #32 ready for review; GitHub reports `mergeable:false` against current main, so **not merged**. Must resolve integration conflict and request fresh exact-head review if code changes.
- **PR #33:** Independently reviewed two workflow-file patch at `c69eba9`; posted `APPROVED` review 6008726251. Claude owns merge. Coordination sent in `messages/2026-11-21-1455-chatgpt-to-claude-pr33-approved-pr32-merge-gate.md`.
- **Remaining UI suggestions:** #39–#42 and #45, especially note-reading `staff:'none'` before NQ-01. #43/#44 resolved.
- **PR #10:** Still draft and blocked by #17/#18; pet care integration pending.
- **Music Reference:** Already merged as #15; follow-ups #20 (6/8 accent), #21 (back navigation).
- **Engine:** Main v1.6.0; sanctuary v0.6 design approved. Claude's engine 1.7 remains Claude-owned and subject to independent review.
- **Next:** Resolve #32 integration conflict without rewriting approved evidence, then re-review as needed; verify #33 post-merge workflows and continue remaining UI issues.
