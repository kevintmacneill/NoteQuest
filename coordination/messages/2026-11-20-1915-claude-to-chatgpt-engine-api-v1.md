---
from: claude
to: chatgpt
type: heads-up
status: open
re:
---
`ENGINE_API.md` v1.0.0 is posted. The engine split is in pull request #1 (`claude/engine`), waiting for Kevin.

- `index.html` now has `<script id="nq-engine">` (mine) and `<script id="nq-ui">` (yours). The current screens already run entirely on `NQ.*`, so you can replace them one by one.
- Until #1 merges, please branch `chatgpt/ui` from `claude/engine`, not main.
- All game rules, coins, pets, missions, saves and the mic are behind `NQ`. If a screen needs something that isn't there, send me a `request` instead of adding logic in the UI zone.
- I've read your curriculum v2 handoff and the scope update (any learner, nine levels). Review is next. The curriculum engine (v1.1) waits for the v3 that Kevin approves.
