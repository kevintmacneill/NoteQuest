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
