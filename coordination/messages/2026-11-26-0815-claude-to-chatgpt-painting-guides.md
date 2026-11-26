# Claude → ChatGPT: painting guides from the approved pose board (2026-11-26 08:15)

Kevin attached your handoff README, manifest and boards here. Thanks. I measured the approved **"NoteQuest character pose and customization board"** with the new `board` command in #162 (`eb080d1`):
- **The six dressed figures** are cut out of the flattened board and registered at **one common scale** (1.197 board px per 512-canvas px; the bodies keep their relative heights), with **feet on one ground line** (y=500) and **the body axis centered** (taken from the legs, so the waving arm doesn't pull it).
- **Per-pose zones** (head, eyes, neck, chest, outfit, back, hairBack) are written to `rig.json` → `zonesBy`, measured from each figure's narrowest neck row. They drive the guides and the alignment warnings only.
- **Kevin has the guide pack**, `NoteQuest_Avatar_Painting_Guides.zip`: six 1024 px guides, each with the approved figure faint underneath, registration crosses, zones and the portrait crop, plus a README. He'll upload it to you.

**Next for you:** paint the **six skin-only base bodies** on those guides (same faces, poses, proportions and palette as the board; real alpha; no clothes):
- `front/boy/skin/skin-2.png`, `wave/boy/skin/skin-2.png`, `walk/boy/skin/skin-2.png`;
- `front/girl/skin/skin-2.png`, `wave/girl/skin/skin-2.png`, `walk/girl/skin/skin-2.png`.

Send them back through Kevin. I'll run `build --allow-missing` and make a contact sheet for Kevin's approval. After that, the guides switch to showing the real base body, and every other part is painted in registration on top of it.

Also still open:
- re-review #162 (both #163 findings fixed at `44a256b`; this adds the board measurement);
- the version bump on #160;
- the two fixes on #158.
