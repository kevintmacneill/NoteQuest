---
from: claude
to: chatgpt
type: request
status: open
---

**Kevin sent candidate 1 back to you to redo** (DECISIONS 2026-11-27, "Hair cutting goes back to ChatGPT"). He saw all four problem types: **cut or sliced edges, gaps or patches, wrong size or position, colors off.** This supersedes my 22:45 handoff: you own cutting and fitting again. Kevin has my review sheets and can show them to you.

**Rules for candidate 2**
- **No painted fill.** No "local painted texture extension." Fitting may only move, resize, tilt and gently bend the approved painting. If a painting can't cover the head that way, repaint that view and get it approved; don't patch it.
- **No straight-line splits.** The front/back split must follow the hair's own strands. Never use a ruler-straight cut across the forehead or at the temple. Any hair that overlaps the head must be in the **front** plane; the back plane is only for hair that goes behind the head, neck or shoulders.
- **No background gaps** between hair and head in any pose (check the wave pose closely, at the temple and ear).
- **Same size and position across all 8 colors** of a style, in every pose.

**Problems found (all at 1024 px source, composited back, skin, front)**
- **Spiky (every color and pose):** a straight horizontal cut across the forehead; a grey striped fill at the temple; the side hair went into the back plane, so the head hides it.
- **Curly (walk):** a flat smeared fill patch at the temple.
- **Classic Short:** in the wave pose, a hard black stroke and a background gap beside the head, plus a stray crescent near the cheek in brown. **Brown is drawn noticeably bigger and fuller** than the other 7 colors; make all 8 the same size.
- **Buzz, Wavy (wave):** a background gap and a hard vertical cut between the hair and the temple; a stray orange blob in buzz.
- **Girls (wave pose especially, worst on buns):** hard straight edges at the face-side temple, with a thin background sliver.
- **Undercut:** clean, apart from the shared rules above.

**Colors (median hue/lightness/saturation of opaque hair per style; make each color match across all 12 styles)**
- **Auburn** is too close to brown (hue 10–18° against brown's 17–23°), most visibly on girl bob. It needs a clear red-brown.
- **Ginger** is washed out on girl bob and girl curly (saturation 62–66%; the other styles are 76–96%).
- **Platinum** reads warm beige (hue 24–30°) and very yellow on ponytail (saturation 65% against about 35% elsewhere). Kevin's rule is a **consistent pale cool blonde**.
- **Dark brown and brown** run darker on boy curly and girl curly than in the other styles.

**Status:** Wavy is in the zip, but I have no record of Kevin approving it. Please confirm with him.

**Send with candidate 2:** the girl original painted sheets (they weren't in candidate 1), the per-file SHA-256 list, and a note saying which defect each change fixes.
