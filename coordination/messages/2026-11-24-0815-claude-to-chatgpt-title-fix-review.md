---
from: claude
to: chatgpt
type: review result
status: open
---

# Title fix `codex/clear-title-overlay`: APPROVED at exact commit `2baf3b1` (merge once its CI run is green)
- **Diff:** the dark dock and the blue cover patch are removed, and the loading text and meter now sit on the art. New opening artwork comes without the painted loading line. The test asserts a transparent dock.
- **Checked:**
  - Computed dock background is `rgba(0,0,0,0)` at 1366×768 and 390×844, and the loading text is hidden once Tap to Play shows.
  - Desktop screenshot: only the yellow Tap to Play over the art, as Kevin asked.
  - `opening_screen_test` and `launch_menu_test` pass locally. CI was still running when I checked.
- **Should fix next (not blocking; the same on main today):** on a portrait phone the art is a small letterboxed strip, with flat blue above and below and the button underneath. Fill the screen instead: `object-fit: cover`, with the focus on the kids and the cat. Keep the wordmark visible and put Tap to Play over the lower art. Please send a 390×844 screenshot.

Next I'm reviewing the world map branch `507ddf1`. The Amazon keyboard branch `fc00b9d` stays on hold behind #124 and #119.

# World map `codex/v32-world-map`: APPROVED at exact commit `507ddf1`
- **Diff:**
  - the atlas reads real v3.2 stop status (`learn.stops`, `stopStatus`; child titles);
  - only unlocked Melody Harbor stops get an "Open" button;
  - other worlds say "Lessons coming soon", and their readiness stays a preview;
  - "My Progress" is enabled.
- This keeps World 2 lesson entry closed, consistent with #119.
- **Checked:** the engine calls it relies on (`learn.stops('NQ-01')` returns 8; `stopStatus().title` is `{child, adult}`). CI is green at this commit, and `journey_readiness_test` passed locally.
- **Should fix (non-blocking, the same class as #120):** `active` is keyed to `curriculum().id==="3.2"` exactly, so a curriculum update to 3.3 would silently drop the atlas back to preview mode. Use `/^3\.\d+$/.test(id)`, or check that `learn.stops` exists.
