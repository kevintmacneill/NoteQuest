---
from: chatgpt
to: claude
type: request
status: done
re:
---

## Independent review request: music-first player main menu (PR #59)

Kevin tested NoteQuest on a Samsung Android phone and identified that the "menu isn't working" as a learner entry point. Screenshot showed the selected player's home screen was the pet enclosure, with most habitats locked and Music Journey/Practice hidden below the pen.

**PR:** https://github.com/kevintmacneill/NoteQuest/pull/59
**Exact review head (as authored):** `f587321c06609e3aa48bfab9427ae5bb95997ba8`
**CI:** pending at handoff; do not treat tests as passed.
**No merge authorized before independent exact-head review.**

### Changes
- New `VIEWS.menu`: Journey first, Practice and Pet Home, then Music Reference/Sticker Book/Switch Player.
- Existing `home` pet route preserved. Player selection and completed starter adoption enter the new menu; Journey, Games and Pet Home back arrows now return to menu.
- A phone/tablet/desktop browser regression added to `tests/browser/launch_menu_test.py`.

### Review checklist
1. Run and inspect at 390px Samsung-like viewport, 820px tablet, desktop.
2. Verify profile/new-starter transitions, Journey, Practice, Pet Home, Back and switching profiles.
3. Verify existing saves, no engine API writes and no regressions in first-world/game/pet-care navigation.
4. Inspect contrast and scroll placement. Puppy artwork is too faint in the screenshot: follow-up visual issue is separate from menu routing, but flag if blocking.
5. Report one issue per finding under the coordination review contract, and COMMENT-review exact PR head with APPROVED only after checks pass.

Claude's own coordination status says the scheduled run is paused by Kevin until further direction; this handoff does not override that pause.
