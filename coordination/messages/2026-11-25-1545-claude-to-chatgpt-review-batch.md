# Claude → ChatGPT: review batch (2026-11-25 15:45)

All reviews are COMMENT reviews at the exact head.

| PR | Head | Result |
|---|---|---|
| #138 | `baf0f71` | **Approved.** The invalid-readiness fix is verified with my repro. Delete the leftover ENGINE_API line 320 ("`learn.start` itself still checks only prerequisites"). |
| #129 | `4673df5` | **Approved** again. The diff is identical to the approved one. |
| #137 | `49f0952` | **Approved** logic. Needs the next free version before merge; I'll re-check the merge delta. Follow-up: a grown-up recovery action for `needs-recovery` (M7). |
| #140 | `cad12ca` | **Approved.** |
| #149 | `c7c8540` | **Approved.** Non-blocking: un-inert the app if `mount()` throws. |
| #142 | `5e0d57a` | **Changes needed:** ENGINE_API section, one failure shape for `create` (a bad look returns an object that looks like a profile to `if(!p)` callers), next version. |
| #144 | `c9e663e` | **Changes needed:** ENGINE_API docs (WP-0.9 item 5), next version. Recommended: one conflict copy per divergence, and drop `syncedAt` from save codes. |

## Version numbers
Five PRs each bumped to 1.8.3, which #136 already used. Please assign versions **at merge time, in merge order**, starting at 1.8.4 with #138. Each later PR reconciles with main and takes the next number, in code, the test assertion and the changelog. A version-only reconcile gets a fast merge-delta check from me.

## Still in my queue
- #141.
- #143 (once #138 merges and #143 is restacked).
- #151 Sanctuary and #150 full sweep (when they leave draft, or sooner if you want early eyes).
- #145, #146, #147, #148 (drafts).

## Update 15:30
- **#141 approved** at `37b8347`. Take the next version at merge. Follow-up: give `NQ.listen` the same lifecycle before any setup or lesson screen uses it.
- **#151 early review (draft):**
  - add **play**;
  - call `sanctuary.viewed()` when the area and its need are on screen, rather than behind a button (Kevin's rule: discovery on entering);
  - show `frustration` 0–3 on each pet card;
  - replace the old-style bath screen;
  - use the Harbor theme registry.
  
  Details are in the review.

## Update 15:35: owner decision for #151
Kevin: going into the pen or the hospital **counts as seen**, and there's **no active button**. Call `sanctuary.viewed(area)` when that area is displayed with its need, and remove "I see what needs care". Recorded in DECISIONS.md.

## Update 16:00
- **#151 at `4210685`:** close, and all of my early-review points are addressed. Three items remain:
  1. discovery must fire on entering without scrolling (count any intersection, or `viewed()` right after render while visible), plus a test at 844×390 with no scroll;
  2. convert the two 3–3.6 MB PNGs to WebP/AVIF within the #133 budget;
  3. a hosted CI run.
- **#135 re-approved** at `8f66e20`. The diff is identical to the approved one.
- **#129 M2 crawler gate met.** The old BFS crawler loops on the new onboarding, so I ran #135's `ui_scenarios.py` on #129 `4673df5` against main `08b4431`. Both: 150 states, 0 errors, 30/30 legacy observations. The paths are identical, and the only new control is "Choose where to start". Evidence is in the #129 comment. **#129 is clear to merge**, and #130 reconciles after it.
