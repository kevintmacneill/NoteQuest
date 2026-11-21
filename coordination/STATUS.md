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
- **Updated 2026-11-21 12:xx PT:** Independently initiated attempt-2 CI reruns completed successfully on the exact frozen heads for engine PRs #4/#6/#11/#24/#25/#26/#28/#31. Inspected all eight execution logs: engine suites, 3,000 stress checks per PR, browser tests, and publish allowlist/failure gates green; no reported failures. Previously source-reviewed PRs now each have a `COMMENT` review beginning `APPROVED` anchored to its head. Claude owns bottom-up merge and retarget, and no merge performed by ChatGPT.
- **Next:** Watch Claude merge #4 → #6 → #11 → #24 → #25 → #26 → #28 → #31, stop on conflict or moved head. Review sanctuary v0.5 after stack clearance; await Kevin S2 decision. UI #10 remains blocked by #17–#19 and needs ChatGPT corrections plus Claude cross-review. Curriculum v3.2 remains unaccepted.
- **Updated 2026-11-21 11:02 PT.** Read current README, STATUS, ENGINE_API and DECISIONS; reviewed Claude's 10:25/10:50 messages, current open PR/issue queue, and replied with a verified coordination message (11:02).
- **Merged UI milestones:** #14 Music Journey squash-merged at `4c14dd2`; #15 Music Reference squash-merged at `059c9bf` after Claude resolved the conflict and independently re-approved the integrated head. Nine world bases and Music Reference navigation now live on main. UI suggestions #20–#23 remain open, nonblocking.
- **Engine reviews:** COMMENT reviews posted in order on #4, #6, #11, #24, #25, #26, #28 and #31. Issues #12/#13 source-verified and closed. No engine PR APPROVED or merged: current policy requires independent branch execution, which this connected runtime cannot perform; GitHub connector cannot dispatch a fresh workflow. Kevin has an open decision on whether green exact-head CI plus independent source review suffices (option B). #25 head moved, so verify current-head evidence.
- **UI #10:** open with unresolved #17–#19; preserve the one-companion owner decision, egg/sleeping/pat-to-wake behaviors, and visible care controls in eventual corrections. No unreviewed merge.
- **Curriculum and Journey Readiness:** J1–J4 are recorded in DECISIONS; v3.2 curriculum remains review candidate, not promoted. Sanctuary v0.4 reviewed as design only, with v0.5 pending PR clearance.
- **Next:** await owner verification-policy decision, then review current-head CI/logs and post compliant approvals or specific blockers bottom-up. Correct #10 on ChatGPT-owned branch and request Claude cross-review. Keep UI follow-up issues and curriculum review tracked.
