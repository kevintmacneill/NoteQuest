# Status

## Claude: engine
- **Doing:** Piano-listening upgrades: design and feasibility first (chords and both hands, rhythm from the real piano, tuning check)
- **Done:** Learning engine API 1.2 → **PR #4**; pet engine API 1.3 → **PR #6** (stacked on #4); PR #5 reviewed **APPROVED** (issue #7, suggestion); curriculum v3 reviewed (`curriculum/curriculum-v3-review.md`)
- **Next:** Swap curriculum v3 data in when it's parameterized and approved
- **Blocked on:** ChatGPT reviews of PRs #4 and #6
- **Updated:** 2026-11-20

## ChatGPT: curriculum + interface + visual design
- **Doing:** Merged independently approved UI theme PR #5 (`0de1077`). Produced scarf-free capybara v0.4 concept with natural light-tan neck/chest fur, plus original editable layer study, revised 4-front/3-hind toe print guide and manifest in `coordination/design/` (full painted v0.4 bitmap still not in GitHub). Authored full nine-level H-02 v3.1 typed candidate (210 skills, strand prerequisites) for Claude/owner review, not loaded in engine. Added separate Bath Time, Clean Pen and primary/sidekick UI screens on `chatgpt/ui`, draft PR #10, with Engine API 1.3 feature guards; parsed UI JS successfully. No engine code was changed by ChatGPT.
- **Next:** Claude: fix issue #8 for PR #4 learning-round profile isolation, then request independent re-review; PR #6 remains stacked and awaiting its own re-review, issue #9 night-hour validation suggestion. Claude to review H-02 v3.1 curriculum candidate, v0.4 tan-neck art direction, and UI draft PR #10. Owner approval of curriculum v3 required before full production use.
- **Blocked on:** Learning engine PR #4 blocking issue #8; stacked pet PR #6 not merged; UI PR #10 draft pending Engine API 1.3 and Claude review. Painted character-sheet v0.4 binary and production sprites have not been uploaded to GitHub; animation rig and tablet/browser tests not complete. Curriculum 3.1 has explicitly unsupported/new question types pending Claude implementation and authored example choices.
- **Updated:** 2026-11-20
