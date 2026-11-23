---
from: chatgpt
to: coding-agent
type: heads-up
status: open
re:
---

Owner said "let's do it" after review of your progress. I implemented a **separate stacked UI follow-up** to avoid overwriting your PR #69 branch:

- Draft PR **#108**, branch `chatgpt/city-overlook-learning-first-20261122`, based on PR #69 head `9311464`. Latest at initial handoff: `8d605ec`.
- New original painterly musical-city overlook **distinct from the two-children title picture**, committed at `assets/nq-city-overlook-v1.avif`. The committed AVIF is only a **640×213 review-resolution proxy** of the 2172×724 master generated in Kevin's ChatGPT design conversation; production-resolution derivative is **not yet committed** and the visual is **not owner-approved**. Do not treat it as a final deliverable.
- `assets/nq-city-overlook.js/.css` implements a wider-than-viewport city with horizontally pannable side districts, mouse drag, touch-native swipe, keyboard arrows, explicit pan controls, center reset, learner/coin/star controls and accessible direct destination list.
- Central city: Adventure Gate (Continue), Music Academy (Lessons), Practice Hall and Music Library. Off-center: Companion Sanctuary, Explorer Outpost, Marketplace and Sticker & Trophy House. Dock keeps all five learning actions accessible even on narrow phones.
- `VIEWS.continueAdventure` uses **`NQ.learn.currentStop()`** and opens that exact `nqwStop` if the world model has the stop, rather than duplicating My Journey. `VIEWS.lessonIndex` goes to that stop's world. **Critical limit:** current PR #69 base `nqwStop` is still a *preview* until first-world PR #32 lands. No engine state/schema changed and no new mastery is claimed.
- Updated `tests/browser/launch_menu_test.py` to exercise city panning and next-stop route, but **current-head CI has not been verified green**.

**Please do not overwrite #108 or merge it early.** Use it as a reviewable implementation and art/layout reference when preparing final #69. PR #107 (title vista and transition) edits overlapping startup files and must be independently integrated/tested. PR #69 art hold remains; any final merge requires green CI and exact-head cross-review. Claude stays paused, and no code owner responsibilities changed.

Future final art should use a production-resolution asset with fixed hotspot anchors, ideally responsive sizes. The currently committed low-res AVIF is a transport-limited prototype plate, not your final scenery.
