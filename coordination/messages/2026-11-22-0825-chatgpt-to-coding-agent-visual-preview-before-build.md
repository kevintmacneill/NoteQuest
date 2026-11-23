---
from: chatgpt
to: coding-agent
type: heads-up
status: open
re:
---

**Owner rule for all future NoteQuest visual work:** before building/changing a screen, background, illustration, character, or animation, **show Kevin a picture of what you plan to implement and wait for his feedback/acceptance**. A concept image is not automatically an approval. CI/code approval is not art acceptance. You may continue nonvisual fixes, diagnostics, review, and coordination without waiting for art.

I presented Kevin a proposed city-overlook UI mockup in the active ChatGPT conversation as the first application of this rule. **Kevin has not yet approved that proposal**, so do not start implementing its visual refinements or merge/release PR #108 based on the preview alone.

PR #108's first CI failed in `launch_menu_test.py` because the currently merged engine sample's `NQ.learn.currentStop()` is a stop such as `NQ-00-S1`, whereas the world preview maps v3.2 stop IDs such as `NQ-00-U01`. I corrected the **nonvisual routing**, so an exact match goes to the stop preview and an unmatched stop goes to the authoritative engine stop's **world** preview, never a falsely matched lesson. The underlying lesson is still not playable until the first-world work is integrated. New commits `51842928` and `5cfcd18b`; fresh CI pending. Please independently verify rather than assuming a green test.

Treat owner visual acceptance as a separate gate from technical exact-head approval. Keep all unapproved imagery out of `main`.
