# Status

## Claude: engine
- **Main is engine 1.6.0.** The whole stack is merged (#4 `2494582` → #6 `5de3776` → #11 `5506935` → #24 `2147a1b` → #25 `5de6aa7` → #26 `e16d59d` → #28 `08823d9` → #31 `8d26013`). Head freeze lifted: new engine work goes on single branches off `main`.
- **Companions/sanctuary:** contract **v0.5** (`engine/COMPANION_SANCTUARY_CONTRACT_v0.5.md`) is with ChatGPT for final review (`messages/2026-11-21-1240-claude-to-chatgpt-companion-v05.md`). Kevin answered S2 as **C-B8** (conditions keep real time; time away never costs friendship), and the ramp is **C-B9** (1/2/4/8, then 8). Engine 1.7 gets built on one branch off `main` once ChatGPT approves.
- **Doing:** Hourly runs at :30 (`engine/CLAUDE_HOURLY_RUN.md`)
- **Done (12:30 run):**
  - Re-ran every suite on `main` (`62d8a5a`): engine 70/50/62/49, theory 114, generators 271, early types 113, journey 80, stress 3000. All green.
  - No review issues on Claude PRs (none open). ChatGPT's #10 is unchanged at `1769c08` (#17/#18 blocking), so there was no re-review.
  - Closed ChatGPT's 12:05 approval message and my S2 question to Kevin (answered as C-B8).
  - **Decision for Kevin:** how the 20 `teacher`-checked skills (worlds 6–9) count. A any grown-up (recommended), B teacher only, or C bonus. Also asked when he can test listening on the real piano (`messages/2026-11-21-1240-claude-to-kevin-teacher-checked-skills.md`).
  - Nothing built: every remaining engine item waits on ChatGPT's v0.5 approval, curriculum approval, or ChatGPT's NQ-05-U04-S04 revision.
- **Earlier today:** stack merged 12:03–12:10 after ChatGPT's exact-head approvals; `NQ.journey` (#31) built under J1–J4; Pages live and verified.
- **Next:** Engine 1.7 (one companion, music-only friendship, sanctuary, informed neglect) once ChatGPT approves v0.5. Re-review #10 when it moves. Map NQ-05-U04-S04 once ChatGPT's curriculum revision lands. `teacher` skills per Kevin's answer at the v3.2 swap.
- **Blocked on:**
  - **ChatGPT:** `APPROVED` on v0.5, plus companion data (traits, mapping, unlocks, fox/owl); #10 fixes.
  - **Kevin:** `teacher` skills (A/B/C); curriculum v3.2 approval.
- **Updated:** 2026-11-21 12:45

## ChatGPT: curriculum + interface + visual design
- **Updated 2026-11-21 12:58 PT:** Read current coordination and engine contract; confirmed all eight engine PRs #4/#6/#11/#24/#25/#26/#28/#31 merged, main engine 1.6.0. Reviewed companion/sanctuary v0.5; sent specific NEEDS CORRECTION to Claude: test G#2 expects +20 over ten rounds despite +15 daily cap. Requested single-day cap boundary test and corrected expectation; no approval until fixed. Message: `messages/2026-11-21-1258-chatgpt-to-claude-sanctuary-v05-review.md`.
- **Owner priority:** Visible game UI catch-up. Rebase/repair ChatGPT UI PR #10 (stale at `1769c08`, blocking #17/#18, remove sidekick); its missing test runner makes Pages preview gate red even though main build/deploy succeeds. Then build a complete first-world vertical slice on ChatGPT UI branch, using existing engine 1.6 APIs, with Claude independent cross-review.
- **Already merged UI:** #14 Music Journey, #15 Music Reference. Reference improvements #20/#21 and world wording #23 remain nonblocking.
- **Curriculum:** v3.2 candidate remains unaccepted; Journey Readiness J1–J4 are implemented. Teacher-checked skills in worlds 6–9 await owner decision A/B/C. Music Reference glossary/scales/chords/metronome must be verified in actual learner navigation.
- **Next:** Fix PR #10, submit UI review; verify visual-first journey on published site; review revised sanctuary contract when Claude responds.
