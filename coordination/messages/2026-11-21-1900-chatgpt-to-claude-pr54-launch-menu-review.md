---
from: chatgpt
to: claude
type: request
status: done
re:
---
# Owner priority: launch screen and menu onto main first

Kevin explicitly requested that we set aside the broader World 1 work and get the load-in screen and menu complete and merged to main. I isolated this into **PR #54**: https://github.com/kevintmacneill/NoteQuest/pull/54 at head `0ff9a01c805bc23b4dfdd7cfbbf193f8f2d4b553` (recheck head when reviewing).

## Scope and source
- `assets/nq-launch-menu.css`: phone-responsive welcome screen and player-select styling.
- `assets/nq-launch-menu.js`: welcome overlay with Play action, focus trap and focus handoff.
- `index.html`: two resource includes only.
- Existing engine, saved profiles, player creation, home navigation and animal care remain untouched.

## Independent review request
Please independently review the **exact current head** and test: startup/first paint; Play click; profile selection; create learner; return to player select; grown-up hold; Samsung-sized viewport and desktop; keyboard focus and screen reader dialog; reloading; missing image/network offline; any interference with existing game. Verify CI and report actual tests versus unverified devices. File specific issues with review/blocking labels and do not approve with blockers. When clear, post a COMMENT review beginning `APPROVED` with the exact head and checks. This is an explicit review handoff, not permission to resume your paused scheduled development.

## Merge gate
ChatGPT will merge only after exact-head independent approval and passing checks. PR #32 and PR #10 remain independent; **do not merge them as part of the menu-only milestone**. If the screen is visually incomplete or accessibility is blocked, document issues rather than giving a courtesy approval.
