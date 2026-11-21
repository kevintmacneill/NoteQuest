# Status

## Claude: engine
- **Top priority (Kevin, 09:58): PR clearance.** Companion contract v0.4 (`engine/COMPANION_SANCTUARY_CONTRACT_v0.4.md`) is posted for review and not built.
- **Doing:** Hourly runs at :30 (`engine/CLAUDE_HOURLY_RUN.md`)
- **Done (10:30 run):**
  - **PR #15 re-reviewed at `07ad5a5`:** `APPROVED`. A Claude session merged `main` into it at Kevin's request. Evidence:
    - the engine zone is identical to `main`
    - theory 36/36 and worlds 92/92
    - CI run 44936473138 is green
    - Chromium 27/27 at three sizes
    ChatGPT accepted the resolution and **merged #15** (`059c9bf`).
  - **Engine stack:** still no `APPROVED` at any head, so nothing merged. ChatGPT can't execute tests in its environment.
    - Sent ChatGPT the way to run the `Tests` workflow itself (workflow_dispatch on each branch), with run and job IDs and the test names for each check it asked about (`messages/2026-11-21-1050-claude-to-chatgpt-…`).
    - Sent Kevin a decision-needed on clearing the review deadlock (`messages/2026-11-21-1050-claude-to-kevin-…`).
  - **#25's head moved to `ec16425`** (test-only, pushed by an interactive session). CI is green, and #26 still merges cleanly on top of it.
  - Nothing built: head freeze.
- **Done (09:30 run):** Companion contract **v0.3** (`engine/COMPANION_BOND_PROPOSAL_v0.3.md`, not built). It follows Kevin's 09:31 and 09:34 answers: friendship grows from music only, for the active companion only; care gives none; neglect may lower it. Pace re-tuned to cap 15 a day and levels 0/50/120/210/320. Those answers conflict with C-B3 and C-B4 (09:23), so I sent Kevin a decision-needed asking him to confirm, plus four neglect details with recommendations (`messages/2026-11-21-0940-claude-to-kevin-…`). Replied to ChatGPT's six open notes (`messages/2026-11-21-0940-claude-to-chatgpt-…`). No approvals on any engine PR, so nothing merged. No new heads on ChatGPT's PRs, so there was nothing to review. No new build: everything left waits on ChatGPT's reviews or Kevin.
- **Superseded by v0.3 — proposal (interactive session, 09:30):** companion contract v0.2 `engine/COMPANION_BOND_PROPOSAL_v0.2.md` (API 1.7, not built), with Kevin's C-B1 to C-B5: one companion (sidekick retired), friendship plus personality lean, about a month to top, idle pets at 1/5, fox and owl added. Waiting on ChatGPT's review and data.
- **Done (interactive session, 09:05):** `NQ.journey` (engine 1.6.0) is **PR #31** on `claude/journey`, stacked on #28, under Kevin's J1–J3. Tests: engine 70/50/62/49/114/267/113/80, stress 3000/3000, browser 50/50 and 12/12. ChatGPT asked to review (`messages/2026-11-21-0905-…`). Merge order is now #4 → #6 → #11 → #24 → #25 → #26 → #28 → #31.
- **Done (08:30 run):** Checked the Pages deployment for ChatGPT (`messages/2026-11-21-0845-…`). Run 44924870953 (main `c9a09f1`): build, deploy and `gate` green, and the publish check passed; the artifact's file list holds only allowlisted files, with no `coordination/`, `tools/` or `.github/`. I rebuilt the site here for all 10 open PRs: it exited 0, every engine preview says `ALL PASSED`, and in-browser `tests.html?autorun` passed for #4–#28. Preview save slots are isolated: a real `noteQuest.v1` save stayed byte-for-byte unchanged while the #4 and #28 previews created profiles. CI is green on every current head (the heads moved only by the test-only rescue fix `5df4ce2`/`7ac34c8`). This session can't load `github.io` itself (the proxy blocks it). No approvals yet, so nothing merged. ChatGPT's PR heads are unchanged, so there was no new review. No new build: `NQ.journey` was built by the interactive session (#31), and the rest needs Kevin or ChatGPT.
- **Earlier (07:30 run):** PR #16 merged, Pages live, and `c67da71` merged up the stack. Asked ChatGPT for executable reviews bottom-up.
- **Next:** Merge #4 → #6 → #11 → #24 → #25 → #26 → #28 as each gets `APPROVED` on its head. Re-review #10 after fixes. Map NQ-05-U04-S04 once ChatGPT's curriculum revision lands. Raise how `teacher`-confirmed skills count with Kevin before the runtime swap.
- **Blocked on:**
  - **Kevin:** how engine PRs get cleared when ChatGPT can't execute tests (options A–D in `messages/2026-11-21-1050-…`); curriculum approval.
  - **ChatGPT:** executable reviews of the engine stack (it can trigger `Tests` itself); Sanctuary v0.5 waits until PR clearance.
- **Updated:** 2026-11-21 10:50

## ChatGPT: curriculum + interface + visual design
- **Updated 2026-11-21 11:02 PT.** Read current README, STATUS, ENGINE_API and DECISIONS; reviewed Claude's 10:25/10:50 messages, current open PR/issue queue, and replied with a verified coordination message (11:02).
- **Merged UI milestones:** #14 Music Journey squash-merged at `4c14dd2`; #15 Music Reference squash-merged at `059c9bf` after Claude resolved the conflict and independently re-approved the integrated head. Nine world bases and Music Reference navigation now live on main. UI suggestions #20–#23 remain open, nonblocking.
- **Engine reviews:** COMMENT reviews posted in order on #4, #6, #11, #24, #25, #26, #28 and #31. Issues #12/#13 source-verified and closed. No engine PR APPROVED or merged: current policy requires independent branch execution, which this connected runtime cannot perform; GitHub connector cannot dispatch a fresh workflow. Kevin has an open decision on whether green exact-head CI plus independent source review suffices (option B). #25 head moved, so verify current-head evidence.
- **UI #10:** open with unresolved #17–#19; preserve the one-companion owner decision, egg/sleeping/pat-to-wake behaviors, and visible care controls in eventual corrections. No unreviewed merge.
- **Curriculum and Journey Readiness:** J1–J4 are recorded in DECISIONS; v3.2 curriculum remains review candidate, not promoted. Sanctuary v0.4 reviewed as design only, with v0.5 pending PR clearance.
- **Next:** await owner verification-policy decision, then review current-head CI/logs and post compliant approvals or specific blockers bottom-up. Correct #10 on ChatGPT-owned branch and request Claude cross-review. Keep UI follow-up issues and curriculum review tracked.
