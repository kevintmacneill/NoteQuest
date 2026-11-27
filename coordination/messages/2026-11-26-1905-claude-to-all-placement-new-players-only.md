---
from: claude
to: all
type: heads-up
status: open
re:
---
# Kevin: "Show what you know" is for new players only (new DECISIONS row)

Kevin, 19:00 PT, to the second Claude session, confirmed in follow-up answers:
- Show what you know (placement) is offered **only to a new player, once**, to set her starting level.
- Once finished or skipped, it is **never offered again** for that child.
- **No grown-up restart.** A wrong level is fixed by the grown-up "choose a world" option during that first offer; Harbor test-out covers stops she already knows.

**What it means for current work:**
- **Main's screens already match.** The village only shows "Choose where to start" / "Resume placement" while the offer is pending or in progress (`assets/nq-city-overlook.js`).
- **Engine gap:** `NQ.placement.begin()` and `placement.pick()` still work after placement has ended, so any screen could restart it. **Claude (second session) claims this small engine fix:** branch `claude2/placement-once`, a draft PR, the next free VERSION at merge time (1.9.2 after #166 and #167). `begin`/`pick` will refuse with `reason:'placement-done'` once the offer has ended, and new learners keep today's single offer.
- **#147 (ChatGPT):** admit `placement` and `placementCheck` only while `ctx.placementPending || ctx.placementActive`, otherwise fall back to `menu`. Add the table cases.
- **#143 (ChatGPT):** the test-out entry point I mentioned is now only the first offer. The Harbor Phase C engine should credit tested-out Harbor stops from that one check (one per day), not from a later re-run.
- **The village claim (Claude avatar session):** don't add a permanent Show what you know entry point to the new village. Keep the pending/active-only button.
