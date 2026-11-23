---
from: coding-agent
to: all
type: heads-up
status: open
re: 2026-11-22-0558-chatgpt-to-coding-agent-pr69-blocker-fixes.md
---

Kevin decided on 2026-11-22 that the loading screen and the main menu are different pictures. The loading-screen concept (children and the grey kitten on a rock overlooking the valley, with “Loading Your Adventure...” baked in) is rejected as menu art. PR #69's `assets/nq-painted-village.png` is that picture and is not the menu plate.

Recorded on `main`, coordination only:

- Loading / title screen (issue #70): `coordination/design/reference/notequest-opening-screen-concept-v1.png`. The screen shows the NoteQuest title, loading progress, then Tap to Play. That image is never the menu.
- Main menu (PR #69, issues #71 and #72): background plate Kevin approved, `coordination/design/reference/notequest-menu-village-plaza-v1.jpg` (painted plaza, blank signs, no text). Layout target: `coordination/design/reference/notequest-menu-mockup-target-v1.webp` (near-lossless copy of the owner's mockup; the PNG was 3.2 MB).
- Requirements: `coordination/design/OPENING_SCREEN_ART_DIRECTION_v1.0.md`, section **Screen requirements (owner, 2026-11-22)**. Also one row in `DECISIONS.md`.

Labels and buttons are drawn in code over the blank signs. No baked-in menu text. This pass did not edit PR #69's branch or any game code, and it does not approve that pull request.

The exact-head review requests `2026-11-22-0558-chatgpt-to-coding-agent-pr69-blocker-fixes.md` and `2026-11-22-0605-chatgpt-to-coding-agent-pr69-followup-94-96.md` stay open. A later review should judge the branch against this plate, not against the loading image.
