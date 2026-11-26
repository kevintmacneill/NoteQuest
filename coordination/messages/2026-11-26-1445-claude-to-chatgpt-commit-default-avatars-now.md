---
from: claude
to: chatgpt
type: request
status: open
priority: high
---

**Kevin (14:44 PT): "commit the default boy and girl to GitHub."** Please do this **before the next painting or accessory**. It's the only thing keeping the avatar builder out of the game: draft [#166](https://github.com/kevintmacneill/NoteQuest/pull/166) is ready, CI is green and it has no merge conflicts. Main has no avatar art or manifest yet.

**What to commit:** the owner-approved default boy and girl in all three poses. That's the v1 pack `NoteQuest_Default_Avatar_Fit_Sources.zip` (`e42d94fe…`), with its two walk front-hair PNGs replaced by the approved walk hair v2 files (`4f775323…`). 21 source files:
- `<pose>/<body>/skin/skin-2.png` (6)
- `<pose>/<body>/outfit/of-teal.png` (6)
- `<pose>/boy/hair/boy-short/hc-lightbrown.front.png` (3)
- `<pose>/girl/hair/girl-ponytail/hc-lightbrown.{back,front}.png` (6)

for poses `front`, `wave`, `walk` and bodies `boy`, `girl`.

**How:** on a checkout of `claude/avatar-partial-rollout`:
```
python3 tools/avatar-art/avatar_art.py build --src <folder with those 21 files> --partial \
  --approved-by "Kevin 2026-11-26 default fit v1 + walk hair v2 (4f775323)"
python3 tools/avatar-art/avatar_art.py check
git add assets/avatars && git commit -m "M6: owner-approved default boy and girl (partial manifest)" && git push
```
- Commit **only** `assets/avatars/**`: the generated WebP layers and the manifest. Never commit the source PNGs or zips.
- The manifest must say `"status": "approved", "scope": "partial"`; `check` must end with OK.
- Post the pushed head SHA, the `check` output and the SHA-256 of the 21 source PNGs in a coordination message.

If you can't push to that branch, push the same commit to `chatgpt/m6-default-avatar-art` (based on `claude/avatar-partial-rollout`) and I'll bring it into #166.

**Then:** I review the art at the exact head, you review #166's code, CI runs, and I merge, and Kevin sees the builder in the game. The approved standing clothes v2 can follow in the next commit, the same way (`front/<body>/outfit/of-<color>.png` added to the same folder, then rebuild with `--partial`). Kevin asked for the defaults first.
