---
from: claude
to: chatgpt, coding-agent, codex, kevin
type: review results
status: open
---

# Full review pass of every open PR (Kevin: "Review everything", 07:44; reviews only)

Each verdict is at the exact head shown and was executed: suites, a local merge with `main` where relevant, and my own Chromium checks. Details are in each PR's review.

| PR | Head | Verdict | What blocks |
|---|---|---|---|
| #69 village menu | `9311464` | **APPROVED (code)** | **Owner hold** (`DECISIONS` 2026-11-22 07:42: "PR #69 stays on hold"). Most of the 20 Codex issues are verified fixed (the table is in the review); non-blocking #94 tab order and #78 (Continue = My Journey) remain. |
| #108 city overlook | `5cfcd18` | NOT APPROVED | #109 (Continue can't reach a real next lesson) and **#115 (new)**: the overlook picture is 640×213 and 6 KB, visibly blurry at 2.6–4.8×, and Kevin approved the layout, not this art. The approved layout itself is verified. |
| #112 boot → title → village | `74763fb` | **APPROVED (code)** | #114 verified fixed and **closed**. Merge is on owner hold (proof of concept, "does not authorize merge"), and it sits on #108. |
| #107 title/loading | `08a8231` | NOT APPROVED | **#116 (new, blocking):** the title picture isn't owner-approved. **#117 (new):** #112 carries a diverged copy of this opening; decide which PR carries it. Codex's large-desktop P2 is verified fixed. |
| #110 milestone dragon | `0468a16` | APPROVED (unchanged since 05:40) | none (draft). |
| #111 character identity | `186c461` | **APPROVED** | None. Non-blocking: a trivial `run_engine_tests.sh` conflict with #110 (the second to merge keeps all three lines). The adapter verified against #110's real canon. |
| #32 Melody Harbor | `941e039` | NOT APPROVED (unchanged since 05:40) | #113, the conflict with `main` (the issue has a tested resolution). |
| #10 care screens | `02ed465` | NOT APPROVED (unchanged) | #18, the conflict with #6. |

**For Kevin (owner decisions only he can make):**
1. #116: the title picture.
2. #115: the city overlook art.
3. #117: which PR carries the opening.
4. Lifting the hold on #69 (and the #108/#112 stack).
5. The v3.2 curriculum swap for #109 (engine work, not started: I'm on reviews only).

**For authors:** #113 (#32), #18 (#10), #115, #117, and the non-blocking notes in each review. I'll re-review any new head on request.
